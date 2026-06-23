/**
 * @file Testes unitários das regras críticas da MF4.
 *
 * Exercitam validadores, acesso premium, distribuição mensal e exportação CSV
 * sem depender de MongoDB real.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
  addBillingCycle,
  assertSubscriptionStatus,
  isBlockingStatus,
} from "../../src/modules/subscriptions/subscriptions.validation.js";
import { hasActiveSubscriptionAccess } from "../../src/modules/subscriptions/subscriptions.service.js";
import { assertCheckoutPayload } from "../../src/modules/payments/payments.validation.js";
import { assertPreferencePayload } from "../../src/modules/notifications/notifications.validation.js";
import { assertCharityApplicationPayload } from "../../src/modules/charities/charity-applications.validation.js";
import { assertReviewPayload } from "../../src/modules/charities/charity-review.validation.js";
import { assertDistributionMonth } from "../../src/modules/charities/pool-distribution.validation.js";
import { runMonthlyDistribution } from "../../src/modules/charities/pool-distribution.service.js";
import { historyToCsv } from "../../src/modules/charities/charity-reports.service.js";

/**
 * Lê valores aninhados através de caminhos no formato `campo.subcampo`.
 *
 * @param {object} row Documento em memória.
 * @param {string} path Caminho a consultar.
 * @returns {unknown} Valor encontrado.
 */
function valueForPath(row, path) {
  return path.split(".").reduce((current, key) => current?.[key], row);
}

/**
 * Compara identificadores MongoDB sem depender da mesma instância de `ObjectId`.
 *
 * @param {unknown} left Valor esquerdo.
 * @param {unknown} right Valor direito.
 * @returns {boolean} Resultado da comparação.
 */
function sameId(left, right) {
  return String(left) === String(right);
}

/**
 * Valida se um valor cumpre uma condição de query simplificada.
 *
 * @param {unknown} actual Valor do documento.
 * @param {unknown} expected Condição esperada.
 * @returns {boolean} `true` quando a condição é satisfeita.
 */
function matchesValue(actual, expected) {
  if (expected instanceof ObjectId) {
    return sameId(actual, expected);
  }

  if (expected && typeof expected === "object" && !Array.isArray(expected)) {
    if ("$gt" in expected) {
      return actual > expected.$gt;
    }
  }

  return actual === expected;
}

/**
 * Aplica uma query MongoDB mínima aos documentos usados nos testes.
 *
 * @param {object} row Documento em memória.
 * @param {Record<string, unknown>} query Query simplificada.
 * @returns {boolean} `true` quando o documento deve entrar no resultado.
 */
function matches(row, query = {}) {
  return Object.entries(query).every(([key, expected]) => {
    const actual = valueForPath(row, key);

    if (Array.isArray(actual)) {
      return actual.some((entry) => matchesValue(entry, expected));
    }

    return matchesValue(actual, expected);
  });
}

/**
 * Cria comparador equivalente ao `sort` usado pelos serviços da MF4.
 *
 * @param {Record<string, 1 | -1>} sort Ordenação MongoDB simplificada.
 * @returns {(left: object, right: object) => number} Comparador para arrays.
 */
function compareBySort(sort) {
  const entries = Object.entries(sort ?? {});

  return (left, right) => {
    for (const [key, direction] of entries) {
      const leftValue = valueForPath(left, key);
      const rightValue = valueForPath(right, key);

      if (leftValue < rightValue) return -1 * direction;
      if (leftValue > rightValue) return 1 * direction;
    }

    return 0;
  };
}

/**
 * Cria uma coleção MongoDB em memória com os métodos usados nestes testes.
 *
 * @param {object[]} rows Documentos iniciais.
 * @returns {object} Coleção compatível com os serviços testados.
 */
function collection(rows) {
  return {
    /**
     * Documenta `findOne`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} query Valor recebido por `findOne`.
     * @param {unknown} options Valor recebido por `findOne`.
     * @returns {Promise<unknown>} Resultado devolvido por `findOne`.
     */
    async findOne(query = {}, options = {}) {
      let result = rows.filter((row) => matches(row, query));

      if (options.sort) {
        result = result.toSorted(compareBySort(options.sort));
      }

      return result[0] ?? null;
    },

    /**
     * Documenta `find`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} query Valor recebido por `find`.
     * @returns {unknown} Resultado devolvido por `find`.
     */
    find(query = {}) {
      let result = rows.filter((row) => matches(row, query));

      return {
        /**
         * Documenta `sort`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} sort Valor recebido por `sort`.
         * @returns {unknown} Resultado devolvido por `sort`.
         */
        sort(sort) {
          result = result.toSorted(compareBySort(sort));
          return this;
        },
        /**
         * Documenta `limit`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} limit Valor recebido por `limit`.
         * @returns {unknown} Resultado devolvido por `limit`.
         */
        limit(limit) {
          result = result.slice(0, limit);
          return this;
        },
        /**
         * Documenta `toArray`, mantendo explícita a responsabilidade desta função no módulo.
         * @returns {Promise<unknown>} Resultado devolvido por `toArray`.
         */
        async toArray() {
          return result;
        },
      };
    },

    /**
     * Documenta `insertOne`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} document Valor recebido por `insertOne`.
     * @returns {Promise<unknown>} Resultado devolvido por `insertOne`.
     */
    async insertOne(document) {
      const insertedId = document._id ?? new ObjectId();
      rows.push({ ...document, _id: insertedId });
      return { insertedId };
    },
  };
}

afterEach(() => {
  setDbForTests(null);
});

test("MF4 valida ciclos, estados de subscrição e pagamento simulado", () => {
  assert.equal(
    addBillingCycle("2026-06-01T00:00:00.000Z", "monthly")
      .toISOString()
      .startsWith("2026-07"),
    true,
  );
  assert.equal(assertSubscriptionStatus("trialing"), "trialing");
  assert.equal(isBlockingStatus("past_due"), true);
  assert.equal(isBlockingStatus("trialing"), false);
  assert.deepEqual(
    assertCheckoutPayload({
      planCode: "faithflix-monthly",
      paymentMethod: "card_test",
    }),
    {
      planCode: "faithflix-monthly",
      paymentMethod: "card_test",
      simulateOutcome: "approved",
    },
  );
  assert.throws(
    () =>
      assertCheckoutPayload({
        planCode: "faithflix-monthly",
        paymentMethod: "card_number",
      }),
    /pagamento/i,
  );
});

test("MF4 valida candidatura, revisão, mês e preferências", () => {
  const application = assertCharityApplicationPayload({
    name: "Associação Vida",
    contactName: "Ana Silva",
    email: "ANA@EXAMPLE.COM",
    mission:
      "Apoio comunitário cristão com acompanhamento social local e visitas regulares.",
    status: "approved",
  });

  assert.equal(application.email, "ana@example.com");
  assert.equal(application.status, undefined);
  assert.equal(assertReviewPayload({ decision: "approved" }).decision, "approved");
  assert.equal(assertDistributionMonth("2026-06"), "2026-06");
  assert.deepEqual(assertPreferencePayload({ inApp: false }), {
    inApp: false,
    email: false,
    continueWatching: true,
  });
  assert.throws(
    () => assertReviewPayload({ decision: "rejected", reason: "curto" }),
    /rejeição/,
  );
  assert.throws(() => assertDistributionMonth("2026-13"), /Mês/);
});

test("MF4 verifica acesso premium por subscrição ativa ou trial dentro do período", async () => {
  const userId = new ObjectId();
  const trialUserId = new ObjectId();
  const blockedUserId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");

  setDbForTests({
    /**
     * Documenta `collection`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} name Valor recebido por `collection`.
     * @returns {unknown} Resultado devolvido por `collection`.
     */
    collection(name) {
      if (name === "subscriptions") {
        return collection([
          {
            userId,
            status: "active",
            currentPeriodEnd: future,
          },
          {
            userId: trialUserId,
            status: "trialing",
            currentPeriodEnd: future,
          },
          {
            userId: blockedUserId,
            status: "past_due",
            currentPeriodEnd: future,
          },
        ]);
      }

      return collection([]);
    },
  });

  assert.equal(await hasActiveSubscriptionAccess(String(userId)), true);
  assert.equal(await hasActiveSubscriptionAccess(String(trialUserId)), true);
  assert.equal(await hasActiveSubscriptionAccess(String(blockedUserId)), false);
});

test("MF4 distribui pool mensal em cêntimos, exclui trial e roda associações", async () => {
  const adminId = new ObjectId();
  const charityA = new ObjectId();
  const charityB = new ObjectId();
  const charityPaused = new ObjectId();
  const distributions = collection([]);

  setDbForTests({
    /**
     * Documenta `collection`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} name Valor recebido por `collection`.
     * @returns {unknown} Resultado devolvido por `collection`.
     */
    collection(name) {
      if (name === "subscriptions") {
        return collection([
          {
            status: "active",
            planCode: "faithflix-monthly",
            currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
          },
          {
            status: "trialing",
            planCode: "trial",
            currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
          },
        ]);
      }

      if (name === "subscription_plans") {
        return collection([
          {
            code: "faithflix-monthly",
            priceCents: 1000,
            solidaritySharePercent: 20,
            active: true,
          },
        ]);
      }

      if (name === "charities") {
        return collection([
          {
            _id: charityA,
            name: "Associação A",
            status: "active",
            poolStatus: "eligible",
            approvedAt: new Date("2026-01-01T00:00:00.000Z"),
          },
          {
            _id: charityB,
            name: "Associação B",
            status: "active",
            poolStatus: "eligible",
            approvedAt: new Date("2026-01-02T00:00:00.000Z"),
          },
          {
            _id: charityPaused,
            name: "Associação Pausada",
            status: "active",
            poolStatus: "paused",
            approvedAt: new Date("2026-01-03T00:00:00.000Z"),
          },
        ]);
      }

      if (name === "pool_distributions") {
        return distributions;
      }

      return collection([]);
    },
  });

  const june = await runMonthlyDistribution("2026-06", String(adminId));
  const july = await runMonthlyDistribution("2026-07", String(adminId));

  assert.equal(june.distribution.totalPoolCents, 200);
  assert.equal(
    june.distribution.items.reduce((sum, item) => sum + item.amountCents, 0),
    200,
  );
  assert.equal(june.distribution.items.length, 2);
  assert.equal(june.distribution.items[0].charityId, String(charityA));
  assert.equal(july.distribution.items[0].charityId, String(charityB));
  await assert.rejects(
    () => runMonthlyDistribution("2026-06", String(adminId)),
    /já existe/i,
  );
});

test("MF4 exporta histórico de associação como CSV simples", () => {
  const csv = historyToCsv({
    rows: [{ month: "2026-06", amountCents: 123, rotationPosition: 2 }],
  });

  assert.equal(csv, "month,amount_cents,rotation_position\n2026-06,123,2");
});
