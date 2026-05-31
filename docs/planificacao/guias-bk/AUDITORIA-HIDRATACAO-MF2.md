# Relatorio de auditoria BK - MF2

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF2`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF2.md`
- `macro_fase_auditada`: `MF2`
- `data`: `2026-05-31`
- `modo`: `corrigir_apenas`
- `status`: `bks_corrigidos_validacao_planificacao_bloqueada`

## Objetivo

Usar o relatorio existente como ponto de partida e corrigir apenas os BKs da `MF2` marcados como `PARCIAL`, sem alterar codigo real da aplicacao.

A execucao incidiu sobre `BK-MF2-02` a `BK-MF2-08`. O `BK-MF2-01` ja estava `OK` e nao foi editado.

## Documentos consultados

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md` (`DEPRECATED`; usado apenas como compatibilidade)
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `docs/planificacao/guias-bk/README.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `GLOSSARIO-TERMOS-TECNICOS-PAP.md`
- BKs de `MF0`, `MF1`, `MF2` e BKs posteriores com dependencia direta de `MF2`
- Relatorios existentes `AUDITORIA-HIDRATACAO-MF0.md`, `AUDITORIA-HIDRATACAO-MF1.md` e `AUDITORIA-HIDRATACAO-MF2.md`

## Resultado global

| Momento | Fonte | BK analisados | `OK` | `PARCIAL` | `CRITICO` |
| --- | --- | ---: | ---: | ---: | ---: |
| Antes desta correcao | Relatorio MF2 existente | 8 | 1 | 7 | 0 |
| Depois desta correcao | Guias MF2 revistos | 8 | 8 | 0 | 0 |

## BKs editados nesta execucao

| BK | Estado anterior | Estado depois | Correcao aplicada |
| --- | --- | --- | --- |
| `BK-MF2-02` | `PARCIAL` | `OK` | Normalizados criterios, evidence, handoff, proximo BK e changelog. |
| `BK-MF2-03` | `PARCIAL` | `OK` | Normalizados criterios, evidence de catalogo/admin, handoff, proximo BK e changelog. |
| `BK-MF2-04` | `PARCIAL` | `OK` | Normalizados criterios, evidence de detalhe, handoff, proximo BK e changelog. |
| `BK-MF2-05` | `PARCIAL` | `OK` | Normalizados criterios, evidence de playback/ownership, handoff, proximo BK e changelog. |
| `BK-MF2-06` | `PARCIAL` | `OK` | Normalizados criterios, evidence de parental/preferencias, handoff, proximo BK e changelog. |
| `BK-MF2-07` | `PARCIAL` | `OK` | Normalizados criterios, evidence de listas/ownership, handoff, proximo BK e changelog. |
| `BK-MF2-08` | `PARCIAL` | `OK` | Normalizados criterios/evidence/handoff/changelog e marcada a dependencia Playwright como `DERIVADO`. |

## Classificacao final por BK

| BK | Estado final | Justificacao |
| --- | --- | --- |
| `BK-MF2-01` | `OK` | Ja cumpria header, passos, codigo integrado, criterios, validacao, evidence, handoff e changelog. |
| `BK-MF2-02` | `OK` | Fecho documental completo e roles/perfil mantidos coerentes com `RF03` e `RF04`. |
| `BK-MF2-03` | `OK` | Fecho documental completo e catalogo/taxonomias mantidos coerentes com `RF06`, `RF07`, `RF09` e `RF10`. |
| `BK-MF2-04` | `OK` | Fecho documental completo e detalhe preparado para player e E2E. |
| `BK-MF2-05` | `OK` | Fecho documental completo e progresso por utilizador documentado com ownership. |
| `BK-MF2-06` | `OK` | Fecho documental completo e regras de parental/preferencias mantidas no backend. |
| `BK-MF2-07` | `OK` | Fecho documental completo e listas pessoais/historico documentados com ownership. |
| `BK-MF2-08` | `OK` | Fecho documental completo e E2E documentado com evidence de `RNF07` e `RNF08`. |

## Lacunas corrigidas

- `BK-MF2-02..08` passaram de `## Criterios de aceitacao` para `## Criterios de aceite (mensuraveis)`.
- `BK-MF2-02..08` receberam `## Evidence para PR/defesa`.
- `BK-MF2-02..08` receberam `## Changelog`.
- `BK-MF2-02..08` receberam `## Proximo BK recomendado`.
- `BK-MF2-02..08` passaram a usar o titulo canonico `## Handoff`.
- `BK-MF2-08` passou a marcar a decisao sobre `@playwright/test` como `DERIVADO`.

## Decisoes tecnicas confirmadas

- `CANONICO`: a `MF2` cobre `RF01..RF18`, com `BK-MF2-08` a validar `RNF07` e `RNF08`.
- `CANONICO`: sessoes autenticadas usam cookie `HttpOnly`, alinhado com `RNF15`.
- `CANONICO`: a base de dados principal do MVP e MongoDB.
- `DERIVADO`: os BKs usam React/Vite e `fetch` via `apiClient` por coerencia com `MF1`, apesar de `RNF.md` sugerir Next.js/Axios como stack possivel.
- `DERIVADO`: `@playwright/test` fica como dependencia de desenvolvimento para validar fluxo E2E real no browser.
- `DERIVADO`: `playback_progress` e a fonte unica para progresso, continuar a ver e historico.

## Mapa de integracao da MF

| BK | Ficheiros editados nesta execucao | Exports/ficheiros da app documentados no BK | Endpoints/rotas documentados | Dados persistidos | Auth/ownership/roles | Dependentes |
| --- | --- | --- | --- | --- | --- | --- |
| `BK-MF2-02` | `BK-MF2-02-edicao-perfil-papeis-base.md` | `requireAuth`, `requireRole`, `userApi`, `AccountPage`, `AdminUsersPage` | `/api/users/me`, `/api/users`, `/api/users/:id/role`, `/conta`, `/admin/utilizadores` | `users.name`, `users.role` | `requireAuth`; `requireRole(["admin"])` | `BK-MF2-03`, `BK-MF5-04` |
| `BK-MF2-03` | `BK-MF2-03-crud-catalogo-taxonomias.md` | `catalogApi`, `CatalogPage`, `AdminCatalogPage`, catalog/taxonomy services | `/api/catalog`, `/api/catalog/admin`, `/api/catalog/:id/status`, `/api/catalog/taxonomies`, `/catalogo`, `/admin/catalogo` | `contents`, `taxonomies`, `content_revisions` | Escrita por `admin/moderator`; leitura publica so de `published` | `BK-MF2-04`, `BK-MF3-03` |
| `BK-MF2-04` | `BK-MF2-04-pagina-detalhe-conteudo.md` | `getPublishedContentDetail`, `getCatalogDetail`, `catalogApi.getDetail`, `ContentDetailPage` | `/api/catalog/:idOrSlug`, `/catalogo/:idOrSlug` | Leitura de `contents` publicados | Nao expoe `draft`/`archived` | `BK-MF2-05`, `BK-MF2-07`, `BK-MF3-04` |
| `BK-MF2-05` | `BK-MF2-05-reproducao-continuar-a-ver.md` | `playbackApi`, `PlaybackPage`, `ContinueWatchingStrip`, playback service/controller/router | `/api/playback/:contentId`, `/api/playback/:contentId/progress`, `/api/playback/me/continue-watching`, `/ver/:contentId` | `playback_progress` | `requireAuth`; progresso por `req.user.id` | `BK-MF2-06`, `BK-MF2-07`, `BK-MF2-08` |
| `BK-MF2-06` | `BK-MF2-06-legendas-audio-parental-e-qualidade.md` | `assertMediaOptions`, `assertParentalSettings`, `media-preferences.service.js`, player atualizado | `/api/playback/preferences`, `/api/users/me/parental` | `media_preferences`, `users.parentalMaxAgeRating`, `tracks`, `qualityOptions` | `requireAuth`; parental validado no backend | `BK-MF2-07`, `BK-MF2-08`, `BK-MF6-05` |
| `BK-MF2-07` | `BK-MF2-07-favoritos-watchlist-historico.md` | `libraryApi`, `LibraryActions`, `MyLibraryPage`, library service/controller/router | `/api/me/favorites`, `/api/me/watchlist`, `/api/me/history`, `/biblioteca` | `user_content_lists`; leitura de `playback_progress` | `requireAuth`; listas e historico por `req.user.id` | `BK-MF2-08`, `BK-MF3-01`, `BK-MF3-05` |
| `BK-MF2-08` | `BK-MF2-08-teste-e2e-fluxo-principal.md` | `playwright.config.js`, `seed-mf2-e2e.js`, `mf2-flow.spec.js` | `npm run e2e:mf2`; `/login`, `/catalogo/piloto-faithflix`, `/ver/:contentId`, `/biblioteca` | Seed temporario em colecoes MF2 | Login real por cookie; fluxo autenticado | `BK-MF3-01`, gate `S4` |

## Confirmacao de integracao

- Nao foram introduzidos endpoints duplicados.
- Nao foram introduzidos schemas/modelos duplicados.
- Os nomes de conceitos mantem a sequencia `auth -> users -> catalog -> playback -> library -> E2E`.
- O frontend continua a chamar endpoints documentados nos BKs.
- Os BKs seguintes declarados em `CONTRATO-CAMPOS-BK.md` continuam a receber os elementos necessarios.

## Drift documental encontrado

- O relatorio anterior a esta correcao marcava `1 OK` e `7 PARCIAL`; depois da correcao, a `MF2` fica com `8 OK`.
- `MATRIZ-RF-RNF-POR-BK.md` existe mas esta marcado como `DEPRECATED`; a fonte canonica pratica e `MATRIZ-CANONICA-BK.md` com `CONTRATO-CAMPOS-BK.md`.
- BKs posteriores com dependencia direta de `MF2` ainda usam guias genericos com pseudo-checklist. Isso fica fora do escopo desta execucao, que corrigiu apenas `MF2`.
- O codigo real em `backend/` e `frontend/` ainda representa fundacao parcial, nao a `MF2` implementada. Esta execucao corrige guias, nao codigo da app.

## Validacao executada

```bash
rg -n "StudyFlow|sala de estudo|turma|disciplina|material oficial|aluno inscrito|IA da sala|IA da turma|hidrata|pos-auditoria|scaffold parcial|roteiro generico|conversa interna|codigo ainda nao corrigido|snippet solto|exemplo simplificado|implementar depois|quando aplicavel|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|solucao parcial|payload: unknown|as any" docs/planificacao/guias-bk/MF2/*.md
git diff --check
bash scripts/validate-planificacao.sh
```

Resultado:

| Comando | Estado | Observacao |
| --- | --- | --- |
| Varredura textual MF2 | `OK` | Sem ocorrencias nos BKs de `MF2/`; `rg` terminou com codigo `1`, que aqui significa ausencia de matches. |
| `git diff --check` | `OK` | Sem whitespace errors. |
| `bash scripts/validate-planificacao.sh` | `BLOQUEADO` | O script tenta abrir `../scripts/validate_planificacao_canonica.py`, mas esse ficheiro nao existe no workspace atual. |

## Estado final esperado

Com esta correcao documental, a `MF2` fica com oito BKs em estado `OK`, prontos para orientar a implementacao incremental de:

1. autenticacao real;
2. perfil e roles;
3. catalogo;
4. detalhe;
5. player e progresso;
6. preferencias media e parental;
7. biblioteca pessoal;
8. E2E do fluxo principal.
