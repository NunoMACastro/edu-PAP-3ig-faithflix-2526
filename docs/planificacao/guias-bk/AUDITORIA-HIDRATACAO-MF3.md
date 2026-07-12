# Auditoria de guias BK - MF3

- `document_status`: `HISTORICAL_SNAPSHOT`
- `snapshot_date`: `2026-06-08`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `proof_scope`: auditoria de hidratação MF3 observada em 2026-06-08; não prova o estado atual

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF3`
- `macro`: `MF3`
- `modo`: `auditar_apenas`
- `area`: `planificacao/guias-bk`
- `owner`: `Nuno (orientacao)`
- `status`: `concluido`
- `last_updated`: `2026-06-08`

## Resultado executivo

Foram analisados os 6 BKs da `MF3` no estado atual do working tree:

- `BK-MF3-01` - Ratings e agregacao
- `BK-MF3-02` - Comentarios curtos moderados
- `BK-MF3-03` - Pesquisa unificada
- `BK-MF3-04` - Filtros, carrosseis e relacionados
- `BK-MF3-05` - Recomendacao baseline + cold start
- `BK-MF3-06` - Explicabilidade de recomendacao

Esta execucao foi revalidada em `2026-06-08` em modo `auditar_apenas`. Nao foram editados BKs da `MF3`; apenas este relatorio foi atualizado.

Contagem antes desta execucao:

| OK | PARCIAL | CRITICO |
| --- | --- | --- |
| 6 | 0 | 0 |

Contagem depois desta execucao:

| OK | PARCIAL | CRITICO |
| --- | --- | --- |
| 6 | 0 | 0 |

## Documentos consultados

Documentos canonicos consultados:

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
- BKs `MF0`, `MF1`, `MF2`, `MF3` e dependencias posteriores relevantes.
- Relatorios existentes de auditoria/correcao quando presentes.

Observacoes:

- `MATRIZ-RF-RNF-POR-BK.md` e `SCORECARD-OFICIAL-POR-SPRINT.md` sao aliases deprecated. A fonte operacional real permanece `MATRIZ-CANONICA-BK.md` e `SCORECARD-SPRINTS.md`.
- Nenhum documento obrigatorio esteve em falta.

## Base canonica confirmada para MF3

- `CANONICO`: `MF3` cobre descoberta, comunidade e recomendacao, com `RF19..RF28`.
- `CANONICO`: `BK-MF3-01` cobre `RF19` e `RF21`.
- `CANONICO`: `BK-MF3-02` cobre `RF20`.
- `CANONICO`: `BK-MF3-03` cobre `RF22`.
- `CANONICO`: `BK-MF3-04` cobre `RF23`, `RF24` e `RF25`.
- `CANONICO`: `BK-MF3-05` cobre `RF26` e `RF27`.
- `CANONICO`: `BK-MF3-06` cobre `RF28` e `RNF34`.
- `CANONICO`: pesquisa e listagens devem respeitar `RNF09`.
- `CANONICO`: recomendacoes devem usar baseline simples no MVP e respeitar `RNF34`, `RNF35` e `RNF37`.
- `DERIVADO`: os guias mantem React + Vite + `fetch/apiClient`, porque essa decisao foi fixada nos BKs `MF1`/`MF2` para a sequencia pedagogica.

## Auditoria por BK

| BK | Estado | Problema principal | Risco pedagogico | Risco tecnico | Prioridade de correcao |
| --- | --- | --- | --- | --- | --- |
| `BK-MF3-01` | OK | Sem problema bloqueante. | Baixo: guia explica ratings, agregacao, ownership e negativos. | Baixo: contrato evita ratings duplicados com chave `userId + contentId`. | Nao aplicavel |
| `BK-MF3-02` | OK | Sem problema bloqueante. | Baixo: guia separa comentario curto, moderacao minima e ownership. | Baixo: endpoints aplicam autenticacao, ownership e role check. | Nao aplicavel |
| `BK-MF3-03` | OK | Sem problema bloqueante. | Baixo: guia define pesquisa textual, taxonomias, paginacao e empty states. | Baixo: endpoint publico filtra `published` e limita query/paginacao. | Nao aplicavel |
| `BK-MF3-04` | OK | Sem problema bloqueante. | Baixo: guia distingue filtros, carrosseis, relacionados e recomendacao. | Baixo: discovery publico fica separado de recomendacao autenticada. | Nao aplicavel |
| `BK-MF3-05` | OK | Sem problema bloqueante. | Baixo: guia explica sinais permitidos, cold start e limites do baseline. | Baixo: endpoint usa `req.user.id`, filtra `published` e nao envia `userId` pelo frontend. | Nao aplicavel |
| `BK-MF3-06` | OK | Sem problema bloqueante. | Baixo: guia explica recomendacao vs explicabilidade. | Baixo: `reasonCode` e mensagens controladas evitam explicacoes opacas. | Nao aplicavel |

## Observacoes nao bloqueantes

- `BK-MF3-04` troca a funcao `searchContents` e indica para adicionar `parseSearchFilters` aos imports. A instrucao e suficiente para execucao, mas numa futura revisao pode ser tornada ainda mais explicita com o bloco de imports final completo.
- `BK-MF3-05` produz tres grupos por regra, mas nao documenta uma deduplicacao global entre grupos. Isto nao bloqueia o BK porque o contrato canonico exige grupos relevantes e conteudos publicados, mas uma futura melhoria pode evitar repeticoes visuais.
- `BK-MF3-02` devolve `userId` no objeto publico de comentario. Nao ha dados sensiveis diretos, mas uma futura revisao de privacidade pode substituir por `authorName` controlado ou omitir o identificador quando a UI nao precisar dele.

## Mapa de integracao da MF

### `BK-MF3-01`

- Ficheiros previstos/criados pelo guia: `backend/src/modules/ratings/ratings.validation.js`, `ratings.service.js`, `ratings.controller.js`, `ratings.routes.js`, `frontend/src/services/api/ratingsApi.js`, `frontend/src/components/ratings/RatingBox.jsx`.
- Ficheiros editados pelo guia: `backend/src/app.js`, `backend/src/server.js`, `frontend/src/pages/ContentDetailPage.jsx`.
- Exports produzidos: `ratingsRouter`, `ensureRatingIndexes`, `saveMyRating`, `getRatingSummary`, `ratingsApi`, `RatingBox`.
- Imports consumidos de BKs anteriores: `getDb`, `requireAuth`, `asyncHandler`, `apiClient`.
- Endpoints criados: `GET /api/ratings/:contentId/summary`, `GET /api/ratings/:contentId/me`, `PUT /api/ratings/:contentId`, `DELETE /api/ratings/:contentId`.
- DTOs criados: payload `{ value }`.
- Schemas/modelos criados: colecao `content_ratings`.
- Services criados: `ratings.service.js`.
- Componentes/paginas frontend criados: `RatingBox`.
- Dados persistidos: `userId`, `contentId`, `value`, `createdAt`, `updatedAt`.
- Regras aplicadas: ownership por `req.user.id`; apenas conteudos `published`.
- BKs seguintes dependentes: `BK-MF3-02`, `BK-MF3-05`, `BK-MF3-06`.

### `BK-MF3-02`

- Ficheiros previstos/criados pelo guia: `backend/src/modules/comments/comments.validation.js`, `comments.service.js`, `comments.controller.js`, `comments.routes.js`, `frontend/src/services/api/commentsApi.js`, `frontend/src/components/comments/CommentsPanel.jsx`.
- Ficheiros editados pelo guia: `backend/src/app.js`, `backend/src/server.js`, `frontend/src/pages/ContentDetailPage.jsx`.
- Exports produzidos: `commentsRouter`, `ensureCommentIndexes`, `createComment`, `moderateComment`, `commentsApi`, `CommentsPanel`.
- Imports consumidos: `getDb`, `requireAuth`, `requireRole`, `asyncHandler`, `apiClient`.
- Endpoints criados: `GET /api/comments/:contentId`, `POST /api/comments/:contentId`, `DELETE /api/comments/:commentId`, `PATCH /api/comments/:commentId/moderation`.
- DTOs criados: payload `{ body }`, payload de moderacao `{ status, reason }`.
- Schemas/modelos criados: colecao `content_comments`.
- Services criados: `comments.service.js`.
- Componentes/paginas frontend criados: `CommentsPanel`.
- Dados persistidos: `userId`, `contentId`, `body`, `status`, `moderationReason`, `createdAt`, `updatedAt`.
- Regras aplicadas: ownership por autor; moderacao por `admin`/`moderator`; apenas comentarios `visible` na listagem publica.
- BKs seguintes dependentes: nenhum direto, mas enriquece detalhe da `MF3`.

### `BK-MF3-03`

- Ficheiros previstos/criados pelo guia: `backend/src/modules/search/search.validation.js`, `search.service.js`, `search.controller.js`, `search.routes.js`, `frontend/src/services/api/searchApi.js`, `frontend/src/pages/SearchPage.jsx`.
- Ficheiros editados pelo guia: `backend/src/app.js`, `backend/src/server.js`, `frontend/src/routes/AppRoutes.jsx`.
- Exports produzidos: `searchRouter`, `ensureSearchIndexes`, `searchContents`, `searchApi`, `SearchPage`.
- Imports consumidos: `getDb`, `asyncHandler`, `apiClient`.
- Endpoints criados: `GET /api/search`.
- DTOs criados: query params `q`, `page`, `limit`.
- Schemas/modelos criados: nenhum; consome `contents` e `taxonomies`.
- Services criados: `search.service.js`.
- Componentes/paginas frontend criados: `SearchPage`.
- Dados persistidos: nenhum.
- Regras aplicadas: apenas `published`; paginacao para cumprir `RNF09`.
- BKs seguintes dependentes: `BK-MF3-04`.

### `BK-MF3-04`

- Ficheiros previstos/criados pelo guia: `backend/src/modules/discovery/discovery.service.js`, `discovery.controller.js`, `discovery.routes.js`, `frontend/src/services/api/discoveryApi.js`, `frontend/src/components/search/SearchFilters.jsx`, `frontend/src/components/discovery/ContentCarousel.jsx`, `frontend/src/pages/DiscoveryHomePage.jsx`, `frontend/src/components/discovery/RelatedContent.jsx`.
- Ficheiros editados pelo guia: `backend/src/modules/search/search.validation.js`, `backend/src/modules/search/search.service.js`, `backend/src/app.js`, `frontend/src/services/api/searchApi.js`, `frontend/src/routes/AppRoutes.jsx`, `frontend/src/pages/ContentDetailPage.jsx`.
- Exports produzidos: `discoveryRouter`, `getDiscoveryHome`, `getRelatedContent`, `discoveryApi`, `SearchFilters`, `ContentCarousel`, `DiscoveryHomePage`, `RelatedContent`.
- Imports consumidos: `getDb`, `apiClient`, `searchApi`.
- Endpoints criados: `GET /api/discovery/home`, `GET /api/discovery/related/:contentId`.
- Endpoints editados: `GET /api/search` passa a aceitar `type`, `taxonomyId`, `sort`.
- DTOs criados: query params de filtro/sort.
- Schemas/modelos criados: nenhum; consome `contents`, `taxonomies`, `content_ratings`.
- Services criados: `discovery.service.js`.
- Componentes/paginas frontend criados: `SearchFilters`, `ContentCarousel`, `DiscoveryHomePage`, `RelatedContent`.
- Dados persistidos: nenhum.
- Regras aplicadas: apenas `published`; relacionados excluem conteudo atual.
- BKs seguintes dependentes: `BK-MF3-05`.

### `BK-MF3-05`

- Ficheiros previstos/criados pelo guia: `backend/src/modules/recommendations/recommendations.service.js`, `recommendations.controller.js`, `recommendations.routes.js`, `frontend/src/services/api/recommendationsApi.js`, `frontend/src/pages/ForYouPage.jsx`.
- Ficheiros editados pelo guia: `backend/src/app.js`, `frontend/src/routes/AppRoutes.jsx`.
- Exports produzidos: `recommendationsRouter`, `getMyRecommendations`, `recommendationsApi`, `ForYouPage`.
- Imports consumidos: `getDb`, `requireAuth`, `asyncHandler`, `apiClient`.
- Endpoints criados: `GET /api/recommendations/me`.
- DTOs criados: nenhum payload; usa sessao.
- Schemas/modelos criados: nenhum; consome `playback_progress`, `user_content_lists`, `content_ratings`, `contents`.
- Services criados: `recommendations.service.js`.
- Componentes/paginas frontend criados: `ForYouPage`.
- Dados persistidos: nenhum.
- Regras aplicadas: autenticacao obrigatoria; sem `userId` no frontend; apenas `published`; cold start honesto.
- BKs seguintes dependentes: `BK-MF3-06`.

### `BK-MF3-06`

- Ficheiros previstos/criados pelo guia: `backend/src/modules/recommendations/recommendation-explanations.js`, `frontend/src/components/recommendations/RecommendationExplanation.jsx`.
- Ficheiros editados pelo guia: `backend/src/modules/recommendations/recommendations.service.js`, `frontend/src/pages/ForYouPage.jsx`.
- Exports produzidos: `buildRecommendationExplanation`, `RecommendationExplanation`.
- Imports consumidos: `reasonCode` de `BK-MF3-05`.
- Endpoints criados: nenhum novo.
- Endpoints editados: `GET /api/recommendations/me` passa a incluir `explanation`.
- DTOs criados: objeto `explanation`.
- Schemas/modelos criados: nenhum.
- Services criados: mapa de explicacoes.
- Componentes/paginas frontend criados: `RecommendationExplanation`.
- Dados persistidos: nenhum.
- Regras aplicadas: explicacao agregada sem emails, tokens ou historico detalhado.
- BKs seguintes dependentes: `BK-MF4-01` apenas por handoff de macro.

## Confirmacao de integracao

| Verificacao | Resultado |
| --- | --- |
| Dois endpoints para a mesma acao | Nao encontrado. Pesquisa fica em `/api/search`; discovery fica em `/api/discovery`; recomendacao autenticada fica em `/api/recommendations/me`. |
| Dois schemas/modelos para a mesma entidade | Nao encontrado. Ratings e comentarios usam colecoes distintas. |
| Nomes diferentes para o mesmo conceito | Nao encontrado como blocker; nomes principais estao estabilizados em `rating`, `comment`, `search`, `discovery`, `recommendation`, `explanation`. |
| Frontend a chamar endpoint inexistente | Nao encontrado nos contratos dos guias. |
| Service a importar ficheiro nao criado | Nao encontrado como blocker; imports dependem de BKs anteriores ou do proprio BK. |
| BK seguinte dependente de algo nao entregue | Nao encontrado como blocker; sequencia ratings -> comentarios/recomendacao, pesquisa -> filtros/discovery, recomendacao -> explicabilidade esta coerente. |

## Gate de app funcional

| BK | Compila no contexto previsto | Imports resolvidos por BKs anteriores ou pelo proprio BK | Frontend chama endpoint real | Auth/ownership aplicado | Negativos definidos |
| --- | --- | --- | --- | --- | --- |
| `BK-MF3-01` | Sim, por contrato previsto | Sim | Sim | Sim | Sim |
| `BK-MF3-02` | Sim, por contrato previsto | Sim | Sim | Sim | Sim |
| `BK-MF3-03` | Sim, por contrato previsto | Sim | Sim | Nao exige auth | Sim |
| `BK-MF3-04` | Sim, por contrato previsto | Sim | Sim | Nao exige auth | Sim |
| `BK-MF3-05` | Sim, por contrato previsto | Sim | Sim | Sim | Sim |
| `BK-MF3-06` | Sim, por contrato previsto | Sim | Sim | Sim, herdado de `BK-MF3-05` | Sim |

Nota: esta auditoria avalia guias BK, nao implementa codigo real da aplicacao. A executabilidade acima refere-se ao contrato de implementacao descrito nos guias, validado contra BKs anteriores e documentacao canonica.

## Decisoes tecnicas confirmadas

- Backend: Node.js, Express modular e MongoDB.
- Frontend: React + Vite + `apiClient` com `fetch`, herdado dos BKs `MF1`/`MF2`.
- Sessao: cookies HttpOnly e `req.user.id`; sem tokens em `localStorage`.
- Catalogo publico: apenas `status: "published"`.
- Ratings: chave unica `userId + contentId`.
- Comentarios: moderacao minima com estados `visible`, `pending_review`, `rejected`.
- Pesquisa: MongoDB com query escapada, paginacao e filtros simples.
- Discovery: publico e nao personalizado.
- Recomendacao: baseline por regras simples com embeddings opcionais de conteudo, sem modelos generativos, sem embedding persistente de utilizador e sem partilha de historico pessoal bruto.
- Explicabilidade: mensagens controladas por `reasonCode`.

## Drift documental encontrado

- `MF-VIEWS.md` lista a sequencia `BK-MF3-01..06`, mas o bloco "Step-by-step" da propria macro recomenda priorizar pesquisa/filtros antes de ratings/comentarios. Os guias mantem a sequencia canonica do backlog, dos headers e do plano de sprints.
- `RNF.md` sugere Next.js com Axios, mas os BKs `MF1`/`MF2` fixaram React + Vite + `fetch/apiClient` por simplicidade pedagogica. Os BKs `MF3` mantem essa decisao para nao partir a sequencia.
- Codigo real nao foi usado como contrato final nesta auditoria. O working tree tem BKs `MF3` modificados e este relatorio como ficheiro novo, mas a execucao atual nao editou os BKs.

## Verificacoes executadas

| Verificacao | Resultado |
| --- | --- |
| Varredura textual de termos proibidos em `MF3` | PASS |
| Estrutura obrigatoria dos 6 BKs | PASS |
| `git diff --check` | PASS |
| `bash scripts/validate-planificacao.sh` | PASS (`checked_bks: 55`, `checked_guides: 55`) |

## BKs editados nesta execucao

Nenhum BK foi editado. Apenas `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF3.md` foi atualizado.

## TODOs e blockers restantes

- `TODO (BLOCKER)`: nenhum documento obrigatorio em falta.
- `TODO`: se a equipa quiser endurecer privacidade visual de comentarios, rever a exposicao publica de `userId` em `BK-MF3-02`.
- `TODO`: se a equipa quiser polir experiencia de recomendacao, adicionar deduplicacao global de items entre grupos em `BK-MF3-05`.
- `TODO`: se a equipa quiser maior explicitude documental, acrescentar o bloco final de imports ao passo de `search.service.js` em `BK-MF3-04`.

## Ordem recomendada de correcao

Nao ha correcao obrigatoria para desbloquear a `MF3`. Se forem tratadas as melhorias nao bloqueantes, recomenda-se esta ordem:

1. `BK-MF3-02` - minimizar exposicao publica de identificadores em comentarios.
2. `BK-MF3-05` - deduplicar items entre grupos de recomendacao.
3. `BK-MF3-04` - explicitar imports finais do service de pesquisa.

## Changelog

- `2026-06-07`: relatorio alinhado ao modo `auditar_apenas`; reauditoria dos 6 BKs atuais da `MF3`; nenhum BK editado.
