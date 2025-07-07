const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { email, senha } = JSON.parse(event.body);

    if (!email || !senha) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Email e senha são obrigatórios.' }) };
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const result = await client.query("SELECT id, nome, email, senha_hash FROM usuarios WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            await client.end();
            return { statusCode: 401, body: JSON.stringify({ message: 'Email ou senha inválidos.' }) };
        }

        const usuario = result.rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            await client.end();
            return { statusCode: 401, body: JSON.stringify({ message: 'Email ou senha inválidos.' }) };
        }

        const token = jwt.sign(
            { userId: usuario.id, email: usuario.email, nome: usuario.nome },
            process.env.JWT_SECRET, // Certifique-se de adicionar JWT_SECRET às variáveis de ambiente do Netlify
            { expiresIn: '1h' } // Token expira em 1 hora
        );

        await client.end();
        return { statusCode: 200, body: JSON.stringify({ message: 'Login bem-sucedido!', token: token, userName: usuario.nome }) };

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        if (client) await client.end().catch(console.error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno do servidor.', error: error.message }) };
    }
};
