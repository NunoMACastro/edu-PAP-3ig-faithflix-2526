# Estatísticas Do Projeto - FaithFlix

Data do levantamento: 2026-07-12
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
| Total de documentação e planificação |                                   `docs/**/*.md` |       166 |  83014 |             500.08 |
| Documentação geral                   | `docs/**/*.md`, excluindo `docs/planificacao/**` |        48 |   7189 |             149.77 |
| Planificação                         |                      `docs/planificacao/**/*.md` |       118 |  75825 |             642.58 |

A maior parte da documentação textual do projeto está na planificação. A planificação representa `118` dos `166` ficheiros Markdown contabilizados.

## Código

### Ficheiros Da App

| Área         |                                   Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------ | ---------------------------------------: | --------: | -----: | -----------------: |
| Total da app | `real_dev/backend` + `real_dev/frontend` |       420 |  92032 |             219.12 |
| Backend      |                       `real_dev/backend` |       235 |  52513 |             223.46 |
| Frontend     |                      `real_dev/frontend` |       185 |  39519 |             213.62 |

Esta contagem inclui os ficheiros de suporte que fazem parte do projeto, como `package-lock.json`, `package.json`, `.env.example`, `README.md` e scripts técnicos. Não inclui assets binários nem os 192 assets gerados em `real_dev/frontend/public/media/demo`, porque não representam ficheiros textuais mantidos manualmente na aplicação.

Os ficheiros auxiliares próprios representam `10` ficheiros e `7320` linhas: `5` ficheiros / `1199` linhas no backend e `5` ficheiros / `6121` linhas no frontend.

### Código Estrito

| Área                    |                                   Âmbito | Ficheiros | Linhas de código | Média por ficheiro |
| ----------------------- | ---------------------------------------: | --------: | ---------------: | -----------------: |
| Total de código estrito | `real_dev/backend` + `real_dev/frontend` |       410 |            84712 |             206.61 |
| Backend                 |                       `real_dev/backend` |       230 |            51314 |             223.10 |
| Frontend                |                      `real_dev/frontend` |       180 |            33398 |             185.54 |

## Código Por Extensão

| Extensão |     Área | Ficheiros | Linhas |
| -------- | -------: | --------: | -----: |
| `.js`    |  Backend |       228 |  50869 |
| `.mjs`   |  Backend |         2 |    445 |
| `.jsx`   | Frontend |       125 |  20610 |
| `.js`    | Frontend |        51 |   5616 |
| `.css`   | Frontend |         2 |   6971 |
| `.mjs`   | Frontend |         1 |    188 |
| `.html`  | Frontend |         1 |     13 |

## Funções E Estrutura Interna

A contagem de funções foi feita por AST com o parser de Babel, sobre ficheiros `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` e `.cjs`. A métrica "funções" inclui declarações `function`, function expressions, métodos de objetos, métodos de classes, construtores e arrow functions. Também inclui callbacks de testes, porque são funções reais mantidas no codebase.

| Métrica                             | Total | Backend | Frontend |
| ----------------------------------- | ----: | ------: | -------: |
| Funções / construções function-like |  5397 |    3248 |     2149 |
| Declarações `function`              |  1446 |    1021 |      425 |
| Function expressions                |     4 |       3 |        1 |
| Arrow functions                     |  3344 |    1742 |     1602 |
| Métodos de classes                  |    21 |      15 |        6 |
| Métodos de objetos                  |   572 |     459 |      113 |
| Construtores                        |    10 |       8 |        2 |
| Classes                             |    12 |       8 |        4 |

## Testes E Código Fonte

| Métrica                   | Total | Backend | Frontend |
| ------------------------- | ----: | ------: | -------: |
| Ficheiros dentro de `src` |   320 |     145 |      175 |
| Linhas dentro de `src`    | 56016 |   23777 |    32239 |
| Ficheiros de teste        |   122 |      56 |       66 |
| Linhas de teste           | 30482 |   21288 |     9194 |

As linhas de teste representam `33.12%` das linhas dos ficheiros próprios da app. As linhas dentro de `src` representam `60.87%` das linhas dos ficheiros próprios da app.

## Leitura Rápida

- O projeto tem `166` ficheiros Markdown de documentação e planificação.
- A documentação e planificação somam `83014` linhas.
- A app em `real_dev` tem `420` ficheiros próprios textuais, incluindo código e auxiliares do projeto.
- Esses ficheiros próprios da app somam `92032` linhas.
- Dentro desses ficheiros, o código estrito soma `410` ficheiros e `84712` linhas.
- O codebase tem `5397` funções/construções function-like contabilizadas por AST.
- O backend expõe `111` handlers HTTP Express em `24` ficheiros de rotas.
- Existem `122` ficheiros de teste, com `30482` linhas.
- O backend concentra `55.95%` dos ficheiros próprios da app e `57.06%` das linhas da app.
- O frontend concentra `44.05%` dos ficheiros próprios da app e `42.94%` das linhas da app.
