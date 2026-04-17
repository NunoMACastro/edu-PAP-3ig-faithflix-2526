# SCORECARD-SPRINTS

## Header

- `doc_id`: `SCORECARD-SPRINTS`
- `path`: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-17`

## Objetivo

Padronizar a avaliacao por sprint com o contrato canonicamente alinhado entre FaithFlix e OPSA.

## Contrato do scorecard

Campos obrigatorios por sprint:
`cobertura`, `coerencia`, `pedagogia_guidance_step_by_step`, `adequacao_12o`, `governanca`, `carga_planeada_pontos`, `carga_real_pontos`, `desvio_pontos`, `risco_semaforo`, `acao_corretiva`.

## Pesos oficiais (0-100)

| Criterio | Peso |
| --- | --- |
| Cobertura/rastreabilidade | 25 |
| Coerencia documental | 20 |
| Pedagogia/guidance/step-by-step | 25 |
| Adequacao ao 12o | 20 |
| Governanca/avaliacao | 10 |
| **Total** | **100** |

## Formula

- `score_sprint = soma(criterio_i * peso_i)`.
- Cada criterio recebe `0` (falhou), `0.5` (parcial) ou `1` (cumpriu).
- `score_sprint` minimo recomendado por sprint: `>= 85`.

## Escala de decisao

- `>= 97`: excelente, pronto para gate sem ressalvas.
- `90..96`: bom, gate com pequenas correcoes.
- `85..89`: aceitavel com remediacao obrigatoria na sprint seguinte.
- `< 85`: risco elevado, gate em `FAIL` ate fecho de acao corretiva.

## Scorecard por sprint

| sprint | cobertura | coerencia | pedagogia_guidance_step_by_step | adequacao_12o | governanca | carga_planeada_pontos | carga_real_pontos | desvio_pontos | risco_semaforo | acao_corretiva |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S01 | - | - | - | - | - | 11 | - | - | Verde | - |
| S02 | - | - | - | - | - | 10 | - | - | Verde | - |
| S03 | - | - | - | - | - | 7 | - | - | Verde | - |
| S04 | - | - | - | - | - | 9 | - | - | Verde | - |
| S05 | - | - | - | - | - | 8 | - | - | Verde | - |
| S06 | - | - | - | - | - | 4 | - | - | Verde | - |
| S07 | - | - | - | - | - | 7 | - | - | Verde | - |
| S08 | - | - | - | - | - | 9 | - | - | Verde | - |
| S09 | - | - | - | - | - | 10 | - | - | Verde | - |
| S10 | - | - | - | - | - | 6 | - | - | Verde | - |
| S11 | - | - | - | - | - | 11 | - | - | Verde | - |
| S12 | - | - | - | - | - | 9 | - | - | Verde | - |

## Regras de semaforo

- `Verde`: desvio absoluto <= 2 pontos e sem bloqueio critico.
- `Amarelo`: desvio entre 3 e 4 pontos ou bloqueio >48h em BK `P1/P2`.
- `Vermelho`: desvio >= 5 pontos, bloqueio em BK `P0` ou quebra de rastreabilidade.

## Acao automatica

- `Verde`: manter plano.
- `Amarelo`: replanear dentro da sprint e reforcar checkpoint docente.
- `Vermelho`: congelar `Reforco`, priorizar `Core` e abrir decisao do orientador.

## Changelog

- `2026-04-14`: scorecard alinhado ao contrato canonicamente unificado (5 criterios, 25/20/25/20/10).
- `2026-04-17`: cargas planeadas sincronizadas com `PLANO-SPRINTS.md` e com a soma real de pontos dos BK por sprint.
