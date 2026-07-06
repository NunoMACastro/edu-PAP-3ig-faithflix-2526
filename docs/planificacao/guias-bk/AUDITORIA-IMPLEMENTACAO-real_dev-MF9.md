# Auditoria de implementacao real_dev MF9 - FaithFlix

## Execucao 2026-07-05 - MF9 completa

### Resumo executivo

- Data da execucao: 2026-07-05
- Modo: `auditar_implementacao`
- Pedido efetivo: auditoria fresca de todos os BKs da `MF9` porque `BK_IDS: []`
- MF alvo: `MF9`
- BKs auditados: `BK-MF9-01`, `BK-MF9-02`, `BK-MF9-03`, `BK-MF9-04`, `BK-MF9-05`, `BK-MF9-06`
- Resultado geral: `PASS_COM_RISCOS`
- Raiz auditada: `real_dev`
- Backend real: `real_dev/backend`
- Frontend real: `real_dev/frontend`
- Pastas ignoradas como referencia auxiliar: `backend/`, `frontend/`, `mockup/`
- Commits: nao efetuados, conforme `PERMITIR_COMMITS: nao`
- Alteracoes de codigo: nenhuma
- Alteracoes documentais canonicas/BKs/RF/RNF: nenhuma
- Artefacto atualizado nesta execucao: este relatorio tecnico

A MF9 esta implementada e auditavel na raiz real. A auditoria confirmou os contratos de planos Pro/Familia e entitlements, enforcement backend da qualidade por plano, API e UI de partilha familiar real, integracao RGPD/metricas/pool solidaria e gate S13 com regressao automatizada.

Nao foram encontrados findings funcionais `P0`, `P1` ou `P2`. O estado geral permanece `PASS_COM_RISCOS`, nao `PASS`, porque o proprio gate S13 continua em `GO_COM_RESSALVAS`: faltam a ronda manual multi-browser completa, a revisao visual mobile/desktop com capturas e o negativo operacional "E2E sem seed MF9".

### Documentos e fontes consultadas

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF9.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md`
- `docs/evidence/MF9/GATE-S13-MF9.md`
- `docs/evidence/MF9/REGRESSAO-MF9.md`
- Codigo, testes e scripts em `real_dev/backend`, `real_dev/frontend`, `tests/e2e` e `playwright.config.js`

### Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF9-01` | `CONFORME` | Os planos `faithflix-monthly`/`faithflix-yearly` continuam como Pro e existem planos Familia com `tier`, `maxQuality`, `qualityRank`, `familySharing` e `maxFamilyMembers`; checkout simulado rejeita plano inexistente. |
| `BK-MF9-02` | `CONFORME` | O backend filtra `qualityOptions`, remove URLs de qualidades bloqueadas e faz fallback para a melhor qualidade permitida; 4K fica reservado ao plano Familia. |
| `BK-MF9-03` | `CONFORME` | A API familiar usa contas reais, owner autenticado com plano Familia ativo, estados `pending`/`active`/`declined`/`removed`/`left`, bloqueios de duplicacao e acesso efetivo derivado. |
| `BK-MF9-04` | `CONFORME` | A UI de subscricao consome o cliente API central com cookies, apresenta planos/familia em PT-PT e executa convidar/aceitar/recusar/remover/sair contra endpoints reais. |
| `BK-MF9-05` | `CONFORME` | Exportacao RGPD inclui memberships familiares, eliminacao de conta invalida memberships, metricas admin sao agregadas sem PII e a pool solidaria ignora memberships como receita paga. |
| `BK-MF9-06` | `CONFORME_COM_RISCOS` | Gate, seed, regressao backend/frontend/planificacao e E2E Chromium passaram; faltam provas manuais completas de `RNF21`/`RNF22` e o negativo sem seed. |

### Rastreabilidade RF/RNF

| Requisito | Expected | Observed | Estado |
| --- | --- | --- | --- |
| `RF61` | Planos Pro/Familia expoem entitlements sem quebrar codigos atuais. | `DEFAULT_PLANS` preserva Pro e adiciona Familia; `publicPlan` expoe entitlements; suite MF9 valida listagem e checkout. | `PASS` |
| `RF62` | Partilha familiar real entre contas existentes, owner com Familia ativo e bloqueios de membros indevidos. | Rotas `/api/subscriptions/family/*` sao autenticadas; service bloqueia owner sem Familia, auto-convite, email inexistente, membro pago e duplicado; E2E valida owner -> membro -> remocao. | `PASS` |
| `RF63` | Backend limita qualidade por plano e nao entrega URL acima do entitlement. | `filterQualityOptionsByEntitlements` remove `playbackUrl`/`src` bloqueados; `getPlayback` usa entitlements efetivos; testes e E2E validam 4K permitido para Familia e bloqueado para Pro. | `PASS` |
| `RNF13/RNF15/RNF16/RNF19` | Autenticacao, ownership, sessao segura e rastreabilidade para familia. | Rotas familiares usam `requireAuth` e `req.user.id`; cliente API usa `credentials: "include"`; notificacoes/eventos de familia sao criados nas mutacoes principais. | `PASS` |
| `RNF17/RNF19/RNF30` | Privacidade, rastreabilidade e operacao agregada sem expor dados sensiveis. | Exportacao filtra chaves sensiveis, delete account regista pedido e metricas admin devolvem apenas contagens agregadas. | `PASS` |
| `RNF21` | Compatibilidade em browsers modernos. | E2E Chromium passou; Chrome/Edge/Firefox/Safari manuais continuam pendentes no gate. | `PASS_COM_RISCOS` |
| `RNF22` | Revisao responsiva em mobile/tablet/desktop. | Build e E2E validam fluxo principal; capturas e revisao visual completa continuam pendentes. | `PASS_COM_RISCOS` |
| `RNF29` | Testes automatizados dos fluxos criticos. | Suite MF9 direta `14/14`, padrao MF9 `24/24`, backend completo `65/65` fora da sandbox, smoke root, build, seed e E2E MF9 passaram. | `PASS` |
| `RNF38/RNF40` | UI em portugues de Portugal e formatos europeus. | `SubscriptionPage.jsx` usa `Intl.NumberFormat("pt-PT")`, `toLocaleDateString("pt-PT")` e copy principal PT-PT; gate mantem ressalva apenas para texto tecnico ASCII em scripts/evidence. | `PASS_COM_RISCOS` |

### Evidencia tecnica

| Area | Evidencia |
| --- | --- |
| Planos e entitlements | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:32` a `:61` define entitlements; `:63` a `:120` define Pro/Familia; `:224` a `:241` publica campos seguros. |
| Checkout simulado | `real_dev/backend/src/modules/payments/payments.service.js:76` a `:115` valida plano ativo antes de gravar tentativa e ativa a subscricao aprovada. |
| Acesso efetivo | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:424` a `:481` resolve acesso proprio/familiar e exige owner com plano Familia ainda ativo. |
| Qualidade por plano | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:490` a `:506` bloqueia opcoes acima do entitlement sem expor URL; `real_dev/backend/src/modules/playback/playback.service.js:68` a `:96` escolhe media permitida. |
| Rotas familiares | `real_dev/backend/src/modules/subscriptions/subscriptions.routes.js:28` a `:37` monta planos publicos e rotas familiares autenticadas. |
| Ownership familiar | `real_dev/backend/src/modules/subscriptions/subscriptions.controller.js:63` a `:119` delega mutacoes com `req.user.id`; `subscriptions.service.js:780` a `:895` implementa convite/aceite/recusa; `:928` a `:972` implementa remover/sair. |
| Cliente API familiar | `real_dev/frontend/src/services/api/subscriptionsApi.js:13` a `:55` mapeia endpoints reais; `real_dev/frontend/src/services/api/apiClient.js:57` a `:68` usa `credentials: "include"`. |
| UI familia/planos | `real_dev/frontend/src/pages/SubscriptionPage.jsx:11` a `:52` formata PT/EU; `:224` a `:368` mostra estado, planos, convite, aceitacao, remocao e saida. |
| UI playback | `real_dev/frontend/src/pages/PlaybackPage.jsx:276` a `:299` mostra selector de qualidade e player real usado no E2E. |
| RGPD familiar | `real_dev/backend/src/modules/privacy/privacy.service.js:140` a `:184` exporta memberships familiares; `:261` a `:340` invalida memberships e devolve `familyMembershipsUpdated`. |
| Metricas e pool | `real_dev/backend/src/modules/admin-metrics/admin-metrics.service.js:47` a `:126` devolve contagens agregadas; `real_dev/backend/src/modules/charities/pool-distribution.service.js:113` a `:126` calcula pool apenas a partir de subscricoes pagas. |
| Guard admin | `real_dev/backend/src/modules/admin-metrics/admin-metrics.routes.js:12` protege metricas com `requireRole(["admin"])`. |
| Seed MF9 | `real_dev/backend/scripts/seed-mf9-e2e.js:18` a `:28` fixa fixtures; `:80` a `:131` limpa apenas dados MF9; `:133` a `:203` cria contas, subscricoes e conteudo 1080p/4K. |
| Suite MF9 | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:355` a `:428` valida planos/checkout; `:430` a `:670` valida familia; `:672` a `:844` valida qualidade/playback; `:846` a `:1031` valida privacidade, metricas e pool. |
| E2E browser | `tests/e2e/mf9-family-subscription.spec.js:55` a `:151` valida fluxo real owner -> membro -> 4K Familia -> Pro bloqueado -> remocao. |
| Playwright real | `playwright.config.js:26` a `:39` arranca backend e frontend reais de `real_dev`. |
| Gate final | `docs/evidence/MF9/GATE-S13-MF9.md:6` a `:9` declara `GO_COM_RESSALVAS`; `:14` a `:21` marca RF61/RF62/RF63/RNF29/RNF40 como `PASS` e RNF21/RNF22/RNF38 com riscos. |

### Findings

| ID | Severidade | Area | Expected | Observed | Impacto | Recomendacao | Bloqueia MF |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `P3-MF9-06-01` | `P3` | `BK-MF9-06`, `RNF21`, `RNF22` | Gate final `GO` deve ter revisao multi-browser e viewport com evidence manual/capturas completas. | Gate atual conserva `GO_COM_RESSALVAS`; Firefox/Safari/Edge, mobile/desktop com capturas e negativo sem seed continuam pendentes. | Sem defeito funcional provado, mas a MF9 nao deve ser apresentada como `GO` sem ressalvas. | Executar ronda manual Chrome/Edge/Firefox/Safari e viewports mobile/tablet/desktop, anexar capturas/notas e atualizar gate apenas se continuar limpo. | Nao |

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Sem findings |
| `P1` | 0 | Sem findings |
| `P2` | 0 | Sem findings |
| `P3` | 1 | Risco de evidence incompleta, nao bloqueante |

### Coerencia MF/BK

| Relacao | Estado | Evidencia |
| --- | --- | --- |
| `MF8 -> MF9` | `COERENTE` | O scope freeze de MF8 continua preservado; MF9 acrescenta apenas planos avancados, familia real e qualidade por plano. |
| `MF4/MF5 -> MF9` | `COERENTE` | Subscricoes/pagamentos simulados, privacidade, metricas e pool foram estendidos sem gateway real, PII em metricas ou inflacao de receita por memberships. |
| `BK-MF9-01 -> BK-MF9-06` | `COERENTE` | Cada BK entrega contratos consumidos pelo seguinte: entitlements -> qualidade -> familia -> UI -> privacidade/metricas -> gate. |
| `MF9 -> fecho PAP` | `COERENTE_COM_RISCOS` | A app esta funcionalmente provada por automatismos e E2E Chromium; o fecho sem ressalvas exige completar evidence manual `RNF21`/`RNF22`. |

### Validacoes executadas

| Comando | Resultado | Observacoes |
| --- | --- | --- |
| `cd real_dev/backend && node --test tests/unit/mf9-subscriptions.test.js` | `PASS` | 14 testes MF9, 14 passed, 0 failed. |
| `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | `PASS` | 24 testes, 24 passed, 0 failed. |
| `npm --prefix real_dev/backend test` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` | Na sandbox: 47/65 pass, 18 falhas HTTP por `listen EPERM 127.0.0.1`; fora da sandbox: 65/65 pass. |
| `npm --prefix real_dev/frontend run build` | `PASS` | Vite build passou; 104 modulos transformados. |
| `npm run smoke` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` | Na sandbox: backend smoke 0/8 por `listen EPERM`; fora da sandbox: backend smoke 8/8 e frontend build passou. |
| `bash scripts/validate-planificacao.sh` | `PASS` | `checked_bks=66`, `checked_guides=66`, `errors=[]`. |
| `node scripts/check-security-baseline.mjs` em `real_dev/backend` | `PASS` | `Hardening MF6: PASS`. |
| `node scripts/check-frontend-regression.mjs` em `real_dev/frontend` | `PASS` | `Regressao frontend MF6: PASS`. |
| `npx playwright test --list` | `PASS` | 9 testes E2E descobertos, incluindo MF9. |
| `npm --prefix real_dev/backend run seed:e2e:mf9` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` | Na sandbox falhou DNS MongoDB com `querySrv ECONNREFUSED`; fora da sandbox concluiu seed owner/member/pro/content. |
| `npx playwright test tests/e2e/mf9-family-subscription.spec.js` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` | Na sandbox falhou `EMFILE: too many open files, watch`; fora da sandbox passou 1/1 em Chromium. |
| Scan de drift de dominio em `real_dev/backend`, `real_dev/frontend` e `tests/e2e` | `PASS` | Sem ocorrencias de StudyFlow/OPSA/Orelle ou stack externa indevida no codigo real; matches apenas em historico do relatorio quando o proprio scan inclui este ficheiro. |
| Scan de seguranca basica | `PASS_COM_RISCOS` | Matches interpretados como falsos positivos/esperados: scanner, redaction, cookies de sessao, hashes/tokens de auth, fixtures e testes negativos; sem uso de `localStorage`/`sessionStorage`. |
| `git check-ignore -v real_dev real_dev/backend real_dev/frontend` | `INFO` | `.gitignore:2:real_dev/`; esperado e nao e finding. |
| `git diff --check` | `PASS` | Sem whitespace errors em diffs rastreados. |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF9.md docs/evidence/MF9/GATE-S13-MF9.md docs/evidence/MF9/REGRESSAO-MF9.md` | `PASS` | Sem trailing whitespace nos artefactos MF9 auditados. |

### Decisao

`MF9` fica auditada como `PASS_COM_RISCOS`.

Nao ha correcao de codigo necessaria nesta execucao. A unica acao pendente e operacional/evidence: concluir a ronda manual multi-browser e responsiva, anexar capturas/notas em `docs/evidence/MF9/` e so depois trocar `GO_COM_RESSALVAS` por `GO`, se nada falhar.

## Execucao 2026-07-04 - BK-MF9-06

### Resumo executivo

- Data da execucao: 2026-07-04
- Modo: `auditar_implementacao`
- Pedido efetivo: auditoria fresca do `BK-MF9-06`
- MF alvo: `MF9`
- BK alvo desta execucao: `BK-MF9-06`
- Resultado geral no recorte auditado: `PASS_COM_RISCOS`
- Estado do BK auditado: `CONFORME_COM_RISCOS`
- Raiz auditada: `real_dev`
- Backend real: `real_dev/backend`
- Frontend real: `real_dev/frontend`
- Commits: nao efetuados, conforme `PERMITIR_COMMITS: nao`
- Alteracoes de codigo: nenhuma
- Artefacto atualizado nesta execucao: este relatorio tecnico

`BK-MF9-06` esta funcionalmente conforme no recorte auditado: os planos Pro/Familia, a partilha familiar real, a qualidade por plano, a seed MF9, a regressao backend, o build frontend, a validacao da planificacao e o E2E Chromium especifico da MF9 passaram.

O estado correto continua a ser `PASS_COM_RISCOS`, nao `PASS` absoluto, porque a propria evidencia de gate S13 declara `GO_COM_RESSALVAS`: a revisao manual multi-browser completa de `RNF21`, a revisao visual mobile/desktop com capturas de `RNF22` e o negativo "E2E sem seed MF9" ainda nao estao fechados como prova final sem ressalvas.

Nao foram encontrados findings funcionais `P0`, `P1` ou `P2`. Foi registado um risco `P3` de completude de evidencia, sem necessidade de correcao de codigo nesta execucao.

### Escopo auditado

#### Incluido

- `BK-MF9-06 - Gate MF9, regressao e evidencia final`
- Coerencia dos BKs `BK-MF9-01` a `BK-MF9-05` como dependencias diretas do gate
- Evidence final em `docs/evidence/MF9`
- Relatorio de implementacao MF9 em `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md`
- Configuracao Playwright, seed MF9 e E2E MF9 real
- Suite backend MF9, suite backend completa, build frontend, scripts de regressao e validacao da planificacao
- Scans de seguranca basica, drift de dominio e falsos positivos conhecidos
- Coerencia vizinha `MF8 -> MF9` e `MF9 -> fecho PAP`

#### Fora de escopo

- Implementar ou corrigir codigo
- Alterar guias BK canonicos, RF, RNF, matrizes ou sprints
- Trocar manualmente `GO_COM_RESSALVAS` para `GO` sem nova evidencia manual
- Validar juridicamente RGPD, contratos de pagamento reais, CDN, DRM, browser lab externo ou infraestrutura de streaming real
- Criar commits, conforme `PERMITIR_COMMITS: nao`

### Documentos e fontes consultadas

- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md`
- `docs/evidence/MF9/GATE-S13-MF9.md`
- `docs/evidence/MF9/REGRESSAO-MF9.md`
- Codigo e testes em `real_dev/backend`, `real_dev/frontend` e `tests/e2e`

### Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF9-01` | `CONFORME` | Planos Pro/Familia e entitlements continuam provados por suite MF9, seed e gate |
| `BK-MF9-02` | `CONFORME` | Playback limita qualidade por entitlement, bloqueia URL 4K fora do plano e tem regressao unitariada |
| `BK-MF9-03` | `CONFORME` | API familiar real cobre convite, aceite, remocao, bloqueios negativos e acesso efetivo familiar |
| `BK-MF9-04` | `CONFORME` | UI de subscricao usa estado familiar canonico e E2E cobre owner, membro e Pro em Chromium |
| `BK-MF9-05` | `CONFORME` | Privacidade, eliminacao de conta, metricas agregadas e pool solidaria mantem cobertura MF9 |
| `BK-MF9-06` | `CONFORME_COM_RISCOS` | Gate, regressao, seed e E2E existem e passaram; falta prova manual completa de `RNF21`/`RNF22` e negativo sem seed |

### Rastreabilidade

| Requisito | Expected | Observed | Estado |
| --- | --- | --- | --- |
| `RF61` | Planos Pro/Familia expõem entitlements sem quebrar codigos atuais | Suite MF9 valida planos e checkout; gate marca `PASS` para planos e checkout inexistente | `PASS` |
| `RF62` | Partilha familiar usa contas reais, owner Familia ativo e bloqueios de membership duplicada | Suite MF9 e E2E Chromium validam convite, aceite, remocao, owner Pro bloqueado, membro pago/duplicado rejeitado e acesso removido | `PASS` |
| `RF63` | Backend limita qualidade por plano e nao entrega URL acima do entitlement | Suite MF9 valida filtro/fallback/4K Familia; E2E valida 4K permitido para Familia e bloqueado para Pro | `PASS` |
| `RNF21` | Compatibilidade com Chrome, Edge, Firefox e Safari | Chromium automatizado passou; Firefox/Safari/Edge ficam pendentes como revisao manual | `PASS_COM_RISCOS` |
| `RNF22` | Layout responsivo revisto em telemovel, tablet, portatil e desktop largo | Build e E2E desktop Chromium passaram; capturas mobile/desktop completas ficam pendentes | `PASS_COM_RISCOS` |
| `RNF29` | Testes automatizados dos fluxos criticos existem e sao executados | Suite MF9, backend completo, build frontend, seed e E2E MF9 passaram | `PASS` |
| `RNF38` | Interface por defeito em portugues de Portugal | UI principal de planos/familia/playback usa copy PT-PT; gate conserva ressalva para algum texto tecnico ASCII em seed/scripts | `PASS_COM_RISCOS` |
| `RNF40` | Datas e numeros visiveis seguem formato europeu | `SubscriptionPage.jsx` usa `Intl.NumberFormat("pt-PT")` e `toLocaleDateString("pt-PT")` | `PASS` |

### Evidencia tecnica

| Area | Evidencia |
| --- | --- |
| Contrato canonico | `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md:89` liga `BK-MF9-06` a `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40` |
| Guia do BK | `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md:14` define o mesmo conjunto RF/RNF |
| Criterio de decisao | `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md:820` permite `GO_COM_RESSALVAS` quando a app esta funcional mas falta revisao manual completa de browsers ou viewports |
| Gate S13 | `docs/evidence/MF9/GATE-S13-MF9.md:6` define decisao `GO_COM_RESSALVAS`; `:14` a `:21` marcam `RF61`, `RF62`, `RF63`, `RNF29` e `RNF40` como `PASS`, com `RNF21`, `RNF22` e `RNF38` em `PASS_COM_RISCOS` |
| Ressalvas de gate | `docs/evidence/MF9/GATE-S13-MF9.md:33` deixa o negativo "E2E sem seed MF9" como `NAO_EXECUTADO`; `:39` a `:42` registam Firefox/Safari/Edge e mobile como pendentes ou com ressalvas |
| Riscos aceites | `docs/evidence/MF9/GATE-S13-MF9.md:54` lista falta de revisao manual multi-browser, falta de revisao visual mobile/desktop com capturas e negativo sem seed |
| Regressao final | `docs/evidence/MF9/REGRESSAO-MF9.md:5` marca resultado geral `PASS_COM_RISCOS`; `:45` a `:46` repetem pendencias manuais de `RNF21` e `RNF22` |
| Relatorio de implementacao | `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md:13` a `:21` declara `GO_COM_RESSALVAS` e `IMPLEMENTADO_SEM_VALIDACAO_TOTAL` por falta das provas manuais |
| Playwright real | `playwright.config.js:26` a `:39` arranca backend e frontend reais para o E2E |
| Seed MF9 | `real_dev/backend/scripts/seed-mf9-e2e.js:99` remove apenas fixtures MF9; `:134` a `:207` cria owner, membro, utilizador Pro e conteudo com 1080p/4K |
| Suite MF9 - planos | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:355` a `:427` valida planos Pro/Familia, seed interna e checkout negativo |
| Suite MF9 - familia | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:430` a `:670` valida convite, aceite, remocao e bloqueios negativos familiares |
| Suite MF9 - qualidade | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:672` a `:784` valida filtro de qualidade, fallback e 4K permitido por Familia |
| Suite MF9 - operacao | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:846` a `:1031` valida export/delete account, metricas sem PII e pool solidaria sem duplicar memberships |
| E2E browser | `tests/e2e/mf9-family-subscription.spec.js:55` a `:151` valida fluxo real owner -> membro -> 4K Familia -> Pro bloqueado -> remocao |
| UI PT-PT e formato europeu | `real_dev/frontend/src/pages/SubscriptionPage.jsx:11` e `:41` usam formatadores `pt-PT`; `:220` a `:368` cobre UI de planos/familia |
| Playback UI | `real_dev/frontend/src/pages/PlaybackPage.jsx:279` a `:299` usa o seletor real de qualidade e video player no fluxo E2E |
| Metricas admin protegidas | `real_dev/backend/src/modules/admin-metrics/admin-metrics.routes.js:12` protege metricas com `requireRole(["admin"])` |

### Findings

| ID | Severidade | Area | Expected | Observed | Impacto | Recomendacao | Bloqueia MF |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `P3-MF9-06-01` | `P3` | `BK-MF9-06`, `RNF21`, `RNF22` | Gate final `GO` deve ter revisao multi-browser e viewport com evidence manual/capturas completas | Evidence atual conserva `GO_COM_RESSALVAS`, Firefox/Safari/Edge pendentes, mobile `PENDENTE_MANUAL` e negativo sem seed `NAO_EXECUTADO` | Nao ha defeito funcional provado, mas a defesa nao deve apresentar MF9 como `GO` sem ressalvas | Executar ronda manual Chrome/Edge/Firefox/Safari e viewports mobile/tablet/desktop largo, anexar capturas e atualizar gate se continuar limpo | Nao |

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Sem findings |
| `P1` | 0 | Sem findings |
| `P2` | 0 | Sem findings |
| `P3` | 1 | Risco de evidence incompleta, nao bloqueante |

### Coerencia MF/BK

| Relacao | Estado | Evidencia |
| --- | --- | --- |
| `MF8 -> MF9` | `COERENTE` | A auditoria nao reabre scope congelado de MF8 nem introduz IA/RAG/embeddings/CDN/DRM/gateway real; MF9 acrescenta apenas planos avancados, familia e qualidade por plano |
| `BK-MF9-01..05 -> BK-MF9-06` | `COERENTE` | O gate consome os contratos ja auditados: planos, qualidade, familia, UI, privacidade, metricas e pool solidaria |
| `MF9 -> fecho PAP` | `COERENTE_COM_RISCOS` | A implementacao esta funcionalmente provada por automatismos, mas o fecho sem ressalvas exige completar evidence manual `RNF21`/`RNF22` |

### Validacoes executadas

| Comando | Resultado | Observacoes |
| --- | --- | --- |
| `node --test tests/unit/mf9-subscriptions.test.js` em `real_dev/backend` | `PASS` | 14 testes MF9 do ficheiro direto executados, 14 passados |
| `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | `PASS` | 24 testes MF9 executados, 24 passados |
| `npm --prefix real_dev/backend test` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` | Dentro da sandbox falhou apenas com `listen EPERM` em 18 testes HTTP; reexecutado fora da sandbox e passou com 65/65 |
| `npm --prefix real_dev/frontend run build` | `PASS` | Build Vite concluida com sucesso |
| `bash scripts/validate-planificacao.sh` | `PASS` | `checked_bks=66`, `checked_guides=66`, sem erros |
| `node scripts/check-security-baseline.mjs` em `real_dev/backend` | `PASS` | `Hardening MF6: PASS` |
| `node scripts/check-frontend-regression.mjs` em `real_dev/frontend` | `PASS` | `Regressao frontend MF6: PASS` |
| `npm --prefix real_dev/backend run seed:e2e:mf9` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` | Dentro da sandbox falhou DNS Atlas com `ECONNREFUSED`; fora da sandbox concluiu a seed MF9 |
| `npx playwright test --list` | `PASS` | Suite E2E descoberta, 9 testes listados |
| `npx playwright test tests/e2e/mf9-family-subscription.spec.js` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` | Dentro da sandbox falhou com `EMFILE`; fora da sandbox passou 1 teste Chromium |
| Scan estatico de TODO/FIXME/secrets/localStorage/sessionStorage/deleteMany vazio | `PASS_COM_RISCOS` | Matches interpretados como falsos positivos: scanner/redaction, README, validadores e teste negativo `stripe_real` |
| Scan de drift de dominio `StudyFlow`/`OPSA`/`Orelle`/etc. | `PASS` | Sem ocorrencias em `real_dev/backend` e `real_dev/frontend` |
| `git diff --check` | `PASS` | Sem whitespace errors nos diffs rastreados |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF9.md docs/evidence/MF9/GATE-S13-MF9.md docs/evidence/MF9/REGRESSAO-MF9.md` | `PASS` | Sem trailing whitespace no relatorio e evidence MF9 |

### Decisao

`BK-MF9-06` fica marcado como `CONFORME_COM_RISCOS` e o recorte auditado como `PASS_COM_RISCOS`.

Nao ha correcao de codigo necessaria. A acao pendente e operacional/evidence: executar a ronda manual de browsers e viewports, anexar capturas/notas em `docs/evidence/MF9/` e so depois atualizar o gate de `GO_COM_RESSALVAS` para `GO`, caso nao surjam regressões.

## Execucao 2026-07-04 - BK-MF9-05

### Resumo executivo

- Data da execucao: 2026-07-04
- Modo: `auditar_implementacao`
- Pedido efetivo: auditoria fresca do `BK-MF9-05`
- MF alvo: `MF9`
- BK alvo desta execucao: `BK-MF9-05`
- Historico preservado: `BK-MF9-01`, `BK-MF9-02`, `BK-MF9-03` e `BK-MF9-04`
- Resultado geral no recorte auditado: `PASS`
- Estado do BK auditado: `CONFORME`
- Raiz auditada: `real_dev`
- Backend real: `real_dev/backend`
- Frontend real: `real_dev/frontend`
- Commits: nao efetuados, conforme `PERMITIR_COMMITS: nao`

`BK-MF9-05` esta conforme na implementacao real. A exportacao de dados pessoais inclui memberships familiares onde o utilizador autenticado e owner ou member, a eliminacao de conta invalida memberships familiares pendentes/ativas e devolve `familyMembershipsUpdated`, as metricas admin expõem apenas agregados familiares, e a distribuicao solidaria continua a contar apenas subscricoes pagas.

A auditoria nao fez alteracoes de codigo. O unico artefacto atualizado nesta execucao foi este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` no recorte auditado.

### Escopo auditado

#### Incluido

- `BK-MF9-05 - Privacidade, operacao e metricas da familia`
- Dependencias vizinhas `BK-MF9-03` e `BK-MF9-04`, mais handoff para `BK-MF9-06`
- Exportacao e eliminacao de conta em `real_dev/backend/src/modules/privacy`
- Metricas admin agregadas em `real_dev/backend/src/modules/admin-metrics`
- Distribuicao solidaria em `real_dev/backend/src/modules/charities`
- Testes unitarios MF9 de privacidade, metricas e pool solidaria
- Coerencia vizinha `MF5 -> MF9`, `MF8 -> MF9`, `BK-MF9-03 -> BK-MF9-05`, `BK-MF9-04 -> BK-MF9-05` e `BK-MF9-05 -> BK-MF9-06`

#### Fora de escopo

- Implementar ou corrigir codigo
- Alterar guias BK, documentos canonicos ou prompts
- Gate final completo de `BK-MF9-06`, incluindo evidencia manual HTTP/browser formal
- Validacao juridica externa de RGPD, DPIA ou relatorios legais fora do codigo auditado
- Alteracoes de UI, email real, gateway real, CDN, DRM, RAG, embeddings ou IA generativa

### Documentos e fontes consultadas

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-06-finalizacao-evidencia-m9.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md`
- Codigo e testes em `real_dev/backend` e `real_dev/frontend`

### Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF9-01` | `CONFORME` | Estado historico preservado: planos Pro/Familia e entitlements publicos ja auditados |
| `BK-MF9-02` | `CONFORME` | Estado historico preservado: playback usa acesso efetivo e limita qualidade por entitlement |
| `BK-MF9-03` | `CONFORME` | Estado historico preservado: API familiar real implementada com owner autenticado, conta membro existente, estados historicos, bloqueios negativos e acesso efetivo familiar |
| `BK-MF9-04` | `CONFORME` | Estado historico preservado: UI usa API familiar real, trata estados e recarrega estado canonico apos mutations |
| `BK-MF9-05` | `CONFORME` | Privacidade/export/delete account, metricas admin agregadas e pool solidaria estao implementadas e cobertas por testes |
| `BK-MF9-06` | `NAO_AUDITADO_NESTA_EXECUCAO` | Proximo BK vizinho; deve fechar evidencia final, gate, seeds e comprovativos manuais |

### Rastreabilidade

| BK | RF/RNF | Expected | Observed | Estado |
| --- | --- | --- | --- | --- |
| `BK-MF9-05` | `RF55`, `RF56`, `RF59`, `RF62`, `RNF17`, `RNF19`, `RNF30` | Exportar memberships familiares onde o user autenticado e owner/member; invalidar memberships pendentes/ativas na eliminacao de conta; expor `familyMembershipsUpdated`; expor metricas admin agregadas `familyMembers` e `familyInvitationsPending`; nao expor nomes/emails/ids pessoais nas metricas; manter pool solidaria baseada em subscricoes pagas; cobrir exportacao/inativacao por teste unitario | `privacy.service.js` exporta `subscription_family_memberships` por `ownerUserId`/`memberUserId`, filtra chaves sensiveis via `toExportValue`, invalida memberships em delete account e devolve contador; `admin-metrics.service.js` adiciona apenas contagens agregadas; `pool-distribution.service.js` calcula pool a partir de `subscriptions`; testes MF9 cobrem export/delete, metricas sem PII e pool sem duplicacao por memberships | `CONFORME` |

### Evidencia tecnica

| Area | Evidencia |
| --- | --- |
| Filtro de exportacao | `real_dev/backend/src/modules/privacy/privacy.service.js:41` a `:49` define chaves sensiveis excluidas (`password`, hashes, tokens, cookies e secrets) |
| Exportacao de memberships | `real_dev/backend/src/modules/privacy/privacy.service.js:140` a `:152` consulta `subscription_family_memberships` com `$or` por `ownerUserId` ou `memberUserId`, ordena por `createdAt` e aplica `toExportValue` |
| Integracao no export pessoal | `real_dev/backend/src/modules/privacy/privacy.service.js:162` a `:184` adiciona `sections.subscription_family_memberships` ao export do utilizador |
| Invalidacao familiar em delete account | `real_dev/backend/src/modules/privacy/privacy.service.js:261` a `:280` atualiza memberships `pending`/`active` para `removed`, com `removedReason: "account_deleted"` e timestamps |
| Resultado de eliminacao | `real_dev/backend/src/modules/privacy/privacy.service.js:290` a `:340` executa a limpeza da conta e devolve `familyMembershipsUpdated` |
| Rotas de privacidade | `real_dev/backend/src/modules/privacy/privacy.routes.js:17` a `:18` protege `GET /export` e `DELETE /account` com `requireAuth` |
| Controller de privacidade | `real_dev/backend/src/modules/privacy/privacy.controller.js:20` a `:37` devolve o export e o resultado de delete account sem expor logica de limpeza no cliente |
| Metricas admin agregadas | `real_dev/backend/src/modules/admin-metrics/admin-metrics.service.js:47` a `:126` preserva categorias existentes e adiciona `familyMembers` e `familyInvitationsPending` sob `subscriptions` |
| Contagens familiares | `real_dev/backend/src/modules/admin-metrics/admin-metrics.service.js:80` a `:81` conta memberships `active` e convites `pending` sem devolver documentos pessoais |
| Rota admin protegida | `real_dev/backend/src/modules/admin-metrics.routes.js:12` protege `/api/admin/metrics` com `requireRole(["admin"])` |
| Pool solidaria | `real_dev/backend/src/modules/charities/pool-distribution.service.js:113` a `:126` calcula receita elegivel a partir de `subscriptions` ativas e planos, sem consultar `subscription_family_memberships` |
| Indices familiares | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:514` a `:524` mantem indices e unicidade parcial para memberships abertas |
| Estados familiares | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:557` a `:590` fecha memberships quando owner muda plano ou membro passa a ter subscricao propria |
| Overview familiar | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:694` a `:731` fornece `ownedFamily`, `pendingInvitations` e `activeMembership` como fonte canonica para BK-MF9-04/05 |
| Teste export/delete | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:846` a `:884` confirma export de memberships e `familyMembershipsUpdated: 1` na eliminacao |
| Teste metricas sem PII | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:887` a `:972` confirma agregados familiares e ausencia de email/ids pessoais no JSON das metricas |
| Teste pool | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:975` a `:1031` confirma que memberships familiares nao duplicam receita da pool solidaria |

### Findings

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Sem findings |
| `P1` | 0 | Sem findings |
| `P2` | 0 | Sem findings |
| `P3` | 0 | Sem findings |

### Coerencia MF/BK

| Relacao | Estado | Evidencia |
| --- | --- | --- |
| `MF5 -> MF9` | `COERENTE` | O contrato de privacidade/export/delete account foi estendido para memberships familiares sem reduzir protecoes existentes nem expor chaves sensiveis |
| `MF8 -> MF9` | `COERENTE` | A auditoria nao alterou scope congelado de MF8; a implementacao MF9 adiciona subscricoes/familia sem mexer em IA/RAG/embeddings |
| `BK-MF9-03 -> BK-MF9-05` | `COERENTE` | As memberships criadas/geridas pela API familiar sao a mesma colecao exportada, invalidada e agregada em metricas |
| `BK-MF9-04 -> BK-MF9-05` | `COERENTE` | A UI consome estado familiar canonico e a privacidade/operacao tratam o mesmo modelo backend |
| `BK-MF9-05 -> BK-MF9-06` | `COERENTE_COM_RISCOS` | O BK-MF9-05 esta conforme, mas o BK-MF9-06 ainda deve produzir evidencia final completa, incluindo gate, seeds e comprovativos manuais HTTP/browser |

### Validacoes executadas

| Comando | Resultado | Observacoes |
| --- | --- | --- |
| `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | `PASS` | 24 testes MF9 executados, 24 passados |
| `npm --prefix real_dev/backend test` | `PASS_APOS_REEXECUCAO_FORA_SANDBOX` | No sandbox falhou apenas com `listen EPERM` em testes HTTP; reexecutado fora do sandbox e passou com 65/65 testes |
| `npm --prefix real_dev/frontend run build` | `PASS` | Build Vite concluida com sucesso |
| `node scripts/check-frontend-regression.mjs` em `real_dev/frontend` | `PASS` | `Regressao frontend MF6: PASS` |
| `node scripts/check-security-baseline.mjs` em `real_dev/backend` | `PASS` | `Hardening MF6: PASS` |
| `bash scripts/validate-planificacao.sh` | `PASS` | `checked_bks: 66`, `checked_guides: 66`, sem erros |
| Scan estatico de TODO/FIXME/secrets/localStorage/sessionStorage/deleteMany vazio | `PASS_COM_RISCOS` | Ocorrencias encontradas sao falsos positivos documentados: scanner de secrets, redaction keys, README e testes negativos existentes |
| Scan de drift de dominio `StudyFlow`/`OPSA`/`Orelle`/etc. | `PASS` | Sem ocorrencias em `real_dev/backend` e `real_dev/frontend` |
| `git diff --check` | `PASS` | Sem whitespace errors |

### Decisao

`BK-MF9-05` fica marcado como `CONFORME` no recorte auditado. Nao ha correcao de codigo necessaria para este BK.

O proximo passo natural e executar `BK-MF9-06` como fecho/gate de MF9, recolhendo evidencia final de seeds, smoke/API/browser/manual e reportando qualquer risco residual de operacao.

## Execucao 2026-07-04 - BK-MF9-04

### Resumo executivo

- Data da execucao: 2026-07-04
- Modo: `auditar_implementacao`
- Pedido efetivo: auditoria fresca do `BK-MF9-04`
- MF alvo: `MF9`
- BK alvo desta execucao: `BK-MF9-04`
- Historico preservado: `BK-MF9-01`, `BK-MF9-02` e `BK-MF9-03`
- Resultado geral no recorte auditado: `PASS`
- Estado do BK auditado: `CONFORME`
- Raiz auditada: `real_dev`
- Backend real: `real_dev/backend`
- Frontend real: `real_dev/frontend`
- Commits: nao efetuados, conforme `PERMITIR_COMMITS: nao`

`BK-MF9-04` esta conforme na implementacao real. A UI de subscricao carrega planos, subscricao e estado familiar canonico, apresenta estados de loading/erro/sucesso/vazio em PT-PT, permite ao owner Familia convidar e remover membros, permite ao membro aceitar/recusar convites e sair da familia, e recarrega o estado canonico apos mutations.

A auditoria nao fez alteracoes de codigo. O unico artefacto atualizado nesta execucao foi este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` no recorte auditado.

### Escopo auditado

#### Incluido

- `BK-MF9-04 - UI de gestao familiar e convites`
- Dependencia direta `BK-MF9-03` e handoff para `BK-MF9-05`
- Frontend real de subscricao, cliente API e tratamento de erros
- Backend real de subscricoes, rotas, controllers, service e testes MF9 que suportam a UI
- Coerencia vizinha `MF8 -> MF9`, `MF1 -> MF9`, `BK-MF9-03 -> BK-MF9-04` e `BK-MF9-04 -> BK-MF9-05/06`
- Referencia visual do mockup apenas para hierarquia de planos, sem a tratar como contrato tecnico

#### Fora de escopo

- Implementar ou corrigir codigo
- Alterar guias BK, documentos canonicos ou prompts
- Implementar privacidade/metricas familiares profundas, scope de `BK-MF9-05`
- Gate final completo, seed/E2E/browser formal e relatorio de fecho, scope de `BK-MF9-06`
- Envio real de email, links publicos de convite, gateway real, CDN, DRM, RAG, embeddings ou IA generativa

### Documentos e fontes consultadas

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familiar-convites.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md`
- `mockup/src/app/pages/PlanosPage.tsx`
- Codigo e testes em `real_dev/backend` e `real_dev/frontend`

### Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF9-01` | `CONFORME` | Estado historico preservado: planos Pro/Familia e entitlements publicos ja auditados |
| `BK-MF9-02` | `CONFORME` | Estado historico preservado: playback usa acesso efetivo e limita qualidade por entitlement |
| `BK-MF9-03` | `CONFORME` | API familiar real implementada com owner autenticado, conta membro existente, estados historicos, bloqueios negativos e acesso efetivo familiar |
| `BK-MF9-04` | `CONFORME` | UI usa API familiar real, nao envia autoridade de owner, trata estados e recarrega estado canonico apos operacoes |
| `BK-MF9-05` | `NAO_AUDITADO_NESTA_EXECUCAO` | Proximo BK vizinho; recebe memberships familiares para privacidade, operacao e metricas |

### Rastreabilidade

| BK | RF/RNF | Expected | Observed | Estado |
| --- | --- | --- | --- | --- |
| `BK-MF9-04` | `RF62`, `RNF01`, `RNF05`, `RNF38`, `RNF40` | Frontend mostra planos/subscricao/estado familiar; owner Familia convida e remove; membro aceita, recusa e sai; loading/error/success/vazio sao visiveis; copy PT-PT; frontend nao envia `ownerUserId` nem decide permissoes; backend continua a derivar autoridade da sessao | `SubscriptionPage.jsx` carrega planos, `/me` e `family`; `subscriptionsApi.js` cobre endpoints familiares; `apiClient.js` usa cookies de sessao; `runOperation(...)` recarrega estado canonico; `handleInvite(...)` limpa email apenas em sucesso; backend protege rotas com `requireAuth` e usa `req.user.id`; testes MF9 cobrem positivos e negativos familiares | `CONFORME` |

### Evidencia tecnica

| Area | Evidencia |
| --- | --- |
| Cliente API familiar | `real_dev/frontend/src/services/api/subscriptionsApi.js:13` a `:54` cobre planos, subscricao atual e endpoints familiares de overview, convite, aceitar, recusar, remover e sair |
| Sessao frontend | `real_dev/frontend/src/services/api/apiClient.js:57` a `:63` envia cookies com `credentials: "include"` e nao usa tokens locais no cliente |
| Erros PT-PT | `real_dev/frontend/src/services/api/apiErrors.js:38` a `:74` transforma respostas HTTP em mensagens visiveis e previsiveis |
| Carregamento canonico | `real_dev/frontend/src/pages/SubscriptionPage.jsx:90` a `:111` carrega planos e subscricao atual, incluindo `subscriptionResponse.family` |
| Operacoes idempotentes de UI | `real_dev/frontend/src/pages/SubscriptionPage.jsx:118` a `:140` centraliza mutations, mostra sucesso/erro, recarrega dados canonicos e devolve boolean de sucesso |
| Convite sem perda de input em erro | `real_dev/frontend/src/pages/SubscriptionPage.jsx:185` a `:201` envia apenas `email` e limpa o campo apenas quando a operacao e criada com sucesso |
| Estados de UX | `real_dev/frontend/src/pages/SubscriptionPage.jsx:204` a `:222` mostra loading, erro e sucesso com regioes visiveis |
| Estado de subscricao | `real_dev/frontend/src/pages/SubscriptionPage.jsx:224` a `:235` apresenta plano atual, qualidade, fim de ciclo e owner |
| Planos e trial | `real_dev/frontend/src/pages/SubscriptionPage.jsx:238` a `:271` apresenta planos disponiveis, preco, qualidade, lugares familiares e estado trial |
| Gestao familiar owner | `real_dev/frontend/src/pages/SubscriptionPage.jsx:274` a `:314` mostra lugares, formulario de convite, membros ativos e remocao |
| Convites e membership ativa | `real_dev/frontend/src/pages/SubscriptionPage.jsx:320` a `:368` permite aceitar/recusar convites pendentes e sair de uma familia ativa |
| Label familiar | `real_dev/frontend/src/pages/SubscriptionPage.jsx:65` a `:72` define `familyUserLabel(...)` para renderizar nome/email/id sem expor logica de permissao |
| Rotas backend | `real_dev/backend/src/modules/subscriptions/subscriptions.routes.js:28` a `:37` deixa `/plans` publico e protege `/me` e `/family/*` com `requireAuth` |
| Autoridade backend | `real_dev/backend/src/modules/subscriptions/subscriptions.controller.js:63` a `:119` deriva owner/member autenticado de `req.user.id` nas operacoes familiares |
| Overview familiar | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:694` a `:731` devolve `ownedFamily`, `pendingInvitations` e `activeMembership` para a UI |
| Estado `/me` | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:740` a `:758` integra estado familiar no contrato de subscricao |
| Convite familiar | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:780` a `:837` valida email, conta existente, owner Familia, auto-convite, assentos, membro pago e duplicados |
| Aceitar convite | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:847` a `:895` valida membro autenticado, estado pending, subscricao propria, duplicados, owner Familia e assentos |
| Recusar/remover/sair | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:904` a `:972` atualiza estados sem apagar historico |
| Testes positivos | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:404` a `:453` cobre convite, overview, aceitar, acesso familiar e remocao |
| Testes negativos | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:455` a `:644` cobre owner sem Familia, email inexistente, auto-convite, membro pago, duplicado, accept por outro user, decline, leave e owner sem Familia ativo |

### Findings

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Sem findings |
| `P1` | 0 | Sem findings |
| `P2` | 0 | Sem findings |
| `P3` | 0 | Sem findings |

### Coerencia MF/BK

| Relacao | Estado | Evidencia |
| --- | --- | --- |
| `MF8 -> MF9` | `COERENTE` | A area de subscricoes MF9 reutiliza hardening, logs e auth sem reabrir fluxos admin ou expor segredos |
| `MF1 -> MF9` | `COERENTE` | O frontend usa `apiClient` com cookies de sessao e mensagens de erro normalizadas, sem authority client-side |
| `BK-MF9-03 -> BK-MF9-04` | `COERENTE` | A UI consome diretamente o contrato familiar implementado no BK anterior |
| `BK-MF9-04 -> BK-MF9-05` | `COERENTE` | Memberships e convites expostos pela UI alimentam o proximo BK de privacidade, operacao e metricas |
| `MF9 -> BK-MF9-06` | `COERENTE_COM_RISCOS` | O recorte esta tecnicamente conforme, mas o gate final deve recolher evidencia E2E/browser/manual de owner convida, membro aceita e owner remove |

### Validacoes executadas

| Comando | Resultado | Observacoes |
| --- | --- | --- |
| `npm --prefix real_dev/frontend run build` | `PASS` | Vite build concluido com 104 modulos transformados |
| `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | `PASS` | 22 testes MF9 passaram |
| `node scripts/check-frontend-regression.mjs` em `real_dev/frontend` | `PASS` | Regressao frontend MF6 sem quebras detetadas |
| `node scripts/check-security-baseline.mjs` em `real_dev/backend` | `PASS` | Hardening MF6 sem regressao detetada |
| Scan estatico de segredos/tokens | `PASS_COM_RISCOS` | Ocorrencias analisadas correspondem a scanner, redaction/logger, filtros privacy e testes/validacoes esperadas |
| Scan de drift de dominio | `PASS` | Sem referencias a `StudyFlow`, `OPSA`, `Orelle` ou entidades externas indevidas |
| `npm --prefix real_dev/backend test` no sandbox | `BLOQUEADO_AMBIENTE` | 18 testes HTTP falharam com `listen EPERM` em `127.0.0.1`, restricao ambiental do sandbox |
| `npm --prefix real_dev/backend test` fora do sandbox | `PASS` | 63/63 testes passaram |
| `bash scripts/validate-planificacao.sh` | `PASS` | `checked_bks=66`, `checked_guides=66`, sem erros |
| `git diff --check` | `PASS` | Sem whitespace errors nos ficheiros versionados |

### Decisao

`BK-MF9-04` fica `CONFORME` no recorte auditado.

Nao ha correcao obrigatoria de codigo para este BK. A unica recomendacao operacional e recolher evidencia manual/browser no gate `BK-MF9-06` para o fluxo completo owner Familia convida, membro aceita/recusa/sai e owner remove.

## Execucao 2026-07-04 - BK-MF9-03

### Resumo executivo

- Data da execucao: 2026-07-04
- Modo: `auditar_implementacao`
- Pedido efetivo: auditoria fresca do `BK-MF9-03`
- MF alvo: `MF9`
- BK alvo desta execucao: `BK-MF9-03`
- Historico preservado: `BK-MF9-01` e `BK-MF9-02`
- Resultado geral no recorte auditado: `PASS`
- Estado do BK auditado: `CONFORME`
- Raiz auditada: `real_dev`
- Backend real: `real_dev/backend`
- Frontend real: `real_dev/frontend`
- Commits: nao efetuados, conforme `PERMITIR_COMMITS: nao`

`BK-MF9-03` esta conforme na implementacao real. O backend implementa partilha familiar entre contas existentes, exige owner autenticado com plano Familia ativo, bloqueia auto-convite, membros com subscricao paga ativa e duplicados abertos, mantem historico por estados e integra o acesso familiar em `getEffectiveSubscriptionAccess(...)`/`hasActiveSubscriptionAccess(...)`.

A auditoria nao fez alteracoes de codigo. O unico artefacto atualizado nesta execucao foi este relatorio tecnico permitido por `OUTPUT_MODE=relatorio_e_resumo`.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` no recorte auditado.

### Escopo auditado

#### Incluido

- `BK-MF9-03 - Modelo e API de partilha familiar`
- Dependencias diretas `BK-MF9-01`, `BK-MF2-01` e handoff de `BK-MF9-02`
- Handoff para `BK-MF9-04` e fronteira de privacidade/metricas com `BK-MF9-05`
- Backend real de subscricoes, rotas, controllers, notificacoes e testes MF9
- Cliente API frontend necessario ao handoff de UI
- Coerencia vizinha `MF8 -> MF9`, `MF2 -> MF9`, `BK-MF9-02 -> BK-MF9-03` e `BK-MF9-03 -> BK-MF9-04/05`

#### Fora de escopo

- Implementar ou corrigir codigo
- Alterar guias BK, documentos canonicos ou prompts
- Implementar UI de gestao familiar, scope de `BK-MF9-04`
- Implementar telemetria/privacidade profunda de partilha familiar, scope de `BK-MF9-05`
- Envio real de email, links publicos de convite, regras parentais avancadas, gateway real, CDN, DRM, RAG, embeddings ou IA generativa
- Executar E2E MF9 com browser real ou gate final `BK-MF9-06`

### Documentos e fontes consultadas

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-04-ui-gestao-familia.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-limites-partilha-familiar.md`
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md`
- Codigo e testes em `real_dev/backend` e `real_dev/frontend`

### Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF9-01` | `CONFORME` | Estado historico preservado: planos Pro/Familia e entitlements publicos ja auditados |
| `BK-MF9-02` | `CONFORME` | Estado historico preservado: playback usa acesso efetivo e limita qualidade por entitlement |
| `BK-MF9-03` | `CONFORME` | API familiar real implementada com owner autenticado, conta membro existente, estados historicos, bloqueios negativos e acesso efetivo familiar |

### Rastreabilidade

| BK | RF/RNF | Expected | Observed | Estado |
| --- | --- | --- | --- | --- |
| `BK-MF9-03` | `RF62`, `RNF13`, `RNF15`, `RNF16`, `RNF19` | Owner com plano Familia ativo convida conta existente; rotas `/api/subscriptions/family/*` exigem auth; owner/member derivam da sessao; convite bloqueia self-invite, membro com subscricao paga e duplicados abertos; aceitar/recusar/remover/sair altera estado sem apagar historico; acesso familiar so existe enquanto o owner mantem Familia ativo | Rotas familiares usam `requireAuth`; controllers usam `req.user.id`; service valida email, owner Familia ativo, assentos, duplicados, subscricao paga do membro e estados; `getEffectiveSubscriptionAccess(...)` resolve `own`, `family` ou `none`; testes MF9 cobrem fluxos positivos e negativos | `CONFORME` |

### Evidencia tecnica

| Area | Evidencia |
| --- | --- |
| Entitlements Familia | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:32` a `:60` define `familySharing`, `maxFamilyMembers` e `maxQuality`; `:93` a `:118` define planos Familia |
| Helpers de identidade | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:141` a `:160` valida ids de utilizador/objeto antes de consultas |
| Modelo publico familiar | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:296` a `:328` serializa utilizadores e memberships sem expor autoridade arbitraria |
| Memberships abertas | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:338` a `:342` limita estados abertos a `pending` e `active` |
| Plano Familia obrigatorio | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:386` a `:395` exige owner com plano Familia ativo antes de partilhar |
| Acesso efetivo | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:424` a `:481` resolve acesso proprio, familiar ou nenhum e confirma que o owner mantem Familia ativo |
| Indices e unicidade | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:514` a `:524` cria indice parcial unico por `memberUserId` para memberships abertas |
| Mudanca de subscricao | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:557` a `:590` desativa familia detida ou membership ativa quando o utilizador passa a ter subscricao propria |
| Overview familiar | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:694` a `:731` devolve `ownedFamily`, `pendingInvitations` e `activeMembership` |
| Integracao `/me` | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:740` a `:758` inclui acesso efetivo e familia no estado de subscricao |
| Gate premium | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:768` a `:771` expoe `hasActiveSubscriptionAccess(...)` baseado no acesso efetivo |
| Convite familiar | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:780` a `:837` valida email, conta existente, owner Familia, self-invite, assentos, membro pago e duplicados |
| Aceitar convite | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:847` a `:895` valida membro autenticado, estado pending, subscricao paga, duplicados, owner Familia e assentos |
| Recusar/remover/sair | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:904` a `:972` muda estados para `declined`, `removed` ou `left` sem apagar historico |
| Rotas autenticadas | `real_dev/backend/src/modules/subscriptions/subscriptions.routes.js:28` a `:37` deixa planos publicos e protege `/me` e `/family/*` com `requireAuth` |
| Autoridade de sessao | `real_dev/backend/src/modules/subscriptions/subscriptions.controller.js:63` a `:119` usa `req.user.id` em overview, invite, accept, decline, remove e leave |
| Middleware auth | `real_dev/backend/src/modules/auth/auth.middleware.js:13` a `:18` devolve `401` quando nao ha utilizador autenticado |
| Notificacoes | `real_dev/backend/src/modules/notifications/notifications.validation.js:12` a `:20` aceita eventos familiares; `real_dev/backend/src/modules/notifications/notifications.service.js:137` a `:185` cria notificacoes validadas |
| Cliente frontend | `real_dev/frontend/src/services/api/subscriptionsApi.js:26` a `:54` expoe os metodos familiares para `BK-MF9-04`; `real_dev/frontend/src/services/api/apiClient.js:57` a `:63` usa cookies com `credentials: "include"` |
| Testes positivos | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:404` a `:453` cobre convite, overview, aceitar, acesso familiar e remocao |
| Testes negativos | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:455` a `:529` bloqueia owner sem Familia, email inexistente, self-invite, membro pago e duplicado |
| Estados historicos | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:531` a `:606` cobre accept por outro user, decline e leave |
| Owner sem Familia ativo | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:608` a `:644` confirma que membership ativa nao da acesso se o owner ja nao tiver Familia |

### Findings

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Sem findings |
| `P1` | 0 | Sem findings |
| `P2` | 0 | Sem findings |
| `P3` | 0 | Sem findings |

### Coerencia entre MFs/BKs

| Fronteira | Estado | Evidencia |
| --- | --- | --- |
| `MF8 -> MF9` | `COERENTE` | MF9 continua como extensao posterior ao scope freeze, sem reabrir entregas MF8 |
| `MF2 -> MF9` | `COERENTE` | A partilha familiar depende de contas existentes e auth real, mantendo autoridade na sessao |
| `BK-MF9-01 -> BK-MF9-03` | `COERENTE` | O plano Familia e os entitlements publicados alimentam a elegibilidade de owner e limites familiares |
| `BK-MF9-02 -> BK-MF9-03` | `COERENTE` | O playback ja consome `getEffectiveSubscriptionAccess(...)`; o acesso familiar entra pela mesma fonte unica |
| `BK-MF9-03 -> BK-MF9-04` | `COERENTE` | O cliente frontend ja dispoe de metodos `family`, mas a UI propria permanece corretamente fora deste BK |
| `BK-MF9-03 -> BK-MF9-05` | `COERENTE_COM_RISCOS` | O modelo preserva estados e evita autoridade arbitraria; auditoria profunda de privacidade, limites e metricas pertence ao BK seguinte |

### Validacoes executadas

| Comando | Diretoria | Resultado |
| --- | --- | --- |
| `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | raiz do repo | `PASS`: 22/22 |
| `npm --prefix real_dev/frontend run build` | raiz do repo | `PASS` |
| `node scripts/check-security-baseline.mjs` | `real_dev/backend` | `PASS`: `Hardening MF6: PASS` |
| `node scripts/check-frontend-regression.mjs` | `real_dev/frontend` | `PASS`: `Regressao frontend MF6: PASS` |
| `npm --prefix real_dev/backend test` | raiz do repo, sandbox | `BLOQUEADO_AMBIENTE`: testes HTTP falharam com `listen EPERM 127.0.0.1`; 45 passaram antes do erro |
| `npm --prefix real_dev/backend test` | raiz do repo, fora do sandbox | `PASS`: 63/63 |
| Pesquisa estatica de seguranca em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS_COM_RISCOS`: ocorrencias interpretadas como falsos positivos em README, scanner, logger/redaction, validadores e teste negativo `stripe_real` |
| Pesquisa de drift de dominio em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS`: zero ocorrencias |
| `bash scripts/validate-planificacao.sh` | raiz do repo | `PASS`: `checked_bks=66`, `checked_guides=66`, `errors=[]` |
| `git diff --check` | raiz do repo | `PASS` |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF9.md` | raiz do repo | `PASS`: sem whitespace final |

### Observacoes de auditoria

- `real_dev/` esta ignorado por `.gitignore`; confirmado com `git check-ignore -v real_dev/backend/tests/unit/mf9-subscriptions.test.js`.
- O build frontend atualiza `real_dev/frontend/dist/`, tambem ignorado por `real_dev/`.
- A falha `listen EPERM 127.0.0.1` na suite backend completa foi ambiental do sandbox; a mesma suite passou fora do sandbox.
- Nao houve alteracoes de codigo nesta execucao.

### Decisao

`BK-MF9-03` fica `CONFORME` e o recorte auditado da MF9 fica em `PASS`.

### Proxima acao recomendada

Avancar para `BK-MF9-04`, usando o contrato de API familiar ja exposto em `subscriptionsApi` para construir a UI sem duplicar regras de autorizacao no frontend.

---

## Historico preservado - execucao 2026-07-03 - BK-MF9-02

### Resumo executivo

- Data da execucao: 2026-07-03
- Modo: `auditar_implementacao`
- Pedido efetivo: re-auditoria fresca do `BK-MF9-02`
- MF alvo: `MF9`
- BK alvo desta execucao: `BK-MF9-02`
- Historico preservado: `BK-MF9-01`
- Resultado geral no recorte auditado: `PASS`
- Estado do BK auditado: `CONFORME`
- Raiz auditada: `real_dev`
- Backend real: `real_dev/backend`
- Frontend real: `real_dev/frontend`
- Commits: nao efetuados, conforme `PERMITIR_COMMITS: nao`

`BK-MF9-02` esta conforme na implementacao real. O backend aplica a qualidade maxima por entitlement, remove URLs de qualidades bloqueadas antes da resposta publica, faz fallback para a melhor qualidade permitida quando a preferencia guardada excede o plano e usa `getEffectiveSubscriptionAccess(...)` como ponto unico de acesso. A UI mostra as qualidades bloqueadas como desativadas e nao cria URLs de media localmente.

Esta re-auditoria voltou a consultar os contratos, a implementacao real e a suite de validacao em vez de assumir o estado do relatorio anterior.

Nao foram encontrados findings `P0`, `P1`, `P2` ou `P3` no recorte auditado.

### Escopo auditado

#### Incluido

- `BK-MF9-02 - Qualidade de streaming por plano`
- Dependencias diretas `BK-MF9-01` e `BK-MF2-06`
- Handoff para `BK-MF9-03`
- Backend, frontend, API client e testes reais dentro de `real_dev`
- Coerencia vizinha `MF8 -> MF9`, `MF2 -> MF9` e `BK-MF9-02 -> BK-MF9-03`

#### Fora de escopo

- Implementar ou corrigir codigo
- Alterar guias BK, documentos canonicos ou prompts
- Auditar em profundidade `BK-MF9-03..BK-MF9-06`
- Executar E2E MF9 com browser real
- Criar gate final S13
- Gateway real, CDN, DRM, streaming adaptativo real, RAG, embeddings ou IA generativa

### Documentos e fontes consultadas

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-01-planos-pro-familia-entitlements.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-02-qualidade-streaming-por-plano.md`
- `docs/planificacao/guias-bk/MF9/BK-MF9-03-modelo-api-partilha-familiar.md`
- BKs restantes de `MF9` por inventario de ficheiros
- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md`
- Codigo e testes em `real_dev/backend` e `real_dev/frontend`

### Estado por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF9-01` | `CONFORME` | Estado historico preservado: planos Pro/Familia e entitlements publicos ja auditados |
| `BK-MF9-02` | `CONFORME` | Playback limita qualidade por entitlement, nao expoe URL acima do plano, faz fallback seguro e tem testes positivos/negativos |

### Rastreabilidade

| BK | RF/RNF | Expected | Observed | Estado |
| --- | --- | --- | --- | --- |
| `BK-MF9-02` | `RF15`, `RF63`, `RNF29` | Pro/trial limitados a `1080p`, Familia autorizada a `2160p/4K`, URLs bloqueadas ausentes, fallback seguro e testes automatizados | `ENTITLEMENTS` define rankings por plano; `filterQualityOptionsByEntitlements(...)` remove `playbackUrl`/`src` bloqueados; `getPlayback(...)` usa acesso efetivo; UI desativa `locked`; suite MF9 cobre filtro, fallback, 4K Familia, draft e subscricao expirada | `CONFORME` |

### Evidencia tecnica

| Area | Evidencia |
| --- | --- |
| Entitlements Pro/Familia | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:24` define `QUALITY_RANKS`; `:32` a `:60` define `none/trial/pro/family`; `:63` a `:120` define planos Pro/Familia |
| Normalizacao de rank | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:168` a `:175` transforma `1080p`, `2160p` e `4K` em valores comparaveis |
| Acesso efetivo | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:424` a `:481` resolve acesso proprio, familiar ou nenhum com entitlements centralizados |
| Filtro de qualidade | `real_dev/backend/src/modules/subscriptions/subscriptions.service.js:490` a `:507` marca bloqueadas e remove `playbackUrl`/`src` acima do entitlement |
| Playback backend | `real_dev/backend/src/modules/playback/playback.service.js:68` a `:96` escolhe media permitida e fallback; `:123` a `:136` publica `qualityOptions` filtradas; `:162` a `:187` valida publicado, parental e acesso efetivo |
| Gate premium | `real_dev/backend/src/modules/subscriptions/subscription-access.middleware.js:21` a `:30` bloqueia playback sem subscricao ativa |
| Cliente API | `real_dev/frontend/src/services/api/apiClient.js:57` a `:63` usa `credentials: "include"` no cliente central |
| UI de player | `real_dev/frontend/src/pages/PlaybackPage.jsx:95` a `:108` seleciona apenas qualidades nao bloqueadas; `:225` a `:231` evita selecionar preferencia bloqueada; `:276` a `:289` desativa opcoes `locked` |
| Testes de filtro/fallback | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:478` a `:540` valida filtro Pro e fallback para `1080p` |
| Testes de Familia/negativos | `real_dev/backend/tests/unit/mf9-subscriptions.test.js:542` a `:650` valida 4K Familia, conteudo `draft` e subscricao expirada |

### Findings

| Severidade | Quantidade | Estado |
| --- | ---: | --- |
| `P0` | 0 | Sem findings |
| `P1` | 0 | Sem findings |
| `P2` | 0 | Sem findings |
| `P3` | 0 | Sem findings |

### Coerencia entre MFs

| Fronteira | Estado | Evidencia |
| --- | --- | --- |
| `MF8 -> MF9` | `COERENTE` | MF9 continua como extensao posterior ao scope freeze, sem reabrir entregas MF8 |
| `MF2 -> MF9` | `COERENTE` | `BK-MF2-06` entregou `qualityOptions`, preferencias e parental; `BK-MF9-02` reutiliza estes contratos sem construir URLs no frontend |
| `BK-MF9-01 -> BK-MF9-02` | `COERENTE` | `qualityRank` e `maxQuality` publicados em planos alimentam o filtro backend |
| `BK-MF9-02 -> BK-MF9-03` | `COERENTE` | `getEffectiveSubscriptionAccess(...)` ja centraliza a origem do acesso, permitindo que a partilha familiar alimente o mesmo player |

### Validacoes executadas

| Comando | Diretoria | Resultado |
| --- | --- | --- |
| `npm --prefix real_dev/backend test -- --test-name-pattern=MF9` | raiz do repo | `PASS`: 20/20 |
| `npm --prefix real_dev/backend test` | raiz do repo, sandbox | `BLOQUEADO_AMBIENTE`: 18 testes HTTP falharam com `listen EPERM 127.0.0.1`; 43 passaram |
| `npm --prefix real_dev/backend test` | raiz do repo, fora do sandbox | `PASS`: 61/61 |
| `npm --prefix real_dev/frontend run build` | raiz do repo | `PASS` |
| `node scripts/check-security-baseline.mjs` | `real_dev/backend` | `PASS`: `Hardening MF6: PASS` |
| `node scripts/check-frontend-regression.mjs` | `real_dev/frontend` | `PASS`: `Regressao frontend MF6: PASS` |
| `bash scripts/validate-planificacao.sh` | raiz do repo | `PASS`: `checked_bks=66`, `checked_guides=66`, `errors=[]` |
| Pesquisa estatica de seguranca em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS_COM_RISCOS`: ocorrencias interpretadas como falsos positivos em README, scanner, logger/redaction, validadores e teste negativo `stripe_real` |
| Pesquisa de drift de dominio em `real_dev/backend` e `real_dev/frontend` | raiz do repo | `PASS`: zero ocorrencias |
| `git diff --check` | raiz do repo | `PASS` |
| `rg -n "[ \t]+$" docs/planificacao/guias-bk/AUDITORIA-IMPLEMENTACAO-real_dev-MF9.md docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF9.md real_dev/backend/tests/unit/mf9-subscriptions.test.js` | raiz do repo | `PASS`: sem whitespace final |

### Observacoes de auditoria

- `real_dev/` esta ignorado por `.gitignore`; confirmado com `git check-ignore -v`. Isto e esperado e nao e finding.
- O build frontend atualiza `real_dev/frontend/dist/`, tambem ignorado por `real_dev/`.
- A auditoria nao executou E2E MF9 com browser real; o BK alvo pede cobertura por testes backend de filtro/fallback e a execucao E2E completa pertence ao gate `BK-MF9-06`.
- Nao houve alteracoes de codigo nesta execucao.

### Decisao

`BK-MF9-02` fica `CONFORME` e o recorte auditado da MF9 fica em `PASS`.

### Proxima acao recomendada

Avancar para `BK-MF9-03`, mantendo `getEffectiveSubscriptionAccess(...)` como fonte unica de acesso proprio/familiar e sem duplicar regras de qualidade no player.
