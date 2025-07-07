const { Client } = require('pg');
const fetch = require('node-fetch');

const API_TOKEN = process.env.FOOTBALL_DATA_API_KEY;
const API_BASE_URL = 'https://api.football-data.org/v4';

// Função auxiliar para determinar o resultado (VITORIA_CASA, EMPATE, VITORIA_VISITANTE)
function determinarResultado(placarCasa, placarVisitante) {
    if (placarCasa === null || placarVisitante === null) return null; // Resultado desconhecido
    if (placarCasa > placarVisitante) return 'VITORIA_CASA';
    if (placarVisitante > placarCasa) return 'VITORIA_VISITANTE';
    return 'EMPATE';
}

exports.handler = async function(event, context) {
    // Para acionar via HTTP GET por um cron job externo, você pode adicionar uma verificação de segredo:
    // const TRIGGER_SECRET = process.env.UPDATE_TRIGGER_SECRET;
    // if (event.httpMethod === 'GET') {
    //     if (!event.queryStringParameters || event.queryStringParameters.secret !== TRIGGER_SECRET) {
    //         console.warn("Tentativa de acionamento não autorizada.");
    //         return { statusCode: 401, body: 'Unauthorized' };
    //     }
    // }
    // Se for uma função agendada pelo Netlify, o evento não terá httpMethod ou queryStringParameters dessa forma.
    // O objeto 'event' para funções agendadas é diferente.
    // Por simplicidade, vamos assumir que a autorização é tratada no nível do trigger.

    console.log("Iniciando atualização de resultados e pontuação...");

    if (!API_TOKEN) {
        console.error("Chave da API de futebol não configurada.");
        return { statusCode: 500, body: JSON.stringify({ message: "Chave da API de futebol não configurada." }) };
    }
    if (!process.env.DATABASE_URL) {
        console.error("String de conexão do banco de dados não configurada.");
        return { statusCode: 500, body: JSON.stringify({ message: "String de conexão do banco de dados não configurada." }) };
    }


    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    let jogosAtualizadosCount = 0;
    let apostasPontuadasCount = 0;
    const MAX_JOGOS_PROCESSAR_POR_EXECUCAO = 5; // Limite para evitar timeouts e rate limits

    try {
        await client.connect();
        console.log("Conectado ao DB para atualizar resultados e pontuar.");

        const jogosParaVerificarResult = await client.query(`
            SELECT id_jogo_api, status_jogo, placar_casa_real, placar_visitante_real
            FROM jogos
            WHERE status_jogo NOT IN ('FINISHED', 'CANCELLED', 'POSTPONED')
            ORDER BY data_jogo ASC
            LIMIT $1;
        `, [MAX_JOGOS_PROCESSAR_POR_EXECUCAO]);

        console.log(`Encontrados ${jogosParaVerificarResult.rows.length} jogos para verificar/atualizar (limite de ${MAX_JOGOS_PROCESSAR_POR_EXECUCAO}).`);

        for (const jogoLocal of jogosParaVerificarResult.rows) {
            console.log(`Verificando jogo ID API: ${jogoLocal.id_jogo_api}`);

            // Adicionar delay para respeitar o rate limit da API (10 reqs/min)
            // 6 segundos de delay entre chamadas = 10 reqs/min
            // Este delay deve ser considerado no tempo total de execução da função.
            await new Promise(resolve => setTimeout(resolve, 6000));

            const response = await fetch(`${API_BASE_URL}/matches/${jogoLocal.id_jogo_api}`, {
                headers: { 'X-Auth-Token': API_TOKEN }
            });

            if (!response.ok) {
                const errorDataText = await response.text();
                console.warn(`Erro ao buscar jogo ${jogoLocal.id_jogo_api} da API: ${response.status}. Resposta: ${errorDataText}`);
                if (response.status === 404) {
                    await client.query("UPDATE jogos SET status_jogo = 'CANCELLED' WHERE id_jogo_api = $1", [jogoLocal.id_jogo_api]);
                    console.log(`Jogo ${jogoLocal.id_jogo_api} marcado como CANCELLED (não encontrado na API).`);
                } else if (response.status === 429) { // Rate limit
                    console.warn(`Rate limit atingido na API. Interrompendo processamento desta execução.`);
                    break; // Sai do loop para não fazer mais requisições
                }
                continue;
            }

            const jogoApi = await response.json();
            const jogoApiData = jogoApi.match || jogoApi; // A API v4 às vezes aninha em "match"

            if (!jogoApiData || !jogoApiData.status) {
                console.warn(`Dados inesperados da API para o jogo ${jogoLocal.id_jogo_api}:`, jogoApiData);
                continue;
            }

            if (jogoApiData.status === 'FINISHED') {
                if (!jogoApiData.score || !jogoApiData.score.fullTime) {
                    console.warn(`Jogo ${jogoLocal.id_jogo_api} está FINISHED na API mas sem score.fullTime. Status local: ${jogoLocal.status_jogo}. API Data:`, jogoApiData);
                    // Poderia atualizar o status para FINISHED mesmo sem placar, ou manter como está e tentar depois.
                    // Por ora, vamos apenas atualizar o status se ele for diferente.
                     if (jogoLocal.status_jogo !== 'FINISHED') {
                        await client.query("UPDATE jogos SET status_jogo = 'FINISHED' WHERE id_jogo_api = $1", [jogoLocal.id_jogo_api]);
                        console.log(`Status do jogo ${jogoLocal.id_jogo_api} atualizado para FINISHED (sem placar disponível na API).`);
                     }
                    continue; // Pula a pontuação se não houver placar
                }

                const placarCasaReal = jogoApiData.score.fullTime.home;
                const placarVisitanteReal = jogoApiData.score.fullTime.away;

                // Verifica se houve mudança no status ou no placar para justificar a atualização e re-pontuação
                if (jogoLocal.status_jogo !== 'FINISHED' ||
                    jogoLocal.placar_casa_real !== placarCasaReal ||
                    jogoLocal.placar_visitante_real !== placarVisitanteReal) {

                    console.log(`Jogo ${jogoLocal.id_jogo_api} finalizado. Placar API: ${placarCasaReal}x${placarVisitanteReal}. Atualizando DB...`);

                    await client.query(
                        "UPDATE jogos SET placar_casa_real = $1, placar_visitante_real = $2, status_jogo = $3 WHERE id_jogo_api = $4",
                        [placarCasaReal, placarVisitanteReal, 'FINISHED', jogoLocal.id_jogo_api]
                    );
                    jogosAtualizadosCount++;

                    const apostasParaPontuar = await client.query(
                        "SELECT id, id_usuario, placar_casa_apostado, placar_visitante_apostado FROM apostas WHERE id_jogo_api = $1",
                        [jogoLocal.id_jogo_api]
                    );

                    if (apostasParaPontuar.rows.length > 0) {
                        const resultadoReal = determinarResultado(placarCasaReal, placarVisitanteReal);

                        for (const aposta of apostasParaPontuar.rows) {
                            let pontosGanhos = 0;
                            let acertouPlacarExato = false;
                            const resultadoApostado = determinarResultado(aposta.placar_casa_apostado, aposta.placar_visitante_apostado);

                            if (aposta.placar_casa_apostado === placarCasaReal && aposta.placar_visitante_apostado === placarVisitanteReal) {
                                pontosGanhos = 3;
                                acertouPlacarExato = true;
                            } else if (resultadoApostado !== null && resultadoReal !== null && resultadoApostado === resultadoReal) {
                                pontosGanhos = 1;
                            }

                            await client.query(
                                "UPDATE apostas SET pontos_ganhos = $1, acertou_placar_exato = $2 WHERE id = $3",
                                [pontosGanhos, acertouPlacarExato, aposta.id]
                            );
                            apostasPontuadasCount++;
                        }
                        console.log(`${apostasParaPontuar.rows.length} apostas para o jogo ${jogoLocal.id_jogo_api} foram pontuadas/re-pontuadas.`);
                    }
                } else {
                     console.log(`Jogo ${jogoLocal.id_jogo_api} já estava FINISHED e com placar correto no DB. Nenhuma ação de pontuação necessária.`);
                }

            } else if (jogoApiData.status !== jogoLocal.status_jogo) {
                await client.query(
                    "UPDATE jogos SET status_jogo = $1 WHERE id_jogo_api = $2",
                    [jogoApiData.status, jogoLocal.id_jogo_api]
                );
                console.log(`Status do jogo ${jogoLocal.id_jogo_api} atualizado para ${jogoApiData.status} no DB.`);
                 jogosAtualizadosCount++; // Conta como uma atualização de jogo
            } else {
                console.log(`Jogo ${jogoLocal.id_jogo_api} (${jogoApiData.status}) sem alterações significativas via API.`);
            }
        }

        await client.end();
        console.log("Desconectado do DB.");
        const summary = `Processamento concluído. Jogos com status/placar atualizado no DB: ${jogosAtualizadosCount}. Apostas (re)pontuadas: ${apostasPontuadasCount}.`;
        console.log(summary);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: summary, jogosAtualizados: jogosAtualizadosCount, apostasPontuadas: apostasPontuadasCount })
        };

    } catch (error) {
        console.error("Erro crítico na função atualizar_resultados_e_pontuar:", error);
        if (client && client._connected) {
            try { await client.end(); } catch (e) { console.error("Erro ao fechar client após erro:", e); }
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno do servidor.', error: error.message, stack: error.stack }) };
    }
};
