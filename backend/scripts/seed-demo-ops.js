/** @file Configuração, privacidade e auditoria FaithFlix demo-v2. */

import { CONSENT_VERSION } from "../src/modules/privacy/privacy.validation.js";
import {
    ANONYMOUS_METRIC_CATEGORIES,
    ANONYMOUS_METRIC_TYPES,
} from "../src/modules/analytics/analytics.validation.js";
import {
    DEMO_FIXTURE,
    addDays,
    deterministicId,
    getDemoContext,
    getDemoDb,
} from "./demo-seed-utils.js";

/** @returns {Promise<object>} Resumo do módulo. */
export async function seedDemoOps() {
    const db = await getDemoDb();
    const ctx = getDemoContext();
    const integrations = [
        ["internal_notifications", "internal", { channel: "in_app" }],
        ["simulated_payments", "simulation", {}],
        ["aggregate_analytics_export", "manual", {}],
    ].map(([key, mode, publicConfig], index) => ({
        _id: deterministicId("integration", index + 1, ctx.dataSeed),
        key,
        enabled: true,
        mode,
        publicConfig,
        updatedBy: ctx.userIds.admin,
        createdAt: addDays(ctx.referenceDate, -40),
        updatedAt: addDays(ctx.referenceDate, -1),
    }));
    await db.collection("integration_settings").insertMany(integrations);

    const consentUsers = ctx.users.filter((user) => user.accountStatus === "active").slice(0, 12);
    const consents = consentUsers.map((user, index) => ({
        _id: deterministicId("consent", index + 1, ctx.dataSeed),
        userId: user._id,
        version: CONSENT_VERSION,
        consents: {
            personalizedRecommendations:
                user.key === "coldStart" ||
                user.key === "pro" ||
                (user.key !== "charityRepresentative" && index % 3 !== 0),
            operationalNotifications: true,
            anonymousMetrics: index % 2 === 0,
        },
        demoFixture: DEMO_FIXTURE,
        createdAt: addDays(ctx.referenceDate, -60),
        updatedAt: addDays(ctx.referenceDate, -1),
    }));
    await db.collection("user_consents").insertMany(consents);
    const consentEvents = Array.from({ length: 24 }, (_, index) => {
        const consent = consents[index % consents.length];
        return {
            _id: deterministicId("consent-event", index + 1, ctx.dataSeed),
            userId: consent.userId,
            version: CONSENT_VERSION,
            consents: consent.consents,
            demoFixture: DEMO_FIXTURE,
            changedAt: addDays(ctx.referenceDate, -(1 + (index % 25))),
        };
    });
    await db.collection("user_consent_events").insertMany(consentEvents);

    // Estes documentos replicam exatamente o contrato de produção: não têm
    // marker demo, userId, IP, requestId nem qualquer identificador de conteúdo.
    const anonymousMetricEvents = Array.from({ length: 24 }, (_, index) => {
        const sourceDay = addDays(ctx.referenceDate, -(index % 12));
        const day = new Date(Date.UTC(
            sourceDay.getUTCFullYear(),
            sourceDay.getUTCMonth(),
            sourceDay.getUTCDate(),
        ));
        return {
            type: ANONYMOUS_METRIC_TYPES[index % ANONYMOUS_METRIC_TYPES.length],
            category: ANONYMOUS_METRIC_CATEGORIES[index % ANONYMOUS_METRIC_CATEGORIES.length],
            day,
            expiresAt: addDays(day, 90),
        };
    });
    await db.collection("anonymous_metric_events").insertMany(anonymousMetricEvents);

    const deletedUsers = ctx.users.filter((user) => user.accountStatus === "deleted");
    const deletionRequests = deletedUsers.map((user, index) => ({
        _id: deterministicId("deletion-request", index + 1, ctx.dataSeed),
        userId: user._id,
        requestedAt: user.deletedAt ?? addDays(ctx.referenceDate, -(3 + index)),
        accountStatusBefore: "active",
        demoFixture: DEMO_FIXTURE,
    }));
    await db.collection("privacy_deletion_requests").insertMany(deletionRequests);

    const existingAuditCount = await db.collection("admin_audit_logs").countDocuments({ demoFixture: DEMO_FIXTURE });
    const manualAuditCount = Math.max(30 - existingAuditCount, 18);
    const auditLogs = Array.from({ length: manualAuditCount }, (_, index) => ({
        _id: deterministicId("audit-log", index + 1, ctx.dataSeed),
        actorUserId: index % 2 === 0 ? ctx.userIds.admin : ctx.userIds.adminBackup,
        action: ["demo.seed", "catalog.update", "user.admin_update", "integration.update"][index % 4],
        targetType: ["system", "content", "user", "integration"][index % 4],
        targetId: String(deterministicId("audit-target", index + 1, ctx.dataSeed)),
        before: null,
        after: { demo: true, sequence: index + 1 },
        metadata: { source: "seed:demo" },
        operationId: `demo-v2-audit-${index + 1}`,
        demoFixture: DEMO_FIXTURE,
        createdAt: addDays(ctx.referenceDate, -(index % 25)),
    }));
    await db.collection("admin_audit_logs").insertMany(auditLogs);

    return {
        integrations: integrations.length,
        consents: consents.length,
        consentEvents: consentEvents.length,
        anonymousMetricEvents: anonymousMetricEvents.length,
        deletionRequests: deletionRequests.length,
        auditLogs: existingAuditCount + auditLogs.length,
    };
}
