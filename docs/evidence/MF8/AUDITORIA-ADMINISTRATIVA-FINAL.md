# Auditoria administrativa final - MF8

- `document_status`: `CURRENT`
- `snapshot_date`: `-`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: adendos atuais da referência privada e snapshot MF8 de 2026-06-29 claramente delimitado; não constitui evidence dos alunos

## Adendo docente pós-correção - robustez administrativa Fase 5 (2026-07-10)

Este adendo acrescenta prova local atual da referência privada. Não reescreve o
snapshot MF8 de 2026-06-29, não promove BKs dos alunos e não altera a decisão
histórica `PASS_COM_RESSALVAS`.

| Superfície atual | Contrato Fase 5 | Prova local atual |
| --- | --- | --- |
| Candidaturas | API `{ applications, page, limit, total, totalPages }`, `limit <= 50`, ordem estável; decisão com confirmação, busy por linha, abort/anti-stale e retry. | `AdminCharityApplicationsPage.test.jsx`; backend `f5-validation-pagination.test.js`. |
| Membership | Confirma utilizador e associação, impede dupla submissão, aborta no unmount e só mostra a resposta autoritativa. | `AdminCharityMembersPage.test.jsx`; `adminActionApis.test.js`. |
| Pool | Mês inicial deriva do tempo civil local, fecho manual exige confirmação; dashboard cancela leituras, traduz estados financeiros e separa loading/error/empty/retry. | `AdminPoolDistributionPage.test.jsx`; `AdminPoolDashboardPage.test.jsx`. |
| Utilizadores | API `{ users, page, limit, total, totalPages }`, `limit <= 50`, filtros fechados e ordenação estável; UI confirma papel/estado, repõe select cancelado, usa busy por linha, abort e PT-PT. | `AdminUsersPage.test.jsx`; backend `f5-validation-pagination.test.js`. |
| Métricas | Leitura cancelável, intervalo invertido recusado antes da API, retry e rótulos agregados PT-PT. | `AdminMetricsPage.test.jsx`. |
| Integrações | Confirma ativação/modo, repõe controlo cancelado, busy por integração, abort e resposta autoritativa; `publicConfig` continua sem segredos. | `AdminIntegrationsPage.test.jsx`; `adminActionApis.test.js`. |

Validação acumulada registada no report canónico: backend `191/191` e frontend
`50` ficheiros/`197` testes, lint/build verdes. A matriz Axe local passou
`14/14`; entre as rotas autenticadas cobriu `/admin/utilizadores` e
`/admin/catalogo`. Estes testes
usam doubles/interceções locais e não são um fluxo E2E administrativo completo
com MongoDB replica set. A ressalva browser/E2E histórica continua, portanto,
aberta e não é convertida em `PASS` de produção.

## Adendo docente pós-correção - catálogo editorial Fase 4 (2026-07-10)

Este adendo regista a baseline atual da referência privada sem reescrever nem
promover o snapshot MF8 de 2026-06-29 que permanece abaixo. O estado dos alunos
e a decisão histórica `PASS_COM_RESSALVAS` não mudam por esta prova local.

| Contrato administrativo atual | Estado local | Prova atual |
| --- | --- | --- |
| Create aceita metadata/assets/taxonomias e força media vazia, `mediaStatus: "pending"`, tracks vazias e zero quality options. | `VALIDADO_LOCAL` | `catalog-transactions.test.js` e `media-boundary.test.js` tentam injetar fontes e confirmam o documento vazio/pending. |
| Update recusa `media`, `mediaStatus`, `tracks`, `qualityOptions`, `playbackUrl` e `src` com `400 CATALOG_MEDIA_MUTATION_FORBIDDEN` e `details.field`. | `VALIDADO_LOCAL` | Unitário confirma zero revisão/audit/escrita; regressão HTTP confirma o envelope 400 com CSRF e sessão admin. |
| Update e reversão editorial preservam a media existente; CAS, revisão e audit continuam transacionais. | `VALIDADO_LOCAL` | Testes com media corrente diferente do snapshot e negativos de CAS/fault injection. |
| Catálogo admin e revisões devolvem `{ items, page, limit, total, totalPages }`, aceitam no máximo 50 e usam `_id` como desempate estável. | `VALIDADO_LOCAL` | Unitário pagina empates; regressão HTTP consulta a segunda página das duas rotas. |

Comandos atuais em `real_dev/backend`: suite unitária `152/152` e suite backend
completa `183/183`, zero fail/skip. A prova HTTP usa servidor loopback e DB
in-memory; nenhum seed, E2E, migração ou acesso à DB configurada foi executado.
Isto não substitui browser real, replica set MongoDB nem evidência dos alunos.

## Adendo docente pos-correcao - operacoes admin Fase 3 (2026-07-10)

Este adendo acrescenta prova atual da referência privada sem alterar a decisão
histórica MF8 de 2026-06-29. Qualquer path `real_dev/backend/` ou
`real_dev/frontend/` neste documento identifica exclusivamente a referência
docente privada; nunca representa a entrega publicável dos alunos.

| Operação atual | Unidade de commit e concorrência | Estado local |
| --- | --- | --- |
| Candidatura pública | Índice parcial único por `email` quando `status: "pending"`; colisão sequencial ou concorrente devolve `409 PENDING_APPLICATION_EXISTS`. | `VALIDADO_LOCAL` |
| Review da candidatura | Claim condicional de `pending`; decisão, eventual associação `active/eligible` e `charity.application_review` partilham transação. A decisão perdedora devolve `409 APPLICATION_ALREADY_REVIEWED`. | `VALIDADO_LOCAL` |
| Membership de associação | Ligação nova e `charity.membership_create` partilham transação; repetição igual é idempotente; outra associação devolve `409 CHARITY_MEMBERSHIP_EXISTS`, sem transferência implícita. | `VALIDADO_LOCAL` |
| Gestão de utilizador | `user.admin_update`, alteração e revogação de todas as sessões no bloqueio fazem commit/rollback juntos. `requestId` correlaciona o pedido com o audit. | `VALIDADO_LOCAL` |
| Último admin ativo | Auto-bloqueio/autodespromoção continuam recusados; remoções concorrentes serializam pela invariante `active-admin-roster` e preservam pelo menos um admin, ou devolvem `409 LAST_ACTIVE_ADMIN`. | `VALIDADO_LOCAL` |

O audit administrativo guarda `action`, ator, tipo/id do alvo,
`before`/`after` sanitizados, metadata segura, `requestId` quando existe e
timestamp. Passwords, hashes de autenticação/CSRF, tokens, cookies e segredos
não são persistidos no evento.

Prova focada: `real_dev/backend/tests/unit/f3-admin-transactions.test.js`.
Em 2026-07-10, a execução combinada com `mf5-validation.test.js` passou
`14/14`, sem DB ou rede.
Os doubles locais incluem rollback e serialização de transações, mas não provam
topologia MongoDB replica set real; essa limitação continua explícita no report
canónico da correção end-to-end.

## Adendo docente pos-correcao - catalogo Fase 3 (2026-07-10)

Este adendo complementa, sem reescrever, o snapshot MF8 de 2026-06-29. A prova
histórica abaixo foi recolhida sobre a referência privada; os paths
`real_dev/backend/` e `real_dev/frontend/` não são paths públicos dos alunos. A
validação atual da referência não altera o estado histórico dos outros domínios
administrativos nem o estado dos BK estudantis.

| Contrato atual do catálogo admin | Estado local | Prova atual |
| --- | --- | --- |
| Create devolve `version: 1`; listagem admin devolve uma versão positiva. | `VALIDADO_LOCAL` | `real_dev/backend/tests/unit/catalog-transactions.test.js` |
| Edit/status/revert exigem `expectedVersion`; valor ausente ou não numérico falha fechado. | `VALIDADO_LOCAL` | Teste de `EXPECTED_VERSION_REQUIRED` e services reais. |
| Lost update devolve `409 CONTENT_VERSION_CONFLICT`. | `VALIDADO_LOCAL` | CAS obsoleto e CAS perdido depois da leitura cobertos. |
| Revisão, mutação e `admin_audit_logs` partilham a mesma transação/sessão. | `VALIDADO_LOCAL` | Fault injection de update e audit confirma rollback total. |
| Repetir `published` não cria revisão nem altera `version`/`publishedAt`. | `VALIDADO_LOCAL` | Negativo idempotente focado. |
| Conteúdo publicado com `mediaStatus: "pending"` continua visível, mas não reproduzível. | `VALIDADO_LOCAL` | `media-boundary.test.js`; zero fonte no serializer público. |

Comando atual: `cd real_dev/backend && node --test tests/unit/catalog-transactions.test.js tests/unit/media-boundary.test.js`
— `14/14` pass, sem DB ou rede. Esta fixture local não é
prova de transações numa topologia MongoDB real, streaming real ou browser E2E.

## Snapshot histórico de 2026-06-29

Daqui até ao fim do documento preserva-se a auditoria original. Paths da
referência privada continuam a ser `REFERENCE` e nunca representam a lane dos
alunos; os `PASS` abaixo não são revalidação atual.

- `bk_id`: `BK-MF8-05`
- `macro`: `MF8`
- `data`: `2026-06-29`
- `estado`: `PASS_COM_RESSALVAS`
- `decisao`: a area administrativa pode alimentar a matriz final, mantendo ressalvas controladas para browser/E2E completo e documentacao operacional.
- `pr`: `NAO_APLICAVEL`; entrega local de evidence PAP.
- `fonte`: `BK-MF8-05`, `RNF19`, `RNF30`, `PAINEL-READINESS-OPERACIONAL.md`, relatorios MF5/MF6/MF7/MF8.

## Fontes usadas

| Fonte | Caminho | Uso |
| --- | --- | --- |
| Readiness operacional | `docs/evidence/MF8/PAINEL-READINESS-OPERACIONAL.md` | Entrada para sinais de logging, health, riscos e decisao `GO_COM_RESSALVAS`. |
| Hardening MF6 | `docs/evidence/MF6/BK-MF6-03-hardening-seguranca.md` | Prova previa de rotas admin protegidas e logs de auditoria. |
| Navegacao segura MF7 | `docs/evidence/MF7/NAVEGACAO-SEGURA-POR-PERFIL.md` | Prova visual/UX de guardas por sessao e role no frontend. |
| Regressao admin MF8 | `real_dev/backend/tests/regression/mf8-admin-final-audit.test.js` | Prova executavel de 401/403 e auditoria segura. |
| Rotas backend | `real_dev/backend/src/modules/*/*.routes.js` | Inventario de endpoints admin e guards. |
| Rotas frontend | `real_dev/frontend/src/routes/AppRoutes.jsx` | Inventario de paginas admin e guarda visual. |

## Superficie administrativa inventariada

| Superficie | Owner da auditoria | Backend/API | Frontend | Role esperada | Evidence/proof direto | Dados expostos | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Catalogo admin | Matheus/Kaue | `GET/POST/PATCH /api/catalog/*` admin/editorial | `/admin/catalogo` | `admin`, `moderator` | `catalog.routes.js`; `AppRoutes.jsx`; regressao MF8 cobre `GET /api/catalog/admin` com `401/403`. | Metadados de conteudo; sem passwords, cookies ou tokens. | `PASS` |
| Utilizadores | Matheus/Kaue | `GET /api/users`, `PATCH /api/users/:id/role`, `PATCH /api/users/:id/admin` | `/admin/utilizadores` | `admin` | `user.routes.js`; `user.service.js`; regressao MF8 cobre `GET /api/users` com `401/403` e `user.admin_update` em `admin_audit_logs`. | Perfil publico e estado operacional; `passwordHash` excluido. | `PASS` |
| Metricas agregadas | Matheus/Kaue | `GET /api/admin/metrics` | `/admin/metricas` | `admin` | `admin-metrics.routes.js`; regressao MF8 cobre `GET /api/admin/metrics` com `401/403`. | Totais agregados de utilizadores, catalogo, subscricoes e pool. | `PASS` |
| Integracoes controladas | Matheus/Kaue | `GET/PATCH /api/admin/integrations` | `/admin/integracoes` | `admin` | `integrations.routes.js`; `integrations.validation.js`; regressao MF8 cobre `GET/PATCH /api/admin/integrations` e `integration.update` seguro. | Chaves publicas permitidas e nomes de variaveis, sem valores secretos. | `PASS` |
| Candidaturas associacoes | Matheus/Kaue | `GET/PATCH /api/charities/applications*` | `/admin/charity-applications` | `admin` | `charities.routes.js`; regressao MF8 cobre `GET /api/charities/applications` com `401/403`; evidencias MF4/MF6 complementam fluxo. | Dados de candidatura necessarios a decisao. | `PASS_COM_RESSALVAS` |
| Pool solidaria | Matheus/Kaue | `/api/charities/pool/*`, `/api/charities/:id/members` | `/admin/pool/*`, `/admin/charity-members` | `admin` | `charities.routes.js`; regressao MF8 cobre dashboard/distribuicao da pool com `401/403`; evidencias MF4/MF5 complementam historico. | Totais e historico operacional; associacao tem historico autenticado proprio. | `PASS_COM_RESSALVAS` |

## Matriz de permissoes e negativos

| Perfil | Resultado esperado | Proof | Negativo | Estado |
| --- | --- | --- | --- | --- |
| Visitante sem sessao | Recebe `401` em rotas administrativas. | `npm --prefix real_dev/backend test -- tests/regression/mf8-admin-final-audit.test.js` cobre `GET /api/users`, `/api/admin/metrics`, `/api/admin/integrations`, `/api/catalog/admin`, `/api/charities/applications`, `/api/charities/pool/dashboard`, `POST /api/charities/pool/distributions` e `PATCH /api/admin/integrations/simulated_payments`. | Qualquer `200` anonimo em rota admin passa a `FAIL`. | `PASS` |
| Utilizador comum | Recebe `403` nas mesmas rotas administrativas. | A mesma regressao usa cookie de sessao valido com role `user`. | Role `user` executar acao admin passa a `FAIL`. | `PASS` |
| Moderador | Acesso limitado a catalogo admin; sem acesso a utilizadores, metricas, integracoes e pool. | Contrato em `catalog.routes.js` usa `requireRole(["admin", "moderator"])`; restantes rotas usam `requireRole(["admin"])`. | Moderador gerir users/integracoes/pool passa a `FAIL`. | `PASS_COM_RESSALVAS` |
| Admin | Pode executar superficies administrativas previstas, com validacao backend. | Services existentes de users, metrics, integrations, charities e catalog preservados; regressao MF8 valida auditoria de users/integrations. | Admin sem log de auditoria em operacao critica passa a ressalva ou `FAIL`, conforme impacto. | `PASS_COM_RESSALVAS` |

## Logs e auditoria

| Evento | Origem | Campos seguros | Campos proibidos | Proof | Estado |
| --- | --- | --- | --- | --- | --- |
| `http_request` | `request-logger.middleware.js` | `requestId`, metodo, path, status, duracao. | Password, cookie, token, authorization. | Logger estruturado redige chaves sensiveis. | `PASS` |
| `user.admin_update` | `users.service.js` | `actorUserId`, `targetUserId`, `changes`, `createdAt`. | `passwordHash`, password em claro, cookie, token. | Regressao MF8 verifica entrada em `admin_audit_logs` sem fragmentos sensiveis. | `PASS` |
| `integration.update` | `integrations.service.js` | `actorUserId`, `targetKey`, modo, enabled e publicConfig validada. | API key, secret, bearer token, connection string. | Validador rejeita chaves/valores sensiveis; regressao MF8 confirma log seguro. | `PASS` |
| Revisao de associacoes e pool | `charities` services | Decisao, motivo controlado, mes, totais e ids tecnicos. | Dados financeiros reais, tokens, cookies ou segredos. | Cobertura MF4/MF6 existente e protecao por role admin. | `PASS_COM_RESSALVAS` |

## Configuracao administrativa

| Area | Regra | Proof | Negativo | Estado |
| --- | --- | --- | --- | --- |
| Variaveis de ambiente | A evidence lista nomes ou finalidade, nunca valores. | `PAINEL-READINESS-OPERACIONAL.md` ja separa configuracao de segredos. | Valor real de segredo escrito na evidence passa a `FAIL`. | `PASS` |
| Integracoes | Lista fechada em `INTEGRATION_DEFINITIONS`; publicConfig filtrada. | Validador recusa `apiKey`, `secret`, `token`, `password`, bearer e connection strings. | Gateway real inventado ou segredo guardado em publicConfig passa a `FAIL`. | `PASS` |
| Pagamentos | Continua simulacao controlada no MVP. | `simulated_payments` e services MF4/MF5. | Stripe, PayPal, MB Way ou webhooks reais sem contrato documental passam a `FAIL`. | `PASS` |

## Dados sensiveis e exposicao indevida

| Dado | Visibilidade esperada | Fonte | Negativo | Estado |
| --- | --- | --- | --- | --- |
| Password/hash | Nunca exposto em API/evidence/logs. | `user.service.js` exclui `passwordHash`; logger redige chaves sensiveis. | `passwordHash` em resposta admin passa a `FAIL`. | `PASS` |
| Sessao/cookie/token | Cookie HttpOnly; frontend nao guarda token. | `session.js`, `apiClient.js`, pesquisa estatica MF8. | Sessao em `localStorage` ou `sessionStorage` passa a `FAIL`. | `PASS` |
| Associacao/pool | Admin ve operacao global; associacao autenticada ve historico proprio. | Routes `charities` e relatorios MF4/MF5. | Associacao ver dados globais sem role admin passa a `FAIL`. | `PASS_COM_RESSALVAS` |
| Metricas | Agregadas, sem dados pessoais linha a linha. | `admin-metrics.service.js`. | Painel de metricas devolver emails/listas pessoais passa a `FAIL`. | `PASS` |

## Estado por passo do BK

| Passo | pr | proof | neg | fonte | Decisao |
| --- | --- | --- | --- | --- | --- |
| 1. Inventariar superficie administrativa | `NAO_APLICAVEL` | Tabela de superficies acima. | Rota admin sem classificacao. | `BK-MF8-05`; `AppRoutes.jsx`; routes backend. | `PASS` |
| 2. Validar permissoes e rotas protegidas | `NAO_APLICAVEL` | Regressao MF8 cobre visitantes e role `user`. | `200` anonimo/user em rota admin. | `RNF19`; `RNF30`. | `PASS` |
| 3. Rever logs e auditoria aplicavel | `NAO_APLICAVEL` | `admin_audit_logs` para users/integrations e logger redigido. | Password/cookie/token em logs. | `RNF19`; `RNF30`. | `PASS_COM_RESSALVAS` |
| 4. Rever configuracao administrativa | `NAO_APLICAVEL` | Integracoes com lista fechada e publicConfig validada. | Segredo em config publica. | `RNF17`; `RNF19`. | `PASS` |
| 5. Registar checks de dados sensiveis | `NAO_APLICAVEL` | Matriz de dados sensiveis acima. | Campo sensivel sem owner/permissao. | `RNF15`; `RNF17`; `RNF19`. | `PASS_COM_RESSALVAS` |
| 6. Fechar criterios de seguranca administrativa | `NAO_APLICAVEL` | Sem finding P0/P1; ressalvas classificadas. | Criterio P0/P1 sem negativo. | `BK-MF8-05`. | `PASS_COM_RESSALVAS` |
| 7. Entregar entrada para matriz final | `NAO_APLICAVEL` | Esta evidence entrega decisoes, ressalvas e riscos para `BK-MF8-06`. | Falha sem classificacao bloqueia matriz final. | `BK-MF8-06`. | `PASS` |

## Ressalvas controladas

| Ressalva | Impacto | Owner | Destino |
| --- | --- | --- | --- |
| Auditoria manual/browser completa da area admin ainda nao substituida por E2E autenticado. | Pode haver diferenca visual/UX nao apanhada por regressao backend. | Matheus/Kaue | `BK-MF8-08` execucao de testes. |
| Logs de auditoria estao provados para users/integrations; associacoes/pool dependem de cobertura MF4/MF5 e revisao estatica. | Requer revisao final se a equipa elevar estado de `PASS_COM_RESSALVAS` para `PASS`. | Kaue | `BK-MF8-07` lista de riscos. |
| Readiness global ja traz ressalva de rollback/deployment formal. | Nao bloqueia auditoria admin, mas impede `GO` pleno. | Matheus | `BK-MF8-07` e `BK-MF8-10`. |

## Handoff para BK-MF8-06

- Decisao administrativa: `PASS_COM_RESSALVAS`.
- Sem findings P0/P1 confirmados.
- Prova principal nova: `real_dev/backend/tests/regression/mf8-admin-final-audit.test.js`.
- A matriz final deve consumir esta evidence como fonte de `RNF19` e `RNF30`.
- Riscos a transportar: browser/E2E admin completo, cobertura de auditoria em associacoes/pool e rollback/deployment formal.
