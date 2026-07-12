# Planificacao - FaithFlix

`last_updated`: `2026-07-10`

- `document_status`: `CURRENT`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/RF.md`, `docs/RNF.md`, este índice e os artefactos canónicos abaixo
- `proof_scope`: planeamento ativo dos alunos; o estado da referência docente é registado separadamente

## Objetivo

Centralizar a planificacao executavel do FaithFlix com contrato canonico alinhado ao modelo de avaliacao documental da PAP.

## Baseline de escopo MVP (2026-04-17)

- Backlog ativo final: `66 BK`, distribuído por `13 sprints`.
- Guias ativos: `66`.
- Requisitos ativos: `94` (`RF` + `RNF`).
- Regra aplicada: BK/RF fora de escopo foram removidos integralmente dos requisitos e da planificacao.
- Estado operativo esperado: apenas itens em escopo aparecem nos artefactos canónicos.

## Mapa rapido

- `PLANO-IMPLEMENTACAO-TOTAL.md`: plano macro (`MF0..MF9`) e regras de execucao.
- `DISTRIBUICAO-RESPONSABILIDADES.md`: ownership, handoff e pairing.
- `backlogs/BACKLOG-MVP.md`: backlog oficial (`BK-*`) com owner/prioridade/dependencias/rf_rnf.
- `backlogs/MATRIZ-CANONICA-BK.md`: rastreabilidade requisito -> BK -> evidencia.
- `backlogs/MF-VIEWS.md`: vista por macrofases (derivada da ordem canonica).
- `sprints/PLANO-SPRINTS.md`: calendario e ordem temporal oficial.
- `sprints/SCORECARD-SPRINTS.md`: scorecard oficial por sprint (25/20/25/20/10).
- `sprints/GUIAO-DOCENTE-SEMANAL.md`: guiao semanal do orientador (checkpoints e remediacao).
- `guias-bk/README.md`: indice e contrato dos guias BK.
- `../evidence/README.md`: política de validade, snapshots e lanes de evidence.

## Hierarquia canonica de verdade documental

Quando dois documentos divergem sobre um contrato técnico ou funcional, aplica-se
esta precedência: `RF/RNF` -> `ARCHITECTURE.md` -> matriz canónica ->
guias/runbooks -> evidence. Backlog e sprints determinam owner, estado e ordem
dos BK, mas não podem enfraquecer RF/RNF.

### Nivel 0 - Requisitos (fonte normativa)

- `docs/RF.md`
- `docs/RNF.md`

### Nivel 0.5 - Arquitetura da referência

- `ARCHITECTURE.md`

Este documento descreve a lane `REFERENCE`. Não altera por si só o estado dos
BK dos alunos.

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

## Contrato canonico comum

- Scorecard oficial fixo: `Cobertura/rastreabilidade=25`, `Coerencia documental=20`, `Pedagogia/guidance/step-by-step=25`, `Adequacao ao 12o=20`, `Governanca/avaliacao=10`.
- Header obrigatorio em todos os guias BK:
`bk_id`, `macro`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `fase_documental`, `sprint`, `core_or_reforco`, `proximo_bk`, `guia_path`, `last_updated`.
- Regra de rastreabilidade: `Matriz 100% + Backlog 100%` para RF/RNF ativos.

## Validade, snapshots e lanes

- Guias BK são `STUDENT`: usam `backend/` e `frontend/` e só refletem estados
  dos alunos definidos no backlog.
- Reports e evidence declaram `document_status`, `snapshot_date`,
  `implementation_lane`, `current_authority` e `proof_scope`, conforme
  `docs/evidence/README.md`.
- `real_dev/` identifica exclusivamente a referência docente privada. Uma prova
  dessa lane nunca é prova automática da entrega dos alunos.
- Um report `STUDENT` que compare a referência declara ainda
  `comparison_lane: REFERENCE` e `target_lane: STUDENT`; não reutiliza
  `implementation_lane` para classificar simultaneamente as duas superfícies.
- Contagens antigas, como `60/60`, permanecem apenas em documentos marcados
  `HISTORICAL_SNAPSHOT` ou em entradas de changelog datadas.

## Validacao

- Comando oficial: `bash scripts/validate-planificacao.sh`.
- Fecho de gate (`S4/S8/S12/S13`): script em `PASS` + validacao humana do orientador.
