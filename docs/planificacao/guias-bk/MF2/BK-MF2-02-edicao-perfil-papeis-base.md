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
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar a edicao do proprio perfil (`RF03`) e os papeis base da FaithFlix (`RF04`).

No fim, deves conseguir explicar a diferenca entre autenticar um utilizador, autorizar uma acao e impedir que um utilizador comum altere campos sensiveis como `role`.

#### Importância

Perfil e roles sao a primeira camada de autorizacao da aplicacao. O catalogo admin, a gestao de conteudos, o playback autenticado, favoritos, historico e privacidade dependem de `req.user` confiavel e de verificacoes feitas no backend.

#### Scope-in

- Reutilizar o `requireAuth` canónico da MF1 e acrescentar `requireRole` no
  mesmo `backend/src/middlewares/auth.middleware.js`.
- Permitir leitura e edicao do proprio nome.
- Bloquear alteracao direta de `email`, `role`, `createdAt` e campos internos.
- Listar utilizadores apenas para `admin`.
- Permitir alteracao de role apenas por `admin`.
- Criar script local para promover o primeiro admin.
- Criar paginas de conta e gestao simples de utilizadores.

#### Scope-out

- Convites para administradores.
- Auditoria avancada de alteracoes.
- Gestao de billing.
- Upload de avatar.
- Eliminacao de conta.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF2-01` concluido.
- `GET /api/session/me` devolve `user.id`, `user.name`, `user.email` e `user.role`.
- `req.user` fica preenchido pelo middleware de sessao.
- `apiClient` da `MF1` usa `credentials: "include"`.
- MongoDB acessivel.

#### Glossário

- `Autenticacao`: confirmar quem esta a fazer o pedido.
- `Autorizacao`: confirmar se esse utilizador pode executar a acao.
- `Role`: papel de permissao guardado no servidor.
- `requireAuth`: middleware que exige login.
- `requireRole`: middleware que exige uma role permitida.

#### Conceitos teóricos essenciais

- `req.user` foi entregue no `BK-MF2-01` e e a fonte usada para ownership e roles.
- O frontend pode esconder botoes, mas a seguranca real fica no backend.
- `PATCH /api/users/me` aceita apenas dados de perfil editaveis.
- `PATCH /api/users/me/parental` aceita apenas um número JSON inteiro entre `0` e `18`; strings, vazio, decimais e arrays são recusados.
- A role inicial de novos utilizadores e `user`.
- O primeiro admin e criado por script local controlado para desbloquear a area admin.
- As leituras e mutações do frontend propagam `AbortSignal`; uma resposta de uma página anterior nunca atualiza a página atual.
- Perfil e controlo parental partilham um bloqueio de mutação. O estado confirmado vem sempre do `user` devolvido pela API.
- Uma alteração otimista de role no admin tem busy state por linha e reverte se a API falhar.

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
- Converter body inválido com `String(...)`, `Number(...)` ou truncagem antes de validar o tipo JSON real.
- Devolver `passwordHash` na listagem.
- Testar endpoints protegidos sem cookie de sessao.

### Check de compreensao

- [ ] Sei explicar a diferenca entre `requireAuth` e `requireRole`.
- [ ] Sei porque `role` nao pertence ao formulario de perfil.
- [ ] Sei testar `401`, `403` e sucesso autenticado.
- [ ] Sei promover um admin sem expor esse poder no frontend publico.

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Roles validas | `user`, `moderator`, `admin` |
| Perfil proprio | `GET /api/users/me`, `PATCH /api/users/me` |
| Controlo parental | `PATCH /api/users/me/parental`; inteiro `0..18`, vazio inválido |
| Admin users | `GET /api/users?page=1&limit=20&search=...`, envelope `{ users, page, limit, total, totalPages }`, `limit <= 50`; `PATCH /api/users/:id/role` |
| Campos editaveis pelo proprio utilizador | `name` |
| Campos bloqueados ao proprio utilizador | `email`, `role`, `createdAt`, `passwordHash` |
| Frontend | `AccountPage`, `AdminUsersPage`, rota `/conta`, rota `/admin/utilizadores` |
| Robustez da conta | leitura/mutações canceláveis, retry da leitura e uma única mutação em curso |

### Decisoes tecnicas

- `CANONICO`: a identidade autenticada vem de `req.user`.
- `CANONICO`: a role e validada no backend.
- `DERIVADO`: `moderator` fica reservado para gestao de catalogo no `BK-MF2-03`.
- `DERIVADO`: o primeiro admin e promovido por script local com email explicito.
- `CANONICO`: pedidos cancelados não geram erro visual e respostas stale não alteram estado.
- `CANONICO`: perfil e controlo parental nunca são gravados em paralelo.

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/middlewares/auth.middleware.js` (ficheiro canónico da MF1)
- CRIAR: `backend/src/modules/users/user.validation.js`
- CRIAR: `backend/src/modules/users/user.service.js`
- CRIAR: `backend/src/modules/users/user.controller.js`
- CRIAR: `backend/src/modules/users/user.routes.js`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/package.json`
- CRIAR: `backend/scripts/promote-admin.js`
- CRIAR: `frontend/src/services/api/userApi.js`
- CRIAR: `frontend/src/pages/AccountPage.jsx`
- CRIAR: `frontend/src/pages/AdminUsersPage.jsx`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`

#### Tutorial técnico linear

### Passo 1 - Reutilizar o middleware canónico e acrescentar role

1. Objetivo do passo.

Conservar a verificação de login entregue pela MF1 e acrescentar autorização
por role no mesmo módulo canónico, sem criar um segundo `auth.middleware.js`.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/middlewares/auth.middleware.js`
    - REVER: `backend/src/middlewares/error.middleware.js`
    - LOCALIZACAO: substituir o ficheiro canónico cumulativo pela versão abaixo

3. Instrucoes concretas.

O `BK-MF1-04` já criou este ficheiro e o middleware de sessão já preenche
`req.session`/`req.user`. Mantém `requireAuth`, acrescenta `requireRole` e
encaminha sempre `401`/`403` para o error handler comum. Não cries
outro middleware dentro de `modules/auth/`.

4. Codigo completo.

```js
import { HttpError } from "../utils/http-error.js";

function authorizationError(statusCode, code, message) {
  // O código estável é consumido pelo error handler e pelo cliente API.
  const error = new HttpError(statusCode, message);
  error.code = code;
  return error;
}

export function requireAuth(req, _res, next) {
  if (!req.session?.isAuthenticated || !req.user) {
    return next(
      authorizationError(
        401,
        "AUTH_REQUIRED",
        "Autenticacao necessaria.",
      ),
    );
  }

  return next();
}

export function requireRole(allowedRoles) {
  return (req, _res, next) => {
    // A autenticação precede sempre a decisão de role para não revelar permissões.
    if (!req.session?.isAuthenticated || !req.user) {
      return next(
        authorizationError(
          401,
          "AUTH_REQUIRED",
          "Autenticacao necessaria.",
        ),
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        authorizationError(
          403,
          "FORBIDDEN",
          "Permissao insuficiente.",
        ),
      );
    }

    return next();
  };
}
```

5. Explicacao do codigo ou da decisao.

`requireAuth` protege qualquer rota que precise de login. `requireRole` recebe
uma lista fechada para evitar duplicar regras de permissao. Nenhum dos dois
escreve uma resposta parcial: `next(error)` deixa o error handler da MF1 criar
o envelope uniforme `{ code, message, requestId }` e o respetivo log.

6. Validacao do passo.

Importa temporariamente o ficheiro num terminal Node:

```bash
node -e "import('./src/middlewares/auth.middleware.js').then((m) => console.log(typeof m.requireAuth, typeof m.requireRole))"
```

Resultado esperado: `function function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se cada rota verificar roles manualmente, e facil esquecer uma rota admin
aberta. Se um guard fizer `res.status(...).json(...)`, a resposta perde o
`requestId` e deixa de respeitar o envelope canónico.

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
import { HttpError } from "../../utils/http-error.js";

export const VALID_ROLES = ["user", "moderator", "admin"];

// Rejeitar arrays e `null` impede coerções inesperadas antes de validar campos concretos.
function assertBodyObject(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpError(400, "Body JSON invalido.");
  }
}

export function assertProfileUpdate(input) {
  assertBodyObject(input);

  if (typeof input.name !== "string") {
    throw new HttpError(400, "O nome tem de ser texto.");
  }

  const name = input.name.trim();

  if (name.length < 2 || name.length > 80) {
    throw new HttpError(400, "O nome deve ter entre 2 e 80 caracteres.");
  }

  return { name };
}

export function assertRoleUpdate(input) {
  assertBodyObject(input);

  if (typeof input.role !== "string" || !VALID_ROLES.includes(input.role)) {
    throw new HttpError(400, "Role invalida.");
  }

  return { role: input.role };
}

export function assertParentalUpdate(input) {
  assertBodyObject(input);

  // O limite parental aceita apenas inteiros reais; uma string vazia não pode converter-se em zero.
  if (
    typeof input.parentalMaxAgeRating !== "number" ||
    !Number.isInteger(input.parentalMaxAgeRating) ||
    input.parentalMaxAgeRating < 0 ||
    input.parentalMaxAgeRating > 18
  ) {
    throw new HttpError(
      400,
      "O limite parental deve ser um inteiro entre 0 e 18.",
    );
  }

  return { parentalMaxAgeRating: input.parentalMaxAgeRating };
}

function positiveQueryInteger(value, fallback, label) {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, `${label} invalido.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new HttpError(400, `${label} invalido.`);
  }
  return parsed;
}

export function parseUserListQuery(query = {}) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    throw new HttpError(400, "Query invalida.");
  }

  const page = positiveQueryInteger(query.page, 1, "Pagina");
  const limit = positiveQueryInteger(query.limit, 20, "Limite");
  if (limit > 50 || !Number.isSafeInteger((page - 1) * limit)) {
    throw new HttpError(400, "Paginacao invalida.");
  }
  if (query.search !== undefined && typeof query.search !== "string") {
    throw new HttpError(400, "Pesquisa invalida.");
  }
  const search = query.search?.trim() ?? "";
  if (search.length > 80) {
    throw new HttpError(400, "Pesquisa demasiado longa.");
  }

  return { page, limit, search };
}
```

`backend/src/modules/users/user.service.js`

```js
import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import {
  assertParentalUpdate,
  assertProfileUpdate,
  assertRoleUpdate,
  parseUserListQuery,
} from "./user.validation.js";

function toPublicUser(user) {
  // A allowlist evita expor `passwordHash` ou campos internos adicionados futuramente ao documento.
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    parentalMaxAgeRating: Number.isInteger(user.parentalMaxAgeRating)
      ? user.parentalMaxAgeRating
      : 18,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function asUserObjectId(userId) {
  if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
    throw new HttpError(400, "Utilizador invalido.");
  }

  return new ObjectId(userId);
}

function isActiveAdmin(user) {
  const accountStatusAllowsLogin = user.accountStatus === undefined ||
    user.accountStatus === "active";
  const legacyStatusAllowsLogin = user.status === undefined ||
    user.status === "active";

  return user.role === "admin" &&
    accountStatusAllowsLogin &&
    legacyStatusAllowsLogin;
}

export async function getMyProfile(userId) {
  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: asUserObjectId(userId) });

  if (!user) {
    throw new HttpError(404, "Utilizador nao encontrado.");
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
    throw new HttpError(404, "Utilizador nao encontrado.");
  }

  return toPublicUser(user);
}

export async function updateMyParentalLimit(userId, input) {
  const update = assertParentalUpdate(input);
  const db = await getDb();

  const user = await db.collection("users").findOneAndUpdate(
    { _id: asUserObjectId(userId) },
    { $set: { ...update, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!user) {
    throw new HttpError(404, "Utilizador nao encontrado.");
  }

  return toPublicUser(user);
}

export async function listUsers(query = {}) {
  const db = await getDb();
  const { page, limit, search } = parseUserListQuery(query);
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Escapar metacaracteres transforma a pesquisa numa correspondência literal e limita abuso de regex.
  const filter = search
    ? { $or: [
      { name: { $regex: escapedSearch, $options: "i" } },
      { email: { $regex: escapedSearch, $options: "i" } },
    ] }
    : {};
  const [users, total] = await Promise.all([
    db.collection("users")
      .find(filter, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    db.collection("users").countDocuments(filter),
  ]);

  return {
    users: users.map(toPublicUser),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateUserRole(
  actorUserId,
  targetUserId,
  input,
  context = {},
) {
  const update = assertRoleUpdate(input);
  const actorObjectId = asUserObjectId(actorUserId);
  const targetObjectId = asUserObjectId(targetUserId);

  if (
    String(actorObjectId) === String(targetObjectId) &&
    update.role !== "admin"
  ) {
    throw new HttpError(400, "Nao podes retirar o teu proprio acesso admin.");
  }

  return runInTransaction(async ({ db, session }) => {
    const users = db.collection("users");
    const before = await users.findOne(
      { _id: targetObjectId, accountStatus: { $ne: "deleted" } },
      { session },
    );

    if (!before) {
      throw new HttpError(404, "Utilizador nao encontrado.");
    }

    if (isActiveAdmin(before) && update.role !== "admin") {
      const now = new Date();

      // Serializa duas despromocoes concorrentes antes de recontar admins ativos.
      await db.collection("admin_invariants").updateOne(
        { _id: "active-admin-roster" },
        {
          $inc: { revision: 1 },
          $set: { updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true, session },
      );

      const activeAdminCount = await users.countDocuments(
        {
          role: "admin",
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
        },
        { session },
      );

      if (activeAdminCount <= 1) {
        throw new HttpError(
          409,
          "A operacao removeria o ultimo administrador ativo.",
          undefined,
          "LAST_ACTIVE_ADMIN",
        );
      }
    }

    const user = await users.findOneAndUpdate(
      { _id: targetObjectId, accountStatus: { $ne: "deleted" } },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: "after", session },
    );

    if (!user) {
      throw new HttpError(409, "O utilizador foi alterado em concorrencia.");
    }

    await writeAdminAudit({
      db,
      session,
      actorUserId: actorObjectId,
      action: "user.admin_update",
      targetType: "user",
      targetId: targetObjectId,
      before: {
        role: before.role,
        accountStatus: before.accountStatus ?? "active",
        status: before.status ?? "active",
      },
      after: {
        role: user.role,
        accountStatus: user.accountStatus ?? "active",
      },
      requestId: context.requestId,
      metadata: { changedFields: ["role"] },
    });

    return toPublicUser(user);
  });
}
```

5. Explicacao do codigo ou da decisao.

O serviço nunca devolve `passwordHash`. Cada fronteira confirma primeiro o tipo JSON real; só depois valida o valor. Assim, `"12"`, `null`, arrays e decimais não são convertidos silenciosamente num limite parental válido. A alteração privilegiada de role recebe o ator autenticado, impede self-demotion, serializa a recontagem do último admin e grava a mutação e o audit sanitizado na mesma transação.

6. Validacao do passo.

Executa:

```bash
node -e "import('./src/modules/users/user.validation.js').then(({ assertProfileUpdate }) => console.log(assertProfileUpdate({ name: 'Nuno' }).name))"
```

Resultado esperado: `Nuno`.

7. Caso negativo, erro comum ou risco que este passo evita.

Uma tentativa de enviar `{ "name": "Nuno", "role": "admin" }` para o perfil próprio não altera role. `{ "parentalMaxAgeRating": "12" }` devolve `400` em vez de fazer coerção.

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
import {
  getMyProfile,
  listUsers,
  updateMyParentalLimit,
  updateMyProfile,
  updateUserRole,
} from "./user.service.js";

// O controller mantém-se fino: validação e acesso a dados permanecem no serviço reutilizável.
export async function getMe(req, res) {
  res.status(200).json({ user: await getMyProfile(req.user.id) });
}

export async function patchMe(req, res) {
  res.status(200).json({ user: await updateMyProfile(req.user.id, req.body) });
}

export async function patchMyParentalLimit(req, res) {
  res.status(200).json({
    user: await updateMyParentalLimit(req.user.id, req.body),
  });
}

export async function getUsers(req, res) {
  // A listagem devolve o envelope completo para o frontend respeitar `total` e `totalPages`.
  res.status(200).json(await listUsers(req.query));
}

export async function patchUserRole(req, res) {
  res.status(200).json({
    user: await updateUserRole(req.user.id, req.params.id, req.body, {
      requestId: req.id,
    }),
  });
}
```

`backend/src/modules/users/user.routes.js`

```js
import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getMe,
  getUsers,
  patchMe,
  patchMyParentalLimit,
  patchUserRole,
} from "./user.controller.js";

export const userRouter = Router();

// As rotas literais `/me` devem anteceder qualquer segmento dinâmico para não serem capturadas como ID.
userRouter.get("/me", requireAuth, asyncHandler(getMe));
userRouter.patch("/me", requireAuth, asyncHandler(patchMe));
userRouter.patch(
  "/me/parental",
  requireAuth,
  asyncHandler(patchMyParentalLimit),
);
userRouter.get("/", requireRole(["admin"]), asyncHandler(getUsers));
// A autorização por role é aplicada antes de o controller poder alterar outro utilizador.
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

Adiciona apenas `userRouter` depois da cadeia canónica de sessão e CSRF. Não
voltes a montar `attachSession`: a app cumulativa já contém, por esta ordem,
`asyncHandler(attachSession)` e `asyncHandler(csrfProtection)`. Depois adiciona
o script `promote:admin`.

4. Codigo completo.

Trecho esperado em `backend/src/app.js`:

```js
import { userRouter } from "./modules/users/user.routes.js";

// Preserva acima, sem duplicar:
// app.use(asyncHandler(attachSession));
// app.use(asyncHandler(csrfProtection));
// Esta é a única linha nova de middleware deste BK.
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

// Exigir o email explicitamente evita promover por engano um utilizador implícito ou pré-definido.
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

O script exige email na linha de comandos para evitar promocao acidental. A
rota fica montada depois da cadeia existente de sessão/CSRF, porque os guards
precisam de `req.user` e as mutações autenticadas precisam da proteção CSRF. O
snippet não volta a executar `attachSession` nem cria uma segunda política de
sessão.

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

// Validar antes de construir a query mantém os limites do frontend alinhados com o backend.
function userListQuery(params = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const search = params.search ?? "";
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 50 ||
    typeof search !== "string" ||
    search.length > 80
  ) {
    throw new TypeError("Parametros de utilizadores invalidos.");
  }

  return new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
    ...(search ? { search } : {}),
  }).toString();
}

export const userApi = {
  getMe(options = {}) {
    return apiClient.get("/api/users/me", options);
  },
  updateMe(input, options = {}) {
    return apiClient.patch("/api/users/me", input, options);
  },
  updateParental(parentalMaxAgeRating, options = {}) {
    return apiClient.patch(
      "/api/users/me/parental",
      { parentalMaxAgeRating },
      options,
    );
  },
  listUsers(params = {}, options = {}) {
    return apiClient.get(`/api/users?${userListQuery(params)}`, options);
  },
  updateRole(userId, role, options = {}) {
    // Codificar o identificador impede que caracteres reservados alterem o path do endpoint.
    return apiClient.patch(
      `/api/users/${encodeURIComponent(userId)}/role`,
      { role },
      options,
    );
  },
};
```

5. Explicacao do codigo ou da decisao.

O cliente mantém a mesma convenção de `apiClient.get` e `apiClient.patch`, preserva cookies/CSRF e propaga as opções com `signal` sem criar `fetch` paralelos.

6. Validacao do passo.

Importa o ficheiro:

```bash
node -e "import('./src/services/api/userApi.js').then(({ userApi }) => console.log(Object.keys(userApi).length))"
```

Resultado esperado: `5`.

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
import { useEffect, useRef, useState } from "react";
import { toUserMessage } from "../services/api/apiErrors.js";
import { userApi } from "../services/api/userApi.js";

const ROLE_LABELS = Object.freeze({
  user: "Utilizador",
  moderator: "Moderador",
  admin: "Administrador",
});

function parseParentalInput(value) {
  // O input vazio é inválido por contrato e nunca é convertido implicitamente em zero.
  if (typeof value !== "string" || !/^(?:[0-9]|1[0-8])$/.test(value)) {
    return null;
  }

  return Number(value);
}

export function AccountPage() {
  const [name, setName] = useState("");
  const [parentalInput, setParentalInput] = useState("");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);
  const mutationRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    // Cancelar no cleanup impede uma resposta antiga de repor dados depois de nova tentativa ou unmount.
    setLoading(true);
    setUser(null);
    setName("");
    setParentalInput("");
    setError("");

    userApi.getMe({ signal: controller.signal })
      .then((response) => {
        if (!active) return;
        setUser(response.user);
        setName(response.user.name);
        setParentalInput(`${response.user.parentalMaxAgeRating}`);
      })
      .catch((requestError) => {
        if (active && requestError?.code !== "REQUEST_ABORTED") {
          setError(toUserMessage(requestError));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadVersion]);

  useEffect(() => () => mutationRef.current?.abort(), []);

  function applyConfirmedUser(confirmedUser) {
    setUser(confirmedUser);
    setName(confirmedUser.name);
    setParentalInput(`${confirmedUser.parentalMaxAgeRating}`);
  }

  async function runMutation(request, successMessage) {
    if (mutationRef.current) return;

    const controller = new AbortController();
    mutationRef.current = controller;
    setMutating(true);
    setStatus("");
    setError("");

    try {
      const response = await request(controller.signal);
      if (!controller.signal.aborted) {
        applyConfirmedUser(response.user);
        setStatus(successMessage);
      }
    } catch (requestError) {
      if (requestError?.code !== "REQUEST_ABORTED") {
        setError(toUserMessage(requestError));
      }
    } finally {
      if (mutationRef.current === controller) {
        mutationRef.current = null;
        if (!controller.signal.aborted) setMutating(false);
      }
    }
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    void runMutation(
      (signal) => userApi.updateMe({ name }, { signal }),
      "Perfil atualizado.",
    );
  }

  function handleParentalSubmit(event) {
    event.preventDefault();
    const parentalMaxAgeRating = parseParentalInput(parentalInput);

    if (parentalMaxAgeRating === null) {
      setError("Escolhe um limite parental inteiro entre 0 e 18.");
      return;
    }

    void runMutation(
      (signal) => userApi.updateParental(parentalMaxAgeRating, { signal }),
      "Controlo parental atualizado.",
    );
  }

  return (
    <main className="page-shell">
      <h1>A minha conta</h1>
      {loading ? <p role="status">A carregar conta...</p> : null}
      {error ? (
        <div role="alert">
          <p>{error}</p>
          {!user ? (
            <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
              Tentar novamente
            </button>
          ) : null}
        </div>
      ) : null}
      {status ? <p role="status">{status}</p> : null}
      {user && (
        <>
          <form onSubmit={handleProfileSubmit}>
            <label htmlFor="profile-name">Nome</label>
            <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
            <button type="submit" disabled={mutating}>Guardar perfil</button>
          </form>
          <form onSubmit={handleParentalSubmit}>
            <label htmlFor="parental-limit">Limite parental (0 a 18)</label>
            <input
              id="parental-limit"
              inputMode="numeric"
              value={parentalInput}
              onChange={(event) => setParentalInput(event.target.value)}
            />
            <button type="submit" disabled={mutating}>Guardar limite</button>
          </form>
          <dl>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Papel</dt>
            <dd>{ROLE_LABELS[user.role] ?? "Utilizador"}</dd>
          </dl>
        </>
      )}
    </main>
  );
}
```

`frontend/src/pages/AdminUsersPage.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { toUserMessage } from "../services/api/apiErrors.js";
import { userApi } from "../services/api/userApi.js";

const ROLES = ["user", "moderator", "admin"];
const ROLE_LABELS = Object.freeze({
  user: "Utilizador",
  moderator: "Moderador",
  admin: "Administrador",
});

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyUsers, setBusyUsers] = useState(() => new Set());
  const [reloadVersion, setReloadVersion] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const busyRef = useRef(new Set());
  const mutationControllersRef = useRef(new Set());

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    // Cada mudança de página/pesquisa invalida o pedido anterior para evitar resultados fora de ordem.
    setLoading(true);
    setUsers([]);
    setError("");
    userApi.listUsers(
      { page, limit: 20, search: activeSearch },
      { signal: controller.signal },
    )
      .then((response) => {
        if (active) {
          setUsers(Array.isArray(response.users) ? response.users : []);
          setPagination({
            page: Number.isSafeInteger(response.page) ? response.page : page,
            total: Number.isSafeInteger(response.total) ? response.total : 0,
            totalPages: Number.isSafeInteger(response.totalPages)
              ? response.totalPages
              : 0,
          });
        }
      })
      .catch((requestError) => {
        if (active && requestError?.code !== "REQUEST_ABORTED") {
          setError(toUserMessage(requestError));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [activeSearch, page, reloadVersion]);

  useEffect(() => () => {
    for (const controller of mutationControllersRef.current) controller.abort();
    mutationControllersRef.current.clear();
  }, []);

  async function handleRoleChange(userId, role) {
    // O busy state é por linha: uma alteração não bloqueia a tabela inteira nem duplica a mesma mutação.
    if (busyRef.current.has(userId) || !ROLES.includes(role)) return;

    const previous = users.find((user) => user.id === userId);
    if (!previous) return;

    const controller = new AbortController();
    mutationControllersRef.current.add(controller);
    busyRef.current.add(userId);
    setBusyUsers(new Set(busyRef.current));
    setError("");
    setUsers((current) => current.map((user) => (
      user.id === userId ? { ...user, role } : user
    )));

    try {
      const response = await userApi.updateRole(userId, role, {
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setUsers((current) => current.map((user) => (
          user.id === userId ? response.user : user
        )));
      }
    } catch (requestError) {
      if (requestError?.code !== "REQUEST_ABORTED") {
        setUsers((current) => current.map((user) => (
          user.id === userId ? previous : user
        )));
        setError(toUserMessage(requestError));
      }
    } finally {
      mutationControllersRef.current.delete(controller);
      busyRef.current.delete(userId);
      if (!controller.signal.aborted) setBusyUsers(new Set(busyRef.current));
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setActiveSearch(search.trim());
    setReloadVersion((value) => value + 1);
  }

  return (
    <main className="page-shell">
      <h1>Utilizadores</h1>
      <form role="search" onSubmit={handleSearch}>
        <label htmlFor="users-search">Pesquisar por nome ou email</label>
        <input
          id="users-search"
          value={search}
          maxLength={80}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button type="submit" disabled={loading}>Pesquisar</button>
      </form>
      {loading ? <p role="status">A carregar utilizadores...</p> : null}
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : null}
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
                <select
                  value={user.role}
                  disabled={busyUsers.has(user.id)}
                  onChange={(event) => handleRoleChange(user.id, event.target.value)}
                >
                  {!ROLES.includes(user.role) ? (
                    <option value={user.role}>Utilizador</option>
                  ) : null}
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pagination.totalPages > 1 ? (
        <nav aria-label="Paginacao de utilizadores">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Anterior
          </button>
          <span>Pagina {pagination.page} de {pagination.totalPages} ({pagination.total})</span>
          <button
            type="button"
            disabled={loading || page >= pagination.totalPages}
            onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
          >
            Seguinte
          </button>
        </nav>
      ) : null}
    </main>
  );
}
```

Trecho esperado em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// SUBSTITUIR a declaração lazy de AccountPage criada em BK-MF1-02.
const AccountPage = lazyNamedPage(() => import("../pages/AccountPage.jsx"), "AccountPage");

// ADICIONAR uma única vez, junto das restantes declarações lazy.
const AdminUsersPage = lazyNamedPage(() => import("../pages/AdminUsersPage.jsx"), "AdminUsersPage");

<>
  <Route path="/conta" element={<AccountPage />} />
  <Route path="/admin/utilizadores" element={<AdminUsersPage />} />
</>
```

5. Explicacao do codigo ou da decisao.

A página de conta nunca mostra um input para role. A leitura é cancelável e repetível; perfil e limite parental usam o mesmo bloqueio imediato. O limite continua texto até passar a gramática `0..18`, e só então é convertido. O admin pagina/pesquisa com pedidos canceláveis; cada linha bloqueia duplo clique, apresenta uma alteração otimista e repõe o utilizador anterior se o servidor falhar. A composição substitui a declaração placeholder de `AccountPage` sem a redeclarar e acrescenta `AdminUsersPage` por lazy loading, preservando `Suspense`, `ErrorBoundary` e `RouteLifecycle` do router base.

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

Regista um utilizador, guarda o cookie num ficheiro temporário, promove esse email a admin e obtém um token CSRF antes de testar mutações autenticadas. Os comandos não imprimem cookies nem o token.

4. Codigo completo.

```bash
curl -sS -o /tmp/faithflix-register.json -w '%{http_code}\n' \
  -c /tmp/faithflix.cookies \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin Teste","email":"admin@faithflix.test","password":"password-segura-123"}' \
  http://localhost:3000/api/auth/register

npm run promote:admin -- admin@faithflix.test

curl -i -b /tmp/faithflix.cookies http://localhost:3000/api/users/me

curl -i -b /tmp/faithflix.cookies \
  'http://localhost:3000/api/users?page=1&limit=20'

curl -sS -b /tmp/faithflix.cookies -c /tmp/faithflix.cookies \
  -o /tmp/faithflix-csrf.json \
  http://localhost:3000/api/session/csrf-token

CSRF_TOKEN="$(node -p "JSON.parse(require('fs').readFileSync('/tmp/faithflix-csrf.json','utf8')).csrfToken")"

curl -i -b /tmp/faithflix.cookies \
  -X PATCH \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"name":"Admin Atualizado","role":"user"}' \
  http://localhost:3000/api/users/me

curl -i -b /tmp/faithflix.cookies \
  -X PATCH \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"parentalMaxAgeRating":"12"}' \
  http://localhost:3000/api/users/me/parental

unset CSRF_TOKEN
```

5. Explicacao do codigo ou da decisao.

O ficheiro de cookies simula o browser. O ultimo pedido tenta enviar `role`, mas o endpoint de perfil proprio deve atualizar apenas `name`.

6. Validacao do passo.

Resultados esperados:

- `/api/users/me` devolve `200` e o utilizador autenticado.
- `/api/users` devolve `200` apenas depois de promover admin.
- O `PATCH /api/users/me` nao muda a role.
- O limite parental enviado como string devolve `400`; o frontend envia um número apenas depois da validação local.

7. Caso negativo, erro comum ou risco que este passo evita.

Se `/api/users` devolver `200` sem admin, a autorizacao esta aberta e deve ser corrigida antes de avancar para o catalogo.

## Snippet tecnico aplicavel

```js
userRouter.get("/me", requireAuth, asyncHandler(getMe));
userRouter.get("/", requireRole(["admin"]), asyncHandler(getUsers));
```

#### Critérios de aceite

- [ ] `GET /api/users/me` exige login.
- [ ] Existe apenas o `backend/src/middlewares/auth.middleware.js`; os guards
  encaminham `401 AUTH_REQUIRED` e `403 FORBIDDEN` para o error handler, que
  devolve `{ code, message, requestId }`.
- [ ] `app.js` conserva uma única cadeia
  `asyncHandler(attachSession) -> asyncHandler(csrfProtection)` e este BK
  acrescenta apenas `app.use("/api/users", userRouter)` depois dela.
- [ ] `PATCH /api/users/me` altera apenas `name`.
- [ ] `PATCH /api/users/me/parental` aceita apenas um número JSON inteiro `0..18`.
- [ ] `GET /api/users` exige role `admin`.
- [ ] A listagem admin devolve `{ users, page, limit, total, totalPages }`, tem sort estável e recusa `limit=51`/queries ambíguas.
- [ ] `PATCH /api/users/:id/role` aceita apenas `user`, `moderator` ou `admin`.
- [ ] O frontend tem `/conta` e `/admin/utilizadores`.
- [ ] Nenhuma resposta expoe `passwordHash`.
- [ ] Sair de `/conta` aborta a leitura e qualquer mutação pendente.
- [ ] Uma leitura falhada pode ser repetida sem recarregar a aplicação.
- [ ] Perfil e limite parental não podem ser gravados em paralelo.
- [ ] Limite parental vazio, decimal ou fora de `0..18` não chama a API.
- [ ] A UI aplica a resposta autoritativa e traduz role/fallback para PT-PT.

#### Validação final

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Se o projeto ainda nao tiver testes automaticos para este modulo, regista evidence manual com os comandos `curl`, screenshots de `/conta` e `/admin/utilizadores`, e resultados esperados.

#### Evidence para PR/defesa

- Output de `npm --prefix backend test`.
- Output de `npm --prefix frontend run build`.
- Respostas `curl` de `GET /api/users/me`, `GET /api/users` e `PATCH /api/users/:id/role`.
- Screenshot de `/conta` com o nome atualizado.
- Screenshot de `/admin/utilizadores` visivel apenas para admin.
- Nota curta a confirmar que nenhuma resposta expoe `passwordHash`.
- Teste comportamental de cancelamento no unmount, retry da leitura, mutação
  serializada e limite parental vazio sem chamada à API.

#### Handoff

O `BK-MF2-03` pode usar `requireRole(["admin", "moderator"])` para proteger criação, edição, publicação e arquivamento de conteúdos. Utilizadores com role `user` ficam apenas com leitura pública do catálogo publicado.

## Proximo BK recomendado

`BK-MF2-03` - CRUD de catalogo e taxonomias.

#### Changelog

- 2026-05-31: Alinhados criterios, evidence, handoff e changelog com o contrato do guia.
- 2026-07-10: Tutorial canónico consolidado com validação de tipos reais, cancelamento/anti-stale, retry, mutações serializadas, rollback administrativo, resposta autoritativa e limite parental sem coerção de vazio.
- 2026-07-10: montagem de users corrigida para adicionar apenas `userRouter`,
  sem duplicar ou desenrolar a cadeia canónica de sessão/CSRF.
