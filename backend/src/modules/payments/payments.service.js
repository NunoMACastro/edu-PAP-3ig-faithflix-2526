/**
 * @file Serviço transacional de checkout simulado e trial FaithFlix.
 *
 * Cada pedido mutável exige uma chave idempotente. A tentativa financeira, a
 * subscrição e a notificação são persistidas na mesma transação MongoDB, pelo
 * que uma falha intermédia não deixa estados parciais.
 */

import { createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import { assertIntegrationEnabled } from "../integrations/integrations.service.js";
import { createNotification } from "../notifications/notifications.service.js";
import { serializeBillingCustomer } from "../subscriptions/billing-customer-lock.service.js";
import {
  activateSubscription,
  entitlementsForPlan,
  grantTrialSubscription,
} from "../subscriptions/subscriptions.service.js";
import {
  assertCheckoutPayload,
  assertIdempotencyKey,
} from "./payments.validation.js";

const PAYMENT_SCHEMA_VERSION = 2;

/**
 * Cria um erro HTTP com código estável para o cliente.
 *
 * @param {string} message Mensagem pública.
 * @param {number} statusCode Estado HTTP.
 * @param {string} code Código de domínio.
 * @returns {Error} Erro compatível com o middleware global.
 */
function httpError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

/**
 * Converte o identificador autenticado para `ObjectId`.
 *
 * @param {string} userId Identificador vindo da sessão.
 * @returns {ObjectId} Identificador validado.
 */
function userObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    throw httpError("Utilizador inválido.", 400, "INVALID_USER");
  }

  return new ObjectId(userId);
}

/**
 * Soma dias sem alterar a instância original.
 *
 * @param {Date} date Data base.
 * @param {number} days Dias a acrescentar.
 * @returns {Date} Nova data.
 */
function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * Produz hash determinístico do pedido normalizado, sem guardar o payload como
 * segredo adicional no ledger de idempotência.
 *
 * @param {string} operation Nome estável da operação.
 * @param {Record<string, unknown>} payload Payload já validado/normalizado.
 * @returns {string} SHA-256 hexadecimal.
 */
function hashRequest(operation, payload) {
  return createHash("sha256")
    .update(JSON.stringify({ operation, payload }))
    .digest("hex");
}

/**
 * Captura os valores financeiros autoritativos do plano no momento da compra.
 *
 * @param {object} plan Plano persistido.
 * @returns {{ amountCents: number, currency: string, solidaritySharePercent: number, interval: string }} Snapshot validado.
 */
function financialSnapshotForPlan(plan) {
  const amountCents = Number(plan.priceCents);
  const currency = String(plan.currency ?? "").trim().toUpperCase();
  const solidaritySharePercent = Number(plan.solidaritySharePercent);
  const interval = String(plan.interval ?? "").trim();
  const valid =
    Number.isInteger(amountCents) &&
    amountCents >= 0 &&
    /^[A-Z]{3}$/.test(currency) &&
    Number.isFinite(solidaritySharePercent) &&
    solidaritySharePercent >= 0 &&
    solidaritySharePercent <= 100 &&
    ["monthly", "yearly"].includes(interval);

  if (!valid) {
    throw httpError(
      "Configuração financeira do plano inválida.",
      500,
      "BILLING_PLAN_INVALID",
    );
  }

  return { amountCents, currency, solidaritySharePercent, interval };
}

/**
 * Resolve repetição idempotente ou rejeita reutilização com outro payload.
 *
 * @param {object} existing Documento persistido.
 * @param {string} requestHash Hash do pedido atual.
 * @returns {object} Resposta original persistida.
 */
function replayExisting(existing, requestHash) {
  if (existing.requestHash !== requestHash) {
    throw httpError(
      "Idempotency-Key já utilizada com outro pedido.",
      409,
      "IDEMPOTENCY_KEY_REUSED",
    );
  }

  if (!existing.response) {
    throw httpError(
      "Pedido idempotente ainda não concluído.",
      409,
      "IDEMPOTENCY_REQUEST_IN_PROGRESS",
    );
  }

  return existing.response;
}

/**
 * Cria o erro fail-closed usado quando não existe política de upgrade/proration.
 *
 * @returns {Error} Conflito estável.
 */
function activeSubscriptionConflict() {
  return httpError(
    "Utilizador já tem uma subscrição paga ativa.",
    409,
    "SUBSCRIPTION_ALREADY_ACTIVE",
  );
}

/**
 * Recusa uma segunda compra paga enquanto não houver produto de upgrade.
 *
 * @param {import("mongodb").Db} db DB transacional.
 * @param {ObjectId} userId Utilizador.
 * @param {Date} now Instante da operação.
 * @param {import("mongodb").ClientSession|undefined} session Sessão.
 * @returns {Promise<void>}
 */
async function assertNoActivePaidSubscription(db, userId, now, session) {
  const active = await db.collection("subscriptions").findOne(
    {
      userId,
      status: "active",
      planCode: { $ne: "trial" },
      currentPeriodEnd: { $gt: now },
    },
    { session },
  );
  if (active) throw activeSubscriptionConflict();
}

/**
 * Cria índices sem alterar nem reconstruir documentos financeiros históricos.
 *
 * A constraint idempotente é parcial: tentativas antigas sem chave continuam
 * imutáveis e não colidem entre si.
 *
 * @returns {Promise<void>} Termina quando os índices existem.
 */
export async function ensurePaymentIndexes() {
  const db = await getDb();

  await db.collection("payment_attempts").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("payment_attempts").createIndex(
    {
      schemaVersion: 1,
      status: 1,
      accountingEstimate: 1,
      approvedAt: 1,
      _id: 1,
    },
    {
      name: "payment_attempts_pool_month_v2",
      partialFilterExpression: {
        schemaVersion: 2,
        status: "approved",
        accountingEstimate: false,
      },
    },
  );
  await db.collection("payment_attempts").createIndex(
    { userId: 1, idempotencyKey: 1 },
    {
      unique: true,
      name: "payment_attempt_idempotency_unique",
      partialFilterExpression: { idempotencyKey: { $type: "string" } },
    },
  );
  await db.collection("trials").createIndex({ userId: 1 }, { unique: true });
  await db.collection("trials").createIndex(
    { userId: 1, idempotencyKey: 1 },
    {
      unique: true,
      name: "trial_idempotency_unique",
      partialFilterExpression: { idempotencyKey: { $type: "string" } },
    },
  );
}

/**
 * Regista checkout simulado e ativa a subscrição de forma atómica.
 *
 * @param {string} userId Identificador autenticado.
 * @param {object} input Dados do checkout simulado.
 * @param {unknown} idempotencyKeyValue Header `Idempotency-Key`.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<object>} Resultado original ou replay idempotente.
 */
export async function createSimulatedCheckout(
  userId,
  input,
  idempotencyKeyValue,
  context = {},
) {
  const payload = assertCheckoutPayload(input);
  const idempotencyKey = assertIdempotencyKey(idempotencyKeyValue);
  const userIdObject = userObjectId(userId);
  const requestHash = hashRequest("simulated-checkout", payload);

  try {
    return await runInTransaction(async ({ db, session }) => {
      const attempts = db.collection("payment_attempts");
      const existing = await attempts.findOne(
        { userId: userIdObject, idempotencyKey },
        { session },
      );

      if (existing) {
        return replayExisting(existing, requestHash);
      }

      // Replays concluídos permanecem disponíveis mesmo quando o simulador
      // é pausado; apenas novas tentativas ficam bloqueadas pelo controlo admin.
      await assertIntegrationEnabled("simulated_payments", { db, session });

      const plan = await db.collection("subscription_plans").findOne(
        { code: payload.planCode, active: true },
        { session },
      );

      if (!plan || entitlementsForPlan(plan).tier === "none") {
        throw httpError("Plano não encontrado.", 404, "PLAN_NOT_FOUND");
      }

      const now = new Date();
      const financialSnapshot = financialSnapshotForPlan(plan);
      const attemptId = new ObjectId();
      const status = payload.simulateOutcome === "approved" ? "approved" : "failed";
      const failureReason = status === "failed" ? "Pagamento recusado." : null;

      await serializeBillingCustomer({
        db,
        userId: userIdObject,
        now,
        session,
      });
      if (status === "approved") {
        await assertNoActivePaidSubscription(
          db,
          userIdObject,
          now,
          session,
        );
      }

      const attempt = {
        _id: attemptId,
        schemaVersion: PAYMENT_SCHEMA_VERSION,
        operation: "simulated-checkout",
        userId: userIdObject,
        planCode: plan.code,
        paymentMethod: payload.paymentMethod,
        provider: "faithflix-simulated",
        status,
        failureReason,
        ...financialSnapshot,
        approvedAt: status === "approved" ? now : null,
        cycle: null,
        accountingEstimate: false,
        idempotencyKey,
        requestHash,
        createdAt: now,
        updatedAt: now,
      };

      await attempts.insertOne(attempt, { session });

      let response;
      let cycle = null;

      if (status === "failed") {
        await createNotification(
          userId,
          {
            type: "payment_failed",
            title: "Pagamento recusado",
            message: "O pagamento foi recusado. Podes tentar novamente.",
          },
          { db, session },
        );

        response = {
          paymentAttemptId: String(attemptId),
          status: "failed",
          message: failureReason,
        };
      } else {
        const subscription = await activateSubscription(userId, plan.code, {
          db,
          session,
          plan,
          now,
        });
        cycle = {
          startsAt: subscription.subscription.currentPeriodStart,
          endsAt: subscription.subscription.currentPeriodEnd,
        };
        response = {
          paymentAttemptId: String(attemptId),
          status: "approved",
          ...subscription,
        };
      }

      const stored = await attempts.updateOne(
        { _id: attemptId },
        { $set: { cycle, response, updatedAt: new Date() } },
        { session },
      );

      if (stored.matchedCount !== undefined && stored.matchedCount !== 1) {
        throw new Error("Falha ao concluir ledger de pagamento.");
      }

      await writeAdminAudit({
        db,
        session,
        actorUserId: userIdObject,
        action: "payment.simulated_checkout",
        targetType: "payment_attempt",
        targetId: attemptId,
        before: null,
        after: {
          status,
          planCode: plan.code,
          amountCents: financialSnapshot.amountCents,
          currency: financialSnapshot.currency,
          solidaritySharePercent: financialSnapshot.solidaritySharePercent,
          cycle,
        },
        requestId: context.requestId,
        operationId: `payment:${attemptId}`,
        metadata: { provider: attempt.provider, simulated: true },
      });

      return response;
    });
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    // Uma corrida pode perder a constraint única no commit. Nesse caso, lê-se
    // o vencedor e aplica-se exatamente a mesma regra de hash.
    const db = await getDb();
    const existing = await db.collection("payment_attempts").findOne({
      userId: userIdObject,
      idempotencyKey,
    });

    if (existing) {
      return replayExisting(existing, requestHash);
    }

    if (payload.simulateOutcome === "approved") {
      const activeSubscription = await db.collection("subscriptions").findOne({
        userId: userIdObject,
        status: "active",
        planCode: { $ne: "trial" },
        currentPeriodEnd: { $gt: new Date() },
      });
      if (activeSubscription) throw activeSubscriptionConflict();
    }

    throw error;
  }
}

/**
 * Inicia o trial único e a respetiva subscrição numa única transação.
 *
 * @param {string} userId Identificador autenticado.
 * @param {unknown} idempotencyKeyValue Header `Idempotency-Key`.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<object>} Resultado original ou replay idempotente.
 */
export async function startTrial(userId, idempotencyKeyValue, context = {}) {
  const idempotencyKey = assertIdempotencyKey(idempotencyKeyValue);
  const userIdObject = userObjectId(userId);
  const requestHash = hashRequest("trial", {});

  try {
    return await runInTransaction(async ({ db, session }) => {
      const trials = db.collection("trials");
      const existing = await trials.findOne({ userId: userIdObject }, { session });

      if (existing) {
        if (existing.idempotencyKey === idempotencyKey) {
          return replayExisting(existing, requestHash);
        }

        throw httpError(
          "Trial já utilizado por este utilizador.",
          409,
          "TRIAL_ALREADY_USED",
        );
      }

      await assertIntegrationEnabled("simulated_payments", { db, session });

      // O ledger e consultado antes de qualquer lock/version bump. Um replay
      // confirmado devolve a resposta original sem produzir efeitos laterais.
      const now = new Date();
      await serializeBillingCustomer({
        db,
        userId: userIdObject,
        now,
        session,
      });

      const activePaidSubscription = await db.collection("subscriptions").findOne(
        {
          userId: userIdObject,
          status: "active",
          planCode: { $ne: "trial" },
          currentPeriodEnd: { $gt: now },
        },
        { session },
      );

      if (activePaidSubscription) {
        throw httpError(
          "Utilizador já tem uma subscrição ativa.",
          409,
          "SUBSCRIPTION_ALREADY_ACTIVE",
        );
      }

      const trialId = new ObjectId();
      const endsAt = addDays(now, 14);
      const trial = {
        _id: trialId,
        userId: userIdObject,
        operation: "trial",
        status: "active",
        startedAt: now,
        endsAt,
        idempotencyKey,
        requestHash,
        createdAt: now,
        updatedAt: now,
      };

      await trials.insertOne(trial, { session });
      const subscription = await grantTrialSubscription(userId, endsAt, {
        db,
        session,
        now,
      });

      await createNotification(
        userId,
        {
          type: "trial_started",
          title: "Trial iniciado",
          message: "O teu trial FaithFlix ficou ativo durante 14 dias.",
        },
        { db, session },
      );

      const response = {
        trial: { status: trial.status, startedAt: trial.startedAt, endsAt: trial.endsAt },
        ...subscription,
      };
      const stored = await trials.updateOne(
        { _id: trialId },
        { $set: { response, updatedAt: new Date() } },
        { session },
      );

      if (stored.matchedCount !== undefined && stored.matchedCount !== 1) {
        throw new Error("Falha ao concluir ledger de trial.");
      }

      await writeAdminAudit({
        db,
        session,
        actorUserId: userIdObject,
        action: "payment.trial_started",
        targetType: "trial",
        targetId: trialId,
        before: null,
        after: {
          status: trial.status,
          startedAt: trial.startedAt,
          endsAt: trial.endsAt,
        },
        requestId: context.requestId,
        operationId: `trial:${trialId}`,
        metadata: { simulated: true },
      });

      return response;
    });
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    const db = await getDb();
    const existing = await db.collection("trials").findOne({ userId: userIdObject });
    if (existing?.idempotencyKey === idempotencyKey) {
      return replayExisting(existing, requestHash);
    }

    throw httpError(
      "Trial já utilizado por este utilizador.",
      409,
      "TRIAL_ALREADY_USED",
    );
  }
}
