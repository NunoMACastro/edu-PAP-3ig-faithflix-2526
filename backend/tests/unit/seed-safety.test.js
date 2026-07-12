/**
 * @file Testes unitários dos guards de seed, sem rede ou MongoDB real.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
    DEFAULT_DEMO_DATA_SEED,
    DEMO_FIXTURE_VERSION,
    DEMO_MARKER_COLLECTION,
    DEMO_MARKER_ID,
    assertDemoDatabaseOwnership,
    assertDemoSeedEnvironment,
    assertE2eSeedEnvironment,
    assertEditorialSeedEnvironment,
    assertNoNonFixtureConflicts,
    cleanupMarkedFixtureCollections,
    deleteMarkedFixtureDocuments,
    resetOwnedDemoDatabase,
} from "../../scripts/seed-safety.js";

const validE2eEnvironment = {
    NODE_ENV: "test",
    ALLOW_E2E_SEED: "true",
    TEST_MONGODB_URI: "mongodb://127.0.0.1:27017/?replicaSet=faithflix-e2e",
    TEST_MONGODB_DB_NAME: "faithflix_e2e",
    MONGODB_URI: "mongodb://127.0.0.1:27018",
    MONGODB_DB_NAME: "faithflix",
};

test("guard E2E exige opt-in, URI explícita e base _e2e", () => {
    assert.throws(() => assertE2eSeedEnvironment({}), /NODE_ENV=test/u);
    assert.throws(
        () =>
            assertE2eSeedEnvironment({
                ...validE2eEnvironment,
                ALLOW_E2E_SEED: "false",
            }),
        /ALLOW_E2E_SEED=true/u,
    );
    assert.throws(
        () =>
            assertE2eSeedEnvironment({
                ...validE2eEnvironment,
                TEST_MONGODB_DB_NAME: "faithflix_test",
            }),
        /terminar em _e2e/u,
    );
    assert.deepEqual(assertE2eSeedEnvironment(validE2eEnvironment), {
        mongoUri: validE2eEnvironment.TEST_MONGODB_URI,
        mongoDbName: validE2eEnvironment.TEST_MONGODB_DB_NAME,
    });
});

test("guard E2E recusa reutilizar a configuração normal", () => {
    assert.throws(
        () =>
            assertE2eSeedEnvironment({
                ...validE2eEnvironment,
                MONGODB_URI: validE2eEnvironment.TEST_MONGODB_URI,
            }),
        /não pode reutilizar/u,
    );
    assert.throws(
        () =>
            assertE2eSeedEnvironment({
                ...validE2eEnvironment,
                MONGODB_DB_NAME: validE2eEnvironment.TEST_MONGODB_DB_NAME,
            }),
        /não pode reutilizar/u,
    );
});

test("guard E2E recusa hosts, proxies e nomes operacionais", () => {
    assert.throws(
        () =>
            assertE2eSeedEnvironment({
                ...validE2eEnvironment,
                TEST_MONGODB_URI:
                    "mongodb://cluster.invalid:27017/?replicaSet=faithflix-e2e",
            }),
        /exclusivamente para loopback/u,
    );
    assert.throws(
        () =>
            assertE2eSeedEnvironment({
                ...validE2eEnvironment,
                TEST_MONGODB_URI:
                    "mongodb://127.0.0.1:27017/?replicaSet=faithflix-e2e&proxyHost=proxy.invalid",
            }),
        /apenas o parâmetro replicaSet/u,
    );
    assert.throws(
        () =>
            assertE2eSeedEnvironment({
                ...validE2eEnvironment,
                TEST_MONGODB_DB_NAME: "production_e2e",
            }),
        /não pode identificar produção/u,
    );
    assert.throws(
        () =>
            assertE2eSeedEnvironment({
                ...validE2eEnvironment,
                TEST_MONGODB_DB_NAME: "shared_e2e",
            }),
        /base partilhada/u,
    );
});

test("guard demo exige opt-in e passwords distintas sem legacy", () => {
    const valid = {
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

    assert.throws(() => assertDemoSeedEnvironment({}), /NODE_ENV=development/u);
    assert.throws(
        () =>
            assertDemoSeedEnvironment({
                ...valid,
                NODE_ENV: "production",
            }),
        /NODE_ENV=development/u,
    );
    assert.throws(
        () =>
            assertDemoSeedEnvironment({
                ...valid,
                DEMO_ADMIN_PASSWORD: "password-segura-123",
            }),
        /password demo antiga/u,
    );
    const result = assertDemoSeedEnvironment(valid);
    assert.equal(result.adminPassword, valid.DEMO_ADMIN_PASSWORD);
    assert.equal(result.userPassword, valid.DEMO_USER_PASSWORD);
    assert.equal(result.mongoDbName, "faithflix_demo");
    assert.equal(result.atlasHost, "cluster-demo.example.mongodb.net");
    assert.equal(result.referenceDate.toISOString(), valid.DEMO_REFERENCE_DATE);
    assert.equal(result.dataSeed, DEFAULT_DEMO_DATA_SEED);
    assert.equal(result.allowAdoption, false);
    assert.throws(
        () => assertDemoSeedEnvironment({ ...valid, ALLOW_DEMO_RESET: "false" }),
        /ALLOW_DEMO_RESET/u,
    );
    assert.throws(
        () => assertDemoSeedEnvironment({ ...valid, DEMO_MONGODB_DB_NAME: "faithflix_prod_demo" }),
        /produção/u,
    );
    assert.throws(
        () => assertDemoSeedEnvironment({ ...valid, DEMO_RESET_CONFIRM: "outro/base" }),
        /DEMO_RESET_CONFIRM/u,
    );
    assert.throws(
        () => assertDemoSeedEnvironment({ ...valid, DEMO_MONGODB_URI: "mongodb://127.0.0.1:27017" }),
        /replicaSet/u,
    );
    assert.throws(
        () => assertDemoSeedEnvironment({ ...valid, DEMO_MONGODB_URI: "mongodb+srv://demo:segredo@cluster-demo.example.mongodb.net/faithflix_demo" }),
        /pathname/u,
    );
    assert.throws(
        () => assertDemoSeedEnvironment({ ...valid, MONGODB_DB_NAME: "faithflix_demo" }),
        /diferente da base normal/u,
    );
    assert.throws(
        () => assertDemoSeedEnvironment({ ...valid, DEMO_REFERENCE_DATE: "2026-07-10" }),
        /ISO-8601 UTC completo/u,
    );
});

test("guard demo aceita replica set local apenas com hosts loopback", () => {
    const targetIdentity =
        "local-replica-set:faithflix-demo@127.0.0.1:27017,localhost:27018";
    const valid = {
        NODE_ENV: "development",
        ALLOW_DEMO_SEED: "true",
        ALLOW_DEMO_RESET: "true",
        DEMO_MONGODB_URI:
            "mongodb://demo:segredo@127.0.0.1:27017,localhost:27018/?replicaSet=faithflix-demo",
        DEMO_MONGODB_DB_NAME: "faithflix_demo",
        DEMO_RESET_CONFIRM: `${targetIdentity}/faithflix_demo`,
        DEMO_ADMIN_PASSWORD: "admin-segura-456",
        DEMO_USER_PASSWORD: "user-segura-789",
        DEMO_REFERENCE_DATE: "2026-07-10T12:00:00.000Z",
        MONGODB_DB_NAME: "faithflix",
    };

    const result = assertDemoSeedEnvironment(valid);
    assert.equal(result.targetKind, "loopback-replica-set");
    assert.equal(result.targetIdentity, targetIdentity);
    assert.equal(result.atlasHost, targetIdentity);

    for (const mongoUri of [
        "mongodb://127.0.0.1:27017/",
        "mongodb://cluster.invalid:27017/?replicaSet=faithflix-demo",
        "mongodb://127.0.0.1:27017/faithflix_demo?replicaSet=faithflix-demo",
        "mongodb://127.0.0.1:27017/?replicaSet=faithflix-demo&directConnection=true",
        "mongodb://127.0.0.1:27017/?replicaSet=faithflix%20demo",
        "mongodb://demo@127.0.0.1:27017/?replicaSet=faithflix-demo",
        "mongodb://demo:@127.0.0.1:27017/?replicaSet=faithflix-demo",
        "mongodb://:segredo@127.0.0.1:27017/?replicaSet=faithflix-demo",
        "mongodb://demo:segredo:extra@127.0.0.1:27017/?replicaSet=faithflix-demo",
        "mongodb://demo:segredo@extra@127.0.0.1:27017/?replicaSet=faithflix-demo",
        "mongodb://demo:%ZZ@127.0.0.1:27017/?replicaSet=faithflix-demo",
    ]) {
        assert.throws(
            () => assertDemoSeedEnvironment({ ...valid, DEMO_MONGODB_URI: mongoUri }),
            /DEMO_MONGODB_URI/u,
        );
    }

    const withoutCredentials = assertDemoSeedEnvironment({
        ...valid,
        DEMO_MONGODB_URI:
            "mongodb://127.0.0.1:27017/?replicaSet=faithflix-demo",
        DEMO_RESET_CONFIRM:
            "local-replica-set:faithflix-demo@127.0.0.1:27017/faithflix_demo",
    });
    assert.equal(withoutCredentials.targetIdentity, targetIdentity.split(",")[0]);
});

test("guard demo exige marcador numa base não vazia ou adoção explícita", async () => {
    const config = {
        mongoDbName: "faithflix_demo",
        atlasHost: "cluster-demo.example.mongodb.net",
        allowAdoption: false,
    };
    const db = {
        listCollections() {
            return { async toArray() { return [{ name: "users" }]; } };
        },
        collection(name) {
            assert.equal(name, DEMO_MARKER_COLLECTION);
            return { async findOne() { return null; } };
        },
    };
    await assert.rejects(() => assertDemoDatabaseOwnership(db, config), /ALLOW_DEMO_DATABASE_ADOPTION/u);
    assert.deepEqual(
        await assertDemoDatabaseOwnership(db, { ...config, allowAdoption: true }),
        { empty: false, adopted: true },
    );
});

test("guard demo aceita apenas marcador pertencente ao alvo e versão atuais", async () => {
    const config = {
        mongoDbName: "faithflix_demo",
        atlasHost: "cluster-demo.example.mongodb.net",
        allowAdoption: false,
    };
    const marker = {
        _id: DEMO_MARKER_ID,
        databaseName: config.mongoDbName,
        atlasHost: config.atlasHost,
        fixtureVersion: DEMO_FIXTURE_VERSION,
    };
    const db = {
        listCollections() {
            return { async toArray() { return [{ name: DEMO_MARKER_COLLECTION }]; } };
        },
        collection() {
            return { async findOne() { return marker; } };
        },
    };
    assert.deepEqual(await assertDemoDatabaseOwnership(db, config), { empty: false, adopted: false });
    marker.databaseName = "outra_demo";
    await assert.rejects(() => assertDemoDatabaseOwnership(db, config), /marcador/u);
});

test("reset demo nunca chama dropDatabase quando a propriedade falha", async () => {
    let drops = 0;
    const db = {
        listCollections() {
            return { async toArray() { return [{ name: "users" }]; } };
        },
        collection() {
            return { async findOne() { return null; } };
        },
        async dropDatabase() { drops += 1; },
    };
    const config = {
        mongoDbName: "faithflix_demo",
        atlasHost: "cluster-demo.example.mongodb.net",
        allowAdoption: false,
    };
    await assert.rejects(() => resetOwnedDemoDatabase(db, config), /adoção inicial/u);
    assert.equal(drops, 0);
    assert.deepEqual(
        await resetOwnedDemoDatabase(db, { ...config, allowAdoption: true }),
        { empty: false, adopted: true },
    );
    assert.equal(drops, 1);
});

test("guard editorial exige opt-in e rejeita produção", () => {
    assert.throws(() => assertEditorialSeedEnvironment({}), /ALLOW_EDITORIAL_SEED/u);
    assert.throws(
        () =>
            assertEditorialSeedEnvironment({
                ALLOW_EDITORIAL_SEED: "true",
                NODE_ENV: "production",
            }),
        /proibidos/u,
    );
    assert.doesNotThrow(() =>
        assertEditorialSeedEnvironment({
            ALLOW_EDITORIAL_SEED: "true",
            NODE_ENV: "development",
        }),
    );
});

test("cleanup por marcador usa exclusivamente o marcador exato", async () => {
    let receivedFilter;
    const db = {
        collection() {
            return {
                async deleteMany(filter) {
                    receivedFilter = filter;
                    return { deletedCount: 2 };
                },
            };
        },
    };

    const deleted = await deleteMarkedFixtureDocuments(db, "users", {
        markerField: "e2eFixture",
        markerValue: "mf2-e2e",
    });

    assert.equal(deleted, 2);
    assert.deepEqual(receivedFilter, { e2eFixture: "mf2-e2e" });
});

test("deteção de conflito impede cleanup de dados não-fixture", async () => {
    let receivedFilter;
    const db = {
        collection() {
            return {
                async findOne(filter) {
                    receivedFilter = filter;
                    return { _id: "manual" };
                },
            };
        },
    };

    await assert.rejects(
        () =>
            assertNoNonFixtureConflicts(
                db,
                "users",
                [{ email: "e2e@faithflix.test" }],
                {
                    markerField: "e2eFixture",
                    markerValue: "mf2-e2e",
                    label: "Utilizador reservado",
                },
            ),
        /Cleanup recusado/u,
    );
    assert.deepEqual(receivedFilter, {
        $and: [
            { $or: [{ email: "e2e@faithflix.test" }] },
            { e2eFixture: { $ne: "mf2-e2e" } },
        ],
    });
});

test("plano de cleanup pré-valida todas as coleções antes de apagar", async () => {
    const deletedCollections = [];
    const db = {
        collection(name) {
            return {
                async findOne() {
                    return name === "contents" ? { _id: "manual" } : null;
                },
                async deleteMany() {
                    deletedCollections.push(name);
                    return { deletedCount: 1 };
                },
            };
        },
    };

    await assert.rejects(
        () => cleanupMarkedFixtureCollections(
            db,
            [
                { collectionName: "users", clauses: [{ email: "fixture@test" }], label: "users" },
                { collectionName: "contents", clauses: [{ slug: "fixture" }], label: "contents" },
            ],
            { markerField: "e2eFixture", markerValue: "suite-e2e" },
        ),
        /Cleanup recusado/u,
    );
    assert.deepEqual(deletedCollections, []);
});

test("plano de cleanup apaga exclusivamente pelo marcador exato", async () => {
    const filters = [];
    const db = {
        collection() {
            return {
                async findOne() {
                    return null;
                },
                async deleteMany(filter) {
                    filters.push(filter);
                    return { deletedCount: 1 };
                },
            };
        },
    };

    const deleted = await cleanupMarkedFixtureCollections(
        db,
        [
            { collectionName: "users", clauses: [{ email: "fixture@test" }], label: "users" },
            { collectionName: "contents", clauses: [{ slug: "fixture" }], label: "contents" },
        ],
        { markerField: "e2eFixture", markerValue: "suite-e2e" },
    );

    assert.equal(deleted, 2);
    assert.deepEqual(filters, [
        { e2eFixture: "suite-e2e" },
        { e2eFixture: "suite-e2e" },
    ]);
});
