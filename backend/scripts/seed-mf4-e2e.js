/**
 * @file Seed local para o fluxo E2E da MF4.
 *
 * Cria utilizadores, uma associação elegível, membership e distribuição mensal
 * de teste sem tocar em dados que não estejam marcados com `e2eFixture`.
 */

import { ObjectId } from "mongodb";
import { ensureAuthIndexes } from "../src/modules/auth/auth.indexes.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";
import { ensureCharityApplicationIndexes } from "../src/modules/charities/charity-applications.service.js";
import { ensureCharityReportIndexes } from "../src/modules/charities/charity-reports.service.js";
import { ensureCharityIndexes } from "../src/modules/charities/charity-review.service.js";
import { ensurePoolDistributionIndexes } from "../src/modules/charities/pool-distribution.service.js";
import { ensureNotificationIndexes } from "../src/modules/notifications/notifications.service.js";
import { ensurePaymentIndexes } from "../src/modules/payments/payments.service.js";
import {
  ensureDefaultSubscriptionPlans,
  ensureSubscriptionIndexes,
} from "../src/modules/subscriptions/subscriptions.service.js";
import {
  cleanupMarkedFixtureCollections,
  runE2eSeedCli,
} from "./seed-safety.js";

const E2E_TAG = "mf4-e2e";
const ADMIN_EMAIL = "admin-mf4@faithflix.test";
const USER_EMAIL = "user-mf4@faithflix.test";
const CHARITY_USER_EMAIL = "charity-mf4@faithflix.test";
const APPLICATION_EMAIL = "candidatura-mf4@faithflix.test";
const CHARITY_NAME = "Associação Esperança MF4";
const DISTRIBUTION_MONTH = "2026-06";
const FIXTURE_OPTIONS = {
  markerField: "e2eFixture",
  markerValue: E2E_TAG,
};

const adminId = new ObjectId("64f401000000000000000001");
const userId = new ObjectId("64f401000000000000000002");
const charityUserId = new ObjectId("64f401000000000000000003");
const applicationId = new ObjectId("64f402000000000000000001");
const charityId = new ObjectId("64f403000000000000000001");
const distributionId = new ObjectId("64f404000000000000000001");

/**
 * Cria um utilizador de fixture com password conhecida.
 *
 * @param {ObjectId} _id Identificador fixo do utilizador.
 * @param {string} email Email do utilizador.
 * @param {"admin" | "user"} role Role a atribuir.
 * @param {Date} now Data de criação.
 * @returns {Promise<object>} Documento pronto para inserir.
 */
async function fixtureUser(_id, email, role, now) {
  return {
    _id,
    name: role === "admin" ? "Admin MF4" : "Utilizador MF4",
    email,
    passwordHash: await hashPassword("password-segura-123"),
    role,
    parentalMaxAgeRating: 18,
    e2eFixture: E2E_TAG,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Prepara o conjunto de dados isolado da MF4.
 *
 * @param {import("mongodb").Db} db Base `_e2e` autorizada pelo guard.
 * @returns {Promise<void>}
 */
async function seedMf4E2e(db) {
const now = new Date();

await ensureAuthIndexes();
await ensureSubscriptionIndexes();
await ensureDefaultSubscriptionPlans();
await ensurePaymentIndexes();
await ensureNotificationIndexes();
await ensureCharityApplicationIndexes();
await ensureCharityIndexes();
await ensurePoolDistributionIndexes();
await ensureCharityReportIndexes();

await cleanupMarkedFixtureCollections(
  db,
  [
    {
      collectionName: "sessions",
      clauses: [{ userId: { $in: [adminId, userId, charityUserId] } }],
      label: "Sessoes reservadas MF4",
    },
    {
      collectionName: "users",
      clauses: [
        { _id: { $in: [adminId, userId, charityUserId] } },
        { email: { $in: [ADMIN_EMAIL, USER_EMAIL, CHARITY_USER_EMAIL] } },
      ],
      label: "Utilizadores reservados MF4",
    },
    {
      collectionName: "subscriptions",
      clauses: [{ userId: { $in: [userId, charityUserId] } }],
      label: "Subscricoes reservadas MF4",
    },
    {
      collectionName: "trials",
      clauses: [{ userId: { $in: [userId, charityUserId] } }],
      label: "Trials reservados MF4",
    },
    {
      collectionName: "payment_attempts",
      clauses: [{ userId: { $in: [userId, charityUserId] } }],
      label: "Pagamentos reservados MF4",
    },
    {
      collectionName: "notifications",
      clauses: [{ userId: { $in: [userId, charityUserId] } }],
      label: "Notificacoes reservadas MF4",
    },
    {
      collectionName: "charity_applications",
      clauses: [
        { _id: applicationId },
        { email: APPLICATION_EMAIL },
        { email: /^candidatura-\d+@faithflix\.test$/u },
        { name: /^Associacao E2E MF4/u },
      ],
      label: "Candidaturas reservadas MF4",
    },
    {
      collectionName: "charities",
      clauses: [
        { _id: charityId },
        { name: CHARITY_NAME },
        { name: /^Associacao E2E MF4/u },
      ],
      label: "Associacoes reservadas MF4",
    },
    {
      collectionName: "charity_memberships",
      clauses: [{ userId: charityUserId }, { charityId }],
      label: "Memberships reservadas MF4",
    },
    {
      collectionName: "pool_distributions",
      clauses: [{ _id: distributionId }, { month: DISTRIBUTION_MONTH }],
      label: "Distribuicoes reservadas MF4",
    },
  ],
  FIXTURE_OPTIONS,
);

await db.collection("users").insertMany([
  await fixtureUser(adminId, ADMIN_EMAIL, "admin", now),
  await fixtureUser(userId, USER_EMAIL, "user", now),
  await fixtureUser(charityUserId, CHARITY_USER_EMAIL, "user", now),
]);

await db.collection("subscriptions").insertOne({
  userId,
  planCode: "faithflix-monthly",
  status: "active",
  currentPeriodStart: now,
  currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
  cancelAtPeriodEnd: false,
  e2eFixture: E2E_TAG,
  createdAt: now,
  updatedAt: now,
});

await db.collection("charity_applications").insertOne({
  _id: applicationId,
  name: CHARITY_NAME,
  contactName: "Ana Silva",
  email: APPLICATION_EMAIL,
  phone: "910000000",
  mission: "Apoio comunitário cristão com acompanhamento social local.",
  websiteUrl: "https://example.test/",
  status: "approved",
  submittedAt: now,
  reviewedAt: now,
  reviewedBy: adminId,
  reviewReason: "",
  e2eFixture: E2E_TAG,
  createdAt: now,
  updatedAt: now,
});

await db.collection("charities").insertOne({
  _id: charityId,
  applicationId,
  name: CHARITY_NAME,
  mission: "Apoio comunitário cristão com acompanhamento social local.",
  websiteUrl: "https://example.test/",
  contactEmail: APPLICATION_EMAIL,
  status: "active",
  poolStatus: "eligible",
  approvedAt: now,
  approvedBy: adminId,
  e2eFixture: E2E_TAG,
  createdAt: now,
  updatedAt: now,
});

await db.collection("charity_memberships").insertOne({
  userId: charityUserId,
  charityId,
  createdBy: adminId,
  e2eFixture: E2E_TAG,
  createdAt: now,
  updatedAt: now,
});

await db.collection("pool_distributions").insertOne({
  _id: distributionId,
  month: DISTRIBUTION_MONTH,
  totalPoolCents: 160,
  status: "completed",
  items: [
    {
      charityId,
      charityName: CHARITY_NAME,
      amountCents: 160,
      rotationPosition: 1,
    },
  ],
  createdBy: adminId,
  e2eFixture: E2E_TAG,
  createdAt: now,
});

console.log(
  [
    "Seed MF4 E2E concluída:",
    `admin=${ADMIN_EMAIL}`,
    `user=${USER_EMAIL}`,
    `charityUser=${CHARITY_USER_EMAIL}`,
    `charity=${CHARITY_NAME}`,
    `applicationEmail=${APPLICATION_EMAIL}`,
    `distributionMonth=${DISTRIBUTION_MONTH}`,
  ].join(" "),
);
}

await runE2eSeedCli(seedMf4E2e, "Seed MF4 E2E");
