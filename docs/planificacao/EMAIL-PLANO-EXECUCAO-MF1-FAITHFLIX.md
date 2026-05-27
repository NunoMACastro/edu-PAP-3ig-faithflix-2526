# Plano de Execução - MF1 FaithFlix

Snapshot do backlog: `2026-05-25` (`faithflix/docs/planificacao/backlogs/BACKLOG-MVP.md`).

Guias MF1 refinados: `2026-05-27` (`faithflix/docs/planificacao/guias-bk/MF1/`).

## 1) Contexto principal

A `MF1` da FaithFlix é a primeira fase de **implementação técnica real**.

A `MF0` foi apenas kickoff/governance. A partir da `MF1`, a equipa já cria ficheiros, pastas, scripts, backend, frontend, cliente API, sessão base, health-check, logging e smoke tests.

Nesta macro entram:

- estrutura base backend por módulos;
- estrutura base frontend por componentes;
- cliente API frontend com tratamento de erro;
- sessão segura backend com cookies `HttpOnly`;
- health-check e logging estruturado;
- smoke tests FE/BE.

Não entram ainda:

- registo funcional;
- login funcional;
- recuperação de password;
- base de dados real;
- catálogo;
- streaming/player;
- subscrições;
- pagamentos;
- pool solidária;
- funcionalidades finais de produto.

Esses temas começam na `MF2` e macros seguintes. A `MF1` serve para construir uma base técnica simples, limpa, executável e testável.

Stack assumida nos guias:

- backend: Node.js LTS + Express + JavaScript moderno em ES Modules;
- frontend: React + Vite + JavaScript moderno;
- chamadas HTTP frontend: `fetch` nativo centralizado em `apiClient`;
- sessão: cookies `HttpOnly`, `Secure` em produção e `SameSite`;
- testes backend: `node:test`;
- smoke frontend inicial: `npm run build`.

Nota importante:

`docs/RNF.md` sugere Next.js/Axios como stack possível, mas os guias da `MF1` assumem React + Vite + fetch por simplicidade pedagógica. Antes de executar, confirmar comigo se esta decisão fica fechada ou se querem adaptar para Next.js.

---

## 2) BKs da MF1

Macro: `MF1 - Fundação técnica`

Sprints:

- `Sprint 1`: `BK-MF1-01`, `BK-MF1-02`
- `Sprint 2`: `BK-MF1-03`, `BK-MF1-04`, `BK-MF1-05`, `BK-MF1-06`

| BK          | Título                                      | Owner   | Apoio   | Pri | Esforço | Dependências             | RF/RNF       | Sprint | Próximo BK  |
| ----------- | ------------------------------------------- | ------- | ------- | --- | ------- | ------------------------ | ------------ | ------ | ----------- |
| `BK-MF1-01` | Estrutura base backend por módulos          | Matheus | Davi    | P0  | M       | `BK-MF0-06`              | RNF27        | S01    | `BK-MF1-02` |
| `BK-MF1-02` | Estrutura base frontend por componentes     | Mateus  | Kaue    | P0  | M       | `BK-MF0-06`              | RNF28        | S01    | `BK-MF1-03` |
| `BK-MF1-03` | Cliente API frontend com tratamento de erro | Mateus  | Matheus | P0  | M       | `BK-MF1-02`              | RNF05, RNF30 | S02    | `BK-MF1-04` |
| `BK-MF1-04` | Sessão segura backend: cookies e auth base  | Matheus | Kaue    | P0  | M       | `BK-MF1-01`              | RNF13, RNF15 | S02    | `BK-MF1-05` |
| `BK-MF1-05` | Health-check e logging estruturado          | Kaue    | Davi    | P1  | S       | `BK-MF1-01`              | RNF31        | S02    | `BK-MF1-06` |
| `BK-MF1-06` | Smoke tests FE/BE                           | Kaue    | Mateus  | P1  | M       | `BK-MF1-03`, `BK-MF1-04` | RNF29        | S02    | `BK-MF2-01` |

Regra de negativos:

- `P0`: pelo menos `3` negativos;
- `P1`: pelo menos `3` negativos;
- `P2`: pelo menos `1` negativo.

---

## 3) Regra principal obrigatória

Antes de começar qualquer BK:

1. Ler o guia completo do BK.
2. Confirmar `owner`, `apoio`, `prioridade`, `estado`, `esforço`, `dependências`, `rf_rnf`, `sprint`, `core_or_reforco`, `proximo_bk` e `guia_path`.
3. Confirmar se a dependência está fechada.
4. Confirmar se já existe código real para não sobrescrever trabalho anterior.
5. Perceber o que entra e o que fica fora do BK.
6. Conseguir explicar o plano de implementação em 2-3 frases.
7. Só depois do meu OK é que podem começar.

Nenhum BK pode ficar `DONE` sem:

- smoke;
- negativos;
- validação técnica;
- evidence `pr`, `proof`, `neg`;
- lista de ficheiros alterados;
- comandos executados;
- validação de planificação sem drift.

---

## 4) Dados e variáveis de ambiente

Na `MF1`, ainda não deve existir base de dados real.

Usar apenas `.env` local quando necessário para configuração técnica:

Backend:

- `PORT`;
- `NODE_ENV`;
- `SERVICE_NAME`;
- `SESSION_COOKIE_NAME`, a partir do `BK-MF1-04`.

Frontend:

- `VITE_API_BASE_URL`, a partir do `BK-MF1-03`.

Antes de commit:

```bash
git status
```

Confirmar:

- `.env` não está staged;
- `.env.example` não tem segredos;
- não há tokens, cookies reais, passwords ou URIs privadas;
- logs/evidence não expõem cookies, headers sensíveis, stack traces ou dados pessoais;
- não foram criadas credenciais falsas "temporárias" dentro do código.

Nota:

- MongoDB Atlas está referido nos RNF como opção de base de dados, mas não entra nesta macro.
- Hash de passwords também não entra na `MF1`; entra quando a autenticação funcional for implementada.

---

## 5) Ordem de execução

0. Fazer refresh de tabs GitHub/IDE abertas.
1. Ler `faithflix/docs/planificacao/README.md`.
2. Confirmar a hierarquia canónica:
    - `docs/RF.md`;
    - `docs/RNF.md`;
    - `BACKLOG-MVP.md`;
    - `PLANO-SPRINTS.md`;
    - `MATRIZ-CANONICA-BK.md`;
    - `MF-VIEWS.md`;
    - `guias-bk/*`.
3. Abrir `faithflix/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`.
4. Confirmar que a fundação técnica começa na `MF1`.
5. Abrir `faithflix/docs/planificacao/backlogs/MF-VIEWS.md`.
6. Confirmar sequência:
    - `BK-MF1-01`;
    - `BK-MF1-02`;
    - `BK-MF1-03`;
    - `BK-MF1-04`;
    - `BK-MF1-05`;
    - `BK-MF1-06`.
7. Abrir `faithflix/docs/planificacao/backlogs/BACKLOG-MVP.md`.
8. Confirmar estado, dependências, owner, apoio, prioridade, esforço e RF/RNF.
9. Abrir o guia específico do BK em `faithflix/docs/planificacao/guias-bk/MF1/`.
10. Validar o scope-out antes de escrever código.
11. Criar branch pequena por BK.
12. Implementar em ciclos curtos.
13. Validar smoke + negativos.
14. Preencher evidence.
15. Correr validação documental:

```bash
bash scripts/validate-planificacao.sh
```

---

## 6) SSOT mínimo da MF1

Ler apenas as partes relevantes:

- `faithflix/docs/RNF.md`
    - `RNF05`: mensagens claras em português de Portugal;
    - `RNF13`: HTTPS/TLS;
    - `RNF15`: sessões com cookies `HttpOnly`, `Secure`, `SameSite`;
    - `RNF17`: segredos apenas em variáveis de ambiente;
    - `RNF27`: backend modular por domínio;
    - `RNF28`: frontend organizado em componentes reutilizáveis;
    - `RNF29`: testes automatizados;
    - `RNF30`: logs estruturados;
    - `RNF31`: health-check.

- `faithflix/docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
    - macro fases;
    - nota anti-drift sobre `MF0`;
    - `MF1 - Fundação técnica`;
    - regras transversais;
    - gates.

- `faithflix/docs/planificacao/backlogs/BACKLOG-MVP.md`
    - linhas `BK-MF1-01..BK-MF1-06`;
    - contrato pedagógico v3;
    - contrato de qualidade e validação.

- `faithflix/docs/planificacao/backlogs/MF-VIEWS.md`
    - `## MF1 - Fundacao tecnica`.

- `faithflix/docs/planificacao/sprints/PLANO-SPRINTS.md`
    - `Sprint 1`;
    - `Sprint 2`;
    - limite de carga `<= 11`;
    - checkpoints semanais;
    - gates `S4/S8/S12`.

- `faithflix/docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
    - matriz por área funcional;
    - ownership;
    - handoff P0;
    - pairing semanal.

- Guias específicos:
    - `BK-MF1-01-estrutura-base-backend-modulos.md`;
    - `BK-MF1-02-estrutura-base-frontend-componentes.md`;
    - `BK-MF1-03-cliente-api-frontend-tratamento-erro.md`;
    - `BK-MF1-04-sessao-segura-backend-cookies-auth-base.md`;
    - `BK-MF1-05-health-check-e-logging-estruturado.md`;
    - `BK-MF1-06-smoke-tests-fe-be.md`.

---

## 7) Validação por BK

### `BK-MF1-01` - Estrutura base backend por módulos

Owner: `Matheus`  
Apoio: `Davi`  
Dependência: `BK-MF0-06`  
Ref.: `RNF27`

Scope:

- criar `backend/`;
- configurar Node.js com ES Modules;
- criar Express mínimo;
- separar `server.js`, `app.js`, `config`, `modules`, `middlewares`;
- criar módulo técnico `system`;
- expor `GET /api`;
- criar 404 e error handler JSON;
- documentar comandos em `backend/README.md`.

Fora de scope:

- autenticação real;
- base de dados;
- catálogo;
- streaming;
- pagamentos;
- funcionalidades de produto.

Smoke:

- `backend/package.json` existe com `type: module`;
- `npm run dev` arranca sem erro;
- `GET /api` responde `200` com JSON;
- `backend/README.md` explica comandos e estrutura.

Negativos:

- `GET /api/nao-existe` => `404` JSON;
- JSON malformado para rota com body => erro JSON controlado;
- `PORT=abc` => falha clara ou validação explícita, sem comportamento silencioso.

Ficheiros esperados:

- `backend/package.json`;
- `backend/README.md`;
- `backend/.env.example`;
- `backend/src/server.js`;
- `backend/src/app.js`;
- `backend/src/config/env.js`;
- `backend/src/modules/system/system.routes.js`;
- `backend/src/modules/system/system.controller.js`;
- `backend/src/middlewares/error.middleware.js`;
- `backend/src/utils/http-error.js`.

Comandos/evidence:

```bash
npm install
npm run dev
curl -i http://localhost:3000/api
curl -i http://localhost:3000/api/nao-existe
```

Bloqueio:

- se já existir backend real fora deste caminho, parar e adaptar sem sobrescrever.

### `BK-MF1-02` - Estrutura base frontend por componentes

Owner: `Mateus`  
Apoio: `Kaue`  
Dependência: `BK-MF0-06`  
Ref.: `RNF28`

Scope:

- criar `frontend/` com React + Vite;
- definir rotas principais;
- criar layout principal com header, main e footer;
- criar componentes base;
- criar tokens visuais simples;
- criar páginas placeholder controladas;
- preparar `services/api/` para `BK-MF1-03`.

Rotas de referência:

- `/`;
- `/login`;
- `/catalogo`;
- `/instituicoes`;
- `/planos`;
- `/minha-conta`;
- `/notificacoes`;
- `/busca`;
- rota 404.

Fora de scope:

- login funcional;
- catálogo real;
- favoritos;
- histórico;
- streaming;
- player;
- pagamentos;
- dados inventados de filmes/utilizadores.

Smoke:

- `npm run dev` abre o frontend;
- `npm run build` termina sem erros;
- rotas principais renderizam placeholders;
- header e footer aparecem nas páginas.

Negativos:

- abrir `/rota-errada` => página 404 controlada;
- procurar dados reais de catálogo nos placeholders => não existem dados inventados;
- navegar só com teclado => foco visível e links acessíveis.

Ficheiros esperados:

- `frontend/package.json`;
- `frontend/index.html`;
- `frontend/src/main.jsx`;
- `frontend/src/App.jsx`;
- `frontend/src/routes/AppRoutes.jsx`;
- `frontend/src/layouts/AppLayout.jsx`;
- `frontend/src/components/ui/`;
- `frontend/src/pages/`;
- `frontend/src/styles/tokens.css`;
- `frontend/src/styles/global.css`.

Comandos/evidence:

```bash
npm install
npm run dev
npm run build
```

Screenshots:

- home;
- catálogo placeholder;
- login placeholder;
-   404.

Bloqueio:

- se já existir frontend real, parar e adaptar sem sobrescrever.

### `BK-MF1-03` - Cliente API frontend com tratamento de erro

Owner: `Mateus`  
Apoio: `Matheus`  
Dependência: `BK-MF1-02`  
Ref.: `RNF05`, `RNF30`

Scope:

- criar cliente API centralizado;
- usar `fetch` nativo;
- usar `credentials: 'include'`;
- criar `ApiError`;
- normalizar erros `401`, `404`, `500`, rede indisponível e JSON inválido;
- criar `VITE_API_BASE_URL`;
- criar `systemApi.getApiInfo()` para `GET /api`;
- criar componente técnico simples para estado da API, sem transformar a home num painel de diagnóstico.

Fora de scope:

- login;
- registo;
- refresh token;
- JWT em `localStorage`;
- endpoints de negócio;
- mocks permanentes.

Smoke:

- `npm run build` no frontend passa;
- `apiClient.get('/api')` funciona quando backend está ligado;
- backend desligado mostra mensagem amigável;
- todos os pedidos usam `credentials: 'include'`.

Negativos:

- backend desligado => mensagem "Não foi possível ligar ao servidor";
- endpoint inexistente => mensagem 404 controlada;
- resposta sem JSON válido => `ApiError` controlado.

Ficheiros esperados:

- `frontend/src/services/api/apiClient.js`;
- `frontend/src/services/api/apiErrors.js`;
- `frontend/src/services/api/systemApi.js`;
- `frontend/src/config/env.js`;
- `frontend/src/components/system/ApiStatusBadge.jsx`;
- `frontend/.env.example`.

Comandos/evidence:

```bash
npm run build
npm run dev
```

Bloqueios:

- se o frontend ainda não existir, executar `BK-MF1-02` primeiro;
- confirmar se fica `fetch` nativo ou Axios.

### `BK-MF1-04` - Sessão segura backend

Owner: `Matheus`  
Apoio: `Kaue`  
Dependência: `BK-MF1-01`  
Ref.: `RNF13`, `RNF15`

Scope:

- configurar nome e flags do cookie de sessão;
- criar `getSessionCookieOptions()`;
- criar utilitário de leitura de cookies;
- criar middleware `attachSession`;
- criar service base de sessão sem persistência;
- criar `GET /api/session/me`;
- criar `POST /api/session/logout`;
- documentar contrato para login futuro.

Fora de scope:

- registo;
- login com email/password;
- hashing de passwords;
- base de dados de sessões;
- roles;
- CSRF completo.

Smoke:

- backend arranca;
- `GET /api/session/me` responde `401` sem cookie;
- `POST /api/session/logout` responde sucesso/idempotente;
- configuração de cookie está centralizada.

Negativos:

- sem cookie em `/api/session/me` => `401` JSON;
- cookie falso `faithflix_session=falso` => `401` JSON;
- simular `NODE_ENV=production` => cookie com `secure: true`.

Ficheiros esperados:

- `backend/src/config/session.js`;
- `backend/src/utils/cookies.js`;
- `backend/src/middlewares/session.middleware.js`;
- `backend/src/modules/auth/auth.routes.js`;
- `backend/src/modules/auth/session.controller.js`;
- `backend/src/modules/auth/session.service.js`;
- `backend/src/app.js`;
- `backend/.env.example`;
- `backend/README.md`.

Comandos/evidence:

```bash
npm run dev
curl -i http://localhost:3000/api/session/me
curl -i --cookie "faithflix_session=falso" http://localhost:3000/api/session/me
```

Bloqueios:

- se o deploy final não suportar HTTPS, `RNF13/RNF15` ficam bloqueados para produção;
- não criar utilizador fake autenticado.

### `BK-MF1-05` - Health-check e logging estruturado

Owner: `Kaue`  
Apoio: `Davi`  
Dependência: `BK-MF1-01`  
Ref.: `RNF31`

Scope:

- criar `GET /health`;
- criar service/controller/route de health;
- criar logger JSON simples;
- criar níveis `info`, `warn`, `error`;
- criar request id por pedido;
- devolver header `x-request-id`;
- criar middleware de request logging;
- integrar logger no error handler.

Fora de scope:

- Prometheus;
- Grafana;
- Sentry;
- Datadog;
- métricas formais;
- tracing distribuído;
- logs de auditoria funcional.

Smoke:

- `GET /health` responde `200` JSON;
- resposta inclui ou permite correlacionar `x-request-id`;
- pedido normal gera log `info`;
- erro/404 gera log com contexto.

Negativos:

- `GET /api/nao-existe` => `404` JSON + log estruturado;
- cookie falso numa rota de sessão => log sem valor do cookie;
- procurar checks de BD/pagamento no health => não existem enquanto esses serviços não existem.

Ficheiros esperados:

- `backend/src/modules/system/health.routes.js`;
- `backend/src/modules/system/health.controller.js`;
- `backend/src/modules/system/health.service.js`;
- `backend/src/utils/logger.js`;
- `backend/src/middlewares/request-logger.middleware.js`;
- `backend/src/middlewares/error.middleware.js`;
- `backend/src/app.js`;
- `backend/README.md`.

Comandos/evidence:

```bash
npm run dev
curl -i http://localhost:3000/health
curl -i http://localhost:3000/api/nao-existe
```

Bloqueios:

- se o ambiente de produção não permitir ler logs, planear alternativa antes da defesa;
- não logar cookies, passwords, tokens ou headers sensíveis.

### `BK-MF1-06` - Smoke tests FE/BE

Owner: `Kaue`  
Apoio: `Mateus`  
Dependências: `BK-MF1-03`, `BK-MF1-04`  
Ref.: `RNF29`

Scope:

- criar smoke tests backend com `node:test`;
- testar `/health`, `/api`, 404 e sessão base;
- testar cookie ausente e cookie falso;
- criar helper de servidor em porta livre;
- definir smoke frontend com `npm run build`;
- criar scripts `smoke:backend`, `smoke:frontend` e, se fizer sentido, `smoke` agregado;
- preparar evidence final da `MF1`.

Fora de scope:

- E2E completo;
- Playwright/Cypress por defeito;
- login real;
- catálogo;
- streaming;
- subscrições;
- dados seed reais.

Smoke:

- `npm --prefix backend run smoke` passa;
- `npm --prefix frontend run smoke` ou `npm --prefix frontend run build` passa;
- comando agregado passa, se existir;
- evidence regista outputs.

Negativos:

- `GET /api/nao-existe` => `404` JSON;
- `GET /api/session/me` sem cookie => `401` JSON;
- `GET /api/session/me` com cookie falso => `401` JSON.

Ficheiros esperados:

- `backend/tests/smoke/app.smoke.test.js`;
- `backend/tests/helpers/test-server.js`;
- `backend/package.json`;
- `frontend/package.json`;
- `package.json` opcional na raiz;
- `docs/evidence/MF1/README.md`, se a equipa usar evidence em ficheiro.

Comandos/evidence:

```bash
npm --prefix backend run smoke
npm --prefix frontend run build
npm run smoke
```

Bloqueios:

- se `BK-MF1-03` ou `BK-MF1-04` não estiverem executados, não fechar este BK como validado;
- não usar `|| true` nem comandos que escondam falhas.

---

## 8) Entregáveis mínimos no PR

Cada PR deve incluir:

- implementação completa do BK sem desvio ao guia;
- PR pequeno e focado;
- evidence preenchida:
    - `pr`;
    - `proof`;
    - `neg`;
    - `files`;
    - `commands`;
    - `screenshots`, quando houver UI;
    - `notes`, quando houver decisão técnica ou bloqueio.
- smoke executado;
- negativos executados;
- `.env` fora do commit;
- `.env.example` sem segredos;
- sem drift de `bk_id`, owner, apoio, prioridade, dependências ou RF/RNF;
- validação documental:

```bash
bash scripts/validate-planificacao.sh
```

Comandos por área:

Backend:

```bash
npm --prefix backend run dev
npm --prefix backend run smoke
```

Frontend:

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
```

Smoke agregado, se existir:

```bash
npm run smoke
```

---

## 9) Naming de branch recomendado

Matheus:

- `feat/bk-mf1-01-backend-modular-matheus`
- `feat/bk-mf1-04-sessao-segura-matheus`

Mateus:

- `feat/bk-mf1-02-frontend-componentes-mateus`
- `feat/bk-mf1-03-api-client-mateus`

Kaue:

- `feat/bk-mf1-05-health-logging-kaue`
- `feat/bk-mf1-06-smoke-tests-kaue`

Davi, como apoio:

- colaborar nos PRs de backend/logging;
- rever estrutura modular;
- ajudar na evidence e handoff quando indicado.

Como criar branch:

```bash
git checkout -b feat/bk-mf1-01-backend-modular-matheus
```

Isto cria e muda para a branch.
Depois de implementar, criar PR para `main` e preencher evidence.

Para criar um PR:

1. Push da branch local para remoto:

```bash
git push origin feat/bk-mf1-01-backend-modular-matheus
```

2. Ir ao GitHub, abrir PR da branch para `main`.
3. Preencher título, descrição e evidence.
4. Criar Pull Request.

---

## 10) Handoff para MF2

A `MF1` termina quando:

- backend arranca;
- frontend arranca e faz build;
- `GET /api` responde;
- `GET /health` responde;
- `GET /api/session/me` rejeita anónimo com `401`;
- cookie falso não autentica;
- cliente API trata sucesso, erro de rede, 404 e JSON inválido;
- logs não expõem dados sensíveis;
- smoke FE/BE passa;
- evidence está completa;
- `bash scripts/validate-planificacao.sh` passa.

Primeiro BK da `MF2`:

- `BK-MF2-01` - Registo, login e recuperação de password
    - Owner: `Matheus`
    - Apoio: `Mateus`
    - Dependência: `BK-MF1-04`

Nota:

O `BK-MF2-01` só deve arrancar quando a sessão base da `MF1` estiver validada e os smoke tests não estiverem vermelhos.

---

## 11) Se bloquearem mais de 45 minutos

Mandar-me:

1. 2-3 frases sobre o problema.
2. erro/log relevante sem dados sensíveis.
3. o que já tentaram.
4. path + heading do SSOT que está a causar dúvida.
5. BK, branch e ficheiros afetados.

Se o bloqueio envolver stack final, estrutura real já existente, HTTPS/cookies, logging ou scripts de smoke, não improvisar no PR. Marcar como `TODO/BLOCKER` e pedir validação.
