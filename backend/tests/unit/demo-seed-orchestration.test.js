/**
 * @file Testes da orquestração destrutiva do seed demo com doubles locais.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { runDemoSeed, safeErrorMessage } from "../../scripts/seed-demo.js";

const environment = {
    NODE_ENV: "development",
    ALLOW_DEMO_SEED: "true",
    ALLOW_DEMO_RESET: "true",
    DEMO_MONGODB_URI: "mongodb+srv://demo:segredo@cluster-demo.example.mongodb.net/?retryWrites=true&w=majority",
    DEMO_MONGODB_DB_NAME: "faithflix_demo",
    DEMO_RESET_CONFIRM: "cluster-demo.example.mongodb.net/faithflix_demo",
    DEMO_ADMIN_PASSWORD: "admin-segura-456",
    DEMO_USER_PASSWORD: "user-segura-789",
    DEMO_REFERENCE_DATE: "2026-07-10T12:00:00.000Z",
};

/** Cria doubles suficientes para provar ordem, marcador e cleanup. */
function createDoubles({ failAt, failCleanup = false, standalone = false } = {}) {
    const events = [];
    let dropCount = 0;
    const collection = (name) => ({
        async insertOne(document) {
            events.push(`insert:${name}:${document.status ?? "document"}`);
        },
        async updateMany() {
            events.push(`update-many:${name}`);
        },
        async updateOne(_filter, update) {
            events.push(`update:${name}:${update.$set.status}`);
        },
    });
    const db = {
        listCollections() {
            return { async toArray() { return []; } };
        },
        collection,
        async dropDatabase() {
            dropCount += 1;
            events.push(`drop:${dropCount}`);
            if (failCleanup && dropCount === 2) throw new Error("cleanup indisponível");
        },
    };
    class MongoClientDouble {
        constructor(uri) {
            assert.equal(uri, environment.DEMO_MONGODB_URI);
            events.push("client:new");
        }
        async connect() { events.push("client:connect"); }
        db(name) {
            if (name === "admin") {
                return {
                    async command(command) {
                        assert.deepEqual(command, { hello: 1, maxTimeMS: 1_000 });
                        events.push("hello");
                        return standalone
                            ? { logicalSessionTimeoutMinutes: 30 }
                            : {
                                logicalSessionTimeoutMinutes: 30,
                                setName: "faithflix-demo",
                            };
                    },
                };
            }
            assert.equal(name, environment.DEMO_MONGODB_DB_NAME);
            return db;
        }
        async close() { events.push("client:close"); }
    }
    const step = (name, result = {}) => async () => {
        events.push(name);
        if (failAt === name) throw new Error(`falha em ${name}`);
        return result;
    };
    const runtime = {
        ensureApplicationIndexes: step("indexes"),
        database: {
            assertTransactionSupport: step("transactions"),
            getDb: async () => db,
            closeDatabase: step("database:close"),
        },
        utils: {
            DEMO_FIXTURE: "demo-v2",
            DEMO_EXPECTED_COUNTS: { users: 36 },
            configureDemoSeedContext() { events.push("context"); },
            getDemoContext() { return { contentIds: [] }; },
        },
        seedDemoUsers: step("users"),
        seedDemoCatalog: step("catalog"),
        seedDemoSubscriptions: step("subscriptions"),
        seedDemoEngagement: step("engagement"),
        seedDemoCharities: step("charities"),
        seedDemoBiblical: step("biblical"),
        seedDemoOps: step("ops"),
        generateContentEmbeddings: step("embeddings"),
        verifyDemoDataset: step("verify", { counts: { users: 36 } }),
    };
    return {
        events,
        overrides: {
            MongoClientClass: MongoClientDouble,
            loadRuntime: async () => runtime,
        },
    };
}

test("orquestrador faz drop, índices, marcador, módulos e verificação pela ordem contratada", async () => {
    const { events, overrides } = createDoubles();
    const result = await runDemoSeed(environment, overrides);

    assert.equal(result.verification.verified, true);
    assert.deepEqual(events.slice(0, 4), ["client:new", "client:connect", "hello", "drop:1"]);
    const ordered = [
        "transactions",
        "indexes",
        "context",
        "insert:__faithflix_demo_meta:seeding",
        "users",
        "catalog",
        "subscriptions",
        "engagement",
        "charities",
        "biblical",
        "ops",
        "embeddings",
        "update-many:content_embeddings",
        "verify",
        "update:__faithflix_demo_meta:complete",
    ];
    assert.deepEqual(events.slice(4, 4 + ordered.length), ordered);
    assert.equal(events.includes("drop:2"), false);
});

test("standalone falha antes de validar propriedade ou apagar a base", async () => {
    const { events, overrides } = createDoubles({ standalone: true });
    await assert.rejects(
        () => runDemoSeed(environment, overrides),
        (error) => error.code === "MONGODB_TRANSACTIONS_REQUIRED",
    );
    assert.deepEqual(events, ["client:new", "client:connect", "hello", "client:close"]);
});

test("orquestrador elimina novamente a base quando um módulo falha", async () => {
    const { events, overrides } = createDoubles({ failAt: "catalog" });
    await assert.rejects(() => runDemoSeed(environment, overrides), /falha em catalog/u);
    assert.equal(events.filter((event) => event.startsWith("drop:")).length, 2);
    assert.ok(events.indexOf("drop:2") > events.indexOf("catalog"));
});

test("orquestrador devolve DEMO_PARTIAL_CLEANUP_FAILED se a limpeza final falhar", async () => {
    const { overrides } = createDoubles({ failAt: "verify", failCleanup: true });
    await assert.rejects(
        () => runDemoSeed(environment, overrides),
        (error) => error.code === "DEMO_PARTIAL_CLEANUP_FAILED",
    );
});

test("guard inválido falha antes de construir cliente ou carregar runtime", async () => {
    let touched = false;
    class ForbiddenClient { constructor() { touched = true; } }
    await assert.rejects(
        () => runDemoSeed({ ...environment, DEMO_RESET_CONFIRM: "errado/base" }, {
            MongoClientClass: ForbiddenClient,
            loadRuntime: async () => { touched = true; },
        }),
        /DEMO_RESET_CONFIRM/u,
    );
    assert.equal(touched, false);
});

test("mensagens sanitizadas não incluem URI nem passwords", () => {
    const message = safeErrorMessage(
        new Error(`${environment.DEMO_MONGODB_URI} ${environment.DEMO_ADMIN_PASSWORD} ${environment.DEMO_USER_PASSWORD}`),
        environment,
    );
    assert.equal(message.includes("segredo"), false);
    assert.equal(message.includes(environment.DEMO_ADMIN_PASSWORD), false);
    assert.equal(message.includes(environment.DEMO_USER_PASSWORD), false);
});
