/**
 * @file Testes HTTP de integração mínima da MF4.
 *
 * Exercitam as rotas públicas e as proteções de autenticação usando uma base de
 * dados em memória suficiente para o router de associações.
 */

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { startTestServer } from "../helpers/test-server.js";

let testServer;
let collections;

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
 * Compara identificadores MongoDB por valor textual.
 *
 * @param {unknown} left Valor esquerdo.
 * @param {unknown} right Valor direito.
 * @returns {boolean} Resultado da comparação.
 */
function sameId(left, right) {
  return String(left) === String(right);
}

/**
 * Valida uma condição simples de query.
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
 * Aplica uma query MongoDB mínima aos documentos em memória.
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
 * Cria comparador equivalente ao `sort` usado nas rotas testadas.
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
 * Cria uma coleção em memória com a subset de métodos usada pelo app.
 *
 * @param {object[]} rows Documentos iniciais.
 * @returns {object} Coleção compatível com os serviços testados.
 */
function createCollection(rows) {
  return {
    rows,

    async createIndex() {},

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

/**
 * Cria a base de dados em memória usada pela suite.
 *
 * @returns {object} Base de dados falsa para `setDbForTests`.
 */
function createTestDb() {
  const charityId = new ObjectId("64f400000000000000000001");
  collections = {
    charities: createCollection([
      {
        _id: charityId,
        name: "Associação Vida",
        mission: "Apoio comunitário cristão local.",
        websiteUrl: "https://example.test/",
        status: "active",
        poolStatus: "eligible",
        approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]),
    charity_applications: createCollection([]),
    charity_memberships: createCollection([]),
    pool_distributions: createCollection([]),
    sessions: createCollection([]),
    users: createCollection([]),
  };

  return {
    /**
     * Documenta `collection`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} name Valor recebido por `collection`.
     * @returns {unknown} Resultado devolvido por `collection`.
     */
    collection(name) {
      return collections[name] ?? createCollection([]);
    },
  };
}

before(async () => {
  setDbForTests(createTestDb());
  testServer = await startTestServer();
});

after(async () => {
  if (testServer) {
    await testServer.close();
  }

  setDbForTests(null);
});

test("GET /api/charities/public devolve apenas associações públicas", async () => {
  const response = await fetch(`${testServer.baseUrl}/api/charities/public`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.charities.length, 1);
  assert.equal(body.charities[0].name, "Associação Vida");
  assert.equal(body.charities[0].contactEmail, undefined);
});

test("POST /api/charities/applications cria candidatura pública", async () => {
  const response = await fetch(`${testServer.baseUrl}/api/charities/applications`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Associação Esperança",
      contactName: "Ana Silva",
      email: "ana@example.test",
      mission:
        "Apoio comunitário cristão com visitas locais e acompanhamento familiar.",
    }),
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.application.status, "pending");
  assert.equal(collections.charity_applications.rows.length, 1);
});

test("rotas privadas da MF4 exigem autenticação", async () => {
  const [applicationsResponse, dashboardResponse, historyResponse] =
    await Promise.all([
      fetch(`${testServer.baseUrl}/api/charities/applications`),
      fetch(`${testServer.baseUrl}/api/charities/pool/dashboard`),
      fetch(
        `${testServer.baseUrl}/api/charities/64f400000000000000000001/history`,
      ),
    ]);

  assert.equal(applicationsResponse.status, 401);
  assert.equal(dashboardResponse.status, 401);
  assert.equal(historyResponse.status, 401);
});
