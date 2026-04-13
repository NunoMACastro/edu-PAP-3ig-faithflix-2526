# Planificacao - Faithstream

`last_updated`: `2026-04-13`

## O que esta pasta contem

Este diretorio agrega a planificacao operacional do projeto: backlog, rastreabilidade de requisitos, plano de sprints, guias BK e regras de validacao.

## Mapa rapido

- `PLANO-IMPLEMENTACAO-TOTAL.md`: plano macro (`MF0..MF8`) e alinhamento de execucao.
- `DISTRIBUICAO-RESPONSABILIDADES.md`: ownership, handoff e pairing.
- `QUALITY-SCORE-97.md`: contrato de scoring e criterios PASS/FAIL.
- `backlogs/BACKLOG-MVP.md`: backlog oficial (`BK-*`) com owner/prioridade/dependencias.
- `backlogs/MATRIZ-RF-RNF-POR-BK.md`: rastreabilidade requisito -> BK -> evidencia.
- `backlogs/MF-VIEWS.md`: vista por macrofases (derivada da ordem canonica).
- `sprints/PLANO-SPRINTS.md`: calendario e ordem temporal oficial.
- `sprints/RELATORIO-GATES-S4-S8-S12.md`: baseline + execucao real dos gates.
- `guias-bk/README.md`: indice e contrato dos guias BK.

## Ordem recomendada de leitura

1. `docs/RF.md`
2. `docs/RNF.md`
3. `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
4. `docs/planificacao/backlogs/BACKLOG-MVP.md`
5. `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
6. `docs/planificacao/sprints/PLANO-SPRINTS.md`
7. `docs/planificacao/backlogs/MF-VIEWS.md`
8. `docs/planificacao/guias-bk/README.md`
9. `docs/planificacao/sprints/RELATORIO-GATES-S4-S8-S12.md`
10. `docs/planificacao/QUALITY-SCORE-97.md`

## Regras canonicas

- Requisitos: `docs/RF.md` e `docs/RNF.md`.
- Estado operacional de BK: `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Ordem temporal de execucao: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- `MF-VIEWS.md` e `Proximo BK recomendado` dos guias BK sao derivados e nao podem divergir da ordem canonica.
- BK terminal da sequencia canonica: `BK-MF8-05`, com `Proximo BK recomendado = -`.

## Validacao

- Comando oficial: `bash scripts/validate-planificacao.sh`
- Fecho de gate (`S4/S8/S12`): script em `PASS` + validacao humana do orientador + registo no relatorio de gates.
