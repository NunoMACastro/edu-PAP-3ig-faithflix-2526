/**
 * @file Validacao partilhada de paginacao para listagens HTTP.
 */

import { HttpError } from "./http-error.js";

/**
 * Converte um inteiro de query string sem aceitar coercoes ambiguas.
 *
 * @param {unknown} value Valor recebido do cliente.
 * @param {number} fallback Valor usado apenas quando o campo nao foi enviado.
 * @param {string} field Nome publico do campo.
 * @returns {number} Inteiro positivo validado.
 * @throws {HttpError} Quando o valor e booleano, decimal, vazio ou nao numerico.
 */
function positiveQueryInteger(value, fallback, field) {
    if (value === undefined) {
        return fallback;
    }

    const normalized =
        typeof value === "string" && /^[1-9]\d*$/.test(value)
            ? Number(value)
            : value;

    if (
        typeof normalized !== "number" ||
        !Number.isSafeInteger(normalized) ||
        normalized < 1
    ) {
        throw new HttpError(400, `${field} invalido.`);
    }

    return normalized;
}

/**
 * Valida `page` e `limit` para uma listagem paginada.
 *
 * @param {Record<string, unknown>} input Query recebida.
 * @param {{ defaultLimit?: number, maxLimit?: number }} [options] Limites da rota.
 * @returns {{ page: number, limit: number }} Pagina e limite seguros.
 */
export function parsePagination(input = {}, options = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Paginacao invalida.");
    }

    const defaultLimit = options.defaultLimit ?? 20;
    const maxLimit = options.maxLimit ?? 50;
    const page = positiveQueryInteger(input.page, 1, "Pagina");
    const limit = positiveQueryInteger(input.limit, defaultLimit, "Limite");

    if (limit > maxLimit) {
        throw new HttpError(
            400,
            `Limite invalido. Limite maximo: ${maxLimit}.`,
        );
    }

    if (!Number.isSafeInteger((page - 1) * limit)) {
        throw new HttpError(400, "Pagina demasiado alta.");
    }

    return { page, limit };
}

/**
 * Constroi metadados consistentes para uma pagina ja consultada.
 *
 * @param {{ page: number, limit: number, total: number }} input Valores da pagina.
 * @returns {{ page: number, limit: number, total: number, totalPages: number }} Metadados publicos.
 */
export function paginationMetadata({ page, limit, total }) {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}
