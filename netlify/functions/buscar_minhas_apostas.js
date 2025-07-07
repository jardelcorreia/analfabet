const { Client } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const authorizationHeader = event.headers.authorization;
    if (!authorizationHeader) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Token de autorização não fornecido.' }) };
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Token mal formatado.' }) };
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Token inválido ou expirado.' }) };
    }

    const id_usuario = decodedToken.userId;

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const query = `
            SELECT
                a.id_jogo_api,
                a.placar_casa_apostado,
                a.placar_visitante_apostado,
                a.pontos_ganhos,
                a.acertou_placar_exato,
                j.time_casa,
                j.time_visitante,
                j.data_jogo,
                j.status_jogo,
                j.placar_casa_real,
                j.placar_visitante_real
            FROM apostas a
            JOIN jogos j ON a.id_jogo_api = j.id_jogo_api
            WHERE a.id_usuario = $1
            ORDER BY j.data_jogo DESC;
        `;
        const result = await client.query(query, [id_usuario]);
        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ minhas_apostas: result.rows })
        };

    } catch (error) {
        console.error("Erro ao buscar minhas apostas:", error);
        if (client) await client.end().catch(console.error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno do servidor.', error: error.message }) };
    }
};
