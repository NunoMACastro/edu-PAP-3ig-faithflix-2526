# FaithFlix Backend

Backend Node.js/Express da app FaithFlix, criado na MF1 como base tecnica modular.

## Comandos

- `npm install`
- `npm run dev`
- `npm start`
- `npm run smoke`

## Rotas tecnicas nesta fase

- `GET /api` devolve informacao tecnica basica da API.
- `GET /health` devolve estado operacional basico da API.

## Sessao base

- `GET /api/session/me` devolve `401` enquanto nao existir login real.
- `POST /api/session/logout` limpa o cookie de sessao.
- Tokens em `localStorage` ou `sessionStorage` continuam fora de scope.

## Health-check e logs

- Todas as respostas incluem `x-request-id`.
- Logs sao JSON por linha.
- Cookies, tokens e passwords nao devem aparecer nos logs.

## CORS local

- `FRONTEND_ORIGIN` define as origens frontend autorizadas.
- Em desenvolvimento, `http://localhost:5173` e `http://127.0.0.1:5173` estao autorizadas para permitir cookies com `credentials: include`.

## Fora de scope nesta fase

- Sem login real.
- Sem catalogo real.
- Sem streaming.
- Sem base de dados.
- Sem pagamentos.
