/**
 * @file Seed local para o fluxo E2E da MF4.
 *
 * Cria utilizadores, uma associação elegível, membership e distribuição mensal
 * de teste sem tocar em dados que não estejam marcados com `e2eFixture`.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../src/config/database.js";
import { ensureAuthIndexes } from "../src/modules/auth/auth.indexes.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";
import { ensureCharityApplicationIndexes } from "../src/modules/charities/charity-applications.service.js";
import { ensureCharityReportIndexes } from "../src/modules/charities/charity-reports.service.js";
import { ensureCharityIndexes } from "../src/modules/charities/charity-review.service.js";
import { ensurePoolDistributionIndexes } from "../src/modules/charities/pool-distribution.service.js";
import { ensureNotificationIndexes } from "../src/modules/notifications/notifications.service.js";
import { ensurePaymentIndexes } from "../src/modules/payments/payments.service.js";
import { ensureSubscriptionIndexes } from "../src/modules/subscriptions/subscriptions.service.js";

const E2E_TAG = "mf4-e2e";
const ADMIN_EMAIL = "admin-mf4@faithflix.test";
const USER_EMAIL = "user-mf4@faithflix.test";
const CHARITY_USER_EMAIL = "charity-mf4@faithflix.test";
const APPLICATION_EMAIL = "candidatura-mf4@faithflix.test";
const CHARITY_NAME = "Associação Esperança MF4";
const DISTRIBUTION_MONTH = "2026-06";

const adminId = new ObjectId("64f401000000000000000001");
const userId = new ObjectId("64f401000000000000000002");
const charityUserId = new ObjectId("64f401000000000000000003");
const applicationId = new ObjectId("64f402000000000000000001");
const charityId = new ObjectId("64f403000000000000000001");
const distributionId = new ObjectId("64f404000000000000000001");

/**
 * Remove documentos que pertencem ao fixture E2E ou colidem com identificadores fixos.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @param {string} collectionName Nome da coleção.
 * @param {object[]} clauses Condições alternativas de remoção.
 * @returns {Promise<void>}
 */
async function deleteByAny(db, collectionName, clauses) {
  if (clauses.length === 0) {
    return;
  }

  await db.collection(collectionName).deleteMany({ $or: clauses });
}

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

const db = await getDb();
const now = new Date();

await ensureAuthIndexes();
await ensureSubscriptionIndexes();
await ensurePaymentIndexes();
await ensureNotificationIndexes();
await ensureCharityApplicationIndexes();
await ensureCharityIndexes();
await ensurePoolDistributionIndexes();
await ensureCharityReportIndexes();

await deleteByAny(db, "sessions", [
  { userId: adminId },
  { userId },
  { userId: charityUserId },
  { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "users", [
  { _id: adminId },
  { _id: userId },
  { _id: charityUserId },
  { email: { $in: [ADMIN_EMAIL, USER_EMAIL, CHARITY_USER_EMAIL] } },
  { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "subscriptions", [
  { userId },
  { userId: charityUserId },
  { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "trials", [{ userId }, { userId: charityUserId }, { e2eFixture: E2E_TAG }]);
await deleteByAny(db, "payment_attempts", [
  { userId },
  { userId: charityUserId },
  { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "notifications", [
  { userId },
  { userId: charityUserId },
  { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "charity_applications", [
  { _id: applicationId },
  { email: APPLICATION_EMAIL },
  { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "charities", [
  { _id: charityId },
  { name: CHARITY_NAME },
  { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "charity_memberships", [
  { userId: charityUserId },
  { charityId },
  { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "pool_distributions", [
  { _id: distributionId },
  { month: DISTRIBUTION_MONTH },
  { e2eFixture: E2E_TAG },
]);

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

process.exit(0);
