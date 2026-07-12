/** @file Inserção interna de planos, subscrições, família e pagamentos demo-v2. */

import { ensureDefaultSubscriptionPlans } from "../src/modules/subscriptions/subscriptions.service.js";
import { addBillingCycle } from "../src/modules/subscriptions/subscriptions.validation.js";
import {
    DEMO_FIXTURE,
    addDays,
    addMonths,
    deterministicId,
    getDemoContext,
    getDemoDb,
} from "./demo-seed-utils.js";

/** @param {Date} date Data. @returns {{anchorDay:number, anchorEndOfMonth:boolean}} Âncora. */
function billingAnchor(date) {
    const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    return { anchorDay: date.getUTCDate(), anchorEndOfMonth: date.getUTCDate() === lastDay };
}

/** @returns {Promise<object>} Resumo do módulo. */
export async function seedDemoSubscriptions() {
    const db = await getDemoDb();
    const ctx = getDemoContext();
    await ensureDefaultSubscriptionPlans({
        referenceDate: ctx.referenceDate,
        planIdFactory: (code) => deterministicId("subscription-plan", code, ctx.dataSeed),
    });
    await db.collection("subscription_plans").updateMany(
        { code: { $in: ["faithflix-monthly", "faithflix-yearly", "faithflix-family-monthly", "faithflix-family-yearly"] } },
        { $set: { demoFixture: DEMO_FIXTURE } },
    );
    const plans = await db.collection("subscription_plans").find({ active: true }).toArray();
    const plansByCode = new Map(plans.map((plan) => [plan.code, plan]));

    const subscriptionSpecs = [
        [ctx.userIds.pro, "faithflix-monthly", "active", -8, 1],
        [ctx.userIds.familyOwner, "faithflix-family-monthly", "active", -12, 1],
        [ctx.userIds.trial, "trial", "trialing", -1, 0],
        [ctx.userIds.charityRepresentative, "faithflix-yearly", "active", -40, 12],
        [ctx.userIds.generated1, "faithflix-yearly", "active", -90, 12],
        [ctx.userIds.generated2, "faithflix-monthly", "past_due", -40, -5],
        [ctx.userIds.generated3, "faithflix-monthly", "expired", -70, -35],
        [ctx.userIds.generated4, "faithflix-family-monthly", "canceled", -60, -30],
    ];
    const subscriptions = subscriptionSpecs.map(([userId, planCode, status, startDays, endMonths]) => {
        const currentPeriodStart = addDays(ctx.referenceDate, startDays);
        const plan = plansByCode.get(planCode);
        const currentPeriodEnd = status === "trialing"
            ? addDays(ctx.referenceDate, 13)
            : endMonths > 0
                ? addBillingCycle(
                    currentPeriodStart,
                    plan.interval,
                    billingAnchor(currentPeriodStart),
                )
                : addDays(ctx.referenceDate, endMonths);
        return {
            _id: deterministicId("subscription", String(userId), ctx.dataSeed),
            userId,
            planCode,
            status,
            currentPeriodStart,
            currentPeriodEnd,
            ...billingAnchor(currentPeriodStart),
            cancelAtPeriodEnd: ["trialing", "expired", "canceled"].includes(status),
            demoFixture: DEMO_FIXTURE,
            createdAt: currentPeriodStart,
            updatedAt: addDays(ctx.referenceDate, -1),
        };
    });
    await db.collection("subscriptions").insertMany(subscriptions);
    await db.collection("trials").insertOne({
        _id: deterministicId("trial", "active", ctx.dataSeed),
        userId: ctx.userIds.trial,
        operation: "trial",
        status: "active",
        startedAt: addDays(ctx.referenceDate, -1),
        endsAt: addDays(ctx.referenceDate, 13),
        idempotencyKey: "demo-v2-trial-active",
        requestHash: "demo-v2",
        demoFixture: DEMO_FIXTURE,
        createdAt: addDays(ctx.referenceDate, -1),
        updatedAt: addDays(ctx.referenceDate, -1),
    });

    const usersById = new Map(ctx.users.map((user) => [String(user._id), user]));
    const familySpecs = [
        [ctx.userIds.familyMember, "active", -10],
        [ctx.userIds.familyInvitee, "pending", -3],
        [ctx.userIds.generated5, "declined", -20],
        [ctx.userIds.generated6, "removed", -30],
        [ctx.userIds.generated7, "left", -40],
    ];
    const familyMemberships = familySpecs.map(([memberUserId, status, days], index) => ({
        _id: deterministicId("family-membership", index + 1, ctx.dataSeed),
        ownerUserId: ctx.userIds.familyOwner,
        memberUserId,
        invitedEmail: usersById.get(String(memberUserId)).email,
        status,
        invitedAt: addDays(ctx.referenceDate, days),
        acceptedAt: status === "active" ? addDays(ctx.referenceDate, days + 1) : null,
        ...(status === "declined" ? { declinedAt: addDays(ctx.referenceDate, days + 1) } : {}),
        ...(status === "removed" ? { removedAt: addDays(ctx.referenceDate, days + 2) } : {}),
        ...(status === "left" ? { leftAt: addDays(ctx.referenceDate, days + 2) } : {}),
        demoFixture: DEMO_FIXTURE,
        createdAt: addDays(ctx.referenceDate, days),
        updatedAt: addDays(ctx.referenceDate, Math.min(days + 2, -1)),
    }));
    await db.collection("subscription_family_memberships").insertMany(familyMemberships);

    const paymentUsers = ctx.users.filter((user) => user.accountStatus === "active" && user.role === "user");
    const approvedPayments = [];
    for (const [monthIndex, month] of ctx.distributionMonths.entries()) {
        const [year, monthNumber] = month.split("-").map(Number);
        const approvedAt = new Date(Date.UTC(year, monthNumber - 1, 10, 12));
        for (let index = 0; index < 4; index += 1) {
            const planCode = index % 2 === 0 ? "faithflix-monthly" : "faithflix-family-monthly";
            const plan = plansByCode.get(planCode);
            const user = paymentUsers[(monthIndex * 4 + index) % paymentUsers.length];
            approvedPayments.push({
                _id: deterministicId("payment-approved", `${month}:${index}`, ctx.dataSeed),
                schemaVersion: 2,
                operation: "simulated-checkout",
                userId: user._id,
                planCode,
                paymentMethod: "card_test",
                provider: "faithflix-simulated",
                status: "approved",
                failureReason: null,
                amountCents: plan.priceCents,
                currency: plan.currency,
                solidaritySharePercent: plan.solidaritySharePercent,
                approvedAt,
                cycle: { startsAt: approvedAt, endsAt: addMonths(approvedAt, 1) },
                accountingEstimate: false,
                idempotencyKey: `demo-v2-approved-${month}-${index}`,
                requestHash: `demo-v2-${month}-${index}`,
                response: { status: "approved" },
                demoFixture: DEMO_FIXTURE,
                createdAt: approvedAt,
                updatedAt: approvedAt,
            });
        }
    }
    const failedPayments = Array.from({ length: 4 }, (_, index) => {
        const plan = plansByCode.get("faithflix-monthly");
        const createdAt = addDays(ctx.referenceDate, -(index + 1));
        return {
            _id: deterministicId("payment-failed", index + 1, ctx.dataSeed),
            schemaVersion: 2,
            operation: "simulated-checkout",
            userId: paymentUsers[index]._id,
            planCode: plan.code,
            paymentMethod: "card_test_declined",
            provider: "faithflix-simulated",
            status: "failed",
            failureReason: "Pagamento recusado.",
            amountCents: plan.priceCents,
            currency: plan.currency,
            solidaritySharePercent: plan.solidaritySharePercent,
            approvedAt: null,
            cycle: null,
            accountingEstimate: false,
            idempotencyKey: `demo-v2-failed-${index + 1}`,
            requestHash: `demo-v2-failed-${index + 1}`,
            response: { status: "failed" },
            demoFixture: DEMO_FIXTURE,
            createdAt,
            updatedAt: createdAt,
        };
    });
    await db.collection("payment_attempts").insertMany([...approvedPayments, ...failedPayments]);

    return {
        plans: plans.length,
        subscriptions: subscriptions.length,
        trials: 1,
        familyMemberships: familyMemberships.length,
        paymentAttempts: approvedPayments.length + failedPayments.length,
    };
}
