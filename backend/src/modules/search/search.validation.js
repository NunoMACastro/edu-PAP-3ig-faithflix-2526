import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

export const SEARCH_SORTS = ["title", "recent", "rating"];
export const SEARCH_TYPES = ["movie", "series", "episode", "documentary"];

/**
 * Escapes user text before building a regular expression.
 *
 * @param {unknown} value - Raw search text.
 * @returns {string} Escaped regular expression text.
 */
export function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validates the public search query length.
 *
 * @param {unknown} value - Raw query parameter.
 * @returns {string} Normalized search query.
 */
export function assertSearchQuery(value) {
    const query = String(value ?? "").replace(/\s+/g, " ").trim();

    if (query.length < 2 || query.length > 80) {
        throw new HttpError(400, "A pesquisa deve ter entre 2 e 80 caracteres.");
    }

    return query;
}

/**
 * Validates public pagination parameters.
 *
 * @param {Record<string, unknown>} input - Raw query parameters.
 * @returns {{ page: number, limit: number }} Safe pagination options.
 */
export function parsePagination(input) {
    const page = Number(input.page ?? 1);
    const limit = Number(input.limit ?? 12);

    if (!Number.isInteger(page) || page < 1) {
        throw new HttpError(400, "Pagina invalida.");
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 24) {
        throw new HttpError(400, "Limite invalido.");
    }

    return { page, limit };
}

/**
 * Validates MF3 search filters and sorting.
 *
 * @param {Record<string, unknown>} input - Raw query parameters.
 * @returns {{ type: string | null, sort: string, taxonomyId: string | null }} Safe filters.
 */
export function parseSearchFilters(input) {
    const type = String(input.type ?? "").trim();
    const sort = String(input.sort ?? "title").trim();
    const taxonomyId = String(input.taxonomyId ?? "").trim();

    if (type && !SEARCH_TYPES.includes(type)) {
        throw new HttpError(400, "Tipo de conteudo invalido.");
    }

    if (!SEARCH_SORTS.includes(sort)) {
        throw new HttpError(400, "Ordenacao invalida.");
    }

    if (taxonomyId && !ObjectId.isValid(taxonomyId)) {
        throw new HttpError(400, "Taxonomia invalida.");
    }

    return { type: type || null, sort, taxonomyId: taxonomyId || null };
}
