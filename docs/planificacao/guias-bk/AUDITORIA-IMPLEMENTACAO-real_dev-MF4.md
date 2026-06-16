# Auditoria de implementacao - real_dev - MF4

## Header

- Data: 2026-06-16
- Projeto: FaithFlix
- Modo: auditar_implementacao
- Implementacao auditada: `real_dev`
- Backend auditado: `real_dev/backend`
- Frontend auditado: `real_dev/frontend`
- MF alvo: `MF4`
- BKs auditados: `BK-MF4-01`, `BK-MF4-02`, `BK-MF4-03`, `BK-MF4-04`, `BK-MF4-05`, `BK-MF4-06`, `BK-MF4-08`
- Estado geral da MF: `PASS_COM_RISCOS`
- Motivo: os contratos funcionais e de seguranca da MF4 estao implementados e foram validados por testes backend, build frontend, smoke tests e E2E/browser MF4 em portas isoladas. O risco restante e operacional: o comando directo `npm run e2e:mf4` reutilizou um processo local estranho em `127.0.0.1:5173`, por causa de `reuseExistingServer: true`, e por isso nao e uma evidencia limpa nesta sessao enquanto esse processo existir.
- Pode avancar para MF5: sim, sem P0/P1/P2 funcionais ativos. Ha uma nota operacional de validacao sobre a porta `5173`.

## Resultado executivo

A MF4 esta substancialmente conforme em `real_dev`: planos, subscricoes, checkout simulado, trial unico, candidaturas, aprovacao/rejeicao, entrada na pool, distribuicao mensal, relatorios, historico privado, CSV, notificacoes internas e preferencias existem com backend/frontend alinhados.

O finding historico `MF4-AUD-P1-001` sobre ativacao direta de subscricao paga continua `JA_CORRIGIDO`: `POST /api/subscriptions/me` nao esta montado, e a ativacao paga passa por `POST /api/payments/simulated-checkout` com resultado `approved`.

A validacao browser MF4 esta coberta e passou em execucao isolada: seed MF4, backend, frontend e Playwright correram em portas dedicadas (`3097`/`5197`) com origem CORS alinhada, e o teste `MF4 cobre subscricao, trial, candidatura, pool, historico e notificacoes` passou 1/1.

O comando canonico `npm run e2e:mf4` nao deve ser contado como `PASS` nesta reauditoria porque, fora do sandbox, reutilizou um servidor local ja aberto em `127.0.0.1:5173` que servia outra aplicacao (`Orelle`). Isto e um bloqueio/contaminacao de ambiente, nao uma falha funcional confirmada da MF4. Apos a mensagem do utilizador a indicar que o processo tinha sido parado, `lsof` ainda mostrava um listener `node` em `127.0.0.1:5173`.

Observacoes sem bloqueio funcional:

- `DRIFT_DOCUMENTAL_CONTROLADO`: `BK-MF4-01` ainda lista `POST /api/subscriptions/me` nos criterios de aceite, mas `BK-MF4-02` substitui a ativacao direta por checkout simulado. A implementacao atual privilegia a regra mais segura: subscricao paga so nasce por `POST /api/payments/simulated-checkout` aprovado, e o teste HTTP confirma `404` na rota direta.
- `RISCO_OPERACIONAL_CONTROLADO`: existe uma URI MongoDB com credenciais num `.env` local dentro de `real_dev/backend`. O ficheiro esta ignorado por Git e nao e codigo versionado; o valor nao foi reproduzido neste relatorio.

## Escopo auditado

### Documentos e relatorios consultados

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `GLOSSARIO-TERMOS-TECNICOS-PAP.md`
- Headers e contratos de BKs anteriores em `docs/planificacao/guias-bk/MF0/`, `MF1/`, `MF2/` e `MF3/`
- Todos os BKs em `docs/planificacao/guias-bk/MF4/`
- `docs/planificacao/guias-bk/MF5/BK-MF5-01-exportacao-dados-utilizador.md` para handoff `MF4 -> MF5`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF4.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF4.md`
- `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md`
- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md` existente antes desta atualizacao

### Pasta auditada e pastas ignoradas

- `real_dev/` foi escolhida porque contem backend e frontend reais com `package.json`, `src`, testes e scripts.
- `backend/` e `frontend/` na raiz foram tratados apenas como referencia historica.
- `mockup/` foi tratado apenas como referencia visual/fluxo, nao como contrato tecnico.
- `real_dev/` estar fora do git nao foi tratado como falha, conforme regra da prompt.

## Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF4-01` | `CONFORME_COM_RISCOS` | Planos, estado de subscricao, cancelamento de renovacao e guard premium existem. `POST /api/subscriptions/me` direto nao esta exposto por coerencia com `BK-MF4-02`; o criterio textual antigo de `BK-MF4-01` fica registado como drift documental controlado. |
| `BK-MF4-02` | `CONFORME` | Checkout simulado, tentativas `payment_attempts`, recusa `402` e trial unico existem. A ativacao paga so ocorre depois de tentativa `approved`. |
| `BK-MF4-03` | `CONFORME` | Candidatura publica valida payload, filtra campos, cria estado `pending` e listagem admin protegida. |
| `BK-MF4-04` | `CONFORME` | Revisao admin exige role, guarda `reviewedBy/reviewedAt`, rejeita com motivo e cria `charities` elegivel apenas quando aprovada. |
| `BK-MF4-05` | `CONFORME` | Distribuicao mensal e rotacao existem, sao idempotentes por mes e excluem trial ao somar apenas subscricoes pagas `active`. |
| `BK-MF4-06` | `CONFORME` | Dashboard, pagina publica, historico privado por membership e CSV existem. Ownership e aplicado antes de devolver historico/CSV. |
| `BK-MF4-08` | `CONFORME` | Notificacoes internas, preferencias, leitura por owner e eventos de subscricao/trial/progresso existem. |

## Rastreabilidade BK -> RF/RNF -> implementacao

| BK | RF/RNF | Evidencia backend | Evidencia frontend/testes |
| --- | --- | --- | --- |
| `BK-MF4-01` | `RF35`, `RF36`, `RF38`, `RF39` | `subscriptions.*`, `subscription-access.middleware.js`, `playback.routes.js` | `subscriptionsApi.js`, `SubscriptionPage.jsx`, `mf4-validation.test.js`, `mf4-http.test.js` |
| `BK-MF4-02` | `RF37`, `RF40`, `RNF17`, `RNF18` | `payments.*`, `trials`, `payment_attempts`, `grantTrialSubscription` | `paymentsApi.js`, `SubscriptionPage.jsx`, testes HTTP de checkout/trial |
| `BK-MF4-03` | `RF41` | `charity-applications.*`, `POST /api/charities/applications` | `charitiesApi.js`, `CharityApplicationPage.jsx` |
| `BK-MF4-04` | `RF42`, `RF43`, `RNF19` | `charity-review.*`, `PATCH /api/charities/applications/:id/review` | `AdminCharityApplicationsPage.jsx` |
| `BK-MF4-05` | `RF44`, `RF45`, `RNF29` | `pool-distribution.*`, `pool_distributions` | `AdminPoolDistributionPage.jsx`, teste de distribuicao/rotacao/idempotencia |
| `BK-MF4-06` | `RF46`, `RF47`, `RF48`, `RNF26` | `charity-reports.*`, `charity_memberships`, CSV | `PublicCharitiesPage.jsx`, `AdminPoolDashboardPage.jsx`, `CharityHistoryPage.jsx`, `AdminCharityMembersPage.jsx` |
| `BK-MF4-08` | `RF52`, `RF53`, `RF54` | `notifications.*`, integracoes em payments/subscriptions/playback | `notificationsApi.js`, `NotificationsPage.jsx`, teste de ownership |

## Contratos consumidos

- `MF1`: Express modular, `apiClient` com `credentials: "include"`, error handler, CORS com origem explicita e logging estruturado.
- `MF2`: sessao por cookie HttpOnly, `req.user.id`, `requireAuth`, `requireRole`, `playbackRouter`, `playback_progress`, `contents`, roles base.
- `MF3`: catalogo publicado, pesquisa, descoberta, ratings, comentarios e recomendacoes continuam separados da monetizacao.

## Contratos entregues

- Colecoes: `subscription_plans`, `subscriptions`, `payment_attempts`, `trials`, `notifications`, `notification_preferences`, `charity_applications`, `charities`, `pool_distributions`, `charity_memberships`.
- Endpoints: `/api/subscriptions/*`, `/api/payments/*`, `/api/notifications/*`, `/api/charities/*`.
- Frontend: `/planos`, `/notificacoes`, `/associacoes`, `/associacoes/candidatura`, `/associacoes/:charityId/historico`, `/admin/associacoes/*`.
- E2E MF4: `e2e:mf4` em `package.json`, `seed:e2e:mf4` em `real_dev/backend/package.json`, seed em `real_dev/backend/scripts/seed-mf4-e2e.js` e spec em `tests/e2e/mf4-flow.spec.js`.
- Handoff `MF5`: dados de subscricao, notificacoes, preferencias, historico privado e CSV podem ser reutilizados por exportacao/privacidade.

## Findings

### P0

Sem findings P0 confirmados.

### P1

Sem findings P1 ativos.

#### `MF4-AUD-P1-001` - Subscricao paga podia ser ativada sem checkout simulado aprovado

- Estado atual: `JA_CORRIGIDO`
- BK/RF/RNF: `BK-MF4-02`, `RF37`; impacto indireto em `BK-MF4-05`, `RF44`
- Expected: subscricao paga deve ser ativada apenas quando o checkout simulado tem resultado `approved`, com tentativa auditavel em `payment_attempts`.
- Observed atual: `real_dev/backend/src/modules/subscriptions/subscriptions.routes.js` expoe apenas `GET /plans`, `GET /me` e `POST /me/cancel-renewal`; nao ha `POST /api/subscriptions/me` para ativacao direta. A ativacao paga ocorre em `payments.service.js`, que regista `payment_attempts` e so chama `activateSubscription` depois de `status: "approved"`.
- Evidencia de teste: `real_dev/backend/tests/integration/mf4-http.test.js` confirma que `POST /api/subscriptions/me` devolve `404` e que checkout aprovado/recusado gera evidencia auditavel.
- Impacto atual: sem impacto ativo confirmado.
- Bloqueia MF: nao.

### P2

Sem findings P2 funcionais ativos.

#### `MF4-AUD-P2-001` - E2E/browser MF4 completo

- Estado funcional: `VALIDADO_ISOLADO`
- Estado do comando canonico nesta sessao: `BLOQUEADO_AMBIENTE`
- BK/RF/RNF: todos os BKs MF4; matriz canonica `RF35..RF48`, `RF52..RF54`; `RNF29`
- Expected: executar fluxo browser MF4 ponta-a-ponta com seed, backend, frontend e MongoDB real/controlado.
- Observed funcional: existe `npm run e2e:mf4`, a seed MF4 e a spec Playwright cobrem checkout aprovado/recusado, trial duplicado, candidatura, aprovacao admin, membership, distribuicao, historico privado, CSV e notificacoes. Em execucao isolada com backend `3097`, frontend `5197`, `VITE_API_BASE_URL=http://127.0.0.1:3097` e `FRONTEND_ORIGIN=http://127.0.0.1:5197`, o Playwright passou 1/1.
- Observed ambiente: o `npm run e2e:mf4` fora do sandbox reutilizou um processo existente em `127.0.0.1:5173`, servido por outra aplicacao, porque `playwright.config.js` usa `reuseExistingServer: true`. A seed concluiu, mas a pagina aberta nao era FaithFlix.
- Impacto atual: sem falha funcional confirmada; ha risco de validacao falsa/contaminada se a porta `5173` estiver ocupada.
- Bloqueia MF: nao, desde que a validacao final use porta limpa ou config isolada.

### P3

Sem findings P3 de implementacao confirmados. A contaminacao da porta `5173` fica registada como observacao operacional de validacao, nao como defeito funcional da MF4.

## Coerencia entre MFs

| Fronteira | Estado | Observacao |
| --- | --- | --- |
| `MF3 -> MF4` | `COERENTE` | MF4 consome `req.user.id`, cookies HttpOnly, playback, catalogo publicado e rotas existentes sem quebrar descoberta, pesquisa, ratings, comentarios ou recomendacoes. |
| `MF4 -> MF5` | `COERENTE` | MF4 entrega subscricoes, notificacoes, preferencias, historico de associacoes, CSV e evidencia E2E/browser isolada para exportacao/privacidade. |

## Seguranca, privacidade e dados

- Sessao: frontend usa `apiClient` com `credentials: "include"` e nao guarda tokens em `localStorage`/`sessionStorage`.
- Cookies: sessao usa `httpOnly`, `sameSite: "lax"` e `secure` em producao.
- CORS: credentials usam origem explicita; em validacoes com portas alternativas, `FRONTEND_ORIGIN` deve acompanhar a porta do frontend.
- Admin: endpoints de candidaturas, distribuicao, dashboard e memberships usam `requireRole(["admin"])`.
- Ownership: notificacoes, subscricoes, trial, playback e historico privado usam `req.user.id` ou membership backend.
- Dados financeiros: nao foram encontrados cartoes reais, CVV, IBAN, Stripe, PayPal, MB Way real, webhooks reais ou tokens financeiros em codigo de produto.
- Logs: logger faz redacao por chaves sensiveis como `password`, `token`, `secret`, `cookie` e `authorization`.
- Drift de dominio: nao foram encontradas referencias a OPSA, StudyFlow, Orelle, fiscalidade, turma, sala ou disciplina em `real_dev`.
- Ambiente local: foi detetada uma URI MongoDB com credenciais apenas em `.env` local ignorado por Git; nao foi reproduzida no relatorio nem tratada como codigo versionado.

## Comandos executados

| Comando | Resultado | Observacao |
| --- | --- | --- |
| `git status --short` | `PASS_COM_NOTA` | Ha ficheiros modificados/untracked ja presentes no workspace de MF4; isto nao foi tratado como falha da implementacao. |
| Pesquisa estatica de seguranca em `real_dev` | `PASS_COM_NOTA` | Falsos positivos: `temporary` em docstrings de trial, README a proibir storage de tokens, `secret` na lista de redacao do logger. |
| Pesquisa de drift OPSA/Orelle/StudyFlow/etc. | `PASS` | Sem ocorrencias em `real_dev`. |
| `node --check real_dev/backend/scripts/seed-mf4-e2e.js` | `PASS` | Seed E2E MF4 sem erro de sintaxe. |
| `node --check tests/e2e/mf4-flow.spec.js` | `PASS` | Spec Playwright MF4 sem erro de sintaxe. |
| `git diff --check` | `PASS` | Sem erros de whitespace nos ficheiros rastreados. |
| `bash scripts/validate-planificacao.sh` | `PASS` | `checked_bks: 55`, `checked_guides: 55`, `errors: []`. |
| `npm --prefix real_dev/backend test` no sandbox | `BLOQUEADO_AMBIENTE` | 20 testes passaram e 18 falharam por `listen EPERM: operation not permitted 127.0.0.1`. |
| `npm --prefix real_dev/backend test` fora do sandbox | `PASS` | 38/38 testes passaram. |
| `npm --prefix real_dev/frontend run build` | `PASS` | Vite build passou; 92 modulos transformados. |
| `npm run smoke` no sandbox | `BLOQUEADO_AMBIENTE` | Smoke backend falhou 8/8 por `listen EPERM: operation not permitted 127.0.0.1`. |
| `npm run smoke` fora do sandbox | `PASS` | Smoke backend passou 8/8 e smoke frontend executou `vite build` com 92 modulos transformados. |
| `./node_modules/.bin/playwright test tests/e2e/mf4-flow.spec.js --list` | `PASS` | Playwright descobriu 1 teste MF4. |
| `npm run e2e:mf4` no sandbox | `BLOQUEADO_AMBIENTE` | Seed tentou usar o Atlas do `.env`, mas DNS/network do sandbox falhou com `querySrv ECONNREFUSED`. |
| `npm run e2e:mf4` fora do sandbox | `BLOQUEADO_AMBIENTE` | Seed MF4 concluiu; Playwright reutilizou `127.0.0.1:5173`, onde estava outra app, e abriu a UI errada. |
| `lsof -nP -iTCP:5173 -sTCP:LISTEN` | `BLOQUEADO_AMBIENTE` | Confirmou `node` em `127.0.0.1:5173` durante a reauditoria. |
| E2E isolado com config temporaria em `/private/tmp` | `PASS` | Seed MF4 concluiu; backend `3097` e frontend `5197`; CORS alinhado; Playwright passou 1/1. |

## Ficheiros auditados principais

- `real_dev/backend/src/app.js`
- `real_dev/backend/src/server.js`
- `real_dev/backend/src/config/cors.js`
- `real_dev/backend/src/modules/subscriptions/*`
- `real_dev/backend/src/modules/payments/*`
- `real_dev/backend/src/modules/charities/*`
- `real_dev/backend/src/modules/notifications/*`
- `real_dev/backend/src/modules/playback/playback.routes.js`
- `real_dev/backend/src/modules/playback/playback.service.js`
- `real_dev/backend/tests/unit/mf4-validation.test.js`
- `real_dev/backend/tests/integration/mf4-http.test.js`
- `real_dev/backend/scripts/seed-mf4-e2e.js`
- `real_dev/frontend/src/services/api/subscriptionsApi.js`
- `real_dev/frontend/src/services/api/paymentsApi.js`
- `real_dev/frontend/src/services/api/charitiesApi.js`
- `real_dev/frontend/src/services/api/notificationsApi.js`
- `real_dev/frontend/src/pages/SubscriptionPage.jsx`
- `real_dev/frontend/src/pages/NotificationsPage.jsx`
- `real_dev/frontend/src/pages/CharityApplicationPage.jsx`
- `real_dev/frontend/src/pages/PublicCharitiesPage.jsx`
- `real_dev/frontend/src/pages/AdminCharityApplicationsPage.jsx`
- `real_dev/frontend/src/pages/AdminPoolDistributionPage.jsx`
- `real_dev/frontend/src/pages/AdminPoolDashboardPage.jsx`
- `real_dev/frontend/src/pages/CharityHistoryPage.jsx`
- `real_dev/frontend/src/pages/AdminCharityMembersPage.jsx`
- `real_dev/frontend/src/routes/AppRoutes.jsx`
- `tests/e2e/mf4-flow.spec.js`
- `package.json`
- `playwright.config.js`

## Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF4.md`

Nota: foi usada uma config Playwright temporaria em `/private/tmp/faithflix-mf4-playwright.config.js` para validar o fluxo em portas limpas. Nao e ficheiro do repositorio.

## Blockers e TODOs

- Sem blockers funcionais ativos para MF4.
- Bloqueio operacional: o comando directo `npm run e2e:mf4` so deve ser repetido como evidencia final depois de libertar `127.0.0.1:5173` ou depois de usar uma configuracao Playwright que force portas dedicadas e `reuseExistingServer: false`.
- Nota operacional: no sandbox atual, `npm run e2e:mf4` continua dependente de permissao fora da sandbox por causa de DNS/network para MongoDB Atlas e portas locais.
- `TODO`: se o gate docente fechar MF4, atualizar tracking canonico noutro pedido, porque esta execucao nao altera BKs/backlogs/matrizes.

## Recomendacao de proxima acao

Para regressao normal, libertar a porta `5173` e correr:

```bash
npm run e2e:mf4
```

Para regressao mais robusta/CI, considerar ajustar a configuracao Playwright para nao reutilizar servidores existentes quando o objectivo for uma evidencia limpa da MF4.
