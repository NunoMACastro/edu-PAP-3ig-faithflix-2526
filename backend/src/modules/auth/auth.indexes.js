import { getDb } from "../../config/database.js";

/**
 * Ensures the indexes required by authentication flows exist.
 *
 * @returns {Promise<void>} Resolves after MongoDB has created or confirmed indexes.
 */
export async function ensureAuthIndexes() {
    const db = await getDb();

    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db
        .collection("sessions")
        .createIndex({ tokenHash: 1 }, { unique: true });
    await db
        .collection("sessions")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db
        .collection("password_reset_tokens")
        .createIndex({ tokenHash: 1 }, { unique: true });
    await db
        .collection("password_reset_tokens")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}
