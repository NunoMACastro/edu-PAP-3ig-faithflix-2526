# BK-MF1-05 - Health-check, CORS e logging estruturado

## Header

- `doc_id`: `GUIA-BK-MF1-05`
- `bk_id`: `BK-MF1-05`
- `macro`: `MF1`
- `owner`: `Kaue`
- `apoio`: `Davi`
- `prioridade`: `P1`
- `estado`: `DONE`
- `esforco`: `S`
- `dependencias`: `BK-MF1-01,BK-MF1-04`
- `rf_rnf`: `RNF31`
- `fase_documental`: `Fase 2`
- `sprint`: `S02`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF1-06`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-05-health-check-e-logging-estruturado.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Acrescentar liveness, readiness dependente de MongoDB, CORS controlado, logging
estruturado e encerramento gracioso ao backend.

#### Importância

Uma aplicação não basta funcionar localmente: precisa de sinais fiáveis para
indicar se o processo vive, se aceita tráfego e por que razão um pedido falhou,
sem health-checks falso-verdes nem dados sensíveis nos logs.

#### Scope-in

- Criar `GET /health/live`, `GET /health/ready` e manter `GET /health` como alias
  compatível de readiness.
- Limitar o ping MongoDB de readiness a 500 ms e devolver `503` seguro quando a
  base estiver indisponível.
- Criar configuração e middleware CORS com allowlist explícita.
- Criar logger JSON e request logging com `x-request-id`.
- Criar `writeAdminAudit()` transacional e sanitizado como primitive única dos
  BKs administrativos seguintes.
- Integrar logs no error handler.
- Atualizar `app.js` sem remover `/api`, `/api/session` nem as rotas health.
- Fechar HTTP e MongoDB ordenada e idempotentemente em `SIGTERM`/`SIGINT`.

#### Scope-out

- Monitorização externa paga.
- Checks de pagamentos, streaming, CDN ou DRM.
- CORS wildcard `*` com credenciais ou origens não configuradas.
- Logs com cookies, tokens, passwords ou dados pessoais.
- UI de consulta de auditoria ou políticas de retenção operacional.
- `FORCE_HTTPS`, HSTS e o conjunto final de headers defensivos, revistos no
  hardening `BK-MF6-03`.

#### Estado antes e depois

- Antes: `/health` pode apenas confirmar que o processo responde e o fecho pode
  interromper pedidos ou deixar ligações abertas.
- Depois: liveness e readiness têm semânticas separadas, a readiness falha em
  segurança e o processo fecha HTTP e MongoDB de forma controlada.

#### Pré-requisitos

- `BK-MF1-01` e `BK-MF1-04` executados.
- Preservar `/api/session` ao acrescentar health, CORS e logging.
- Confirmar `RNF31` para health e `RNF30` para logging estruturado.
- Confirmar que `pingDatabase(maxTimeMS)` e `closeDatabase()` existem. Sem
  MongoDB configurado, readiness devolve `503`; nunca finge estar pronta.

#### Glossário

- `Liveness`: confirma que o processo HTTP está vivo.
- `Readiness`: confirma que o processo pode receber tráfego com dependências prontas.
- `CORS`: política do browser que restringe origens autorizadas.
- `requestId`: identificador usado para correlacionar resposta e log.
- `graceful shutdown`: fecho que para novas ligações e termina recursos abertos.
- `audit log`: evento persistido na mesma transação da alteração de domínio.

#### Conceitos teóricos essenciais

A composição final da API aplica estes controlos transversais antes das rotas:

- origens com credenciais pertencem a uma allowlist explícita; em produção,
  `FRONTEND_ORIGINS` é obrigatória e contém apenas origins HTTPS válidas;
- health e o token CSRF usam `Cache-Control: no-store`; o hardening de
  transporte/headers pertence ao `BK-MF6-03` e não é fingido neste BK;
- erros seguem `{ code, message, requestId, details? }`; falhas `5xx` usam
  `INTERNAL_ERROR`, não incluem `details` e não expõem a mensagem interna;
- CORS não substitui a validação de Origin/Fetch Metadata e o token CSRF das
  mutations autenticadas.

Check de compreensão:

- [ ] Sei explicar a diferença entre liveness e readiness.
- [ ] Sei explicar porque CORS com credenciais precisa de origem explicita.
- [ ] Sei explicar porque logs devem ser JSON.
- [ ] Sei provar que cookies nao aparecem nos logs.

#### Arquitetura do BK

| Pedido/sinal | Componente | Resultado |
| --- | --- | --- |
| `/health/live` | controller sem dependências | `200` enquanto o processo vive |
| `/health/ready` ou `/health` | service com ping MongoDB de 500 ms | `200` ou `503` sanitizado |
| Pedido frontend | CORS + request logger | headers permitidos e log JSON |
| `SIGTERM`/`SIGINT` | coordenador de shutdown | HTTP e MongoDB fechados uma vez |

#### Ficheiros a criar/editar/rever

- Criar `backend/src/modules/system/{health.service,health.controller,health.routes}.js`.
- Criar/rever `backend/src/config/{cors,env,database}.js`.
- Criar `backend/src/middlewares/{cors,request-logger,error}.middleware.js`.
- Criar `backend/src/modules/audit/audit.service.js`.
- Editar `backend/src/app.js`, `backend/src/server.js`, `.env.example` e README.

#### Tutorial técnico linear

### Passo 1 - Criar liveness e readiness reais

1. Objetivo funcional do passo no contexto da app.

Separar o estado do processo do estado da dependência MongoDB. Liveness deve
continuar `200` quando a base falha; readiness deve mudar para `503` em, no
máximo, 500 ms.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/system/health.service.js`
    - CRIAR: `backend/src/modules/system/health.controller.js`
    - CRIAR: `backend/src/modules/system/health.routes.js`
    - REVER: `backend/src/config/database.js` (`pingDatabase`)
    - LOCALIZACAO: `backend/src/modules/system/`
    - REVER: `backend/src/config/env.js`

3. Instruções do que fazer.

Cria os ficheiros no módulo `system`. As rotas health devem ficar antes de JSON,
sessão e CSRF: liveness não depende de autenticação e readiness consulta apenas
MongoDB.

4. Código completo, correto e integrado com a app final.

**`backend/src/modules/system/health.service.js`**

```js
import { env } from "../../config/env.js";
import { pingDatabase } from "../../config/database.js";

export const READINESS_DEADLINE_MS = 500;

// O payload usa estados controlados e nunca inclui a URI ou a mensagem interna da dependência.
function buildStatus(status, database) {
    return {
        status,
        service: env.serviceName,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        dependencies: {
            api: "ok",
            database,
        },
    };
}

export function getLivenessStatus() {
    return {
        ...buildStatus("ok", "not_checked"),
        live: true,
    };
}

export async function getReadinessStatus({
    ping = pingDatabase,
    deadlineMs = READINESS_DEADLINE_MS,
} = {}) {
    let timeoutId;
    const pingResult = Promise.resolve()
        .then(() => ping(deadlineMs))
        .then(
            () => true,
            () => false,
        );
    const deadlineResult = new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve(false), deadlineMs);
    });
    // A corrida garante que readiness responde dentro do orçamento mesmo se o driver bloquear.
    const ready = await Promise.race([pingResult, deadlineResult]);
    clearTimeout(timeoutId);

    return {
        ...buildStatus(
            ready ? "ok" : "unavailable",
            ready ? "ok" : "unavailable",
        ),
        ready,
    };
}
```

5. Explicação do código.

O deadline externo cobre tanto a obtenção da ligação como o comando MongoDB.
Erros e timeouts são convertidos apenas em `database: "unavailable"`; a URI e a
mensagem interna nunca entram no payload.

**Código complementar integrado no mesmo passo — `health.controller.js`.**

```js
import {
    getLivenessStatus,
    getReadinessStatus,
} from "./health.service.js";

// Health não deve ser reutilizado por caches, porque representa o estado deste instante.
function disableCaching(res) {
    res.setHeader("Cache-Control", "no-store");
}

export function getLiveness(_req, res) {
    disableCaching(res);
    return res.status(200).json(getLivenessStatus());
}

export async function getReadiness(_req, res) {
    disableCaching(res);
    const status = await getReadinessStatus();
    return res.status(status.ready ? 200 : 503).json(status);
}
```

**Explicação complementar do controller.**

O controller decide apenas o código HTTP e impede cache. Liveness é sempre
`200` enquanto o processo responde; readiness é `200` ou `503` conforme o ping.

**Código complementar integrado no mesmo passo — `health.routes.js`.**

```js
import { Router } from "express";
import { getLiveness, getReadiness } from "./health.controller.js";

export const healthRouter = Router();

healthRouter.get("/live", getLiveness);
healthRouter.get("/ready", getReadiness);
// Alias compatível: /health representa readiness, não apenas processo vivo.
healthRouter.get("/", getReadiness);
```

**Explicação complementar das rotas.**

Montado em `/health`, o router cria `/health/live`, `/health/ready` e o alias
`/health`.

6. Validação do passo.

A rota ainda precisa de ser montada em `app.js`. Depois do Passo 5,
`/health/live` deve devolver `200`; `/health/ready` e `/health` devolvem `200`
com MongoDB disponível ou `503` quando a dependência falha.

7. Cenário negativo/erro esperado.

Erro comum: fazer `/health` responder `200` apenas porque o processo Node está
vivo. Como `/health` é alias de readiness, tem de devolver `503` sem MongoDB.

### Passo 2 - Criar configuracao e middleware CORS local

1. Objetivo funcional do passo no contexto da app.

Permitir que o frontend local chame a API com cookies, mas apenas a partir de origens explicitamente configuradas.

2. Ficheiros envolvidos.
    - EDITAR: `backend/.env.example`
    - CRIAR: `backend/src/config/cors.js`
    - CRIAR: `backend/src/middlewares/cors.middleware.js`
    - LOCALIZACAO: `backend/`, `backend/src/config/` e `backend/src/middlewares/`
    - REVER: `BK-MF1-03`, porque o cliente API usa `credentials: "include"`

3. Instruções do que fazer.

Reutiliza `FRONTEND_ORIGINS` e `env.frontendOrigins` criados no `BK-MF1-04`.
Depois cria a configuração e o middleware CORS. A regra principal é não usar
`*` com credenciais: quando cookies podem ser enviados, a origem permitida tem
de ser explícita.

4. Código completo, correto e integrado com a app final.

**Linha já criada em `backend/.env.example` pelo `BK-MF1-04`**

```env
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Código complementar integrado no mesmo passo — `backend/src/config/cors.js`.**

```js
import { env, isProduction } from "./env.js";

// Produção recusa origins HTTP no arranque, antes de aceitar pedidos com cookies.
for (const origin of env.frontendOrigins) {
    if (isProduction && new URL(origin).protocol !== "https:") {
        throw new Error("FRONTEND_ORIGINS exige HTTPS em produção.");
    }
}

export const corsConfig = Object.freeze({
    allowedOrigins: env.frontendOrigins,
});
```

**Código complementar integrado no mesmo passo — `cors.middleware.js`.**

```js
import { corsConfig } from "../config/cors.js";

const ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const ALLOWED_HEADERS =
    "Content-Type,X-Request-Id,X-CSRF-Token,Idempotency-Key";

export function corsMiddleware(req, res, next) {
    // Só uma origin presente na allowlist recebe autorização para enviar credenciais.
    const origin = req.headers.origin;

    if (typeof origin === "string" && corsConfig.allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
        res.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
        res.setHeader("Vary", "Origin");
    }

    if (req.method === "OPTIONS") {
        return res.status(204).send();
    }

    next();
}
```

5. Explicação do código.

`FRONTEND_ORIGINS` é analisada uma única vez em `env.js`; CORS e CSRF usam a
mesma allowlist, evitando duas políticas concorrentes. O middleware só devolve
`Access-Control-Allow-Origin` quando a origem está autorizada.

6. Validação do passo.

Depois de montar o middleware em `app.js`, uma chamada com origem `http://127.0.0.1:5173` deve devolver `Access-Control-Allow-Origin: http://127.0.0.1:5173` e `Access-Control-Allow-Credentials: true`. Uma origem nao configurada nao deve receber `Access-Control-Allow-Origin`.

7. Cenário negativo/erro esperado.

Erro comum: devolver `Access-Control-Allow-Origin: *` juntamente com credenciais. Isso quebra o modelo de seguranca esperado para cookies e deve reprovar o BK.

### Passo 3 - Criar logger e audit service sanitizados

1. Objetivo funcional do passo no contexto da app.

Criar um logger em JSON que evita dados sensíveis e a primitive
`writeAdminAudit()` que os BKs seguintes importam na mesma transação da
alteração de domínio.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/utils/logger.js`
    - CRIAR: `backend/src/modules/audit/audit.service.js`
    - LOCALIZACAO: `backend/src/utils/`
    - REVER: `RNF17`, `RNF30`

3. Instruções do que fazer.

Cria os dois ficheiros abaixo. O logger usa `console`, sempre com JSON
estruturado. O audit service recusa qualquer chamada fora do contexto criado
por `runInTransaction()` e nunca persiste campos sensíveis em snapshots.

4. Código completo, correto e integrado com a app final.

**`backend/src/utils/logger.js`**

```js
import { env } from "../config/env.js";

// A comparação por fragmentos cobre variantes como accessToken e set-cookie.
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
    // A travessia recursiva preserva a forma do contexto e substitui apenas valores sensíveis.
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

**Código complementar integrado no mesmo passo — `backend/src/modules/audit/audit.service.js`.**

```js
import { assertActiveTransaction } from "../../config/database.js";
import { logger } from "../../utils/logger.js";

const MAX_AUDIT_BYTES = 16_384;
const SENSITIVE_PARTS = [
    "authorization",
    "cookie",
    "email",
    "password",
    "phone",
    "secret",
    "token",
];

function assertIdentifier(value, name) {
    if (value === undefined || value === null || String(value).trim() === "") {
        throw new TypeError(`${name} e obrigatorio no audit log.`);
    }
}

function sanitise(value, depth = 0) {
    // Limites de profundidade, tamanho e tipo impedem snapshots ilimitados ou não serializáveis.
    if (value === null || value === undefined) return value ?? null;
    if (depth > 5) return "[TRUNCATED]";
    if (value instanceof Date) return value;
    if (typeof value?.toHexString === "function") return value.toHexString();
    if (typeof value === "string") return value.slice(0, 500);
    if (["number", "boolean"].includes(typeof value)) return value;
    if (Array.isArray(value)) {
        return value.slice(0, 50).map((item) => sanitise(item, depth + 1));
    }
    if (typeof value !== "object") return String(value).slice(0, 500);

    return Object.fromEntries(
        Object.entries(value).map(([key, item]) => {
            const sensitive = SENSITIVE_PARTS.some((part) =>
                key.toLowerCase().includes(part),
            );
            return [key, sensitive ? "[REDACTED]" : sanitise(item, depth + 1)];
        }),
    );
}

export async function writeAdminAudit({
    db,
    session,
    actorUserId,
    action,
    targetType,
    targetId,
    before = null,
    after = null,
    requestId = null,
    metadata = null,
}) {
    assertActiveTransaction(session);
    assertIdentifier(actorUserId, "actorUserId");
    assertIdentifier(targetId, "targetId");

    if (!/^[a-z][a-z0-9_.-]{2,100}$/u.test(action ?? "")) {
        throw new TypeError("action invalida no audit log.");
    }
    if (!/^[a-z][a-z0-9_-]{1,63}$/u.test(targetType ?? "")) {
        throw new TypeError("targetType invalido no audit log.");
    }

    const document = {
        actorUserId,
        action,
        targetType,
        targetId,
        before: sanitise(before),
        after: sanitise(after),
        requestId: requestId ? String(requestId).slice(0, 128) : null,
        metadata: sanitise(metadata),
        createdAt: new Date(),
    };

    // Um snapshot excessivo aborta também a alteração de domínio.
    if (Buffer.byteLength(JSON.stringify(document), "utf8") > MAX_AUDIT_BYTES) {
        throw new TypeError("Audit log excede o limite de 16 KiB.");
    }

    const result = await db
        .collection("audit_logs")
        .insertOne(document, { session });

    logger.info("admin_audit_staged", {
        auditId: result.insertedId.toString(),
        action,
        targetType,
        requestId: document.requestId,
    });

    return result.insertedId;
}
```

5. Explicação do código.

Logs estruturados são objetos JSON por linha. `redact()` protege a saída do
processo. `sanitise()` protege o documento persistido, limita profundidade,
arrays, strings e remove email, telefone, credenciais e tokens. O audit recebe
`db` e a mesma `session` do domínio; `assertActiveTransaction()` impede um
evento decorativo fora da transação e uma falha do insert provoca rollback.

6. Validação do passo.

Executar dentro de `backend/`:

```bash
node -e "import('./src/utils/logger.js').then(({ logger }) => logger.info('teste', { cookie: 'abc', route: '/api' }))"
node --check src/modules/audit/audit.service.js
```

Resultado esperado: log JSON com `"cookie":"[REDACTED]"`.

7. Cenário negativo/erro esperado.

Erro comum: fazer `console.log(req.headers)` ou chamar `writeAdminAudit()` sem a
sessão transacional. O primeiro pode divulgar cookies; o segundo deve lançar
erro antes de escrever.

### Passo 4 - Criar request logger com request id

1. Objetivo funcional do passo no contexto da app.

Registar cada pedido com metodo, caminho, status, duracao e `requestId`.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/middlewares/request-logger.middleware.js`
    - CRIAR: `backend/tests/unit/mf1-request-id.test.js`
    - LOCALIZACAO: `backend/src/middlewares/`
    - REVER: `backend/src/app.js`

3. Instruções do que fazer.

Cria o middleware abaixo. Ele deve ser montado cedo em `app.js`, antes das rotas.

4. Código completo, correto e integrado com a app final.

**`backend/src/middlewares/request-logger.middleware.js`**

```js
import { randomUUID } from "node:crypto";
import { logger } from "../utils/logger.js";

// Entre 8 e 128 caracteres ASCII sem espaços, CR/LF ou outros controlos.
export const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

/**
 * Aceita apenas um identificador externo estritamente validado.
 *
 * @param {unknown} value Header `x-request-id` recebido.
 * @returns {string} Valor seguro do cliente ou um UUID novo.
 */
export function selectRequestId(value) {
    return typeof value === "string" && REQUEST_ID_PATTERN.test(value)
        ? value
        : randomUUID();
}

export function requestLogger(req, res, next) {
    const startedAt = Date.now();
    // O valor externo nunca chega diretamente ao contexto, resposta ou logs.
    req.id = selectRequestId(req.headers["x-request-id"]);

    res.setHeader("x-request-id", req.id);

    // O evento finish regista o estado e a duração reais depois de a resposta terminar.
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

**Teste complementar — `backend/tests/unit/mf1-request-id.test.js`.**

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
    REQUEST_ID_PATTERN,
    selectRequestId,
} from "../../src/middlewares/request-logger.middleware.js";

test("MF1 preserva apenas request IDs ASCII dentro do limite", () => {
    // Um identificador conforme mantém a correlação iniciada pelo cliente.
    assert.equal(selectRequestId("client-id_2026"), "client-id_2026");
});

test("MF1 substitui request IDs com CRLF, controlos ou tamanho excessivo", () => {
    // Cada forma hostil ou ambígua tem de gerar um valor local seguro.
    const invalidValues = [
        "safe-id\r\nX-Forged: yes",
        `id-${"a".repeat(126)}`,
        "safe-id\u0000control",
        ["client-id-1", "client-id-2"],
    ];

    for (const value of invalidValues) {
        const selected = selectRequestId(value);
        assert.match(selected, REQUEST_ID_PATTERN);
        assert.notDeepEqual(selected, value);
    }
});
```

5. Explicação do código.

`requestId` e um identificador unico por pedido. Um valor do cliente só é
preservado se cumprir a allowlist ASCII e o intervalo `8..128`; CRLF, controlos,
arrays e valores excessivos são substituídos por `randomUUID()`. O mesmo valor
já validado é o único que entra em `req.id`, no header de resposta e no log. O
middleware nao grava headers completos, evitando fuga de cookies e log/header
injection.

6. Validação do passo.

Depois de montar em `app.js`, qualquer resposta deve incluir header
`x-request-id`. Executa também:

```bash
cd backend
node --test tests/unit/mf1-request-id.test.js
```

7. Cenário negativo/erro esperado.

Erro comum: copiar qualquer header não vazio. Um valor com CRLF, controlos ou
tamanho arbitrário não é um identificador de correlação válido e nunca pode ser
refletido na resposta ou nos logs.

### Passo 5 - Integrar health e graceful shutdown

1. Objetivo funcional do passo no contexto da app.

Ligar CORS, health e logging na app Express e fechar HTTP/MongoDB de forma
ordenada em `SIGTERM`/`SIGINT`.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/middlewares/error.middleware.js`
    - EDITAR: `backend/src/app.js`
    - CRIAR: `backend/src/runtime/graceful-shutdown.js`
    - EDITAR: `backend/src/server.js`
    - EDITAR: `backend/README.md`
    - LOCALIZACAO: substituir os dois ficheiros JS pelo conteudo abaixo e acrescentar seccao ao README
    - REVER: `BK-MF1-04`, se a sessao ja estiver montada

3. Instruções do que fazer.

Substitui `error.middleware.js` e `app.js` pelas versões aditivas. Conserva
`attachSession`, `csrfProtection`, `/api`, `/api/session`, 404 e error handler do
`BK-MF1-04`; acrescenta apenas controlos transversais e health. Em seguida cria
o coordenador de shutdown e substitui `server.js` pela versão completa.

4. Código completo, correto e integrado com a app final.

**`backend/src/middlewares/error.middleware.js`**

```js
import { notFound } from "../utils/http-error.js";
import { logger } from "../utils/logger.js";

export function notFoundHandler(req, _res, next) {
    next(notFound(req.originalUrl));
}

export function errorHandler(error, req, res, _next) {
    const statusCode = error.statusCode ?? error.status ?? 500;
    // Estados inválidos são tratados como falha interna para não emitir códigos HTTP incoerentes.
    const safeStatusCode =
        statusCode >= 400 && statusCode <= 599 ? statusCode : 500;

    const logContext = {
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode: safeStatusCode,
        errorName: error.name,
        errorMessage:
            safeStatusCode >= 500
                ? "Erro interno do servidor."
                : error.message,
    };

    if (safeStatusCode >= 500) {
        logger.error("http_error", logContext);
    } else {
        logger.warn("http_error", logContext);
    }

    // O envelope público mantém código e requestId, mas suprime detalhes de qualquer erro 5xx.
    const isServerError = safeStatusCode >= 500;
    const response = {
        code: isServerError
            ? "INTERNAL_ERROR"
            : (error.code ?? "REQUEST_FAILED"),
        message:
            isServerError
                ? "Erro interno do servidor."
                : error.message,
    };

    if (!isServerError && error.details !== undefined) {
        response.details = error.details;
    }

    response.requestId = req.id;

    return res.status(safeStatusCode).json(response);
}
```

5. Explicação do código.

O error handler continua a devolver JSON, mas agora tambem escreve logs. Erros 4xx sao `warn`, porque normalmente resultam de pedidos invalidos. Erros 5xx sao `error`, porque indicam problema no servidor. O cliente recebe sempre um `code` estável e o `requestId`; erros internos ficam reduzidos a `INTERNAL_ERROR`, sem `details` nem mensagem técnica. Nao escrevemos body, cookies nem headers completos.

**Código complementar integrado no mesmo passo — `backend/src/app.js`.**

```js
import express from "express";
import { asyncHandler } from "./utils/async-handler.js";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import { csrfProtection } from "./middlewares/csrf.middleware.js";
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { attachSession } from "./middlewares/session.middleware.js";
import { sessionRouter } from "./modules/auth/session.routes.js";
import { healthRouter } from "./modules/system/health.routes.js";
import { systemRouter } from "./modules/system/system.routes.js";

export function createApp() {
    const app = express();

    // Logging e CORS são transversais e precisam de observar também health e preflight.
    app.use(requestLogger);
    app.use(corsMiddleware);

    // Health não depende de parsing de body, sessão ou CSRF.
    app.use("/health", healthRouter);

    app.use(express.json({ limit: "1mb" }));
    app.use(asyncHandler(attachSession));
    app.use(asyncHandler(csrfProtection));

    app.use("/api", systemRouter);
    app.use("/api/session", sessionRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
```

**Explicação complementar da composição Express.**

`requestLogger` fica antes de tudo e CORS responde também a preflight. Health é
montado antes de JSON, sessão e CSRF. As rotas funcionais conservam a ordem
`attachSession -> csrfProtection -> routers`; os handlers de erro continuam no
fim.

**Código complementar integrado no mesmo passo — `graceful-shutdown.js`.**

```js
const SHUTDOWN_TIMEOUT_MS = 10_000;

async function closeHttpServer(server) {
    const drained = new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeIdleConnections?.();
    });

    let timeoutId;
    const timeout = new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve("timeout"), SHUTDOWN_TIMEOUT_MS);
    });

    try {
        const result = await Promise.race([drained, timeout]);
        if (result === "timeout") {
            server.closeAllConnections?.();
        }
    } finally {
        clearTimeout(timeoutId);
    }
}

export function createGracefulShutdown({ server, closeDatabase, logger }) {
    let shutdownPromise;

    return function shutdown(signal) {
        // Sinais repetidos reutilizam a mesma Promise para não fechar HTTP ou MongoDB duas vezes.
        if (shutdownPromise) return shutdownPromise;

        shutdownPromise = (async () => {
            logger.info("api_shutdown_requested", { signal });
            let httpError;

            try {
                await closeHttpServer(server);
            } catch (error) {
                httpError = error;
            }

            // A DB fecha uma única vez e só depois de parar a aceitação de tráfego.
            await closeDatabase();
            if (httpError) throw httpError;
            logger.info("api_stopped", { signal });
        })();

        return shutdownPromise;
    };
}
```

Substitui `backend/src/server.js` por este ponto de entrada autocontido:

```js
import { createApp } from "./app.js";
import {
    assertTransactionSupport,
    closeDatabase,
} from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { createGracefulShutdown } from "./runtime/graceful-shutdown.js";
import { ensureSessionIndexes } from "./modules/auth/session.service.js";

// A topologia transacional e os índices são pré-condições para começar a aceitar tráfego.
await assertTransactionSupport();
await ensureSessionIndexes();

const app = createApp();

const server = app.listen(env.port, () => {
    logger.info("api_started", { port: env.port });
});
const shutdown = createGracefulShutdown({ server, closeDatabase, logger });

// Ambos os sinais seguem o mesmo encerramento ordenado e tornam a falha observável no exit code.
for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
        shutdown(signal).catch(() => {
            process.exitCode = 1;
        });
    });
}
```

O arranque valida a topologia antes de criar índices e aceitar tráfego; em
produção, standalone é recusado em vez de degradar a atomicidade. O coordenador
é idempotente: sinais repetidos partilham a mesma Promise. O servidor deixa
primeiro de aceitar tráfego, tenta drenar pedidos dentro do budget e só depois
fecha MongoDB.

**Documentação complementar a acrescentar a `backend/README.md`.**

```md
## Health-check e logs

- `GET /health/live` confirma apenas o processo e devolve `200`.
- `GET /health/ready` e `GET /health` confirmam MongoDB em 500 ms e devolvem
  `200` ou `503`, sempre com `Cache-Control: no-store`.
- Todas as respostas incluem `x-request-id`.
- `x-request-id` recebido só é reutilizado se tiver `8..128` caracteres da
  allowlist ASCII; CRLF, controlos, arrays e valores excessivos geram UUID novo.
- Apenas o valor validado aparece em `req.id`, no header de resposta e no log.
- Logs sao JSON por linha.
- Cookies, tokens e passwords nao devem aparecer nos logs.

## CORS local

- `FRONTEND_ORIGINS` define as origens frontend autorizadas.
- Em desenvolvimento, `http://localhost:5173` e `http://127.0.0.1:5173` estao autorizadas para permitir cookies com `credentials: include`.
```

**Explicação complementar do shutdown e do runbook.**

O README passa a explicar como provar operacao basica. Isto ajuda a defesa PAP porque mostra preocupacao com monitorizacao e privacidade.

6. Validação do passo.

Executar:

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/health/live
curl -i http://localhost:3000/health/ready
curl -i -H "Origin: http://127.0.0.1:5173" http://localhost:3000/api
curl -i -X OPTIONS -H "Origin: http://127.0.0.1:5173" http://localhost:3000/api
curl -i http://localhost:3000/api/nao-existe -H "Cookie: faithflix_session=falso"
```

7. Cenário negativo/erro esperado.

Erro comum: montar `/health` dentro de `/api/session`, exigir login para health-check ou colocar CORS depois das rotas. Health-check deve poder validar a app sem sessao e CORS deve responder antes da logica funcional.

### Passo 6 - Validar payloads, CORS, logs e negativos

1. Objetivo funcional do passo no contexto da app.

Provar que `/health` responde, CORS esta limitado a origens configuradas, logs existem e dados sensiveis nao aparecem.

2. Ficheiros envolvidos.
    - EDITAR: nenhum, se os passos anteriores estiverem corretos
    - LOCALIZACAO: executar comandos em `backend/`
    - REVER: `cors.js`, `cors.middleware.js`, `logger.js`, `request-logger.middleware.js`, `error.middleware.js`

3. Instruções do que fazer.

Arranca o backend, executa os pedidos e guarda output.

4. Código completo, correto e integrado com a app final.
MongoDB disponível.

```json
{
    "status": "ok",
    "service": "faithflix-api",
    "timestamp": "2026-05-30T00:00:00.000Z",
    "uptimeSeconds": 10,
    "dependencies": {
        "api": "ok",
        "database": "ok"
    },
    "ready": true
}
```

Com MongoDB indisponível, a mesma rota devolve `503`, `status: "unavailable"`,
`ready: false` e `database: "unavailable"`. Já `/health/live` continua `200`,
usa `database: "not_checked"` e inclui `live: true`.

5. Explicação do código.

`timestamp` e `uptimeSeconds` mudam a cada execução. O payload nunca inclui URI,
stack ou mensagem do driver. Streaming e pagamentos não são dependências de
readiness e, por isso, não aparecem como checks inventados.

**Exemplo complementar de log esperado.**

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

**Explicação complementar do log.**

O log tem campos previsiveis. Isto permite filtrar por `requestId`, `statusCode` ou `path`. Nao inclui cookies nem dados pessoais.

6. Validação do passo.

- `GET /health/live` devolve `200` mesmo com MongoDB indisponível.
- `GET /health/ready` e `GET /health` devolvem `200` com MongoDB disponível e
  `503` dentro de 500 ms quando o ping falha ou bloqueia.
- As três rotas enviam `Cache-Control: no-store` e nunca expõem erro interno.
- Resposta inclui `x-request-id`.
- Pedido com `Origin: http://127.0.0.1:5173` devolve `Access-Control-Allow-Origin` com essa origem.
- Pedido com origem permitida devolve `Access-Control-Allow-Credentials: true`.
- Preflight `OPTIONS` com origem permitida devolve HTTP 204.
- Pedido com origem nao configurada nao devolve `Access-Control-Allow-Origin`.
- Pedido 404 gera log `warn`.
- Erro 500, quando simulado futuramente, deve gerar log `error`.
- Cookie falso nao aparece nos logs.

7. Cenário negativo/erro esperado.

Erro comum: devolver `200` em readiness quando o ping não foi executado. Se a
dependência ainda não existe, mantém liveness verde e readiness `503` até a
configuração estar pronta.

#### Critérios de aceite

- `backend/src/modules/system/health.*`, `backend/src/config/cors.js`, `backend/src/middlewares/cors.middleware.js`, `backend/src/utils/logger.js` e `backend/src/middlewares/request-logger.middleware.js` existem.
- `backend/.env.example` inclui `FRONTEND_ORIGINS` e CORS reutiliza
  `env.frontendOrigins` do `BK-MF1-04`.
- `GET /health/live` devolve `200` sem consultar MongoDB.
- `GET /health/ready` e o alias `/health` fazem ping MongoDB com deadline total
  de 500 ms e devolvem `200` ou `503` com payload sanitizado e `no-store`.
- Origem local permitida devolve `Access-Control-Allow-Origin` igual a origem recebida e `Access-Control-Allow-Credentials: true`.
- Preflight `OPTIONS` com origem permitida devolve HTTP 204.
- Origem nao configurada nao recebe `Access-Control-Allow-Origin`.
- Todas as respostas incluem `x-request-id`.
- Pedidos geram logs JSON com `level`, `message`, `requestId`, `method`, `path`, `statusCode` e `durationMs`.
- Erros HTTP seguem `{ code, message, requestId, details? }` e falhas `5xx` não expõem detalhes internos.
- Produção exige origins HTTPS explícitas; transporte obrigatório e headers
  defensivos permanecem critérios do `BK-MF6-03`, não desta implementação.
- O preflight permite `X-CSRF-Token` e `Idempotency-Key` apenas para origins da
  allowlist.
- `SIGTERM`/`SIGINT` deixam de aceitar tráfego, drenam/forçam HTTP dentro do
  budget e fecham MongoDB uma única vez; sinais repetidos são idempotentes.
- O arranque de produção falha antes de `listen()` quando MongoDB não suporta
  transações; não existe fallback standalone.
- Cookies, tokens, passwords e segredos nao aparecem nos logs.
- `writeAdminAudit()` recusa ausência da transação ativa, sanitiza snapshots e
  escreve na mesma `session` da alteração de domínio.

#### Validação final

Executar dentro de `backend/`:

```bash
npm run dev
curl -i http://localhost:3000/health
curl -i http://localhost:3000/health/live
curl -i http://localhost:3000/health/ready
curl -i -H "Origin: http://127.0.0.1:5173" http://localhost:3000/api
curl -i -X OPTIONS -H "Origin: http://127.0.0.1:5173" http://localhost:3000/api
curl -i -H "Origin: http://malicioso.test" http://localhost:3000/api
curl -i http://localhost:3000/api/nao-existe -H "Cookie: faithflix_session=falso"
```

#### Evidence para PR/defesa

- `pr`: referencia do PR/commit com health/CORS/logging.
- `proof`: outputs de live/ready/alias, header `x-request-id`, CORS com origem
  local permitida, shutdown limpo e exemplo de log `info`.
- `neg`: readiness `503` com MongoDB indisponível, live ainda `200`, 404 logado,
  cookie ausente/redigido e origem não configurada sem header CORS.

#### Handoff

- `BK-MF1-06` deve automatizar live/ready/alias, timeout de 500 ms, CORS local,
  `x-request-id`, sessão anónima e CSRF autenticado com doubles.
- `BK-MF2-01` deve manter cookies fora dos logs quando criar login real.
- Todos os BKs administrativos reutilizam
  `backend/src/modules/audit/audit.service.js`; não criam outro audit helper.
- Novas dependências só entram em readiness se forem realmente obrigatórias para
  aceitar tráfego; streaming e pagamentos não recebem checks decorativos.

#### Changelog

- `2026-07-10`: migrado para o contrato tutorial v2, mantendo live/ready,
  deadline MongoDB, CORS e graceful shutdown como implementação única.
- `2026-07-10`: restaurada a composição sessão/CSRF e definida a primitive
  transacional e sanitizada `writeAdminAudit()` usada pelos BKs seguintes.
- `2026-07-10`: substituído o health sempre verde por live/ready/alias com ping
  MongoDB de 500 ms, `503` seguro, CORS CSRF/idempotência e graceful shutdown.
- `2026-05-30`: reestruturado como tutorial linear, com codigo movido para passos executaveis e sem anexo tecnico no fim.
- `2026-05-29`: acrescentada versao detalhada para health-check, logger, request id, error handler, app.js, payloads e negativos.
- `2026-05-27`: refinado para guia executavel de health-check e logging estruturado, com negativos de seguranca e operacao.
