/**
 * @file Service de metricas administrativas agregadas.
 */

import { getDb } from "../../config/database.js";
import { listIntegrationSettings } from "../integrations/integrations.service.js";
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
    const { fromInclusive, toExclusive } = assertMetricsRange(query);
    const db = await getDb();
    const range = { $gte: fromInclusive, $lt: toExclusive };
    const createdInRange = { createdAt: range };

    const [
        usersTotal,
        usersActive,
        usersBlocked,
        usersDeleted,
        contentsPublished,
        contentsDraft,
        contentsArchived,
        mediaPending,
        mediaFailed,
        activeSubscriptions,
        trialSubscriptions,
        activeFamilyMemberships,
        pendingFamilyInvitations,
        notificationsCreated,
        deletionRequests,
        consentEvents,
        approvedCharities,
        pendingApplications,
        solidarityCents,
        integrations,
        catalogViews,
        searchSubmits,
        playbackStarted,
        playbackCompleted,
    ] = await Promise.all([
        count(db, "users"),
        count(db, "users", {
            $or: [
                { accountStatus: "active" },
                { accountStatus: null },
                { accountStatus: { $exists: false } },
            ],
        }),
        count(db, "users", { accountStatus: "blocked" }),
        count(db, "users", { accountStatus: "deleted" }),
        count(db, "contents", { status: "published" }),
        count(db, "contents", { status: "draft" }),
        count(db, "contents", { status: "archived" }),
        count(db, "contents", { mediaStatus: "pending" }),
        count(db, "contents", { mediaStatus: "failed" }),
        count(db, "subscriptions", { status: "active" }),
        count(db, "subscriptions", { status: "trialing" }),
        count(db, "subscription_family_memberships", { status: "active" }),
        count(db, "subscription_family_memberships", { status: "pending" }),
        count(db, "notifications", createdInRange),
        count(db, "privacy_deletion_requests", {
            requestedAt: range,
        }),
        count(db, "user_consent_events", {
            changedAt: range,
        }),
        count(db, "charities", { status: "active", poolStatus: "eligible" }),
        count(db, "charity_applications", { status: "pending" }),
        sumCents(db, "pool_distributions", createdInRange, "totalPoolCents"),
        listIntegrationSettings({ db }),
        count(db, "anonymous_metric_events", {
            day: range,
            type: "catalog_view",
        }),
        count(db, "anonymous_metric_events", {
            day: range,
            type: "search_submit",
        }),
        count(db, "anonymous_metric_events", {
            day: range,
            type: "playback_started",
        }),
        count(db, "anonymous_metric_events", {
            day: range,
            type: "playback_completed",
        }),
    ]);

    return {
        generatedAt: new Date().toISOString(),
        range: {
            from: fromInclusive.toISOString().slice(0, 10),
            to: new Date(toExclusive.getTime() - 1).toISOString().slice(0, 10),
        },
        users: {
            total: usersTotal,
            active: usersActive,
            blocked: usersBlocked,
            deleted: usersDeleted,
        },
        catalog: {
            published: contentsPublished,
            draft: contentsDraft,
            archived: contentsArchived,
            mediaPending,
            mediaFailed,
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
            pendingApplications,
            distributedCents: solidarityCents,
        },
        integrations: {
            total: integrations.length,
            enabled: integrations.filter((item) => item.enabled).length,
            disabled: integrations.filter((item) => !item.enabled).length,
            invalid: integrations.filter((item) => !item.configurationValid).length,
        },
        anonymousMetrics: {
            total:
                catalogViews +
                searchSubmits +
                playbackStarted +
                playbackCompleted,
            byType: {
                catalog_view: catalogViews,
                search_submit: searchSubmits,
                playback_started: playbackStarted,
                playback_completed: playbackCompleted,
            },
        },
    };
}

/**
 * Converte apenas totais agregados para CSV, sem linhas individuais ou PII.
 *
 * @param {{ from?: unknown, to?: unknown }} query Intervalo civil UTC.
 * @returns {Promise<string>} CSV UTF-8 com cabeçalho estável.
 */
export async function exportAdminMetricsCsv(query = {}) {
    const metrics = await getAdminMetrics(query);
    const rows = [
        ["range.from", metrics.range.from],
        ["range.to", metrics.range.to],
        ["users.total", metrics.users.total],
        ["users.active", metrics.users.active],
        ["users.blocked", metrics.users.blocked],
        ["users.deleted", metrics.users.deleted],
        ["catalog.published", metrics.catalog.published],
        ["catalog.draft", metrics.catalog.draft],
        ["catalog.archived", metrics.catalog.archived],
        ["catalog.mediaPending", metrics.catalog.mediaPending],
        ["catalog.mediaFailed", metrics.catalog.mediaFailed],
        ["subscriptions.active", metrics.subscriptions.active],
        ["subscriptions.trialing", metrics.subscriptions.trialing],
        ["subscriptions.familyMembers", metrics.subscriptions.familyMembers],
        ["subscriptions.familyInvitationsPending", metrics.subscriptions.familyInvitationsPending],
        ["privacy.deletionRequests", metrics.privacy.deletionRequests],
        ["privacy.consentEvents", metrics.privacy.consentEvents],
        ["notifications.created", metrics.notifications.created],
        ["solidarity.approvedCharities", metrics.solidarity.approvedCharities],
        ["solidarity.pendingApplications", metrics.solidarity.pendingApplications],
        ["solidarity.distributedCents", metrics.solidarity.distributedCents],
        ["integrations.total", metrics.integrations.total],
        ["integrations.enabled", metrics.integrations.enabled],
        ["integrations.disabled", metrics.integrations.disabled],
        ["integrations.invalid", metrics.integrations.invalid],
        ["anonymousMetrics.total", metrics.anonymousMetrics.total],
        ["anonymousMetrics.catalog_view", metrics.anonymousMetrics.byType.catalog_view],
        ["anonymousMetrics.search_submit", metrics.anonymousMetrics.byType.search_submit],
        ["anonymousMetrics.playback_started", metrics.anonymousMetrics.byType.playback_started],
        ["anonymousMetrics.playback_completed", metrics.anonymousMetrics.byType.playback_completed],
    ];

    return ["metric,value", ...rows.map(([metric, value]) => `${metric},${value}`)]
        .join("\n");
}
