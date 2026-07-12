/**
 * @file Seed de utilizadores de demonstracao FaithFlix.
 */

import { ensureAuthIndexes } from "../src/modules/auth/auth.indexes.js";
import {
    buildDemoUser,
    assertNoManualConflicts,
    deleteDemoDocs,
    demoUserEmails,
    demoUserIdList,
    demoUsers,
    getDemoDb,
    runSeedCli,
} from "./demo-seed-utils.js";

/**
 * Cria contas fixas para demonstrar perfis de utilizador, moderacao, admin,
 * subscricao e associacao.
 *
 * @returns {Promise<object>} Resumo da execucao.
 */
export async function seedDemoUsers() {
    const db = await getDemoDb();
    await ensureAuthIndexes();

    await assertNoManualConflicts(
        db,
        "users",
        [
            { _id: { $in: demoUserIdList } },
            { email: { $in: demoUserEmails } },
        ],
        "Utilizador de demo",
    );

    await deleteDemoDocs(db, "sessions", [{ userId: { $in: demoUserIdList } }]);
    await deleteDemoDocs(db, "password_reset_tokens", [{ userId: { $in: demoUserIdList } }]);
    await deleteDemoDocs(db, "password_reset_dev_outbox", [
        { userId: { $in: demoUserIdList } },
        { email: { $in: demoUserEmails } },
    ]);
    await deleteDemoDocs(db, "users");

    const users = await Promise.all(
        Object.values(demoUsers).map((user) => buildDemoUser(user)),
    );
    await db.collection("users").insertMany(users);

    return {
        users: users.length,
        emails: demoUserEmails,
    };
}

await runSeedCli(import.meta.url, seedDemoUsers, "Seed demo users");
