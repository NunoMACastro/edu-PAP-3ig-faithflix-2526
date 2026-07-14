/**
 * @file Ficheiro `real_dev/backend/src/modules/users/user.validation.js` da implementação real_dev.
 */

import { HttpError } from "../../utils/http-error.js";
import { parsePagination } from "../../utils/pagination.js";

export const VALID_ROLES = ["user", "moderator", "admin"];
export const VALID_ACCOUNT_STATUSES = ["active", "blocked"];
export const FILTER_ACCOUNT_STATUSES = [
    ...VALID_ACCOUNT_STATUSES,
    "deleted",
];
const MAX_ADMIN_SEARCH_LENGTH = 80;

/**
 * Valida atualizações de perfil em autosserviço.
 *
 * @param {{ name?: unknown }} input - Profile update dados.
 * @returns {{ name: string }} Dados seguros de atualização.
 */
export function assertProfileUpdate(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Atualização de perfil inválida.");
    }

    const name = typeof input.name === "string" ? input.name.trim() : "";

    if (name.length < 2 || name.length > 80) {
        throw new HttpError(400, "O nome deve ter entre 2 e 80 caracteres.");
    }

    return { name };
}

/**
 * Valida atualização administrativa de role.
 *
 * @param {{ role?: unknown }} input - Role update dados.
 * @returns {{ role: string }} Atualização segura de role.
 */
export function assertRoleUpdate(input) {
    if (
        !input ||
        typeof input !== "object" ||
        Array.isArray(input) ||
        Object.keys(input).length !== 1 ||
        !("role" in input)
    ) {
        throw new HttpError(400, "Atualização de role inválida.");
    }

    const role = typeof input?.role === "string" ? input.role.trim() : "";

    if (!VALID_ROLES.includes(role)) {
        throw new HttpError(400, "Role inválida.");
    }

    return { role };
}

/**
 * Escapa caracteres especiais para usar pesquisa `$regex` como literal.
 *
 * @param {string} value Texto normalizado.
 * @returns {string} Texto seguro para pesquisa.
 */
function escapeRegexLiteral(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Valida alteracao administrativa de role e estado operacional.
 *
 * @param {{ role?: unknown, accountStatus?: unknown }} input Dados recebidos.
 * @returns {{ role?: string, accountStatus?: string }} Atualizacao segura.
 * @throws {HttpError} Quando nao ha campos validos ou algum valor e invalido.
 */
export function assertAdminUserUpdate(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Atualização administrativa inválida.");
    }

    const update = {};

    if ("role" in input) {
        const role = typeof input.role === "string" ? input.role.trim() : "";

        if (!VALID_ROLES.includes(role)) {
            throw new HttpError(400, "Role inválida.");
        }

        update.role = role;
    }

    if ("accountStatus" in input) {
        const accountStatus =
            typeof input.accountStatus === "string"
                ? input.accountStatus.trim()
                : "";

        if (!VALID_ACCOUNT_STATUSES.includes(accountStatus)) {
            throw new HttpError(400, "Estado de conta inválido.");
        }

        update.accountStatus = accountStatus;
    }

    if (Object.keys(update).length === 0) {
        throw new HttpError(400, "Indica role ou estado de conta.");
    }

    return update;
}

/**
 * Valida filtros da listagem administrativa.
 *
 * @param {{ search?: unknown, status?: unknown }} filters Query string recebida.
 * @returns {{ search?: string, status?: string }} Filtros normalizados.
 * @throws {HttpError} Quando o texto e demasiado longo ou o estado e invalido.
 */
export function assertAdminUserFilters(filters = {}) {
    if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
        throw new HttpError(400, "Filtros de utilizador inválidos.");
    }

    const safeFilters = {};
    const search =
        filters.search === undefined
            ? ""
            : typeof filters.search === "string"
              ? filters.search.trim()
              : null;
    const status =
        filters.status === undefined
            ? ""
            : typeof filters.status === "string"
              ? filters.status.trim()
              : null;

    if (search === null) {
        throw new HttpError(400, "Pesquisa inválida.");
    }

    if (status === null) {
        throw new HttpError(400, "Filtro de estado inválido.");
    }

    if (search.length > MAX_ADMIN_SEARCH_LENGTH) {
        throw new HttpError(400, "Pesquisa demasiado longa.");
    }

    if (search) {
        safeFilters.search = escapeRegexLiteral(search);
    }

    if (status) {
        if (!FILTER_ACCOUNT_STATUSES.includes(status)) {
            throw new HttpError(400, "Filtro de estado inválido.");
        }

        safeFilters.status = status;
    }

    return safeFilters;
}

/**
 * Valida a pagina da listagem administrativa de utilizadores.
 *
 * @param {Record<string, unknown>} query Query string recebida.
 * @returns {{ page: number, limit: number }} Pagina administrativa segura.
 */
export function parseAdminUserPagination(query = {}) {
    return parsePagination(query, { defaultLimit: 20, maxLimit: 50 });
}

/**
 * Valida o limite parental do utilizador autenticado.
 *
 * @param {{ parentalMaxAgeRating?: unknown }} input - Parental settings dados.
 * @returns {{ parentalMaxAgeRating: number }} Atualização parental segura.
 */
export function assertParentalSettings(input) {
    const parentalMaxAgeRating = input?.parentalMaxAgeRating;

    if (
        typeof parentalMaxAgeRating !== "number" ||
        !Number.isInteger(parentalMaxAgeRating) ||
        parentalMaxAgeRating < 0 ||
        parentalMaxAgeRating > 18
    ) {
        throw new HttpError(400, "Limite parental inválido.");
    }

    return { parentalMaxAgeRating };
}
