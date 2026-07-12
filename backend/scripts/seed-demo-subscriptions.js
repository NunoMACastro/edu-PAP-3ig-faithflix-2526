/**
 * @file Seed de subscricoes, trials, familia e pagamentos de demonstracao.
 */

import { ensureNotificationIndexes } from "../src/modules/notifications/notifications.service.js";
import { ensurePaymentIndexes } from "../src/modules/payments/payments.service.js";
import { ensureSubscriptionIndexes } from "../src/modules/subscriptions/subscriptions.service.js";
import {
    DEMO_FIXTURE,
    DEMO_NOW,
    DEMO_PERIOD_END,
    assertDemoUsersReady,
    deleteDemoDocs,
    demoDate,
    demoUserIds,
    demoUserIdList,
    getDemoDb,
    oid,
    runSeedCli,
} from "./demo-seed-utils.js";

/**
 * Cria dados operacionais de planos, pagamento simulado, trial e familia.
 *
 * @returns {Promise<object>} Resumo da execucao.
 */
export async function seedDemoSubscriptions() {
    const db = await getDemoDb();
    await assertDemoUsersReady(db);
    await ensureSubscriptionIndexes();
    await ensurePaymentIndexes();
    await ensureNotificationIndexes();

    await deleteDemoDocs(db, "subscription_family_memberships", [
        { ownerUserId: { $in: demoUserIdList } },
        { memberUserId: { $in: demoUserIdList } },
        { invitedEmail: { $in: ["familia-membro@faithflix.demo", "familia-convidado@faithflix.demo"] } },
    ]);
    await deleteDemoDocs(db, "payment_attempts", [{ userId: { $in: demoUserIdList } }]);
    await deleteDemoDocs(db, "trials", [{ userId: { $in: demoUserIdList } }]);
    await deleteDemoDocs(db, "subscriptions", [{ userId: { $in: demoUserIdList } }]);
    await deleteDemoDocs(db, "notifications", [{ userId: { $in: demoUserIdList } }]);

    await db.collection("subscriptions").insertMany([
        {
            userId: demoUserIds.pro,
            planCode: "faithflix-monthly",
            status: "active",
            currentPeriodStart: DEMO_NOW,
            currentPeriodEnd: DEMO_PERIOD_END,
            cancelAtPeriodEnd: false,
            demoFixture: DEMO_FIXTURE,
            createdAt: DEMO_NOW,
            updatedAt: DEMO_NOW,
        },
        {
            userId: demoUserIds.familyOwner,
            planCode: "faithflix-family-monthly",
            status: "active",
            currentPeriodStart: DEMO_NOW,
            currentPeriodEnd: DEMO_PERIOD_END,
            cancelAtPeriodEnd: false,
            demoFixture: DEMO_FIXTURE,
            createdAt: DEMO_NOW,
            updatedAt: DEMO_NOW,
        },
        {
            userId: demoUserIds.charityRepresentative,
            planCode: "trial",
            status: "trialing",
            currentPeriodStart: DEMO_NOW,
            currentPeriodEnd: demoDate(14),
            cancelAtPeriodEnd: true,
            demoFixture: DEMO_FIXTURE,
            createdAt: DEMO_NOW,
            updatedAt: DEMO_NOW,
        },
    ]);

    await db.collection("trials").insertOne({
        userId: demoUserIds.charityRepresentative,
        status: "active",
        startedAt: DEMO_NOW,
        endsAt: demoDate(14),
        demoFixture: DEMO_FIXTURE,
        createdAt: DEMO_NOW,
    });

    await db.collection("subscription_family_memberships").insertMany([
        {
            ownerUserId: demoUserIds.familyOwner,
            memberUserId: demoUserIds.familyMember,
            invitedEmail: "familia-membro@faithflix.demo",
            status: "active",
            invitedAt: demoDate(-2),
            acceptedAt: demoDate(-1),
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-2),
            updatedAt: demoDate(-1),
        },
        {
            ownerUserId: demoUserIds.familyOwner,
            memberUserId: demoUserIds.familyInvitee,
            invitedEmail: "familia-convidado@faithflix.demo",
            status: "pending",
            invitedAt: demoDate(-1),
            acceptedAt: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
            updatedAt: demoDate(-1),
        },
    ]);

    await db.collection("payment_attempts").insertMany([
        {
            _id: oid("65f610000000000000000001"),
            userId: demoUserIds.pro,
            planCode: "faithflix-monthly",
            paymentMethod: "card_test",
            provider: "faithflix-simulated",
            status: "approved",
            failureReason: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-8),
        },
        {
            _id: oid("65f610000000000000000002"),
            userId: demoUserIds.familyOwner,
            planCode: "faithflix-family-monthly",
            paymentMethod: "card_test",
            provider: "faithflix-simulated",
            status: "approved",
            failureReason: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-7),
        },
        {
            _id: oid("65f610000000000000000003"),
            userId: demoUserIds.familyInvitee,
            planCode: "faithflix-monthly",
            paymentMethod: "card_test_declined",
            provider: "faithflix-simulated",
            status: "failed",
            failureReason: "Pagamento simulado recusado.",
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
    ]);

    await db.collection("notifications").insertMany([
        {
            userId: demoUserIds.pro,
            type: "subscription_activated",
            title: "Subscricao ativa",
            message: "O plano Pro de demonstracao esta ativo.",
            readAt: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-8),
        },
        {
            userId: demoUserIds.familyInvitee,
            type: "family_invitation",
            title: "Convite familiar",
            message: "Tens um convite pendente para a familia FaithFlix Demo.",
            readAt: null,
            dedupeKey: "demo-family-invite",
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
        {
            userId: demoUserIds.familyInvitee,
            type: "payment_failed",
            title: "Pagamento recusado",
            message: "O pagamento simulado foi recusado para demonstracao.",
            readAt: null,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-1),
        },
    ]);

    return {
        subscriptions: 3,
        trials: 1,
        familyMemberships: 2,
        paymentAttempts: 3,
    };
}

await runSeedCli(import.meta.url, seedDemoSubscriptions, "Seed demo subscriptions");
