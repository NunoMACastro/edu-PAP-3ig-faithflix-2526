/**
 * @file Migração idempotente de tentativas de pagamento históricas para v2.
 *
 * O módulo não abre ligações nem lê configuração. Recebe uma DB por injeção,
 * permitindo dry-run e testes in-memory sem tocar na base configurada.
 */

const MIGRATION_NAME = "payment_attempts_v2";
const TARGET_SCHEMA_VERSION = 2;
const PROTECTED_DATABASE_NAMES = new Set(["admin", "config", "local"]);

/**
 * Cria um erro seguro e identificável pelo CLI.
 *
 * @param {string} message Mensagem sem URI nem credenciais.
 * @param {string} code Código estável.
 * @returns {Error} Erro de migração.
 */
function migrationError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/**
 * Interpreta argumentos sem aceitar flags implícitas ou desconhecidas.
 *
 * @param {string[]} argv Argumentos depois do nome do script.
 * @returns {{ apply: boolean, help: boolean }} Modo solicitado.
 */
export function parsePaymentMigrationArguments(argv = []) {
  const allowed = new Set(["--apply", "--dry-run", "--help"]);
  const unknown = argv.filter((argument) => !allowed.has(argument));

  if (unknown.length > 0) {
    throw migrationError(
      `Argumento de migração desconhecido: ${unknown[0]}.`,
      "MIGRATION_ARGUMENT_INVALID",
    );
  }

  if (argv.includes("--apply") && argv.includes("--dry-run")) {
    throw migrationError(
      "Usa apenas --apply ou --dry-run, nunca ambos.",
      "MIGRATION_MODE_CONFLICT",
    );
  }

  return {
    apply: argv.includes("--apply"),
    help: argv.includes("--help"),
  };
}

/**
 * Exige opt-in explícito antes de qualquer write.
 *
 * @param {boolean} apply Indica se a execução pretende persistir.
 * @param {Record<string, string | undefined>} environment Ambiente efetivo.
 * @returns {void}
 */
export function assertPaymentMigrationApplyAllowed(apply, environment = {}) {
  if (apply && environment.ALLOW_DATA_MIGRATION !== "true") {
    throw migrationError(
      "--apply exige ALLOW_DATA_MIGRATION=true.",
      "MIGRATION_APPLY_NOT_ALLOWED",
    );
  }
}

/**
 * Impede que o CLI use uma base implícita ou uma base interna MongoDB.
 *
 * @param {string | undefined} configuredName Nome definido em `MONGODB_DB_NAME`.
 * @param {string | undefined} resolvedName Nome resolvido pela configuração da app.
 * @returns {string} Nome explícito validado.
 */
export function assertExplicitPaymentMigrationTarget(configuredName, resolvedName) {
  const explicitName = configuredName?.trim();
  const effectiveName = resolvedName?.trim();

  if (!explicitName || explicitName !== effectiveName) {
    throw migrationError(
      "MONGODB_DB_NAME tem de identificar explicitamente a base alvo.",
      "MIGRATION_DATABASE_NOT_EXPLICIT",
    );
  }

  if (PROTECTED_DATABASE_NAMES.has(explicitName.toLowerCase())) {
    throw migrationError(
      "A migração recusa bases internas do MongoDB.",
      "MIGRATION_DATABASE_PROTECTED",
    );
  }

  return explicitName;
}

/**
 * Normaliza uma data válida sem inventar valores.
 *
 * @param {unknown} value Valor histórico.
 * @returns {Date|null} Data válida ou null.
 */
function asDate(value) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? new Date(value) : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Preserva uma moeda ISO-like válida.
 *
 * @param {unknown} value Valor bruto.
 * @returns {string|null} Código normalizado ou null.
 */
function asCurrency(value) {
  const currency = typeof value === "string" ? value.trim().toUpperCase() : "";
  return /^[A-Z]{3}$/.test(currency) ? currency : null;
}

/**
 * Preserva um ciclo apenas quando ambos os limites são demonstráveis.
 *
 * @param {unknown} value Ciclo histórico.
 * @returns {{ startsAt: Date, endsAt: Date }|null} Ciclo válido ou null.
 */
function asCycle(value) {
  if (!value || typeof value !== "object") return null;
  const startsAt = asDate(value.startsAt);
  const endsAt = asDate(value.endsAt);
  if (!startsAt || !endsAt || endsAt <= startsAt) return null;
  return { startsAt, endsAt };
}

/**
 * Escolhe um valor histórico comprovado ou uma estimativa do plano atual.
 *
 * @param {unknown} historical Valor do documento legacy.
 * @param {unknown} planValue Valor do plano atual.
 * @param {(value: unknown) => boolean} isValid Validador.
 * @param {string} field Campo contabilístico.
 * @param {string[]} estimatedFields Campos estimados.
 * @param {string[]} unknownFields Campos impossíveis de provar.
 * @returns {unknown|null} Valor preservado, estimado ou null.
 */
function historicalOrEstimated(
  historical,
  planValue,
  isValid,
  field,
  estimatedFields,
  unknownFields,
) {
  if (isValid(historical)) return historical;
  if (isValid(planValue)) {
    estimatedFields.push(field);
    return planValue;
  }
  unknownFields.push(field);
  return null;
}

/**
 * Constrói apenas o `$set` da migração, sem mutar o documento de entrada.
 *
 * Todos os documentos migrados ficam `accountingEstimate:true`: a versão
 * histórica não continha proveniência suficiente para afirmar que o snapshot
 * financeiro representa o valor efetivamente cobrado no passado.
 *
 * @param {object} attempt Tentativa legacy.
 * @param {object|null} currentPlan Plano atual com o mesmo `planCode`, se existir.
 * @param {Date} migratedAt Timestamp determinístico/injetável.
 * @returns {object} Patch v2 explícito.
 */
export function buildPaymentAttemptV2MigrationPatch(
  attempt,
  currentPlan,
  migratedAt = new Date(),
) {
  const estimatedFields = [];
  const unknownFields = [];
  const amountCents = historicalOrEstimated(
    attempt.amountCents,
    currentPlan?.priceCents,
    (value) => Number.isInteger(value) && value >= 0,
    "amountCents",
    estimatedFields,
    unknownFields,
  );
  const currency = historicalOrEstimated(
    asCurrency(attempt.currency),
    asCurrency(currentPlan?.currency),
    (value) => typeof value === "string",
    "currency",
    estimatedFields,
    unknownFields,
  );
  const solidaritySharePercent = historicalOrEstimated(
    attempt.solidaritySharePercent,
    currentPlan?.solidaritySharePercent,
    (value) => Number.isFinite(value) && value >= 0 && value <= 100,
    "solidaritySharePercent",
    estimatedFields,
    unknownFields,
  );
  const interval = historicalOrEstimated(
    attempt.interval,
    currentPlan?.interval,
    (value) => ["monthly", "yearly"].includes(value),
    "interval",
    estimatedFields,
    unknownFields,
  );
  const createdAt = asDate(attempt.createdAt);
  let approvedAt = asDate(attempt.approvedAt);

  if (attempt.status === "approved" && !approvedAt) {
    if (createdAt) {
      approvedAt = createdAt;
      estimatedFields.push("approvedAt");
    } else {
      unknownFields.push("approvedAt");
    }
  }

  if (attempt.status !== "approved") approvedAt = null;

  const cycle = asCycle(attempt.cycle);
  if (!cycle) unknownFields.push("cycle");
  const idempotencyKey =
    typeof attempt.idempotencyKey === "string" && attempt.idempotencyKey.trim()
      ? attempt.idempotencyKey.trim()
      : null;
  const requestHash =
    typeof attempt.requestHash === "string" && /^[a-f0-9]{64}$/i.test(attempt.requestHash)
      ? attempt.requestHash.toLowerCase()
      : null;

  if (!idempotencyKey) unknownFields.push("idempotencyKey");
  if (!requestHash) unknownFields.push("requestHash");

  return {
    schemaVersion: TARGET_SCHEMA_VERSION,
    operation: attempt.operation ?? "historical-migration",
    provider: attempt.provider ?? "legacy-unknown",
    status: attempt.status,
    failureReason: attempt.failureReason ?? null,
    amountCents,
    currency,
    solidaritySharePercent,
    interval,
    approvedAt,
    cycle,
    idempotencyKey,
    requestHash,
    response: attempt.response ?? null,
    accountingEstimate: true,
    accountingEstimateSource: currentPlan
      ? "legacy_document_and_current_plan"
      : "legacy_document_only",
    accountingEstimateFields: [...new Set(estimatedFields)],
    accountingUnknownFields: [...new Set(unknownFields)],
    migration: {
      name: MIGRATION_NAME,
      version: 1,
      migratedAt: new Date(migratedAt),
    },
    updatedAt: new Date(migratedAt),
  };
}

/**
 * Planeia ou aplica a migração de forma retomável e idempotente.
 *
 * O filtro do update repete `schemaVersion != 2`, protegendo documentos que
 * tenham sido atualizados por outra execução depois da leitura. A função nunca
 * consulta nem altera `pool_distributions`.
 *
 * @param {{ db: import("mongodb").Db, apply?: boolean, environment?: Record<string, string|undefined>, now?: Date }} options Opções injetáveis.
 * @returns {Promise<{ mode: string, scanned: number, wouldUpdate: number, updated: number, skippedDueToRace: number, estimated: number, withoutPlan: number }>} Resumo sem dados pessoais.
 */
export async function migratePaymentAttemptsToV2({
  db,
  apply = false,
  environment = {},
  now = new Date(),
}) {
  assertPaymentMigrationApplyAllowed(apply, environment);

  if (!db || typeof db.collection !== "function") {
    throw migrationError(
      "A migração exige uma base de dados injetada.",
      "MIGRATION_DATABASE_REQUIRED",
    );
  }

  const attempts = db.collection("payment_attempts");
  const plans = db.collection("subscription_plans");
  const cursor = attempts
    .find({ schemaVersion: { $ne: TARGET_SCHEMA_VERSION } })
    .sort({ _id: 1 });
  const planCache = new Map();
  const summary = {
    mode: apply ? "apply" : "dry-run",
    scanned: 0,
    wouldUpdate: 0,
    updated: 0,
    skippedDueToRace: 0,
    estimated: 0,
    withoutPlan: 0,
  };

  for await (const attempt of cursor) {
    summary.scanned += 1;
    summary.wouldUpdate += 1;
    const planCode = typeof attempt.planCode === "string" ? attempt.planCode : "";

    if (!planCache.has(planCode)) {
      planCache.set(
        planCode,
        planCode ? await plans.findOne({ code: planCode }) : null,
      );
    }

    const currentPlan = planCache.get(planCode);
    if (!currentPlan) summary.withoutPlan += 1;
    const patch = buildPaymentAttemptV2MigrationPatch(attempt, currentPlan, now);
    if (patch.accountingEstimate) summary.estimated += 1;

    if (!apply) continue;

    const result = await attempts.updateOne(
      { _id: attempt._id, schemaVersion: { $ne: TARGET_SCHEMA_VERSION } },
      { $set: patch },
    );

    if ((result.modifiedCount ?? 0) === 1) {
      summary.updated += 1;
    } else {
      summary.skippedDueToRace += 1;
    }
  }

  return summary;
}
