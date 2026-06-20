/**
 * @file Serviço de candidaturas públicas de associações.
 *
 * Valida dados recebidos do formulário, controla duplicados pendentes e remove
 * campos internos antes de devolver respostas seguras para a API.
 */

import { getDb } from "../../config/database.js";
import { assertCharityApplicationPayload } from "./charity-applications.validation.js";

/**
 * Remove campos internos antes de devolver uma candidatura.
 *
 * @param {object} application Documento da coleção `charity_applications`.
 * @returns {object} Candidatura pública para API/admin.
 */
function publicApplication(application) {
  return {
    id: String(application._id),
    name: application.name,
    contactName: application.contactName,
    email: application.email,
    phone: application.phone,
    mission: application.mission,
    websiteUrl: application.websiteUrl,
    status: application.status,
    submittedAt: application.submittedAt,
    reviewedAt: application.reviewedAt ?? null,
    reviewReason: application.reviewReason ?? null,
  };
}

/**
 * Cria índices necessários para listagem e controlo de duplicados pendentes.
 *
 * @returns {Promise<void>}
 */
export async function ensureCharityApplicationIndexes() {
  const db = await getDb();

  await db.collection("charity_applications").createIndex({ email: 1, status: 1 });
  await db.collection("charity_applications").createIndex({ status: 1, submittedAt: -1 });
}

/**
 * Submete uma candidatura pública com estado inicial controlado.
 *
 * @param {Record<string, unknown>} input Dados enviados pela associação.
 * @returns {Promise<{ application: object }>} Candidatura criada.
 * @throws {Error} Quando já existe candidatura pendente para o mesmo email.
 */
export async function submitCharityApplication(input) {
  const db = await getDb();
  const payload = assertCharityApplicationPayload(input);

  // A duplicação é limitada ao estado pendente para permitir nova candidatura depois de uma decisão.
  const duplicate = await db.collection("charity_applications").findOne({
    email: payload.email,
    status: "pending",
  });

  if (duplicate) {
    const error = new Error("Já existe uma candidatura pendente para este email.");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date();
  const application = {
    ...payload,
    // O cliente nunca escolhe o estado inicial.
    status: "pending",
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("charity_applications").insertOne(application);

  return {
    application: publicApplication({ ...application, _id: result.insertedId }),
  };
}

/**
 * Lista candidaturas para administradores, com filtro por estado.
 *
 * @param {string} [status="pending"] Estado a listar ou `all`.
 * @returns {Promise<{ applications: object[] }>} Candidaturas ordenadas por submissão.
 */
export async function listCharityApplications(status = "pending") {
  const db = await getDb();
  const filter = status === "all" ? {} : { status };
  const applications = await db
    .collection("charity_applications")
    .find(filter)
    .sort({ submittedAt: -1 })
    .toArray();

  return { applications: applications.map(publicApplication) };
}
