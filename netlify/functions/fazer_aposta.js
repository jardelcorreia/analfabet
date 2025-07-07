const { Client } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const { id_jogo_api, placar_casa_apostado, placar_visitante_apostado } = JSON.parse(event.body);
    const authorizationHeader = event.headers.authorization;

    if (!authorizationHeader) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Token de autorização não fornecido.' }) };
    }

    const token = authorizationHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Token mal formatado.' }) };
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error("Erro ao verificar token JWT:", error);
        return { statusCode: 401, body: JSON.stringify({ message: 'Token inválido ou expirado.' }) };
    }

    const id_usuario = decodedToken.userId;

    if (id_jogo_api === undefined || placar_casa_apostado === undefined || placar_visitante_apostado === undefined) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Dados da aposta incompletos.' }) };
    }

    if (typeof placar_casa_apostado !== 'number' || typeof placar_visitante_apostado !== 'number' ||
        placar_casa_apostado < 0 || placar_visitante_apostado < 0) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Placares devem ser números inteiros não negativos.' }) };
    }


    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Verificar se o jogo permite apostas (SCHEDULED ou TIMED)
        const jogoResult = await client.query("SELECT status_jogo FROM jogos WHERE id_jogo_api = $1", [id_jogo_api]);
        if (jogoResult.rows.length === 0) {
            await client.end();
            return { statusCode: 404, body: JSON.stringify({ message: 'Jogo não encontrado.' }) };
        }
        const statusJogo = jogoResult.rows[0].status_jogo;
        if (statusJogo !== 'SCHEDULED' && statusJogo !== 'TIMED') {
            await client.end();
            return { statusCode: 403, body: JSON.stringify({ message: `Não é possível apostar em jogos com status "${statusJogo}". Apostas encerradas.` }) };
        }

        // Inserir ou atualizar a aposta (ON CONFLICT para caso o usuário já tenha apostado e esteja editando)
        const upsertQuery = `
            INSERT INTO apostas (id_usuario, id_jogo_api, placar_casa_apostado, placar_visitante_apostado)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id_usuario, id_jogo_api) DO UPDATE SET
                placar_casa_apostado = EXCLUDED.placar_casa_apostado,
                placar_visitante_apostado = EXCLUDED.placar_visitante_apostado,
                data_aposta = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const values = [id_usuario, id_jogo_api, placar_casa_apostado, placar_visitante_apostado];
        const result = await client.query(upsertQuery, values);

        await client.end();
        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Aposta registrada com sucesso!', aposta: result.rows[0] })
        };

    } catch (error) {
        console.error("Erro ao registrar aposta:", error);
        if (client) await client.end().catch(console.error);
        // Tratar erro de chave estrangeira ou constraint única de forma mais específica se necessário
        if (error.code === '23503') { // Foreign key violation
             return { statusCode: 400, body: JSON.stringify({ message: 'Erro ao registrar aposta: jogo ou usuário inválido.'}) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno do servidor ao registrar aposta.', error: error.message }) };
    }
};
