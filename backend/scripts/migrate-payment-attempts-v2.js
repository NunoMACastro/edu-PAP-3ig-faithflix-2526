/**
 * @file CLI fail-closed para a migração `payment_attempts` v2.
 *
 * Sem argumentos executa apenas dry-run. A escrita exige simultaneamente
 * `--apply`, `ALLOW_DATA_MIGRATION=true` e `MONGODB_DB_NAME` explícita.
 */

import {
  assertExplicitPaymentMigrationTarget,
  assertPaymentMigrationApplyAllowed,
  migratePaymentAttemptsToV2,
  parsePaymentMigrationArguments,
} from "../src/modules/payments/payment-attempts-v2-migration.js";

/**
 * Mostra apenas instruções operacionais, sem configuração ou segredos.
 *
 * @returns {void}
 */
function printHelp() {
  console.log("Uso: npm run migrate:payment-attempts:v2 -- [--dry-run|--apply]");
  console.log("Sem flags: dry-run. Escrita: --apply e ALLOW_DATA_MIGRATION=true.");
}

/**
 * Executa o CLI com imports de configuração atrasados até os argumentos serem
 * validados. Nenhuma URI é incluída no output.
 *
 * @returns {Promise<void>}
 */
async function main() {
  const mode = parsePaymentMigrationArguments(process.argv.slice(2));
  if (mode.help) {
    printHelp();
    return;
  }

  const [{ env }, database] = await Promise.all([
    import("../src/config/env.js"),
    import("../src/config/database.js"),
  ]);
  assertPaymentMigrationApplyAllowed(mode.apply, process.env);
  assertExplicitPaymentMigrationTarget(
    process.env.MONGODB_DB_NAME,
    env.mongoDbName,
  );

  try {
    const db = await database.getDb();
    const summary = await migratePaymentAttemptsToV2({
      db,
      apply: mode.apply,
      environment: process.env,
    });

    console.log(JSON.stringify({ migration: "payment_attempts_v2", ...summary }));
  } finally {
    await database.closeDatabase();
  }
}

try {
  await main();
} catch (error) {
  const safeMessage = String(error?.code ?? "").startsWith("MIGRATION_")
    ? error.message
    : "A migração falhou; nenhum detalhe de ligação foi apresentado.";
  console.error(safeMessage);
  process.exitCode = 1;
}
