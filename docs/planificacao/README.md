# Planificacao - FaithFlix

`last_updated`: `2026-04-14`

## Objetivo

Centralizar a planificacao executavel do FaithFlix com contrato canonico alinhado ao modelo OPSA, sem alterar o numero de BKs.

## Mapa rapido

- `PLANO-IMPLEMENTACAO-TOTAL.md`: plano macro (`MF0..MF8`) e alinhamento de execucao.
- `DISTRIBUICAO-RESPONSABILIDADES.md`: ownership, handoff e pairing.
- `backlogs/BACKLOG-MVP.md`: backlog oficial (`BK-*`) com owner/prioridade/dependencias/rf_rnf.
- `backlogs/MATRIZ-CANONICA-BK.md`: rastreabilidade requisito -> BK -> evidencia.
- `backlogs/MF-VIEWS.md`: vista por macrofases (derivada da ordem canonica).
- `sprints/PLANO-SPRINTS.md`: calendario e ordem temporal oficial.
- `sprints/SCORECARD-SPRINTS.md`: scorecard oficial por sprint (25/20/25/20/10).
- `sprints/GUIAO-DOCENTE-SEMANAL.md`: guiao semanal do orientador (checkpoints e remediacao).
- `guias-bk/README.md`: indice e contrato dos guias BK.

## Hierarquia canonica de verdade documental

### Nivel 0 - Requisitos (fonte normativa)

- `docs/RF.md`
- `docs/RNF.md`

### Nivel 1 - Planeamento canonico de execucao

- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`

### Nivel 2 - Governanca e rastreabilidade

- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`

### Nivel 3 - Guias de implementacao por BK

- `docs/planificacao/guias-bk/MF*/BK-MF*.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`

### Nivel 4 - Auditoria e fecho

- `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`

## Contrato canonico comum (FaithFlix + OPSA)

- Scorecard oficial fixo: `Cobertura/rastreabilidade=25`, `Coerencia documental=20`, `Pedagogia/guidance/step-by-step=25`, `Adequacao ao 12o=20`, `Governanca/avaliacao=10`.
- Header obrigatorio em todos os guias BK:
`bk_id`, `macro`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `fase_documental`, `sprint`, `core_or_reforco`, `proximo_bk`, `guia_path`, `last_updated`.
- Regra de modo: `P0 => Reforco`; `P1/P2 => Core`.
- Regra de rastreabilidade: `Matriz 100% + Backlog 100%` para RF/RNF.

## Regras de precedencia

- Em caso de conflito, prevalece sempre o nivel mais alto.
- `MF-VIEWS.md` e `proximo_bk` dos guias sao artefactos derivados e nao podem divergir dos niveis 1 e 2.
- Alteracoes em backlog/sprints exigem revalidacao imediata da matriz, guias e scorecard.

## Validacao

- Comando oficial: `bash scripts/validate-planificacao.sh`.
- Fecho de gate (`S4/S8/S12`): script em `PASS` + validacao humana do orientador.
