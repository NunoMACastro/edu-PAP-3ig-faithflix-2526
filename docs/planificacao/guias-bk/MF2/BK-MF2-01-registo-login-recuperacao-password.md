# BK-MF2-01 - Registo, login e recuperacao de password

## Header

- `doc_id`: `GUIA-BK-MF2-01`
- `bk_id`: `BK-MF2-01`
- `macro`: `MF2`
- `owner`: `Matheus`
- `apoio`: `Mateus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `L`
- `dependencias`: `BK-MF1-06`
- `rf_rnf`: `RF01, RF02, RF05`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-02`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md`
- `last_updated`: `2026-05-31`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Neste BK vais implementar a identidade base da FaithFlix: registo de utilizador (`RF01`), login com sessao segura (`RF02`) e recuperacao de password (`RF05`).

No fim, deves conseguir explicar como um visitante passa a utilizador autenticado, como o backend reconhece esse utilizador nos pedidos seguintes e porque a aplicacao nao guarda passwords nem tokens sensiveis no browser.

### Importancia funcional

Identidade e a porta de entrada da aplicacao. Sem esta entrega, os BKs de perfil, roles, playback, favoritos, historico, subscricoes e privacidade nao conseguem aplicar ownership nem autorizacao.

### Scope-in

- Criar persistencia MongoDB para `users`, `sessions` e `password_reset_tokens`.
- Guardar passwords com hash seguro usando `node:crypto`.
- Criar sessoes com token opaco em cookie `HttpOnly`.
- Atualizar o middleware de sessao da `MF1` para preencher `req.user`.
- Criar endpoints de registo, login, sessao atual, logout, pedido de recuperacao e reset de password.
- Criar o cliente frontend de auth e a pagina de login/registo.

### Scope-out

- Login social.
- Envio real de email.
- Subscricoes e pagamentos.
- Perfis familiares avancados.
- Area admin.
- Autenticacao multifator.

### Glossario rapido

- `Utilizador`: pessoa registada na FaithFlix.
- `Sessao`: ligacao segura entre browser e backend depois do login.
- `Cookie HttpOnly`: cookie que o JavaScript do browser nao consegue ler.
- `Token opaco`: string aleatoria sem dados pessoais dentro.
- `Hash`: valor derivado de um segredo que permite verificar sem guardar o segredo original.
- `Reset token`: token temporario usado para trocar a password.

### Conceitos essenciais

- Autenticacao responde a pergunta "quem e este utilizador?".
- A password entra no backend apenas para ser validada; depois disso fica guardado apenas `passwordHash`.
- O browser guarda apenas o cookie de sessao. A sessao real fica no servidor, na colecao `sessions`.
- `req.user` passa a ser a fonte tecnica usada pelos BKs seguintes para ownership e roles.
- O pedido de recuperacao devolve uma mensagem generica para nao revelar se um email existe.

### Tempo estimado

- Leitura das dependencias e contratos: 20 min.
- Backend de auth e sessao: 110 min.
- Frontend de auth: 60 min.
- Validacao, negativos e evidence: 45 min.
- Remediacao: se o fluxo completo bloquear, fechar primeiro `register`, `login`, `me` e `logout`; depois terminar recuperacao de password.

### Erros comuns

- Guardar a password em texto claro.
- Guardar token em `localStorage`.
- Criar cookie sem `HttpOnly`.
- Devolver `passwordHash`, `tokenHash` ou `resetTokenHash` nas respostas.
- Usar `req.session.user` num BK e `req.user` noutro sem os alinhar.

### Check de compreensao

- [ ] Sei explicar o fluxo `register -> cookie -> me -> logout`.
- [ ] Sei porque a password precisa de hash.
- [ ] Sei porque `req.user` deve vir da sessao e nao de um ID enviado pelo frontend.
- [ ] Sei testar reset de password sem revelar se o email existe.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF1-06` concluido, com smoke tests da `MF1` verdes ou blockers registados.
- Pela cadeia de dependencias, `BK-MF1-04` ja entregou `sessionConfig`, `getSessionCookieOptions`, `clearSessionCookie`, `readCookie` e `attachSession`.
- Pela cadeia de dependencias, `BK-MF1-03` ja entregou `apiClient` e `credentials: "include"`.
- Backend Express modular criado em `backend/`.
- Frontend React + Vite criado em `frontend/`.
- `/health`, `requestLogger` e scripts `smoke` da `MF1` preservados.
- MongoDB local ou Atlas acessivel por `MONGODB_URI`.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Persistencia | MongoDB com `users`, `sessions`, `password_reset_tokens` |
| Password | `scrypt` com salt aleatorio |
| Sessao | token opaco em cookie `HttpOnly`; no MongoDB fica apenas `tokenHash` |
| User publico | `id`, `name`, `email`, `role` |
| Registo | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Sessao atual | `GET /api/session/me` |
| Logout | `POST /api/session/logout` |
| Recuperacao | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| Frontend | `authApi`, `AuthForms`, rota `/login` |

### Decisoes tecnicas

- `CANONICO`: a sessao autenticada usa cookie `HttpOnly`, alinhado com `RNF15`.
- `CANONICO`: a base de dados principal do MVP e MongoDB.
- `DERIVADO`: usa-se token opaco em vez de JWT para manter dados de sessao no servidor e reduzir exposicao no browser.
- `DERIVADO`: em ambiente PAP, o endpoint de recuperacao devolve o token na resposta para demonstracao controlada; em producao seria enviado por email.

### Guia de execucao (passo-a-passo)

### Passo 1 - Configurar persistencia e variaveis de ambiente

1. Objetivo do passo.

Preparar o backend para ligar ao MongoDB e manter o nome do cookie de sessao definido na `MF1`.

2. Ficheiros envolvidos.
    - EDITAR: `backend/package.json`
    - EDITAR: `backend/.env.example`
    - EDITAR: `backend/src/config/env.js`
    - LOCALIZACAO: acrescentar `mongodb` e variaveis, preservando scripts e dependencias da `MF1`

3. Instrucoes concretas.

Adiciona a dependencia `mongodb`, atualiza o modelo de ambiente e substitui `env.js` pelo ficheiro completo abaixo. No `package.json`, nao removas scripts criados na `MF1`, especialmente `smoke`, nem faças upgrade de `express` neste BK.

4. Codigo completo.

`backend/package.json`

```json
{
  "name": "faithflix-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js",
    "test": "node --test",
    "smoke": "node --test tests/smoke/*.test.js"
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

`backend/.env.example`

```env
NODE_ENV=development
PORT=3000
SERVICE_NAME=faithflix-api
SESSION_COOKIE_NAME=faithflix_session
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=faithflix
```

`backend/src/config/env.js`

```js
const DEFAULT_PORT = 3000;

function parsePort(value) {
  if (value === undefined || value === "") return DEFAULT_PORT;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error("PORT deve ser um numero inteiro entre 1 e 65535.");
  }

  return parsed;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  serviceName: process.env.SERVICE_NAME ?? "faithflix-api",
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
  mongoDbName: process.env.MONGODB_DB_NAME ?? "faithflix",
};

export const isProduction = env.nodeEnv === "production";
```

5. Explicacao do codigo ou da decisao.

`mongodb` permite persistir utilizadores e sessoes reais. `SESSION_COOKIE_NAME` continua igual ao BK anterior para nao partir `clearSessionCookie`. `express` fica na versao da `MF1` para evitar uma alteracao de runtime escondida neste BK. `smoke` fica preservado para a equipa continuar a validar a fundacao tecnica.

6. Validacao do passo.

Dentro de `backend/`, executa:

```bash
npm install
node -e "import('./src/config/env.js').then(({ env }) => console.log(env.mongoDbName))"
```

Resultado esperado: `faithflix`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se mudares o nome do cookie sem atualizar os helpers da `MF1`, o browser pode ficar com cookies antigos que o logout nao limpa.

### Passo 2 - Criar a ligacao MongoDB e indices de auth

1. Objetivo do passo.

Centralizar a ligacao a base de dados e criar indices para email unico, sessoes e tokens expiraveis.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/config/database.js`
    - CRIAR: `backend/src/modules/auth/auth.indexes.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Cria os dois ficheiros. O service de indices sera chamado antes de criar utilizadores, sessoes e tokens de recuperacao.

4. Codigo completo.

`backend/src/config/database.js`

```js
import { MongoClient } from "mongodb";
import { env } from "./env.js";

let clientPromise;

export async function getDb() {
  if (!clientPromise) {
    const client = new MongoClient(env.mongoUri);
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  return client.db(env.mongoDbName);
}
```

`backend/src/modules/auth/auth.indexes.js`

```js
import { getDb } from "../../config/database.js";

export async function ensureAuthIndexes() {
  const db = await getDb();

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("password_reset_tokens").createIndex({ tokenHash: 1 }, { unique: true });
  await db.collection("password_reset_tokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}
```

5. Explicacao do codigo ou da decisao.

`getDb()` reaproveita a mesma ligacao em vez de abrir uma nova por pedido. Os indices garantem que dois utilizadores nao partilham o mesmo email e que sessoes expiradas podem ser limpas pelo MongoDB.

6. Validacao do passo.

Com MongoDB ativo, executa:

```bash
node -e "import('./src/modules/auth/auth.indexes.js').then((m) => m.ensureAuthIndexes())"
```

Resultado esperado: o comando termina sem erro.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem indice unico em `users.email`, dois registos com o mesmo email poderiam criar logins ambiguos.

### Passo 3 - Criar validacao, passwords e tokens

1. Objetivo do passo.

Validar input de auth, criar hashes de password e criar tokens opacos para sessoes e reset.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/auth/auth.validation.js`
    - CRIAR: `backend/src/modules/auth/auth.password.js`
    - CRIAR: `backend/src/modules/auth/token.js`
    - LOCALIZACAO: ficheiros completos para novos ficheiros; integracao aditiva em `app.js`

3. Instrucoes concretas.

Cria os ficheiros abaixo no modulo `auth`.

4. Codigo completo.

`backend/src/modules/auth/auth.validation.js`

```js
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export function assertValidName(name) {
  const value = String(name ?? "").trim();
  if (value.length < 2 || value.length > 80) {
    throw httpError("O nome deve ter entre 2 e 80 caracteres.");
  }
  return value;
}

export function assertValidEmail(email) {
  const value = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(value)) {
    throw httpError("Email invalido.");
  }
  return value;
}

export function assertValidPassword(password) {
  const value = String(password ?? "");
  if (value.length < 10) {
    throw httpError("A password deve ter pelo menos 10 caracteres.");
  }
  return value;
}
```

`backend/src/modules/auth/auth.password.js`

```js
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [salt, storedKey] = String(storedHash ?? "").split(":");
  if (!salt || !storedKey) return false;

  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  const storedBuffer = Buffer.from(storedKey, "hex");

  if (storedBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(storedBuffer, derivedKey);
}
```

`backend/src/modules/auth/token.js`

```js
import { createHash, randomBytes } from "node:crypto";

export function createOpaqueToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return createHash("sha256").update(String(token)).digest("hex");
}
```

5. Explicacao do codigo ou da decisao.

A validacao rejeita dados fracos antes de chegar a base de dados. `hashPassword` guarda `salt:hash`, nao a password original. `timingSafeEqual` reduz risco de ataques por tempo de comparacao. `hashToken` permite guardar apenas o hash do token de sessao ou reset.

6. Validacao do passo.

Executa:

```bash
node -e "import('./src/modules/auth/auth.password.js').then(async (m) => console.log(await m.verifyPassword('abc', await m.hashPassword('abc'))))"
```

Resultado esperado: `true`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se guardares o token de reset em texto claro, quem aceder a base de dados consegue mudar passwords.

### Passo 4 - Implementar sessoes reais e atualizar o middleware

1. Objetivo do passo.

Substituir a sessao base da `MF1` por sessao real em MongoDB e garantir que os proximos BKs usam `req.user`.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/auth/session.service.js`
    - EDITAR: `backend/src/middlewares/session.middleware.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Substitui os dois ficheiros pelos conteudos abaixo. Mantem `readCookie` e `sessionConfig` criados na `MF1`.

4. Codigo completo.

`backend/src/modules/auth/session.service.js`

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { ensureAuthIndexes } from "./auth.indexes.js";
import { createOpaqueToken, hashToken } from "./token.js";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function createSession(user) {
  await ensureAuthIndexes();

  const db = await getDb();
  const token = createOpaqueToken();
  const now = new Date();

  await db.collection("sessions").insertOne({
    userId: user._id,
    tokenHash: hashToken(token),
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });

  return token;
}

export async function resolveSession(token) {
  if (!token) return null;

  const db = await getDb();
  const session = await db.collection("sessions").findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null;

  const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
  if (!user) return null;

  return { token, user: toPublicUser(user) };
}

export async function deleteSession(token) {
  if (!token) return;

  const db = await getDb();
  await db.collection("sessions").deleteOne({ tokenHash: hashToken(token) });
}
```

`backend/src/middlewares/session.middleware.js`

```js
import { sessionConfig } from "../config/session.js";
import { resolveSession } from "../modules/auth/session.service.js";
import { readCookie } from "../utils/cookies.js";

export async function attachSession(req, _res, next) {
  try {
    const token = readCookie(req, sessionConfig.cookieName);
    const resolvedSession = await resolveSession(token);

    req.session = {
      token,
      user: resolvedSession?.user ?? null,
      isAuthenticated: Boolean(resolvedSession?.user),
    };

    // Os BKs seguintes usam req.user para aplicar ownership e roles no backend.
    req.user = req.session.user;

    next();
  } catch (error) {
    next(error);
  }
}
```

5. Explicacao do codigo ou da decisao.

O token real fica no cookie e o hash fica na base de dados. O middleware passa a resolver a sessao em cada pedido e coloca o utilizador publico em `req.user`. Isto impede que o frontend escolha outro `userId` para criar dados em nome de outra pessoa.

6. Validacao do passo.

Depois de concluir os endpoints do Passo 6, `GET /api/session/me` deve devolver o utilizador autenticado quando o cookie existir.

7. Caso negativo, erro comum ou risco que este passo evita.

Se `req.user` nao for preenchido aqui, `BK-MF2-02`, `BK-MF2-03`, `BK-MF2-05` e `BK-MF2-07` ficam sem base de autorizacao.

### Passo 5 - Criar o service de autenticacao

1. Objetivo do passo.

Implementar regras de negocio para registo, login e recuperacao de password.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/auth/auth.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o ficheiro abaixo. Ele usa os utilitarios dos passos anteriores.

4. Codigo completo.

```js
import { getDb } from "../../config/database.js";
import { hashPassword, verifyPassword } from "./auth.password.js";
import { ensureAuthIndexes } from "./auth.indexes.js";
import { assertValidEmail, assertValidName, assertValidPassword } from "./auth.validation.js";
import { createSession, toPublicUser } from "./session.service.js";
import { createOpaqueToken, hashToken } from "./token.js";

const RESET_TTL_MS = 1000 * 60 * 30;

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function registerUser(input) {
  await ensureAuthIndexes();

  const name = assertValidName(input.name);
  const email = assertValidEmail(input.email);
  const password = assertValidPassword(input.password);
  const db = await getDb();

  try {
    const now = new Date();
    const result = await db.collection("users").insertOne({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "user",
      createdAt: now,
      updatedAt: now,
    });

    const user = { _id: result.insertedId, name, email, role: "user" };
    return { user: toPublicUser(user), token: await createSession(user) };
  } catch (error) {
    if (error.code === 11000) {
      throw httpError("Este email ja esta registado.", 409);
    }
    throw error;
  }
}

export async function loginUser(input) {
  const email = assertValidEmail(input.email);
  const password = String(input.password ?? "");
  const db = await getDb();
  const user = await db.collection("users").findOne({ email });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw httpError("Credenciais invalidas.", 401);
  }

  return { user: toPublicUser(user), token: await createSession(user) };
}

export async function requestPasswordReset(input) {
  const email = assertValidEmail(input.email);
  const db = await getDb();
  const user = await db.collection("users").findOne({ email });
  const response = { message: "Se o email existir, foi criado um pedido de recuperacao." };

  if (!user) return response;

  const resetToken = createOpaqueToken();
  await db.collection("password_reset_tokens").insertOne({
    userId: user._id,
    tokenHash: hashToken(resetToken),
    usedAt: null,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });

  return { ...response, resetToken };
}

export async function resetPassword(input) {
  const token = String(input.token ?? "").trim();
  const password = assertValidPassword(input.password);
  const db = await getDb();
  const reset = await db.collection("password_reset_tokens").findOne({
    tokenHash: hashToken(token),
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!reset) {
    throw httpError("Token de recuperacao invalido ou expirado.", 400);
  }

  await db.collection("users").updateOne(
    { _id: reset.userId },
    { $set: { passwordHash: await hashPassword(password), updatedAt: new Date() } },
  );

  await db.collection("password_reset_tokens").updateOne(
    { _id: reset._id },
    { $set: { usedAt: new Date() } },
  );

  return { message: "Password atualizada com sucesso." };
}
```

5. Explicacao do codigo ou da decisao.

O service concentra as regras de auth. O registo cria utilizador com `role: "user"`. O login compara password sem expor o hash. A recuperacao usa resposta generica e marca o token como usado depois do reset.

6. Validacao do passo.

Depois de criares as rotas, regista um utilizador, faz login e confirma que a colecao `users` contem `passwordHash`, mas nao contem a password original.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o reset token puder ser reutilizado, uma pessoa com token antigo poderia voltar a mudar a password.

### Passo 6 - Criar controllers, rotas e montagem Express

1. Objetivo do passo.

Expor endpoints HTTP reais para o frontend e manter `GET /api/session/me` alinhado com `req.user`.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/utils/async-handler.js`
    - CRIAR: `backend/src/modules/auth/auth.controller.js`
    - EDITAR: `backend/src/modules/auth/auth.routes.js`
    - CRIAR: `backend/src/modules/auth/session.routes.js`
    - EDITAR: `backend/src/app.js`
    - LOCALIZACAO: ficheiros completos para novos ficheiros; integracao aditiva em `app.js`

3. Instrucoes concretas.

Cria ou substitui apenas os ficheiros do modulo de auth indicados abaixo. Em `app.js`, acrescenta `/api/auth` e troca a rota de sessao base por `sessionRouter`, preservando `/health`, `requestLogger`, `/api`, `notFoundHandler` e `errorHandler` vindos da `MF1`.

4. Codigo completo.

`backend/src/utils/async-handler.js`

```js
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
```

`backend/src/modules/auth/auth.controller.js`

```js
import { getSessionCookieOptions } from "../../config/session.js";
import { clearSessionCookie } from "../../utils/cookies.js";
import { deleteSession } from "./session.service.js";
import { loginUser, registerUser, requestPasswordReset, resetPassword } from "./auth.service.js";

function setSessionCookie(res, token) {
  res.cookie(process.env.SESSION_COOKIE_NAME ?? "faithflix_session", token, getSessionCookieOptions());
}

export async function register(req, res) {
  const result = await registerUser(req.body);
  setSessionCookie(res, result.token);
  res.status(201).json({ user: result.user });
}

export async function login(req, res) {
  const result = await loginUser(req.body);
  setSessionCookie(res, result.token);
  res.status(200).json({ user: result.user });
}

export async function me(req, res) {
  res.status(200).json({ user: req.user ?? null });
}

export async function forgotPassword(req, res) {
  res.status(200).json(await requestPasswordReset(req.body));
}

export async function resetPasswordController(req, res) {
  res.status(200).json(await resetPassword(req.body));
}

export async function logout(req, res) {
  await deleteSession(req.session?.token);
  clearSessionCookie(res);
  res.status(204).send();
}
```

`backend/src/modules/auth/auth.routes.js`

```js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { forgotPassword, login, register, resetPasswordController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.post("/forgot-password", asyncHandler(forgotPassword));
authRouter.post("/reset-password", asyncHandler(resetPasswordController));
```

`backend/src/modules/auth/session.routes.js`

```js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { logout, me } from "./auth.controller.js";

export const sessionRouter = Router();

sessionRouter.get("/me", asyncHandler(me));
sessionRouter.post("/logout", asyncHandler(logout));
```

`backend/src/app.js`

```js
import express from "express";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { attachSession } from "./middlewares/session.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { sessionRouter } from "./modules/auth/session.routes.js";
import { healthRouter } from "./modules/system/health.routes.js";
import { systemRouter } from "./modules/system/system.routes.js";

export function createApp() {
  const app = express();

  app.use(requestLogger);
  app.use(express.json({ limit: "1mb" }));
  app.use(attachSession);

  app.use("/health", healthRouter);
  app.use("/api", systemRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/session", sessionRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
```

5. Explicacao do codigo ou da decisao.

O controller nunca devolve campos internos. O cookie e criado so depois de registo ou login validos. `GET /api/session/me` devolve `user: null` sem sessao para que o frontend consiga saber se deve mostrar login sem tratar isso como erro de servidor. A montagem preserva `/health` e `requestLogger`, porque a `MF2` deve construir sobre a fundacao validada na `MF1`, nao substitui-la.

6. Validacao do passo.

Executa o backend e usa cookies num ficheiro temporario:

```bash
curl -i -c /tmp/faithflix-cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aluno Teste","email":"aluno@example.com","password":"password-segura-123"}'

curl -i -b /tmp/faithflix-cookies.txt http://localhost:3000/api/session/me
curl -i -b /tmp/faithflix-cookies.txt -X POST http://localhost:3000/api/session/logout
```

Resultados esperados: `201`, depois `200` com utilizador, depois `204`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se testares endpoints protegidos sem enviar cookie, vais receber respostas erradas para o objetivo do teste. Usa sempre `-c` e `-b` no `curl` quando validas sessao.

### Passo 7 - Criar cliente frontend e pagina de autenticacao

1. Objetivo do passo.

Ligar a UI aos endpoints de auth usando o `apiClient` da `MF1`.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/authApi.js`
    - CRIAR: `frontend/src/components/auth/AuthForms.jsx`
    - EDITAR: `frontend/src/pages/pages.jsx`
    - LOCALIZACAO: ficheiros completos ou funcao `LoginPage`

3. Instrucoes concretas.

Cria `authApi.js` e `AuthForms.jsx`. Depois substitui a funcao `LoginPage` no ficheiro `pages.jsx` para renderizar o formulario real.

4. Codigo completo.

`frontend/src/services/api/authApi.js`

```js
import { apiClient } from "./apiClient.js";

export const authApi = {
  register(data) {
    return apiClient.post("/api/auth/register", data);
  },
  login(data) {
    return apiClient.post("/api/auth/login", data);
  },
  forgotPassword(data) {
    return apiClient.post("/api/auth/forgot-password", data);
  },
  resetPassword(data) {
    return apiClient.post("/api/auth/reset-password", data);
  },
  me() {
    return apiClient.get("/api/session/me");
  },
  logout() {
    return apiClient.post("/api/session/logout");
  },
};
```

`frontend/src/components/auth/AuthForms.jsx`

```jsx
import { useState } from "react";
import { authApi } from "../../services/api/authApi.js";

const INITIAL_FORM = { name: "", email: "", password: "", token: "" };

export function AuthForms() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    try {
      if (mode === "register") {
        await authApi.register({ name: form.name, email: form.email, password: form.password });
        setStatus("Conta criada e sessao iniciada.");
      }

      if (mode === "login") {
        await authApi.login({ email: form.email, password: form.password });
        setStatus("Sessao iniciada.");
      }

      if (mode === "forgot") {
        const response = await authApi.forgotPassword({ email: form.email });
        setStatus(response.resetToken ? `Token de recuperacao: ${response.resetToken}` : response.message);
      }

      if (mode === "reset") {
        await authApi.resetPassword({ token: form.token, password: form.password });
        setStatus("Password atualizada. Ja podes iniciar sessao.");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-panel" data-testid="auth-form">
      <div className="auth-tabs" aria-label="Autenticacao">
        {["login", "register", "forgot", "reset"].map((item) => (
          <button key={item} type="button" className={mode === item ? "active" : ""} onClick={() => setMode(item)}>
            {item}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="auth-form">
        {mode === "register" ? (
          <label>
            Nome
            <input name="name" value={form.name} onChange={updateField} autoComplete="name" />
          </label>
        ) : null}

        {mode !== "reset" ? (
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" />
          </label>
        ) : null}

        {mode === "reset" ? (
          <label>
            Token
            <input name="token" value={form.token} onChange={updateField} />
          </label>
        ) : null}

        {mode !== "forgot" ? (
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} autoComplete="current-password" />
          </label>
        ) : null}

        <button type="submit" disabled={loading}>{loading ? "A validar..." : "Confirmar"}</button>
      </form>

      {status ? <p className="form-status">{status}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </section>
  );
}
```

`frontend/src/pages/pages.jsx` - funcao `LoginPage`

```jsx
import { AuthForms } from "../components/auth/AuthForms.jsx";

export function LoginPage() {
  return (
    <main className="page-shell">
      <h1>Entrar no FaithFlix</h1>
      <p>Cria conta, inicia sessao ou recupera o acesso com seguranca.</p>
      <AuthForms />
    </main>
  );
}
```

5. Explicacao do codigo ou da decisao.

O frontend nunca le o cookie. O browser envia o cookie automaticamente porque o `apiClient` usa `credentials: "include"`. O estado `loading` evita duplo submit. A mensagem de recuperacao pode mostrar o token no ambiente PAP.

6. Validacao do passo.

Arranca backend e frontend. Abre `/login`, cria uma conta, recarrega a pagina e chama `authApi.me()` na consola ou cria uma validacao temporaria no componente.

7. Caso negativo, erro comum ou risco que este passo evita.

Nao uses `localStorage.setItem("token", ...)`. Isso quebraria a decisao de seguranca da `MF1`.

### Passo 8 - Validar fluxo completo e negativos

1. Objetivo do passo.

Provar que identidade, sessao e recuperacao funcionam e falham de forma controlada.

2. Ficheiros envolvidos.
    - REVER: `backend/src/modules/auth/*`
    - REVER: `frontend/src/components/auth/AuthForms.jsx`
    - REVER: `frontend/src/services/api/authApi.js`
    - LOCALIZACAO: validacao funcional

3. Instrucoes concretas.

Executa os comandos abaixo e guarda outputs para evidence. Mantem o script `smoke` da `MF1`; se a semantica de `GET /api/session/me` sem cookie passar de `401` para `200 { user: null }`, atualiza o teste smoke correspondente em vez de apagar a suite.

4. Codigo completo.

```bash
curl -i -c /tmp/faithflix-cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aluno Teste","email":"aluno@example.com","password":"password-segura-123"}'

curl -i -b /tmp/faithflix-cookies.txt http://localhost:3000/api/session/me

curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@example.com","password":"errada"}'

curl -i -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@example.com"}'
```

5. Explicacao do codigo ou da decisao.

`-c` guarda cookies recebidos e `-b` envia esses cookies. O teste com password errada valida que o backend nao inicia sessao indevida. O pedido de recuperacao valida a resposta generica.

6. Validacao do passo.

Resultados esperados:

- registo devolve `201` e `Set-Cookie` com `HttpOnly`;
- `GET /api/session/me` devolve `200` com `user.id`, `user.name`, `user.email`, `user.role`;
- login errado devolve `401`;
- recuperacao devolve `200` com mensagem generica.
- `npm run smoke` continua executavel e ajustado a nova sessao real.

7. Caso negativo, erro comum ou risco que este passo evita.

Se a resposta de `me` mostrar `passwordHash`, `tokenHash` ou `resetTokenHash`, para e corrige antes de avanar.

## Snippet tecnico aplicavel

O centro tecnico deste BK e a passagem de sessao resolvida para `req.user`. O codigo completo esta no Passo 4.

```js
req.session = {
  token,
  user: resolvedSession?.user ?? null,
  isAuthenticated: Boolean(resolvedSession?.user),
};
req.user = req.session.user;
```

## Criterios de aceite (mensuraveis)

- `POST /api/auth/register` cria utilizador com password em hash e inicia sessao.
- `POST /api/auth/login` inicia sessao apenas com credenciais validas.
- `GET /api/session/me` devolve o utilizador autenticado quando o cookie e valido.
- `POST /api/session/logout` apaga a sessao e limpa o cookie.
- `POST /api/auth/forgot-password` nao revela se o email existe.
- `POST /api/auth/reset-password` aceita apenas token valido, nao expirado e nao usado.
- O frontend permite registar, iniciar sessao, pedir recuperacao e repor password.
- Pelo menos cinco negativos ficam registados.

## Validacao final

- Executar `npm test` dentro de `backend`, se existir suite ativa.
- Executar `npm run smoke` dentro de `backend`, preservando os testes da `MF1` ajustados ao novo contrato de sessao real.
- Executar backend e frontend em modo desenvolvimento.
- Validar comandos `curl` do Passo 8.
- Confirmar que o cookie tem `HttpOnly`.
- Confirmar no MongoDB que a password original nao esta guardada.

## Evidence para PR/defesa

- Output de registo com `201`.
- Output de `GET /api/session/me` autenticado.
- Output de logout com `204`.
- Output de login errado com `401`.
- Output de recuperacao com resposta generica.
- Captura da pagina `/login` com estado de sucesso ou erro.

## Handoff

Para `BK-MF2-02`, entregar:

- `req.user` preenchido com `id`, `name`, `email` e `role`.
- Colecao `users` com `role: "user"` por defeito.
- Endpoints `/api/auth/*` e `/api/session/*`.
- Garantia de que o frontend nao guarda token em storage local.

## Proximo BK recomendado

`BK-MF2-02 - Edicao de perfil e papeis base`

## Changelog

- `2026-05-31`: Corrigido o guia para fechar sessao real com MongoDB, cookie HttpOnly, `req.user`, recuperacao de password, frontend e negativos.
