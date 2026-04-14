# BACKLOG-MVP FaithFlix

## Header

- `doc_id`: `BACKLOG-MVP`
- `path`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-14`

## Objetivo

Backlog atomico oficial do MVP, com owner unico por BK, dependencias, criterios de aceite e evidencias.

## Contrato de rastreabilidade canonica

- Fonte de rastreio requisito -> BK -> evidencia: `docs/planificacao/backlogs/MATRIZ-RF-RNF-POR-BK.md`.
- `BACKLOG-MVP.md` continua como fonte operacional de prioridade/estado/capacidade.
- Divergencias entre backlog e matriz devem ser corrigidas no mesmo ciclo de sprint.

## Contrato canonico de campos BK (fonte oficial)

Campos obrigatorios por linha BK: `bk_id`, `titulo`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`.

Regras obrigatorias:

1. `bk_id` segue formato `BK-MF[0-8]-[0-9][0-9]`.
2. `prioridade` so permite `P0|P1|P2`.
3. `estado` so permite `TODO|IN_PROGRESS|BLOCKED|DONE`.
4. `esforco` so permite `S|M|L`.
5. `dependencias` aceita `-` ou lista de `BK-*` existentes no backlog.
6. `owner`, `prioridade`, `dependencias` e `rf_rnf` devem coincidir 1:1 com cada guia BK.

## Validacao cruzada obrigatoria (sem drift)

1. `BACKLOG-MVP` <-> `MATRIZ-RF-RNF-POR-BK`: cobertura e rastreabilidade sem faltas nem extras.
2. `BACKLOG-MVP` <-> `guias-bk/MF*/BK-MF*.md`: metadados BK alinhados.
3. `PLANO-SPRINTS` <-> `MF-VIEWS` <-> `Proximo BK recomendado` dos guias: ordem canonica unica.
4. `SCORECARD-OFICIAL-POR-SPRINT` <-> `RELATORIO-GATES-S4-S8-S12`: pesos e score consolidados.
5. `GUIAO-DOCENTE-SEMANAL` <-> execucao de sprint: checkpoints e remediacao registados.

## Contrato pedagogico v3 (obrigatorio)

- Politica de negativos por prioridade: `P0/P1 >= 3`, `P2 >= 1`.
- Criterios de aceite por guia devem ser mensuraveis (condicao + metrica/limiar + evidencia).
- Evidence minima por BK: trio `pr`, `proof`, `neg`.
- Cada guia deve ter objetivo especifico por BK, snippet tecnico e `Proximo BK recomendado` com ID real.
- Validacao obrigatoria de conformidade em gates `S4`, `S8` e `S12`.

## Contrato de qualidade e validacao

- Meta documental oficial: `>=97/100` consolidada nos gates.
- Script oficial de conformidade: `scripts/validate-planificacao.sh`.
- Fecho de gate exige `PASS` no script + validacao humana do orientador.

## Legenda

- Prioridade: `P0` (critico), `P1` (importante), `P2` (melhoria).
- Estado: `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE`.
- Esforco: `S`, `M`, `L`.

## Estado das macro fases (snapshot inicial)

| Macro | Estado | Progresso |
| ----- | ------ | --------- |
| `MF0` | `TODO` | `0/6`     |
| `MF1` | `TODO` | `0/6`     |
| `MF2` | `TODO` | `0/8`     |
| `MF3` | `TODO` | `0/8`     |
| `MF4` | `TODO` | `0/8`     |
| `MF5` | `TODO` | `0/8`     |
| `MF6` | `TODO` | `0/6`     |
| `MF7` | `TODO` | `0/5`     |
| `MF8` | `TODO` | `0/5`     |

---

## Ligacao para guias BK (cobertura total)

Tabela de referencia para todos os guias pedagogicos publicados (MF0..MF8).
Estado do guia indica a fase de criacao documental.

| BK          | Guia | Estado do guia |
| ----------- | ---- | -------------- |
| `BK-MF0-01` | `../guias-bk/MF0/BK-MF0-01-publicar-plano-total.md` | `CRIADO (Fase 1)` |
| `BK-MF0-02` | `../guias-bk/MF0/BK-MF0-02-publicar-distribuicao-responsabilidades.md` | `CRIADO (Fase 1)` |
| `BK-MF0-03` | `../guias-bk/MF0/BK-MF0-03-publicar-backlog-atomico-inicial.md` | `CRIADO (Fase 1)` |
| `BK-MF0-04` | `../guias-bk/MF0/BK-MF0-04-definir-dod-e-formato-evidencia.md` | `CRIADO (Fase 1)` |
| `BK-MF0-05` | `../guias-bk/MF0/BK-MF0-05-definir-calendario-sprints.md` | `CRIADO (Fase 1)` |
| `BK-MF0-06` | `../guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md` | `CRIADO (Fase 1)` |
| `BK-MF1-01` | `../guias-bk/MF1/BK-MF1-01-estrutura-base-backend-modulos.md` | `CRIADO (Fase 1)` |
| `BK-MF1-02` | `../guias-bk/MF1/BK-MF1-02-estrutura-base-frontend-componentes.md` | `CRIADO (Fase 1)` |
| `BK-MF1-03` | `../guias-bk/MF1/BK-MF1-03-cliente-api-frontend-tratamento-erro.md` | `CRIADO (Fase 1)` |
| `BK-MF1-04` | `../guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md` | `CRIADO (Fase 1)` |
| `BK-MF1-05` | `../guias-bk/MF1/BK-MF1-05-health-check-e-logging-estruturado.md` | `CRIADO (Fase 2)` |
| `BK-MF1-06` | `../guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md` | `CRIADO (Fase 2)` |
| `BK-MF2-01` | `../guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md` | `CRIADO (Fase 1)` |
| `BK-MF2-02` | `../guias-bk/MF2/BK-MF2-02-edicao-perfil-papeis-base.md` | `CRIADO (Fase 1)` |
| `BK-MF2-03` | `../guias-bk/MF2/BK-MF2-03-crud-catalogo-taxonomias.md` | `CRIADO (Fase 1)` |
| `BK-MF2-04` | `../guias-bk/MF2/BK-MF2-04-pagina-detalhe-conteudo.md` | `CRIADO (Fase 1)` |
| `BK-MF2-05` | `../guias-bk/MF2/BK-MF2-05-reproducao-continuar-a-ver.md` | `CRIADO (Fase 1)` |
| `BK-MF2-06` | `../guias-bk/MF2/BK-MF2-06-legendas-audio-parental-e-qualidade.md` | `CRIADO (Fase 2)` |
| `BK-MF2-07` | `../guias-bk/MF2/BK-MF2-07-favoritos-watchlist-historico.md` | `CRIADO (Fase 1)` |
| `BK-MF2-08` | `../guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md` | `CRIADO (Fase 1)` |
| `BK-MF3-01` | `../guias-bk/MF3/BK-MF3-01-ratings-e-agregacao.md` | `CRIADO (Fase 2)` |
| `BK-MF3-02` | `../guias-bk/MF3/BK-MF3-02-comentarios-curtos-moderados.md` | `CRIADO (Fase 2)` |
| `BK-MF3-03` | `../guias-bk/MF3/BK-MF3-03-pesquisa-unificada.md` | `CRIADO (Fase 1)` |
| `BK-MF3-04` | `../guias-bk/MF3/BK-MF3-04-filtros-carrosseis-e-relacionados.md` | `CRIADO (Fase 2)` |
| `BK-MF3-05` | `../guias-bk/MF3/BK-MF3-05-recomendacao-baseline-cold-start.md` | `CRIADO (Fase 2)` |
| `BK-MF3-06` | `../guias-bk/MF3/BK-MF3-06-explicabilidade-de-recomendacao.md` | `CRIADO (Fase 2)` |
| `BK-MF3-07` | `../guias-bk/MF3/BK-MF3-07-estudo-biblico-e-guias.md` | `CRIADO (Fase 2)` |
| `BK-MF3-08` | `../guias-bk/MF3/BK-MF3-08-funcionalidades-comunidade.md` | `CRIADO (Fase 2)` |
| `BK-MF4-01` | `../guias-bk/MF4/BK-MF4-01-planos-ciclo-subscricao.md` | `CRIADO (Fase 1)` |
| `BK-MF4-02` | `../guias-bk/MF4/BK-MF4-02-metodos-pagamento-simulados-trial.md` | `CRIADO (Fase 1)` |
| `BK-MF4-03` | `../guias-bk/MF4/BK-MF4-03-candidaturas-associacoes.md` | `CRIADO (Fase 1)` |
| `BK-MF4-04` | `../guias-bk/MF4/BK-MF4-04-aprovacao-entrada-pool.md` | `CRIADO (Fase 1)` |
| `BK-MF4-05` | `../guias-bk/MF4/BK-MF4-05-distribuicao-mensal-rotacao.md` | `CRIADO (Fase 1)` |
| `BK-MF4-06` | `../guias-bk/MF4/BK-MF4-06-relatorios-e-historico-por-associacao.md` | `CRIADO (Fase 2)` |
| `BK-MF4-07` | `../guias-bk/MF4/BK-MF4-07-workflow-editorial-e-denuncias.md` | `CRIADO (Fase 2)` |
| `BK-MF4-08` | `../guias-bk/MF4/BK-MF4-08-notificacoes-transacionais-e-preferencias.md` | `CRIADO (Fase 2)` |
| `BK-MF5-01` | `../guias-bk/MF5/BK-MF5-01-exportacao-dados-utilizador.md` | `CRIADO (Fase 1)` |
| `BK-MF5-02` | `../guias-bk/MF5/BK-MF5-02-eliminacao-conta-dados.md` | `CRIADO (Fase 1)` |
| `BK-MF5-03` | `../guias-bk/MF5/BK-MF5-03-gestao-consentimentos.md` | `CRIADO (Fase 1)` |
| `BK-MF5-04` | `../guias-bk/MF5/BK-MF5-04-gestao-de-utilizadores-admin.md` | `CRIADO (Fase 2)` |
| `BK-MF5-05` | `../guias-bk/MF5/BK-MF5-05-painel-de-metricas-admin.md` | `CRIADO (Fase 2)` |
| `BK-MF5-06` | `../guias-bk/MF5/BK-MF5-06-configuracao-de-integracoes-admin.md` | `CRIADO (Fase 2)` |
| `BK-MF5-07` | `../guias-bk/MF5/BK-MF5-07-perfis-familiares-e-dispositivos.md` | `CRIADO (Fase 2)` |
| `BK-MF5-08` | `../guias-bk/MF5/BK-MF5-08-gamificacao-baseline.md` | `CRIADO (Fase 2)` |
| `BK-MF6-01` | `../guias-bk/MF6/BK-MF6-01-suite-de-regressao-backend.md` | `CRIADO (Fase 3)` |
| `BK-MF6-02` | `../guias-bk/MF6/BK-MF6-02-suite-de-regressao-frontend.md` | `CRIADO (Fase 3)` |
| `BK-MF6-03` | `../guias-bk/MF6/BK-MF6-03-hardening-seguranca-e-privacidade.md` | `CRIADO (Fase 3)` |
| `BK-MF6-04` | `../guias-bk/MF6/BK-MF6-04-otimizacao-de-performance-critica.md` | `CRIADO (Fase 3)` |
| `BK-MF6-05` | `../guias-bk/MF6/BK-MF6-05-acessibilidade-e-ux-final.md` | `CRIADO (Fase 3)` |
| `BK-MF6-06` | `../guias-bk/MF6/BK-MF6-06-validacao-tecnica-final-por-gate.md` | `CRIADO (Fase 3)` |
| `BK-MF7-01` | `../guias-bk/MF7/BK-MF7-01-matriz-de-cobertura-rf-evidencia.md` | `CRIADO (Fase 3)` |
| `BK-MF7-02` | `../guias-bk/MF7/BK-MF7-02-matriz-de-cobertura-rnf-validacao.md` | `CRIADO (Fase 3)` |
| `BK-MF7-03` | `../guias-bk/MF7/BK-MF7-03-roteiro-de-demo-final.md` | `CRIADO (Fase 3)` |
| `BK-MF7-04` | `../guias-bk/MF7/BK-MF7-04-ensaio-tecnico-da-defesa.md` | `CRIADO (Fase 3)` |
| `BK-MF7-05` | `../guias-bk/MF7/BK-MF7-05-avaliacao-final-e-feedback-orientador.md` | `CRIADO (Fase 3)` |
| `BK-MF8-01` | `../guias-bk/MF8/BK-MF8-01-lista-de-riscos-residuais.md` | `CRIADO (Fase 3)` |
| `BK-MF8-02` | `../guias-bk/MF8/BK-MF8-02-correcao-de-bugs-bloqueantes.md` | `CRIADO (Fase 3)` |
| `BK-MF8-03` | `../guias-bk/MF8/BK-MF8-03-scope-freeze-final.md` | `CRIADO (Fase 3)` |
| `BK-MF8-04` | `../guias-bk/MF8/BK-MF8-04-empacotamento-final-de-entrega.md` | `CRIADO (Fase 3)` |
| `BK-MF8-05` | `../guias-bk/MF8/BK-MF8-05-retro-final-e-licoes-aprendidas.md` | `CRIADO (Fase 3)` |

---

## MF0 - Kickoff e governance

| BK          | Titulo                                     | Owner | Apoio                       | Pri | Estado | Esforco | Dependencias            | RF/RNF      |
| ----------- | ------------------------------------------ | ----- | --------------------------- | --- | ------ | ------- | ----------------------- | ----------- |
| `BK-MF0-01` | Publicar plano total                       | Nuno  | -                           | P0  | TODO   | S       | -                       | transversal |
| `BK-MF0-02` | Publicar distribuicao de responsabilidades | Nuno  | -                           | P0  | TODO   | S       | `BK-MF0-01`             | transversal |
| `BK-MF0-03` | Publicar backlog atomico inicial           | Nuno  | Matheus, Mateus, Davi, Kaue | P0  | TODO   | M       | `BK-MF0-01`             | transversal |
| `BK-MF0-04` | Definir DoD e formato de evidencia         | Nuno  | Matheus, Mateus, Davi, Kaue | P0  | TODO   | S       | `BK-MF0-03`             | transversal |
| `BK-MF0-05` | Definir calendario de sprints              | Nuno  | -                           | P0  | TODO   | S       | `BK-MF0-03`             | transversal |
| `BK-MF0-06` | Reuniao de alinhamento inicial             | Nuno  | Matheus, Mateus, Davi, Kaue | P0  | TODO   | S       | `BK-MF0-02`,`BK-MF0-05` | transversal |

---

## MF1 - Fundacao tecnica

| BK          | Titulo                                      | Owner   | Apoio   | Pri | Estado | Esforco | Dependencias            | RF/RNF       |
| ----------- | ------------------------------------------- | ------- | ------- | --- | ------ | ------- | ----------------------- | ------------ |
| `BK-MF1-01` | Estrutura base backend por modulos          | Matheus | Davi    | P0  | TODO   | M       | `BK-MF0-06`             | RNF27        |
| `BK-MF1-02` | Estrutura base frontend por componentes     | Mateus  | Kaue    | P0  | TODO   | M       | `BK-MF0-06`             | RNF28        |
| `BK-MF1-03` | Cliente API frontend com tratamento de erro | Mateus  | Matheus | P0  | TODO   | M       | `BK-MF1-02`             | RNF05, RNF30 |
| `BK-MF1-04` | Sessao segura backend (cookies e auth base) | Matheus | Kaue    | P0  | TODO   | M       | `BK-MF1-01`             | RNF13, RNF15 |
| `BK-MF1-05` | Health-check e logging estruturado          | Kaue    | Davi    | P1  | TODO   | S       | `BK-MF1-01`             | RNF30, RNF31 |
| `BK-MF1-06` | Smoke tests FE/BE                           | Kaue    | Mateus  | P1  | TODO   | M       | `BK-MF1-03`,`BK-MF1-04` | RNF29        |

---

## MF2 - Core streaming MVP (`RF01..RF18`)

| BK          | Titulo                                   | Owner   | Apoio   | Pri | Estado | Esforco | Dependencias            | RF/RNF                 |
| ----------- | ---------------------------------------- | ------- | ------- | --- | ------ | ------- | ----------------------- | ---------------------- |
| `BK-MF2-01` | Registo, login e recuperacao de password | Matheus | Mateus  | P0  | TODO   | L       | `BK-MF1-04`             | RF01, RF02, RF05       |
| `BK-MF2-02` | Edicao de perfil e papeis base           | Matheus | Kaue    | P0  | TODO   | M       | `BK-MF2-01`             | RF03, RF04             |
| `BK-MF2-03` | CRUD de catalogo e taxonomias            | Davi    | Matheus | P0  | TODO   | L       | `BK-MF1-01`             | RF06, RF07, RF09, RF10 |
| `BK-MF2-04` | Pagina de detalhe de conteudo            | Mateus  | Davi    | P0  | TODO   | M       | `BK-MF2-03`             | RF08                   |
| `BK-MF2-05` | Reproducao e continuar a ver             | Mateus  | Matheus | P0  | TODO   | L       | `BK-MF2-04`             | RF11, RF12             |
| `BK-MF2-06` | Legendas/audio, parental e qualidade     | Mateus  | Kaue    | P1  | TODO   | M       | `BK-MF2-05`             | RF13, RF14, RF15       |
| `BK-MF2-07` | Favoritos/watchlist/historico            | Davi    | Mateus  | P0  | TODO   | M       | `BK-MF2-05`             | RF16, RF17, RF18       |
| `BK-MF2-08` | Teste E2E do fluxo principal             | Kaue    | Mateus  | P0  | TODO   | M       | `BK-MF2-01`,`BK-MF2-07` | RNF07, RNF08           |

---

## MF3 - Descoberta e comunidade (`RF19..RF34`)

| BK          | Titulo                             | Owner   | Apoio   | Pri | Estado | Esforco | Dependencias            | RF/RNF           |
| ----------- | ---------------------------------- | ------- | ------- | --- | ------ | ------- | ----------------------- | ---------------- |
| `BK-MF3-01` | Ratings e agregacao                | Davi    | Matheus | P1  | TODO   | M       | `BK-MF2-07`             | RF19, RF21       |
| `BK-MF3-02` | Comentarios curtos moderados       | Matheus | Kaue    | P2  | TODO   | M       | `BK-MF3-01`             | RF20             |
| `BK-MF3-03` | Pesquisa unificada                 | Davi    | Mateus  | P0  | TODO   | M       | `BK-MF2-03`             | RF22             |
| `BK-MF3-04` | Filtros, carrosseis e relacionados | Mateus  | Davi    | P1  | TODO   | M       | `BK-MF3-03`             | RF23, RF24, RF25 |
| `BK-MF3-05` | Recomendacao baseline + cold start | Davi    | Matheus | P1  | TODO   | L       | `BK-MF3-01`,`BK-MF2-07` | RF26, RF27       |
| `BK-MF3-06` | Explicabilidade de recomendacao    | Mateus  | Davi    | P2  | TODO   | S       | `BK-MF3-05`             | RF28, RNF34      |
| `BK-MF3-07` | Estudo biblico e guias             | Kaue    | Davi    | P1  | TODO   | M       | `BK-MF2-04`             | RF29, RF30, RF31 |
| `BK-MF3-08` | Funcionalidades comunidade         | Mateus  | Kaue    | P2  | TODO   | M       | `BK-MF3-02`             | RF32, RF33, RF34 |

---

## MF4 - Monetizacao solidaria (`RF35..RF54`)

| BK          | Titulo                                    | Owner   | Apoio   | Pri | Estado | Esforco | Dependencias | RF/RNF                 |
| ----------- | ----------------------------------------- | ------- | ------- | --- | ------ | ------- | ------------ | ---------------------- |
| `BK-MF4-01` | Planos e ciclo de subscricao              | Matheus | Davi    | P0  | TODO   | L       | `BK-MF2-01`  | RF35, RF36, RF38, RF39 |
| `BK-MF4-02` | Metodos de pagamento simulados e trial    | Davi    | Matheus | P0  | TODO   | M       | `BK-MF4-01`  | RF37, RF40             |
| `BK-MF4-03` | Candidaturas de associacoes               | Kaue    | Davi    | P0  | TODO   | M       | `BK-MF1-04`  | RF41                   |
| `BK-MF4-04` | Aprovacao e entrada na pool               | Matheus | Kaue    | P0  | TODO   | M       | `BK-MF4-03`  | RF42, RF43             |
| `BK-MF4-05` | Distribuicao mensal e rotacao             | Davi    | Matheus | P0  | TODO   | L       | `BK-MF4-04`  | RF44, RF45             |
| `BK-MF4-06` | Relatorios e historico por associacao     | Kaue    | Mateus  | P1  | TODO   | M       | `BK-MF4-05`  | RF46, RF47, RF48       |
| `BK-MF4-07` | Workflow editorial e denuncias            | Kaue    | Matheus | P1  | TODO   | M       | `BK-MF3-02`  | RF49, RF50, RF51       |
| `BK-MF4-08` | Notificacoes transacionais e preferencias | Mateus  | Davi    | P1  | TODO   | M       | `BK-MF4-01`  | RF52, RF53, RF54       |

---

## MF5 - Operacao e privacidade (`RF55..RF63`)

| BK          | Titulo                            | Owner   | Apoio   | Pri | Estado | Esforco | Dependencias            | RF/RNF     |
| ----------- | --------------------------------- | ------- | ------- | --- | ------ | ------- | ----------------------- | ---------- |
| `BK-MF5-01` | Exportacao de dados do utilizador | Matheus | Kaue    | P0  | TODO   | M       | `BK-MF2-01`             | RF55       |
| `BK-MF5-02` | Eliminacao de conta e dados       | Matheus | Kaue    | P0  | TODO   | M       | `BK-MF5-01`             | RF56       |
| `BK-MF5-03` | Gestao de consentimentos          | Mateus  | Matheus | P0  | TODO   | M       | `BK-MF2-01`             | RF57       |
| `BK-MF5-04` | Gestao de utilizadores admin      | Kaue    | Matheus | P1  | TODO   | M       | `BK-MF2-02`             | RF58       |
| `BK-MF5-05` | Painel de metricas admin          | Davi    | Mateus  | P1  | TODO   | M       | `BK-MF5-04`             | RF59       |
| `BK-MF5-06` | Configuracao de integracoes admin | Davi    | Matheus | P1  | TODO   | M       | `BK-MF5-04`             | RF60       |
| `BK-MF5-07` | Perfis familiares e dispositivos  | Mateus  | Kaue    | P1  | TODO   | L       | `BK-MF2-02`,`BK-MF2-05` | RF61, RF62 |
| `BK-MF5-08` | Gamificacao baseline              | Kaue    | Mateus  | P2  | TODO   | M       | `BK-MF5-07`             | RF63       |

---

## MF6 - Hardening tecnico

| BK          | Titulo                            | Owner   | Apoio                       | Pri | Estado | Esforco | Dependencias            | RF/RNF              |
| ----------- | --------------------------------- | ------- | --------------------------- | --- | ------ | ------- | ----------------------- | ------------------- |
| `BK-MF6-01` | Suite de regressao backend        | Kaue    | Matheus                     | P0  | TODO   | M       | `BK-MF5-08`             | RNF29               |
| `BK-MF6-02` | Suite de regressao frontend       | Kaue    | Mateus                      | P0  | TODO   | M       | `BK-MF5-08`             | RNF29               |
| `BK-MF6-03` | Hardening seguranca e privacidade | Matheus | Kaue                        | P0  | TODO   | M       | `BK-MF6-01`             | RNF13..RNF20, RNF37 |
| `BK-MF6-04` | Otimizacao de performance critica | Davi    | Mateus                      | P1  | TODO   | M       | `BK-MF6-02`             | RNF07..RNF12        |
| `BK-MF6-05` | Acessibilidade e UX final         | Mateus  | Kaue                        | P1  | TODO   | M       | `BK-MF6-02`             | RNF01..RNF06        |
| `BK-MF6-06` | Validacao tecnica final por gate  | Nuno    | Matheus, Mateus, Davi, Kaue | P0  | TODO   | S       | `BK-MF6-03`,`BK-MF6-05` | transversal         |

---

## MF7 - Consolidacao e evidencia PAP

| BK          | Titulo                                | Owner   | Apoio                       | Pri | Estado | Esforco | Dependencias            | RF/RNF       |
| ----------- | ------------------------------------- | ------- | --------------------------- | --- | ------ | ------- | ----------------------- | ------------ |
| `BK-MF7-01` | Matriz de cobertura RF -> evidencia   | Kaue    | Matheus, Mateus, Davi       | P0  | TODO   | M       | `BK-MF6-06`             | RF01..RF63   |
| `BK-MF7-02` | Matriz de cobertura RNF -> validacao  | Davi    | Kaue                        | P0  | TODO   | M       | `BK-MF6-06`             | RNF01..RNF40 |
| `BK-MF7-03` | Roteiro de demo final                 | Mateus  | Kaue                        | P1  | TODO   | S       | `BK-MF7-01`             | transversal  |
| `BK-MF7-04` | Ensaio tecnico da defesa              | Matheus | Davi                        | P1  | TODO   | S       | `BK-MF7-03`             | transversal  |
| `BK-MF7-05` | Avaliacao final e feedback orientador | Nuno    | Matheus, Mateus, Davi, Kaue | P0  | TODO   | S       | `BK-MF7-02`,`BK-MF7-04` | transversal  |

---

## MF8 - Buffer e fecho

| BK          | Titulo                          | Owner   | Apoio                       | Pri | Estado | Esforco | Dependencias | RF/RNF      |
| ----------- | ------------------------------- | ------- | --------------------------- | --- | ------ | ------- | ------------ | ----------- |
| `BK-MF8-01` | Lista de riscos residuais       | Kaue    | Davi                        | P0  | TODO   | S       | `BK-MF7-05`  | transversal |
| `BK-MF8-02` | Correcao de bugs bloqueantes    | Matheus | Mateus, Davi, Kaue          | P0  | TODO   | M       | `BK-MF8-01`  | transversal |
| `BK-MF8-03` | Scope freeze final              | Nuno    | Matheus, Mateus, Davi, Kaue | P0  | TODO   | S       | `BK-MF8-02`  | transversal |
| `BK-MF8-04` | Empacotamento final de entrega  | Kaue    | Mateus                      | P1  | TODO   | S       | `BK-MF8-03`  | transversal |
| `BK-MF8-05` | Retro final e licoes aprendidas | Nuno    | Matheus, Mateus, Davi, Kaue | P1  | TODO   | S       | `BK-MF8-04`  | transversal |

## Criterios de aceite globais por BK (step-by-step)

1. Implementacao concluida pelo owner.
2. Testes minimos executados com resultado.
3. Politica de negativos validada por prioridade (`P0/P1 >= 3`, `P2 >= 1`).
4. Criterios de aceite mensuraveis validados no guia do BK.
5. Evidence anexada com trio `pr`, `proof`, `neg`.
6. Revisao tecnica concluida.
7. Estado atualizado para `DONE`.

## Gates de conformidade documental

- Gate `S4`: auditoria de cobertura de matriz + conformidade de guias da janela S1..S4.
- Gate `S8`: auditoria de coerencia backlog/matriz/guias para S5..S8.
- Gate `S12`: auditoria final integral para defesa PAP.
- Relatorio PASS/FAIL oficial: `docs/planificacao/sprints/RELATORIO-GATES-S4-S8-S12.md`.
- Score final e regra de aprovacao: consolidados no relatorio de gates (`S4/S8/S12`).
- Pesos oficiais e formulario de score por sprint: `docs/planificacao/sprints/SCORECARD-OFICIAL-POR-SPRINT.md`.
- Checkpoints e remediacao docente: `docs/planificacao/sprints/GUIAO-DOCENTE-SEMANAL.md`.
- Comando de pre-fecho: `bash scripts/validate-planificacao.sh`.

## Changelog

- `2026-04-11`: versao revista para equipa correta e ownership distribuido por 4 alunos.
- `2026-04-12`: secao de ligacao para guias BK atualizada para cobertura total (60/60), com estado por fase de criacao documental.
- `2026-04-13`: adicionado contrato com matriz RF/RNF, politica pedagogica v2 e gates obrigatorios S4/S8/S12.
- `2026-04-13`: evoluido para contrato pedagogico v3 com score `97/100` e validacao automatica obrigatoria.
- `2026-04-13`: removidas referencias a ficheiro externo de score; avaliacao documental passa a ser registada diretamente no relatorio de gates.
- `2026-04-14`: reforcado contrato canonico de campos BK e validacao cruzada backlog<->matriz<->guias<->sprints.
