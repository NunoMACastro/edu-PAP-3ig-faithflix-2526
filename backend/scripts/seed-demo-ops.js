/**
 * @file Seed de configuracao operacional, privacidade e auditoria demo.
 */

import { CONSENT_VERSION } from "../src/modules/privacy/privacy.validation.js";
import {
    DEMO_FIXTURE,
    assertDemoUsersReady,
    deleteDemoDocs,
    demoDate,
    demoUserIds,
    demoUserIdList,
    getDemoDb,
    runSeedCli,
} from "./demo-seed-utils.js";

const integrationSettings = [
    {
        key: "internal_notifications",
        enabled: true,
        mode: "internal",
        publicConfig: {
            delivery: "in-app",
            demo: "true",
        },
    },
    {
        key: "simulated_payments",
        enabled: true,
        mode: "simulation",
        publicConfig: {
            provider: "faithflix-simulated",
            acceptedMethods: "card_test,card_test_declined",
        },
    },
    {
        key: "aggregate_analytics_export",
        enabled: true,
        mode: "manual",
        publicConfig: {
            format: "csv",
            cadence: "mensal",
        },
    },
];

/**
 * Cria configuracao admin e dados agregaveis de privacidade/auditoria.
 *
 * @returns {Promise<object>} Resumo da execucao.
 */
export async function seedDemoOps() {
    const db = await getDemoDb();
    await assertDemoUsersReady(db);

    await deleteDemoDocs(db, "integration_settings");
    await deleteDemoDocs(db, "admin_audit_logs", [
        { actorUserId: { $in: demoUserIdList } },
        { targetUserId: { $in: demoUserIdList } },
    ]);
    await deleteDemoDocs(db, "user_consents", [{ userId: { $in: demoUserIdList } }]);
    await deleteDemoDocs(db, "user_consent_events", [{ userId: { $in: demoUserIdList } }]);
    await deleteDemoDocs(db, "privacy_deletion_requests", [{ userId: { $in: demoUserIdList } }]);

    const integrationDocs = [];
    for (const setting of integrationSettings) {
        const existing = await db.collection("integration_settings").findOne({
            key: setting.key,
            demoFixture: { $ne: DEMO_FIXTURE },
        });

        if (!existing) {
            integrationDocs.push({
                ...setting,
                updatedBy: demoUserIds.admin,
                demoFixture: DEMO_FIXTURE,
                createdAt: demoDate(-4),
                updatedAt: demoDate(-1),
            });
        }
    }

    if (integrationDocs.length > 0) {
        await db.collection("integration_settings").insertMany(integrationDocs);
    }

    await db.collection("user_consents").insertMany([
        {
            userId: demoUserIds.pro,
            version: CONSENT_VERSION,
            consents: {
                personalizedRecommendations: true,
                operationalNotifications: true,
                anonymousMetrics: true,
            },
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-8),
            updatedAt: demoDate(-1),
        },
        {
            userId: demoUserIds.familyOwner,
            version: CONSENT_VERSION,
            consents: {
                personalizedRecommendations: true,
                operationalNotifications: true,
                anonymousMetrics: false,
            },
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-8),
            updatedAt: demoDate(-1),
        },
        {
            userId: demoUserIds.charityRepresentative,
            version: CONSENT_VERSION,
            consents: {
                personalizedRecommendations: false,
                operationalNotifications: true,
                anonymousMetrics: true,
            },
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-8),
            updatedAt: demoDate(-1),
        },
    ]);

    await db.collection("user_consent_events").insertMany([
        {
            userId: demoUserIds.pro,
            version: CONSENT_VERSION,
            consents: {
                personalizedRecommendations: true,
                operationalNotifications: true,
                anonymousMetrics: true,
            },
            demoFixture: DEMO_FIXTURE,
            changedAt: demoDate(-1),
        },
        {
            userId: demoUserIds.familyOwner,
            version: CONSENT_VERSION,
            consents: {
                personalizedRecommendations: true,
                operationalNotifications: true,
                anonymousMetrics: false,
            },
            demoFixture: DEMO_FIXTURE,
            changedAt: demoDate(-1),
        },
    ]);

    await db.collection("privacy_deletion_requests").insertOne({
        userId: demoUserIds.familyInvitee,
        requestedAt: demoDate(-1),
        accountStatusBefore: "active",
        demoFixture: DEMO_FIXTURE,
    });

    await db.collection("admin_audit_logs").insertMany([
        {
            actorUserId: demoUserIds.admin,
            action: "demo.seed",
            targetType: "system",
            targetKey: "demo-v1",
            changes: { scope: "seed:demo" },
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            actorUserId: demoUserIds.admin,
            action: "integration.update",
            targetType: "integration",
            targetKey: "simulated_payments",
            changes: {
                enabled: true,
                mode: "simulation",
                publicConfig: { provider: "faithflix-simulated" },
            },
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            actorUserId: demoUserIds.admin,
            action: "user.admin_update",
            targetType: "user",
            targetUserId: demoUserIds.moderator,
            changes: { role: "moderator" },
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
    ]);

    return {
        integrationsInserted: integrationDocs.length,
        consents: 3,
        consentEvents: 2,
        deletionRequests: 1,
        auditLogs: 3,
    };
}

await runSeedCli(import.meta.url, seedDemoOps, "Seed demo ops");
