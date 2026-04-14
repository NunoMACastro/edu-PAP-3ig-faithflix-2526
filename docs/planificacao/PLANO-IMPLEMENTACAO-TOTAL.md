# Plano de Implementacao Total - FaithFlix

## Header

- `doc_id`: `PLANO-IMPLEMENTACAO-TOTAL`
- `path`: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-14`

## Objetivo

Traduzir `RF01..RF63` e `RNF01..RNF40` num plano executavel para 4 alunos, com rastreabilidade canonica, rigor pedagogico e qualidade documental orientada a meta `>=97/100`.

## Assuncoes de execucao

- Equipa tecnica: `Matheus`, `Mateus`, `Davi`, `Kaue`.
- Orientacao: `Nuno` (governance, avaliacao, gates e defesa).
- Limites estruturais: `12 sprints`, `60 BK`.
- Distribuicao desigual de BK mantida por criterio pedagogico e tecnico.

## Contratos canonicos obrigatorios

1. Rastreabilidade: `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`.
2. Operacao do backlog: `docs/planificacao/backlogs/BACKLOG-MVP.md`.
3. Qualidade dos guias BK: `docs/planificacao/guias-bk/_TEMPLATE-BK.md`.
4. Gate e execucao real: `docs/planificacao/sprints/RELATORIO-GATES-S4-S8-S12.md`.
5. Scorecard oficial por sprint: `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`.
6. Guiao docente semanal: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`.
7. Validacao automatica: `scripts/validate-planificacao.sh`.

## Macro fases

| Macro | Nome | Cobertura principal |
| --- | --- | --- |
| `MF0` | Kickoff e governance | alinhamento, ownership, backlog, DoD |
| `MF1` | Fundacao tecnica | base FE/BE, seguranca, observabilidade |
| `MF2` | Core streaming | `RF01..RF18` |
| `MF3` | Descoberta e comunidade | `RF19..RF34` |
| `MF4` | Monetizacao solidaria | `RF35..RF54` |
| `MF5` | Operacao e privacidade | `RF55..RF63` |
| `MF6` | Hardening | `RNF` criticos de qualidade/performance/seguranca |
| `MF7` | Evidencias PAP | matriz RF/RNF + demo + ensaio |
| `MF8` | Buffer e fecho | estabilizacao, freeze e retro final |

## Regras transversais por macro

1. Cada BK com owner unico, apoio explicito e dependencias validas.
2. Politica de negativos obrigatoria: `P0/P1 >= 3`, `P2 >= 1`.
3. Evidence minima por BK: `pr`, `proof`, `neg`.
4. Guias BK obrigatoriamente especificos (sem placeholders de proximo BK).
5. Handoff semanal obrigatorio para BK `P0`.
6. Pairing semanal (60-90 min) obrigatorio entre aluno forte e aluno em evolucao.

## Gate de conformidade e fecho

### Gate S4

- Cobertura de matriz para janela `S1..S4`.
- Guias da janela conformes ao template v3.
- Guias da janela com bloco pedagogico + bloco operacional completos.
- Evidence minima e criterios mensuraveis validados.

### Gate S8

- Coerencia backlog/matriz/guias para janela `S5..S8`.
- Auditoria de ownership, prioridade, dependencias e `rf_rnf`.
- Checkpoints docentes e remediacao semanal registados.
- Consolidacao de acao corretiva em casos `FAIL`.

### Gate S12

- Fecho integral `103/103` e `60/60`.
- Scorecard oficial consolidado sprint-a-sprint com pesos OPSA.
- Score final consolidado no relatorio de gate `S12`.
- Parecer final `GO/NO-GO` com assinatura do orientador.

## Criterios de saida do plano

- Validacao automatica a `PASS`: `scripts/validate-planificacao.sh`.
- Gate `S4/S8/S12` com baseline + execucao real + acao corretiva.
- Score total `>=97/100` no contrato oficial.

## Changelog

- `2026-04-11`: versao revista com equipa correta.
- `2026-04-13`: reforco de contratos canonicos, governance pedagogica e meta de qualidade `97/100`.
- `2026-04-13`: removida dependencia de ficheiro externo de score e consolidada avaliacao no relatorio de gates.
- `2026-04-14`: incorporada hierarquia canonica OPSA adaptada, scorecard oficial por sprint e guiao docente semanal.
