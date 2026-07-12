/**
 * @file CLI fail-closed para migrar séries/episódios com mapping revisto.
 *
 * Sem `--apply` executa exclusivamente o diagnóstico. A escrita exige base
 * explícita, opt-in ambiental e confirmação humana redundante.
 */

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
    applySeriesEpisodeMigration,
    assertReviewedSeriesEpisodeMapping,
    inspectSeriesEpisodeMigration,
    preflightSeriesEpisodeMigration,
} from "../src/modules/catalog/series-episodes-migration.js";

/**
 * Interpreta apenas flags fechadas, rejeitando argumentos ambíguos.
 *
 * @param {string[]} argv Argumentos depois de `--`.
 * @returns {{apply: boolean, mappingPath: string, databaseName: string, confirmed: boolean, help: boolean}} Opções seguras.
 */
export function parseSeriesEpisodeMigrationArguments(argv) {
    const options = {
        apply: false,
        mappingPath: "",
        databaseName: "",
        confirmed: false,
        help: false,
    };
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === "--apply") options.apply = true;
        else if (argument === "--dry-run") options.apply = false;
        else if (argument === "--help") options.help = true;
        else if (argument === "--mapping") options.mappingPath = argv[++index] ?? "";
        else if (argument === "--database") options.databaseName = argv[++index] ?? "";
        else if (argument === "--confirm-reviewed-mapping") options.confirmed = true;
        else {
            const error = new Error(`Argumento desconhecido: ${argument}.`);
            error.code = "MIGRATION_ARGUMENT_INVALID";
            throw error;
        }
    }
    return options;
}

/** @returns {void} Mostra instruções sem URI nem credenciais. */
function printHelp() {
    console.log("Uso: npm run migrate:series-episodes -- [--dry-run]");
    console.log("Aplicar: --apply --mapping <json> --database <nome> --confirm-reviewed-mapping");
    console.log("A escrita exige ALLOW_SERIES_EPISODE_MIGRATION=true.");
}

/**
 * Valida todas as autorizações adicionais antes de abrir a base.
 *
 * @param {ReturnType<typeof parseSeriesEpisodeMigrationArguments>} options Opções.
 * @param {NodeJS.ProcessEnv} environment Ambiente.
 * @param {string} configuredDatabase Base normalizada pela configuração.
 * @returns {void}
 */
export function assertSeriesEpisodeApplyAllowed(
    options,
    environment,
    configuredDatabase,
) {
    if (!options.apply) return;
    if (
        !options.mappingPath ||
        !options.databaseName ||
        !options.confirmed ||
        environment.ALLOW_SERIES_EPISODE_MIGRATION !== "true"
    ) {
        const error = new Error("Faltam confirmações explícitas para aplicar a migração.");
        error.code = "MIGRATION_APPLY_NOT_ALLOWED";
        throw error;
    }
    if (
        options.databaseName !== configuredDatabase ||
        environment.MONGODB_DB_NAME !== options.databaseName ||
        !/(?:_demo|_e2e)$/u.test(options.databaseName)
    ) {
        const error = new Error("A base explícita tem de coincidir e terminar em _demo ou _e2e.");
        error.code = "MIGRATION_TARGET_INVALID";
        throw error;
    }
}

/** @returns {Promise<void>} Executa dry-run ou a transação confirmada. */
async function main() {
    const options = parseSeriesEpisodeMigrationArguments(process.argv.slice(2));
    if (options.help) {
        printHelp();
        return;
    }
    const [{ env }, database] = await Promise.all([
        import("../src/config/env.js"),
        import("../src/config/database.js"),
    ]);
    assertSeriesEpisodeApplyAllowed(options, process.env, env.mongoDbName);

    try {
        const db = await database.getDb();
        const before = await inspectSeriesEpisodeMigration(db);
        const mapping = options.mappingPath
            ? assertReviewedSeriesEpisodeMapping(
                  JSON.parse(await readFile(options.mappingPath, "utf8")),
              )
            : null;
        const projectedPlan = mapping
            ? await preflightSeriesEpisodeMigration(db, mapping)
            : null;
        if (!options.apply) {
            console.log(JSON.stringify({
                mode: "dry-run",
                before,
                ...(mapping
                    ? {
                          reviewedBy: mapping.reviewedBy,
                          projected: {
                              episodeCount: projectedPlan.episodes.length,
                              mappedEpisodeCount: mapping.episodes.length,
                              uniquePositionCount:
                                  projectedPlan.finalHierarchy.size,
                              seriesProgressMappingCount:
                                  projectedPlan.progressDestinationBySeries.size,
                          },
                      }
                    : {}),
            }, null, 2));
            return;
        }

        await database.assertTransactionSupport();
        const after = await database.runInTransaction(({ db: txDb, session }) =>
            applySeriesEpisodeMigration(txDb, mapping, { session }),
        );
        console.log(
            JSON.stringify(
                {
                    mode: "apply",
                    reviewedBy: mapping.reviewedBy,
                    before,
                    after,
                },
                null,
                2,
            ),
        );
    } finally {
        await database.closeDatabase();
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        await main();
    } catch (error) {
        const safeMessage =
            String(error?.code ?? "").startsWith("MIGRATION_") ||
            error?.code === "EPISODE_POSITION_CONFLICT"
                ? error.message
                : "A migração falhou sem expor detalhes da ligação.";
        console.error(safeMessage);
        process.exitCode = 1;
    }
}
