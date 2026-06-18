/**
 * @file Ficheiro `real_dev/backend/src/modules/users/user.validation.js` da implementação real_dev.
 */

import { HttpError } from "../../utils/http-error.js";

export const VALID_ROLES = ["user", "moderator", "admin"];

/**
 * Valida atualizações de perfil em autosserviço.
 *
 * @param {{ name?: unknown }} input - Profile update dados.
 * @returns {{ name: string }} Dados seguros de atualização.
 */
export function assertProfileUpdate(input) {
    const name = String(input?.name ?? "").trim();

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
    const role = String(input?.role ?? "").trim();

    if (!VALID_ROLES.includes(role)) {
        throw new HttpError(400, "Role invalida.");
    }

    return { role };
}

/**
 * Valida o limite parental do utilizador autenticado.
 *
 * @param {{ parentalMaxAgeRating?: unknown }} input - Parental settings dados.
 * @returns {{ parentalMaxAgeRating: number }} Atualização parental segura.
 */
export function assertParentalSettings(input) {
    const parentalMaxAgeRating = Number(input?.parentalMaxAgeRating);

    if (
        !Number.isInteger(parentalMaxAgeRating) ||
        parentalMaxAgeRating < 0 ||
        parentalMaxAgeRating > 18
    ) {
        throw new HttpError(400, "Limite parental invalido.");
    }

    return { parentalMaxAgeRating };
}
// apps/backend/src/modules/users/user.validation.js
export const VALID_ACCOUNT_STATUSES = ["active", "blocked"];
const MAX_ADMIN_SEARCH_LENGTH = 80;

/**
 * Escapa caracteres especiais para usar pesquisa textual em `$regex` como literal.
 *
 * @param {string} value Texto normalizado.
 * @returns {string} Texto seguro para pesquisa literal.
 */
function escapeRegexLiteral(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Valida alteração administrativa de uma conta.
 *
 * @param {{ role?: unknown, accountStatus?: unknown }} input Dados recebidos.
 * @returns {{ role?: string, accountStatus?: string }} Alteração segura.
 * @throws {HttpError} Quando role ou estado são inválidos.
 */
export function assertAdminUserUpdate(input) {
    const update = {};

    if ("role" in (input ?? {})) {
        const role = String(input.role ?? "").trim();

        if (!VALID_ROLES.includes(role)) {
            throw new HttpError(400, "Role inválida.");
        }

        update.role = role;
    }

    if ("accountStatus" in (input ?? {})) {
        const accountStatus = String(input.accountStatus ?? "").trim();

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
 * Valida filtros de listagem administrativa.
 *
 * @param {{ search?: unknown, status?: unknown }} filters Query string recebida.
 * @returns {{ search?: string, status?: string }} Filtros normalizados e seguros.
 * @throws {HttpError} Quando o texto é demasiado longo ou o estado não existe.
 */
export function assertAdminUserFilters(filters = {}) {
    const safeFilters = {};
    const search = String(filters.search ?? "").trim();
    const status = String(filters.status ?? "").trim();

    if (search.length > MAX_ADMIN_SEARCH_LENGTH) {
        throw new HttpError(400, "Pesquisa demasiado longa.");
    }

    if (search) {
        safeFilters.search = escapeRegexLiteral(search);
    }

    if (status) {
        if (!VALID_ACCOUNT_STATUSES.includes(status)) {
            throw new HttpError(400, "Filtro de estado inválido.");
        }

        safeFilters.status = status;
    }

    return safeFilters;
}
