## Estrutura
- `src/app.js`: configura Express.
- `src/server.js`: abre a porta.
- `src/modules/`: modulos por dominio.

## Sessao base

- `GET /api/session/me` devolve `401` enquanto nao existir login real.
- `POST /api/session/logout` limpa o cookie de sessao.
- Tokens em `localStorage` ou `sessionStorage` continuam fora de scope.

## Health-check e logs

- `GET /health` devolve estado tecnico da API.
- Todas as respostas incluem `x-request-id`.
- Logs sao JSON por linha.
- Cookies, tokens e passwords nao devem aparecer nos logs.