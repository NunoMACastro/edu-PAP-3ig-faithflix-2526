/**
 * @file Service real_dev de planos, subscricoes, familia e entitlements.
 */

/**
 * Gere planos, subscricoes, acesso premium e partilha familiar da MF9.
 *
 * A regra central e simples: o frontend nunca decide pertença nem qualidade.
 * Tudo e resolvido a partir da sessao segura, da subscricao propria e, quando
 * aplicavel, de uma membership familiar ativa cujo owner tenha plano Familia.
 */
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertValidEmail } from "../auth/auth.validation.js";
import { createNotification } from "../notifications/notifications.service.js";
import {
  addBillingCycle,
  assertPlanInterval,
  isBlockingStatus,
} from "./subscriptions.validation.js";

const FAMILY_ACTIVE_STATUSES = ["pending", "active"];

// backend/src/modules/subscriptions/subscriptions.service.js
const QUALITY_RANKS = {
  "480p": 480,
  "720p": 720,
  "1080p": 1080,
  "2160p": 2160,
  "4k": 2160,
};

const ENTITLEMENTS = {
  none: {
    tier: "none",
    maxQuality: "720p",
    qualityRank: 720,
    familySharing: false,
    maxFamilyMembers: 1,
  },
  trial: {
    tier: "trial",
    maxQuality: "1080p",
    qualityRank: 1080,
    familySharing: false,
    maxFamilyMembers: 1,
  },
  pro: {
    tier: "pro",
    maxQuality: "1080p",
    qualityRank: 1080,
    familySharing: false,
    maxFamilyMembers: 1,
  },
  family: {
    tier: "family",
    maxQuality: "2160p",
    qualityRank: 2160,
    familySharing: true,
    maxFamilyMembers: 5,
  },
};

const DEFAULT_PLANS = [
  {
    code: "faithflix-monthly",
    name: "FaithFlix Pro Mensal",
    interval: "monthly",
    priceCents: 799,
    currency: "EUR",
    solidaritySharePercent: 20,
    // Os códigos históricos continuam ativos e passam apenas a declarar o tier Pro.
    tier: "pro",
    maxQuality: "1080p",
    familySharing: false,
    maxFamilyMembers: 1,
    features: ["Streaming até Full HD", "Acesso premium individual", "Pool solidária incluída"],
    active: true,
  },
  {
    code: "faithflix-yearly",
    name: "FaithFlix Pro Anual",
    interval: "yearly",
    priceCents: 7990,
    currency: "EUR",
    solidaritySharePercent: 20,
    tier: "pro",
    maxQuality: "1080p",
    familySharing: false,
    maxFamilyMembers: 1,
    features: ["Streaming até Full HD", "Acesso premium individual", "Pool solidária incluída"],
    active: true,
  },
  {
    code: "faithflix-family-monthly",
    name: "FaithFlix Família Mensal",
    interval: "monthly",
    priceCents: 1299,
    currency: "EUR",
    solidaritySharePercent: 20,
    // Família desbloqueia partilha e 4K sem alterar o fluxo de pagamento simulado.
    tier: "family",
    maxQuality: "2160p",
    familySharing: true,
    maxFamilyMembers: 5,
    features: ["Streaming até 4K", "Partilha com até 5 utilizadores", "Gestão familiar na app"],
    active: true,
  },
  {
    code: "faithflix-family-yearly",
    name: "FaithFlix Família Anual",
    interval: "yearly",
    priceCents: 12990,
    currency: "EUR",
    solidaritySharePercent: 20,
    tier: "family",
    maxQuality: "2160p",
    familySharing: true,
    maxFamilyMembers: 5,
    features: ["Streaming até 4K", "Partilha com até 5 utilizadores", "Gestão familiar na app"],
    active: true,
  },
];

/**
 * Cria erro HTTP simples e seguro.
 *
 * @param {string} message Mensagem publica.
 * @param {number} statusCode Codigo HTTP.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Converte um identificador de utilizador em ObjectId seguro.
 *
 * @param {string} userId Identificador vindo de `req.user.id`.
 * @returns {ObjectId} ObjectId usado nas queries MongoDB.
 */
function userObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    throw httpError("Utilizador inválido.", 400);
  }
  return new ObjectId(userId);
}

/**
 * Converte ids de URL para ObjectId com erro de dominio.
 *
 * @param {string} id Id bruto.
 * @param {string} label Label para mensagem.
 * @returns {ObjectId} ObjectId validado.
 */
function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    throw httpError(`${label} inválido.`, 400);
  }
  return new ObjectId(id);
}

/**
 * Calcula o ranking numerico de uma qualidade de video.
 *
 * @param {unknown} value Valor como `1080p`, `2160p` ou `4K`.
 * @returns {number} Ranking usado para comparacao.
 */
/**
 * Calcula o ranking numérico de uma qualidade de vídeo.
 *
 * @param {unknown} value Valor como `1080p`, `2160p` ou `4K`.
 * @returns {number} Ranking usado para comparação segura.
 */
export function qualityRankForValue(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (QUALITY_RANKS[normalized]) {
    return QUALITY_RANKS[normalized];
  }

  const [match] = normalized.match(/\d+/) ?? [];
  return match ? Number(match) : 0;
}

/**
 * Resolve entitlements de um plano persistido.
 *
 * @param {object | null | undefined} plan Plano MongoDB.
 * @returns {object} Entitlements normalizados.
 */
function entitlementsForPlan(plan) {
  const tier = String(plan?.tier ?? "pro").trim().toLowerCase();
  const defaults = ENTITLEMENTS[tier] ?? ENTITLEMENTS.pro;
  const maxQuality = String(plan?.maxQuality ?? defaults.maxQuality);

  return {
    ...defaults,
    tier: defaults.tier,
    maxQuality,
    qualityRank: qualityRankForValue(maxQuality) || defaults.qualityRank,
    familySharing: Boolean(plan?.familySharing ?? defaults.familySharing),
    maxFamilyMembers: Number(plan?.maxFamilyMembers ?? defaults.maxFamilyMembers),
  };
}


/**
 * Entitlements para uma subscricao concreta.
 *
 * @param {object|null} subscription Documento de subscricao.
 * @param {object|null|undefined} plan Plano associado.
 * @returns {object} Entitlements seguros.
 */
function entitlementsForSubscription(subscription, plan) {
  if (!subscription) {
    return { ...ENTITLEMENTS.none };
  }

  if (subscription.status === "trialing" || subscription.planCode === "trial") {
    return { ...ENTITLEMENTS.trial };
  }

  return entitlementsForPlan(plan);
}

/**
 * Remove campos internos de um plano antes de o expor ao frontend.
 *
 * @param {object} plan Documento MongoDB de `subscription_plans`.
 * @returns {object} Plano publico.
 */
/**
 * Remove campos internos de um plano antes de o expor ao frontend.
 *
 * @param {object} plan Documento MongoDB de `subscription_plans`.
 * @returns {object} Plano público consumido pela UI.
 */
function publicPlan(plan) {
  const entitlements = entitlementsForPlan(plan);

  return {
    id: String(plan._id),
    code: plan.code,
    name: plan.name,
    interval: plan.interval,
    priceCents: plan.priceCents,
    currency: plan.currency,
    solidaritySharePercent: plan.solidaritySharePercent,
    // A resposta pública entrega capacidades, não regras secretas nem campos internos.
    tier: entitlements.tier,
    maxQuality: entitlements.maxQuality,
    familySharing: entitlements.familySharing,
    maxFamilyMembers: entitlements.maxFamilyMembers,
    features: Array.isArray(plan.features) ? plan.features : [],
  };
}


/**
 * Calcula se uma subscricao ainda autoriza acesso premium.
 *
 * @param {object|null} subscription Documento de subscricao.
 * @param {Date} referenceDate Data usada para testes e verificacao real.
 * @returns {boolean} Resultado de acesso proprio.
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
 * Converte uma subscricao em dados seguros para UI/API.
 *
 * @param {object|null} subscription Documento MongoDB de `subscriptions`.
 * @param {object|undefined|null} plan Plano associado.
 * @param {Date} referenceDate Data de referencia.
 * @returns {object} Estado publico.
 */
function publicSubscription(subscription, plan = undefined, referenceDate = new Date()) {
  if (!subscription) {
    return { status: "none", hasPremiumAccess: false };
  }

  return {
    id: subscription._id ? String(subscription._id) : undefined,
    status: subscription.status,
    planCode: subscription.planCode,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    hasPremiumAccess: hasSubscriptionAccess(subscription, referenceDate),
    entitlements: entitlementsForSubscription(subscription, plan),
    plan: plan ? publicPlan(plan) : undefined,
  };
}

/**
 * Converte dados minimos de utilizador para respostas familiares.
 *
 * @param {object|null} user Documento `users`.
 * @returns {object|null} Utilizador publico reduzido.
 */
function publicFamilyUser(user) {
  if (!user) return null;

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    accountStatus: user.accountStatus ?? "active",
  };
}

/**
 * Converte uma membership familiar para resposta publica.
 *
 * @param {object} membership Documento de `subscription_family_memberships`.
 * @param {{ owner?: object|null, member?: object|null }} users Utilizadores relacionados.
 * @returns {object} Membership publica.
 */
function publicFamilyMembership(membership, users = {}) {
  return {
    id: String(membership._id),
    ownerUserId: String(membership.ownerUserId),
    memberUserId: String(membership.memberUserId),
    invitedEmail: membership.invitedEmail,
    status: membership.status,
    invitedAt: membership.invitedAt,
    acceptedAt: membership.acceptedAt,
    removedAt: membership.removedAt,
    declinedAt: membership.declinedAt,
    leftAt: membership.leftAt,
    owner: publicFamilyUser(users.owner),
    member: publicFamilyUser(users.member),
  };
}

/**
 * Lista memberships pending/active de um owner.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} ownerUserId Owner.
 * @returns {Promise<object[]>} Linhas ativas operacionais.
 */
async function listOpenFamilyMemberships(db, ownerUserId) {
  return db.collection("subscription_family_memberships")
    .find({ ownerUserId, status: { $in: FAMILY_ACTIVE_STATUSES } })
    .sort({ createdAt: 1 })
    .toArray();
}

/**
 * Verifica se uma subscricao paga ativa existe para o utilizador.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userId Utilizador.
 * @param {Date} referenceDate Data atual.
 * @returns {Promise<object|null>} Subscricao paga ativa, se existir.
 */
async function findActivePaidSubscription(db, userId, referenceDate = new Date()) {
  return db.collection("subscriptions").findOne({
    userId,
    status: "active",
    planCode: { $ne: "trial" },
    currentPeriodEnd: { $gt: referenceDate },
  });
}

/**
 * Carrega a subscricao propria com o respetivo plano.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userId Utilizador.
 * @returns {Promise<{ subscription: object|null, plan: object|null }>} Dados proprios.
 */
async function loadOwnSubscription(db, userId) {
  const subscription = await db.collection("subscriptions").findOne({ userId });
  const plan = subscription?.planCode && subscription.planCode !== "trial"
    ? await db.collection("subscription_plans").findOne({ code: subscription.planCode })
    : null;

  return { subscription, plan };
}

/**
 * Garante que o owner tem plano Familia partilhavel ativo.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} ownerUserId Owner.
 * @param {Date} referenceDate Data atual.
 * @returns {Promise<{ subscription: object, plan: object, entitlements: object }>} Estado partilhavel.
 */
async function requireShareableFamilyPlan(db, ownerUserId, referenceDate = new Date()) {
  const { subscription, plan } = await loadOwnSubscription(db, ownerUserId);
  const entitlements = entitlementsForSubscription(subscription, plan);

  if (!hasSubscriptionAccess(subscription, referenceDate) || !entitlements.familySharing) {
    throw httpError("Plano Família ativo obrigatório para gerir partilha familiar.", 403);
  }

  return { subscription, plan, entitlements };
}

/**
 * Enriquece memberships com documentos de utilizador.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {object[]} memberships Memberships.
 * @returns {Promise<object[]>} Memberships publicas.
 */
async function publicMembershipsWithUsers(db, memberships) {
  return Promise.all(
    memberships.map(async (membership) => {
      const [owner, member] = await Promise.all([
        db.collection("users").findOne({ _id: membership.ownerUserId }),
        db.collection("users").findOne({ _id: membership.memberUserId }),
      ]);

      return publicFamilyMembership(membership, { owner, member });
    }),
  );
}

/**
 * Resolve acesso efetivo a partir de subscricao propria ou familia.
 *
 * @param {string} userId Identificador autenticado.
 * @param {Date} referenceDate Data opcional.
 * @returns {Promise<object>} Estado efetivo de acesso.
 */
export async function getEffectiveSubscriptionAccess(userId, referenceDate = new Date()) {
  const db = await getDb();
  const userIdObject = userObjectId(userId);
  const { subscription, plan } = await loadOwnSubscription(db, userIdObject);

  if (hasSubscriptionAccess(subscription, referenceDate)) {
    return {
      hasPremiumAccess: true,
      accessSource: "own",
      subscription,
      plan,
      entitlements: entitlementsForSubscription(subscription, plan),
      familyMembership: null,
    };
  }

  const membership = await db.collection("subscription_family_memberships").findOne(
    { memberUserId: userIdObject, status: "active" },
    { sort: { acceptedAt: -1, createdAt: -1 } },
  );

  if (!membership) {
    return {
      hasPremiumAccess: false,
      accessSource: "none",
      subscription,
      plan,
      entitlements: { ...ENTITLEMENTS.none },
      familyMembership: null,
    };
  }

  const ownerState = await loadOwnSubscription(db, membership.ownerUserId);
  const ownerEntitlements = entitlementsForSubscription(ownerState.subscription, ownerState.plan);

  if (
    hasSubscriptionAccess(ownerState.subscription, referenceDate) &&
    ownerEntitlements.familySharing
  ) {
    return {
      hasPremiumAccess: true,
      accessSource: "family",
      subscription: ownerState.subscription,
      plan: ownerState.plan,
      entitlements: ownerEntitlements,
      familyMembership: membership,
    };
  }

  return {
    hasPremiumAccess: false,
    accessSource: "none",
    subscription,
    plan,
    entitlements: { ...ENTITLEMENTS.none },
    familyMembership: membership,
  };
}

/**
 * Filtra opcoes de qualidade conforme entitlements sem expor URLs bloqueados.
 *
 * @param {object[]} options Opcoes vindas do catalogo.
 * @param {object} entitlements Entitlements efetivos.
 * @returns {object[]} Opcoes publicas.
 */
export function filterQualityOptionsByEntitlements(options = [], entitlements = ENTITLEMENTS.none) {
  const maxRank = Number(entitlements.qualityRank ?? qualityRankForValue(entitlements.maxQuality));

  return options.map((option) => {
    const rank = qualityRankForValue(option.value ?? option.label);
    if (!rank || rank <= maxRank) {
      return { ...option, locked: false };
    }

    const { playbackUrl: _playbackUrl, src: _src, ...safeOption } = option;
    return {
      ...safeOption,
      locked: true,
      requiredTier: "family",
      lockedReason: "Disponível no plano Família.",
    };
  });
}

/**
 * Cria índices e planos base usados por subscrições e Família.
 *
 * @returns {Promise<void>} Termina quando índices e seed ficam prontos.
 */
export async function ensureSubscriptionIndexes() {
  const db = await getDb();
  await db.collection("subscription_plans").createIndex({ code: 1 }, { unique: true });
  await db.collection("subscriptions").createIndex({ userId: 1 }, { unique: true });
  await db.collection("subscriptions").createIndex({ status: 1, currentPeriodEnd: 1 });

  for (const plan of DEFAULT_PLANS) {
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
 * @returns {Promise<{ plans: object[] }>} Planos públicos ordenados por preço.
 */
export async function listPlans() {
  const db = await getDb();
  const plans = await db.collection("subscription_plans")
    .find({ active: true })
    .sort({ priceCents: 1 })
    .toArray();

  return { plans: plans.map(publicPlan) };
}

/**
 * Remove memberships quando um utilizador muda para plano sem familia.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} ownerUserId Owner.
 * @param {Date} now Data atual.
 * @returns {Promise<void>} Termina quando memberships ficam inativas.
 */
async function disableOwnedFamilyWhenPlanDoesNotShare(db, ownerUserId, now) {
  await db.collection("subscription_family_memberships").updateMany(
    { ownerUserId, status: { $in: FAMILY_ACTIVE_STATUSES } },
    {
      $set: {
        status: "removed",
        removedAt: now,
        removedReason: "owner_plan_changed",
        updatedAt: now,
      },
    },
  );
}

/**
 * Um utilizador que compra plano proprio deixa convites/memberships familiares.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} memberUserId Membro.
 * @param {Date} now Data atual.
 * @returns {Promise<void>} Termina quando memberships ficam inativas.
 */
async function leaveFamilyWhenUserGetsOwnSubscription(db, memberUserId, now) {
  await db.collection("subscription_family_memberships").updateMany(
    { memberUserId, status: { $in: FAMILY_ACTIVE_STATUSES } },
    {
      $set: {
        status: "left",
        leftAt: now,
        leftReason: "member_started_own_subscription",
        updatedAt: now,
      },
    },
  );
}

/**
 * Ativa ou substitui a subscricao paga do utilizador autenticado.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {string} planCode Código do plano ativo.
 * @returns {Promise<{ subscription: object }>} Subscrição pública atualizada.
 */
export async function activateSubscription(userId, planCode) {
  const db = await getDb();
  const plan = await db.collection("subscription_plans").findOne({ code: String(planCode), active: true });
  if (!plan) {
    throw httpError("Plano não encontrado.", 404);
  }

  const now = new Date();
  const interval = assertPlanInterval(plan.interval);
  const userIdObject = userObjectId(userId);
  const subscriptionPatch = {
    userId: userIdObject,
    planCode: plan.code,
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: addBillingCycle(now, interval),
    cancelAtPeriodEnd: false,
    updatedAt: now,
  };

  await db.collection("subscriptions").updateOne(
    { userId: userIdObject },
    { $set: subscriptionPatch, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );

  if (entitlementsForPlan(plan).familySharing) {
    await leaveFamilyWhenUserGetsOwnSubscription(db, userIdObject, now);
  } else {
    await Promise.all([
      disableOwnedFamilyWhenPlanDoesNotShare(db, userIdObject, now),
      leaveFamilyWhenUserGetsOwnSubscription(db, userIdObject, now),
    ]);
  }

  await createNotification(userId, {
    type: "subscription_activated",
    title: "Subscrição ativa",
    message: "A tua subscrição FaithFlix ficou ativa.",
  });

  const storedSubscription = await db.collection("subscriptions").findOne({ userId: userIdObject });
  return { subscription: publicSubscription(storedSubscription, plan) };
}

/**
 * Cria uma subscrição temporária de trial.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {Date | string} endsAt Data em que o acesso gratuito termina.
 * @returns {Promise<{ subscription: object }>} Subscrição pública.
 */
export async function grantTrialSubscription(userId, endsAt) {
  const db = await getDb();
  const now = new Date();
  const periodEnd = new Date(endsAt);

  if (Number.isNaN(periodEnd.getTime()) || periodEnd <= now) {
    throw httpError("Data de fim de trial inválida.", 400);
  }

  const userIdObject = userObjectId(userId);
  const activePaidSubscription = await findActivePaidSubscription(db, userIdObject, now);

  if (activePaidSubscription) {
    throw httpError("Utilizador já tem uma subscrição ativa.", 409);
  }

  const subscriptionPatch = {
    userId: userIdObject,
    planCode: "trial",
    status: "trialing",
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: true,
    updatedAt: now,
  };

  await db.collection("subscriptions").updateOne(
    { userId: userIdObject },
    { $set: subscriptionPatch, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );

  const storedSubscription = await db.collection("subscriptions").findOne({ userId: userIdObject });
  return { subscription: publicSubscription(storedSubscription) };
}

/**
 * Devolve o estado familiar do utilizador autenticado.
 *
 * @param {string} userId Identificador da sessao.
 * @returns {Promise<object>} Overview familiar.
 */
export async function getFamilyOverview(userId) {
  const db = await getDb();
  const userIdObject = userObjectId(userId);
  const { subscription, plan } = await loadOwnSubscription(db, userIdObject);
  const ownEntitlements = entitlementsForSubscription(subscription, plan);
  const now = new Date();
  const canOwnFamily = hasSubscriptionAccess(subscription, now) && ownEntitlements.familySharing;

  const [ownedRows, pendingRows, activeMembership] = await Promise.all([
    canOwnFamily ? listOpenFamilyMemberships(db, userIdObject) : [],
    db.collection("subscription_family_memberships")
      .find({ memberUserId: userIdObject, status: "pending" })
      .sort({ createdAt: -1 })
      .toArray(),
    db.collection("subscription_family_memberships").findOne(
      { memberUserId: userIdObject, status: "active" },
      { sort: { acceptedAt: -1, createdAt: -1 } },
    ),
  ]);

  const ownedMembers = await publicMembershipsWithUsers(db, ownedRows);
  const pendingInvitations = await publicMembershipsWithUsers(db, pendingRows);
  const [publicActiveMembership] = activeMembership
    ? await publicMembershipsWithUsers(db, [activeMembership])
    : [null];

  return {
    ownedFamily: canOwnFamily
      ? {
        maxFamilyMembers: ownEntitlements.maxFamilyMembers,
        seatsUsed: 1 + ownedRows.length,
        seatsAvailable: Math.max(ownEntitlements.maxFamilyMembers - 1 - ownedRows.length, 0),
        members: ownedMembers,
      }
      : null,
    pendingInvitations,
    activeMembership: publicActiveMembership,
  };
}

/**
 * Devolve a subscricao do utilizador autenticado com acesso efetivo.
 *
 * @param {string} userId Identificador vindo da sessao segura.
 * @returns {Promise<{subscription: object, family: object}>} Estado publico.
 */
export async function getMySubscription(userId) {
  const db = await getDb();
  const userIdObject = userObjectId(userId);
  const { subscription, plan } = await loadOwnSubscription(db, userIdObject);
  const effective = await getEffectiveSubscriptionAccess(userId);
  const family = await getFamilyOverview(userId);

  return {
    subscription: {
      ...publicSubscription(subscription, plan),
      hasPremiumAccess: effective.hasPremiumAccess,
      accessSource: effective.accessSource,
      entitlements: effective.entitlements,
      familyAccess: effective.familyMembership
        ? publicFamilyMembership(effective.familyMembership)
        : null,
    },
    family,
  };
}

/**
 * Verifica se o utilizador pode aceder a conteúdo premium.
 *
 * @param {string} userId Identificador vindo de `req.user.id`.
 * @param {Date} referenceDate Data opcional para testes de expiração.
 * @returns {Promise<boolean>} Resultado usado pelo middleware de playback.
 */
export async function hasActiveSubscriptionAccess(userId, referenceDate = new Date()) {
  const effective = await getEffectiveSubscriptionAccess(userId, referenceDate);
  return effective.hasPremiumAccess;
}

/**
 * Convida uma conta existente para a familia do owner.
 *
 * @param {string} ownerUserId Identificador do owner autenticado.
 * @param {{ email?: unknown }} input Payload do frontend.
 * @returns {Promise<{ invitation: object, family: object }>} Convite e overview.
 */
export async function inviteFamilyMember(ownerUserId, input) {
  const db = await getDb();
  const now = new Date();
  const ownerObjectId = userObjectId(ownerUserId);
  const email = assertValidEmail(input?.email);
  const targetUser = await db.collection("users").findOne({ email });

  if (!targetUser || targetUser.accountStatus === "deleted") {
    throw httpError("Utilizador convidado não encontrado.", 404);
  }

  if (String(targetUser._id) === String(ownerObjectId)) {
    throw httpError("Não podes convidar a tua própria conta.", 400);
  }

  const { subscription, entitlements } = await requireShareableFamilyPlan(db, ownerObjectId, now);
  const openRows = await listOpenFamilyMemberships(db, ownerObjectId);

  if (openRows.length + 1 >= entitlements.maxFamilyMembers) {
    throw httpError("Limite de utilizadores do plano Família atingido.", 409);
  }

  if (await findActivePaidSubscription(db, targetUser._id, now)) {
    throw httpError("Este utilizador já tem uma subscrição paga ativa.", 409);
  }

  const existingMembership = await db.collection("subscription_family_memberships").findOne({
    memberUserId: targetUser._id,
    status: { $in: FAMILY_ACTIVE_STATUSES },
  });

  if (existingMembership) {
    throw httpError("Este utilizador já tem uma partilha familiar ativa ou pendente.", 409);
  }

  const membership = {
    ownerUserId: ownerObjectId,
    memberUserId: targetUser._id,
    subscriptionId: subscription._id,
    invitedEmail: email,
    status: "pending",
    invitedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection("subscription_family_memberships").insertOne(membership);
  const storedMembership = { ...membership, _id: result.insertedId };

  await createNotification(String(targetUser._id), {
    type: "family_invitation",
    title: "Convite familiar recebido",
    message: "Recebeste um convite para partilhar uma subscrição FaithFlix Família.",
  });

  return {
    invitation: publicFamilyMembership(storedMembership, { member: targetUser }),
    family: await getFamilyOverview(ownerUserId),
  };
}

/**
 * Aceita um convite familiar pendente.
 *
 * @param {string} memberUserId Utilizador autenticado.
 * @param {string} invitationId Id do convite.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function acceptFamilyInvitation(memberUserId, invitationId) {
  const db = await getDb();
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);
  const invitationObjectId = asObjectId(invitationId, "Convite");
  const invitation = await db.collection("subscription_family_memberships").findOne({
    _id: invitationObjectId,
    memberUserId: memberObjectId,
    status: "pending",
  });

  if (!invitation) {
    throw httpError("Convite familiar não encontrado.", 404);
  }

  if (await findActivePaidSubscription(db, memberObjectId, now)) {
    throw httpError("Não podes aceitar família com subscrição paga ativa.", 409);
  }

  const existingMembership = await db.collection("subscription_family_memberships").findOne({
    _id: { $ne: invitationObjectId },
    memberUserId: memberObjectId,
    status: { $in: FAMILY_ACTIVE_STATUSES },
  });

  if (existingMembership) {
    throw httpError("Já existe uma partilha familiar ativa ou pendente.", 409);
  }

  const { entitlements } = await requireShareableFamilyPlan(db, invitation.ownerUserId, now);
  const openRows = await listOpenFamilyMemberships(db, invitation.ownerUserId);

  if (openRows.length + 1 > entitlements.maxFamilyMembers) {
    throw httpError("Limite de utilizadores do plano Família atingido.", 409);
  }

  await db.collection("subscription_family_memberships").updateOne(
    { _id: invitationObjectId },
    { $set: { status: "active", acceptedAt: now, updatedAt: now } },
  );

  await createNotification(String(invitation.ownerUserId), {
    type: "family_invitation_accepted",
    title: "Convite familiar aceite",
    message: "Um membro aceitou o teu convite FaithFlix Família.",
  });

  return { family: await getFamilyOverview(memberUserId) };
}

/**
 * Recusa um convite familiar pendente.
 *
 * @param {string} memberUserId Utilizador autenticado.
 * @param {string} invitationId Id do convite.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function declineFamilyInvitation(memberUserId, invitationId) {
  const db = await getDb();
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);
  const invitationObjectId = asObjectId(invitationId, "Convite");
  const result = await db.collection("subscription_family_memberships").updateOne(
    { _id: invitationObjectId, memberUserId: memberObjectId, status: "pending" },
    { $set: { status: "declined", declinedAt: now, updatedAt: now } },
  );

  if (!result.matchedCount) {
    throw httpError("Convite familiar não encontrado.", 404);
  }

  return { family: await getFamilyOverview(memberUserId) };
}

/**
 * Remove um membro da familia do owner.
 *
 * @param {string} ownerUserId Owner autenticado.
 * @param {string} memberUserId Membro alvo.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function removeFamilyMember(ownerUserId, memberUserId) {
  const db = await getDb();
  const now = new Date();
  const ownerObjectId = userObjectId(ownerUserId);
  const memberObjectId = asObjectId(memberUserId, "Membro");
  await requireShareableFamilyPlan(db, ownerObjectId, now);

  const result = await db.collection("subscription_family_memberships").updateOne(
    { ownerUserId: ownerObjectId, memberUserId: memberObjectId, status: { $in: FAMILY_ACTIVE_STATUSES } },
    { $set: { status: "removed", removedAt: now, updatedAt: now } },
  );

  if (!result.matchedCount) {
    throw httpError("Membro familiar não encontrado.", 404);
  }

  await createNotification(String(memberObjectId), {
    type: "family_member_removed",
    title: "Partilha familiar removida",
    message: "A tua partilha da subscrição FaithFlix Família foi removida.",
  });

  return { family: await getFamilyOverview(ownerUserId) };
}

/**
 * Permite ao membro sair da familia ativa.
 *
 * @param {string} memberUserId Utilizador autenticado.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function leaveFamily(memberUserId) {
  const db = await getDb();
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);
  const result = await db.collection("subscription_family_memberships").updateOne(
    { memberUserId: memberObjectId, status: "active" },
    { $set: { status: "left", leftAt: now, updatedAt: now } },
  );

  if (!result.matchedCount) {
    throw httpError("Partilha familiar ativa não encontrada.", 404);
  }

  return { family: await getFamilyOverview(memberUserId) };
}

/**
 * Cancela a renovação futura mantendo acesso até ao fim do ciclo atual.
 *
 * @param {string} userId Identificador vindo da sessão segura.
 * @returns {Promise<{subscription: object}>} Subscrição atualizada.
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
    throw httpError("Subscrição ativa não encontrada.", 404);
  }

  const plan = subscription.planCode
    ? await db.collection("subscription_plans").findOne({ code: subscription.planCode })
    : null;

  return { subscription: publicSubscription(subscription, plan) };
}

/**
 * Renova uma subscrição ativa quando o pagamento simulado do novo ciclo e aceite.
 *
 * @param {string} userId Identificador vindo da sessão segura.
 * @returns {Promise<{subscription: object}>} Subscrição com novo ciclo.
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
    throw httpError("Subscrição ativa renovavel não encontrada.", 404);
  }

  const plan = await db.collection("subscription_plans").findOne({ code: subscription.planCode, active: true });
  if (!plan) {
    throw httpError("Plano da subscrição não encontrado.", 404);
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
 * @param {Date} referenceDate Data usada para decidir vencimento.
 * @returns {Promise<void>} Termina depois de atualizar estados vencidos.
 */
export async function expireOverdueSubscriptions(referenceDate = new Date()) {
  const db = await getDb();
  await db.collection("subscriptions").updateMany(
    { status: "active", currentPeriodEnd: { $lte: referenceDate }, cancelAtPeriodEnd: true },
    { $set: { status: "canceled", updatedAt: referenceDate } },
  );
  await db.collection("subscriptions").updateMany(
    { status: "active", currentPeriodEnd: { $lte: referenceDate }, cancelAtPeriodEnd: false },
    { $set: { status: "past_due", updatedAt: referenceDate } },
  );
}
