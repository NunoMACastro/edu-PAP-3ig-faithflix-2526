/**
 * @file Orquestração idempotente de ciclos de subscrição e pool mensal.
 *
 * Descobre trabalho vencido, reclama um lease Mongo por ciclo e persiste cada
 * renovação/expiração como unidade transacional. O adapter financeiro é apenas
 * uma simulação local determinística; não representa um gateway real.
 */

import { createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { runMonthlyDistribution } from "../charities/pool-distribution.service.js";
import { assertDistributionMonth } from "../charities/pool-distribution.validation.js";
import { assertIntegrationEnabled } from "../integrations/integrations.service.js";
import { createNotification } from "../notifications/notifications.service.js";
import {
  addBillingCycle,
  assertPlanInterval,
} from "../subscriptions/subscriptions.validation.js";
import { entitlementsForPlan } from "../subscriptions/subscriptions.service.js";
import {
  claimScheduledJob,
  completeScheduledJob,
  failScheduledJob,
  registerScheduledJob,
} from "./scheduled-jobs.service.js";
import { decideSimulatedRenewal } from "./renewal-adapter.js";

const PAYMENT_SCHEMA_VERSION = 2;
const MAX_DUE_SUBSCRIPTIONS_PER_CYCLE = 100;
const MAX_DUE_SUBSCRIPTIONS_SCAN = 5_000;
const DEFAULT_LEASE_MS = 5 * 60_000;
const DEFAULT_RETRY_MS = 5 * 60_000;
const MAX_POOL_CATCHUP_MONTHS = 120;

/**
 * Cria um erro operacional com código estável e sem dados internos.
 *
 * @param {string} code Código seguro.
 * @param {string} message Mensagem local.
 * @returns {Error} Erro categorizado.
 */
function operationalError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/**
 * Valida uma data sem aceitar strings ambíguas ou valores inválidos.
 *
 * @param {unknown} value Data bruta.
 * @param {string} code Código de erro.
 * @returns {Date} Cópia válida.
 */
function requiredDate(value, code) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw operationalError(code, "Data de ciclo inválida.");
  }
  return date;
}

/**
 * Produz o mês UTC anterior ao instante indicado.
 *
 * @param {Date} referenceDate Data do worker.
 * @returns {string} Mês `YYYY-MM`.
 */
export function previousUtcMonth(referenceDate) {
  const date = requiredDate(referenceDate, "WORKER_DATE_INVALID");
  const previous = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1),
  );
  return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Converte uma data para a chave mensal UTC.
 *
 * @param {Date} date Data válida.
 * @returns {string} `YYYY-MM`.
 */
function utcMonthKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Enumera meses fechados sem saltar períodos após downtime do worker.
 *
 * @param {string} startMonth Primeiro mês.
 * @param {string} endMonth Último mês.
 * @param {number} [limit=MAX_POOL_CATCHUP_MONTHS] Máximo por lote.
 * @returns {string[]} Sequência inclusiva limitada ao lote.
 */
function enumerateMonths(
  startMonth,
  endMonth,
  limit = MAX_POOL_CATCHUP_MONTHS,
) {
  const [startYear, startNumber] = startMonth.split("-").map(Number);
  const [endYear, endNumber] = endMonth.split("-").map(Number);
  const cursor = new Date(Date.UTC(startYear, startNumber - 1, 1));
  const end = new Date(Date.UTC(endYear, endNumber - 1, 1));
  const months = [];

  while (cursor <= end && months.length < limit) {
    months.push(utcMonthKey(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

/**
 * Avança uma chave mensal UTC exatamente um mês.
 *
 * @param {string} month Chave `YYYY-MM` validada internamente.
 * @returns {string} Mês seguinte.
 */
function nextUtcMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return utcMonthKey(new Date(Date.UTC(year, monthNumber, 1)));
}

/**
 * Descobre meses fechados ainda sem distribuição, incluindo períodos de pausa.
 *
 * @param {{ db?: import("mongodb").Db, referenceDate?: Date }} [input] Contexto.
 * @returns {Promise<string[]>} Meses ordenados por antiguidade.
 */
export async function discoverPendingPoolMonths(input = {}) {
  const db = input.db ?? (await getDb());
  const now = input.referenceDate instanceof Date
    ? new Date(input.referenceDate)
    : new Date();
  if (Number.isNaN(now.getTime())) {
    throw operationalError("WORKER_DATE_INVALID", "Data do worker inválida.");
  }
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const previousMonth = previousUtcMonth(now);
  const earliest = await db.collection("payment_attempts")
    .find({
      schemaVersion: 2,
      status: "approved",
      accountingEstimate: false,
      approvedAt: { $lt: currentMonthStart },
    })
    .sort({ approvedAt: 1, _id: 1 })
    .limit(1)
    .toArray();
  const startMonth = earliest[0]?.approvedAt
    ? utcMonthKey(requiredDate(earliest[0].approvedAt, "PAYMENT_DATE_INVALID"))
    : previousMonth;
  let batchStart = startMonth;

  // Cada ciclo devolve no máximo 120 meses, mas atravessa lotes já fechados.
  // Assim um backlog antigo progride em várias passagens em vez de bloquear
  // permanentemente o worker ao atingir o limite operacional por ciclo.
  while (batchStart <= previousMonth) {
    const candidateMonths = enumerateMonths(batchStart, previousMonth);
    const existing = await db.collection("pool_distributions")
      .find({ month: { $in: candidateMonths } })
      .toArray();
    const closedMonths = new Set(existing.map((row) => row.month));
    const pending = candidateMonths.filter(
      (month) => !closedMonths.has(month),
    );
    if (pending.length > 0) return pending;

    batchStart = nextUtcMonth(candidateMonths.at(-1));
  }

  return [];
}

/**
 * Cria a chave única de um ciclo sem caracteres livres vindos do utilizador.
 *
 * @param {{ _id: ObjectId, currentPeriodEnd: Date|string }} subscription Documento mínimo.
 * @returns {string} Chave aceite pelo ledger de jobs.
 */
export function subscriptionCycleJobKey(subscription) {
  const id = String(subscription?._id ?? "");
  const periodEnd = requiredDate(
    subscription?.currentPeriodEnd,
    "SUBSCRIPTION_PERIOD_INVALID",
  );
  if (!ObjectId.isValid(id)) {
    throw operationalError("SUBSCRIPTION_ID_INVALID", "Subscrição inválida.");
  }
  return `subscription-cycle:${id}:${periodEnd.getTime()}`;
}

/**
 * Valida e captura valores financeiros autoritativos do plano.
 *
 * @param {Record<string, unknown>} plan Plano persistido.
 * @returns {{ amountCents: number, currency: string, solidaritySharePercent: number, interval: "monthly"|"yearly" }} Snapshot.
 */
function financialSnapshot(plan) {
  const amountCents = Number(plan?.priceCents);
  const currency = String(plan?.currency ?? "").trim().toUpperCase();
  const solidaritySharePercent = Number(plan?.solidaritySharePercent);
  const interval = assertPlanInterval(plan?.interval);

  if (
    !Number.isInteger(amountCents) ||
    amountCents < 0 ||
    !/^[A-Z]{3}$/.test(currency) ||
    !Number.isFinite(solidaritySharePercent) ||
    solidaritySharePercent < 0 ||
    solidaritySharePercent > 100
  ) {
    throw operationalError(
      "BILLING_PLAN_INVALID",
      "Configuração financeira do plano inválida.",
    );
  }

  return { amountCents, currency, solidaritySharePercent, interval };
}

/**
 * Gera um hash estável do ciclo sem persistir payload arbitrário.
 *
 * @param {object} input Campos canónicos do ciclo.
 * @returns {string} SHA-256 hexadecimal.
 */
function renewalRequestHash(input) {
  return createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
}

/**
 * Recupera a âncora persistida ou infere-a do início do ciclo legacy.
 *
 * @param {Record<string, unknown>} subscription Subscrição lida na transação.
 * @returns {{ anchorDay: number, anchorEndOfMonth: boolean }} Âncora estável.
 */
function billingAnchorForSubscription(subscription) {
  const periodStart = requiredDate(
    subscription.currentPeriodStart,
    "SUBSCRIPTION_PERIOD_INVALID",
  );
  const periodStartLastDay = new Date(
    Date.UTC(
      periodStart.getUTCFullYear(),
      periodStart.getUTCMonth() + 1,
      0,
    ),
  ).getUTCDate();
  const configuredDay = Number(subscription.billingAnchorDay);
  return {
    anchorDay:
      Number.isInteger(configuredDay) && configuredDay >= 1 && configuredDay <= 31
        ? configuredDay
        : periodStart.getUTCDate(),
    anchorEndOfMonth:
      typeof subscription.billingAnchorEndOfMonth === "boolean"
        ? subscription.billingAnchorEndOfMonth
        : periodStart.getUTCDate() === periodStartLastDay,
  };
}

/**
 * Exige que uma escrita condicional tenha encontrado exatamente o ciclo lido.
 *
 * @param {{ matchedCount?: number }} result Resultado MongoDB.
 * @returns {void}
 */
function assertCycleWrite(result) {
  if (result?.matchedCount !== undefined && result.matchedCount !== 1) {
    throw operationalError(
      "SUBSCRIPTION_CYCLE_CONFLICT",
      "O ciclo da subscrição mudou durante o processamento.",
    );
  }
}

/**
 * Remove lugares do owner quando a subscrição deixa de conceder acesso.
 *
 * @param {import("mongodb").Db} db DB transacional.
 * @param {ObjectId} ownerUserId Owner da família.
 * @param {Date} now Instante do job.
 * @param {string} reason Motivo estável.
 * @param {import("mongodb").ClientSession | undefined} session Sessão.
 * @returns {Promise<void>}
 */
async function closeOwnedFamily(db, ownerUserId, now, reason, session) {
  await db.collection("subscription_family_memberships").updateMany(
    { ownerUserId, status: { $in: ["pending", "active"] } },
    {
      $set: {
        status: "removed",
        removedAt: now,
        removedReason: reason,
        updatedAt: now,
      },
    },
    { session },
  );
}

/**
 * Processa uma única subscrição/ciclo dentro de uma transação.
 *
 * @param {string|ObjectId} subscriptionId Id persistido.
 * @param {Date|string} expectedPeriodEnd Fim usado na chave idempotente.
 * @param {{ referenceDate?: Date }} [options] Relógio injetável.
 * @returns {Promise<{ outcome: string, paymentAttemptId?: string, nextPeriodEnd?: Date }> } Resultado seguro.
 */
export async function processSubscriptionCycle(
  subscriptionId,
  expectedPeriodEnd,
  options = {},
) {
  const id = String(subscriptionId ?? "");
  if (!ObjectId.isValid(id)) {
    throw operationalError("SUBSCRIPTION_ID_INVALID", "Subscrição inválida.");
  }
  const subscriptionObjectId = new ObjectId(id);
  const periodEnd = requiredDate(
    expectedPeriodEnd,
    "SUBSCRIPTION_PERIOD_INVALID",
  );
  const now = options.referenceDate instanceof Date
    ? new Date(options.referenceDate)
    : new Date();
  if (Number.isNaN(now.getTime())) {
    throw operationalError("WORKER_DATE_INVALID", "Data do worker inválida.");
  }

  if (periodEnd > now) {
    return { outcome: "not_due" };
  }

  return runInTransaction(async ({ db, session }) => {
    const subscriptions = db.collection("subscriptions");
    const subscription = await subscriptions.findOne(
      { _id: subscriptionObjectId },
      { session },
    );

    if (
      !subscription ||
      !["active", "trialing"].includes(subscription.status) ||
      requiredDate(
        subscription.currentPeriodEnd,
        "SUBSCRIPTION_PERIOD_INVALID",
      ).getTime() !== periodEnd.getTime()
    ) {
      return { outcome: "already_processed" };
    }

    const userIdValue = String(subscription.userId ?? "");
    if (!ObjectId.isValid(userIdValue)) {
      throw operationalError(
        "SUBSCRIPTION_USER_INVALID",
        "Dono da subscrição inválido.",
      );
    }
    const userId = new ObjectId(userIdValue);
    const exactCycleFilter = {
      _id: subscriptionObjectId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };

    if (subscription.status === "trialing" || subscription.planCode === "trial") {
      const result = await subscriptions.updateOne(
        exactCycleFilter,
        { $set: { status: "expired", updatedAt: now } },
        { session },
      );
      assertCycleWrite(result);
      await db.collection("trials").updateMany(
        { userId, status: "active", endsAt: { $lte: now } },
        { $set: { status: "expired", updatedAt: now } },
        { session },
      );
      return { outcome: "trial_expired" };
    }

    if (subscription.cancelAtPeriodEnd === true) {
      const result = await subscriptions.updateOne(
        exactCycleFilter,
        { $set: { status: "canceled", updatedAt: now } },
        { session },
      );
      assertCycleWrite(result);
      await closeOwnedFamily(
        db,
        userId,
        now,
        "owner_subscription_canceled",
        session,
      );
      return { outcome: "subscription_canceled" };
    }

    const plan = await db.collection("subscription_plans").findOne(
      { code: subscription.planCode, active: true },
      { session },
    );
    if (!plan || entitlementsForPlan(plan).tier === "none") {
      throw operationalError(
        "RENEWAL_PLAN_INVALID",
        "Plano da renovação inexistente ou incompleto.",
      );
    }

    const snapshot = financialSnapshot(plan);
    const decision = decideSimulatedRenewal({ subscription, plan });
    const billingAnchor = billingAnchorForSubscription(subscription);
    const idempotencyKey = `renewal:${id}:${periodEnd.getTime()}`;
    const requestHash = renewalRequestHash({
      operation: "simulated-renewal",
      subscriptionId: id,
      planCode: plan.code,
      periodEnd: periodEnd.toISOString(),
    });
    const attempts = db.collection("payment_attempts");
    const existingAttempt = await attempts.findOne(
      { userId, idempotencyKey },
      { session },
    );
    if (existingAttempt) {
      if (existingAttempt.requestHash !== requestHash) {
        throw operationalError(
          "RENEWAL_IDEMPOTENCY_CONFLICT",
          "A chave do ciclo já foi usada com outros dados.",
        );
      }
      throw operationalError(
        "RENEWAL_PARTIAL_STATE_DETECTED",
        "Existe ledger sem avanço atómico da subscrição.",
      );
    }

    // Uma pausa administrativa não cria tentativa recusada nem marca o
    // subscritor como past_due. O job pode ser repetido quando o simulador
    // voltar a estar ativo, mantendo trial/cancelamento independentes do gate.
    await assertIntegrationEnabled("simulated_payments", { db, session });

    const attemptId = new ObjectId();
    const nextPeriodEnd =
      decision.status === "approved"
        ? addBillingCycle(periodEnd, snapshot.interval, billingAnchor)
        : null;
    const response =
      decision.status === "approved"
        ? {
            status: "approved",
            renewal: {
              subscriptionId: id,
              currentPeriodStart: periodEnd,
              currentPeriodEnd: nextPeriodEnd,
            },
          }
        : {
            status: "failed",
            message: decision.failureReason,
          };
    const attempt = {
      _id: attemptId,
      schemaVersion: PAYMENT_SCHEMA_VERSION,
      operation: "simulated-renewal",
      userId,
      planCode: plan.code,
      paymentMethod: "renewal_simulated",
      provider: decision.provider,
      status: decision.status,
      failureReason: decision.failureReason,
      amountCents: snapshot.amountCents,
      currency: snapshot.currency,
      solidaritySharePercent: snapshot.solidaritySharePercent,
      interval: snapshot.interval,
      approvedAt: decision.status === "approved" ? now : null,
      cycle: {
        startsAt: periodEnd,
        endsAt: nextPeriodEnd,
      },
      accountingEstimate: false,
      idempotencyKey,
      requestHash,
      response,
      createdAt: now,
      updatedAt: now,
    };
    await attempts.insertOne(attempt, { session });

    if (decision.status === "failed") {
      const result = await subscriptions.updateOne(
        exactCycleFilter,
        { $set: { status: "past_due", updatedAt: now } },
        { session },
      );
      assertCycleWrite(result);
      await closeOwnedFamily(
        db,
        userId,
        now,
        "owner_subscription_past_due",
        session,
      );
      await createNotification(
        String(userId),
        {
          type: "payment_failed",
          title: "Renovação recusada",
          message: "A renovação foi recusada e o acesso ficou suspenso.",
          dedupeKey: idempotencyKey,
        },
        { db, session },
      );
      return { outcome: "renewal_failed", paymentAttemptId: String(attemptId) };
    }

    const result = await subscriptions.updateOne(
      exactCycleFilter,
      {
        $set: {
          status: "active",
          currentPeriodStart: periodEnd,
          currentPeriodEnd: nextPeriodEnd,
          billingAnchorDay: billingAnchor.anchorDay,
          billingAnchorEndOfMonth: billingAnchor.anchorEndOfMonth,
          updatedAt: now,
        },
      },
      { session },
    );
    assertCycleWrite(result);
    await createNotification(
      String(userId),
      {
        type: "subscription_activated",
        title: "Subscrição renovada",
        message: "A renovação ficou concluída para o novo ciclo.",
        dedupeKey: idempotencyKey,
      },
      { db, session },
    );

    return {
      outcome: "renewed",
      paymentAttemptId: String(attemptId),
      nextPeriodEnd,
    };
  });
}

/**
 * Descobre e executa jobs vencidos de subscrição com lease por ciclo.
 *
 * @param {{ ownerId: string, referenceDate?: Date, leaseMs?: number, retryMs?: number, limit?: number }} input Contexto do worker.
 * @returns {Promise<{ discovered: number, claimed: number, completed: number, failed: number, outcomes: string[] }>} Resumo.
 */
export async function runDueSubscriptionJobs(input) {
  const db = await getDb();
  const now = input.referenceDate instanceof Date
    ? new Date(input.referenceDate)
    : new Date();
  if (Number.isNaN(now.getTime())) {
    throw operationalError("WORKER_DATE_INVALID", "Data do worker inválida.");
  }
  const limit = Math.min(
    Math.max(Number(input.limit) || MAX_DUE_SUBSCRIPTIONS_PER_CYCLE, 1),
    MAX_DUE_SUBSCRIPTIONS_PER_CYCLE,
  );
  const scanLimit = Math.min(
    Math.max(Number(input.scanLimit) || Math.max(limit * 10, 1_000), limit),
    MAX_DUE_SUBSCRIPTIONS_SCAN,
  );
  const dueSubscriptions = await db.collection("subscriptions")
    .find({
      status: { $in: ["active", "trialing"] },
      currentPeriodEnd: { $lte: now },
    })
    .sort({ currentPeriodEnd: 1, _id: 1 })
    .limit(scanLimit)
    .toArray();
  const summary = {
    discovered: dueSubscriptions.length,
    claimed: 0,
    completed: 0,
    failed: 0,
    outcomes: [],
    scanTruncated: dueSubscriptions.length === scanLimit,
  };

  for (const subscription of dueSubscriptions) {
    if (summary.claimed >= limit) break;
    let key;
    let claimed;
    try {
      key = subscriptionCycleJobKey(subscription);
      await registerScheduledJob({
        key,
        type: "subscription_cycle",
        nextRunAt: requiredDate(
          subscription.currentPeriodEnd,
          "SUBSCRIPTION_PERIOD_INVALID",
        ),
        db,
      });
      claimed = await claimScheduledJob({
        key,
        ownerId: input.ownerId,
        leaseMs: input.leaseMs ?? DEFAULT_LEASE_MS,
        now,
        db,
      });
    } catch {
      summary.failed += 1;
      summary.outcomes.push("discovery_failed");
      continue;
    }
    if (!claimed) continue;
    summary.claimed += 1;

    try {
      const result = await processSubscriptionCycle(
        String(subscription._id),
        subscription.currentPeriodEnd,
        { referenceDate: now },
      );
      const completed = await completeScheduledJob({
        key,
        ownerId: input.ownerId,
        terminal: true,
        now,
        db,
      });
      if (!completed) {
        throw operationalError("JOB_LEASE_LOST", "O lease terminou antes do commit.");
      }
      summary.completed += 1;
      summary.outcomes.push(result.outcome);
    } catch (error) {
      summary.failed += 1;
      await failScheduledJob({
        key,
        ownerId: input.ownerId,
        retryAt: new Date(now.getTime() + (input.retryMs ?? DEFAULT_RETRY_MS)),
        errorCode: error?.code ?? "SUBSCRIPTION_JOB_FAILED",
        now,
        db,
      });
    }
  }

  return summary;
}

/**
 * Executa, no máximo uma vez, o fecho do mês UTC anterior.
 *
 * @param {{ ownerId: string, referenceDate?: Date, leaseMs?: number, retryMs?: number }} input Contexto do worker.
 * @returns {Promise<{ month: string, claimed: boolean, completed: boolean, replayed?: boolean, failed?: boolean }>} Resumo.
 */
export async function runMonthlyPoolJob(input) {
  const db = await getDb();
  const now = input.referenceDate instanceof Date
    ? new Date(input.referenceDate)
    : new Date();
  if (Number.isNaN(now.getTime())) {
    throw operationalError("WORKER_DATE_INVALID", "Data do worker inválida.");
  }
  const month = input.month
    ? assertDistributionMonth(input.month)
    : previousUtcMonth(now);
  const key = `pool:${month}`;
  const [year, monthNumber] = month.split("-").map(Number);
  const firstDayAfterTargetMonth = new Date(
    Date.UTC(year, monthNumber, 1),
  );
  await registerScheduledJob({
    key,
    type: "monthly_pool",
    nextRunAt: firstDayAfterTargetMonth,
    db,
  });
  const claimed = await claimScheduledJob({
    key,
    ownerId: input.ownerId,
    leaseMs: input.leaseMs ?? DEFAULT_LEASE_MS,
    now,
    db,
  });
  if (!claimed) {
    return { month, claimed: false, completed: false };
  }

  try {
    const result = await runMonthlyDistribution(month, null, {
      referenceDate: now,
      trigger: "worker",
    });
    const completed = await completeScheduledJob({
      key,
      ownerId: input.ownerId,
      terminal: true,
      now,
      db,
    });
    if (!completed) {
      throw operationalError("JOB_LEASE_LOST", "O lease mensal terminou antes do commit.");
    }
    return {
      month,
      claimed: true,
      completed: true,
      replayed: result.distribution.replayed,
    };
  } catch (error) {
    await failScheduledJob({
      key,
      ownerId: input.ownerId,
      retryAt: new Date(now.getTime() + (input.retryMs ?? DEFAULT_RETRY_MS)),
      errorCode: error?.code ?? "MONTHLY_POOL_JOB_FAILED",
      now,
      db,
    });
    return { month, claimed: true, completed: false, failed: true };
  }
}

/**
 * Fecha sequencialmente todos os meses pendentes dentro do limite local.
 *
 * @param {{ ownerId: string, referenceDate?: Date, leaseMs?: number, retryMs?: number }} input Contexto.
 * @returns {Promise<{ months: string[], jobs: object[], completed: number, failed: number }>} Resumo.
 */
export async function runPendingMonthlyPoolJobs(input) {
  const db = await getDb();
  const months = await discoverPendingPoolMonths({
    db,
    referenceDate: input.referenceDate,
  });
  const jobs = [];

  for (const month of months) {
    jobs.push(await runMonthlyPoolJob({ ...input, month }));
  }

  return {
    months,
    jobs,
    completed: jobs.filter((job) => job.completed).length,
    failed: jobs.filter((job) => job.failed).length,
  };
}

/**
 * Executa uma passagem do worker, mantendo os dois domínios observáveis.
 *
 * @param {{ ownerId: string, referenceDate?: Date, leaseMs?: number, retryMs?: number, limit?: number }} input Contexto.
 * @returns {Promise<{ subscriptions: object, pool: object }>} Resumo da passagem.
 */
export async function runBillingWorkerCycle(input) {
  const [subscriptions, pool] = await Promise.all([
    runDueSubscriptionJobs(input),
    runPendingMonthlyPoolJobs(input),
  ]);
  return { subscriptions, pool };
}
