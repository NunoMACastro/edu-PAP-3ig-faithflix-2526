import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";

const DEFAULT_PREFERENCES = {
    subtitleLanguage: "",
    audioLanguage: "pt",
    quality: "720p",
};

/**
 * Converts a user id into a MongoDB ObjectId.
 *
 * @param {string} userId - User id.
 * @returns {import("mongodb").ObjectId} MongoDB ObjectId.
 */
function asUserObjectId(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new HttpError(400, "Utilizador invalido.");
    }

    return new ObjectId(userId);
}

/**
 * Normalizes media preferences without creating media URLs.
 *
 * @param {Record<string, unknown>} input - Raw preferences.
 * @returns {{ subtitleLanguage: string, audioLanguage: string, quality: string }} Safe preferences.
 */
function normalizePreferences(input = {}) {
    return {
        subtitleLanguage: String(input.subtitleLanguage ?? "").trim(),
        audioLanguage: String(input.audioLanguage ?? "pt").trim(),
        quality: String(input.quality ?? "720p").trim(),
    };
}

/**
 * Ensures media preference indexes exist.
 *
 * @returns {Promise<void>} Resolves after index creation.
 */
export async function ensureMediaPreferenceIndexes() {
    const db = await getDb();
    await db
        .collection("media_preferences")
        .createIndex({ userId: 1 }, { unique: true });
}

/**
 * Returns the authenticated user's media preferences.
 *
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<typeof DEFAULT_PREFERENCES>} Preferences.
 */
export async function getMediaPreferences(userId) {
    const db = await getDb();
    const preferences = await db
        .collection("media_preferences")
        .findOne({ userId: asUserObjectId(userId) });

    return preferences?.values ?? DEFAULT_PREFERENCES;
}

/**
 * Saves the authenticated user's media preferences.
 *
 * @param {string} userId - Authenticated user id.
 * @param {Record<string, unknown>} input - Preferences payload.
 * @returns {Promise<typeof DEFAULT_PREFERENCES>} Saved preferences.
 */
export async function saveMediaPreferences(userId, input) {
    await ensureMediaPreferenceIndexes();

    const db = await getDb();
    const now = new Date();
    const userObjectId = asUserObjectId(userId);
    const values = normalizePreferences(input);

    await db.collection("media_preferences").updateOne(
        { userId: userObjectId },
        {
            $set: { values, updatedAt: now },
            $setOnInsert: { userId: userObjectId, createdAt: now },
        },
        { upsert: true },
    );

    return values;
}
