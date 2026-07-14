/**
 * @file Seed local para o fluxo E2E da MF9.
 *
 * Cria contas isoladas, uma subscrição Família, uma subscrição Pro e um MP4
 * sintético privado 1080p para validar partilha real sem prometer 4K.
 */

import { ObjectId } from "mongodb";
import { ensureAuthIndexes } from "../src/modules/auth/auth.indexes.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";
import { ensureCatalogIndexes } from "../src/modules/catalog/catalog.service.js";
import { ensureLibraryIndexes } from "../src/modules/library/library.service.js";
import { ensureMediaAssetIndexes } from "../src/modules/media/media-assets.service.js";
import { ensureNotificationIndexes } from "../src/modules/notifications/notifications.service.js";
import { ensurePlaybackIndexes } from "../src/modules/playback/playback.service.js";
import {
    ensureDefaultSubscriptionPlans,
    ensureSubscriptionIndexes,
} from "../src/modules/subscriptions/subscriptions.service.js";
import {
    cleanupMarkedFixtureCollections,
    runE2eSeedCli,
} from "./seed-safety.js";
import {
    cleanupE2eMediaAssets,
    installE2eMediaAsset,
} from "./e2e-media-fixture.js";

const E2E_TAG = "mf9-e2e";
const PASSWORD = "password-segura-123";
const OWNER_EMAIL = "owner-mf9@faithflix.test";
const MEMBER_EMAIL = "member-mf9@faithflix.test";
const PRO_EMAIL = "pro-mf9@faithflix.test";
const CONTENT_SLUG = "mf9-qualidade-familiar";
const FIXTURE_OPTIONS = {
    markerField: "e2eFixture",
    markerValue: E2E_TAG,
};

const ownerId = new ObjectId("64f909000000000000000001");
const memberId = new ObjectId("64f909000000000000000002");
const proId = new ObjectId("64f909000000000000000003");
const contentId = new ObjectId("64f909100000000000000001");
const mediaAssetId = new ObjectId("64f909200000000000000001");

/**
 * Constrói uma conta de fixture com password conhecida.
 *
 * @param {ObjectId} _id Identificador fixo.
 * @param {string} email Email da conta.
 * @param {string} name Nome público.
 * @param {Date} now Instante de criação.
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

/**
 * Prepara o conjunto de dados isolado da MF9.
 *
 * @param {import("mongodb").Db} db Base `_e2e` autorizada pelo guard.
 * @returns {Promise<void>}
 */
async function seedMf9E2e(db) {
    const now = new Date();
    const periodEnd = new Date("2999-01-01T00:00:00.000Z");

    await ensureAuthIndexes();
    await ensureCatalogIndexes();
    await ensurePlaybackIndexes();
    await ensureLibraryIndexes();
    await ensureMediaAssetIndexes();
    await ensureNotificationIndexes();
    await ensureSubscriptionIndexes();
    await ensureDefaultSubscriptionPlans();
    await cleanupE2eMediaAssets(db, E2E_TAG);

    await cleanupMarkedFixtureCollections(
        db,
        [
            {
                collectionName: "sessions",
                clauses: [{ userId: { $in: [ownerId, memberId, proId] } }],
                label: "Sessoes reservadas MF9",
            },
            {
                collectionName: "users",
                clauses: [
                    { _id: { $in: [ownerId, memberId, proId] } },
                    {
                        email: {
                            $in: [OWNER_EMAIL, MEMBER_EMAIL, PRO_EMAIL],
                        },
                    },
                ],
                label: "Utilizadores reservados MF9",
            },
            {
                collectionName: "subscriptions",
                clauses: [{ userId: { $in: [ownerId, memberId, proId] } }],
                label: "Subscricoes reservadas MF9",
            },
            {
                collectionName: "trials",
                clauses: [{ userId: { $in: [ownerId, memberId, proId] } }],
                label: "Trials reservados MF9",
            },
            {
                collectionName: "subscription_family_memberships",
                clauses: [
                    { ownerUserId: ownerId },
                    { memberUserId: { $in: [ownerId, memberId, proId] } },
                    {
                        invitedEmail: {
                            $in: [OWNER_EMAIL, MEMBER_EMAIL, PRO_EMAIL],
                        },
                    },
                ],
                label: "Memberships reservadas MF9",
            },
            {
                collectionName: "payment_attempts",
                clauses: [{ userId: { $in: [ownerId, memberId, proId] } }],
                label: "Pagamentos reservados MF9",
            },
            {
                collectionName: "notifications",
                clauses: [{ userId: { $in: [ownerId, memberId, proId] } }],
                label: "Notificacoes reservadas MF9",
            },
            {
                collectionName: "playback_progress",
                clauses: [
                    { userId: { $in: [ownerId, memberId, proId] } },
                    { contentId },
                ],
                label: "Progresso reservado MF9",
            },
            {
                collectionName: "user_content_lists",
                clauses: [
                    { userId: { $in: [ownerId, memberId, proId] } },
                    { contentId },
                ],
                label: "Listas reservadas MF9",
            },
            {
                collectionName: "media_preferences",
                clauses: [{ userId: { $in: [ownerId, memberId, proId] } }],
                label: "Preferencias reservadas MF9",
            },
            {
                collectionName: "contents",
                clauses: [{ _id: contentId }, { slug: CONTENT_SLUG }],
                label: "Conteudo reservado MF9",
            },
        ],
        FIXTURE_OPTIONS,
    );

    await db.collection("users").insertMany([
        await fixtureUser(ownerId, OWNER_EMAIL, "Owner Família MF9", now),
        await fixtureUser(memberId, MEMBER_EMAIL, "Membro Família MF9", now),
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
        synopsis:
            "Conteúdo sintético privado usado para validar acesso familiar.",
        type: "movie",
        durationSeconds: 180,
        ageRating: 6,
        status: "published",
        taxonomyIds: [],
        assets: {
            posterUrl: "",
            backdropUrl: "",
        },
        mediaStatus: "ready",
        media: {
            url: `/api/media/${mediaAssetId}`,
            protocol: "progressive",
            mimeType: "video/mp4",
            quality: "1080p",
        },
        tracks: {
            subtitles: [],
            audio: [],
        },
        qualityOptions: [],
        version: 1,
        createdBy: ownerId,
        updatedBy: ownerId,
        e2eFixture: E2E_TAG,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
    });

    await installE2eMediaAsset(db, {
        assetId: mediaAssetId,
        contentId,
        createdBy: ownerId,
        quality: "1080p",
        e2eTag: E2E_TAG,
        now,
    });

    console.log(
        [
            "Seed MF9 E2E concluída:",
            `owner=${OWNER_EMAIL}`,
            `member=${MEMBER_EMAIL}`,
            `pro=${PRO_EMAIL}`,
            `content=${CONTENT_SLUG}`,
            `media=${mediaAssetId}`,
        ].join(" "),
    );
}

await runE2eSeedCli(seedMf9E2e, "Seed MF9 E2E");
