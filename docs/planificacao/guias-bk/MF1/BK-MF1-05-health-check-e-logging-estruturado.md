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
- `dependencias`: `BK-MF1-01,BK-MF1-04`
- `rf_rnf`: `RNF31`
- `fase_documental`: `Fase 2`
- `sprint`: `S02`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-06`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-05-health-check-e-logging-estruturado.md`
- `last_updated`: `2026-05-30`

## Bloco pedagogico (obrigatorio)

Este BK acrescenta capacidade operacional ao backend: um endpoint `/health` para saber se a API esta viva e logs estruturados para diagnosticar pedidos e erros. Isto nao cria funcionalidades de produto, mas e essencial para operar uma app real.

Para alunos do 12.º ano, a ideia principal e: uma aplicacao nao basta "funcionar no meu computador". Precisamos de sinais simples para saber se esta online, que pedidos recebeu e que erros aconteceram, sem expor dados sensiveis.

### O que entra

- Criar `GET /health`.
- Criar logger em JSON.
- Criar middleware de request logging com `x-request-id`.
- Integrar logs no error handler.
- Atualizar `app.js` sem remover `/api` nem `/api/session`.

### O que nao entra

- Monitorizacao externa paga.
- Checks de MongoDB, pagamentos, streaming, CDN ou DRM.
- Logs com cookies, tokens, passwords ou dados pessoais.
- Auditoria administrativa completa, que entra em hardening/operacao posterior.

### Check de compreensao

- [ ] Sei explicar para que serve `/health`.
- [ ] Sei explicar porque logs devem ser JSON.
- [ ] Sei provar que cookies nao aparecem nos logs.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF1-01` executado.
- `BK-MF1-04` executado, com sessao base em `/api/session`.
- Preservar `/api/session` ao acrescentar `/health` e logging.
- Confirmar em `RNF.md` que `RNF31` pede endpoint de health-check e `RNF30` pede logs estruturados.
- Confirmar que ainda nao existem MongoDB, pagamentos ou streaming real; por isso, `/health` nao deve fingir checks desses servicos.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar health service, controller e routes

1. Objetivo do passo.

Criar `GET /health`, uma resposta tecnica simples para deployment, smoke tests e diagnostico.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/modules/system/health.service.js`
    - CRIAR: `backend/src/modules/system/health.controller.js`
    - CRIAR: `backend/src/modules/system/health.routes.js`
    - LOCALIZACAO: `backend/src/modules/system/`
    - REVER: `backend/src/config/env.js`

3. Instrucoes concretas.

Cria os ficheiros no modulo `system`, porque `/health` e uma rota tecnica da aplicacao, nao pertence a catalogo, auth ou streaming.

4. Codigo do ficheiro `backend/src/modules/system/health.service.js`.

```js
import { env } from "../../config/env.js";

export function getHealthStatus() {
    return {
        status: "ok",
        service: env.serviceName,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        dependencies: {
            api: "ok",
            database: "not_configured",
            streaming: "not_configured",
            payments: "not_configured",
        },
    };
}
```

5. Explicacao do codigo.

`status: 'ok'` indica que a API Node esta a responder. `uptimeSeconds` mostra ha quanto tempo o processo esta ligado. As dependencias inexistentes aparecem como `not_configured`, para nao fingir que MongoDB, streaming ou pagamentos ja existem.

6. Codigo do ficheiro `backend/src/modules/system/health.controller.js`.

```js
import { getHealthStatus } from "./health.service.js";

export function getHealth(_req, res) {
    return res.status(200).json(getHealthStatus());
}
```

7. Explicacao do codigo.

O controller fica pequeno porque a regra esta no service. Isto segue a arquitetura modular: controller responde HTTP; service calcula dados.

8. Codigo do ficheiro `backend/src/modules/system/health.routes.js`.

```js
import { Router } from "express";
import { getHealth } from "./health.controller.js";

export const healthRouter = Router();

healthRouter.get("/", getHealth);
```

9. Explicacao do codigo.

Quando este router for montado em `/health`, a rota final sera `GET /health`.

10. Validacao do passo.

A rota ainda precisa de ser montada em `app.js`. Depois do Passo 4, `curl -i http://localhost:3000/health` deve devolver 200.

11. Caso negativo ou erro comum.

Erro comum: devolver `database: ok` antes de existir base de dados. Isso seria um health-check enganador.

### Passo 2 - Criar logger estruturado com redacao de dados sensiveis

1. Objetivo do passo.

Criar um logger em JSON que evita escrever dados sensiveis nos logs.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/utils/logger.js`
    - LOCALIZACAO: `backend/src/utils/`
    - REVER: `RNF17`, `RNF30`

3. Instrucoes concretas.

Cria o ficheiro abaixo. O logger usa `console`, mas sempre com JSON estruturado.

4. Codigo do ficheiro `backend/src/utils/logger.js`.

```js
import { env } from "../config/env.js";

const SENSITIVE_KEYS = [
    "authorization",
    "cookie",
    "password",
    "token",
    "secret",
    "set-cookie",
];

function shouldRedact(key) {
    return SENSITIVE_KEYS.some((sensitiveKey) =>
        key.toLowerCase().includes(sensitiveKey),
    );
}

function redact(value) {
    if (Array.isArray(value)) {
        return value.map((item) => redact(item));
    }

    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                shouldRedact(key) ? "[REDACTED]" : redact(item),
            ]),
        );
    }

    return value;
}

function writeLog(level, message, context = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        service: env.serviceName,
        message,
        ...redact(context),
    };

    const line = JSON.stringify(entry);

    if (level === "error") {
        console.error(line);
        return;
    }

    if (level === "warn") {
        console.warn(line);
        return;
    }

    console.log(line);
}

export const logger = {
    info: (message, context) => writeLog("info", message, context),
    warn: (message, context) => writeLog("warn", message, context),
    error: (message, context) => writeLog("error", message, context),
};
```

5. Explicacao do codigo.

Logs estruturados sao objetos JSON por linha. Isso facilita pesquisa e leitura por ferramentas de observabilidade. A funcao `redact` percorre objetos e troca valores sensiveis por `[REDACTED]`. Mesmo que alguem passe um objeto com `password` ou `cookie`, o logger nao escreve o valor real.

6. Validacao do passo.

Executar dentro de `backend/`:

```bash
node -e "import('./src/utils/logger.js').then(({ logger }) => logger.info('teste', { cookie: 'abc', route: '/api' }))"
```

Resultado esperado: log JSON com `"cookie":"[REDACTED]"`.

7. Caso negativo ou erro comum.

Erro comum: fazer `console.log(req.headers)`. Isso pode gravar cookies e tokens nos logs.

### Passo 3 - Criar request logger com request id

1. Objetivo do passo.

Registar cada pedido com metodo, caminho, status, duracao e `requestId`.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/middlewares/request-logger.middleware.js`
    - LOCALIZACAO: `backend/src/middlewares/`
    - REVER: `backend/src/app.js`

3. Instrucoes concretas.

Cria o middleware abaixo. Ele deve ser montado cedo em `app.js`, antes das rotas.

4. Codigo do ficheiro `backend/src/middlewares/request-logger.middleware.js`.

```js
import { randomUUID } from "node:crypto";
import { logger } from "../utils/logger.js";

export function requestLogger(req, res, next) {
    const startedAt = Date.now();
    const incomingRequestId = req.headers["x-request-id"];

    req.id =
        typeof incomingRequestId === "string" && incomingRequestId.trim() !== ""
            ? incomingRequestId
            : randomUUID();

    res.setHeader("x-request-id", req.id);

    res.on("finish", () => {
        logger.info("http_request", {
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

5. Explicacao do codigo.

`requestId` e um identificador unico por pedido. Se um erro aparece no frontend com esse ID, a equipa consegue procurar o pedido nos logs. O middleware nao grava headers completos, evitando fuga de cookies.

6. Validacao do passo.

Depois de montar em `app.js`, qualquer resposta deve incluir header `x-request-id`.

7. Caso negativo ou erro comum.

Erro comum: usar o mesmo request id para todos os pedidos. Cada pedido precisa de um identificador diferente, salvo quando o cliente ja envia um.

### Passo 4 - Integrar logging no error handler e montar `/health`

1. Objetivo do passo.

Ligar `/health`, request logging e logs de erro na app Express.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/middlewares/error.middleware.js`
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/README.md`
    - LOCALIZACAO: substituir os dois ficheiros JS pelo conteudo abaixo e acrescentar seccao ao README
    - REVER: `BK-MF1-04`, se a sessao ja estiver montada

3. Instrucoes concretas.

Substitui `error.middleware.js` e `app.js`. O `app.js` abaixo assume que `BK-MF1-04` ja criou `attachSession` e `authRouter`. Se `BK-MF1-04` ainda nao tiver sido executado, executa-o antes deste passo para evitar imports partidos.

4. Codigo do ficheiro `backend/src/middlewares/error.middleware.js`.

```js
import { notFound } from "../utils/http-error.js";
import { logger } from "../utils/logger.js";

export function notFoundHandler(req, _res, next) {
    next(notFound(req.originalUrl));
}

export function errorHandler(error, req, res, _next) {
    const statusCode = error.statusCode ?? error.status ?? 500;
    const safeStatusCode =
        statusCode >= 400 && statusCode <= 599 ? statusCode : 500;

    const logContext = {
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode: safeStatusCode,
        errorName: error.name,
        errorMessage: error.message,
    };

    if (safeStatusCode >= 500) {
        logger.error("http_error", logContext);
    } else {
        logger.warn("http_error", logContext);
    }

    const response = {
        message:
            safeStatusCode === 500
                ? "Erro interno do servidor."
                : error.message,
    };

    if (error.details !== undefined) {
        response.details = error.details;
    }

    return res.status(safeStatusCode).json(response);
}
```

5. Explicacao do codigo.

O error handler continua a devolver JSON, mas agora tambem escreve logs. Erros 4xx sao `warn`, porque normalmente resultam de pedidos invalidos. Erros 5xx sao `error`, porque indicam problema no servidor. Nao escrevemos body, cookies nem headers completos.

6. Codigo do ficheiro `backend/src/app.js`.

```js
import express from "express";
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { attachSession } from "./middlewares/session.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { healthRouter } from "./modules/system/health.routes.js";
import { systemRouter } from "./modules/system/system.routes.js";

export function createApp() {
    const app = express();

    app.use(requestLogger);
    app.use(express.json({ limit: "1mb" }));
    app.use(attachSession);

    app.use("/health", healthRouter);
    app.use("/api", systemRouter);
    app.use("/api/session", authRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
```

7. Explicacao do codigo.

`requestLogger` fica antes de tudo para medir todos os pedidos. `/health` fica ao lado de `/api`, porque e uma rota operacional. `/api/session` continua preservado para a base de sessao. Os handlers de erro continuam no fim.

8. Codigo a acrescentar ao fim de `backend/README.md`.

```md
## Health-check e logs

- `GET /health` devolve estado tecnico da API.
- Todas as respostas incluem `x-request-id`.
- Logs sao JSON por linha.
- Cookies, tokens e passwords nao devem aparecer nos logs.
```

9. Explicacao do codigo.

O README passa a explicar como provar operacao basica. Isto ajuda a defesa PAP porque mostra preocupacao com monitorizacao e privacidade.

10. Validacao do passo.

Executar:

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/api/nao-existe -H "Cookie: faithflix_session=falso"
```

11. Caso negativo ou erro comum.

Erro comum: montar `/health` dentro de `/api/session` ou exigir login para health-check. Health-check deve poder validar a app sem sessao.

### Passo 5 - Validar payloads, logs e negativos

1. Objetivo do passo.

Provar que `/health` responde, logs existem e dados sensiveis nao aparecem.

2. Ficheiros envolvidos:
    - EDITAR: nenhum, se os passos anteriores estiverem corretos
    - LOCALIZACAO: executar comandos em `backend/`
    - REVER: `logger.js`, `request-logger.middleware.js`, `error.middleware.js`

3. Instrucoes concretas.

Arranca o backend, executa os pedidos e guarda output.

4. Resposta esperada de `GET /health`.

```json
{
    "status": "ok",
    "service": "faithflix-api",
    "timestamp": "2026-05-30T00:00:00.000Z",
    "uptimeSeconds": 10,
    "dependencies": {
        "api": "ok",
        "database": "not_configured",
        "streaming": "not_configured",
        "payments": "not_configured"
    }
}
```

5. Explicacao didatica.

`timestamp` e `uptimeSeconds` mudam a cada execucao. O importante e a estrutura. Dependencias futuras aparecem como `not_configured`, para nao prometer base de dados ou pagamentos antes da fase correta.

6. Exemplo esperado de log.

```json
{
    "timestamp": "2026-05-30T00:00:00.000Z",
    "level": "info",
    "service": "faithflix-api",
    "message": "http_request",
    "requestId": "...",
    "method": "GET",
    "path": "/health",
    "statusCode": 200,
    "durationMs": 3
}
```

7. Explicacao didatica.

O log tem campos previsiveis. Isto permite filtrar por `requestId`, `statusCode` ou `path`. Nao inclui cookies nem dados pessoais.

8. Validacao do passo.

- `GET /health` devolve 200.
- Resposta inclui `x-request-id`.
- Pedido 404 gera log `warn`.
- Erro 500, quando simulado futuramente, deve gerar log `error`.
- Cookie falso nao aparece nos logs.

9. Caso negativo ou erro comum.

Erro comum: fazer health-check depender de MongoDB antes de MongoDB existir. Isso faria a MF1 falhar por uma dependencia que pertence a BKs futuros.

## Criterios de aceite (mensuraveis)

- `backend/src/modules/system/health.*`, `backend/src/utils/logger.js` e `backend/src/middlewares/request-logger.middleware.js` existem.
- `GET /health` devolve HTTP 200 e JSON com `status`, `service`, `timestamp`, `uptimeSeconds` e `dependencies`.
- Todas as respostas incluem `x-request-id`.
- Pedidos geram logs JSON com `level`, `message`, `requestId`, `method`, `path`, `statusCode` e `durationMs`.
- Cookies, tokens, passwords e segredos nao aparecem nos logs.

## Validacao final

Executar dentro de `backend/`:

```bash
npm run dev
curl -i http://localhost:3000/health
curl -i http://localhost:3000/api/nao-existe -H "Cookie: faithflix_session=falso"
```

## Evidence para PR/defesa

- `pr`: referencia do PR/commit com health/logging.
- `proof`: output de `/health`, header `x-request-id` e exemplo de log `info`.
- `neg`: 404 logado, cookie ausente/redigido em logs e health sem checks inventados.

## Handoff

- `BK-MF1-06` deve automatizar `/health`, `x-request-id`, 404 e 401.
- `BK-MF2-01` deve manter cookies fora dos logs quando criar login real.
- Fases futuras podem acrescentar checks de MongoDB, streaming ou pagamentos apenas quando essas dependencias existirem.

## Changelog

- `2026-05-30`: reestruturado como tutorial linear, com codigo movido para passos executaveis e sem anexo tecnico no fim.
- `2026-05-29`: acrescentada versao detalhada para health-check, logger, request id, error handler, app.js, payloads e negativos.
- `2026-05-27`: refinado para guia executavel de health-check e logging estruturado, com negativos de seguranca e operacao.
