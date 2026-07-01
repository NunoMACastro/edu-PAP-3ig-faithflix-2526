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
- `last_updated`: `2026-07-01`

#### Objetivo

Neste BK vais fechar o impacto de privacidade e operação da partilha familiar. As memberships criadas em `BK-MF9-03` e usadas na UI em `BK-MF9-04` passam a entrar na exportação de dados, na eliminação de conta e nas métricas administrativas agregadas.

No fim, um utilizador autenticado consegue exportar as partilhas familiares em que participa, eliminar a sua conta sem deixar convites ou memberships abertas, e um admin consegue consultar contagens familiares sem ver nomes, emails ou identificadores pessoais de membros.

#### Importância

`CANONICO`: `RF55` e `RF56` exigem exportação e eliminação de dados do utilizador. A partilha familiar acrescenta novos dados pessoais: owner, membro, email convidado, estado da membership e datas do ciclo de vida. Se esses dados ficarem fora do ciclo RGPD, a app parece funcional, mas fica incompleta do ponto de vista legal e pedagógico.

`CANONICO`: `RF59` cobre métricas administrativas. Essas métricas servem para operar a plataforma, não para investigar famílias individualmente. Por isso, o painel admin deve contar memberships ativas e convites pendentes, mas não deve listar emails, nomes ou IDs pessoais.

Este BK também protege a pool solidária. Um membro familiar recebe acesso premium por extensão do plano Família do owner, mas não representa uma nova subscrição paga. A distribuição solidária deve continuar a nascer das subscrições pagas, não das memberships.

#### Scope-in

- Exportar memberships em que o utilizador autenticado é owner ou membro.
- Invalidar memberships `pending` e `active` quando uma conta é eliminada.
- Expor `familyMembershipsUpdated` no resultado operacional da eliminação.
- Acrescentar contagens familiares agregadas ao painel admin.
- Garantir que métricas não expõem emails, nomes ou IDs pessoais de membros.
- Rever que a pool solidária continua baseada em subscrições pagas.
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

#### Pre-requisitos

- `BK-MF9-03` completo, com a coleção `subscription_family_memberships`, estados `pending`, `active`, `declined`, `removed` e `left`, e regras de owner/membro.
- `BK-MF9-04` completo, com convites familiares criados e alterados pela UI.
- `BK-MF5-01` completo, com `buildUserDataExport(userId)`.
- `BK-MF5-02` completo, com `deleteMyAccount(userId, input)`.
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

A pool solidária é financeira. Ela deve continuar a usar subscrições ativas e planos pagos como base de cálculo. Uma membership familiar é acesso derivado, não pagamento adicional.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Privacidade | `backend/src/modules/privacy/privacy.service.js` | Exporta memberships familiares e invalida memberships abertas na eliminação de conta. |
| Privacidade HTTP | `backend/src/modules/privacy/privacy.controller.js` e `backend/src/modules/privacy/privacy.routes.js` | Expõem `GET /api/privacy/export` e `DELETE /api/privacy/account` com sessão autenticada. |
| Métricas | `backend/src/modules/admin-metrics/admin-metrics.service.js` | Conta memberships ativas e convites pendentes sem dados pessoais. |
| Métricas HTTP | `backend/src/modules/admin-metrics/admin-metrics.controller.js` e `backend/src/modules/admin-metrics/admin-metrics.routes.js` | Expõem `GET /api/admin/metrics` apenas para admin. |
| Pool solidária | `backend/src/modules/charities/pool-distribution.service.js` | Confirma que a distribuição usa subscrições pagas, não memberships. |
| Testes | `backend/tests/unit/mf9-subscriptions.test.js` | Prova exportação e invalidação familiar sem servidor HTTP. |
| Handoff | `BK-MF9-06` | Usa estes resultados no gate final da MF9. |

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/privacy/privacy.service.js`
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

2. Ficheiros envolvidos:
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

Sem código neste passo. Este passo é analítico: evita escrever exportação e eliminação antes de saber que dados são pessoais.

5. Explicação do código.

Não há código porque o objetivo é tomar uma decisão de privacidade. O erro a evitar é tratar memberships como dados puramente técnicos. Elas ligam pessoas reais e precisam de exportação, eliminação controlada e métricas minimizadas.

6. Validação do passo.

Confirma que `ownerUserId`, `memberUserId` e `invitedEmail` aparecem no plano de exportação ou de invalidação. Confirma também que métricas não vão devolver estes campos.

7. Cenário negativo/erro esperado.

Se `invitedEmail` ficar fora da exportação, o utilizador não consegue ver um dado pessoal que a app guardou. Isso falha `RF55`.

### Passo 2 - Exportar memberships familiares

1. Objetivo funcional do passo no contexto da app.

Incluir na exportação RGPD memberships onde o utilizador autenticado é owner ou membro.

2. Ficheiros envolvidos:
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

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/privacy/privacy.service.js`
    - LOCALIZAÇÃO: função completa `invalidateFamilyMembershipsForDeletedAccount` e função completa `deleteMyAccount`.

3. Instruções do que fazer.

Adiciona `invalidateFamilyMembershipsForDeletedAccount` depois de `cancelSubscriptionsForDeletedAccount`. Depois substitui `deleteMyAccount` pela versão completa abaixo, preservando a validação forte de confirmação criada em `BK-MF5-02`.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/privacy/privacy.service.js
/**
 * Invalida convites e partilhas familiares associados a uma conta eliminada.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {ObjectId} userObjectId Id do utilizador.
 * @returns {Promise<number>} Número de memberships atualizadas.
 */
async function invalidateFamilyMembershipsForDeletedAccount(db, userObjectId) {
    const result = await db.collection("subscription_family_memberships").updateMany(
        {
            $or: [
                { ownerUserId: userObjectId },
                { memberUserId: userObjectId },
            ],
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
    assertDeleteAccountPayload(input);

    const db = await getDb();
    const userObjectId = asUserObjectId(userId);
    const user = await db.collection("users").findOne({ _id: userObjectId });

    if (!user) {
        throw new HttpError(404, "Utilizador não encontrado.");
    }

    const now = new Date();
    const [removed, commentsAnonymized, subscriptionsCanceled, familyMembershipsUpdated] =
        await Promise.all([
            deletePersonalCollections(db, userObjectId),
            anonymizeComments(db, userObjectId),
            cancelSubscriptionsForDeletedAccount(db, userObjectId),
            invalidateFamilyMembershipsForDeletedAccount(db, userObjectId),
            // As sessões são removidas no mesmo fluxo para impedir uso da conta apagada.
            db.collection("sessions").deleteMany({ userId: userObjectId }),
        ]);

    await db.collection("privacy_deletion_requests").insertOne({
        userId: userObjectId,
        requestedAt: now,
        accountStatusBefore: user.accountStatus ?? "active",
    });

    await db.collection("users").updateOne(
        { _id: userObjectId },
        {
            $set: {
                name: "Conta eliminada",
                email: `deleted-${String(userObjectId)}@faithflix.local`,
                accountStatus: "deleted",
                role: "user",
                deletedAt: now,
                updatedAt: now,
            },
            $unset: {
                passwordHash: "",
            },
        },
    );

    return {
        deleted: true,
        removed,
        commentsAnonymized,
        subscriptionsCanceled,
        familyMembershipsUpdated,
    };
}
```

5. Explicação do código.

`invalidateFamilyMembershipsForDeletedAccount` procura o utilizador nos dois lados da relação familiar. Só altera memberships `pending` e `active`, porque são os estados que ainda representam convite aberto ou acesso ativo. Memberships já fechadas, como `declined`, `removed` ou `left`, não precisam de nova alteração.

`deleteMyAccount` mantém a validação de `BK-MF5-02` antes de tocar na base de dados. A limpeza corre em paralelo para remover dados pessoais, anonimizar comentários, cancelar subscrições, invalidar memberships familiares e apagar sessões. O retorno inclui `familyMembershipsUpdated`, para que o PR e o gate consigam provar quantas memberships foram afetadas.

A atualização da conta troca o email por um endereço técnico local e remove `passwordHash`. Isto evita manter credenciais ativas numa conta eliminada.

6. Validação do passo.

Elimina uma conta owner com membership ativa. Expected result: `DELETE /api/privacy/account` devolve `200 OK`, `deleted: true`, `familyMembershipsUpdated: 1`, e a membership passa para `status: "removed"` com `removedReason: "account_deleted"`.

7. Cenário negativo/erro esperado.

Envia confirmação errada, por exemplo `{ "confirmation": "apagar" }`. Expected result: erro `400`, a conta mantém `accountStatus: "active"` e a membership continua no estado anterior.

### Passo 4 - Preservar métricas existentes e adicionar contagens familiares

1. Objetivo funcional do passo no contexto da app.

Permitir ao admin medir uso da funcionalidade familiar sem apagar métricas administrativas já criadas em MF5.

2. Ficheiros envolvidos:
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
            changedAt: { $gte: from, $lte: to },
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

2. Ficheiros envolvidos:
    - REVER: `backend/src/modules/charities/pool-distribution.service.js`
    - REVER: `backend/src/modules/subscriptions/subscriptions.service.js`
    - LOCALIZAÇÃO: função `runMonthlyDistribution`.

3. Instruções do que fazer.

Revê `runMonthlyDistribution` e confirma que o total da pool nasce de documentos em `subscriptions` com `status: "active"` e `currentPeriodEnd` no futuro. Não adiciones consulta a `subscription_family_memberships` para calcular dinheiro.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/charities/pool-distribution.service.js
/**
 * Executa a distribuição mensal da pool solidária.
 *
 * @param {string} monthInput Mês no formato `YYYY-MM`.
 * @param {string} createdByUserId Identificador do admin que executa a distribuição.
 * @returns {Promise<{ distribution: object }>} Distribuição persistida.
 * @throws {Error} Quando o mês já existe ou não há associações elegíveis.
 */
export async function runMonthlyDistribution(monthInput, createdByUserId) {
    const db = await getDb();
    const month = assertDistributionMonth(monthInput);
    const now = new Date();
    const existing = await db.collection("pool_distributions").findOne({ month });
    if (existing) {
        const error = new Error("Distribuição deste mês já existe.");
        error.statusCode = 409;
        throw error;
    }

    // Só subscrições pagas ativas entram na receita; memberships familiares são acesso derivado.
    const subscriptions = await db.collection("subscriptions").find({
        status: "active",
        currentPeriodEnd: { $gt: now },
    }).toArray();
    const plans = await db.collection("subscription_plans").find({ active: true }).toArray();
    const planByCode = new Map(plans.map((plan) => [plan.code, plan]));

    // O cálculo em cêntimos evita erros de arredondamento em dinheiro.
    const totalPoolCents = subscriptions.reduce((total, subscription) => {
        const plan = planByCode.get(subscription.planCode);
        if (!plan) return total;
        return total + Math.round((plan.priceCents * plan.solidaritySharePercent) / 100);
    }, 0);

    const charities = await db.collection("charities").find({
        status: "active",
        poolStatus: "eligible",
    }).sort({ approvedAt: 1 }).toArray();

    if (charities.length === 0) {
        const error = new Error("Não existem associações elegíveis.");
        error.statusCode = 409;
        throw error;
    }

    const lastRun = await db.collection("pool_distributions").findOne({}, { sort: { month: -1 } });
    const offset = nextRotationOffset(charities, lastRun);
    const rotated = [...charities.slice(offset), ...charities.slice(0, offset)];
    const items = splitCents(totalPoolCents, rotated);

    const run = {
        month,
        totalPoolCents,
        status: "completed",
        items,
        createdBy: ObjectId.isValid(createdByUserId) ? new ObjectId(createdByUserId) : null,
        createdAt: now,
    };

    const result = await db.collection("pool_distributions").insertOne(run);
    return { distribution: { ...run, id: String(result.insertedId) } };
}
```

5. Explicação do código.

Este passo não pede mudança funcional à pool; pede revisão de contrato. A query lê `subscriptions`, não `subscription_family_memberships`. Isso quer dizer que o owner Família contribui como subscritor pago, mas os membros familiares não multiplicam a receita.

O cálculo continua em cêntimos para evitar erros de ponto flutuante. A rotação das associações continua igual ao fluxo da MF4, preservando candidatura, elegibilidade, distribuição mensal e histórico.

6. Validação do passo.

Cria uma subscrição Família ativa com dois membros familiares. Executa a distribuição mensal. Expected result: `totalPoolCents` usa o preço do plano do owner uma vez, não três vezes.

7. Cenário negativo/erro esperado.

Se a distribuição somar membros familiares como pagamentos adicionais, o valor da pool fica inflacionado. Esse comportamento deve bloquear o PR antes do gate.

### Passo 6 - Testar exportação e eliminação familiar

1. Objetivo funcional do passo no contexto da app.

Provar que os dados familiares entram no ciclo de privacidade sem depender de servidor HTTP.

2. Ficheiros envolvidos:
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

test("MF9 exporta e invalida memberships familiares na eliminação de conta", async () => {
  const userId = new ObjectId();
  const memberId = new ObjectId();
  const membershipId = new ObjectId();
  const collections = setCollectionsForTests({
    users: collection([
      {
        _id: userId,
        name: "Owner",
        email: "owner@example.test",
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
    sessions: collection([]),
    subscriptions: collection([]),
    content_comments: collection([]),
    privacy_deletion_requests: collection([]),
  });

  const exported = await buildUserDataExport(String(userId));
  assert.equal(exported.sections.subscription_family_memberships.length, 1);

  // A confirmação forte impede que a suite ensine eliminação acidental de contas.
  const deleted = await deleteMyAccount(String(userId), {
    confirmation: "ELIMINAR CONTA",
  });

  assert.equal(deleted.familyMembershipsUpdated, 1);
  assert.equal(collections.subscription_family_memberships.rows[0].status, "removed");
});
```

5. Explicação do código.

O teste cria uma membership ativa entre owner e membro. Primeiro, chama `buildUserDataExport` e confirma que a secção `subscription_family_memberships` existe. Depois, chama `deleteMyAccount` com a confirmação forte criada em `BK-MF5-02` e confirma que uma membership foi atualizada.

A assert ao estado `removed` prova que o acesso familiar foi fechado. O teste não precisa de servidor HTTP porque está a validar a regra de service; os controllers e middlewares são revistos nos passos de validação final.

6. Validação do passo.

Executa `cd backend && npm test -- --test-name-pattern=MF9`. Expected result: a suite MF9 passa e inclui o teste `MF9 exporta e invalida memberships familiares na eliminação de conta`.

7. Cenário negativo/erro esperado.

Altera temporariamente a confirmação para `"APAGAR"`. Expected result: `deleteMyAccount` rejeita o pedido e a membership mantém `status: "active"`. Reverte essa alteração antes de fechar o BK.

### Passo 7 - Fechar evidence operacional

1. Objetivo funcional do passo no contexto da app.

Preparar a prova que `BK-MF9-06` vai usar no gate final.

2. Ficheiros envolvidos:
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
- `DELETE /api/privacy/account` autenticado com `{ "confirmation": "ELIMINAR CONTA" }`: `200 OK`, `deleted: true`, `familyMembershipsUpdated` numérico.
- `GET /api/admin/metrics` como admin: `200 OK`, `metrics.subscriptions.familyMembers` e `metrics.subscriptions.familyInvitationsPending` são números.
- `GET /api/admin/metrics` como utilizador comum: acesso recusado.

7. Cenário negativo/erro esperado.

Se as métricas expuserem emails, nomes, `ownerUserId` ou `memberUserId`, o PR deve ser bloqueado. O endpoint de métricas deve devolver contagens, não uma listagem familiar.

#### Critérios de aceite

- A exportação RGPD inclui `subscription_family_memberships` do owner e do membro.
- A eliminação de conta invalida memberships `pending` e `active`.
- `familyMembershipsUpdated` aparece no resultado operacional da eliminação.
- As métricas admin preservam campos existentes: `users`, `catalog`, `privacy`, `notifications`, `solidarity`, `generatedAt` e `range`.
- As métricas admin incluem `familyMembers` e `familyInvitationsPending` como contagens.
- As métricas admin não expõem emails, nomes ou IDs pessoais de membros familiares.
- A pool solidária continua baseada em subscrições pagas, não em memberships familiares.
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
- `GET /api/admin/metrics`: `200 OK` como admin; acesso recusado como utilizador comum.
- `backend/src/modules/charities/pool-distribution.service.js`: sem contagem de `subscription_family_memberships` para calcular dinheiro.

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
- `neg`: utilizador comum bloqueado em `GET /api/admin/metrics`.
- `fonte`: `RF55`, `RF56`, `RF59`, `RF62`, `RNF17`, `RNF19`, `RNF30`, `BK-MF9-03`, `BK-MF9-04`.

#### Handoff

Este BK entrega a prova de privacidade e operação familiar para `BK-MF9-06`. O próximo BK deve validar o gate final com exportação RGPD familiar, eliminação de conta, métricas agregadas, pool solidária sem inflação por membros familiares e regressão completa da MF9.

#### Changelog

- `2026-07-01`: guia corrigido com PT-PT, funções completas de privacidade/métricas, validações HTTP objetivas, revisão da pool solidária, teste MF9 e evidence operacional.
