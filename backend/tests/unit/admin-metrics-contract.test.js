/**
 * @file Contratos focados do intervalo UTC e do download CSV administrativo.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { setDbForTests } from "../../src/config/database.js";
import { exportMetricsCsv } from "../../src/modules/admin-metrics/admin-metrics.controller.js";
import { exportAdminMetricsCsv } from "../../src/modules/admin-metrics/admin-metrics.service.js";

/**
 * Instala coleções agregadas vazias e uma integração ativa por defeito.
 *
 * @returns {void}
 */
function installMetricsDb() {
    setDbForTests({
        collection() {
            return {
                async findOne() {
                    return null;
                },
                async countDocuments() {
                    return 0;
                },
                aggregate() {
                    return { async toArray() { return []; } };
                },
                find() {
                    return { async toArray() { return []; } };
                },
            };
        },
    });
}

afterEach(() => setDbForTests(null));

test("CSV contém apenas métricas agregadas e cabeçalho estável", async () => {
    installMetricsDb();

    const csv = await exportAdminMetricsCsv({
        from: "2026-07-01",
        to: "2026-07-01",
    });

    assert.match(csv, /^metric,value\n/u);
    assert.match(csv, /range\.from,2026-07-01/u);
    assert.match(csv, /anonymousMetrics\.total,0/u);
    assert.equal(csv.includes("userId"), false);
});

test("controller CSV aplica Content-Disposition e headers privados", async () => {
    installMetricsDb();
    const headers = new Map();
    const response = {
        statusCode: null,
        body: null,
        setHeader(name, value) {
            headers.set(name.toLowerCase(), value);
        },
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        send(body) {
            this.body = body;
            return this;
        },
    };

    await exportMetricsCsv(
        { query: { from: "2026-07-01", to: "2026-07-02" } },
        response,
    );

    assert.equal(response.statusCode, 200);
    assert.match(headers.get("content-disposition"), /^attachment; filename=/u);
    assert.equal(headers.get("cache-control"), "private, no-store");
    assert.equal(headers.get("x-content-type-options"), "nosniff");
    assert.equal(headers.get("content-type"), "text/csv; charset=utf-8");
    assert.match(response.body, /^metric,value/u);
});
