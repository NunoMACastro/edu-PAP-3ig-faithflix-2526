# Relatorio de auditoria BK - MF2

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF2`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF2.md`
- `macro_fase_auditada`: `MF2`
- `data`: `2026-05-31`
- `modo`: `corrigir_planificacao`
- `status`: `correcoes_dependencias_conflitos_pr_aplicadas`

## Objetivo

Corrigir a documentacao e planificacao dos guias `BK-MF2-01` a `BK-MF2-08`, incluindo integracao com `MF0` e `MF1`, para reduzir risco de conflitos em Pull Requests quando os alunos implementarem por ordem de dependencias.

Nesta execucao nao foi editado codigo real da aplicacao. As alteracoes incidiram em backlog, headers dos guias, ordem de sprint, snippets documentados e tooling oficial de validacao da planificacao.

## Documentos consultados

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md` (`DEPRECATED`; alias de compatibilidade)
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md` (`DEPRECATED`; alias de compatibilidade)
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `GLOSSARIO-TERMOS-TECNICOS-PAP.md`
- Todos os BKs de `MF0`, `MF1` e `MF2`.
- BKs posteriores com dependencia direta de `MF2`: `BK-MF3-01`, `BK-MF3-03`, `BK-MF3-05`, `BK-MF4-01`, `BK-MF5-01`, `BK-MF5-03` e `BK-MF5-04`.
- Relatorios existentes `AUDITORIA-HIDRATACAO-MF0.md`, `AUDITORIA-HIDRATACAO-MF1.md` e versao anterior deste relatorio.

## Resultado global

| Momento | Fonte | BK analisados | Estado funcional | Risco de conflito PR |
| --- | --- | ---: | --- | --- |
| Antes desta correcao | Releitura documental focada em dependencias e snippets | 8 | 8 guias funcionalmente completos | Alto em dependencias declaradas e snippets que podiam apagar entregas anteriores |
| Depois desta correcao | Backlog, headers, sprints, snippets e validador local | 8 | 8 guias mantidos como implementaveis | Baixo; dependencias canonicas e snippets criticos foram alinhados |

## Ficheiros editados nesta execucao

- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-05-health-check-e-logging-estruturado.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md`
- `docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md`
- `docs/planificacao/guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md`
- `docs/planificacao/guias-bk/MF2/BK-MF2-04-pagina-detalhe-conteudo.md`
- `docs/planificacao/guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md`
- `scripts/validate-planificacao.sh`
- `scripts/validate_planificacao_canonica.py`

Nenhum ficheiro de codigo real da app foi editado.

## Classificacao por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF2-01` | `OK` | Guia completo para registo, login, recuperacao de password, sessoes reais em MongoDB, cookie `HttpOnly`, `req.user`, frontend de autenticacao e negativos. Evita `localStorage` para tokens e prepara ownership dos BKs seguintes. |
| `BK-MF2-02` | `OK` | Guia separa perfil proprio de gestao de roles, cria `requireAuth` e `requireRole`, protege rotas admin e ignora `role` enviada pelo utilizador comum. |
| `BK-MF2-03` | `OK` | Guia cobre catalogo, taxonomias, estados `draft/published/archived`, listagem publica apenas de publicados, historico de revisoes e reversao protegida por role. |
| `BK-MF2-04` | `OK` | Guia implementa detalhe publico por `id` ou `slug`, filtra `published`, preserva rotas admin/taxonomias e prepara passagem para o player. |
| `BK-MF2-05` | `OK` | Guia implementa playback, progresso persistido, continuar a ver, ownership por `req.user.id`, player frontend e negativos de conteudo `draft` e isolamento entre utilizadores. |
| `BK-MF2-06` | `OK` | Guia completa legendas/audio/parental/qualidade com validacao backend, preferencias persistidas, bloqueio parental e aplicacao real de legendas via `TextTrack.mode`. |
| `BK-MF2-07` | `OK` | Guia implementa favoritos, watchlist e historico autenticados, idempotencia, ownership e reutilizacao de `playback_progress` como fonte de historico. |
| `BK-MF2-08` | `OK` | Guia cria E2E Playwright com seed restrito, seletores estaveis, fluxo login/catalogo/detalhe/player/biblioteca e medicoes objetivas `RNF07 catalogLoadMs` e `RNF08 playStartMs`. |

## BKs PARCIAL ou CRITICO

Nao foram encontrados BKs `PARCIAL` ou `CRITICO` nesta auditoria.

## Findings de integracao corrigidos nesta execucao

- Dependencias canonicas alinhadas para impedir PRs paralelos sobre base incompleta:
  - `BK-MF1-05`: passou a depender de `BK-MF1-01` e `BK-MF1-04`.
  - `BK-MF1-06`: passou a depender de `BK-MF1-03`, `BK-MF1-04` e `BK-MF1-05`.
  - `BK-MF2-01`: passou a depender de `BK-MF1-06`, garantindo fundacao completa e smoke verde.
  - `BK-MF2-03`: passou a depender de `BK-MF2-02`, porque usa `requireRole`.
  - `BK-MF2-08`: passou a depender de `BK-MF2-06` e `BK-MF2-07`, fechando media controls e biblioteca antes do E2E.
- `BK-MF2-01` deixou de sugerir substituicao regressiva de `backend/package.json` e `backend/src/app.js`; agora preserva `express` 4, `smoke`, `/health` e `requestLogger`.
- `BK-MF2-04` deixou de perder as rotas e metodos de revisoes criados no `BK-MF2-03`.
- `PLANO-SPRINTS.md` passou a explicitar a ordem interna obrigatoria das sprints 2, 3 e 4.
- `MATRIZ-CANONICA-BK.md` foi revista e recebeu changelog confirmando que a cobertura requisito -> BK nao mudou.
- `scripts/validate-planificacao.sh` passou a usar um validador local versionado que compara backlog e headers dos guias.

As lacunas historicas ja registadas na versao anterior continuam fechadas:

- `BK-MF2-03`: `RF10` demonstravel com historico e reversao.
- `BK-MF2-06`: selecao de legendas/audio aplicada no player.
- `BK-MF2-08`: seed E2E restrito, seletores compativeis e medicao `RNF07` no catalogo.

## Decisoes tecnicas confirmadas

- `CANONICO`: `MF2` cobre o core streaming MVP com `RF01..RF18`.
- `CANONICO`: `BK-MF2-08` cobre `RNF07` e `RNF08`.
- `CANONICO`: sessoes autenticadas devem usar cookies `HttpOnly` com flags adequadas (`RNF15`).
- `CANONICO`: backend modular em Node.js/Express e base principal MongoDB Atlas no MVP.
- `CANONICO`: `RF16`, `RF17` e `RF18` sao dados do utilizador autenticado e exigem ownership no backend.
- `CANONICO`: snippets em ficheiros partilhados devem ser aditivos e preservar entregas anteriores.
- `DERIVADO`: os guias seguem React + Vite e `fetch` via `apiClient`, por coerencia com a `MF1`; `RNF.md` continua a sugerir Next.js/Axios como stack recomendada de alto nivel.
- `DERIVADO`: streaming e simplificado com ficheiro local/URL de media, sem CDN, DRM ou URLs temporarios reais.
- `DERIVADO`: `playback_progress` e a fonte unica para progresso, continuar a ver e historico.

## Mapa de integracao da MF

| BK | Ficheiros criados/editados documentados | Exports/imports principais | Endpoints/rotas | DTOs/validacoes/modelos | Services/componentes/paginas | Dados persistidos | Auth/ownership/roles | BKs seguintes dependentes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF2-01` | `backend/package.json`, `.env.example`, `env.js`, `database.js`, `auth/*`, `session.middleware.js`, `app.js`, `authApi.js`, `AuthForms.jsx`, `pages.jsx` | `getDb`, `ensureAuthIndexes`, `hashPassword`, `createSession`, `resolveSession`, `authApi` | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `GET /api/session/me`, `POST /api/session/logout` | validacao email/nome/password; tokens opacos | `auth.service`, `auth.controller`, `AuthForms` | `users`, `sessions`, `password_reset_tokens` | cookie `HttpOnly`; `req.user` derivado da sessao | `BK-MF2-02`, `BK-MF4-01`, `BK-MF5-01`, `BK-MF5-03` |
| `BK-MF2-02` | `auth.middleware.js`, `users/*`, `app.js`, `promote-admin.js`, `userApi.js`, `AccountPage.jsx`, `AdminUsersPage.jsx` | `requireAuth`, `requireRole`, `userApi` | `GET/PATCH /api/users/me`, `GET /api/users`, `PATCH /api/users/:id/role`, `/conta`, `/admin/utilizadores` | `assertProfileUpdate`, `assertRoleUpdate` | `user.service`, `user.controller`, paginas conta/admin | `users.name`, `users.role` | `requireAuth`; `requireRole(["admin"])` | `BK-MF2-03`, `BK-MF5-04` |
| `BK-MF2-03` | `catalog.validation.js`, `catalog.service.js`, `taxonomy.service.js`, `catalog.controller.js`, `catalog.routes.js`, `catalogApi.js`, `CatalogPage.jsx`, `AdminCatalogPage.jsx` | `catalogRouter`, `catalogApi`, `ensureCatalogIndexes`, `listContentRevisions`, `revertContentRevision` | `GET /api/catalog`, `GET /api/catalog/admin`, `POST/PATCH /api/catalog`, `PATCH /api/catalog/:id/status`, `GET/POST /api/catalog/taxonomies`, `GET /api/catalog/:id/revisions`, `POST /api/catalog/:id/revisions/:revisionId/revert`, `/catalogo`, `/admin/catalogo` | `assertCatalogPayload`, `assertStatus`, `assertTaxonomyPayload`; `contents`, `taxonomies`, `content_revisions` | catalog/taxonomy services, paginas catalogo/admin com reversao | `contents`, `taxonomies`, `content_revisions` | escrita, revisoes e reversao por `admin/moderator`; leitura publica de `published` | `BK-MF2-04`, `BK-MF3-03` |
| `BK-MF2-04` | `catalog.service.js`, `catalog.controller.js`, `catalog.routes.js`, `catalogApi.js`, `ContentDetailPage.jsx`, `AppRoutes.jsx` | `getPublishedContentDetail`, `getCatalogDetail`, `catalogApi.getDetail` | `GET /api/catalog/:idOrSlug`, `/catalogo/:idOrSlug` | query por ObjectId ou slug, sempre `status: "published"` | `ContentDetailPage` | leitura de `contents` | nao expoe `draft`/`archived` | `BK-MF2-05`, `BK-MF2-07`, `BK-MF3-04` |
| `BK-MF2-05` | `playback.validation.js`, `playback.service.js`, `playback.controller.js`, `playback.routes.js`, `playbackApi.js`, `PlaybackPage.jsx`, `ContinueWatchingStrip.jsx` | `playbackRouter`, `playbackApi`, `ensurePlaybackIndexes` | `GET /api/playback/:contentId`, `PUT /api/playback/:contentId/progress`, `GET /api/playback/me/continue-watching`, `/ver/:contentId` | `assertProgressPayload`; `playback_progress` | playback service, player, continuar a ver | `playback_progress` | `requireAuth`; progresso por `req.user.id` | `BK-MF2-06`, `BK-MF2-07`, `BK-MF2-08` |
| `BK-MF2-06` | `catalog.validation.js`, `users/*`, `media-preferences.service.js`, `playback.service.js`, `playback.controller.js`, `playback.routes.js`, `playbackApi.js`, `PlaybackPage.jsx` | `assertMediaOptions`, `assertParentalSettings`, `getMediaPreferences`, `saveMediaPreferences` | `PATCH /api/users/me/parental`, `GET/PUT /api/playback/preferences` | parental `0..18`; `tracks.subtitles`, `tracks.audio.src`, `qualityOptions`, preferencias | media preferences service; player com selects, `TextTrack.mode` e troca de fonte | `users.parentalMaxAgeRating`, `media_preferences`, campos media em `contents` | `requireAuth`; parental validado no backend | `BK-MF2-07`, `BK-MF2-08`, `BK-MF6-05` |
| `BK-MF2-07` | `library.validation.js`, `library.service.js`, `library.controller.js`, `library.routes.js`, `libraryApi.js`, `LibraryActions.jsx`, `MyLibraryPage.jsx` | `libraryRouter`, `libraryApi`, `ensureLibraryIndexes` | `GET/PUT/DELETE /api/me/favorites`, `GET/PUT/DELETE /api/me/watchlist`, `GET /api/me/history`, `/biblioteca` | `assertListType`, `asObjectId`; `user_content_lists` | library service, acoes no detalhe, biblioteca | `user_content_lists`; leitura de `playback_progress` | `requireAuth`; listas por `req.user.id` | `BK-MF2-08`, `BK-MF3-01`, `BK-MF3-05` |
| `BK-MF2-08` | `package.json`, `playwright.config.js`, `seed-mf2-e2e.js`, `AuthForms.jsx`, `mf2-flow.spec.js`, `frontend/public/media/piloto.mp4` | `@playwright/test`, seed restrito, seletores estaveis | `npm run e2e:mf2`; `/login`, `/catalogo`, `/catalogo/piloto-faithflix`, `/ver/:contentId`, `/biblioteca` | fixture E2E `mf2-e2e`; medicoes `RNF07 catalogLoadMs`/`RNF08 playStartMs` | Playwright config/test | fixture em `users`, `contents`; limpeza por email/userId/tag | login real por cookie; fluxo autenticado | `BK-MF3-01`, Gate S4 |

## Confirmacao de integracao da MF

- Nao foram encontrados endpoints duplicados para a mesma acao dentro dos guias da `MF2`.
- Nao foram encontrados dois schemas/modelos diferentes para a mesma entidade principal.
- O frontend documentado chama endpoints criados no mesmo BK ou em BK anterior da sequencia.
- Services documentados importam validacoes/modelos criados no proprio BK ou em BK anterior.
- A sequencia `auth -> users -> catalog -> detail -> playback -> media preferences -> library -> E2E` esta coerente como tutorial incremental.
- O fluxo autenticado usa cookie e `req.user`; nao ha contrato de token em `localStorage`.
- Headers dos guias e `BACKLOG-MVP.md` estao alinhados em `owner`, `prioridade`, `dependencias` e `rf_rnf`.
- A ordem de PRs por sprint esta documentada para evitar integrar BK dependente antes da dependencia.

## Drift documental encontrado

- `MATRIZ-RF-RNF-POR-BK.md` e `SCORECARD-OFICIAL-POR-SPRINT.md` existem apenas como aliases `DEPRECATED`; as fontes ativas sao `MATRIZ-CANONICA-BK.md` e `SCORECARD-SPRINTS.md`.
- `RNF.md` sugere Next.js/Axios, enquanto `MF1` e `MF2` documentam React + Vite e `fetch` por simplicidade pedagogica. Esta decisao esta tratada como `DERIVADO` e deve manter-se explicita ate decisao final do orientador.
- O codigo real em `backend/` e `frontend/` observado nesta auditoria ainda corresponde sobretudo a fundacao `MF1` (`/health`, `/api`, sessao base e paginas placeholder). Nao deve ser usado como prova de que `MF2` esta implementada.
- BKs posteriores diretos de `MF3`, `MF4` e `MF5` ainda contêm guias mais genericos e pseudo-checklists; isso nao bloqueia a classificacao da `MF2`, mas aumenta a prioridade de hidratacao dessas macrofases antes dos respetivos sprints.
- O script oficial de validacao apontava para um caminho externo inexistente; foi corrigido para usar validador local versionado.

## Ordem aplicada de correcao

1. Alinhar dependencias no backlog e nos headers dos guias.
2. Tornar explicita a ordem interna obrigatoria das sprints 2, 3 e 4.
3. Corrigir snippets documentados que podiam remover entregas anteriores.
4. Rever a matriz canonica e registar que a cobertura requisito -> BK nao mudou.
5. Criar validador local e corrigir o wrapper oficial.
6. Atualizar este relatorio com os riscos encontrados e corrigidos.

## Validacao executada

```bash
python3 scripts/validate_planificacao_canonica.py --project faithflix
bash scripts/validate-planificacao.sh
rg -n "express|mongodb|smoke|requestLogger|healthRouter|app.use\(\"/health\"|app.use\(\"/api/auth\"" docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md
rg -n "/:id/revisions|/:id/revisions/:revisionId/revert|listRevisions|revertRevision|getContentRevisions|postContentRevisionRevert|getDetail" docs/planificacao/guias-bk/MF2/BK-MF2-04-pagina-detalhe-conteudo.md
git diff --check
```

| Comando | Estado | Resultado |
| --- | --- | --- |
| `python3 scripts/validate_planificacao_canonica.py --project faithflix` | `OK` | `PASS: checked 55 BKs and 55 guides`. |
| `bash scripts/validate-planificacao.sh` | `OK` | JSON com `status: PASS`, `checked_bks: 55`, `checked_guides: 55` e `errors: []`. |
| Varredura textual `BK-MF2-01` | `OK` | Confirmado `express` 4, `mongodb`, `smoke`, `requestLogger`, `healthRouter`, `/health` e `/api/auth`. |
| Varredura textual `BK-MF2-04` | `OK` | Confirmadas rotas de revisoes e metodos `listRevisions`, `revertRevision` e `getDetail`. |
| `git diff --check` | `OK` | Sem erros de whitespace. |

## Changelog

- `2026-05-31`: Relatorio atualizado em modo `corrigir_planificacao`; corrigidos dependencias, ordem interna de sprint, snippets aditivos e validador local; risco de conflito PR reduzido.
