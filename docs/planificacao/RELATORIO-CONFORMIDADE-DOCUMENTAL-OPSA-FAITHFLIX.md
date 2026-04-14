# RELATORIO-CONFORMIDADE-DOCUMENTAL-OPSA-FAITHFLIX

## Header

- `doc_id`: `RELATORIO-CONFORMIDADE-DOCUMENTAL-OPSA-FAITHFLIX`
- `path`: `docs/planificacao/RELATORIO-CONFORMIDADE-DOCUMENTAL-OPSA-FAITHFLIX.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-14`

## Objetivo

Registar a conformidade da planificacao FaithFlix face ao modelo OPSA adaptado para PAP (12.o ano), preservando carga realista e execucao pratica.

## Escopo auditado

- `docs/planificacao/README.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`
- `docs/planificacao/sprints/PLANO-SPRINTS.md`
- `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`
- `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`
- `docs/planificacao/sprints/RELATORIO-GATES-S4-S8-S12.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF*/BK-MF*.md` (60 guias)
- `scripts/validate-planificacao.sh`

## Resultado de validacao automatica

- Comando: `bash scripts/validate-planificacao.sh`
- Resultado: `VALIDATION_RESULT=PASS errors=0`
- Data: `2026-04-14`

## Evidencia dos criterios de aceite

| Criterio | Resultado | Evidencia objetiva |
| --- | --- | --- |
| Hierarquia canonica documentada e aplicada | `PASS` | Secao de hierarquia em `docs/planificacao/README.md` + check no script |
| Scorecard e guiao docente ativos e coerentes | `PASS` | Ficheiros oficiais criados + checks de pesos/estrutura no script |
| 100% dos guias com bloco pedagogico + bloco operacional | `PASS` | `60/60` guias validados no script |
| Cadencia realista de sprint preservada | `PASS` | `12` sprints, carga max `11` pontos |
| Scripts de validacao em PASS | `PASS` | `VALIDATION_RESULT=PASS errors=0` |
| Sem drift backlog <-> matriz <-> guias <-> sprints | `PASS` | Checks de integridade e ordem canonica a `0` erros |

## Riscos residuais

1. Risco de nao preencher scorecard no fecho semanal.
2. Risco de checkpoints docentes incompletos em semanas com blockers.
3. Risco de drift humano apos alteracoes manuais rapidas em backlog.

## Mitigacao ativa

1. Tornar preenchimento do scorecard parte obrigatoria da sexta-feira.
2. Usar o guiao docente como checklist diario minimo.
3. Executar `bash scripts/validate-planificacao.sh` em qualquer alteracao documental estrutural.

## Conclusao

Modelo OPSA adaptado aplicado com sucesso ao FaithFlix, sem perda de praticidade pedagogica nem aumento de burocracia desnecessaria para alunos do 12.o ano.

## Changelog

- `2026-04-14`: emissao inicial do relatorio de conformidade documental OPSA x FaithFlix.
