# BK-MF1-04 - Sessao segura backend (cookies e auth base)

## Header

- `doc_id`: `GUIA-BK-MF1-04`
- `bk_id`: `BK-MF1-04`
- `macro`: `MF1`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF1-01`
- `rf_rnf`: `RNF13, RNF15`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF1-05`
- `guia_path`: `docs/planificacao/guias-bk/MF1/BK-MF1-04-sessao-segura-backend-cookies-auth-base.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Criar a primeira sessão server-side real do FaithFlix. O browser recebe apenas um token opaco num cookie `HttpOnly`; a identidade, a expiração e os hashes de sessão/CSRF ficam no MongoDB. O BK cria também a base transacional que os módulos seguintes reutilizam.

Ainda não existe um formulário de login neste BK. `BK-MF2-01` passa a poder criar uma sessão com `createSession()` depois de validar as credenciais, sem inventar armazenamento, cookies ou proteção CSRF paralelos.

#### Importância

Uma sessão fictícia ou resolvida sempre como `null` tornaria login, autorização, eliminação RGPD e auditoria impossíveis de implementar corretamente. Este guia estabelece uma única base copiável, falha cedo sem configuração MongoDB e mantém cookie e documento com o mesmo TTL absoluto de 24 horas.

#### Scope-in

- Adicionar o driver oficial `mongodb` ao manifesto dos alunos.
- Exigir `MONGODB_URI`, `MONGODB_DB_NAME` e `FRONTEND_ORIGINS`, sem fallback runtime.
- Criar `getMongoClient`, `getDb`, `setDbForTests`, `runInTransaction`,
  `assertActiveTransaction`, `assertTransactionSupport`, `pingDatabase` e
  `closeDatabase`.
- Persistir sessões e CSRF apenas por hash, com rotação e histórico máximo de quatro hashes.
- Criar `attachSession`, `requireAuth`, `csrfProtection`, controllers e rotas completas.
- Entregar `200 { "user": null }` para sessão anónima, token CSRF apenas autenticado e logout `204`.

#### Scope-out

- Formulários e regras de registo, login, recuperação de password ou RBAC funcional.
- Tokens em `localStorage` ou `sessionStorage`.
- Redis, JWT, OAuth, SSO ou serviços externos.
- Sliding sessions: a atividade não prolonga as 24 horas.

#### Estado antes e depois

- Estado antes: `BK-MF1-01` entrega Express modular, mas não tem MongoDB nem identidade persistida.
- Estado depois: a app tem armazenamento MongoDB explícito, sessão server-side, CSRF e primitives transacionais reutilizáveis, sem fingir um utilizador autenticado.

#### Pré-requisitos

- `BK-MF1-01` concluído, incluindo `createApp()`, `HttpError`, 404 JSON e error handler.
- Node.js 20 ou superior e um MongoDB local configurado como replica set para os fluxos transacionais futuros.
- `BK-MF1-03` deve enviar `credentials: "include"` e manter o token CSRF apenas em memória.
- Ler `RNF13` e `RNF15`; nunca copiar credenciais reais para `.env.example` ou evidence.

#### Glossário

- `sessão server-side`: estado autenticado autoritativo persistido no servidor.
- `token opaco`: valor aleatório sem dados do utilizador embebidos.
- `TTL absoluto`: instante fixo de expiração, não renovado por atividade.
- `CSRF`: pedido mutável forjado a partir de uma origem diferente.
- `transação ativa`: callback executado por `runInTransaction` com a mesma `ClientSession` em todas as operações.

#### Conceitos teóricos essenciais

O cookie é apenas uma credencial de transporte. O servidor calcula SHA-256 e pesquisa `sessions.tokenHash`; o token bruto nunca é persistido. O mesmo princípio protege CSRF. `HttpOnly`, `SameSite`, validação de `Origin` e `X-CSRF-Token` são camadas complementares.

MongoDB só oferece atomicidade entre coleções numa transação. Por isso, o helper recusa transações aninhadas, propaga a mesma `session`, tenta novamente apenas erros marcados como transientes e permite que services críticos comprovem o contexto com `assertActiveTransaction()`.

#### Arquitetura do BK

- Endpoint(s): `GET /api/session/me`, `GET /api/session/csrf-token`, `POST /api/session/logout`.
- Modelo/schema: `sessions` com `tokenHash`, `userId`, `createdAt`, `expiresAt`, `csrfTokenHash`, `csrfRotatedAt` e `csrfTokenHashes`.
- Service(s): base MongoDB, lifecycle da sessão e rotação/verificação CSRF.
- Controller/route: `session.controller.js` e `session.routes.js`.
- Guard/middleware: `attachSession`, `requireAuth`, `csrfProtection` e `asyncHandler`.
- Cliente API: reutiliza `credentials: "include"` do `BK-MF1-03`.
- Testes: contratos negativos em `BK-MF1-06` com DB double; nunca a DB normal.
- Handoff: primitives reais para autenticação, health, auditoria e transações.

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/package.json`
- EDITAR: `backend/.env.example`
- EDITAR: `backend/src/config/env.js`
- CRIAR: `backend/src/config/database.js`
- CRIAR: `backend/src/config/session.js`
- CRIAR: `backend/src/utils/cookies.js`
- CRIAR: `backend/src/utils/async-handler.js`
- CRIAR: `backend/src/modules/auth/token.service.js`
- CRIAR: `backend/src/modules/auth/session.service.js`
- CRIAR: `backend/src/modules/auth/csrf.service.js`
- CRIAR: `backend/src/middlewares/session.middleware.js`
- CRIAR: `backend/src/middlewares/auth.middleware.js`
- CRIAR: `backend/src/middlewares/csrf.middleware.js`
- CRIAR: `backend/src/modules/auth/session.controller.js`
- CRIAR: `backend/src/modules/auth/session.routes.js`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`

#### Tutorial técnico linear

### Passo 1 - Configurar MongoDB e a base transacional

1. Objetivo funcional do passo.

Adicionar a única dependência necessária e criar uma ligação MongoDB explícita, testável e sem fallback silencioso para outra base.

2. Ficheiros envolvidos.

- EDITAR: `backend/package.json`, `backend/.env.example`, `backend/src/config/env.js`.
- CRIAR: `backend/src/config/database.js`.
- LOCALIZAÇÃO: manifesto e pasta `backend/src/config/`.

3. Instruções do que fazer.

Conserva os scripts e a dependência `express` do `BK-MF1-01`. Acrescenta `mongodb`, documenta valores locais sem credenciais e substitui `env.js` pela versão completa. Uma URI ou nome em falta tem de impedir o arranque: não uses `mongodb://localhost` nem um nome de DB como fallback runtime.

4. Código completo, correto e integrado com a app final.

**`backend/package.json`**

```json
{
    "name": "faithflix-backend",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "scripts": {
        "dev": "node --watch src/server.js",
        "start": "node src/server.js",
        "test": "node --test"
    },
    "dependencies": {
        "express": "^4.19.2",
        "mongodb": "^6.16.0"
    },
    "engines": {
        "node": ">=20"
    }
}
```

**`backend/.env.example`**

```env
NODE_ENV=development
PORT=3000
SERVICE_NAME=faithflix-api
MONGODB_URI=mongodb://127.0.0.1:27017/?replicaSet=rs0
MONGODB_DB_NAME=faithflix_dev
FRONTEND_ORIGINS=http://localhost:5173
SESSION_COOKIE_NAME=faithflix_session
```

**`backend/src/config/env.js`**

```js
const DEFAULT_PORT = 3000;
const nodeEnv = process.env.NODE_ENV?.trim() || "development";

// Configuração sensível em falta deve interromper o arranque em vez de ativar um fallback inseguro.
function required(name) {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(`${name} e obrigatoria.`);
    }

    return value;
}

function parsePort(value) {
    const parsed = Number(value ?? DEFAULT_PORT);

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        throw new Error("PORT deve ser um inteiro entre 1 e 65535.");
    }

    return parsed;
}

function parseMongoUri(value) {
    if (!/^mongodb(?:\+srv)?:\/\//u.test(value)) {
        throw new Error("MONGODB_URI deve usar mongodb:// ou mongodb+srv://.");
    }

    return value;
}

function parseDatabaseName(value) {
    if (!/^[A-Za-z0-9_-]{1,64}$/u.test(value)) {
        throw new Error("MONGODB_DB_NAME contem caracteres invalidos.");
    }

    return value;
}

function parseOrigins(value) {
    // Cada entrada tem de corresponder à origin exata para impedir paths ou origens ambíguas no CORS.
    return value.split(",").map((origin) => {
        const exactOrigin = origin.trim();
        const parsed = new URL(exactOrigin);

        if (parsed.origin !== exactOrigin) {
            throw new Error("FRONTEND_ORIGINS exige origins exatas.");
        }

        return parsed.origin;
    });
}

// Testes unitários só recebem uma DB através de `setDbForTests()`. Recusar as
// variáveis runtime impede que `NODE_ENV=test` toque acidentalmente na DB normal.
if (
    nodeEnv === "test" &&
    (process.env.MONGODB_URI || process.env.MONGODB_DB_NAME)
) {
    throw new Error(
        "NODE_ENV=test recusa MONGODB_URI e MONGODB_DB_NAME; usa setDbForTests().",
    );
}

const mongodbUri = nodeEnv === "test"
    ? null
    : parseMongoUri(required("MONGODB_URI"));
const mongodbDbName = nodeEnv === "test"
    ? null
    : parseDatabaseName(required("MONGODB_DB_NAME"));

export const env = Object.freeze({
    nodeEnv,
    port: parsePort(process.env.PORT),
    serviceName: process.env.SERVICE_NAME ?? "faithflix-api",
    mongodbUri,
    mongodbDbName,
    frontendOrigins: parseOrigins(required("FRONTEND_ORIGINS")),
    sessionCookieName:
        process.env.SESSION_COOKIE_NAME?.trim() || "faithflix_session",
});

export const isProduction = env.nodeEnv === "production";
```

**`backend/src/config/database.js`**

```js
import { AsyncLocalStorage } from "node:async_hooks";
import { MongoClient } from "mongodb";
import { env } from "./env.js";

const transactionContext = new AsyncLocalStorage();
const transactionOptions = {
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" },
};

let clientPromise = null;
let testDb = null;

function isTransientTransactionError(error) {
    // O driver trata commits incertos; repetir o domínio poderia duplicar dados.
    return error?.hasErrorLabel?.("TransientTransactionError") === true;
}

export async function getMongoClient() {
    // Sem DB explicitamente injetada, uma lane unitária falha fechada.
    if (!env.mongodbUri || !env.mongodbDbName) {
        throw new Error(
            "MongoDB indisponivel em test; injeta um DB double com setDbForTests().",
        );
    }

    if (!clientPromise) {
        const client = new MongoClient(env.mongodbUri);

        // Uma ligação falhada não pode ficar guardada como promessa rejeitada.
        clientPromise = client.connect().catch((error) => {
            clientPromise = null;
            throw error;
        });
    }

    return clientPromise;
}

export async function getDb() {
    if (testDb) {
        return testDb;
    }

    const client = await getMongoClient();
    return client.db(env.mongodbDbName);
}

export function setDbForTests(dbDouble) {
    if (env.nodeEnv !== "test") {
        throw new Error("setDbForTests so pode ser usado com NODE_ENV=test.");
    }

    if (clientPromise) {
        throw new Error("Fecha a ligacao real antes de instalar um DB double.");
    }

    testDb = dbDouble ?? null;
}

export function assertActiveTransaction(session) {
    const activeSession = transactionContext.getStore()?.session;

    if (!session || activeSession !== session || !session.inTransaction()) {
        throw new Error("Esta operacao exige a transacao ativa atual.");
    }
}

export async function assertTransactionSupport({
    required = env.nodeEnv === "production",
} = {}) {
    const db = await getDb();
    const hello = await db.admin().command(
        { hello: 1 },
        { maxTimeMS: 1_000 },
    );
    const hasSessions = Number.isFinite(hello.logicalSessionTimeoutMinutes);
    const transactionalTopology =
        typeof hello.setName === "string" || hello.msg === "isdbgrid";
    const supported = hasSessions && transactionalTopology;

    if (required && !supported) {
        throw new Error(
            "Producao exige MongoDB replica set ou sharded cluster com transacoes.",
        );
    }

    return supported;
}

export async function runInTransaction(work, { maxAttempts = 3 } = {}) {
    if (transactionContext.getStore()) {
        throw new Error("Transacoes aninhadas nao sao permitidas.");
    }

    const client = await getMongoClient();

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const session = client.startSession();

        try {
            let result;

            await session.withTransaction(async () => {
                result = await transactionContext.run({ session }, async () =>
                    work({ db: await getDb(), session }),
                );
            }, transactionOptions);

            return result;
        } catch (error) {
            if (attempt === maxAttempts || !isTransientTransactionError(error)) {
                throw error;
            }
        } finally {
            await session.endSession();
        }
    }

    throw new Error("A transacao terminou sem resultado.");
}

export async function pingDatabase(timeoutMs = 500) {
    const controller = new AbortController();
    let timer;

    try {
        const ping = getDb().then((db) =>
            db.command({ ping: 1 }, { signal: controller.signal }),
        );
        const deadline = new Promise((_, reject) => {
            timer = setTimeout(() => {
                controller.abort();
                reject(new Error("MongoDB nao respondeu dentro do deadline."));
            }, timeoutMs);
        });

        // O deadline cobre também server selection/getDb, não apenas command().
        await Promise.race([ping, deadline]);
        return true;
    } finally {
        clearTimeout(timer);
    }
}

export async function closeDatabase() {
    const pendingClient = clientPromise;
    clientPromise = null;
    testDb = null;

    if (pendingClient) {
        const client = await pendingClient;
        await client.close();
    }
}
```

5. Explicação do código.

`env.js` exige a configuração em desenvolvimento/produção e, em
`NODE_ENV=test`, recusa explicitamente `MONGODB_*`: até o contrato E2E isolado
ser introduzido no `BK-MF2-08`, a única DB permitida é um double fornecido por
`setDbForTests()`. A resolução de sessão aplica cumulativamente as allowlists
legacy de `accountStatus` e `status`; qualquer valor bloqueado num dos campos
impede autenticação. `runInTransaction()` recusa nesting, usa a
mesma `ClientSession`, repete apenas labels transientes e termina sempre a
sessão. `assertTransactionSupport()` identifica replica set/sharded cluster e
falha cedo em produção; nunca degrada silenciosamente para standalone.
`assertActiveTransaction()` permite que audit logs falhem fechados fora do
callback. `pingDatabase()` aplica o deadline de 500 ms reutilizado no próximo
BK.

6. Validação do passo.

Dentro de `backend/`, executa `npm install` e depois `node --check src/config/env.js && node --check src/config/database.js`. Com as quatro variáveis obrigatórias definidas, os dois comandos terminam com exit code `0`.

7. Cenário negativo/erro esperado.

`env -u MONGODB_URI NODE_ENV=development node -e "import('./src/config/env.js')"` deve falhar antes de ligar a qualquer base com `MONGODB_URI e obrigatoria.`. `NODE_ENV=development` seguido de `setDbForTests({})` deve falhar também.

### Passo 2 - Criar tokens, cookie e persistência de sessões

1. Objetivo funcional do passo.

Criar tokens opacos, o cookie seguro e a coleção `sessions` com expiração absoluta de 24 horas e índices autoritativos.

2. Ficheiros envolvidos.

- CRIAR: `backend/src/config/session.js`, `backend/src/utils/cookies.js`.
- CRIAR: `backend/src/modules/auth/token.service.js`, `backend/src/modules/auth/session.service.js`.
- LOCALIZAÇÃO: configuração, utilitários HTTP e módulo `auth`.

3. Instruções do que fazer.

Cria os quatro ficheiros pela ordem apresentada. Não persistas o token devolvido por `createOpaqueToken()`: guarda apenas `hashOpaqueToken(rawToken)`. O TTL do cookie e `sessions.expiresAt` usa a mesma constante.

4. Código completo, correto e integrado com a app final.

**`backend/src/config/session.js`**

```js
import { env, isProduction } from "./env.js";

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

// Cookie e documento partilham a mesma duração absoluta para não divergir o ciclo da sessão.
export const sessionConfig = Object.freeze({
    cookieName: env.sessionCookieName,
    ttlMs: SESSION_TTL_MS,
    cookie: Object.freeze({
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        path: "/",
        maxAge: SESSION_TTL_MS,
    }),
});
```

**`backend/src/utils/cookies.js`**

```js
export function hasCookie(req, name) {
    const header = req.headers.cookie ?? "";
    return header.split(";").some((part) => {
        const [rawName] = part.trim().split("=");
        return rawName === name;
    });
}

export function readCookie(req, name) {
    const header = req.headers.cookie ?? "";

    for (const part of header.split(";")) {
        const [rawName, ...rawValue] = part.trim().split("=");

        if (rawName === name) {
            try {
                return decodeURIComponent(rawValue.join("="));
            } catch {
                // Encoding inválido representa cookie ausente; nunca causa 500.
                return null;
            }
        }
    }

    return null;
}

export function setSessionCookie(res, name, token, options) {
    // Express trata encoding e flags; o token nunca entra no body JSON.
    res.cookie(name, token, options);
}

export function clearSessionCookie(res, name, options) {
    const { maxAge: _maxAge, ...clearOptions } = options;
    res.clearCookie(name, clearOptions);
}
```

**`backend/tests/unit/mf1-cookies.test.js`**

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { hasCookie, readCookie } from "../../src/utils/cookies.js";

test("MF1 trata percent-encoding de cookie malformado como ausente", () => {
    for (const encoded of ["%", "%E0%A4%A", "%ZZ"]) {
        const req = { headers: { cookie: `faithflix_session=${encoded}` } };
        // O middleware consegue distinguir presença de valor decodificável.
        assert.equal(hasCookie(req, "faithflix_session"), true);
        assert.equal(readCookie(req, "faithflix_session"), null);
    }
});

test("MF1 conserva cookie com encoding válido", () => {
    const req = { headers: { cookie: "faithflix_session=abc%3D123" } };
    assert.equal(readCookie(req, "faithflix_session"), "abc=123");
});
```

**`backend/src/modules/auth/token.service.js`**

```js
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// O token tem entropia suficiente e só a sua impressão SHA-256 será persistida.
export function createOpaqueToken() {
    return randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(rawToken) {
    return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export function safeHashEquals(leftHash, rightHash) {
    const left = Buffer.from(leftHash ?? "", "hex");
    const right = Buffer.from(rightHash ?? "", "hex");

    return left.length === right.length && timingSafeEqual(left, right);
}
```

**`backend/src/modules/auth/session.service.js`**

```js
import { getDb } from "../../config/database.js";
import { SESSION_TTL_MS } from "../../config/session.js";
import { createOpaqueToken, hashOpaqueToken } from "./token.service.js";

// Centralizar as coleções evita que cada operação escolha uma ligação diferente.
async function collections() {
    const db = await getDb();
    return {
        sessions: db.collection("sessions"),
        users: db.collection("users"),
    };
}

function publicUser(user) {
    return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
    };
}

export async function ensureSessionIndexes() {
    const { sessions } = await collections();

    await Promise.all([
        sessions.createIndex({ tokenHash: 1 }, { unique: true }),
        sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
        sessions.createIndex({ userId: 1 }),
    ]);
}

export async function createSession(userId, { session = null } = {}) {
    const { sessions } = await collections();
    const rawToken = createOpaqueToken();
    const now = new Date();

    await sessions.insertOne(
        {
            tokenHash: hashOpaqueToken(rawToken),
            userId,
            createdAt: now,
            expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
            csrfTokenHash: null,
            csrfTokenHashes: [],
            csrfRotatedAt: null,
        },
        { session },
    );

    return rawToken;
}

export async function resolveSession(rawToken) {
    // A expiração é validada na leitura porque o monitor TTL não remove documentos imediatamente.
    if (!rawToken) {
        return null;
    }

    const { sessions, users } = await collections();
    const sessionDocument = await sessions.findOne({
        tokenHash: hashOpaqueToken(rawToken),
        expiresAt: { $gt: new Date() },
    });

    if (!sessionDocument) {
        return null;
    }

    const user = await users.findOne({
        _id: sessionDocument.userId,
        $and: [
            {
                $or: [
                    { accountStatus: "active" },
                    { accountStatus: { $exists: false } },
                ],
            },
            {
                $or: [
                    { status: "active" },
                    { status: { $exists: false } },
                ],
            },
        ],
    });

    if (!user) {
        return null;
    }

    return {
        id: sessionDocument._id.toString(),
        user: publicUser(user),
    };
}

export async function deleteSession(rawToken, { session = null } = {}) {
    if (!rawToken) {
        return;
    }

    const { sessions } = await collections();
    await sessions.deleteOne(
        { tokenHash: hashOpaqueToken(rawToken) },
        { session },
    );
}

export async function deleteUserSessions(userId, { session = null } = {}) {
    const { sessions } = await collections();
    await sessions.deleteMany({ userId }, { session });
}
```

5. Explicação do código.

O documento expira exatamente 24 horas depois de `createdAt`; não existe atualização de `expiresAt` em `resolveSession()`. O índice TTL limpa documentos expirados, mas a query também verifica a data porque o monitor TTL não é instantâneo. `publicUser()` funciona como allowlist e não devolve password hash. Todos os métodos de escrita aceitam `{ session }`, preparando reset, RGPD e auth transacionais.

6. Validação do passo.

Executa `node --check` nos quatro ficheiros. Numa DB local isolada, `ensureSessionIndexes()` deve criar um índice único em `tokenHash` e TTL com `expireAfterSeconds: 0`; guarda apenas a listagem dos índices, nunca tokens.

7. Cenário negativo/erro esperado.

Um token aleatório ou uma sessão expirada produz `null`. Nenhum desses casos pode criar um utilizador fictício, prolongar `expiresAt` ou devolver campos fora da allowlist.

### Passo 3 - Criar CSRF e guards de autenticação completos

1. Objetivo funcional do passo.

Rodar CSRF por sessão, conservar no máximo quatro hashes anteriores e impedir mutações autenticadas sem `Origin` e `X-CSRF-Token` válidos.

2. Ficheiros envolvidos.

- CRIAR: `backend/src/utils/async-handler.js`.
- CRIAR: `backend/src/modules/auth/csrf.service.js`.
- CRIAR: `backend/src/middlewares/session.middleware.js`, `auth.middleware.js`, `csrf.middleware.js`.
- LOCALIZAÇÃO: módulo `auth`, middlewares e utilitários.

3. Instruções do que fazer.

Cria primeiro `asyncHandler`, depois o service CSRF e por fim os três middlewares. O histórico aceita apenas hashes, cada um com data, e é cortado para quatro entradas. Não guardes nem escrevas tokens brutos em logs.

4. Código completo, correto e integrado com a app final.

**`backend/src/utils/async-handler.js`**

```js
export function asyncHandler(handler) {
    return function wrappedHandler(req, res, next) {
        // Encaminha rejeições async para o error handler do BK-MF1-01.
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}
```

**`backend/src/modules/auth/csrf.service.js`**

```js
import { HttpError } from "../../utils/http-error.js";
import { getDb } from "../../config/database.js";
import {
    createOpaqueToken,
    hashOpaqueToken,
    safeHashEquals,
} from "./token.service.js";

async function sessionsCollection() {
    return (await getDb()).collection("sessions");
}

export async function rotateCsrfToken(rawSessionToken) {
    const sessions = await sessionsCollection();
    const sessionDocument = await sessions.findOne({
        tokenHash: hashOpaqueToken(rawSessionToken),
        expiresAt: { $gt: new Date() },
    });

    if (!sessionDocument) {
        throw new HttpError(401, "Sessao invalida ou expirada.");
    }

    const rawCsrfToken = createOpaqueToken();
    const now = new Date();
    // Só hashes anteriores entram no histórico e a janela é limitada a quatro rotações.
    const previousHashes = [
        sessionDocument.csrfTokenHash
            ? {
                  hash: sessionDocument.csrfTokenHash,
                  createdAt: sessionDocument.csrfRotatedAt ?? now,
              }
            : null,
        ...(sessionDocument.csrfTokenHashes ?? []),
    ].filter(Boolean).slice(0, 4);

    // O hash atual faz parte do filtro para detetar duas rotações concorrentes.
    const result = await sessions.updateOne(
        {
            _id: sessionDocument._id,
            csrfTokenHash: sessionDocument.csrfTokenHash ?? null,
        },
        {
            $set: {
                csrfTokenHash: hashOpaqueToken(rawCsrfToken),
                csrfTokenHashes: previousHashes,
                csrfRotatedAt: now,
            },
        },
    );

    if (result.modifiedCount !== 1) {
        throw new HttpError(409, "A sessao foi atualizada; repete o pedido.");
    }

    return rawCsrfToken;
}

export async function verifyCsrfToken(rawSessionToken, rawCsrfToken) {
    if (!rawSessionToken || !rawCsrfToken) {
        return false;
    }

    const sessions = await sessionsCollection();
    const document = await sessions.findOne({
        tokenHash: hashOpaqueToken(rawSessionToken),
        expiresAt: { $gt: new Date() },
    });

    if (!document) {
        return false;
    }

    const presentedHash = hashOpaqueToken(rawCsrfToken);
    const acceptedHashes = [
        document.csrfTokenHash,
        ...(document.csrfTokenHashes ?? []).map(({ hash }) => hash),
    ].filter(Boolean);

    return acceptedHashes.some((hash) => safeHashEquals(presentedHash, hash));
}
```

**`backend/src/middlewares/session.middleware.js`**

```js
import { sessionConfig } from "../config/session.js";
import { resolveSession } from "../modules/auth/session.service.js";
import {
    clearSessionCookie,
    hasCookie,
    readCookie,
} from "../utils/cookies.js";

export async function attachSession(req, res, next) {
    // O token bruto vive apenas no pedido atual e nunca é devolvido no objeto público do utilizador.
    const cookieWasPresented = hasCookie(req, sessionConfig.cookieName);
    const rawToken = readCookie(req, sessionConfig.cookieName);
    const resolved = await resolveSession(rawToken);

    req.session = {
        isAuthenticated: Boolean(resolved),
        id: resolved?.id ?? null,
        rawToken: resolved ? rawToken : null,
    };
    req.user = resolved?.user ?? null;

    // Um cookie inválido é removido para não repetir a mesma resolução falhada em pedidos futuros.
    if (cookieWasPresented && !resolved) {
        clearSessionCookie(res, sessionConfig.cookieName, sessionConfig.cookie);
    }

    next();
}
```

**`backend/src/middlewares/auth.middleware.js`**

```js
import { HttpError } from "../utils/http-error.js";

export function requireAuth(req, _res, next) {
    if (!req.session?.isAuthenticated || !req.user) {
        return next(new HttpError(401, "Autenticacao necessaria."));
    }

    return next();
}
```

**`backend/src/middlewares/csrf.middleware.js`**

```js
import { env } from "../config/env.js";
import { verifyCsrfToken } from "../modules/auth/csrf.service.js";
import { HttpError } from "../utils/http-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const PUBLIC_AUTH_POST_PATHS = new Set([
    "/api/auth/register",
    "/api/auth/login",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
]);

function isPublicAuthPost(req) {
    return req.method === "POST" && PUBLIC_AUTH_POST_PATHS.has(req.path);
}

export async function csrfProtection(req, _res, next) {
    if (SAFE_METHODS.has(req.method)) {
        return next();
    }

    const origin = req.get("Origin");
    const fetchSite = req.get("Sec-Fetch-Site");
    const isBrowserMutation = Boolean(origin || fetchSite);

    // Origin/Sec-Fetch-Site distinguem browser de clientes CLI sem estes headers.
    if (
        isBrowserMutation &&
        (!origin || !env.frontendOrigins.includes(origin))
    ) {
        const error = new HttpError(403, "Origem nao autorizada.");
        error.code = "ORIGIN_FORBIDDEN";
        return next(error);
    }

    // Exceção fechada: estes quatro POST não dependem de uma sessão anterior.
    // A comparação ocorre depois de Origin para também conter login CSRF.
    if (isPublicAuthPost(req)) {
        return next();
    }

    // Sem sessão não existe credencial cookie a proteger; a rota decide se aceita anonimato.
    if (!req.session?.isAuthenticated) {
        return next();
    }

    const csrfToken = req.get("X-CSRF-Token");
    const valid = await verifyCsrfToken(req.session.rawToken, csrfToken);

    if (!valid) {
        const error = new HttpError(403, "Token CSRF invalido.");
        // O cliente renova/reenvia uma única vez apenas para este código estável.
        error.code = "CSRF_INVALID";
        return next(error);
    }

    return next();
}
```

5. Explicação do código.

`attachSession()` torna anonimato explícito e limpa cookies inválidos, mas não
responde 401 numa rota pública. `requireAuth()` é o guard reutilizável.
`csrfProtection()` ignora métodos seguros. Uma mutation com `Origin` ou
`Sec-Fetch-Site` é contexto browser e valida primeiro a origin exata da
allowlist; a presença de `Sec-Fetch-Site` sem `Origin` falha fechada. Clientes
CLI sem ambos os headers não são falsamente classificados como browser, mas uma
sessão autenticada continua a exigir CSRF. A única exceção ao token CSRF é a
lista fechada dos quatro `POST /api/auth/*` públicos; ela aplica-se mesmo quando
o browser ainda transporta um cookie válido e não dispensa `Origin`. Depois
dessa exceção, uma mutation autenticada exige um token ligado à sessão. O código
`CSRF_INVALID` alimenta o único retry seguro do cliente API. A rotação usa
compare-and-set para não ocultar uma corrida e conserva apenas os quatro hashes
anteriores, nunca os valores brutos.

6. Validação do passo.

Executa `node --check` nos cinco ficheiros. Um teste com DB double deve provar: histórico `<=4`, token bruto ausente no documento, `GET` não bloqueado, e mutation autenticada com token/origem válidos aceita.

7. Cenário negativo/erro esperado.

Uma mutation simulada como browser com `Sec-Fetch-Site: same-origin`, mas sem
`Origin`, ou com origem desconhecida devolve `403 ORIGIN_FORBIDDEN`. Fora dos
quatro POST públicos de autenticação, uma mutation autenticada sem header CSRF
ou com token falso devolve `403 CSRF_INVALID`.
Duas rotações sobre a mesma versão da sessão não podem ambas ser aceites
silenciosamente; a perdedora devolve `409`.

### Passo 4 - Integrar controllers, rotas e arranque

1. Objetivo funcional do passo.

Expor o contrato de sessão e montar os novos middlewares sem remover `GET /api`, 404 ou error handler do primeiro BK.

2. Ficheiros envolvidos.

- CRIAR: `backend/src/modules/auth/session.controller.js`, `session.routes.js`.
- EDITAR: `backend/src/app.js`, `backend/src/server.js`.
- LOCALIZAÇÃO: módulo auth e composição Express.

3. Instruções do que fazer.

Cria controller e router; depois substitui `app.js` e `server.js` pelas versões aditivas abaixo. `attachSession` fica antes de CSRF e das rotas. `csrfProtection` fica global para proteger também futuras mutations autenticadas.

4. Código completo, correto e integrado com a app final.

**`backend/src/modules/auth/session.controller.js`**

```js
import { sessionConfig } from "../../config/session.js";
import {
    clearSessionCookie,
} from "../../utils/cookies.js";
import { rotateCsrfToken } from "./csrf.service.js";
import { deleteSession } from "./session.service.js";

function disableSessionCaching(res) {
    res.set("Cache-Control", "private, no-store");
    res.set("Pragma", "no-cache");
}

// A rota de sessão usa uma allowlist e representa anonimato explicitamente como user null.
export function getCurrentSession(req, res) {
    // Aplica-se tanto a `{ user: null }` como a uma identidade autenticada.
    disableSessionCaching(res);
    return res.status(200).json({ user: req.user ?? null });
}

export async function getCsrfToken(req, res) {
    const csrfToken = await rotateCsrfToken(req.session.rawToken);
    disableSessionCaching(res);
    return res.status(200).json({ csrfToken });
}

export async function logout(req, res) {
    // Persistência e cookie são removidos antes de devolver o contrato vazio 204.
    await deleteSession(req.session.rawToken);
    clearSessionCookie(res, sessionConfig.cookieName, sessionConfig.cookie);
    return res.status(204).end();
}
```

**`backend/src/modules/auth/session.routes.js`**

```js
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
    getCsrfToken,
    getCurrentSession,
    logout,
} from "./session.controller.js";

export const sessionRouter = Router();

// A leitura de identidade é pública; emissão de CSRF e logout exigem autenticação válida.
sessionRouter.get("/me", getCurrentSession);
sessionRouter.get("/csrf-token", requireAuth, asyncHandler(getCsrfToken));
sessionRouter.post("/logout", requireAuth, asyncHandler(logout));
```

**`backend/src/app.js`**

```js
import express from "express";
import { asyncHandler } from "./utils/async-handler.js";
import { csrfProtection } from "./middlewares/csrf.middleware.js";
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/error.middleware.js";
import { attachSession } from "./middlewares/session.middleware.js";
import { sessionRouter } from "./modules/auth/session.routes.js";
import { systemRouter } from "./modules/system/system.routes.js";

export function createApp() {
    const app = express();

    app.use(express.json({ limit: "1mb" }));
    // A sessão é resolvida antes de CSRF para o guard distinguir pedidos anónimos e autenticados.
    app.use(asyncHandler(attachSession));
    app.use(asyncHandler(csrfProtection));

    // Preserva a rota técnica do BK-MF1-01 e acrescenta apenas o novo router.
    app.use("/api", systemRouter);
    app.use("/api/session", sessionRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
}
```

**`backend/src/server.js`**

```js
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureSessionIndexes } from "./modules/auth/session.service.js";

// Os índices de unicidade e expiração têm de existir antes de a API aceitar sessões.
await ensureSessionIndexes();

const app = createApp();

app.listen(env.port, () => {
    console.log(JSON.stringify({
        level: "info",
        message: "FaithFlix API started",
        service: env.serviceName,
        port: env.port,
    }));
});
```

5. Explicação do código.

`GET /me` é público e representa a ausência de identidade como `{ user: null }`. O token CSRF exige `requireAuth`, roda o hash e nunca permite cache partilhada. Logout também exige sessão e, por ser POST autenticado, passa primeiro por CSRF; elimina o documento, limpa o cookie e responde sem body. `app.js` conserva a rota técnica e os handlers anteriores. O arranque cria os índices antes de aceitar tráfego; o graceful shutdown entra no BK seguinte.

6. Validação do passo.

Com MongoDB local isolado e as variáveis definidas, arranca `npm run dev`. `GET /api` continua 200, `GET /api/session/me` devolve exatamente `200 { "user": null }` e `GET /api/session/csrf-token` sem sessão devolve 401.

7. Cenário negativo/erro esperado.

Um cookie aleatório nunca autentica: `/me` continua 200 com `user: null`. `POST /api/session/logout` sem sessão devolve 401; com sessão mas sem Origin/CSRF devolve 403 e não elimina o documento.

### Passo 5 - Rever invariantes e preparar os testes isolados

1. Objetivo funcional do passo.

Confirmar a composição completa antes de o `BK-MF1-06` criar doubles e smoke tests, sem iniciar uma segunda implementação de sessão.

2. Ficheiros envolvidos.

- REVER: todos os ficheiros criados neste BK.
- REVER: `backend/src/app.js`, `backend/src/server.js`.
- LOCALIZAÇÃO: `backend/`.

3. Instruções do que fazer.

Confere imports, TTL, índices, ordem dos middlewares e os três endpoints. Regista resultados observados apenas depois de executar os comandos; não copies tokens, cookies, URI ou credenciais para a evidence.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

5. Explicação do código.

Este passo é uma revisão de integração. `BK-MF1-06` deve instalar um DB double exclusivamente por `setDbForTests()` com `NODE_ENV=test`, importar `createApp()` e abrir apenas uma porta efémera. Não deve executar `src/server.js`, ligar à DB normal ou criar outro resolver de sessão.

6. Validação do passo.

Executa `node --check` sobre todos os `.js` deste BK e confirma estaticamente que: `expiresAt - createdAt = 24 h`; `csrfTokenHashes.slice(0, 4)` limita o histórico; nenhuma escrita de sessão guarda token bruto; `attachSession` antecede CSRF; e `errorHandler` permanece no fim.

7. Cenário negativo/erro esperado.

Falha o BK se existir um import sem definição, fallback de MongoDB, `resolveSession()` constante, token em storage do browser, TTL deslizante, logout 200 com body ou mutation autenticada que contorne CSRF.

#### Critérios de aceite

- Os exports de base MongoDB existem, `setDbForTests()` recusa ambientes fora
  de teste e produção recusa uma topologia sem transações.
- A sessão expira no documento e no cookie ao fim de exatamente 24 horas, sem sliding renewal.
- `tokenHash` é único, `expiresAt` tem TTL e nenhum token bruto é persistido ou registado.
- A rotação conserva no máximo quatro hashes CSRF anteriores e deteta concorrência.
- `/api/session/me` devolve 200 com `user: null` sem sessão ou com cookie inválido.
- Cookie com `%`, percent-encoding truncado ou inválido não causa `500`: é
  tratado como ausente e, por ter sido apresentado, é limpo por `attachSession`.
- `/api/session/me` autenticado e anónimo usa sempre
  `Cache-Control: private, no-store` e `Pragma: no-cache`.
- `/api/session/csrf-token` exige autenticação e usa `Cache-Control: private, no-store`.
- Logout autenticado exige Origin/CSRF, elimina a sessão, limpa o cookie e devolve 204.
- Os quatro `POST /api/auth/*` públicos em contexto browser exigem Origin e
  dispensam apenas o token CSRF, mesmo com cookie de sessão anterior.
- Uma mutation com `Sec-Fetch-Site` mas sem Origin é recusada; uma CLI sem ambos
  não é tratada como browser, sem dispensar CSRF quando usa sessão autenticada.
- Nenhuma outra rota é abrangida pela exceção pública de CSRF.
- `GET /api`, 404 JSON e os handlers do `BK-MF1-01` permanecem montados.

#### Validação final

Dentro de `backend/`, sem usar a DB normal:

```bash
node --check src/config/env.js
node --check src/config/database.js
node --check src/modules/auth/session.service.js
node --check src/modules/auth/csrf.service.js
node --check src/middlewares/session.middleware.js
node --check src/middlewares/csrf.middleware.js
node --check src/modules/auth/session.controller.js
node --check src/app.js
node --check src/server.js
node --test tests/unit/mf1-cookies.test.js
```

Os pedidos funcionais e negativos são executados no `BK-MF1-06` com doubles; estes comandos apenas comprovam sintaxe e imports resolvíveis depois de `npm install`.

#### Evidence para PR/defesa

- `pr`: referência da alteração que cria MongoDB, sessão e CSRF na lane dos alunos.
- `proof`: índices, respostas sanitizadas e asserts do smoke isolado; nunca valores de tokens/cookies.
- `neg`: configuração ausente, cookie falso, CSRF ausente/inválido, origem recusada e rotação concorrente.
- `fonte`: `RNF13`, `RNF15`, este BK e `BK-MF1-06`.

#### Handoff

- `BK-MF1-05` reutiliza `pingDatabase()`, `closeDatabase()`, sessão/CSRF e composição aditiva da app.
- `BK-MF1-06` reutiliza `setDbForTests()` e `createApp()`; não abre o servidor principal.
- `BK-MF2-01` reutiliza `createSession()`, `sessionConfig`, `setSessionCookie()`, `requireAuth` e `csrfProtection`.
- Módulos críticos futuros passam `{ session }` e podem exigir `assertActiveTransaction()`.

#### Changelog

- `2026-07-10`: Origin tornou-se obrigatório em toda mutation identificada como
  browser; a exceção de token CSRF ficou limitada aos quatro POST públicos de
  autenticação, preservando clientes CLI sem headers de browser.
- `2026-07-10`: removido o resolver fictício e criado um percurso único MongoDB/sessão/CSRF, autocontido, transacional e testável com doubles.
- `2026-05-30`: primeira versão pedagógica da sessão base.
