import { ObjectId } from "mongodb";
import { getDb } from "../src/config/database.js";
import { ensureAuthIndexes } from "../src/modules/auth/auth.indexes.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";
import { ensureCatalogIndexes } from "../src/modules/catalog/catalog.service.js";
import { ensurePlaybackIndexes } from "../src/modules/playback/playback.service.js";
import { ensureLibraryIndexes } from "../src/modules/library/library.service.js";

const db = await getDb();
const now = new Date();
const userId = new ObjectId();
const contentId = new ObjectId();
const email = "e2e@faithflix.test";
const E2E_TAG = "mf2-e2e";
const E2E_SLUG = "piloto-faithflix";

await ensureAuthIndexes();
await ensureCatalogIndexes();
await ensurePlaybackIndexes();
await ensureLibraryIndexes();

const existingUser = await db.collection("users").findOne({ email });

if (existingUser) {
    await db.collection("sessions").deleteMany({ userId: existingUser._id });
    await db
        .collection("playback_progress")
        .deleteMany({ userId: existingUser._id });
    await db
        .collection("user_content_lists")
        .deleteMany({ userId: existingUser._id });
    await db
        .collection("media_preferences")
        .deleteMany({ userId: existingUser._id });
    await db.collection("users").deleteOne({ _id: existingUser._id });
}

const conflictingContent = await db.collection("contents").findOne({
    slug: E2E_SLUG,
    e2eFixture: { $ne: E2E_TAG },
});

if (conflictingContent) {
    throw new Error(
        `Conteudo com slug "${E2E_SLUG}" ja existe sem e2eFixture "${E2E_TAG}". Seed E2E abortada para preservar dados locais.`,
    );
}

await db.collection("contents").deleteMany({ e2eFixture: E2E_TAG });
await db.collection("playback_progress").deleteMany({ e2eFixture: E2E_TAG });
await db.collection("user_content_lists").deleteMany({ e2eFixture: E2E_TAG });
await db.collection("media_preferences").deleteMany({ e2eFixture: E2E_TAG });

await db.collection("users").insertOne({
    _id: userId,
    name: "Utilizador E2E",
    email,
    passwordHash: await hashPassword("password-segura-123"),
    role: "user",
    parentalMaxAgeRating: 18,
    e2eFixture: E2E_TAG,
    createdAt: now,
    updatedAt: now,
});

await db.collection("contents").insertOne({
    _id: contentId,
    title: "Piloto FaithFlix",
    slug: E2E_SLUG,
    synopsis: "Conteudo curto usado para validar o fluxo principal da MF2.",
    type: "movie",
    durationSeconds: 120,
    ageRating: 6,
    status: "published",
    taxonomyIds: [],
    assets: {
        posterUrl: "",
        backdropUrl: "",
    },
    media: {
        playbackUrl: "/media/piloto.mp4",
    },
    tracks: {
        subtitles: [],
        audio: [
            {
                language: "pt",
                label: "Portugues",
                src: "/media/piloto.mp4",
            },
        ],
    },
    qualityOptions: [
        {
            label: "720p",
            value: "720p",
            playbackUrl: "/media/piloto.mp4",
        },
    ],
    createdBy: userId,
    updatedBy: userId,
    e2eFixture: E2E_TAG,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
});

console.log(`Seed MF2 E2E concluida: ${email} / ${contentId.toString()}`);
process.exit(0);
