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

Neste BK vais implementar a edicao do proprio perfil (`RF03`) e os papeis base da FaithFlix (`RF04`).

No fim, deves conseguir explicar a diferenca entre autenticar um utilizador, autorizar uma acao e impedir que um utilizador comum altere campos sensiveis como `role`.

### Importancia funcional

Perfil e roles sao a primeira camada de autorizacao da aplicacao. O catalogo admin, a gestao de conteudos, o playback autenticado, favoritos, historico e privacidade dependem de `req.user` confiavel e de verificacoes feitas no backend.

### Scope-in

- Criar `requireAuth` e `requireRole`.
- Permitir leitura e edicao do proprio nome.
- Bloquear alteracao direta de `email`, `role`, `createdAt` e campos internos.
- Listar utilizadores apenas para `admin`.
- Permitir alteracao de role apenas por `admin`.
- Criar script local para promover o primeiro admin.
- Criar paginas de conta e gestao simples de utilizadores.

### Scope-out

- Convites para administradores.
- Auditoria avancada de alteracoes.
- Gestao de billing.
- Upload de avatar.
- Eliminacao de conta.

### Glossario rapido

- `Autenticacao`: confirmar quem esta a fazer o pedido.
- `Autorizacao`: confirmar se esse utilizador pode executar a acao.
- `Role`: papel de permissao guardado no servidor.
- `requireAuth`: middleware que exige login.
- `requireRole`: middleware que exige uma role permitida.

### Conceitos essenciais

- `req.user` foi entregue no `BK-MF2-01` e e a fonte usada para ownership e roles.
- O frontend pode esconder botoes, mas a seguranca real fica no backend.
- `PATCH /api/users/me` aceita apenas dados de perfil editaveis.
- A role inicial de novos utilizadores e `user`.
- O primeiro admin e criado por script local controlado para desbloquear a area admin.

### Tempo estimado

- Rever autenticacao do BK anterior: 15 min.
- Middlewares de autenticacao e roles: 30 min.
- Backend de utilizadores: 70 min.
- Script admin: 25 min.
- Frontend de conta e admin: 60 min.
- Validacao e evidence: 30 min.

### Erros comuns

- Aceitar `role` no endpoint de perfil proprio.
- Proteger apenas componentes React e deixar a API aberta.
- Usar roles fora da lista `user`, `moderator`, `admin`.
- Devolver `passwordHash` na listagem.
- Testar endpoints protegidos sem cookie de sessao.

### Check de compreensao

- [ ] Sei explicar a diferenca entre `requireAuth` e `requireRole`.
- [ ] Sei porque `role` nao pertence ao formulario de perfil.
- [ ] Sei testar `401`, `403` e sucesso autenticado.
- [ ] Sei promover um admin sem expor esse poder no frontend publico.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-01` concluido.
- `GET /api/session/me` devolve `user.id`, `user.name`, `user.email` e `user.role`.
- `req.user` fica preenchido pelo middleware de sessao.
- `apiClient` da `MF1` usa `credentials: "include"`.
- MongoDB acessivel.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Roles validas | `user`, `moderator`, `admin` |
| Perfil proprio | `GET /api/users/me`, `PATCH /api/users/me` |
| Admin users | `GET /api/users`, `PATCH /api/users/:id/role` |
| Campos editaveis pelo proprio utilizador | `name` |
| Campos bloqueados ao proprio utilizador | `email`, `role`, `createdAt`, `passwordHash` |
| Frontend | `AccountPage`, `AdminUsersPage`, rota `/conta`, rota `/admin/utilizadores` |

### Decisoes tecnicas

- `CANONICO`: a identidade autenticada vem de `req.user`.
- `CANONICO`: a role e validada no backend.
- `DERIVADO`: `moderator` fica reservado para gestao de catalogo no `BK-MF2-03`.
- `DERIVADO`: o primeiro admin e promovido por script local com email explicito.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar middlewares de autenticacao e role

1. Objetivo do passo.

Centralizar as verificacoes de login e permissao para que os BKs seguintes usem sempre o mesmo contrato.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/auth/auth.middleware.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o ficheiro abaixo. Ele assume que `BK-MF2-01` ja preenche `req.user`.

4. Codigo completo.

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

5. Explicacao do codigo ou da decisao.

`requireAuth` protege qualquer rota que precise de login. `requireRole` recebe uma lista fechada para evitar duplicar regras de permissao em cada controller.

6. Validacao do passo.

Importa temporariamente o ficheiro num terminal Node:

```bash
node -e "import('./src/modules/auth/auth.middleware.js').then((m) => console.log(typeof m.requireAuth, typeof m.requireRole))"
```

Resultado esperado: `function function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se cada rota verificar roles manualmente, e facil esquecer uma rota admin aberta.

### Passo 2 - Criar validacao e servico de utilizadores

1. Objetivo do passo.

Validar dados de perfil e encapsular o acesso a `users` sem expor campos internos.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/users/user.validation.js`
    - CRIAR: `backend/src/modules/users/user.service.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Cria a validacao primeiro e depois o servico. Mantem `toPublicUser` como unica forma de devolver utilizadores ao frontend.

4. Codigo completo.

`backend/src/modules/users/user.validation.js`

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

`backend/src/modules/users/user.service.js`

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

function asUserObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    const error = new Error("Utilizador invalido.");
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(userId);
}

export async function getMyProfile(userId) {
  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: asUserObjectId(userId) });

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
  const now = new Date();

  const user = await db.collection("users").findOneAndUpdate(
    { _id: asUserObjectId(userId) },
    { $set: { ...update, updatedAt: now } },
    { returnDocument: "after" },
  );

  if (!user) {
    const error = new Error("Utilizador nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}

export async function listUsers() {
  const db = await getDb();
  const users = await db
    .collection("users")
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return users.map(toPublicUser);
}

export async function updateUserRole(targetUserId, input) {
  const update = assertRoleUpdate(input);
  const db = await getDb();
  const now = new Date();

  const user = await db.collection("users").findOneAndUpdate(
    { _id: asUserObjectId(targetUserId) },
    { $set: { ...update, updatedAt: now } },
    { returnDocument: "after" },
  );

  if (!user) {
    const error = new Error("Utilizador nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}
```

5. Explicacao do codigo ou da decisao.

O servico nunca devolve `passwordHash`. O endpoint de perfil proprio chama `assertProfileUpdate`, por isso campos enviados a mais pelo browser sao ignorados.

6. Validacao do passo.

Executa:

```bash
node -e "import('./src/modules/users/user.validation.js').then(({ assertProfileUpdate }) => console.log(assertProfileUpdate({ name: 'Nuno' }).name))"
```

Resultado esperado: `Nuno`.

7. Caso negativo, erro comum ou risco que este passo evita.

Uma tentativa de enviar `{ "name": "Nuno", "role": "admin" }` para o perfil proprio nao altera role, porque o servico so aproveita `name`.

### Passo 3 - Criar controller e rotas de utilizadores

1. Objetivo do passo.

Expor os endpoints de perfil e admin com os middlewares corretos.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/users/user.controller.js`
    - CRIAR: `backend/src/modules/users/user.routes.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Cria o controller e a rota. As rotas admin devem ficar depois de `requireRole(["admin"])`.

4. Codigo completo.

`backend/src/modules/users/user.controller.js`

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

`backend/src/modules/users/user.routes.js`

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

5. Explicacao do codigo ou da decisao.

As rotas `/me` ficam antes de `/:id/role`, evitando conflito com parametros dinamicos. O backend decide quem pode listar e mudar roles.

6. Validacao do passo.

Sem login:

```bash
curl -i http://localhost:3000/api/users/me
```

Resultado esperado: `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se a rota `/:id/role` vier antes de `/me`, o Express pode interpretar `me` como parametro e a API fica incoerente.

### Passo 4 - Montar rotas e criar script para primeiro admin

1. Objetivo do passo.

Ligar o modulo de users ao backend e permitir promover um admin inicial de forma explicita.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/package.json`
    - CRIAR: `backend/scripts/promote-admin.js`
    - LOCALIZACAO: ficheiro completo para o script; linhas de montagem para `app.js`

3. Instrucoes concretas.

Monta `userRouter` depois do middleware de sessao. Depois adiciona o script `promote:admin`.

4. Codigo completo.

Trecho esperado em `backend/src/app.js`:

```js
import { userRouter } from "./modules/users/user.routes.js";

app.use(attachSession);
app.use("/api/users", userRouter);
```

Trecho esperado em `backend/package.json`:

```json
{
  "scripts": {
    "promote:admin": "node scripts/promote-admin.js"
  }
}
```

`backend/scripts/promote-admin.js`

```js
import { getDb } from "../src/config/database.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Uso: npm run promote:admin -- email@exemplo.test");
  process.exit(1);
}

const db = await getDb();
const result = await db.collection("users").findOneAndUpdate(
  { email },
  { $set: { role: "admin", updatedAt: new Date() } },
  { returnDocument: "after" },
);

if (!result) {
  console.error("Utilizador nao encontrado.");
  process.exit(1);
}

console.log(`Admin promovido: ${result.email}`);
process.exit(0);
```

5. Explicacao do codigo ou da decisao.

O script exige email na linha de comandos para evitar promocao acidental. A rota fica montada depois de `attachSession`, porque os middlewares precisam de `req.user`.

6. Validacao do passo.

Depois de criar um utilizador:

```bash
npm run promote:admin -- admin@faithflix.test
```

Resultado esperado: `Admin promovido: admin@faithflix.test`.

7. Caso negativo, erro comum ou risco que este passo evita.

Criar um endpoint publico para promover admins seria uma falha critica de seguranca.

### Passo 5 - Criar cliente frontend de users

1. Objetivo do passo.

Dar ao frontend funcoes pequenas e alinhadas com os endpoints deste BK.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/userApi.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Usa o `apiClient` criado na `MF1`. Nao uses `fetch` direto nos componentes.

4. Codigo completo.

```js
import { apiClient } from "./apiClient.js";

export const userApi = {
  getMe() {
    return apiClient.get("/api/users/me");
  },
  updateMe(input) {
    return apiClient.patch("/api/users/me", input);
  },
  listUsers() {
    return apiClient.get("/api/users");
  },
  updateRole(userId, role) {
    return apiClient.patch(`/api/users/${encodeURIComponent(userId)}/role`, { role });
  },
};
```

5. Explicacao do codigo ou da decisao.

O cliente mantem a mesma convencao de `apiClient.get` e `apiClient.patch`, preservando cookies de sessao.

6. Validacao do passo.

Importa o ficheiro:

```bash
node -e "import('./src/services/api/userApi.js').then(({ userApi }) => console.log(Object.keys(userApi).length))"
```

Resultado esperado: `4`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o componente usar `fetch` sem `credentials`, a sessao nao acompanha o pedido e endpoints protegidos devolvem `401`.

### Passo 6 - Criar paginas de conta e admin

1. Objetivo do passo.

Entregar uma UI minima para o utilizador editar o nome e para o admin gerir roles.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/pages/AccountPage.jsx`
    - CRIAR: `frontend/src/pages/AdminUsersPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: ficheiros completos para as paginas; trecho de rotas

3. Instrucoes concretas.

Cria as duas paginas. Liga `/conta` e `/admin/utilizadores` no router.

4. Codigo completo.

`frontend/src/pages/AccountPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { userApi } from "../services/api/userApi.js";

export function AccountPage() {
  const [name, setName] = useState("");
  const [user, setUser] = useState(null);
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

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");

    try {
      const response = await userApi.updateMe({ name });
      setUser(response.user);
      setStatus("Perfil atualizado.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="page-shell">
      <h1>A minha conta</h1>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="profile-name">Nome</label>
        <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
        <button type="submit">Guardar</button>
      </form>
      {user && (
        <dl>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Role</dt>
          <dd>{user.role}</dd>
        </dl>
      )}
    </main>
  );
}
```

`frontend/src/pages/AdminUsersPage.jsx`

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

  async function handleRoleChange(userId, role) {
    setError("");
    try {
      const response = await userApi.updateRole(userId, role);
      setUsers((current) => current.map((user) => (user.id === userId ? response.user : user)));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="page-shell">
      <h1>Utilizadores</h1>
      {error && <p role="alert">{error}</p>}
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
                <select value={user.role} onChange={(event) => handleRoleChange(user.id, event.target.value)}>
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

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
import { AccountPage } from "../pages/AccountPage.jsx";
import { AdminUsersPage } from "../pages/AdminUsersPage.jsx";

<Route path="/conta" element={<AccountPage />} />
<Route path="/admin/utilizadores" element={<AdminUsersPage />} />
```

5. Explicacao do codigo ou da decisao.

A pagina de conta nunca mostra um input para role. A pagina admin existe separada para deixar claro que gestao de permissao nao faz parte do perfil pessoal.

6. Validacao do passo.

Com sessao iniciada, abre `/conta`, altera o nome e recarrega. O nome deve continuar atualizado.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o mesmo formulario editar nome e role, uma falha de validacao pode transformar um utilizador comum em admin.

### Passo 7 - Validar fluxo completo

1. Objetivo do passo.

Confirmar que perfil e roles funcionam com cookie de sessao real.

2. Ficheiros envolvidos.
    - EXECUTAR: backend e frontend
    - VALIDAR: API e UI

3. Instrucoes concretas.

Regista um utilizador, guarda o cookie num ficheiro temporario, promove esse email a admin e testa endpoints autenticados.

4. Codigo completo.

```bash
curl -i -c /tmp/faithflix.cookies \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin Teste","email":"admin@faithflix.test","password":"password-segura-123"}' \
  http://localhost:3000/api/auth/register

npm run promote:admin -- admin@faithflix.test

curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/users/me

curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/users

curl -i -b /tmp/faithflix.cookies \
  -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin Atualizado","role":"user"}' \
  http://localhost:3000/api/users/me
```

5. Explicacao do codigo ou da decisao.

O ficheiro de cookies simula o browser. O ultimo pedido tenta enviar `role`, mas o endpoint de perfil proprio deve atualizar apenas `name`.

6. Validacao do passo.

Resultados esperados:

- `/api/users/me` devolve `200` e o utilizador autenticado.
- `/api/users` devolve `200` apenas depois de promover admin.
- O `PATCH /api/users/me` nao muda a role.

7. Caso negativo, erro comum ou risco que este passo evita.

Se `/api/users` devolver `200` sem admin, a autorizacao esta aberta e deve ser corrigida antes de avancar para o catalogo.

## Snippet tecnico aplicavel

```js
userRouter.get("/me", requireAuth, asyncHandler(getMe));
userRouter.get("/", requireRole(["admin"]), asyncHandler(getUsers));
```

## Criterios de aceite (mensuraveis)

- [ ] `GET /api/users/me` exige login.
- [ ] `PATCH /api/users/me` altera apenas `name`.
- [ ] `GET /api/users` exige role `admin`.
- [ ] `PATCH /api/users/:id/role` aceita apenas `user`, `moderator` ou `admin`.
- [ ] O frontend tem `/conta` e `/admin/utilizadores`.
- [ ] Nenhuma resposta expoe `passwordHash`.

## Validacao final

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Se o projeto ainda nao tiver testes automaticos para este modulo, regista evidence manual com os comandos `curl`, screenshots de `/conta` e `/admin/utilizadores`, e resultados esperados.

## Evidence para PR/defesa

- Output de `npm --prefix backend test`.
- Output de `npm --prefix frontend run build`.
- Respostas `curl` de `GET /api/users/me`, `GET /api/users` e `PATCH /api/users/:id/role`.
- Screenshot de `/conta` com o nome atualizado.
- Screenshot de `/admin/utilizadores` visivel apenas para admin.
- Nota curta a confirmar que nenhuma resposta expoe `passwordHash`.

## Handoff

O `BK-MF2-03` pode usar `requireRole(["admin", "moderator"])` para proteger criacao, edicao, publicacao e arquivo de conteudos. Utilizadores com role `user` ficam apenas com leitura publica do catalogo publicado.

## Proximo BK recomendado

`BK-MF2-03` - CRUD de catalogo e taxonomias.

## Changelog

- 2026-05-31: Alinhados criterios, evidence, handoff e changelog com o contrato do guia.
