# Auditoria de implementacao - real_dev - MF3

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-07-08`
- `implementation_lane`: `REFERENCE`
- `current_authority`: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-END-TO-END-real_dev.md`
- `proof_scope`: auditoria MF3 e atualizações observadas até 2026-07-08; não constituem revalidação F9

> Execucao revalidada em `2026-06-12` no repositorio local FaithFlix, com nova leitura estatica e comandos de validacao executados nesta auditoria.

> Atualizacao tecnica em `2026-07-02`: `BK-MF3-05` passou a incluir embeddings opcionais de conteudo (`content_embeddings`) e `BK-MF3-06` passou a explicar `semantic-similarity` sem expor vectores, scores internos ou historico detalhado.

> Atualizacao UX em `2026-07-08`: `BK-MF3-04` passou a expor home publica menos redundante, com `most-watched`, `recent` e `formats`; os carrosseis fixos `documentaries` e `top-rated` foram removidos da home, mantendo rating como sort da pesquisa.

## Resultado geral

- Estado: PASS_COM_RISCOS
- MF auditada: MF3
- BKs auditados: BK-MF3-01, BK-MF3-02, BK-MF3-03, BK-MF3-04, BK-MF3-05, BK-MF3-06
- Implementacao auditada: `real_dev`
- Coerencia entre MFs: adjacentes
- Fronteiras auditadas: `MF2 -> MF3`; `MF3 -> MF4`
- Resumo: a implementacao em `real_dev` cumpre os contratos tecnicos essenciais da MF3: ratings, comentarios, pesquisa, filtros/discovery/formatos/relacionados, recomendacao baseline e explicabilidade. Os comandos relevantes passaram quando executados em ambiente apropriado. Nao foram encontrados P0/P1/P2 ativos na MF3. O tracking documental da MF3 encontra-se alinhado em `2026-06-12`, com atualizacao UX registada em `2026-07-08`.
- Pode avancar para a proxima MF: Sim, com reservas.

## Escopo auditado

- Documentos consultados: `README.md`; `docs/RF.md`; `docs/RNF.md`; `docs/planificacao/README.md`; `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`; `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`; `docs/planificacao/backlogs/BACKLOG-MVP.md`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`; `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`; `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`; `docs/planificacao/backlogs/MF-VIEWS.md`; `docs/planificacao/sprints/PLANO-SPRINTS.md`; `docs/planificacao/sprints/SCORECARD-SPRINTS.md`; `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`; `docs/planificacao/guias-bk/README.md`; `GLOSSARIO-TERMOS-TECNICOS-PAP.md`; todos os BKs de `docs/planificacao/guias-bk/MF3/`; BKs de fronteira `BK-MF2-03`, `BK-MF2-07` e `BK-MF4-01`; relatorios existentes de implementacao/auditoria MF2/MF3; `real_dev/backend/package.json`; `real_dev/frontend/package.json`; estrutura relevante de `real_dev`.
- BKs incluidos: todos os BKs da MF3.
- BKs excluidos: nenhum.
- MFs implementadas detetadas: `MF1` IMPLEMENTADA; `MF2` IMPLEMENTADA com divida registada na auditoria MF2; `MF3` IMPLEMENTADA; `MF4` NAO_IMPLEMENTADA funcionalmente, com placeholders frontend; `MF5` PARCIAL por sinais de admin/users fora do foco desta auditoria.
- MFs usadas para coerencia: `MF2`, `MF3` e handoff documental para `MF4`.
- Limitacoes: nao foi executado E2E browser MF3 porque nao existe script especifico; nao foi executado `npm run e2e:mf2` por pertencer a MF2 e envolver seed persistente.

## Matriz por BK

| BK | Estado | Cumpre | Falhas | Fora de scope | Evidencia |
| --- | --- | --- | --- | --- | --- |
| `BK-MF3-01` | CONFORME | Ratings 1..5, agregacao publica, indice unico `userId + contentId`, endpoints, ownership por sessao e UI no detalhe. | Sem falha bloqueante. | Nao detetado. | `real_dev/backend/src/modules/ratings/*`, `RatingBox.jsx`, `ratingsApi.js`, teste HTTP positivo. |
| `BK-MF3-02` | CONFORME | Comentarios curtos, estados de moderacao, listagem publica sem `userId`, remocao por autor/admin/moderator e UI no detalhe. | Sem falha bloqueante. | Nao detetado. | `real_dev/backend/src/modules/comments/*`, `CommentsPanel.jsx`, teste HTTP positivo. |
| `BK-MF3-03` | CONFORME | Pesquisa publica paginada sobre `contents`/`taxonomies`, apenas `published`, query `2..80`, cliente e rota `/pesquisa`. | Sem falha bloqueante. | Nao detetado. | `search.service.js`, `SearchPage.jsx`, teste HTTP positivo. |
| `BK-MF3-04` | CONFORME_ATUALIZADO | Filtros, sort `title/recent/rating`, discovery home com `most-watched`/`recent`, formatos principais e relacionados sem incluir o conteudo atual. | Sem falha bloqueante. | Nao detetado. | `discovery.service.js`, `SearchFilters.jsx`, `DiscoveryHomePage.jsx`, `RelatedContent.jsx`, teste HTTP positivo. |
| `BK-MF3-05` | CONFORME_ATUALIZADO | Recomendacoes autenticadas com sinais permitidos, cold start, grupos esperados, embeddings opcionais de conteudo e apenas conteudos publicados. | Sem falha bloqueante. | Nao detetado. | `recommendations.service.js`, `content-embeddings.js`, `ForYouPage.jsx`, teste HTTP positivo. |
| `BK-MF3-06` | CONFORME_ATUALIZADO | `explanation` por grupo, mensagens fechadas em portugues, `semantic-similarity` agregado, sem IDs internos, vectores nem historico detalhado. | Sem falha bloqueante. | Nao detetado. | `recommendation-explanations.js`, `RecommendationExplanation.jsx`, teste unitario e HTTP. |

## Matriz de coerencia entre MFs

| Fronteira | Estado | Contratos verificados | Falhas | Evidencia |
| --- | --- | --- | --- | --- |
| `MF2 -> MF3` | COERENTE_COM_RISCOS | `contents`, `taxonomies`, `user_content_lists`, `playback_progress`, `req.user.id`, roles, cookies HttpOnly e `credentials: "include"`. | A auditoria MF2 anterior continua em `FAIL` por divida propria de MF2, mas os contratos concretos consumidos pela MF3 estao presentes e testados. | `catalog.service.js`, `library.service.js`, `playback.service.js`, `ratings.service.js`, `recommendations.service.js`, `apiClient.js`. |
| `MF3 -> MF4` | COERENTE_COM_RISCOS | MF3 nao implementa pagamentos reais, subscricoes, pool solidaria, Stripe/PayPal/MB Way, webhooks, notificacoes transacionais ou associacoes reais. | Existem placeholders/navegacao para areas futuras; nao implementam regras MF4, mas podem confundir se forem tratados como funcionalidade fechada. | `pages.jsx`, `AppHeader.jsx`, pesquisa textual de scope futuro. |

## Validacao detalhada por BK

### BK-MF3-01 - Ratings e agregacao

- Estado: CONFORME
- Esperado: colecao `content_ratings`, rating inteiro `1..5`, chave unica `userId + contentId`, endpoints `PUT /api/ratings/:contentId`, `GET /api/ratings/:contentId/summary`, `GET /api/ratings/:contentId/me`, `DELETE /api/ratings/:contentId`, ownership por `req.user.id`, apenas conteudos `published`, cliente `ratingsApi` e componente `RatingBox`.
- Observado: modulo backend montado em `/api/ratings`; `upsertRating` usa `req.user.id`, valida valor e conteudo publicado; `getRatingSummary` agrega distribuicao/media; frontend integra `RatingBox` no detalhe.
- Cumpre: sim.
- Falhas: sem falha relevante.
- Negativos: `401` sem cookie, valor invalido e conteudo `draft` rejeitado.
- Evidencia: `real_dev/backend/src/modules/ratings/ratings.service.js:45`, `real_dev/backend/src/modules/ratings/ratings.service.js:63`, `real_dev/backend/src/modules/ratings/ratings.routes.js:13`, `real_dev/backend/tests/integration/mf3-http-positive.test.js:400`.
- Riscos: baixo.
- Handoff: fornece `content_ratings` para descoberta/recomendacao.

### BK-MF3-02 - Comentarios curtos moderados

- Estado: CONFORME
- Esperado: colecao `content_comments`, estados `visible`, `pending_review`, `rejected`, corpo `3..280`, listagem publica apenas visivel, criacao autenticada, remocao pelo autor, moderacao por `admin`/`moderator`, cliente `commentsApi` e componente `CommentsPanel`.
- Observado: valida corpo, coloca links em `pending_review`, lista apenas `visible`, calcula `canDelete` sem expor `userId`, protege criacao/remocao/moderacao.
- Cumpre: sim.
- Falhas: sem falha relevante.
- Negativos: corpo vazio, estado invalido e `401` sem cookie.
- Evidencia: `real_dev/backend/src/modules/comments/comments.service.js:55`, `real_dev/backend/src/modules/comments/comments.service.js:89`, `real_dev/backend/src/modules/comments/comments.routes.js:15`, `real_dev/backend/tests/integration/mf3-http-positive.test.js:441`.
- Riscos: baixo.
- Handoff: enriquece detalhe sem criar dependencia para pesquisa.

### BK-MF3-03 - Pesquisa unificada

- Estado: CONFORME
- Esperado: `GET /api/search?q=texto&page=1&limit=12`, pesquisa em titulo, slug, sinopse e taxonomias, apenas `published`, paginacao, cliente `searchApi`, rota `/pesquisa`.
- Observado: backend valida query/paginacao/filtros, escapa regex, cruza taxonomias por nome e devolve card publico; frontend tem pagina real de pesquisa.
- Cumpre: sim.
- Falhas: sem falha relevante.
- Negativos: query curta, pagina invalida, sort invalido.
- Evidencia: `real_dev/backend/src/modules/search/search.service.js:90`, `real_dev/backend/src/modules/search/search.service.js:120`, `real_dev/frontend/src/pages/SearchPage.jsx:18`, `real_dev/backend/tests/integration/mf3-http-positive.test.js:490`.
- Riscos: baixo.
- Handoff: `BK-MF3-04` reutiliza o mesmo contrato para filtros e sort.

### BK-MF3-04 - Filtros, carrosseis e relacionados

- Estado: CONFORME
- Esperado: filtros `type`, `taxonomyId`, sort `title/recent/rating`; `GET /api/discovery/home`; `GET /api/discovery/related/:contentId`; carrosseis `most-watched` e `recent`; `formats` para `movie`, `series` e `documentary`; componentes frontend de filtros, discovery, formatos e relacionados.
- Observado: filtros e sort existem em `search`; discovery devolve `most-watched`, `recent` e `formats`; relacionados priorizam taxonomias/tipo, filtram `published` e excluem o item atual.
- Cumpre: sim.
- Falhas: sem falha relevante.
- Negativos: tipo/sort invalidos e id invalido em relacionados.
- Evidencia: `real_dev/backend/src/modules/search/search.validation.js:60`, `real_dev/backend/src/modules/discovery/discovery.service.js:63`, `real_dev/backend/src/modules/discovery/discovery.service.js:98`, `real_dev/backend/tests/integration/mf3-http-positive.test.js:490`.
- Riscos: baixo.
- Handoff: descoberta publica separada de recomendacao personalizada.

### BK-MF3-05 - Recomendacao baseline + cold start

- Estado: CONFORME_ATUALIZADO em 2026-07-02
- Esperado: `GET /api/recommendations/me` autenticado, sinais `playback_progress`, `user_content_lists`, `content_ratings` e feedback, apenas `published`, cold start, `groups`, `coldStart`, `signalsUsed`, `reasonCode`, `strategy`, cliente `recommendationsApi`, pagina `/para-si` e embeddings opcionais de conteudo sem provider externo ativo por defeito.
- Observado: rota exige `requireAuth`; service usa `req.user.id`, carrega apenas sinais permitidos, exclui conteudos ja usados, respeita limite parental, deduplica grupos, aplica feedback `not_interested`, devolve grupos `because-your-themes`, `because-your-activity` e `popular-start`; quando existem vectores em `content_embeddings`, calcula perfil semantico temporario em runtime e usa estrategia `weighted-baseline-v2+content-embeddings`; cold start devolve grupos populares/recentes/catalogo.
- Cumpre: sim.
- Falhas: sem falha relevante.
- Negativos: `401` sem cookie; feedback inválido; fallback cold start; exclusão de conteúdo publicado acima do limite parental.
- Evidencia: `backend/src/modules/recommendations/recommendations.service.js`, `backend/src/modules/recommendations/content-embeddings.js`, `backend/scripts/generate-content-embeddings.mjs`, `backend/src/modules/recommendations/recommendations.routes.js`, `backend/tests/integration/mf3-http-positive.test.js`, `backend/tests/smoke/app.smoke.test.js`.
- Riscos: baixo.
- Handoff: `BK-MF3-06` consome `reasonCode`.

### BK-MF3-06 - Explicabilidade de recomendacao

- Estado: CONFORME_ATUALIZADO em 2026-07-02
- Esperado: manter `GET /api/recommendations/me`, acrescentar `explanation` por grupo, mensagens simples em portugues de Portugal, sem IDs internos, vectores nem historico detalhado, componente `RecommendationExplanation`.
- Observado: mapa fechado de explicacoes, fallback seguro para `reasonCode` desconhecido, `semantic-similarity` explica afinidade semantica agregada, frontend mostra explicacao por grupo e feedback operacional sem expor scores internos.
- Cumpre: sim.
- Falhas: sem falha relevante.
- Negativos: `reasonCode` desconhecido devolve explicacao neutra.
- Evidencia: `real_dev/backend/src/modules/recommendations/recommendation-explanations.js:1`, `real_dev/backend/src/modules/recommendations/recommendations.service.js:190`, `real_dev/frontend/src/components/recommendations/RecommendationExplanation.jsx:7`.
- Riscos: baixo.
- Handoff: MF4 pode iniciar sem alterar descoberta/recomendacao.

## Findings

### P0

Sem findings P0.

### P1

Sem findings P1.

### P2

Sem findings P2 ativos.

### Resolvido - MF3 - Tracking documental alinhado com a implementacao real_dev

- Area: Documentacao
- Ficheiro: `docs/planificacao/backlogs/BACKLOG-MVP.md`; `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`; `docs/planificacao/guias-bk/MF3/*.md`
- Evidencia observada antes da correcao: `BACKLOG-MVP.md` marcava `MF3` como `TODO` e `0/6`; a matriz canonica marcava RF19..RF28/RNF34 como `PENDENTE (Gate S8)`; os guias BK mantinham `estado: TODO`.
- Correcao aplicada: `MF3` passou a `DONE` com progresso `6/6`; os seis BKs MF3 passaram a `DONE`; RF19..RF28/RNF34 passaram a `VALIDADO real_dev (2026-06-12)`; os headers dos guias MF3 foram atualizados para `estado: DONE` e `last_updated: 2026-06-12`.
- Impacto residual: sem finding MF3 ativo; continua a existir risco global separado pela divida propria da auditoria MF2.

## Fora de scope detetado

- Nao foram detetados pagamentos reais, Stripe, PayPal, MB Way, webhooks, embeddings, RAG, modelos generativos, motores externos de pesquisa ou partilha de dados com terceiros.
- Existem placeholders/navegacao para `Associacoes`, `Planos` e `Notificacoes`; foram tratados como placeholders de MF futura, nao como implementacao MF4/MF5.
- A resposta de health continua a declarar `payments: "not_configured"`, coerente com MF3.

## Coerencia entre MFs

- MFs implementadas consideradas: `MF1`, `MF2`, `MF3`; sinais placeholder/parciais de `MF4`/`MF5`.
- Fronteiras auditadas: `MF2 -> MF3`; handoff `MF3 -> MF4`.
- Contratos coerentes: sessao por cookie HttpOnly; `apiClient` com `credentials: "include"`; `req.user.id`; roles `admin`/`moderator`; `contents`; `taxonomies`; `user_content_lists`; `playback_progress`; conteudos publicos por `status: "published"`.
- Incoerencias: sem P0/P1/P2 ativos na MF3; tracking documental MF3 alinhado em `2026-06-12`.
- Risco para a app completa: baixo/medio. A MF3 encaixa tecnicamente, mas a auditoria MF2 anterior continua a registar divida propria de MF2 que deve ser fechada no plano global.

## Drift documental/codigo

- DRIFT DOCUMENTAL: sem drift ativo na MF3 apos alinhamento de `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md` e headers dos guias MF3 em `2026-06-12`.
- DRIFT DE RELATORIO ANTERIOR: o relatorio MF3 anterior dizia que `GLOSSARIO-TERMOS-TECNICOS-PAP.md` nao existia; nesta auditoria foi encontrado na raiz e consultado.
- Nao foi detetado drift na lista de BKs da MF3: todas as fontes convergem em `BK-MF3-01..06`.

## Seguranca e privacidade

- Sem tokens em `localStorage` ou `sessionStorage`; a unica ocorrencia e documental em `real_dev/backend/README.md`.
- Sem segredos hardcoded encontrados nas pesquisas textuais.
- Endpoints autenticados usam sessao e `req.user.id`; ratings/recomendacoes nao aceitam `userId` do frontend.
- Comentarios publicos nao expõem `userId`; devolvem `canDelete` calculado.
- Moderacao exige `requireRole(["admin", "moderator"])`.
- Pesquisa/discovery publicos filtram `status: "published"`.
- Recomendacao baseline usa apenas sinais permitidos para esse fim e a explicabilidade nao expõe historico detalhado.

## Testes e comandos

- Comando: `git diff --check`
- Diretoria: raiz
- Resultado: PASS
- Observacoes: sem output.

- Comando: `bash scripts/validate-planificacao.sh`
- Diretoria: raiz
- Resultado: PASS
- Observacoes: `checked_bks: 55`, `checked_guides: 55`, `errors: []`.

- Comando: `rg -n "TODO implementar|implementar depois|pseudo-codigo|payload: unknown|as any|localStorage|sessionStorage|password.*console|token.*console|cookie.*console|console\\.log\\(.*password|console\\.log\\(.*token|stripe|paypal|mb way|embeddings|vector database|RAG" real_dev -g "!**/node_modules/**"`
- Diretoria: raiz
- Resultado: PASS_COM_NOTA
- Observacoes: apenas `real_dev/backend/README.md:21`, referencia documental a `localStorage`/`sessionStorage` como fora de scope.

- Comando: `npm test`
- Diretoria: `real_dev/backend`
- Resultado: PASS fora do sandbox
- Observacoes: nesta auditoria, a primeira execucao no sandbox falhou com `listen EPERM: operation not permitted 127.0.0.1`; repetido fora do sandbox com aprovacao, passou com `27/27` testes, incluindo positivos HTTP MF3 e negativos de auth/validacao.

- Comando: `npm run build`
- Diretoria: `real_dev/frontend`
- Resultado: PASS
- Observacoes: Vite build concluido nesta auditoria; `79` modulos transformados.

- Comando nao executado: `npm run e2e:mf2`
- Motivo: pertence ao fecho MF2, executa seed persistente e Playwright, e nao e validacao especifica da MF3.

- Comando nao executado: E2E/browser MF3
- Motivo: nao existe script MF3 especifico.

## Conclusao

- A MF pode fechar? Tecnicamente sim; a reserva documental da MF3 foi corrigida em `2026-06-12`.
- A MF encaixa com as MFs ja implementadas? Sim, nos contratos concretos usados pela MF3.
- O que falta corrigir? Na MF3, sem finding ativo. No plano global, fechar a divida ja registada na auditoria MF2 para nao avançar com pendencias antigas.
- Risco para a proxima MF: baixo/medio; MF4 pode comecar sem alterar descoberta/recomendacao, mas deve evitar tratar placeholders de `Planos`, `Associacoes` e `Notificacoes` como implementacao real.
