# Chatbot · Associação Conexão Social

Assistente virtual em forma de botão flutuante para o site da **Associação Conexão Social (ACS)**, de Lagoa de Itaenga (PE). Funciona em dois modos:

- **Offline (padrão):** responde com uma base de conhecimento local. Não precisa de servidor nem de chave.
- **Com IA:** envia as perguntas a um pequeno backend, que consulta a API da Anthropic. Se o backend falhar, o chat volta sozinho ao modo offline.

## Estrutura

```
chatbot-conexao-social/
├── index.html                 # página de demonstração
├── src/
│   ├── css/chatbot.css        # visual e cores (variáveis --acs-*)
│   └── js/
│       ├── config.js          # contatos, URL do backend, instruções da IA
│       ├── knowledge-base.js  # perguntas e respostas do modo offline
│       └── chatbot.js         # lógica e montagem do widget
├── backend/                   # opcional, só para ativar a IA
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## 1. Testar no seu computador

Abra o `index.html` no navegador e clique no botão do canto da tela. Não precisa instalar nada.

## 2. Personalizar

1. **Cores:** em `src/css/chatbot.css`, troque `--acs-primary`, `--acs-secondary` e `--acs-accent` pelos códigos hex oficiais da ACS.
2. **Contatos:** em `src/js/config.js`, preencha `whatsapp` (com DDI e DDD, ex.: `5581999999999`), `email` e `horario`.
3. **Perguntas e respostas:** em `src/js/knowledge-base.js`, cada item tem `k` (palavras-chave, em minúsculas e sem acento) e `a` (resposta). Os botões rápidos ficam em `ACS_CHIPS`.
4. **Informações:** as respostas iniciais vieram de notícias públicas de 2024. Confirme com a equipe da ACS se endereço, projetos, vagas e documentos continuam corretos antes de publicar.

## 3. Colocar no site da associação

O site só precisa carregar o CSS e os 3 scripts, nesta ordem:

```html
<link rel="stylesheet" href="CAMINHO/src/css/chatbot.css">
<script src="CAMINHO/src/js/config.js"></script>
<script src="CAMINHO/src/js/knowledge-base.js"></script>
<script src="CAMINHO/src/js/chatbot.js"></script>
```

Coloque o `<link>` no `<head>` e os `<script>` antes do `</body>`. Há três jeitos de ter os arquivos no ar:

- **A. Hospedar junto com o site:** envie a pasta `src/` para o servidor do site e ajuste o `CAMINHO`.
- **B. GitHub Pages:** no repositório, vá em *Settings → Pages* e publique a branch `main`. Os arquivos ficam em `https://SEU-USUARIO.github.io/NOME-DO-REPO/src/...`.
- **C. CDN gratuita (jsDelivr):** sem hospedar nada, use `https://cdn.jsdelivr.net/gh/SEU-USUARIO/NOME-DO-REPO@v1.0.0/src/js/chatbot.js` (e o mesmo padrão para os outros arquivos). Crie uma *release* `v1.0.0` no GitHub e use sempre uma versão fixa.

**Se o site usa WordPress, Wix ou similar:** use o recurso de inserir código no cabeçalho e no rodapé (no WordPress, um plugin como o WPCode) ou um bloco de "HTML personalizado", e cole as linhas acima.

## 4. Ativar a IA (opcional)

1. No GitHub, nada de chave: a chave da API fica só no servidor.
2. Em `backend/`, copie `.env.example` para `.env` e preencha `ANTHROPIC_API_KEY` (crie a chave em console.anthropic.com) e `ALLOWED_ORIGINS` (endereço do site da ACS).
3. Teste localmente: `cd backend && npm install && npm start`. O backend sobe em `http://localhost:3000`.
4. Publique a pasta `backend/` em um serviço que rode Node.js (Render, Railway, Fly.io, um servidor próprio etc.). Cadastre as variáveis do `.env` no painel do serviço, nunca no código.
5. Em `src/js/config.js`, coloque o endereço público do backend:
   ```js
   apiUrl: "https://SEU-BACKEND.exemplo.com/chat",
   ```

O backend usa as instruções da IA que estão no próprio `server.js`. Se você mudar informações da ACS, atualize **os dois lugares**: `knowledge-base.js` (modo offline) e `server.js` (modo IA). O modelo é definido em `ANTHROPIC_MODEL` e pode ser trocado sem mexer no código.

## 5. Antes de publicar

- [ ] Cores oficiais aplicadas
- [ ] Contatos preenchidos
- [ ] Informações conferidas com a equipe da ACS
- [ ] Arquivo `.env` **não** está no repositório
- [ ] `ALLOWED_ORIGINS` contém só o endereço do site
- [ ] Teste no celular e no computador

## Subir para o GitHub

```bash
cd chatbot-conexao-social
git init
git add .
git commit -m "Chatbot da Associação Conexão Social"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
git push -u origin main
```

## Privacidade

O chat não grava conversas. No modo com IA, as mensagens passam pelo backend e pela API da Anthropic; avise os visitantes e oriente-os a não digitarem dados pessoais sensíveis (CPF, endereço etc.).
