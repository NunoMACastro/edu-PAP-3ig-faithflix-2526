/** @file Inserção interna dos utilizadores FaithFlix demo-v2. */

import { buildDemoUser, getDemoContext, getDemoDb } from "./demo-seed-utils.js";

/** @returns {Promise<object>} Resumo do módulo. */
export async function seedDemoUsers() {
    const db = await getDemoDb();
    const { users } = getDemoContext();
    const documents = await Promise.all(users.map(buildDemoUser));
    await db.collection("users").insertMany(documents);
    return {
        users: documents.length,
        active: documents.filter((item) => item.accountStatus === "active").length,
        blocked: documents.filter((item) => item.accountStatus === "blocked").length,
        deleted: documents.filter((item) => item.accountStatus === "deleted").length,
    };
}
