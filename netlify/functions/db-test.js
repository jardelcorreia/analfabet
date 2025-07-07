const { Client } = require('pg');

exports.handler = async function(event, context) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Necessário para Neon, a menos que você configure certificados específicos
        }
    });

    try {
        await client.connect();
        console.log("Conectado ao banco de dados com sucesso!");

        // Teste: Criar tabela se não existir (apenas para demonstração, idealmente o schema é gerenciado separadamente)
        // Em um cenário real, as tabelas já teriam sido criadas via console SQL do Neon.
        // Esta parte é mais para verificar se podemos executar comandos.
        await client.query(`
            CREATE TABLE IF NOT EXISTS test_table (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50)
            );
        `);
        console.log("Tabela 'test_table' verificada/criada.");

        // Teste: Inserir um dado
        await client.query("INSERT INTO test_table (name) VALUES ($1)", ['Teste Neon']);
        console.log("Dado inserido em 'test_table'.");

        // Teste: Consultar dados
        const res = await client.query("SELECT * FROM test_table ORDER BY id DESC LIMIT 1");
        console.log("Consulta à 'test_table' realizada:", res.rows);

        await client.end();
        console.log("Conexão com o banco de dados fechada.");

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Conexão com o banco de dados bem-sucedida e teste de query realizado!",
                data: res.rows
            })
        };
    } catch (error) {
        console.error("Erro ao conectar ou testar o banco de dados:", error);
        if (client) {
            try {
                await client.end(); // Tenta fechar a conexão em caso de erro
            } catch (closeError) {
                console.error("Erro ao fechar a conexão do banco após falha:", closeError);
            }
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Falha na conexão com o banco de dados", error: error.message })
        };
    }
};
