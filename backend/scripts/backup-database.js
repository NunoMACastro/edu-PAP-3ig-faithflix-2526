/**
 * @file CLI local fail-closed para criar um backup MongoDB com manifest.
 */

import {
    DatabaseToolsError,
    parseDatabaseToolArguments,
    runDatabaseBackup,
} from "./database-tools-safety.js";

/**
 * Mostra apenas variáveis e argumentos, nunca valores de configuração.
 *
 * @returns {void}
 */
function printHelp() {
    console.log("Uso: npm run backup:db -- --archive /caminho/absoluto/backup.archive.gz");
    console.log("Exige DATABASE_TOOLS_MONGODB_URI, DATABASE_TOOLS_MONGODB_DB_NAME e ALLOW_DATABASE_BACKUP=true.");
}

/**
 * Executa o backup e apresenta somente o resumo sem segredos.
 *
 * @returns {Promise<void>}
 */
async function main() {
    const args = parseDatabaseToolArguments(process.argv.slice(2));
    if (args.help) {
        printHelp();
        return;
    }

    const result = await runDatabaseBackup({
        archivePath: args.archivePath,
        environment: process.env,
    });
    console.log(JSON.stringify({ operation: "backup", ...result }));
}

try {
    await main();
} catch (error) {
    console.error(
        error instanceof DatabaseToolsError
            ? error.message
            : "O backup falhou; detalhes potencialmente sensíveis foram omitidos.",
    );
    process.exitCode = 1;
}

