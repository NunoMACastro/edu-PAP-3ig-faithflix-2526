/**
 * @file Ficheiro `real_dev/backend/scripts/promote-admin.js` da implementação real_dev.
 */

import {
    assertTransactionSupport,
    closeDatabase,
    getDb,
} from "../src/config/database.js";
import { env } from "../src/config/env.js";

const email = process.argv[2]?.trim().toLowerCase();

/**
 * Promove uma conta apenas numa base demo explicitamente confirmada.
 *
 * @returns {Promise<void>}
 */
async function main() {
    if (!email) {
        throw new Error("Uso: npm run promote:admin -- email@exemplo.test");
    }
    if (env.nodeEnv === "production") {
        throw new Error("A promoção administrativa é proibida em produção.");
    }
    if (!env.mongoDbName.endsWith("_demo")) {
        throw new Error("A promoção administrativa exige uma base terminada em _demo.");
    }
    if (process.env.ALLOW_ADMIN_PROMOTION !== "true") {
        throw new Error("Defina ALLOW_ADMIN_PROMOTION=true para confirmar a operação.");
    }
    if (process.env.ADMIN_PROMOTION_CONFIRM !== env.mongoDbName) {
        throw new Error("ADMIN_PROMOTION_CONFIRM deve corresponder ao nome da base demo.");
    }

    await assertTransactionSupport();
    const db = await getDb();
    const user = await db.collection("users").findOneAndUpdate(
        { email, accountStatus: { $ne: "deleted" } },
        { $set: { role: "admin", accountStatus: "active", updatedAt: new Date() } },
        { returnDocument: "after" },
    );

    if (!user) {
        throw new Error("Utilizador não encontrado.");
    }

    console.log("Conta demo promovida a administrador.");
}

try {
    await main();
} catch (error) {
    console.error(error instanceof Error ? error.message : "Promoção falhou.");
    process.exitCode = 1;
} finally {
    await closeDatabase();
}
