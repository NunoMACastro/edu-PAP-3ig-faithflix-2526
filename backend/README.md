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

## Dados locais e demonstracao

- O backend usa MongoDB configurado por `MONGODB_URI` e `MONGODB_DB_NAME`.
- Os scripts `seed:e2e*` continuam reservados para fluxos Playwright/E2E.
- O script `npm run seed:demo` cria dados ficticios realistas marcados com `demoFixture: "demo-v1"` para demonstrar catalogo, subscricoes, familia, pool solidaria, passagens biblicas, metricas e privacidade.
