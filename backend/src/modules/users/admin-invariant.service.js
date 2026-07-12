/**
 * @file Invariante transacional que preserva pelo menos um admin ativo.
 */

import { HttpError } from "../../utils/http-error.js";

/**
 * Indica se uma conta pertence ao conjunto de administradores operacionais.
 *
 * @param {{ role?: string, accountStatus?: string }} user Utilizador.
 * @returns {boolean} Estado do invariante.
 */
export function isActiveAdmin(user) {
  return (
    user?.role === "admin" &&
    (user?.accountStatus ?? "active") === "active"
  );
}

/**
 * Serializa remoções de admins e recusa a transição de um para zero.
 *
 * @param {{ db: import("mongodb").Db, session?: import("mongodb").ClientSession, user: object, now?: Date }} input Contexto.
 * @returns {Promise<void>}
 */
export async function assertAnotherActiveAdminRemains(input) {
  if (!isActiveAdmin(input.user)) return;
  const now = input.now instanceof Date ? input.now : new Date();

  await input.db.collection("admin_invariants").updateOne(
    { _id: "active-admin-roster" },
    {
      $inc: { revision: 1 },
      $set: { updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, session: input.session },
  );
  const activeAdminCount = await input.db.collection("users").countDocuments(
    {
      role: "admin",
      $or: [
        { accountStatus: "active" },
        { accountStatus: null },
        { accountStatus: { $exists: false } },
      ],
    },
    { session: input.session },
  );

  if (activeAdminCount <= 1) {
    throw new HttpError(
      409,
      "A operacao removeria o ultimo administrador ativo.",
      undefined,
      "LAST_ACTIVE_ADMIN",
    );
  }
}
