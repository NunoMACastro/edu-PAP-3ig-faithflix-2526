# Evidence BK-MF6-04 - Performance critica

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-22`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: medições locais de 2026-06-22; não provam performance, streaming ou carga atuais

- Owner: Davi
- Apoio: Mateus
- Data: 2026-06-22 Europe/Lisbon
- Requisitos: RNF09, RNF10, RNF11, RNF12
- Ambiente: macOS local, Node.js v24.11.1, backend FaithFlix em `real_dev/backend`, frontend FaithFlix em `real_dev/frontend`
- Estado da evidence: `PASS`

> **Snapshot histórico de 2026-06-22:** medições e decisão preservadas sem
> reexecução. Não provam RNF08, RNF10, streaming real ou performance atual.

## Comandos executados

| Comando | Resultado |
| --- | --- |
| `node --check scripts/measure-performance-baseline.mjs` em `real_dev/backend` | PASS |
| `node scripts/measure-performance-baseline.mjs` em `real_dev/backend` sem cookie | PASS_NEGATIVO: falhou com mensagem controlada para definir `FAITHFLIX_SESSION_COOKIE` |
| `npm --prefix real_dev/backend run seed:e2e` dentro da sandbox | BLOQUEADO_AMBIENTE_HISTORICO: DNS do MongoDB Atlas bloqueado com `querySrv ECONNREFUSED` |
| `npm --prefix real_dev/backend run seed:e2e` fora da sandbox | PASS: seed MF2 E2E concluido para `e2e@faithflix.test` |
| `npm --prefix real_dev/backend start` fora da sandbox | PASS: API arrancou em `127.0.0.1:3000` |
| `POST /api/auth/login` com o utilizador E2E fora da sandbox | PASS: HTTP 200 e cookie guardado localmente sem registar o valor |
| `FAITHFLIX_API_BASE_URL=http://127.0.0.1:3000 FAITHFLIX_SESSION_COOKIE=*** node scripts/measure-performance-baseline.mjs` em `real_dev/backend` fora da sandbox | PASS: baseline real dentro dos limites |
| `node --test tests/regression/mf6-backend-regression.test.js` em `real_dev/backend` | PASS: 6/6 |
| `npm --prefix real_dev/backend run smoke` fora da sandbox | PASS: 8/8, incluindo `GET /api/catalog?limit=100 -> 400` |
| `npm --prefix real_dev/backend test` fora da sandbox | PASS: 49/49 |
| `node scripts/check-security-baseline.mjs` em `real_dev/backend` | PASS: `Hardening MF6: PASS` |
| `node scripts/check-frontend-regression.mjs` em `real_dev/frontend` | PASS: `Regressao frontend MF6: PASS` |
| `npm --prefix real_dev/frontend run build` | PASS: Vite build, 100 modulos transformados, 561 ms |

## Baseline local

| Cenario | Limite | Before | After | Estado real |
| --- | --- | ---: | ---: | --- |
| `/health` | 500ms | NAO_MEDIDO | 2ms | PASS |
| `/api/catalog?limit=12` | 2000ms | NAO_MEDIDO | 38ms | PASS |
| `/api/search?q=fe&limit=12` | 2000ms | NAO_MEDIDO | 159ms | PASS |
| `/api/recommendations/me` | 3000ms | NAO_MEDIDO | 235ms | PASS |
| 20 pedidos concorrentes a `/health` - P95 | 2000ms | NAO_MEDIDO | 7ms | PASS |

## Negativos

| Cenario | Resultado esperado | Resultado real |
| --- | --- | --- |
| Script sem cookie de sessao | Falha antes de medir recomendacoes autenticadas | PASS_NEGATIVO: `Define FAITHFLIX_SESSION_COOKIE=faithflix_session=...` |
| API inacessivel ou DNS bloqueado na sandbox | Script/seed falha sem declarar sucesso falso | PASS_NEGATIVO_HISTORICO: seed na sandbox falhou com `querySrv ECONNREFUSED`; a execucao valida foi repetida fora da sandbox |
| Pesquisa com uma letra | HTTP 400 | PASS: smoke fora da sandbox validou `GET /api/search?q=f -> 400` |
| Limite de catalogo invalido | HTTP 400 | PASS: smoke fora da sandbox validou `GET /api/catalog?limit=100 -> 400`; teste de regressao tambem valida `listPublishedCatalog({ limit: "100" })` |
| Recomendacoes sem sessao | HTTP 401 | PASS: smoke fora da sandbox validou `GET /api/recommendations/me -> 401` |

## Observacoes

- O cookie de sessao foi sempre mascarado como `FAITHFLIX_SESSION_COOKIE=***`.
- O valor real do cookie nao foi registado neste ficheiro.
- A coluna `Before` fica como `NAO_MEDIDO` porque nao existia uma baseline anterior executada com API, MongoDB e sessao reais antes da correcao ambiental do carregamento de `.env`.
- A coluna `After` contem os valores reais registados pelo medidor local depois de seed, API e login real.
- A rajada concorrente local apoia RNF10, mas nao substitui teste de carga de producao com 100 utilizadores reais.
- A implementacao de codigo ficou validada por testes de unidade/regressao, smoke HTTP com DB controlada, suite backend completa fora da sandbox, hardening backend, regressao frontend e build frontend.
