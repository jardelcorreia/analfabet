const { Client } = require('pg');
const fetch = require('node-fetch');

const API_TOKEN = process.env.FOOTBALL_DATA_API_KEY;
const COMPETITION_ID = 'BSA'; // Brasileirão Série A
const API_BASE_URL = 'https://api.football-data.org/v4';

async function upsertJogo(client, jogo) {
    // Certifique-se de que 'jogo' e suas propriedades aninhadas como 'homeTeam', 'awayTeam', 'score' existem
    if (!jogo || !jogo.homeTeam || !jogo.awayTeam || !jogo.score) {
        console.warn("Dados do jogo incompletos recebidos da API, pulando upsert:", jogo);
        return null; // Ou lançar um erro se preferir parar o processamento
    }

    const { id, utcDate, status, matchday, homeTeam, awayTeam, score } = jogo;
    const fullTimeHome = score.fullTime ? score.fullTime.home : null;
    const fullTimeAway = score.fullTime ? score.fullTime.away : null;

    // Validação adicional para nomes de times
    const homeTeamName = homeTeam.name || 'Time da Casa Desconhecido';
    const awayTeamName = awayTeam.name || 'Time Visitante Desconhecido';


    const query = `
        INSERT INTO jogos (id_jogo_api, data_jogo, time_casa, time_visitante, placar_casa_real, placar_visitante_real, status_jogo)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id_jogo_api) DO UPDATE SET
            data_jogo = EXCLUDED.data_jogo,
            time_casa = EXCLUDED.time_casa,
            time_visitante = EXCLUDED.time_visitante,
            placar_casa_real = EXCLUDED.placar_casa_real,
            placar_visitante_real = EXCLUDED.placar_visitante_real,
            status_jogo = EXCLUDED.status_jogo
        RETURNING *;
    `;
    const values = [id, utcDate, homeTeamName, awayTeamName, fullTimeHome, fullTimeAway, status];

    try {
        const res = await client.query(query, values);
        console.log(`Jogo ${id} (${homeTeamName} vs ${awayTeamName}) salvo/atualizado no DB.`);
        return res.rows[0];
    } catch (dbError) {
        console.error(`Erro ao salvar jogo ${id} no DB:`, dbError);
        throw dbError;
    }
}

exports.handler = async function(event, context) {
    if (!API_TOKEN) {
        console.error("FOOTBALL_DATA_API_KEY não está configurada.");
        return { statusCode: 500, body: JSON.stringify({ message: "Chave da API de futebol não configurada no servidor." }) };
    }
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL não está configurada.");
        return { statusCode: 500, body: JSON.stringify({ message: "String de conexão do banco de dados não configurada." }) };
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // 1. Buscar a rodada atual da competição
        console.log(`Buscando informações da competição ${COMPETITION_ID}...`);
        const competitionResponse = await fetch(`${API_BASE_URL}/competitions/${COMPETITION_ID}`, {
            headers: { 'X-Auth-Token': API_TOKEN }
        });

        if (!competitionResponse.ok) {
            const errorText = await competitionResponse.text();
            console.error(`Erro ao buscar dados da competição ${COMPETITION_ID}: ${competitionResponse.status}`, errorText);
            return { statusCode: competitionResponse.status, body: JSON.stringify({ message: `Erro ao buscar dados da competição: ${errorText}` }) };
        }
        const competitionData = await competitionResponse.json();
        const currentMatchday = competitionData.currentSeason ? competitionData.currentSeason.currentMatchday : null;

        if (!currentMatchday) {
            console.warn(`Não foi possível determinar a rodada atual (currentMatchday) para ${COMPETITION_ID}.`);
            return { statusCode: 200, body: JSON.stringify({ message: "Rodada atual (currentMatchday) não encontrada para a competição.", jogos: [] }) };
        }
        console.log(`Rodada atual (currentMatchday) para ${COMPETITION_ID}: ${currentMatchday}`);

        // 2. Buscar jogos da rodada atual
        const apiUrl = `${API_BASE_URL}/competitions/${COMPETITION_ID}/matches?matchday=${currentMatchday}`;

        console.log(`Buscando jogos da API: ${apiUrl}`);
        const response = await fetch(apiUrl, {
            headers: { 'X-Auth-Token': API_TOKEN }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro ao buscar dados da API football-data:", response.status, errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ message: "Erro ao buscar dados dos jogos.", apiError: errorText })
            };
        }

        const data = await response.json();
        const jogosDaApi = data.matches;

        if (!jogosDaApi || jogosDaApi.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ message: `Nenhum jogo encontrado para a rodada ${currentMatchday}.`, jogos: [] }) };
        }

        await client.connect();
        console.log("Conectado ao DB para salvar/atualizar jogos da rodada.");

        const jogosSalvosFormatados = [];
        for (const jogo of jogosDaApi) {
            if (!jogo || !jogo.id) { // Checagem básica se o objeto jogo é válido
                console.warn("Objeto de jogo inválido ou sem ID recebido da API:", jogo);
                continue;
            }
            try {
                await upsertJogo(client, jogo);

                jogosSalvosFormatados.push({
                    id_jogo_api: jogo.id,
                    data_jogo: jogo.utcDate,
                    status_jogo: jogo.status,
                    matchday: jogo.matchday,
                    time_casa: { id: jogo.homeTeam.id, nome: jogo.homeTeam.name || 'N/A', escudo: jogo.homeTeam.crest || null },
                    time_visitante: { id: jogo.awayTeam.id, nome: jogo.awayTeam.name || 'N/A', escudo: jogo.awayTeam.crest || null },
                    placar_casa_real: jogo.score && jogo.score.fullTime ? jogo.score.fullTime.home : null,
                    placar_visitante_real: jogo.score && jogo.score.fullTime ? jogo.score.fullTime.away : null,
                });
            } catch (upsertError) {
                console.warn(`Falha ao processar o jogo ${jogo.id} da rodada ${currentMatchday}, continuando com os próximos.`);
            }
        }

        await client.end();
        console.log("Desconectado do DB após processar jogos da rodada.");

        return {
            statusCode: 200,
            body: JSON.stringify({ jogos: jogosSalvosFormatados, message: `Jogos da rodada ${currentMatchday} processados.` })
        };

    } catch (error) {
        console.error("Erro na função buscar_jogos_rodada:", error);
        if (client && client._connected) {
            await client.end().catch(e => console.error("Erro ao fechar conexão do DB após falha:", e));
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno do servidor ao buscar jogos.', error: error.message, stack: error.stack }) };
    }
};
