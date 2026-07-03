/**
 * @file Seed local para o fluxo E2E da MF9.
 *
 * Cria contas isoladas, uma subscricao Familia, uma subscricao Pro e conteudo
 * com qualidades 1080p/4K para validar partilha real e limites de streaming.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../src/config/database.js";
import { ensureAuthIndexes } from "../src/modules/auth/auth.indexes.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";
import { ensureCatalogIndexes } from "../src/modules/catalog/catalog.service.js";
import { ensureLibraryIndexes } from "../src/modules/library/library.service.js";
import { ensureNotificationIndexes } from "../src/modules/notifications/notifications.service.js";
import { ensurePlaybackIndexes } from "../src/modules/playback/playback.service.js";
import { ensureSubscriptionIndexes } from "../src/modules/subscriptions/subscriptions.service.js";

const E2E_TAG = "mf9-e2e";
const PASSWORD = "password-segura-123";
const OWNER_EMAIL = "owner-mf9@faithflix.test";
const MEMBER_EMAIL = "member-mf9@faithflix.test";
const PRO_EMAIL = "pro-mf9@faithflix.test";
const CONTENT_SLUG = "mf9-qualidade-familiar";

const ownerId = new ObjectId("64f909000000000000000001");
const memberId = new ObjectId("64f909000000000000000002");
const proId = new ObjectId("64f909000000000000000003");
const contentId = new ObjectId("64f909100000000000000001");

/**
 * Remove documentos que pertencem ao fixture E2E ou colidem com ids fixos.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @param {string} collectionName Nome da colecao.
 * @param {object[]} clauses Condicoes alternativas de remocao.
 * @returns {Promise<void>} Termina depois de remover dados de fixture.
 */
async function deleteByAny(db, collectionName, clauses) {
    if (clauses.length === 0) {
        return;
    }

    await db.collection(collectionName).deleteMany({ $or: clauses });
}

/**
 * Constroi uma conta de fixture com password conhecida.
 *
 * @param {ObjectId} _id Identificador fixo.
 * @param {string} email Email da conta.
 * @param {string} name Nome publico.
 * @param {Date} now Instante de criacao.
 * @returns {Promise<object>} Documento pronto para inserir.
 */
async function fixtureUser(_id, email, name, now) {
    return {
        _id,
        name,
        email,
        passwordHash: await hashPassword(PASSWORD),
        role: "user",
        parentalMaxAgeRating: 18,
        e2eFixture: E2E_TAG,
        createdAt: now,
        updatedAt: now,
    };
}

const db = await getDb();
const now = new Date();
const periodEnd = new Date("2999-01-01T00:00:00.000Z");

await ensureAuthIndexes();
await ensureCatalogIndexes();
await ensurePlaybackIndexes();
await ensureLibraryIndexes();
await ensureNotificationIndexes();
await ensureSubscriptionIndexes();

await deleteByAny(db, "sessions", [
    { userId: ownerId },
    { userId: memberId },
    { userId: proId },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "users", [
    { _id: { $in: [ownerId, memberId, proId] } },
    { email: { $in: [OWNER_EMAIL, MEMBER_EMAIL, PRO_EMAIL] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "subscriptions", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "trials", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "subscription_family_memberships", [
    { ownerUserId: ownerId },
    { memberUserId: { $in: [ownerId, memberId, proId] } },
    { invitedEmail: { $in: [OWNER_EMAIL, MEMBER_EMAIL, PRO_EMAIL] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "payment_attempts", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "notifications", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "playback_progress", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { contentId },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "user_content_lists", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { contentId },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "media_preferences", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "contents", [
    { _id: contentId },
    { slug: CONTENT_SLUG },
    { e2eFixture: E2E_TAG },
]);

await db.collection("users").insertMany([
    await fixtureUser(ownerId, OWNER_EMAIL, "Owner Familia MF9", now),
    await fixtureUser(memberId, MEMBER_EMAIL, "Membro Familia MF9", now),
    await fixtureUser(proId, PRO_EMAIL, "Utilizador Pro MF9", now),
]);

await db.collection("subscriptions").insertMany([
    {
        userId: ownerId,
        planCode: "faithflix-family-monthly",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        e2eFixture: E2E_TAG,
        createdAt: now,
        updatedAt: now,
    },
    {
        userId: proId,
        planCode: "faithflix-monthly",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        e2eFixture: E2E_TAG,
        createdAt: now,
        updatedAt: now,
    },
]);

await db.collection("contents").insertOne({
    _id: contentId,
    title: "Qualidade Familiar MF9",
    slug: CONTENT_SLUG,
    synopsis: "Conteudo de fixture usado para validar 4K por plano Familia.",
    type: "movie",
    durationSeconds: 180,
    ageRating: 6,
    status: "published",
    taxonomyIds: [],
    assets: {
        posterUrl: "",
        backdropUrl: "",
    },
    media: {
        playbackUrl: "/media/mf9-1080.mp4",
    },
    tracks: {
        subtitles: [],
        audio: [],
    },
    qualityOptions: [
        {
            label: "Full HD",
            value: "1080p",
            playbackUrl: "/media/mf9-1080.mp4",
        },
        {
            label: "4K",
            value: "2160p",
            playbackUrl: "/media/mf9-2160.mp4",
        },
    ],
    createdBy: ownerId,
    updatedBy: ownerId,
    e2eFixture: E2E_TAG,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
});

console.log(
    [
        "Seed MF9 E2E concluida:",
        `owner=${OWNER_EMAIL}`,
        `member=${MEMBER_EMAIL}`,
        `pro=${PRO_EMAIL}`,
        `content=${CONTENT_SLUG}`,
    ].join(" "),
);

process.exit(0);
