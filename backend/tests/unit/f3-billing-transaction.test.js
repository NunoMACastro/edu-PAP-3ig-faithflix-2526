/**
 * @file Provas unitárias da Fase 3 para billing transacional e idempotente.
 *
 * Usa um double com staging/commit para demonstrar rollback sem abrir MongoDB,
 * executar seeds ou depender de uma base configurada.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
  postSimulatedCheckout,
  postTrial,
} from "../../src/modules/payments/payments.controller.js";
import {
  createSimulatedCheckout,
  ensurePaymentIndexes,
  startTrial,
} from "../../src/modules/payments/payments.service.js";

/**
 * Clona valores BSON mínimos preservando identidade por valor.
 *
 * @param {unknown} value Valor a clonar.
 * @returns {unknown} Clone independente.
 */
function cloneValue(value) {
  if (value instanceof ObjectId) return new ObjectId(value.toHexString());
  if (value instanceof Date) return new Date(value.getTime());
  if (Array.isArray(value)) return value.map(cloneValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]),
    );
  }
  return value;
}

/**
 * Obtém um valor aninhado de um documento.
 *
 * @param {object} row Documento.
 * @param {string} path Caminho separado por pontos.
 * @returns {unknown} Valor encontrado.
 */
function valueAt(row, path) {
  return path.split(".").reduce((current, key) => current?.[key], row);
}

/**
 * Compara um valor com o subset de operadores usado pelo billing.
 *
 * @param {unknown} actual Valor persistido.
 * @param {unknown} expected Condição da query.
 * @returns {boolean} Resultado.
 */
function matchesValue(actual, expected) {
  if (expected instanceof ObjectId) return String(actual) === String(expected);
  if (expected instanceof Date) return new Date(actual).getTime() === expected.getTime();

  if (expected && typeof expected === "object" && !Array.isArray(expected)) {
    if ("$ne" in expected && String(actual) === String(expected.$ne)) return false;
    if ("$gt" in expected && !(actual > expected.$gt)) return false;
    if ("$in" in expected && !expected.$in.includes(actual)) return false;
    if ("$nin" in expected && expected.$nin.includes(actual)) return false;
    return true;
  }

  return actual === expected;
}

/**
 * Aplica uma query MongoDB simples.
 *
 * @param {object} row Documento.
 * @param {object} query Query.
 * @returns {boolean} Verdadeiro quando corresponde.
 */
function matches(row, query = {}) {
  return Object.entries(query).every(([path, expected]) =>
    matchesValue(valueAt(row, path), expected));
}

/**
 * Aplica operadores de update necessários aos services testados.
 *
 * @param {object} row Documento mutável.
 * @param {object} update Update MongoDB.
 * @param {boolean} inserted Indica criação por upsert.
 * @returns {void}
 */
function applyUpdate(row, update, inserted) {
  Object.assign(row, cloneValue(update.$set ?? {}));
  if (inserted) Object.assign(row, cloneValue(update.$setOnInsert ?? {}));
  for (const [key, amount] of Object.entries(update.$inc ?? {})) {
    row[key] = Number(row[key] ?? 0) + Number(amount);
  }
  for (const key of Object.keys(update.$unset ?? {})) delete row[key];
}

/**
 * Cria uma DB transacional em memória com fault injection e captura de sessão.
 *
 * @param {Record<string, object[]>} initialState Coleções iniciais.
 * @param {{ collection: string, method: string } | null} failOn Falha injetada.
 * @returns {object} Double de DB e observabilidade.
 */
function createTransactionalDb(initialState, failOn = null) {
  let state = cloneValue(initialState);
  const mutationSessions = [];
  const indexes = [];
  let transactionCount = 0;

  function collection(store, name, session) {
    store[name] ??= [];
    const rows = store[name];

    function maybeFail(method) {
      if (session && failOn?.collection === name && failOn?.method === method) {
        throw new Error(`fault:${name}.${method}`);
      }
    }

    function recordMutation(options) {
      if (session) mutationSessions.push(options?.session);
    }

    return {
      async createIndex(keys, options = {}) {
        indexes.push({ collection: name, keys, options });
      },

      async findOne(query = {}) {
        return cloneValue(rows.find((row) => matches(row, query)) ?? null);
      },

      async insertOne(document, options = {}) {
        maybeFail("insertOne");
        recordMutation(options);
        const insertedId = document._id ?? new ObjectId();
        rows.push(cloneValue({ ...document, _id: insertedId }));
        return { insertedId };
      },

      async updateOne(filter, update, options = {}) {
        maybeFail("updateOne");
        recordMutation(options);
        const row = rows.find((candidate) => matches(candidate, filter));

        if (row) {
          applyUpdate(row, update, false);
          return { matchedCount: 1, modifiedCount: 1 };
        }

        if (!options.upsert) return { matchedCount: 0, modifiedCount: 0 };

        const base = Object.fromEntries(
          Object.entries(filter).filter(([, value]) =>
            !(value && typeof value === "object" && !(value instanceof ObjectId))),
        );
        const inserted = { _id: new ObjectId(), ...cloneValue(base) };
        applyUpdate(inserted, update, true);
        rows.push(inserted);
        return { matchedCount: 0, modifiedCount: 0, upsertedId: inserted._id };
      },

      async updateMany(filter, update, options = {}) {
        maybeFail("updateMany");
        recordMutation(options);
        const matched = rows.filter((row) => matches(row, filter));
        matched.forEach((row) => applyUpdate(row, update, false));
        return { matchedCount: matched.length, modifiedCount: matched.length };
      },
    };
  }

  const db = {
    collection(name) {
      return collection(state, name, undefined);
    },

    async runInTransaction(work) {
      transactionCount += 1;
      const staged = cloneValue(state);
      const session = { id: `billing-tx-${transactionCount}` };
      const txDb = {
        collection(name) {
          return collection(staged, name, session);
        },
      };

      const result = await work({ db: txDb, session });
      state = staged;
      return result;
    },

    rows(name) {
      return state[name] ?? [];
    },

    get mutationSessions() {
      return mutationSessions;
    },

    get indexes() {
      return indexes;
    },

    get transactionCount() {
      return transactionCount;
    },
  };

  return db;
}

/**
 * Plano financeiro v2 usado nos testes.
 *
 * @returns {object} Documento de plano ativo.
 */
function monthlyPlan() {
  return {
    _id: new ObjectId(),
    code: "faithflix-monthly",
    name: "FaithFlix Pro Mensal",
    interval: "monthly",
    priceCents: 799,
    currency: "EUR",
    solidaritySharePercent: 20,
    tier: "pro",
    maxQuality: "1080p",
    familySharing: false,
    maxFamilyMembers: 1,
    active: true,
  };
}

/**
 * Estado mínimo para checkout/trial e notificações transacionais.
 *
 * @param {string[]} [userIds=[]] Utilizadores existentes.
 * @returns {Record<string, object[]>} Coleções iniciais.
 */
function billingState(userIds = []) {
  return {
    users: userIds.map((userId) => ({
      _id: new ObjectId(userId),
      accountStatus: "active",
    })),
    subscription_plans: [monthlyPlan()],
    subscriptions: [],
    payment_attempts: [],
    trials: [],
    subscription_family_memberships: [],
    notification_preferences: [],
    user_consents: [],
    notifications: [],
    admin_audit_logs: [],
    billing_customer_locks: [],
  };
}

afterEach(() => {
  setDbForTests(null);
});

test("F3 billing exige Idempotency-Key antes de consultar persistência", async () => {
  const userId = String(new ObjectId());
  const checkoutBody = {
    planCode: "faithflix-monthly",
    paymentMethod: "card_test",
    simulateOutcome: "approved",
  };

  await assert.rejects(
    () => createSimulatedCheckout(userId, checkoutBody),
    (error) => error.statusCode === 400 && error.code === "IDEMPOTENCY_KEY_REQUIRED",
  );
  await assert.rejects(
    () => startTrial(userId),
    (error) => error.statusCode === 400 && error.code === "IDEMPOTENCY_KEY_REQUIRED",
  );
  await assert.rejects(
    () => createSimulatedCheckout(
      userId,
      checkoutBody,
      `renewal:${new ObjectId()}:123`,
    ),
    (error) => error.code === "IDEMPOTENCY_KEY_RESERVED",
  );
  await assert.rejects(
    () => postSimulatedCheckout(
      { user: { id: userId }, body: checkoutBody, get: () => undefined },
      {},
    ),
    (error) => error.code === "IDEMPOTENCY_KEY_REQUIRED",
  );
  await assert.rejects(
    () => postTrial(
      { user: { id: userId }, get: () => undefined },
      { status: () => ({ json: () => undefined }) },
    ),
    (error) => error.code === "IDEMPOTENCY_KEY_REQUIRED",
  );
});

test("F3 billing cria índices idempotentes parciais sem tocar em históricos", async () => {
  const db = createTransactionalDb({ payment_attempts: [], trials: [] });
  setDbForTests(db);

  await ensurePaymentIndexes();

  const paymentIndex = db.indexes.find(
    (entry) => entry.options.name === "payment_attempt_idempotency_unique",
  );
  const trialIndex = db.indexes.find(
    (entry) => entry.options.name === "trial_idempotency_unique",
  );
  const poolMonthIndex = db.indexes.find(
    (entry) => entry.options.name === "payment_attempts_pool_month_v2",
  );
  assert.equal(paymentIndex.options.unique, true);
  assert.deepEqual(paymentIndex.options.partialFilterExpression, {
    idempotencyKey: { $type: "string" },
  });
  assert.equal(trialIndex.options.unique, true);
  assert.deepEqual(poolMonthIndex.keys, {
    schemaVersion: 1,
    status: 1,
    accountingEstimate: 1,
    approvedAt: 1,
    _id: 1,
  });
  assert.deepEqual(poolMonthIndex.options.partialFilterExpression, {
    schemaVersion: 2,
    status: "approved",
    accountingEstimate: false,
  });
  assert.equal(db.transactionCount, 0);
});

test("F3 billing recusa checkout e trial para contas indisponíveis", async () => {
  for (const accountStatus of [
    "blocked",
    "deleted",
    "inactive",
    "unexpected_state",
  ]) {
    const userId = String(new ObjectId());
    const state = billingState([userId]);
    state.users[0].accountStatus = accountStatus;
    const db = createTransactionalDb(state);
    setDbForTests(db);

    await assert.rejects(
      () => createSimulatedCheckout(
        userId,
        {
          planCode: "faithflix-monthly",
          paymentMethod: "card_test",
          simulateOutcome: "approved",
        },
        `checkout-${accountStatus}-0001`,
      ),
      (error) => error.code === "ACCOUNT_NOT_AVAILABLE",
    );
    await assert.rejects(
      () => startTrial(userId, `trial-${accountStatus}-0001`),
      (error) => error.code === "ACCOUNT_NOT_AVAILABLE",
    );
    assert.equal(db.rows("payment_attempts").length, 0);
    assert.equal(db.rows("trials").length, 0);
    assert.equal(db.rows("subscriptions").length, 0);
  }
});

test("pagamentos simulados desativados bloqueiam operações novas sem criar ledgers", async () => {
  const userId = String(new ObjectId());
  const state = billingState([userId]);
  state.integration_settings = [
    {
      key: "simulated_payments",
      enabled: false,
      mode: "simulation",
      publicConfig: {},
    },
  ];
  const db = createTransactionalDb(state);
  setDbForTests(db);

  await assert.rejects(
    () => createSimulatedCheckout(
      userId,
      {
        planCode: "faithflix-monthly",
        paymentMethod: "card_test",
        simulateOutcome: "approved",
      },
      "checkout-disabled-0001",
    ),
    (error) => error.statusCode === 503 && error.code === "INTEGRATION_DISABLED",
  );
  await assert.rejects(
    () => startTrial(userId, "trial-disabled-0001"),
    (error) => error.statusCode === 503 && error.code === "INTEGRATION_DISABLED",
  );

  assert.equal(db.rows("payment_attempts").length, 0);
  assert.equal(db.rows("trials").length, 0);
  assert.equal(db.rows("billing_customer_locks").length, 0);
});

test("pausa dos pagamentos preserva replays concluídos de checkout e trial", async () => {
  const checkoutUserId = String(new ObjectId());
  const checkoutState = billingState([checkoutUserId]);
  checkoutState.integration_settings = [{
    key: "simulated_payments",
    enabled: true,
    mode: "simulation",
    publicConfig: {},
  }];
  const checkoutDb = createTransactionalDb(checkoutState);
  setDbForTests(checkoutDb);
  const checkoutInput = {
    planCode: "faithflix-monthly",
    paymentMethod: "card_test",
    simulateOutcome: "approved",
  };
  const checkout = await createSimulatedCheckout(
    checkoutUserId,
    checkoutInput,
    "checkout-replay-paused-0001",
  );
  checkoutDb.rows("integration_settings")[0].enabled = false;
  assert.deepEqual(
    await createSimulatedCheckout(
      checkoutUserId,
      checkoutInput,
      "checkout-replay-paused-0001",
    ),
    checkout,
  );

  const trialUserId = String(new ObjectId());
  const trialState = billingState([trialUserId]);
  trialState.integration_settings = [{
    key: "simulated_payments",
    enabled: true,
    mode: "simulation",
    publicConfig: {},
  }];
  const trialDb = createTransactionalDb(trialState);
  setDbForTests(trialDb);
  const trial = await startTrial(trialUserId, "trial-replay-paused-0001");
  trialDb.rows("integration_settings")[0].enabled = false;
  assert.deepEqual(
    await startTrial(trialUserId, "trial-replay-paused-0001"),
    trial,
  );

  assert.equal(checkoutDb.rows("payment_attempts").length, 1);
  assert.equal(trialDb.rows("trials").length, 1);
});

test("F3 checkout persiste schema financeiro v2 e faz replay sem efeitos duplicados", async () => {
  const userId = String(new ObjectId());
  const db = createTransactionalDb(billingState([userId]));
  const payload = {
    planCode: "faithflix-monthly",
    paymentMethod: "card_test",
    simulateOutcome: "approved",
  };
  setDbForTests(db);

  const first = await createSimulatedCheckout(userId, payload, "checkout-order-0001");
  const repeated = await createSimulatedCheckout(userId, payload, "checkout-order-0001");

  assert.deepEqual(repeated, first);
  assert.equal(db.rows("payment_attempts").length, 1);
  assert.equal(db.rows("subscriptions").length, 1);
  assert.equal(db.rows("notifications").length, 1);
  assert.equal(db.rows("admin_audit_logs").length, 1);
  assert.equal(db.rows("billing_customer_locks").length, 1);

  const [attempt] = db.rows("payment_attempts");
  assert.equal(attempt.schemaVersion, 2);
  assert.equal(attempt.accountingEstimate, false);
  assert.equal(attempt.amountCents, 799);
  assert.equal(attempt.currency, "EUR");
  assert.equal(attempt.solidaritySharePercent, 20);
  assert.equal(attempt.interval, "monthly");
  assert.equal(attempt.idempotencyKey, "checkout-order-0001");
  assert.match(attempt.requestHash, /^[a-f0-9]{64}$/);
  assert.ok(attempt.approvedAt instanceof Date);
  assert.ok(attempt.cycle.startsAt instanceof Date);
  assert.ok(attempt.cycle.endsAt instanceof Date);
  assert.equal(String(attempt.userId), userId);
  assert.equal(
    db.rows("admin_audit_logs")[0].action,
    "payment.simulated_checkout",
  );
  assert.ok(db.mutationSessions.length >= 5);
  assert.ok(db.mutationSessions.every((session) => session?.id?.startsWith("billing-tx-")));

  await assert.rejects(
    () => createSimulatedCheckout(
      userId,
      payload,
      "checkout-order-0002",
    ),
    (error) =>
      error.statusCode === 409 &&
      error.code === "SUBSCRIPTION_ALREADY_ACTIVE",
  );
  assert.equal(db.rows("payment_attempts").length, 1);

  await assert.rejects(
    () => createSimulatedCheckout(
      userId,
      { ...payload, simulateOutcome: "failed" },
      "checkout-order-0001",
    ),
    (error) => error.statusCode === 409 && error.code === "IDEMPOTENCY_KEY_REUSED",
  );
  assert.equal(db.rows("payment_attempts").length, 1);
});

test("F3 checkout reverte tentativa e subscrição quando uma notificação falha", async () => {
  const userId = String(new ObjectId());
  const db = createTransactionalDb(
    billingState([userId]),
    { collection: "notifications", method: "insertOne" },
  );
  setDbForTests(db);

  await assert.rejects(
    () => createSimulatedCheckout(
      userId,
      {
        planCode: "faithflix-monthly",
        paymentMethod: "card_test",
        simulateOutcome: "approved",
      },
      "checkout-fault-0001",
    ),
    /fault:notifications\.insertOne/,
  );

  assert.equal(db.rows("payment_attempts").length, 0);
  assert.equal(db.rows("subscriptions").length, 0);
  assert.equal(db.rows("notifications").length, 0);
  assert.equal(db.rows("admin_audit_logs").length, 0);
});

test("F3 controller propaga req.id para correlação do audit", async () => {
  const userId = String(new ObjectId());
  const db = createTransactionalDb(billingState([userId]));
  setDbForTests(db);
  let statusCode;
  const response = {
    status(value) {
      statusCode = value;
      return this;
    },
    json() {},
  };

  await postSimulatedCheckout(
    {
      id: "request-billing-controller",
      user: { id: userId },
      body: {
        planCode: "faithflix-monthly",
        paymentMethod: "card_test",
        simulateOutcome: "approved",
      },
      get: () => "checkout-controller-0001",
    },
    response,
  );

  assert.equal(statusCode, 201);
  assert.equal(
    db.rows("admin_audit_logs")[0].requestId,
    "request-billing-controller",
  );
});

test("F3 checkout reverte tudo quando o audit final falha", async () => {
  const userId = String(new ObjectId());
  const db = createTransactionalDb(
    billingState([userId]),
    { collection: "admin_audit_logs", method: "insertOne" },
  );
  setDbForTests(db);

  await assert.rejects(
    () => createSimulatedCheckout(
      userId,
      {
        planCode: "faithflix-monthly",
        paymentMethod: "card_test",
        simulateOutcome: "approved",
      },
      "checkout-audit-fault-0001",
      { requestId: "request-checkout-audit" },
    ),
    /fault:admin_audit_logs\.insertOne/,
  );

  assert.equal(db.rows("payment_attempts").length, 0);
  assert.equal(db.rows("subscriptions").length, 0);
  assert.equal(db.rows("notifications").length, 0);
  assert.equal(db.rows("admin_audit_logs").length, 0);
});

test("F3 trial é atómico, replayable e não aceita uma segunda chave", async () => {
  const userId = String(new ObjectId());
  const db = createTransactionalDb(billingState([userId]));
  setDbForTests(db);

  const first = await startTrial(userId, "trial-request-0001");
  const repeated = await startTrial(userId, "trial-request-0001");

  assert.deepEqual(repeated, first);
  assert.equal(db.rows("trials").length, 1);
  assert.equal(db.rows("subscriptions").length, 1);
  assert.equal(db.rows("notifications").length, 1);
  assert.equal(db.rows("admin_audit_logs").length, 1);
  assert.equal(db.rows("users")[0].billingVersion, 1);
  assert.equal(db.rows("billing_customer_locks")[0].revision, 1);
  assert.match(db.rows("trials")[0].requestHash, /^[a-f0-9]{64}$/);
  assert.equal(db.rows("admin_audit_logs")[0].action, "payment.trial_started");

  await assert.rejects(
    () => startTrial(userId, "trial-request-0002"),
    (error) => error.statusCode === 409 && error.code === "TRIAL_ALREADY_USED",
  );
});

test("F3 trial reverte trial e subscrição quando uma notificação falha", async () => {
  const userId = String(new ObjectId());
  const db = createTransactionalDb(
    billingState([userId]),
    { collection: "notifications", method: "insertOne" },
  );
  setDbForTests(db);

  await assert.rejects(
    () => startTrial(userId, "trial-fault-0001"),
    /fault:notifications\.insertOne/,
  );

  assert.equal(db.rows("trials").length, 0);
  assert.equal(db.rows("subscriptions").length, 0);
  assert.equal(db.rows("notifications").length, 0);
  assert.equal(db.rows("admin_audit_logs").length, 0);
});
