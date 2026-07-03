# Implementacao referencia_privada_docente - MF3

## Header

- Data da execucao: 2026-06-11
- Modo: implementar
- Real dev root: `referencia_privada_docente`
- MF processada: `MF3`

## Resumo da MF

A `MF3` implementa descoberta, comunidade e recomendacao baseline no produto real em `referencia_privada_docente`, sem antecipar monetizacao, privacidade avancada, administracao futura ou motores externos de pesquisa/IA.

### Atualizacao real_dev - 2026-07-02

- `BK-MF3-05` evoluiu para `weighted-baseline-v2`, mantendo o endpoint `GET /api/recommendations/me` retrocompativel.
- O backend passou a usar scoring ponderado com favoritos, watchlist, historico, ratings positivos, taxonomias, tipos, recencia e feedback explicito.
- Foram adicionados `POST /api/recommendations/feedback` e `POST /api/recommendations/events`, ambos autenticados e sem `userId` vindo do frontend.
- A recomendacao respeita `published`, exclusao de conteudos usados como sinal, deduplicacao entre grupos, feedback `not_interested` e limite parental do utilizador.
- A UI `/para-si` passou a mostrar acoes de feedback por conteudo recomendado e a registar eventos agregados `shown`/`clicked` sem bloquear navegacao.
- Foi adicionada camada opcional `content_embeddings` para embeddings de conteudos publicados, com provider externo desligado por defeito.
- `npm run embeddings:generate` gera vectores de forma idempotente quando `EMBEDDINGS_PROVIDER` e `deterministic` ou `external`.
- A evolucao continua sem embeddings persistentes de utilizador, sem vector database dedicado e sem modelos generativos ativos.
- Validacao desta entrega: backend `58/58` fora da sandbox, frontend build `PASS`, hardening scanner `PASS`, planificacao `66/66` e `git diff --check` limpo.

Scope real confirmado nos BKs:

- `BK-MF3-01`: ratings de 1 a 5 estrelas e agregacao publica.
- `BK-MF3-02`: comentarios curtos moderados.
- `BK-MF3-03`: pesquisa unificada sobre conteudos publicados e taxonomias.
- `BK-MF3-04`: filtros, ordenacao, carrosseis editoriais e relacionados.
- `BK-MF3-05`: recomendacao baseline autenticada e cold start.
- `BK-MF3-06`: explicabilidade de recomendacao.

## BKs analisados

| BK | Estado inicial | Dependencias | RF/RNF |
| --- | --- | --- | --- |
| `BK-MF3-01` | NAO_INICIADO | `BK-MF2-07` | `RF19`, `RF21` |
| `BK-MF3-02` | NAO_INICIADO | `BK-MF3-01` | `RF20` |
| `BK-MF3-03` | NAO_INICIADO | `BK-MF2-03` | `RF22` |
| `BK-MF3-04` | NAO_INICIADO | `BK-MF3-03` | `RF23`, `RF24`, `RF25` |
| `BK-MF3-05` | NAO_INICIADO | `BK-MF3-01`, `BK-MF2-07` | `RF26`, `RF27` |
| `BK-MF3-06` | NAO_INICIADO | `BK-MF3-05` | `RF28`, `RNF34` |

## Estado inicial de referencia_privada_docente

- Backend: Node.js/Express ES Modules, MongoDB driver, arquitetura modular por dominio.
- Frontend: React/Vite, React Router, cliente `fetch` central com `credentials: "include"`.
- MF1/MF2 presentes em `referencia_privada_docente/backend` e `referencia_privada_docente/frontend`.
- Sem relatorio anterior `IMPLEMENTACAO-REAL_DEV-MF3.md`.
- `git status --short` sem alteracoes antes desta execucao.

## Contratos anteriores reutilizados

- Sessao segura: `req.user`, `requireAuth`, `requireRole`, cookies HttpOnly.
- Catalogo: colecoes `contents`, `taxonomies`, estados `draft/published/archived`.
- Detalhe publico: `GET /api/catalog/:idOrSlug`.
- Biblioteca pessoal: `user_content_lists`, favoritos, watchlist e historico.
- Playback: `playback_progress` como sinal permitido para recomendacao.
- Cliente API frontend: `apiClient` com cookies incluidos.

## Plano de implementacao

1. Criar ratings backend/frontend e integrar no detalhe.
2. Criar comentarios backend/frontend e integrar no detalhe.
3. Criar pesquisa unificada backend/frontend e pagina `/pesquisa`.
4. Acrescentar filtros, discovery home e relacionados.
5. Criar recomendacoes baseline autenticadas e pagina `/para-si`.
6. Acrescentar explicabilidade por grupo de recomendacao.
7. Criar testes unitarios proporcionais para validadores/regras puras.
8. Executar gates finais e atualizar este relatorio.

## Estado por BK

| BK | Estado | Ficheiros principais | Validacoes | Observacoes |
| --- | --- | --- | --- | --- |
| `BK-MF3-01` | IMPLEMENTADO | `referencia_privada_docente/backend/src/modules/ratings/*`, `referencia_privada_docente/frontend/src/components/ratings/RatingBox.jsx` | `npm test`, `npm run build` | Ratings autenticados por `req.user.id`, agregacao publica e UI no detalhe. |
| `BK-MF3-02` | IMPLEMENTADO | `referencia_privada_docente/backend/src/modules/comments/*`, `referencia_privada_docente/frontend/src/components/comments/CommentsPanel.jsx` | `npm test`, `npm run build` | Comentarios visiveis, pendentes por link, remocao por autor/admin/moderator. |
| `BK-MF3-03` | IMPLEMENTADO | `referencia_privada_docente/backend/src/modules/search/*`, `referencia_privada_docente/frontend/src/pages/SearchPage.jsx` | `npm test`, `npm run build` | Pesquisa publica paginada sobre conteudos publicados e taxonomias. |
| `BK-MF3-04` | IMPLEMENTADO | `referencia_privada_docente/backend/src/modules/discovery/*`, `SearchFilters.jsx`, `RelatedContent.jsx` | `npm test`, `npm run build` | Filtros, sort, carrosseis editoriais e relacionados. |
| `BK-MF3-05` | IMPLEMENTADO_ATUALIZADO | `referencia_privada_docente/backend/src/modules/recommendations/recommendations.service.js`, `content-embeddings.js`, `ForYouPage.jsx` | `npm test`, `npm run build`, `check-security-baseline.mjs` | Recomendacao ponderada `weighted-baseline-v2`, embeddings opcionais de conteudo, cold start, feedback, eventos e limite parental. |
| `BK-MF3-06` | IMPLEMENTADO_ATUALIZADO | `recommendation-explanations.js`, `RecommendationExplanation.jsx` | `npm test`, `npm run build` | Explicacoes fechadas por `reasonCode`, incluindo `semantic-similarity`, sem expor IDs, scores internos, vectores ou historico detalhado. |

## Ficheiros criados

- `referencia_privada_docente/backend/src/modules/ratings/ratings.validation.js`
- `referencia_privada_docente/backend/src/modules/ratings/ratings.service.js`
- `referencia_privada_docente/backend/src/modules/ratings/ratings.controller.js`
- `referencia_privada_docente/backend/src/modules/ratings/ratings.routes.js`
- `referencia_privada_docente/backend/src/modules/comments/comments.validation.js`
- `referencia_privada_docente/backend/src/modules/comments/comments.service.js`
- `referencia_privada_docente/backend/src/modules/comments/comments.controller.js`
- `referencia_privada_docente/backend/src/modules/comments/comments.routes.js`
- `referencia_privada_docente/backend/src/modules/search/search.validation.js`
- `referencia_privada_docente/backend/src/modules/search/search.service.js`
- `referencia_privada_docente/backend/src/modules/search/search.controller.js`
- `referencia_privada_docente/backend/src/modules/search/search.routes.js`
- `referencia_privada_docente/backend/src/modules/discovery/discovery.validation.js`
- `referencia_privada_docente/backend/src/modules/discovery/discovery.service.js`
- `referencia_privada_docente/backend/src/modules/discovery/discovery.controller.js`
- `referencia_privada_docente/backend/src/modules/discovery/discovery.routes.js`
- `referencia_privada_docente/backend/src/modules/recommendations/recommendation-explanations.js`
- `referencia_privada_docente/backend/src/modules/recommendations/content-embeddings.js`
- `referencia_privada_docente/backend/src/modules/recommendations/recommendations.service.js`
- `referencia_privada_docente/backend/src/modules/recommendations/recommendations.controller.js`
- `referencia_privada_docente/backend/src/modules/recommendations/recommendations.routes.js`
- `referencia_privada_docente/backend/scripts/generate-content-embeddings.mjs`
- `referencia_privada_docente/backend/tests/unit/mf3-validation.test.js`
- `referencia_privada_docente/frontend/src/services/api/ratingsApi.js`
- `referencia_privada_docente/frontend/src/services/api/commentsApi.js`
- `referencia_privada_docente/frontend/src/services/api/searchApi.js`
- `referencia_privada_docente/frontend/src/services/api/discoveryApi.js`
- `referencia_privada_docente/frontend/src/services/api/recommendationsApi.js`
- `referencia_privada_docente/frontend/src/components/ratings/RatingBox.jsx`
- `referencia_privada_docente/frontend/src/components/comments/CommentsPanel.jsx`
- `referencia_privada_docente/frontend/src/components/search/SearchFilters.jsx`
- `referencia_privada_docente/frontend/src/components/discovery/DiscoveryCarousel.jsx`
- `referencia_privada_docente/frontend/src/components/discovery/RelatedContent.jsx`
- `referencia_privada_docente/frontend/src/components/recommendations/RecommendationExplanation.jsx`
- `referencia_privada_docente/frontend/src/pages/SearchPage.jsx`
- `referencia_privada_docente/frontend/src/pages/DiscoveryHomePage.jsx`
- `referencia_privada_docente/frontend/src/pages/ForYouPage.jsx`

## Ficheiros editados

- `docs/planificacao/guias-bk/IMPLEMENTACAO-REAL_DEV-MF3.md`
- `referencia_privada_docente/backend/src/app.js`
- `referencia_privada_docente/frontend/src/pages/ContentDetailPage.jsx`
- `referencia_privada_docente/frontend/src/routes/AppRoutes.jsx`
- `referencia_privada_docente/frontend/src/components/layout/AppHeader.jsx`
- `referencia_privada_docente/frontend/src/styles/global.css`

## Endpoints criados/editados

- `PUT /api/ratings/:contentId`
- `GET /api/ratings/:contentId/summary`
- `GET /api/ratings/:contentId/me`
- `DELETE /api/ratings/:contentId`
- `GET /api/comments/:contentId`
- `POST /api/comments/:contentId`
- `DELETE /api/comments/:commentId`
- `PATCH /api/comments/:commentId/moderation`
- `GET /api/search?q=texto&page=1&limit=12&type=&taxonomyId=&sort=title`
- `GET /api/discovery/home`
- `GET /api/discovery/related/:contentId`
- `GET /api/recommendations/me`
- `POST /api/recommendations/feedback`
- `POST /api/recommendations/events`

## Modelos/schemas criados/editados

- `content_ratings`: `userId`, `contentId`, `value`, `createdAt`, `updatedAt`; indice unico `userId + contentId`.
- `content_comments`: `userId`, `contentId`, `body`, `status`, `moderationReason`, `createdAt`, `updatedAt`; estados `visible`, `pending_review`, `rejected`.
- Search/discovery/recommendations reutilizam `contents`, `taxonomies`, `user_content_lists`, `playback_progress` e `content_ratings`.
- `recommendation_feedback`: feedback autenticado por `userId + contentId`, com acoes `more_like_this`, `less_like_this`, `not_interested` e `seen`.
- `recommendation_events`: eventos agregados autenticados `shown`/`clicked`, guardando `contentId`, `groupId`, `reasonCode`, `strategy` e `createdAt`.
- `content_embeddings`: embeddings de conteudos publicados por `contentId + model`, com `dimensions`, `sourceHash`, `vector`, `createdAt` e `updatedAt`.

## Services/controllers/routes criados/editados

- Criados services/controllers/routes para `ratings`, `comments`, `search`, `discovery` e `recommendations`.
- Montadas rotas em `referencia_privada_docente/backend/src/app.js`.
- Regras de auth: ratings write/read-my-rating autenticados; comentarios create/delete autenticados; moderacao por `admin`/`moderator`; recomendacoes autenticadas; pesquisa/discovery publicos sobre publicados.

## Componentes/paginas frontend criados/editados

- `RatingBox` integrado em `ContentDetailPage`.
- `CommentsPanel` integrado em `ContentDetailPage`.
- `RelatedContent` integrado em `ContentDetailPage`.
- `SearchPage` real em `/pesquisa`.
- `DiscoveryHomePage` usada em `/`.
- `ForYouPage` em `/para-si`.
- `SearchFilters`, `DiscoveryCarousel`, `RecommendationExplanation`.
- Navegacao atualizada com `Para si`.

## Testes criados/editados

- Criado `referencia_privada_docente/backend/tests/unit/mf3-validation.test.js` com casos positivos e negativos para ratings, comentarios, pesquisa e explicabilidade.

## Validacoes executadas

- `npm test` em `referencia_privada_docente/backend`.
- `npm run build` em `referencia_privada_docente/frontend`.
- `git diff --check`.
- `rg -n "TODO implementar|implementar depois|pseudo-codigo|payload: unknown|as any|localStorage|password.*console|token.*console|console\\.log\\(.*password|console\\.log\\(.*token|stripe|paypal|mb way|embeddings|vector database|RAG" referencia_privada_docente`.
- `bash scripts/validate-planificacao.sh`.
- Verificacao visual no browser integrado com Vite em `http://127.0.0.1:4176/`.

## Resultados dos comandos

- `npm test` em sandbox: falhou inicialmente nos smoke tests com `listen EPERM: operation not permitted 127.0.0.1`; interpretado como bloqueio de sandbox.
- `npm test` fora do sandbox aprovado: PASS, 18 testes, 18 pass, 0 fail.
- `npm run build`: PASS, Vite build concluido.
- `git diff --check`: PASS, sem output.
- `rg` textual: encontrou apenas `referencia_privada_docente/backend/README.md:21` com referencia documental a `localStorage` como fora de scope; nao e uso de token/sessao.
- `bash scripts/validate-planificacao.sh`: PASS historico antes da reestruturacao MF7/MF8; a contagem canonica atual passa a ser 60 BKs/guias.
- Browser integrado: home renderizou com `h1` FaithFlix e nav incluindo `Pesquisa`/`Para si`; `/pesquisa` renderizou formulario de filtros; `/para-si` renderizou pagina. Alertas de API observados foram esperados porque so o frontend foi iniciado nesta verificacao.

## Blockers

- Nenhum blocker final.

## Drift documental/codigo

- `pages.jsx` ainda exportava uma `SearchPage` placeholder da MF1, apesar de `AppRoutes.jsx` ja importar paginas reais de MF2 para outros fluxos. Sera substituida por pagina real da MF3.
- `referencia_privada_docente` nao aparece no `git status --short` porque esta area local esta fora do tracking/ignorada. Isto e coerente com a regra da prompt e nao foi tratado como risco.

## Dependencias novas adicionadas e justificacao

- Nenhuma dependencia nova adicionada.

## Scope recusado por pertencer a outra MF

- Nao foram implementados motores externos de pesquisa, embeddings, RAG, modelos generativos, dashboards admin de recomendacao, notificacoes ou fluxos de monetizacao.

## Mapa de integracao da MF

### `BK-MF3-01`

- Ficheiros criados: modulo backend `ratings`, `ratingsApi`, `RatingBox`.
- Ficheiros editados: `app.js`, `ContentDetailPage.jsx`, CSS global.
- Exports produzidos: `ratingsRouter`, `upsertRating`, `getRatingSummary`, `getMyRating`, `deleteMyRating`, `ratingsApi`, `RatingBox`.
- Imports consumidos: `getDb`, `HttpError`, `requireAuth`, `apiClient`.
- Endpoints: `PUT /api/ratings/:contentId`, `GET /api/ratings/:contentId/summary`, `GET /api/ratings/:contentId/me`, `DELETE /api/ratings/:contentId`.
- DTOs/validadores: `asObjectId`, `assertRatingValue`.
- Dados persistidos: `content_ratings`.
- Auth/ownership: escrita/leitura individual por `req.user.id`; frontend nao envia `userId`.
- Testes: validacao de escala em `mf3-validation.test.js`.
- BKs seguintes dependentes: `BK-MF3-02`, `BK-MF3-05`.

### `BK-MF3-02`

- Ficheiros criados: modulo backend `comments`, `commentsApi`, `CommentsPanel`.
- Exports produzidos: `commentsRouter`, `createComment`, `listVisibleComments`, `deleteComment`, `moderateComment`, `commentsApi`, `CommentsPanel`.
- Imports consumidos: `requireAuth`, `requireRole`, `authApi`.
- Endpoints: `GET /api/comments/:contentId`, `POST /api/comments/:contentId`, `DELETE /api/comments/:commentId`, `PATCH /api/comments/:commentId/moderation`.
- DTOs/validadores: `assertCommentBody`, `initialModerationFor`, `assertModerationStatus`.
- Dados persistidos: `content_comments`.
- Auth/ownership/roles: criar autenticado; apagar por autor ou moderador/admin; moderar por `admin`/`moderator`.
- Testes: comentarios vazios, link pendente, estado invalido.
- BKs seguintes dependentes: nenhum contrato tecnico direto.

### `BK-MF3-03`

- Ficheiros criados: modulo backend `search`, `searchApi`, `SearchPage`.
- Exports produzidos: `searchRouter`, `searchContents`, `searchApi`, `SearchPage`.
- Imports consumidos: `contents`, `taxonomies`, `apiClient`.
- Endpoints: `GET /api/search`.
- DTOs/validadores: `assertSearchQuery`, `parsePagination`, `escapeRegExp`.
- Dados persistidos: nenhum novo; leitura de `contents` e `taxonomies`.
- Auth/ownership/roles: publico, mas apenas `status: "published"`.
- Testes: query curta, paginacao invalida.
- BKs seguintes dependentes: `BK-MF3-04`.

### `BK-MF3-04`

- Ficheiros criados: modulo backend `discovery`, `discoveryApi`, `SearchFilters`, `DiscoveryCarousel`, `RelatedContent`, `DiscoveryHomePage`.
- Ficheiros editados: `search.validation.js`, `search.service.js`, `AppRoutes.jsx`, `AppHeader.jsx`.
- Exports produzidos: `discoveryRouter`, `getDiscoveryHome`, `getRelatedContent`, `parseSearchFilters`, `discoveryApi`.
- Imports consumidos: `contents`, `taxonomies`, `content_ratings`, `catalogApi`.
- Endpoints: filtros em `GET /api/search`, `GET /api/discovery/home`, `GET /api/discovery/related/:contentId`.
- DTOs/validadores: `parseSearchFilters`, `SEARCH_SORTS`, `SEARCH_TYPES`.
- Dados persistidos: nenhum novo; leitura de ratings agregados.
- Auth/ownership/roles: publico, apenas publicados; relacionados excluem o conteudo atual.
- Testes: sort/tipo invalidos em `mf3-validation.test.js`.
- BKs seguintes dependentes: `BK-MF3-05`.

### `BK-MF3-05`

- Ficheiros criados: modulo backend `recommendations`, `recommendationsApi`, `ForYouPage`.
- Exports produzidos: `recommendationsRouter`, `getRecommendationsForUser`, `recommendationsApi`, `ForYouPage`.
- Imports consumidos: `user_content_lists`, `playback_progress`, `content_ratings`, `contents`.
- Endpoints: `GET /api/recommendations/me`.
- DTOs/validadores: `asObjectId` interno para `userId` de sessao.
- Dados persistidos: nenhum novo; usa sinais permitidos apenas para recomendacao.
- Auth/ownership/roles: autenticacao obrigatoria; `userId` vem de `req.user.id`.
- Testes: cobertura indireta por build/import e explicabilidade; regras DB validadas por estrutura e `npm test`.
- BKs seguintes dependentes: `BK-MF3-06`.

### `BK-MF3-06`

- Ficheiros criados: `recommendation-explanations.js`, `RecommendationExplanation.jsx`.
- Ficheiros editados: `recommendations.service.js`, `ForYouPage.jsx`.
- Exports produzidos: `buildRecommendationExplanation`, `RecommendationExplanation`.
- Imports consumidos: `reasonCode` de grupos de recomendacao.
- Endpoints: mantido `GET /api/recommendations/me`, com `explanation` por grupo.
- DTOs/validadores: mapa fechado de explicacoes e fallback seguro.
- Dados persistidos: nenhum novo.
- Auth/ownership/roles: sem exposicao de IDs internos nem historico detalhado.
- Testes: `cold-start-popular` e fallback desconhecido.

## Handoff para a proxima MF

- `MF4` pode iniciar monetizacao solidaria sem alterar descoberta.
- Contratos publicos disponiveis: ratings agregados, comentarios visiveis, pesquisa filtrada, discovery home, relacionados e recomendacoes baseline explicadas.
- Nao ha dependencias npm novas nem integracoes externas adicionadas.

## Estado pos-correcao de auditoria

- Relatorio de correcao: `docs/planificacao/guias-bk/CORRECAO-AUDITORIA-IMPLEMENTACAO-referencia_privada_docente-MF3.md`.
- Estado atualizado em 2026-06-12 apos reavaliacao da auditoria MF3 atual.
- Resultado: nao houve correcao de codigo a aplicar. A auditoria atual nao tem P0/P1 e o unico P2 ativo e documental: tracking canonico ainda mostra MF3/BKs como `TODO`/`PENDENTE`.
- Estado do finding P2: `BLOQUEADO_POR_DECISAO_DOCENTE`, porque corrigir esse ponto exige alterar `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md` e/ou headers dos guias MF3, que sao documentos canonicos e nao devem ser editados sem pedido explicito.
- Validacoes pos-reavaliacao: `bash scripts/validate-planificacao.sh` PASS; `git diff --check` PASS.
