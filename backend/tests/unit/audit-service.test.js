/**
 * @file Testes da normalização segura do audit log.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import {
  runInTransaction,
  setDbForTests,
} from "../../src/config/database.js";
import { writeAdminAudit } from "../../src/modules/audit/audit.service.js";

afterEach(() => {
  setDbForTests(null);
});

test("audit preserva Date/ObjectId semanticamente e remove segredos sem case drift", async () => {
  let stored;
  const actorUserId = new ObjectId();
  const targetId = new ObjectId();
  const occurredAt = new Date("2026-07-10T00:00:00.000Z");
  const db = {
    collection() {
      return {
        async insertOne(document) {
          stored = document;
          return { insertedId: new ObjectId() };
        },
      };
    },
  };
  setDbForTests(db);

  await runInTransaction(async ({ db: transactionDb, session }) => {
    await writeAdminAudit({
      db: transactionDb,
      session,
      actorUserId,
      action: "test.audit",
      targetType: "test",
      targetId,
      before: {
        occurredAt,
        ownerId: targetId,
        PasswordHash: "nao guardar",
        TOKEN: "nao guardar",
        email: "pessoa@example.test",
        contactEmail: "contacto@example.test",
        phone: "+351000000000",
        payload: Buffer.from("nao guardar"),
      },
      after: null,
    });
  });

  assert.ok(stored.before.occurredAt instanceof Date);
  assert.equal(stored.before.occurredAt.toISOString(), occurredAt.toISOString());
  assert.equal(stored.before.ownerId, String(targetId));
  assert.equal("PasswordHash" in stored.before, false);
  assert.equal("TOKEN" in stored.before, false);
  assert.equal("email" in stored.before, false);
  assert.equal("contactEmail" in stored.before, false);
  assert.equal("phone" in stored.before, false);
  assert.equal(stored.before.payload, "[BINARY_REDACTED]");
});

test("audit recusa escrita fora de runInTransaction", async () => {
  let insertAttempted = false;
  const db = {
    collection() {
      return {
        async insertOne() {
          insertAttempted = true;
          return { insertedId: new ObjectId() };
        },
      };
    },
  };

  await assert.rejects(
    () =>
      writeAdminAudit({
        db,
        actorUserId: new ObjectId(),
        action: "test.outside_transaction",
        targetType: "test",
        targetId: new ObjectId(),
      }),
    (error) => error.code === "TRANSACTION_CONTEXT_REQUIRED",
  );
  assert.equal(insertAttempted, false);
});
