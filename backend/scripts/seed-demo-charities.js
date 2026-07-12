/**
 * @file Seed de associacoes e pool solidaria de demonstracao FaithFlix.
 */

import { ensureCharityApplicationIndexes } from "../src/modules/charities/charity-applications.service.js";
import { ensureCharityReportIndexes } from "../src/modules/charities/charity-reports.service.js";
import { ensureCharityIndexes } from "../src/modules/charities/charity-review.service.js";
import { ensurePoolDistributionIndexes } from "../src/modules/charities/pool-distribution.service.js";
import {
    DEMO_FIXTURE,
    assertDemoUsersReady,
    assertNoManualConflicts,
    deleteDemoDocs,
    demoApplicationIds,
    demoCharityIds,
    demoCharityIdList,
    demoDate,
    demoDistributionMonths,
    demoUserIds,
    getDemoDb,
    runSeedCli,
} from "./demo-seed-utils.js";

const approvedApplications = [
    {
        _id: demoApplicationIds.vidaNova,
        name: "Associacao Vida Nova",
        contactName: "Marta Oliveira",
        email: "vida-nova@faithflix.demo",
        phone: "910000101",
        mission: "Acompanhamento espiritual, alimentar e familiar a pessoas em situacao de fragilidade social.",
        websiteUrl: "https://vida-nova.example.test/",
        charityId: demoCharityIds.vidaNova,
    },
    {
        _id: demoApplicationIds.paoPartilhado,
        name: "Pao Partilhado",
        contactName: "Rui Santos",
        email: "pao-partilhado@faithflix.demo",
        phone: "910000202",
        mission: "Distribuicao semanal de refeicoes e cabazes com equipas de voluntariado local.",
        websiteUrl: "https://pao-partilhado.example.test/",
        charityId: demoCharityIds.paoPartilhado,
    },
    {
        _id: demoApplicationIds.juventudeRaiz,
        name: "Juventude Raiz",
        contactName: "Ines Ferreira",
        email: "juventude-raiz@faithflix.demo",
        phone: "910000303",
        mission: "Mentoria, estudo acompanhado e projetos criativos para adolescentes e jovens adultos.",
        websiteUrl: "https://juventude-raiz.example.test/",
        charityId: demoCharityIds.juventudeRaiz,
    },
];

/**
 * Converte uma candidatura aprovada numa associacao elegivel.
 *
 * @param {object} application Candidatura aprovada.
 * @param {number} index Posicao.
 * @returns {object} Documento de associacao.
 */
function charityFromApplication(application, index) {
    return {
        _id: application.charityId,
        applicationId: application._id,
        name: application.name,
        mission: application.mission,
        websiteUrl: application.websiteUrl,
        contactEmail: application.email,
        status: "active",
        poolStatus: "eligible",
        approvedAt: demoDate(-16 + index),
        approvedBy: demoUserIds.admin,
        demoFixture: DEMO_FIXTURE,
        createdAt: demoDate(-16 + index),
        updatedAt: demoDate(-16 + index),
    };
}

/**
 * Cria candidaturas, associacoes elegiveis e distribuicoes mensais.
 *
 * @returns {Promise<object>} Resumo da execucao.
 */
export async function seedDemoCharities() {
    const db = await getDemoDb();
    await assertDemoUsersReady(db);
    await ensureCharityApplicationIndexes();
    await ensureCharityIndexes();
    await ensurePoolDistributionIndexes();
    await ensureCharityReportIndexes();

    await assertNoManualConflicts(
        db,
        "charity_applications",
        [
            { _id: { $in: Object.values(demoApplicationIds) } },
            { email: { $in: ["vida-nova@faithflix.demo", "pao-partilhado@faithflix.demo", "juventude-raiz@faithflix.demo", "casa-betania@faithflix.demo", "sem-documentos@faithflix.demo"] } },
        ],
        "Candidatura de associacao demo",
    );
    await assertNoManualConflicts(
        db,
        "charities",
        [
            { _id: { $in: demoCharityIdList } },
            { name: { $in: approvedApplications.map((application) => application.name) } },
        ],
        "Associacao demo",
    );
    await assertNoManualConflicts(
        db,
        "pool_distributions",
        demoDistributionMonths.map((month) => ({ month })),
        "Distribuicao mensal de demo",
    );

    await deleteDemoDocs(db, "charity_memberships", [
        { userId: demoUserIds.charityRepresentative },
        { charityId: { $in: demoCharityIdList } },
    ]);
    await deleteDemoDocs(db, "pool_distributions");
    await deleteDemoDocs(db, "charities");
    await deleteDemoDocs(db, "charity_applications");

    const applicationDocs = [
        ...approvedApplications.map((application, index) => ({
            _id: application._id,
            name: application.name,
            contactName: application.contactName,
            email: application.email,
            phone: application.phone,
            mission: application.mission,
            websiteUrl: application.websiteUrl,
            status: "approved",
            submittedAt: demoDate(-20 + index),
            reviewedAt: demoDate(-16 + index),
            reviewedBy: demoUserIds.admin,
            reviewReason: "",
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-20 + index),
            updatedAt: demoDate(-16 + index),
        })),
        {
            _id: demoApplicationIds.pending,
            name: "Casa Betania Jovem",
            contactName: "Tiago Martins",
            email: "casa-betania@faithflix.demo",
            phone: "910000404",
            mission: "Apoio de proximidade a jovens em risco atraves de tutoria, refeicoes e acompanhamento semanal.",
            websiteUrl: "https://casa-betania.example.test/",
            status: "pending",
            submittedAt: demoDate(-2),
            reviewedAt: null,
            reviewedBy: null,
            reviewReason: "",
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-2),
            updatedAt: demoDate(-2),
        },
        {
            _id: demoApplicationIds.rejected,
            name: "Projeto Sem Documentos Demo",
            contactName: "Contacto Incompleto",
            email: "sem-documentos@faithflix.demo",
            phone: "910000505",
            mission: "Candidatura rejeitada de demonstracao por falta de documentacao minima para entrar na pool solidaria.",
            websiteUrl: "https://sem-documentos.example.test/",
            status: "rejected",
            submittedAt: demoDate(-12),
            reviewedAt: demoDate(-10),
            reviewedBy: demoUserIds.admin,
            reviewReason: "Documentacao insuficiente para validacao inicial.",
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-12),
            updatedAt: demoDate(-10),
        },
    ];

    await db.collection("charity_applications").insertMany(applicationDocs);
    await db.collection("charities").insertMany(
        approvedApplications.map(charityFromApplication),
    );
    await db.collection("charity_memberships").insertOne({
        userId: demoUserIds.charityRepresentative,
        charityId: demoCharityIds.vidaNova,
        createdBy: demoUserIds.admin,
        demoFixture: DEMO_FIXTURE,
        createdAt: demoDate(-7),
        updatedAt: demoDate(-7),
    });

    await db.collection("pool_distributions").insertMany([
        {
            month: demoDistributionMonths[0],
            totalPoolCents: 6400,
            status: "completed",
            items: [
                { charityId: demoCharityIds.vidaNova, charityName: "Associacao Vida Nova", amountCents: 2134, rotationPosition: 1 },
                { charityId: demoCharityIds.paoPartilhado, charityName: "Pao Partilhado", amountCents: 2133, rotationPosition: 2 },
                { charityId: demoCharityIds.juventudeRaiz, charityName: "Juventude Raiz", amountCents: 2133, rotationPosition: 3 },
            ],
            createdBy: demoUserIds.admin,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-60),
        },
        {
            month: demoDistributionMonths[1],
            totalPoolCents: 7200,
            status: "completed",
            items: [
                { charityId: demoCharityIds.paoPartilhado, charityName: "Pao Partilhado", amountCents: 2400, rotationPosition: 1 },
                { charityId: demoCharityIds.juventudeRaiz, charityName: "Juventude Raiz", amountCents: 2400, rotationPosition: 2 },
                { charityId: demoCharityIds.vidaNova, charityName: "Associacao Vida Nova", amountCents: 2400, rotationPosition: 3 },
            ],
            createdBy: demoUserIds.admin,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-30),
        },
        {
            month: demoDistributionMonths[2],
            totalPoolCents: 8200,
            status: "completed",
            items: [
                { charityId: demoCharityIds.juventudeRaiz, charityName: "Juventude Raiz", amountCents: 2734, rotationPosition: 1 },
                { charityId: demoCharityIds.vidaNova, charityName: "Associacao Vida Nova", amountCents: 2733, rotationPosition: 2 },
                { charityId: demoCharityIds.paoPartilhado, charityName: "Pao Partilhado", amountCents: 2733, rotationPosition: 3 },
            ],
            createdBy: demoUserIds.admin,
            demoFixture: DEMO_FIXTURE,
            createdAt: demoDate(-2),
        },
    ]);

    return {
        approvedApplications: approvedApplications.length,
        pendingApplications: 1,
        rejectedApplications: 1,
        charities: approvedApplications.length,
        distributions: demoDistributionMonths.length,
    };
}

await runSeedCli(import.meta.url, seedDemoCharities, "Seed demo charities");
