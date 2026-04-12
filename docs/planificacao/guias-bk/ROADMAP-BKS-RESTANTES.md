# Roadmap de Criação dos BKs Restantes (Fase 2 + Fase 3)

## Header

- `doc_id`: `ROADMAP-BKS-RESTANTES`
- `path`: `docs/planificacao/guias-bk/ROADMAP-BKS-RESTANTES.md`
- `area`: `project`
- `owner`: `Nuno (orientação)`
- `status`: `ativo`
- `last_updated`: `2026-04-12`

## Objetivo

Planear a criação dos **34 guias BK em falta** com ordem de execução decision-complete, respeitando dependências, prioridade e sequência macro do backlog oficial.

## Regras operacionais

- Fonte de verdade para BKs: `docs/planificacao/backlogs/BACKLOG-MVP.md`.
- Todos os novos guias devem seguir exatamente o contrato de `docs/planificacao/guias-bk/_TEMPLATE-BK.md`.
- Não renomear slugs existentes; só criar novos ficheiros no padrão `BK-ID + slug`.
- No fecho de cada onda: atualizar links/estado em `docs/planificacao/guias-bk/README.md`, `BACKLOG-MVP.md` e `MF-VIEWS.md`.

## Matriz dos BKs em falta

| bk_id | macro | prioridade | owner | dependências | RF/RNF | slug-alvo |
| --- | --- | --- | --- | --- | --- | --- |
| `BK-MF1-05` | `MF1` | `P1` | `Kaue` | `BK-MF1-01` | `RNF30,RNF31` | `BK-MF1-05-health-check-e-logging-estruturado.md` |
| `BK-MF1-06` | `MF1` | `P1` | `Kaue` | `BK-MF1-03,BK-MF1-04` | `RNF29` | `BK-MF1-06-smoke-tests-fe-be.md` |
| `BK-MF2-06` | `MF2` | `P1` | `Mateus` | `BK-MF2-05` | `RF13,RF14,RF15` | `BK-MF2-06-legendas-audio-parental-e-qualidade.md` |
| `BK-MF3-01` | `MF3` | `P1` | `Davi` | `BK-MF2-07` | `RF19,RF21` | `BK-MF3-01-ratings-e-agregacao.md` |
| `BK-MF3-02` | `MF3` | `P2` | `Matheus` | `BK-MF3-01` | `RF20` | `BK-MF3-02-comentarios-curtos-moderados.md` |
| `BK-MF3-04` | `MF3` | `P1` | `Mateus` | `BK-MF3-03` | `RF23,RF24,RF25` | `BK-MF3-04-filtros-carrosseis-e-relacionados.md` |
| `BK-MF3-05` | `MF3` | `P1` | `Davi` | `BK-MF3-01,BK-MF2-07` | `RF26,RF27` | `BK-MF3-05-recomendacao-baseline-cold-start.md` |
| `BK-MF3-06` | `MF3` | `P2` | `Mateus` | `BK-MF3-05` | `RF28,RNF34` | `BK-MF3-06-explicabilidade-de-recomendacao.md` |
| `BK-MF3-07` | `MF3` | `P1` | `Kaue` | `BK-MF2-04` | `RF29,RF30,RF31` | `BK-MF3-07-estudo-biblico-e-guias.md` |
| `BK-MF3-08` | `MF3` | `P2` | `Mateus` | `BK-MF3-02` | `RF32,RF33,RF34` | `BK-MF3-08-funcionalidades-comunidade.md` |
| `BK-MF4-06` | `MF4` | `P1` | `Kaue` | `BK-MF4-05` | `RF46,RF47,RF48` | `BK-MF4-06-relatorios-e-historico-por-associacao.md` |
| `BK-MF4-07` | `MF4` | `P1` | `Kaue` | `BK-MF3-02` | `RF49,RF50,RF51` | `BK-MF4-07-workflow-editorial-e-denuncias.md` |
| `BK-MF4-08` | `MF4` | `P1` | `Mateus` | `BK-MF4-01` | `RF52,RF53,RF54` | `BK-MF4-08-notificacoes-transacionais-e-preferencias.md` |
| `BK-MF5-04` | `MF5` | `P1` | `Kaue` | `BK-MF2-02` | `RF58` | `BK-MF5-04-gestao-de-utilizadores-admin.md` |
| `BK-MF5-05` | `MF5` | `P1` | `Davi` | `BK-MF5-04` | `RF59` | `BK-MF5-05-painel-de-metricas-admin.md` |
| `BK-MF5-06` | `MF5` | `P1` | `Davi` | `BK-MF5-04` | `RF60` | `BK-MF5-06-configuracao-de-integracoes-admin.md` |
| `BK-MF5-07` | `MF5` | `P1` | `Mateus` | `BK-MF2-02,BK-MF2-05` | `RF61,RF62` | `BK-MF5-07-perfis-familiares-e-dispositivos.md` |
| `BK-MF5-08` | `MF5` | `P2` | `Kaue` | `BK-MF5-07` | `RF63` | `BK-MF5-08-gamificacao-baseline.md` |
| `BK-MF6-01` | `MF6` | `P0` | `Kaue` | `BK-MF5-08` | `RNF29` | `BK-MF6-01-suite-de-regressao-backend.md` |
| `BK-MF6-02` | `MF6` | `P0` | `Kaue` | `BK-MF5-08` | `RNF29` | `BK-MF6-02-suite-de-regressao-frontend.md` |
| `BK-MF6-03` | `MF6` | `P0` | `Matheus` | `BK-MF6-01` | `RNF13..RNF20,RNF37` | `BK-MF6-03-hardening-seguranca-e-privacidade.md` |
| `BK-MF6-04` | `MF6` | `P1` | `Davi` | `BK-MF6-02` | `RNF07..RNF12` | `BK-MF6-04-otimizacao-de-performance-critica.md` |
| `BK-MF6-05` | `MF6` | `P1` | `Mateus` | `BK-MF6-02` | `RNF01..RNF06` | `BK-MF6-05-acessibilidade-e-ux-final.md` |
| `BK-MF6-06` | `MF6` | `P0` | `Nuno` | `BK-MF6-03,BK-MF6-05` | `transversal` | `BK-MF6-06-validacao-tecnica-final-por-gate.md` |
| `BK-MF7-01` | `MF7` | `P0` | `Kaue` | `BK-MF6-06` | `RF01..RF63` | `BK-MF7-01-matriz-de-cobertura-rf-evidencia.md` |
| `BK-MF7-02` | `MF7` | `P0` | `Davi` | `BK-MF6-06` | `RNF01..RNF40` | `BK-MF7-02-matriz-de-cobertura-rnf-validacao.md` |
| `BK-MF7-03` | `MF7` | `P1` | `Mateus` | `BK-MF7-01` | `transversal` | `BK-MF7-03-roteiro-de-demo-final.md` |
| `BK-MF7-04` | `MF7` | `P1` | `Matheus` | `BK-MF7-03` | `transversal` | `BK-MF7-04-ensaio-tecnico-da-defesa.md` |
| `BK-MF7-05` | `MF7` | `P0` | `Nuno` | `BK-MF7-02,BK-MF7-04` | `transversal` | `BK-MF7-05-avaliacao-final-e-feedback-orientador.md` |
| `BK-MF8-01` | `MF8` | `P0` | `Kaue` | `BK-MF7-05` | `transversal` | `BK-MF8-01-lista-de-riscos-residuais.md` |
| `BK-MF8-02` | `MF8` | `P0` | `Matheus` | `BK-MF8-01` | `transversal` | `BK-MF8-02-correcao-de-bugs-bloqueantes.md` |
| `BK-MF8-03` | `MF8` | `P0` | `Nuno` | `BK-MF8-02` | `transversal` | `BK-MF8-03-scope-freeze-final.md` |
| `BK-MF8-04` | `MF8` | `P1` | `Kaue` | `BK-MF8-03` | `transversal` | `BK-MF8-04-empacotamento-final-de-entrega.md` |
| `BK-MF8-05` | `MF8` | `P1` | `Nuno` | `BK-MF8-04` | `transversal` | `BK-MF8-05-retro-final-e-licoes-aprendidas.md` |

## Ordem de criação por ondas

### Onda 1 (fundação pendente)

- `BK-MF1-05`
- `BK-MF1-06`
- `BK-MF2-06`

Objetivo da onda: fechar lacunas de fundação/qualidade antes da expansão completa de descoberta e operações.

### Onda 2 (MF3 completo)

- `BK-MF3-01`
- `BK-MF3-02`
- `BK-MF3-04`
- `BK-MF3-05`
- `BK-MF3-06`
- `BK-MF3-07`
- `BK-MF3-08`

Objetivo da onda: completar descoberta/comunidade e preparar terreno para fluxos operacionais e editoriais.

### Onda 3 (MF4 e MF5 pendentes)

- `BK-MF4-06`
- `BK-MF4-07`
- `BK-MF4-08`
- `BK-MF5-04`
- `BK-MF5-05`
- `BK-MF5-06`
- `BK-MF5-07`
- `BK-MF5-08`

Objetivo da onda: consolidar monetização, operação admin e extensões de conta/dispositivos.

### Onda 4 (MF6 completo)

- `BK-MF6-01`
- `BK-MF6-02`
- `BK-MF6-03`
- `BK-MF6-04`
- `BK-MF6-05`
- `BK-MF6-06`

Objetivo da onda: hardening técnico completo e validação por gate final.

### Onda 5 (MF7 + MF8 completos)

- `BK-MF7-01`
- `BK-MF7-02`
- `BK-MF7-03`
- `BK-MF7-04`
- `BK-MF7-05`
- `BK-MF8-01`
- `BK-MF8-02`
- `BK-MF8-03`
- `BK-MF8-04`
- `BK-MF8-05`

Objetivo da onda: fechar evidências da PAP, estabilizar entrega e concluir documentação final.

## Critérios de conclusão por onda

1. Todos os guias da onda criados com a estrutura obrigatória do template.
2. Frase padrão de snippets presente em todos os BKs da onda.
3. Índices e links sincronizados em `guias-bk/README.md`, `BACKLOG-MVP.md` e `MF-VIEWS.md`.
4. Verificação de ortografia PT-PT executada nos novos ficheiros.

## Changelog

- `2026-04-12`: roadmap inicial dos 34 BKs em falta, com matriz completa e ordem por ondas.
