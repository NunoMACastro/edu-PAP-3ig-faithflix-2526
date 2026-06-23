/**
 * @file Ficheiro `real_dev/backend/scripts/promote-admin.js` da implementação real_dev.
 */

import { getDb } from "../src/config/database.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
    console.error("Uso: npm run promote:admin -- email@exemplo.test");
    process.exit(1);
}

const db = await getDb();
const user = await db.collection("users").findOneAndUpdate(
    { email },
    { $set: { role: "admin", updatedAt: new Date() } },
    { returnDocument: "after" },
);

if (!user) {
    console.error("Utilizador nao encontrado.");
    process.exit(1);
}

console.log(`Admin promovido: ${user.email}`);
process.exit(0);
