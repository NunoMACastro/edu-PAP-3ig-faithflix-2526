# Roadmap de Guias BK (Pos-cobertura total)

## Header

- `doc_id`: `ROADMAP-BKS-RESTANTES`
- `path`: `docs/planificacao/guias-bk/ROADMAP-BKS-RESTANTES.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-06-30`

## Objetivo

Consolidar a manutencao dos guias BK apos cobertura total (`66/66`), garantindo alinhamento continuo com backlog, matriz RF/RNF, plano de sprints e evidencias de gate.

## Estado atual (snapshot)

- Guias BK criados: `66/66`.
- BKs pendentes de criacao: `0`.
- Fonte de verdade operacional: `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Ordem canonica de execucao: `docs/planificacao/sprints/PLANO-SPRINTS.md`.
- Rastreabilidade requisito -> BK -> evidencia: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.

## Regras operacionais

- Nao criar novos BKs sem aprovacao explicita de escopo.
- Nao alterar IDs BK (`BK-MFxx-yy`) nem slugs publicados.
- Qualquer mudanca de `owner`, `prioridade`, `dependencias` ou `rf_rnf` deve ser sincronizada no mesmo ciclo em:
  - `BACKLOG-MVP.md`
  - `MATRIZ-CANONICA-BK.md`
  - guia BK correspondente
- O campo `Proximo BK recomendado` deve continuar alinhado com `PLANO-SPRINTS.md`.

## Plano de manutencao por ondas

### Onda A - Coerencia documental continua

1. Validar metadados de todos os guias (`owner`, `prioridade`, `dependencias`, `rf_rnf`, `last_updated`).
2. Confirmar que nao existe drift entre guias, backlog e matriz.
3. Executar validacao oficial: `bash scripts/validate-planificacao.sh`.

### Onda B - Evidencias e fecho de gates

1. Atualizar evidencias `pr/proof/neg` conforme execucao real por sprint.
2. Preencher `Execucao real` no checklist de gates (`S4`, `S8`, `S12`, `S13`).
3. Registar acoes corretivas, owner e prazo para qualquer criterio `FAIL`.

### Onda C - Fecho para defesa PAP

1. Confirmar cobertura integral `RF/RNF` e `BK` no gate `S13`.
2. Consolidar score final documental no scorecard oficial.
3. Emitir parecer final `GO/NO-GO` com assinatura do orientador.

## Criterios de conclusao

1. Script de validacao em `PASS`.
2. Checklist de gates com baseline + execucao real preenchidos.
3. Sem divergencias entre `BACKLOG-MVP`, `MATRIZ-CANONICA-BK`, `MF-VIEWS` e guias BK.
4. BK terminal (`BK-MF9-06`) mantem `Proximo BK recomendado = -`.

## Changelog

- `2026-04-12`: roadmap inicial dos BKs em falta (fase de criacao).
- `2026-04-13`: roadmap atualizado para fase pos-cobertura total, com foco em manutencao, evidencias e fecho de gates.
- `2026-04-17`: roadmap atualizado para baseline final do MVP (`60/60`) apos rebaseline de escopo.

- `2026-06-22`: roadmap atualizado para nova cadeia MF7/MF8.
- `2026-06-27`: roadmap atualizado para `60/60` guias apos condensacao final da MF8 em 10 BKs.
- `2026-06-30`: roadmap atualizado para `66/66` guias com MF9 e gate S13.
