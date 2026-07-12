# Plano de Implementacao Total - FaithFlix

## Header

- `doc_id`: `PLANO-IMPLEMENTACAO-TOTAL`
- `path`: `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-07-10`
- `document_status`: `CURRENT`
- `implementation_lane`: `STUDENT`
- `current_authority`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `proof_scope`: plano e gates dos alunos; resultados da referência privada são contexto separado e não fecham BKs

## Objetivo

Traduzir os requisitos ativos (`RF` e `RNF`) num plano executavel para 4 alunos, com rastreabilidade canonica, rigor pedagogico e qualidade documental orientada a meta `>=97/100`.

## Assuncoes de execucao

- Equipa tecnica: `Matheus`, `Mateus`, `Davi`, `Kaue`.
- Orientacao: `Nuno` (governance, avaliacao, gates e defesa).
- Limites estruturais: `13 sprints`, `66 BK`.
- Distribuicao desigual de BK mantida por criterio pedagogico e tecnico.

## Baseline de escopo MVP (2026-04-17)

- BK ativos no MVP corrente: `66/66`.
- RF fora de escopo removidos integralmente de `docs/RF.md`, backlog e matriz.
- Regra documental: apenas itens ativos permanecem nos artefactos canonicos.

## Contratos canonicos obrigatorios

1. Rastreabilidade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`.
2. Operacao do backlog: `docs/planificacao/backlogs/BACKLOG-MVP.md`.
3. Qualidade dos guias BK: `docs/planificacao/guias-bk/_TEMPLATE-BK.md`.
4. Scorecard oficial por sprint: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`.
5. Guiao docente semanal: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`.
6. Validacao automatica: `scripts/validate-planificacao.sh`.

## Macro fases

| Macro | Nome | Cobertura principal |
| --- | --- | --- |
| `MF0` | Kickoff e governance | alinhamento, ownership, backlog, DoD |
| `MF1` | Fundacao tecnica | base FE/BE, seguranca, observabilidade |
| `MF2` | Core streaming | `RF01..RF18` |
| `MF3` | Descoberta e recomendacao | `RF19..RF28` |
| `MF4` | Monetizacao solidaria | `RF35..RF48`, `RF52..RF54` |
| `MF5` | Operacao e privacidade | `RF55..RF60` |
| `MF6` | Hardening | `RNF` criticos de qualidade/performance/seguranca |
| `MF7` | Refinamento de UI e navegacao segura | inventario UI/mockup, sessao/role, layout, paginas e gate visual |
| `MF8` | Consolidacao, evidencia, readiness, auditoria, defesa, buffer e fecho | alinhamento visual mockup/frontend, testes finais, readiness, auditoria admin, matriz final, riscos totais, report de erros, correcao e scope freeze |
| `MF9` | Plano Pro/Familia, partilha real e qualidade de streaming | `RF61..RF63`, entitlements, memberships familiares, qualidade por plano, RGPD operacional e gate S13 |

### Nota anti-drift sobre `MF0`

No FaithFlix, `MF0` e exclusivamente uma macro fase de governance/kickoff. Fecha plano, responsabilidades, backlog, DoD, calendario e reuniao de alinhamento. Nao cria backend, frontend, base de dados, streaming, catalogo, autenticacao, componentes, endpoints ou qualquer funcionalidade real da aplicacao.

A fundacao tecnica com ficheiros, comandos, estrutura de projeto e decisoes implementaveis comeca em `MF1`. Qualquer referencia tecnica feita em `MF0` deve ser lida como decisao documental, assuncao ou contrato para preparar `MF1`, nunca como implementacao.

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
- Guias da janela conformes ao contrato `tutorial-v2` de 16 secções.
- Passos técnicos completos nos sete pontos definidos em `_TEMPLATE-BK.md`.
- Evidence minima e criterios mensuraveis validados.

### Gate S8

- Coerencia backlog/matriz/guias para janela `S5..S8`.
- Auditoria de ownership, prioridade, dependencias e `rf_rnf`.
- Checkpoints docentes e remediacao semanal registados.
- Consolidacao de acao corretiva em casos `FAIL`.

### Gate S12

- Snapshot histórico pré-MF9: fecho então planeado da baseline MF8 em `91/91`
  requisitos e `60/60` BK. Estas contagens não são a baseline ativa atual.
- Scorecard oficial consolidado sprint-a-sprint.
- Score final consolidado no scorecard oficial.
- Parecer final `GO/NO-GO` com assinatura do orientador.

### Gate S13

- Alvo corrente: fecho incremental `94/94` requisitos e `66/66` BK.
- Validação end-to-end de planos Pro/Família, partilha familiar real e qualidade
  por plano, apenas quando executada na lane dos alunos.
- Regressao backend/frontend e evidence MF9 anexada.
- Parecer final atualizado `GO/NO-GO` com assinatura do orientador.

### Estado pós-auditoria em 2026-07-10

- A referência privada atingiu `GO_LOCAL_COM_RESSALVAS` apenas para execução
  local e testes sem persistência real.
- O estado de produção permanece `NO_GO_PRODUCAO`.
- Full E2E com DB transacional dedicada, restore real, browsers branded/Safari,
  vídeo/4K/CDN/carga e gateway real continuam por provar ou fora de escopo.
- `RNF08` e `RNF10` ficam `NAO_PROVADO`; `RNF23` fica
  `PARCIAL_VALIDADO` na referência.
- Estes resultados não marcam automaticamente o gate S13 nem qualquer BK dos
  alunos como concluído.

## Criterios de saida do plano

- Validacao automatica a `PASS`: `scripts/validate-planificacao.sh`.
- Gate `S4/S8/S12/S13` com baseline + execucao real + acao corretiva.
- Score total `>=97/100` no contrato oficial.

## Changelog

- `2026-04-11`: versao revista com equipa correta.
- `2026-04-13`: reforco de contratos canonicos, governance pedagogica e meta de qualidade `97/100`.
- `2026-04-13`: removida dependencia de ficheiro externo de score e consolidada avaliacao no scorecard oficial.
- `2026-04-14`: incorporada hierarquia canonica adaptada, scorecard oficial por sprint e guiao docente semanal.
- `2026-04-17`: aplicado rebaseline de escopo MVP com remocao integral de itens fora de escopo.
- `2026-05-25`: adicionada nota anti-drift para explicitar que `MF0` e governance/kickoff e que a fundacao tecnica comeca em `MF1`.

- `2026-06-22`: MF7 passou a UI/navegacao segura e MF8 passou a consolidacao, evidencia, defesa, buffer e fecho.
- `2026-06-27`: MF8 condensada para 10 BKs finais, com matriz final apenas depois dos BKs tecnicos.
- `2026-06-30`: adicionada MF9 em S13 para planos Pro/Familia, partilha familiar real, qualidade por plano e regressao final.
- `2026-07-10`: distinguido o snapshot S12 da baseline ativa 66/66/94 e registado o estado pós-auditoria sem promover o gate dos alunos.
