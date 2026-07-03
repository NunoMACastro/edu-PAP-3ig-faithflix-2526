/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/auth.password.js` da implementação real_dev.
 */

import {
    randomBytes,
    scrypt as scryptCallback,
    timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

/**
 * Hashes a password with a random salt using Node's scrypt implementation.
 *
 * @param {string} password - Plain password received during register/reset.
 * @returns {Promise<string>} Representação guardada no formato `salt:hash`.
 */
export async function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = await scrypt(password, salt, KEY_LENGTH);
    return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a password against a stored `salt:hash` value.
 *
 * @param {string} password - Plain password to verify.
 * @param {string} storedHash - Stored `salt:hash` value.
 * @returns {Promise<boolean>} Verdadeiro quando a password corresponde.
 */
export async function verifyPassword(password, storedHash) {
    const [salt, storedKey] = String(storedHash ?? "").split(":");

    if (!salt || !storedKey) {
        return false;
    }

    const derivedKey = await scrypt(password, salt, KEY_LENGTH);
    const storedBuffer = Buffer.from(storedKey, "hex");

    if (storedBuffer.length !== derivedKey.length) {
        return false;
    }

    return timingSafeEqual(storedBuffer, derivedKey);
}
