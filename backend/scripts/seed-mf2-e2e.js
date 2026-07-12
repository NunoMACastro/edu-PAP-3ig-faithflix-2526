/**
 * @file Ficheiro `real_dev/backend/scripts/seed-mf2-e2e.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { ensureAuthIndexes } from "../src/modules/auth/auth.indexes.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";
import { hashToken } from "../src/modules/auth/token.js";
import { ensureCatalogIndexes } from "../src/modules/catalog/catalog.service.js";
import { ensurePlaybackIndexes } from "../src/modules/playback/playback.service.js";
import { ensureLibraryIndexes } from "../src/modules/library/library.service.js";
import { ensureMediaAssetIndexes } from "../src/modules/media/media-assets.service.js";
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
import {
    MF2_REGISTER_EMAIL,
    MF2_RESET_EMAIL,
    MF2_RESET_OLD_PASSWORD,
    MF2_RESET_TOKEN,
} from "../../../tests/fixtures/mf2-auth.js";

const userId = new ObjectId();
const resetUserId = new ObjectId();
const contentId = new ObjectId();
const mediaAssetId = new ObjectId();
const seriesId = new ObjectId();
const firstEpisodeId = new ObjectId();
const secondEpisodeId = new ObjectId();
const emptySeriesId = new ObjectId();
const firstEpisodeAssetId = new ObjectId();
const secondEpisodeAssetId = new ObjectId();
const email = "e2e@faithflix.test";
const E2E_TAG = "mf2-e2e";
const E2E_SLUG = "piloto-faithflix";
const SERIES_SLUG = "familia-em-oracao-e2e";
const FIRST_EPISODE_SLUG = "familia-em-oracao-e2e-t1-e1";
const SECOND_EPISODE_SLUG = "familia-em-oracao-e2e-t2-e1";
const EMPTY_SERIES_SLUG = "salmos-em-casa-e2e";
const CONTENT_SLUGS = Object.freeze([
    E2E_SLUG,
    SERIES_SLUG,
    FIRST_EPISODE_SLUG,
    SECOND_EPISODE_SLUG,
    EMPTY_SERIES_SLUG,
]);
const FIXTURE_OPTIONS = {
    markerField: "e2eFixture",
    markerValue: E2E_TAG,
};

/**
 * Remove a conta criada pelo próprio browser numa execução E2E anterior.
 *
 * O registo público não aceita marcadores de fixture. Por isso, esta limpeza
 * usa apenas o email exato reservado e o respetivo `_id`, depois de o guard da
 * seed já ter confirmado que a base alvo termina em `_e2e`.
 *
 * @param {import("mongodb").Db} db Base E2E autorizada.
 * @returns {Promise<void>}
 */
async function cleanupBrowserRegistration(db) {
    const registeredUser = await db.collection("users").findOne({
        email: MF2_REGISTER_EMAIL,
    });

    if (!registeredUser) {
        return;
    }

    const userCollections = [
        "sessions",
        "password_reset_tokens",
        "password_reset_dev_outbox",
        "playback_progress",
        "user_content_lists",
        "media_preferences",
        "subscriptions",
        "trials",
    ];

    for (const collectionName of userCollections) {
        await db.collection(collectionName).deleteMany({
            userId: registeredUser._id,
        });
    }

    await db.collection("users").deleteOne({
        _id: registeredUser._id,
        email: MF2_REGISTER_EMAIL,
    });
}

/**
 * Remove artefactos criados pelos endpoints reais para as contas já marcadas.
 *
 * Sessões e pedidos de recuperação não recebem marcadores de fixture no código
 * de produção. A limpeza continua limitada aos `_id` obtidos através dos dois
 * emails reservados pela seed.
 *
 * @param {import("mongodb").Db} db Base E2E autorizada.
 * @param {ObjectId[]} reservedUserIds IDs das contas reservadas encontradas.
 * @returns {Promise<void>}
 */
async function cleanupRuntimeAuthArtifacts(db, reservedUserIds) {
    for (const reservedUserId of reservedUserIds) {
        for (const collectionName of [
            "sessions",
            "password_reset_tokens",
            "password_reset_dev_outbox",
        ]) {
            await db.collection(collectionName).deleteMany({
                userId: reservedUserId,
            });
        }
    }
}

/**
 * Prepara fixtures isoladas para o fluxo browser MF2.
 *
 * @param {import("mongodb").Db} db Base `_e2e` autorizada pelo guard.
 * @returns {Promise<void>}
 */
async function seedMf2E2e(db) {
    const now = new Date();

    await ensureAuthIndexes();
    await ensureCatalogIndexes();
    await ensurePlaybackIndexes();
    await ensureLibraryIndexes();
    await ensureMediaAssetIndexes();
    await ensureSubscriptionIndexes();
    await ensureDefaultSubscriptionPlans();
    await cleanupBrowserRegistration(db);

    const existingUser = await db.collection("users").findOne({ email });
    const existingResetUser = await db.collection("users").findOne({
        email: MF2_RESET_EMAIL,
    });
    const existingContents = await db
        .collection("contents")
        .find({ slug: { $in: [...CONTENT_SLUGS] } })
        .toArray();
    const reservedUserIds = [existingUser?._id, existingResetUser?._id].filter(
        Boolean,
    );
    const userClauses = reservedUserIds.map((reservedUserId) => ({
        userId: reservedUserId,
    }));
    const contentClauses = existingContents.map((content) => ({
        contentId: content._id,
    }));

    await cleanupRuntimeAuthArtifacts(db, reservedUserIds);
    await cleanupE2eMediaAssets(db, E2E_TAG);

    await cleanupMarkedFixtureCollections(
        db,
        [
            {
                collectionName: "sessions",
                clauses: userClauses,
                label: "Sessoes reservadas MF2",
            },
            {
                collectionName: "password_reset_tokens",
                clauses: userClauses,
                label: "Tokens de reset reservados MF2",
            },
            {
                collectionName: "password_reset_dev_outbox",
                clauses: userClauses,
                label: "Outbox de reset reservada MF2",
            },
            {
                collectionName: "playback_progress",
                clauses: [...userClauses, ...contentClauses],
                label: "Progresso reservado MF2",
            },
            {
                collectionName: "user_content_lists",
                clauses: [...userClauses, ...contentClauses],
                label: "Listas reservadas MF2",
            },
            {
                collectionName: "media_preferences",
                clauses: userClauses,
                label: "Preferencias reservadas MF2",
            },
            {
                collectionName: "subscriptions",
                clauses: userClauses,
                label: "Subscricoes reservadas MF2",
            },
            {
                collectionName: "trials",
                clauses: userClauses,
                label: "Trials reservados MF2",
            },
            {
                collectionName: "users",
                clauses: [{ email }, { email: MF2_RESET_EMAIL }],
                label: "Utilizadores E2E MF2",
            },
            {
                collectionName: "contents",
                clauses: CONTENT_SLUGS.map((slug) => ({ slug })),
                label: "Conteúdos E2E MF2 e séries",
            },
        ],
        FIXTURE_OPTIONS,
    );

    await db.collection("users").insertOne({
        _id: userId,
        name: "Utilizador E2E",
        email,
        passwordHash: await hashPassword("password-segura-123"),
        role: "user",
        accountStatus: "active",
        parentalMaxAgeRating: 18,
        e2eFixture: E2E_TAG,
        createdAt: now,
        updatedAt: now,
    });

    await db.collection("users").insertOne({
        _id: resetUserId,
        name: "Reset E2E",
        email: MF2_RESET_EMAIL,
        passwordHash: await hashPassword(MF2_RESET_OLD_PASSWORD),
        role: "user",
        accountStatus: "active",
        parentalMaxAgeRating: 18,
        e2eFixture: E2E_TAG,
        createdAt: now,
        updatedAt: now,
    });

    await db.collection("password_reset_tokens").insertOne({
        userId: resetUserId,
        dummy: false,
        tokenHash: hashToken(MF2_RESET_TOKEN),
        usedAt: null,
        e2eFixture: E2E_TAG,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
    });

    await db.collection("subscriptions").insertOne({
        userId,
        planCode: "faithflix-monthly",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
        cancelAtPeriodEnd: false,
        e2eFixture: E2E_TAG,
        createdAt: now,
        updatedAt: now,
    });

    await db.collection("contents").insertOne({
        _id: contentId,
        title: "Piloto FaithFlix",
        slug: E2E_SLUG,
        synopsis: "Conteúdo curto usado para validar o fluxo principal da MF2.",
        type: "movie",
        durationSeconds: 120,
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
            quality: "720p",
        },
        tracks: {
            subtitles: [],
            audio: [],
        },
        qualityOptions: [],
        version: 1,
        createdBy: userId,
        updatedBy: userId,
        e2eFixture: E2E_TAG,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
    });

    await db.collection("contents").insertMany([
        {
            _id: seriesId,
            title: "Família em Oração E2E",
            slug: SERIES_SLUG,
            synopsis: "Série sintética para validar a hierarquia e a navegação entre temporadas.",
            type: "series",
            durationSeconds: 0,
            ageRating: 6,
            releaseYear: 2026,
            status: "published",
            taxonomyIds: [],
            assets: { posterUrl: "", backdropUrl: "", previewUrl: "" },
            credits: { directors: [], creators: ["FaithFlix E2E"], cast: [] },
            mediaStatus: "pending",
            media: {},
            tracks: { subtitles: [], audio: [] },
            qualityOptions: [],
            version: 1,
            createdBy: userId,
            updatedBy: userId,
            e2eFixture: E2E_TAG,
            publishedAt: now,
            createdAt: now,
            updatedAt: now,
        },
        {
            _id: firstEpisodeId,
            title: "O Recomeço E2E",
            slug: FIRST_EPISODE_SLUG,
            synopsis: "O primeiro episódio abre caminho para uma nova rotina familiar.",
            type: "episode",
            seriesId,
            seasonNumber: 1,
            episodeNumber: 1,
            durationSeconds: 120,
            ageRating: 6,
            releaseYear: 2026,
            status: "published",
            taxonomyIds: [],
            assets: { posterUrl: "", backdropUrl: "", previewUrl: "" },
            credits: { directors: [], creators: ["FaithFlix E2E"], cast: [] },
            mediaStatus: "ready",
            media: {
                url: `/api/media/${firstEpisodeAssetId}`,
                protocol: "progressive",
                mimeType: "video/mp4",
                quality: "720p",
            },
            tracks: { subtitles: [], audio: [] },
            qualityOptions: [],
            version: 1,
            createdBy: userId,
            updatedBy: userId,
            e2eFixture: E2E_TAG,
            publishedAt: now,
            createdAt: now,
            updatedAt: now,
        },
        {
            _id: secondEpisodeId,
            title: "Uma Nova Estação E2E",
            slug: SECOND_EPISODE_SLUG,
            synopsis: "A navegação avança diretamente para a temporada seguinte.",
            type: "episode",
            seriesId,
            seasonNumber: 2,
            episodeNumber: 1,
            durationSeconds: 120,
            ageRating: 6,
            releaseYear: 2026,
            status: "published",
            taxonomyIds: [],
            assets: { posterUrl: "", backdropUrl: "", previewUrl: "" },
            credits: { directors: [], creators: ["FaithFlix E2E"], cast: [] },
            mediaStatus: "ready",
            media: {
                url: `/api/media/${secondEpisodeAssetId}`,
                protocol: "progressive",
                mimeType: "video/mp4",
                quality: "720p",
            },
            tracks: { subtitles: [], audio: [] },
            qualityOptions: [],
            version: 1,
            createdBy: userId,
            updatedBy: userId,
            e2eFixture: E2E_TAG,
            publishedAt: now,
            createdAt: now,
            updatedAt: now,
        },
        {
            _id: emptySeriesId,
            title: "Salmos em Casa E2E",
            slug: EMPTY_SERIES_SLUG,
            synopsis: "Série publicada ainda sem episódios disponíveis.",
            type: "series",
            durationSeconds: 0,
            ageRating: 6,
            releaseYear: 2026,
            status: "published",
            taxonomyIds: [],
            assets: { posterUrl: "", backdropUrl: "", previewUrl: "" },
            credits: { directors: [], creators: ["FaithFlix E2E"], cast: [] },
            mediaStatus: "pending",
            media: {},
            tracks: { subtitles: [], audio: [] },
            qualityOptions: [],
            version: 1,
            createdBy: userId,
            updatedBy: userId,
            e2eFixture: E2E_TAG,
            publishedAt: now,
            createdAt: now,
            updatedAt: now,
        },
    ]);

    await installE2eMediaAsset(db, {
        assetId: mediaAssetId,
        contentId,
        createdBy: userId,
        quality: "720p",
        e2eTag: E2E_TAG,
        now,
    });
    await installE2eMediaAsset(db, {
        assetId: firstEpisodeAssetId,
        contentId: firstEpisodeId,
        createdBy: userId,
        quality: "720p",
        e2eTag: E2E_TAG,
        now,
    });
    await installE2eMediaAsset(db, {
        assetId: secondEpisodeAssetId,
        contentId: secondEpisodeId,
        createdBy: userId,
        quality: "720p",
        e2eTag: E2E_TAG,
        now,
    });

    console.log(
        `Seed MF2 E2E concluída: ${email} / ${contentId.toString()} / série ${seriesId.toString()}`,
    );
}

await runE2eSeedCli(seedMf2E2e, "Seed MF2 E2E");
