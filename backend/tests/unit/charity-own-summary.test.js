/**
 * @file Contratos da resolução privada e mínima da associação da sessão.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { getMyCharitySummary } from "../../src/modules/charities/charity-reports.service.js";

/**
 * Cria a base mínima necessária para resolver uma membership.
 *
 * @param {{ memberships?: object[], charities?: object[] }} fixtures Documentos do cenário.
 * @returns {object} Duplo de MongoDB.
 */
function dbWith({ memberships = [], charities = [] } = {}) {
  const collections = {
    charity_memberships: memberships,
    charities,
  };

  return {
    collection(name) {
      const rows = collections[name] ?? [];
      return {
        async findOne(query) {
          return rows.find((row) =>
            Object.entries(query).every(
              ([key, value]) => String(row[key]) === String(value),
            )) ?? null;
        },
      };
    },
  };
}

afterEach(() => {
  setDbForTests(null);
});

test("associação própria devolve ausência explícita sem membership", async () => {
  const userId = new ObjectId();
  setDbForTests(dbWith());

  assert.deepEqual(await getMyCharitySummary(String(userId)), {
    charity: null,
  });
});

test("membership órfã não expõe identificadores ou dados internos", async () => {
  const userId = new ObjectId();
  const charityId = new ObjectId();
  setDbForTests(dbWith({
    memberships: [{ userId, charityId }],
  }));

  assert.deepEqual(await getMyCharitySummary(String(userId)), {
    charity: null,
  });
});

test("associação própria contém apenas id e nome", async () => {
  const userId = new ObjectId();
  const charityId = new ObjectId();
  setDbForTests(dbWith({
    memberships: [{ userId, charityId }],
    charities: [{
      _id: charityId,
      name: "Associação Segura",
      contactEmail: "privado@example.test",
      mission: "Missão interna não necessária neste resumo.",
    }],
  }));

  assert.deepEqual(await getMyCharitySummary(String(userId)), {
    charity: {
      id: String(charityId),
      name: "Associação Segura",
    },
  });
});
