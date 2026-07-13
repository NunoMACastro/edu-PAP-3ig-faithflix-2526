# Auditoria end-to-end e UI/UX — Privacidade e consentimentos

- Data: 2026-07-13
- Sistema: Privacidade e consentimentos
- Slug: `PRIVACIDADE-CONSENTIMENTOS`
- Implementação auditada: `real_dev/backend` e `real_dev/frontend`
- Modo: auditoria inicial seguida de correção autorizada
- Decisão final: `PASS`
- Findings abertos: `P0=0`, `P1=0`, `P2=0`, `P3=0`
- Findings resolvidos: `P3=2`
- UI/UX: aplicável e validada com API sintética exclusivamente local
- Contexto: PAP; avaliação proporcional ao MVP e à operação local documentada

## 1. Resumo executivo

O sistema cobre as três jornadas funcionais prometidas por `RF55`–`RF57`:
exportação dos dados do próprio utilizador, eliminação da própria conta e gestão
versionada de consentimentos. A rota `/conta` liga os três painéis ao cliente HTTP
central; o backend usa exclusivamente o id da sessão, exige autenticação e CSRF
nas mutações, valida tipos fechados e executa as alterações críticas em transações
MongoDB obrigatórias.

A exportação agrega o perfil e 15 secções de dados próprios, incluindo a ligação a
associação e as memberships familiares em que o utilizador é owner ou membro. A
serialização converte ids/datas e remove recursivamente chaves sensíveis conhecidas.
A eliminação exige a frase exata `ELIMINAR CONTA` e a password atual, protege o
último administrador ativo, revoga sessões, remove dados pessoais diretos,
anonimiza comentários, cancela a subscrição, invalida partilhas familiares,
pseudonimiza o ledger financeiro retido e anonimiza a conta no mesmo commit.

Os consentimentos atuais têm uma linha única por utilizador e cada atualização
confirmada cria um evento histórico na mesma transação. Os três consumidores
auditados leem o estado canónico: recomendações pessoais só usam sinais com opt-in,
alertas opcionais respeitam `operationalNotifications` e métricas anónimas só são
persistidas com `anonymousMetrics=true`, sem guardar o id do utilizador.

Os gates executados passaram: backend completo `373/373`, frontend completo
`299/299`, segurança `12/12` com baseline `PASS`, lint, build, smoke `8/8` e
Axe/reflow `35/35`. A área de conta foi ainda inspecionada no browser em
`390x844`, `768x900` e `1280x720`, com API sintética loopback e sem acesso à base:
não existiu overflow horizontal, os painéis mantiveram-se utilizáveis, o opt-out
foi guardado com feedback, a ação destrutiva permaneceu disabled sem as duas provas
e não surgiram erros de consola.

Os dois findings P3 foram resolvidos. A opção passou a chamar-se `Alertas
opcionais de continuidade` e o painel explica que os avisos essenciais de
segurança, subscrição e conta permanecem ativos. Foi também adicionada uma suite
HTTP dedicada `5/5`, com DB/transaction double local, que atravessa router,
autenticação, CSRF, controller, service, envelope e cookie nas três jornadas,
incluindo negativos sem efeitos. O E2E formal com MongoDB real não pôde ser
executado porque `TEST_MONGODB_URI` não está configurada para uma base local
isolada `_e2e`; este bloqueio ambiental permanece registado como risco residual.

## 2. Scope incluído e excluído

### Incluído

- `RF55`, `RF56`, `RF57`, `RNF15`, `RNF16`, `RNF17` e `RNF37`;
- navegação autenticada para `/conta` e os painéis de privacidade;
- `GET /api/privacy/export`;
- `DELETE /api/privacy/account`;
- `GET /api/privacy/consents` e `PUT /api/privacy/consents`;
- cliente API, cookies, CSRF, CORS, timeout, cancelamento e normalização de erros;
- ownership, validação, mass assignment, password atual, rate limiting e
  proteção do último administrador;
- exportação, anonimização, retenção financeira, revogação de sessões e família;
- consentimentos atuais, histórico e consumidores em recomendações, notificações
  e métricas anónimas;
- UI/UX, estados assíncronos, responsividade, teclado, semântica e Axe;
- testes unitários, integração de segurança, smoke, build e browser local.

### Excluído

- alteração de requisitos, planos, BKs ou evidências anteriores;
- administração de utilizadores e preferências funcionais de canais, exceto como
  consumidores diretos dos consentimentos;
- autenticação e lifecycle geral da sessão, já auditados no sistema próprio;
- funcionamento interno de recomendações, notificações, subscrições e família
  para além das fronteiras de privacidade consumidas;
- dados pessoais reais, mutações na base configurada, seeds e reset de dados;
- validação formal E2E sem uma base local `_e2e` explicitamente configurada;
- browsers físicos, produção, infraestrutura enterprise e aconselhamento jurídico.

O `README.md`, `tests/e2e/mf2-flow.spec.js` e dois relatórios em
`docs/evidence/audits/` já estavam modificados ou não rastreados antes da auditoria
e foram preservados.

## 3. Fontes e ficheiros consultados

### Contratos e arquitetura

- `README.md`
- `ARCHITECTURE.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/guias-bk/MF5/BK-MF5-01-exportacao-dados-utilizador.md`
- `docs/planificacao/guias-bk/MF5/BK-MF5-02-eliminacao-conta-dados.md`
- `docs/planificacao/guias-bk/MF5/BK-MF5-03-gestao-consentimentos.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF5.md`

### Backend

- `real_dev/backend/src/app.js`
- `real_dev/backend/src/server.js`
- `real_dev/backend/src/bootstrap/ensure-application-indexes.js`
- `real_dev/backend/src/config/database.js`
- `real_dev/backend/src/modules/privacy/privacy.routes.js`
- `real_dev/backend/src/modules/privacy/privacy.controller.js`
- `real_dev/backend/src/modules/privacy/privacy.validation.js`
- `real_dev/backend/src/modules/privacy/privacy.service.js`
- `real_dev/backend/src/modules/auth/auth.middleware.js`
- `real_dev/backend/src/middlewares/csrf.middleware.js`
- `real_dev/backend/src/middlewares/rate-limit.middleware.js`
- `real_dev/backend/src/modules/recommendations/recommendations.service.js`
- `real_dev/backend/src/modules/notifications/notifications.service.js`
- `real_dev/backend/src/modules/analytics/analytics.service.js`
- `real_dev/backend/src/modules/subscriptions/subscriptions.service.js`
- `real_dev/backend/src/modules/users/admin-invariant.service.js`

### Frontend

- `real_dev/frontend/src/routes/AppRoutes.jsx`
- `real_dev/frontend/src/pages/AccountPage.jsx`
- `real_dev/frontend/src/components/privacy/PrivacyExportPanel.jsx`
- `real_dev/frontend/src/components/privacy/PrivacyConsentsPanel.jsx`
- `real_dev/frontend/src/components/privacy/PrivacyDangerZone.jsx`
- `real_dev/frontend/src/services/api/apiClient.js`
- `real_dev/frontend/src/services/api/privacyApi.js`
- `real_dev/frontend/src/styles/global.css`

### Testes e harnesses

- `real_dev/backend/tests/unit/mf5-validation.test.js`
- `real_dev/backend/tests/unit/mf9-subscriptions.test.js`
- `real_dev/backend/tests/unit/security-controls.test.js`
- `real_dev/backend/tests/unit/integrations-analytics-mailbox.test.js`
- `real_dev/backend/tests/unit/mf10-biblical-embeddings.test.js`
- `real_dev/backend/tests/integration/security-http.test.js`
- `real_dev/backend/tests/integration/privacy-http.test.js`
- `real_dev/frontend/src/components/privacy/*.test.jsx`
- `real_dev/frontend/src/services/api/privacyDiscoveryApis.test.js`
- `real_dev/frontend/tests/a11y/accessibility.spec.js`
- `tests/e2e/coverage-manifest.js`
- `tests/e2e/f7-critical-read-only.spec.js`
- `scripts/e2e-environment.mjs`

## 4. Mapa do sistema

| Elemento | Classificação | Evidência e papel no fluxo |
| --- | --- | --- |
| Ator `user`, `moderator` ou `admin` autenticado | `IMPLEMENTADO_E_LIGADO` | Qualquer conta operacional pode gerir a própria privacidade; não existe alteração administrativa de consentimentos. |
| Rota frontend `/conta` | `IMPLEMENTADO_E_LIGADO` | Protegida por `AuthenticatedRoute`; inclui perfil, plano e os três painéis de privacidade. |
| `PrivacyExportPanel` | `IMPLEMENTADO_E_LIGADO` | Pedido cancelável, duplo submit bloqueado, JSON descarregado localmente e feedback acessível. |
| `PrivacyConsentsPanel` | `IMPLEMENTADO_E_LIGADO` | Leitura inicial, retry, snapshot confirmado, rollback visual em erro, bloqueio durante escrita e feedback. |
| `PrivacyDangerZone` | `IMPLEMENTADO_E_LIGADO` | Confirmação textual, password atual, estado disabled, feedback de erro, limpeza da sessão e redirect. |
| `privacyApi` e `apiClient` | `IMPLEMENTADO_E_LIGADO` | Cookies com `credentials=include`, CSRF em métodos inseguros, timeout de 10 s, retry único do token e erro normalizado. |
| `GET /api/privacy/export` | `IMPLEMENTADO_E_LIGADO` | `requireAuth`; ownership derivado de `req.user.id`; resposta privada/no-store. |
| `DELETE /api/privacy/account` | `IMPLEMENTADO_E_LIGADO` | Auth, limites cumulativos por user/IP, CSRF global, password e transação. |
| `GET/PUT /api/privacy/consents` | `IMPLEMENTADO_E_LIGADO` | Auth, CSRF no PUT, allowlist de três booleanos e resposta canónica. |
| `privacy.controller` | `IMPLEMENTADO_E_LIGADO` | Não aceita `userId` do body/query; limpa o cookie apenas depois da eliminação confirmada. |
| `privacy.service` | `IMPLEMENTADO_E_LIGADO` | Exportação, eliminação e consentimentos; transações e proteção de concorrência na conta. |
| `users` | `IMPLEMENTADO_E_LIGADO` | Fonte do perfil; na eliminação conserva id técnico e substitui nome/email/password/role/status. |
| 15 secções da exportação | `IMPLEMENTADO_E_LIGADO` | 14 coleções por `userId` mais `subscription_family_memberships` por owner/member. |
| `user_consents` | `IMPLEMENTADO_E_LIGADO` | Índice único por `userId`; snapshot atual versionado. |
| `user_consent_events` | `IMPLEMENTADO_E_LIGADO` | Histórico por utilizador, gravado na mesma transação da atualização. |
| `privacy_deletion_requests` | `INTERNO_OPERACIONAL` | Evidência minimizada do pedido, sem guardar email, password ou payload. |
| `sessions` e reset/outbox | `IMPLEMENTADO_E_LIGADO` | Sessões e tokens/outbox pessoais são removidos na eliminação. |
| Comentários | `IMPLEMENTADO_E_LIGADO` | Conteúdo público preservado com corpo/autor anonimizados e sem `userId`/email. |
| Subscrição, pagamentos e família | `IMPLEMENTADO_E_LIGADO` | Subscrição cancelada, contactos financeiros removidos e memberships invalidadas. |
| Recomendações | `IMPLEMENTADO_E_LIGADO` | Sem opt-in, não carrega sinais pessoais e devolve cold start com parental. |
| Notificações | `IMPLEMENTADO_E_LIGADO` | Consentimento bloqueia apenas `continue_watching`; eventos essenciais continuam. |
| Métricas anónimas | `IMPLEMENTADO_E_LIGADO` | Opt-in obrigatório; persiste apenas tipo, categoria, dia UTC e TTL, nunca `userId`. |
| Jobs, filas e integrações externas | `NAO_APLICAVEL` | As três operações são síncronas e locais; não existe provider externo nesta fronteira. |
| Health/readiness e logs | `INTERNO_OPERACIONAL` | Readiness valida Mongo; logs estruturados usam request id e não registam bodies. |
| UI com fixtures loopback | `SIMULADO_OU_DEMO` | Serve apenas para renderização e interação visual sem persistência. |
| E2E formal com Mongo `_e2e` | `BLOQUEADO_POR_AMBIENTE` | Guard recusou a execução sem `TEST_MONGODB_URI`. |

## 5. Matriz de jornadas

| Jornada | Ator | Frontend | API/backend | Dados/efeitos | Negativos | UI/UX | Testes | Estado |
| ------- | ---- | -------- | ----------- | ------------- | --------- | ----- | ------ | ------ |
| Descobrir privacidade em `/conta` | Conta autenticada | Ligado | Sessão revalidada | Sem escrita | Anónimo redirecionado | Responsivo e acessível | Unit + Axe/browser | `PASS` |
| Exportar dados próprios | Conta autenticada | Download JSON e feedback | `GET /export`, ownership server-side | Perfil + 15 secções, sanitização recursiva | 401; dados de outro user filtrados | Loading, erro, retry e abort | Unit FE/BE + HTTP dedicado | `PASS` |
| Ler consentimentos | Conta autenticada | Estado e retry | `GET /consents` | Defaults ou snapshot atual | 401; sem userId externo | Loading/erro acessíveis | Unit + E2E read-only | `PASS` |
| Atualizar consentimentos | Conta autenticada | Snapshot, rollback e bloqueio | `PUT /consents`, CSRF e booleanos fechados | Upsert único + evento no mesmo commit | Tipos errados 400; CSRF 403; resposta stale ignorada | Copy explicita fronteira e avisos essenciais | Unit + browser sintético + HTTP dedicado | `PASS` |
| Aplicar consentimento às recomendações | Conta autenticada | `/para-si` | Leitura canónica a cada pedido | Sem sinais pessoais no opt-out | Cold start e parental fail-closed | Sem detalhe técnico exposto | Unit consumidor | `PASS` |
| Aplicar consentimento a alertas opcionais | Conta autenticada | Opção na conta | Leitura canónica no evento | `continue_watching` omitido; essencial preservado | Opt-out posterior não usa snapshot UI | Copy distingue alertas opcionais de avisos essenciais | Unit consumidor + componente | `PASS` |
| Aplicar consentimento a métricas | Conta autenticada | Eventos neutros | Resposta 204 indistinguível | Escrita anónima apenas no opt-in | Opt-out não persiste | Sem exposição do estado | Unit consumidor | `PASS` |
| Eliminar a própria conta | Conta autenticada | Frase + password e botão disabled | `DELETE /account`, CSRF, rate limit, password | Revogação, limpeza, anonimização e retenção no mesmo commit | Frase/password inválidas; conta concorrente; último admin | Zona de perigo clara e responsiva | Unit BE/FE + HTTP válido/password inválida | `PASS` |
| Reentrada depois da eliminação | Conta eliminada | Limpa contexto e vai para `/login` | Cookie limpo; sessões removidas | Conta `deleted`, sem password | Sessão antiga deixa de resolver | Redirect confirmado | Unit FE/BE | `PASS` |

## 6. Contratos entre camadas

| Operação | Request | Sucesso | Negativos relevantes |
| --- | --- | --- | --- |
| Exportar | `GET /api/privacy/export`; cookie de sessão | `200 { export: { generatedAt, user, sections } }` | `401 AUTH_REQUIRED`; `404` se o utilizador já não existir |
| Eliminar | `DELETE /api/privacy/account`; JSON `{ confirmation, password }`; cookie + CSRF | `200 { deleted: true, removed, commentsAnonymized, subscriptionsCanceled, familyMembershipsUpdated }`; `Set-Cookie` de limpeza | `400` confirmação/password estrutural; `403 CURRENT_PASSWORD_INVALID`; `409 ACCOUNT_STATE_CHANGED`/último admin; `429 RATE_LIMITED` |
| Ler consentimentos | `GET /api/privacy/consents`; cookie | `200 { consentState: { version, consents, updatedAt } }` | `401 AUTH_REQUIRED` |
| Atualizar consentimentos | `PUT /api/privacy/consents`; três booleanos; cookie + CSRF | mesmo envelope com estado confirmado | `400` para shape/tipos; `403 CSRF_INVALID`; `401 AUTH_REQUIRED` |

O frontend e o backend coincidem em métodos, paths, envelopes e nomes dos campos.
O cliente não envia ids de utilizador, usa `credentials: include`, acrescenta
`X-CSRF-Token` aos métodos inseguros e renova esse token no máximo uma vez.

## 7. Segurança e privacidade

- **Autenticação e ownership:** todas as rotas usam `requireAuth`; o id vem de
  `req.user.id`. Não foi encontrado caminho IDOR/BOLA ou mass assignment.
- **CSRF/CORS/cookies:** as mutações passam pelo middleware CSRF global e o cliente
  usa cookie de sessão. As respostas autenticadas são `private, no-store` e variam
  por `Cookie`.
- **Validação:** a confirmação é exata, a password tem limites explícitos e os
  consentimentos aceitam apenas os três booleanos declarados. Campos livres não
  são copiados para o documento persistido.
- **Rate limiting:** eliminação limitada a 5 pedidos/15 min por utilizador e
  20/hora por IP, com chaves HMAC persistidas e TTL.
- **Concorrência:** a passwordHash é revalidada dentro da transação; estado de conta
  mudado falha com `409`; o último administrador ativo é preservado.
- **Atomicidade:** startup recusa topologias sem transações; a aplicação real não
  tem fallback não transacional. Limpeza, revogação, retenção e anonimização são
  uma única unidade.
- **Minimização:** a exportação exclui chaves sensíveis conhecidas; métricas
  anónimas não guardam `userId`; o pedido de eliminação não conserva credenciais.
- **Retenção:** pagamentos e subscrições são preservados apenas como histórico
  operacional/financeiro pseudonimizado; comentários públicos ficam anónimos.
- **Segredos e logs:** configuração sensível permanece em env; o request logger não
  regista bodies e o error handler esconde detalhes internos em 5xx.
- **Integrações externas:** não foram encontrados providers externos ativos nesta
  fronteira. Embeddings opcionais usam apenas texto editorial e não perfis pessoais.

Não foi criada vulnerabilidade por correspondência textual: os controlos acima
foram confirmados no encadeamento de middlewares, services e testes atuais.

## 8. Dados, transações e operação

- `user_consents.userId` tem índice único e o histórico tem índice
  `{ userId, changedAt }`.
- A exportação ordena documentos por `createdAt` descendente e normaliza
  `ObjectId`/`Date` para strings JSON.
- A eliminação distingue dados removíveis, conteúdo público anonimizável e
  histórico financeiro retido/pseudonimizado.
- Memberships familiares são encontradas por `ownerUserId`, `memberUserId` ou
  email de convite, marcadas como `removed` e privadas de campos de contacto.
- Sessões e tokens/outboxes pessoais são removidos antes do commit; a conta perde
  `passwordHash`, passa a `deleted` e a role `user`.
- Não existem jobs assíncronos nesta operação; o resultado HTTP só é devolvido
  depois do commit.
- Os índices são criados antes do `listen`; liveness e readiness distinguem
  processo vivo de dependência MongoDB.
- O endpoint de exportação não pagina. No volume esperado da PAP isto é um risco
  proporcional aceite, não um finding atual; uma exportação assíncrona seria
  evolução pós-PAP apenas se o volume real o exigisse.

## 9. UI/UX e acessibilidade

### Resultado confirmado

- a funcionalidade é descoberta em `/conta`, dentro da secção `Dados e
  consentimentos`, sem rota morta ou ação inacessível;
- exportação tem loading, disabled, sucesso, erro, retry e cancelamento ao desmontar;
- consentimentos têm loading inicial, retry, bloqueio de escrita, rollback para o
  último estado confirmado, feedback `role=status`/`role=alert` e data PT-PT;
- a opção `Alertas opcionais de continuidade` explica que avisos essenciais de
  segurança, subscrição e conta permanecem ativos depois do opt-out;
- eliminação exige frase exata e password, mantém o botão disabled sem ambas e
  limpa sessão/redirect apenas depois da resposta de sucesso;
- labels estão associadas aos inputs, a ordem semântica é coerente e os switches
  são operáveis por teclado através dos labels;
- os três painéis ocupam duas colunas em desktop e uma coluna abaixo de 900 px;
- browser manual: sem overflow em `390x844`, `768x900` e `1280x720`; larguras dos
  painéis dentro do viewport; zero erros de consola;
- Axe/reflow: `35/35`, incluindo `/conta` mobile e inspeção desktop da página;
- não foram observadas violações Axe `serious` ou `critical`.

### Limites da validação visual

- o browser usou dados sintéticos e API loopback, sem MongoDB ou dados pessoais;
- o gate automatizado usa Chromium; não houve inspeção manual em dispositivos
  físicos, Firefox ou WebKit;
- screenshots foram apenas temporárias e não foram publicadas no repositório.

## 10. Testes e comandos executados

| Diretório | Comando | Exit | Resultado |
| --- | --- | ---: | --- |
| `real_dev/backend` | `node --test tests/unit/mf5-validation.test.js tests/unit/mf9-subscriptions.test.js tests/unit/security-controls.test.js tests/unit/integrations-analytics-mailbox.test.js tests/unit/mf10-biblical-embeddings.test.js` | 0 | `59/59` |
| `real_dev/frontend` | `npx vitest run` sobre os 3 painéis e `privacyDiscoveryApis` | 0 | `11/11` |
| `real_dev/backend` | `node --test tests/integration/privacy-http.test.js` fora da sandbox | 0 | `5/5`; auth, exportação, consentimentos, CSRF/password e eliminação/cookie |
| `real_dev/frontend` | `npm run lint` | 0 | sem warnings/erros |
| `real_dev/backend` | `npm test` fora da sandbox | 0 | `373/373` |
| `real_dev/frontend` | `npm run test:unit -- --reporter=dot` | 0 | `299/299`; warnings React Router/`act` fora do sistema auditado |
| raiz | `npm run test:security` | 0 | `12/12`; `Hardening MF6: PASS` |
| raiz | `npm run test:a11y` na sandbox | 1 | bloqueio ambiental `listen EPERM 127.0.0.1:5183` |
| raiz | `npm run test:a11y` fora da sandbox | 0 | build + `35/35` Axe/reflow |
| raiz | `npm run smoke` na sandbox | 1 | `8/8` bloqueados por `listen EPERM 127.0.0.1` |
| raiz | `npm run smoke` fora da sandbox | 0 | backend `8/8` + frontend build |
| raiz | `env NODE_ENV=test node scripts/e2e-environment.mjs` | 1 | bloqueado: `TEST_MONGODB_URI` não definida |
| browser local | preview `5184` + API sintética `3199` | 0 | 3 viewports, opt-out, disabled destrutivo e consola sem erros |
| raiz | `git diff --check` e whitespace nos relatórios existentes | 0 | sem problemas nos ficheiros aplicáveis |

Os avisos de chunk size do build referem `hls`/`dash` e não quebram esta jornada.
Não foram instaladas dependências nem regenerados snapshots.

## 11. Findings

### [P3] PRIVACIDADE-CONSENTIMENTOS-UIUX-001 — Opt-out de alertas opcionais era apresentado como “Notificações da conta”

- Estado: RESOLVIDO em 2026-07-13
- Área: UI/UX
- Evidência: `real_dev/frontend/src/components/privacy/PrivacyConsentsPanel.jsx:9-13` e `:169-199`; `docs/RF.md:374-375`; browser em `/conta` nos três viewports
- Percurso afetado: utilizador autenticado → conta → consentimentos → desligar notificações
- Pré-condições: sessão operacional e painel de consentimentos carregado
- Passos de reprodução:
    1. Abrir `/conta`.
    2. Navegar até `Dados e consentimentos`.
    3. Ler a opção `Notificações da conta` e desligá-la.
    4. Comparar a promessa visual com o comportamento do backend.
- Resultado atual: a label sugere que todas as notificações da conta são
  desligadas, mas o backend omite apenas alertas opcionais como
  `continue_watching`; eventos transacionais essenciais continuam ativos.
- Resultado esperado: a interface deve dizer que controla apenas alertas
  operacionais opcionais e explicar, de forma curta, que avisos essenciais de
  segurança, subscrição ou conta continuam a ser enviados.
- Causa-raiz: a copy foi simplificada de `Notificações operacionais` para
  `Notificações da conta` sem preservar a fronteira funcional do consentimento.
- Impacto: o utilizador pode tomar uma decisão de privacidade com uma expectativa
  incorreta sobre o alcance do opt-out. Não existe perda de dados nem exposição.
- Correção recomendada: alteração mínima de copy, por exemplo
  `Alertas opcionais de continuidade`, com ajuda explícita sobre eventos essenciais;
  não alterar o backend nem criar nova preferência.
- Validação recomendada: teste de componente para a nova descrição, inspeção
  teclado/leitor de ecrã e confirmação de que `operationalNotifications=false`
  continua a preservar eventos transacionais.
- Correção aplicada: label alterada para `Alertas opcionais de continuidade` e
  ajuda explícita adicionada sem alterar o contrato nem criar uma preferência.
- Validação pós-correção: teste de componente `5/5`, frontend completo `299/299`,
  lint, build e Axe/reflow `35/35`.

### [P3] PRIVACIDADE-CONSENTIMENTOS-E2E-002 — Não existe prova HTTP positiva dedicada para as operações de privacidade

- Estado: RESOLVIDO em 2026-07-13
- Área: testes
- Evidência: `tests/e2e/coverage-manifest.js:18-22` declara a lane read-only;
  `tests/e2e/f7-critical-read-only.spec.js:44-75` prova apenas GET de consentimentos
  e rejeição CSRF; a pesquisa nos testes HTTP não encontrou exportação, PUT válido
  ou DELETE de conta
- Percurso afetado: utilizador autenticado → cliente HTTP → middleware → controller
  → service → cookie/resposta
- Pré-condições: execução das suites atuais sem uma base `_e2e` dedicada
- Passos de reprodução:
    1. Executar as suites unitárias e de segurança atuais.
    2. Procurar testes HTTP para `/api/privacy/export`, PUT válido de consentimentos
       e `/api/privacy/account`.
    3. Inspecionar o manifesto e o sweep `f7-critical-read-only`.
- Resultado atual: services e componentes têm boa cobertura e o E2E prova leitura
  e CSRF negativo, mas nenhum teste atravessa com sucesso router, auth, CSRF,
  controller, envelope e cookie nas três jornadas.
- Resultado esperado: pelo menos uma suite HTTP local controlada deve provar
  exportação própria, PUT válido/invalidado e eliminação com password errada sem
  efeitos; a eliminação válida pode permanecer numa DB `_e2e` isolada.
- Causa-raiz: a lane formal de privacidade foi deliberadamente limitada a leitura
  e rejeição CSRF, ficando o caminho positivo repartido entre testes unitários.
- Impacto: uma regressão de método/path, montagem, envelope, `Set-Cookie` ou
  composição de middlewares pode passar mesmo com os services e componentes verdes.
- Correção recomendada: adicionar um teste de integração HTTP com DB/transaction
  double e fixtures locais, sem dependências novas, cobrindo os três endpoints e
  os negativos de auth/CSRF/password; reservar a mutação persistente completa à
  base `_e2e` dedicada.
- Validação recomendada: nova suite HTTP verde e execução de
  `tests/e2e/f7-critical-read-only.spec.js` quando `TEST_MONGODB_URI`/DB `_e2e`
  estiverem disponíveis.
- Correção aplicada: adicionada `privacy-http.test.js` com um double Mongo local e
  sem dependências novas. A suite cobre anónimo `401`, exportação própria
  sanitizada, PUT válido e payload inválido, password incorreta sem efeitos e
  eliminação válida com limpeza do cookie e preservação de sessão alheia.
- Validação pós-correção: suite dedicada `5/5`, backend completo `373/373` e gate
  de segurança `12/12` com `Hardening MF6: PASS`.

## 12. Riscos e validações bloqueadas

- **E2E formal:** `NODE_ENV=test` passou o primeiro guard, mas a execução parou
  antes de build/servidores/seeds porque `TEST_MONGODB_URI` não está definida.
  Não se reutilizou a base normal nem se simulou sucesso.
- **MongoDB real:** não foi executada eliminação contra dados persistidos. A
  atomicidade foi confirmada por código, guard de startup e doubles de teste.
- **Cross-browser/dispositivos:** Axe/browser foram executados em Chromium local;
  Firefox, WebKit e dispositivos físicos ficaram pendentes.
- **Volume da exportação:** a resposta é síncrona e não paginada. É adequada ao
  volume esperado da PAP, mas deve ser reavaliada se o dataset crescer muito.
- **Retenção:** o sistema distingue remoção e retenção financeira técnica, mas não
  implementa um motor jurídico configurável de prazos. Isso é evolução pós-PAP,
  não finding do requisito atual.

## 13. Conclusão e decisão final

**Decisão: `PASS`.**

O fluxo principal está implementado e coerente entre interface, transporte,
autorização, validação, persistência e consumidores. Não foram confirmadas falhas
de segurança, ownership, perda de dados ou quebra funcional principal. Os dois P3
foram corrigidos e validados; não permanecem findings abertos entre P0 e P3.

A correção alterou apenas a copy/ajuda do painel de consentimentos, o respetivo
teste de componente, a nova suite HTTP de privacidade e este relatório. Não
alterou requisitos, planos, BKs, dependências ou evidências anteriores.
