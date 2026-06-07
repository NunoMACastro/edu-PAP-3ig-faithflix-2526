import { HttpError } from "../../utils/http-error.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalizes an email before validation or lookup.
 *
 * @param {unknown} email - Raw email value from a request.
 * @returns {string} Trimmed lowercase email.
 */
export function normalizeEmail(email) {
    return String(email ?? "").trim().toLowerCase();
}

/**
 * Validates and returns a user display name.
 *
 * @param {unknown} name - Raw name value.
 * @returns {string} Valid trimmed name.
 * @throws {HttpError} Throws when the name is outside accepted limits.
 */
export function assertValidName(name) {
    const value = String(name ?? "").trim();

    if (value.length < 2 || value.length > 80) {
        throw new HttpError(400, "O nome deve ter entre 2 e 80 caracteres.");
    }

    return value;
}

/**
 * Validates and returns a normalized email.
 *
 * @param {unknown} email - Raw email value.
 * @returns {string} Valid normalized email.
 * @throws {HttpError} Throws when the email format is invalid.
 */
export function assertValidEmail(email) {
    const value = normalizeEmail(email);

    if (!EMAIL_PATTERN.test(value)) {
        throw new HttpError(400, "Email invalido.");
    }

    return value;
}

/**
 * Validates and returns a password.
 *
 * @param {unknown} password - Raw password value.
 * @returns {string} Valid password.
 * @throws {HttpError} Throws when the password is too short.
 */
export function assertValidPassword(password) {
    const value = String(password ?? "");

    if (value.length < 10) {
        throw new HttpError(
            400,
            "A password deve ter pelo menos 10 caracteres.",
        );
    }

    return value;
}
