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
