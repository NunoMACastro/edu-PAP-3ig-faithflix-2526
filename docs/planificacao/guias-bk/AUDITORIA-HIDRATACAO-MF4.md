# Auditoria de guias BK - MF4

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-13`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `proof_scope`: auditoria de hidratação MF4 observada em 2026-06-13; não prova o estado atual

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF4`
- `macro`: `MF4`
- `modo`: `auditar_apenas`
- `data`: `2026-06-13`
- `owner`: `Nuno (orientacao)`
- `status`: `concluido`
- `escopo`: guias BK da MF4 em `docs/planificacao/guias-bk/MF4/`
- `acao_sobre_bks`: nenhuma; os BKs da MF4 nao foram editados nesta execucao.

## Resultado executivo

Foram auditados os 7 BKs atuais da `MF4`:

- `BK-MF4-01` - Planos e ciclo de subscricao
- `BK-MF4-02` - Metodos de pagamento simulados e trial
- `BK-MF4-03` - Candidaturas de associacoes
- `BK-MF4-04` - Aprovacao e entrada na pool
- `BK-MF4-05` - Distribuicao mensal e rotacao
- `BK-MF4-06` - Relatorios e historico por associacao
- `BK-MF4-08` - Notificacoes transacionais e preferencias

Conclusao: os 7 BKs da `MF4` estao `OK` como guias pedagogicos e tecnicos para os alunos seguirem. A execucao atual foi apenas auditoria: nao corrigiu nem reescreveu BKs. O relatorio foi realinhado porque a versao anterior descrevia uma execucao historica de `corrigir_apenas`.

### Contagem antes desta execucao

| OK | PARCIAL | CRITICO |
| --- | --- | --- |
| 7 | 0 | 0 |

### Contagem depois desta execucao

| OK | PARCIAL | CRITICO |
| --- | --- | --- |
| 7 | 0 | 0 |

## Documentos consultados

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md` (alias deprecated para `MATRIZ-CANONICA-BK.md`)
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md` (alias deprecated para `SCORECARD-SPRINTS.md`)
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `GLOSSARIO-TERMOS-TECNICOS-PAP.md`
- BKs de `MF0`, `MF1`, `MF2`, `MF3`, `MF4`, e BKs posteriores de `MF5..MF8` para handoff/dependencias.
- Relatorios existentes de auditoria e implementacao em `docs/planificacao/guias-bk/`.

## Base canonica confirmada para MF4

- `CANONICO`: `MF4` cobre monetizacao solidaria com `RF35..RF48` e `RF52..RF54`.
- `CANONICO`: `BK-MF4-01` cobre `RF35`, `RF36`, `RF38`, `RF39`.
- `CANONICO`: `BK-MF4-02` cobre `RF37`, `RF40`.
- `CANONICO`: `BK-MF4-03` cobre `RF41`.
- `CANONICO`: `BK-MF4-04` cobre `RF42`, `RF43`.
- `CANONICO`: `BK-MF4-05` cobre `RF44`, `RF45`.
- `CANONICO`: `BK-MF4-06` cobre `RF46`, `RF47`, `RF48`.
- `CANONICO`: `BK-MF4-08` cobre `RF52`, `RF53`, `RF54`.
- `CANONICO`: `S07` segue `BK-MF4-01 -> BK-MF4-02 -> BK-MF4-08`.
- `CANONICO`: `S08` segue `BK-MF4-03 -> BK-MF4-04 -> BK-MF4-05 -> BK-MF4-06`.
- `CANONICO`: `BK-MF4-07` nao existe no backlog ativo, na matriz canonica ou em `MF-VIEWS`; o salto para `BK-MF4-08` deve ser preservado.
- `DERIVADO`: pagamentos reais ficam fora do MVP dos BKs da MF4; os guias usam pagamento simulado para respeitar `RNF18` e evitar armazenamento de dados financeiros.

## Auditoria por BK

| BK | Estado | Problema principal | Risco pedagogico | Risco tecnico | Prioridade de correcao |
| --- | --- | --- | --- | --- | --- |
| `BK-MF4-01` | OK | Sem problema bloqueante. | Baixo: o guia explica plano, subscricao, ciclo, ownership e bloqueio premium. | Baixo: endpoints pessoais usam `req.user.id` e o guard premium prepara playback. | Nao aplicavel |
| `BK-MF4-02` | OK | Sem problema bloqueante. | Baixo: distingue pagamento simulado, recusa, trial unico e ausencia de dados financeiros. | Baixo: `payment_attempts`, `trials` e subscricao `trialing` estao alinhados. | Nao aplicavel |
| `BK-MF4-03` | OK | Sem problema bloqueante. | Baixo: submissao de candidatura e listagem admin ficam claras. | Baixo: validacao e duplicado pendente por email estao descritos. | Nao aplicavel |
| `BK-MF4-04` | OK | Sem problema bloqueante. | Baixo: separa decisao admin de entrada na pool. | Baixo: decisao exige role admin e cria `charities` a partir de candidatura aprovada. | Nao aplicavel |
| `BK-MF4-05` | OK | Sem problema bloqueante. | Baixo: algoritmo mensal, cêntimos, idempotencia e rotacao estao explicados. | Baixo: usa `subscriptions`, `subscription_plans`, `charities` e guarda `pool_distributions`. | Nao aplicavel |
| `BK-MF4-06` | OK | Sem problema bloqueante. | Baixo: diferencia dashboard admin, pagina publica, historico privado e CSV. | Baixo: `charity_memberships` aplica ownership no historico por associacao. | Nao aplicavel |
| `BK-MF4-08` | OK | Sem problema bloqueante. | Baixo: explica notificacoes transacionais, preferencias e eventos backend. | Baixo: deduplicacao e ownership evitam repeticao e leitura cruzada. | Nao aplicavel |

Nao ha BKs `PARCIAL` ou `CRITICO` nesta execucao, por isso nao ha lista de correcoes obrigatorias por BK.

## Mapa de integracao da MF

### `BK-MF4-01`

- Ficheiros criados pelo guia: `backend/src/modules/subscriptions/subscriptions.validation.js`, `subscriptions.service.js`, `subscriptions.controller.js`, `subscriptions.routes.js`, `subscription-access.middleware.js`, `frontend/src/services/api/subscriptionsApi.js`, `frontend/src/pages/SubscriptionPage.jsx`.
- Ficheiros editados pelo guia: `backend/src/app.js`, `backend/src/server.js`, `backend/src/modules/playback/playback.routes.js`, `frontend/src/routes/AppRoutes.jsx`.
- Exports produzidos: `assertPlanInterval`, `assertSubscriptionStatus`, `addBillingCycle`, `isBlockingStatus`, `ensureSubscriptionIndexes`, `listPlans`, `activateSubscription`, `getMySubscription`, `hasActiveSubscriptionAccess`, `cancelRenewal`, `renewActiveSubscription`, `expireOverdueSubscriptions`, `subscriptionsRouter`, `subscriptionsApi`, `SubscriptionPage`, `requireActiveSubscription`.
- Imports consumidos de BKs anteriores: `getDb`, `requireAuth`, `asyncHandler`, `apiClient`, `toUserMessage`, router de playback do `BK-MF2-05`.
- Endpoints criados: `GET /api/subscriptions/plans`, `GET /api/subscriptions/me`, `POST /api/subscriptions/me`, `POST /api/subscriptions/me/cancel-renewal`.
- DTOs/validacoes criados: validacao de intervalo de plano, estado de subscricao e ciclo de faturacao.
- Schemas/modelos criados: colecoes MongoDB `subscription_plans` e `subscriptions`.
- Services criados: `subscriptions.service.js`.
- Componentes/paginas frontend criados: `SubscriptionPage`.
- Dados persistidos: planos, subscricoes, datas de ciclo, estado, renovacao e percentagem solidaria.
- Regras aplicadas: ownership por `req.user.id`, sessao HttpOnly via `apiClient`, bloqueio premium com `403`.
- BKs seguintes dependentes: `BK-MF4-02`, `BK-MF4-05`, `BK-MF4-08`.

### `BK-MF4-02`

- Ficheiros criados pelo guia: `payments.validation.js`, `payments.service.js`, `payments.controller.js`, `payments.routes.js`, `paymentsApi.js`.
- Ficheiros editados pelo guia: `subscriptions.validation.js`, `subscriptions.service.js`, `backend/src/app.js`, `backend/src/server.js`, `SubscriptionPage.jsx`.
- Exports produzidos: `PAYMENT_METHODS`, `SIMULATED_OUTCOMES`, `assertCheckoutPayload`, `grantTrialSubscription`, `ensurePaymentIndexes`, `createSimulatedCheckout`, `startTrial`, `postSimulatedCheckout`, `postTrial`, `paymentsRouter`, `paymentsApi`.
- Imports consumidos de BKs anteriores: `getDb`, `requireAuth`, `asyncHandler`, `activateSubscription`, `apiClient`, `subscriptionsApi`.
- Endpoints criados: `POST /api/payments/simulated-checkout`, `POST /api/payments/trial`.
- DTOs/validacoes criados: payload de checkout simulado e trial.
- Schemas/modelos criados: `payment_attempts`, `trials`; reutiliza `subscriptions`.
- Services criados: `payments.service.js`; extensao de `subscriptions.service.js` para trial.
- Componentes/paginas frontend criados/editados: `paymentsApi`, `SubscriptionPage`.
- Dados persistidos: tentativa de pagamento sem dados financeiros reais, trial unico por utilizador, subscricao `trialing`.
- Regras aplicadas: sem dados de cartao, sem tokens financeiros, ownership por sessao, `402` para recusa simulada, `409` para trial repetido.
- BKs seguintes dependentes: `BK-MF4-05`, `BK-MF4-08`.

### `BK-MF4-03`

- Ficheiros criados pelo guia: `charity-applications.validation.js`, `charity-applications.service.js`, `charity-applications.controller.js`, `charities.routes.js`, `charitiesApi.js`, `CharityApplicationPage.jsx`.
- Ficheiros editados pelo guia: `backend/src/app.js`, `backend/src/server.js`, `frontend/src/routes/AppRoutes.jsx`.
- Exports produzidos: validadores de candidatura, `ensureCharityApplicationIndexes`, `submitCharityApplication`, `listCharityApplications`, controllers, `charitiesRouter`, `charitiesApi`, `CharityApplicationPage`.
- Imports consumidos de BKs anteriores: `getDb`, `requireRole`, `asyncHandler`, `apiClient`, `toUserMessage`.
- Endpoints criados: `POST /api/charities/applications`, `GET /api/charities/applications`.
- DTOs/validacoes criados: payload de candidatura com nome, contacto, email e missao.
- Schemas/modelos criados: `charity_applications`.
- Services criados: `charity-applications.service.js`.
- Componentes/paginas frontend criados: `CharityApplicationPage`.
- Dados persistidos: candidatura com estado `pending`.
- Regras aplicadas: submissao publica validada, listagem admin protegida, duplicado pendente por email.
- BK seguinte dependente: `BK-MF4-04`.

### `BK-MF4-04`

- Ficheiros criados pelo guia: `charity-review.validation.js`, `charity-review.service.js`, `AdminCharityApplicationsPage.jsx`.
- Ficheiros editados pelo guia: `charities.routes.js`, `charity-applications.controller.js`, `backend/src/server.js`, `charitiesApi.js`, `frontend/src/routes/AppRoutes.jsx`.
- Exports produzidos: `REVIEW_DECISIONS`, `assertReviewPayload`, `ensureCharityIndexes`, `reviewCharityApplication`, `listEligibleCharities`, `patchCharityApplicationReview`, `AdminCharityApplicationsPage`.
- Imports consumidos de BKs anteriores: `charity_applications` e controller/router do `BK-MF4-03`, `requireRole`, `asyncHandler`.
- Endpoints criados/editados: `PATCH /api/charities/applications/:id/review`.
- DTOs/validacoes criados: decisao `approved`/`rejected` e motivo de rejeicao.
- Schemas/modelos criados: `charities`.
- Services criados: `charity-review.service.js`.
- Componentes/paginas frontend criados: `AdminCharityApplicationsPage`.
- Dados persistidos: candidatura decidida, associacao ativa e elegivel para pool quando aprovada.
- Regras aplicadas: role admin obrigatoria, entrada na pool apenas apos aprovacao.
- BK seguinte dependente: `BK-MF4-05`.

### `BK-MF4-05`

- Ficheiros criados pelo guia: `pool-distribution.validation.js`, `pool-distribution.service.js`, `pool-distribution.controller.js`, `AdminPoolDistributionPage.jsx`.
- Ficheiros editados pelo guia: `charities.routes.js`, `backend/src/server.js`, `charitiesApi.js`, `frontend/src/routes/AppRoutes.jsx`.
- Exports produzidos: `assertDistributionMonth`, `ensurePoolDistributionIndexes`, `runMonthlyDistribution`, `getDistributionByMonth`, controllers de distribuicao, `AdminPoolDistributionPage`.
- Imports consumidos de BKs anteriores: `subscriptions`, `subscription_plans`, `charities`, `requireRole`, `asyncHandler`, `charitiesApi`.
- Endpoints criados: `POST /api/charities/pool/distributions`, `GET /api/charities/pool/distributions/:month`.
- DTOs/validacoes criados: mes `YYYY-MM`.
- Schemas/modelos criados: `pool_distributions`.
- Services criados: `pool-distribution.service.js`.
- Componentes/paginas frontend criados: `AdminPoolDistributionPage`.
- Dados persistidos: distribuicao mensal, total da pool, itens por associacao, offset de rotacao e admin executor.
- Regras aplicadas: idempotencia por mes, role admin, divisao por centimos, rotacao deterministica.
- BK seguinte dependente: `BK-MF4-06`.

### `BK-MF4-06`

- Ficheiros criados pelo guia: `charity-reports.service.js`, `charity-reports.controller.js`, `PublicCharitiesPage.jsx`, `AdminPoolDashboardPage.jsx`, `CharityHistoryPage.jsx`, `AdminCharityMembersPage.jsx`.
- Ficheiros editados pelo guia: `charities.routes.js`, `backend/src/server.js`, `charitiesApi.js`, `frontend/src/routes/AppRoutes.jsx`.
- Exports produzidos: `ensureCharityReportIndexes`, `linkUserToCharity`, `getMyCharityMembership`, `getPoolDashboard`, `getCharityHistory`, `listPublicCharities`, `historyToCsv`, controllers e paginas.
- Imports consumidos de BKs anteriores: `charities`, `pool_distributions`, `requireAuth`, `requireRole`, `apiClient`.
- Endpoints criados: `GET /api/charities/public`, `GET /api/charities/pool/dashboard`, `POST /api/charities/:id/members`, `GET /api/charities/:id/history`, `GET /api/charities/:id/history.csv`.
- DTOs/validacoes criados: validacao direta de `ObjectId` e regras de autorizacao no service/controller.
- Schemas/modelos criados: `charity_memberships`.
- Services criados: `charity-reports.service.js`.
- Componentes/paginas frontend criados: paginas publica, dashboard admin, historico privado e ligacao admin.
- Dados persistidos: ligacao utilizador-associacao para ownership.
- Regras aplicadas: admin ve dashboard; associacao ligada ve apenas o seu historico; CSV respeita ownership.
- BKs seguintes dependentes: `BK-MF5-01` e validacoes de privacidade/operacao posteriores.

### `BK-MF4-08`

- Ficheiros criados pelo guia: `notifications.validation.js`, `notifications.service.js`, `notifications.controller.js`, `notifications.routes.js`, `notificationsApi.js`, `NotificationsPage.jsx`.
- Ficheiros editados pelo guia: `backend/src/app.js`, `backend/src/server.js`, `subscriptions.service.js`, `payments.service.js`, `playback.service.js`, `frontend/src/routes/AppRoutes.jsx`.
- Exports produzidos: validadores de preferencias e notificacoes, `ensureNotificationIndexes`, `createNotification`, `listMyNotifications`, `markNotificationAsRead`, `getPreferences`, `updatePreferences`, controllers, `notificationsRouter`, `notificationsApi`, `NotificationsPage`.
- Imports consumidos de BKs anteriores: `subscriptions.service.js`, `payments.service.js`, `playback.service.js`, `requireAuth`, `apiClient`.
- Endpoints criados: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `GET /api/notifications/preferences`, `PUT /api/notifications/preferences`.
- DTOs/validacoes criados: preferencias por tipo, payload interno de notificacao, `dedupeKey`.
- Schemas/modelos criados: `notifications`, `notification_preferences`.
- Services criados: `notifications.service.js`.
- Componentes/paginas frontend criados: `NotificationsPage`.
- Dados persistidos: notificacoes internas, preferencias por utilizador, estado lido/nao lido.
- Regras aplicadas: ownership por `userId`, deduplicacao de alertas, ausencia de dados sensiveis na mensagem.
- BKs seguintes dependentes: `MF5` pode reutilizar preferencias/privacidade; `MF6` deve testar regressao e seguranca.

## Confirmacao de integracao

| Check | Resultado |
| --- | --- |
| Dois endpoints para a mesma acao | `PASS`: cada dominio tem rota propria (`subscriptions`, `payments`, `charities`, `notifications`). |
| Dois schemas/modelos para a mesma entidade | `PASS`: `trials` e o nome unico para trial; restantes colecoes têm responsabilidades distintas. |
| Nomes diferentes para o mesmo conceito | `PASS`: nao ha ocorrencias de `subscription_trials` nos BKs MF4. |
| Frontend chama endpoint inexistente no guia | `PASS`: clientes API apontam para endpoints definidos no mesmo BK ou em BK anterior. |
| Service importa ficheiro nao criado | `PASS`: imports novos apontam para ficheiros criados no proprio BK ou em BK anterior. |
| BK seguinte dependente de algo nao entregue | `PASS`: dependencias `trials`, `subscriptions`, `charities`, `pool_distributions` e `charity_memberships` estao entregues antes do uso. |

## Gate de app funcional

| BK | Compila no contrato previsto | Imports entregues | Controller -> service | Frontend -> endpoint | Auth/roles/ownership | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| `BK-MF4-01` | Sim, por contrato previsto | Sim | Sim | Sim | Sim | `OK` |
| `BK-MF4-02` | Sim, por contrato previsto | Sim | Sim | Sim | Sim | `OK` |
| `BK-MF4-03` | Sim, por contrato previsto | Sim | Sim | Sim | Sim, listagem admin | `OK` |
| `BK-MF4-04` | Sim, por contrato previsto | Sim | Sim | Sim | Sim, admin | `OK` |
| `BK-MF4-05` | Sim, por contrato previsto | Sim | Sim | Sim | Sim, admin | `OK` |
| `BK-MF4-06` | Sim, por contrato previsto | Sim | Sim | Sim | Sim, admin/membership | `OK` |
| `BK-MF4-08` | Sim, por contrato previsto | Sim | Sim | Sim | Sim | `OK` |

Nota: esta auditoria avalia guias BK, nao implementa codigo real da aplicacao. A executabilidade acima refere-se ao contrato descrito nos guias, validado contra BKs anteriores e documentacao canonica.

## Decisoes tecnicas confirmadas

- Sessao: cookies HttpOnly e `apiClient` com credenciais, sem tokens em `localStorage`.
- Pagamentos: simulados no MVP; sem Stripe, PayPal, MB Way, webhooks ou dados de cartao.
- Trial: colecao canonica `trials`.
- Subscricoes: ownership sempre por `req.user.id`.
- Pool solidaria: candidatura -> aprovacao -> elegibilidade -> distribuicao mensal -> relatorio/historico.
- Associacoes: historico privado exige ownership por `charity_memberships`; admin tem acesso operacional.
- Notificacoes: internas, persistidas, com preferencias e deduplicacao; sem fornecedor externo.

## Drift documental e de implementacao

- Drift controlado: `RNF24` recomenda gateway de pagamento como `Should`, mas os BKs da MF4 mantem pagamento simulado por delimitacao MVP e por seguranca (`RNF18`).
- Drift de tracking: `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md` e headers dos BKs MF4 continuam em `TODO`/`PENDENTE`, porque a implementacao real ainda nao foi fechada por gate.
- Drift de codigo real: `backend/` e `frontend/` ainda nao implementam os modulos MF4. Isto nao altera a classificacao documental dos guias, mas bloqueia qualquer auditoria de implementacao real da MF4 ate a equipa implementar os BKs.
- Alias deprecated: `MATRIZ-RF-RNF-POR-BK.md` e `SCORECARD-OFICIAL-POR-SPRINT.md` sao ficheiros de compatibilidade; as fontes canonicas sao `MATRIZ-CANONICA-BK.md` e `SCORECARD-SPRINTS.md`.

## Verificacoes executadas

| Verificacao | Resultado |
| --- | --- |
| Header e secoes obrigatorias dos BKs MF4 via leitura estatica | `PASS`, 7/7 BKs com campos canonicos e secoes obrigatorias. |
| Varredura textual de termos proibidos em `MF4` | `PASS`, sem ocorrencias nos BKs dos alunos. |
| Pesquisa por `subscription_trials` em `MF4` | `PASS`, sem ocorrencias. |
| Pesquisa adicional por gateway real/dados financeiros/localStorage | `PASS` com falsos positivos justificados em `Scope-out` ou explicacoes negativas. |
| `git diff --check` | `PASS`, sem problemas de whitespace. |
| `bash scripts/validate-planificacao.sh` | `PASS` (`checked_bks: 55`, `checked_guides: 55`, `errors: []`). |

## BKs editados nesta execucao

Nenhum BK da `MF4` foi editado nesta execucao (`MODO: auditar_apenas`).

## Principais lacunas corrigidas nesta execucao

Nenhuma lacuna de BK foi corrigida, porque esta execucao foi apenas de auditoria. A unica alteracao feita foi realinhar este relatorio com o modo atual.

## TODOs e blockers restantes

- `TODO`: implementar MF4 no codigo real seguindo a ordem dos guias.
- `TODO`: quando a implementacao real da MF4 existir, executar auditoria tecnica especifica de subscricoes, pagamentos simulados, pool, relatorios e notificacoes.

## Ordem recomendada de correcao

1. Sem correcoes documentais pendentes na `MF4`.
2. Proximo passo recomendado: implementar a MF4 no codigo real seguindo a ordem `BK-MF4-01 -> BK-MF4-02 -> BK-MF4-08 -> BK-MF4-03 -> BK-MF4-04 -> BK-MF4-05 -> BK-MF4-06`.

## Changelog

- `2026-06-13`: executado modo `auditar_apenas`; BKs da `MF4` revalidados como `OK`; nenhum BK editado; relatorio realinhado com a execucao atual e com as validacoes textuais.
