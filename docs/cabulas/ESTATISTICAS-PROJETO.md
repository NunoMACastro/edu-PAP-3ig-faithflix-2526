# Estatísticas Do Projeto - FaithFlix

Data do levantamento: 2026-07-15
Base do levantamento: checkout local `faithflix`

## Critérios De Contagem

- Documentação: ficheiros Markdown (`.md`) dentro de `docs/`, incluindo `docs/planificacao/` e este ficheiro.
- Ficheiros da app: ficheiros próprios textuais dentro de `real_dev/backend` e `real_dev/frontend`, incluindo código, configs, `package.json`, `package-lock.json`, `.env.example` e README técnico.
- Código estrito: subconjunto dos ficheiros da app com extensões `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.css` e `.html`.
- Exclusões da app: `node_modules`, `dist`, `build`, `coverage`, `playwright-report`, `test-results`, caches, `.DS_Store`, `.env` local, ficheiros binários (`.png`, `.mp4`, `.webp`) e outros artefactos gerados ou específicos da máquina, incluindo `real_dev/frontend/public/media/demo`.
- Linha contabilizada: linha física de ficheiro. Linhas em branco e comentários contam, porque representam linhas reais mantidas no projeto.
- Backend: `real_dev/backend`.
- Frontend: `real_dev/frontend`.

## Documentação

| Categoria                            |                                           Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------------------------------ | -----------------------------------------------: | --------: | -----: | -----------------: |
| Total de documentação e planificação |                                   `docs/**/*.md` |       170 |  85497 |             502.92 |
| Documentação geral                   | `docs/**/*.md`, excluindo `docs/planificacao/**` |        52 |   9672 |             186.00 |
| Planificação                         |                      `docs/planificacao/**/*.md` |       118 |  75825 |             642.58 |

A maior parte da documentação textual do projeto está na planificação. A planificação representa `118` dos `170` ficheiros Markdown contabilizados, ou seja, `69.41%` dos ficheiros e `88.69%` das linhas de documentação.

## Código

### Ficheiros Da App

| Área         |                                   Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------ | ---------------------------------------: | --------: | -----: | -----------------: |
| Total da app | `real_dev/backend` + `real_dev/frontend` |       424 |  95814 |             225.98 |
| Backend      |                       `real_dev/backend` |       238 |  55076 |             231.41 |
| Frontend     |                      `real_dev/frontend` |       186 |  40738 |             219.02 |

Esta contagem inclui os ficheiros de suporte que fazem parte do projeto, como `package-lock.json`, `package.json`, `.env.example`, `README.md` e scripts técnicos. Não inclui assets binários nem os 192 assets gerados em `real_dev/frontend/public/media/demo`, porque não representam ficheiros textuais mantidos manualmente na aplicação.

Os ficheiros auxiliares próprios representam `10` ficheiros e `7322` linhas: `5` ficheiros / `1201` linhas no backend e `5` ficheiros / `6121` linhas no frontend.

### Código Estrito

| Área                    |                                   Âmbito | Ficheiros | Linhas de código | Média por ficheiro |
| ----------------------- | ---------------------------------------: | --------: | ---------------: | -----------------: |
| Total de código estrito | `real_dev/backend` + `real_dev/frontend` |       414 |            88492 |             213.75 |
| Backend                 |                       `real_dev/backend` |       233 |            53875 |             231.22 |
| Frontend                |                      `real_dev/frontend` |       181 |            34617 |             191.25 |

## Código Por Extensão

| Extensão |     Área | Ficheiros | Linhas |
| -------- | -------: | --------: | -----: |
| `.js`    |  Backend |       231 |  53430 |
| `.mjs`   |  Backend |         2 |    445 |
| `.jsx`   | Frontend |       126 |  21328 |
| `.js`    | Frontend |        51 |   5629 |
| `.css`   | Frontend |         2 |   7459 |
| `.mjs`   | Frontend |         1 |    188 |
| `.html`  | Frontend |         1 |     13 |

## Funções E Estrutura Interna

A contagem de funções foi feita por AST com o parser de Babel, sobre ficheiros `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` e `.cjs`. A métrica "funções" inclui declarações `function`, function expressions, métodos de objetos, métodos de classes, construtores e arrow functions. Também inclui callbacks de testes, porque são funções reais mantidas no codebase.

| Métrica                             | Total | Backend | Frontend |
| ----------------------------------- | ----: | ------: | -------: |
| Funções / construções function-like |  5633 |    3432 |     2201 |
| Declarações `function`              |  1483 |    1053 |      430 |
| Function expressions                |     4 |       3 |        1 |
| Arrow functions                     |  3525 |    1877 |     1648 |
| Métodos de classes                  |    21 |      15 |        6 |
| Métodos de objetos                  |   590 |     476 |      114 |
| Construtores                        |    10 |       8 |        2 |
| Classes                             |    12 |       8 |        4 |

## Testes E Código Fonte

| Métrica                   | Total | Backend | Frontend |
| ------------------------- | ----: | ------: | -------: |
| Ficheiros dentro de `src` |   321 |     145 |      176 |
| Linhas dentro de `src`    | 57455 |   23997 |    33458 |
| Ficheiros de teste        |   125 |      58 |       67 |
| Linhas de teste           | 32001 |   22520 |     9481 |

As linhas de teste representam `33.40%` das linhas dos ficheiros próprios da app. As linhas dentro de `src` representam `59.97%` das linhas dos ficheiros próprios da app.

## Leitura Rápida

- O projeto tem `170` ficheiros Markdown de documentação e planificação.
- A documentação e planificação somam `85497` linhas.
- A app em `real_dev` tem `424` ficheiros próprios textuais, incluindo código e auxiliares do projeto.
- Esses ficheiros próprios da app somam `95814` linhas.
- Dentro desses ficheiros, o código estrito soma `414` ficheiros e `88492` linhas.
- O codebase tem `5633` funções/construções function-like contabilizadas por AST.
- O backend expõe `112` handlers HTTP Express em `24` ficheiros de rotas.
- Existem `125` ficheiros de teste, com `32001` linhas.
- O backend concentra `56.13%` dos ficheiros próprios da app e `57.48%` das linhas da app.
- O frontend concentra `43.87%` dos ficheiros próprios da app e `42.52%` das linhas da app.
