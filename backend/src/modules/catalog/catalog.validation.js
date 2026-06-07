import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

export const CONTENT_TYPES = ["movie", "series", "episode", "documentary"];
export const CONTENT_STATUS = ["draft", "published", "archived"];

/**
 * Validates required text fields.
 *
 * @param {unknown} value - Raw value.
 * @param {string} field - Field name used in the error message.
 * @param {number} [min=2] - Minimum length.
 * @param {number} [max=160] - Maximum length.
 * @returns {string} Trimmed text.
 */
function requiredText(value, field, min = 2, max = 160) {
    const text = String(value ?? "").trim();

    if (text.length < min || text.length > max) {
        throw new HttpError(400, `${field} invalido.`);
    }

    return text;
}

/**
 * Normalizes optional text with a safe maximum length.
 *
 * @param {unknown} value - Raw value.
 * @param {number} [max=500] - Maximum length.
 * @returns {string} Trimmed optional text.
 */
function optionalText(value, max = 500) {
    const text = String(value ?? "").trim();
    return text.length > max ? text.slice(0, max) : text;
}

/**
 * Validates a positive integer field.
 *
 * @param {unknown} value - Raw value.
 * @param {string} field - Field name.
 * @returns {number} Valid integer.
 */
function positiveInteger(value, field) {
    const number = Number(value);

    if (!Number.isInteger(number) || number <= 0) {
        throw new HttpError(400, `${field} deve ser um inteiro positivo.`);
    }

    return number;
}

/**
 * Validates an age rating between 0 and 18.
 *
 * @param {unknown} value - Raw age rating.
 * @returns {number} Safe age rating.
 */
function assertAgeRating(value) {
    const number = Number(value);

    if (!Number.isInteger(number) || number < 0 || number > 18) {
        throw new HttpError(400, "Classificacao etaria invalida.");
    }

    return number;
}

/**
 * Converts taxonomy ids to ObjectIds.
 *
 * @param {unknown} value - Raw taxonomy id list.
 * @returns {import("mongodb").ObjectId[]} ObjectId list.
 */
function taxonomyObjectIds(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((id) => {
        if (!ObjectId.isValid(id)) {
            throw new HttpError(400, "Taxonomia invalida.");
        }

        return new ObjectId(id);
    });
}

/**
 * Validates one subtitle or audio track.
 *
 * @param {{ language?: unknown, label?: unknown, src?: unknown }} track - Raw track.
 * @returns {{ language: string, label: string, src: string }} Safe track.
 */
function mediaTrack(track) {
    return {
        language: requiredText(track?.language, "language", 2, 12),
        label: requiredText(track?.label, "label", 2, 80),
        src: requiredText(track?.src, "src", 1, 500),
    };
}

/**
 * Validates one quality option.
 *
 * @param {{ label?: unknown, value?: unknown, playbackUrl?: unknown }} option - Raw quality option.
 * @returns {{ label: string, value: string, playbackUrl: string }} Safe quality option.
 */
function qualityOption(option) {
    return {
        label: requiredText(option?.label, "label", 2, 40),
        value: requiredText(option?.value, "value", 2, 40),
        playbackUrl: requiredText(option?.playbackUrl, "playbackUrl", 1, 500),
    };
}

/**
 * Builds a stable slug from text.
 *
 * @param {unknown} value - Raw text.
 * @returns {string} URL-safe slug.
 */
export function slugify(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

/**
 * Validates media tracks and quality options.
 *
 * @param {{ tracks?: { subtitles?: unknown[], audio?: unknown[] }, qualityOptions?: unknown[] }} input - Raw media options.
 * @returns {{ tracks: { subtitles: Array<{ language: string, label: string, src: string }>, audio: Array<{ language: string, label: string, src: string }> }, qualityOptions: Array<{ label: string, value: string, playbackUrl: string }> }} Safe media options.
 */
export function assertMediaOptions(input = {}) {
    return {
        tracks: {
            subtitles: Array.isArray(input.tracks?.subtitles)
                ? input.tracks.subtitles.map(mediaTrack)
                : [],
            audio: Array.isArray(input.tracks?.audio)
                ? input.tracks.audio.map(mediaTrack)
                : [],
        },
        qualityOptions: Array.isArray(input.qualityOptions)
            ? input.qualityOptions.map(qualityOption)
            : [],
    };
}

/**
 * Validates a catalog create/update payload.
 *
 * @param {Record<string, unknown>} input - Raw catalog payload.
 * @returns {Record<string, unknown>} Safe catalog document fields.
 */
export function assertCatalogPayload(input = {}) {
    const title = requiredText(input.title, "title");
    const type = String(input.type ?? "").trim();

    if (!CONTENT_TYPES.includes(type)) {
        throw new HttpError(400, "Tipo de conteudo invalido.");
    }

    const slug = input.slug ? slugify(input.slug) : slugify(title);

    if (!slug) {
        throw new HttpError(400, "Slug invalido.");
    }

    return {
        title,
        slug,
        synopsis: requiredText(input.synopsis, "synopsis", 20, 1000),
        type,
        durationSeconds: positiveInteger(
            input.durationSeconds,
            "durationSeconds",
        ),
        ageRating: assertAgeRating(input.ageRating ?? 0),
        taxonomyIds: taxonomyObjectIds(input.taxonomyIds),
        assets: {
            posterUrl: optionalText(input.assets?.posterUrl),
            backdropUrl: optionalText(input.assets?.backdropUrl),
        },
        media: {
            playbackUrl: requiredText(
                input.media?.playbackUrl,
                "media.playbackUrl",
                1,
                500,
            ),
        },
        ...assertMediaOptions(input),
    };
}

/**
 * Validates a content publication status.
 *
 * @param {unknown} status - Raw status.
 * @returns {string} Safe status.
 */
export function assertStatus(status) {
    const normalized = String(status ?? "").trim();

    if (!CONTENT_STATUS.includes(normalized)) {
        throw new HttpError(400, "Estado de conteudo invalido.");
    }

    return normalized;
}

/**
 * Validates a taxonomy payload.
 *
 * @param {{ name?: unknown, slug?: unknown, description?: unknown }} input - Raw taxonomy payload.
 * @returns {{ name: string, slug: string, description: string }} Safe taxonomy payload.
 */
export function assertTaxonomyPayload(input = {}) {
    const name = requiredText(input.name, "name", 2, 80);
    const slug = input.slug ? slugify(input.slug) : slugify(name);

    if (!slug) {
        throw new HttpError(400, "Slug invalido.");
    }

    return {
        name,
        slug,
        description: optionalText(input.description),
    };
}
