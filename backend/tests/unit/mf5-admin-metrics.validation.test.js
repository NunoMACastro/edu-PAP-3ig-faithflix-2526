// apps/backend/tests/unit/mf5-admin-metrics.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertMetricsRange } from "../../src/modules/admin-metrics/admin-metrics.validation.js";

test("MF5 valida intervalo temporal das métricas admin", () => {
    const range = assertMetricsRange({
        from: "2026-06-01",
        to: "2026-06-16",
    });

    assert.equal(range.from instanceof Date, true);
    assert.equal(range.to instanceof Date, true);
    assert.throws(
        () => assertMetricsRange({ from: "2026-12-01", to: "2026-01-01" }),
        /from/,
    );
    assert.throws(() => assertMetricsRange({ from: "data" }), /data válida/);
});