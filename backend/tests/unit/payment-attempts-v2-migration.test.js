/**
 * @file Testes in-memory da migração histórica de `payment_attempts` v2.
 *
 * Nenhum teste importa o CLI, a configuração MongoDB ou abre ligações.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertExplicitPaymentMigrationTarget,
  buildPaymentAttemptV2MigrationPatch,
  migratePaymentAttemptsToV2,
  parsePaymentMigrationArguments,
} from "../../src/modules/payments/payment-attempts-v2-migration.js";

/**
 * Clona os valores usados pelo double, preservando datas.
 *
 * @param {unknown} value Valor original.
 * @returns {unknown} Clone independente.
 */
function clone(value) {
  if (value instanceof Date) return new Date(value);
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, clone(entry)]),
    );
  }
  return value;
}

/**
 * Aplica o subset de filtros usado pela migração.
 *
 * @param {object} row Documento.
 * @param {object} query Filtro MongoDB.
 * @returns {boolean} Correspondência.
 */
function matches(row, query) {
  return Object.entries(query).every(([key, expected]) => {
    const actual = row[key];
    if (expected && typeof expected === "object" && "$ne" in expected) {
      return actual !== expected.$ne;
    }
    return String(actual) === String(expected);
  });
}

/**
 * Cria DB mínima com cursor assíncrono e observabilidade de writes/acessos.
 *
 * @param {Record<string, object[]>} initialState Estado inicial.
 * @returns {object} DB e métricas.
 */
function createMigrationDb(initialState) {
  const state = clone(initialState);
  const accessedCollections = [];
  let updateCount = 0;

  const db = {
    collection(name) {
      accessedCollections.push(name);
      state[name] ??= [];
      const rows = state[name];

      return {
        find(query) {
          let result = rows.filter((row) => matches(row, query));
          return {
            sort() {
              result = [...result].sort((left, right) =>
                String(left._id).localeCompare(String(right._id)));
              return this;
            },
            async *[Symbol.asyncIterator]() {
              for (const row of result) yield clone(row);
            },
          };
        },

        async findOne(query) {
          return clone(rows.find((row) => matches(row, query)) ?? null);
        },

        async updateOne(filter, update) {
          const row = rows.find((candidate) => matches(candidate, filter));
          if (!row) return { matchedCount: 0, modifiedCount: 0 };
          Object.assign(row, clone(update.$set ?? {}));
          updateCount += 1;
          return { matchedCount: 1, modifiedCount: 1 };
        },
      };
    },

    state,

    get updateCount() {
      return updateCount;
    },

    get accessedCollections() {
      return accessedCollections;
    },
  };

  return db;
}

test("F3-B2 CLI fica em dry-run por defeito e rejeita modos ambíguos", () => {
  assert.deepEqual(parsePaymentMigrationArguments([]), {
    apply: false,
    help: false,
  });
  assert.deepEqual(parsePaymentMigrationArguments(["--dry-run"]), {
    apply: false,
    help: false,
  });
  assert.deepEqual(parsePaymentMigrationArguments(["--apply"]), {
    apply: true,
    help: false,
  });
  assert.throws(
    () => parsePaymentMigrationArguments(["--apply", "--dry-run"]),
    (error) => error.code === "MIGRATION_MODE_CONFLICT",
  );
  assert.throws(
    () => parsePaymentMigrationArguments(["--force"]),
    (error) => error.code === "MIGRATION_ARGUMENT_INVALID",
  );
});

test("F3-B2 exige DB nomeada explicitamente e recusa bases internas", () => {
  assert.equal(
    assertExplicitPaymentMigrationTarget("faithflix", "faithflix"),
    "faithflix",
  );
  assert.throws(
    () => assertExplicitPaymentMigrationTarget(undefined, "faithflix"),
    (error) => error.code === "MIGRATION_DATABASE_NOT_EXPLICIT",
  );
  assert.throws(
    () => assertExplicitPaymentMigrationTarget("admin", "admin"),
    (error) => error.code === "MIGRATION_DATABASE_PROTECTED",
  );
});

test("F3-B2 dry-run calcula estimativas mas executa zero writes", async () => {
  const createdAt = new Date("2025-01-15T12:00:00.000Z");
  const legacy = {
    _id: "legacy-1",
    userId: "user-1",
    planCode: "faithflix-monthly",
    provider: "faithflix-simulated",
    status: "approved",
    createdAt,
  };
  const db = createMigrationDb({
    payment_attempts: [legacy],
    subscription_plans: [{
      code: "faithflix-monthly",
      priceCents: 799,
      currency: "EUR",
      solidaritySharePercent: 20,
      interval: "monthly",
    }],
  });

  const summary = await migratePaymentAttemptsToV2({
    db,
    now: new Date("2026-07-10T00:00:00.000Z"),
  });

  assert.deepEqual(summary, {
    mode: "dry-run",
    scanned: 1,
    wouldUpdate: 1,
    updated: 0,
    skippedDueToRace: 0,
    estimated: 1,
    withoutPlan: 0,
  });
  assert.equal(db.updateCount, 0);
  assert.deepEqual(db.state.payment_attempts[0], legacy);

  const patch = buildPaymentAttemptV2MigrationPatch(
    legacy,
    db.state.subscription_plans[0],
    new Date("2026-07-10T00:00:00.000Z"),
  );
  assert.equal(patch.schemaVersion, 2);
  assert.equal(patch.accountingEstimate, true);
  assert.equal(patch.amountCents, 799);
  assert.deepEqual(
    patch.accountingEstimateFields.sort(),
    ["amountCents", "approvedAt", "currency", "interval", "solidaritySharePercent"],
  );
  assert.ok(patch.accountingUnknownFields.includes("cycle"));
});

test("F3-B2 --apply falha antes de consultar a DB sem opt-in explícito", async () => {
  let accessed = false;
  const db = {
    collection() {
      accessed = true;
      throw new Error("DB não devia ser consultada");
    },
  };

  await assert.rejects(
    () => migratePaymentAttemptsToV2({ db, apply: true, environment: {} }),
    (error) => error.code === "MIGRATION_APPLY_NOT_ALLOWED",
  );
  assert.equal(accessed, false);
});

test("F3-B2 apply é idempotente e preserva documentos v2 e distribuições", async () => {
  const fixedNow = new Date("2026-07-10T08:30:00.000Z");
  const existingV2 = {
    _id: "v2-1",
    schemaVersion: 2,
    status: "approved",
    amountCents: 1299,
    currency: "EUR",
    solidaritySharePercent: 20,
    approvedAt: new Date("2026-06-01T00:00:00.000Z"),
    accountingEstimate: false,
  };
  const distribution = {
    _id: "distribution-1",
    month: "2026-06",
    totalPoolCents: 260,
    financialSnapshot: { accountingEstimate: false },
  };
  const db = createMigrationDb({
    payment_attempts: [
      {
        _id: "legacy-1",
        userId: "user-1",
        planCode: "faithflix-monthly",
        provider: "faithflix-simulated",
        status: "approved",
        createdAt: new Date("2025-01-15T12:00:00.000Z"),
      },
      existingV2,
    ],
    subscription_plans: [{
      code: "faithflix-monthly",
      priceCents: 799,
      currency: "EUR",
      solidaritySharePercent: 20,
      interval: "monthly",
    }],
    pool_distributions: [distribution],
  });
  const originalV2 = clone(existingV2);
  const originalDistribution = clone(distribution);

  const first = await migratePaymentAttemptsToV2({
    db,
    apply: true,
    environment: { ALLOW_DATA_MIGRATION: "true" },
    now: fixedNow,
  });
  const second = await migratePaymentAttemptsToV2({
    db,
    apply: true,
    environment: { ALLOW_DATA_MIGRATION: "true" },
    now: fixedNow,
  });

  assert.equal(first.updated, 1);
  assert.equal(first.estimated, 1);
  assert.deepEqual(second, {
    mode: "apply",
    scanned: 0,
    wouldUpdate: 0,
    updated: 0,
    skippedDueToRace: 0,
    estimated: 0,
    withoutPlan: 0,
  });
  assert.equal(db.updateCount, 1);
  assert.equal(db.state.payment_attempts[0].schemaVersion, 2);
  assert.equal(db.state.payment_attempts[0].accountingEstimate, true);
  assert.equal(db.state.payment_attempts[0].migration.name, "payment_attempts_v2");
  assert.deepEqual(db.state.payment_attempts[1], originalV2);
  assert.deepEqual(db.state.pool_distributions[0], originalDistribution);
  assert.equal(db.accessedCollections.includes("pool_distributions"), false);
});

test("F3-B2 sem plano mantém valores desconhecidos a null e sempre marcados", () => {
  const patch = buildPaymentAttemptV2MigrationPatch(
    { _id: "legacy-sem-plano", status: "failed" },
    null,
    new Date("2026-07-10T00:00:00.000Z"),
  );

  assert.equal(patch.accountingEstimate, true);
  assert.equal(patch.amountCents, null);
  assert.equal(patch.currency, null);
  assert.equal(patch.solidaritySharePercent, null);
  assert.equal(patch.interval, null);
  assert.equal(patch.approvedAt, null);
  assert.ok(patch.accountingUnknownFields.includes("amountCents"));
  assert.equal(patch.accountingEstimateSource, "legacy_document_only");
});
