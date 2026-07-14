/**
 * @file Provas locais de atomicidade e concorrencia para operacoes admin F3-D.
 *
 * Os doubles implementam snapshots, rollback e serializacao de transacoes sem
 * abrir sockets nem usar MongoDB. Assim, fault injection valida a unidade de
 * commit dos services sem tocar na base configurada.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
  ensureCharityApplicationIndexes,
  submitCharityApplication,
} from "../../src/modules/charities/charity-applications.service.js";
import { linkUserToCharity } from "../../src/modules/charities/charity-reports.service.js";
import { reviewCharityApplication } from "../../src/modules/charities/charity-review.service.js";
import { updateIntegrationSetting } from "../../src/modules/integrations/integrations.service.js";
import { updateUserByAdmin } from "../../src/modules/users/user.service.js";

/**
 * Copia valores usados nos documentos, preservando datas e ObjectIds.
 *
 * @param {unknown} value Valor original.
 * @returns {unknown} Copia independente.
 */
function cloneValue(value) {
  if (value instanceof ObjectId) {
    return new ObjectId(value.toHexString());
  }

  if (value instanceof Date) {
    return new Date(value);
  }

  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]),
    );
  }

  return value;
}

/**
 * Compara ids e valores escalares como o subset MongoDB usado pelos services.
 *
 * @param {unknown} actual Valor persistido.
 * @param {unknown} expected Condicao da query.
 * @returns {boolean} Resultado do match.
 */
function matchesValue(actual, expected) {
  if (expected instanceof ObjectId) {
    return String(actual) === String(expected);
  }

  if (expected && typeof expected === "object" && !Array.isArray(expected)) {
    if ("$ne" in expected && actual === expected.$ne) return false;
    if ("$nin" in expected && expected.$nin.includes(actual)) return false;
    if ("$exists" in expected) {
      return (actual !== undefined) === expected.$exists;
    }
    return true;
  }

  return actual === expected;
}

/**
 * Aplica uma query plana aos documentos dos cenarios transacionais.
 *
 * @param {Record<string, unknown>} row Documento.
 * @param {Record<string, unknown>} query Query simplificada.
 * @returns {boolean} Verdadeiro quando o documento corresponde.
 */
function matches(row, query = {}) {
  return Object.entries(query).every(([key, expected]) => {
    if (key === "$or") {
      return expected.some((nested) => matches(row, nested));
    }

    return matchesValue(row[key], expected);
  });
}

/**
 * Aplica os operadores de escrita necessarios aos cenarios F3-D.
 *
 * @param {Record<string, unknown>} row Documento alvo.
 * @param {Record<string, Record<string, unknown>>} update Operadores MongoDB.
 * @param {boolean} isInsert Indica um upsert novo.
 * @returns {void}
 */
function applyUpdate(row, update, isInsert = false) {
  if (isInsert) {
    Object.assign(row, cloneValue(update.$setOnInsert ?? {}));
  }

  Object.assign(row, cloneValue(update.$set ?? {}));

  for (const [key, amount] of Object.entries(update.$inc ?? {})) {
    row[key] = Number(row[key] ?? 0) + Number(amount);
  }
}

/**
 * Cria um erro equivalente a uma violacao de indice unico MongoDB.
 *
 * @returns {Error & { code: number }} Erro com codigo 11000.
 */
function duplicateKeyError() {
  const error = new Error("duplicate key");
  error.code = 11000;
  return error;
}

/**
 * Cria DB transacional em memoria com rollback e fila de commits.
 *
 * @param {Record<string, Record<string, unknown>[]>} initialState Colecoes iniciais.
 * @returns {{ db: object, state: Record<string, Record<string, unknown>[]>, indexes: object[], control: { failAuditWrites: boolean, integrationSessions: unknown[], auditSessions: unknown[] } }} Harness.
 */
function createTransactionalDb(initialState = {}) {
  const state = Object.fromEntries(
    Object.entries(initialState).map(([name, rows]) => [
      name,
      cloneValue(rows),
    ]),
  );
  const indexes = [];
  const control = {
    failAuditWrites: false,
    integrationSessions: [],
    auditSessions: [],
  };
  let transactionTail = Promise.resolve();

  /**
   * Devolve sempre a lista atual, incluindo colecoes criadas num upsert.
   *
   * @param {string} name Nome da colecao.
   * @returns {Record<string, unknown>[]} Documentos atuais.
   */
  function rowsFor(name) {
    state[name] ??= [];
    return state[name];
  }

  /**
   * Restaura o snapshot completo depois de uma falha injetada.
   *
   * @param {Record<string, Record<string, unknown>[]>} snapshot Estado anterior.
   * @returns {void}
   */
  function restore(snapshot) {
    for (const name of Object.keys(state)) {
      if (!(name in snapshot)) delete state[name];
    }

    for (const [name, rows] of Object.entries(snapshot)) {
      state[name] = cloneValue(rows);
    }
  }

  const db = {
    /**
     * Executa transacoes uma a uma e reverte todas as colecoes em erro.
     *
     * @param {(context: { db: object, session: object }) => Promise<unknown>} work Unidade de trabalho.
     * @returns {Promise<unknown>} Resultado da unidade confirmada.
     */
    async runInTransaction(work) {
      const previous = transactionTail;
      let release;
      transactionTail = new Promise((resolve) => {
        release = resolve;
      });
      await previous;

      const snapshot = cloneValue(state);

      try {
        return await work({ db, session: { localTransaction: true } });
      } catch (error) {
        restore(snapshot);
        throw error;
      } finally {
        release();
      }
    },

    /**
     * Devolve o subset de colecao exigido pelos services sob teste.
     *
     * @param {string} name Nome da colecao.
     * @returns {object} Colecao fake.
     */
    collection(name) {
      return {
        async createIndex(keys, options = {}) {
          indexes.push({ name, keys, options });
          return options.name ?? `${name}_index`;
        },

        async findOne(query = {}) {
          const row = rowsFor(name).find((candidate) => matches(candidate, query));
          return row ? cloneValue(row) : null;
        },

        async countDocuments(query = {}) {
          return rowsFor(name).filter((row) => matches(row, query)).length;
        },

        async findOneAndUpdate(filter, update, options = {}) {
          const row = rowsFor(name).find((candidate) => matches(candidate, filter));

          if (!row) return null;

          const before = cloneValue(row);
          applyUpdate(row, update, false);
          return options.returnDocument === "before"
            ? before
            : cloneValue(row);
        },

        async updateOne(filter, update, options = {}) {
          if (name === "integration_settings") {
            control.integrationSessions.push(options.session);
          }

          let row = rowsFor(name).find((candidate) => matches(candidate, filter));

          if (!row && options.upsert) {
            row = Object.fromEntries(
              Object.entries(filter).filter(
                ([, value]) =>
                  !(value && typeof value === "object" && !(value instanceof ObjectId)),
              ),
            );
            applyUpdate(row, update, true);
            rowsFor(name).push(row);
            return { matchedCount: 0, modifiedCount: 0, upsertedId: row._id };
          }

          if (!row) return { matchedCount: 0, modifiedCount: 0 };

          applyUpdate(row, update, false);
          return { matchedCount: 1, modifiedCount: 1 };
        },

        async replaceOne(filter, replacement, options = {}) {
          if (name === "integration_settings") {
            control.integrationSessions.push(options.session);
          }

          const index = rowsFor(name).findIndex((candidate) =>
            matches(candidate, filter));

          if (index === -1 && options.upsert) {
            rowsFor(name).push(cloneValue({
              ...replacement,
              _id: replacement._id ?? new ObjectId(),
            }));
            return { matchedCount: 0, modifiedCount: 0 };
          }

          if (index === -1) return { matchedCount: 0, modifiedCount: 0 };

          rowsFor(name)[index] = cloneValue(replacement);
          return { matchedCount: 1, modifiedCount: 1 };
        },

        async insertOne(document, options = {}) {
          if (name === "admin_audit_logs") {
            control.auditSessions.push(options.session);
          }

          if (name === "admin_audit_logs" && control.failAuditWrites) {
            throw new Error("fault injection: audit unavailable");
          }

          if (
            name === "charity_applications" &&
            document.status === "pending" &&
            rowsFor(name).some(
              (row) => row.status === "pending" && row.email === document.email,
            )
          ) {
            throw duplicateKeyError();
          }

          if (
            name === "charities" &&
            rowsFor(name).some(
              (row) => String(row.applicationId) === String(document.applicationId),
            )
          ) {
            throw duplicateKeyError();
          }

          if (
            name === "charity_memberships" &&
            rowsFor(name).some(
              (row) => String(row.userId) === String(document.userId),
            )
          ) {
            throw duplicateKeyError();
          }

          const insertedId = document._id ?? new ObjectId();
          rowsFor(name).push(cloneValue({ ...document, _id: insertedId }));
          return { insertedId };
        },

        async deleteMany(filter = {}) {
          const before = rowsFor(name).length;
          state[name] = rowsFor(name).filter((row) => !matches(row, filter));
          return { deletedCount: before - state[name].length };
        },
      };
    },
  };

  return { db, state, indexes, control };
}

afterEach(() => {
  setDbForTests(null);
});

test("F3-D indice parcial e erro estavel impedem candidaturas pending duplicadas", async () => {
  const harness = createTransactionalDb();
  setDbForTests(harness.db);

  await ensureCharityApplicationIndexes();
  const uniqueIndex = harness.indexes.find(
    (entry) => entry.options.name === "uniq_pending_charity_application_email",
  );

  assert.deepEqual(uniqueIndex?.keys, { email: 1 });
  assert.equal(uniqueIndex?.options.unique, true);
  assert.deepEqual(uniqueIndex?.options.partialFilterExpression, {
    status: "pending",
  });

  const payload = {
    name: "Associacao Esperanca",
    contactName: "Ana Silva",
    email: "contacto@example.test",
    mission:
      "Apoio comunitario local continuado a familias em situacao vulneravel.",
  };

  await submitCharityApplication(payload);
  await assert.rejects(
    () => submitCharityApplication(payload),
    (error) =>
      error.statusCode === 409 && error.code === "PENDING_APPLICATION_EXISTS",
  );
  assert.equal(harness.state.charity_applications.length, 1);
});

test("F3-D falha no audit reverte decisao e criacao de associacao", async () => {
  const applicationId = new ObjectId();
  const reviewerId = new ObjectId();
  const harness = createTransactionalDb({
    charity_applications: [
      {
        _id: applicationId,
        name: "Associacao Vida",
        email: "vida@example.test",
        mission: "Apoio comunitario local com acompanhamento regular.",
        websiteUrl: "",
        status: "pending",
      },
    ],
    charities: [],
    admin_audit_logs: [],
  });
  harness.control.failAuditWrites = true;
  setDbForTests(harness.db);

  await assert.rejects(
    () =>
      reviewCharityApplication(
        String(applicationId),
        String(reviewerId),
        { decision: "approved" },
        { requestId: "req-review-fault" },
      ),
    /fault injection/,
  );

  assert.equal(harness.state.charity_applications[0].status, "pending");
  assert.equal(harness.state.charities.length, 0);
  assert.equal(harness.state.admin_audit_logs.length, 0);
});

test("F8 audit de integracao partilha sessao e reverte configuracao em falha", async () => {
  const actorUserId = new ObjectId();
  const harness = createTransactionalDb({
    integration_settings: [
      {
        key: "simulated_payments",
        enabled: true,
        mode: "simulation",
        publicConfig: {},
      },
    ],
    admin_audit_logs: [],
  });
  harness.control.failAuditWrites = true;
  setDbForTests(harness.db);

  await assert.rejects(
    () =>
      updateIntegrationSetting(
        String(actorUserId),
        "simulated_payments",
        {
          enabled: false,
          mode: "disabled",
          publicConfig: {},
        },
      ),
    /fault injection: audit unavailable/u,
  );

  assert.deepEqual(harness.state.integration_settings, [
    {
      key: "simulated_payments",
      enabled: true,
      mode: "simulation",
      publicConfig: {},
    },
  ]);
  assert.equal(harness.state.admin_audit_logs.length, 0);
  assert.equal(harness.control.integrationSessions.length, 1);
  assert.equal(harness.control.auditSessions.length, 1);
  assert.ok(harness.control.integrationSessions[0]);
  assert.equal(
    harness.control.integrationSessions[0],
    harness.control.auditSessions[0],
  );
});

test("F3-D approve/reject concorrentes produzem uma unica decisao coerente", async () => {
  const applicationId = new ObjectId();
  const harness = createTransactionalDb({
    charity_applications: [
      {
        _id: applicationId,
        name: "Associacao Unica",
        email: "unica@example.test",
        mission: "Apoio local com acompanhamento social regular e responsavel.",
        websiteUrl: "",
        status: "pending",
      },
    ],
    charities: [],
    admin_audit_logs: [],
  });
  setDbForTests(harness.db);

  const outcomes = await Promise.allSettled([
    reviewCharityApplication(
      String(applicationId),
      String(new ObjectId()),
      { decision: "approved" },
      { requestId: "req-approve" },
    ),
    reviewCharityApplication(
      String(applicationId),
      String(new ObjectId()),
      { decision: "rejected", reason: "Documentacao insuficiente para aprovacao." },
      { requestId: "req-reject" },
    ),
  ]);

  assert.equal(outcomes.filter((entry) => entry.status === "fulfilled").length, 1);
  assert.equal(outcomes.filter((entry) => entry.status === "rejected").length, 1);
  assert.equal(outcomes.find((entry) => entry.status === "rejected").reason.code, "APPLICATION_ALREADY_REVIEWED");
  assert.equal(harness.state.admin_audit_logs.length, 1);
  assert.deepEqual(harness.state.admin_audit_logs[0].before, {
    status: "pending",
  });
  assert.equal("email" in harness.state.admin_audit_logs[0].before, false);
  assert.equal("mission" in harness.state.admin_audit_logs[0].before, false);
  assert.equal(
    ["req-approve", "req-reject"].includes(
      harness.state.admin_audit_logs[0].requestId,
    ),
    true,
  );

  const finalStatus = harness.state.charity_applications[0].status;
  assert.equal(["approved", "rejected"].includes(finalStatus), true);
  assert.equal(
    harness.state.charities.length,
    finalStatus === "approved" ? 1 : 0,
  );
});

test("F3-D membership auditada nao transfere utilizador silenciosamente", async () => {
  const adminId = new ObjectId();
  const userId = new ObjectId();
  const firstCharityId = new ObjectId();
  const secondCharityId = new ObjectId();
  const harness = createTransactionalDb({
    users: [{ _id: userId, role: "user", accountStatus: "active" }],
    charities: [
      {
        _id: firstCharityId,
        status: "active",
        poolStatus: "eligible",
      },
      {
        _id: secondCharityId,
        status: "active",
        poolStatus: "eligible",
      },
    ],
    charity_memberships: [],
    admin_audit_logs: [],
  });
  setDbForTests(harness.db);

  await linkUserToCharity(
    String(firstCharityId),
    String(userId),
    String(adminId),
    { requestId: "req-membership" },
  );

  await assert.rejects(
    () =>
      linkUserToCharity(
        String(secondCharityId),
        String(userId),
        String(adminId),
      ),
    (error) =>
      error.statusCode === 409 && error.code === "CHARITY_MEMBERSHIP_EXISTS",
  );

  assert.equal(harness.state.charity_memberships.length, 1);
  assert.equal(
    String(harness.state.charity_memberships[0].charityId),
    String(firstCharityId),
  );
  assert.equal(harness.state.admin_audit_logs.length, 1);
  assert.equal(harness.state.admin_audit_logs[0].requestId, "req-membership");
  assert.equal(harness.state.users[0].operationalVersion, 1);
});

test("F3-D membership recusa contas bloqueadas ou eliminadas", async () => {
  const adminId = new ObjectId();
  const blockedUserId = new ObjectId();
  const deletedUserId = new ObjectId();
  const charityId = new ObjectId();
  const harness = createTransactionalDb({
    users: [
      { _id: blockedUserId, accountStatus: "blocked" },
      { _id: deletedUserId, accountStatus: "deleted" },
    ],
    charities: [
      {
        _id: charityId,
        status: "active",
        poolStatus: "eligible",
      },
    ],
    charity_memberships: [],
    admin_audit_logs: [],
  });
  setDbForTests(harness.db);

  for (const userId of [blockedUserId, deletedUserId]) {
    await assert.rejects(
      () => linkUserToCharity(
        String(charityId),
        String(userId),
        String(adminId),
      ),
      (error) =>
        error.statusCode === 404 && error.code === "USER_NOT_OPERATIONAL",
    );
  }

  assert.equal(harness.state.charity_memberships.length, 0);
  assert.equal(harness.state.admin_audit_logs.length, 0);
});

test("F3-D falha tardia reverte user update e revogacao de sessoes", async () => {
  const actorId = new ObjectId();
  const targetId = new ObjectId();
  const harness = createTransactionalDb({
    users: [
      { _id: actorId, role: "admin", accountStatus: "active" },
      {
        _id: targetId,
        name: "Pessoa",
        email: "pessoa@example.test",
        role: "user",
        accountStatus: "active",
      },
    ],
    sessions: [
      { _id: new ObjectId(), userId: actorId },
      { _id: new ObjectId(), userId: targetId },
    ],
    admin_audit_logs: [],
  });
  harness.control.failAuditWrites = true;
  setDbForTests(harness.db);

  await assert.rejects(
    () =>
      updateUserByAdmin(
        String(actorId),
        String(targetId),
        { accountStatus: "blocked" },
        { requestId: "req-user-fault" },
      ),
    /fault injection/,
  );

  assert.equal(harness.state.users[1].accountStatus, "active");
  assert.equal(harness.state.sessions.length, 2);
  assert.equal(harness.state.admin_audit_logs.length, 0);
});

test("F3-D bloqueio confirma user, sessoes e audit com requestId num commit", async () => {
  const actorId = new ObjectId();
  const targetId = new ObjectId();
  const harness = createTransactionalDb({
    users: [
      { _id: actorId, role: "admin", accountStatus: "active" },
      { _id: targetId, role: "user", accountStatus: "active" },
    ],
    sessions: [
      { _id: new ObjectId(), userId: actorId },
      { _id: new ObjectId(), userId: targetId },
    ],
    admin_audit_logs: [],
  });
  setDbForTests(harness.db);

  const user = await updateUserByAdmin(
    String(actorId),
    String(targetId),
    { accountStatus: "blocked" },
    { requestId: "req-user-block" },
  );

  assert.equal(user.accountStatus, "blocked");
  assert.deepEqual(
    harness.state.sessions.map((session) => String(session.userId)),
    [String(actorId)],
  );
  assert.equal(harness.state.admin_audit_logs.length, 1);
  assert.equal(harness.state.admin_audit_logs[0].requestId, "req-user-block");
  assert.equal(harness.state.admin_audit_logs[0].before.accountStatus, "active");
  assert.equal(harness.state.admin_audit_logs[0].after.accountStatus, "blocked");
  assert.deepEqual(
    Object.keys(harness.state.admin_audit_logs[0].before).sort(),
    ["accountStatus", "role"],
  );
  assert.equal("email" in harness.state.admin_audit_logs[0].before, false);
});

test("F3-D duas democoes concorrentes preservam pelo menos um admin ativo", async () => {
  const firstAdminId = new ObjectId();
  const secondAdminId = new ObjectId();
  const harness = createTransactionalDb({
    users: [
      { _id: firstAdminId, role: "admin", accountStatus: "active" },
      { _id: secondAdminId, role: "admin", accountStatus: "active" },
    ],
    admin_audit_logs: [],
    admin_invariants: [
      { _id: "active-admin-roster", revision: 0 },
    ],
  });
  setDbForTests(harness.db);

  const outcomes = await Promise.allSettled([
    updateUserByAdmin(
      String(firstAdminId),
      String(secondAdminId),
      { role: "user" },
      { requestId: "req-demote-second" },
    ),
    updateUserByAdmin(
      String(secondAdminId),
      String(firstAdminId),
      { role: "user" },
      { requestId: "req-demote-first" },
    ),
  ]);

  assert.equal(outcomes.filter((entry) => entry.status === "fulfilled").length, 1);
  assert.equal(outcomes.filter((entry) => entry.status === "rejected").length, 1);
  assert.equal(outcomes.find((entry) => entry.status === "rejected").reason.code, "LAST_ACTIVE_ADMIN");
  assert.equal(
    harness.state.users.filter(
      (user) => user.role === "admin" && user.accountStatus === "active",
    ).length,
    1,
  );
  assert.equal(harness.state.admin_audit_logs.length, 1);
  assert.equal(
    ["req-demote-second", "req-demote-first"].includes(
      harness.state.admin_audit_logs[0].requestId,
    ),
    true,
  );
});
