# AnalfaBet - Bolão do Brasileirão

AnalfaBet é uma aplicação web simples onde amigos podem apostar nos placares dos jogos do Campeonato Brasileiro (Brasileirão Série A) e competir por pontos.

## Funcionalidades

*   **Cadastro e Login de Usuários:** Sistema de autenticação seguro com senhas hash e tokens JWT.
*   **Visualização de Jogos:** Exibe os próximos jogos do Brasileirão, buscando dados da API football-data.org.
*   **Realização de Apostas:** Usuários logados podem registrar seus palpites para os jogos abertos. É possível alterar uma aposta antes do início da partida.
*   **Atualização Automática de Resultados:** Uma função serverless (idealmente agendada) busca os resultados reais dos jogos na API externa.
*   **Cálculo de Pontuação:**
    *   **3 pontos:** Por acertar o placar exato de um jogo.
    *   **1 ponto:** Por acertar o resultado do jogo (vitória do time da casa, empate ou vitória do time visitante), mas não o placar exato.
*   **Classificação:** Exibe uma tabela com a pontuação total e o número de placares exatos de cada jogador, ordenada por pontos e depois por placares exatos.
*   **Identificação de Vencedores:** Mostra o(s) jogador(es) com a maior pontuação, usando o número de placares exatos como critério de desempate.

## Tecnologias Utilizadas

*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS)
*   **Backend:** Netlify Functions (Node.js)
*   **Banco de Dados:** Neon (PostgreSQL Serverless)
*   **API de Dados Esportivos:** [football-data.org](https://football-data.org) (para jogos e resultados do Brasileirão - ID da competição: BSA)
*   **Hospedagem e Deploy:** Netlify
*   **Autenticação:** bcryptjs (para hashing de senhas), jsonwebtoken (para tokens JWT)
*   **Requisições HTTP (backend):** node-fetch

## Estrutura do Projeto

*   `public/`: Contém os arquivos estáticos do frontend (HTML, CSS, JS).
    *   `index.html`: Página principal para login, cadastro, visualização de jogos e realização de apostas.
    *   `classificacao.html`: Página para exibir a tabela de classificação.
    *   `style.css`: Folha de estilos principal.
    *   `app.js`: Lógica JavaScript do frontend.
*   `netlify/functions/`: Contém as funções serverless (backend).
    *   `registrar_usuario.js`: Endpoint para cadastro de novos usuários.
    *   `login_usuario.js`: Endpoint para login de usuários existentes.
    *   `buscar_jogos_rodada.js`: Busca jogos da API football-data.org e os salva/atualiza no banco.
    *   `fazer_aposta.js`: Endpoint para registrar/atualizar apostas dos usuários.
    *   `buscar_minhas_apostas.js`: Retorna as apostas feitas pelo usuário logado.
    *   `atualizar_resultados_e_pontuar.js`: Busca resultados reais, atualiza o banco e calcula a pontuação das apostas. (Idealmente acionada por agendamento).
    *   `buscar_classificacao.js`: Calcula e retorna a classificação dos jogadores.
    *   `hello.js`, `db-test.js`: Funções de teste iniciais.
*   `package.json`: Define as dependências do projeto para as Netlify Functions.
*   `netlify.toml`: Arquivo de configuração do Netlify (diretório de publicação, funções, redirecionamentos).

## Configuração e Deploy

### Pré-requisitos

1.  **Conta Netlify:** Para deploy do frontend e das funções serverless.
2.  **Conta Neon:** Para o banco de dados PostgreSQL.
3.  **Chave da API football-data.org:** Registre-se em [football-data.org](https://www.football-data.org/client/register) para obter uma chave de API (o plano gratuito "TIER ONE" é suficiente, com limite de 10 chamadas/minuto).

### Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no seu site Netlify (Site settings > Build & deploy > Environment):

*   `DATABASE_URL`: A string de conexão do seu banco de dados Neon.
    *   Formato: `postgresql://user:password@host:port/dbname?sslmode=require`
*   `JWT_SECRET`: Uma string longa, aleatória e secreta para assinar os tokens JWT.
    *   Exemplo: Use um gerador de senhas fortes para criar esta string.
*   `FOOTBALL_DATA_API_KEY`: Sua chave de API obtida do football-data.org.
*   `UPDATE_TRIGGER_SECRET` (Opcional): Se você for acionar a função `atualizar_resultados_e_pontuar` via um cron job externo com um segredo na URL, defina este segredo aqui. A função precisará ser ajustada para verificar este segredo.

### Schema do Banco de Dados (Neon PostgreSQL)

Execute o seguinte SQL no seu banco de dados Neon para criar as tabelas necessárias:

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jogos (
    id_jogo_api INTEGER PRIMARY KEY, -- ID vindo da football-data.org
    data_jogo TIMESTAMP,
    time_casa VARCHAR(100),
    time_visitante VARCHAR(100),
    placar_casa_real INTEGER,
    placar_visitante_real INTEGER,
    status_jogo VARCHAR(50) -- ex: SCHEDULED, TIMED, IN_PLAY, FINISHED
);

CREATE TABLE apostas (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    id_jogo_api INTEGER REFERENCES jogos(id_jogo_api) ON DELETE CASCADE,
    placar_casa_apostado INTEGER NOT NULL,
    placar_visitante_apostado INTEGER NOT NULL,
    pontos_ganhos INTEGER DEFAULT 0,
    acertou_placar_exato BOOLEAN DEFAULT FALSE,
    data_aposta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_usuario, id_jogo_api) -- Garante que um usuário só pode apostar uma vez por jogo
);
```

### Deploy

1.  Crie um repositório Git (ex: no GitHub, GitLab).
2.  Envie os arquivos do projeto para o repositório.
3.  No Netlify, crie um novo site a partir do seu repositório Git.
    *   O Netlify deve detectar automaticamente o `netlify.toml`.
    *   **Build command:** Deixe em branco ou use `npm install`.
    *   **Publish directory:** `public`.
    *   **Functions directory:** `netlify/functions`.
4.  Após o deploy, configure as variáveis de ambiente mencionadas acima.
5.  Configure o acionamento da função `atualizar_resultados_e_pontuar`:
    *   **Via Netlify Scheduled Functions (Recomendado):**
        Adicione ao `netlify.toml`:
        ```toml
        [functions."atualizar_resultados_e_pontuar"]
          # Ex: a cada 10 minutos.
          # Ajuste o MAX_JOGOS_PROCESSAR_POR_EXECUCAO na função e o delay interno
          # para não exceder o rate limit da API football-data.org (10 reqs/min).
          schedule = "*/10 * * * *"
        ```
    *   **Via Cron Job Externo:** Use um serviço para chamar o endpoint `https://<seu-site>.netlify.app/.netlify/functions/atualizar_resultados_e_pontuar?secret=SEU_UPDATE_TRIGGER_SECRET`.

## Como Rodar Localmente (com Netlify Dev)

1.  Clone o repositório.
2.  Instale as dependências: `npm install`
3.  Instale a Netlify CLI: `npm install -g netlify-cli`
4.  Faça login na Netlify CLI: `netlify login`
5.  Link o projeto com seu site Netlify: `netlify link`
6.  Crie um arquivo `.env` na raiz do projeto e adicione suas variáveis de ambiente:
    ```env
    DATABASE_URL=sua_string_conexao_neon
    JWT_SECRET=seu_jwt_secret_forte
    FOOTBALL_DATA_API_KEY=sua_api_key_football_data
    # UPDATE_TRIGGER_SECRET=seu_secret_se_for_usar_via_http_get
    ```
7.  Inicie o ambiente de desenvolvimento local: `netlify dev`

## Pontos de Atenção e Melhorias Futuras

*   **Rate Limiting da API football-data.org:** Monitorar e ajustar a frequência de `atualizar_resultados_e_pontuar`.
*   **Tempo de Execução da Função Serverless:** O processamento em lotes ajuda, mas monitore.
*   **Tratamento de Erros:** Pode ser expandido.
*   **Segurança:** Revisar práticas de segurança.
*   **Experiência do Usuário:** Edição de perfil, notificações, visualização de apostas de outros, paginação.
*   **Testes:** Implementar testes unitários e de integração formais.