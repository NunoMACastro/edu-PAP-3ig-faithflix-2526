/**
 * @file Ponto de serialização partilhado por billing e família.
 *
 * Checkout/trial e criação/aceitação de memberships escrevem o mesmo documento
 * por utilizador. O write-conflict obriga a segunda transação a repetir todas
 * as verificações sobre subscrição própria e lugares familiares.
 */

/**
 * Reclama logicamente o estado mutável de billing de utilizadores.
 *
 * Os ids são ordenados para que operações com owner+membro não criem deadlocks.
 * O próprio documento `users` é escrito primeiro, serializando billing/família
 * com bloqueio administrativo e eliminação RGPD.
 *
 * @param {{ db: import("mongodb").Db, userIds: import("mongodb").ObjectId[], now: Date, session?: import("mongodb").ClientSession }} input Contexto transacional.
 * @returns {Promise<void>}
 */
export async function serializeBillingCustomers(input) {
  const userIds = [...new Map(
    input.userIds.map((userId) => [String(userId), userId]),
  ).entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, userId]) => userId);

  for (const userId of userIds) {
    const user = await input.db.collection("users").findOne(
      { _id: userId },
      { session: input.session },
    );
    const accountStatus = user?.accountStatus ?? "active";

    if (!user || accountStatus !== "active") {
      const error = new Error("Conta indisponível para operações de billing.");
      error.statusCode = 409;
      error.code = "ACCOUNT_NOT_AVAILABLE";
      throw error;
    }

    const userWrite = await input.db.collection("users").updateOne(
      {
        _id: userId,
        accountStatus:
          user.accountStatus === undefined
            ? { $exists: false }
            : "active",
      },
      {
        $inc: { billingVersion: 1 },
        $set: { billingUpdatedAt: input.now },
      },
      { session: input.session },
    );
    if (userWrite.matchedCount !== 1) {
      const error = new Error("Conta indisponível para operações de billing.");
      error.statusCode = 409;
      error.code = "ACCOUNT_NOT_AVAILABLE";
      throw error;
    }
  }

  for (const userId of userIds) {
    await input.db.collection("billing_customer_locks").updateOne(
      { _id: userId },
      {
        $inc: { revision: 1 },
        $set: { updatedAt: input.now },
        $setOnInsert: { userId, createdAt: input.now },
      },
      { upsert: true, session: input.session },
    );
  }
}

/**
 * Atalho para uma única conta.
 *
 * @param {{ db: import("mongodb").Db, userId: import("mongodb").ObjectId, now: Date, session?: import("mongodb").ClientSession }} input Contexto.
 * @returns {Promise<void>}
 */
export async function serializeBillingCustomer(input) {
  return serializeBillingCustomers({
    ...input,
    userIds: [input.userId],
  });
}
