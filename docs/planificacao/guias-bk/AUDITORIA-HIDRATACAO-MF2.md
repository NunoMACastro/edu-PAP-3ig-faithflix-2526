# Relatorio de auditoria e correcao BK - MF2

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF2`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF2.md`
- `macro_fase_auditada`: `MF2`
- `data`: `2026-05-31`
- `modo`: `corrigir_apenas`
- `status`: `correcao_executada_em_bks_mf2_criticos`

## Objetivo

Executar a correcao dos guias BK da `MF2` que tinham sido classificados como `CRITICO` na auditoria anterior, mantendo o trabalho limitado a documentacao de planificacao.

Nao foram alterados ficheiros da aplicacao real. As alteracoes ficaram concentradas em:

- `docs/planificacao/guias-bk/MF2/*.md`
- `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF2.md`

## Fontes consultadas

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
- guias `MF0`, `MF1` e `MF2`
- BKs posteriores com dependencia direta de `MF2`: `BK-MF3-01`, `BK-MF3-03`, `BK-MF3-05`, `BK-MF4-01`, `BK-MF5-01`, `BK-MF5-03`, `BK-MF5-04`
- relatorios `AUDITORIA-HIDRATACAO-MF0.md` e `AUDITORIA-HIDRATACAO-MF1.md`

## Documentos obrigatorios em falta

Nao foram encontrados documentos obrigatorios em falta.

Notas:

- `MATRIZ-RF-RNF-POR-BK.md` existe como alias deprecated para `MATRIZ-CANONICA-BK.md`.
- `SCORECARD-OFICIAL-POR-SPRINT.md` existe como alias deprecated para `SCORECARD-SPRINTS.md`.

## Resultado global

| Momento | BK analisados | `OK` | `PARCIAL` | `CRITICO` |
| --- | ---: | ---: | ---: | ---: |
| Antes de correcao | 8 | 0 | 0 | 8 |
| Depois desta execucao | 8 | 8 | 0 | 0 |

## BKs corrigidos

| BK | Antes | Depois | Sintese da correcao |
| --- | --- | --- | --- |
| `BK-MF2-01` | `CRITICO` | `OK` | Reescrito com registo, login, recuperacao de password, MongoDB, hashing, sessoes por cookie HttpOnly, frontend, negativos e handoff para perfil. |
| `BK-MF2-02` | `CRITICO` | `OK` | Reescrito com perfil, roles `user/moderator/admin`, middlewares de autorizacao, endpoint admin, script de promocao e UI de conta. |
| `BK-MF2-03` | `CRITICO` | `OK` | Reescrito com modelo `Content`, taxonomias, estados `draft/published/archived`, revisoes, guards e UI admin. |
| `BK-MF2-04` | `CRITICO` | `OK` | Reescrito com endpoint de detalhe publicado, pagina React, estados de carregamento/erro e handoff para player. |
| `BK-MF2-05` | `CRITICO` | `OK` | Reescrito com player MVP, progresso por `userId + contentId`, retoma, endpoint de continuar a ver e negativos. |
| `BK-MF2-06` | `CRITICO` | `OK` | Reescrito com tracks de legenda/audio, opcoes de qualidade, preferencias por utilizador e controlo parental backend. |
| `BK-MF2-07` | `CRITICO` | `OK` | Reescrito com favoritos, watchlist, historico a partir de progresso, ownership, idempotencia e UI de biblioteca. |
| `BK-MF2-08` | `CRITICO` | `OK` | Reescrito com Playwright, seed E2E, media de teste, medicoes `RNF07/RNF08`, negativos e evidence. |

## Classificacao final por BK

| BK | Guia | Classificacao final | Motivo |
| --- | --- | --- | --- |
| `BK-MF2-01` | `docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md` | `OK` | Define contratos, ficheiros, endpoints, services, controllers, UI, seguranca e validacao. |
| `BK-MF2-02` | `docs/planificacao/guias-bk/MF2/BK-MF2-02-edicao-perfil-papeis-base.md` | `OK` | Define ownership de perfil, roles, guards, endpoints admin e negativos de escalada de privilegio. |
| `BK-MF2-03` | `docs/planificacao/guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md` | `OK` | Define dominio de catalogo, taxonomias, publicacao, revisoes e permissao por role. |
| `BK-MF2-04` | `docs/planificacao/guias-bk/MF2/BK-MF2-04-pagina-detalhe-conteudo.md` | `OK` | Define backend/frontend do detalhe e regras para conteudo nao publicado. |
| `BK-MF2-05` | `docs/planificacao/guias-bk/MF2/BK-MF2-05-reproducao-continuar-a-ver.md` | `OK` | Define player, progresso persistido, retoma e separacao honesta do escopo MVP. |
| `BK-MF2-06` | `docs/planificacao/guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md` | `OK` | Define media tracks, qualidade, preferencias e parental no backend. |
| `BK-MF2-07` | `docs/planificacao/guias-bk/MF2/BK-MF2-07-favoritos-watchlist-historico.md` | `OK` | Define listas pessoais, historico reutilizando `playback_progress`, endpoints e UI. |
| `BK-MF2-08` | `docs/planificacao/guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md` | `OK` | Define E2E real, seed, comandos, metricas, evidence e criterios RNF. |

## Mapa de integracao apos correcao

| BK | Entrega tecnica documentada | Dependentes desbloqueados |
| --- | --- | --- |
| `BK-MF2-01` | `users`, `sessions`, `password_reset_tokens`, `/api/auth/*`, `/api/session/*`, frontend auth. | `BK-MF2-02`, `BK-MF4-01`, `BK-MF5-01`, `BK-MF5-03` |
| `BK-MF2-02` | `requireAuth`, `requireRole`, perfil proprio, roles admin/moderator/user. | `BK-MF2-03`, `BK-MF5-04` |
| `BK-MF2-03` | `contents`, `taxonomies`, `content_revisions`, estados de publicacao, admin catalog. | `BK-MF2-04`, `BK-MF3-03` |
| `BK-MF2-04` | `/api/catalog/:idOrSlug`, `ContentDetailPage`, CTA para player. | `BK-MF2-05` |
| `BK-MF2-05` | `/api/playback/:contentId`, progresso, player, continuar a ver. | `BK-MF2-06`, `BK-MF2-07` |
| `BK-MF2-06` | tracks, qualidade, preferencias, parental por utilizador. | `BK-MF2-07` |
| `BK-MF2-07` | favoritos, watchlist, historico pessoal, biblioteca. | `BK-MF2-08`, `BK-MF3-01`, `BK-MF3-05` |
| `BK-MF2-08` | seed E2E, Playwright, fluxo completo e metricas RNF. | `BK-MF3-01` |

## Decisoes e notas tecnicas

- A documentacao continua alinhada com a decisao pedagogica da `MF1`: frontend React + Vite com `fetch`, apesar de `RNF.md` mencionar Next.js/Axios como recomendacao de stack.
- `mongodb` foi documentado como dependencia necessaria em `BK-MF2-01`, porque a MF2 e a primeira macrofase com persistencia real de utilizadores, catalogo e progresso.
- `@playwright/test` foi documentado apenas como devDependency em `BK-MF2-08`, justificada por testes reais de browser e metricas `RNF07/RNF08`.
- O reset de password foi descrito para ambiente PAP sem servidor de email: o token e devolvido na resposta para demonstracao controlada. Em producao, esse token deve ser enviado por email.
- O player foi limitado de forma explicita ao MVP com `media.playbackUrl`; CDN, DRM e transcodificacao nao foram prometidos.

## Validacoes executadas

### Varredura textual MF2

Comando executado:

```bash
rg -n "StudyFlow|sala de estudo|turma|disciplina|material oficial|aluno inscrito|IA da sala|IA da turma|hidrata|pos-auditoria|scaffold parcial|roteiro generico|conversa interna|codigo ainda nao corrigido|snippet solto|exemplo simplificado|implementar depois|quando aplicavel|helpers chamados|substitu(ir|i)r? mocks|pseudo-codigo|solucao parcial|payload: unknown|as any" docs/planificacao/guias-bk/MF2/*.md
```

Resultado: sem ocorrencias. O `rg` terminou com codigo `1`, que neste caso significa "sem matches".

### Estrutura obrigatoria

Foi confirmada a presenca, nos oito BKs, de:

- `## Header`
- `## Bloco pedagogico (obrigatorio)`
- `## Bloco operacional (obrigatorio)`
- `### Pre-condicoes`
- `### Guia de execucao (passo-a-passo)`
- passos lineares `### Passo N - ...`
- `## Snippet tecnico aplicavel`
- `## Criterios de aceite (mensuraveis)`
- `## Validacao final`
- `## Evidence para PR/defesa`
- `## Handoff`
- `## Changelog`

### `git diff --check`

Comando executado:

```bash
git diff --check
```

Resultado: passou sem output.

### `scripts/validate-planificacao.sh`

Comando executado:

```bash
bash scripts/validate-planificacao.sh
```

Resultado: falhou por dependencia de ficheiro externo inexistente:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/faithflix/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

Isto parece ser um problema do script de validacao, que procura `../scripts/validate_planificacao_canonica.py` fora da raiz atual do repositorio.

## Risco residual

- As alteracoes sao documentais: os guias agora indicam implementacoes completas, mas a aplicacao real nao foi alterada nesta execucao.
- O repositorio real continua a ter drift conhecido entre a base existente e a base documentada pela `MF1`; esse drift deve ser tratado numa tarefa de implementacao, nao nesta correcao documental.
- O validador canonico nao foi concluido por falta de ficheiro chamado pelo script.

## Conclusao

A `MF2` passou de 8 BKs `CRITICO` para 8 BKs `OK` no ambito documental pedido. Os guias corrigidos passam a ter contratos, ficheiros, endpoints, modelos, passos executaveis, validacoes, negativos, evidence e handoff entre BKs.
