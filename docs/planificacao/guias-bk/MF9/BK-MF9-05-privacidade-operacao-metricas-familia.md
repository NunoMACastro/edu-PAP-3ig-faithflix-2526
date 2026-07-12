# BK-MF9-05 - Privacidade, operação e métricas com família

## Header

- `doc_id`: `GUIA-BK-MF9-05`
- `bk_id`: `BK-MF9-05`
- `macro`: `MF9`
- `owner`: `Davi`
- `apoio`: `Kaue`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF9-03,BK-MF9-04`
- `rf_rnf`: `RF55, RF56, RF59, RF62, RNF17, RNF19, RNF30`
- `fase_documental`: `Fase 3`
- `sprint`: `S13`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF9-06`
- `guia_path`: `docs/planificacao/guias-bk/MF9/BK-MF9-05-privacidade-operacao-metricas-familia.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais fechar o impacto de privacidade e operação da partilha familiar. As memberships criadas em `BK-MF9-03` e usadas na UI em `BK-MF9-04` passam a entrar na exportação de dados, na eliminação de conta e nas métricas administrativas agregadas.

No fim, um utilizador autenticado consegue exportar as partilhas familiares em que participa, eliminar a sua conta sem deixar convites ou memberships abertas, e um admin consegue consultar contagens familiares sem ver nomes, emails ou identificadores pessoais de membros.

#### Importância

`CANONICO`: `RF55` e `RF56` exigem exportação e eliminação de dados do utilizador. A partilha familiar acrescenta novos dados pessoais: owner, membro, email convidado, estado da membership e datas do ciclo de vida. Se esses dados ficarem fora do ciclo RGPD, a app parece funcional, mas fica incompleta do ponto de vista legal e pedagógico.

`CANONICO`: `RF59` cobre métricas administrativas. Essas métricas servem para operar a plataforma, não para investigar famílias individualmente. Por isso, o painel admin deve contar memberships ativas e convites pendentes, mas não deve listar emails, nomes ou IDs pessoais.

Este BK também protege a pool solidária. Um membro familiar recebe acesso premium por extensão do plano Família do owner, mas não representa um pagamento. A distribuição solidária nasce apenas de tentativas financeiras v2 aprovadas e não estimadas no mês UTC fechado, nunca das memberships nem do estado atual da subscrição.

#### Scope-in

- Exportar memberships em que o utilizador autenticado é owner ou membro.
- Invalidar memberships `pending` e `active` quando uma conta é eliminada.
- Preservar o último admin ativo e executar a eliminação numa transação única.
- Remover outbox de reset e PII facultativa do ledger financeiro retido.
- Expor `familyMembershipsUpdated` no resultado operacional da eliminação.
- Acrescentar contagens familiares agregadas ao painel admin.
- Garantir que métricas não expõem emails, nomes ou IDs pessoais de membros.
- Rever que a pool solidária continua baseada em pagamentos v2 aprovados, não estimados e pertencentes ao mês fechado.
- Criar teste unitário para exportação e invalidação familiar.

#### Scope-out

- Auditoria externa ou relatório legal avançado.
- Retenção legal avançada.
- Novo painel detalhado de famílias por admin.
- Novos relatórios financeiros.
- Alterações à UI de gestão familiar criada em `BK-MF9-04`.
- Alterações ao modelo base de convites criado em `BK-MF9-03`.

#### Estado antes e depois

- Antes: os fluxos de privacidade e métricas conhecem utilizadores, subscrições, comentários, consentimentos, notificações e pedidos RGPD, mas não incluem memberships familiares.
- Depois: as memberships familiares entram na exportação RGPD, são invalidadas na eliminação de conta e aparecem em métricas apenas como contagens agregadas.

#### Pré-requisitos

- `BK-MF9-03` completo, com a coleção `subscription_family_memberships`, estados `pending`, `active`, `declined`, `removed` e `left`, e regras de owner/membro.
- `BK-MF9-04` completo, com convites familiares criados e alterados pela UI.
- `BK-MF1-04` completo, com `runInTransaction` fail-closed e propagação de
  `session` em operações críticas.
- `BK-MF5-01` completo, com `buildUserDataExport(userId)`.
- `BK-MF5-02` completo, com `deleteMyAccount(userId, input)`.
- `BK-MF5-04` revisto, com o invariante do último admin operacional.
- `BK-MF5-05` completo, com `getAdminMetrics(query)`.
- Ler `RF55`, `RF56`, `RF59`, `RF62`, `RNF17`, `RNF19` e `RNF30`.
- Rever `backend/src/modules/privacy/privacy.service.js`.
- Rever `backend/src/modules/admin-metrics/admin-metrics.service.js`.
- Rever `backend/src/modules/charities/pool-distribution.service.js`.

#### Glossário

- `Exportação RGPD`: resposta com os dados pessoais que a app guarda sobre o utilizador autenticado.
- `Eliminação de conta`: fluxo que anonimiza a conta, remove dados pessoais operacionais e invalida acessos que já não podem continuar ativos.
- `Métrica agregada`: número operacional que não identifica pessoas individuais.
- `Membership familiar`: relação entre owner e membro familiar criada em `BK-MF9-03`.
- `Minimização de dados`: princípio de mostrar apenas o dado necessário para a finalidade do ecrã ou endpoint.
- `Trilho operacional`: informação mínima que explica que uma operação aconteceu, sem manter acesso indevido.

#### Conceitos teóricos essenciais

Uma membership familiar é um dado relacional: pertence ao owner que convida e ao membro que aceita ou recebe o convite. Por isso, a exportação deve incluir memberships onde o utilizador aparece em `ownerUserId` ou `memberUserId`.

Eliminar uma conta não pode deixar uma membership aberta. Se o owner for eliminado, os membros deixam de poder depender daquele plano. Se o membro for eliminado, o owner não deve continuar a ver uma vaga ocupada por uma conta apagada. `DERIVADO`: usar `status: "removed"` com `removedReason: "account_deleted"` remove o acesso e preserva um trilho operacional mínimo.

Métricas admin não são listagens de pessoas. O admin precisa de perceber se a funcionalidade familiar está a ser usada, mas não precisa de ver emails de convidados. O endpoint deve devolver números como `familyMembers` e `familyInvitationsPending`.

`RNF17` protege dados sensíveis e segredos; neste BK, a regra prática é não exportar passwords, tokens, cookies ou secrets. `RNF19` exige rastreabilidade em operações críticas; neste BK, a eliminação de conta regista `privacy_deletion_requests`. `RNF30` exige operação diagnosticável; neste BK, as métricas dão contexto agregado sem expor dados pessoais.

A pool solidária é financeira. Ela usa snapshots de `payment_attempts` elegíveis: `schemaVersion: 2`, `status: "approved"`, `accountingEstimate: false` e `approvedAt` dentro do mês UTC fechado. Uma membership familiar é acesso derivado, não pagamento adicional. Legacy/backfill estimado fica excluído para não apresentar reconstrução histórica como valor cobrado exato.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Privacidade | `backend/src/modules/privacy/privacy.service.js` | Preserva export, invalida memberships, limpa outbox e pseudonimiza o ledger na mesma transação. |
| Invariante admin | `backend/src/modules/users/admin-invariant.service.js` | Serializa a eliminação de admins e preserva pelo menos um admin ativo. |
| Privacidade HTTP | `backend/src/modules/privacy/privacy.controller.js` e `backend/src/modules/privacy/privacy.routes.js` | Expõem `GET /api/privacy/export` e `DELETE /api/privacy/account` com sessão autenticada. |
| Métricas | `backend/src/modules/admin-metrics/admin-metrics.service.js` | Conta memberships ativas e convites pendentes sem dados pessoais. |
| Métricas HTTP | `backend/src/modules/admin-metrics/admin-metrics.controller.js` e `backend/src/modules/admin-metrics/admin-metrics.routes.js` | Expõem `GET /api/admin/metrics` apenas para admin. |
| Pool solidária | `backend/src/modules/charities/pool-distribution.service.js` | Confirma que a distribuição usa pagamentos v2 elegíveis, não memberships ou subscrições atuais. |
| Testes | `backend/tests/unit/mf9-subscriptions.test.js` | Prova exportação e invalidação familiar sem servidor HTTP. |
| Handoff | `BK-MF9-06` | Usa estes resultados no gate final da MF9. |

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/privacy/privacy.service.js`
- CRIAR/EDITAR: `backend/src/modules/users/admin-invariant.service.js`
- EDITAR: `backend/src/modules/admin-metrics/admin-metrics.service.js`
- EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`
- REVER: `backend/src/modules/privacy/privacy.controller.js`
- REVER: `backend/src/modules/privacy/privacy.routes.js`
- REVER: `backend/src/modules/admin-metrics/admin-metrics.controller.js`
- REVER: `backend/src/modules/admin-metrics/admin-metrics.routes.js`
- REVER: `backend/src/modules/charities/pool-distribution.service.js`
- REVER: `backend/src/modules/subscriptions/subscriptions.service.js`

#### Tutorial técnico linear

### Passo 1 - Mapear dados familiares no ciclo RGPD

1. Objetivo funcional do passo no contexto da app.

Identificar que campos da membership familiar são dados pessoais e decidir em que fluxo entram.

2. Ficheiros envolvidos.
    - EDITAR: nenhum ficheiro neste passo.
    - REVER: `backend/src/modules/subscriptions/subscriptions.service.js`
    - REVER: `backend/src/modules/privacy/privacy.service.js`
    - LOCALIZAÇÃO: modelo lógico de `subscription_family_memberships` criado em `BK-MF9-03`.

3. Instruções do que fazer.

Revê a estrutura de `subscription_family_memberships` e classifica estes campos:

- `ownerUserId`: dado pessoal por ligação à conta owner.
- `memberUserId`: dado pessoal por ligação à conta membro.
- `invitedEmail`: dado pessoal enquanto o convite existir.
- `status`: dado operacional que indica se há acesso ativo, convite pendente ou acesso fechado.
- `invitedAt`, `acceptedAt`, `declinedAt`, `removedAt`, `leftAt`, `createdAt`, `updatedAt`: datas de ciclo de vida que explicam a operação.

4. Código completo, correto e integrado com a app final.

Sem código neste passo.

Este passo é analítico: evita escrever exportação e eliminação antes de saber
que dados são pessoais.

5. Explicação do código.

Não há código porque o objetivo é tomar uma decisão de privacidade. O erro a evitar é tratar memberships como dados puramente técnicos. Elas ligam pessoas reais e precisam de exportação, eliminação controlada e métricas minimizadas.

6. Validação do passo.

Confirma que `ownerUserId`, `memberUserId` e `invitedEmail` aparecem no plano de exportação ou de invalidação. Confirma também que métricas não vão devolver estes campos.

7. Cenário negativo/erro esperado.

Se `invitedEmail` ficar fora da exportação, o utilizador não consegue ver um dado pessoal que a app guardou. Isso falha `RF55`.

### Passo 2 - Exportar memberships familiares

1. Objetivo funcional do passo no contexto da app.

Incluir na exportação RGPD memberships onde o utilizador autenticado é owner ou membro.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/privacy/privacy.service.js`
    - LOCALIZAÇÃO: função completa `exportFamilyMemberships` e função completa `buildUserDataExport`.

3. Instruções do que fazer.

No ficheiro de privacidade, adiciona `exportFamilyMemberships` depois de `exportOwnedCollection`. Depois substitui a função `buildUserDataExport` pela versão completa abaixo. Mantém as funções auxiliares anteriores de `BK-MF5-01`, como `asUserObjectId`, `toExportValue`, `toExportableUser` e `exportOwnedCollection`.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/privacy/privacy.service.js
/**
 * Exporta partilhas familiares em que o utilizador autenticado participa.
 *
 * A membership pode pertencer ao utilizador como owner ou como membro, por isso
 * o filtro usa `$or` em vez de consultar apenas um campo `userId`.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador autenticado.
 * @returns {Promise<Record<string, unknown>[]>} Memberships familiares exportáveis.
 */
async function exportFamilyMemberships(db, userObjectId) {
    const rows = await db
        .collection("subscription_family_memberships")
        .find({
            $or: [
                { ownerUserId: userObjectId },
                { memberUserId: userObjectId },
            ],
        })
        .sort({ createdAt: -1 })
        .toArray();

    // Reutiliza o mesmo serializador da exportação RGPD para remover chaves sensíveis.
    return rows.map(toExportValue);
}

/**
 * Gera a exportação RGPD do utilizador autenticado.
 *
 * @param {string} userId Id vindo de `req.user.id`.
 * @returns {Promise<{ generatedAt: string, user: Record<string, unknown>, sections: Record<string, Record<string, unknown>[]> }>} Exportação completa.
 * @throws {HttpError} Quando a conta não existe.
 */
export async function buildUserDataExport(userId) {
    const db = await getDb();
    const userObjectId = asUserObjectId(userId);
    const user = await db.collection("users").findOne({ _id: userObjectId });

    if (!user) {
        throw new HttpError(404, "Utilizador não encontrado.");
    }

    const entries = await Promise.all(
        USER_EXPORT_COLLECTIONS.map(async (collectionName) => [
            collectionName,
            await exportOwnedCollection(db, collectionName, userObjectId),
        ]),
    );
    const sections = Object.fromEntries(entries);

    // A secção familiar fica fora de USER_EXPORT_COLLECTIONS porque não usa só `userId`.
    sections.subscription_family_memberships = await exportFamilyMemberships(db, userObjectId);

    return {
        generatedAt: new Date().toISOString(),
        user: toExportableUser(user),
        sections,
    };
}
```

5. Explicação do código.

`exportFamilyMemberships` consulta a coleção familiar com `$or`, porque o mesmo utilizador pode aparecer como owner ou como membro. A função não aceita `userId` vindo do frontend: o `userObjectId` já vem da sessão autenticada através de `buildUserDataExport`.

`toExportValue` continua a ser usado para converter `ObjectId` e `Date` para valores serializáveis e para remover chaves sensíveis. Isto preserva o contrato de `BK-MF5-01` e evita criar uma exportação familiar com formato diferente das restantes secções.

A nova secção chama-se `subscription_family_memberships` para coincidir com a coleção e facilitar a defesa técnica. O próximo BK (`BK-MF9-06`) consegue validar esta secção diretamente no gate final.

6. Validação do passo.

Com uma membership ativa, chama `GET /api/privacy/export` autenticado como owner. Expected result: `200 OK` com `export.sections.subscription_family_memberships` a incluir uma linha. Repete como membro. Expected result: a mesma secção aparece para o membro.

7. Cenário negativo/erro esperado.

Sem sessão autenticada, o endpoint deve rejeitar antes de chegar ao service. Expected result: `401 Unauthorized` ou o erro de autenticação já usado pela app.

### Passo 3 - Invalidar memberships na eliminação de conta

1. Objetivo funcional do passo no contexto da app.

Impedir que convites ou partilhas continuem abertas depois de uma conta ser eliminada.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/privacy/privacy.service.js`
    - CRIAR/EDITAR: `backend/src/modules/users/admin-invariant.service.js`
    - LOCALIZAÇÃO: import do invariante admin, helpers de cancelamento,
      memberships e pseudonimização financeira, e função completa
      `deleteMyAccount`.

3. Instruções do que fazer.

Preserva integralmente `buildUserDataExport`, os helpers de exportação e a
eliminação base criados em MF5. Acrescenta o import do invariante do último
admin e cria explicitamente os três helpers abaixo; não assumes que
`cancelSubscriptionsForDeletedAccount` existe. Depois substitui apenas
`deleteMyAccount` pela versão completa composta. `runInTransaction` já foi
criado na fundação `BK-MF1-04`; todas as leituras/escritas que decidem ou alteram
o estado da eliminação usam a `session` recebida pela callback.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/users/admin-invariant.service.js
import { HttpError } from "../../utils/http-error.js";

/**
 * Indica se a conta conta como administrador capaz de iniciar sessão.
 *
 * @param {{ role?: string, accountStatus?: string, status?: string }} user Utilizador observado.
 * @returns {boolean} Verdadeiro apenas para um admin operacional.
 */
export function isActiveAdmin(user) {
    const accountStatusAllowsLogin = user?.accountStatus === undefined ||
        user.accountStatus === "active";
    const legacyStatusAllowsLogin = user?.status === undefined ||
        user.status === "active";

    return user?.role === "admin" &&
        accountStatusAllowsLogin &&
        legacyStatusAllowsLogin;
}

/**
 * Serializa remoções de admins e recusa a transição de um para zero.
 *
 * @param {{ db: import("mongodb").Db, session: import("mongodb").ClientSession, user: object, now?: Date }} input Contexto transacional.
 * @returns {Promise<void>} Termina quando o invariante continua satisfeito.
 */
export async function assertAnotherActiveAdminRemains(input) {
    if (!isActiveAdmin(input.user)) return;
    const now = input.now instanceof Date ? input.now : new Date();

    // O write-conflict no roster impede duas eliminações concorrentes de
    // aprovarem a mesma contagem antiga de administradores.
    await input.db.collection("admin_invariants").updateOne(
        { _id: "active-admin-roster" },
        {
            $inc: { revision: 1 },
            $set: { updatedAt: now },
            $setOnInsert: { createdAt: now },
        },
        { upsert: true, session: input.session },
    );
    const activeAdminCount = await input.db.collection("users").countDocuments(
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
        { session: input.session },
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
```

```js
// backend/src/modules/privacy/privacy.service.js
// MANTER todos os imports de MF5 (incluindo consentimentos) e ADICIONAR só este:
import { assertAnotherActiveAdminRemains } from "../users/admin-invariant.service.js";

// Os imports existentes já fornecem ObjectId, getDb, runInTransaction,
// HttpError, verifyPassword, assertDeleteAccountPayload e helpers de consentimento.
// MANTER `buildUserDataExport` e todo o código anterior de MF5 neste ficheiro.

/**
 * Cancela subscrições operacionais sem apagar o histórico financeiro.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador eliminado.
 * @param {import("mongodb").ClientSession} session Sessão transacional comum.
 * @returns {Promise<number>} Número de subscrições canceladas.
 */
async function cancelSubscriptionsForDeletedAccount(db, userObjectId, session) {
    const result = await db.collection("subscriptions").updateMany(
        { userId: userObjectId },
        {
            $set: {
                status: "canceled",
                cancelAtPeriodEnd: true,
                accountDeleted: true,
                updatedAt: new Date(),
            },
            // O ledger permanece; contactos facultativos deixam de identificar a conta.
            $unset: { contactEmail: "", customerEmail: "" },
        },
        { session },
    );

    return result.modifiedCount ?? 0;
}

/**
 * Invalida convites e partilhas familiares associados a uma conta eliminada.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador.
 * @param {string} userEmail Email observado antes da anonimização.
 * @param {import("mongodb").ClientSession} session Sessão transacional comum.
 * @returns {Promise<number>} Número de memberships atualizadas.
 */
async function invalidateFamilyMembershipsForDeletedAccount(
    db,
    userObjectId,
    userEmail,
    session,
) {
    const identityFilter = {
        $or: [
            { ownerUserId: userObjectId },
            { memberUserId: userObjectId },
            { invitedEmail: userEmail },
        ],
    };
    const memberships = db.collection("subscription_family_memberships");
    const result = await memberships.updateMany(
        {
            ...identityFilter,
            status: { $in: ["pending", "active"] },
        },
        {
            $set: {
                status: "removed",
                removedReason: "account_deleted",
                removedAt: new Date(),
                updatedAt: new Date(),
            },
        },
        { session },
    );
    await memberships.updateMany(
        identityFilter,
        {
            $unset: {
                invitedEmail: "",
                contactEmail: "",
            },
        },
        { session },
    );

    return result.modifiedCount ?? 0;
}

/**
 * Mantém o ledger financeiro obrigatório e remove contactos facultativos.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador eliminado.
 * @param {import("mongodb").ClientSession} session Sessão transacional comum.
 * @returns {Promise<number>} Número de registos financeiros pseudonimizados.
 */
async function scrubRetainedFinancialRecords(db, userObjectId, session) {
    const result = await db.collection("payment_attempts").updateMany(
        { userId: userObjectId },
        {
            $set: { accountDeleted: true, updatedAt: new Date() },
            // Montantes/snapshots ficam imutáveis; só PII facultativa é removida.
            $unset: {
                email: "",
                customerEmail: "",
                payerEmail: "",
            },
        },
        { session },
    );

    return result.modifiedCount ?? 0;
}

/**
 * Elimina a própria conta com confirmação forte e limpeza controlada.
 *
 * @param {string} userId Id vindo da sessão.
 * @param {Record<string, unknown>} input Pedido recebido do frontend.
 * @returns {Promise<{ deleted: true, removed: Record<string, number>, commentsAnonymized: number, subscriptionsCanceled: number, familyMembershipsUpdated: number }>} Resultado operacional.
 */
export async function deleteMyAccount(userId, input) {
    const { password } = assertDeleteAccountPayload(input);
    const userObjectId = asUserObjectId(userId);

    return runInTransaction(async ({ db, session }) => {
        const currentUser = await db.collection("users").findOne(
            { _id: userObjectId },
            { session },
        );

        if (!currentUser?.passwordHash) {
            throw new HttpError(404, "Utilizador não encontrado.");
        }

        if (!(await verifyPassword(password, currentUser.passwordHash))) {
            throw new HttpError(
                403,
                "Password atual incorreta.",
                undefined,
                "CURRENT_PASSWORD_INVALID",
            );
        }

        // A segunda leitura funciona como CAS sobre o hash observado.
        const user = await db.collection("users").findOne(
            { _id: userObjectId, passwordHash: currentUser.passwordHash },
            { session },
        );

        if (!user || ["blocked", "deleted"].includes(user.accountStatus)) {
            throw new HttpError(
                409,
                "A conta mudou durante o pedido. Tenta novamente.",
                undefined,
                "ACCOUNT_STATE_CHANGED",
            );
        }

        const now = new Date();
        await assertAnotherActiveAdminRemains({
            db,
            session,
            user,
            now,
        });

        // A outbox PAP referencia apenas ids. Captura os ids antes de eliminar
        // password_reset_tokens; nunca filtra por email nem pelo token opaco.
        const resetTokenRows = await db.collection("password_reset_tokens")
            .find(
                { userId: userObjectId },
                { session, projection: { _id: 1 } },
            )
            .toArray();
        const resetTokenIds = resetTokenRows.map((row) => row._id);
        const outboxIdentity = resetTokenIds.length > 0
            ? {
                $or: [
                    { userId: userObjectId },
                    { resetTokenId: { $in: resetTokenIds } },
                ],
            }
            : { userId: userObjectId };
        await db.collection("password_reset_dev_outbox").deleteMany(
            outboxIdentity,
            { session },
        );

        const removed = await deletePersonalCollections(
            db,
            userObjectId,
            session,
        );
        const commentsAnonymized = await anonymizeComments(
            db,
            userObjectId,
            session,
        );
        const subscriptionsCanceled = await cancelSubscriptionsForDeletedAccount(
            db,
            userObjectId,
            session,
        );
        const familyMembershipsUpdated =
            await invalidateFamilyMembershipsForDeletedAccount(
                db,
                userObjectId,
                user.email,
                session,
            );

        await scrubRetainedFinancialRecords(db, userObjectId, session);
        await db
            .collection("sessions")
            .deleteMany({ userId: userObjectId }, { session });
        await db.collection("privacy_deletion_requests").insertOne(
            {
                userId: userObjectId,
                requestedAt: now,
                accountStatusBefore: user.accountStatus ?? "active",
            },
            { session },
        );

        const updated = await db.collection("users").updateOne(
            { _id: userObjectId, passwordHash: currentUser.passwordHash },
            {
                $set: {
                    name: "Conta eliminada",
                    email: `deleted-${String(userObjectId)}@faithflix.local`,
                    accountStatus: "deleted",
                    role: "user",
                    deletedAt: now,
                    updatedAt: now,
                },
                $unset: { passwordHash: "" },
            },
            { session },
        );

        if (updated.matchedCount !== 1) {
            throw new HttpError(
                409,
                "A conta mudou durante o pedido. Tenta novamente.",
                undefined,
                "ACCOUNT_STATE_CHANGED",
            );
        }

        return {
            deleted: true,
            removed,
            commentsAnonymized,
            subscriptionsCanceled,
            familyMembershipsUpdated,
        };
    });
}
```

5. Explicação do código.

`invalidateFamilyMembershipsForDeletedAccount` procura o utilizador nos dois lados da relação familiar. Só altera memberships `pending` e `active`, porque são os estados que ainda representam convite aberto ou acesso ativo. Memberships já fechadas, como `declined`, `removed` ou `left`, não precisam de nova alteração.

`deleteMyAccount` mantém a exportação e a validação de `BK-MF5-02`, verifica a
password atual e abre uma única transação. O invariante do roster recusa apagar
o último admin operacional com `409 LAST_ACTIVE_ADMIN`. Limpeza pessoal
(incluindo trials), comentários, subscrições, convites/memberships, scrub do
ledger financeiro retido, outbox de reset, sessões, pedido RGPD e anonimização
da conta usam a mesma `session` e são sequenciais. O filtro final inclui o
`passwordHash` observado; se a conta mudar ou uma escrita falhar, toda a
operação faz rollback.

A atualização da conta troca o email por um endereço técnico local e remove
`passwordHash`. Os `payment_attempts` conservam montantes e snapshots exigidos
pela contabilidade, mas perdem emails facultativos e ficam marcados
`accountDeleted`. Isto evita manter credenciais ou PII dispensável numa conta
eliminada sem adulterar o ledger.

6. Validação do passo.

Elimina uma conta owner com membership ativa. Expected result: `DELETE /api/privacy/account` devolve `200 OK`, `deleted: true`, `familyMembershipsUpdated: 1`, e a membership passa para `status: "removed"` com `removedReason: "account_deleted"`.

Repete com dois admins ativos e confirma que outbox, sessões e contactos
financeiros desaparecem na mesma operação. Depois tenta eliminar o único admin
ativo: expected result `409 LAST_ACTIVE_ADMIN` e zero alterações em qualquer
coleção.

7. Cenário negativo/erro esperado.

Envia confirmação errada, por exemplo `{ "confirmation": "apagar" }`. Expected
result: erro `400`, a conta mantém `accountStatus: "active"` e a membership
continua no estado anterior. Injeta também uma falha depois do scrub financeiro:
conta, ledger, outbox, sessões e membership têm de regressar integralmente ao
estado anterior.

### Passo 4 - Preservar métricas existentes e adicionar contagens familiares

1. Objetivo funcional do passo no contexto da app.

Permitir ao admin medir uso da funcionalidade familiar sem apagar métricas administrativas já criadas em MF5.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/admin-metrics/admin-metrics.service.js`
    - LOCALIZAÇÃO: função completa `getAdminMetrics`; rever helpers `count` e `sumCents`.

3. Instruções do que fazer.

Substitui `getAdminMetrics` pela versão completa abaixo. Não substituas a resposta por uma versão menor: este BK acrescenta `familyMembers` e `familyInvitationsPending`, mas preserva `generatedAt`, `range`, `users`, `catalog`, `privacy`, `notifications` e `solidarity`.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/admin-metrics/admin-metrics.service.js
/**
 * Calcula métricas administrativas de operação sem expor dados pessoais.
 *
 * @param {{ from?: unknown, to?: unknown }} query Query string validável.
 * @returns {Promise<Record<string, unknown>>} Métricas agregadas.
 */
export async function getAdminMetrics(query = {}) {
    const { from, to } = assertMetricsRange(query);
    const db = await getDb();
    const createdInRange = { createdAt: { $gte: from, $lte: to } };

    const [
        usersTotal,
        usersActive,
        usersBlocked,
        usersDeleted,
        contentsPublished,
        activeSubscriptions,
        trialSubscriptions,
        activeFamilyMemberships,
        pendingFamilyInvitations,
        notificationsCreated,
        deletionRequests,
        consentEvents,
        approvedCharities,
        solidarityCents,
    ] = await Promise.all([
        count(db, "users"),
        count(db, "users", {
            $or: [
                { accountStatus: "active" },
                { accountStatus: { $exists: false } },
            ],
        }),
        count(db, "users", { accountStatus: "blocked" }),
        count(db, "users", { accountStatus: "deleted" }),
        count(db, "contents", { status: "published" }),
        count(db, "subscriptions", { status: "active" }),
        count(db, "subscriptions", { status: "trialing" }),
        // A família é medida como contagem agregada; o painel não recebe emails nem nomes.
        count(db, "subscription_family_memberships", { status: "active" }),
        count(db, "subscription_family_memberships", { status: "pending" }),
        count(db, "notifications", createdInRange),
        count(db, "privacy_deletion_requests", {
            requestedAt: { $gte: from, $lte: to },
        }),
        count(db, "user_consent_events", {
            createdAt: { $gte: from, $lte: to },
        }),
        count(db, "charities", { status: "active", poolStatus: "eligible" }),
        sumCents(db, "pool_distributions", createdInRange, "totalPoolCents"),
    ]);

    return {
        generatedAt: new Date().toISOString(),
        range: {
            from: from.toISOString(),
            to: to.toISOString(),
        },
        users: {
            total: usersTotal,
            active: usersActive,
            blocked: usersBlocked,
            deleted: usersDeleted,
        },
        catalog: {
            published: contentsPublished,
        },
        subscriptions: {
            active: activeSubscriptions,
            trialing: trialSubscriptions,
            familyMembers: activeFamilyMemberships,
            familyInvitationsPending: pendingFamilyInvitations,
        },
        privacy: {
            deletionRequests,
            consentEvents,
        },
        notifications: {
            created: notificationsCreated,
        },
        solidarity: {
            approvedCharities,
            distributedCents: solidarityCents,
        },
    };
}
```

5. Explicação do código.

A função continua a validar o intervalo com `assertMetricsRange`, por isso o admin não consegue pedir métricas com datas inválidas. `createdInRange` mantém as métricas temporais já existentes para notificações, pedidos de eliminação, eventos de consentimento e distribuição solidária.

As duas novas contagens familiares ficam dentro de `subscriptions`, porque representam acesso premium derivado de subscrição. `familyMembers` conta memberships ativas e `familyInvitationsPending` conta convites pendentes. A resposta não inclui `invitedEmail`, `ownerUserId` nem `memberUserId`, cumprindo minimização de dados.

O bloco preserva as métricas anteriores de MF5. Isto evita uma regressão comum: corrigir família e apagar, sem querer, métricas de utilizadores, catálogo, privacidade, notificações e solidariedade.

6. Validação do passo.

Com duas memberships ativas e um convite pendente, chama `GET /api/admin/metrics` como admin. Expected result: `200 OK`, `metrics.subscriptions.familyMembers === 2`, `metrics.subscriptions.familyInvitationsPending === 1`, e continuam presentes `metrics.users`, `metrics.catalog`, `metrics.privacy`, `metrics.notifications` e `metrics.solidarity`.

7. Cenário negativo/erro esperado.

Chama `GET /api/admin/metrics` com utilizador comum. Expected result: acesso recusado pelo middleware de role. A resposta não deve devolver métricas.

### Passo 5 - Confirmar que a pool solidária não conta memberships

1. Objetivo funcional do passo no contexto da app.

Confirmar que membros familiares não contam como novas subscrições pagas para distribuição solidária.

2. Ficheiros envolvidos.
    - REVER: `backend/src/modules/charities/pool-distribution.service.js`
    - REVER: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZAÇÃO: função `runMonthlyDistribution`.

3. Instruções do que fazer.

Revê `runMonthlyDistribution` e confirma o filtro cumulativo sobre `payment_attempts`: `schemaVersion: 2`, `status: "approved"`, `accountingEstimate: false` e `approvedAt` em `[start, end)` UTC. Não adiciones `subscription_family_memberships`, `subscriptions` ou preços atuais de planos ao cálculo financeiro.

4. Código completo, correto e integrado com a app final.

Não redefinas esta função em MF9. Reutiliza integralmente a implementação
autoritativa de `BK-MF4-05`, incluindo a assinatura de três argumentos
`runMonthlyDistribution(monthInput, createdByUserId, context = {})`, os campos
`trigger` e `referenceDate`, o audit transacional, o DTO público, a ordenação
determinística, o replay idempotente e o tratamento de corrida pelo índice
único. Este BK acrescenta apenas a prova de que memberships não entram no
ledger e as métricas agregadas do Passo 4.

Num teste de integração, chama a função canónica sem criar wrapper concorrente:

```js
const result = await runMonthlyDistribution("2026-06", adminUserId, {
    trigger: "admin",
    referenceDate: new Date("2026-07-01T00:05:00.000Z"),
});

assert.equal(result.distribution.month, "2026-06");
assert.equal(result.distribution.trigger, "admin");
assert.equal(result.distribution.financialSnapshot.source, "payment_attempts_v2");
```

O teste deve importar `runMonthlyDistribution` de
`pool-distribution.service.js` e `assert` de `node:assert/strict`. Não edita
a função de produção neste passo.

5. Explicação do código.

Este passo confirma o contrato financeiro corrigido. A query lê `payment_attempts` v2 elegíveis, não `subscriptions` nem `subscription_family_memberships`. O pagamento aprovado do owner Família pode contribuir uma vez; os membros não multiplicam receita. Documentos legacy e backfills com `accountingEstimate: true` ficam excluídos.

O cálculo continua em cêntimos para evitar erros de ponto flutuante. A rotação das associações continua igual ao fluxo da MF4, preservando candidatura, elegibilidade, distribuição mensal e histórico.

6. Validação do passo.

Cria, em doubles locais, um pagamento v2 aprovado do owner Família e dois membros familiares. Executa um mês UTC já fechado. Expected result: `totalPoolCents` usa o snapshot do único pagamento; memberships não alteram o valor. Acrescenta um backfill estimado e confirma que continua excluído.

7. Cenário negativo/erro esperado.

Se a distribuição somar membros familiares como pagamentos adicionais, o valor da pool fica inflacionado. Esse comportamento deve bloquear o PR antes do gate.

### Passo 6 - Testar exportação e eliminação familiar

1. Objetivo funcional do passo no contexto da app.

Provar que os dados familiares entram no ciclo de privacidade sem depender de servidor HTTP.

2. Ficheiros envolvidos.
    - EDITAR: `backend/tests/unit/mf9-subscriptions.test.js`
    - LOCALIZAÇÃO: imports de privacidade e teste MF9 de exportação/eliminação.

3. Instruções do que fazer.

Confirma que o ficheiro importa `buildUserDataExport` e `deleteMyAccount` de `privacy.service.js`. Depois adiciona o teste completo abaixo à suite MF9. Se o teste já existir, revê se mantém a confirmação forte, a membership ativa e as asserts finais.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf9-subscriptions.test.js
import {
  buildUserDataExport,
  deleteMyAccount,
} from "../../src/modules/privacy/privacy.service.js";
import { hashPassword } from "../../src/modules/auth/auth.password.js";

test("MF9 exporta e invalida memberships familiares na eliminação de conta", async () => {
  const userId = new ObjectId();
  const memberId = new ObjectId();
  const membershipId = new ObjectId();
  const resetTokenId = new ObjectId();
  const collections = setCollectionsForTests({
    users: collection([
      {
        _id: userId,
        name: "Owner",
        email: "owner@example.test",
        passwordHash: await hashPassword("password1234"),
        role: "user",
        accountStatus: "active",
      },
    ]),
    subscription_family_memberships: collection([
      {
        _id: membershipId,
        ownerUserId: userId,
        memberUserId: memberId,
        invitedEmail: "membro@example.test",
        status: "active",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]),
    sessions: collection([{ _id: new ObjectId(), userId }]),
    subscriptions: collection([]),
    payment_attempts: collection([
      {
        _id: new ObjectId(),
        userId,
        schemaVersion: 2,
        amountCents: 999,
        email: "owner@example.test",
        payerEmail: "owner@example.test",
      },
    ]),
    password_reset_tokens: collection([
      { _id: resetTokenId, userId, tokenHash: "hash-nao-reversivel" },
    ]),
    password_reset_dev_outbox: collection([
      { _id: new ObjectId(), userId, resetTokenId },
    ]),
    content_comments: collection([]),
    privacy_deletion_requests: collection([]),
  });

  const exported = await buildUserDataExport(String(userId));
  assert.equal(exported.sections.subscription_family_memberships.length, 1);

  // A confirmação forte impede que a suite ensine eliminação acidental de contas.
  const deleted = await deleteMyAccount(String(userId), {
    confirmation: "ELIMINAR CONTA",
    password: "password1234",
  });

  assert.equal(deleted.familyMembershipsUpdated, 1);
  assert.equal(collections.subscription_family_memberships.rows[0].status, "removed");
  assert.equal(collections.sessions.rows.length, 0);
  assert.equal(collections.password_reset_dev_outbox.rows.length, 0);
  assert.equal(collections.payment_attempts.rows[0].accountDeleted, true);
  assert.equal("email" in collections.payment_attempts.rows[0], false);
  assert.equal("payerEmail" in collections.payment_attempts.rows[0], false);
});
```

5. Explicação do código.

O teste cria uma membership ativa entre owner e membro. Primeiro, chama `buildUserDataExport` e confirma que a secção `subscription_family_memberships` existe. Depois, chama `deleteMyAccount` com a confirmação forte criada em `BK-MF5-02` e confirma que uma membership foi atualizada.

A assert ao estado `removed` prova que o acesso familiar foi fechado. As asserts
seguintes provam a revogação de sessões/outbox e que o ledger retém o montante,
mas já não contém os emails facultativos. A fixture guarda apenas o hash e o
pedido fornece a password atual. O double transacional da suite deve fazer
staging e rollback; um teste de fault injection depois da alteração da
membership tem de deixar membership, ledger, outbox, sessões e conta
inalterados.

6. Validação do passo.

Executa `cd backend && npm test -- --test-name-pattern=MF9`. Expected result: a suite MF9 passa e inclui o teste `MF9 exporta e invalida memberships familiares na eliminação de conta`.

7. Cenário negativo/erro esperado.

Altera temporariamente a confirmação para `"APAGAR"`. Expected result:
`deleteMyAccount` rejeita o pedido e a membership mantém `status: "active"`.
Acrescenta ainda uma fixture em que o utilizador é o único admin operacional:
espera `409 LAST_ACTIVE_ADMIN` e confirma que conta, roster, membership,
payment attempt, outbox e sessão não mudaram. Reverte qualquer mutação
temporária antes de fechar o BK.

### Passo 7 - Fechar evidence operacional

1. Objetivo funcional do passo no contexto da app.

Preparar a prova que `BK-MF9-06` vai usar no gate final.

2. Ficheiros envolvidos.
    - REVER: `backend/src/modules/privacy/privacy.controller.js`
    - REVER: `backend/src/modules/privacy/privacy.routes.js`
    - REVER: `backend/src/modules/admin-metrics/admin-metrics.controller.js`
    - REVER: `backend/src/modules/admin-metrics/admin-metrics.routes.js`
    - REVER: `backend/tests/unit/mf9-subscriptions.test.js`
    - LOCALIZAÇÃO: respostas HTTP de exportação, eliminação e métricas.

3. Instruções do que fazer.

Regista no PR três provas: exportação com `subscription_family_memberships`, eliminação com `familyMembershipsUpdated`, e métricas admin com contagens familiares agregadas. Junta também dois negativos: eliminação com confirmação errada e utilizador comum a tentar aceder a métricas admin.

4. Código completo, correto e integrado com a app final.

```bash
cd backend
npm test -- --test-name-pattern=MF9
```

5. Explicação do código.

O comando corre os testes de backend filtrados pela MF9. É suficiente para este passo porque valida planos Pro/Família, partilha real, qualidade por plano e privacidade familiar. Para defesa, copia o resultado do comando para a evidence do PR ou resume: número de testes, número de passes e zero falhas.

O teste automatizado não substitui a revisão manual das respostas HTTP. Por isso, confirma também que `GET /api/privacy/export`, `DELETE /api/privacy/account` e `GET /api/admin/metrics` devolvem os campos esperados quando usados com sessão e role corretas.

6. Validação do passo.

Expected results:

- `GET /api/privacy/export` autenticado: `200 OK`, `export.sections.subscription_family_memberships` existe.
- `DELETE /api/privacy/account` autenticado com `{ "confirmation": "ELIMINAR CONTA", "password": "<password-atual>" }`: `200 OK`, `deleted: true`, `familyMembershipsUpdated` numérico.
- `GET /api/admin/metrics` como admin: `200 OK`, `metrics.subscriptions.familyMembers` e `metrics.subscriptions.familyInvitationsPending` são números.
- `GET /api/admin/metrics` como utilizador comum: acesso recusado.

7. Cenário negativo/erro esperado.

Se as métricas expuserem emails, nomes, `ownerUserId` ou `memberUserId`, o PR deve ser bloqueado. O endpoint de métricas deve devolver contagens, não uma listagem familiar.

#### Critérios de aceite

- A exportação RGPD inclui `subscription_family_memberships` do owner e do membro.
- A eliminação de conta invalida memberships `pending` e `active`.
- `familyMembershipsUpdated` aparece no resultado operacional da eliminação.
- A eliminação exige frase e password atual; password incorreta devolve
  `403 CURRENT_PASSWORD_INVALID` sem qualquer alteração.
- O único admin ativo não pode eliminar a conta: devolve
  `409 LAST_ACTIVE_ADMIN` sem qualquer alteração.
- Limpeza, trials, memberships/convites, subscrições, scrub financeiro, outbox,
  sessões, pedido RGPD e anonimização partilham uma única transação/sessão;
  fault injection ou CAS falhado deixa zero estado parcial.
- `payment_attempts` mantém montantes e snapshots, remove contactos facultativos
  e fica marcado `accountDeleted`; a outbox é limpa apenas por `userId` e
  `resetTokenId`, nunca por email ou token opaco.
- A invariante conta apenas admins com `accountStatus` ausente/`active` e
  `status` ausente/`active`; estados bloqueados, inativos, eliminados,
  desconhecidos ou `null` não protegem a remoção do último admin real.
- As métricas admin preservam campos existentes: `users`, `catalog`, `privacy`, `notifications`, `solidarity`, `generatedAt` e `range`.
- As métricas admin incluem `familyMembers` e `familyInvitationsPending` como contagens.
- Eventos de consentimento são medidos por `user_consent_events.createdAt`, o
  campo canónico de `BK-MF5-03`.
- As métricas admin não expõem emails, nomes ou IDs pessoais de membros familiares.
- A pool solidária reutiliza a função canónica de três argumentos de
  `BK-MF4-05`, incluindo trigger, referenceDate, audit, DTO, ordenação, replay e
  proteção de corrida; usa apenas pagamentos `schemaVersion: 2`, aprovados,
  não estimados e com `approvedAt` no mês UTC.
- Sem associação elegível no fecho, fica um ledger terminal `deferred_no_eligible_charities`, sem retry infinito nem distribuição retroativa após aprovação posterior.
- O catch-up processa, no máximo, 120 meses pendentes por passagem e progride através de lotes históricos já fechados.
- O teste MF9 cobre exportação e invalidação familiar.

#### Validação final

Executa:

```bash
cd backend
npm test -- --test-name-pattern=MF9
```

Revê também:

- `GET /api/privacy/export`: `200 OK` autenticado e secção `subscription_family_memberships`.
- `DELETE /api/privacy/account`: `200 OK` com confirmação forte; erro com confirmação errada.
- `DELETE /api/privacy/account`: `409 LAST_ACTIVE_ADMIN` para o único admin
  ativo, sem alterações em conta, memberships, ledger, outbox ou sessões.
- Fault injection após o scrub financeiro: rollback integral de todas as
  coleções tocadas.
- `GET /api/admin/metrics`: `200 OK` como admin; acesso recusado como utilizador comum.
- `backend/src/modules/charities/pool-distribution.service.js`: sem contagem de `subscription_family_memberships`/`subscriptions`; filtro financeiro v2 cumulativo e snapshots persistidos.

Erros comuns a evitar:

- Trocar o filtro `$or` por `{ userId: userObjectId }` nas memberships.
- Substituir `getAdminMetrics` por uma versão menor que apaga métricas de MF5.
- Exportar emails familiares em métricas admin.
- Contar membros familiares como subscrições pagas na pool solidária.
- Testar só o caso positivo e esquecer confirmação errada ou role comum.

#### Evidence para PR/defesa

- `pr`: referência do PR ou commit do BK.
- `proof`: output de `npm test -- --test-name-pattern=MF9` com o teste de privacidade familiar a passar.
- `proof`: exemplo de exportação com `sections.subscription_family_memberships`.
- `proof`: exemplo de métricas com `subscriptions.familyMembers` e `subscriptions.familyInvitationsPending`.
- `neg`: eliminação com confirmação errada rejeitada.
- `neg`: eliminação do único admin ativo rejeitada com `LAST_ACTIVE_ADMIN`.
- `neg`: falha após scrub financeiro reverte ledger, outbox, memberships,
  sessões, pedido RGPD e conta.
- `neg`: utilizador comum bloqueado em `GET /api/admin/metrics`.
- `fonte`: `RF55`, `RF56`, `RF59`, `RF62`, `RNF17`, `RNF19`, `RNF30`, `BK-MF9-03`, `BK-MF9-04`.

#### Handoff

Este BK entrega a prova de privacidade e operação familiar para `BK-MF9-06`. O próximo BK deve validar o gate final com exportação RGPD familiar, eliminação de conta, métricas agregadas, pool solidária sem inflação por membros familiares e regressão completa da MF9.

#### Changelog

- `2026-07-10`: composição RGPD completada com helper de subscrições definido,
  invariante do último admin, scrub financeiro e outbox na mesma transação;
  exportação anterior preservada.
- `2026-07-10`: normalizado para tutorial v2 e marker analítico autónomo,
  preservando RGPD transacional e contabilidade v2.
- `2026-07-01`: guia corrigido com PT-PT, funções completas de privacidade/métricas, validações HTTP objetivas, revisão da pool solidária, teste MF9 e evidence operacional.
- `2026-07-10`: pool familiar sincronizada para pagamentos v2 aprovados/não estimados, mês UTC fechado e snapshots; eliminação atualizada para confirmação mais password atual.
- `2026-07-10`: pool sem beneficiárias passa a fecho diferido terminal e não retroativo; catch-up limitado a 120 meses pendentes por passagem.
