const { Client } = require('pg');
const fetch = require('node-fetch');

const API_TOKEN = process.env.FOOTBALL_DATA_API_KEY;
const COMPETITION_ID = 'BSA'; // Brasileirão Série A
const API_BASE_URL = 'https://api.football-data.org/v4';

async function upsertJogo(client, jogo) {
    const { id, utcDate, status, matchday, homeTeam, awayTeam, score } = jogo;
    const fullTimeHome = score && score.fullTime ? score.fullTime.home : null;
    const fullTimeAway = score && score.fullTime ? score.fullTime.away : null;

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
    const values = [id, utcDate, homeTeam.name, awayTeam.name, fullTimeHome, fullTimeAway, status];

    try {
        const res = await client.query(query, values);
        console.log(`Jogo ${id} (${homeTeam.name} vs ${awayTeam.name}) salvo/atualizado no DB.`);
        return res.rows[0];
    } catch (dbError) {
        console.error(`Erro ao salvar jogo ${id} no DB:`, dbError);
        throw dbError;
    }
}

exports.handler = async function(event, context) {
    if (!API_TOKEN) {
        return { statusCode: 500, body: JSON.stringify({ message: "Chave da API de futebol não configurada no servidor." }) };
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const { matchday } = event.queryStringParameters || {};
        let apiUrl = `${API_BASE_URL}/competitions/${COMPETITION_ID}/matches`;

        const params = new URLSearchParams();
        if (matchday) {
            params.append('matchday', matchday);
        }
        // Você pode adicionar outros filtros aqui, como 'status'
        // params.append('status', 'SCHEDULED');
        // params.append('dateFrom', 'YYYY-MM-DD');
        // params.append('dateTo', 'YYYY-MM-DD');

        const queryString = params.toString();
        if (queryString) {
            apiUrl += `?${queryString}`;
        }

        console.log(`Buscando jogos da API: ${apiUrl}`);
        const response = await fetch(apiUrl, {
            headers: { 'X-Auth-Token': API_TOKEN }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error("Erro ao buscar dados da API football-data:", response.status, errorData);
            return {
                statusCode: response.status,
                body: JSON.stringify({ message: "Erro ao buscar dados dos jogos.", apiError: errorData })
            };
        }

        const data = await response.json();
        const jogosDaApi = data.matches;

        if (!jogosDaApi || jogosDaApi.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ message: "Nenhum jogo encontrado para os critérios.", jogos: [] }) };
        }

        await client.connect();
        console.log("Conectado ao DB para salvar/atualizar jogos.");

        const jogosSalvosFormatados = [];
        for (const jogo of jogosDaApi) {
            try {
                await upsertJogo(client, jogo); // Salva no DB, mas não usamos o retorno direto aqui

                // Formatamos o objeto para o frontend
                jogosSalvosFormatados.push({
                    id_jogo_api: jogo.id,
                    data_jogo: jogo.utcDate,
                    status_jogo: jogo.status,
                    matchday: jogo.matchday,
                    time_casa: { id: jogo.homeTeam.id, nome: jogo.homeTeam.name, escudo: jogo.homeTeam.crest || null },
                    time_visitante: { id: jogo.awayTeam.id, nome: jogo.awayTeam.name, escudo: jogo.awayTeam.crest || null },
                    placar_casa_real: jogo.score && jogo.score.fullTime ? jogo.score.fullTime.home : null,
                    placar_visitante_real: jogo.score && jogo.score.fullTime ? jogo.score.fullTime.away : null,
                });
            } catch (upsertError) {
                console.warn(`Falha ao processar o jogo ${jogo.id}, continuando com os próximos.`);
            }
        }

        await client.end();
        console.log("Desconectado do DB.");

        return {
            statusCode: 200,
            body: JSON.stringify({ jogos: jogosSalvosFormatados })
        };

    } catch (error) {
        console.error("Erro na função buscar_jogos_rodada:", error);
        if (client && client._connected) {
            await client.end().catch(console.error);
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno do servidor ao buscar jogos.', error: error.message }) };
    }
};
