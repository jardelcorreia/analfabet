document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const apostasSection = document.getElementById('apostas-section');
    const minhasApostasSection = document.getElementById('minhas-apostas-section');
    const nav = document.querySelector('header nav');

    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');

    // Elementos dos cards de autenticação e links de alternância
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    let token = localStorage.getItem('analfaBetToken');
    let userName = localStorage.getItem('analfaBetUserName');

    // Helper para exibir mensagens
    function showMessage(elementId, message, type = 'info', autoHideDelay = 5000) {
        const messageEl = document.getElementById(elementId);
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `message-area ${type}`;
            messageEl.style.display = 'block';

            if (autoHideDelay > 0 && (type === 'success' || type === 'info')) {
                setTimeout(() => {
                    if (messageEl.textContent === message) { // Só esconde se a mensagem não mudou
                        messageEl.style.display = 'none';
                        messageEl.textContent = '';
                        messageEl.className = 'message-area';
                    }
                }, autoHideDelay);
            }
        }
    }
    // Helper para limpar mensagens
    function clearMessage(elementId) {
        const messageEl = document.getElementById(elementId);
        if (messageEl) {
            messageEl.style.display = 'none';
            messageEl.textContent = '';
            messageEl.className = 'message-area';
        }
    }


    function updateNav() {
        const existingAuthLinks = nav.querySelectorAll('.auth-link');
        existingAuthLinks.forEach(link => link.remove());

        if (token) {
            const userNameSpan = document.createElement('span');
            userNameSpan.textContent = `Olá, ${userName}!`;
            userNameSpan.style.color = 'white';
            userNameSpan.style.marginRight = '1em';
            userNameSpan.className = 'auth-link';
            nav.appendChild(userNameSpan);

            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.textContent = 'Sair';
            logoutLink.className = 'auth-link';
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('analfaBetToken');
                localStorage.removeItem('analfaBetUserName');
                token = null;
                userName = null;
                updateUIBasedOnLoginState();
                if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                     if (authSection) authSection.style.display = 'block';
                     if (apostasSection) apostasSection.style.display = 'none';
                     if (minhasApostasSection) minhasApostasSection.style.display = 'none';
                     clearMessage('login-message');
                     clearMessage('register-message');
                     clearMessage('aposta-message');
                }
            });
            nav.appendChild(logoutLink);
        }
    }

    function updateUIBasedOnLoginState() {
        const isLoggedIn = !!token;
        updateNav();

        if (isLoggedIn) {
            if (authSection) authSection.style.display = 'none'; // Esconde a seção inteira
            if (loginCard) loginCard.style.display = 'none'; // Garante que cards individuais também sejam escondidos
            if (registerCard) registerCard.style.display = 'none';
            if (apostasSection) apostasSection.style.display = 'block';
            if (minhasApostasSection) minhasApostasSection.style.display = 'block';

            if (document.getElementById('jogos-lista') && (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
                fetchJogos();
            }
            if (document.getElementById('minhas-apostas-lista') && (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
                fetchMinhasApostas();
            }
        } else {
            if (authSection) authSection.style.display = 'block'; // Mostra a seção de autenticação
            if (loginCard) loginCard.style.display = 'block'; // Mostra o card de login por padrão
            if (registerCard) registerCard.style.display = 'none'; // Esconde o card de registro
            if (apostasSection) apostasSection.style.display = 'none';
            if (minhasApostasSection) minhasApostasSection.style.display = 'none';
        }
    }

    // Lógica para alternar entre cards de login e registro
    if (showRegisterLink && loginCard && registerCard) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginCard.style.display = 'none';
            registerCard.style.display = 'block';
            clearMessage('login-message');
            clearMessage('register-message'); // Limpa mensagens ao trocar
        });
    }

    if (showLoginLink && loginCard && registerCard) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerCard.style.display = 'none';
            loginCard.style.display = 'block';
            clearMessage('login-message');
            clearMessage('register-message'); // Limpa mensagens ao trocar
        });
    }

    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            clearMessage('login-message');
            const emailEl = document.getElementById('login-email');
            const passwordEl = document.getElementById('login-password');
            const email = emailEl.value;
            const password = passwordEl.value;

            if (!email || !password) {
                showMessage('login-message', 'Por favor, preencha email e senha.', 'error', 0);
                return;
            }
            try {
                showMessage('login-message', 'Entrando...', 'info', 0);
                const response = await fetch('/api/login_usuario', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha: password })
                });
                const data = await response.json();
                if (response.ok && data.token) {
                    localStorage.setItem('analfaBetToken', data.token);
                    localStorage.setItem('analfaBetUserName', data.userName);
                    token = data.token;
                    userName = data.userName;
                    emailEl.value = ''; // Limpa campo
                    passwordEl.value = ''; // Limpa campo
                    clearMessage('login-message');
                    updateUIBasedOnLoginState();
                } else {
                    showMessage('login-message', data.message || 'Falha no login', 'error', 0);
                    passwordEl.value = ''; // Limpa senha em caso de falha
                }
            } catch (error) {
                console.error("Erro no fetch de login:", error);
                showMessage('login-message', 'Erro ao tentar fazer login. Tente novamente.', 'error', 0);
            }
        });
    }

    if (registerButton) {
        registerButton.addEventListener('click', async () => {
            clearMessage('register-message');
            const nameEl = document.getElementById('register-name');
            const emailEl = document.getElementById('register-email');
            const passwordEl = document.getElementById('register-password');
            const name = nameEl.value;
            const email = emailEl.value;
            const password = passwordEl.value;

            if (!name || !email || !password) {
                showMessage('register-message','Por favor, preencha nome, email e senha.', 'error', 0);
                return;
            }
            try {
                showMessage('register-message', 'Registrando...', 'info', 0);
                const response = await fetch('/api/registrar_usuario', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: name, email, senha: password })
                });
                const data = await response.json();
                if (response.status === 201) {
                    showMessage('register-message', data.message || 'Cadastro realizado! Faça o login.', 'success');
                    nameEl.value = '';
                    emailEl.value = '';
                    passwordEl.value = '';
                    document.getElementById('login-email').value = email; // Preenche o email no login
                    document.getElementById('login-password').focus();
                } else {
                    showMessage('register-message', data.message || 'Falha no cadastro', 'error', 0);
                }
            } catch (error) {
                console.error("Erro no fetch de registro:", error);
                showMessage('register-message', 'Erro ao tentar registrar. Tente novamente.', 'error', 0);
            }
        });
    }

    async function fetchJogos() {
        const jogosListaDiv = document.getElementById('jogos-lista');
        if (!jogosListaDiv) return;
        jogosListaDiv.innerHTML = '<p class="message-area info" style="display:block;">Carregando jogos...</p>';

        try {
            const response = await fetch('/api/buscar_jogos_rodada');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Erro desconhecido."}));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }
            const data = await response.json();
            if (data.jogos && data.jogos.length > 0) {
                renderJogos(data.jogos, jogosListaDiv);
            } else {
                jogosListaDiv.innerHTML = '<p class="message-area info" style="display:block;">Nenhum jogo encontrado para a rodada ou critérios.</p>';
            }
        } catch (error) {
            console.error("Erro ao buscar jogos:", error);
            jogosListaDiv.innerHTML = `<p class="message-area error" style="display:block;">Erro ao carregar jogos: ${error.message}.</p>`;
        }
    }

    function renderJogos(jogos, container) {
        container.innerHTML = '';
        jogos.sort((a,b) => new Date(a.data_jogo) - new Date(b.data_jogo));

        jogos.forEach(jogo => {
            const jogoDiv = document.createElement('div');
            jogoDiv.className = 'jogo';

            const dataJogo = new Date(jogo.data_jogo).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            let formAposta = '';
            if (token && (jogo.status_jogo === 'SCHEDULED' || jogo.status_jogo === 'TIMED')) {
                formAposta = `
                    <div class="aposta-inputs">
                        <input type="number" min="0" placeholder="Placar ${jogo.time_casa.nome}" id="placar-casa-${jogo.id_jogo_api}">
                        <input type="number" min="0" placeholder="Placar ${jogo.time_visitante.nome}" id="placar-visitante-${jogo.id_jogo_api}">
                    </div>
                    <button onclick="fazerAposta(${jogo.id_jogo_api}, '${jogo.time_casa.nome}', '${jogo.time_visitante.nome}')">Apostar</button>
                `;
            } else if (jogo.status_jogo === 'SCHEDULED' || jogo.status_jogo === 'TIMED') {
                formAposta = `<p class="jogo-status">Faça login para apostar.</p>`;
            } else {
                formAposta = `<p class="jogo-status">Apostas encerradas (${jogo.status_jogo})</p>`;
                if(jogo.placar_casa_real !== null && jogo.placar_visitante_real !== null) {
                    formAposta += `<p class="resultado-final">Resultado: ${jogo.time_casa.nome} ${jogo.placar_casa_real} x ${jogo.placar_visitante_real} ${jogo.time_visitante.nome}</p>`;
                }
            }

            jogoDiv.innerHTML = `
                <h4>
                    ${jogo.time_casa.escudo ? `<img src="${jogo.time_casa.escudo}" alt="${jogo.time_casa.nome}" class="escudo-time" onerror="this.style.display='none'">` : ''}
                    ${jogo.time_casa.nome}
                    vs
                    ${jogo.time_visitante.nome}
                    ${jogo.time_visitante.escudo ? `<img src="${jogo.time_visitante.escudo}" alt="${jogo.time_visitante.nome}" class="escudo-time" onerror="this.style.display='none'">` : ''}
                </h4>
                <p>Data: ${dataJogo} (Rodada: ${jogo.matchday || 'N/A'})</p>
                <p>Status: ${jogo.status_jogo}</p>
                ${formAposta}
            `;
            container.appendChild(jogoDiv);
        });
    }

    async function fetchMinhasApostas() {
        const minhasApostasDiv = document.getElementById('minhas-apostas-lista');
        if (!minhasApostasDiv) return;

        if (!token) {
            minhasApostasDiv.innerHTML = '<p class="message-area info" style="display:block;">Você precisa estar logado para ver suas apostas.</p>';
            return;
        }
        minhasApostasDiv.innerHTML = '<p class="message-area info" style="display:block;">Carregando suas apostas...</p>';

        try {
            const response = await fetch('/api/buscar_minhas_apostas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Erro desconhecido."}));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }
            const data = await response.json();
            renderMinhasApostas(data.minhas_apostas, minhasApostasDiv);

        } catch (error) {
            console.error("Erro ao buscar minhas apostas:", error);
            minhasApostasDiv.innerHTML = `<p class="message-area error" style="display:block;">Erro ao carregar suas apostas: ${error.message}.</p>`;
        }
    }

    function renderMinhasApostas(apostas, container) {
        container.innerHTML = '';
        if (!apostas || apostas.length === 0) {
            container.innerHTML = '<p class="message-area info" style="display:block;">Você ainda não fez nenhuma aposta.</p>';
            return;
        }

        apostas.sort((a,b) => new Date(b.data_jogo) - new Date(a.data_jogo));

        apostas.forEach(aposta => {
            const apostaDiv = document.createElement('div');
            apostaDiv.className = 'aposta';

            const dataJogo = new Date(aposta.data_jogo).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            let infoResultado = '';
            if (aposta.status_jogo === 'FINISHED' && aposta.placar_casa_real !== null) {
                infoResultado = `
                    <p class="resultado-final">Resultado Final: ${aposta.time_casa} ${aposta.placar_casa_real} x ${aposta.placar_visitante_real} ${aposta.time_visitante}</p>
                    <p><strong>Pontos Ganhos: ${aposta.pontos_ganhos} ${aposta.acertou_placar_exato ? '(Placar Exato!)' : ''}</strong></p>
                `;
            } else if (aposta.status_jogo !== 'SCHEDULED' && aposta.status_jogo !== 'TIMED') {
                 infoResultado = `<p class="jogo-status">Jogo: ${aposta.status_jogo}</p>`;
            }

            apostaDiv.innerHTML = `
                <h4>${aposta.time_casa} vs ${aposta.time_visitante}</h4>
                <p>Data do Jogo: ${dataJogo}</p>
                <p>Sua Aposta: ${aposta.time_casa} <strong>${aposta.placar_casa_apostado}</strong> x <strong>${aposta.placar_visitante_apostado}</strong> ${aposta.time_visitante}</p>
                ${infoResultado}
            `;
            container.appendChild(apostaDiv);
        });
    }

    async function fetchAndRenderClassificacao() {
        const tabelaClassificacaoBody = document.querySelector('#tabela-classificacao tbody');
        const vencedoresDiv = document.getElementById('vencedores-info');

        if (!tabelaClassificacaoBody) {
            return;
        }

        tabelaClassificacaoBody.innerHTML = '<tr><td colspan="4"><p class="message-area info" style="display:block; margin:0;">Carregando classificação...</p></td></tr>';
        if (vencedoresDiv) vencedoresDiv.innerHTML = '';

        try {
            const response = await fetch('/api/buscar_classificacao');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Erro desconhecido."}));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }
            const data = await response.json();

            tabelaClassificacaoBody.innerHTML = '';
            if (data.classificacao && data.classificacao.length > 0) {
                data.classificacao.forEach((item, index) => {
                    const row = tabelaClassificacaoBody.insertRow();
                    row.insertCell().textContent = index + 1;
                    row.insertCell().textContent = item.nome_usuario;
                    row.insertCell().textContent = item.total_pontos;
                    row.insertCell().textContent = item.total_placares_exatos;

                    if (data.vencedores.some(v => v.id_usuario === item.id_usuario)) {
                        row.classList.add('vencedor-destaque');
                    }
                });
            } else {
                tabelaClassificacaoBody.innerHTML = '<tr><td colspan="4"><p class="message-area info" style="display:block; margin:0;">Nenhuma pontuação registrada ainda.</p></td></tr>';
            }

            if (vencedoresDiv) {
                if (data.vencedores && data.vencedores.length > 0) {
                    const nomesVencedores = data.vencedores.map(v => v.nome_usuario).join(', ');
                    vencedoresDiv.innerHTML = `<h3>🏆 Vencedor(es): ${nomesVencedores} 🏆</h3>`;
                } else if (data.classificacao && data.classificacao.some(j => j.total_pontos > 0)) {
                     vencedoresDiv.innerHTML = '<p class="message-area info" style="display:block;">A competição está em andamento! Ainda não há vencedores definidos.</p>';
                } else {
                    vencedoresDiv.innerHTML = '<p class="message-area info" style="display:block;">Ninguém pontuou ainda. Sem vencedores no momento.</p>';
                }
            }

        } catch (error) {
            console.error("Erro ao buscar classificação:", error);
            tabelaClassificacaoBody.innerHTML = `<tr><td colspan="4"><p class="message-area error" style="display:block; margin:0;">Erro ao carregar classificação: ${error.message}</p></td></tr>`;
            if (vencedoresDiv) vencedoresDiv.innerHTML = `<p class="message-area error" style="display:block;">Erro ao carregar informações dos vencedores.</p>`;
        }
    }

    const currentPage = window.location.pathname;
    if (currentPage.includes('classificacao.html')) {
        fetchAndRenderClassificacao();
        updateNav();
    } else if (currentPage === '/' || currentPage === '/index.html' || currentPage === '') {
        updateUIBasedOnLoginState();
    } else {
        updateNav();
    }

    window.fetchMinhasApostas = fetchMinhasApostas;
    window.fetchJogos = fetchJogos;
});

function fazerAposta(idJogoApi, nomeCasa, nomeVisitante) {
    clearGlobalMessage('aposta-message'); // Limpa mensagens de apostas anteriores
    const placarCasaEl = document.getElementById(`placar-casa-${idJogoApi}`);
    const placarVisitanteEl = document.getElementById(`placar-visitante-${idJogoApi}`);

    if(!placarCasaEl || !placarVisitanteEl) {
        console.error(`Elementos de input para jogo ${idJogoApi} não encontrados.`);
        return;
    }
    const placarCasa = placarCasaEl.value;
    const placarVisitante = placarVisitanteEl.value;

    if(placarCasa === '' || placarVisitante === '') {
        showGlobalMessage('aposta-message', 'Por favor, preencha os dois placares.', 'error', 0);
        return;
    }
    const token = localStorage.getItem('analfaBetToken');
    if (!token) {
        showGlobalMessage('aposta-message', 'Você precisa estar logado para apostar.', 'error', 0);
        const authSection = document.getElementById('auth-section');
        if (authSection) authSection.style.display = 'block';
        return;
    }

    const bodyPayload = {
        id_jogo_api: parseInt(idJogoApi),
        placar_casa_apostado: parseInt(placarCasa),
        placar_visitante_apostado: parseInt(placarVisitante)
    };

    showGlobalMessage('aposta-message', `Registrando aposta para ${nomeCasa} ${placarCasa} x ${placarVisitante} ${nomeVisitante}...`, 'info', 0);

    fetch('/api/fazer_aposta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
    })
    .then(response => {
        return response.json().then(data => ({ ok: response.ok, status: response.status, data }));
    })
    .then(({ ok, status, data }) => {
        showGlobalMessage('aposta-message', data.message || (ok ? "Aposta registrada!" : "Erro ao registrar aposta."), ok ? 'success' : 'error', ok ? 5000 : 0);
        if (ok) {
            placarCasaEl.value = '';
            placarVisitanteEl.value = '';
            if (window.fetchMinhasApostas) window.fetchMinhasApostas();
            // Não precisa recarregar todos os jogos, a menos que queira mudar o estado do jogo apostado na UI.
            // if (window.fetchJogos) window.fetchJogos();
        }
    })
    .catch(err => {
        console.error("Erro ao fazer aposta:", err);
        showGlobalMessage('aposta-message', "Erro ao fazer aposta: " + (err.message || "Verifique o console."), 'error', 0);
    });
}

// Duas funções globais para simplificar o acesso à showMessage e clearMessage de fora do DOMContentLoaded
// Isso é usado pela função fazerAposta que está no escopo global.
function showGlobalMessage(elementId, message, type = 'info', autoHideDelay = 5000) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message-area ${type}`;
        messageEl.style.display = 'block';

        if (autoHideDelay > 0 && (type === 'success' || type === 'info')) {
            setTimeout(() => {
                if (messageEl.textContent === message) {
                    messageEl.style.display = 'none';
                    messageEl.textContent = '';
                    messageEl.className = 'message-area';
                }
            }, autoHideDelay);
        }
    }
}
function clearGlobalMessage(elementId) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.style.display = 'none';
        messageEl.textContent = '';
        messageEl.className = 'message-area';
    }
}
