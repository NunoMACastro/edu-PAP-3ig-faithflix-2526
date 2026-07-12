/**
 * @file Ficheiro `real_dev/backend/src/modules/charities/charity-review.service.js` da implementação real_dev.
 */

/**
 * Módulo de serviço para revisão administrativa de candidaturas.
 *
 * Garante decisão única, valida a role administrativa antes da rota chamar este
 * fluxo e cria a associação elegível apenas quando a candidatura é aprovada.
 */
import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import { assertReviewPayload } from "./charity-review.validation.js";

/**
 * Converte uma string para `ObjectId` com mensagem contextual.
 *
 * @param {string} id Identificador recebido da rota ou sessão.
 * @param {string} label Nome usado na mensagem de erro.
 * @returns {ObjectId} Identificador MongoDB.
 * @throws {Error} Quando o identificador e inválido.
 */
function asObjectId(id, label) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    const error = new Error(`${label} inválido.`);
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(id);
}

/**
 * Remove campos internos antes de devolver uma associação aprovada.
 *
 * @param {object} charity Documento da colecao `charities`.
 * @returns {object} Associação pública para API/admin.
 */
function publicCharity(charity) {
  return {
    id: String(charity._id),
    name: charity.name,
    mission: charity.mission,
    websiteUrl: charity.websiteUrl,
    status: charity.status,
    poolStatus: charity.poolStatus,
    approvedAt: charity.approvedAt,
  };
}

/**
 * Cria indices para impedir duplicação de entrada na pool.
 *
 * @returns {Promise<void>}
 */
export async function ensureCharityIndexes() {
  const db = await getDb();
  await db.collection("charities").createIndex({ applicationId: 1 }, { unique: true });
  await db.collection("charities").createIndex({ status: 1, poolStatus: 1 });
}

/**
 * Reve uma candidatura pendente e cria associação elegível quando aprovada.
 *
 * @param {string} applicationId Identificador da candidatura.
 * @param {string} reviewerUserId Identificador do admin que decide.
 * @param {object} input Decisão recebida da UI.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido HTTP.
 * @returns {Promise<object>} Resultado da rejeição ou associação criada.
 * @throws {Error} Quando a candidatura não existe, já foi decidida ou o dados e inválido.
 */
export async function reviewCharityApplication(
  applicationId,
  reviewerUserId,
  input,
  context = {},
) {
  const payload = assertReviewPayload(input);
  const _id = asObjectId(applicationId, "Candidatura");
  const reviewerObjectId = asObjectId(reviewerUserId, "Revisor");

  return runInTransaction(async ({ db, session }) => {
    const now = new Date();

    // O filtro condicional reclama a decisão uma unica vez, mesmo sob concorrencia.
    const application = await db.collection("charity_applications").findOneAndUpdate(
      { _id, status: "pending" },
      {
        $set: {
          status: payload.decision,
          reviewedAt: now,
          reviewedBy: reviewerObjectId,
          reviewReason: payload.reason,
          updatedAt: now,
        },
      },
      { returnDocument: "before", session },
    );

    if (!application) {
      throw new HttpError(
        409,
        "A candidatura ja foi decidida ou deixou de estar pendente.",
        undefined,
        "APPLICATION_ALREADY_REVIEWED",
      );
    }

    const reviewedApplication = {
      ...application,
      status: payload.decision,
      reviewedAt: now,
      reviewedBy: reviewerObjectId,
      reviewReason: payload.reason,
      updatedAt: now,
    };

    if (payload.decision === "rejected") {
      await writeAdminAudit({
        db,
        session,
        actorUserId: reviewerObjectId,
        action: "charity.application_review",
        targetType: "charity_application",
        targetId: _id,
        before: { status: application.status },
        after: {
          status: reviewedApplication.status,
          reviewReason: reviewedApplication.reviewReason,
        },
        requestId: context.requestId,
        metadata: { decision: payload.decision },
      });

      // Rejeição fecha a candidatura e não cria entrada na pool.
      return {
        application: {
          id: applicationId,
          status: "rejected",
          reviewReason: payload.reason,
        },
      };
    }

    // A associação nasce no mesmo commit da decisão e do audit log.
    const charity = {
      applicationId: _id,
      name: application.name,
      mission: application.mission,
      websiteUrl: application.websiteUrl,
      contactEmail: application.email,
      status: "active",
      poolStatus: "eligible",
      approvedAt: now,
      approvedBy: reviewerObjectId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db
      .collection("charities")
      .insertOne(charity, { session });
    const persistedCharity = { ...charity, _id: result.insertedId };

    await writeAdminAudit({
      db,
      session,
      actorUserId: reviewerObjectId,
      action: "charity.application_review",
      targetType: "charity_application",
      targetId: _id,
      before: { status: application.status },
      after: {
        status: reviewedApplication.status,
        reviewReason: reviewedApplication.reviewReason,
        charityId: result.insertedId,
      },
      requestId: context.requestId,
      metadata: { decision: payload.decision },
    });

    return { charity: publicCharity(persistedCharity) };
  });
}

/**
 * Lista associações ativas e elegíveis para distribuição solidária.
 *
 * @returns {Promise<{ charities: object[] }>} Associações ordenadas por data de aprovação.
 */
export async function listEligibleCharities() {
  const db = await getDb();
  const charities = await db.collection("charities").find({ status: "active", poolStatus: "eligible" }).sort({ approvedAt: 1 }).toArray();
  return { charities: charities.map(publicCharity) };
}
