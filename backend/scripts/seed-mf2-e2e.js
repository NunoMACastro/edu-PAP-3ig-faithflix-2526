import { ObjectId } from "mongodb";
import { getDb } from "../src/config/database.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";

const db = await getDb();
const now = new Date();
const userId = new ObjectId();
const contentId = new ObjectId();
const email = "e2e@faithflix.test";
const E2E_TAG = "mf2-e2e";

const existingUser = await db.collection("users").findOne({ email });

if (existingUser) {
  await db.collection("sessions").deleteMany({ userId: existingUser._id });
  await db.collection("playback_progress").deleteMany({ userId: existingUser._id });
  await db.collection("user_content_lists").deleteMany({ userId: existingUser._id });
  await db.collection("media_preferences").deleteMany({ userId: existingUser._id });
  await db.collection("users").deleteOne({ _id: existingUser._id });
}

await db.collection("contents").deleteMany({
  $or: [{ slug: "piloto-faithflix" }, { e2eFixture: E2E_TAG }],
});
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
  slug: "piloto-faithflix",
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
    audio: [{ language: "pt", label: "Portugues", src: "/media/piloto.mp4" }],
  },
  qualityOptions: [
    { label: "720p", value: "720p", playbackUrl: "/media/piloto.mp4" },
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