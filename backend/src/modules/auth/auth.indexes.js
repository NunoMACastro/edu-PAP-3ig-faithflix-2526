/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/auth.indexes.js` da implementação real_dev.
 */

import { getDb } from "../../config/database.js";

/**
 * Garante que existem os índices exigidos pelos fluxos de autenticação.
 *
 * @returns {Promise<void>} Termina depois de o MongoDB criar ou confirmar índices.
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
    await db
        .collection("password_reset_dev_outbox")
        .createIndex({ email: 1, createdAt: -1 });
    await db
        .collection("password_reset_dev_outbox")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}
