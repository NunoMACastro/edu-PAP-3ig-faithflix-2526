/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/token.js` da implementação real_dev.
 */

import { createHash, randomBytes } from "node:crypto";

/**
 * Cria um token opaco sem dados de utilizador embutidos.
 *
 * @returns {string} Random token suitable for session or reset flows.
 */
export function createOpaqueToken() {
    return randomBytes(32).toString("hex");
}

/**
 * Verifica se um valor parece um token opaco FaithFlix.
 *
 * @param {unknown} token - Valor bruto do token.
 * @returns {boolean} Verdadeiro for 64-character hexadecimal tokens.
 */
export function isOpaqueToken(token) {
    return /^[a-f0-9]{64}$/i.test(String(token ?? ""));
}

/**
 * Hashes a token before storing or querying it.
 *
 * @param {string} token - Valor do token opaco.
 * @returns {string} SHA-256 token hash.
 */
export function hashToken(token) {
    return createHash("sha256").update(String(token)).digest("hex");
}
