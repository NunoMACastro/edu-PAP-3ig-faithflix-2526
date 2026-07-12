/**
 * @file Serviço de candidaturas públicas de associações.
 *
 * Valida dados recebidos do formulário, controla duplicados pendentes e remove
 * campos internos antes de devolver respostas seguras para a API.
 */

import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { paginationMetadata } from "../../utils/pagination.js";
import {
  assertCharityApplicationListQuery,
  assertCharityApplicationPayload,
} from "./charity-applications.validation.js";

/**
 * Identifica a violacao do indice unico de candidaturas pendentes.
 *
 * @param {unknown} error Erro devolvido pelo driver MongoDB.
 * @returns {boolean} Verdadeiro quando o erro representa uma chave duplicada.
 */
function isDuplicateKeyError(error) {
  return Number(error?.code) === 11000;
}

/**
 * Remove campos internos antes de devolver uma candidatura.
 *
 * @param {object} application Documento da coleção `charity_applications`.
 * @returns {object} Candidatura pública para API/admin.
 */
function publicApplication(application) {
  const reviewReason = String(application.reviewReason ?? "").replace(
    "Documentação insuficiente para a demonstração.",
    "A documentação apresentada não permite validar a candidatura.",
  );

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
    reviewReason: reviewReason || null,
  };
}

/**
 * Cria índices necessários para listagem e controlo de duplicados pendentes.
 *
 * @returns {Promise<void>}
 */
export async function ensureCharityApplicationIndexes() {
  const db = await getDb();

  await db.collection("charity_applications").createIndex(
    { email: 1 },
    {
      name: "uniq_pending_charity_application_email",
      unique: true,
      partialFilterExpression: { status: "pending" },
    },
  );
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

  const now = new Date();
  const application = {
    ...payload,
    // O cliente nunca escolhe o estado inicial.
    status: "pending",
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  let result;

  try {
    // O indice parcial unico e a fonte de verdade, incluindo submissões concorrentes.
    result = await db.collection("charity_applications").insertOne(application);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new HttpError(
        409,
        "Já existe uma candidatura pendente para este email.",
        undefined,
        "PENDING_APPLICATION_EXISTS",
      );
    }

    throw error;
  }

  return {
    application: publicApplication({ ...application, _id: result.insertedId }),
  };
}

/**
 * Lista candidaturas para administradores, com filtro por estado.
 *
 * @param {Record<string, unknown>} [query={}] Filtro e paginacao.
 * @returns {Promise<{ applications: object[], page: number, limit: number, total: number, totalPages: number }>} Página de candidaturas ordenada por submissão.
 */
export async function listCharityApplications(query = {}) {
  const db = await getDb();
  const { status, page, limit } = assertCharityApplicationListQuery(query);
  const filter = status === "all" ? {} : { status };
  const collection = db.collection("charity_applications");
  const [applications, total] = await Promise.all([
    collection
      .find(filter)
      .sort({ submittedAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    applications: applications.map(publicApplication),
    ...paginationMetadata({ page, limit, total }),
  };
}
