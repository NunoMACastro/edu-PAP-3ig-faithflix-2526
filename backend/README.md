# FaithFlix Backend

Backend Node.js/Express da app FaithFlix, criado na MF1 como base tecnica modular.

## Comandos

- `npm install`
- `npm run dev`
- `npm start`
- `npm run smoke`
- `npm run embeddings:generate`

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

## Recomendacoes

- `GET /api/recommendations/me` devolve recomendacoes autenticadas com estrategia `weighted-baseline-v2`.
- `POST /api/recommendations/feedback` guarda feedback explicito por conteudo recomendado.
- `POST /api/recommendations/events` regista eventos agregados `shown`/`clicked`.
- `npm run embeddings:generate` gera embeddings de conteudos publicados quando `EMBEDDINGS_PROVIDER` e `deterministic` ou `external`.
- O modulo usa apenas sinais internos por defeito; provider externo de embeddings fica desligado com `EMBEDDINGS_PROVIDER=disabled`.
- Quando existem embeddings guardados em `content_embeddings`, a recomendacao pode usar `weighted-baseline-v2+content-embeddings` sem devolver vectores na API publica.

### Variaveis de embeddings

- `EMBEDDINGS_PROVIDER=disabled|deterministic|external`
- `EMBEDDINGS_MODEL`
- `EMBEDDINGS_DIMENSIONS`
- `EMBEDDINGS_API_URL`
- `EMBEDDINGS_API_KEY`

## CORS local

- `FRONTEND_ORIGIN` define as origens frontend autorizadas.
- Em desenvolvimento, `http://localhost:5173` e `http://127.0.0.1:5173` estao autorizadas para permitir cookies com `credentials: include`.

## Fora de scope nesta fase

- Sem login real.
- Sem catalogo real.
- Sem streaming.
- Sem base de dados.
- Sem pagamentos.
