const { Client } = require('pg');
const bcrypt = require('bcryptjs');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { nome, email, senha } = JSON.parse(event.body);

    if (!nome || !email || !senha) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Nome, email e senha são obrigatórios.' }) };
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Verificar se o email já existe
        const userExists = await client.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            await client.end();
            return { statusCode: 409, body: JSON.stringify({ message: 'Email já cadastrado.' }) };
        }

        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        await client.query(
            "INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3)",
            [nome, email, senhaHash]
        );

        await client.end();
        return { statusCode: 201, body: JSON.stringify({ message: 'Usuário cadastrado com sucesso!' }) };

    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        if (client) await client.end().catch(console.error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno do servidor.', error: error.message }) };
    }
};
