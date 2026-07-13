# Auditoria end-to-end e UI/UX — Analytics consentida

- Data: 2026-07-13
- Sistema: Analytics consentida
- Slug: `ANALYTICS-CONSENTIDA`
- Implementação auditada: `real_dev/backend` e `real_dev/frontend`
- Modo: `auditar_apenas`
- Decisão final: `PASS_COM_FINDINGS`
- Findings abertos: `P0=0`, `P1=0`, `P2=1`, `P3=2`
- UI/UX: aplicável e validada em runtime com API sintética exclusivamente local
- Contexto: PAP; avaliação proporcional ao MVP e à operação local documentada

## 1. Resumo executivo

O alvo foi interpretado como a cadeia que começa no consentimento
`anonymousMetrics`, recolhe quatro eventos fechados de catálogo, pesquisa e
reprodução, persiste apenas dimensões anónimas temporárias e apresenta os totais
agregados ao administrador. O painel administrativo geral foi incluído somente
como consumidor desta fatia; as restantes métricas operacionais não foram
reauditadas como sistemas autónomos.

O fluxo principal está implementado e ligado. O utilizador autenticado ativa ou
revoga o consentimento em `/conta`; cada `POST /api/analytics/events` volta a ler
o estado canónico no backend; sem opt-in devolve o mesmo `204` sem escrever; com
opt-in persiste somente `type`, `category` opcional, dia UTC e `expiresAt`. Não são
guardados `userId`, ids/slugs de conteúdo, títulos, query de pesquisa, timestamp
preciso, IP, cookie ou dados enviados a terceiros. Um TTL elimina os documentos
ao fim de 90 dias e um índice suporta agregação por dia/tipo/categoria.

Catálogo, pesquisa e playback emitem eventos através do cliente HTTP central,
com cookie, CSRF, timeout e erro analítico isolado da ação principal. Playback
deduplica `started` e `completed` por conteúdo no ciclo da página. O admin é a
única role autorizada a consultar/exportar métricas; recebe apenas totais por
intervalo civil UTC e o CSV reutiliza o mesmo RBAC e nunca inclui linhas
individuais.

Os gates executados passaram: backend completo `373/373`, frontend completo
`299/299`, testes focados backend `18/18`, frontend `42/42`, segurança `12/12`,
lint, smoke backend `8/8`, build e Axe/reflow `35/35`. A UI foi inspecionada em
`390x844`, `768x900` e `1280x720`, sem overflow ou erros de consola; o opt-in foi
guardado com feedback e os agregados foram apresentados corretamente.

Foram confirmados três findings. Um P2 permite a qualquer conta consentida gerar
escritas ilimitadas e inflacionar métricas porque a rota não tem rate limiting;
uma prova controlada aceitou `250/250` inserts. Um P3 regista que a label
`Partilha de utilização anónima` é ambígua e não explica finalidade, categorias,
retenção ou que o tratamento é local. O outro P3 identifica a ausência de teste
de integração HTTP da rota analítica e de teste de contrato do respetivo cliente.
O E2E formal com MongoDB ficou bloqueado antes de servidores/seeds porque
`TEST_MONGODB_URI` não está configurada para uma base `_e2e` isolada.

## 2. Scope incluído e excluído

### Incluído

- categoria `anonymousMetrics` do `RF57` e a fatia anónima/agregada do `RF59`;
- descoberta, leitura e alteração do consentimento em `/conta`;
- triggers `catalog_view`, `search_submit`, `playback_started` e
  `playback_completed`;
- `analyticsApi`, cliente HTTP comum e `POST /api/analytics/events`;
- autenticação, CSRF, validação, minimização, neutralidade da resposta e erros;
- `user_consents`, `user_consent_events` e `anonymous_metric_events`;
- TTL, índice de agregação, datas UTC, retenção e ausência de identificadores;
- consumo agregado em `GET /api/admin/metrics` e exportação CSV;
- RBAC administrativo, filtros, estados, responsividade e acessibilidade;
- testes unitários, integração disponível, segurança, lint, build, smoke, Axe e
  browser local com fixtures sintéticas.

### Excluído

- alteração de código, requisitos, planos, BKs ou evidências existentes;
- métricas gerais de utilizadores, catálogo, subscrições, solidariedade,
  notificações e integrações, exceto a composição da resposta administrativa;
- recomendações personalizadas e alertas opcionais, já consumidores de outras
  categorias de consentimento;
- aconselhamento jurídico e redação legal definitiva do consentimento;
- analytics de terceiros, publicidade, fingerprinting ou tracking anónimo, que
  não existem nesta implementação;
- dados pessoais reais, MongoDB configurado, seeds e mutações persistentes;
- produção, infraestrutura enterprise e dispositivos físicos.

O `README.md`, `tests/e2e/mf2-flow.spec.js` e três relatórios anteriores em
`docs/evidence/audits/` já estavam modificados ou não rastreados antes desta
execução e foram preservados integralmente.

## 3. Fontes e ficheiros consultados

### Contratos e arquitetura

- `README.md`
- `ARCHITECTURE.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/guias-bk/MF5/BK-MF5-03-gestao-consentimentos.md`
- `docs/planificacao/guias-bk/MF5/BK-MF5-05-painel-de-metricas-admin.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF5.md`
- `docs/cabulas/FUNCOES-FUNDAMENTAIS-APLICACAO.md`
- `docs/evidence/audits/AUDITORIA-E2E-UIUX-PRIVACIDADE-CONSENTIMENTOS.md`

### Backend

- `real_dev/backend/src/app.js`
- `real_dev/backend/src/server.js`
- `real_dev/backend/src/bootstrap/ensure-application-indexes.js`
- `real_dev/backend/src/modules/analytics/analytics.routes.js`
- `real_dev/backend/src/modules/analytics/analytics.controller.js`
- `real_dev/backend/src/modules/analytics/analytics.validation.js`
- `real_dev/backend/src/modules/analytics/analytics.service.js`
- `real_dev/backend/src/modules/privacy/privacy.routes.js`
- `real_dev/backend/src/modules/privacy/privacy.service.js`
- `real_dev/backend/src/modules/privacy/privacy.validation.js`
- `real_dev/backend/src/modules/admin-metrics/admin-metrics.routes.js`
- `real_dev/backend/src/modules/admin-metrics/admin-metrics.controller.js`
- `real_dev/backend/src/modules/admin-metrics/admin-metrics.validation.js`
- `real_dev/backend/src/modules/admin-metrics/admin-metrics.service.js`
- `real_dev/backend/src/modules/auth/auth.middleware.js`
- `real_dev/backend/src/middlewares/csrf.middleware.js`
- `real_dev/backend/src/middlewares/rate-limit.middleware.js`
- `real_dev/backend/src/middlewares/request-logger.middleware.js`

### Frontend

- `real_dev/frontend/src/components/privacy/PrivacyConsentsPanel.jsx`
- `real_dev/frontend/src/pages/CatalogPage.jsx`
- `real_dev/frontend/src/pages/SearchPage.jsx`
- `real_dev/frontend/src/pages/PlaybackPage.jsx`
- `real_dev/frontend/src/pages/AdminMetricsPage.jsx`
- `real_dev/frontend/src/pages/AdminDashboardPage.jsx`
- `real_dev/frontend/src/routes/AppRoutes.jsx`
- `real_dev/frontend/src/services/api/apiClient.js`
- `real_dev/frontend/src/services/api/analyticsApi.js`
- `real_dev/frontend/src/services/api/privacyApi.js`
- `real_dev/frontend/src/services/api/metricsApi.js`
- `real_dev/frontend/src/styles/global.css`

### Testes e harnesses

- `real_dev/backend/tests/unit/integrations-analytics-mailbox.test.js`
- `real_dev/backend/tests/unit/admin-metrics-contract.test.js`
- `real_dev/backend/tests/unit/mf5-validation.test.js`
- `real_dev/backend/tests/integration/privacy-http.test.js`
- `real_dev/frontend/src/components/privacy/PrivacyConsentsPanel.test.jsx`
- `real_dev/frontend/src/pages/CatalogPage.test.jsx`
- `real_dev/frontend/src/pages/SearchPage.test.jsx`
- `real_dev/frontend/src/pages/PlaybackPage.test.jsx`
- `real_dev/frontend/src/pages/AdminMetricsPage.test.jsx`
- `real_dev/frontend/src/services/api/apiClient.test.js`
- `real_dev/frontend/tests/a11y/accessibility.spec.js`
- `tests/e2e/network-policy.js`
- `tests/e2e/f7-critical-read-only.spec.js`
- `scripts/e2e-environment.mjs`

## 4. Mapa do sistema

| Elemento | Classificação | Evidência e papel no fluxo |
| --- | --- | --- |
| Utilizador autenticado | `IMPLEMENTADO_E_LIGADO` | É o único ator que pode configurar e originar analytics consentida. |
| Administrador | `IMPLEMENTADO_E_LIGADO` | Consulta totais agregados e, quando a capability está ativa, exporta CSV. |
| Anónimo/moderador | `IMPLEMENTADO_E_LIGADO` | Anónimo não grava eventos; moderador não acede às métricas administrativas. |
| `/conta` + `PrivacyConsentsPanel` | `IMPLEMENTADO_E_LIGADO` | Lê e altera `anonymousMetrics`; loading, retry, busy, rollback e feedback. |
| Catálogo | `IMPLEMENTADO_E_LIGADO` | Em sessão autenticada, emite `catalog_view` após leitura válida da página. |
| Pesquisa | `IMPLEMENTADO_E_LIGADO` | Emite `search_submit` sem incluir texto pesquisado nem taxonomia. |
| Playback | `IMPLEMENTADO_E_LIGADO` | Emite `playback_started/completed`, deduplicados por conteúdo no ciclo visual. |
| `analyticsApi` | `IMPLEMENTADO_E_LIGADO` | Envia apenas tipo e categoria ampla; falha é isolada da jornada principal. |
| `apiClient` | `IMPLEMENTADO_E_LIGADO` | `credentials=include`, CSRF, timeout 10 s, renovação única e erros normalizados. |
| `POST /api/analytics/events` | `IMPLEMENTADO_PARCIAL` | Auth, CSRF global, validação, resposta neutra e persistência; falta limite de frequência. |
| `analytics.validation` | `IMPLEMENTADO_E_LIGADO` | Allowlist de quatro tipos, cinco categorias e somente dois campos. |
| `analytics.service` | `IMPLEMENTADO_E_LIGADO` | Lê consentimento atual; opt-out não escreve; opt-in insere documento mínimo. |
| `user_consents` | `IMPLEMENTADO_E_LIGADO` | Snapshot canónico por utilizador, com `anonymousMetrics=false` por defeito. |
| `user_consent_events` | `IMPLEMENTADO_E_LIGADO` | Histórico versionado da alteração, sem substituir o estado atual. |
| `anonymous_metric_events` | `IMPLEMENTADO_E_LIGADO` | Guarda `type`, `category?`, `day`, `expiresAt`; sem ligação ao utilizador. |
| Índice TTL | `INTERNO_OPERACIONAL` | Expira cada documento aos 90 dias por `expiresAt`. |
| Índice de agregação | `INTERNO_OPERACIONAL` | `{ day, type, category }` serve as contagens administrativas. |
| `GET /api/admin/metrics` | `IMPLEMENTADO_E_LIGADO` | Admin-only; agrega os quatro tipos no intervalo UTC e devolve totais. |
| `GET /api/admin/metrics/export.csv` | `IMPLEMENTADO_E_LIGADO` | Admin-only e capability-gated; CSV de totais, privado/no-store. |
| `/admin/metricas` | `IMPLEMENTADO_E_LIGADO` | Filtros, loading/erro/retry, cards agregados e exportação condicional. |
| Dashboard admin | `IMPLEMENTADO_E_LIGADO` | Mostra apenas o total de eventos anónimos no resumo. |
| Logs HTTP | `INTERNO_OPERACIONAL` | Registam método/path/status/duração/request id, sem body ou identidade. |
| Jobs/filas/cron | `NAO_APLICAVEL` | Eventos e agregações são síncronos; TTL pertence ao MongoDB. |
| Integração externa de analytics | `NAO_APLICAVEL` | Não existe provider, SDK, beacon externo ou partilha de eventos. |
| API/browser sintéticos | `SIMULADO_OU_DEMO` | Usados somente para renderização e interação visual local. |
| E2E formal MongoDB `_e2e` | `BLOQUEADO_POR_AMBIENTE` | Guard recusou execução sem `TEST_MONGODB_URI` explícita. |

## 5. Matriz de jornadas

| Jornada | Ator | Frontend | API/backend | Dados/efeitos | Negativos | UI/UX | Testes | Estado |
| ------- | ---- | -------- | ----------- | ------------- | --------- | ----- | ------ | ------ |
| Descobrir analytics consentida | Utilizador | `/conta` | `GET /privacy/consents` | Default off ou snapshot atual | Anónimo redirecionado/401 | Label acessível, mas explicação insuficiente | Componente + browser | `PASS_COM_RESSALVAS` |
| Ativar/revogar consentimento | Utilizador | Switch, busy, rollback e feedback | `PUT /privacy/consents`, auth + CSRF | Snapshot + evento no mesmo commit | Shape/tipos errados 400; CSRF 403 | Operável em 3 viewports | Unit + HTTP privacidade + browser | `PASS` |
| Evento com opt-out | Utilizador | Triggers podem chamar o cliente | Backend lê consentimento atual | `0` inserts e `204` neutro | Estado ausente/false falha fechado | A ação principal continua | Unit service; sem HTTP dedicado | `PASS_COM_RESSALVAS` |
| Visualizar catálogo | Utilizador | Emite depois da leitura válida | `POST /analytics/events` | `catalog_view` + categoria ampla | Anónimo não chama; payload livre 400 | Invisível e não bloqueante | Componente + service | `PASS_COM_RESSALVAS` |
| Submeter pesquisa | Utilizador | Emite no submit/taxonomia | Mesmo endpoint | `search_submit`; sem query | Sem sessão não chama | Pesquisa não depende de analytics | Componente + service | `PASS_COM_RESSALVAS` |
| Iniciar/concluir playback | Utilizador | Deduplica cada tipo por conteúdo | Mesmo endpoint | Dois eventos máximos no ciclo normal | Repetição do evento DOM é deduplicada | Player não recebe erro analítico | Componente + service | `PASS_COM_RESSALVAS` |
| Rejeitar evento inválido | Utilizador | Cliente usa enum implícito | Validator allowlist | Sem escrita | Tipo/categoria/campos extra dão 400 | Sem mensagem por ser telemetria | Unit validator; sem HTTP | `PASS_COM_RESSALVAS` |
| Resistir a abuso de escrita | Utilizador consentido | Sem limitação local relevante | Rota sem rate limit | Cada pedido válido cria um documento | `250/250` inserts controlados; nunca 429 | Não aplicável visualmente | Prova controlada | `FAIL` |
| Consultar agregados | Admin | `/admin/metricas` | `GET /admin/metrics`, RBAC | Contagens por dia/tipo | 401/403; datas inválidas 400 | Filtros/cards responsivos | Unit BE/FE + Axe/browser | `PASS` |
| Exportar agregados | Admin | Download Blob cancelável | `GET /export.csv`, capability + RBAC | Somente pares métrica/valor | Integração disabled dá 503; role errada 403 | Disabled/loading/status/erro | Unit BE/FE | `PASS` |
| Expirar e desligar da conta | Sistema | Sem UI | TTL MongoDB | Evento some após `expiresAt`; não é exportável por user | Sem índice no startup seria risco operacional | Não aplicável | Unit índice + bootstrap | `PASS` |

## 6. Contratos entre camadas

| Operação | Request | Sucesso | Negativos relevantes |
| --- | --- | --- | --- |
| Ler consentimentos | `GET /api/privacy/consents`; cookie | `200 { consentState: { version, consents, updatedAt } }` | `401 AUTH_REQUIRED` |
| Atualizar consentimentos | `PUT /api/privacy/consents`; três booleanos; cookie + CSRF | mesmo envelope com snapshot confirmado | `400` shape/tipos; `403 CSRF_INVALID`; `401` |
| Registar evento | `POST /api/analytics/events`; `{ type, category? }`; cookie + CSRF | `204` em opt-in e opt-out | `400 ANALYTICS_EVENT_INVALID`; `401`; `403`; não existe `429` |
| Consultar métricas | `GET /api/admin/metrics?from=YYYY-MM-DD&to=YYYY-MM-DD`; cookie admin | `200 { metrics, capabilities: { csvExport } }` | `400` datas/range; `401`; `403` |
| Exportar métricas | `GET /api/admin/metrics/export.csv` com o mesmo intervalo | `200 text/csv`, attachment, private/no-store | `400`; `401`; `403`; `503 INTEGRATION_DISABLED` |

Os enums coincidem entre os triggers frontend e o validator backend. O cliente
não envia `userId`, conteúdo, slug, título ou query. Métodos inseguros usam o
cliente central, que inclui cookie, obtém CSRF, renova-o no máximo uma vez e
aplica timeout. O controller analítico não revela se houve persistência.

O contrato analítico não tem paginação nem resposta JSON porque cada evento é
uma escrita mínima `204`. Os agregados administrativos usam intervalo inclusivo
na UI e semiaberto internamente, evitando perder o último dia.

## 7. Segurança e privacidade

- **Autenticação e ownership:** `requireAuth` antecede o controller analítico; o
  id vem exclusivamente da sessão e serve só para consultar o próprio consentimento.
- **CSRF/CORS/cookies:** o POST passa pelo middleware CSRF global; o cliente usa
  `credentials: include`. Respostas autenticadas são `private, no-store` e variam
  por `Cookie` através de `requireAuth`/`requireRole`.
- **RBAC:** métricas e CSV são exclusivas de `admin`; o frontend também protege a
  rota, sem substituir a decisão server-side.
- **Validação:** o body aceita apenas `type` e `category`; valores são enums
  fechados. Campos extra, ids, texto livre e arrays são recusados antes da escrita.
- **Minimização:** o documento não contém utilizador, IP, sessão, conteúdo,
  pesquisa, timestamp preciso ou metadata livre. O request logger não regista body.
- **Consentimento:** ausência, default ou false resultam em zero escrita. O estado
  atual é consultado em cada pedido e o frontend não consegue forçar opt-in no body.
- **Neutralidade:** opt-in e opt-out válidos devolvem `204`, reduzindo exposição do
  estado do consentimento ao consumidor da página.
- **Retenção:** expiração absoluta de 90 dias com TTL; o dia UTC é a única dimensão
  temporal persistida.
- **Integrações externas:** nenhuma. O tratamento é local; não existem SDKs,
  cookies analíticos, beacons externos ou secrets desta pipeline.
- **Injection/XSS/SSRF/files:** não há queries livres, templates, URLs, uploads ou
  comandos controlados pelo evento. Os enums impedem injeção de chaves/operadores.
- **Abuso:** a rota não usa o middleware de rate limit já existente. Este é o
  finding `ANALYTICS-CONSENTIDA-SEC-001`.

Não foi declarada vulnerabilidade por pesquisa textual: a conclusão de abuso
combina a composição real da rota, o insert por pedido e uma execução controlada.

## 8. Dados, transações e operação

- `user_consents.userId` é único; `anonymousMetrics` começa em `false`.
- Cada alteração dos três consentimentos atualiza o snapshot e cria um evento na
  mesma transação. O histórico não autoriza analytics; apenas o snapshot atual.
- `anonymous_metric_events` contém exclusivamente `type`, `category?`, `day` e
  `expiresAt`; não existe chave que permita reconstruir o utilizador.
- O índice TTL é `{ expiresAt: 1 }` com `expireAfterSeconds: 0` e o índice de
  leitura é `{ day: 1, type: 1, category: 1 }`.
- A data é calculada pelo servidor à meia-noite UTC e a expiração usa o instante
  real do servidor mais 90 dias; o cliente não controla timestamps.
- A escrita do evento não precisa de transação com outro efeito de domínio. Uma
  falha não pode impedir catálogo, pesquisa ou playback, porque o frontend isola
  a promise analítica.
- Started/completed são deduplicados no ciclo da página. Catálogo e pesquisa são
  contagens de interações e podem repetir por nova navegação, de acordo com a
  semântica atual.
- A agregação administrativa faz quatro `countDocuments` com o mesmo range UTC;
  o total é a soma dos tipos conhecidos, ignorando tipos legacy desconhecidos.
- Não existem workers ou filas. O servidor cria os dois índices antes de `listen`
  e readiness continua dependente do MongoDB.
- A eliminação/exportação da conta não tenta associar estes eventos a um user:
  os documentos são materialmente anónimos e desaparecem por TTL.
- O endpoint de escrita ilimitado permite inflacionar contagens e volume. A
  correção proporcional é reutilizar o rate limiter existente, não introduzir
  fila, event bus ou infraestrutura de analytics externa.

## 9. UI/UX e acessibilidade

### Resultado confirmado

- o consentimento está descobrível em `/conta`, na secção `Dados e consentimentos`;
- loading, erro, retry, busy, anti-duplo-submit, rollback e confirmação existem;
- o opt-in foi alterado de false para true e o browser confirmou
  `Consentimentos atualizados.` com o checkbox final ativo;
- os switches têm labels acessíveis e são operáveis por teclado;
- `/admin/metricas` tem heading único, filtros de data associados, intervalo
  apresentado, cards agrupados e exportação escondida quando a capability está off;
- os quatro tipos aparecem com labels PT-PT: catálogo, pesquisas, reproduções
  iniciadas e concluídas;
- mobile transforma sidebar admin em menu e empilha filtros/cards; tablet e
  desktop mantêm hierarquia e áreas clicáveis claras;
- não existiu overflow horizontal em `390x844`, `768x900` ou `1280x720`;
- não surgiram erros/warnings de consola na inspeção local;
- Axe/reflow passou `35/35`, incluindo `/conta`, dashboard admin e mobile/reflow.

### Limite de clareza

A label `Partilha de utilização anónima` é a única explicação específica da
categoria. A expressão pode sugerir partilha externa, embora a implementação
seja local, e não informa que são contagens de catálogo/pesquisa/reprodução,
reduzidas a categoria/dia e retidas 90 dias. Isto não exige texto jurídico nem
novo design; exige ajuda curta e factual. Está registado em
`ANALYTICS-CONSENTIDA-UIUX-002`.

### Limites da validação visual

- o browser usou conta e métricas sintéticas em loopback, sem MongoDB ou PII;
- Axe e inspeção foram executados em Chromium/in-app browser; dispositivos
  físicos, Chrome/Edge branded, Firefox e Safari reais não foram inspecionados;
- não foram publicados screenshots nem artefactos visuais no repositório.

## 10. Testes e comandos executados

| Diretório | Comando | Exit | Resultado |
| --- | --- | ---: | --- |
| `real_dev/backend` | `node --test` sobre analytics, admin metrics e MF5 | 0 | `18/18` |
| `real_dev/frontend` | `npx vitest run` sobre consent, triggers e admin metrics | 0 | `42/42` |
| `real_dev/backend` | prova in-memory com 250 chamadas concorrentes a `recordAnonymousMetric` | 0 | `{ attempts: 250, writes: 250 }` |
| `real_dev/backend` | `npm test` fora da sandbox | 0 | `373/373` |
| `real_dev/frontend` | `npm run test:unit -- --reporter=dot` | 0 | `65` ficheiros, `299/299`; warnings React Router/`act` fora do alvo |
| `real_dev/frontend` | `npm run lint` | 0 | sem warnings/erros |
| raiz | `npm run test:security` fora da sandbox | 0 | `12/12`; `Hardening MF6: PASS` |
| raiz | `npm run smoke` fora da sandbox | 0 | backend `8/8` + frontend build, `127` módulos |
| raiz | `npm run test:a11y` fora da sandbox | 0 | build + `35/35` Axe/reflow |
| raiz | `env NODE_ENV=test node scripts/e2e-environment.mjs` | 1 | bloqueado: `TEST_MONGODB_URI` não definida |
| browser local | preview `5184` + API sintética `3199` | 0 | 3 viewports, opt-in, admin agregados, sem overflow/console errors |

Os avisos de build sobre `dashjs` CommonJS e chunks `hls`/`dash` são conhecidos e
não afetam esta pipeline. Não foram instaladas dependências nem regenerados
snapshots.

## 11. Findings

### [P2] ANALYTICS-CONSENTIDA-SEC-001 — Escrita analítica consentida não tem limite de frequência

- Estado: ABERTO
- Área: segurança / operação / dados
- Evidência: `real_dev/backend/src/modules/analytics/analytics.routes.js:5-14` monta
  somente `requireAuth` e o controller; `analytics.service.js:66-89` executa um
  `insertOne` por evento consentido; prova local: `{ attempts: 250, writes: 250 }`
- Percurso afetado: utilizador autenticado com opt-in → CSRF → POST de eventos →
  coleção e métricas administrativas
- Pré-condições: sessão válida, token CSRF e `anonymousMetrics=true`
- Passos de reprodução:
    1. Ativar métricas anónimas na conta.
    2. Obter o CSRF da sessão.
    3. Repetir `POST /api/analytics/events` com `{ "type": "catalog_view" }`.
    4. Observar que cada pedido válido chega ao insert e não existe limiar `429`.
- Resultado atual: todos os eventos válidos são aceites enquanto a conta estiver
  consentida; a prova com double controlado registou `250/250` escritas.
- Resultado esperado: a escrita deve ter um limite proporcional por utilizador
  e janela, com `429`, `Retry-After` e política visível, sem impedir uso normal.
- Causa-raiz: o módulo foi desenhado para minimização/consentimento, mas a rota
  não reutilizou `rateLimit`/`rateLimitKeys.user` já usados noutros endpoints.
- Impacto: uma conta pode inflacionar os indicadores, reduzir confiança nos
  agregados e criar crescimento persistente até ao TTL. Requer autenticação e os
  documentos são mínimos/temporários, pelo que não é P1.
- Correção recomendada: aplicar o middleware existente com um limite simples por
  utilizador/minuto, dimensionado acima do uso normal; não criar nova dependência,
  fila ou serviço externo.
- Validação recomendada: teste HTTP com limite pequeno configurável que confirme
  N respostas `204`, pedido N+1 `429`/`Retry-After`, zero insert adicional e
  isolamento entre dois utilizadores.

### [P3] ANALYTICS-CONSENTIDA-UIUX-002 — Consentimento não explica o tratamento efetivo e sugere partilha externa

- Estado: ABERTO
- Área: UI/UX / privacidade
- Evidência: `real_dev/frontend/src/components/privacy/PrivacyConsentsPanel.jsx:9-13`
  e `:169-203`; browser `/conta` em `390x844`, `768x900` e `1280x720`
- Percurso afetado: utilizador autenticado → conta → consentimentos → decidir
  sobre analytics
- Pré-condições: painel de consentimentos carregado
- Passos de reprodução:
    1. Abrir `/conta` e localizar `Dados e consentimentos`.
    2. Ler a opção `Partilha de utilização anónima` e a ajuda circundante.
    3. Comparar com o backend, que apenas guarda localmente tipo/categoria/dia
       durante 90 dias e não envia dados a terceiros.
- Resultado atual: a UI não explica finalidade, dados, retenção ou tratamento
  local; “Partilha” pode ser interpretado como envio para uma entidade externa.
- Resultado esperado: a decisão deve ter uma label factual e ajuda curta que
  identifique contagens de catálogo/pesquisa/reprodução, agregação anónima,
  retenção de 90 dias e ausência de terceiros/identificadores.
- Causa-raiz: foi reutilizada uma label genérica do contrato de consentimentos
  sem acompanhar a pipeline analítica implementada posteriormente.
- Impacto: a escolha funciona tecnicamente, mas o utilizador não dispõe de contexto
  suficiente para compreender o alcance do opt-in. Não há exposição adicional.
- Correção recomendada: alteração mínima de copy, por exemplo `Métricas anónimas
  de utilização`, com uma frase factual; não criar modal legal ou novo ecrã.
- Validação recomendada: teste de componente para a ajuda, inspeção mobile/teclado
  e confirmação de que o payload e o backend não mudam.

### [P3] ANALYTICS-CONSENTIDA-TEST-003 — A fronteira HTTP e o cliente analytics não têm prova dedicada

- Estado: ABERTO
- Área: testes / contrato
- Evidência: `integrations-analytics-mailbox.test.js:252-312` testa diretamente o
  service; páginas mockam `reportAnonymousMetric`; pesquisa por
  `/api/analytics/events` nos testes encontrou apenas o fulfill neutro de
  `tests/e2e/network-policy.js:113-120`, não uma asserção HTTP/cliente
- Percurso afetado: trigger → `analyticsApi` → `apiClient` → CSRF/auth/router →
  controller → consentimento → persistência/204
- Pré-condições: execução das suites atuais
- Passos de reprodução:
    1. Executar os testes focados e completos.
    2. Procurar o path `/api/analytics/events` e `analyticsApi.record` nos testes.
    3. Confirmar que a cobertura salta do mock de página para o service direto.
- Resultado atual: os extremos têm boa prova, mas método/path/body, CSRF, auth,
  cache privado, resposta neutra e montagem real podem regredir em conjunto sem
  falhar uma suite dedicada.
- Resultado esperado: integração HTTP controlada deve cobrir anónimo `401`, CSRF
  `403`, payload inválido `400`, opt-out `204` sem insert, opt-in `204` com documento
  mínimo e rate limit; o frontend deve provar path/body/opções do client.
- Causa-raiz: a pipeline foi adicionada com teste unitário do service e mocks dos
  consumidores, sem fechar a composição entre camadas.
- Impacto: regressões de contrato ou middleware podem chegar à aplicação apesar
  das suites verdes. O comportamento atual foi confirmado por código e testes
  adjacentes, por isso a severidade é P3.
- Correção recomendada: acrescentar uma pequena suite HTTP com DB double local e
  um teste unitário de `analyticsApi`, sem dependências novas nem MongoDB real.
- Validação recomendada: novas suites verdes, backend/frontend completos e E2E
  formal quando uma DB `_e2e` isolada estiver disponível.

## 12. Riscos e validações bloqueadas

- **E2E formal:** o guard terminou antes de build, servidores ou seeds porque
  `TEST_MONGODB_URI` não está definida. Não se reutilizou uma base normal e não se
  simulou sucesso.
- **MongoDB real:** consentimento, TTL, agregação e concorrência foram validados
  por código/doubles, não contra replica set e relógio TTL reais.
- **Cross-browser físico:** Chromium/Axe e browser integrado passaram; Chrome,
  Edge, Firefox, Safari e dispositivos físicos não foram inspecionados nesta execução.
- **Confiabilidade analítica:** eventos de UX são sinais client-side e não prova
  contabilística. Mesmo depois de limitar abuso, os agregados devem continuar a
  ser apresentados como indicadores operacionais aproximados.
- **TTL:** MongoDB remove documentos expirados de forma assíncrona; 90 dias é o
  limite lógico de retenção, não garantia de eliminação ao milissegundo.
- **Escala:** quatro contagens e inserts individuais são proporcionais à PAP. Uma
  fila/batch só seria evolução pós-PAP se volume real justificasse; não é finding.

## 13. Conclusão e decisão final

**Decisão: `PASS_COM_FINDINGS`.**

Analytics consentida está implementada de ponta a ponta, respeita opt-in atual,
minimiza e expira dados, não usa terceiros e apresenta apenas agregados a admins.
Os percursos principais e a UI funcionam e os gates estão verdes. O P2 de escrita
ilimitada não parte a jornada normal, mas permite abuso e distorção de métricas;
os dois P3 reduzem clareza do consentimento e confiança de regressão. A correção
proporcional é pequena e reutiliza padrões já existentes.

Esta execução criou exclusivamente este relatório de auditoria. Não alterou
código, testes, requisitos, planos, BKs, evidências anteriores, dependências ou git.
