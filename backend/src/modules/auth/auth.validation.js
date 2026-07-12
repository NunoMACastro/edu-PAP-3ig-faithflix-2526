/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/auth.validation.js` da implementação real_dev.
 */

import { HttpError } from "../../utils/http-error.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalizes an email before validation or lookup.
 *
 * @param {unknown} email - Valor bruto de email recebido no pedido.
 * @returns {string} Trimmed lowercase email.
 */
export function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}

/**
 * Valida e devolve o nome público do utilizador.
 *
 * @param {unknown} name - Valor bruto do nome.
 * @returns {string} Valid trimmed name.
 * @throws {HttpError} Lança erro quando o nome fica fora dos limites aceites.
 */
export function assertValidName(name) {
    const value = typeof name === "string" ? name.trim() : "";

    if (value.length < 2 || value.length > 80) {
        throw new HttpError(400, "O nome deve ter entre 2 e 80 caracteres.");
    }

    return value;
}

/**
 * Valida e devolve um email normalizado.
 *
 * @param {unknown} email - Valor bruto do email.
 * @returns {string} Valid normalized email.
 * @throws {HttpError} Lança erro quando o formato do email é inválido.
 */
export function assertValidEmail(email) {
    const value = normalizeEmail(email);

    if (value.length > 254 || !EMAIL_PATTERN.test(value)) {
        throw new HttpError(400, "Email invalido.");
    }

    return value;
}

/**
 * Valida e devolve uma password.
 *
 * @param {unknown} password - Valor bruto da password.
 * @returns {string} Valid password.
 * @throws {HttpError} Lança erro quando a password fica fora dos limites.
 */
export function assertValidPassword(password) {
    if (typeof password !== "string") {
        throw new HttpError(
            400,
            "A password deve ter entre 10 e 128 caracteres.",
        );
    }

    const value = password;

    if (value.length < 10 || value.length > 128) {
        throw new HttpError(
            400,
            "A password deve ter entre 10 e 128 caracteres.",
        );
    }

    return value;
}
