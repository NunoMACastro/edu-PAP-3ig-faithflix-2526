import { createHash, randomBytes } from "node:crypto";

/**
 * Creates an opaque token with no embedded user data.
 *
 * @returns {string} Random token suitable for session or reset flows.
 */
export function createOpaqueToken() {
    return randomBytes(32).toString("hex");
}

/**
 * Checks whether a value looks like a FaithFlix opaque token.
 *
 * @param {unknown} token - Raw token value.
 * @returns {boolean} True for 64-character hexadecimal tokens.
 */
export function isOpaqueToken(token) {
    return /^[a-f0-9]{64}$/i.test(String(token ?? ""));
}

/**
 * Hashes a token before storing or querying it.
 *
 * @param {string} token - Opaque token value.
 * @returns {string} SHA-256 token hash.
 */
export function hashToken(token) {
    return createHash("sha256").update(String(token)).digest("hex");
}
