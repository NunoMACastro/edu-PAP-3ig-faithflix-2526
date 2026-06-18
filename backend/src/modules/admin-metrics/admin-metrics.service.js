// apps/backend/src/modules/admin-metrics/admin-metrics.service.js
import { getDb } from "../../config/database.js";
import { assertMetricsRange } from "./admin-metrics.validation.js";

/**
 * Conta documentos com fallback seguro para coleções vazias.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {string} collectionName Nome da coleção.
 * @param {Record<string, unknown>} query Filtro MongoDB.
 * @returns {Promise<number>} Total de documentos.
 */
async function count(db, collectionName, query = {}) {
    return db.collection(collectionName).countDocuments(query);
}

/**
 * Soma valores monetários em cêntimos sem devolver documentos individuais.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {string} collectionName Nome da coleção.
 * @param {Record<string, unknown>} match Filtro MongoDB.
 * @param {string} field Campo numérico a somar.
 * @returns {Promise<number>} Soma em cêntimos.
 */
async function sumCents(db, collectionName, match, field) {
    const [result] = await db
        .collection(collectionName)
        .aggregate([
            { $match: match },
            { $group: { _id: null, total: { $sum: `$${field}` } } },
        ])
        .toArray();

    return result?.total ?? 0;
}

/**
 * Calcula métricas agregadas para administração.
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
        contentsPublished,
        activeSubscriptions,
        trialSubscriptions,
        notificationsCreated,
        deletionRequests,
        consentEvents,
        approvedCharities,
        solidarityCents,
    ] = await Promise.all([
        count(db, "users"),
        // Contas eliminadas deixam de representar utilização activa da plataforma.
        count(db, "users", { accountStatus: { $nin: ["blocked", "deleted"] } }),
        count(db, "users", { accountStatus: "blocked" }),
        count(db, "contents", { status: "published" }),
        count(db, "subscriptions", { status: "active" }),
        count(db, "subscriptions", { status: "trialing" }),
        count(db, "notifications", createdInRange),
        count(db, "privacy_deletion_requests", createdInRange),
        count(db, "user_consent_events", createdInRange),
        count(db, "charities", { status: "active", poolStatus: "eligible" }),
        sumCents(db, "pool_distributions", createdInRange, "totalPoolCents"),
    ]);

    return {
        range: {
            from: from.toISOString(),
            to: to.toISOString(),
        },
        users: {
            total: usersTotal,
            active: usersActive,
            blocked: usersBlocked,
        },
        content: {
            published: contentsPublished,
        },
        subscriptions: {
            active: activeSubscriptions,
            trialing: trialSubscriptions,
        },
        notifications: {
            created: notificationsCreated,
        },
        privacy: {
            deletionRequests,
            consentEvents,
        },
        charities: {
            approvedInPool: approvedCharities,
            solidarityCents,
        },
    };
}