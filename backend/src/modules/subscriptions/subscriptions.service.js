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
import { getDb, runInTransaction } from "../../config/database.js";
import { assertValidEmail } from "../auth/auth.validation.js";
import { createNotification } from "../notifications/notifications.service.js";
import { serializeBillingCustomers } from "./billing-customer-lock.service.js";
import {
  addBillingCycle,
  assertPlanInterval,
  isBlockingStatus,
} from "./subscriptions.validation.js";

const FAMILY_ACTIVE_STATUSES = ["pending", "active"];

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
    tier: "family",
    maxQuality: "2160p",
    familySharing: true,
    maxFamilyMembers: 5,
    features: ["Perfil 2160p", "Partilha com até 5 utilizadores", "Gestão familiar na app"],
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
    features: ["Perfil 2160p", "Partilha com até 5 utilizadores", "Gestão familiar na app"],
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
  if (typeof userId !== "string" || !ObjectId.isValid(userId)) {
    throw httpError("Utilizador inválido.", 400);
  }
  return new ObjectId(userId);
}

/**
 * Captura a âncora do primeiro ciclo para não perder a convenção de fim do mês.
 *
 * @param {Date} date Início do primeiro ciclo pago.
 * @returns {{ anchorDay: number, anchorEndOfMonth: boolean }} Âncora persistível.
 */
function billingAnchorForDate(date) {
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return {
    anchorDay: date.getUTCDate(),
    anchorEndOfMonth: date.getUTCDate() === lastDay,
  };
}

/**
 * Converte ids de URL para ObjectId com erro de dominio.
 *
 * @param {string} id Id bruto.
 * @param {string} label Label para mensagem.
 * @returns {ObjectId} ObjectId validado.
 */
function asObjectId(id, label) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
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
export function qualityRankForValue(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (QUALITY_RANKS[normalized]) {
    return QUALITY_RANKS[normalized];
  }

  const [match] = normalized.match(/\d+/) ?? [];
  return match ? Number(match) : 0;
}

/**
 * Confirma que uma qualidade pertence ao vocabulário fechado suportado.
 *
 * O ranking genérico continua disponível para normalizar planos persistidos,
 * mas uma variante de media desconhecida nunca deve herdar acesso apenas por
 * conter algarismos no nome.
 *
 * @param {unknown} value Valor de qualidade vindo de uma variante de media.
 * @returns {boolean} Verdadeiro apenas para 480p, 720p, 1080p, 2160p ou 4K.
 */
export function isSupportedQualityValue(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return Object.hasOwn(QUALITY_RANKS, normalized);
}

/**
 * Resolve entitlements de um plano persistido.
 *
 * @param {object|null|undefined} plan Plano MongoDB.
 * @returns {object} Entitlements normalizados.
 */
export function entitlementsForPlan(plan) {
  const tier = String(plan?.tier ?? "").trim().toLowerCase();

  if (!plan || plan.active !== true || !["pro", "family"].includes(tier)) {
    return { ...ENTITLEMENTS.none };
  }

  const defaults = ENTITLEMENTS[tier];
  const maxQuality = typeof plan.maxQuality === "string"
    ? plan.maxQuality.trim().toLowerCase()
    : "";

  if (
    !isSupportedQualityValue(maxQuality) ||
    qualityRankForValue(maxQuality) > defaults.qualityRank
  ) {
    return { ...ENTITLEMENTS.none };
  }

  const familySharing = tier === "family";
  const configuredFamilyMembers = plan.maxFamilyMembers;

  if (
    familySharing &&
    (plan.familySharing !== true ||
      !Number.isInteger(configuredFamilyMembers) ||
      configuredFamilyMembers < 2 ||
      configuredFamilyMembers > defaults.maxFamilyMembers)
  ) {
    return { ...ENTITLEMENTS.none };
  }

  const maxFamilyMembers = familySharing ? configuredFamilyMembers : 1;

  return {
    ...defaults,
    tier: defaults.tier,
    maxQuality,
    qualityRank: qualityRankForValue(maxQuality),
    familySharing,
    maxFamilyMembers,
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

  if (
    subscription.status === "trialing" &&
    subscription.planCode === "trial"
  ) {
    return { ...ENTITLEMENTS.trial };
  }

  return subscription.status === "active"
    ? entitlementsForPlan(plan)
    : { ...ENTITLEMENTS.none };
}

/**
 * Remove campos internos de um plano antes de o expor ao frontend.
 *
 * @param {object} plan Documento MongoDB de `subscription_plans`.
 * @returns {object} Plano publico.
 */
function publicPlan(plan) {
  const entitlements = entitlementsForPlan(plan);
  const features = Array.isArray(plan.features)
    ? plan.features
      .map((feature) => String(feature ?? "").trim())
      .map((feature) => feature.replace(/\s*(?:\(simulado\)|simulado)$/iu, ""))
      .filter(Boolean)
    : [];

  return {
    id: String(plan._id),
    code: plan.code,
    name: plan.name,
    interval: plan.interval,
    priceCents: plan.priceCents,
    currency: plan.currency,
    solidaritySharePercent: plan.solidaritySharePercent,
    tier: entitlements.tier,
    maxQuality: entitlements.maxQuality,
    qualityRank: entitlements.qualityRank,
    familySharing: entitlements.familySharing,
    maxFamilyMembers: entitlements.maxFamilyMembers,
    features,
  };
}

/**
 * Calcula se uma subscricao ainda autoriza acesso premium.
 *
 * @param {object|null} subscription Documento de subscricao.
 * @param {Date} referenceDate Data usada para testes e verificacao real.
 * @returns {boolean} Resultado de acesso proprio.
 */
function hasSubscriptionAccess(
  subscription,
  referenceDate = new Date(),
  plan = undefined,
) {
  if (!subscription || isBlockingStatus(subscription.status)) {
    return false;
  }

  const statusIsEntitled = subscription.status === "trialing"
    ? subscription.planCode === "trial"
    : entitlementsForPlan(plan).tier !== "none";

  if (!statusIsEntitled) {
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
    hasPremiumAccess: hasSubscriptionAccess(subscription, referenceDate, plan),
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
 * @param {import("mongodb").ClientSession | undefined} [session] Sessao transacional opcional.
 * @returns {Promise<object[]>} Linhas ativas operacionais.
 */
async function listOpenFamilyMemberships(db, ownerUserId, session = undefined) {
  return db.collection("subscription_family_memberships")
    .find(
      { ownerUserId, status: { $in: FAMILY_ACTIVE_STATUSES } },
      { session },
    )
    .sort({ createdAt: 1 })
    .toArray();
}

/**
 * Reconta lugares reservados, incluindo convites pendentes, no snapshot atual.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} ownerUserId Owner.
 * @param {import("mongodb").ClientSession | undefined} [session] Sessao transacional opcional.
 * @returns {Promise<number>} Numero de memberships que ocupam lugar.
 */
async function countOpenFamilyMemberships(db, ownerUserId, session = undefined) {
  return db.collection("subscription_family_memberships").countDocuments(
    { ownerUserId, status: { $in: FAMILY_ACTIVE_STATUSES } },
    { session },
  );
}

/**
 * Verifica se uma subscricao paga ativa existe para o utilizador.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userId Utilizador.
 * @param {Date} referenceDate Data atual.
 * @param {import("mongodb").ClientSession | undefined} [session] Sessao transacional opcional.
 * @returns {Promise<object|null>} Subscricao paga ativa, se existir.
 */
async function findActivePaidSubscription(db, userId, referenceDate = new Date(), session = undefined) {
  return db.collection("subscriptions").findOne({
    userId,
    status: "active",
    planCode: { $ne: "trial" },
    currentPeriodEnd: { $gt: referenceDate },
  }, { session });
}

/**
 * Carrega a subscricao propria com o respetivo plano.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userId Utilizador.
 * @param {import("mongodb").ClientSession | undefined} [session] Sessao transacional opcional.
 * @returns {Promise<{ subscription: object|null, plan: object|null }>} Dados proprios.
 */
async function loadOwnSubscription(db, userId, session = undefined) {
  const subscription = await db.collection("subscriptions").findOne(
    { userId },
    { session },
  );
  const plan = subscription?.planCode && subscription.planCode !== "trial"
    ? await db.collection("subscription_plans").findOne(
      { code: subscription.planCode },
      { session },
    )
    : null;

  return { subscription, plan };
}

/**
 * Garante que o owner tem plano Familia partilhavel ativo.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} ownerUserId Owner.
 * @param {Date} referenceDate Data atual.
 * @param {import("mongodb").ClientSession | undefined} [session] Sessao transacional opcional.
 * @returns {Promise<{ subscription: object, plan: object, entitlements: object }>} Estado partilhavel.
 */
async function requireShareableFamilyPlan(
  db,
  ownerUserId,
  referenceDate = new Date(),
  session = undefined,
) {
  const { subscription, plan } = await loadOwnSubscription(db, ownerUserId, session);
  const entitlements = entitlementsForSubscription(subscription, plan);

  if (
    !hasSubscriptionAccess(subscription, referenceDate, plan) ||
    !entitlements.familySharing
  ) {
    throw httpError("Plano Família ativo obrigatório para gerir partilha familiar.", 403);
  }

  return { subscription, plan, entitlements };
}

/**
 * Cria o ponto de contencao por owner usado por convite e aceitacao.
 *
 * Duas transacoes concorrentes escrevem a mesma subscricao. O MongoDB faz uma
 * delas receber `TransientTransactionError`; `runInTransaction` repete toda a
 * unidade, que volta a contar lugares a partir do estado ja confirmado.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} ownerUserId Owner da familia.
 * @param {Date} now Instante da mutacao.
 * @param {import("mongodb").ClientSession | undefined} [session] Sessao transacional.
 * @returns {Promise<{ subscription: object, plan: object, entitlements: object }>} Estado familiar bloqueado logicamente.
 */
async function serializeFamilyOwner(db, ownerUserId, now, session = undefined) {
  const familyState = await requireShareableFamilyPlan(
    db,
    ownerUserId,
    now,
    session,
  );
  const lockResult = await db.collection("subscriptions").updateOne(
    {
      _id: familyState.subscription._id,
      userId: ownerUserId,
      status: "active",
      currentPeriodEnd: { $gt: now },
    },
    {
      $inc: { familyVersion: 1 },
      $set: { familyUpdatedAt: now },
    },
    { session },
  );

  if (!lockResult.matchedCount) {
    throw httpError("Plano Família ativo obrigatório para gerir partilha familiar.", 403);
  }

  return familyState;
}

/**
 * Identifica a violacao do indice parcial unico por membro.
 *
 * @param {unknown} error Erro do driver MongoDB ou de um double fiel.
 * @returns {boolean} Verdadeiro para `E11000`.
 */
function isDuplicateFamilyMembership(error) {
  return Number(error?.code) === 11000;
}

/**
 * Enriquece memberships com documentos de utilizador.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {object[]} memberships Memberships.
 * @param {import("mongodb").ClientSession | undefined} [session] Sessao transacional opcional.
 * @returns {Promise<object[]>} Memberships publicas.
 */
async function publicMembershipsWithUsers(db, memberships, session = undefined) {
  const result = [];

  // O driver não permite operações paralelas na mesma transação MongoDB.
  for (const membership of memberships) {
    const owner = await db.collection("users").findOne(
      { _id: membership.ownerUserId },
      { session },
    );
    const member = await db.collection("users").findOne(
      { _id: membership.memberUserId },
      { session },
    );
    result.push(publicFamilyMembership(membership, { owner, member }));
  }

  return result;
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

  if (hasSubscriptionAccess(subscription, referenceDate, plan)) {
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
  const ownerUser = await db
    .collection("users")
    .findOne({ _id: membership.ownerUserId });
  const ownerEntitlements = entitlementsForSubscription(ownerState.subscription, ownerState.plan);

  if (
    (ownerUser?.accountStatus ?? "active") === "active" &&
    hasSubscriptionAccess(
      ownerState.subscription,
      referenceDate,
      ownerState.plan,
    ) &&
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
    const isSupported = isSupportedQualityValue(option.value ?? option.label);

    if (isSupported && rank <= maxRank) {
      return { ...option, locked: false };
    }

    const {
      playbackUrl: _playbackUrl,
      src: _src,
      url: _url,
      source: _source,
      ...safeOption
    } = option;

    if (!isSupported) {
      return {
        ...safeOption,
        locked: true,
        lockedReason: "Qualidade de media não suportada.",
      };
    }

    return {
      ...safeOption,
      locked: true,
      requiredTier: "family",
      lockedReason: "Disponível no plano Família.",
    };
  });
}

/**
 * Cria apenas os índices usados por subscrições e família.
 *
 * @returns {Promise<void>} Termina quando indices e seed ficam prontos.
 */
export async function ensureSubscriptionIndexes() {
  const db = await getDb();
  await db.collection("subscription_plans").createIndex({ code: 1 }, { unique: true });
  await db.collection("subscriptions").createIndex({ userId: 1 }, { unique: true });
  await db.collection("subscriptions").createIndex({ status: 1, currentPeriodEnd: 1 });
  await db.collection("subscription_family_memberships").createIndex({ ownerUserId: 1, status: 1 });
  await db.collection("subscription_family_memberships").createIndex({ memberUserId: 1, status: 1 });
  await db.collection("subscription_family_memberships").createIndex(
    { memberUserId: 1 },
    { unique: true, partialFilterExpression: { status: { $in: FAMILY_ACTIVE_STATUSES } } },
  );

}

/**
 * Insere planos locais em falta sem reescrever configuração financeira existente.
 *
 * Esta operação é seed explícita; servidor e worker nunca a chamam no arranque.
 * Alterações de preço/moeda/percentagem exigem uma migração própria e auditada.
 *
 * @param {{ referenceDate?: Date, planIdFactory?: (code: string) => ObjectId|string }} [options] Relógio e IDs opcionais para fixtures determinísticas.
 * @returns {Promise<void>} Termina depois dos inserts idempotentes.
 */
export async function ensureDefaultSubscriptionPlans(options = {}) {
  const db = await getDb();
  const now = options.referenceDate instanceof Date ? options.referenceDate : new Date();

  for (const plan of DEFAULT_PLANS) {
    const planId = options.planIdFactory?.(plan.code);
    await db.collection("subscription_plans").updateOne(
      { code: plan.code },
      {
        $setOnInsert: {
          ...(planId ? { _id: new ObjectId(String(planId)) } : {}),
          ...plan,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );
  }
}

/**
 * Lista planos ativos disponíveis para escolha.
 *
 * @returns {Promise<{plans: object[]}>} Planos públicos ordenados por tier/preço.
 */
export async function listPlans() {
  const db = await getDb();
  const plans = await db.collection("subscription_plans")
    .find({ active: true })
    .sort({ priceCents: 1 })
    .toArray();
  return {
    plans: plans
      .filter((plan) => entitlementsForPlan(plan).tier !== "none")
      .map(publicPlan),
  };
}

/**
 * Remove memberships quando um utilizador muda para plano sem familia.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} ownerUserId Owner.
 * @param {Date} now Data atual.
 * @param {import("mongodb").ClientSession | undefined} [session] Sessao transacional opcional.
 * @returns {Promise<void>} Termina quando memberships ficam inativas.
 */
async function disableOwnedFamilyWhenPlanDoesNotShare(db, ownerUserId, now, session = undefined) {
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
    { session },
  );
}

/**
 * Um utilizador que compra plano proprio deixa convites/memberships familiares.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} memberUserId Membro.
 * @param {Date} now Data atual.
 * @param {import("mongodb").ClientSession | undefined} [session] Sessao transacional opcional.
 * @returns {Promise<void>} Termina quando memberships ficam inativas.
 */
async function leaveFamilyWhenUserGetsOwnSubscription(db, memberUserId, now, session = undefined) {
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
    { session },
  );
}

/**
 * Ativa ou substitui a subscricao paga do utilizador autenticado.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {string} planCode Código do plano ativo.
 * @param {{ db?: import("mongodb").Db, session?: import("mongodb").ClientSession, plan?: object, now?: Date }} [options] Contexto partilhado pelo checkout transacional.
 * @returns {Promise<{ subscription: object }>} Subscrição pública atualizada.
 */
export async function activateSubscription(userId, planCode, options = {}) {
  const db = options.db ?? (await getDb());
  const { session } = options;
  const plan = options.plan ?? await db.collection("subscription_plans").findOne(
    { code: String(planCode), active: true },
    { session },
  );
  if (!plan || entitlementsForPlan(plan).tier === "none") {
    throw httpError("Plano não encontrado.", 404);
  }

  const now = options.now ? new Date(options.now) : new Date();
  const interval = assertPlanInterval(plan.interval);
  const userIdObject = userObjectId(userId);
  const billingAnchor = billingAnchorForDate(now);
  const subscriptionPatch = {
    userId: userIdObject,
    planCode: plan.code,
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: addBillingCycle(now, interval, billingAnchor),
    billingAnchorDay: billingAnchor.anchorDay,
    billingAnchorEndOfMonth: billingAnchor.anchorEndOfMonth,
    cancelAtPeriodEnd: false,
    updatedAt: now,
  };

  await db.collection("subscriptions").updateOne(
    { userId: userIdObject },
    { $set: subscriptionPatch, $setOnInsert: { createdAt: now } },
    { upsert: true, session },
  );

  if (entitlementsForPlan(plan).familySharing) {
    await leaveFamilyWhenUserGetsOwnSubscription(db, userIdObject, now, session);
  } else {
    // O driver MongoDB não suporta operações paralelas na mesma transação.
    await disableOwnedFamilyWhenPlanDoesNotShare(
      db,
      userIdObject,
      now,
      session,
    );
    await leaveFamilyWhenUserGetsOwnSubscription(
      db,
      userIdObject,
      now,
      session,
    );
  }

  await createNotification(userId, {
    type: "subscription_activated",
    title: "Subscrição ativa",
    message: "A tua subscrição FaithFlix ficou ativa.",
  }, { db, session });

  const storedSubscription = await db.collection("subscriptions").findOne(
    { userId: userIdObject },
    { session },
  );
  return { subscription: publicSubscription(storedSubscription, plan) };
}

/**
 * Cria uma subscrição temporária de trial.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {Date | string} endsAt Data em que o acesso gratuito termina.
 * @param {{ db?: import("mongodb").Db, session?: import("mongodb").ClientSession, now?: Date }} [options] Contexto partilhado pelo trial transacional.
 * @returns {Promise<{ subscription: object }>} Subscrição pública.
 */
export async function grantTrialSubscription(userId, endsAt, options = {}) {
  const db = options.db ?? (await getDb());
  const { session } = options;
  const now = options.now ? new Date(options.now) : new Date();
  const periodEnd = new Date(endsAt);

  if (Number.isNaN(periodEnd.getTime()) || periodEnd <= now) {
    throw httpError("Data de fim de trial inválida.", 400);
  }

  const userIdObject = userObjectId(userId);
  const activePaidSubscription = await findActivePaidSubscription(db, userIdObject, now, session);

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
    { upsert: true, session },
  );

  const storedSubscription = await db.collection("subscriptions").findOne(
    { userId: userIdObject },
    { session },
  );
  return { subscription: publicSubscription(storedSubscription) };
}

/**
 * Constrói o estado familiar no contexto de DB/sessão recebido.
 *
 * @param {import("mongodb").Db} db Ligacao MongoDB.
 * @param {ObjectId} userIdObject Identificador do utilizador.
 * @param {import("mongodb").ClientSession | undefined} [session] Sessao transacional opcional.
 * @returns {Promise<object>} Overview familiar.
 */
async function buildFamilyOverview(db, userIdObject, session = undefined) {
  const { subscription, plan } = await loadOwnSubscription(
    db,
    userIdObject,
    session,
  );
  const ownEntitlements = entitlementsForSubscription(subscription, plan);
  const now = new Date();
  const canOwnFamily =
    hasSubscriptionAccess(subscription, now, plan) &&
    ownEntitlements.familySharing;

  const ownedRows = canOwnFamily
    ? await listOpenFamilyMemberships(db, userIdObject, session)
    : [];
  const pendingRows = await db.collection("subscription_family_memberships")
    .find(
      { memberUserId: userIdObject, status: "pending" },
      { session },
    )
    .sort({ createdAt: -1 })
    .toArray();
  const activeMembership = await db
    .collection("subscription_family_memberships")
    .findOne(
      { memberUserId: userIdObject, status: "active" },
      { sort: { acceptedAt: -1, createdAt: -1 }, session },
    );

  const ownedMembers = await publicMembershipsWithUsers(
    db,
    ownedRows,
    session,
  );
  const pendingInvitations = await publicMembershipsWithUsers(
    db,
    pendingRows,
    session,
  );
  const [publicActiveMembership] = activeMembership
    ? await publicMembershipsWithUsers(db, [activeMembership], session)
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
 * Devolve o estado familiar do utilizador autenticado.
 *
 * @param {string} userId Identificador da sessao.
 * @returns {Promise<object>} Overview familiar.
 */
export async function getFamilyOverview(userId) {
  const db = await getDb();
  return buildFamilyOverview(db, userObjectId(userId));
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
  const [effective, family, trial] = await Promise.all([
    getEffectiveSubscriptionAccess(userId),
    getFamilyOverview(userId),
    db.collection("trials").findOne(
      { userId: userIdObject },
      { projection: { _id: 1 } },
    ),
  ]);
  const ownSubscription = publicSubscription(subscription, plan);
  const ownEntitlements = entitlementsForSubscription(subscription, plan);
  const effectiveSubscription = publicSubscription(
    effective.subscription,
    effective.plan,
  );

  return {
    subscription: {
      ...ownSubscription,
      accessSource: ownSubscription.hasPremiumAccess ? "own" : "none",
      entitlements: ownEntitlements,
      familyAccess: null,
    },
    access: {
      ...effectiveSubscription,
      hasPremiumAccess: effective.hasPremiumAccess,
      accessSource: effective.accessSource,
      entitlements: effective.entitlements,
      familyAccess: effective.familyMembership
        ? publicFamilyMembership(effective.familyMembership)
        : null,
    },
    trialEligibility: effective.hasPremiumAccess
      ? "premium_active"
      : trial
        ? "already_used"
        : "available",
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
  const now = new Date();
  const ownerObjectId = userObjectId(ownerUserId);
  const email = assertValidEmail(input?.email);
  try {
    return await runInTransaction(async ({ db, session }) => {
      const targetUser = await db.collection("users").findOne(
        { email },
        { session },
      );

      if (!targetUser || targetUser.accountStatus === "deleted") {
        throw httpError("Utilizador convidado não encontrado.", 404);
      }

      if (String(targetUser._id) === String(ownerObjectId)) {
        throw httpError("Não podes convidar a tua própria conta.", 400);
      }

      await serializeBillingCustomers({
        db,
        userIds: [ownerObjectId, targetUser._id],
        now,
        session,
      });
      const { subscription, entitlements } = await serializeFamilyOwner(
        db,
        ownerObjectId,
        now,
        session,
      );
      const openMembershipCount = await countOpenFamilyMemberships(
        db,
        ownerObjectId,
        session,
      );
      const seatsAfterInvitation = 1 + openMembershipCount + 1;

      if (seatsAfterInvitation > entitlements.maxFamilyMembers) {
        throw httpError("Limite de utilizadores do plano Família atingido.", 409);
      }

      if (await findActivePaidSubscription(db, targetUser._id, now, session)) {
        throw httpError("Este utilizador já tem uma subscrição paga ativa.", 409);
      }

      const existingMembership = await db.collection("subscription_family_memberships").findOne(
        {
          memberUserId: targetUser._id,
          status: { $in: FAMILY_ACTIVE_STATUSES },
        },
        { session },
      );

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
      const result = await db.collection("subscription_family_memberships").insertOne(
        membership,
        { session },
      );
      const storedMembership = { ...membership, _id: result.insertedId };

      await createNotification(String(targetUser._id), {
        type: "family_invitation",
        title: "Convite familiar recebido",
        message: "Recebeste um convite para partilhar uma subscrição FaithFlix Família.",
      }, { db, session });

      return {
        invitation: publicFamilyMembership(storedMembership, { member: targetUser }),
        family: await buildFamilyOverview(db, ownerObjectId, session),
      };
    });
  } catch (error) {
    if (isDuplicateFamilyMembership(error)) {
      throw httpError("Este utilizador já tem uma partilha familiar ativa ou pendente.", 409);
    }
    throw error;
  }

}

/**
 * Aceita um convite familiar pendente.
 *
 * @param {string} memberUserId Utilizador autenticado.
 * @param {string} invitationId Id do convite.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function acceptFamilyInvitation(memberUserId, invitationId) {
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);
  const invitationObjectId = asObjectId(invitationId, "Convite");
  return runInTransaction(async ({ db, session }) => {
    const invitation = await db.collection("subscription_family_memberships").findOne(
      {
        _id: invitationObjectId,
        memberUserId: memberObjectId,
        status: "pending",
      },
      { session },
    );

    if (!invitation) {
      throw httpError("Convite familiar não encontrado.", 404);
    }

    await serializeBillingCustomers({
      db,
      userIds: [invitation.ownerUserId, memberObjectId],
      now,
      session,
    });
    const { entitlements } = await serializeFamilyOwner(
      db,
      invitation.ownerUserId,
      now,
      session,
    );

    if (await findActivePaidSubscription(db, memberObjectId, now, session)) {
      throw httpError("Não podes aceitar família com subscrição paga ativa.", 409);
    }

    const existingMembership = await db.collection("subscription_family_memberships").findOne(
      {
        _id: { $ne: invitationObjectId },
        memberUserId: memberObjectId,
        status: { $in: FAMILY_ACTIVE_STATUSES },
      },
      { session },
    );

    if (existingMembership) {
      throw httpError("Já existe uma partilha familiar ativa ou pendente.", 409);
    }

    const openMembershipCount = await countOpenFamilyMemberships(
      db,
      invitation.ownerUserId,
      session,
    );
    const occupiedSeats = 1 + openMembershipCount;

    if (occupiedSeats > entitlements.maxFamilyMembers) {
      throw httpError("Limite de utilizadores do plano Família atingido.", 409);
    }

    const result = await db.collection("subscription_family_memberships").updateOne(
      { _id: invitationObjectId, memberUserId: memberObjectId, status: "pending" },
      { $set: { status: "active", acceptedAt: now, updatedAt: now } },
      { session },
    );

    if (!result.matchedCount) {
      throw httpError("Convite familiar não encontrado.", 404);
    }

    await createNotification(String(invitation.ownerUserId), {
      type: "family_invitation_accepted",
      title: "Convite familiar aceite",
      message: "Um membro aceitou o teu convite FaithFlix Família.",
    }, { db, session });

    return { family: await buildFamilyOverview(db, memberObjectId, session) };
  });
}

/**
 * Recusa um convite familiar pendente.
 *
 * @param {string} memberUserId Utilizador autenticado.
 * @param {string} invitationId Id do convite.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function declineFamilyInvitation(memberUserId, invitationId) {
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);
  const invitationObjectId = asObjectId(invitationId, "Convite");
  return runInTransaction(async ({ db, session }) => {
    const result = await db.collection("subscription_family_memberships").updateOne(
      { _id: invitationObjectId, memberUserId: memberObjectId, status: "pending" },
      { $set: { status: "declined", declinedAt: now, updatedAt: now } },
      { session },
    );

    if (!result.matchedCount) {
      throw httpError("Convite familiar não encontrado.", 404);
    }

    return { family: await buildFamilyOverview(db, memberObjectId, session) };
  });
}

/**
 * Remove um membro da familia do owner.
 *
 * @param {string} ownerUserId Owner autenticado.
 * @param {string} memberUserId Membro alvo.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function removeFamilyMember(ownerUserId, memberUserId) {
  const now = new Date();
  const ownerObjectId = userObjectId(ownerUserId);
  const memberObjectId = asObjectId(memberUserId, "Membro");
  return runInTransaction(async ({ db, session }) => {
    await requireShareableFamilyPlan(db, ownerObjectId, now, session);

    const result = await db.collection("subscription_family_memberships").updateOne(
      {
        ownerUserId: ownerObjectId,
        memberUserId: memberObjectId,
        status: { $in: FAMILY_ACTIVE_STATUSES },
      },
      { $set: { status: "removed", removedAt: now, updatedAt: now } },
      { session },
    );

    if (!result.matchedCount) {
      throw httpError("Membro familiar não encontrado.", 404);
    }

    await createNotification(String(memberObjectId), {
      type: "family_member_removed",
      title: "Partilha familiar removida",
      message: "A tua partilha da subscrição FaithFlix Família foi removida.",
    }, { db, session });

    return { family: await buildFamilyOverview(db, ownerObjectId, session) };
  });
}

/**
 * Permite ao membro sair da familia ativa.
 *
 * @param {string} memberUserId Utilizador autenticado.
 * @returns {Promise<{ family: object }>} Overview familiar atualizado.
 */
export async function leaveFamily(memberUserId) {
  const now = new Date();
  const memberObjectId = userObjectId(memberUserId);
  return runInTransaction(async ({ db, session }) => {
    const result = await db.collection("subscription_family_memberships").updateOne(
      { memberUserId: memberObjectId, status: "active" },
      { $set: { status: "left", leftAt: now, updatedAt: now } },
      { session },
    );

    if (!result.matchedCount) {
      throw httpError("Partilha familiar ativa não encontrada.", 404);
    }

    return { family: await buildFamilyOverview(db, memberObjectId, session) };
  });
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

  // Compatibilidade interna: a renovação manual reutiliza a mesma unidade
  // transacional/idempotente do worker e nunca avança ciclos futuros.
  const { processSubscriptionCycle } = await import(
    "../jobs/billing-jobs.service.js"
  );
  const result = await processSubscriptionCycle(
    subscription._id,
    subscription.currentPeriodEnd,
    { referenceDate: now },
  );

  if (result.outcome === "not_due") {
    const error = httpError("A subscrição ainda não atingiu o fim do ciclo.", 409);
    error.code = "SUBSCRIPTION_NOT_DUE";
    throw error;
  }

  const storedSubscription = await db.collection("subscriptions").findOne({
    _id: subscription._id,
  });
  if (!storedSubscription || storedSubscription.status !== "active") {
    const error = httpError("A renovação não foi aprovada.", 409);
    error.code = "RENEWAL_NOT_APPROVED";
    throw error;
  }
  const plan = await db.collection("subscription_plans").findOne({
    code: storedSubscription.planCode,
  });

  return {
    subscription: publicSubscription(storedSubscription, plan),
  };
}

/**
 * Processa subscrições vencidas através do mesmo lease usado pelo worker.
 *
 * @param {Date} referenceDate Data usada para decidir vencimento.
 * @returns {Promise<object>} Resumo seguro dos jobs processados.
 */
export async function expireOverdueSubscriptions(referenceDate = new Date()) {
  const { runDueSubscriptionJobs } = await import(
    "../jobs/billing-jobs.service.js"
  );
  return runDueSubscriptionJobs({
    ownerId: `compat-expiry:${process.pid}`,
    referenceDate,
  });
}
