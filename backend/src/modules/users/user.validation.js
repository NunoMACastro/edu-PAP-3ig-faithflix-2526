import { HttpError } from "../../utils/http-error.js";

export const VALID_ROLES = ["user", "moderator", "admin"];

/**
 * Validates self-service profile updates.
 *
 * @param {{ name?: unknown }} input - Profile update payload.
 * @returns {{ name: string }} Safe update payload.
 */
export function assertProfileUpdate(input) {
    const name = String(input?.name ?? "").trim();

    if (name.length < 2 || name.length > 80) {
        throw new HttpError(400, "O nome deve ter entre 2 e 80 caracteres.");
    }

    return { name };
}

/**
 * Validates an admin role update.
 *
 * @param {{ role?: unknown }} input - Role update payload.
 * @returns {{ role: string }} Safe role update.
 */
export function assertRoleUpdate(input) {
    const role = String(input?.role ?? "").trim();

    if (!VALID_ROLES.includes(role)) {
        throw new HttpError(400, "Role invalida.");
    }

    return { role };
}

/**
 * Validates the authenticated user's parental limit.
 *
 * @param {{ parentalMaxAgeRating?: unknown }} input - Parental settings payload.
 * @returns {{ parentalMaxAgeRating: number }} Safe parental update.
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
