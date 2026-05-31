# Relatorio de auditoria BK - MF2

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF2`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF2.md`
- `macro_fase_auditada`: `MF2`
- `data`: `2026-05-31`
- `modo`: `corrigir_apenas`
- `status`: `bks_corrigidos_validador_bloqueado_por_script_ausente`

## Objetivo

Corrigir apenas os guias BK da `MF2` classificados como `PARCIAL` ou `CRITICO` na reauditoria anterior, sem alterar codigo real da aplicacao.

A execucao incidiu sobre os oito guias de `docs/planificacao/guias-bk/MF2/`, porque a reauditoria tinha identificado `3 PARCIAL` e `5 CRITICO`.

## Resultado global

| Momento | Fonte | BK analisados | `OK` | `PARCIAL` | `CRITICO` |
| --- | --- | ---: | ---: | ---: | ---: |
| Antes desta correcao | Reauditoria MF2 anterior | 8 | 0 | 3 | 5 |
| Depois desta correcao | Guias MF2 editados | 8 | 8 | 0 | 0 |

## BKs editados nesta execucao

| BK | Estado anterior | Estado depois | Correcao principal |
| --- | --- | --- | --- |
| `BK-MF2-01` | `CRITICO` | `OK` | Sessao alinhada com `req.user`, cookie `HttpOnly`, MongoDB, auth real e reset de password. |
| `BK-MF2-02` | `CRITICO` | `OK` | Perfil, roles, `requireAuth`, `requireRole`, script de primeiro admin e rotas frontend fechadas. |
| `BK-MF2-03` | `PARCIAL` | `OK` | Catalogo, taxonomias, revisoes, roles de gestao, indices e UI admin completados. |
| `BK-MF2-04` | `PARCIAL` | `OK` | Detalhe publico por `id` ou `slug`, rota `/catalogo/:idOrSlug` e handoff para `/ver/:contentId`. |
| `BK-MF2-05` | `PARCIAL` | `OK` | Player, progresso, ownership e `GET /api/playback/me/continue-watching` com UI visivel. |
| `BK-MF2-06` | `CRITICO` | `OK` | Validacao completa de media, parental no backend, preferencias e qualidade sem URL inventada. |
| `BK-MF2-07` | `CRITICO` | `OK` | Favoritos, watchlist, historico, `apiClient.del` e rota `/biblioteca`. |
| `BK-MF2-08` | `CRITICO` | `OK` | Playwright E2E alinhado com `/login`, `/catalogo`, `/ver` e `/biblioteca`. |

## Mapa de integracao da MF2 corrigida

| BK | Entrega documentada | Endpoints/rotas principais | Dados persistidos | Dependentes |
| --- | --- | --- | --- | --- |
| `BK-MF2-01` | Auth, sessoes, reset de password, `req.user` | `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/session/me`, `/api/session/logout`, `/login` | `users`, `sessions`, `password_reset_tokens` | `BK-MF2-02`, `BK-MF4`, `BK-MF5` |
| `BK-MF2-02` | Perfil e roles base | `/api/users/me`, `/api/users`, `/api/users/:id/role`, `/conta`, `/admin/utilizadores` | `users.name`, `users.role` | `BK-MF2-03`, `BK-MF5-04` |
| `BK-MF2-03` | CRUD de catalogo e taxonomias | `/api/catalog`, `/api/catalog/admin`, `/api/catalog/:id/status`, `/api/catalog/taxonomies`, `/catalogo`, `/admin/catalogo` | `contents`, `taxonomies`, `content_revisions` | `BK-MF2-04`, `BK-MF3-03` |
| `BK-MF2-04` | Detalhe de conteudo | `/api/catalog/:idOrSlug`, `/catalogo/:idOrSlug` | leitura de `contents` publicados | `BK-MF2-05`, `BK-MF2-07`, `BK-MF2-08` |
| `BK-MF2-05` | Reproducao e continuar a ver | `/api/playback/:contentId`, `/api/playback/:contentId/progress`, `/api/playback/me/continue-watching`, `/ver/:contentId` | `playback_progress` | `BK-MF2-06`, `BK-MF2-07`, `BK-MF2-08` |
| `BK-MF2-06` | Legendas, audio, qualidade e parental | `/api/playback/preferences`, `/api/users/me/parental` | `media_preferences`, `users.parentalMaxAgeRating`, campos media em `contents` | `BK-MF2-07`, `BK-MF2-08` |
| `BK-MF2-07` | Favoritos, watchlist e historico | `/api/me/favorites`, `/api/me/watchlist`, `/api/me/history`, `/biblioteca` | `user_content_lists`; leitura de `playback_progress` | `BK-MF2-08`, `BK-MF3` |
| `BK-MF2-08` | E2E do fluxo principal | `npm run e2e:mf2` | seed temporario para E2E | `BK-MF3-01` |

## Decisoes de correcao

- Mantido o scope documental: nao foram editados ficheiros reais de `backend/` ou `frontend/`.
- Mantido o header canonico de cada BK.
- Uniformizadas as rotas frontend para portugues: `/catalogo`, `/ver/:contentId`, `/biblioteca`.
- Uniformizado o contrato de sessao para `req.user`.
- Mantido `playback_progress` como fonte unica de progresso, continuar a ver e historico.
- Corrigido o cliente frontend de remocao para `apiClient.del`.
- Reescritos os passos com objetivo, ficheiros, instrucoes, codigo, explicacao, validacao e risco.

## Validacao executada

```bash
rg -n "StudyFlow|sala de estudo|turma|disciplina|material oficial|aluno inscrito|IA da sala|IA da turma|hidrata|pos-auditoria|scaffold parcial|roteiro generico|conversa interna|codigo ainda nao corrigido|snippet solto|exemplo simplificado|implementar depois|quando aplicavel|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|solucao parcial|payload: unknown|as any" docs/planificacao/guias-bk/MF2/*.md
git diff --check
bash scripts/validate-planificacao.sh
```

Resultado:

| Comando | Estado | Observacao |
| --- | --- | --- |
| Varredura textual MF2 | `OK` | Sem ocorrencias nos BKs de `MF2/`. O `rg` terminou com codigo `1`, que neste caso significa ausencia de matches. |
| `git diff --check` | `OK` | Sem whitespace errors. |
| `bash scripts/validate-planificacao.sh` | `BLOQUEADO` | O script tenta abrir `../scripts/validate_planificacao_canonica.py`, mas esse ficheiro nao existe no workspace atual. |

## Estado final esperado

Com as correcoes documentais aplicadas, a `MF2` passa a ter uma sequencia implementavel de BKs para o MVP de streaming:

1. autenticacao real;
2. perfil e roles;
3. catalogo;
4. detalhe;
5. player e progresso;
6. preferencias media e parental;
7. biblioteca pessoal;
8. E2E do fluxo principal.
