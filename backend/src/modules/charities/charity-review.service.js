/**
 * Módulo de serviço para revisão administrativa de candidaturas.
 *
 * Garante decisão única, valida a role administrativa antes da rota chamar este
 * fluxo e cria a associação elegível apenas quando a candidatura é aprovada.
 */
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
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
  if (!ObjectId.isValid(id)) {
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
 * @returns {Promise<object>} Resultado da rejeição ou associação criada.
 * @throws {Error} Quando a candidatura não existe, já foi decidida ou o payload e inválido.
 */
export async function reviewCharityApplication(applicationId, reviewerUserId, input) {
  const db = await getDb();
  const payload = assertReviewPayload(input);
  const now = new Date();
  const _id = asObjectId(applicationId, "Candidatura");

  // Apenas candidaturas pendentes podem mudar de estado; isto evita decisões duplicadas.
  const application = await db.collection("charity_applications").findOne({ _id, status: "pending" });
  if (!application) {
    const error = new Error("Candidatura pendente não encontrada.");
    error.statusCode = 404;
    throw error;
  }

  await db.collection("charity_applications").updateOne(
    { _id },
    {
      $set: {
        status: payload.decision,
        reviewedAt: now,
        reviewedBy: asObjectId(reviewerUserId, "Revisor"),
        reviewReason: payload.reason,
        updatedAt: now,
      },
    },
  );

  if (payload.decision === "rejected") {
    // Rejeição fecha a candidatura e não cria entrada na pool.
    return { application: { id: applicationId, status: "rejected", reviewReason: payload.reason } };
  }

  // A associação nasce a partir da candidatura existente para manter rastreabilidade.
  const charity = {
    applicationId: _id,
    name: application.name,
    mission: application.mission,
    websiteUrl: application.websiteUrl,
    contactEmail: application.email,
    status: "active",
    poolStatus: "eligible",
    approvedAt: now,
    approvedBy: asObjectId(reviewerUserId, "Revisor"),
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("charities").insertOne(charity);
  return { charity: publicCharity({ ...charity, _id: result.insertedId }) };
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