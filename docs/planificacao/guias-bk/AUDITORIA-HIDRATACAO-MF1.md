# Auditoria de hidratacao BK - MF1

## Header

- `doc_id`: `AUDITORIA-HIDRATACAO-MF1`
- `path`: `docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF1.md`
- `macro_fase_auditada`: `MF1`
- `data`: `2026-05-29`
- `status`: `hidratacao_executada_validacao_bloqueada`

## Objetivo

Auditar e acompanhar a hidratacao pedagogica/tecnica dos guias BK da `MF1`, com foco em alunos do 12.º ano. A `MF1` e a primeira macrofase de implementacao tecnica real da FaithFlix, por isso os guias devem ser tutoriais executaveis para fundacao backend, frontend, cliente API, sessao segura, health/logging e smoke tests.

Esta atualizacao regista a hidratacao feita nos guias anteriormente classificados como `PARCIAL` ou `CRITICO`. Nao foram alterados RF, RNF, IDs BK, owners, prioridades, dependencias, matriz canonica, backlog ou escopo.

## Fontes consultadas

- `README.md`
- `docs/RF.md`
- `docs/RNF.md`
- `docs/planificacao/PLANO-IMPLEMENTACAO-TOTAL.md`
- `docs/planificacao/backlogs/BACKLOG-MVP.md`
- `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `docs/planificacao/backlogs/MF-VIEWS.md`
- `docs/planificacao/guias-bk/_TEMPLATE-BK.md`
- `docs/planificacao/guias-bk/MF0/BK-MF0-06-reuniao-alinhamento-inicial.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-01-estrutura-base-backend-modulos.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-02-estrutura-base-frontend-componentes.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-03-cliente-api-frontend-tratamento-erro.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-05-health-check-e-logging-estruturado.md`
- `docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md`
- `docs/planificacao/guias-bk/MF2/BK-MF2-01-modelo-user-auth.md`
- `docs/planificacao/guias-bk/MF2/BK-MF2-03-api-auth-registo-login-logout.md`
- `docs/planificacao/guias-bk/MF4/BK-MF4-03-watch-history.md`

## Scaffold real observado

- Existe `mockup/`, com `mockup/package.json` e `mockup/vite.config.ts`.
- Nao foi encontrado scaffold real da app final em `backend/`, `frontend/`, `apps/api`, `apps/web`, `server/` ou `client/`.
- Os guias MF1 foram hidratados como tutoriais para criar o primeiro scaffold real, sem fingir que esse scaffold ja existe no repositorio.
- Nao foram criados ficheiros reais `backend/`, `frontend/` ou `docs/evidence/`; os blocos de codigo foram colocados dentro dos guias BK, como instrucoes executaveis.

## Resultado global pos-hidratacao

| Metricas | Total |
| --- | ---: |
| BK analisados | 6 |
| `OK` | 6 |
| `PARCIAL` | 0 |
| `CRITICO` | 0 |

## Classificacao por BK

| BK | Guia | Classificacao inicial | Classificacao atual | Sintese da hidratacao |
| --- | --- | --- | --- | --- |
| `BK-MF1-01` | `docs/planificacao/guias-bk/MF1/BK-MF1-01-estrutura-base-backend-modulos.md` | `CRITICO` | `OK` | Passou a incluir scaffold backend Express completo, ficheiros novos, configuracao de ambiente, rotas base, 404, error handler, payloads, negativos, evidence e handoff. |
| `BK-MF1-02` | `docs/planificacao/guias-bk/MF1/BK-MF1-02-estrutura-base-frontend-componentes.md` | `CRITICO` | `OK` | Passou a incluir scaffold frontend React/Vite completo, rotas, layout, componentes, paginas, CSS, validacao manual e bloqueio explicito caso a decisao final seja Next.js. |
| `BK-MF1-03` | `docs/planificacao/guias-bk/MF1/BK-MF1-03-cliente-api-frontend-tratamento-erro.md` | `CRITICO` | `OK` | Passou a incluir cliente API completo com `fetch`, erros normalizados, `credentials: include`, env, `systemApi`, componente de estado, payloads e negativos. |
| `BK-MF1-04` | `docs/planificacao/guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md` | `CRITICO` | `OK` | Passou a incluir base de sessao segura com cookie config, parser, middleware, service, routes, controller, montagem Express, logout e negativos de privacidade. |
| `BK-MF1-05` | `docs/planificacao/guias-bk/MF1/BK-MF1-05-health-check-e-logging-estruturado.md` | `PARCIAL` | `OK` | Passou a incluir health service/controller/routes, logger com redacao de dados sensiveis, request logger, error handler integrado, exemplos de log e evidencia operacional. |
| `BK-MF1-06` | `docs/planificacao/guias-bk/MF1/BK-MF1-06-smoke-tests-fe-be.md` | `CRITICO` | `OK` | Passou a incluir testes smoke completos com `node:test`, helper de servidor, scripts backend/frontend/raiz, negativos, evidence MF1 e handoff para `BK-MF2-01`. |

## BKs hidratados

### `BK-MF1-01`

- Ficou mais concreto por passar de roteiro com snippets para tutorial de criacao de backend.
- Define exatamente que ficheiros criar em `backend/`.
- Fornece codigo completo para `package.json`, `.env.example`, config de ambiente, app Express, servidor, rotas, controller, utilitario de erro, middleware de erro e README.
- Mantem fora do escopo catalogo, streaming, base de dados, autenticacao real, pagamentos e subscricoes.

### `BK-MF1-02`

- Ficou mais concreto por transformar a base frontend em codigo executavel.
- Define a estrutura `frontend/`, rotas, layout, componentes reutilizaveis, paginas placeholder e estilos globais.
- Inclui `Bloqueio / decisao necessaria` para a escolha final `React + Vite` vs `Next.js`, porque `RNF.md` sugere Next.js mas os guias assumem Vite por simplicidade pedagogica.
- Mantem fora do escopo login real, catalogo real, dados persistidos e integracao API funcional.

### `BK-MF1-03`

- Ficou mais concreto por fornecer a fronteira frontend/backend com cliente API completo.
- Inclui helpers `get`, `post`, `put`, `patch` e `del`, tratamento de erro, parsing seguro e envio de cookies com `credentials: 'include'`.
- Documenta payloads/respostas esperadas para sucesso, 404, backend offline e respostas nao JSON.
- Inclui bloqueio sobre `Axios` vs `fetch`, sem alterar `RNF.md` nem inventar dependencia.

### `BK-MF1-04`

- Ficou mais concreto por fechar uma base segura de sessao sem autenticar utilizadores ficticios.
- Define cookie HttpOnly, SameSite, Secure em producao, parser defensivo, middleware de sessao e endpoints base.
- Inclui negativos para ausencia de cookie, cookie falso, logout e exposicao indevida de tokens.
- Mantem fora do escopo registo, login, passwords, JWT/opaco definitivo, perfis reais e base de dados.

### `BK-MF1-05`

- Ficou mais concreto por entregar health-check e logging estruturado com codigo completo.
- Inclui redacao de dados sensiveis em logs, `x-request-id`, exemplos de resposta `/health` e exemplos de logs.
- Evita health enganador com MongoDB, pagamentos, DRM ou streaming avancado, porque esses componentes ainda nao existem.
- Documenta a decisao pendente sobre `RNF30`, sem alterar rastreabilidade canonica.

### `BK-MF1-06`

- Ficou mais concreto por entregar o gate smoke de fim da MF1.
- Inclui helper de servidor sem porta fixa, testes para `/health`, `/api`, 404 e sessao sem cookie/cookie falso.
- Inclui scripts `smoke` e estrutura de evidencia para defesa PAP.
- Documenta que `/health` vem de `BK-MF1-05` por sequencia operacional, apesar de as dependencias canonicas indicarem `BK-MF1-03,BK-MF1-04`.

## Top 5 BKs que precisam de hidratacao

Depois da hidratacao, nao existem BKs ativos em `PARCIAL` ou `CRITICO`.

Historicamente, antes desta atualizacao, os cinco BKs com maior prioridade de hidratacao eram:

1. `BK-MF1-04` - seguranca de sessao/cookies.
2. `BK-MF1-01` - primeiro backend real.
3. `BK-MF1-02` - primeiro frontend real.
4. `BK-MF1-03` - fronteira frontend/backend.
5. `BK-MF1-06` - gate tecnico para entrar em `MF2`.

`BK-MF1-05` tambem foi hidratado, apesar de ter sido classificado inicialmente como `PARCIAL`.

## Drift encontrado

### Sem drift estrutural novo

- `bk_id`, `macro`, `owner`, `apoio`, `prioridade`, `estado`, `esforco`, `dependencias`, `rf_rnf`, `proximo_bk` e `guia_path` nao foram alterados.
- A sequencia `BK-MF1-01 -> BK-MF1-02 -> BK-MF1-03 -> BK-MF1-04 -> BK-MF1-05 -> BK-MF1-06 -> BK-MF2-01` continua coerente com `MF-VIEWS.md`.
- A hidratacao nao introduziu catalogo, streaming, favoritos, recomendacoes, subscricoes, pool solidaria, pagamentos, DRM ou operacao avancada fora do escopo da `MF1`.

### Drift semantico / decisoes pendentes documentadas

- `RNF30` define logging estruturado com niveis e contexto.
- No backlog e matriz canonica, `RNF30` aparece associado a `BK-MF1-03`, que e um BK de cliente API frontend e tratamento de erro.
- O trabalho backend de logging estruturado aparece naturalmente em `BK-MF1-05`.
- A hidratacao documentou esta tensao em `BK-MF1-03` e `BK-MF1-05`, mas nao alterou `rf_rnf`, backlog ou matriz.
- Recomendacao: decidir com orientador se `RNF30` continua associado apenas a `BK-MF1-03` ou se a rastreabilidade deve ser ajustada de forma coordenada para incluir `BK-MF1-05`.

### Ambiguidades tecnicas assumidas com bloqueio

- `RNF.md` sugere `Next.js` e `Axios`; os guias `BK-MF1-02` e `BK-MF1-03` continuam a usar `React + Vite` e `fetch` por coerencia com a planificacao existente e simplicidade pedagogica.
- Como essa stack esta descrita como sugerida, a hidratacao nao altera contratos. Os guias passaram a incluir `Bloqueio / decisao necessaria` para impedir que alunos avancem sobre uma decisao tecnica nao fechada.
- `BK-MF1-06` testa `/health`, que vem de `BK-MF1-05`; a sequencia operacional ja coloca `BK-MF1-05` antes de `BK-MF1-06`, mas as dependencias canonicas continuam `BK-MF1-03,BK-MF1-04`. O guia passou a explicitar este pre-requisito sem alterar dependencias.

## Validacao automatica

Comando executado apos a hidratacao:

```bash
bash scripts/validate-planificacao.sh
```

Resultado:

- `FAIL` tecnico antes da validacao documental.
- Erro observado:

```text
/opt/homebrew/Cellar/python@3.14/3.14.5/Frameworks/Python.framework/Versions/3.14/Resources/Python.app/Contents/MacOS/Python: can't open file '/Users/nuno/Developer/EPMS/Terceiro Ano/2025.2026/PAP/faithflix/../scripts/validate_planificacao_canonica.py': [Errno 2] No such file or directory
```

- Motivo: `scripts/validate-planificacao.sh` tenta executar `../scripts/validate_planificacao_canonica.py`, mas esse ficheiro nao existe no caminho esperado.
- Impacto: a planificacao nao ficou automaticamente validada por script nesta execucao.
- Nota: esta falha nao resulta de uma incoerencia documental detetada nos guias MF1; o script termina antes de conseguir validar os documentos.

## Conclusao

Os seis guias da `MF1` foram hidratados e passam a estar classificados como `OK` em auditoria manual. A melhoria principal foi transformar roteiros com snippets em tutoriais executaveis, com ficheiros completos, instrucoes de localizacao, dependencias, validacoes, casos negativos, evidence para PR/defesa e handoff para o BK seguinte. As seccoes antigas de snippet foram mantidas por compatibilidade estrutural, mas passaram a apontar para a nova hidratacao completa para nao funcionarem como substituto parcial do tutorial.

Fica pendente apenas a correcao do script de validacao ou do caminho esperado para `validate_planificacao_canonica.py`, para permitir validacao automatica da planificacao.
