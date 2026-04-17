# Plano de Sprints - MVP FaithFlix

## Header

- `doc_id`: `PLANO-SPRINTS`
- `path`: `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-17`

## Objetivo

Definir cadencia semanal para transformar backlog em entregas incrementais com 4 alunos, mantendo `12 sprints` e reduzindo picos de carga para `<=11` pontos.

## Baseline de escopo MVP (aplicada em 2026-04-17)

- Planeamento alinhado ao backlog final de `55 BK`.
- Itens fora de escopo nao aparecem no calendario ativo de sprints.

## Capacidade recomendada

- `Matheus`: `3 a 4 pontos/semana`
- `Mateus`: `3 a 4 pontos/semana`
- `Davi`: `3 a 4 pontos/semana`
- `Kaue`: `3 a 4 pontos/semana`
- `Nuno`: governance, gate e avaliacao

## Conversao de pontos

- `S = 1`
- `M = 2`
- `L = 3`

## Artefactos oficiais de controlo semanal

- Scorecard oficial por sprint: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
- Guiao docente semanal: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`

## Calendario de 12 sprints

| Sprint      | Foco                              | BKs alvo                                  | Carga alvo |
| ----------- | --------------------------------- | ----------------------------------------- | ---------- |
| `Sprint 1`  | Governance e arranque             | `BK-MF0-01..06`, `BK-MF1-01`, `BK-MF1-02` | `11`       |
| `Sprint 2`  | Fundacao completa                 | `BK-MF1-03..06`, `BK-MF2-01`              | `10`       |
| `Sprint 3`  | Auth + catalogo + detalhe         | `BK-MF2-02..04`                           | `7`        |
| `Sprint 4`  | Player + historico + E2E          | `BK-MF2-05..08`                           | `9`        |
| `Sprint 5`  | Descoberta base                   | `BK-MF3-01..04`                           | `8`        |
| `Sprint 6`  | IA baseline e explicabilidade     | `BK-MF3-05..06`                           | `4`        |
| `Sprint 7`  | Subscricoes e pagamentos          | `BK-MF4-01`, `BK-MF4-02`, `BK-MF4-08`     | `7`        |
| `Sprint 8`  | Pool de associacoes               | `BK-MF4-03..06`                           | `9`        |
| `Sprint 9`  | RGPD e admin base                 | `BK-MF5-01..05`                           | `10`       |
| `Sprint 10` | Integracoes + regressao           | `BK-MF5-06`, `BK-MF6-01..02`              | `6`        |
| `Sprint 11` | Hardening + matrizes de cobertura | `BK-MF6-03..06`, `BK-MF7-01..02`          | `11`       |
| `Sprint 12` | Defesa + buffer + fecho           | `BK-MF7-03..05`, `BK-MF8-01..05`          | `9`        |

> Regra operacional: nenhuma sprint pode ultrapassar `11` pontos.

## Scorecard oficial por sprint (contrato canonico)

| Criterio                        | Peso      |
| ------------------------------- | --------- |
| Cobertura/rastreabilidade       | `25`      |
| Coerencia documental            | `20`      |
| Pedagogia/guidance/step-by-step | `25`      |
| Adequacao ao 12o                | `20`      |
| Governanca/avaliacao            | `10`      |
| **Total**                       | **`100`** |

Regra de uso: score preenchido no fim de cada sprint e consolidado por janela de gate (`S1..S4`, `S5..S8`, `S9..S12`).

## Guiao docente semanal (checkpoints e remediacao)

Checkpoints obrigatorios:

1. Segunda: arranque, risco inicial e ownership.
2. Terca: controlo tecnico intermedio e rastreabilidade.
3. Quarta: decisao de corte e tratamento de blockers.
4. Quinta: pre-gate interno e score preliminar.
5. Sexta: fecho, score final e plano corretivo.

Remediacao minima:

1. Drift documental: corrigir em `24h`.
2. BK `P0` atrasado ate quarta: cortar `P2` e reforcar pairing em `48h`.
3. Score de sprint `< 85`: plano de remediacao obrigatorio na sprint seguinte.

## Step-by-step semanal

### Segunda

1. Revisar sprint anterior.
2. Confirmar BKs por prioridade.
3. Fechar sprint goal.
4. Atribuir dono unico por BK.

### Terca e Quarta

1. Implementar tarefas nucleares.
2. Integrar blocos entre owners.
3. Atualizar estado dos BKs.
4. Registar impedimentos.

### Quinta

1. Executar testes de integracao.
2. Corrigir regressao.
3. Preparar evidencias.
4. Consolidar status da sprint.

### Sexta

1. Fazer demo funcional.
2. Validar criterios com Nuno.
3. Fechar BKs em `DONE`.
4. Fazer retro curta (3 melhorias).

## Regras de replaneamento

1. BK `P0` nao fechado regressa ao topo da sprint seguinte.
2. Surgindo blocker critico, cortar `P2` no mesmo sprint.
3. Se cair capacidade, priorizar estabilidade sobre volume.
4. Scope cuts finais sao decididos por Nuno em gate.
5. Sempre que uma sprint exceder `11` pontos, redistribuir BK para sprint seguinte no mesmo macro-bloco.

## Gates obrigatorios de conformidade (S4/S8/S12)

### Gate Sprint 4 (S4)

1. Cobertura da matriz `MATRIZ-CANONICA-BK.md` para requisitos de gate.
2. Conformidade dos guias BK com template v3 (especificidade + snippets + proximos BKs reais).
3. Criterios de aceite mensuraveis presentes nos guias da janela.
4. Evidence minima (`pr`, `proof`, `neg`) validada.

### Gate Sprint 8 (S8)

1. Revalidar cobertura da matriz para requisitos em curso.
2. Revalidar conformidade de guias e metadados com backlog.
3. Auditar coerencia `owner`, `prioridade`, `dependencias`, `rf_rnf`.
4. Consolidar PASS/FAIL por criterio com acao corretiva.

### Gate Sprint 12 (S12)

1. Fecho integral da cobertura RF/RNF na matriz.
2. 100% dos guias BK conformes ao contrato v3.
3. Score final consolidado no fecho de gate `S12`.
4. Emissao de parecer final GO/NO-GO documental.

### Registo obrigatorio de gate

- Formato de resultado por criterio: `PASS` ou `FAIL` + acao corretiva + dono + prazo.

## KPI por sprint

- `% BK DONE`
- `% BK P0 DONE`
- `numero de blockers`
- `numero de regressoes`
- `tempo medio de fecho por BK`
- `% guias conformes ao template v3`
- `% requisitos com rastreabilidade validada na matriz RF/RNF`
- `carga total de sprint (pontos)`

## Papel do Nuno nas sprints

- conduz planning e retro;
- valida gates e criterios de aceite;
- orienta preparacao para defesa;
- nao assume ownership de implementacao core.

## Changelog

- `2026-04-11`: versao revista para equipa de 4 alunos.
- `2026-04-13`: rebalanceamento de carga nas sprints 10-12 e reforco de gate orientado a meta `97/100`.
- `2026-04-13`: removida referencia a ficheiro externo de score; avaliacao passa a ser consolidada no scorecard oficial.
- `2026-04-14`: alinhado com scorecard oficial por sprint e guiao docente semanal com checkpoints/remediacao.
- `2026-04-17`: aplicado rebaseline de escopo MVP com remocao integral de itens fora de escopo.
- `2026-04-17`: recalibrada carga planeada das sprints `S06` e `S10` para coincidir com a soma de pontos dos BKs alocados.
