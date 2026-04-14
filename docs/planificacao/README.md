# Planificacao - FaithFlix

`last_updated`: `2026-04-14`

## O que esta pasta contem

Este diretorio agrega a planificacao operacional do projeto: backlog, rastreabilidade de requisitos, plano de sprints, guias BK e regras de validacao.

## Mapa rapido

- `PLANO-IMPLEMENTACAO-TOTAL.md`: plano macro (`MF0..MF8`) e alinhamento de execucao.
- `DISTRIBUICAO-RESPONSABILIDADES.md`: ownership, handoff e pairing.
- `backlogs/BACKLOG-MVP.md`: backlog oficial (`BK-*`) com owner/prioridade/dependencias.
- `backlogs/MATRIZ-RF-RNF-POR-BK.md`: rastreabilidade requisito -> BK -> evidencia.
- `backlogs/MF-VIEWS.md`: vista por macrofases (derivada da ordem canonica).
- `sprints/PLANO-SPRINTS.md`: calendario e ordem temporal oficial.
- `sprints/SCORECARD-OFICIAL-POR-SPRINT.md`: scorecard oficial por sprint (pesos e formula).
- `sprints/GUIAO-DOCENTE-SEMANAL.md`: guiao semanal do orientador (checkpoints e remediacao).
- `sprints/RELATORIO-GATES-S4-S8-S12.md`: baseline + execucao real dos gates.
- `guias-bk/README.md`: indice e contrato dos guias BK.

## Hierarquia canonica de verdade documental (OPSA adaptada ao FaithFlix)

### Nivel 0 - Requisitos (fonte normativa)

- `docs/RF.md`
- `docs/RNF.md`

### Nivel 1 - Planeamento canonico de execucao

- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`

### Nivel 2 - Governanca e rastreabilidade

- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`

### Nivel 3 - Guias de implementacao por BK

- `docs/planificacao/guias-bk/MF*/BK-MF*.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`

### Nivel 4 - Auditoria de gates e conformidade

- `docs/planificacao/sprints/RELATORIO-GATES-S4-S8-S12.md`
- `docs/planificacao/RELATORIO-CONFORMIDADE-DOCUMENTAL-OPSA-FAITHFLIX.md`

### Regra de precedencia obrigatoria

- Em caso de conflito, prevalece sempre o nivel mais alto.
- `MF-VIEWS.md` e `Proximo BK recomendado` dos guias BK sao artefactos derivados e nao podem divergir dos niveis 1 e 2.
- Alteracoes em backlog/sprints exigem revalidacao imediata da matriz, guias, scorecard e relatorio de gates.

## Ordem recomendada de leitura

1. `docs/RF.md`
2. `docs/RNF.md`
3. `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
4. `docs/planificacao/backlogs/BACKLOG-MVP.md`
5. `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
6. `docs/planificacao/sprints/PLANO-SPRINTS.md`
7. `docs/planificacao/backlogs/MF-VIEWS.md`
8. `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
9. `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
10. `docs/planificacao/guias-bk/README.md`
11. `docs/planificacao/sprints/RELATORIO-GATES-S4-S8-S12.md`

## Regras canonicas

- Requisitos: `docs/RF.md` e `docs/RNF.md`.
- Estado operacional de BK: `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Ordem temporal de execucao: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Governanca semanal e score oficial: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md` e `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`.
- `MF-VIEWS.md` e `Proximo BK recomendado` dos guias BK sao derivados e nao podem divergir da ordem canonica.
- BK terminal da sequencia canonica: `BK-MF8-05`, com `Proximo BK recomendado = -`.

## Validacao

- Comando oficial: `bash scripts/validate-planificacao.sh`
- Fecho de gate (`S4/S8/S12`): script em `PASS` + validacao humana do orientador + registo no relatorio de gates.
