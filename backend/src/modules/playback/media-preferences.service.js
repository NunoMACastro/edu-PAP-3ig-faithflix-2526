import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

const DEFAULT_PREFERENCES = {
  subtitleLanguage: "",
  audioLanguage: "pt",
  quality: "720p",
};

function asUserObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    const error = new Error("Utilizador invalido.");
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(userId);
}

function normalizePreferences(input) {
  return {
    subtitleLanguage: String(input.subtitleLanguage ?? "").trim(),
    audioLanguage: String(input.audioLanguage ?? "pt").trim(),
    quality: String(input.quality ?? "720p").trim(),
  };
}

export async function getMediaPreferences(userId) {
  const db = await getDb();
  const preferences = await db.collection("media_preferences").findOne({ userId: asUserObjectId(userId) });
  return preferences?.values ?? DEFAULT_PREFERENCES;
}

export async function saveMediaPreferences(userId, input) {
  const db = await getDb();
  const now = new Date();
  const values = normalizePreferences(input);

  await db.collection("media_preferences").updateOne(
    { userId: asUserObjectId(userId) },
    { $set: { values, updatedAt: now }, $setOnInsert: { userId: asUserObjectId(userId), createdAt: now } },
    { upsert: true },
  );

  return values;
}