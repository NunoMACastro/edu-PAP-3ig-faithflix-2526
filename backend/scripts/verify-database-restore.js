/**
 * @file CLI local para restaurar, verificar e apagar uma DB MongoDB temporária.
 */

import {
    DatabaseToolsError,
    parseDatabaseToolArguments,
    runDatabaseRestoreVerification,
} from "./database-tools-safety.js";

/**
 * Mostra o contrato operacional sem aceitar target arbitrário.
 *
 * @returns {void}
 */
function printHelp() {
    console.log("Uso: npm run restore:verify -- --archive /caminho/absoluto/backup.archive.gz");
    console.log("Exige DATABASE_TOOLS_MONGODB_URI, DATABASE_TOOLS_MONGODB_DB_NAME e ALLOW_DATABASE_RESTORE_VERIFY=true.");
    console.log("O target temporário é gerado internamente e eliminado após a verificação.");
}

/**
 * Executa a verificação e apresenta apenas o resumo seguro.
 *
 * @returns {Promise<void>}
 */
async function main() {
    const args = parseDatabaseToolArguments(process.argv.slice(2));
    if (args.help) {
        printHelp();
        return;
    }

    const result = await runDatabaseRestoreVerification({
        archivePath: args.archivePath,
        environment: process.env,
    });
    console.log(JSON.stringify({ operation: "restore_verify", ...result }));
}

try {
    await main();
} catch (error) {
    console.error(
        error instanceof DatabaseToolsError
            ? error.message
            : "A verificação de restore falhou; detalhes potencialmente sensíveis foram omitidos.",
    );
    process.exitCode = 1;
}

