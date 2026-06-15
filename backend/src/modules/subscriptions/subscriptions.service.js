/**
 * Gere planos, subscrições e acesso premium da MF4.
 *
 * O service usa sempre `userId` vindo da sessão segura e nunca aceita
 * ownership vindo do frontend. Também centraliza datas de ciclo para que
 * pagamentos simulados e guards de playback usem a mesma regra.
 */
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { createNotification } from "../notifications/notifications.service.js";
import {
  addBillingCycle,
  assertPlanInterval,
  isBlockingStatus,
} from "./subscriptions.validation.js";

const DEFAULT_PLANS = [
  {
    code: "faithflix-monthly",
    name: "FaithFlix Mensal",
    interval: "monthly",
    priceCents: 799,
    currency: "EUR",
    solidaritySharePercent: 20,
    active: true,
  },
  {
    code: "faithflix-yearly",
    name: "FaithFlix Anual",
    interval: "yearly",
    priceCents: 7990,
    currency: "EUR",
    solidaritySharePercent: 20,
    active: true,
  },
];

/**
 * Converte um identificador de utilizador em ObjectId seguro.
 *
 * @param {string} userId - Identificador vindo de `req.user.id`.
 * @returns {ObjectId} ObjectId usado nas queries MongoDB.
 * @throws {Error} Quando o identificador não tem formato de ObjectId.
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
 * Remove campos internos de um plano antes de o expor ao frontend.
 *
 * @param {object} plan - Documento MongoDB de `subscription_plans`.
 * @returns {object} Plano público sem `_id` bruto nem campos internos.
 */
function publicPlan(plan) {
  return {
    id: String(plan._id),
    code: plan.code,
    name: plan.name,
    interval: plan.interval,
    priceCents: plan.priceCents,
    currency: plan.currency,
    solidaritySharePercent: plan.solidaritySharePercent,
  };
}

/**
 * Converte uma subscrição em payload seguro para UI/API.
 *
 * @param {object|null} subscription - Documento MongoDB de `subscriptions`.
 * @param {object|undefined} plan - Plano associado, quando existir.
 * @returns {object} Estado público da subscrição e acesso premium.
 */
function publicSubscription(subscription, plan = undefined) {
  if (!subscription) {
    return { status: "none", hasPremiumAccess: false };
  }

  return {
    id: String(subscription._id),
    status: subscription.status,
    planCode: subscription.planCode,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    hasPremiumAccess: hasSubscriptionAccess(subscription),
    plan: plan ? publicPlan(plan) : undefined,
  };
}

/**
 * Calcula se uma subscrição ainda autoriza acesso premium.
 *
 * @param {object|null} subscription - Documento de subscrição.
 * @param {Date} referenceDate - Data usada para testes e verificacao real.
 * @returns {boolean} `true` apenas quando o estado e a data permitem acesso.
 */
function hasSubscriptionAccess(subscription, referenceDate = new Date()) {
  if (!subscription || isBlockingStatus(subscription.status)) {
    return false;
  }

  const periodEnd = new Date(subscription.currentPeriodEnd);
  if (Number.isNaN(periodEnd.getTime())) {
    return false;
  }

  return periodEnd > referenceDate;
}

/**
 * Cria indices e planos base usados pela MF4.
 *
 * @returns {Promise<void>} Termina quando indices e seed de planos ficam prontos.
 */
export async function ensureSubscriptionIndexes() {
  const db = await getDb();
  await db.collection("subscription_plans").createIndex({ code: 1 }, { unique: true });
  await db.collection("subscriptions").createIndex({ userId: 1 }, { unique: true });
  await db.collection("subscriptions").createIndex({ status: 1, currentPeriodEnd: 1 });

  for (const plan of DEFAULT_PLANS) {
    // O upsert torna o seed idempotente: correr o servidor duas vezes não duplica planos.
    await db.collection("subscription_plans").updateOne(
      { code: plan.code },
      { $set: { ...plan, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true },
    );
  }
}

/**
 * Lista planos ativos disponíveis para escolha.
 *
 * @returns {Promise<{plans: object[]}>} Planos públicos ordenados por preço.
 */
export async function listPlans() {
  const db = await getDb();
  const plans = await db.collection("subscription_plans").find({ active: true }).sort({ priceCents: 1 }).toArray();
  return { plans: plans.map(publicPlan) };
}

/**
 * Ativa ou substitui a subscrição paga do utilizador autenticado.
 *
 * @param {string} userId - Identificador vindo da sessão segura.
 * @param {string} planCode - Código do plano escolhido.
 * @returns {Promise<{subscription: object}>} Subscrição pública criada/atualizada.
 * @throws {Error} Quando o plano não existe ou esta inativo.
 */
/**
 * Ativa uma subscrição paga e cria a notificação transacional correspondente.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {string} planCode Código do plano ativo.
 * @returns {Promise<{ subscription: object }>} Subscrição pública atualizada.
 */
export async function activateSubscription(userId, planCode) {
  const db = await getDb();
  const plan = await db.collection("subscription_plans").findOne({ code: String(planCode), active: true });
  if (!plan) {
    const error = new Error("Plano não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  const interval = assertPlanInterval(plan.interval);
  const subscription = {
    userId: userObjectId(userId),
    planCode: plan.code,
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: addBillingCycle(now, interval),
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("subscriptions").updateOne(
    { userId: subscription.userId },
    { $set: subscription },
    { upsert: true },
  );

  // A notificação de subscrição ativa fica centralizada para evitar duplicação no checkout aprovado.
  await createNotification(userId, {
    type: "subscription_activated",
    title: "Subscrição ativa",
    message: "A tua subscrição FaithFlix ficou ativa.",
  });

  return { subscription: publicSubscription(subscription, plan) };
}

/**
 * Cria uma subscrição temporária de trial para um utilizador sem subscrição paga ativa.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {Date | string} endsAt Data em que o acesso gratuito termina.
 * @returns {Promise<{ subscription: object }>} Subscrição pública no formato do módulo de subscrições.
 * @throws {Error} Quando a data e inválida ou o utilizador já tem subscrição paga ativa.
 */
export async function grantTrialSubscription(userId, endsAt) {
  const db = await getDb();
  const now = new Date();
  const periodEnd = new Date(endsAt);

  if (Number.isNaN(periodEnd.getTime()) || periodEnd <= now) {
    const error = new Error("Data de fim de trial inválida.");
    error.statusCode = 400;
    throw error;
  }

  const userIdObject = userObjectId(userId);
  // Trial não deve substituir uma subscrição paga em vigor.
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

  const subscription = {
    userId: userIdObject,
    planCode: "trial",
    status: "trialing",
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: true,
    createdAt: now,
    updatedAt: now,
  };

  // Mantém uma unica subscrição por utilizador, tal como o fluxo pago do BK anterior.
  await db.collection("subscriptions").updateOne(
    { userId: userIdObject },
    { $set: subscription },
    { upsert: true },
  );

  return { subscription: publicSubscription(subscription) };
}

/**
 * Devolve a subscrição do utilizador autenticado.
 *
 * @param {string} userId - Identificador vindo da sessão segura.
 * @returns {Promise<{subscription: object}>} Estado público da subscrição.
 */
export async function getMySubscription(userId) {
  const db = await getDb();
  const subscription = await db.collection("subscriptions").findOne({ userId: userObjectId(userId) });
  const plan = subscription
    ? await db.collection("subscription_plans").findOne({ code: subscription.planCode })
    : undefined;

  return { subscription: publicSubscription(subscription, plan) };
}

/**
 * Verifica se o utilizador pode aceder a conteúdo premium.
 *
 * @param {string} userId - Identificador vindo de `req.user.id`.
 * @param {Date} referenceDate - Data opcional para testes de expiração.
 * @returns {Promise<boolean>} Resultado usado pelo middleware de playback.
 */
export async function hasActiveSubscriptionAccess(userId, referenceDate = new Date()) {
  const db = await getDb();
  const subscription = await db.collection("subscriptions").findOne({ userId: userObjectId(userId) });
  return hasSubscriptionAccess(subscription, referenceDate);
}

/**
 * Cancela a renovação futura mantendo acesso até ao fim do ciclo atual.
 *
 * @param {string} userId - Identificador vindo da sessão segura.
 * @returns {Promise<{subscription: object}>} Subscrição atualizada.
 * @throws {Error} Quando não existe subscrição ativa para cancelar.
 */
export async function cancelRenewal(userId) {
  const db = await getDb();
  const now = new Date();
  const subscription = await db.collection("subscriptions").findOneAndUpdate(
    { userId: userObjectId(userId), status: "active" },
    { $set: { cancelAtPeriodEnd: true, updatedAt: now } },
    { returnDocument: "after" },
  );

  if (!subscription) {
    const error = new Error("Subscrição ativa não encontrada.");
    error.statusCode = 404;
    throw error;
  }

  return { subscription: publicSubscription(subscription) };
}

/**
 * Renova uma subscrição ativa quando o pagamento simulado do novo ciclo e aceite.
 *
 * @param {string} userId - Identificador vindo da sessão segura.
 * @returns {Promise<{subscription: object}>} Subscrição com novo ciclo.
 * @throws {Error} Quando não existe subscrição ativa renovavel.
 */
export async function renewActiveSubscription(userId) {
  const db = await getDb();
  const now = new Date();
  const subscription = await db.collection("subscriptions").findOne({
    userId: userObjectId(userId),
    status: "active",
    cancelAtPeriodEnd: false,
  });

  if (!subscription) {
    const error = new Error("Subscrição ativa renovavel não encontrada.");
    error.statusCode = 404;
    throw error;
  }

  const plan = await db.collection("subscription_plans").findOne({ code: subscription.planCode, active: true });
  if (!plan) {
    const error = new Error("Plano da subscrição não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const nextPeriodStart = new Date(Math.max(new Date(subscription.currentPeriodEnd).getTime(), now.getTime()));
  const nextPeriodEnd = addBillingCycle(nextPeriodStart, assertPlanInterval(plan.interval));

  await db.collection("subscriptions").updateOne(
    { _id: subscription._id },
    {
      $set: {
        currentPeriodStart: nextPeriodStart,
        currentPeriodEnd: nextPeriodEnd,
        updatedAt: now,
      },
    },
  );

  // A renovação positiva avança datas sem criar uma segunda subscrição para o mesmo utilizador.
  return {
    subscription: publicSubscription({
      ...subscription,
      currentPeriodStart: nextPeriodStart,
      currentPeriodEnd: nextPeriodEnd,
      updatedAt: now,
    }, plan),
  };
}

/**
 * Marca subscrições vencidas quando a renovação simulada não ocorreu.
 *
 * @param {Date} referenceDate - Data usada para decidir vencimento.
 * @returns {Promise<void>} Termina depois de atualizar estados vencidos.
 */
export async function expireOverdueSubscriptions(referenceDate = new Date()) {
  const db = await getDb();
  // Se o utilizador cancelou renovação, o fim do ciclo transforma o estado em canceled.
  await db.collection("subscriptions").updateMany(
    { status: "active", currentPeriodEnd: { $lte: referenceDate }, cancelAtPeriodEnd: true },
    { $set: { status: "canceled", updatedAt: referenceDate } },
  );
  // Sem pagamento de renovação, a subscrição entra em past_due e o guard premium bloqueia playback.
  await db.collection("subscriptions").updateMany(
    { status: "active", currentPeriodEnd: { $lte: referenceDate }, cancelAtPeriodEnd: false },
    { $set: { status: "past_due", updatedAt: referenceDate } },
  );
}