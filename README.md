# AnalfaBet

Sistema de apostas entre amigos para o Campeonato Brasileiro.

## 🚀 Funcionalidades

- **Autenticação**: Sistema completo de login e registro
- **Ligas Privadas**: Crie ligas entre amigos com códigos únicos
- **Apostas em Tempo Real**: Aposte nos placares dos jogos do Brasileirão
- **Sistema de Pontuação**: 
  - 3 pontos para placar exato
  - 1 ponto para resultado correto (vitória/empate/derrota)
- **Ranking Dinâmico**: Acompanhe sua posição com desempate por placares exatos
- **Histórico Completo**: Visualize todas suas apostas e resultados

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: Neon PostgreSQL
- **API**: football-data.org para dados dos jogos
- **Deploy**: Netlify
- **Icons**: Lucide React

## ⚙️ Configuração

### 1. Clone e instale dependências
```bash
git clone <repository-url>
cd analfa-bet
npm install
```

### 2. Configure o banco de dados Neon
1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um novo projeto PostgreSQL
3. Execute o script SQL em `database/schema.sql` no console SQL do Neon
4. Copie a string de conexão

### 3. Configure variáveis de ambiente
Copie `.env.example` para `.env` e configure:

```env
VITE_DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
VITE_FOOTBALL_API_KEY=your_football_api_key_from_football_data_org
VITE_JWT_SECRET=your_secure_jwt_secret_key
```

### 4. Execute o projeto
```bash
npm run dev
```

## 🎯 Como Usar

1. **Registre-se** ou faça login na plataforma
2. **Crie uma liga** ou entre em uma existente usando o código
3. **Faça suas apostas** nos jogos agendados do Brasileirão
4. **Acompanhe o ranking** e veja seus resultados em tempo real

## 🏆 Sistema de Pontuação

- **Placar Exato**: 3 pontos (ex: apostou 2x1, resultado foi 2x1)
- **Resultado Correto**: 1 ponto (ex: apostou 2x1, resultado foi 3x0 - ambos vitória do mandante)
- **Resultado Errado**: 0 pontos

## 📊 Ranking

O ranking é ordenado por:
1. **Total de pontos** (maior para menor)
2. **Placares exatos** (desempate - maior para menor)
3. **Data de entrada na liga** (mais antigo primeiro)

## 🗄️ Estrutura do Banco

- `users`: Dados dos usuários
- `leagues`: Ligas criadas
- `league_members`: Membros das ligas
- `matches`: Jogos do brasileirão
- `bets`: Apostas dos usuários
- `user_stats`: Estatísticas calculadas automaticamente

## 🔧 Deploy

O projeto está configurado para deploy automático no Netlify:

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente no painel do Netlify
3. O deploy será automático a cada push na branch main

## 📱 Responsivo

Interface totalmente responsiva, otimizada para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 Design

- Design moderno com gradientes verde/amarelo (cores do Brasil)
- Micro-interações e animações suaves
- Feedback visual em tempo real
- Interface intuitiva e acessível

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT com expiração
- Validação de dados no frontend e backend
- Proteção contra SQL injection

## 📈 Performance

- Lazy loading de componentes
- Otimização de bundle com Vite
- Cache de assets estáticos
- Queries otimizadas no banco

## 🤝 Contribuição

Este é um projeto de demonstração. Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

Desenvolvido com ❤️ para os amantes do futebol brasileiro!