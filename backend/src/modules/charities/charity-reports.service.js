/**
 * @file Serviço de relatórios, histórico e memberships de associações.
 *
 * Reúne leituras públicas, dashboard administrativo e acesso privado por
 * membership, preservando contactos internos e regras de pertença no backend.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

/**
 * Converte identificadores recebidos em `ObjectId` com erro de domínio.
 *
 * @param {string} id Identificador recebido da rota, sessão ou corpo.
 * @param {string} label Nome usado na mensagem de erro.
 * @returns {ObjectId} Identificador MongoDB.
 * @throws {Error} Quando o identificador é inválido.
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
 * Remove contactos internos antes de expor uma associação publicamente.
 *
 * @param {object} charity Documento da coleção `charities`.
 * @returns {object} Associação pública.
 */
function publicCharity(charity) {
  return {
    id: String(charity._id),
    name: charity.name,
    mission: charity.mission,
    websiteUrl: charity.websiteUrl,
    approvedAt: charity.approvedAt,
  };
}

/**
 * Normaliza uma ligação utilizador-associação para resposta da API.
 *
 * @param {object} membership Documento da coleção `charity_memberships`.
 * @returns {object} Ligação pública.
 */
function publicMembership(membership) {
  return {
    userId: String(membership.userId),
    charityId: String(membership.charityId),
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  };
}

/**
 * Cria índices de pertença entre utilizadores e associações.
 *
 * @returns {Promise<void>}
 */
export async function ensureCharityReportIndexes() {
  const db = await getDb();

  await db.collection("charity_memberships").createIndex({ userId: 1 }, { unique: true });
  await db.collection("charity_memberships").createIndex({ charityId: 1 });
}

/**
 * Liga um utilizador existente a uma associação elegível.
 *
 * @param {string} charityId Identificador da associação.
 * @param {string} userId Identificador do utilizador que passará a consultar histórico.
 * @param {string} createdByUserId Identificador do admin que cria a ligação.
 * @returns {Promise<{ membership: object }>} Ligação criada ou atualizada.
 * @throws {Error} Quando a associação ou o utilizador não existem.
 */
export async function linkUserToCharity(charityId, userId, createdByUserId) {
  const db = await getDb();
  const charityObjectId = asObjectId(charityId, "Associação");
  const userObjectId = asObjectId(userId, "Utilizador");
  const createdByObjectId = asObjectId(createdByUserId, "Admin");

  // Apenas associações ativas e elegíveis podem receber utilizadores associados.
  const charity = await db.collection("charities").findOne({
    _id: charityObjectId,
    status: "active",
    poolStatus: "eligible",
  });

  if (!charity) {
    const error = new Error("Associação ativa e elegível não encontrada.");
    error.statusCode = 404;
    throw error;
  }

  // A ligação exige um utilizador real para não criar pertença quebrado.
  const user = await db.collection("users").findOne({ _id: userObjectId });

  if (!user) {
    const error = new Error("Utilizador não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();

  // Um utilizador fica ligado a uma associação de cada vez; `upsert` permite corrigir a ligação.
  await db.collection("charity_memberships").updateOne(
    { userId: userObjectId },
    {
      $set: {
        charityId: charityObjectId,
        updatedAt: now,
      },
      $setOnInsert: {
        userId: userObjectId,
        createdBy: createdByObjectId,
        createdAt: now,
      },
    },
    { upsert: true },
  );

  const membership = await db
    .collection("charity_memberships")
    .findOne({ userId: userObjectId });

  return { membership: publicMembership(membership) };
}

/**
 * Obtém a associação ligada ao utilizador autenticado.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {Promise<object>} Documento de ligação.
 * @throws {Error} Quando o utilizador não está ligado a uma associação.
 */
export async function getMyCharityMembership(userId) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const membership = await db
    .collection("charity_memberships")
    .findOne({ userId: userObjectId });

  if (!membership) {
    const error = new Error("Este utilizador não está ligado a uma associação.");
    error.statusCode = 403;
    throw error;
  }

  return membership;
}

/**
 * Devolve os últimos meses de distribuição para painel admin.
 *
 * @returns {Promise<{ months: object[] }>} Totais mensais agregados.
 */
export async function getPoolDashboard() {
  const db = await getDb();
  const runs = await db
    .collection("pool_distributions")
    .find({})
    .sort({ month: -1 })
    .limit(12)
    .toArray();

  return {
    months: runs.map((run) => ({
      month: run.month,
      totalPoolCents: run.totalPoolCents,
      charitiesCount: run.items.length,
      status: run.status,
    })),
  };
}

/**
 * Devolve histórico de distribuições para uma associação.
 *
 * @param {string} charityId Identificador da associação.
 * @returns {Promise<{ charityId: string, totalCents: number, rows: object[] }>} Histórico agregado.
 */
export async function getCharityHistory(charityId) {
  const db = await getDb();
  const charityObjectId = asObjectId(charityId, "Associação");
  const runs = await db
    .collection("pool_distributions")
    .find({ "items.charityId": charityObjectId })
    .sort({ month: -1 })
    .toArray();

  const rows = runs.map((run) => {
    // O valor vem do registo mensal persistido; o relatório não recalcula distribuições antigas.
    const item = run.items.find(
      (entry) => String(entry.charityId) === String(charityObjectId),
    );

    return {
      month: run.month,
      amountCents: item.amountCents,
      rotationPosition: item.rotationPosition,
    };
  });

  return {
    charityId,
    totalCents: rows.reduce((total, row) => total + row.amountCents, 0),
    rows,
  };
}

/**
 * Lista associações elegíveis para a página pública.
 *
 * @returns {Promise<{ charities: object[] }>} Associações sem contactos internos.
 */
export async function listPublicCharities() {
  const db = await getDb();
  const charities = await db
    .collection("charities")
    .find({
      status: "active",
      poolStatus: "eligible",
    })
    .sort({ approvedAt: 1 })
    .toArray();

  return { charities: charities.map(publicCharity) };
}

/**
 * Converte histórico de uma associação para CSV simples.
 *
 * @param {{ rows: object[] }} history Histórico devolvido por `getCharityHistory`.
 * @returns {string} CSV com cabeçalho e linhas de distribuição.
 */
export function historyToCsv(history) {
  const header = "month,amount_cents,rotation_position";
  const lines = history.rows.map(
    (row) => `${row.month},${row.amountCents},${row.rotationPosition}`,
  );

  return [header, ...lines].join("\n");
}
