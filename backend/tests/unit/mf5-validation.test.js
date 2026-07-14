/**
 * @file Testes unitarios das regras criticas da MF5.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { hashPassword } from "../../src/modules/auth/auth.password.js";
import { loginUser } from "../../src/modules/auth/auth.service.js";
import { resolveSession } from "../../src/modules/auth/session.service.js";
import { createOpaqueToken, hashToken } from "../../src/modules/auth/token.js";
import { getAdminMetrics } from "../../src/modules/admin-metrics/admin-metrics.service.js";
import {
    assertConsentPayload,
    assertDeleteAccountPayload,
} from "../../src/modules/privacy/privacy.validation.js";
import {
    buildUserDataExport,
    deleteMyAccount,
    updateMyConsents,
} from "../../src/modules/privacy/privacy.service.js";
import { updateUserByAdmin, updateUserRole } from "../../src/modules/users/user.service.js";
import {
    assertAdminUserFilters,
    assertAdminUserUpdate,
} from "../../src/modules/users/user.validation.js";
import { assertMetricsRange } from "../../src/modules/admin-metrics/admin-metrics.validation.js";
import {
    assertIntegrationKey,
    assertIntegrationUpdate,
} from "../../src/modules/integrations/integrations.validation.js";

/**
 * Compara identificadores MongoDB por valor textual.
 *
 * @param {unknown} left Valor esquerdo.
 * @param {unknown} right Valor direito.
 * @returns {boolean} Resultado da comparação.
 */
function sameId(left, right) {
    return String(left) === String(right);
}

/**
 * Lê valores aninhados através de caminhos `campo.subcampo`.
 *
 * @param {Record<string, unknown>} row Documento em memoria.
 * @param {string} path Caminho a consultar.
 * @returns {unknown} Valor encontrado.
 */
function valueForPath(row, path) {
    return path.split(".").reduce((current, key) => current?.[key], row);
}

/**
 * Aplica `$set`, `$setOnInsert` e `$unset` no documento em memoria.
 *
 * @param {Record<string, unknown>} row Documento alvo.
 * @param {Record<string, unknown>} update Operador MongoDB simplificado.
 * @param {boolean} isInsert Indica se o documento foi criado por upsert.
 * @returns {Record<string, unknown>} Documento atualizado.
 */
function applyUpdate(row, update = {}, isInsert = false) {
    Object.assign(row, update.$set ?? {});

    if (isInsert) {
        Object.assign(row, update.$setOnInsert ?? {});
    }

    for (const key of Object.keys(update.$unset ?? {})) {
        delete row[key];
    }

    return row;
}

/**
 * Converte filtros simples em documento inicial para upsert.
 *
 * @param {Record<string, unknown>} filter Filtro MongoDB simplificado.
 * @returns {Record<string, unknown>} Campos base seguros.
 */
function rowFromFilter(filter = {}) {
    return Object.fromEntries(
        Object.entries(filter).filter(
            ([key, value]) =>
                !key.startsWith("$") &&
                !(value && typeof value === "object" && !Array.isArray(value)),
        ),
    );
}

/**
 * Compara um valor com operadores MongoDB usados nos services MF5.
 *
 * @param {unknown} actual Valor do documento.
 * @param {unknown} expected Condicao esperada.
 * @returns {boolean} Resultado da comparacao.
 */
function matchesValue(actual, expected) {
    if (expected instanceof ObjectId) {
        return sameId(actual, expected);
    }

    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
        if ("$gte" in expected && actual < expected.$gte) return false;
        if ("$lte" in expected && actual > expected.$lte) return false;
        if ("$lt" in expected && actual >= expected.$lt) return false;
        if ("$gt" in expected && actual <= expected.$gt) return false;
        if ("$ne" in expected && actual === expected.$ne) return false;
        if ("$exists" in expected) {
            return (actual !== undefined) === expected.$exists;
        }
        if ("$nin" in expected) {
            return !expected.$nin.includes(actual);
        }

        return true;
    }

    return actual === expected;
}

/**
 * Valida uma query simples usada pelos services MF5.
 *
 * @param {Record<string, unknown>} row Documento em memoria.
 * @param {Record<string, unknown>} query Query simplificada.
 * @returns {boolean} `true` quando o documento corresponde.
 */
function matches(row, query = {}) {
    return Object.entries(query).every(([key, expected]) => {
        if (key === "$or") {
            return expected.some((nested) => matches(row, nested));
        }

        const actual = valueForPath(row, key);

        if (Array.isArray(actual)) {
            return actual.some((entry) => matchesValue(entry, expected));
        }

        if (expected instanceof ObjectId) {
            return sameId(actual, expected);
        }

        return matchesValue(actual, expected);
    });
}

/**
 * Cria colecao em memoria com subset MongoDB necessario para exportacao.
 *
 * @param {Record<string, unknown>[]} rows Documentos iniciais.
 * @returns {Record<string, Function>} Colecao fake.
 */
function collection(rows) {
    return {
        rows,

        /**
         * Procura um documento.
         *
         * @param {Record<string, unknown>} query Query simplificada.
         * @returns {Promise<Record<string, unknown> | null>} Documento encontrado.
         */
        async findOne(query = {}) {
            return rows.find((row) => matches(row, query)) ?? null;
        },

        /**
         * Conta documentos que correspondem a uma query.
         *
         * @param {Record<string, unknown>} query Query simplificada.
         * @returns {Promise<number>} Total encontrado.
         */
        async countDocuments(query = {}) {
            return rows.filter((row) => matches(row, query)).length;
        },

        /**
         * Lista documentos com encadeamento `sort().toArray()`.
         *
         * @param {Record<string, unknown>} query Query simplificada.
         * @returns {{ sort: Function, toArray: Function }} Cursor fake.
         */
        find(query = {}) {
            const result = rows.filter((row) => matches(row, query));

            return {
                /**
                 * Mantem compatibilidade com cursor MongoDB.
                 *
                 * @returns {Record<string, Function>} Cursor fake.
                 */
                sort() {
                    return this;
                },
                /**
                 * Devolve documentos filtrados.
                 *
                 * @returns {Promise<Record<string, unknown>[]>} Documentos.
                 */
                async toArray() {
                    return result;
                },
            };
        },

        /**
         * Insere um documento novo.
         *
         * @param {Record<string, unknown>} document Documento a inserir.
         * @returns {Promise<{ insertedId: ObjectId }>} Resultado fake.
         */
        async insertOne(document) {
            const insertedId = document._id ?? new ObjectId();
            rows.push({ ...document, _id: insertedId });
            return { insertedId };
        },

        /**
         * Atualiza ou cria um documento.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @param {Record<string, unknown>} update Operadores de update.
         * @param {{ upsert?: boolean }} options Opcoes.
         * @returns {Promise<{ matchedCount: number, modifiedCount: number }>} Resultado fake.
         */
        async updateOne(filter, update, options = {}) {
            const existing = rows.find((row) => matches(row, filter));

            if (existing) {
                applyUpdate(existing, update, false);
                return { matchedCount: 1, modifiedCount: 1 };
            }

            if (options.upsert) {
                rows.push(applyUpdate(rowFromFilter(filter), update, true));
            }

            return { matchedCount: 0, modifiedCount: 0 };
        },

        /**
         * Atualiza o primeiro documento encontrado e devolve o estado final.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @param {Record<string, unknown>} update Operadores de update.
         * @returns {Promise<Record<string, unknown> | null>} Documento final.
         */
        async findOneAndUpdate(filter, update) {
            const existing = rows.find((row) => matches(row, filter));

            if (!existing) {
                return null;
            }

            return applyUpdate(existing, update, false);
        },

        /**
         * Remove documentos correspondentes.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @returns {Promise<{ deletedCount: number }>} Contagem removida.
         */
        async deleteMany(filter) {
            const before = rows.length;
            rows = rows.filter((row) => !matches(row, filter));
            this.rows = rows;
            return { deletedCount: before - rows.length };
        },

        /**
         * Remove um documento correspondente.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @returns {Promise<{ deletedCount: number }>} Contagem removida.
         */
        async deleteOne(filter) {
            const index = rows.findIndex((row) => matches(row, filter));

            if (index === -1) {
                return { deletedCount: 0 };
            }

            rows.splice(index, 1);
            return { deletedCount: 1 };
        },

        /**
         * Atualiza todos os documentos correspondentes.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @param {Record<string, unknown>} update Operadores de update.
         * @returns {Promise<{ modifiedCount: number }>} Contagem alterada.
         */
        async updateMany(filter, update) {
            const matched = rows.filter((row) => matches(row, filter));
            matched.forEach((row) => applyUpdate(row, update, false));
            return { modifiedCount: matched.length };
        },

        /**
         * Suporta a agregacao simples usada por metricas MF5.
         *
         * @param {Record<string, unknown>[]} pipeline Pipeline MongoDB simplificado.
         * @returns {{ toArray: () => Promise<Record<string, unknown>[]> }} Cursor fake.
         */
        aggregate(pipeline = []) {
            let result = rows;
            const matchStage = pipeline.find((stage) => stage.$match);
            const groupStage = pipeline.find((stage) => stage.$group);

            if (matchStage) {
                result = result.filter((row) => matches(row, matchStage.$match));
            }

            return {
                async toArray() {
                    if (!groupStage) return result;

                    const field = String(groupStage.$group.total.$sum).slice(1);
                    const total = result.reduce(
                        (sum, row) => sum + Number(valueForPath(row, field) ?? 0),
                        0,
                    );
                    return [{ _id: null, total }];
                },
            };
        },
    };
}

/**
 * Instala colecoes em memoria e cria colecoes vazias estaveis por defeito.
 *
 * @param {Record<string, ReturnType<typeof collection>>} collections Colecoes fake.
 * @returns {Record<string, ReturnType<typeof collection>>} Colecoes instaladas.
 */
function setCollectionsForTests(collections) {
    setDbForTests({
        /**
         * Devolve a colecao pedida.
         *
         * @param {string} name Nome da colecao.
         * @returns {ReturnType<typeof collection>} Colecao fake.
         */
        collection(name) {
            collections[name] ??= collection([]);
            return collections[name];
        },
    });

    return collections;
}

afterEach(() => {
    setDbForTests(null);
});

test("MF5 valida eliminacao, consentimentos, admin users, metricas e integracoes", () => {
    assert.deepEqual(
        assertDeleteAccountPayload({
            confirmation: "ELIMINAR CONTA",
            password: "password1234",
        }),
        { confirmation: "ELIMINAR CONTA", password: "password1234" },
    );
    assert.throws(
        () => assertDeleteAccountPayload({ confirmation: "eliminar conta" }),
        /ELIMINAR CONTA/,
    );

    assert.deepEqual(
        assertConsentPayload({
            personalizedRecommendations: true,
            operationalNotifications: false,
            anonymousMetrics: true,
        }),
        {
            personalizedRecommendations: true,
            operationalNotifications: false,
            anonymousMetrics: true,
        },
    );
    assert.throws(
        () =>
            assertConsentPayload({
                personalizedRecommendations: "sim",
                operationalNotifications: false,
                anonymousMetrics: true,
            }),
        /verdadeiro ou falso/,
    );

    assert.deepEqual(assertAdminUserUpdate({ accountStatus: "blocked" }), {
        accountStatus: "blocked",
    });
    assert.equal(
        assertAdminUserFilters({ search: "ana.*", status: "active" }).status,
        "active",
    );
    assert.equal(assertAdminUserFilters({ status: "deleted" }).status, "deleted");
    assert.throws(
        () => assertAdminUserUpdate({ accountStatus: "deleted" }),
        /Estado de conta/,
    );
    assert.throws(() => assertAdminUserUpdate({ role: "owner" }), /Role/);

    assert.equal(assertMetricsRange({}).fromInclusive instanceof Date, true);
    assert.throws(
        () => assertMetricsRange({ from: "2026-12-01", to: "2026-01-01" }),
        /from/,
    );
    assert.throws(
        () => assertMetricsRange({ from: "2026-01-01T00:00:00.000Z" }),
        /YYYY-MM-DD/,
    );
    assert.throws(
        () => assertMetricsRange({ from: "2026-02-30" }),
        /data valida/,
    );
    const oneDay = assertMetricsRange({
        from: "2026-01-31",
        to: "2026-01-31",
    });
    assert.equal(oneDay.fromInclusive.toISOString(), "2026-01-31T00:00:00.000Z");
    assert.equal(oneDay.toExclusive.toISOString(), "2026-02-01T00:00:00.000Z");

    assert.equal(assertIntegrationKey("simulated_payments"), "simulated_payments");
    assert.deepEqual(
        assertIntegrationUpdate("simulated_payments", {
            enabled: true,
            mode: "simulation",
            publicConfig: {},
        }),
        {
            enabled: true,
            mode: "simulation",
            publicConfig: {},
        },
    );
    assert.deepEqual(
        assertIntegrationUpdate("internal_notifications", {
            enabled: true,
            mode: "internal",
            publicConfig: {},
        }).publicConfig,
        { channel: "in_app" },
    );
    assert.throws(
        () =>
            assertIntegrationUpdate("simulated_payments", {
                enabled: true,
                mode: "simulation",
                publicConfig: { apiKey: "abc" },
            }),
        /não aceita configuração pública/,
    );
    assert.throws(
        () =>
            assertIntegrationUpdate("simulated_payments", {
                enabled: true,
                mode: "manual",
                publicConfig: {},
            }),
        /Modo/,
    );
    assert.throws(
        () =>
            assertIntegrationUpdate("simulated_payments", {
                enabled: true,
                mode: "simulation",
                publicConfig: {},
                token: "campo-livre",
            }),
        /campos desconhecidos/,
    );
    assert.throws(() => assertIntegrationKey("stripe_real"), /Integracao/);
});

test("MF5 exportacao remove campos sensiveis e filtra por ownership", async () => {
    const userId = new ObjectId();
    const otherUserId = new ObjectId();

    setDbForTests({
        /**
         * Devolve colecoes em memoria conforme o nome pedido.
         *
         * @param {string} name Nome da colecao.
         * @returns {Record<string, Function>} Colecao fake.
         */
        collection(name) {
            const collections = {
                users: collection([
                    {
                        _id: userId,
                        name: "Ana",
                        email: "ana@example.com",
                        role: "user",
                        passwordHash: "hash",
                        tokenHash: "token",
                    },
                ]),
                playback_progress: collection([
                    {
                        _id: new ObjectId(),
                        userId,
                        contentId: new ObjectId(),
                        progressSeconds: 120,
                        sessionToken: "hidden",
                    },
                    {
                        _id: new ObjectId(),
                        userId: otherUserId,
                        progressSeconds: 20,
                    },
                ]),
            };

            return collections[name] ?? collection([]);
        },
    });

    const exported = await buildUserDataExport(String(userId));

    assert.equal(exported.user.email, "ana@example.com");
    assert.equal("passwordHash" in exported.user, false);
    assert.equal(exported.sections.playback_progress.length, 1);
    assert.equal(
        "sessionToken" in exported.sections.playback_progress[0],
        false,
    );
});

test("MF5 metricas admin usam dias UTC semiabertos e somam totalPoolCents", async () => {
    const from = "2026-01-01";
    const to = "2026-01-31";

    setCollectionsForTests({
        users: collection([
            { _id: new ObjectId(), accountStatus: "active" },
            { _id: new ObjectId() },
            { _id: new ObjectId(), accountStatus: null },
            { _id: new ObjectId(), accountStatus: "blocked" },
            { _id: new ObjectId(), accountStatus: "deleted" },
        ]),
        contents: collection([{ _id: new ObjectId(), status: "published" }]),
        subscriptions: collection([
            { _id: new ObjectId(), status: "active" },
            { _id: new ObjectId(), status: "trialing" },
        ]),
        notifications: collection([
            { _id: new ObjectId(), createdAt: new Date("2026-01-10T00:00:00.000Z") },
            { _id: new ObjectId(), createdAt: new Date("2026-01-31T23:59:59.999Z") },
            { _id: new ObjectId(), createdAt: new Date("2026-02-01T00:00:00.000Z") },
            { _id: new ObjectId(), createdAt: new Date("2025-12-10T00:00:00.000Z") },
        ]),
        privacy_deletion_requests: collection([
            { _id: new ObjectId(), requestedAt: new Date("2026-01-11T00:00:00.000Z") },
        ]),
        user_consent_events: collection([
            { _id: new ObjectId(), changedAt: new Date("2026-01-12T00:00:00.000Z") },
        ]),
        charities: collection([
            {
                _id: new ObjectId(),
                status: "active",
                poolStatus: "eligible",
            },
        ]),
        pool_distributions: collection([
            {
                _id: new ObjectId(),
                createdAt: new Date("2026-01-05T00:00:00.000Z"),
                totalPoolCents: 2500,
                totalCents: 999999,
            },
            {
                _id: new ObjectId(),
                createdAt: new Date("2026-01-20T00:00:00.000Z"),
                totalPoolCents: 700,
                totalCents: 999999,
            },
            {
                _id: new ObjectId(),
                createdAt: new Date("2025-12-20T00:00:00.000Z"),
                totalPoolCents: 4000,
            },
        ]),
    });

    const metrics = await getAdminMetrics({ from, to });

    assert.equal(metrics.users.active, 3);
    assert.equal(metrics.users.blocked, 1);
    assert.equal(metrics.users.deleted, 1);
    assert.equal(metrics.solidarity.distributedCents, 3200);
    assert.equal(metrics.notifications.created, 2);
    assert.deepEqual(metrics.range, { from, to });
});

test("MF5 contas bloqueadas nao entram por login nem por sessao existente", async () => {
    const userId = new ObjectId();
    const sessionId = new ObjectId();
    const token = createOpaqueToken();
    const collections = setCollectionsForTests({
        users: collection([
            {
                _id: userId,
                name: "Utilizador Bloqueado",
                email: "blocked@example.test",
                passwordHash: await hashPassword("password1234"),
                role: "user",
                accountStatus: "blocked",
            },
        ]),
        sessions: collection([
            {
                _id: sessionId,
                userId,
                tokenHash: hashToken(token),
                expiresAt: new Date("2027-01-01T00:00:00.000Z"),
            },
        ]),
    });

    await assert.rejects(
        () =>
            loginUser({
                email: "blocked@example.test",
                password: "password1234",
            }),
        /Credenciais inválidas/,
    );

    assert.equal(collections.sessions.rows.length, 1);
    assert.equal(await resolveSession(token), null);
    assert.equal(collections.sessions.rows.length, 0);
});

test("F8 sessão existente recusa conta inativa ou com estado desconhecido", async () => {
    for (const accountStatus of ["inactive", "unexpected_state"]) {
        const userId = new ObjectId();
        const token = createOpaqueToken();
        const collections = setCollectionsForTests({
            users: collection([
                {
                    _id: userId,
                    name: "Conta indisponível",
                    email: `${accountStatus}@example.test`,
                    role: "user",
                    accountStatus,
                },
            ]),
            sessions: collection([
                {
                    _id: new ObjectId(),
                    userId,
                    tokenHash: hashToken(token),
                    expiresAt: new Date("2999-01-01T00:00:00.000Z"),
                },
            ]),
        });

        assert.equal(await resolveSession(token), null);
        assert.equal(collections.sessions.rows.length, 0);
    }
});

test("MF5 gestao admin audita rota legacy e invalida sessoes ao bloquear", async () => {
    const actorUserId = new ObjectId();
    const targetUserId = new ObjectId();
    const collections = setCollectionsForTests({
        users: collection([
            {
                _id: actorUserId,
                name: "Admin",
                email: "admin@example.test",
                role: "admin",
                accountStatus: "active",
            },
            {
                _id: targetUserId,
                name: "Moderavel",
                email: "user@example.test",
                role: "user",
                accountStatus: "active",
            },
        ]),
        admin_audit_logs: collection([]),
        sessions: collection([
            { _id: new ObjectId(), userId: actorUserId },
            { _id: new ObjectId(), userId: targetUserId },
        ]),
    });

    await assert.rejects(
        () =>
            updateUserRole(String(actorUserId), String(actorUserId), {
                role: "user",
            }),
        /próprio acesso admin/u,
    );

    const roleUpdate = await updateUserRole(
        String(actorUserId),
        String(targetUserId),
        { role: "moderator" },
    );

    assert.equal(roleUpdate.role, "moderator");
    assert.equal(collections.admin_audit_logs.rows.length, 1);
    assert.equal(collections.admin_audit_logs.rows[0].action, "user.admin_update");

    const blocked = await updateUserByAdmin(
        String(actorUserId),
        String(targetUserId),
        { accountStatus: "blocked" },
    );

    assert.equal(blocked.accountStatus, "blocked");
    assert.equal(collections.admin_audit_logs.rows.length, 2);
    assert.deepEqual(
        collections.sessions.rows.map((session) => String(session.userId)),
        [String(actorUserId)],
    );

    await assert.rejects(
        () =>
            updateUserByAdmin(String(actorUserId), String(actorUserId), {
                accountStatus: "blocked",
            }),
        /própria conta/u,
    );
});

test("MF5 eliminacao de conta limpa dados pessoais e preserva historico agregado", async () => {
    const userId = new ObjectId();
    const otherUserId = new ObjectId();
    const personalCollectionNames = [
        "playback_progress",
        "media_preferences",
        "user_content_lists",
        "content_ratings",
        "notification_preferences",
        "notifications",
        "user_consents",
        "user_consent_events",
        "trials",
        "password_reset_tokens",
    ];
    const collections = Object.fromEntries(
        personalCollectionNames.map((name) => [
            name,
            collection([
                { _id: new ObjectId(), userId },
                { _id: new ObjectId(), userId: otherUserId },
            ]),
        ]),
    );
    collections.billing_customer_locks = collection([
        { _id: userId, userId },
        { _id: otherUserId, userId: otherUserId },
    ]);

    Object.assign(collections, {
        users: collection([
            {
                _id: userId,
                name: "Ana",
                email: "ana@example.test",
                passwordHash: await hashPassword("password1234"),
                role: "admin",
                accountStatus: "active",
            },
            {
                _id: otherUserId,
                name: "Outro Admin",
                email: "outro-admin@example.test",
                passwordHash: await hashPassword("password5678"),
                role: "admin",
                accountStatus: "active",
            },
        ]),
        content_comments: collection([
            {
                _id: new ObjectId(),
                userId,
                body: "Comentario",
                authorName: "Ana",
            },
            { _id: new ObjectId(), userId: otherUserId, body: "Outro" },
        ]),
        subscriptions: collection([
            { _id: new ObjectId(), userId, status: "active" },
            { _id: new ObjectId(), userId: otherUserId, status: "active" },
        ]),
        payment_attempts: collection([
            {
                _id: new ObjectId(),
                userId,
                email: "ana@example.test",
                status: "approved",
            },
            {
                _id: new ObjectId(),
                userId: otherUserId,
                email: "outra@example.test",
                status: "approved",
            },
        ]),
        password_reset_dev_outbox: collection([
            { _id: new ObjectId(), email: "ana@example.test" },
            { _id: new ObjectId(), email: "outra@example.test" },
        ]),
        subscription_family_memberships: collection([
            {
                _id: new ObjectId(),
                ownerUserId: userId,
                invitedEmail: "convite@example.test",
                status: "pending",
            },
        ]),
        charity_memberships: collection([
            { _id: new ObjectId(), userId, charityId: new ObjectId() },
            {
                _id: new ObjectId(),
                userId: otherUserId,
                charityId: new ObjectId(),
            },
        ]),
        sessions: collection([
            { _id: new ObjectId(), userId },
            { _id: new ObjectId(), userId: otherUserId },
        ]),
        privacy_deletion_requests: collection([]),
    });

    setCollectionsForTests(collections);

    const result = await deleteMyAccount(String(userId), {
        confirmation: "ELIMINAR CONTA",
        password: "password1234",
    });

    assert.equal(result.deleted, true);
    assert.equal(collections.playback_progress.rows.length, 1);
    assert.equal(String(collections.playback_progress.rows[0].userId), String(otherUserId));
    assert.equal(collections.sessions.rows.length, 1);
    assert.equal(collections.billing_customer_locks.rows.length, 1);
    assert.equal(collections.charity_memberships.rows.length, 1);
    assert.equal(
        String(collections.charity_memberships.rows[0].userId),
        String(otherUserId),
    );
    assert.equal(
        String(collections.billing_customer_locks.rows[0]._id),
        String(otherUserId),
    );
    assert.equal(String(collections.sessions.rows[0].userId), String(otherUserId));
    assert.equal(collections.content_comments.rows[0].deletedByUser, true);
    assert.equal(collections.content_comments.rows[0].authorName, "Conta eliminada");
    assert.equal("userId" in collections.content_comments.rows[0], false);
    assert.equal(collections.subscriptions.rows[0].status, "canceled");
    assert.equal(collections.subscriptions.rows[0].accountDeleted, true);
    assert.equal(collections.payment_attempts.rows[0].accountDeleted, true);
    assert.equal("email" in collections.payment_attempts.rows[0], false);
    assert.equal(collections.password_reset_dev_outbox.rows.length, 1);
    assert.equal(
        collections.password_reset_dev_outbox.rows[0].email,
        "outra@example.test",
    );
    assert.equal(
        "invitedEmail" in collections.subscription_family_memberships.rows[0],
        false,
    );
    assert.equal(collections.privacy_deletion_requests.rows.length, 1);
    assert.equal(collections.users.rows[0].accountStatus, "deleted");
    assert.equal(collections.users.rows[0].role, "user");
    assert.equal("passwordHash" in collections.users.rows[0], false);
});

test("MF5 último administrador ativo não pode eliminar a própria conta", async () => {
    const adminId = new ObjectId();
    const passwordHash = await hashPassword("password1234");
    const collections = {
        users: collection([
            {
                _id: adminId,
                name: "Admin",
                email: "admin@example.test",
                role: "admin",
                accountStatus: "active",
                passwordHash,
            },
            {
                _id: new ObjectId(),
                name: "Admin inativo",
                email: "admin-inativo@example.test",
                role: "admin",
                accountStatus: "inactive",
            },
        ]),
        admin_invariants: collection([]),
    };
    setCollectionsForTests(collections);

    await assert.rejects(
        () => deleteMyAccount(String(adminId), {
            confirmation: "ELIMINAR CONTA",
            password: "password1234",
        }),
        (error) => error.code === "LAST_ACTIVE_ADMIN",
    );
    assert.equal(collections.users.rows[0].accountStatus, "active");
    assert.ok(collections.users.rows[0].passwordHash);
});

test("MF5 consentimentos guardam estado atual e evento historico", async () => {
    const userId = new ObjectId();
    const collections = setCollectionsForTests({
        user_consents: collection([]),
        user_consent_events: collection([]),
    });
    const input = {
        personalizedRecommendations: false,
        operationalNotifications: true,
        anonymousMetrics: true,
    };

    const current = await updateMyConsents(String(userId), input);

    assert.deepEqual(current.consents, input);
    assert.equal(collections.user_consents.rows.length, 1);
    assert.deepEqual(collections.user_consents.rows[0].consents, input);
    assert.equal(collections.user_consent_events.rows.length, 1);
    assert.deepEqual(collections.user_consent_events.rows[0].consents, input);
});
