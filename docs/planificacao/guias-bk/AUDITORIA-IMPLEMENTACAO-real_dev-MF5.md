# Auditoria de implementacao - real_dev - MF5

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: adendos de privacidade/admin locais de 2026-07-10 e snapshot MF5 delimitado

## Adendo pós-correção Fase 5 - privacidade e administração (2026-07-10)

Este adendo preserva o corpo histórico e não promove o estado dos BKs dos
alunos. Na referência privada atual, exportação e consentimentos cancelam pedidos
no unmount, impedem dupla submissão e ignoram respostas antigas; consentimentos
revertem integralmente para o último snapshot confirmado quando a escrita falha.
`AccountPage` não converte limite parental vazio em zero e valida um inteiro real
0-18 antes do backend repetir a validação sem coerções.

Utilizadores e candidaturas devolvem metadata paginada, `limit <= 50` e ordem
estável. A UI de utilizadores confirma papel/estado, repõe o select ao cancelar,
bloqueia apenas a linha ativa e traduz papéis/estados para PT-PT. Métricas e
dashboard da pool têm leituras canceláveis/retry; integrações confirmam alterações,
usam busy por linha e mantêm `publicConfig` sem segredos.

Prova local acumulada atual: backend `191/191`; frontend `45` ficheiros/`164`
testes, lint/build verdes; Axe `13/13` incluiu `/conta`, `/notificacoes` e
`/admin/utilizadores`. Isto não substitui E2E administrativo completo, DB real ou
o snapshot histórico abaixo.

## Adendo pos-correcao Fase 3 administrativa - 2026-07-10

O corpo abaixo preserva a auditoria de 2026-06-18. O contrato atual de
`PATCH /api/users/:id/admin` é mais forte: update, revogação de todas as sessões
no bloqueio e `user.admin_update` fazem commit/rollback juntos; o controller
propaga `requestId`; snapshots do audit são sanitizados. Auto-bloqueio e
autodespromoção continuam recusados e a remoção do último admin ativo devolve
`409 LAST_ACTIVE_ADMIN`, incluindo sob duas remoções concorrentes.

`node --test tests/unit/f3-admin-transactions.test.js tests/unit/mf5-validation.test.js`
em `real_dev/backend` passou `14/14` em 2026-07-10, sem DB/rede. A topologia
transacional MongoDB real continua por validar separadamente.

## Snapshot histórico — auditoria MF5 observada em 2026-06-18

A partir desta fronteira, ficam preservados os resultados e comandos da
auditoria original; não constituem prova atual.

## Header

- Data local: `2026-06-18` (`Europe/Lisbon`)
- Projeto: `FaithFlix`
- Modo executado: `auditar_implementacao`
- Implementacao auditada: `real_dev`
- Backend auditado: `real_dev/backend`
- Frontend auditado: `real_dev/frontend`
- MF alvo: `MF5 - Operacao e privacidade`
- BKs auditados: `BK-MF5-01`, `BK-MF5-02`, `BK-MF5-03`, `BK-MF5-04`, `BK-MF5-05`, `BK-MF5-06`
- Estado geral da MF: `PASS`
- Pode avancar para `MF6`: sim, com os testes atuais como baseline para regressao/hardening.
- Commits/push: nao executados.

## Resultado executivo

A MF5 esta conforme no codigo real auditado. A auditoria anterior identificava findings `P1` e `P2`, mas o estado atual do codigo confirma que esses problemas foram corrigidos: a ativacao direta de subscricao paga esta indisponivel, contas `blocked`/`deleted` deixam de autenticar, a rota legacy de role delega no fluxo auditado, metricas usam `totalPoolCents` e `publicConfig` rejeita padroes de segredo.

Nao foram confirmados findings `P0`, `P1`, `P2` ou `P3` nesta execucao. As observacoes residuais ficam para MF6 como trabalho natural de regressao/hardening, nao como bloqueio de MF5.

## Escopo e fontes consultadas

Foram consultados:

- prompt ativa da execucao;
- `README.md`, `docs/RF.md`, `docs/RNF.md`;
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`;
- `docs/planificacao/backlogs/BACKLOG-MVP.md`;
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`;
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`;
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`;
- `docs/planificacao/backlogs/MF-VIEWS.md`;
- `docs/planificacao/sprints/PLANO-SPRINTS.md`;
- guias `docs/planificacao/guias-bk/MF5/*.md`;
- BKs de fronteira MF4 e MF6 conforme necessario;
- relatorios `IMPLEMENTACAO-REAL_DEV-MF5.md`, auditoria anterior e correcao MF5;
- codigo real em `real_dev/backend` e `real_dev/frontend`.

Pasta auditada: `real_dev`, porque contem `backend/package.json`, `frontend/package.json`, codigo `src`, testes e scripts reais. Pastas `backend/`, `frontend/`, `apps/`, `server/` e `client/` da raiz foram tratadas apenas como referencia auxiliar. `mockup/` nao foi usado como contrato tecnico.

## Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF5-01` | `CONFORME` | `GET /api/privacy/export` esta protegido por `requireAuth`, usa `req.user.id`, filtra colecoes por `userId` e remove chaves sensiveis. Evidencia: `privacy.routes.js:17`, `privacy.service.js:41-49`, `privacy.service.js:140-160`, `privacyApi.js:13-15`. |
| `BK-MF5-02` | `CONFORME` | `DELETE /api/privacy/account` exige confirmacao forte, apaga dados pessoais diretos, anonimiza a conta, revoga sessoes e cancela subscricoes operacionais sem destruir historico agregado. Evidencia: `privacy.controller.js:33-37`, `privacy.service.js:170-181`, `privacy.service.js:237-285`. |
| `BK-MF5-03` | `CONFORME` | Consentimentos usam endpoints autenticados, persistem estado atual em `user_consents`, registam historico em `user_consent_events` e nao recebem `userId` do frontend. Evidencia: `privacy.routes.js:19-20`, `privacy.service.js:311-359`, `privacyApi.js:32-43`. |
| `BK-MF5-04` | `CONFORME` | Gestao admin lista sem `passwordHash`, valida filtros/alteracoes, impede auto-democao/autobloqueio, audita alteracoes e invalida sessoes ao bloquear. A rota legacy `/:id/role` delega no fluxo auditado. Evidencia: `user.routes.js:26-35`, `user.service.js:141-162`, `user.service.js:173-219`. |
| `BK-MF5-05` | `CONFORME` | `GET /api/admin/metrics` esta protegido por role admin e devolve metricas agregadas. A pool solidaria soma `pool_distributions.totalPoolCents`, alinhada com MF4. Evidencia: `admin-metrics.routes.js:12`, `admin-metrics.service.js:47-119`, `metricsApi.js:30-32`. |
| `BK-MF5-06` | `CONFORME` | Integracoes admin usam lista fechada, endpoints admin, auditoria e `publicConfig` controlado, sem persistencia de segredos. Evidencia: `integrations.routes.js:15-20`, `integrations.validation.js:7-39`, `integrations.validation.js:64-109`, `integrationsApi.js:13-28`. |

## Rastreabilidade BK -> RF/RNF -> ficheiros -> validacao

| BK | RF/RNF | Ficheiros principais | Validacao observada |
| --- | --- | --- | --- |
| `BK-MF5-01` | `RF55`, `RNF15`, `RNF17`, `RNF37` | `privacy.service.js`, `privacy.controller.js`, `privacy.routes.js`, `privacyApi.js`, `PrivacyExportPanel.jsx` | `mf5-validation.test.js` cobre exportacao sem campos sensiveis e com ownership. |
| `BK-MF5-02` | `RF56`, `RNF15`, `RNF17`, `RNF19`, `RNF37` | `privacy.validation.js`, `privacy.service.js`, `PrivacyDangerZone.jsx` | `mf5-validation.test.js` cobre eliminacao, limpeza de dados pessoais, anonimato e preservacao de historico agregado. |
| `BK-MF5-03` | `RF57`, `RNF15`, `RNF17`, `RNF37` | `privacy.validation.js`, `privacy.service.js`, `PrivacyConsentsPanel.jsx` | `mf5-validation.test.js` cobre consentimentos atuais e evento historico. |
| `BK-MF5-04` | `RF58`, `RNF19` | `user.validation.js`, `user.service.js`, `user.controller.js`, `user.routes.js`, `AdminUsersPage.jsx` | `mf5-validation.test.js` cobre bloqueio de login/sessao, auditoria da rota legacy e invalidacao de sessoes. |
| `BK-MF5-05` | `RF59`, `RNF19`, `RNF30` | `admin-metrics.*`, `metricsApi.js`, `AdminMetricsPage.jsx` | `mf5-validation.test.js` cobre soma da pool pelo campo `totalPoolCents`. |
| `BK-MF5-06` | `RF60`, `RNF17`, `RNF19` | `integrations.*`, `integrationsApi.js`, `AdminIntegrationsPage.jsx` | `mf5-validation.test.js` cobre chave/mode validos e negativos de `apiKey`, `Bearer` e valores nao string. |

## Mapa de integracao da MF

### Contratos consumidos de MFs anteriores

- `MF1`: Express modular, `apiClient`, cookies de sessao, CORS e smoke base. Evidencia: `apiClient.js:57-63`, `app.js:39-74`.
- `MF2`: identidade por `req.user.id`, roles base, conta, catalogo, biblioteca e playback usados por privacidade/admin.
- `MF3`: ratings, comentarios e recomendacao entram na exportacao/consentimentos sem expor ownership indevido.
- `MF4`: subscricoes, pagamentos simulados, notificacoes e pool solidaria continuam reutilizados. A rota direta `POST /api/subscriptions/me` nao esta montada e o teste HTTP confirma `404`.

### Contratos entregues para MF6

- Rotas de privacidade autenticadas:
  - `GET /api/privacy/export`
  - `DELETE /api/privacy/account`
  - `GET /api/privacy/consents`
  - `PUT /api/privacy/consents`
- Rotas admin protegidas:
  - `GET /api/users`
  - `PATCH /api/users/:id/admin`
  - `PATCH /api/users/:id/role` como legacy delegado no fluxo auditado
  - `GET /api/admin/metrics`
  - `GET /api/admin/integrations`
  - `PATCH /api/admin/integrations/:key`
- Baseline de testes para regressao: backend `43/43`, smoke backend `8/8`, build frontend Vite.

## Findings

### P0

Sem findings `P0` confirmados.

### P1

Sem findings `P1` confirmados.

### P2

Sem findings `P2` confirmados.

### P3

Sem findings `P3` acionaveis. A ausencia de E2E/browser especifico para MF5 fica como oportunidade natural de `MF6-02`, mas os contratos criticos backend/frontend estao cobertos por testes unitarios, HTTP/smoke e build.

## Reauditoria dos findings historicos

| Finding historico | Estado atual | Evidencia |
| --- | --- | --- |
| `MF5-AUD-P1-001` - ativacao direta de subscricao | `JA_CORRIGIDO` | `subscriptions.routes.js:22-25` monta apenas `GET /me` e `POST /me/cancel-renewal`; `subscriptionsApi.js:13-25` nao expoe `activate`; teste HTTP confirma `POST /api/subscriptions/me` como `404`. |
| `MF5-AUD-P1-002` - `blocked` nao bloqueava auth | `JA_CORRIGIDO` | `auth.service.js:109-123` rejeita `blocked/deleted`; `session.service.js:37-39` e `session.service.js:95-98` invalidam sessao de conta nao autenticavel. |
| `MF5-AUD-P1-003` - rota legacy sem auditoria | `JA_CORRIGIDO` | `user.service.js:160-162` delega `updateUserRole` para `updateUserByAdmin`; auditoria em `user.service.js:206-213`. |
| `MF5-AUD-P1-004` - metrica da pool usava campo errado | `JA_CORRIGIDO` | `admin-metrics.service.js:86` soma `totalPoolCents`; teste MF5 usa documentos com `totalCents` divergente para provar a escolha do campo. |
| `MF5-AUD-P2-001` - `publicConfig` podia guardar segredo | `JA_CORRIGIDO` | `integrations.validation.js:32-39` define padroes proibidos; `integrations.validation.js:64-109` rejeita chaves/valores secret-like. |
| `MF5-AUD-P2-002` - cobertura insuficiente | `JA_CORRIGIDO` | `mf5-validation.test.js` cobre exportacao, metricas, auth blocked, rota legacy auditada, eliminacao, consentimentos e `publicConfig`; suite backend passou `43/43`. |

## Coerencia entre MFs

| Fronteira | Estado | Observacao |
| --- | --- | --- |
| `MF4 -> MF5` | `COERENTE` | Subscricao paga continua dependente do fluxo de pagamento simulado aprovado; `POST /api/subscriptions/me` devolve `404`. Metricas MF5 leem `totalPoolCents`, produzido pela distribuicao MF4. |
| `MF5 interna` | `COERENTE` | Privacidade self-service e operacao admin usam sessao/role no backend, validacao fechada, auditoria quando critica e frontend ligado aos endpoints reais. |
| `MF5 -> MF6` | `COERENTE` | MF5 entrega endpoints e testes suficientes para regressao/hardening. MF6 pode acrescentar cobertura browser/acessibilidade/performance sem desbloquear requisitos MF5. |

## Seguranca e privacidade

- `PASS`: `apiClient` usa `credentials: "include"` em `apiClient.js:57-63`.
- `PASS`: pesquisa estatica nao encontrou `localStorage`/`sessionStorage` usados para sessao/token.
- `PASS`: logs estruturados aparecem sem passwords/tokens/cookies em mensagens de teste observadas.
- `PASS`: exportacao remove chaves sensiveis recursivamente (`privacy.service.js:41-49`, `privacy.service.js:72-94`).
- `PASS`: contas `blocked`/`deleted` nao entram por login e sessoes antigas sao removidas.
- `PASS`: operacoes admin criticas escrevem `admin_audit_logs`.
- `PASS_COM_NOTA`: existem `.env` locais em `real_dev/backend` e `real_dev/frontend`; apenas os caminhos foram detetados, sem imprimir conteudo.
- `PASS_COM_NOTA`: pesquisa de `secret/apiKey/stripe` devolveu falsos positivos defensivos: lista de redacao, minimizacao e teste negativo.

## Comandos executados

| Comando | Resultado | Observacao |
| --- | --- | --- |
| `git status --short --untracked-files=all` | `PASS_COM_NOTA` | Relatorios tecnicos MF5 apareciam como `??`; isso nao foi tratado como falha, conforme regra da prompt. |
| Pesquisa estatica de seguranca em `real_dev/backend/src`, `tests`, `scripts`, `real_dev/frontend/src` | `PASS_COM_NOTA` | Apenas falsos positivos defensivos: `stripe_real` como negativo, `secret` em listas de redacao/minimizacao. |
| Pesquisa de drift OPSA/Orelle/StudyFlow/etc. em `real_dev` | `PASS` | Sem ocorrencias. |
| Deteccao de `.env` local | `PASS_COM_NOTA` | Encontrados `real_dev/backend/.env`, `real_dev/backend/.env.example`, `real_dev/frontend/.env`, `real_dev/frontend/.env.example`; conteudo nao impresso. |
| `npm --prefix real_dev/backend test` no sandbox | `BLOQUEADO_AMBIENTE` | 27 testes passaram, 16 HTTP falharam por `listen EPERM: operation not permitted 127.0.0.1`. |
| `npm --prefix real_dev/backend test` fora do sandbox | `PASS` | `43/43` testes passaram. |
| `npm --prefix real_dev/frontend run build` | `PASS` | Vite build passou; 100 modulos transformados. |
| `npm run smoke` fora do sandbox | `PASS` | Backend smoke `8/8` e frontend build passaram. |
| `bash scripts/validate-planificacao.sh` | `PASS` | `checked_bks: 55`, `checked_guides: 55`, `errors: []`. |
| `git diff --check` | `PASS` | Sem erros de whitespace em diffs rastreados; os relatorios tecnicos MF5 continuam untracked. |

## Ficheiros auditados principais

- `real_dev/backend/src/app.js`
- `real_dev/backend/src/modules/privacy/*`
- `real_dev/backend/src/modules/users/*`
- `real_dev/backend/src/modules/admin-metrics/*`
- `real_dev/backend/src/modules/integrations/*`
- `real_dev/backend/src/modules/auth/*`
- `real_dev/backend/src/modules/subscriptions/*`
- `real_dev/backend/src/modules/payments/*`
- `real_dev/backend/src/modules/charities/*`
- `real_dev/backend/tests/unit/mf5-validation.test.js`
- `real_dev/backend/tests/integration/mf4-http.test.js`
- `real_dev/frontend/src/services/api/apiClient.js`
- `real_dev/frontend/src/services/api/privacyApi.js`
- `real_dev/frontend/src/services/api/userApi.js`
- `real_dev/frontend/src/services/api/metricsApi.js`
- `real_dev/frontend/src/services/api/integrationsApi.js`
- `real_dev/frontend/src/services/api/subscriptionsApi.js`
- `real_dev/frontend/src/components/privacy/*`
- `real_dev/frontend/src/pages/AccountPage.jsx`
- `real_dev/frontend/src/pages/AdminUsersPage.jsx`
- `real_dev/frontend/src/pages/AdminMetricsPage.jsx`
- `real_dev/frontend/src/pages/AdminIntegrationsPage.jsx`
- `real_dev/frontend/src/routes/AppRoutes.jsx`

## Ficheiros alterados nesta execucao

- `docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF5.md`

Nao foram alterados codigo, BKs canonicos, backlog, matriz, prompts, commits ou PRs.

## Blockers e TODOs

- Blockers: nenhum.
- TODOs obrigatorios dentro do escopo MF5: nenhum.
- Nota ambiental: comandos que abrem servidor local falham na sandbox por `listen EPERM`, mas passaram fora da sandbox quando autorizados.
- Proxima melhoria natural: em `MF6-02`, acrescentar regressao browser/E2E ou acessibilidade para ecras `/conta`, `/admin/utilizadores`, `/admin/metricas` e `/admin/integracoes`.

## Proxima acao recomendada

Avancar para `MF6` em modo regressao/hardening, usando esta auditoria MF5 como baseline. Nao e necessario executar `corrigir_auditoria` para MF5 neste estado, porque nao ha findings acionaveis confirmados.
