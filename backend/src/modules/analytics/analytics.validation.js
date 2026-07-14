/**
 * @file Contrato mínimo e não identificável dos eventos analíticos locais.
 */

import { HttpError } from "../../utils/http-error.js";

export const ANONYMOUS_METRIC_TYPES = Object.freeze([
    "catalog_view",
    "search_submit",
    "playback_started",
    "playback_completed",
]);

// A categoria é deliberadamente fechada e ampla: nunca recebe ids, slugs,
// queries, títulos ou qualquer outro texto livre do browser.
export const ANONYMOUS_METRIC_CATEGORIES = Object.freeze([
    "movie",
    "series",
    "episode",
    "documentary",
    "uncategorized",
]);

const ALLOWED_FIELDS = new Set(["type", "category"]);

/**
 * Valida um evento sem aceitar metadados livres.
 *
 * @param {unknown} input Corpo recebido.
 * @returns {{ type: string, category?: string }} Evento normalizado.
 * @throws {HttpError} Quando o tipo, categoria ou shape não são permitidos.
 */
export function assertAnonymousMetricEvent(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(
            400,
            "Evento analítico inválido.",
            undefined,
            "ANALYTICS_EVENT_INVALID",
        );
    }

    if (Object.keys(input).some((field) => !ALLOWED_FIELDS.has(field))) {
        throw new HttpError(
            400,
            "Evento analítico contém campos desconhecidos.",
            undefined,
            "ANALYTICS_EVENT_INVALID",
        );
    }

    const type = typeof input.type === "string" ? input.type.trim() : "";
    if (!ANONYMOUS_METRIC_TYPES.includes(type)) {
        throw new HttpError(
            400,
            "Tipo de evento analítico inválido.",
            undefined,
            "ANALYTICS_EVENT_INVALID",
        );
    }

    if (input.category === undefined || input.category === null) {
        return { type };
    }

    const category =
        typeof input.category === "string" ? input.category.trim() : "";
    if (!ANONYMOUS_METRIC_CATEGORIES.includes(category)) {
        throw new HttpError(
            400,
            "Categoria de evento analítico inválida.",
            undefined,
            "ANALYTICS_EVENT_INVALID",
        );
    }

    return { type, category };
}
