# BACKLOG-MVP Faithflix

## Header

- `doc_id`: `BACKLOG-MVP`
- `path`: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `area`: `project`
- `owner`: `Nuno (orientacao)`
- `status`: `ativo`
- `last_updated`: `2026-04-11`

## Objetivo

Backlog atomico oficial do MVP, com owner unico por BK, dependencias, criterios de aceite e evidencias.

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
3. Criterios de aceite do BK validados.
4. Evidencia anexada (teste + screenshot/video + nota de validacao).
5. Revisao tecnica concluida.
6. Estado atualizado para `DONE`.

## Changelog

- `2026-04-11`: versao revista para equipa correta e ownership distribuido por 4 alunos.
