/**
 * @file Provas locais de atomicidade e concorrencia da familia na Fase 3.
 *
 * O double implementa staging/commit, rollback, uma fila equivalente ao ponto
 * de contencao da subscricao do owner e o indice parcial unico por membro. Nao
 * abre sockets, nao executa seeds e nunca consulta a base configurada.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
  acceptFamilyInvitation,
  declineFamilyInvitation,
  ensureSubscriptionIndexes,
  inviteFamilyMember,
  leaveFamily,
  removeFamilyMember,
} from "../../src/modules/subscriptions/subscriptions.service.js";

const OPEN_FAMILY_STATUSES = new Set(["pending", "active"]);

/**
 * Clona o subset BSON usado pelos cenarios sem perder Date/ObjectId.
 *
 * @param {unknown} value Valor original.
 * @returns {unknown} Copia independente.
 */
function cloneValue(value) {
  if (value instanceof ObjectId) return new ObjectId(value.toHexString());
  if (value instanceof Date) return new Date(value.getTime());
  if (Array.isArray(value)) return value.map(cloneValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]),
    );
  }
  return value;
}

/**
 * Compara ids, datas e operadores usados pelo service familiar.
 *
 * @param {unknown} actual Valor do documento.
 * @param {unknown} expected Condicao MongoDB simplificada.
 * @returns {boolean} Resultado do match.
 */
function matchesValue(actual, expected) {
  if (expected instanceof ObjectId) return String(actual) === String(expected);
  if (expected instanceof Date) return new Date(actual).getTime() === expected.getTime();

  if (expected && typeof expected === "object" && !Array.isArray(expected)) {
    if ("$in" in expected && !expected.$in.includes(actual)) return false;
    if ("$nin" in expected && expected.$nin.includes(actual)) return false;
    if ("$ne" in expected && String(actual) === String(expected.$ne)) return false;
    if ("$gt" in expected && !(actual > expected.$gt)) return false;
    return true;
  }

  return actual === expected;
}

/**
 * Aplica uma query plana aos documentos de teste.
 *
 * @param {Record<string, unknown>} row Documento.
 * @param {Record<string, unknown>} query Query.
 * @returns {boolean} Verdadeiro quando todos os campos correspondem.
 */
function matches(row, query = {}) {
  return Object.entries(query).every(([key, expected]) =>
    matchesValue(row[key], expected));
}

/**
 * Aplica os operadores de update exigidos por familia e seed interno de planos.
 *
 * @param {Record<string, unknown>} row Documento mutavel.
 * @param {Record<string, Record<string, unknown>>} update Operadores MongoDB.
 * @param {boolean} inserted Indica um upsert novo.
 * @returns {void}
 */
function applyUpdate(row, update, inserted = false) {
  Object.assign(row, cloneValue(update.$set ?? {}));
  if (inserted) Object.assign(row, cloneValue(update.$setOnInsert ?? {}));
  for (const [key, amount] of Object.entries(update.$inc ?? {})) {
    row[key] = Number(row[key] ?? 0) + Number(amount);
  }
}

/**
 * Produz um erro fiel ao indice unico MongoDB.
 *
 * @returns {Error & { code: number }} Erro E11000.
 */
function duplicateKeyError() {
  const error = new Error("duplicate key");
  error.code = 11000;
  return error;
}

/**
 * Cria uma DB transacional com rollback e observabilidade de sessoes.
 *
 * A fila representa a repeticao causada pelo write-conflict no documento da
 * subscricao. Adicionalmente, qualquer recontagem de lugares dentro da
 * transacao falha se o service ainda nao tiver escrito `familyVersion`.
 *
 * @param {Record<string, Record<string, unknown>[]>} initialState Estado inicial.
 * @returns {object} Harness isolado.
 */
function createFamilyDb(initialState) {
  let state = cloneValue(initialState);
  let transactionTail = Promise.resolve();
  let transactionCount = 0;
  const indexes = [];
  const mutationSessions = [];
  const capacityChecks = [];
  const control = { failOn: null, failRead: null };

  /**
   * Devolve uma colecao, criando-a apenas dentro do store recebido.
   *
   * @param {Record<string, Record<string, unknown>[]>} store Snapshot atual.
   * @param {string} name Nome da colecao.
   * @returns {Record<string, unknown>[]} Linhas.
   */
  function rowsFor(store, name) {
    store[name] ??= [];
    return store[name];
  }

  /**
   * Constroi o subset de collection usado pelos services.
   *
   * @param {Record<string, Record<string, unknown>[]>} store Store base/staged.
   * @param {string} name Colecao.
   * @param {object | undefined} session Sessao da transacao.
   * @param {{ lockedOwners: Set<string> } | undefined} txContext Contexto local.
   * @returns {object} Collection double.
   */
  function collection(store, name, session = undefined, txContext = undefined) {
    const rows = rowsFor(store, name);

    /**
     * Regista e valida que a mutacao recebeu a sessao da unidade atomica.
     *
     * @param {string} method Metodo MongoDB.
     * @param {object} options Opcoes do driver.
     * @returns {void}
     */
    function observeMutation(method, options = {}) {
      if (!session) return;
      mutationSessions.push({ name, method, valid: options.session === session });
      if (control.failOn?.collection === name && control.failOn?.method === method) {
        throw new Error(`fault:${name}.${method}`);
      }
    }

    return {
      async createIndex(keys, options = {}) {
        indexes.push({ collection: name, keys, options: cloneValue(options) });
      },

      async findOne(query = {}, options = {}) {
        if (control.failRead?.collection === name) {
          if (control.failRead.remaining === 0) {
            throw new Error(`fault:${name}.findOne`);
          }
          control.failRead.remaining -= 1;
        }

        let result = rows.filter((row) => matches(row, query));
        if (options.sort) {
          const entries = Object.entries(options.sort);
          result = result.toSorted((left, right) => {
            for (const [key, direction] of entries) {
              if (left[key] < right[key]) return -1 * direction;
              if (left[key] > right[key]) return 1 * direction;
            }
            return 0;
          });
        }
        return cloneValue(result[0] ?? null);
      },

      async countDocuments(query = {}) {
        if (session && name === "subscription_family_memberships" && query.ownerUserId) {
          const ownerKey = String(query.ownerUserId);
          const locked = txContext?.lockedOwners.has(ownerKey) ?? false;
          capacityChecks.push({ ownerKey, locked });
          assert.equal(locked, true, "a recontagem tem de ocorrer depois do write-lock do owner");
        }
        return rows.filter((row) => matches(row, query)).length;
      },

      find(query = {}) {
        let result = rows.filter((row) => matches(row, query));
        return {
          sort(sort = {}) {
            const entries = Object.entries(sort);
            result = result.toSorted((left, right) => {
              for (const [key, direction] of entries) {
                if (left[key] < right[key]) return -1 * direction;
                if (left[key] > right[key]) return 1 * direction;
              }
              return 0;
            });
            return this;
          },
          async toArray() {
            return cloneValue(result);
          },
        };
      },

      async insertOne(document, options = {}) {
        observeMutation("insertOne", options);
        if (
          name === "subscription_family_memberships" &&
          OPEN_FAMILY_STATUSES.has(document.status) &&
          rows.some(
            (row) =>
              String(row.memberUserId) === String(document.memberUserId) &&
              OPEN_FAMILY_STATUSES.has(row.status),
          )
        ) {
          throw duplicateKeyError();
        }
        const insertedId = document._id ?? new ObjectId();
        rows.push(cloneValue({ ...document, _id: insertedId }));
        return { insertedId };
      },

      async updateOne(filter, update, options = {}) {
        observeMutation("updateOne", options);
        let row = rows.find((candidate) => matches(candidate, filter));

        if (!row && options.upsert) {
          row = Object.fromEntries(
            Object.entries(filter).filter(
              ([, value]) =>
                !(value && typeof value === "object" && !(value instanceof ObjectId)),
            ),
          );
          applyUpdate(row, update, true);
          row._id ??= new ObjectId();
          rows.push(row);
          return { matchedCount: 0, modifiedCount: 0, upsertedId: row._id };
        }

        if (!row) return { matchedCount: 0, modifiedCount: 0 };

        applyUpdate(row, update, false);
        if (name === "subscriptions" && update.$inc?.familyVersion) {
          txContext?.lockedOwners.add(String(row.userId));
        }
        return { matchedCount: 1, modifiedCount: 1 };
      },
    };
  }

  const db = {
    collection(name) {
      return collection(state, name);
    },

    async runInTransaction(work) {
      const previous = transactionTail;
      let release;
      transactionTail = new Promise((resolve) => {
        release = resolve;
      });
      await previous;

      transactionCount += 1;
      const staged = cloneValue(state);
      const session = { id: `family-tx-${transactionCount}` };
      const txContext = { lockedOwners: new Set() };
      const txDb = {
        collection(name) {
          return collection(staged, name, session, txContext);
        },
      };

      try {
        const result = await work({ db: txDb, session });
        state = staged;
        return result;
      } finally {
        release();
      }
    },

    rows(name) {
      return state[name] ?? [];
    },

    get indexes() {
      return indexes;
    },

    get mutationSessions() {
      return mutationSessions;
    },

    get capacityChecks() {
      return capacityChecks;
    },

    get transactionCount() {
      return transactionCount;
    },

    control,
  };

  return db;
}

/**
 * Plano familiar reduzido para os cenarios de capacidade.
 *
 * @returns {Record<string, unknown>} Plano ativo.
 */
function familyPlan() {
  return {
    _id: new ObjectId(),
    code: "faithflix-family-monthly",
    name: "FaithFlix Família Mensal",
    interval: "monthly",
    priceCents: 1299,
    currency: "EUR",
    solidaritySharePercent: 20,
    tier: "family",
    maxQuality: "2160p",
    familySharing: true,
    maxFamilyMembers: 5,
    active: true,
  };
}

/**
 * Cria o estado minimo partilhado pelos testes familiares.
 *
 * @param {{ ownerId?: ObjectId, users?: object[], memberships?: object[] }} [options] Variantes do cenario.
 * @returns {{ ownerId: ObjectId, subscriptionId: ObjectId, state: Record<string, object[]> }} Fixture.
 */
function familyFixture(options = {}) {
  const ownerId = options.ownerId ?? new ObjectId();
  const subscriptionId = new ObjectId();
  return {
    ownerId,
    subscriptionId,
    state: {
      users: [
        { _id: ownerId, name: "Owner", email: "owner@example.test", role: "user" },
        ...(options.users ?? []),
      ],
      subscriptions: [{
        _id: subscriptionId,
        userId: ownerId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
      }],
      subscription_plans: [familyPlan()],
      subscription_family_memberships: options.memberships ?? [],
      notification_preferences: [],
      user_consents: [],
      notifications: [],
    },
  };
}

afterEach(() => {
  setDbForTests(null);
});

test("F3 familia mantem indice parcial unico para pending/active", async () => {
  const fixture = familyFixture();
  const db = createFamilyDb(fixture.state);
  setDbForTests(db);

  await ensureSubscriptionIndexes();

  const uniqueMembership = db.indexes.find(
    (entry) =>
      entry.collection === "subscription_family_memberships" &&
      entry.keys.memberUserId === 1 &&
      entry.options.unique === true,
  );
  assert.deepEqual(
    uniqueMembership.options.partialFilterExpression,
    { status: { $in: ["pending", "active"] } },
  );
});

test("F3 familia serializa convites concorrentes e nunca excede cinco lugares incluindo owner", async () => {
  const ownerId = new ObjectId();
  const targetA = new ObjectId();
  const targetB = new ObjectId();
  const existingMembers = [new ObjectId(), new ObjectId(), new ObjectId()];
  const fixture = familyFixture({
    ownerId,
    users: [
      { _id: targetA, name: "Alvo A", email: "a@example.test" },
      { _id: targetB, name: "Alvo B", email: "b@example.test" },
      ...existingMembers.map((id, index) => ({
        _id: id,
        name: `Existente ${index}`,
        email: `existente-${index}@example.test`,
      })),
    ],
    memberships: existingMembers.map((memberUserId, index) => ({
      _id: new ObjectId(),
      ownerUserId: ownerId,
      memberUserId,
      status: index === 0 ? "pending" : "active",
      createdAt: new Date(`2026-01-0${index + 1}T00:00:00.000Z`),
    })),
  });

  for (const row of fixture.state.subscription_family_memberships) {
    row.ownerUserId = fixture.ownerId;
    row.subscriptionId = fixture.subscriptionId;
  }
  const db = createFamilyDb(fixture.state);
  setDbForTests(db);

  const results = await Promise.allSettled([
    inviteFamilyMember(String(fixture.ownerId), { email: "a@example.test" }),
    inviteFamilyMember(String(fixture.ownerId), { email: "b@example.test" }),
  ]);

  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const [rejected] = results.filter((result) => result.status === "rejected");
  assert.equal(rejected.reason.statusCode, 409);
  assert.match(rejected.reason.message, /Limite de utilizadores/);

  const openRows = db.rows("subscription_family_memberships")
    .filter((row) => OPEN_FAMILY_STATUSES.has(row.status));
  assert.equal(1 + openRows.length, 5);
  assert.equal(db.rows("notifications").length, 1);
  assert.equal(db.rows("subscriptions")[0].familyVersion, 1);
  assert.equal(db.rows("billing_customer_locks").length, 2);
  assert.ok(db.capacityChecks.length >= 2);
  assert.ok(db.capacityChecks.every((check) => check.locked));
  assert.ok(db.mutationSessions.every((entry) => entry.valid));
});

test("F3 familia nao cria membership duplicada em convites concorrentes de owners diferentes", async () => {
  const firstOwnerId = new ObjectId();
  const secondOwnerId = new ObjectId();
  const targetId = new ObjectId();
  const plan = familyPlan();
  const db = createFamilyDb({
    users: [
      { _id: firstOwnerId, name: "Owner A", email: "owner-a@example.test" },
      { _id: secondOwnerId, name: "Owner B", email: "owner-b@example.test" },
      { _id: targetId, name: "Alvo", email: "alvo@example.test" },
    ],
    subscriptions: [firstOwnerId, secondOwnerId].map((userId) => ({
      _id: new ObjectId(),
      userId,
      status: "active",
      planCode: plan.code,
      currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
    })),
    subscription_plans: [plan],
    subscription_family_memberships: [],
    notification_preferences: [],
    user_consents: [],
    notifications: [],
  });
  setDbForTests(db);

  const results = await Promise.allSettled([
    inviteFamilyMember(String(firstOwnerId), { email: "alvo@example.test" }),
    inviteFamilyMember(String(secondOwnerId), { email: "alvo@example.test" }),
  ]);

  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const [rejected] = results.filter((result) => result.status === "rejected");
  assert.equal(rejected.reason.statusCode, 409);
  assert.match(rejected.reason.message, /partilha familiar ativa ou pendente/);
  assert.equal(db.rows("subscription_family_memberships").length, 1);
  assert.equal(String(db.rows("subscription_family_memberships")[0].memberUserId), String(targetId));
  assert.equal(db.rows("notifications").length, 1);
  assert.equal(db.rows("billing_customer_locks").length, 2);
});

test("F3 familia aceita convite no ultimo lugar sem o contar duas vezes", async () => {
  const invitedId = new ObjectId();
  const otherMembers = [new ObjectId(), new ObjectId(), new ObjectId()];
  const invitationId = new ObjectId();
  const fixture = familyFixture({
    users: [
      { _id: invitedId, name: "Convidado", email: "convidado@example.test" },
      ...otherMembers.map((id, index) => ({
        _id: id,
        name: `Membro ${index}`,
        email: `membro-${index}@example.test`,
      })),
    ],
    memberships: [
      {
        _id: invitationId,
        ownerUserId: null,
        memberUserId: invitedId,
        status: "pending",
        invitedEmail: "convidado@example.test",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      ...otherMembers.map((memberUserId, index) => ({
        _id: new ObjectId(),
        ownerUserId: null,
        memberUserId,
        status: "active",
        createdAt: new Date(`2026-01-0${index + 2}T00:00:00.000Z`),
      })),
    ],
  });
  fixture.state.subscription_family_memberships.forEach((row) => {
    row.ownerUserId = fixture.ownerId;
    row.subscriptionId = fixture.subscriptionId;
  });
  const db = createFamilyDb(fixture.state);
  setDbForTests(db);

  await acceptFamilyInvitation(String(invitedId), String(invitationId));

  const invitation = db.rows("subscription_family_memberships")
    .find((row) => String(row._id) === String(invitationId));
  assert.equal(invitation.status, "active");
  assert.equal(1 + db.rows("subscription_family_memberships").length, 5);
  assert.equal(db.rows("subscriptions")[0].familyVersion, 1);
  assert.equal(db.rows("billing_customer_locks").length, 2);
  assert.equal(db.rows("notifications")[0].type, "family_invitation_accepted");
  assert.ok(db.capacityChecks.every((check) => check.locked));
});

test("F3 familia reverte convite e aceitacao quando a notificacao falha", async () => {
  const targetId = new ObjectId();
  const fixture = familyFixture({
    users: [{ _id: targetId, name: "Alvo", email: "alvo@example.test" }],
  });
  const db = createFamilyDb(fixture.state);
  db.control.failOn = { collection: "notifications", method: "insertOne" };
  setDbForTests(db);

  await assert.rejects(
    () => inviteFamilyMember(String(fixture.ownerId), { email: "alvo@example.test" }),
    /fault:notifications.insertOne/,
  );
  assert.equal(db.rows("subscription_family_memberships").length, 0);
  assert.equal(db.rows("subscriptions")[0].familyVersion, undefined);

  const invitationId = new ObjectId();
  db.rows("subscription_family_memberships").push({
    _id: invitationId,
    ownerUserId: fixture.ownerId,
    memberUserId: targetId,
    subscriptionId: fixture.subscriptionId,
    invitedEmail: "alvo@example.test",
    status: "pending",
    createdAt: new Date(),
  });

  await assert.rejects(
    () => acceptFamilyInvitation(String(targetId), String(invitationId)),
    /fault:notifications.insertOne/,
  );
  assert.equal(db.rows("subscription_family_memberships")[0].status, "pending");
  assert.equal(db.rows("subscriptions")[0].familyVersion, undefined);
});

test("F8 overview familiar falhado antes do commit reverte o comando", async () => {
  const targetId = new ObjectId();
  const fixture = familyFixture({
    users: [{ _id: targetId, name: "Alvo", email: "alvo@example.test" }],
  });
  const db = createFamilyDb(fixture.state);
  // A primeira leitura encontra o alvo; a seguinte ocorre ao construir o
  // overview autoritativo e tem de continuar dentro da mesma transação.
  db.control.failRead = { collection: "users", remaining: 1 };
  setDbForTests(db);

  await assert.rejects(
    () => inviteFamilyMember(String(fixture.ownerId), { email: "alvo@example.test" }),
    /fault:users\.findOne/u,
  );

  assert.equal(db.rows("subscription_family_memberships").length, 0);
  assert.equal(db.rows("notifications").length, 0);
  assert.equal(db.rows("subscriptions")[0].familyVersion, undefined);
});

test("F3 familia torna decline/remove/leave atomicos e propaga a sessao", async () => {
  const declinedId = new ObjectId();
  const removedId = new ObjectId();
  const leftId = new ObjectId();
  const declinedInvitationId = new ObjectId();
  const fixture = familyFixture({
    users: [
      { _id: declinedId, name: "Recusa", email: "recusa@example.test" },
      { _id: removedId, name: "Removido", email: "removido@example.test" },
      { _id: leftId, name: "Saida", email: "saida@example.test" },
    ],
    memberships: [
      {
        _id: declinedInvitationId,
        ownerUserId: null,
        memberUserId: declinedId,
        status: "pending",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      {
        _id: new ObjectId(),
        ownerUserId: null,
        memberUserId: removedId,
        status: "active",
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      },
      {
        _id: new ObjectId(),
        ownerUserId: null,
        memberUserId: leftId,
        status: "active",
        createdAt: new Date("2026-01-03T00:00:00.000Z"),
      },
    ],
  });
  fixture.state.subscription_family_memberships.forEach((row) => {
    row.ownerUserId = fixture.ownerId;
    row.subscriptionId = fixture.subscriptionId;
  });
  const db = createFamilyDb(fixture.state);
  setDbForTests(db);

  await declineFamilyInvitation(String(declinedId), String(declinedInvitationId));
  await leaveFamily(String(leftId));

  db.control.failOn = { collection: "notifications", method: "insertOne" };
  await assert.rejects(
    () => removeFamilyMember(String(fixture.ownerId), String(removedId)),
    /fault:notifications.insertOne/,
  );

  const rows = db.rows("subscription_family_memberships");
  assert.equal(rows.find((row) => String(row.memberUserId) === String(declinedId)).status, "declined");
  assert.equal(rows.find((row) => String(row.memberUserId) === String(leftId)).status, "left");
  assert.equal(rows.find((row) => String(row.memberUserId) === String(removedId)).status, "active");
  assert.equal(db.transactionCount, 3);
  assert.ok(db.mutationSessions.length >= 3);
  assert.ok(db.mutationSessions.every((entry) => entry.valid));
});
