# Planificacao do Projeto Faithflix

## Header

- `doc_id`: `PLANIFICACAO-README`
- `path`: `docs/planificacao/README.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-11`

## Objetivo

Organizar a execucao da PAP com uma estrutura clara para 4 alunos (`Matheus`, `Mateus`, `Davi`, `Kaue`) e orientacao do `Nuno`.

## Estrutura da pasta `docs/planificacao`

- `PLANO-IMPLEMENTACAO-TOTAL.md`: plano macro completo (`MF0..MF8`) com gates.
- `DISTRIBUICAO-RESPONSABILIDADES.md`: ownership, regras de colaboracao e papel de orientacao.
- `backlogs/BACKLOG-MVP.md`: backlog atomico oficial (`BK-*`) com owner/dependencias/criterios.
- `backlogs/MF-VIEWS.md`: execucao pratica por macro fase.
- `sprints/PLANO-SPRINTS.md`: plano de sprints, cadencia e metas semanais.

## Ordem de leitura recomendada

1. `docs/RF.md`
2. `docs/RNF.md`
3. `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
4. `docs/planificacao/DISTRIBUICAO-RESPONSABILIDADES.md`
5. `docs/planificacao/backlogs/BACKLOG-MVP.md`
6. `docs/planificacao/backlogs/MF-VIEWS.md`
7. `docs/planificacao/sprints/PLANO-SPRINTS.md`

## Regra de precedencia (anti-drift)

1. `docs/RF.md` e `docs/RNF.md` (verdade funcional/nao funcional).
2. `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md` (ordem estrategica).
3. `docs/planificacao/backlogs/BACKLOG-MVP.md` (estado operacional real).
4. `docs/planificacao/backlogs/MF-VIEWS.md` (guia de execucao).
5. `docs/planificacao/sprints/PLANO-SPRINTS.md` (cadencia temporal).

## Fluxo semanal (step-by-step)

1. `Planning`: selecionar BKs, confirmar dependencias e capacidade.
2. `Execucao`: implementar BKs prioritarios da sprint.
3. `Integracao`: validar FE/BE e corrigir conflitos.
4. `Validacao`: executar testes e verificar criterios de aceite.
5. `Demo e retro`: demonstrar entrega e registar melhorias.

## Regras de atualizacao documental

1. BK iniciado muda para `IN_PROGRESS` no mesmo dia.
2. BK concluido so muda para `DONE` com evidencia minima.
3. Mudanca de escopo exige atualizacao coordenada do plano, backlog e sprints.
4. O Nuno valida coerencia no fim de cada sprint.

## Papel do Nuno (orientador)

- Owner de governance, gates, avaliacao e preparacao de defesa.
- Nao substitui ownership tecnico continuo dos alunos.
- Pode assumir BKs apenas de planeamento, quality-gate e fecho.

## Changelog

- `2026-04-11`: versao revista para equipa correta (`Matheus`, `Mateus`, `Davi`, `Kaue`).
