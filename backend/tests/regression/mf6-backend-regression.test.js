// backend/tests/regression/mf6-backend-regression.test.js
/**
 * @file Suite de regressão backend da MF6.
 *
 * Protege os contratos mínimos de RNF29 usando validators, services e routers
 * reais da aplicação, mas com uma base de dados em memória controlada.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { createApp } from "../../src/app.js";
import { setDbForTests } from "../../src/config/database.js";
import {
  assertValidEmail,
  assertValidPassword,
} from "../../src/modules/auth/auth.validation.js";
import { requireRole } from "../../src/modules/auth/auth.middleware.js";
import { createSimulatedCheckout } from "../../src/modules/payments/payments.service.js";
import { cancelRenewal } from "../../src/modules/subscriptions/subscriptions.service.js";
import { assertProgressPayload } from "../../src/modules/playback/playback.validation.js";
import { runMonthlyDistribution } from "../../src/modules/charities/pool-distribution.service.js";

/**
 * Compara identificadores MongoDB pelo seu valor textual.
 *
 * @param {unknown} left Identificador esquerdo.
 * @param {unknown} right Identificador direito.
 * @returns {boolean} `true` quando representam o mesmo id.
 */
function sameId(left, right) {
  return String(left) === String(right);
}

/**
 * Lê um campo simples ou aninhado de um documento em memória.
 *
 * @param {Record<string, unknown>} row Documento consultado.
 * @param {string} path Caminho no formato `campo.subcampo`.
 * @returns {unknown} Valor encontrado.
 */
function valueForPath(row, path) {
  return path.split(".").reduce((current, key) => current?.[key], row);
}

/**
 * Compara um valor real com uma condição MongoDB usada nos services testados.
 *
 * @param {unknown} actual Valor do documento.
 * @param {unknown} expected Condição esperada.
 * @returns {boolean} Resultado da comparação.
 */
function matchesValue(actual, expected) {
  if (expected instanceof ObjectId) {
    return sameId(actual, expected);
  }

  if (expected && typeof expected === "object" && !Array.isArray(expected)) {
    if ("$gt" in expected && actual <= expected.$gt) return false;
    if ("$gte" in expected && actual < expected.$gte) return false;
    if ("$lte" in expected && actual > expected.$lte) return false;
    return true;
  }

  return actual === expected;
}

/**
 * Aplica uma query simples aos documentos guardados em memória.
 *
 * @param {Record<string, unknown>} row Documento consultado.
 * @param {Record<string, unknown>} query Query simplificada.
 * @returns {boolean} `true` quando o documento cumpre a query.
 */
function matches(row, query = {}) {
  return Object.entries(query).every(([key, expected]) => {
    const actual = valueForPath(row, key);

    if (expected instanceof ObjectId) {
      return sameId(actual, expected);
    }

    return matchesValue(actual, expected);
  });
}

/**
 * Cria comparador para a subset de `sort` usada pelos services.
 *
 * @param {Record<string, 1 | -1>} sort Ordenação simplificada.
 * @returns {(left: object, right: object) => number} Comparador.
 */
function compareBySort(sort = {}) {
  return (left, right) => {
    for (const [key, direction] of Object.entries(sort)) {
      const leftValue = valueForPath(left, key);
      const rightValue = valueForPath(right, key);

      if (leftValue < rightValue) return -1 * direction;
      if (leftValue > rightValue) return 1 * direction;
    }

    return 0;
  };
}

/**
 * Aplica operadores de atualização MongoDB suficientes para esta regressão.
 *
 * @param {Record<string, unknown>} row Documento alvo.
 * @param {Record<string, unknown>} update Operadores `$set` e `$setOnInsert`.
 * @param {boolean} isInsert Indica se o documento nasceu por upsert.
 * @returns {Record<string, unknown>} Documento atualizado.
 */
function applyUpdate(row, update = {}, isInsert = false) {
  Object.assign(row, update.$set ?? {});

  if (isInsert) {
    Object.assign(row, update.$setOnInsert ?? {});
  }

  if (!row._id) {
    row._id = new ObjectId();
  }

  return row;
}

/**
 * Converte filtros simples em documento inicial para upsert.
 *
 * @param {Record<string, unknown>} filter Filtro usado no update.
 * @returns {Record<string, unknown>} Documento base.
 */
function rowFromFilter(filter = {}) {
  return Object.fromEntries(
    Object.entries(filter).filter(
      ([key, value]) =>
        !key.startsWith("$") &&
        !(value && typeof value === "object" && !Array.isArray(value)),
    ),
  );
}

/**
 * Cria uma coleção em memória compatível com a subset MongoDB usada na suite.
 *
 * @param {Record<string, unknown>[]} rows Documentos iniciais.
 * @returns {Record<string, unknown>} Coleção de teste.
 */
function collection(rows = []) {
  return {
    rows,

    async createIndex() {},

    /**
     * Procura o primeiro documento que cumpre a query.
     *
     * @param {Record<string, unknown>} query Query simplificada.
     * @param {{ sort?: Record<string, 1 | -1> }} options Opções simplificadas.
     * @returns {Promise<Record<string, unknown> | null>} Documento encontrado.
     */
    async findOne(query = {}, options = {}) {
      const result = rows.filter((row) => matches(row, query));

      if (options.sort) {
        result.sort(compareBySort(options.sort));
      }

      return result[0] ?? null;
    },

    /**
     * Lista documentos que cumprem a query com `sort().toArray()`.
     *
     * @param {Record<string, unknown>} query Query simplificada.
     * @returns {{ sort: Function, toArray: Function }} Cursor fake.
     */
    find(query = {}) {
      const result = rows.filter((row) => matches(row, query));

      return {
        sort(sort = {}) {
          result.sort(compareBySort(sort));
          return this;
        },
        async toArray() {
          return result;
        },
      };
    },

    /**
     * Insere um documento e devolve o id gerado.
     *
     * @param {Record<string, unknown>} document Documento a inserir.
     * @returns {Promise<{ insertedId: ObjectId }>} Resultado de inserção.
     */
    async insertOne(document) {
      const insertedId = document._id ?? new ObjectId();
      rows.push({ ...document, _id: insertedId });
      return { insertedId };
    },

    /**
     * Atualiza ou cria um documento.
     *
     * @param {Record<string, unknown>} filter Filtro simplificado.
     * @param {Record<string, unknown>} update Operadores de update.
     * @param {{ upsert?: boolean }} options Opções de update.
     * @returns {Promise<{ matchedCount: number, modifiedCount: number }>} Resultado.
     */
    async updateOne(filter, update, options = {}) {
      const existing = rows.find((row) => matches(row, filter));

      if (existing) {
        applyUpdate(existing, update, false);
        return { matchedCount: 1, modifiedCount: 1 };
      }

      if (options.upsert) {
        rows.push(applyUpdate(rowFromFilter(filter), update, true));
      }

      return { matchedCount: 0, modifiedCount: 0 };
    },

    /**
     * Atualiza o primeiro documento encontrado e devolve o documento final.
     *
     * @param {Record<string, unknown>} filter Filtro simplificado.
     * @param {Record<string, unknown>} update Operadores de update.
     * @returns {Promise<Record<string, unknown> | null>} Documento atualizado.
     */
    async findOneAndUpdate(filter, update) {
      const existing = rows.find((row) => matches(row, filter));

      if (!existing) {
        return null;
      }

      return applyUpdate(existing, update, false);
    },
  };
}

/**
 * Instala coleções em memória através do helper oficial de testes.
 *
 * @param {Record<string, ReturnType<typeof collection>>} collections Coleções iniciais.
 * @returns {Record<string, ReturnType<typeof collection>>} Coleções instaladas.
 */
function setCollectionsForRegression(collections) {
  setDbForTests({
    collection(name) {
      collections[name] ??= collection([]);
      return collections[name];
    },
  });

  return collections;
}

/**
 * Confirma que uma função lança erro HTTP previsível.
 *
 * @param {() => unknown} action Ação que deve falhar.
 * @param {number} statusCode Código HTTP esperado.
 * @returns {void}
 */
function assertHttpFailure(action, statusCode) {
  assert.throws(
    action,
    (error) => {
      assert.equal(error.statusCode ?? error.status, statusCode);
      return true;
    },
  );
}

/**
 * Simula uma resposta Express para testar middlewares de autorização.
 *
 * @returns {{ response: object, state: { statusCode: number, body: unknown } }} Duplo de resposta.
 */
function createResponseDouble() {
  const state = { statusCode: 200, body: null };

  return {
    state,
    response: {
      status(code) {
        state.statusCode = code;
        return this;
      },
      json(body) {
        state.body = body;
        return this;
      },
    },
  };
}

afterEach(() => {
  setDbForTests(null);
});

test("auth mantém email normalizado e password mínima", () => {
  assert.equal(assertValidEmail("  ALUNO@FAITHFLIX.TEST "), "aluno@faithflix.test");
  assert.equal(assertValidPassword("palavra-passe-segura"), "palavra-passe-segura");

  assertHttpFailure(() => assertValidEmail("email-invalido"), 400);
  assertHttpFailure(() => assertValidPassword("curta"), 400);
});

test("subscrições cobrem criação por checkout simulado e cancelamento de renovação", async () => {
  const userId = new ObjectId();
  const collections = setCollectionsForRegression({
    subscription_plans: collection([
      {
        _id: new ObjectId(),
        code: "faithflix-monthly",
        name: "FaithFlix Mensal",
        interval: "monthly",
        priceCents: 1000,
        currency: "EUR",
        solidaritySharePercent: 20,
        active: true,
      },
    ]),
    subscriptions: collection([]),
    payment_attempts: collection([]),
    notification_preferences: collection([]),
    notifications: collection([]),
  });

  const checkout = await createSimulatedCheckout(String(userId), {
    planCode: "faithflix-monthly",
    paymentMethod: "card_test",
    simulateOutcome: "approved",
  });

  assert.equal(checkout.status, "approved");
  assert.equal(checkout.subscription.status, "active");
  assert.equal(collections.payment_attempts.rows.length, 1);
  assert.equal(collections.subscriptions.rows.length, 1);

  const canceled = await cancelRenewal(String(userId));
  // O cancelamento mantém acesso até ao fim do ciclo, mas impede renovação automática.
  assert.equal(canceled.subscription.cancelAtPeriodEnd, true);

  await assert.rejects(
    () =>
      createSimulatedCheckout(String(userId), {
        planCode: "faithflix-monthly",
        paymentMethod: "cartao-real",
        simulateOutcome: "approved",
      }),
    /Método de pagamento inválido/,
  );
});

test("playback limita progresso ao tamanho real do conteúdo", () => {
  const progress = assertProgressPayload({ currentTimeSeconds: 130 }, 120);

  assert.deepEqual(progress, {
    currentTimeSeconds: 120,
    durationSeconds: 120,
    completed: true,
  });

  assertHttpFailure(() => assertProgressPayload({ currentTimeSeconds: -1 }, 120), 400);
});

test("pool solidária executa distribuição mensal e roda associações", async () => {
  const firstCharityId = new ObjectId();
  const secondCharityId = new ObjectId();
  setCollectionsForRegression({
    subscription_plans: collection([
      {
        _id: new ObjectId(),
        code: "faithflix-monthly",
        interval: "monthly",
        priceCents: 1000,
        solidaritySharePercent: 20,
        active: true,
      },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: new ObjectId(),
        planCode: "faithflix-monthly",
        status: "active",
        currentPeriodEnd: new Date("2099-01-01T00:00:00.000Z"),
      },
    ]),
    charities: collection([
      {
        _id: firstCharityId,
        name: "Associação Vida",
        status: "active",
        poolStatus: "eligible",
        approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      {
        _id: secondCharityId,
        name: "Associação Esperança",
        status: "active",
        poolStatus: "eligible",
        approvedAt: new Date("2026-02-01T00:00:00.000Z"),
      },
    ]),
    pool_distributions: collection([]),
  });

  const june = await runMonthlyDistribution("2026-06", String(new ObjectId()));
  const july = await runMonthlyDistribution("2026-07", String(new ObjectId()));

  assert.equal(june.distribution.totalPoolCents, 200);
  assert.equal(june.distribution.items[0].charityId, String(firstCharityId));
  // A segunda distribuição começa na associação seguinte, provando rotação real.
  assert.equal(july.distribution.items[0].charityId, String(secondCharityId));

  await assert.rejects(
    () => runMonthlyDistribution("2026-07", String(new ObjectId())),
    /Distribuição deste mês já existe/,
  );
});

test("endpoints admin herdados da MF5 continuam montados e exigem role admin", () => {
  const mountedRouters = createApp()._router.stack.map((layer) => String(layer.regexp));

  assert.ok(mountedRouters.some((route) => route.includes("\\/api\\/admin\\/metrics")));
  assert.ok(mountedRouters.some((route) => route.includes("\\/api\\/admin\\/integrations")));

  const adminOnly = requireRole(["admin"]);
  const anonymous = createResponseDouble();
  adminOnly({}, anonymous.response, () => assert.fail("Anónimo não pode avançar"));
  assert.equal(anonymous.state.statusCode, 401);

  const normalUser = createResponseDouble();
  adminOnly({ user: { role: "user" } }, normalUser.response, () =>
    assert.fail("Utilizador comum não pode avançar"),
  );
  assert.equal(normalUser.state.statusCode, 403);
});