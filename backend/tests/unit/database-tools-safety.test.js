/**
 * @file Testes unitários dos scripts de backup/restore, sem MongoDB nem tools reais.
 *
 * Os workflows usam filesystem temporário e doubles de `MongoClient`/`spawn`.
 * Nenhum teste lê `.env`, abre sockets ou executa `mongodump`/`mongorestore`.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import {
    chmod,
    lstat,
    mkdtemp,
    readFile,
    rm,
    writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";
import {
    assertDatabaseToolsEnvironment,
    assertDatabaseToolsWriteAllowed,
    buildRestoreVerificationTarget,
    parseDatabaseToolArguments,
    runDatabaseBackup,
    runDatabaseRestoreVerification,
    runMongoDatabaseTool,
} from "../../scripts/database-tools-safety.js";

const validEnvironment = {
    DATABASE_TOOLS_MONGODB_URI: "mongodb://backup-user:secret@127.0.0.1:27017/?authSource=admin",
    DATABASE_TOOLS_MONGODB_DB_NAME: "faithflix",
    ALLOW_DATABASE_BACKUP: "true",
    ALLOW_DATABASE_RESTORE_VERIFY: "true",
};

const restoreMarkerCollection = "__faithflix_restore_verification_control";

/**
 * Cria e agenda a remoção de uma diretoria temporária por teste.
 *
 * @param {import("node:test").TestContext} context Contexto node:test.
 * @returns {Promise<string>} Diretoria.
 */
async function createTestDirectory(context) {
    const directory = await mkdtemp(join(tmpdir(), "faithflix-db-tools-test-"));
    context.after(() => rm(directory, { force: true, recursive: true }));
    return directory;
}

/**
 * Cria DB read-only mínima para inventários.
 *
 * @param {Array<{ name: string, type: string, documentCount: number }>} inventory Inventário.
 * @returns {object} Double de Db.
 */
function createInventoryDatabase(inventory) {
    return {
        listCollections() {
            return {
                async toArray() {
                    return inventory.map(({ name, type }) => ({ name, type }));
                },
            };
        },
        collection(name) {
            const entry = inventory.find((candidate) => candidate.name === name);
            return {
                async countDocuments() {
                    return entry?.documentCount ?? 0;
                },
            };
        },
    };
}

/**
 * Cria um MongoClient double sobre uma única DB.
 *
 * @param {object} database DB.
 * @returns {{ client: object, state: object }} Cliente e métricas.
 */
function createMongoClientDouble(database) {
    const state = { connected: 0, closed: 0, requestedDatabases: [] };
    return {
        state,
        client: {
            async connect() {
                state.connected += 1;
            },
            db(name) {
                state.requestedDatabases.push(name);
                return database;
            },
            async close() {
                state.closed += 1;
            },
        },
    };
}

/**
 * Devolve um spawn fake que termina com sucesso após executar a callback.
 *
 * @param {(binary: string, args: string[], options: object) => Promise<void> | void} onSpawn Efeito.
 * @returns {Function} Double de spawn.
 */
function createSuccessfulSpawn(onSpawn) {
    return (binary, args, options) => {
        const child = new EventEmitter();
        queueMicrotask(async () => {
            try {
                await onSpawn(binary, args, options);
                child.emit("close", 0, null);
            } catch (error) {
                child.emit("error", error);
            }
        });
        return child;
    };
}

/**
 * Escreve archive/manifest válidos para testes de restore.
 *
 * @param {string} archivePath Caminho.
 * @param {Array<{ name: string, type: string, documentCount: number }>} collections Inventário.
 * @param {Buffer} [content] Conteúdo.
 * @returns {Promise<{ sha256: string, sizeBytes: number }>} Integridade.
 */
async function writeBackupArtifacts(
    archivePath,
    collections,
    content = Buffer.from("synthetic-mongodb-archive"),
) {
    const sha256 = createHash("sha256").update(content).digest("hex");
    await writeFile(archivePath, content, { mode: 0o600 });
    await writeFile(
        `${archivePath}.manifest.json`,
        `${JSON.stringify({
            kind: "faithflix-mongodb-backup",
            schemaVersion: 1,
            database: "faithflix",
            archiveFile: archivePath.split("/").at(-1),
            createdAt: "2026-07-10T12:00:00.000Z",
            sha256,
            sizeBytes: content.length,
            collections,
        }, null, 2)}\n`,
        { mode: 0o600 },
    );
    return { sha256, sizeBytes: content.length };
}

test("F6 database tools exigem URI/DB dedicadas e recusam DBs internas", () => {
    assert.throws(
        () => assertDatabaseToolsEnvironment({
            MONGODB_URI: "mongodb://normal.invalid",
            MONGODB_DB_NAME: "faithflix",
        }),
        (error) => error.code === "DATABASE_TOOLS_ENV_REQUIRED",
    );
    assert.throws(
        () => assertDatabaseToolsEnvironment({
            DATABASE_TOOLS_MONGODB_URI: "mongodb://127.0.0.1:27017",
            DATABASE_TOOLS_MONGODB_DB_NAME: "admin",
        }),
        (error) => error.code === "DATABASE_TOOLS_DATABASE_PROTECTED",
    );
    assert.deepEqual(assertDatabaseToolsEnvironment(validEnvironment), {
        mongoUri: validEnvironment.DATABASE_TOOLS_MONGODB_URI,
        databaseName: "faithflix",
    });
});

test("F6 cada escrita exige opt-in exato e separado", () => {
    assert.throws(
        () => assertDatabaseToolsWriteAllowed("backup", {}),
        (error) => error.code === "DATABASE_TOOLS_WRITE_NOT_ALLOWED",
    );
    assert.throws(
        () => assertDatabaseToolsWriteAllowed("restore", {
            ALLOW_DATABASE_BACKUP: "true",
        }),
        (error) => error.code === "DATABASE_TOOLS_WRITE_NOT_ALLOWED",
    );
    assert.doesNotThrow(() =>
        assertDatabaseToolsWriteAllowed("backup", validEnvironment));
    assert.doesNotThrow(() =>
        assertDatabaseToolsWriteAllowed("restore", validEnvironment));
});

test("F6 CLI aceita apenas archive absoluto e nunca target arbitrário", () => {
    assert.deepEqual(
        parseDatabaseToolArguments(["--archive", "/tmp/faithflix.archive.gz"]),
        { help: false, archivePath: "/tmp/faithflix.archive.gz" },
    );
    assert.deepEqual(parseDatabaseToolArguments(["--help"]), { help: true });
    assert.throws(
        () => parseDatabaseToolArguments(["--archive", "relative.archive.gz"]),
        (error) => error.code === "DATABASE_TOOLS_ARCHIVE_NOT_ABSOLUTE",
    );
    assert.throws(
        () => parseDatabaseToolArguments([
            "--archive",
            "/tmp/faithflix.archive.gz",
            "--target",
            "faithflix",
        ]),
        (error) => error.code === "DATABASE_TOOLS_ARGUMENT_INVALID",
    );
});

test("F6 target de restore é derivado e limitado", () => {
    assert.equal(
        buildRestoreVerificationTarget("faithflix", "aabbccddeeff0011"),
        "faithflix_restore_verify_aabbccddeeff0011",
    );
    assert.throws(
        () => buildRestoreVerificationTarget("faithflix", "manual"),
        (error) => error.code === "DATABASE_TOOLS_RUN_ID_INVALID",
    );
    assert.throws(
        () => buildRestoreVerificationTarget(
            "faithflix_database_name_that_is_far_too_long",
            "aabbccddeeff0011",
        ),
        (error) => error.code === "DATABASE_TOOLS_TARGET_TOO_LONG",
    );
});

test("F6 subprocesso usa shell false e ausência da tool é erro de ambiente", async () => {
    const calls = [];
    const missingSpawn = (binary, args, options) => {
        calls.push({ binary, args, options });
        const child = new EventEmitter();
        queueMicrotask(() => child.emit(
            "error",
            Object.assign(new Error("not found"), { code: "ENOENT" }),
        ));
        return child;
    };

    await assert.rejects(
        () => runMongoDatabaseTool({
            binary: "mongodump",
            args: ["--config=/tmp/private.yml", "--db=faithflix"],
            environment: {
                PATH: "/safe/bin",
                LANG: "pt_PT.UTF-8",
                DATABASE_TOOLS_MONGODB_URI: "mongodb://secret.invalid",
                MONGODB_URI: "mongodb://normal-secret.invalid",
                NODE_OPTIONS: "--require=/tmp/untrusted.js",
            },
            spawnImpl: missingSpawn,
        }),
        (error) => error.code === "DATABASE_TOOL_UNAVAILABLE",
    );
    assert.deepEqual(calls[0].options, {
        env: { LANG: "pt_PT.UTF-8", PATH: "/safe/bin" },
        shell: false,
        stdio: "ignore",
    });
    await assert.rejects(
        () => runMongoDatabaseTool({
            binary: "mongodump",
            args: ["--uri=mongodb://secret.invalid"],
            spawnImpl: missingSpawn,
        }),
        (error) => error.code === "DATABASE_TOOL_SECRET_IN_ARGUMENTS",
    );
});

test("F6 backup publica archive/manifest 0600, checksum e inventário sem URI nos args", async (context) => {
    const directory = await createTestDirectory(context);
    const archivePath = join(directory, "faithflix.archive.gz");
    const inventory = [
        { name: "contents", type: "collection", documentCount: 3 },
        { name: "users", type: "collection", documentCount: 2 },
    ];
    const { client, state } = createMongoClientDouble(
        createInventoryDatabase(inventory),
    );
    const spawnCalls = [];
    const spawn = createSuccessfulSpawn(async (binary, args, options) => {
        spawnCalls.push({ binary, args, options });
        const configPath = args
            .find((argument) => argument.startsWith("--config="))
            .slice("--config=".length);
        const outputPath = args
            .find((argument) => argument.startsWith("--archive="))
            .slice("--archive=".length);
        const configStats = await lstat(configPath);
        const configContents = await readFile(configPath, "utf8");
        assert.equal(configStats.mode & 0o777, 0o600);
        assert.ok(configContents.includes(validEnvironment.DATABASE_TOOLS_MONGODB_URI));
        assert.equal(args.some((argument) => argument.includes("secret")), false);
        await writeFile(outputPath, Buffer.from("fake-mongodump-archive"));
    });

    const result = await runDatabaseBackup({
        archivePath,
        environment: validEnvironment,
        dependencies: {
            mongoClientFactory(uri) {
                assert.equal(uri, validEnvironment.DATABASE_TOOLS_MONGODB_URI);
                return client;
            },
            now: () => new Date("2026-07-10T12:00:00.000Z"),
            spawn,
        },
    });

    const manifest = JSON.parse(await readFile(result.manifestPath, "utf8"));
    assert.equal(spawnCalls.length, 1);
    assert.equal(spawnCalls[0].binary, "mongodump");
    assert.equal(spawnCalls[0].options.shell, false);
    assert.equal(spawnCalls[0].options.stdio, "ignore");
    assert.equal(
        "DATABASE_TOOLS_MONGODB_URI" in spawnCalls[0].options.env,
        false,
    );
    assert.equal("MONGODB_URI" in spawnCalls[0].options.env, false);
    assert.equal(manifest.database, "faithflix");
    assert.deepEqual(manifest.collections, inventory);
    assert.equal(manifest.sha256, result.sha256);
    assert.equal((await lstat(archivePath)).mode & 0o777, 0o600);
    assert.equal((await lstat(result.manifestPath)).mode & 0o777, 0o600);
    assert.deepEqual(state.requestedDatabases, ["faithflix"]);
    assert.equal(state.connected, 1);
    assert.equal(state.closed, 1);

    await assert.rejects(
        () => runDatabaseBackup({
            archivePath,
            environment: validEnvironment,
            dependencies: {
                mongoClientFactory() {
                    throw new Error("não devia ligar");
                },
                spawn() {
                    throw new Error("não devia executar");
                },
            },
        }),
        (error) => error.code === "DATABASE_TOOLS_ARCHIVE_EXISTS",
    );
});

test("F6 backup sem opt-in não cria ficheiros, liga à DB ou inicia tool", async (context) => {
    const directory = await createTestDirectory(context);
    const archivePath = join(directory, "refused.archive.gz");

    await assert.rejects(
        () => runDatabaseBackup({
            archivePath,
            environment: {
                DATABASE_TOOLS_MONGODB_URI: validEnvironment.DATABASE_TOOLS_MONGODB_URI,
                DATABASE_TOOLS_MONGODB_DB_NAME: "faithflix",
            },
            dependencies: {
                mongoClientFactory() {
                    throw new Error("não devia ligar");
                },
                spawn() {
                    throw new Error("não devia executar");
                },
            },
        }),
        (error) => error.code === "DATABASE_TOOLS_WRITE_NOT_ALLOWED",
    );
    await assert.rejects(() => lstat(archivePath), { code: "ENOENT" });
});

/**
 * Cria DB mutável para um restore temporário e respetivo cleanup.
 *
 * @param {object[]} restoredInventory Inventário esperado depois da tool.
 * @param {{ preexisting?: boolean }} [options] Estado inicial.
 * @returns {{ database: object, state: object }} Double e métricas.
 */
function createRestoreDatabase(
    restoredInventory,
    { preexisting = false } = {},
) {
    const state = {
        dropped: 0,
        marker: null,
        restored: false,
    };

    const database = {
        listCollections() {
            return {
                async toArray() {
                    if (preexisting && !state.marker) {
                        return [{ name: "manual", type: "collection" }];
                    }
                    const definitions = state.marker
                        ? [{ name: restoreMarkerCollection, type: "collection" }]
                        : [];
                    if (state.restored) {
                        definitions.push(...restoredInventory.map(({ name, type }) => ({
                            name,
                            type,
                        })));
                    }
                    return definitions;
                },
            };
        },
        collection(name) {
            if (name === restoreMarkerCollection) {
                return {
                    async insertOne(marker) {
                        state.marker = { ...marker };
                        return { acknowledged: true };
                    },
                    async findOne() {
                        return state.marker;
                    },
                    async countDocuments() {
                        return state.marker ? 1 : 0;
                    },
                };
            }
            const entry = restoredInventory.find((candidate) =>
                candidate.name === name);
            return {
                async countDocuments() {
                    return entry?.documentCount ?? 0;
                },
            };
        },
        async dropDatabase() {
            state.dropped += 1;
            state.marker = null;
            state.restored = false;
        },
    };

    return { database, state };
}

test("F6 restore verifica checksum/coleções e elimina apenas target derivado", async (context) => {
    const directory = await createTestDirectory(context);
    const archivePath = join(directory, "faithflix.archive.gz");
    const inventory = [
        { name: "contents", type: "collection", documentCount: 3 },
        { name: "users", type: "collection", documentCount: 2 },
    ];
    await writeBackupArtifacts(archivePath, inventory);
    const { database, state } = createRestoreDatabase(inventory);
    const { client, state: clientState } = createMongoClientDouble(database);
    const spawnCalls = [];
    const spawn = createSuccessfulSpawn(async (binary, args, options) => {
        spawnCalls.push({ binary, args, options });
        const configPath = args
            .find((argument) => argument.startsWith("--config="))
            .slice("--config=".length);
        assert.equal((await lstat(configPath)).mode & 0o777, 0o600);
        assert.equal(args.some((argument) => argument.includes("secret")), false);
        state.restored = true;
    });

    const result = await runDatabaseRestoreVerification({
        archivePath,
        environment: validEnvironment,
        dependencies: {
            mongoClientFactory: () => client,
            now: () => new Date("2026-07-10T12:00:00.000Z"),
            randomRunId: () => "aabbccddeeff0011",
            spawn,
        },
    });

    const target = "faithflix_restore_verify_aabbccddeeff0011";
    assert.equal(result.targetDatabase, target);
    assert.equal(result.verified, true);
    assert.equal(result.cleanedUp, true);
    assert.equal(state.dropped, 1);
    assert.equal(clientState.closed, 1);
    assert.deepEqual(clientState.requestedDatabases, [target]);
    assert.equal(spawnCalls[0].binary, "mongorestore");
    assert.ok(spawnCalls[0].args.includes("--nsFrom=faithflix.*"));
    assert.ok(spawnCalls[0].args.includes(`--nsTo=${target}.*`));
    assert.equal(spawnCalls[0].args.some((argument) => argument.includes("secret")), false);
});

test("F6 tool de restore ausente deixa erro seguro e limpa o target próprio", async (context) => {
    const directory = await createTestDirectory(context);
    const archivePath = join(directory, "faithflix.archive.gz");
    const inventory = [{ name: "users", type: "collection", documentCount: 1 }];
    await writeBackupArtifacts(archivePath, inventory);
    const { database, state } = createRestoreDatabase(inventory);
    const { client, state: clientState } = createMongoClientDouble(database);
    const missingSpawn = () => {
        const child = new EventEmitter();
        queueMicrotask(() => child.emit(
            "error",
            Object.assign(new Error("missing"), { code: "ENOENT" }),
        ));
        return child;
    };

    await assert.rejects(
        () => runDatabaseRestoreVerification({
            archivePath,
            environment: validEnvironment,
            dependencies: {
                mongoClientFactory: () => client,
                randomRunId: () => "1122334455667788",
                spawn: missingSpawn,
            },
        }),
        (error) => error.code === "DATABASE_TOOL_UNAVAILABLE",
    );
    assert.equal(state.dropped, 1);
    assert.equal(clientState.closed, 1);
});

test("F6 checksum inválido falha antes da ligação e target preexistente nunca é apagado", async (context) => {
    const directory = await createTestDirectory(context);
    const archivePath = join(directory, "faithflix.archive.gz");
    const inventory = [{ name: "users", type: "collection", documentCount: 1 }];
    await writeBackupArtifacts(archivePath, inventory);
    await writeFile(archivePath, Buffer.from("tampered-same-size-value"));

    let connections = 0;
    await assert.rejects(
        () => runDatabaseRestoreVerification({
            archivePath,
            environment: validEnvironment,
            dependencies: {
                mongoClientFactory() {
                    connections += 1;
                    throw new Error("não devia ligar");
                },
            },
        }),
        (error) => error.code === "DATABASE_TOOLS_CHECKSUM_MISMATCH",
    );
    assert.equal(connections, 0);

    await writeBackupArtifacts(archivePath, inventory);
    const { database, state } = createRestoreDatabase(inventory, {
        preexisting: true,
    });
    const { client } = createMongoClientDouble(database);
    await assert.rejects(
        () => runDatabaseRestoreVerification({
            archivePath,
            environment: validEnvironment,
            dependencies: {
                mongoClientFactory: () => client,
                randomRunId: () => "ffeeddccbbaa0099",
                spawn() {
                    throw new Error("não devia executar");
                },
            },
        }),
        (error) => error.code === "DATABASE_TOOLS_TARGET_EXISTS",
    );
    assert.equal(state.dropped, 0);
});
