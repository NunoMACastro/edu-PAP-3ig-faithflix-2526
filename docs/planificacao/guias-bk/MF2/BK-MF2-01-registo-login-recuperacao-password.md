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
- `dependencias`: `BK-MF1-04`
- `rf_rnf`: `RF01, RF02, RF05`
- `fase_documental`: `Fase 1`
- `sprint`: `S02`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-02`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-01-registo-login-recuperacao-password.md`
- `last_updated`: `2026-05-31`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Construir a identidade base do FaithFlix: registo, login, sessao autenticada e recuperacao de password. Este BK cobre `RF01`, `RF02` e `RF05`, e prepara `BK-MF2-02`, subscricoes, consentimentos e area admin.

No fim, o aluno deve conseguir explicar a diferenca entre autenticar um utilizador, manter uma sessao e recuperar acesso sem expor dados sensiveis.

### Tempo estimado

- Planeamento e leitura das dependencias: 20 min.
- Backend de autenticacao: 90 min.
- Frontend de auth: 60 min.
- Testes, negativos e evidence: 45 min.
- Remediacao: se a equipa passar 45 min bloqueada, reduzir o escopo para registo/login/me/logout antes de fechar reset de password.

### Conceitos essenciais

- Password nunca e guardada em texto claro.
- Sessao do browser usa cookie `HttpOnly`, nao `localStorage`.
- Token de reset e opaco, expira e fica guardado apenas em hash.
- Mensagens de recuperacao nao revelam se o email existe.
- A persistencia e MongoDB porque o contrato tecnico do produto define MongoDB Atlas para dados do MVP.

### Erros comuns

- Guardar password ou token de reset sem hash.
- Criar token JWT sem necessidade e depois guardar informacao sensivel no browser.
- Devolver `passwordHash`, `resetTokenHash` ou campos internos no `GET /api/session/me`.
- Criar endpoints frontend que nao existem no backend.
- Fazer reset de password sem invalidar o token usado.

### Check de compreensao

- [ ] Sei descrever o ciclo `register -> cookie -> me -> logout`.
- [ ] Sei porque o cookie precisa de `HttpOnly`, `SameSite=Lax` e `Secure` em producao.
- [ ] Sei porque o reset de password devolve a mesma mensagem para emails existentes e inexistentes.
- [ ] Sei que `BK-MF2-02` depende de `req.user` resolvido por este BK.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF1-04` concluido: app Express modular, middleware de sessao base, cookie helpers, CORS com credenciais e frontend com `fetch` usando `credentials: "include"`.
- Node.js 20+.
- MongoDB local ou Atlas acessivel por `MONGODB_URI`.
- `backend/.env` criado a partir de `backend/.env.example`.
- A equipa sabe correr backend e frontend em terminais separados.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Persistencia | MongoDB com colecoes `users`, `sessions`, `password_reset_tokens` |
| Password | `crypto.scrypt` com salt aleatorio e comparacao segura |
| Sessao | token opaco em cookie `HttpOnly`; no MongoDB fica so `tokenHash` |
| Registo | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Recuperacao | `POST /api/auth/forgot-password` e `POST /api/auth/reset-password` |
| Sessao atual | `GET /api/session/me` |
| Logout | `POST /api/session/logout` |
| Frontend | formulario unico com modos `login`, `register`, `forgot`, `reset` |

### Decisoes tecnicas

- `CANONICO`: manter Express modular e cookies HttpOnly vindos da `MF1`.
- `CANONICO`: MongoDB e a base de dados do MVP, alinhado com os RNF de persistencia.
- `DERIVADO`: usar o driver oficial `mongodb`, porque este BK e a primeira entrega com persistencia real e nao precisa de uma camada ORM.
- `DERIVADO`: usar `node:crypto` em vez de uma dependencia externa para hashing, mantendo o BK simples e seguro para o nivel do projeto.
- `DERIVADO`: no ambiente PAP, `forgot-password` devolve o token de reset no corpo da resposta para permitir demonstracao sem servidor de email; em producao este token seria enviado por email.

### Guia de execucao (passo-a-passo)

### Passo 1 - Configurar MongoDB e variaveis de ambiente

1. `EDITAR backend/package.json`
2. Adicionar a dependencia:

```json
{
  "dependencies": {
    "mongodb": "^6.16.0"
  }
}
```

3. `EDITAR backend/.env.example`

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=faithflix
SESSION_COOKIE_NAME=faithflix.sid
```

4. `EDITAR backend/src/config/env.js`

```js
export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "faithflix.sid",
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
  mongoDbName: process.env.MONGODB_DB_NAME ?? "faithflix",
};
```

5. Correr `npm install` dentro de `backend/`.

### Passo 2 - Criar a ligacao a base de dados

`CRIAR backend/src/config/database.js`

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

### Passo 3 - Criar utilitarios de password e tokens

`CRIAR backend/src/modules/auth/auth.password.js`

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
  const [salt, storedKey] = storedHash.split(":");
  if (!salt || !storedKey) return false;

  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  const storedBuffer = Buffer.from(storedKey, "hex");

  if (storedBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(storedBuffer, derivedKey);
}
```

`CRIAR backend/src/modules/auth/token.js`

```js
import { createHash, randomBytes } from "node:crypto";

export function createOpaqueToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
```

### Passo 4 - Criar validacao de input

`CRIAR backend/src/modules/auth/auth.validation.js`

```js
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export function assertValidName(name) {
  const value = String(name ?? "").trim();
  if (value.length < 2 || value.length > 80) {
    const error = new Error("O nome deve ter entre 2 e 80 caracteres.");
    error.statusCode = 400;
    throw error;
  }
  return value;
}

export function assertValidEmail(email) {
  const value = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(value)) {
    const error = new Error("Email invalido.");
    error.statusCode = 400;
    throw error;
  }
  return value;
}

export function assertValidPassword(password) {
  const value = String(password ?? "");
  if (value.length < 10) {
    const error = new Error("A password deve ter pelo menos 10 caracteres.");
    error.statusCode = 400;
    throw error;
  }
  return value;
}
```

### Passo 5 - Criar servico de sessao

`CRIAR backend/src/modules/auth/session.service.js`

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { createOpaqueToken, hashToken } from "./token.js";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function createSession(user) {
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

  return { token, user: publicUser(user) };
}

export async function deleteSession(token) {
  if (!token) return;
  const db = await getDb();
  await db.collection("sessions").deleteOne({ tokenHash: hashToken(token) });
}
```

### Passo 6 - Criar servico de autenticacao

`CRIAR backend/src/modules/auth/auth.service.js`

```js
import { getDb } from "../../config/database.js";
import { hashPassword, verifyPassword } from "./auth.password.js";
import { assertValidEmail, assertValidName, assertValidPassword } from "./auth.validation.js";
import { createOpaqueToken, hashToken } from "./token.js";
import { createSession } from "./session.service.js";

const RESET_TTL_MS = 1000 * 60 * 30;

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function ensureAuthIndexes() {
  const db = await getDb();
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("password_reset_tokens").createIndex({ tokenHash: 1 }, { unique: true });
  await db.collection("password_reset_tokens").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

export async function registerUser(input) {
  await ensureAuthIndexes();

  const name = assertValidName(input.name);
  const email = assertValidEmail(input.email);
  const password = assertValidPassword(input.password);
  const db = await getDb();
  const passwordHash = await hashPassword(password);

  try {
    const result = await db.collection("users").insertOne({
      name,
      email,
      passwordHash,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = { _id: result.insertedId, name, email, role: "user" };
    return { user: publicUser(user), token: await createSession(user) };
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

  return { user: publicUser(user), token: await createSession(user) };
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

  if (!reset) throw httpError("Token de recuperacao invalido ou expirado.", 400);

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

### Passo 7 - Criar controller, rotas e middleware async

`CRIAR backend/src/utils/async-handler.js`

```js
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
```

`CRIAR backend/src/modules/auth/auth.controller.js`

```js
import { env } from "../../config/env.js";
import { clearSessionCookie, getSessionCookieOptions } from "../../config/session.js";
import { deleteSession } from "./session.service.js";
import { loginUser, registerUser, requestPasswordReset, resetPassword } from "./auth.service.js";

function setSessionCookie(res, token) {
  res.cookie(env.sessionCookieName, token, getSessionCookieOptions());
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

`EDITAR backend/src/modules/auth/auth.routes.js`

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

`CRIAR backend/src/modules/auth/session.routes.js`

```js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { logout, me } from "./auth.controller.js";

export const sessionRouter = Router();

sessionRouter.get("/me", asyncHandler(me));
sessionRouter.post("/logout", asyncHandler(logout));
```

`EDITAR backend/src/app.js` para montar as duas rotas:

```js
import { authRouter } from "./modules/auth/auth.routes.js";
import { sessionRouter } from "./modules/auth/session.routes.js";

app.use("/api/auth", authRouter);
app.use("/api/session", sessionRouter);
```

### Passo 8 - Ligar o frontend

`CRIAR frontend/src/services/api/authApi.js`

```js
import { apiClient } from "./apiClient.js";

export const authApi = {
  register(payload) {
    return apiClient.post("/api/auth/register", payload);
  },
  login(payload) {
    return apiClient.post("/api/auth/login", payload);
  },
  forgotPassword(payload) {
    return apiClient.post("/api/auth/forgot-password", payload);
  },
  resetPassword(payload) {
    return apiClient.post("/api/auth/reset-password", payload);
  },
  me() {
    return apiClient.get("/api/session/me");
  },
  logout() {
    return apiClient.post("/api/session/logout");
  },
};
```

`CRIAR frontend/src/components/auth/AuthForms.jsx`

```jsx
import { useState } from "react";
import { authApi } from "../../services/api/authApi.js";

const INITIAL_FORM = { name: "", email: "", password: "", token: "" };

export function AuthForms() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
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
        setStatus("Password atualizada. Ja pode iniciar sessao.");
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section className="auth-panel">
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

        <button type="submit">Confirmar</button>
      </form>

      {status ? <p className="form-status">{status}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </section>
  );
}
```

`EDITAR frontend/src/pages/pages.jsx`: substituir o conteudo de `LoginPage` por:

```jsx
import { AuthForms } from "../components/auth/AuthForms.jsx";

export function LoginPage() {
  return (
    <main className="page-shell">
      <h1>Entrar no FaithFlix</h1>
      <AuthForms />
    </main>
  );
}
```

### Passo 9 - Validar backend e frontend

Executar:

```bash
cd backend
npm install
npm run dev
```

Noutro terminal:

```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aluno Teste","email":"aluno@example.com","password":"password-segura-123"}'
curl -i -X POST http://localhost:3000/api/session/logout
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@example.com","password":"password-segura-123"}'
curl -i http://localhost:3000/api/session/me
curl -i -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@example.com"}'
```

### Passo 10 - Validar negativos minimos

Testar e registar:

- Registo com email repetido devolve `409`.
- Login com password errada devolve `401`.
- Reset com token expirado ou inventado devolve `400`.
- `GET /api/session/me` sem cookie devolve `{ "user": null }`.
- A resposta publica nunca inclui `passwordHash` nem `tokenHash`.

## Snippet tecnico aplicavel

O trecho mais importante deste BK e o par `createSession`/`resolveSession`, porque liga cookie, base de dados e `req.user`. O codigo completo esta no Passo 5.

```js
export async function createSession(user) {
  const token = createOpaqueToken();
  await db.collection("sessions").insertOne({ userId: user._id, tokenHash: hashToken(token), expiresAt });
  return token;
}
```

## Criterios de aceite (mensuraveis)

- `POST /api/auth/register` cria utilizador, guarda password em hash e inicia sessao.
- `POST /api/auth/login` inicia sessao apenas com credenciais validas.
- `POST /api/session/logout` apaga a sessao no servidor e limpa o cookie.
- `POST /api/auth/forgot-password` nao revela se o email existe.
- `POST /api/auth/reset-password` altera a password apenas com token valido e nao reutilizado.
- Frontend consegue registar, iniciar sessao, pedir recuperacao e repor password.
- Pelo menos cinco negativos ficam registados em evidence.

## Validacao final

- `npm run test:unit` dentro de `backend`, se existir no projeto.
- `npm run dev` no backend e frontend.
- Validacao manual com os comandos `curl` do Passo 9.
- Captura ou log do cookie `HttpOnly` definido apos login.
- Confirmar no MongoDB que `passwordHash` nao contem a password original.

## Evidence para PR/defesa

- Print ou log do registo com `201`.
- Print ou log do login com `200`.
- Print ou log de `GET /api/session/me` autenticado.
- Print ou log de logout com `204`.
- Print ou log de pelo menos tres negativos.
- Excerto do documento com a decisao sobre cookie `HttpOnly` e hashing.

## Handoff

Para `BK-MF2-02`, entregar:

- `req.user` com `id`, `name`, `email` e `role`.
- Colecao `users` com campo `role`.
- Endpoints `GET /api/session/me` e `POST /api/session/logout` estaveis.
- Garantia de que o proprio utilizador nao consegue editar `role` por este BK.

## Proximo BK recomendado

`BK-MF2-02 - Edicao de perfil e papeis base`

## Changelog

- `2026-05-31`: Guia reescrito com contratos de auth, MongoDB, cookies HttpOnly, recuperacao de password, frontend, negativos e evidence.
