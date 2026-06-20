/**
 * @file Service de metricas administrativas agregadas.
 */

import { getDb } from "../../config/database.js";
import { assertMetricsRange } from "./admin-metrics.validation.js";

/**
 * Conta documentos sem devolver detalhes individuais.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {string} collectionName Nome da colecao.
 * @param {Record<string, unknown>} [query={}] Filtro MongoDB.
 * @returns {Promise<number>} Total encontrado.
 */
async function count(db, collectionName, query = {}) {
    return db.collection(collectionName).countDocuments(query);
}

/**
 * Soma um campo em centimos mantendo resposta agregada.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {string} collectionName Nome da colecao.
 * @param {Record<string, unknown>} match Filtro MongoDB.
 * @param {string} field Campo numerico.
 * @returns {Promise<number>} Soma em centimos.
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
 * Calcula metricas administrativas de operacao sem expor dados pessoais.
 *
 * @param {{ from?: unknown, to?: unknown }} query Query string validavel.
 * @returns {Promise<Record<string, unknown>>} Metricas agregadas.
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
