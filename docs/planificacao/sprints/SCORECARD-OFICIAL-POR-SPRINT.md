# SCORECARD-OFICIAL-POR-SPRINT

## Header

- `doc_id`: `SCORECARD-OFICIAL-POR-SPRINT`
- `path`: `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-14`

## Objetivo

Normalizar avaliacao documental por sprint com pesos oficiais OPSA adaptados ao contexto PAP do FaithFlix, sem aumentar burocracia de execucao.

## Pesos oficiais por sprint (total = 100)

| Dimensao | Peso | Regra de avaliacao |
| --- | --- | --- |
| Rastreabilidade backlog <-> matriz | `25` | BKs da sprint com mapeamento valido em matriz e sem gaps |
| Conformidade dos guias BK | `20` | Guias da sprint com bloco pedagogico + bloco operacional completos |
| Evidencia minima e negativos | `20` | `pr/proof/neg` presentes e politica de negativos cumprida |
| Cadencia e carga realista | `15` | Carga de sprint <= 11 pontos e sem backlog oculto |
| Qualidade tecnica e regressao | `10` | Smoke e integracao sem blocker aberto |
| Governanca e handoff | `10` | Checkpoints docentes + handoff para proximo BK registados |
| **Total** | **`100`** | **Aprovacao documental por sprint** |

## Formula

- `score_sprint = soma(dimensao_i_validada * peso_i)`
- Cada dimensao recebe `0` (falhou), `0.5` (parcial) ou `1` (cumpriu).
- `score_sprint` minimo recomendado por sprint: `>= 85`.

## Escala de decisao

- `>= 97`: excelente, pronto para gate sem ressalvas.
- `90..96`: bom, gate com pequenas correcoes.
- `85..89`: aceitavel com remediacao obrigatoria na sprint seguinte.
- `< 85`: risco elevado, gate em `FAIL` ate fecho de acao corretiva.

## Registo oficial por sprint

| Sprint | Rastreabilidade (25) | Guias (20) | Evidencia+Neg (20) | Cadencia (15) | Qualidade (10) | Governanca (10) | Score final | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Sprint 1` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |
| `Sprint 2` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |
| `Sprint 3` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |
| `Sprint 4` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |
| `Sprint 5` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |
| `Sprint 6` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |
| `Sprint 7` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |
| `Sprint 8` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |
| `Sprint 9` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |
| `Sprint 10` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |
| `Sprint 11` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |
| `Sprint 12` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` | `PENDENTE` |

## Regras de uso rapido

1. Preencher score no fecho de cada sprint (sexta-feira).
2. Consolidar resultados de `S1..S4`, `S5..S8` e `S9..S12` no relatorio de gates.
3. Qualquer sprint `< 85` obriga plano de remediacao na sprint seguinte.
4. Meta final do projeto: score documental global `>= 97/100` no gate `S12`.

## Changelog

- `2026-04-14`: criado scorecard oficial por sprint com pesos OPSA adaptados ao FaithFlix.
