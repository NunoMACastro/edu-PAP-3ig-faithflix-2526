import { getDb } from "../src/config/database.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Uso: npm run promote:admin -- email@exemplo.test");
  process.exit(1);
}

const db = await getDb();
const result = await db.collection("users").findOneAndUpdate(
  { email },
  { $set: { role: "admin", updatedAt: new Date() } },
  { returnDocument: "after" },
);

if (!result) {
  console.error("Utilizador nao encontrado.");
  process.exit(1);
}

console.log(`Admin promovido: ${result.email}`);
process.exit(0);