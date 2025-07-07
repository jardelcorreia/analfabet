const { Client } = require('pg');
// const jwt = require('jsonwebtoken'); // Descomente se for proteger a rota

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    /*
    // Descomente para proteger a rota de classificação
    const authorizationHeader = event.headers.authorization;
    if (!authorizationHeader) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Token de autorização não fornecido.' }) };
    }
    const token = authorizationHeader.split(' ')[1];
    if (!token) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Token mal formatado.' }) };
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Token inválido ou expirado.' }) };
    }
    */

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Conectado ao DB para buscar classificação.");

        const query = `
            SELECT
                u.id AS id_usuario,
                u.nome AS nome_usuario,
                COALESCE(SUM(a.pontos_ganhos), 0) AS total_pontos,
                COALESCE(SUM(CASE WHEN a.acertou_placar_exato THEN 1 ELSE 0 END), 0) AS total_placares_exatos
            FROM
                usuarios u
            LEFT JOIN
                apostas a ON u.id = a.id_usuario
            GROUP BY
                u.id, u.nome
            ORDER BY
                total_pontos DESC,
                total_placares_exatos DESC,
                u.nome ASC;
        `;

        const result = await client.query(query);
        await client.end();
        console.log("Desconectado do DB após buscar classificação.");

        const classificacao = result.rows;
        let vencedores = [];

        // Determinar vencedores apenas se houver alguém com pontos > 0
        if (classificacao.length > 0 && classificacao[0].total_pontos > 0) {
            const maxPontos = classificacao[0].total_pontos;
            // Filtra todos com pontuação máxima
            const potenciaisVencedoresPorPontos = classificacao.filter(j => j.total_pontos === maxPontos);

            if (potenciaisVencedoresPorPontos.length === 1) {
                vencedores = [potenciaisVencedoresPorPontos[0]];
            } else {
                // Se houver empate nos pontos, usa placares exatos como desempate
                const maxPlacaresExatosEntreEles = Math.max(...potenciaisVencedoresPorPontos.map(j => j.total_placares_exatos));
                vencedores = potenciaisVencedoresPorPontos.filter(j => j.total_placares_exatos === maxPlacaresExatosEntreEles);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                classificacao: classificacao,
                vencedores: vencedores
            })
        };

    } catch (error) {
        console.error("Erro ao buscar classificação:", error);
        if (client && client._connected) {
            await client.end().catch(console.error);
        }
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno do servidor.', error: error.message }) };
    }
};
