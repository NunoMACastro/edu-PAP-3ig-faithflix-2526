/**
 * @file Testes unitários da MF9: Pro/Família, partilha real e qualidade.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { hashPassword } from "../../src/modules/auth/auth.password.js";
import { getAdminMetrics } from "../../src/modules/admin-metrics/admin-metrics.service.js";
import { runMonthlyDistribution } from "../../src/modules/charities/pool-distribution.service.js";
import { createSimulatedCheckout } from "../../src/modules/payments/payments.service.js";
import {
  acceptFamilyInvitation,
  declineFamilyInvitation,
  ensureDefaultSubscriptionPlans,
  ensureSubscriptionIndexes,
  filterQualityOptionsByEntitlements,
  getEffectiveSubscriptionAccess,
  getFamilyOverview,
  getMySubscription,
  hasActiveSubscriptionAccess,
  inviteFamilyMember,
  listPlans,
  leaveFamily,
  removeFamilyMember,
} from "../../src/modules/subscriptions/subscriptions.service.js";
import { getPlayback } from "../../src/modules/playback/playback.service.js";
import { getPlaybackByContent } from "../../src/modules/playback/playback.controller.js";
import {
  buildUserDataExport,
  deleteMyAccount,
} from "../../src/modules/privacy/privacy.service.js";

/**
 * Compara identificadores MongoDB por valor textual.
 *
 * @param {unknown} left Valor esquerdo.
 * @param {unknown} right Valor direito.
 * @returns {boolean} Resultado da comparação.
 */
function sameId(left, right) {
  return String(left) === String(right);
}

/**
 * Lê valores aninhados através de caminhos `campo.subcampo`.
 *
 * @param {Record<string, unknown>} row Documento.
 * @param {string} path Caminho.
 * @returns {unknown} Valor encontrado.
 */
function valueForPath(row, path) {
  return path.split(".").reduce((current, key) => current?.[key], row);
}

/**
 * Aplica operadores MongoDB usados pelos services MF9.
 *
 * @param {Record<string, unknown>} row Documento alvo.
 * @param {Record<string, unknown>} update Update simplificado.
 * @param {boolean} isInsert Indica upsert.
 * @returns {Record<string, unknown>} Documento atualizado.
 */
function applyUpdate(row, update = {}, isInsert = false) {
  Object.assign(row, update.$set ?? {});

  if (isInsert) {
    Object.assign(row, update.$setOnInsert ?? {});
  }

  for (const key of Object.keys(update.$unset ?? {})) {
    delete row[key];
  }

  return row;
}

/**
 * Cria campos base de um filtro simples para upsert.
 *
 * @param {Record<string, unknown>} filter Filtro.
 * @returns {Record<string, unknown>} Documento base.
 */
function rowFromFilter(filter = {}) {
  return Object.fromEntries(
    Object.entries(filter).filter(
      ([key, value]) =>
        !key.startsWith("$") &&
        !(value && typeof value === "object" && !Array.isArray(value)),
    ),
  );
}

/**
 * Compara um valor com operadores MongoDB usados na suite.
 *
 * @param {unknown} actual Valor real.
 * @param {unknown} expected Condição esperada.
 * @returns {boolean} Verdadeiro quando cumpre.
 */
function matchesValue(actual, expected) {
  if (expected instanceof ObjectId) {
    return sameId(actual, expected);
  }

  if (expected && typeof expected === "object" && !Array.isArray(expected)) {
    if ("$in" in expected) return expected.$in.includes(actual);
    if ("$ne" in expected) return !sameId(actual, expected.$ne);
    if ("$gt" in expected && actual <= expected.$gt) return false;
    if ("$gte" in expected && actual < expected.$gte) return false;
    if ("$lt" in expected && actual >= expected.$lt) return false;
    if ("$lte" in expected && actual > expected.$lte) return false;
    if ("$exists" in expected) return (actual !== undefined) === expected.$exists;
    return true;
  }

  return actual === expected;
}

/**
 * Aplica query MongoDB mínima.
 *
 * @param {Record<string, unknown>} row Documento.
 * @param {Record<string, unknown>} query Query.
 * @returns {boolean} Verdadeiro quando corresponde.
 */
function matches(row, query = {}) {
  return Object.entries(query).every(([key, expected]) => {
    if (key === "$or") {
      return expected.some((nested) => matches(row, nested));
    }

    const actual = valueForPath(row, key);
    return matchesValue(actual, expected);
  });
}

/**
 * Comparador para sort simplificado.
 *
 * @param {Record<string, 1 | -1>} sort Ordenação.
 * @returns {(left: object, right: object) => number} Comparador.
 */
function compareBySort(sort = {}) {
  const entries = Object.entries(sort);

  return (left, right) => {
    for (const [key, direction] of entries) {
      const leftValue = valueForPath(left, key);
      const rightValue = valueForPath(right, key);

      if (leftValue < rightValue) return -1 * direction;
      if (leftValue > rightValue) return 1 * direction;
    }

    return 0;
  };
}

/**
 * Cria coleção em memória com subset MongoDB usado pela MF9.
 *
 * @param {Record<string, unknown>[]} initialRows Linhas iniciais.
 * @returns {Record<string, Function> & { rows: Record<string, unknown>[] }} Coleção fake.
 */
function collection(initialRows = []) {
  let rows = initialRows;

  return {
    rows,

    async createIndex() {},

    async findOne(query = {}, options = {}) {
      let result = rows.filter((row) => matches(row, query));
      if (options.sort) {
        result = result.toSorted(compareBySort(options.sort));
      }
      return result[0] ?? null;
    },

    async countDocuments(query = {}) {
      return rows.filter((row) => matches(row, query)).length;
    },

    find(query = {}) {
      let result = rows.filter((row) => matches(row, query));

      return {
        sort(sort) {
          result = result.toSorted(compareBySort(sort));
          return this;
        },
        limit(limit) {
          result = result.slice(0, limit);
          return this;
        },
        async toArray() {
          return result;
        },
      };
    },

    async insertOne(document) {
      const insertedId = document._id ?? new ObjectId();
      rows.push({ ...document, _id: insertedId });
      this.rows = rows;
      return { insertedId };
    },

    async updateOne(filter, update, options = {}) {
      const existing = rows.find((row) => matches(row, filter));

      if (existing) {
        applyUpdate(existing, update, false);
        return { matchedCount: 1, modifiedCount: 1 };
      }

      if (options.upsert) {
        rows.push(applyUpdate(rowFromFilter(filter), update, true));
        this.rows = rows;
      }

      return { matchedCount: 0, modifiedCount: 0 };
    },

    async updateMany(filter, update) {
      const matched = rows.filter((row) => matches(row, filter));
      matched.forEach((row) => applyUpdate(row, update, false));
      return { modifiedCount: matched.length };
    },

    async deleteMany(filter) {
      const before = rows.length;
      rows = rows.filter((row) => !matches(row, filter));
      this.rows = rows;
      return { deletedCount: before - rows.length };
    },

    async deleteOne(filter) {
      const index = rows.findIndex((row) => matches(row, filter));
      if (index === -1) return { deletedCount: 0 };
      rows.splice(index, 1);
      return { deletedCount: 1 };
    },

    aggregate(pipeline = []) {
      let result = rows;
      const matchStage = pipeline.find((stage) => stage.$match);
      const groupStage = pipeline.find((stage) => stage.$group);

      if (matchStage) {
        result = result.filter((row) => matches(row, matchStage.$match));
      }

      return {
        async toArray() {
          if (!groupStage) return result;

          const field = String(groupStage.$group.total.$sum).slice(1);
          const total = result.reduce(
            (sum, row) => sum + Number(valueForPath(row, field) ?? 0),
            0,
          );
          return [{ _id: null, total }];
        },
      };
    },
  };
}

/**
 * Instala coleções fake na configuração global de testes.
 *
 * @param {Record<string, ReturnType<typeof collection>>} collections Coleções.
 * @returns {Record<string, ReturnType<typeof collection>>} Coleções instaladas.
 */
function setCollectionsForTests(collections) {
  setDbForTests({
    collection(name) {
      collections[name] ??= collection([]);
      return collections[name];
    },
  });

  return collections;
}

/**
 * Cria planos Pro/Família para testes.
 *
 * @returns {Record<string, unknown>[]} Planos.
 */
function planRows() {
  return [
    {
      _id: new ObjectId(),
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
      active: true,
    },
    {
      _id: new ObjectId(),
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
      features: ["Perfil 2160p simulado"],
      active: true,
    },
    {
      _id: new ObjectId(),
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
      active: true,
    },
    {
      _id: new ObjectId(),
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
      active: true,
    },
  ];
}

afterEach(() => {
  setDbForTests(null);
});

test("MF9 publica planos Pro/Família com entitlements", async () => {
  setCollectionsForTests({
    subscription_plans: collection(planRows()),
  });

  const response = await listPlans();
  const family = response.plans.find((plan) => plan.code === "faithflix-family-monthly");
  const pro = response.plans.find((plan) => plan.code === "faithflix-monthly");

  assert.deepEqual(
    response.plans.map((plan) => plan.code).toSorted(),
    [
      "faithflix-family-monthly",
      "faithflix-family-yearly",
      "faithflix-monthly",
      "faithflix-yearly",
    ],
  );
  assert.equal(pro.tier, "pro");
  assert.equal(pro.maxQuality, "1080p");
  assert.equal(pro.qualityRank, 1080);
  assert.equal(family.tier, "family");
  assert.equal(family.maxQuality, "2160p");
  assert.equal(family.qualityRank, 2160);
  assert.equal(family.familySharing, true);
  assert.equal(family.maxFamilyMembers, 5);
  assert.deepEqual(family.features, ["Perfil 2160p"]);
});

test("F8 planos incompletos nunca recebem entitlements por defeito", async () => {
  const valid = planRows()[0];
  const malformedFamily = {
    ...planRows()[1],
    code: "family-sem-limite",
  };
  delete malformedFamily.maxFamilyMembers;
  const malformedQuality = {
    ...planRows()[1],
    code: "family-sem-qualidade",
  };
  delete malformedQuality.maxQuality;
  const coercedLimit = {
    ...planRows()[1],
    code: "family-limite-texto",
    maxFamilyMembers: "5",
  };
  const missingSharing = {
    ...planRows()[1],
    code: "family-sem-sharing",
  };
  delete missingSharing.familySharing;

  setCollectionsForTests({
    subscription_plans: collection([
      valid,
      malformedFamily,
      malformedQuality,
      coercedLimit,
      missingSharing,
    ]),
  });

  const response = await listPlans();

  assert.deepEqual(response.plans.map((plan) => plan.code), [valid.code]);
});

test("MF9 cria seed interno com planos Pro/Família e entitlements públicos", async () => {
  const collections = setCollectionsForTests({
    subscription_plans: collection([]),
    subscriptions: collection([]),
    subscription_family_memberships: collection([]),
  });

  await ensureSubscriptionIndexes();
  assert.equal(collections.subscription_plans.rows.length, 0);
  await ensureDefaultSubscriptionPlans();
  const response = await listPlans();
  const familyYearly = response.plans.find((plan) => plan.code === "faithflix-family-yearly");

  assert.equal(response.plans.length, 4);
  assert.equal(familyYearly.tier, "family");
  assert.equal(familyYearly.qualityRank, 2160);
  assert.equal(familyYearly.familySharing, true);
});

test("MF9 seed explícita não reescreve preço financeiro existente", async () => {
  const customPlan = {
    ...planRows()[0],
    priceCents: 1234,
    solidaritySharePercent: 17,
  };
  const collections = setCollectionsForTests({
    subscription_plans: collection([customPlan]),
  });

  await ensureDefaultSubscriptionPlans();

  const preserved = collections.subscription_plans.rows.find(
    (plan) => plan.code === customPlan.code,
  );
  assert.equal(preserved.priceCents, 1234);
  assert.equal(preserved.solidaritySharePercent, 17);
  assert.equal(collections.subscription_plans.rows.length, 4);
});

test("MF9 checkout simulado aceita plano Família ativo e rejeita plano inexistente", async () => {
  const userId = new ObjectId();
  const collections = setCollectionsForTests({
    users: collection([{ _id: userId, accountStatus: "active" }]),
    payment_attempts: collection([]),
    subscription_family_memberships: collection([]),
    subscription_plans: collection(planRows()),
    subscriptions: collection([]),
  });

  const checkout = await createSimulatedCheckout(
    String(userId),
    {
      planCode: "faithflix-family-monthly",
      paymentMethod: "card_test",
      simulateOutcome: "approved",
    },
    "mf9-family-checkout-001",
  );

  assert.equal(checkout.status, "approved");
  assert.equal(checkout.subscription.planCode, "faithflix-family-monthly");
  assert.equal(collections.payment_attempts.rows[0].planCode, "faithflix-family-monthly");

  await assert.rejects(
    () =>
      createSimulatedCheckout(
        String(userId),
        {
          planCode: "faithflix-family-inexistente",
          paymentMethod: "card_test",
          simulateOutcome: "approved",
        },
        "mf9-missing-plan-001",
      ),
    /Plano não encontrado/,
  );
});

test("F8 checkout recusa plano ativo com entitlements incompletos", async () => {
  const userId = new ObjectId();
  const malformedPlan = { ...planRows()[1] };
  delete malformedPlan.maxFamilyMembers;
  const collections = setCollectionsForTests({
    users: collection([{ _id: userId, accountStatus: "active" }]),
    payment_attempts: collection([]),
    subscription_family_memberships: collection([]),
    subscription_plans: collection([malformedPlan]),
    subscriptions: collection([]),
  });

  await assert.rejects(
    () =>
      createSimulatedCheckout(
        String(userId),
        {
          planCode: malformedPlan.code,
          paymentMethod: "card_test",
          simulateOutcome: "approved",
        },
        "mf9-malformed-plan-001",
      ),
    (error) => error.statusCode === 404 && error.code === "PLAN_NOT_FOUND",
  );
  assert.equal(collections.payment_attempts.rows.length, 0);
  assert.equal(collections.subscriptions.rows.length, 0);
});

test("MF9 partilha familiar cria convite, aceita e remove acesso efetivo", async () => {
  const ownerId = new ObjectId();
  const memberId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");
  const collections = setCollectionsForTests({
    users: collection([
      { _id: ownerId, name: "Owner", email: "owner@example.test", role: "user" },
      { _id: memberId, name: "Membro", email: "membro@example.test", role: "user" },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: ownerId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: future,
        cancelAtPeriodEnd: false,
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([]),
    notifications: collection([]),
  });

  const invite = await inviteFamilyMember(String(ownerId), {
    email: "membro@example.test",
  });
  assert.equal(invite.invitation.status, "pending");
  assert.equal(invite.family.ownedFamily.seatsUsed, 2);
  assert.equal(invite.family.ownedFamily.seatsAvailable, 3);

  const pendingOverview = await getFamilyOverview(String(memberId));
  assert.equal(pendingOverview.pendingInvitations.length, 1);
  assert.equal(pendingOverview.activeMembership, null);

  await acceptFamilyInvitation(String(memberId), invite.invitation.id);
  assert.equal(await hasActiveSubscriptionAccess(String(memberId)), true);

  const effective = await getEffectiveSubscriptionAccess(String(memberId));
  assert.equal(effective.accessSource, "family");
  assert.equal(effective.entitlements.maxQuality, "2160p");

  const activeOverview = await getFamilyOverview(String(memberId));
  assert.equal(activeOverview.pendingInvitations.length, 0);
  assert.equal(activeOverview.activeMembership.status, "active");

  await removeFamilyMember(String(ownerId), String(memberId));
  assert.equal(collections.subscription_family_memberships.rows[0].status, "removed");
  assert.equal(await hasActiveSubscriptionAccess(String(memberId)), false);
});

test("MF9 /me separa subscricao propria, acesso familiar e elegibilidade trial", async () => {
  const ownerId = new ObjectId();
  const memberId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");
  setCollectionsForTests({
    users: collection([
      { _id: ownerId, name: "Owner", email: "owner@example.test", accountStatus: "active" },
      { _id: memberId, name: "Membro", email: "member@example.test", accountStatus: "active" },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: ownerId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodStart: new Date("2026-07-01T00:00:00.000Z"),
        currentPeriodEnd: future,
        cancelAtPeriodEnd: false,
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([
      {
        _id: new ObjectId(),
        ownerUserId: ownerId,
        memberUserId: memberId,
        invitedEmail: "member@example.test",
        status: "active",
        createdAt: new Date("2026-07-01T00:00:00.000Z"),
        acceptedAt: new Date("2026-07-02T00:00:00.000Z"),
      },
    ]),
    trials: collection([]),
  });

  const mine = await getMySubscription(String(memberId));

  assert.equal(mine.subscription.status, "none");
  assert.equal(mine.subscription.hasPremiumAccess, false);
  assert.equal(mine.access.hasPremiumAccess, true);
  assert.equal(mine.access.accessSource, "family");
  assert.equal(mine.access.entitlements.tier, "family");
  assert.equal(mine.access.currentPeriodEnd, future);
  assert.equal(mine.trialEligibility, "premium_active");
});

test("MF9 /me distingue trial disponivel de trial ja utilizado", async () => {
  const availableId = new ObjectId();
  const usedId = new ObjectId();
  setCollectionsForTests({
    users: collection([
      { _id: availableId, accountStatus: "active" },
      { _id: usedId, accountStatus: "active" },
    ]),
    subscriptions: collection([]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([]),
    trials: collection([{ _id: new ObjectId(), userId: usedId, status: "expired" }]),
  });

  const available = await getMySubscription(String(availableId));
  const used = await getMySubscription(String(usedId));

  assert.equal(available.trialEligibility, "available");
  assert.equal(used.trialEligibility, "already_used");
});

test("MF9 bloqueia owner sem Família, membro pago, duplicado, auto-convite e email inexistente", async () => {
  const proOwnerId = new ObjectId();
  const familyOwnerId = new ObjectId();
  const paidMemberId = new ObjectId();
  const invitedMemberId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");

  setCollectionsForTests({
    users: collection([
      { _id: proOwnerId, name: "Owner Pro", email: "owner-pro@example.test", role: "user" },
      { _id: familyOwnerId, name: "Owner Família", email: "owner-family@example.test", role: "user" },
      { _id: paidMemberId, name: "Pago", email: "pago@example.test", role: "user" },
      { _id: invitedMemberId, name: "Convidado", email: "convidado@example.test", role: "user" },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: proOwnerId,
        status: "active",
        planCode: "faithflix-monthly",
        currentPeriodEnd: future,
      },
      {
        _id: new ObjectId(),
        userId: familyOwnerId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: future,
      },
      {
        _id: new ObjectId(),
        userId: paidMemberId,
        status: "active",
        planCode: "faithflix-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([
      {
        _id: new ObjectId(),
        ownerUserId: familyOwnerId,
        memberUserId: invitedMemberId,
        status: "pending",
        invitedEmail: "convidado@example.test",
      },
    ]),
    notifications: collection([]),
  });

  await assert.rejects(
    () => inviteFamilyMember(String(proOwnerId), { email: "pago@example.test" }),
    /Plano Família ativo/,
  );

  await assert.rejects(
    () => inviteFamilyMember(String(familyOwnerId), { email: "inexistente@example.test" }),
    /Utilizador convidado não encontrado/,
  );

  await assert.rejects(
    () => inviteFamilyMember(String(familyOwnerId), { email: "owner-family@example.test" }),
    /própria conta/,
  );

  await assert.rejects(
    () => inviteFamilyMember(String(familyOwnerId), { email: "pago@example.test" }),
    /subscrição paga ativa/,
  );

  await assert.rejects(
    () => inviteFamilyMember(String(familyOwnerId), { email: "convidado@example.test" }),
    /partilha familiar ativa ou pendente/,
  );
});

test("MF9 recusa convites, impede aceite por outro utilizador e permite sair da família", async () => {
  const ownerId = new ObjectId();
  const invitedMemberId = new ObjectId();
  const declinedMemberId = new ObjectId();
  const activeMemberId = new ObjectId();
  const otherUserId = new ObjectId();
  const invitationId = new ObjectId();
  const declinedInvitationId = new ObjectId();
  const activeMembershipId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");
  const collections = setCollectionsForTests({
    users: collection([
      { _id: ownerId, name: "Owner", email: "owner@example.test", role: "user" },
      { _id: invitedMemberId, name: "Convidado", email: "convidado@example.test", role: "user" },
      { _id: declinedMemberId, name: "Recusa", email: "recusa@example.test", role: "user" },
      { _id: activeMemberId, name: "Ativo", email: "ativo@example.test", role: "user" },
      { _id: otherUserId, name: "Outro", email: "outro@example.test", role: "user" },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: ownerId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([
      {
        _id: invitationId,
        ownerUserId: ownerId,
        memberUserId: invitedMemberId,
        status: "pending",
        invitedEmail: "convidado@example.test",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      {
        _id: declinedInvitationId,
        ownerUserId: ownerId,
        memberUserId: declinedMemberId,
        status: "pending",
        invitedEmail: "recusa@example.test",
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      },
      {
        _id: activeMembershipId,
        ownerUserId: ownerId,
        memberUserId: activeMemberId,
        status: "active",
        invitedEmail: "ativo@example.test",
        acceptedAt: new Date("2026-01-03T00:00:00.000Z"),
        createdAt: new Date("2026-01-03T00:00:00.000Z"),
      },
    ]),
    notifications: collection([]),
  });

  await assert.rejects(
    () => acceptFamilyInvitation(String(otherUserId), String(invitationId)),
    /Convite familiar não encontrado/,
  );

  await declineFamilyInvitation(String(declinedMemberId), String(declinedInvitationId));
  assert.equal(
    collections.subscription_family_memberships.rows.find((row) => sameId(row._id, declinedInvitationId)).status,
    "declined",
  );

  await leaveFamily(String(activeMemberId));
  assert.equal(
    collections.subscription_family_memberships.rows.find((row) => sameId(row._id, activeMembershipId)).status,
    "left",
  );
  assert.equal(await hasActiveSubscriptionAccess(String(activeMemberId)), false);
});

test("MF9 acesso familiar depende do owner manter plano Família ativo", async () => {
  const ownerId = new ObjectId();
  const memberId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");

  setCollectionsForTests({
    users: collection([
      { _id: ownerId, name: "Owner", email: "owner@example.test", role: "user" },
      { _id: memberId, name: "Membro", email: "membro@example.test", role: "user" },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: ownerId,
        status: "active",
        planCode: "faithflix-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([
      {
        _id: new ObjectId(),
        ownerUserId: ownerId,
        memberUserId: memberId,
        status: "active",
        invitedEmail: "membro@example.test",
        acceptedAt: new Date("2026-01-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]),
  });

  const effective = await getEffectiveSubscriptionAccess(String(memberId));
  assert.equal(effective.hasPremiumAccess, false);
  assert.equal(effective.accessSource, "none");
});

test("F8 subscrição incoerente ou sem plano ativo falha fechado", async () => {
  const scenarios = [
    {
      label: "estado desconhecido",
      status: "pending_review",
      planCode: "missing-plan",
      plans: [],
    },
    {
      label: "plano inexistente",
      status: "active",
      planCode: "missing-plan",
      plans: [],
    },
    {
      label: "plano inativo",
      status: "active",
      planCode: "faithflix-monthly",
      plans: planRows().map((plan) =>
        plan.code === "faithflix-monthly"
          ? { ...plan, active: false }
          : plan,
      ),
    },
    {
      label: "trial incoerente",
      status: "trialing",
      planCode: "faithflix-monthly",
      plans: planRows(),
    },
    {
      label: "plano family sem maxQuality",
      status: "active",
      planCode: "faithflix-family-monthly",
      plans: planRows().map((plan) => {
        if (plan.code !== "faithflix-family-monthly") return plan;
        const malformed = { ...plan };
        delete malformed.maxQuality;
        return malformed;
      }),
    },
    {
      label: "plano family sem maxFamilyMembers",
      status: "active",
      planCode: "faithflix-family-monthly",
      plans: planRows().map((plan) => {
        if (plan.code !== "faithflix-family-monthly") return plan;
        const malformed = { ...plan };
        delete malformed.maxFamilyMembers;
        return malformed;
      }),
    },
  ];

  for (const scenario of scenarios) {
    const userId = new ObjectId();
    setCollectionsForTests({
      users: collection([
        { _id: userId, accountStatus: "active", role: "user" },
      ]),
      subscriptions: collection([
        {
          _id: new ObjectId(),
          userId,
          status: scenario.status,
          planCode: scenario.planCode,
          currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
        },
      ]),
      subscription_plans: collection(scenario.plans),
      subscription_family_memberships: collection([]),
    });

    const effective = await getEffectiveSubscriptionAccess(String(userId));

    assert.equal(effective.hasPremiumAccess, false, scenario.label);
    assert.equal(effective.accessSource, "none", scenario.label);
    assert.equal(effective.entitlements.tier, "none", scenario.label);
  }
});

test("F8 bloqueio do owner revoga o acesso familiar derivado", async () => {
  const ownerId = new ObjectId();
  const memberId = new ObjectId();

  setCollectionsForTests({
    users: collection([
      { _id: ownerId, accountStatus: "blocked", role: "user" },
      { _id: memberId, accountStatus: "active", role: "user" },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: ownerId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([
      {
        _id: new ObjectId(),
        ownerUserId: ownerId,
        memberUserId: memberId,
        status: "active",
        acceptedAt: new Date("2026-01-01T00:00:00.000Z"),
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]),
  });

  const effective = await getEffectiveSubscriptionAccess(String(memberId));

  assert.equal(effective.hasPremiumAccess, false);
  assert.equal(effective.accessSource, "none");
  assert.equal(effective.entitlements.tier, "none");
});

test("MF9 filtra qualidade e não expõe playbackUrl bloqueado", () => {
  const filtered = filterQualityOptionsByEntitlements(
    [
      { value: "1080p", label: "Full HD", playbackUrl: "/__fixtures__/1080.mp4" },
      { value: "2160p", label: "4K", playbackUrl: "/__fixtures__/4k.mp4" },
    ],
    { qualityRank: 1080, maxQuality: "1080p" },
  );

  assert.equal(filtered[0].locked, false);
  assert.equal(filtered[0].playbackUrl, "/__fixtures__/1080.mp4");
  assert.equal(filtered[1].locked, true);
  assert.equal("playbackUrl" in filtered[1], false);
});

test("MF9 bloqueia qualidade desconhecida sem conservar aliases de fonte", () => {
  const [filtered] = filterQualityOptionsByEntitlements(
    [
      {
        value: "ultra",
        label: "Qualidade desconhecida",
        playbackUrl: "/__fixtures__/unknown.mp4",
        src: "/__fixtures__/unknown-alt.mp4",
        source: { url: "/__fixtures__/unknown-source.mp4" },
      },
    ],
    { qualityRank: 2160, maxQuality: "2160p" },
  );

  assert.equal(filtered.locked, true);
  assert.match(filtered.lockedReason, /não suportada/u);
  assert.equal("playbackUrl" in filtered, false);
  assert.equal("src" in filtered, false);
  assert.equal("source" in filtered, false);
});

test("MF9 playback usa o asset privado dentro da qualidade permitida", async () => {
  const userId = new ObjectId();
  const contentId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");

  setCollectionsForTests({
    users: collection([{ _id: userId, parentalMaxAgeRating: 18 }]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId,
        status: "active",
        planCode: "faithflix-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    media_preferences: collection([
      {
        _id: new ObjectId(),
        userId,
        values: { subtitleLanguage: "", audioLanguage: "", quality: "2160p" },
      },
    ]),
    playback_progress: collection([]),
    contents: collection([
      {
        _id: contentId,
        title: "Documentário",
        status: "published",
        mediaStatus: "ready",
        ageRating: 12,
        durationSeconds: 1200,
        media: {
          url: "/api/media/64f200000000000000000081",
          protocol: "progressive",
          mimeType: "video/mp4",
          quality: "1080p",
        },
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [
          { value: "1080p", label: "Full HD", playbackUrl: "/__fixtures__/1080.mp4" },
          { value: "2160p", label: "4K", playbackUrl: "/__fixtures__/4k.mp4" },
        ],
      },
    ]),
  });

  const response = await getPlayback(String(contentId), String(userId));

  assert.equal(response.content.source.url, "/api/media/64f200000000000000000081");
  assert.equal(response.content.source.protocol, "progressive");
  assert.equal(response.content.source.mimeType, "video/mp4");
  assert.equal(response.content.qualityOptions[1].locked, true);
  assert.equal(response.content.qualityOptions[0].selected, true);
  assert.equal(response.content.qualityOptions[1].selected, false);
  assert.equal("playbackUrl" in response.content.qualityOptions[1], false);
  assert.equal("playbackUrl" in response.content.qualityOptions[0], false);

  const responseState = { statusCode: null, body: null, headers: {} };
  const responseDouble = {
    setHeader(name, value) {
      responseState.headers[name.toLowerCase()] = value;
    },
    status(statusCode) {
      responseState.statusCode = statusCode;
      return this;
    },
    json(body) {
      responseState.body = body;
      return this;
    },
  };

  await getPlaybackByContent(
    { params: { contentId: String(contentId) }, user: { id: String(userId) } },
    responseDouble,
  );

  assert.equal(responseState.statusCode, 200);
  assert.equal(responseState.headers["cache-control"], "private, no-store");
  assert.equal(responseState.body.content.source.url, "/api/media/64f200000000000000000081");
});

test("MF9 playback permite perfil 2160p simulado ao plano Família", async () => {
  const userId = new ObjectId();
  const contentId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");

  setCollectionsForTests({
    users: collection([{ _id: userId, parentalMaxAgeRating: 18 }]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    media_preferences: collection([
      {
        _id: new ObjectId(),
        userId,
        values: { subtitleLanguage: "", audioLanguage: "", quality: "2160p" },
      },
    ]),
    playback_progress: collection([]),
    contents: collection([
      {
        _id: contentId,
        title: "Concerto 2160p simulado",
        status: "published",
        mediaStatus: "ready",
        ageRating: 10,
        durationSeconds: 1800,
        media: {
          url: "/api/media/64f200000000000000000082",
          protocol: "progressive",
          mimeType: "video/mp4",
          quality: "2160p",
        },
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [
          { value: "1080p", label: "Full HD", playbackUrl: "/__fixtures__/1080.mp4" },
          { value: "2160p", label: "4K", playbackUrl: "/__fixtures__/4k.mp4" },
        ],
      },
    ]),
  });

  const response = await getPlayback(String(contentId), String(userId));

  assert.equal(response.content.entitlements.tier, "family");
  assert.equal(response.content.source.url, "/api/media/64f200000000000000000082");
  assert.equal(response.content.qualityOptions[1].locked, false);
  assert.equal(response.content.qualityOptions[1].selected, true);
  assert.equal("playbackUrl" in response.content.qualityOptions[1], false);
});

test("MF9 playback rejeita media pending ou ready sem fonte com MEDIA_NOT_READY", async () => {
  const userId = new ObjectId();
  const contentId = new ObjectId();
  const baseContent = {
    _id: contentId,
    title: "Conteúdo ainda indisponível",
    status: "published",
    ageRating: 6,
    durationSeconds: 300,
    tracks: { subtitles: [], audio: [] },
    qualityOptions: [],
  };

  setCollectionsForTests({
    users: collection([{ _id: userId, parentalMaxAgeRating: 18 }]),
    contents: collection([
      {
        ...baseContent,
        mediaStatus: "pending",
        media: { playbackUrl: "/__fixtures__/private-pending.mp4" },
      },
    ]),
  });

  await assert.rejects(
    () => getPlayback(String(contentId), String(userId)),
    (error) => {
      assert.equal(error.statusCode, 409);
      assert.equal(error.code, "MEDIA_NOT_READY");
      return true;
    },
  );

  setCollectionsForTests({
    users: collection([{ _id: userId, parentalMaxAgeRating: 18 }]),
    contents: collection([
      {
        ...baseContent,
        mediaStatus: "ready",
        media: { playbackUrl: "" },
      },
    ]),
  });

  await assert.rejects(
    () => getPlayback(String(contentId), String(userId)),
    (error) => {
      assert.equal(error.statusCode, 409);
      assert.equal(error.code, "MEDIA_NOT_READY");
      return true;
    },
  );
});

test("MF9 playback aplica o limite parental antes de devolver qualquer fonte", async () => {
  const userId = new ObjectId();
  const contentId = new ObjectId();

  setCollectionsForTests({
    users: collection([{ _id: userId, parentalMaxAgeRating: 12 }]),
    contents: collection([
      {
        _id: contentId,
        title: "Conteúdo adulto",
        status: "published",
        mediaStatus: "ready",
        ageRating: 16,
        durationSeconds: 300,
        media: { playbackUrl: "/__fixtures__/private.mp4" },
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [],
      },
    ]),
  });

  await assert.rejects(
    () => getPlayback(String(contentId), String(userId)),
    (error) => {
      assert.equal(error.statusCode, 403);
      assert.match(error.message, /parental/u);
      return true;
    },
  );
});

test("MF9 playback ignora quality src e usa apenas o asset privado ativo", async () => {
  const userId = new ObjectId();
  const contentId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");

  setCollectionsForTests({
    users: collection([{ _id: userId, parentalMaxAgeRating: 18 }]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId,
        status: "active",
        planCode: "faithflix-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    media_preferences: collection([]),
    playback_progress: collection([]),
    contents: collection([
      {
        _id: contentId,
        title: "Fonte compatível",
        status: "published",
        mediaStatus: "ready",
        ageRating: 6,
        durationSeconds: 300,
        media: {
          url: "/api/media/64f200000000000000000083",
          protocol: "progressive",
          mimeType: "video/mp4",
          quality: "1080p",
        },
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [
          {
            value: "1080p",
            label: "Full HD",
            src: "/__fixtures__/compatible-source.mp4",
          },
        ],
      },
    ]),
  });

  const response = await getPlayback(String(contentId), String(userId));

  assert.equal(
    response.content.source.url,
    "/api/media/64f200000000000000000083",
  );
  assert.equal("src" in response.content.qualityOptions[0], false);
  assert.equal("playbackUrl" in response.content.qualityOptions[0], false);
});

test("MF9 preserva negativos de conteúdo não publicado e subscrição expirada", async () => {
  const userId = new ObjectId();
  const contentId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");

  setCollectionsForTests({
    users: collection([{ _id: userId, parentalMaxAgeRating: 18 }]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    media_preferences: collection([]),
    playback_progress: collection([]),
    contents: collection([
      {
        _id: contentId,
        title: "Rascunho interno",
        status: "draft",
        mediaStatus: "ready",
        ageRating: 10,
        durationSeconds: 600,
        media: { playbackUrl: "/__fixtures__/draft.mp4" },
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [
          { value: "2160p", label: "4K", playbackUrl: "/__fixtures__/draft-4k.mp4" },
        ],
      },
    ]),
  });

  await assert.rejects(
    () => getPlayback(String(contentId), String(userId)),
    /Conteudo nao encontrado/,
  );

  setCollectionsForTests({
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId,
        status: "active",
        planCode: "faithflix-family-monthly",
        currentPeriodEnd: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([]),
  });

  assert.equal(
    await hasActiveSubscriptionAccess(String(userId), new Date("2026-07-03T00:00:00.000Z")),
    false,
  );
});

test("MF9 exporta e invalida memberships familiares na eliminação de conta", async () => {
  const userId = new ObjectId();
  const memberId = new ObjectId();
  const membershipId = new ObjectId();
  const collections = setCollectionsForTests({
    users: collection([
      {
        _id: userId,
        name: "Owner",
        email: "owner@example.test",
        passwordHash: await hashPassword("password1234"),
        role: "user",
        accountStatus: "active",
      },
    ]),
    subscription_family_memberships: collection([
      {
        _id: membershipId,
        ownerUserId: userId,
        memberUserId: memberId,
        invitedEmail: "membro@example.test",
        status: "active",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]),
    sessions: collection([]),
    subscriptions: collection([]),
    content_comments: collection([]),
    privacy_deletion_requests: collection([]),
  });

  const exported = await buildUserDataExport(String(userId));
  assert.equal(exported.sections.subscription_family_memberships.length, 1);

  const deleted = await deleteMyAccount(String(userId), {
    confirmation: "ELIMINAR CONTA",
    password: "password1234",
  });

  assert.equal(deleted.familyMembershipsUpdated, 1);
  assert.equal(collections.subscription_family_memberships.rows[0].status, "removed");
  assert.equal(
    "invitedEmail" in collections.subscription_family_memberships.rows[0],
    false,
  );
});

test("MF9 metricas admin agregam família sem expor dados pessoais", async () => {
  const ownerId = new ObjectId();
  const memberId = new ObjectId();
  const pendingMemberId = new ObjectId();
  const from = "2026-01-01";
  const to = "2026-01-31";

  setCollectionsForTests({
    users: collection([
      { _id: ownerId, accountStatus: "active", email: "owner@example.test" },
      { _id: new ObjectId(), email: "sem-estado@example.test" },
      { _id: new ObjectId(), accountStatus: "blocked" },
      { _id: new ObjectId(), accountStatus: "deleted" },
    ]),
    contents: collection([{ _id: new ObjectId(), status: "published" }]),
    subscriptions: collection([
      { _id: new ObjectId(), status: "active" },
      { _id: new ObjectId(), status: "trialing" },
    ]),
    subscription_family_memberships: collection([
      {
        _id: new ObjectId(),
        ownerUserId: ownerId,
        memberUserId: memberId,
        invitedEmail: "membro@example.test",
        status: "active",
      },
      {
        _id: new ObjectId(),
        ownerUserId: ownerId,
        memberUserId: new ObjectId(),
        invitedEmail: "segundo@example.test",
        status: "active",
      },
      {
        _id: new ObjectId(),
        ownerUserId: ownerId,
        memberUserId: pendingMemberId,
        invitedEmail: "pendente@example.test",
        status: "pending",
      },
      {
        _id: new ObjectId(),
        ownerUserId: ownerId,
        memberUserId: new ObjectId(),
        invitedEmail: "removido@example.test",
        status: "removed",
      },
    ]),
    notifications: collection([
      { _id: new ObjectId(), createdAt: new Date("2026-01-10T00:00:00.000Z") },
    ]),
    privacy_deletion_requests: collection([
      { _id: new ObjectId(), requestedAt: new Date("2026-01-11T00:00:00.000Z") },
    ]),
    user_consent_events: collection([
      { _id: new ObjectId(), changedAt: new Date("2026-01-12T00:00:00.000Z") },
    ]),
    charities: collection([
      { _id: new ObjectId(), status: "active", poolStatus: "eligible" },
    ]),
    pool_distributions: collection([
      {
        _id: new ObjectId(),
        createdAt: new Date("2026-01-15T00:00:00.000Z"),
        totalPoolCents: 3200,
      },
    ]),
  });

  const metrics = await getAdminMetrics({ from, to });
  const metricsJson = JSON.stringify(metrics);

  assert.equal(metrics.users.active, 2);
  assert.equal(metrics.users.blocked, 1);
  assert.equal(metrics.users.deleted, 1);
  assert.equal(metrics.subscriptions.active, 1);
  assert.equal(metrics.subscriptions.trialing, 1);
  assert.equal(metrics.subscriptions.familyMembers, 2);
  assert.equal(metrics.subscriptions.familyInvitationsPending, 1);
  assert.equal(metrics.privacy.deletionRequests, 1);
  assert.equal(metrics.notifications.created, 1);
  assert.equal(metrics.solidarity.distributedCents, 3200);
  assert.equal(metricsJson.includes("membro@example.test"), false);
  assert.equal(metricsJson.includes(String(memberId)), false);
  assert.equal(metricsJson.includes(String(pendingMemberId)), false);
});

test("MF9 pool solidária ignora memberships familiares como receita paga", async () => {
  const ownerId = new ObjectId();
  const firstMemberId = new ObjectId();
  const secondMemberId = new ObjectId();
  const charityId = new ObjectId();

  setCollectionsForTests({
    subscription_plans: collection([
      {
        _id: new ObjectId(),
        code: "faithflix-family-monthly",
        interval: "monthly",
        priceCents: 1299,
        solidaritySharePercent: 20,
        active: true,
      },
    ]),
    subscriptions: collection([
      {
        _id: new ObjectId(),
        userId: ownerId,
        planCode: "faithflix-family-monthly",
        status: "active",
        currentPeriodEnd: new Date("2099-01-01T00:00:00.000Z"),
      },
    ]),
    subscription_family_memberships: collection([
      {
        _id: new ObjectId(),
        ownerUserId: ownerId,
        memberUserId: firstMemberId,
        status: "active",
      },
      {
        _id: new ObjectId(),
        ownerUserId: ownerId,
        memberUserId: secondMemberId,
        status: "active",
      },
    ]),
    payment_attempts: collection([
      {
        _id: new ObjectId(),
        schemaVersion: 2,
        status: "approved",
        amountCents: 1299,
        currency: "EUR",
        solidaritySharePercent: 20,
        approvedAt: new Date("2026-07-15T00:00:00.000Z"),
        accountingEstimate: false,
      },
    ]),
    charities: collection([
      {
        _id: charityId,
        name: "Associação Esperança",
        status: "active",
        poolStatus: "eligible",
        approvedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ]),
    pool_distributions: collection([]),
  });

  const response = await runMonthlyDistribution(
    "2026-07",
    String(new ObjectId()),
    { referenceDate: new Date("2026-09-01T00:00:00.000Z") },
  );

  assert.equal(response.distribution.totalPoolCents, 260);
  assert.equal(response.distribution.items.length, 1);
  assert.equal(response.distribution.items[0].charityId, String(charityId));
});
