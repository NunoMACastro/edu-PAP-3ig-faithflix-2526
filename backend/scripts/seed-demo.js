/**
 * @file Entry point destrutivo, fail-closed e exclusivo da demo FaithFlix.
 *
 * Este ficheiro valida e elimina apenas uma base `_demo` dedicada em Atlas ou
 * replica set loopback antes de importar a configuração normal da aplicação.
 */

import { pathToFileURL } from "node:url";
import { MongoClient } from "mongodb";
import {
    DEMO_FIXTURE_VERSION,
    DEMO_MARKER_COLLECTION,
    DEMO_MARKER_ID,
    assertDemoSeedEnvironment,
    resetOwnedDemoDatabase,
} from "./seed-safety.js";

/**
 * Confirma transações no mesmo cliente destrutivo antes de qualquer drop.
 *
 * @param {MongoClient} client Cliente já ligado ao alvo demo.
 * @returns {Promise<void>} Termina apenas para replica set ou mongos com sessões.
 */
async function assertResetClientTransactionSupport(client) {
    const hello = await client.db("admin").command({ hello: 1, maxTimeMS: 1_000 });
    const supportsSessions = Number.isFinite(
        hello.logicalSessionTimeoutMinutes,
    );
    const supportsTransactions =
        typeof hello.setName === "string" || hello.msg === "isdbgrid";
    if (!supportsSessions || !supportsTransactions) {
        const error = new Error(
            "O alvo demo nao suporta transacoes MongoDB obrigatorias.",
        );
        error.code = "MONGODB_TRANSACTIONS_REQUIRED";
        throw error;
    }
}

/** @param {unknown} error Erro. @param {Record<string,string|undefined>} source Ambiente. @returns {string} Mensagem sem segredos. */
export function safeErrorMessage(error, source = process.env) {
    let message = String(error?.message ?? "Falha desconhecida.")
        .replace(/mongodb(?:\+srv)?:\/\/\S+/giu, "[MONGODB_URI_REDACTED]");
    for (const secret of [source.DEMO_ADMIN_PASSWORD, source.DEMO_USER_PASSWORD]) {
        if (secret) message = message.replaceAll(secret, "[SECRET_REDACTED]");
    }
    return message;
}

/** Carrega o runtime da aplicação apenas depois da validação e do reset seguros. */
async function loadRuntimeModules() {
    const [
        { ensureApplicationIndexes },
        database,
        utils,
        { seedDemoUsers },
        { seedDemoCatalog, cleanupDemoMediaFiles },
        { seedDemoSubscriptions },
        { seedDemoEngagement },
        { seedDemoCharities },
        { seedDemoBiblical },
        { seedDemoOps },
        { generateContentEmbeddings },
        { verifyDemoDataset },
    ] = await Promise.all([
        import("../src/bootstrap/ensure-application-indexes.js"),
        import("../src/config/database.js"),
        import("./demo-seed-utils.js"),
        import("./seed-demo-users.js"),
        import("./seed-demo-catalog.js"),
        import("./seed-demo-subscriptions.js"),
        import("./seed-demo-engagement.js"),
        import("./seed-demo-charities.js"),
        import("./seed-demo-biblical.js"),
        import("./seed-demo-ops.js"),
        import("../src/modules/recommendations/content-embeddings.service.js"),
        import("./demo-seed-verifier.js"),
    ]);
    return {
        ensureApplicationIndexes,
        database,
        utils,
        seedDemoUsers,
        seedDemoCatalog,
        cleanupDemoMediaFiles,
        seedDemoSubscriptions,
        seedDemoEngagement,
        seedDemoCharities,
        seedDemoBiblical,
        seedDemoOps,
        generateContentEmbeddings,
        verifyDemoDataset,
    };
}

/**
 * Executa reset integral, seed e verificação.
 *
 * @param {Record<string, string | undefined>} [source=process.env] Ambiente.
 * @param {{ MongoClientClass?: typeof MongoClient, loadRuntime?: () => Promise<object> }} [overrides] Injeções exclusivas de teste.
 * @returns {Promise<object>} Resumo sanitizado.
 */
export async function runDemoSeed(source = process.env, overrides = {}) {
    const config = assertDemoSeedEnvironment(source);
    const MongoClientClass = overrides.MongoClientClass ?? MongoClient;
    const loadRuntime = overrides.loadRuntime ?? loadRuntimeModules;
    const resetClient = new MongoClientClass(config.mongoUri);
    let resetStarted = false;
    let closeApplicationDatabase;
    let cleanupDemoMediaFiles;
    let demoMediaAssets = [];

    try {
        await resetClient.connect();
        await assertResetClientTransactionSupport(resetClient);
        const resetDb = resetClient.db(config.mongoDbName);
        const ownership = await resetOwnedDemoDatabase(resetDb, config);
        resetStarted = true;

        // `env.js` só é importado dinamicamente depois de o alvo destrutivo ter
        // passado todos os guards. Variáveis já exportadas prevalecem sobre .env.
        process.env.MONGODB_URI = config.mongoUri;
        process.env.MONGODB_DB_NAME = config.mongoDbName;
        process.env.NODE_ENV = "development";

        const {
            ensureApplicationIndexes,
            database,
            utils,
            seedDemoUsers,
            seedDemoCatalog,
            cleanupDemoMediaFiles: cleanupDemoMediaFilesFromRuntime,
            seedDemoSubscriptions,
            seedDemoEngagement,
            seedDemoCharities,
            seedDemoBiblical,
            seedDemoOps,
            generateContentEmbeddings,
            verifyDemoDataset,
        } = await loadRuntime();
        closeApplicationDatabase = database.closeDatabase;
        cleanupDemoMediaFiles = cleanupDemoMediaFilesFromRuntime;
        await database.assertTransactionSupport();
        await ensureApplicationIndexes();
        utils.configureDemoSeedContext(config);
        demoMediaAssets = utils.getDemoContext().mediaAssets ?? [];
        const db = await database.getDb();
        await db.collection(DEMO_MARKER_COLLECTION).insertOne({
            _id: DEMO_MARKER_ID,
            databaseName: config.mongoDbName,
            atlasHost: config.atlasHost,
            targetIdentity: config.targetIdentity,
            targetKind: config.targetKind,
            fixtureVersion: DEMO_FIXTURE_VERSION,
            demoFixture: utils.DEMO_FIXTURE,
            dataSeed: config.dataSeed,
            referenceDate: config.referenceDate,
            status: "seeding",
            adoptedLegacyDatabase: ownership.adopted,
            startedAt: new Date(),
        });

        const summary = {
            users: await seedDemoUsers(),
            catalog: await seedDemoCatalog(),
            subscriptions: await seedDemoSubscriptions(),
            engagement: await seedDemoEngagement(),
            charities: await seedDemoCharities(),
            biblical: await seedDemoBiblical(),
            ops: await seedDemoOps(),
        };
        const embeddingSummary = await generateContentEmbeddings({
            force: true,
            generatedAt: config.referenceDate,
            documentIdFactory: (content) => utils.deterministicId(
                "content-embedding",
                String(content._id),
                config.dataSeed,
            ),
        });
        await db.collection("content_embeddings").updateMany(
            { contentId: { $in: utils.getDemoContext().contentIds } },
            { $set: { demoFixture: utils.DEMO_FIXTURE } },
        );
        summary.embeddings = embeddingSummary;

        const verification = await verifyDemoDataset(db, { allowSeedingMarker: true });
        await db.collection(DEMO_MARKER_COLLECTION).updateOne(
            { _id: DEMO_MARKER_ID, status: "seeding" },
            {
                $set: {
                    status: "complete",
                    completedAt: new Date(),
                    expectedCounts: utils.DEMO_EXPECTED_COUNTS,
                    verifiedCounts: verification.counts,
                },
            },
        );
        return {
            database: config.mongoDbName,
            fixtureVersion: DEMO_FIXTURE_VERSION,
            referenceDate: config.referenceDate.toISOString(),
            reset: true,
            adoptedLegacyDatabase: ownership.adopted,
            summary,
            verification: { verified: true, counts: verification.counts },
        };
    } catch (error) {
        if (resetStarted) {
            let mediaCleanupError;
            try {
                await cleanupDemoMediaFiles?.(demoMediaAssets);
            } catch (cleanupError) {
                mediaCleanupError = cleanupError;
            }
            try {
                await closeApplicationDatabase?.();
                await resetClient.db(config.mongoDbName).dropDatabase();
            } catch (cleanupError) {
                const partial = new Error(
                    `DEMO_PARTIAL_CLEANUP_FAILED: ${safeErrorMessage(error, source)}; a limpeza final também falhou.`,
                    { cause: cleanupError },
                );
                partial.code = "DEMO_PARTIAL_CLEANUP_FAILED";
                throw partial;
            }
            if (mediaCleanupError) {
                const partial = new Error(
                    `DEMO_PARTIAL_CLEANUP_FAILED: ${safeErrorMessage(error, source)}; a limpeza de media privada falhou.`,
                    { cause: mediaCleanupError },
                );
                partial.code = "DEMO_PARTIAL_CLEANUP_FAILED";
                throw partial;
            }
        }
        throw error;
    } finally {
        await closeApplicationDatabase?.();
        await resetClient.close();
    }
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
    try {
        const result = await runDemoSeed();
        console.log(`Seed demo concluído: ${JSON.stringify(result)}`);
    } catch (error) {
        console.error(`Seed demo falhou: ${error.code ?? "DEMO_SEED_FAILED"}: ${safeErrorMessage(error)}`);
        process.exitCode = 1;
    }
}
