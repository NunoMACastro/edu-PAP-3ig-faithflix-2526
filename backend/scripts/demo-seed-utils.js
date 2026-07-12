/**
 * @file Utilitarios partilhados pelos seeds de demonstracao FaithFlix.
 */

import { pathToFileURL } from "node:url";
import { ObjectId } from "mongodb";
import { getDb } from "../src/config/database.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";

export const DEMO_FIXTURE = "demo-v1";
export const DEMO_PASSWORD = "password-segura-123";
export const DEMO_NOW = new Date("2026-07-07T12:00:00.000Z");
export const DEMO_PERIOD_END = new Date("2999-01-01T00:00:00.000Z");

/**
 * Cria um ObjectId deterministico para fixtures de demonstracao.
 *
 * @param {string} value Valor hexadecimal de 24 caracteres.
 * @returns {ObjectId} ObjectId MongoDB.
 */
export function oid(value) {
    return new ObjectId(value);
}

export const demoUserIds = {
    admin: oid("65f100000000000000000001"),
    moderator: oid("65f100000000000000000002"),
    pro: oid("65f100000000000000000003"),
    familyOwner: oid("65f100000000000000000004"),
    familyMember: oid("65f100000000000000000005"),
    familyInvitee: oid("65f100000000000000000006"),
    charityRepresentative: oid("65f100000000000000000007"),
};

export const demoTaxonomyIds = {
    family: oid("65f200000000000000000001"),
    documentaries: oid("65f200000000000000000002"),
    youth: oid("65f200000000000000000003"),
    testimonies: oid("65f200000000000000000004"),
    bible: oid("65f200000000000000000005"),
    service: oid("65f200000000000000000006"),
};

export const demoContentIds = {
    jornadaElias: oid("65f300000000000000000001"),
    luzesVale: oid("65f300000000000000000002"),
    familiaOracao: oid("65f300000000000000000003"),
    familiaOracaoEp1: oid("65f300000000000000000004"),
    caminhoServico: oid("65f300000000000000000005"),
    juventudeProposito: oid("65f300000000000000000006"),
    depoisTempestade: oid("65f300000000000000000007"),
    mesaAberta: oid("65f300000000000000000008"),
    cartasPaulo: oid("65f300000000000000000009"),
    bomPastor: oid("65f30000000000000000000a"),
    projetoNeemias: oid("65f30000000000000000000b"),
    arquivoTestemunho: oid("65f30000000000000000000c"),
    raizesGraca: oid("65f30000000000000000000d"),
    vozesCapela: oid("65f30000000000000000000e"),
    planoSabado: oid("65f30000000000000000000f"),
    ponteBairro: oid("65f300000000000000000010"),
    salmosCasa: oid("65f300000000000000000011"),
    diarioMissao: oid("65f300000000000000000012"),
    pequenosRecomecos: oid("65f300000000000000000013"),
    laboratorioEsperanca: oid("65f300000000000000000014"),
    noiteLouvor: oid("65f300000000000000000015"),
    cuidarQuemCuida: oid("65f300000000000000000016"),
    entreGeracoes: oid("65f300000000000000000017"),
    chamadosServir: oid("65f300000000000000000018"),
};

export const demoApplicationIds = {
    vidaNova: oid("65f410000000000000000001"),
    paoPartilhado: oid("65f410000000000000000002"),
    juventudeRaiz: oid("65f410000000000000000003"),
    pending: oid("65f410000000000000000004"),
    rejected: oid("65f410000000000000000005"),
};

export const demoCharityIds = {
    vidaNova: oid("65f420000000000000000001"),
    paoPartilhado: oid("65f420000000000000000002"),
    juventudeRaiz: oid("65f420000000000000000003"),
};

export const demoPassageIds = [
    oid("65f500000000000000000001"),
    oid("65f500000000000000000002"),
    oid("65f500000000000000000003"),
    oid("65f500000000000000000004"),
    oid("65f500000000000000000005"),
    oid("65f500000000000000000006"),
    oid("65f500000000000000000007"),
    oid("65f500000000000000000008"),
];

export const demoDistributionMonths = ["2026-07", "2026-08", "2026-09"];

export const demoUsers = {
    admin: {
        _id: demoUserIds.admin,
        name: "Admin FaithFlix Demo",
        email: "admin@faithflix.demo",
        role: "admin",
        parentalMaxAgeRating: 18,
    },
    moderator: {
        _id: demoUserIds.moderator,
        name: "Moderadora Editorial Demo",
        email: "moderador@faithflix.demo",
        role: "moderator",
        parentalMaxAgeRating: 18,
    },
    pro: {
        _id: demoUserIds.pro,
        name: "Utilizador Pro Demo",
        email: "pro@faithflix.demo",
        role: "user",
        parentalMaxAgeRating: 18,
    },
    familyOwner: {
        _id: demoUserIds.familyOwner,
        name: "Responsavel Familia Demo",
        email: "familia-owner@faithflix.demo",
        role: "user",
        parentalMaxAgeRating: 18,
    },
    familyMember: {
        _id: demoUserIds.familyMember,
        name: "Membro Familia Demo",
        email: "familia-membro@faithflix.demo",
        role: "user",
        parentalMaxAgeRating: 12,
    },
    familyInvitee: {
        _id: demoUserIds.familyInvitee,
        name: "Convidado Familia Demo",
        email: "familia-convidado@faithflix.demo",
        role: "user",
        parentalMaxAgeRating: 18,
    },
    charityRepresentative: {
        _id: demoUserIds.charityRepresentative,
        name: "Representante Associacao Demo",
        email: "associacao@faithflix.demo",
        role: "user",
        parentalMaxAgeRating: 18,
    },
};

export const demoUserIdList = Object.values(demoUserIds);
export const demoUserEmails = Object.values(demoUsers).map((user) => user.email);
export const demoContentIdList = Object.values(demoContentIds);
export const demoTaxonomyIdList = Object.values(demoTaxonomyIds);
export const demoCharityIdList = Object.values(demoCharityIds);

/**
 * Devolve a base de dados configurada no `.env` do backend.
 *
 * @returns {Promise<import("mongodb").Db>} Base de dados configurada.
 */
export function getDemoDb() {
    return getDb();
}

/**
 * Apaga apenas documentos marcados como demo e, opcionalmente, artefactos
 * derivados dos ids fixos da demo.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {string} collectionName Colecao.
 * @param {object[]} [extraClauses=[]] Condicoes adicionais seguras.
 * @returns {Promise<number>} Numero de documentos removidos.
 */
export async function deleteDemoDocs(db, collectionName, extraClauses = []) {
    const clauses = [{ demoFixture: DEMO_FIXTURE }, ...extraClauses];
    const result = await db.collection(collectionName).deleteMany({ $or: clauses });
    return result.deletedCount ?? 0;
}

/**
 * Falha cedo se um id, slug, email ou mes reservado pela demo ja pertence a
 * dados nao marcados como demo.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {string} collectionName Colecao.
 * @param {object[]} clauses Condicoes de conflito.
 * @param {string} label Descricao publica do conflito.
 * @returns {Promise<void>}
 */
export async function assertNoManualConflicts(db, collectionName, clauses, label) {
    if (clauses.length === 0) {
        return;
    }

    const existing = await db.collection(collectionName).findOne({
        $and: [
            { $or: clauses },
            { demoFixture: { $ne: DEMO_FIXTURE } },
        ],
    });

    if (existing) {
        throw new Error(
            `${label} ja existe sem demoFixture="${DEMO_FIXTURE}". Seed demo abortado para preservar dados locais.`,
        );
    }
}

/**
 * Garante que os seeds de dominio so correm depois das contas demo terem sido
 * criadas pelo seed de utilizadores.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @returns {Promise<void>}
 */
export async function assertDemoUsersReady(db) {
    const count = await db.collection("users").countDocuments({
        _id: { $in: demoUserIdList },
        demoFixture: DEMO_FIXTURE,
    });

    if (count !== demoUserIdList.length) {
        throw new Error(
            "Utilizadores demo ausentes ou incompletos. Executa seed:demo:users antes deste seed de dominio.",
        );
    }
}

/**
 * Constroi um documento de utilizador de demo com password conhecida.
 *
 * @param {object} user Dados base do utilizador.
 * @param {Date} now Data de criacao.
 * @returns {Promise<object>} Documento pronto para inserir.
 */
export async function buildDemoUser(user, now = DEMO_NOW) {
    return {
        ...user,
        passwordHash: await hashPassword(DEMO_PASSWORD),
        accountStatus: "active",
        demoFixture: DEMO_FIXTURE,
        createdAt: now,
        updatedAt: now,
    };
}

/**
 * Indica se o ficheiro atual foi executado diretamente pelo Node.
 *
 * @param {string} importMetaUrl Valor de `import.meta.url`.
 * @returns {boolean} Verdadeiro quando o modulo e o entrypoint.
 */
export function isDirectRun(importMetaUrl) {
    return Boolean(process.argv[1]) && importMetaUrl === pathToFileURL(process.argv[1]).href;
}

/**
 * Executa um seed quando o ficheiro e chamado por CLI.
 *
 * @param {string} importMetaUrl Valor de `import.meta.url`.
 * @param {() => Promise<object>} seedFn Funcao de seed.
 * @param {string} label Nome para logs.
 * @returns {Promise<void>}
 */
export async function runSeedCli(importMetaUrl, seedFn, label) {
    if (!isDirectRun(importMetaUrl)) {
        return;
    }

    try {
        const summary = await seedFn();
        console.log(`${label} concluido: ${JSON.stringify(summary)}`);
        process.exit(0);
    } catch (error) {
        console.error(`${label} falhou: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Cria uma data deslocada a partir da data base da demo.
 *
 * @param {number} days Dias a somar.
 * @returns {Date} Data calculada.
 */
export function demoDate(days) {
    return new Date(DEMO_NOW.getTime() + days * 24 * 60 * 60 * 1000);
}
