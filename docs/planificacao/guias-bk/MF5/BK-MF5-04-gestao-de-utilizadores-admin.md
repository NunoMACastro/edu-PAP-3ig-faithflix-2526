# BK-MF5-04 - Gestão de utilizadores admin

## Header

- `doc_id`: `GUIA-BK-MF5-04`
- `bk_id`: `BK-MF5-04`
- `macro`: `MF5`
- `owner`: `Kaue`
- `apoio`: `Matheus`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-02`
- `rf_rnf`: `RF58`
- `fase_documental`: `Fase 2`
- `sprint`: `S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-05`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-04-gestao-de-utilizadores-admin.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais completar a gestão administrativa de utilizadores. O administrador deve conseguir listar contas, filtrar por texto/estado e alterar role ou estado operacional de uma conta, com proteções contra abuso.

`CANONICO`: este BK cobre `RF58 - Gestão de utilizadores`, depende de `BK-MF2-02` e pertence à área de operação e privacidade.

`DERIVADO`: a implementação reutiliza `real_dev/backend/src/modules/users`, já existente na app, para evitar duplicar o domínio de utilizadores.

#### Importância

Operação admin é necessária para manter a plataforma. Um administrador pode precisar de bloquear uma conta abusiva, promover um moderador ou rever utilizadores ativos.

Como esta capacidade é sensível, não chega esconder botões no frontend. O backend deve exigir `admin`, validar entradas, impedir que um administrador retire o próprio acesso por engano e registar a ação.

#### Scope-in

- Reutilizar o módulo `users`.
- Adicionar filtro por texto e estado.
- Validar roles e estados aceites.
- Criar endpoint admin `PATCH /api/users/:id/admin`.
- Registar ações em `admin_audit_logs`.
- Atualizar `userApi` e `AdminUsersPage`.
- Criar teste unitário da validação.

#### Scope-out

- Reset de palavra-passe por admin.
- Gestão de conteúdos ou subscrições.
- Administração de associações, já tratada na MF4.
- Painel de métricas, que fica para `BK-MF5-05`.
- Configuração de integrações, que fica para `BK-MF5-06`.

#### Estado antes e depois

Antes deste BK, existe uma página admin simples que lista utilizadores e altera apenas role. Falta estado operacional, filtros, auditoria e proteção de auto-bloqueio.

Depois deste BK, o administrador consegue operar utilizadores com contrato backend claro, frontend rastreável e logs de auditoria sem dados sensíveis.

#### Pre-requisitos

- `BK-MF2-02` criou roles base.
- `BK-MF1-04` criou sessão segura.
- `real_dev/backend/src/modules/users` existe com `user.routes.js`, `user.controller.js`, `user.service.js` e `user.validation.js`.
- `real_dev/frontend/src/pages/AdminUsersPage.jsx` existe.

#### Glossário

- Administrador: utilizador com role `admin`.
- Role: permissão funcional principal da conta.
- Estado operacional: estado que permite bloquear ou manter ativa uma conta.
- Auto-bloqueio: erro em que um administrador bloqueia a própria conta.
- Log de auditoria: registo mínimo de uma ação administrativa crítica.

#### Conceitos teóricos essenciais

No domínio FaithFlix, gestão de utilizadores não significa ver dados pessoais de consumo. O administrador precisa de nome, email, role, estado e datas básicas para operação.

No backend, `requireRole(["admin"])` protege as rotas. O service aplica regras adicionais: não permitir que o admin retire o próprio `admin` nem bloqueie a própria conta.

No frontend, a página deve mostrar lista, loading, erro, vazio e sucesso. A UI pode esconder ações perigosas, mas o backend continua a ser a autoridade.

Na auditoria, cada alteração guarda ator, alvo, alteração e data. O log não guarda palavra-passe, cookie ou detalhes de sessão.

#### Arquitetura do BK

| Camada | Contrato |
| --- | --- |
| Backend route | `GET /api/users?search=&status=` |
| Backend route | `PATCH /api/users/:id/admin` |
| Autorização | `requireRole(["admin"])` |
| Validator | `assertAdminUserUpdate(input)` |
| Service | `listUsers(filters)`, `updateUserByAdmin(actorUserId, targetUserId, input)` |
| Auditoria | `admin_audit_logs` |
| Frontend | `userApi.listUsers(filters)`, `userApi.updateUserAdmin(userId, input)` |
| Página | `AdminUsersPage` |

#### Ficheiros a criar/editar/rever

- EDITAR: `real_dev/backend/src/modules/users/user.validation.js`
- EDITAR: `real_dev/backend/src/modules/users/user.service.js`
- EDITAR: `real_dev/backend/src/modules/users/user.controller.js`
- EDITAR: `real_dev/backend/src/modules/users/user.routes.js`
- EDITAR: `real_dev/frontend/src/services/api/userApi.js`
- EDITAR: `real_dev/frontend/src/pages/AdminUsersPage.jsx`
- CRIAR: `real_dev/backend/tests/unit/mf5-admin-users.validation.test.js`
- REVER: `RF58`, `RNF19`, `BK-MF2-02`

#### Tutorial técnico linear

### Passo 1 - Validar alterações administrativas

1. Objetivo funcional do passo no contexto da app.

Definir que roles, estados e filtros podem ser usados por um administrador.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/backend/src/modules/users/user.validation.js`
    - LOCALIZAÇÃO: constantes e função nova no fim do ficheiro

3. Instruções do que fazer.

Mantém `VALID_ROLES`, acrescenta estados operacionais e valida filtros de listagem.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/src/modules/users/user.validation.js
export const VALID_ACCOUNT_STATUSES = ["active", "blocked"];
const MAX_ADMIN_SEARCH_LENGTH = 80;

/**
 * Escapa caracteres especiais para usar pesquisa textual em `$regex` como literal.
 *
 * @param {string} value Texto normalizado.
 * @returns {string} Texto seguro para pesquisa literal.
 */
function escapeRegexLiteral(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Valida alteração administrativa de uma conta.
 *
 * @param {{ role?: unknown, accountStatus?: unknown }} input Dados recebidos.
 * @returns {{ role?: string, accountStatus?: string }} Alteração segura.
 * @throws {HttpError} Quando role ou estado são inválidos.
 */
export function assertAdminUserUpdate(input) {
    const update = {};

    if ("role" in (input ?? {})) {
        const role = String(input.role ?? "").trim();

        if (!VALID_ROLES.includes(role)) {
            throw new HttpError(400, "Role inválida.");
        }

        update.role = role;
    }

    if ("accountStatus" in (input ?? {})) {
        const accountStatus = String(input.accountStatus ?? "").trim();

        if (!VALID_ACCOUNT_STATUSES.includes(accountStatus)) {
            throw new HttpError(400, "Estado de conta inválido.");
        }

        update.accountStatus = accountStatus;
    }

    if (Object.keys(update).length === 0) {
        throw new HttpError(400, "Indica role ou estado de conta.");
    }

    return update;
}

/**
 * Valida filtros de listagem administrativa.
 *
 * @param {{ search?: unknown, status?: unknown }} filters Query string recebida.
 * @returns {{ search?: string, status?: string }} Filtros normalizados e seguros.
 * @throws {HttpError} Quando o texto é demasiado longo ou o estado não existe.
 */
export function assertAdminUserFilters(filters = {}) {
    const safeFilters = {};
    const search = String(filters.search ?? "").trim();
    const status = String(filters.status ?? "").trim();

    if (search.length > MAX_ADMIN_SEARCH_LENGTH) {
        throw new HttpError(400, "Pesquisa demasiado longa.");
    }

    if (search) {
        safeFilters.search = escapeRegexLiteral(search);
    }

    if (status) {
        if (!VALID_ACCOUNT_STATUSES.includes(status)) {
            throw new HttpError(400, "Filtro de estado inválido.");
        }

        safeFilters.status = status;
    }

    return safeFilters;
}
```

5. Explicação do código.

O validator aceita alteração parcial: só role, só estado ou ambos. Valores fora da lista fechada falham com `400`, evitando roles inventadas e estados impossíveis.

`assertAdminUserFilters` valida a query string da listagem admin. O texto de pesquisa tem limite de tamanho e é escapado antes de chegar ao `$regex`, para que a pesquisa seja literal e não um padrão arbitrário. O estado também usa a lista fechada `active`/`blocked`.

6. Validação do passo.

Executa:

```bash
cd real_dev/backend
node -e "import('./src/modules/users/user.validation.js').then(({ assertAdminUserUpdate, assertAdminUserFilters }) => console.log(assertAdminUserUpdate({ role: 'moderator', accountStatus: 'active' }).role, assertAdminUserFilters({ search: 'ana.*', status: 'active' }).status))"
```

O resultado esperado é `moderator active`.

7. Cenário negativo/erro esperado.

`{ role: "owner" }` deve falhar. A aplicação não tem essa role documentada.

### Passo 2 - Atualizar service com filtros e auditoria

1. Objetivo funcional do passo no contexto da app.

Permitir listagem filtrada e alteração administrativa segura.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/backend/src/modules/users/user.service.js`
    - LOCALIZAÇÃO: imports, substituição de `listUsers` e adição de `updateUserByAdmin` mantendo `updateUserRole` para compatibilidade da rota antiga

3. Instruções do que fazer.

Importa `assertAdminUserUpdate`, substitui a listagem simples por listagem filtrada e adiciona `updateUserByAdmin`. Mantém `updateUserRole` no ficheiro enquanto a rota antiga `/:id/role` existir, para não partir imports nem PRs anteriores.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/src/modules/users/user.service.js
import {
    assertAdminUserFilters,
    assertAdminUserUpdate,
} from "./user.validation.js";

/**
 * Constrói filtros seguros para a listagem admin.
 *
 * @param {{ search?: unknown, status?: unknown }} filters Filtros recebidos da query string.
 * @returns {Record<string, unknown>} Query MongoDB segura.
 */
function buildAdminUserQuery(filters = {}) {
    const query = {};
    const { search, status } = assertAdminUserFilters(filters);

    if (search) {
        // A pesquisa já vem escapada do validator para impedir regex arbitrária.
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    if (status) {
        // Só estados da lista fechada chegam aqui, mantendo a query previsível.
        query.accountStatus = status;
    }

    return query;
}

/**
 * Lista utilizadores para administração sem campos internos.
 *
 * @param {{ search?: unknown, status?: unknown }} filters Filtros opcionais.
 * @returns {Promise<Array<ReturnType<typeof toPublicUser>>>} Lista pública admin.
 */
export async function listUsers(filters = {}) {
    const db = await getDb();
    const users = await db
        .collection("users")
        .find(buildAdminUserQuery(filters), { projection: { passwordHash: 0 } })
        .sort({ createdAt: -1 })
        .toArray();

    return users.map((user) => ({
        ...toPublicUser(user),
        accountStatus: user.accountStatus ?? "active",
    }));
}

/**
 * Regista uma ação administrativa crítica sem guardar dados sensíveis.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {{ actorUserId: import("mongodb").ObjectId, targetUserId: import("mongodb").ObjectId, action: string, changes: Record<string, unknown> }} entry Dados de auditoria.
 * @returns {Promise<void>} Termina quando o log é gravado.
 */
async function writeAdminAuditLog(db, entry) {
    await db.collection("admin_audit_logs").insertOne({
        ...entry,
        createdAt: new Date(),
    });
}

/**
 * Atualiza role ou estado de uma conta através de administrador.
 *
 * @param {string} actorUserId Id do administrador autenticado.
 * @param {string} targetUserId Id da conta alvo.
 * @param {{ role?: unknown, accountStatus?: unknown }} input Dados recebidos.
 * @returns {Promise<ReturnType<typeof toPublicUser> & { accountStatus: string }>} Utilizador atualizado.
 */
export async function updateUserByAdmin(actorUserId, targetUserId, input) {
    const update = assertAdminUserUpdate(input);
    const db = await getDb();
    const actorObjectId = asUserObjectId(actorUserId);
    const targetObjectId = asUserObjectId(targetUserId);

    if (String(actorObjectId) === String(targetObjectId)) {
        if (update.role && update.role !== "admin") {
            throw new HttpError(400, "Não podes retirar o teu próprio acesso admin.");
        }

        if (update.accountStatus === "blocked") {
            throw new HttpError(400, "Não podes bloquear a tua própria conta.");
        }
    }

    const user = await db.collection("users").findOneAndUpdate(
        { _id: targetObjectId, accountStatus: { $ne: "deleted" } },
        { $set: { ...update, updatedAt: new Date() } },
        { returnDocument: "after" },
    );

    if (!user) {
        throw new HttpError(404, "Utilizador não encontrado.");
    }

    await writeAdminAuditLog(db, {
        actorUserId: actorObjectId,
        targetUserId: targetObjectId,
        action: "user_admin_update",
        changes: update,
    });

    return {
        ...toPublicUser(user),
        accountStatus: user.accountStatus ?? "active",
    };
}
```

5. Explicação do código.

`buildAdminUserQuery` permite filtros simples sem expor campos internos e só usa valores normalizados por `assertAdminUserFilters`. A pesquisa passa a ser literal, mesmo que o admin escreva caracteres como `.*`, e o filtro de estado fica preso à lista `active`/`blocked`.

`updateUserByAdmin` protege contra auto-despromoção e auto-bloqueio. A ação fica registada em `admin_audit_logs`, cumprindo o princípio de auditoria para operações críticas. `updateUserRole` só fica no ficheiro para compatibilidade com a rota antiga; o contrato novo deste BK é `PATCH /api/users/:id/admin`.

6. Validação do passo.

Executa:

```bash
cd real_dev/backend
node -e "import('./src/modules/users/user.service.js').then(({ listUsers, updateUserByAdmin }) => console.log(typeof listUsers, typeof updateUserByAdmin))"
```

O resultado esperado é `function function`.

7. Cenário negativo/erro esperado.

Se um admin tentar alterar a própria role para `user`, o backend deve devolver `400`. Isto evita perder o único acesso administrativo por acidente.

### Passo 3 - Atualizar controller e rotas admin

1. Objetivo funcional do passo no contexto da app.

Ligar filtros e atualização administrativa à API.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/backend/src/modules/users/user.controller.js`
    - EDITAR: `real_dev/backend/src/modules/users/user.routes.js`
    - LOCALIZAÇÃO: funções e rotas admin

3. Instruções do que fazer.

Atualiza `getUsers` para passar `req.query` e cria `patchUserAdmin`. No import do topo de `user.controller.js`, mantém os exports antigos e acrescenta `updateUserByAdmin`, evitando remover `updateUserRole` enquanto `patchUserRole` continuar disponível para compatibilidade.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/src/modules/users/user.controller.js
import {
    getMyProfile,
    listUsers,
    updateMyProfile,
    updateParentalSettings,
    updateUserByAdmin,
    updateUserRole,
} from "./user.service.js";

/**
 * Lista utilizadores para admins com filtros opcionais.
 *
 * @param {import("express").Request} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Lista de utilizadores.
 */
export async function getUsers(req, res) {
    return res.status(200).json({ users: await listUsers(req.query) });
}

/**
 * Atualiza role ou estado de uma conta por administrador.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Utilizador atualizado.
 */
export async function patchUserAdmin(req, res) {
    return res.status(200).json({
        user: await updateUserByAdmin(req.user.id, req.params.id, req.body),
    });
}
```

```js
// real_dev/backend/src/modules/users/user.routes.js
import {
    getMe,
    getUsers,
    patchMe,
    patchMyParentalSettings,
    patchUserAdmin,
    patchUserRole,
} from "./user.controller.js";

userRouter.patch(
    "/:id/admin",
    requireRole(["admin"]),
    asyncHandler(patchUserAdmin),
);
```

5. Explicação do código.

A rota antiga `/:id/role` pode continuar para compatibilidade local, mas a rota nova é o contrato deste BK porque permite role e estado no mesmo endpoint. Os blocos mostram imports completos para o aluno não apagar `patchUserRole`, `updateUserRole` ou outras funções já usadas por BKs anteriores. O backend continua a exigir admin.

6. Validação do passo.

Com sessão admin, chama `GET /api/users?search=ana&status=active` e confirma que a resposta é `{ users: [...] }`.

7. Cenário negativo/erro esperado.

Com utilizador normal, `PATCH /api/users/:id/admin` deve devolver `403`.

### Passo 4 - Atualizar API e página admin no frontend

1. Objetivo funcional do passo no contexto da app.

Dar ao administrador uma UI para procurar e alterar utilizadores.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/frontend/src/services/api/userApi.js`
    - EDITAR: `real_dev/frontend/src/pages/AdminUsersPage.jsx`
    - LOCALIZAÇÃO: cliente API e componente completo

3. Instruções do que fazer.

Adiciona métodos com filtros e substitui a página por uma versão com pesquisa, estado e ações.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/frontend/src/services/api/userApi.js
listUsers(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);

    const query = params.toString();
    return apiClient.get(`/api/users${query ? `?${query}` : ""}`);
},

updateUserAdmin(userId, input) {
    return apiClient.patch(
        `/api/users/${encodeURIComponent(userId)}/admin`,
        input,
    );
},
```

```jsx
// real_dev/frontend/src/pages/AdminUsersPage.jsx
import { useEffect, useState } from "react";
import { userApi } from "../services/api/userApi.js";

const ROLES = ["user", "moderator", "admin"];
const STATUSES = ["active", "blocked"];

/**
 * Página admin para gestão operacional de utilizadores.
 *
 * @returns {JSX.Element} Tabela admin com filtros e ações.
 */
export function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    /**
     * Carrega utilizadores com os filtros atuais.
     *
     * @returns {Promise<void>} Termina quando a tabela é atualizada.
     */
    async function loadUsers() {
        setLoading(true);
        const response = await userApi.listUsers({ search, status: statusFilter });
        setUsers(response.users);
        setLoading(false);
    }

    useEffect(() => {
        loadUsers().catch((requestError) => {
            setError(requestError.message);
            setLoading(false);
        });
    }, []);

    /**
     * Atualiza role ou estado de um utilizador.
     *
     * @param {string} userId Id do utilizador alvo.
     * @param {Record<string, string>} input Alteração a enviar.
     * @returns {Promise<void>} Termina quando a linha é atualizada.
     */
    async function updateUser(userId, input) {
        setSavingId(userId);
        setError("");
        setStatus("");

        try {
            const response = await userApi.updateUserAdmin(userId, input);
            setUsers((current) =>
                current.map((user) =>
                    user.id === userId ? response.user : user,
                ),
            );
            setStatus("Utilizador atualizado.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSavingId("");
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Utilizadores</h1>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form
                className="form-panel"
                onSubmit={(event) => {
                    event.preventDefault();
                    loadUsers().catch((requestError) => setError(requestError.message));
                }}
            >
                <label>
                    Pesquisa
                    <input value={search} onChange={(event) => setSearch(event.target.value)} />
                </label>
                <label>
                    Estado
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                        <option value="">Todos</option>
                        {STATUSES.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </label>
                <button type="submit">Filtrar</button>
            </form>
            {loading ? <p>A carregar utilizadores...</p> : null}
            {!loading && users.length === 0 ? <p>Nenhum utilizador encontrado.</p> : null}
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Estado</th>
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
                                        disabled={savingId === user.id}
                                        onChange={(event) => updateUser(user.id, { role: event.target.value })}
                                    >
                                        {ROLES.map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        value={user.accountStatus ?? "active"}
                                        disabled={savingId === user.id}
                                        onChange={(event) => updateUser(user.id, { accountStatus: event.target.value })}
                                    >
                                        {STATUSES.map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
```

5. Explicação do código.

A página passa a ter filtros e estados de carregamento/vazio. Cada alteração chama o backend admin; a UI não altera permissões localmente sem resposta da API.

6. Validação do passo.

Entrando como admin, abre `/admin/utilizadores`, filtra por email e altera o estado de um utilizador. A tabela deve atualizar a linha.

7. Cenário negativo/erro esperado.

Se tentares aceder com utilizador sem role admin, o backend devolve `403` e a página mostra a mensagem de erro.

### Passo 5 - Testar validação admin

1. Objetivo funcional do passo no contexto da app.

Provar que roles, estados e filtros fora do contrato são rejeitados.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/backend/tests/unit/mf5-admin-users.validation.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o teste abaixo.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/tests/unit/mf5-admin-users.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
    assertAdminUserFilters,
    assertAdminUserUpdate,
} from "../../src/modules/users/user.validation.js";

test("MF5 valida atualização admin de utilizadores", () => {
    // O caso válido confirma o contrato que o service pode persistir.
    assert.deepEqual(
        assertAdminUserUpdate({ role: "moderator", accountStatus: "blocked" }),
        { role: "moderator", accountStatus: "blocked" },
    );

    // A pesquisa é tratada como texto literal, não como expressão regular livre.
    assert.deepEqual(assertAdminUserFilters({ search: "ana.*", status: "active" }), {
        search: "ana\\.\\*",
        status: "active",
    });

    assert.throws(() => assertAdminUserUpdate({ role: "owner" }), /Role/);
    assert.throws(
        () => assertAdminUserUpdate({ accountStatus: "archived" }),
        /Estado/,
    );
    assert.throws(() => assertAdminUserUpdate({}), /Indica/);
    assert.throws(() => assertAdminUserFilters({ status: "deleted" }), /estado/);
});
```

5. Explicação do código.

O teste cobre caso válido, pesquisa literal escapada, role inválida, estado inválido e pedido vazio. Isto protege a fronteira do endpoint e impede que a listagem admin aceite filtros fora do contrato.

6. Validação do passo.

Executa:

```bash
cd real_dev/backend
node --test tests/unit/mf5-admin-users.validation.test.js
```

O resultado esperado é `pass`.

7. Cenário negativo/erro esperado.

Se o validator aceitar `{}`, o service poderia gravar auditoria sem alteração real. O teste impede esse falso positivo.

#### Critérios de aceite

- `GET /api/users` continua protegido por admin e aceita filtros opcionais.
- `PATCH /api/users/:id/admin` exige admin.
- A rota antiga `PATCH /api/users/:id/role` pode continuar compatível, mas o contrato novo da MF5 é `PATCH /api/users/:id/admin`.
- Roles aceites ficam limitadas a `user`, `moderator` e `admin`.
- Estados aceites ficam limitados a `active` e `blocked`.
- O filtro `search` tem limite de tamanho e é escapado antes de entrar em `$regex`.
- O filtro `status` só aceita `active` ou `blocked`.
- Admin não consegue retirar o próprio acesso admin.
- Admin não consegue bloquear a própria conta.
- Ações ficam registadas em `admin_audit_logs`.
- Frontend mostra loading, erro, vazio, filtros e atualização por linha.

#### Validação final

Executa:

```bash
cd real_dev/backend
node --test tests/unit/mf5-admin-users.validation.test.js
node -e "import('./src/modules/users/user.routes.js').then(({ userRouter }) => console.log(typeof userRouter))"
```

Depois valida no browser:

- abrir `/admin/utilizadores` com admin;
- filtrar por texto;
- alterar role de outro utilizador;
- bloquear outro utilizador;
- confirmar que utilizador sem admin recebe erro.

#### Evidence para PR/defesa

- `pr`: referência do commit ou PR.
- `proof`: output do teste de validação.
- `proof`: captura da tabela admin com filtros.
- `neg`: utilizador sem admin recebe `403`.
- `neg`: role inválida devolve `400`.
- `neg`: tentativa de auto-bloqueio devolve `400`.

#### Handoff

`BK-MF5-05` vai consumir esta base admin para criar métricas restritas a administradores. `BK-MF5-06` também depende desta autorização para configurar integrações operacionais.

#### Changelog

- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com filtros admin, estado de conta, auditoria, frontend e testes.
