# BK-MF2-02 - Edicao de perfil e papeis base

## Header

- `doc_id`: `GUIA-BK-MF2-02`
- `bk_id`: `BK-MF2-02`
- `macro`: `MF2`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-01`
- `rf_rnf`: `RF03, RF04`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-03`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-02-edicao-perfil-papeis-base.md`
- `last_updated`: `2026-05-31`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Permitir que um utilizador autenticado edite o proprio perfil (`RF03`) e estabelecer papeis base (`RF04`) para proteger funcionalidades futuras: catalogo, publicacao, administracao e gestao de utilizadores.

Este BK ensina a diferenca entre dados editaveis pelo proprio utilizador e dados de autorizacao que so um administrador pode alterar.

### Tempo estimado

- Revisao do BK anterior: 15 min.
- Middlewares de autenticacao e role: 35 min.
- Endpoints de perfil e admin: 70 min.
- UI de conta e validacao: 45 min.
- Evidence e negativos: 30 min.

### Conceitos essenciais

- Autenticacao responde a pergunta "quem e este utilizador?".
- Autorizacao responde a pergunta "este utilizador pode fazer esta acao?".
- `role` e campo de seguranca, nao campo de perfil.
- Um endpoint admin deve verificar role no servidor, mesmo que a UI esconda botoes.

### Erros comuns

- Permitir `PATCH /api/users/me` com `role`.
- Proteger apenas o frontend e esquecer o backend.
- Usar valores livres para role.
- Devolver dados internos de outros utilizadores.
- Criar admin sem processo auditavel.

### Check de compreensao

- [ ] Sei explicar porque `role` nao entra no formulario de perfil.
- [ ] Sei distinguir `requireAuth` de `requireRole`.
- [ ] Sei testar uma tentativa de elevacao de privilegio.
- [ ] Sei que `BK-MF2-03` precisa de roles para proteger CRUD de catalogo.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-01` concluido.
- `GET /api/session/me` devolve `user.id`, `user.name`, `user.email` e `user.role`.
- Colecao `users` existe com campo `role`.
- O backend ja aplica `attachSession` antes das rotas protegidas.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Roles validas | `user`, `moderator`, `admin` |
| Perfil proprio | `GET /api/users/me`, `PATCH /api/users/me` |
| Admin roles | `GET /api/users`, `PATCH /api/users/:id/role` |
| Campos editaveis pelo proprio utilizador | `name` |
| Campos bloqueados ao proprio utilizador | `email`, `role`, `createdAt`, `passwordHash` |
| Frontend | pagina `AccountPage` e painel simples `AdminUsersPage` |

### Decisoes tecnicas

- `CANONICO`: usar a sessao criada no `BK-MF2-01`.
- `DERIVADO`: `moderator` pode gerir catalogo no `BK-MF2-03`, mas nao gere roles.
- `DERIVADO`: criar script local para promover o primeiro admin, porque ainda nao existe area admin antes deste BK.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar middleware de autenticacao

`CRIAR backend/src/modules/auth/auth.middleware.js`

```js
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Autenticacao obrigatoria." });
  }

  return next();
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Autenticacao obrigatoria." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Permissao insuficiente." });
    }

    return next();
  };
}
```

### Passo 2 - Criar validacao de perfil e roles

`CRIAR backend/src/modules/users/user.validation.js`

```js
export const VALID_ROLES = ["user", "moderator", "admin"];

export function assertProfileUpdate(input) {
  const name = String(input.name ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    const error = new Error("O nome deve ter entre 2 e 80 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  return { name };
}

export function assertRoleUpdate(input) {
  const role = String(input.role ?? "").trim();

  if (!VALID_ROLES.includes(role)) {
    const error = new Error("Role invalida.");
    error.statusCode = 400;
    throw error;
  }

  return { role };
}
```

### Passo 3 - Criar servico de utilizadores

`CRIAR backend/src/modules/users/user.service.js`

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertProfileUpdate, assertRoleUpdate } from "./user.validation.js";

function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function assertObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const error = new Error("Utilizador invalido.");
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(id);
}

export async function getMyProfile(userId) {
  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: assertObjectId(userId) });
  if (!user) {
    const error = new Error("Utilizador nao encontrado.");
    error.statusCode = 404;
    throw error;
  }
  return toPublicUser(user);
}

export async function updateMyProfile(userId, input) {
  const update = assertProfileUpdate(input);
  const db = await getDb();

  const result = await db.collection("users").findOneAndUpdate(
    { _id: assertObjectId(userId) },
    { $set: { ...update, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!result) {
    const error = new Error("Utilizador nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(result);
}

export async function listUsers() {
  const db = await getDb();
  const users = await db.collection("users").find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).toArray();
  return users.map(toPublicUser);
}

export async function updateUserRole(targetUserId, input) {
  const update = assertRoleUpdate(input);
  const db = await getDb();

  const result = await db.collection("users").findOneAndUpdate(
    { _id: assertObjectId(targetUserId) },
    { $set: { ...update, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!result) {
    const error = new Error("Utilizador nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(result);
}
```

### Passo 4 - Criar controller e rotas

`CRIAR backend/src/modules/users/user.controller.js`

```js
import { getMyProfile, listUsers, updateMyProfile, updateUserRole } from "./user.service.js";

export async function getMe(req, res) {
  res.status(200).json({ user: await getMyProfile(req.user.id) });
}

export async function patchMe(req, res) {
  res.status(200).json({ user: await updateMyProfile(req.user.id, req.body) });
}

export async function getUsers(req, res) {
  res.status(200).json({ users: await listUsers() });
}

export async function patchUserRole(req, res) {
  res.status(200).json({ user: await updateUserRole(req.params.id, req.body) });
}
```

`CRIAR backend/src/modules/users/user.routes.js`

```js
import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { getMe, getUsers, patchMe, patchUserRole } from "./user.controller.js";

export const userRouter = Router();

userRouter.get("/me", requireAuth, asyncHandler(getMe));
userRouter.patch("/me", requireAuth, asyncHandler(patchMe));
userRouter.get("/", requireRole(["admin"]), asyncHandler(getUsers));
userRouter.patch("/:id/role", requireRole(["admin"]), asyncHandler(patchUserRole));
```

`EDITAR backend/src/app.js`

```js
import { userRouter } from "./modules/users/user.routes.js";

app.use("/api/users", userRouter);
```

### Passo 5 - Criar script de promocao de admin

`CRIAR backend/scripts/promote-admin.js`

```js
import { getDb } from "../src/config/database.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Uso: npm run promote:admin -- email@example.com");
  process.exit(1);
}

const db = await getDb();
const result = await db.collection("users").updateOne(
  { email },
  { $set: { role: "admin", updatedAt: new Date() } },
);

if (result.matchedCount === 0) {
  console.error("Utilizador nao encontrado.");
  process.exit(1);
}

console.log(`Utilizador ${email} promovido para admin.`);
process.exit(0);
```

`EDITAR backend/package.json`

```json
{
  "scripts": {
    "promote:admin": "node scripts/promote-admin.js"
  }
}
```

### Passo 6 - Criar cliente frontend de utilizadores

`CRIAR frontend/src/services/api/userApi.js`

```js
import { apiClient } from "./apiClient.js";

export const userApi = {
  getMe() {
    return apiClient.get("/api/users/me");
  },
  updateMe(payload) {
    return apiClient.patch("/api/users/me", payload);
  },
  listUsers() {
    return apiClient.get("/api/users");
  },
  updateRole(userId, payload) {
    return apiClient.patch(`/api/users/${userId}/role`, payload);
  },
};
```

### Passo 7 - Criar pagina de conta

`CRIAR frontend/src/pages/AccountPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { userApi } from "../services/api/userApi.js";

export function AccountPage() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    userApi.getMe()
      .then((response) => {
        setUser(response.user);
        setName(response.user.name);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    try {
      const response = await userApi.updateMe({ name });
      setUser(response.user);
      setStatus("Perfil atualizado.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (error && !user) return <main className="page-shell"><p>{error}</p></main>;
  if (!user) return <main className="page-shell"><p>A carregar perfil...</p></main>;

  return (
    <main className="page-shell">
      <h1>A minha conta</h1>
      <form onSubmit={submit} className="account-form">
        <label>
          Nome
          <input name="name" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Email
          <input value={user.email} disabled />
        </label>
        <label>
          Role
          <input value={user.role} disabled />
        </label>
        <button type="submit">Guardar</button>
      </form>
      {status ? <p className="form-status">{status}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </main>
  );
}
```

### Passo 8 - Criar pagina admin minima

`CRIAR frontend/src/pages/AdminUsersPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { userApi } from "../services/api/userApi.js";

const ROLES = ["user", "moderator", "admin"];

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  async function loadUsers() {
    const response = await userApi.listUsers();
    setUsers(response.users);
  }

  useEffect(() => {
    loadUsers().catch((requestError) => setError(requestError.message));
  }, []);

  async function updateRole(userId, role) {
    setError("");
    try {
      await userApi.updateRole(userId, { role });
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="page-shell">
      <h1>Utilizadores</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select value={user.role} onChange={(event) => updateRole(user.id, event.target.value)}>
                  {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
```

### Passo 9 - Validar fluxo e negativos

Executar:

```bash
cd backend
npm run promote:admin -- aluno@example.com
curl -i http://localhost:3000/api/users/me
curl -i -X PATCH http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -d '{"name":"Novo Nome"}'
curl -i -X PATCH http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -d '{"name":"Novo Nome","role":"admin"}'
```

Negativos obrigatorios:

- Sem cookie, `GET /api/users/me` devolve `401`.
- Utilizador `user` em `GET /api/users` devolve `403`.
- `PATCH /api/users/me` com `role` no payload ignora role e altera apenas `name`.
- Role fora de `user`, `moderator`, `admin` devolve `400`.
- ID invalido em `PATCH /api/users/:id/role` devolve `400`.

## Snippet tecnico aplicavel

O centro deste BK e o middleware de autorizacao:

```js
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Autenticacao obrigatoria." });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: "Permissao insuficiente." });
    return next();
  };
}
```

## Criterios de aceite (mensuraveis)

- Utilizador autenticado consulta e edita o proprio `name`.
- `email`, `role` e campos internos nao sao editaveis pelo proprio utilizador.
- Apenas `admin` lista utilizadores.
- Apenas `admin` altera `role`.
- O script `promote:admin` permite criar o primeiro admin de forma rastreavel.
- A UI mostra perfil e role, mas permite editar apenas o nome.
- Pelo menos cinco negativos ficam registados.

## Validacao final

- Confirmar que `GET /api/session/me` continua funcional.
- Confirmar que `PATCH /api/users/me` nao altera `role`.
- Confirmar que um `moderator` nao consegue alterar roles.
- Confirmar que a resposta publica nao contem `passwordHash`.
- Confirmar que `BK-MF2-03` pode usar `requireRole(["admin", "moderator"])`.

## Evidence para PR/defesa

- Log de `PATCH /api/users/me` com sucesso.
- Log de tentativa de alterar `role` pelo proprio utilizador.
- Log de `403` para utilizador sem role admin.
- Captura da pagina de conta.
- Captura do painel admin ou resposta `GET /api/users`.

## Handoff

Para `BK-MF2-03`, entregar:

- Middleware `requireAuth`.
- Middleware `requireRole`.
- Roles canonicas `user`, `moderator`, `admin`.
- Endpoint admin funcional.
- Garantia de que perfil e autorizacao nao ficam misturados.

## Proximo BK recomendado

`BK-MF2-03 - CRUD de catalogo e taxonomias`

## Changelog

- `2026-05-31`: Guia reescrito com perfil, roles, middlewares, endpoints, UI, script de admin, negativos e handoff para catalogo.
