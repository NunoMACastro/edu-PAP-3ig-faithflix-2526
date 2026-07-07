# Estatísticas Do Projeto - FaithFlix

Data do levantamento: 2026-07-07
Base do levantamento: checkout local `faithflix`

## Critérios De Contagem

- Documentação: ficheiros Markdown (`.md`) dentro de `docs/`, incluindo `docs/planificacao/` e este ficheiro.
- Ficheiros da app: ficheiros próprios textuais dentro de `real_dev/backend` e `real_dev/frontend`, incluindo código, configs, `package.json`, `package-lock.json`, `.env.example` e README técnico.
- Código estrito: subconjunto dos ficheiros da app com extensões `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.css` e `.html`.
- Exclusões da app: `node_modules`, `dist`, `build`, `coverage`, `playwright-report`, `test-results`, caches, `.DS_Store`, `.env` local, ficheiros binários (`.png`, `.mp4`) e outros artefactos gerados ou específicos da máquina.
- Linha contabilizada: linha física de ficheiro. Linhas em branco e comentários contam, porque representam linhas reais mantidas no projeto.
- Backend: `real_dev/backend`.
- Frontend: `real_dev/frontend`.

## Documentação

| Categoria                            |                                           Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------------------------------ | -----------------------------------------------: | --------: | -----: | -----------------: |
| Total de documentação e planificação |                                   `docs/**/*.md` |       152 |  57345 |             377.27 |
| Documentação geral                   | `docs/**/*.md`, excluindo `docs/planificacao/**` |        36 |   3606 |             100.17 |
| Planificação                         |                      `docs/planificacao/**/*.md` |       116 |  53739 |             463.27 |

A maior parte da documentação textual do projeto está na planificação. A planificação representa `116` dos `152` ficheiros Markdown contabilizados.

## Código

### Ficheiros Da App

| Área         |                                   Âmbito | Ficheiros | Linhas | Média por ficheiro |
| ------------ | ---------------------------------------: | --------: | -----: | -----------------: |
| Total da app | `real_dev/backend` + `real_dev/frontend` |       215 |  29123 |             135.46 |
| Backend      |                       `real_dev/backend` |       134 |  19314 |             144.13 |
| Frontend     |                      `real_dev/frontend` |        81 |   9809 |             121.10 |

Esta contagem inclui os ficheiros de suporte que fazem parte do projeto, como `package-lock.json`, `package.json`, `.env.example`, `README.md` e scripts técnicos. Não inclui os ficheiros binários `real_dev/frontend/src/assets/faithflix-logo.png` e `real_dev/frontend/public/media/piloto.mp4`, porque não têm linhas textuais comparáveis.

Os ficheiros auxiliares próprios representam `8` ficheiros e `2699` linhas: `4` ficheiros / `1051` linhas no backend e `4` ficheiros / `1648` linhas no frontend.

### Código Estrito

| Área                    |                                   Âmbito | Ficheiros | Linhas de código | Média por ficheiro |
| ----------------------- | ---------------------------------------: | --------: | ---------------: | -----------------: |
| Total de código estrito | `real_dev/backend` + `real_dev/frontend` |       207 |            26424 |             127.65 |
| Backend                 |                       `real_dev/backend` |       130 |            18263 |             140.48 |
| Frontend                |                      `real_dev/frontend` |        77 |             8161 |             105.99 |

## Código Por Extensão

| Extensão |     Área | Ficheiros | Linhas |
| -------- | -------: | --------: | -----: |
| `.js`    |  Backend |       128 |  17829 |
| `.mjs`   |  Backend |         2 |    434 |
| `.jsx`   | Frontend |        50 |   5608 |
| `.js`    | Frontend |        23 |   1555 |
| `.css`   | Frontend |         2 |    798 |
| `.mjs`   | Frontend |         1 |    188 |
| `.html`  | Frontend |         1 |     12 |

## Funções E Estrutura Interna

A contagem de funções foi feita por AST com o parser de Babel, sobre ficheiros `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` e `.cjs`. A métrica "funções" inclui declarações `function`, function expressions, métodos de objetos, métodos de classes, construtores e arrow functions. Também inclui callbacks de testes, porque são funções reais mantidas no codebase.

| Métrica                             | Total | Backend | Frontend |
| ----------------------------------- | ----: | ------: | -------: |
| Funções / construções function-like |  1499 |    1014 |      485 |
| Declarações `function`              |   679 |     511 |      168 |
| Function expressions                |     0 |       0 |        0 |
| Arrow functions                     |   612 |     384 |      228 |
| Métodos de classes                  |     0 |       0 |        0 |
| Métodos de objetos                  |   206 |     118 |       88 |
| Construtores                        |     2 |       1 |        1 |
| Classes                             |     2 |       1 |        1 |

## Testes E Código Fonte

| Métrica                   | Total | Backend | Frontend |
| ------------------------- | ----: | ------: | -------: |
| Ficheiros dentro de `src` |   184 |     109 |       75 |
| Linhas dentro de `src`    | 19224 |   11271 |     7953 |
| Ficheiros de teste        |    12 |      12 |        0 |
| Linhas de teste           |  5690 |    5690 |        0 |

As linhas de teste representam `19.54%` das linhas dos ficheiros próprios da app. As linhas dentro de `src` representam `66.01%` das linhas dos ficheiros próprios da app.

## Leitura Rápida

- O projeto tem `152` ficheiros Markdown de documentação e planificação.
- A documentação e planificação somam `57345` linhas.
- A app em `real_dev` tem `215` ficheiros próprios textuais, incluindo código e auxiliares do projeto.
- Esses ficheiros próprios da app somam `29123` linhas.
- Dentro desses ficheiros, o código estrito soma `207` ficheiros e `26424` linhas.
- O codebase tem `1499` funções/construções function-like contabilizadas por AST.
- O backend expõe `90` handlers HTTP Express em `21` ficheiros de rotas.
- Existem `12` ficheiros de teste, com `5690` linhas.
- O backend concentra `62.33%` dos ficheiros próprios da app e `66.32%` das linhas da app.
- O frontend concentra `37.67%` dos ficheiros próprios da app e `33.68%` das linhas da app.
