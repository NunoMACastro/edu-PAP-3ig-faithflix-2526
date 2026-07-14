/**
 * @file Validação de pesquisas administrativas leves de associações.
 */

import { HttpError } from "../../utils/http-error.js";
import { parsePagination } from "../../utils/pagination.js";

/**
 * Valida a pesquisa paginada usada por seletores administrativos.
 *
 * @param {Record<string, unknown>} input Query params recebidos.
 * @returns {{ search: string, page: number, limit: number }} Pesquisa segura.
 */
export function assertAdminCharityLookupQuery(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Pesquisa de associações inválida.");
    }
    if (input.search !== undefined && typeof input.search !== "string") {
        throw new HttpError(400, "Pesquisa de associações inválida.");
    }

    const search = input.search?.trim() ?? "";
    if (search.length > 80) {
        throw new HttpError(400, "A pesquisa não pode exceder 80 caracteres.");
    }

    return {
        search,
        ...parsePagination(input, { defaultLimit: 10, maxLimit: 20 }),
    };
}
