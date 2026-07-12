/**
 * @file Contratos fechados das integrações e métricas anónimas do seed demo.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { setDbForTests } from "../../src/config/database.js";
import { assertPersistedIntegration } from "../../src/modules/integrations/integrations.validation.js";
import { seedDemoOps } from "../../scripts/seed-demo-ops.js";
import {
    configureDemoSeedContext,
    DEMO_EXPECTED_COUNTS,
} from "../../scripts/demo-seed-utils.js";

afterEach(() => setDbForTests(null));

test("seed ops persiste integrações estritas e métricas sem identificadores", async () => {
    configureDemoSeedContext({
        referenceDate: new Date("2026-07-10T12:00:00.000Z"),
        dataSeed: "faithflix-demo-v2",
        adminPassword: "admin-password-demo",
        userPassword: "user-password-demo",
    });
    const inserted = new Map();
    setDbForTests({
        collection(name) {
            return {
                async insertMany(documents) {
                    inserted.set(name, documents);
                    return { insertedCount: documents.length };
                },
                async countDocuments() {
                    return 0;
                },
            };
        },
    });

    const summary = await seedDemoOps();
    assert.equal(summary.integrations, DEMO_EXPECTED_COUNTS.integrations);
    assert.equal(
        summary.anonymousMetricEvents,
        DEMO_EXPECTED_COUNTS.anonymousMetricEvents,
    );

    const integrations = inserted.get("integration_settings");
    assert.deepEqual(
        integrations.map((row) => row.key),
        [
            "internal_notifications",
            "simulated_payments",
            "aggregate_analytics_export",
        ],
    );
    for (const integration of integrations) {
        assert.equal("demoFixture" in integration, false);
        assert.equal(assertPersistedIntegration(integration.key, integration).enabled, true);
    }
    assert.deepEqual(integrations[0].publicConfig, { channel: "in_app" });
    assert.deepEqual(integrations[1].publicConfig, {});
    assert.deepEqual(integrations[2].publicConfig, {});

    const metrics = inserted.get("anonymous_metric_events");
    assert.equal(metrics.length, DEMO_EXPECTED_COUNTS.anonymousMetricEvents);
    const allowedFields = new Set(["type", "category", "day", "expiresAt"]);
    assert(metrics.every((row) =>
        Object.keys(row).every((field) => allowedFields.has(field))));
    assert(metrics.every((row) =>
        row.day.getUTCHours() === 0 &&
        row.expiresAt.getTime() - row.day.getTime() === 90 * 24 * 60 * 60 * 1000));
    const perType = metrics.reduce((counts, row) => {
        counts[row.type] = (counts[row.type] ?? 0) + 1;
        return counts;
    }, {});
    assert.deepEqual(
        perType,
        {
            catalog_view: 6,
            search_submit: 6,
            playback_started: 6,
            playback_completed: 6,
        },
    );
});
