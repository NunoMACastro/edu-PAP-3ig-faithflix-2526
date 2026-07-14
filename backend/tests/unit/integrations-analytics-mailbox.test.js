/**
 * @file Provas focadas dos controlos locais de integração, analytics e email demo.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
  ensureAnonymousMetricIndexes,
  recordAnonymousMetric,
} from "../../src/modules/analytics/analytics.service.js";
import { assertAnonymousMetricEvent } from "../../src/modules/analytics/analytics.validation.js";
import { listDemoMailbox } from "../../src/modules/demo-mailbox/demo-mailbox.service.js";
import { ensureIntegrationIndexes } from "../../src/modules/integrations/integrations.indexes.js";
import {
  assertIntegrationEnabled,
  getIntegrationSetting,
  updateIntegrationSetting,
} from "../../src/modules/integrations/integrations.service.js";
import { assertIntegrationUpdate } from "../../src/modules/integrations/integrations.validation.js";
import { createNotification } from "../../src/modules/notifications/notifications.service.js";

afterEach(() => setDbForTests(null));

/**
 * Cria cursor MongoDB apenas com ordenação/limite usados pela mailbox.
 *
 * @param {object[]} rows Linhas já filtradas.
 * @returns {object} Cursor encadeável.
 */
function cursor(rows) {
  let result = [...rows];
  return {
    sort() {
      result.sort((left, right) => right.createdAt - left.createdAt);
      return this;
    },
    limit(limit) {
      result = result.slice(0, limit);
      return this;
    },
    async toArray() {
      return result;
    },
  };
}

test("integrações recusam shapes livres, modos cruzados e config pública", () => {
  assert.deepEqual(
    assertIntegrationUpdate("internal_notifications", {
      enabled: true,
      mode: "internal",
      publicConfig: { channel: "in_app" },
    }),
    {
      enabled: true,
      mode: "internal",
      publicConfig: { channel: "in_app" },
    },
  );
  assert.throws(
    () => assertIntegrationUpdate("simulated_payments", {
      enabled: true,
      mode: "manual",
      publicConfig: {},
    }),
    (error) => error.code === "INTEGRATION_MODE_INVALID",
  );
  assert.throws(
    () => assertIntegrationUpdate("simulated_payments", {
      enabled: true,
      mode: "simulation",
      publicConfig: { apiKey: "never" },
    }),
    (error) => error.code === "INTEGRATION_PUBLIC_CONFIG_INVALID",
  );
  assert.throws(
    () => assertIntegrationUpdate("simulated_payments", {
      enabled: true,
      mode: "simulation",
      publicConfig: {},
      secret: "never",
    }),
    (error) => error.code === "INTEGRATION_PAYLOAD_INVALID",
  );
});

test("config legacy inválida falha fechada e o índice por key é único", async () => {
  const indexes = [];
  const db = {
    collection() {
      return {
        async findOne() {
          return {
            key: "simulated_payments",
            enabled: true,
            mode: "manual",
            publicConfig: { token: "legacy" },
          };
        },
        async createIndex(keys, options) {
          indexes.push({ keys, options });
        },
      };
    },
  };
  setDbForTests(db);

  const setting = await getIntegrationSetting("simulated_payments");
  assert.equal(setting.enabled, false);
  assert.equal(setting.configurationValid, false);
  assert.deepEqual(setting.publicConfig, {});
  await assert.rejects(
    () => assertIntegrationEnabled("simulated_payments"),
    (error) => error.statusCode === 503 && error.code === "INTEGRATION_DISABLED",
  );

  await ensureIntegrationIndexes();
  assert.deepEqual(indexes[0], {
    keys: { key: 1 },
    options: { unique: true, name: "integration_settings_key_unique" },
  });
});

test("update de integração audita before/after minimizados e reais", async () => {
  const actorId = new ObjectId();
  const settings = [{
    key: "simulated_payments",
    enabled: true,
    mode: "simulation",
    publicConfig: {},
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  }];
  const audits = [];
  const db = {
    async runInTransaction(work) {
      return work({ db: this, session: { transaction: true } });
    },
    collection(name) {
      if (name === "integration_settings") {
        return {
          async findOne() {
            return { ...settings[0] };
          },
          async replaceOne(_filter, replacement) {
            settings[0] = { ...replacement };
            return { matchedCount: 1 };
          },
        };
      }
      if (name === "admin_audit_logs") {
        return {
          async insertOne(document) {
            audits.push(document);
            return { insertedId: new ObjectId() };
          },
        };
      }
      throw new Error(`unexpected collection ${name}`);
    },
  };
  setDbForTests(db);

  await updateIntegrationSetting(
    String(actorId),
    "simulated_payments",
    { enabled: false, mode: "simulation", publicConfig: {} },
  );

  assert.deepEqual(audits[0].before, {
    key: "simulated_payments",
    enabled: true,
    mode: "simulation",
    publicConfig: {},
  });
  assert.deepEqual(audits[0].after, {
    key: "simulated_payments",
    enabled: false,
    mode: "simulation",
    publicConfig: {},
  });
});

test("update canónico repara config legacy e remove campos desconhecidos", async () => {
  const actorId = new ObjectId();
  const originalId = new ObjectId();
  const createdAt = new Date("2026-01-01T00:00:00.000Z");
  let setting = {
    _id: originalId,
    key: "simulated_payments",
    enabled: true,
    mode: "manual",
    publicConfig: { token: "legacy-secret" },
    secret: "must-be-removed",
    createdAt,
  };
  const audits = [];
  const db = {
    async runInTransaction(work) {
      return work({ db: this, session: { transaction: true } });
    },
    collection(name) {
      if (name === "integration_settings") {
        return {
          async findOne() {
            return { ...setting };
          },
          async replaceOne(_filter, replacement) {
            setting = { ...replacement };
            return { matchedCount: 1 };
          },
        };
      }
      if (name === "admin_audit_logs") {
        return {
          async insertOne(document) {
            audits.push(document);
            return { insertedId: new ObjectId() };
          },
        };
      }
      throw new Error(`unexpected collection ${name}`);
    },
  };
  setDbForTests(db);

  const before = await getIntegrationSetting("simulated_payments");
  assert.equal(before.configurationValid, false);

  await updateIntegrationSetting(
    String(actorId),
    "simulated_payments",
    { enabled: true, mode: "simulation", publicConfig: {} },
  );

  assert.equal(setting._id, originalId);
  assert.equal(setting.createdAt, createdAt);
  assert.equal("secret" in setting, false);
  assert.deepEqual(setting.publicConfig, {});
  const repaired = await getIntegrationSetting("simulated_payments");
  assert.equal(repaired.configurationValid, true);
  assert.equal(repaired.enabled, true);
  assert.deepEqual(audits[0].before, {
    key: "simulated_payments",
    enabled: false,
    mode: "disabled",
    publicConfig: {},
  });
});

test("analytics grava apenas campos agregáveis quando existe opt-in", async () => {
  const userId = new ObjectId();
  const events = [];
  let optedIn = false;
  const indexes = [];
  const db = {
    collection(name) {
      if (name === "user_consents") {
        return {
          async findOne() {
            return { consents: { anonymousMetrics: optedIn } };
          },
        };
      }
      if (name === "anonymous_metric_events") {
        return {
          async insertOne(document) {
            events.push(document);
            return { insertedId: new ObjectId() };
          },
          async createIndex(keys, options) {
            indexes.push({ keys, options });
          },
        };
      }
      throw new Error(`unexpected collection ${name}`);
    },
  };
  setDbForTests(db);

  assert.equal(
    await recordAnonymousMetric(String(userId), { type: "catalog_view" }, { db }),
    false,
  );
  assert.equal(events.length, 0);

  optedIn = true;
  const now = new Date("2026-07-11T23:59:59.999Z");
  assert.equal(
    await recordAnonymousMetric(
      String(userId),
      { type: "playback_started", category: "series" },
      { db, now },
    ),
    true,
  );
  assert.deepEqual(Object.keys(events[0]).sort(), [
    "category",
    "day",
    "expiresAt",
    "type",
  ]);
  assert.equal(events[0].day.toISOString(), "2026-07-11T00:00:00.000Z");
  assert.throws(
    () => assertAnonymousMetricEvent({ type: "catalog_view", contentId: "secret" }),
    /campos desconhecidos/,
  );

  await ensureAnonymousMetricIndexes();
  assert.equal(indexes[0].options.expireAfterSeconds, 0);
});

test("email opcional só entra na outbox com preferência explícita", async () => {
  const userId = new ObjectId();
  const outbox = [];
  let notificationsEnabled = true;
  const db = {
    collection(name) {
      if (name === "integration_settings") {
        return {
          async findOne() {
            return {
              key: "internal_notifications",
              enabled: notificationsEnabled,
              mode: notificationsEnabled ? "internal" : "disabled",
              publicConfig: { channel: "in_app" },
            };
          },
        };
      }
      if (name === "notification_preferences") {
        return {
          async findOne() {
            return { settings: { inApp: false, email: true, continueWatching: true } };
          },
        };
      }
      if (name === "user_consents") {
        return {
          async findOne() {
            return { consents: { operationalNotifications: true } };
          },
        };
      }
      if (name === "users") {
        return {
          async findOne() {
            return { _id: userId, email: "aluno@example.test", accountStatus: "active" };
          },
        };
      }
      if (name === "demo_email_outbox") {
        return {
          async updateOne(filter, update) {
            if (outbox.some((row) => row.dedupeKey === filter.dedupeKey)) {
              return { upsertedCount: 0 };
            }
            outbox.push(update.$setOnInsert);
            return { upsertedCount: 1 };
          },
        };
      }
      throw new Error(`unexpected collection ${name}`);
    },
  };

  const now = new Date("2026-07-11T10:00:00.000Z");
  const result = await createNotification(
    String(userId),
    {
      type: "continue_watching",
      title: "Continua a ver",
      message: "Ainda tens um conteúdo por terminar.",
      dedupeKey: "continue:item",
    },
    { db, now },
  );

  assert.deepEqual(result.deliveries, { inApp: false, email: true });
  assert.equal(outbox.length, 1);
  assert.equal(
    outbox[0].expiresAt.getTime() - outbox[0].createdAt.getTime(),
    7 * 24 * 60 * 60 * 1000,
  );

  notificationsEnabled = false;
  const paused = await createNotification(
    String(userId),
    {
      type: "continue_watching",
      title: "Continua a ver",
      message: "Esta mensagem opcional fica pausada.",
      dedupeKey: "continue:paused",
    },
    { db, now },
  );
  assert.equal(paused.skipped, true);
  assert.deepEqual(paused.deliveries, { inApp: false, email: false });
  assert.equal(outbox.length, 1);
});

test("mailbox exige desenvolvimento demo, base _demo e socket loopback", async () => {
  const now = new Date("2026-07-11T12:00:00.000Z");
  const db = {
    databaseName: "faithflix_demo",
    collection(name) {
      if (name === "password_reset_dev_outbox") {
        return {
          find() {
            return cursor([{
              _id: new ObjectId(),
              email: "aluno@example.test",
              resetToken: "reset-demo",
              createdAt: new Date("2026-07-11T11:00:00.000Z"),
              expiresAt: new Date("2026-07-11T12:30:00.000Z"),
            }]);
          },
        };
      }
      if (name === "demo_email_outbox") {
        return { find: () => cursor([]) };
      }
      throw new Error(`unexpected collection ${name}`);
    },
  };
  const source = {
    NODE_ENV: "development",
    DEMO_MODE: "true",
    ENABLE_DEMO_MAILBOX: "true",
    MONGODB_DB_NAME: "faithflix_demo",
  };

  const result = await listDemoMailbox(
    { email: "aluno@example.test" },
    { db, source, remoteAddress: "127.0.0.1", now },
  );
  assert.equal(result.messages[0].resetToken, "reset-demo");
  assert.equal("userId" in result.messages[0], false);

  await assert.rejects(
    () => listDemoMailbox(
      { email: "aluno@example.test" },
      { db, source: { ...source, NODE_ENV: "production" }, remoteAddress: "127.0.0.1", now },
    ),
    (error) => error.statusCode === 404,
  );
  await assert.rejects(
    () => listDemoMailbox(
      { email: "aluno@example.test" },
      { db, source, remoteAddress: "192.0.2.10", now },
    ),
    (error) => error.statusCode === 404,
  );
});
