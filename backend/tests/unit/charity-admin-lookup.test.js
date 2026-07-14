/**
 * @file Contrato de privacidade do lookup administrativo de associações.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { lookupAdminCharities } from "../../src/modules/charities/charity-reports.service.js";

afterEach(() => setDbForTests(null));

test("lookup devolve apenas id e nome de associações ativas elegíveis", async () => {
  const trace = {};
  const row = {
    _id: new ObjectId(),
    name: "Associação Segura",
    contactEmail: "privado@example.test",
    phone: "+351 900 000 000",
  };
  const cursor = {
    sort(value) { trace.sort = value; return this; },
    skip(value) { trace.skip = value; return this; },
    limit(value) { trace.limit = value; return this; },
    async toArray() { return [row]; },
  };
  setDbForTests({
    collection(name) {
      assert.equal(name, "charities");
      return {
        find(filter, options) {
          trace.filter = filter;
          trace.projection = options.projection;
          return cursor;
        },
        async countDocuments(filter) { trace.countFilter = filter; return 1; },
      };
    },
  });

  const response = await lookupAdminCharities({ search: "Segura", page: "1", limit: "10" });
  assert.deepEqual(response.charities, [{ id: String(row._id), name: "Associação Segura" }]);
  assert.deepEqual(trace.projection, { name: 1 });
  assert.equal(trace.filter.status, "active");
  assert.equal(trace.filter.poolStatus, "eligible");
  assert.equal("contactEmail" in response.charities[0], false);
  assert.equal("phone" in response.charities[0], false);
});
