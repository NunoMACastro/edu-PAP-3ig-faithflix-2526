/**
 * Módulo de serviço para pagamentos simulados e trial gratuito.
 *
 * Centraliza validação, persistência e regras de segurança do checkout de teste.
 * Nunca recebe dados financeiros reais e usa sempre o `userId` autenticado para
 * impedir operações em nome de outro utilizador.
 */
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import {
  activateSubscription,
  grantTrialSubscription,
} from "../subscriptions/subscriptions.service.js";
import { assertCheckoutPayload } from "./payments.validation.js";

/**
 * Converte o identificador de utilizador autenticado para `ObjectId`.
 *
 * @param {string} userId Identificador vindo da sessão.
 * @returns {ObjectId} Identificador pronto para filtros MongoDB.
 * @throws {Error} Quando o identificador não e valido.
 */
function userObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    const error = new Error("Utilizador inválido.");
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(userId);
}

/**
 * Soma dias a uma data sem alterar a instancia original.
 *
 * @param {Date} date Data base.
 * @param {number} days Número de dias a acrescentar.
 * @returns {Date} Nova data calculada.
 */
function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Cria indices usados por tentativas de pagamento e trials.
 *
 * @returns {Promise<void>}
 */
export async function ensurePaymentIndexes() {
  const db = await getDb();
  await db.collection("payment_attempts").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("trials").createIndex({ userId: 1 }, { unique: true });
}

/**
 * Regista uma tentativa de pagamento simulada e ativa a subscrição quando aprovada.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {object} input Payload do checkout simulado.
 * @returns {Promise<object>} Resultado da tentativa e, quando aprovado, subscrição pública.
 * @throws {Error} Quando o plano não existe ou o payload e inválido.
 */
export async function createSimulatedCheckout(userId, input) {
  const db = await getDb();
  const payload = assertCheckoutPayload(input);
  const now = new Date();
  // A tentativa só e gravada depois de confirmar que o plano existe e esta ativo.
  const plan = await db.collection("subscription_plans").findOne({
    code: payload.planCode,
    active: true,
  });

  if (!plan) {
    const error = new Error("Plano não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const attempt = {
    userId: userObjectId(userId),
    planCode: payload.planCode,
    paymentMethod: payload.paymentMethod,
    provider: "faithflix-simulated",
    status: payload.simulateOutcome === "approved" ? "approved" : "failed",
    failureReason: payload.simulateOutcome === "failed" ? "Pagamento simulado recusado." : null,
    createdAt: now,
  };

  const result = await db.collection("payment_attempts").insertOne(attempt);
  if (attempt.status === "failed") {
    // O caminho negativo fica auditável sem criar subscrição nem guardar dados financeiros.
    return { paymentAttemptId: String(result.insertedId), status: "failed", message: attempt.failureReason };
  }

  const subscription = await activateSubscription(userId, payload.planCode);
  return { paymentAttemptId: String(result.insertedId), status: "approved", ...subscription };
}

/**
 * Inicia o trial único de 14 dias para um utilizador elegível.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {Promise<object>} Dados do trial e subscrição temporária.
 * @throws {Error} Quando já existe subscrição paga ativa ou trial utilizado.
 */
export async function startTrial(userId) {
  const db = await getDb();
  const now = new Date();
  const userIdObject = userObjectId(userId);

  // Utilizadores que já pagam não precisam de consumir trial.
  const activePaidSubscription = await db.collection("subscriptions").findOne({
    userId: userIdObject,
    status: "active",
    currentPeriodEnd: { $gt: now },
  });

  if (activePaidSubscription) {
    const error = new Error("Utilizador já tem uma subscrição ativa.");
    error.statusCode = 409;
    throw error;
  }

  const trial = {
    userId: userIdObject,
    status: "active",
    startedAt: now,
    endsAt: addDays(now, 14),
    createdAt: now,
  };

  try {
    // O indice único em `trials.userId` e a garantia contra repeticao do período gratuito.
    await db.collection("trials").insertOne(trial);
  } catch (error) {
    if (error.code === 11000) {
      const alreadyUsed = new Error("Trial já utilizado por este utilizador.");
      alreadyUsed.statusCode = 409;
      throw alreadyUsed;
    }
    throw error;
  }

  const subscription = await grantTrialSubscription(userId, trial.endsAt);

  return {
    trial: { status: trial.status, startedAt: trial.startedAt, endsAt: trial.endsAt },
    ...subscription,
  };
}