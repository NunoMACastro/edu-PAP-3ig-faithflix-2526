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
- `sprint`: `S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-01`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-04-gestao-de-utilizadores-admin.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais completar a gestão administrativa de utilizadores. O administrador deve conseguir listar contas, filtrar por texto/estado e alterar role ou estado operacional de uma conta, com proteções contra abuso.

`CANONICO`: este BK cobre `RF58 - Gestão de utilizadores`, depende de `BK-MF2-02` e pertence à área de operação e privacidade.

`DERIVADO`: a implementação reutiliza `backend/src/modules/users`, já existente na app, para evitar duplicar o domínio de utilizadores.

#### Importância

Operação admin é necessária para manter a plataforma. Um administrador pode precisar de bloquear uma conta abusiva, promover um moderador ou rever utilizadores ativos.

Como esta capacidade é sensível, não chega esconder botões no frontend. O backend deve exigir `admin`, validar entradas, impedir que um administrador retire o próprio acesso por engano e registar a ação.

#### Scope-in

- Reutilizar o módulo `users`.
- Adicionar filtro por texto e estado.
- Validar roles e estados aceites.
- Criar endpoint admin `PATCH /api/users/:id/admin`.
- Registar ações em `admin_audit_logs`.
- Revogar todas as sessões quando uma conta é bloqueada.
- Preservar pelo menos um administrador ativo, incluindo sob concorrência.
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

#### Pré-requisitos

- `BK-MF2-02` criou roles base.
- `BK-MF1-04` criou sessão segura.
- `backend/src/modules/users` existe com `user.routes.js`, `user.controller.js`, `user.service.js` e `user.validation.js`.
- `frontend/src/pages/AdminUsersPage.jsx` existe.

#### Glossário

- Administrador: utilizador com role `admin`.
- Role: permissão funcional principal da conta.
- Estado operacional: estado que permite bloquear ou manter ativa uma conta.
- Auto-bloqueio: erro em que um administrador bloqueia a própria conta.
- Log de auditoria: registo mínimo de uma ação administrativa crítica.
- Último admin ativo: invariante que impede a aplicação de ficar sem uma conta
  administrativa operacional.

#### Conceitos teóricos essenciais

No domínio FaithFlix, gestão de utilizadores não significa ver dados pessoais de consumo. O administrador precisa de nome, email, role, estado e datas básicas para operação.

No backend, `requireRole(["admin"])` protege as rotas. O service aplica regras adicionais: não permitir que o admin retire o próprio `admin` nem bloqueie a própria conta.

No frontend, a página deve mostrar lista, loading, erro, vazio e sucesso. A UI pode esconder ações perigosas, mas o backend continua a ser a autoridade.

Na auditoria, cada alteração guarda ação, ator, alvo, apenas role/estado antes e
depois, campos alterados, `requestId` e data. O log não guarda email, telefone,
contactos, palavra-passe, cookie, token, detalhes de sessão ou snapshots
pessoais integrais. A alteração, a revogação de sessões e o audit log pertencem
à mesma transação: ou ficam todos persistidos, ou nenhum fica.

Bloquear ou despromover um admin também exige proteger o último admin ativo. Um
documento técnico de invariante força conflito de escrita entre operações
concorrentes; depois, a contagem é repetida dentro da transação antes de aceitar
a remoção de privilégios. Só conta uma conta com `role: "admin"` e estado
autenticável `active` (ou documento legacy sem `accountStatus`); `inactive`,
estados desconhecidos, `blocked` e `deleted` nunca simulam um admin operacional.

#### Arquitetura do BK

| Camada | Contrato |
| --- | --- |
| Backend route | `GET /api/users?search=&status=&page=&limit=` |
| Backend route | `PATCH /api/users/:id/admin` |
| Autorização | `requireRole(["admin"])` |
| Validator | `assertAdminUserUpdate(input)` |
| Service | `listUsers(filters)`, `updateUserByAdmin(actorUserId, targetUserId, input, context)` |
| Auditoria | `admin_audit_logs` |
| Invariante | `admin_invariants/_id: "active-admin-roster"` |
| Frontend | `userApi.listUsers(filters)`, `userApi.updateUserAdmin(userId, input)` |
| Página | `AdminUsersPage` |

##### Contrato vinculativo de paginação e ações administrativas (Fase 5 - 2026-07-10)

- `GET /api/users` devolve
  `{ users, page, limit, total, totalPages }`. `page` e `limit` são inteiros
  positivos, `limit <= 50`, e a ordenação é estável por `createdAt: -1`,
  `_id: 1`. Pesquisa acima de 80 caracteres e estados fora de
  `active | blocked` devolvem `400`.
- Aplicar filtros regressa à página 1. A UI usa `limit: 20`, apresenta total e
  navegação Anterior/Seguinte, e nunca deduz `total` pelo comprimento da página.
- Leitura e mutações usam `AbortController`; sair da rota cancela tudo,
  `REQUEST_ABORTED` não aparece como erro e respostas antigas não substituem a
  página/filtro atuais.
- Alterar papel ou estado exige confirmação explícita com nome da conta e efeito.
  Cancelar repõe imediatamente o `<select>` controlado sem enviar mutação.
- Cada linha tem uma reserva síncrona e busy state próprio; ambos os selects da
  linha ficam desativados durante a escrita, sem bloquear outras linhas.
- Só a resposta autoritativa substitui o utilizador. Falhas passam por
  `toUserMessage`; a UI não aplica alteração otimista de permissões.
- Rótulos técnicos são traduzidos para PT-PT:
  `user/moderator/admin` tornam-se `Utilizador/Moderador/Administrador` e
  `active/blocked` tornam-se `Ativa/Bloqueada`.
- O exemplo linear do Passo 4 é apenas uma base didática e tem de ser completado
  com este contrato; não é uma implementação final de paginação ou concorrência.

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/users/user.validation.js`
- EDITAR: `backend/src/modules/users/user.service.js`
- EDITAR: `backend/src/modules/users/user.controller.js`
- EDITAR: `backend/src/modules/users/user.routes.js`
- REVER: `backend/src/config/database.js`
- REVER: `backend/src/modules/audit/audit.service.js`
- EDITAR: `frontend/src/services/api/userApi.js`
- EDITAR: `frontend/src/pages/AdminUsersPage.jsx`
- CRIAR: `backend/tests/unit/mf5-admin-users.validation.test.js`
- CRIAR/EDITAR: `backend/tests/unit/f3-admin-transactions.test.js`
- REVER: `RF58`, `RNF19`, `BK-MF2-02`

#### Tutorial técnico linear

### Passo 1 - Validar alterações administrativas

1. Objetivo funcional do passo no contexto da app.

Definir que roles, estados e filtros podem ser usados por um administrador.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/users/user.validation.js`
    - LOCALIZAÇÃO: constantes e função nova no fim do ficheiro

3. Instruções do que fazer.

Mantém `VALID_ROLES`, acrescenta estados operacionais e valida filtros de listagem.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/users/user.validation.js
export const VALID_ACCOUNT_STATUSES = ["active", "blocked"];
const MAX_ADMIN_SEARCH_LENGTH = 80;
const DEFAULT_ADMIN_PAGE = 1;
const DEFAULT_ADMIN_LIMIT = 20;
const MAX_ADMIN_LIMIT = 50;

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
 * Valida um inteiro positivo recebido na query string.
 *
 * @param {unknown} value Valor bruto recebido pelo Express.
 * @param {{ name: string, fallback: number, max?: number }} options Regras do campo.
 * @returns {number} Inteiro validado.
 * @throws {HttpError} Quando o valor não é um inteiro positivo dentro do limite.
 */
function assertPositiveQueryInteger(value, { name, fallback, max }) {
    if (value === undefined || value === "") return fallback;
    if (typeof value !== "string" && typeof value !== "number") {
        throw new HttpError(400, `${name} deve ser um inteiro positivo.`);
    }

    const normalized = String(value).trim();
    if (!/^\d+$/u.test(normalized)) {
        throw new HttpError(400, `${name} deve ser um inteiro positivo.`);
    }

    const parsed = Number(normalized);
    if (!Number.isSafeInteger(parsed) || parsed < 1 || (max && parsed > max)) {
        throw new HttpError(
            400,
            max
                ? `${name} deve estar entre 1 e ${max}.`
                : `${name} deve ser um inteiro positivo.`,
        );
    }

    return parsed;
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
 * @param {{ search?: unknown, status?: unknown, page?: unknown, limit?: unknown }} filters Query string recebida.
 * @returns {{ search?: string, status?: string, page: number, limit: number }} Filtros e paginação seguros.
 * @throws {HttpError} Quando o texto é demasiado longo ou o estado não existe.
 */
export function assertAdminUserFilters(filters = {}) {
    const safeFilters = {
        page: assertPositiveQueryInteger(filters.page, {
            name: "page",
            fallback: DEFAULT_ADMIN_PAGE,
        }),
        limit: assertPositiveQueryInteger(filters.limit, {
            name: "limit",
            fallback: DEFAULT_ADMIN_LIMIT,
            max: MAX_ADMIN_LIMIT,
        }),
    };
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

`assertAdminUserFilters` valida a query string da listagem admin. O texto de pesquisa tem limite de tamanho e é escapado antes de chegar ao `$regex`, para que a pesquisa seja literal e não um padrão arbitrário. O estado também usa a lista fechada `active`/`blocked`; `page` e `limit` são inteiros positivos, com `limit <= 50` e defaults `1/20`.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/modules/users/user.validation.js').then(({ assertAdminUserUpdate, assertAdminUserFilters }) => console.log(assertAdminUserUpdate({ role: 'moderator', accountStatus: 'active' }).role, assertAdminUserFilters({ search: 'ana.*', status: 'active' }).status))"
```

O resultado esperado é `moderator active`.

7. Cenário negativo/erro esperado.

`{ role: "owner" }` deve falhar. A aplicação não tem essa role documentada.

### Passo 2 - Atualizar service com filtros e auditoria

1. Objetivo funcional do passo no contexto da app.

Permitir listagem filtrada e alteração administrativa segura.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/users/user.service.js`
    - LOCALIZAÇÃO: imports, substituição de `listUsers` e adição de `updateUserByAdmin` mantendo `updateUserRole` para compatibilidade da rota antiga

3. Instruções do que fazer.

Importa `assertAdminUserUpdate`, substitui a listagem simples por listagem filtrada e adiciona `updateUserByAdmin`. Mantém `updateUserRole` no ficheiro enquanto a rota antiga `/:id/role` existir, para não partir imports nem PRs anteriores.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/users/user.service.js
import { getDb, runInTransaction } from "../../config/database.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import {
    assertAdminUserFilters,
    assertAdminUserUpdate,
} from "./user.validation.js";

/**
 * Indica se uma conta pertence ao conjunto de admins operacionais.
 *
 * @param {{ role?: string, accountStatus?: string, status?: string }} user Documento interno.
 * @returns {boolean} Verdadeiro apenas para admin autenticável.
 */
function isActiveAdmin(user) {
    const accountStatusAllowsLogin = user.accountStatus === undefined ||
        user.accountStatus === "active";
    const legacyStatusAllowsLogin = user.status === undefined ||
        user.status === "active";

    return user.role === "admin" &&
        accountStatusAllowsLogin &&
        legacyStatusAllowsLogin;
}

/**
 * Confirma se a alteração retira uma conta do conjunto de admins ativos.
 *
 * @param {{ role?: string, accountStatus?: string, status?: string }} before Estado persistido.
 * @param {{ role?: string, accountStatus?: string }} update Alteração validada.
 * @returns {boolean} Verdadeiro quando é preciso proteger a invariante.
 */
function removesActiveAdmin(before, update) {
    if (!isActiveAdmin(before)) return false;

    return !isActiveAdmin({
        role: update.role ?? before.role,
        accountStatus: update.accountStatus ?? before.accountStatus,
        status: before.status,
    });
}

/**
 * Constrói filtros seguros para a listagem admin.
 *
 * @param {{ search?: unknown, status?: unknown }} filters Filtros recebidos da query string.
 * @returns {Record<string, unknown>} Query MongoDB segura.
 */
function buildAdminUserQuery({ search, status }) {
    const query = {};

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
 * @param {{ search?: unknown, status?: unknown, page?: unknown, limit?: unknown }} filters Filtros opcionais.
 * @returns {Promise<{ users: Array<ReturnType<typeof toPublicUser>>, page: number, limit: number, total: number, totalPages: number }>} Envelope paginado admin.
 */
export async function listUsers(filters = {}) {
    const db = await getDb();
    const { page, limit, ...normalizedFilters } = assertAdminUserFilters(filters);
    const query = buildAdminUserQuery(normalizedFilters);
    const usersCollection = db.collection("users");
    const [rows, total] = await Promise.all([
        usersCollection
            .find(query, { projection: { passwordHash: 0 } })
            .sort({ createdAt: -1, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        usersCollection.countDocuments(query),
    ]);

    return {
        users: rows.map((user) => ({
            ...toPublicUser(user),
            accountStatus: user.accountStatus ?? "active",
        })),
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
}

/**
 * Atualiza role ou estado de uma conta através de administrador.
 *
 * @param {string} actorUserId Id do administrador autenticado.
 * @param {string} targetUserId Id da conta alvo.
 * @param {{ role?: unknown, accountStatus?: unknown }} input Dados recebidos.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido HTTP.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Utilizador atualizado.
 */
export async function updateUserByAdmin(
    actorUserId,
    targetUserId,
    input,
    context = {},
) {
    const update = assertAdminUserUpdate(input);
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

    return runInTransaction(async ({ db, session }) => {
        const users = db.collection("users");
        const before = await users.findOne(
            { _id: targetObjectId, accountStatus: { $ne: "deleted" } },
            { session },
        );

        if (!before) {
            throw new HttpError(404, "Utilizador não encontrado.");
        }

        const beforeSnapshot = {
            role: before.role,
            accountStatus: before.accountStatus ?? "active",
            status: before.status ?? "active",
        };

        if (removesActiveAdmin(before, update)) {
            const now = new Date();

            // Duas remoções concorrentes escrevem o mesmo documento e
            // não conseguem confirmar ambas com uma contagem obsoleta.
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
                    "A operação removeria o último administrador ativo.",
                    undefined,
                    "LAST_ACTIVE_ADMIN",
                );
            }
        }

        const now = new Date();
        const user = await users.findOneAndUpdate(
            { _id: targetObjectId, accountStatus: { $ne: "deleted" } },
            { $set: { ...update, updatedAt: now } },
            { returnDocument: "after", session },
        );

        if (!user) {
            throw new HttpError(409, "O utilizador foi alterado em concorrência.");
        }

        if (update.accountStatus === "blocked") {
            await db.collection("sessions").deleteMany(
                { userId: targetObjectId },
                { session },
            );
        }

        const afterSnapshot = {
            role: user.role,
            accountStatus: user.accountStatus ?? "active",
        };

        await writeAdminAudit({
            db,
            session,
            actorUserId: actorObjectId,
            action: "user.admin_update",
            targetType: "user",
            targetId: targetObjectId,
            before: beforeSnapshot,
            after: afterSnapshot,
            requestId: context.requestId,
            metadata: { changedFields: Object.keys(update).sort() },
        });

        return toPublicUser(user);
    });
}
```

5. Explicação do código.

`buildAdminUserQuery` permite filtros simples sem expor campos internos e só usa valores normalizados por `assertAdminUserFilters`. `listUsers` conta e lê a mesma query, aplica `skip/limit`, ordena por `createdAt: -1, _id: 1` para estabilidade e devolve o envelope `{ users, page, limit, total, totalPages }`. A pesquisa passa a ser literal, mesmo que o admin escreva caracteres como `.*`, e o filtro de estado fica preso à lista `active`/`blocked`.

`updateUserByAdmin` protege contra auto-despromoção, auto-bloqueio e remoção do
último admin ativo. Quando o estado passa a `blocked`, elimina todas as sessões
do alvo. O update, a revogação e `user.admin_update` partilham a mesma transação;
uma falha tardia no audit reverte também o estado e as sessões. `updateUserRole`
fica apenas para compatibilidade e delega neste fluxo.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/modules/users/user.service.js').then(({ listUsers, updateUserByAdmin }) => console.log(typeof listUsers, typeof updateUserByAdmin))"
```

O resultado esperado é `function function`.

7. Cenário negativo/erro esperado.

Se um admin tentar alterar a própria role para `user`, o backend devolve `400`.
Se tentar despromover ou bloquear o último admin ativo, devolve `409` com
`code: "LAST_ACTIVE_ADMIN"`. Duas remoções concorrentes devem deixar pelo menos
um admin operacional.

### Passo 3 - Atualizar controller e rotas admin

1. Objetivo funcional do passo no contexto da app.

Ligar filtros e atualização administrativa à API.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/users/user.controller.js`
    - EDITAR: `backend/src/modules/users/user.routes.js`
    - LOCALIZAÇÃO: funções e rotas admin

3. Instruções do que fazer.

Atualiza `getUsers` para passar `req.query` e cria `patchUserAdmin`. No import do topo de `user.controller.js`, mantém os exports antigos e acrescenta `updateUserByAdmin`, evitando remover `updateUserRole` enquanto `patchUserRole` continuar disponível para compatibilidade.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/users/user.controller.js
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
    return res.status(200).json(await listUsers(req.query));
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
        user: await updateUserByAdmin(req.user.id, req.params.id, req.body, {
            requestId: req.id,
        }),
    });
}
```

```js
// backend/src/modules/users/user.routes.js
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

A rota antiga `/:id/role` pode continuar para compatibilidade local, mas deve
delegar no mesmo service transacional. A rota nova é o contrato deste BK porque
permite role e estado no mesmo endpoint. O controller propaga `req.id` para
correlacionar a mutação com o audit log. O backend continua a exigir admin.

6. Validação do passo.

Com sessão admin, chama
`GET /api/users?search=ana&status=active&page=1&limit=20` e confirma que a
resposta é `{ users, page, limit, total, totalPages }`.

7. Cenário negativo/erro esperado.

Com utilizador normal, `PATCH /api/users/:id/admin` deve devolver `403`.

### Passo 4 - Atualizar API e página admin no frontend

1. Objetivo funcional do passo no contexto da app.

Dar ao administrador uma UI para procurar e alterar utilizadores.

2. Ficheiros envolvidos:
    - EDITAR: `frontend/src/services/api/userApi.js`
    - EDITAR: `frontend/src/pages/AdminUsersPage.jsx`
    - LOCALIZAÇÃO: cliente API e componente completo

3. Instruções do que fazer.

Substitui o método `listUsers` já criado em `BK-MF2-02` pela versão abaixo e
acrescenta `updateUserAdmin` uma única vez depois de `updateRole`. Não mantenhas
duas propriedades `listUsers` no mesmo objeto. Depois substitui a página pela
versão completa, que implementa o contrato vinculativo sem depender de adendos.

4. Código-base didático; aplicar obrigatoriamente o contrato vinculativo acima.

O primeiro método substitui a propriedade `listUsers` existente; o segundo é
inserido no objeto `userApi`. O recorte não é um módulo JavaScript autónomo:

```text
// frontend/src/services/api/userApi.js
listUsers(filters = {}, options = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));

    const query = params.toString();
    return apiClient.get(`/api/users${query ? `?${query}` : ""}`, options);
},

updateUserAdmin(userId, input, options = {}) {
    return apiClient.patch(
        `/api/users/${encodeURIComponent(userId)}/admin`,
        input,
        options,
    );
},
```

```jsx
// frontend/src/pages/AdminUsersPage.jsx
import { useEffect, useRef, useState } from "react";
import { userApi } from "../services/api/userApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const ROLES = ["user", "moderator", "admin"];
const STATUSES = ["active", "blocked"];
const PAGE_LIMIT = 20;
const ROLE_LABELS = {
    user: "Utilizador",
    moderator: "Moderador",
    admin: "Administrador",
};
const STATUS_LABELS = {
    active: "Ativa",
    blocked: "Bloqueada",
};

/**
 * Página admin para gestão operacional de utilizadores.
 *
 * @returns {JSX.Element} Tabela admin com filtros e ações.
 */
export function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [appliedFilters, setAppliedFilters] = useState({ search: "", status: "" });
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [busyIds, setBusyIds] = useState(() => new Set());
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const contextVersionRef = useRef(0);
    const readControllerRef = useRef(null);
    const mutationControllersRef = useRef(new Map());
    const reservationsRef = useRef(new Set());

    useEffect(() => {
        const contextVersion = ++contextVersionRef.current;
        const controller = new AbortController();
        readControllerRef.current?.abort();
        readControllerRef.current = controller;
        for (const mutationController of mutationControllersRef.current.values()) {
            mutationController.abort();
        }
        mutationControllersRef.current.clear();
        reservationsRef.current.clear();
        setBusyIds(new Set());
        setLoading(true);
        setError("");

        userApi.listUsers({
            ...appliedFilters,
            page,
            limit: PAGE_LIMIT,
        }, { signal: controller.signal }).then((response) => {
            if (controller.signal.aborted || contextVersion !== contextVersionRef.current) return;
            setUsers(response.users);
            setPagination({
                page: response.page,
                total: response.total,
                totalPages: response.totalPages,
            });
        }).catch((requestError) => {
            if (controller.signal.aborted || requestError?.code === "REQUEST_ABORTED") return;
            if (contextVersion !== contextVersionRef.current) return;
            setError(toUserMessage(requestError));
        }).finally(() => {
            if (!controller.signal.aborted && contextVersion === contextVersionRef.current) {
                setLoading(false);
            }
        });

        return () => controller.abort();
    }, [appliedFilters, page, reloadVersion]);

    useEffect(() => () => {
        contextVersionRef.current += 1;
        readControllerRef.current?.abort();
        for (const controller of mutationControllersRef.current.values()) {
            controller.abort();
        }
        mutationControllersRef.current.clear();
        reservationsRef.current.clear();
    }, []);

    /**
     * Atualiza role ou estado de um utilizador.
     *
     * @param {string} userId Id do utilizador alvo.
     * @param {Record<string, string>} input Alteração a enviar.
     * @returns {Promise<void>} Termina quando a linha é atualizada.
     */
    async function updateUser(userId, input) {
        if (reservationsRef.current.has(userId)) return;
        const currentUser = users.find((user) => user.id === userId);
        if (!currentUser) return;
        const [field, nextValue] = Object.entries(input)[0] ?? [];
        const nextLabel = field === "role"
            ? ROLE_LABELS[nextValue]
            : STATUS_LABELS[nextValue];
        const confirmed = window.confirm(
            `Alterar ${currentUser.name} para ${nextLabel}? Esta ação altera permissões ou acesso à conta.`,
        );
        if (!confirmed) return;

        const contextVersion = contextVersionRef.current;
        const controller = new AbortController();
        reservationsRef.current.add(userId);
        mutationControllersRef.current.set(userId, controller);
        setBusyIds((current) => new Set(current).add(userId));
        setError("");
        setStatus("");

        try {
            const response = await userApi.updateUserAdmin(userId, input, {
                signal: controller.signal,
            });
            if (controller.signal.aborted || contextVersion !== contextVersionRef.current) return;
            setUsers((current) =>
                current.map((user) =>
                    user.id === userId ? response.user : user,
                ),
            );
            setStatus("Utilizador atualizado.");
        } catch (requestError) {
            if (controller.signal.aborted || requestError?.code === "REQUEST_ABORTED") return;
            if (contextVersion !== contextVersionRef.current) return;
            setError(toUserMessage(requestError));
        } finally {
            if (mutationControllersRef.current.get(userId) === controller) {
                mutationControllersRef.current.delete(userId);
                reservationsRef.current.delete(userId);
            }
            if (contextVersion === contextVersionRef.current) {
                setBusyIds((current) => {
                    const next = new Set(current);
                    next.delete(userId);
                    return next;
                });
            }
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
                    setPage(1);
                    setAppliedFilters({ search: search.trim(), status: statusFilter });
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
                            <option key={item} value={item}>{STATUS_LABELS[item]}</option>
                        ))}
                    </select>
                </label>
                <button type="submit" disabled={loading}>Aplicar filtros</button>
            </form>
            {loading ? <p role="status">A carregar utilizadores...</p> : null}
            {error ? (
                <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
                    Tentar novamente
                </button>
            ) : null}
            {!loading && users.length === 0 ? <p>Nenhum utilizador encontrado.</p> : null}
            {!loading ? <p>{pagination.total} utilizadores.</p> : null}
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
                            <tr key={user.id} aria-busy={busyIds.has(user.id)}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        disabled={busyIds.has(user.id)}
                                        onChange={(event) => updateUser(user.id, { role: event.target.value })}
                                    >
                                        {ROLES.map((role) => (
                                            <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        value={user.accountStatus ?? "active"}
                                        disabled={busyIds.has(user.id)}
                                        onChange={(event) => updateUser(user.id, { accountStatus: event.target.value })}
                                    >
                                        {STATUSES.map((item) => (
                                            <option key={item} value={item}>{STATUS_LABELS[item]}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {!loading && pagination.totalPages > 1 ? (
                <nav aria-label="Paginação de utilizadores">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                    >
                        Anterior
                    </button>
                    <span>Página {pagination.page} de {pagination.totalPages}</span>
                    <button
                        type="button"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
                    >
                        Seguinte
                    </button>
                </nav>
            ) : null}
        </section>
    );
}
```

5. Explicação do código.

A página final acrescenta à base acima paginação, confirmação, `AbortController`,
proteção anti-stale, busy state por linha e rótulos PT-PT. Cada alteração chama
o backend admin; a UI não altera permissões localmente sem resposta da API.

6. Validação do passo.

Entrando como admin, abre `/admin/utilizadores`, filtra por email e altera o estado de um utilizador. A tabela deve atualizar a linha.

7. Cenário negativo/erro esperado.

Se tentares aceder com utilizador sem role admin, o backend devolve `403` e a página mostra a mensagem de erro.

### Passo 5 - Testar validação admin

1. Objetivo funcional do passo no contexto da app.

Provar que roles, estados e filtros fora do contrato são rejeitados e que as
operações multi-write não deixam estado parcial.

2. Ficheiros envolvidos:
    - CRIAR: `backend/tests/unit/mf5-admin-users.validation.test.js`
    - CRIAR/EDITAR: `backend/tests/unit/f3-admin-transactions.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o teste de validação abaixo. No teste transacional, reutiliza o harness de
DB in-memory do projeto e cobre obrigatoriamente: rollback quando o audit falha,
bloqueio com revogação de sessões e audit no mesmo commit, e duas remoções
concorrentes que preservam um admin ativo. O harness é infraestrutura de teste;
não substitui estes três asserts de comportamento.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf5-admin-users.validation.test.js
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
    assert.deepEqual(
        assertAdminUserFilters({
            search: "ana.*",
            status: "active",
            page: "2",
            limit: "50",
        }),
        {
            page: 2,
            limit: 50,
            search: "ana\\.\\*",
            status: "active",
        },
    );

    assert.throws(() => assertAdminUserUpdate({ role: "owner" }), /Role/);
    assert.throws(
        () => assertAdminUserUpdate({ accountStatus: "archived" }),
        /Estado/,
    );
    assert.throws(() => assertAdminUserUpdate({}), /Indica/);
    assert.throws(() => assertAdminUserFilters({ status: "deleted" }), /estado/);
    assert.throws(() => assertAdminUserFilters({ page: "0" }), /page/);
    assert.throws(() => assertAdminUserFilters({ limit: "51" }), /limit/);
});
```

5. Explicação do código.

O teste cobre caso válido, pesquisa literal escapada, paginação normalizada, role inválida, estado inválido, pedido vazio, página zero e limite acima de 50. Isto protege a fronteira do endpoint e impede que a listagem admin aceite filtros fora do contrato.

6. Validação do passo.

Executa:

```bash
cd backend
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
- A invariante do último admin conta apenas `role: admin` com
  `accountStatus` ausente/`active` e `status` ausente/`active`; admins
  `blocked`, `inactive`, `deleted`, desconhecidos ou com `null` em qualquer
  campo não contam. Um documento legacy sem ambos os campos continua ativo.
- Admin não consegue retirar o próprio acesso admin.
- Admin não consegue bloquear a própria conta.
- Bloquear uma conta revoga todas as sessões dessa conta na mesma transação.
- Despromover ou bloquear o último admin ativo devolve `409 LAST_ACTIVE_ADMIN`;
  duas remoções concorrentes deixam pelo menos um admin ativo.
- Um segundo admin `inactive` ou com estado desconhecido não satisfaz a
  invariante: remover o único admin autenticável continua a devolver `409`.
- Ações ficam registadas em `admin_audit_logs` como `user.admin_update`, com
  apenas role/estado antes e depois, campos alterados e `requestId`.
- O evento não persiste email, telefone, contactos nem snapshots pessoais
  integrais do utilizador; a sanitização recursiva funciona como defesa adicional.
- Uma falha do audit reverte o update e a revogação de sessões.
- Frontend mostra loading, erro, vazio, filtros e atualização por linha.
- O envelope inclui metadata, limita a página a 50 e mantém ordenação estável.
- A UI confirma papel/estado, repõe o select se houver cancelamento, bloqueia só
  a linha ativa e cancela/ignora pedidos antigos.

#### Validação final

Executa:

```bash
cd backend
node --test tests/unit/mf5-admin-users.validation.test.js
node --test tests/unit/f3-admin-transactions.test.js
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
- `neg`: último admin ativo devolve `409 LAST_ACTIVE_ADMIN`.
- `neg`: fault injection no audit deixa utilizador e sessões inalterados.

#### Handoff

`BK-MF5-05` vai consumir esta base admin para criar métricas restritas a administradores. `BK-MF5-06` também depende desta autorização para configurar integrações operacionais.

#### Changelog

- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com filtros admin, estado de conta, auditoria, frontend e testes.
- `2026-07-10`: paths normalizados para `backend/`/`frontend/`; update admin,
  revogação de sessões, audit com `requestId` e proteção do último admin passam
  a formar uma unidade transacional testada sob falha e concorrência.
- `2026-07-10`: snapshots de audit administrativo minimizados a role, estado e
  campos alterados, sem email, telefone ou documento pessoal integral.
- `2026-07-10`: listagem e painel sincronizados com metadata paginada,
  `limit <= 50`, confirmação, cancelamento/anti-stale, busy por linha e PT-PT.
- `2026-07-10`: roster do último admin alinhado ao login fail-closed; contas
  inativas ou com estado desconhecido deixam de contar como admins operacionais.
