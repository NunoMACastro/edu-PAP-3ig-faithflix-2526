/**
 * @file Ficheiro `real_dev/backend/src/modules/playback/media-preferences.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";

export const MEDIA_PREFERENCE_FIELDS = [
    "subtitleLanguage",
    "audioLanguage",
    "quality",
];
export const MEDIA_LANGUAGE_VALUES = ["", "pt", "en"];
export const MEDIA_QUALITY_VALUES = ["480p", "720p", "1080p", "2160p", "4k"];
export const DEFAULT_PREFERENCES = Object.freeze({
    subtitleLanguage: "",
    audioLanguage: "pt",
    quality: "720p",
});

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
 * Valida preferências media por allowlist de campos e valores.
 *
 * @param {Record<string, unknown>} input - Preferências brutas.
 * @returns {{ subtitleLanguage: string, audioLanguage: string, quality: string }} Preferências seguras.
 * @throws {HttpError} Quando existem campos ou valores fora do contrato fechado.
 */
export function assertMediaPreferences(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Preferencias media invalidas.");
    }

    const unknownField = Object.keys(input).find(
        (field) => !MEDIA_PREFERENCE_FIELDS.includes(field),
    );

    if (unknownField) {
        throw new HttpError(
            400,
            "Campo de preferencias media invalido.",
            { field: unknownField },
            "MEDIA_PREFERENCE_FIELD_INVALID",
        );
    }

    const values = {
        subtitleLanguage:
            input.subtitleLanguage ?? DEFAULT_PREFERENCES.subtitleLanguage,
        audioLanguage: input.audioLanguage ?? DEFAULT_PREFERENCES.audioLanguage,
        quality: input.quality ?? DEFAULT_PREFERENCES.quality,
    };

    for (const field of ["subtitleLanguage", "audioLanguage"]) {
        if (
            typeof values[field] !== "string" ||
            !MEDIA_LANGUAGE_VALUES.includes(values[field])
        ) {
            throw new HttpError(400, `${field} invalido.`);
        }
    }

    if (
        typeof values.quality !== "string" ||
        !MEDIA_QUALITY_VALUES.includes(values.quality)
    ) {
        throw new HttpError(400, "Qualidade media invalida.");
    }

    return values;
}

/**
 * Aplica defaults seguros a dados legacy sem propagar valores desconhecidos.
 *
 * @param {unknown} value Documento persistido.
 * @returns {typeof DEFAULT_PREFERENCES} Preferências válidas ou defaults.
 */
function safeStoredPreferences(value) {
    try {
        return assertMediaPreferences(value);
    } catch {
        return { ...DEFAULT_PREFERENCES };
    }
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

    return preferences?.values
        ? safeStoredPreferences(preferences.values)
        : { ...DEFAULT_PREFERENCES };
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
    const values = assertMediaPreferences(input);

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
