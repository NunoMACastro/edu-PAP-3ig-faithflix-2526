/**
 * @file Testes transacionais dos jobs de renovação/expiração.
 *
 * A DB in-memory suporta rollback por fault injection e nunca abre MongoDB,
 * rede, timers de worker, seeds ou migrações.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { postMonthlyDistribution } from "../../src/modules/charities/pool-distribution.controller.js";
import {
  previewMonthlyDistribution,
  runMonthlyDistribution,
} from "../../src/modules/charities/pool-distribution.service.js";
import {
  discoverPendingPoolMonths,
  previousUtcMonth,
  processSubscriptionCycle,
  runDueSubscriptionJobs,
  runMonthlyPoolJob,
  runPendingMonthlyPoolJobs,
  subscriptionCycleJobKey,
} from "../../src/modules/jobs/billing-jobs.service.js";
import { decideSimulatedRenewal } from "../../src/modules/jobs/renewal-adapter.js";
import { renewActiveSubscription } from "../../src/modules/subscriptions/subscriptions.service.js";

/**
 * Clona documentos sem perder `Date` ou `ObjectId`.
 *
 * @param {unknown} value Valor original.
 * @returns {unknown} Cópia independente.
 */
function clone(value) {
  if (value instanceof Date) return new Date(value);
  if (value instanceof ObjectId) return new ObjectId(value.toHexString());
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, clone(nested)]),
    );
  }
  return value;
}

/**
 * Compara valores MongoDB usados pelo serviço.
 *
 * @param {unknown} actual Valor do documento.
 * @param {unknown} expected Valor/filtro.
 * @returns {boolean} Resultado.
 */
function matchesValue(actual, expected) {
  if (expected instanceof ObjectId) return String(actual) === String(expected);
  if (expected instanceof Date) {
    return actual instanceof Date && actual.getTime() === expected.getTime();
  }
  if (expected && typeof expected === "object") {
    if ("$in" in expected) {
      return expected.$in.some((candidate) => matchesValue(actual, candidate));
    }
    if ("$exists" in expected) {
      return (actual !== undefined) === expected.$exists;
    }
    if ("$gte" in expected && actual < expected.$gte) return false;
    if ("$gt" in expected && actual <= expected.$gt) return false;
    if ("$lt" in expected && actual >= expected.$lt) return false;
    if ("$lte" in expected && actual > expected.$lte) return false;
    if ("$ne" in expected && matchesValue(actual, expected.$ne)) return false;
    return true;
  }
  return actual === expected;
}

/**
 * Aplica um filtro simples a um documento.
 *
 * @param {Record<string, unknown>} row Documento.
 * @param {Record<string, unknown>} filter Filtro.
 * @returns {boolean} Correspondência.
 */
function matches(row, filter = {}) {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === "$or") {
      return expected.some((branch) => matches(row, branch));
    }
    return matchesValue(row[key], expected);
  });
}

/**
 * Aplica a subset dos operadores de update usada pelos jobs.
 *
 * @param {Record<string, unknown>} row Documento mutável.
 * @param {Record<string, unknown>} update Operadores.
 * @returns {void}
 */
function applyUpdate(row, update, inserted = false) {
  Object.assign(row, clone(update.$set ?? {}));
  if (inserted) Object.assign(row, clone(update.$setOnInsert ?? {}));
  for (const [key, amount] of Object.entries(update.$inc ?? {})) {
    row[key] = Number(row[key] ?? 0) + Number(amount);
  }
  for (const key of Object.keys(update.$unset ?? {})) delete row[key];
}

/**
 * Compara documentos pelos campos de um sort MongoDB simples.
 *
 * @param {Record<string, 1|-1>} sort Ordenação.
 * @returns {(left: object, right: object) => number} Comparador.
 */
function compareBySort(sort = {}) {
  return (left, right) => {
    for (const [key, direction] of Object.entries(sort)) {
      if (left[key] < right[key]) return -1 * direction;
      if (left[key] > right[key]) return 1 * direction;
    }
    return 0;
  };
}

/**
 * DB transacional mínima com rollback real das tabelas em memória.
 */
class BillingJobsDb {
  /**
   * @param {Record<string, Record<string, unknown>[]>} initial Dados iniciais.
   */
  constructor(initial = {}) {
    this.tables = new Map(
      Object.entries(initial).map(([name, rows]) => [name, clone(rows)]),
    );
    this.failNotificationInsert = false;
    this.failAuditInsert = false;
    this.poolDistributionSessions = [];
    this.auditSessions = [];
  }

  /**
   * @param {string} name Coleção.
   * @returns {Record<string, unknown>[]} Linhas.
   */
  rows(name) {
    if (!this.tables.has(name)) this.tables.set(name, []);
    return this.tables.get(name);
  }

  /**
   * @param {(context: {db: BillingJobsDb, session: object}) => Promise<unknown>} work Trabalho.
   * @returns {Promise<unknown>} Resultado ou rollback.
   */
  async runInTransaction(work) {
    const snapshot = new Map(
      [...this.tables.entries()].map(([name, rows]) => [name, clone(rows)]),
    );
    try {
      return await work({ db: this, session: { inTransaction: true } });
    } catch (error) {
      this.tables = snapshot;
      throw error;
    }
  }

  /**
   * @param {string} name Coleção.
   * @returns {Record<string, Function>} API mínima.
   */
  collection(name) {
    return {
      find: (filter = {}) => {
        let result = this.rows(name).filter((candidate) =>
          matches(candidate, filter),
        );
        return {
          sort(sort = {}) {
            result = [...result].sort(compareBySort(sort));
            return this;
          },
          limit(limit) {
            result = result.slice(0, limit);
            return this;
          },
          async toArray() {
            return clone(result);
          },
        };
      },
      findOne: async (filter = {}) => {
        const row = this.rows(name).find((candidate) => matches(candidate, filter));
        return row ? clone(row) : null;
      },
      insertOne: async (document, options = {}) => {
        if (name === "notifications" && this.failNotificationInsert) {
          throw new Error("notification fault");
        }
        if (name === "pool_distributions") {
          this.poolDistributionSessions.push(options.session);
        }
        if (name === "admin_audit_logs") {
          this.auditSessions.push(options.session);
          if (this.failAuditInsert) {
            throw new Error("audit fault");
          }
        }
        const insertedId = document._id ?? new ObjectId();
        this.rows(name).push(clone({ ...document, _id: insertedId }));
        return { insertedId };
      },
      updateOne: async (filter, update, options = {}) => {
        let row = this.rows(name).find((candidate) => matches(candidate, filter));
        if (!row && options.upsert) {
          row = Object.fromEntries(
            Object.entries(filter).filter(
              ([key, value]) =>
                !key.startsWith("$") &&
                !(value && typeof value === "object"),
            ),
          );
          if (filter.key) row.key = filter.key;
          applyUpdate(row, update, true);
          this.rows(name).push(row);
          return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1 };
        }
        if (!row) return { matchedCount: 0, modifiedCount: 0 };
        applyUpdate(row, update, false);
        return { matchedCount: 1, modifiedCount: 1 };
      },
      updateMany: async (filter, update) => {
        const rows = this.rows(name).filter((candidate) => matches(candidate, filter));
        rows.forEach((row) => applyUpdate(row, update));
        return { matchedCount: rows.length, modifiedCount: rows.length };
      },
      findOneAndUpdate: async (filter, update) => {
        const row = this.rows(name).find((candidate) =>
          matches(candidate, filter),
        );
        if (!row) return null;
        applyUpdate(row, update, false);
        return clone(row);
      },
    };
  }
}

/**
 * Cria plano mensal v2 válido.
 *
 * @param {Record<string, unknown>} overrides Substituições.
 * @returns {Record<string, unknown>} Plano.
 */
function plan(overrides = {}) {
  return {
    _id: new ObjectId(),
    code: "faithflix-family-monthly",
    interval: "monthly",
    priceCents: 1299,
    currency: "EUR",
    solidaritySharePercent: 20,
    tier: "family",
    maxQuality: "2160p",
    familySharing: true,
    maxFamilyMembers: 5,
    active: true,
    ...overrides,
  };
}

/**
 * Cria subscrição vencida previsível.
 *
 * @param {Record<string, unknown>} overrides Substituições.
 * @returns {Record<string, unknown>} Subscrição.
 */
function subscription(overrides = {}) {
  return {
    _id: new ObjectId(),
    userId: new ObjectId(),
    planCode: "faithflix-family-monthly",
    status: "active",
    currentPeriodStart: new Date("2023-12-31T12:00:00.000Z"),
    currentPeriodEnd: new Date("2024-01-31T12:00:00.000Z"),
    cancelAtPeriodEnd: false,
    ...overrides,
  };
}

afterEach(() => setDbForTests(null));

test("adapter e chaves são determinísticos e fechados", () => {
  const row = subscription();
  assert.equal(decideSimulatedRenewal({ subscription: row, plan: plan() }).status, "approved");
  assert.equal(
    subscriptionCycleJobKey(row),
    `subscription-cycle:${row._id}:${row.currentPeriodEnd.getTime()}`,
  );
  assert.equal(previousUtcMonth(new Date("2026-01-15T00:00:00.000Z")), "2025-12");
  assert.throws(
    () => decideSimulatedRenewal({ subscription: { simulatedRenewalOutcome: "random" }, plan: {} }),
    (error) => error.code === "RENEWAL_SIMULATION_INVALID",
  );
});

test("ciclo futuro não pode ser renovado antecipadamente", async () => {
  const row = subscription({
    currentPeriodEnd: new Date("2026-08-01T00:00:00.000Z"),
  });
  const result = await processSubscriptionCycle(row._id, row.currentPeriodEnd, {
    referenceDate: new Date("2026-07-09T00:00:00.000Z"),
  });
  assert.equal(result.outcome, "not_due");
});

test("helper de compatibilidade também recusa renovação antecipada", async () => {
  const row = subscription({
    currentPeriodEnd: new Date(Date.now() + 24 * 60 * 60_000),
  });
  const db = new BillingJobsDb({ subscriptions: [row] });
  setDbForTests(db);

  await assert.rejects(
    () => renewActiveSubscription(String(row.userId)),
    (error) => error.code === "SUBSCRIPTION_NOT_DUE",
  );
  assert.equal(db.rows("payment_attempts").length, 0);
});

test("renovação aprovada grava ledger v2 e avança um único ciclo", async () => {
  const row = subscription();
  const db = new BillingJobsDb({
    subscriptions: [row],
    subscription_plans: [plan()],
  });
  setDbForTests(db);

  const result = await processSubscriptionCycle(row._id, row.currentPeriodEnd, {
    referenceDate: new Date("2024-02-01T00:00:00.000Z"),
  });
  const replay = await processSubscriptionCycle(row._id, row.currentPeriodEnd, {
    referenceDate: new Date("2024-02-01T00:01:00.000Z"),
  });
  const secondCycle = await processSubscriptionCycle(
    row._id,
    result.nextPeriodEnd,
    { referenceDate: new Date("2024-03-01T00:00:00.000Z") },
  );

  assert.equal(result.outcome, "renewed");
  assert.equal(result.nextPeriodEnd.toISOString(), "2024-02-29T12:00:00.000Z");
  assert.equal(secondCycle.nextPeriodEnd.toISOString(), "2024-03-31T12:00:00.000Z");
  assert.equal(replay.outcome, "already_processed");
  assert.equal(db.rows("payment_attempts").length, 2);
  assert.equal(db.rows("payment_attempts")[0].schemaVersion, 2);
  assert.equal(db.rows("payment_attempts")[0].status, "approved");
  assert.equal(db.rows("payment_attempts")[0].accountingEstimate, false);
  assert.equal(db.rows("subscriptions")[0].currentPeriodEnd.toISOString(), "2024-03-31T12:00:00.000Z");
  assert.equal(db.rows("notifications").length, 2);
});

test("pausa do simulador mantém subscrição vencida ativa sem tentativa recusada", async () => {
  const row = subscription();
  const db = new BillingJobsDb({
    subscriptions: [row],
    subscription_plans: [plan()],
    integration_settings: [{
      key: "simulated_payments",
      enabled: false,
      mode: "simulation",
      publicConfig: {},
    }],
  });
  setDbForTests(db);

  await assert.rejects(
    () => processSubscriptionCycle(row._id, row.currentPeriodEnd, {
      referenceDate: new Date("2024-02-01T00:00:00.000Z"),
    }),
    (error) => error.statusCode === 503 && error.code === "INTEGRATION_DISABLED",
  );
  assert.equal(db.rows("subscriptions")[0].status, "active");
  assert.equal(
    db.rows("subscriptions")[0].currentPeriodEnd.toISOString(),
    "2024-01-31T12:00:00.000Z",
  );
  assert.equal(db.rows("payment_attempts").length, 0);
  assert.equal(db.rows("notifications").length, 0);
});

test("F8 renovação recusa plano financeiro sem entitlements completos", async () => {
  const row = subscription();
  const malformedPlan = plan();
  delete malformedPlan.maxFamilyMembers;
  const db = new BillingJobsDb({
    subscriptions: [row],
    subscription_plans: [malformedPlan],
  });
  setDbForTests(db);

  await assert.rejects(
    () =>
      processSubscriptionCycle(row._id, row.currentPeriodEnd, {
        referenceDate: new Date("2024-02-01T00:00:00.000Z"),
      }),
    (error) => error.code === "RENEWAL_PLAN_INVALID",
  );
  assert.equal(db.rows("subscriptions")[0].status, "active");
  assert.equal(db.rows("payment_attempts").length, 0);
});

test("renovação recusada suspende acesso e lugares na mesma transação", async () => {
  const row = subscription({ simulatedRenewalOutcome: "failed" });
  const db = new BillingJobsDb({
    subscriptions: [row],
    subscription_plans: [plan()],
    subscription_family_memberships: [
      {
        _id: new ObjectId(),
        ownerUserId: row.userId,
        memberUserId: new ObjectId(),
        status: "active",
      },
    ],
  });
  setDbForTests(db);

  const result = await processSubscriptionCycle(row._id, row.currentPeriodEnd, {
    referenceDate: new Date("2024-02-01T00:00:00.000Z"),
  });

  assert.equal(result.outcome, "renewal_failed");
  assert.equal(db.rows("subscriptions")[0].status, "past_due");
  assert.equal(db.rows("payment_attempts")[0].status, "failed");
  assert.equal(db.rows("payment_attempts")[0].approvedAt, null);
  assert.equal(db.rows("subscription_family_memberships")[0].status, "removed");
  assert.equal(db.rows("notifications")[0].type, "payment_failed");
});

test("trial vencido expira sem criar receita", async () => {
  const row = subscription({
    planCode: "trial",
    status: "trialing",
    currentPeriodEnd: new Date("2026-07-01T00:00:00.000Z"),
  });
  const db = new BillingJobsDb({
    subscriptions: [row],
    trials: [
      {
        _id: new ObjectId(),
        userId: row.userId,
        status: "active",
        endsAt: row.currentPeriodEnd,
      },
    ],
  });
  setDbForTests(db);

  const result = await processSubscriptionCycle(row._id, row.currentPeriodEnd, {
    referenceDate: new Date("2026-07-09T00:00:00.000Z"),
  });

  assert.equal(result.outcome, "trial_expired");
  assert.equal(db.rows("subscriptions")[0].status, "expired");
  assert.equal(db.rows("trials")[0].status, "expired");
  assert.equal(db.rows("payment_attempts").length, 0);
});

test("falha tardia de notificação reverte ledger, subscrição e lugares", async () => {
  const row = subscription({ simulatedRenewalOutcome: "failed" });
  const membership = {
    _id: new ObjectId(),
    ownerUserId: row.userId,
    memberUserId: new ObjectId(),
    status: "active",
  };
  const db = new BillingJobsDb({
    subscriptions: [row],
    subscription_plans: [plan()],
    subscription_family_memberships: [membership],
  });
  db.failNotificationInsert = true;
  setDbForTests(db);

  await assert.rejects(
    () => processSubscriptionCycle(row._id, row.currentPeriodEnd, {
      referenceDate: new Date("2024-02-01T00:00:00.000Z"),
    }),
    /notification fault/,
  );

  assert.equal(db.rows("subscriptions")[0].status, "active");
  assert.equal(db.rows("subscription_family_memberships")[0].status, "active");
  assert.equal(db.rows("payment_attempts").length, 0);
  assert.equal(db.rows("notifications").length, 0);
});

test("dois workers não duplicam o mesmo ciclo de subscrição", async () => {
  const row = subscription();
  const db = new BillingJobsDb({
    subscriptions: [row],
    subscription_plans: [plan()],
  });
  setDbForTests(db);
  const referenceDate = new Date("2024-02-01T00:00:00.000Z");

  const [first, second] = await Promise.all([
    runDueSubscriptionJobs({ ownerId: "worker-a", referenceDate }),
    runDueSubscriptionJobs({ ownerId: "worker-b", referenceDate }),
  ]);

  assert.equal(first.claimed + second.claimed, 1);
  assert.equal(first.completed + second.completed, 1);
  assert.equal(db.rows("payment_attempts").length, 1);
  assert.equal(db.rows("scheduled_jobs").length, 1);
  assert.equal(db.rows("scheduled_jobs")[0].status, "completed");
});

test("jobs em retry não bloqueiam subscrições vencidas posteriores", async () => {
  const poisonA = subscription({
    currentPeriodEnd: new Date("2024-01-01T00:00:00.000Z"),
  });
  const poisonB = subscription({
    currentPeriodEnd: new Date("2024-01-02T00:00:00.000Z"),
  });
  const healthy = subscription({
    currentPeriodEnd: new Date("2024-01-03T00:00:00.000Z"),
  });
  const retryAt = new Date("2024-02-02T00:00:00.000Z");
  const db = new BillingJobsDb({
    subscriptions: [poisonA, poisonB, healthy],
    subscription_plans: [plan()],
    scheduled_jobs: [poisonA, poisonB].map((row) => ({
      key: subscriptionCycleJobKey(row),
      type: "subscription_cycle",
      status: "failed",
      nextRunAt: retryAt,
      attempts: 1,
    })),
  });
  setDbForTests(db);

  const result = await runDueSubscriptionJobs({
    ownerId: "worker-healthy",
    referenceDate: new Date("2024-02-01T00:00:00.000Z"),
    limit: 1,
    scanLimit: 3,
  });

  assert.equal(result.discovered, 3);
  assert.equal(result.claimed, 1);
  assert.equal(result.completed, 1);
  assert.equal(db.rows("payment_attempts").length, 1);
  assert.equal(
    String(db.rows("payment_attempts")[0].userId),
    String(healthy.userId),
  );
});

test("fecho manual audita na mesma sessão, reverte em falha e não duplica no replay", async () => {
  const adminId = new ObjectId();
  const db = new BillingJobsDb({
    payment_attempts: [
      {
        _id: new ObjectId(),
        schemaVersion: 2,
        status: "approved",
        amountCents: 1000,
        currency: "EUR",
        solidaritySharePercent: 20,
        approvedAt: new Date("2026-06-15T00:00:00.000Z"),
        accountingEstimate: false,
      },
    ],
    charities: [
      {
        _id: new ObjectId(),
        name: "Associação Auditada",
        status: "active",
        poolStatus: "eligible",
        approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ],
    pool_distributions: [],
    admin_audit_logs: [],
  });
  setDbForTests(db);
  const input = {
    referenceDate: new Date("2026-07-09T00:00:00.000Z"),
    trigger: "admin",
    requestId: "req-pool-manual",
  };

  db.failAuditInsert = true;
  await assert.rejects(
    () => runMonthlyDistribution("2026-06", String(adminId), input),
    /audit fault/u,
  );
  assert.equal(db.rows("pool_distributions").length, 0);
  assert.equal(db.rows("admin_audit_logs").length, 0);
  assert.ok(db.poolDistributionSessions[0]);
  assert.equal(db.poolDistributionSessions[0], db.auditSessions[0]);

  db.failAuditInsert = false;
  db.poolDistributionSessions = [];
  db.auditSessions = [];
  const created = await runMonthlyDistribution(
    "2026-06",
    String(adminId),
    input,
  );
  const replay = await runMonthlyDistribution(
    "2026-06",
    String(adminId),
    input,
  );

  assert.equal(created.distribution.totalPoolCents, 200);
  assert.equal(replay.distribution.replayed, true);
  assert.equal(db.rows("pool_distributions").length, 1);
  assert.equal(db.rows("admin_audit_logs").length, 1);
  assert.equal(db.poolDistributionSessions[0], db.auditSessions[0]);
  assert.deepEqual(db.rows("admin_audit_logs")[0].after, {
    month: "2026-06",
    status: "completed",
    totalPoolCents: 200,
    paymentCount: 1,
    eligibleCharityCount: 1,
  });
  assert.equal(
    db.rows("admin_audit_logs")[0].action,
    "charity.pool_distribution.created",
  );
  assert.equal(
    db.rows("admin_audit_logs")[0].requestId,
    "req-pool-manual",
  );
  assert.equal("paymentSnapshots" in db.rows("admin_audit_logs")[0].after, false);
});

test("fecho manual recusa ator inválido antes de qualquer escrita", async () => {
  const db = new BillingJobsDb();
  setDbForTests(db);

  await assert.rejects(
    () =>
      runMonthlyDistribution("2026-06", "ator-invalido", {
        referenceDate: new Date("2026-07-09T00:00:00.000Z"),
        trigger: "admin",
      }),
    (error) => error.code === "POOL_ADMIN_ACTOR_INVALID",
  );
  assert.equal(db.rows("pool_distributions").length, 0);
  assert.equal(db.rows("admin_audit_logs").length, 0);
});

test("controller do fecho manual propaga req.id para o audit", async () => {
  const adminId = new ObjectId();
  const db = new BillingJobsDb({
    payment_attempts: [
      {
        _id: new ObjectId(),
        schemaVersion: 2,
        status: "approved",
        amountCents: 500,
        currency: "EUR",
        solidaritySharePercent: 20,
        approvedAt: new Date("2020-01-15T00:00:00.000Z"),
        accountingEstimate: false,
      },
    ],
    charities: [
      {
        _id: new ObjectId(),
        name: "Associação HTTP",
        status: "active",
        poolStatus: "eligible",
        approvedAt: new Date("2019-01-01T00:00:00.000Z"),
      },
    ],
    pool_distributions: [],
    admin_audit_logs: [],
  });
  setDbForTests(db);
  const { preview } = await previewMonthlyDistribution("2020-01");
  const response = {};
  const res = {
    status(statusCode) {
      response.statusCode = statusCode;
      return this;
    },
    json(body) {
      response.body = body;
      return this;
    },
  };

  await postMonthlyDistribution(
    {
      id: "req-pool-controller",
      body: { month: "2020-01", previewToken: preview.previewToken },
      user: { id: String(adminId), role: "admin" },
    },
    res,
  );

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.distribution.totalPoolCents, 100);
  assert.equal(db.rows("admin_audit_logs").length, 1);
  assert.equal(
    db.rows("admin_audit_logs")[0].requestId,
    "req-pool-controller",
  );
});

test("preview não escreve e token stale recusa o commit antes do audit", async () => {
  const adminId = new ObjectId();
  const db = new BillingJobsDb({
    payment_attempts: [{
      _id: new ObjectId(),
      schemaVersion: 2,
      status: "approved",
      amountCents: 500,
      currency: "EUR",
      solidaritySharePercent: 20,
      approvedAt: new Date("2020-01-15T00:00:00.000Z"),
      accountingEstimate: false,
    }],
    charities: [{
      _id: new ObjectId(),
      name: "Associação Preview",
      status: "active",
      poolStatus: "eligible",
      approvedAt: new Date("2019-01-01T00:00:00.000Z"),
    }],
    pool_distributions: [],
    admin_audit_logs: [],
  });
  setDbForTests(db);

  const { preview } = await previewMonthlyDistribution("2020-01", {
    referenceDate: new Date("2026-07-12T00:00:00.000Z"),
  });
  assert.equal(preview.totalPoolCents, 100);
  assert.match(preview.previewToken, /^[a-f0-9]{64}$/u);
  assert.equal(db.rows("pool_distributions").length, 0);
  assert.equal(db.rows("admin_audit_logs").length, 0);

  db.rows("payment_attempts")[0].amountCents = 600;
  await assert.rejects(
    () => runMonthlyDistribution(String("2020-01"), String(adminId), {
      referenceDate: new Date("2026-07-12T00:00:00.000Z"),
      trigger: "admin",
      expectedPreviewToken: preview.previewToken,
    }),
    (error) => error.code === "POOL_PREVIEW_STALE" && error.statusCode === 409,
  );
  assert.equal(db.rows("pool_distributions").length, 0);
  assert.equal(db.rows("admin_audit_logs").length, 0);
});

test("job mensal fecha apenas o mês anterior e não duplica a distribuição", async () => {
  const charityId = new ObjectId();
  const db = new BillingJobsDb({
    payment_attempts: [
      {
        _id: new ObjectId(),
        schemaVersion: 2,
        status: "approved",
        amountCents: 1000,
        currency: "EUR",
        solidaritySharePercent: 20,
        approvedAt: new Date("2026-06-15T00:00:00.000Z"),
        accountingEstimate: false,
      },
    ],
    charities: [
      {
        _id: charityId,
        name: "Associação Local",
        status: "active",
        poolStatus: "eligible",
        approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ],
  });
  setDbForTests(db);
  const referenceDate = new Date("2026-07-09T00:00:00.000Z");

  const first = await runMonthlyPoolJob({
    ownerId: "worker-a",
    referenceDate,
  });
  const second = await runMonthlyPoolJob({
    ownerId: "worker-b",
    referenceDate,
  });

  assert.deepEqual(
    { month: first.month, claimed: first.claimed, completed: first.completed },
    { month: "2026-06", claimed: true, completed: true },
  );
  assert.equal(second.claimed, false);
  assert.equal(db.rows("pool_distributions").length, 1);
  assert.equal(db.rows("pool_distributions")[0].totalPoolCents, 200);
  assert.equal(db.rows("pool_distributions")[0].createdBy, null);
  assert.equal(db.rows("pool_distributions")[0].trigger, "worker");
  assert.equal(db.rows("admin_audit_logs").length, 0);
  assert.equal(db.rows("scheduled_jobs")[0].key, "pool:2026-06");
  assert.equal(db.rows("scheduled_jobs")[0].status, "completed");
});

test("worker recupera todos os meses fechados depois de downtime prolongado", async () => {
  const db = new BillingJobsDb({
    payment_attempts: [
      {
        _id: new ObjectId(),
        schemaVersion: 2,
        status: "approved",
        amountCents: 1000,
        currency: "EUR",
        solidaritySharePercent: 20,
        approvedAt: new Date("2026-05-15T00:00:00.000Z"),
        accountingEstimate: false,
      },
    ],
    charities: [
      {
        _id: new ObjectId(),
        name: "Associação Local",
        status: "active",
        poolStatus: "eligible",
        approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ],
  });
  setDbForTests(db);
  const input = {
    ownerId: "worker-catchup",
    referenceDate: new Date("2026-07-09T00:00:00.000Z"),
  };

  const first = await runPendingMonthlyPoolJobs(input);
  const replay = await runPendingMonthlyPoolJobs(input);

  assert.deepEqual(first.months, ["2026-05", "2026-06"]);
  assert.equal(first.completed, 2);
  assert.deepEqual(replay.months, []);
  assert.equal(db.rows("pool_distributions").length, 2);
  assert.deepEqual(
    db.rows("pool_distributions").map((row) => row.totalPoolCents),
    [200, 0],
  );
});

test("catch-up atravessa lotes históricos já fechados sem bloquear", async () => {
  const closedMonths = Array.from({ length: 120 }, (_, index) => {
    const date = new Date(Date.UTC(2010, index, 1));
    return {
      month: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      status: "completed",
      items: [],
    };
  });
  const db = new BillingJobsDb({
    payment_attempts: [
      {
        _id: new ObjectId(),
        schemaVersion: 2,
        status: "approved",
        approvedAt: new Date("2010-01-15T00:00:00.000Z"),
        accountingEstimate: false,
      },
    ],
    pool_distributions: closedMonths,
  });

  const pending = await discoverPendingPoolMonths({
    db,
    referenceDate: new Date("2020-03-01T00:00:00.000Z"),
  });

  assert.deepEqual(pending, ["2020-01", "2020-02"]);
});
