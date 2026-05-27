# BK-MF1-05 - Health-check e logging estruturado

## Header

- `doc_id`: `GUIA-BK-MF1-05`
- `bk_id`: `BK-MF1-05`
- `macro`: `MF1`
- `owner`: `Kaue`
- `apoio`: `Davi`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `S`
- `dependencias`: `BK-MF1-01`
- `rf_rnf`: `RNF31`
- `fase_documental`: `Fase 2`
- `sprint`: `S02`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-06`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-05-health-check-e-logging-estruturado.md`
- `last_updated`: `2026-05-27`

## Bloco pedagogico (obrigatorio)

Este BK ensina a preparar operacao minima do backend: saber se a API esta viva e gerar logs que ajudem a diagnosticar problemas. Sem health-check e logs, uma app pode falhar silenciosamente e tornar a defesa tecnica mais dificil.

O objetivo pedagogico e perceber a diferenca entre "a app corre no meu computador" e "a app consegue ser observada". Health-check serve para sistemas e equipa confirmarem disponibilidade. Logging estruturado serve para perceber o que aconteceu, quando, com que rota, status e contexto.

## Bloco operacional (obrigatorio)

O trabalho operacional e adicionar `GET /health`, criar um logger JSON simples com niveis `info`, `warn` e `error`, adicionar request id e registar pedidos HTTP sem expor dados sensiveis. Este BK nao cria monitorizacao externa nem dashboards.

#### BK-MF1-05 - Health-check e logging estruturado

##### O que vamos fazer neste BK

Neste BK vamos criar o endpoint `GET /health`, exigido por `RNF31`, e uma base de logging estruturado alinhada com `RNF30`, mesmo que o mapeamento canonico deste BK seja `RNF31`. O health-check deve responder rapidamente e indicar que a API esta viva.

Tambem vamos criar um logger simples baseado em JSON. Cada log deve ter pelo menos `timestamp`, `level`, `message` e contexto. Para pedidos HTTP, vamos incluir metodo, path, status code, duracao e request id. Isto prepara debugging para as fases seguintes.

Como ainda nao ha base de dados, streaming ou integracoes externas, o health-check nao deve fingir verificacoes que nao existem. Deve declarar apenas checks reais, por exemplo `api: ok`.

##### Porque e que isto e importante

- Permite confirmar se o backend esta disponivel.
- Ajuda a diagnosticar erros durante MF2 e fases seguintes.
- Prepara evidencia objetiva para deploy/defesa.
- Cria disciplina de nao expor cookies, passwords ou tokens em logs.
- Desbloqueia smoke tests mais robustos em `BK-MF1-06`.

##### O que entra (scope)

- Criar `GET /health`.
- Criar service/controller/route para health.
- Criar logger JSON simples.
- Criar middleware de request logging.
- Criar request id por pedido e header `x-request-id`.
- Atualizar error handler para usar logger.
- Validar que cookies e headers sensiveis nao sao logados.

##### O que nao entra (scope-out)

- Nao entra Prometheus, Grafana, Sentry, Datadog ou servico externo.
- Nao entra health-check de MongoDB, pagamentos ou streaming, porque ainda nao existem.
- Nao entra metricas de performance formais.
- Nao entra tracing distribuido.
- Nao entra logs de auditoria funcional de utilizadores.

##### Como saber que isto ficou bem

- `GET /health` responde 200 com JSON.
- Cada pedido gera um log estruturado.
- Pedidos com erro geram log `error` sem stack trace ao utilizador.
- O header `x-request-id` aparece na resposta.
- Logs nao incluem cookies, passwords ou tokens.

#### Metadados do BK (CANONICO/DERIVADO):

- Prioridade: `P1` (CANONICO, `BACKLOG-MVP.md`)
- Estado: `TODO` (CANONICO, `BACKLOG-MVP.md`)
- Esforco: `S` (CANONICO, `BACKLOG-MVP.md`)
- macro: `MF1` (CANONICO, `BACKLOG-MVP.md`)
- Owner: `Kaue` (CANONICO, `BACKLOG-MVP.md`)
- Apoio: `Davi` (CANONICO, `BACKLOG-MVP.md`)
- Dependencias (BK IDs): `BK-MF1-01` (CANONICO, `BACKLOG-MVP.md`)
- Pre-condicoes: backend modular existe; se `BK-MF1-04` ja estiver feito, logs devem mascarar cookies (DERIVADO)
- Ref. Plano: `MF-VIEWS > MF1`, `PLANO-SPRINTS > Sprint 2`, `MATRIZ-CANONICA-BK > RNF31` (CANONICO)
- Flow ID: `MF1-backend-health-logging-05` (DERIVADO)
- Fonte de verdade: `docs/RNF.md`
- Fonte de verdade: `docs/planificacao/backlogs/BACKLOG-MVP.md`
- Fonte de verdade: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
- Descricao: adicionar health-check e logging estruturado minimo ao backend, sem monitorizacao externa (DERIVADO)

#### O que vamos fazer neste BK (DERIVADO):

- Criar modulo/rota `health`.
- Criar `health.service.js` com checks reais e simples.
- Criar `logger.js` com niveis.
- Criar middleware `requestLogger`.
- Criar request id e devolve-lo em `x-request-id`.
- Integrar logger no middleware de erro.
- Documentar exemplos de logs e comandos.

#### Estado, ficheiros e impacto (DERIVADO):

- Estado esperado antes do BK: backend arranca e tem rotas base, mas nao tem health-check nem logs consistentes.
- Estado esperado depois do BK: backend expõe `/health`, gera logs JSON e inclui request id nas respostas.
- Ficheiros a criar: `backend/src/modules/system/health.routes.js`, `backend/src/modules/system/health.controller.js`, `backend/src/modules/system/health.service.js`, `backend/src/utils/logger.js`, `backend/src/middlewares/request-logger.middleware.js`.
- Ficheiros a editar: `backend/src/app.js`, `backend/src/middlewares/error.middleware.js`, `backend/README.md`.
- Ficheiros a rever: `backend/src/config/env.js`, `backend/src/modules/auth/` se ja existir, `docs/RNF.md`.
- Dependencias de BK anteriores e uso: reutiliza estrutura Express de `BK-MF1-01`; se `BK-MF1-04` ja foi executado, respeita a regra de nao logar cookies.
- Impacto na arquitetura da app: adiciona observabilidade tecnica transversal.
- Impacto frontend: `BK-MF1-03` pode chamar health no futuro se necessario, mas nao deve depender dele para renderizar a app.
- Impacto backend: cria health/logging e melhora erro.
- Impacto dados: nenhum.
- Impacto seguranca: evita expor dados sensiveis nos logs.
- Impacto testes: fornece alvo principal para smoke tests de `BK-MF1-06`.
- Impacto UI: nenhum.
- Handoff para o proximo BK: `BK-MF1-06` deve testar `/health`, request id, 404 e 401 quando aplicavel.

#### Pre-leitura minima (10-15 min) (DERIVADO):

- `docs/RNF.md`: `RNF30` e `RNF31`.
- Guia `BK-MF1-01`: estrutura backend e middleware de erro.
- Guia `BK-MF1-04`: cookies e dados sensiveis, se ja executado.
- `backend/src/app.js`: ordem dos middlewares.
- `backend/src/middlewares/error.middleware.js`: ponto de integracao com logger.

#### Glossario (rapido) (DERIVADO):

- Health-check: endpoint que indica se o servico esta vivo.
- Observabilidade: capacidade de perceber o estado interno da app por logs, metricas e traces.
- Log estruturado: log em formato consistente, normalmente JSON.
- Level: gravidade do log, como `info`, `warn` ou `error`.
- Request id: identificador unico de um pedido.
- Duration: tempo que o pedido demorou.
- Middleware de logging: codigo que regista informacao antes/depois da resposta.
- Dados sensiveis: passwords, cookies, tokens, dados pessoais ou segredos.
- 5xx: erro do servidor.

#### Conceitos teoricos essenciais (DERIVADO):

**Health-check.** Um health-check nao e uma pagina bonita. E um endpoint rapido, previsivel e usado por humanos, scripts ou deploy para saber se a API responde.

**Logs estruturados.** Logs em texto livre sao dificeis de pesquisar. JSON permite filtrar por `level`, `path`, `statusCode` ou `requestId`.

**Request id.** Quando o frontend recebe erro, pode guardar o `x-request-id`. Depois a equipa procura esse id nos logs do backend. Isto liga sintoma a causa.

**Nao logar dados sensiveis.** Cookies e passwords nunca devem aparecer em logs. Logs vivem mais tempo do que um pedido e podem ser vistos por mais pessoas.

**Ordem de middlewares.** O logger deve correr cedo para apanhar pedidos. O error handler deve correr no fim para apanhar erros gerados por rotas anteriores.

**Erros comuns.** Fazer health-check depender de servicos que ainda nao existem, logar `req.headers.cookie`, mostrar stack trace ao utilizador, ou usar `console.log('erro')` sem contexto.

#### Guia de execucao (passo-a-passo) (DERIVADO):

0. **Objetivo (~10 min): Confirmar backend modular**
   - Descricao detalhada do objetivo: verificar que `BK-MF1-01` esta executado.
   - Justificacao: este BK adiciona observabilidade a uma app existente.
   - Como fazer (0.1): abrir `backend/src/app.js`.
   - Como fazer (0.2): confirmar que existe `src/modules/system/`.
   - Ficheiro a rever: `backend/src/app.js`
   - Ficheiro alvo: nenhum ainda.
   - Snippet de referencia: `app.use('/api', systemRouter)`
   - O que verificar: existe local claro para montar `/health`.

1. **Objetivo (~20 min): Criar service de health**
   - Descricao detalhada do objetivo: construir uma resposta com checks reais.
   - Justificacao: health nao deve fingir BD ou streaming enquanto nao existem.
   - Como fazer (1.1): criar `health.service.js`.
   - Como fazer (1.2): devolver `status`, `service`, `timestamp` e `checks`.
   - Ficheiro a rever: `backend/src/config/env.js`
   - Ficheiro alvo: `backend/src/modules/system/health.service.js`
   - Snippet de referencia:
     ```js
     export function getHealthStatus() {
       return { status: 'ok', checks: { api: 'ok' }, timestamp: new Date().toISOString() };
     }
     ```
   - O que verificar: nao ha checks inventados para MongoDB/pagamentos.

2. **Objetivo (~20 min): Criar controller e route `/health`**
   - Descricao detalhada do objetivo: expor health-check no backend.
   - Justificacao: `RNF31` pede endpoint de health-check, por exemplo `/health`.
   - Como fazer (2.1): criar `health.controller.js`.
   - Como fazer (2.2): criar `health.routes.js` e montar em `app.use('/health', healthRouter)` ou `app.get('/health', ...)`.
   - Ficheiro a rever: `docs/RNF.md`
   - Ficheiro alvo: `backend/src/modules/system/health.routes.js`
   - Snippet de referencia:
     ```js
     router.get('/', getHealth);
     ```
   - O que verificar: `GET /health` responde 200 JSON.

3. **Objetivo (~25 min): Criar logger estruturado**
   - Descricao detalhada do objetivo: criar funcoes `info`, `warn`, `error` que imprimem JSON.
   - Justificacao: logs consistentes sao mais faceis de filtrar e defender tecnicamente.
   - Como fazer (3.1): criar `backend/src/utils/logger.js`.
   - Como fazer (3.2): normalizar payload com `timestamp`, `level`, `message` e `context`.
   - Ficheiro a rever: `docs/RNF.md`
   - Ficheiro alvo: `backend/src/utils/logger.js`
   - Snippet de referencia:
     ```js
     export function log(level, message, context = {}) {
       console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, message, context }));
     }
     ```
   - O que verificar: logger nao recebe cookies/passwords como contexto.

4. **Objetivo (~30 min): Adicionar request id e logging de pedidos**
   - Descricao detalhada do objetivo: registar cada pedido com metodo, path, status e duracao.
   - Justificacao: isto permite diagnosticar rotas lentas ou erros.
   - Como fazer (4.1): criar `request-logger.middleware.js` usando `crypto.randomUUID()`.
   - Como fazer (4.2): adicionar header `x-request-id` e logar no evento `finish`.
   - Ficheiro a rever: `backend/src/app.js`
   - Ficheiro alvo: `backend/src/middlewares/request-logger.middleware.js`
   - Snippet de referencia:
     ```js
     res.setHeader('x-request-id', requestId);
     res.on('finish', () => logger.info('http_request', { method: req.method, path: req.path, statusCode: res.statusCode }));
     ```
   - O que verificar: logs nao incluem `req.headers.cookie`.

5. **Objetivo (~20 min): Integrar logger no error handler**
   - Descricao detalhada do objetivo: registar erros com contexto e responder sem detalhes sensiveis.
   - Justificacao: erro sem log e dificil de diagnosticar; erro com stack no cliente e risco.
   - Como fazer (5.1): importar logger em `error.middleware.js`.
   - Como fazer (5.2): logar `statusCode`, `message`, `path`, `requestId`.
   - Ficheiro a rever: `backend/src/middlewares/error.middleware.js`
   - Ficheiro alvo: `backend/src/middlewares/error.middleware.js`
   - Snippet de referencia:
     ```js
     logger.error('request_error', { statusCode, path: req.path, requestId: req.id });
     ```
   - O que verificar: response ao cliente nao inclui `err.stack` em producao.

6. **Objetivo (~20 min): Atualizar documentacao operacional**
   - Descricao detalhada do objetivo: documentar health, request id e exemplos de log.
   - Justificacao: Kaue/Davi precisam conseguir validar sem conhecer todo o codigo.
   - Como fazer (6.1): atualizar `backend/README.md`.
   - Como fazer (6.2): incluir comandos `curl -i /health` e exemplo de log JSON.
   - Ficheiro a rever: `backend/README.md`
   - Ficheiro alvo: `backend/README.md`
   - Snippet de referencia:
     ```md
     `GET /health` devolve estado tecnico da API, sem verificar BD enquanto a BD nao existir.
     ```
   - O que verificar: README nao promete monitorizacao externa.

7. **Objetivo (~25 min): Validar health, logs e negativos**
   - Descricao detalhada do objetivo: provar que health e logs funcionam e nao expõem dados sensiveis.
   - Justificacao: este BK e operacional; evidencia deve incluir outputs objetivos.
   - Como fazer (7.1): correr `npm run dev` e executar `curl -i http://localhost:3000/health`.
   - Como fazer (7.2): chamar rota inexistente e uma rota de sessao com cookie falso, se existir.
   - Ficheiro a rever: `backend/src/utils/logger.js`
   - Ficheiro alvo: evidence do PR/defesa
   - Snippet de referencia:
     ```bash
     curl -i http://localhost:3000/health
     curl -i http://localhost:3000/api/nao-existe
     ```
   - O que verificar: resposta tem `x-request-id`, logs sao JSON e nao contêm cookies.

#### Checklist de validacao (DERIVADO):

**Smoke**
- [ ] `GET /health` responde 200 JSON.
- [ ] Resposta inclui ou permite correlacionar `x-request-id`.
- [ ] Pedido normal gera log `info`.
- [ ] Erro/404 gera log com contexto.

**Negativos**
- [ ] Passo: 7; input/acao: `GET /api/nao-existe`; resultado esperado: 404 JSON + log estruturado; risco que cobre: erro sem diagnostico.
- [ ] Passo: 7; input/acao: enviar cookie falso numa rota de sessao; resultado esperado: log sem valor do cookie; risco que cobre: exposicao de credenciais.
- [ ] Passo: 1; input/acao: procurar checks de BD/pagamento no health; resultado esperado: nao existem enquanto os servicos nao existem; risco que cobre: health enganador.

**Tecnico**
- [ ] Logger tem niveis `info`, `warn`, `error`.
- [ ] Middleware usa `finish` para saber status final.
- [ ] Error handler usa logger.
- [ ] Health-check e rapido e sem dependencias externas.

**Regressao das fases anteriores**
- [ ] Nao altera rotas base de `BK-MF1-01`.
- [ ] Nao expõe cookies de `BK-MF1-04`.
- [ ] Nao altera metadados canonicos.

**UI/mockup**
- [ ] Nao aplicavel.

**Seguranca**
- [ ] Cookies, passwords e tokens nao aparecem em logs.
- [ ] Stack trace nao e enviado ao cliente em producao.
- [ ] Request id nao revela dados pessoais.

#### Criterios de aceite:

**Outputs:**
- Endpoint `/health` criado.
- Logger JSON criado.
- Middleware de request logging criado.
- Error handler integrado com logger.

**Verificacoes:**
- `curl -i /health` devolve 200.
- Rota inexistente gera 404 e log.
- Logs incluem level, message, timestamp e contexto.

**Qualidade:**
- Sem servicos externos desnecessarios.
- Health-check nao inventa dependencias.
- Logs nao expõem dados sensiveis.

**Continuidade:**
- `BK-MF1-06` consegue testar `/health`.
- `MF2` pode acrescentar checks de BD quando a BD existir.
- Fases futuras podem trocar logger interno por ferramenta externa sem mudar controllers.

**Evidencia:**
- Output de `/health`.
- Exemplo de log `info`.
- Exemplo de log `error`/404.
- Prova de que cookie nao aparece no log.

#### Evidence (para o PR/defesa):

- `pr`: `A preencher no fecho do BK`
- `proof`: `A preencher apos validacao`
- `neg`: `A preencher apos testes negativos`
- `files`: `backend/src/modules/system/health.*`, `backend/src/utils/logger.js`, `backend/src/middlewares/request-logger.middleware.js`, `backend/src/middlewares/error.middleware.js`, `backend/src/app.js`
- `commands`: `npm run dev`, `curl -i http://localhost:3000/health`, `curl -i http://localhost:3000/api/nao-existe`
- `screenshots`: `Nao aplicavel; usar output de terminal/log`
- `notes`: `Sem monitorizacao externa nesta fase`

#### TODOs

- TODO: adicionar checks de MongoDB apenas quando a base de dados existir.
- TODO: decidir ferramenta externa de observabilidade se for necessária em deploy.
- TODO: definir politica de retencao de logs se houver dados pessoais em fases futuras.
- TODO (BLOCKER): se o ambiente de producao nao permitir ler logs, planear alternativa antes da defesa.
- FOLLOW-UP: `BK-MF1-06` deve transformar `/health` e 404 em smoke automatizado.
- FOLLOW-UP: fases de admin/auditoria devem distinguir logs tecnicos de logs de auditoria funcional.
- Assuncao tecnica: logger JSON simples com `console.log` e suficiente para MVP PAP.
- Decisoes dependentes de mockup: nenhuma.
- Decisoes dependentes de app/codigo ainda inexistente: checks de BD, pagamentos e streaming.

## Snippet tecnico aplicavel

```js
// backend/src/middlewares/request-logger.middleware.js
import { randomUUID } from 'node:crypto';
import { logger } from '../utils/logger.js';

export function requestLogger(req, res, next) {
  const startedAt = Date.now();
  req.id = req.headers['x-request-id'] ?? randomUUID();
  res.setHeader('x-request-id', req.id);

  res.on('finish', () => {
    logger.info('http_request', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
}
```

## Proximo BK recomendado

`BK-MF1-06`, que deve automatizar smoke tests para backend, frontend, cliente API, sessao base e health-check.

## Changelog

- `2026-05-27`: refinado para guia executavel de health-check e logging estruturado, com negativos de seguranca e operacao.
