/**
 * @file Ficheiro `real_dev/backend/src/modules/catalog/catalog.validation.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

export const CONTENT_TYPES = ["movie", "series", "episode", "documentary"];
export const CONTENT_STATUS = ["draft", "published", "archived"];

/**
 * Valida campos de texto obrigatórios.
 *
 * @param {unknown} value - Valor bruto.
 * @param {string} field - Field name used in the error message.
 * @param {number} [min=2] - Minimum length.
 * @param {number} [max=160] - Maximum length.
 * @returns {string} Texto sem espaços externos.
 */
function requiredText(value, field, min = 2, max = 160) {
    const text = String(value ?? "").trim();

    if (text.length < min || text.length > max) {
        throw new HttpError(400, `${field} invalido.`);
    }

    return text;
}

/**
 * Normaliza texto opcional com tamanho máximo seguro.
 *
 * @param {unknown} value - Valor bruto.
 * @param {number} [max=500] - Maximum length.
 * @returns {string} Texto opcional sem espaços externos.
 */
function optionalText(value, max = 500) {
    const text = String(value ?? "").trim();
    return text.length > max ? text.slice(0, max) : text;
}

/**
 * Valida um campo inteiro positivo.
 *
 * @param {unknown} value - Valor bruto.
 * @param {string} field - Field name.
 * @returns {number} Inteiro válido.
 */
function positiveInteger(value, field) {
    const number = Number(value);

    if (!Number.isInteger(number) || number <= 0) {
        throw new HttpError(400, `${field} deve ser um inteiro positivo.`);
    }

    return number;
}

/**
 * Valida classificação etária entre 0 e 18.
 *
 * @param {unknown} value - Classificação etária bruta.
 * @returns {number} Classificação etária segura.
 */
function assertAgeRating(value) {
    const number = Number(value);

    if (!Number.isInteger(number) || number < 0 || number > 18) {
        throw new HttpError(400, "Classificacao etaria invalida.");
    }

    return number;
}

/**
 * Converte ids de taxonomias para ObjectIds.
 *
 * @param {unknown} value - Lista bruta de ids de taxonomias.
 * @returns {import("mongodb").ObjectId[]} Lista de ObjectId.
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
 * Valida uma faixa de legendas ou áudio.
 *
 * @param {{ language?: unknown, label?: unknown, src?: unknown }} track - Faixa bruta.
 * @returns {{ language: string, label: string, src: string }} Faixa segura.
 */
function mediaTrack(track) {
    return {
        language: requiredText(track?.language, "language", 2, 12),
        label: requiredText(track?.label, "label", 2, 80),
        src: requiredText(track?.src, "src", 1, 500),
    };
}

/**
 * Valida uma opção de qualidade.
 *
 * @param {{ label?: unknown, value?: unknown, playbackUrl?: unknown }} option - Opção de qualidade bruta.
 * @returns {{ label: string, value: string, playbackUrl: string }} Opção de qualidade segura.
 */
function qualityOption(option) {
    return {
        label: requiredText(option?.label, "label", 2, 40),
        value: requiredText(option?.value, "value", 2, 40),
        playbackUrl: requiredText(option?.playbackUrl, "playbackUrl", 1, 500),
    };
}

/**
 * Constrói um slug estável a partir de texto.
 *
 * @param {unknown} value - Texto bruto.
 * @returns {string} Slug seguro para URL.
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
 * Valida faixas media e opções de qualidade.
 *
 * @param {{ tracks?: { subtitles?: unknown[], audio?: unknown[] }, qualityOptions?: unknown[] }} input - Opções media brutas.
 * @returns {{ tracks: { subtitles: Array<{ language: string, label: string, src: string }>, audio: Array<{ language: string, label: string, src: string }> }, qualityOptions: Array<{ label: string, value: string, playbackUrl: string }> }} Opções media seguras.
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
 * Valida dados de criação/atualização de catálogo.
 *
 * @param {Record<string, unknown>} input - Dados brutos de catálogo.
 * @returns {Record<string, unknown>} Campos seguros do documento de catálogo.
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
 * Valida estado de publicação de conteúdo.
 *
 * @param {unknown} estado - Estado bruto.
 * @returns {string} Estado seguro.
 */
export function assertStatus(status) {
    const normalized = String(status ?? "").trim();

    if (!CONTENT_STATUS.includes(normalized)) {
        throw new HttpError(400, "Estado de conteudo invalido.");
    }

    return normalized;
}

/**
 * Valida dados de taxonomia.
 *
 * @param {{ name?: unknown, slug?: unknown, description?: unknown }} input - Dados brutos de taxonomia.
 * @returns {{ name: string, slug: string, description: string }} Dados seguros de taxonomia.
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
