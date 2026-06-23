/**
 * @file Ficheiro `real_dev/backend/src/modules/playback/media-preferences.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";

const DEFAULT_PREFERENCES = {
    subtitleLanguage: "",
    audioLanguage: "pt",
    quality: "720p",
};

/**
 * Converte um id de utilizador num ObjectId MongoDB.
 *
 * @param {string} userId - Id do utilizador.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
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
 * @param {Record<string, unknown>} input - Preferências brutas.
 * @returns {{ subtitleLanguage: string, audioLanguage: string, quality: string }} Preferências seguras.
 */
function normalizePreferences(input = {}) {
    return {
        subtitleLanguage: String(input.subtitleLanguage ?? "").trim(),
        audioLanguage: String(input.audioLanguage ?? "pt").trim(),
        quality: String(input.quality ?? "720p").trim(),
    };
}

/**
 * Garante que existem os índices de preferências media.
 *
 * @returns {Promise<void>} Termina depois da criação de índices.
 */
export async function ensureMediaPreferenceIndexes() {
    const db = await getDb();
    await db
        .collection("media_preferences")
        .createIndex({ userId: 1 }, { unique: true });
}

/**
 * Devolve as preferências media do utilizador autenticado.
 *
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<typeof DEFAULT_PREFERENCES>} Preferências.
 */
export async function getMediaPreferences(userId) {
    const db = await getDb();
    const preferences = await db
        .collection("media_preferences")
        .findOne({ userId: asUserObjectId(userId) });

    return preferences?.values ?? DEFAULT_PREFERENCES;
}

/**
 * Guarda as preferências media do utilizador autenticado.
 *
 * @param {string} userId - Authenticated user id.
 * @param {Record<string, unknown>} input - Preferences dados.
 * @returns {Promise<typeof DEFAULT_PREFERENCES>} Preferências guardadas.
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
