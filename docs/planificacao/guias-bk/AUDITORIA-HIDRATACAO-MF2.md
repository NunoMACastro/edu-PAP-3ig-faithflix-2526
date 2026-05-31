# Relatorio de auditoria BK - MF2

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF2`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF2.md`
- `macro_fase_auditada`: `MF2`
- `data`: `2026-05-31`
- `modo`: `corrigir_apenas`
- `status`: `correcoes_aplicadas_bks_incompletos`

## Objetivo

Corrigir apenas os guias `BK-MF2-03`, `BK-MF2-06` e `BK-MF2-08`, que estavam classificados como `PARCIAL` ou `CRITICO` na auditoria anterior, sem editar codigo real da app.

Esta execucao manteve os restantes BKs da `MF2` intactos e atualizou este relatorio com o antes/depois das correcoes.

## Documentos consultados

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md` (`DEPRECATED`; usado apenas para confirmar compatibilidade)
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `GLOSSARIO-TERMOS-TECNICOS-PAP.md`
- Todos os BKs de `MF0`, `MF1` e `MF2`.
- BKs posteriores com dependencia direta de `MF2`: `BK-MF3-01`, `BK-MF3-03`, `BK-MF3-05`, `BK-MF4-01`, `BK-MF5-01`, `BK-MF5-03`, `BK-MF5-04` e referencias de `MF6`.
- Relatorios existentes `AUDITORIA-HIDRATACAO-MF0.md`, `AUDITORIA-HIDRATACAO-MF1.md` e versao anterior deste relatorio.

## Resultado global

| Momento | Fonte | BK analisados | `OK` | `PARCIAL` | `CRITICO` |
| --- | --- | ---: | ---: | ---: | ---: |
| Antes desta correcao | Auditoria MF2 anterior | 8 | 5 | 2 | 1 |
| Depois desta correcao | Releitura dos guias MF2 editados | 8 | 8 | 0 | 0 |

## BKs editados nesta execucao

- `docs/planificacao/guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md`
- `docs/planificacao/guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md`
- `docs/planificacao/guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md`

Nenhum ficheiro de codigo real da app foi editado.

## Classificacao por BK

| BK | Estado | Justificacao |
| --- | --- | --- |
| `BK-MF2-01` | `OK` | Guia completo para registo, login, sessao por cookie HttpOnly, recuperacao de password, frontend e negativos. Mantem decisao `DERIVADO` de token opaco em servidor e nao usa `localStorage`. |
| `BK-MF2-02` | `OK` | Perfil e roles ficam separados, `requireAuth`/`requireRole` sao claros, rotas admin exigem role e o perfil proprio ignora `role` enviada pelo frontend. |
| `BK-MF2-03` | `OK` | Passou a validar `taxonomyIds` contra ObjectIds existentes, listar revisoes, reverter snapshots por endpoint protegido e expor essa reversao na pagina admin. |
| `BK-MF2-04` | `OK` | Detalhe publico por `id` ou `slug`, filtro por `published`, rota frontend e handoff para player estao coerentes. |
| `BK-MF2-05` | `OK` | Playback, progresso, continuar a ver e ownership por `req.user.id` ficam integrados com endpoints reais e criterios mensuraveis. |
| `BK-MF2-06` | `OK` | Passou a exigir `src` em audio, resolver fonte por audio/qualidade real, aplicar legendas via `TextTrack.mode` e preservar tempo em trocas de fonte. |
| `BK-MF2-07` | `OK` | Favoritos, watchlist e historico usam endpoints autenticados, idempotencia e ownership. O historico reutiliza `playback_progress`, alinhado com o BK anterior. |
| `BK-MF2-08` | `OK` | O seed passou a limpar apenas fixture E2E, os seletores ficaram compativeis com `AuthForms` do `BK-MF2-01`, e `RNF07` passou a ser medido em `/catalogo`. |

## Achados corrigidos nesta execucao

### `BK-MF2-03` - de `PARCIAL` para `OK`

- Ficheiro: `docs/planificacao/guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md`
- Problema corrigido: `RF10` estava limitado a guardar revisoes, sem consulta nem reversao demonstravel.
- Correcoes aplicadas:
  - `taxonomyIds` passou a validar ObjectIds e existencia em `taxonomies`.
  - `catalog.service.js` documentado passou a incluir `listContentRevisions` e `revertContentRevision`.
  - `catalog.controller.js`, `catalog.routes.js` e `catalogApi.js` passaram a documentar endpoints de revisoes.
  - `AdminCatalogPage` passou a listar revisoes e acionar reversao.
  - Criterios, validacao, evidence e handoff passaram a exigir taxonomia inexistente `400`, historico e reversao.
- Resultado: `RF10` fica demonstravel por endpoint e UI admin, sem alterar o scope dos BKs seguintes.

### `BK-MF2-06` - de `PARCIAL` para `OK`

- Ficheiro: `docs/planificacao/guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md`
- Problema corrigido: legendas e audio eram guardados como preferencias, mas o player nao aplicava a selecao.
- Correcoes aplicadas:
  - `tracks.audio` passou a exigir `src`, tal como legendas.
  - `resolvePlayableMedia` passou a resolver fonte por audio escolhido, qualidade escolhida e fallback seguro.
  - `PlaybackPage` passou a aplicar legendas com `TextTrack.mode`.
  - Trocas de audio e qualidade passaram a preservar tempo com `resumeAtRef`.
  - Criterios e evidence passaram a cobrir audio inexistente, qualidade inexistente e aplicacao real de legendas.
- Resultado: `RF13`, `RF14` e `RF15` ficam demonstraveis no player e no backend.

### `BK-MF2-08` - de `CRITICO` para `OK`

- Ficheiro: `docs/planificacao/guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md`
- Problema corrigido: seed destrutivo, seletores incompativeis com `AuthForms` e medicao de `RNF07` no detalhe.
- Correcoes aplicadas:
  - Seed passou a limpar apenas o email E2E, o utilizador associado e documentos marcados com `mf2-e2e`.
  - `AuthForms` passou a mostrar o componente completo do `BK-MF2-01` com `data-testid` adicionados sem mudar o estado `form`.
  - Teste passou a confirmar login, medir `RNF07 catalogLoadMs` em `/catalogo` e depois seguir para detalhe/player/biblioteca.
  - Criterios e evidence passaram a exigir prova de seed restrito e log `RNF07 catalogLoadMs`.
- Resultado: o E2E deixa de ser destrutivo e passa a medir `RNF07` no alvo definido em `docs/RNF.md`.

## Lacunas corrigidas nesta execucao

- `BK-MF2-03`: `RF10` completado com historico, reversao e validacao de taxonomias.
- `BK-MF2-06`: selecao de legendas/audio completada com comportamento real no player.
- `BK-MF2-08`: seed, seletores e medicao `RNF07` corrigidos.

## Decisoes tecnicas confirmadas

- `CANONICO`: `MF2` cobre `RF01..RF18` e fecha o core streaming MVP.
- `CANONICO`: `BK-MF2-08` e responsavel por `RNF07` e `RNF08`.
- `CANONICO`: sessoes autenticadas devem usar cookies `HttpOnly`, com flags adequadas (`RNF15`).
- `CANONICO`: backend modular em Node.js/Express e base principal MongoDB Atlas no MVP.
- `DERIVADO`: os BKs seguem React + Vite e `fetch` via `apiClient`, por coerencia com `MF1`, embora `RNF.md` sugira Next.js/Axios como stack recomendada de alto nivel.
- `DERIVADO`: streaming e simplificado com ficheiro local/URL de media, sem CDN, DRM ou URLs temporarios reais.
- `DERIVADO`: `playback_progress` e a fonte unica para progresso, continuar a ver e historico.

## Mapa de integracao da MF

| BK | Ficheiros criados/editados documentados | Exports/imports principais | Endpoints/rotas | DTOs/validacoes/modelos | Services/componentes/paginas | Dados persistidos | Auth/ownership/roles | Dependentes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `BK-MF2-01` | `backend/package.json`, `.env.example`, `env.js`, `database.js`, `auth/*`, `session.middleware.js`, `app.js`, `authApi.js`, `AuthForms.jsx`, `pages.jsx` | `getDb`, `ensureAuthIndexes`, `hashPassword`, `createSession`, `resolveSession`, `authApi` | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `GET /api/session/me`, `POST /api/session/logout` | validacao email/nome/password; tokens opacos | `auth.service`, `auth.controller`, `AuthForms` | `users`, `sessions`, `password_reset_tokens` | cookie HttpOnly; `req.user` derivado da sessao | `BK-MF2-02`, `BK-MF4-01`, `BK-MF5-01`, `BK-MF5-03` |
| `BK-MF2-02` | `auth.middleware.js`, `users/*`, `app.js`, `promote-admin.js`, `userApi.js`, `AccountPage.jsx`, `AdminUsersPage.jsx` | `requireAuth`, `requireRole`, `userApi` | `GET/PATCH /api/users/me`, `GET /api/users`, `PATCH /api/users/:id/role`, `/conta`, `/admin/utilizadores` | `assertProfileUpdate`, `assertRoleUpdate` | `user.service`, `user.controller`, paginas conta/admin | `users.name`, `users.role` | `requireAuth`; `requireRole(["admin"])` | `BK-MF2-03`, `BK-MF5-04` |
| `BK-MF2-03` | `catalog.validation.js`, `catalog.service.js`, `taxonomy.service.js`, `catalog.controller.js`, `catalog.routes.js`, `catalogApi.js`, `CatalogPage.jsx`, `AdminCatalogPage.jsx` | `catalogRouter`, `catalogApi`, `ensureCatalogIndexes`, `listContentRevisions`, `revertContentRevision` | `GET /api/catalog`, `GET /api/catalog/admin`, `POST/PATCH /api/catalog`, `PATCH /api/catalog/:id/status`, `GET/POST /api/catalog/taxonomies`, `GET /api/catalog/:id/revisions`, `POST /api/catalog/:id/revisions/:revisionId/revert`, `/catalogo`, `/admin/catalogo` | `assertCatalogPayload`, `assertStatus`, `assertTaxonomyPayload`; `contents`, `taxonomies`, `content_revisions` | catalog/taxonomy services, paginas catalogo/admin com reversao | `contents`, `taxonomies`, `content_revisions` | escrita, revisoes e reversao por `admin/moderator`; leitura publica de `published` | `BK-MF2-04`, `BK-MF3-03` |
| `BK-MF2-04` | `catalog.service.js`, `catalog.controller.js`, `catalog.routes.js`, `catalogApi.js`, `ContentDetailPage.jsx`, `AppRoutes.jsx` | `getPublishedContentDetail`, `getCatalogDetail`, `catalogApi.getDetail` | `GET /api/catalog/:idOrSlug`, `/catalogo/:idOrSlug` | query por ObjectId ou slug, sempre `status: "published"` | `ContentDetailPage` | leitura de `contents` | nao expoe `draft`/`archived` | `BK-MF2-05`, `BK-MF2-07`, `BK-MF3-04` |
| `BK-MF2-05` | `playback.validation.js`, `playback.service.js`, `playback.controller.js`, `playback.routes.js`, `playbackApi.js`, `PlaybackPage.jsx`, `ContinueWatchingStrip.jsx` | `playbackRouter`, `playbackApi`, `ensurePlaybackIndexes` | `GET /api/playback/:contentId`, `PUT /api/playback/:contentId/progress`, `GET /api/playback/me/continue-watching`, `/ver/:contentId` | `assertProgressPayload`; `playback_progress` | playback service, player, continuar a ver | `playback_progress` | `requireAuth`; progresso por `req.user.id` | `BK-MF2-06`, `BK-MF2-07`, `BK-MF2-08` |
| `BK-MF2-06` | `catalog.validation.js`, `users/*`, `media-preferences.service.js`, `playback.service.js`, `playback.controller.js`, `playback.routes.js`, `playbackApi.js`, `PlaybackPage.jsx` | `assertMediaOptions`, `assertParentalSettings`, `getMediaPreferences`, `saveMediaPreferences` | `PATCH /api/users/me/parental`, `GET/PUT /api/playback/preferences` | parental 0..18; `tracks.subtitles`, `tracks.audio.src`, `qualityOptions`, preferencias | media preferences service; player com selects, `TextTrack.mode` e troca de fonte | `users.parentalMaxAgeRating`, `media_preferences`, campos media em `contents` | `requireAuth`; parental validado no backend | `BK-MF2-07`, `BK-MF2-08`, `BK-MF6-05` |
| `BK-MF2-07` | `library.validation.js`, `library.service.js`, `library.controller.js`, `library.routes.js`, `libraryApi.js`, `LibraryActions.jsx`, `MyLibraryPage.jsx` | `libraryRouter`, `libraryApi`, `ensureLibraryIndexes` | `GET/PUT/DELETE /api/me/favorites`, `GET/PUT/DELETE /api/me/watchlist`, `GET /api/me/history`, `/biblioteca` | `assertListType`, `asObjectId`; `user_content_lists` | library service, acoes no detalhe, biblioteca | `user_content_lists`; leitura de `playback_progress` | `requireAuth`; listas por `req.user.id` | `BK-MF2-08`, `BK-MF3-01`, `BK-MF3-05` |
| `BK-MF2-08` | `package.json`, `playwright.config.js`, `seed-mf2-e2e.js`, `AuthForms.jsx`, `mf2-flow.spec.js`, `frontend/public/media/piloto.mp4` | `@playwright/test`, seed restrito, seletores estaveis | `npm run e2e:mf2`; `/login`, `/catalogo`, `/catalogo/piloto-faithflix`, `/ver/:contentId`, `/biblioteca` | fixture E2E `mf2-e2e`; medicoes `RNF07 catalogLoadMs`/`RNF08 playStartMs` | Playwright config/test | fixture em `users`, `contents`; limpeza por email/userId/tag | login real por cookie; fluxo autenticado | `BK-MF3-01`, Gate S4 |

## Confirmacao de integracao

- Nao foram encontrados endpoints duplicados para a mesma acao dentro da `MF2`.
- Nao foram encontrados dois modelos diferentes para a mesma entidade principal.
- A sequencia `auth -> users -> catalog -> detail -> playback -> library -> E2E` esta documentada.
- Os riscos de integracao identificados na auditoria anterior foram tratados nos BKs editados.

## Drift documental encontrado

- A versao anterior deste relatorio reclassificou `MF2` como `5 OK`, `2 PARCIAL` e `1 CRITICO`; esta execucao voltou a fechar `MF2` como `8 OK`.
- `MATRIZ-RF-RNF-POR-BK.md` existe apenas como alias `DEPRECATED`; a fonte ativa e `MATRIZ-CANONICA-BK.md`.
- `RNF07` fala em pagina inicial/catalogo principal; `BK-MF2-08` foi alinhado para medir `/catalogo`.
- O codigo real em `backend/` e `frontend/` continua mais proximo da fundacao `MF1`; nao deve ser tratado como app `MF2` implementada.
- BKs posteriores diretos de `MF3`, `MF4` e `MF5` ainda sao guias genericos e nao provam, por si, que os contratos de `MF2` estejam suficientes.

## Ordem aplicada de correcao

1. `BK-MF2-03` (`PARCIAL`): completado `RF10` e validacao de taxonomias.
2. `BK-MF2-06` (`PARCIAL`): completada aplicacao real de legendas/audio.
3. `BK-MF2-08` (`CRITICO`): corrigidos seed, seletores e medicao de `RNF07`.

## Validacao executada

```bash
rg -n "StudyFlow|sala de estudo|turma|disciplina|material oficial|aluno inscrito|IA da sala|IA da turma|hidrata|pos-auditoria|scaffold parcial|roteiro generico|conversa interna|codigo ainda nao corrigido|snippet solto|exemplo simplificado|implementar depois|quando aplicavel|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|solucao parcial|payload: unknown|as any" docs/planificacao/guias-bk/MF2/*.md
git diff --check
bash scripts/validate-planificacao.sh
```

| Comando | Estado | Resultado |
| --- | --- | --- |
| Varredura textual MF2 | `OK` | Sem ocorrencias nos BKs de `MF2/`; `rg` terminou com codigo `1`, que significa ausencia de matches. |
| `git diff --check` | `OK` | Sem erros de whitespace. |
| `bash scripts/validate-planificacao.sh` | `BLOQUEADO` | O script tentou abrir `../scripts/validate_planificacao_canonica.py`, mas esse ficheiro nao existe no workspace atual. Erro: `[Errno 2] No such file or directory`. |

## Changelog

- `2026-05-31`: Relatorio atualizado em modo `corrigir_apenas`; editados apenas `BK-MF2-03`, `BK-MF2-06` e `BK-MF2-08`; resultado final `8 OK`, `0 PARCIAL`, `0 CRITICO`.
