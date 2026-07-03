/**
 * @file Testes unitários da MF9: Pro/Família, partilha real e qualidade.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
  acceptFamilyInvitation,
  filterQualityOptionsByEntitlements,
  getEffectiveSubscriptionAccess,
  hasActiveSubscriptionAccess,
  inviteFamilyMember,
  listPlans,
  removeFamilyMember,
} from "../../src/modules/subscriptions/subscriptions.service.js";
import { getPlayback } from "../../src/modules/playback/playback.service.js";
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
    if ("$lte" in expected && actual > expected.$lte) return false;
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
      name: "FaithFlix Familia Mensal",
      interval: "monthly",
      priceCents: 1299,
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

  assert.equal(pro.tier, "pro");
  assert.equal(pro.maxQuality, "1080p");
  assert.equal(family.tier, "family");
  assert.equal(family.familySharing, true);
  assert.equal(family.maxFamilyMembers, 5);
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

  await acceptFamilyInvitation(String(memberId), invite.invitation.id);
  assert.equal(await hasActiveSubscriptionAccess(String(memberId)), true);

  const effective = await getEffectiveSubscriptionAccess(String(memberId));
  assert.equal(effective.accessSource, "family");
  assert.equal(effective.entitlements.maxQuality, "2160p");

  await removeFamilyMember(String(ownerId), String(memberId));
  assert.equal(collections.subscription_family_memberships.rows[0].status, "removed");
  assert.equal(await hasActiveSubscriptionAccess(String(memberId)), false);
});

test("MF9 bloqueia convites sem plano Família e membros com subscrição paga", async () => {
  const proOwnerId = new ObjectId();
  const paidMemberId = new ObjectId();
  const future = new Date("2999-01-01T00:00:00.000Z");

  setCollectionsForTests({
    users: collection([
      { _id: proOwnerId, name: "Owner Pro", email: "owner-pro@example.test", role: "user" },
      { _id: paidMemberId, name: "Pago", email: "pago@example.test", role: "user" },
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
        userId: paidMemberId,
        status: "active",
        planCode: "faithflix-monthly",
        currentPeriodEnd: future,
      },
    ]),
    subscription_plans: collection(planRows()),
    subscription_family_memberships: collection([]),
  });

  await assert.rejects(
    () => inviteFamilyMember(String(proOwnerId), { email: "pago@example.test" }),
    /Plano Família ativo/,
  );
});

test("MF9 filtra qualidade e não expõe playbackUrl bloqueado", () => {
  const filtered = filterQualityOptionsByEntitlements(
    [
      { value: "1080p", label: "Full HD", playbackUrl: "https://media/1080.mp4" },
      { value: "2160p", label: "4K", playbackUrl: "https://media/4k.mp4" },
    ],
    { qualityRank: 1080, maxQuality: "1080p" },
  );

  assert.equal(filtered[0].locked, false);
  assert.equal(filtered[0].playbackUrl, "https://media/1080.mp4");
  assert.equal(filtered[1].locked, true);
  assert.equal("playbackUrl" in filtered[1], false);
});

test("MF9 playback faz fallback para qualidade permitida", async () => {
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
        ageRating: 12,
        durationSeconds: 1200,
        media: { playbackUrl: "https://media/default.mp4" },
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [
          { value: "1080p", label: "Full HD", playbackUrl: "https://media/1080.mp4" },
          { value: "2160p", label: "4K", playbackUrl: "https://media/4k.mp4" },
        ],
      },
    ]),
  });

  const response = await getPlayback(String(contentId), String(userId));

  assert.equal(response.content.media.playbackUrl, "https://media/1080.mp4");
  assert.equal(response.content.qualityOptions[1].locked, true);
  assert.equal("playbackUrl" in response.content.qualityOptions[1], false);
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
  });

  assert.equal(deleted.familyMembershipsUpdated, 1);
  assert.equal(collections.subscription_family_memberships.rows[0].status, "removed");
});
