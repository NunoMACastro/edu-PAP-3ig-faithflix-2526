/** @file Candidaturas, associações e pool financeira FaithFlix demo-v2. */

import { runMonthlyDistribution } from "../src/modules/charities/pool-distribution.service.js";
import {
    DEMO_FIXTURE,
    addDays,
    deterministicId,
    getDemoContext,
    getDemoDb,
} from "./demo-seed-utils.js";

const APPROVED_CHARITIES = [
    {
        name: "Associação Vida Nova",
        mission: "Acompanha famílias em transição, criando redes locais de apoio, escuta e autonomia.",
    },
    {
        name: "Pão Partilhado",
        mission: "Combate a insegurança alimentar através de cabazes, refeições comunitárias e proximidade continuada.",
    },
    {
        name: "Juventude Raiz",
        mission: "Cria mentoria, estudo acompanhado e atividades seguras para crianças e jovens da comunidade.",
    },
    {
        name: "Casa de Esperança",
        mission: "Oferece acolhimento temporário e acompanhamento humano a pessoas que precisam de recomeçar.",
    },
    {
        name: "Rede Bom Samaritano",
        mission: "Mobiliza voluntários para visitas, transporte e apoio prático a pessoas idosas ou isoladas.",
    },
    {
        name: "Projeto Ponte Viva",
        mission: "Liga comunidades, escolas e famílias para promover inclusão, capacitação e oportunidades locais.",
    },
];

/** @returns {Promise<object>} Resumo do módulo. */
export async function seedDemoCharities() {
    const db = await getDemoDb();
    const ctx = getDemoContext();
    const firstMonthStart = new Date(`${ctx.distributionMonths[0]}-01T00:00:00.000Z`);
    const applications = Array.from({ length: 34 }, (_, index) => {
        const approvedCharity = APPROVED_CHARITIES[index];
        const status = index < 6 ? "approved" : index < 30 ? "pending" : "rejected";
        const submittedAt = status === "approved"
            ? addDays(firstMonthStart, -(70 - index))
            : addDays(ctx.referenceDate, -(1 + (index % 25)));
        const reviewedAt = status === "pending" ? null : addDays(submittedAt, 3);
        return {
            _id: deterministicId("charity-application", index + 1, ctx.dataSeed),
            name: approvedCharity?.name ?? `Candidatura Associação Demo ${String(index + 1).padStart(2, "0")}`,
            contactName: `Contacto Demo ${index + 1}`,
            email: `candidatura-${String(index + 1).padStart(2, "0")}@faithflix.demo`,
            phone: `910${String(index + 1).padStart(6, "0")}`,
            mission: approvedCharity?.mission ?? "Apoio comunitário, acompanhamento familiar e voluntariado local com valores cristãos.",
            websiteUrl: `https://associacao-${index + 1}.example.test/`,
            status,
            submittedAt,
            reviewedAt,
            reviewedBy: status === "pending" ? null : ctx.userIds.admin,
            reviewReason: status === "rejected" ? "A documentação apresentada não permite validar a candidatura." : "",
            demoFixture: DEMO_FIXTURE,
            createdAt: submittedAt,
            updatedAt: reviewedAt ?? submittedAt,
        };
    });
    await db.collection("charity_applications").insertMany(applications);

    const charities = applications.slice(0, 6).map((application, index) => ({
        _id: deterministicId("charity", index + 1, ctx.dataSeed),
        applicationId: application._id,
        name: application.name,
        mission: application.mission,
        websiteUrl: application.websiteUrl,
        contactEmail: application.email,
        status: "active",
        poolStatus: "eligible",
        approvedAt: application.reviewedAt,
        approvedBy: ctx.userIds.admin,
        demoFixture: DEMO_FIXTURE,
        createdAt: application.reviewedAt,
        updatedAt: application.reviewedAt,
    }));
    await db.collection("charities").insertMany(charities);
    const membershipUsers = [ctx.userIds.charityRepresentative, ctx.userIds.generated8, ctx.userIds.generated9];
    const charityMemberships = membershipUsers.map((userId, index) => ({
        _id: deterministicId("charity-membership", index + 1, ctx.dataSeed),
        userId,
        charityId: charities[index]._id,
        createdBy: ctx.userIds.admin,
        demoFixture: DEMO_FIXTURE,
        createdAt: addDays(ctx.referenceDate, -(20 - index)),
        updatedAt: addDays(ctx.referenceDate, -(20 - index)),
    }));
    await db.collection("charity_memberships").insertMany(charityMemberships);

    for (const month of ctx.distributionMonths) {
        const requestId = `demo-seed-pool-${month}`;
        const result = await runMonthlyDistribution(String(month), String(ctx.userIds.admin), {
            referenceDate: ctx.referenceDate,
            trigger: "admin",
            requestId,
            distributionId: deterministicId("pool-distribution", month, ctx.dataSeed),
            auditId: deterministicId("pool-distribution-audit", month, ctx.dataSeed),
        });
        await db.collection("pool_distributions").updateOne(
            { month },
            { $set: { demoFixture: DEMO_FIXTURE } },
        );
        await db.collection("admin_audit_logs").updateMany(
            { requestId },
            { $set: { demoFixture: DEMO_FIXTURE, createdAt: ctx.referenceDate } },
        );
        if (!result.distribution?.id) throw new Error(`Distribuição demo ${month} sem id persistido.`);
    }

    return {
        applications: applications.length,
        charities: charities.length,
        memberships: charityMemberships.length,
        distributions: ctx.distributionMonths.length,
    };
}
