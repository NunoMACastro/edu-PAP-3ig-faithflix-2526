/**
 * @file Serviço de relatórios, histórico e memberships de associações.
 *
 * Reúne leituras públicas, dashboard administrativo e acesso privado por
 * membership, preservando contactos internos e regras de pertença no backend.
 */

import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import { paginationMetadata } from "../../utils/pagination.js";
import { assertAdminCharityLookupQuery } from "./charity-admin.validation.js";

/**
 * Converte identificadores recebidos em `ObjectId` com erro de domínio.
 *
 * @param {string} id Identificador recebido da rota, sessão ou corpo.
 * @param {string} label Nome usado na mensagem de erro.
 * @returns {ObjectId} Identificador MongoDB.
 * @throws {Error} Quando o identificador é inválido.
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
 * Reduz a associação ligada à sessão aos únicos campos necessários para abrir
 * a respetiva área privada.
 *
 * @param {object} charity Documento interno da associação.
 * @returns {{ id: string, name: string }} Resumo seguro da própria associação.
 */
function publicOwnCharity(charity) {
  return {
    id: String(charity._id),
    name: charity.name,
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
 * Constrói a resposta administrativa sem expor campos internos.
 *
 * @param {object} membership Ligação persistida.
 * @param {object} user Utilizador selecionado.
 * @param {object} charity Associação selecionada.
 * @returns {{ membership: object, user: object, charity: object }} Resposta segura.
 */
function membershipResponse(membership, user, charity) {
  return {
    membership: publicMembership(membership),
    user: { id: String(user._id), name: user.name, email: user.email },
    charity: { id: String(charity._id), name: charity.name },
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
 * Cria o conflito seguro usado quando um utilizador ja pertence a uma associacao.
 *
 * @returns {HttpError} Erro de dominio estavel para o endpoint administrativo.
 */
function membershipConflict() {
  return new HttpError(
    409,
    "O utilizador ja esta ligado a uma associacao. A transferencia exige uma operacao explicita.",
    undefined,
    "CHARITY_MEMBERSHIP_EXISTS",
  );
}

/**
 * Liga um utilizador existente a uma associação elegível.
 *
 * @param {string} charityId Identificador da associação.
 * @param {string} userId Identificador do utilizador que passará a consultar histórico.
 * @param {string} createdByUserId Identificador do admin que cria a ligação.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido HTTP.
 * @returns {Promise<{ membership: object }>} Ligação criada ou atualizada.
 * @throws {Error} Quando a associação ou o utilizador não existem.
 */
export async function linkUserToCharity(
  charityId,
  userId,
  createdByUserId,
  context = {},
) {
  const charityObjectId = asObjectId(charityId, "Associação");
  const userObjectId = asObjectId(userId, "Utilizador");
  const createdByObjectId = asObjectId(createdByUserId, "Admin");

  try {
    return await runInTransaction(async ({ db, session }) => {
      // Apenas associações ativas e elegíveis podem receber utilizadores associados.
      const charity = await db.collection("charities").findOne(
        {
          _id: charityObjectId,
          status: "active",
          poolStatus: "eligible",
        },
        { session },
      );

      if (!charity) {
        throw new HttpError(
          404,
          "Associação ativa e elegível não encontrada.",
        );
      }

      // A escrita no utilizador serializa esta ligação com bloqueio/eliminacao
      // da conta e impede uma membership orfa por write skew concorrente.
      const userLock = await db.collection("users").updateOne(
        {
          _id: userObjectId,
          accountStatus: { $nin: ["blocked", "deleted"] },
        },
        { $inc: { operationalVersion: 1 } },
        { session },
      );

      if (userLock.matchedCount !== 1) {
        throw new HttpError(
          404,
          "Utilizador ativo não encontrado.",
          undefined,
          "USER_NOT_OPERATIONAL",
        );
      }

      const user = await db.collection("users").findOne(
        { _id: userObjectId },
        { session, projection: { name: 1, email: 1 } },
      );

      if (!user) {
        throw new HttpError(404, "Utilizador ativo não encontrado.");
      }

      const existing = await db
        .collection("charity_memberships")
        .findOne({ userId: userObjectId }, { session });

      if (existing) {
        if (String(existing.charityId) !== String(charityObjectId)) {
          throw membershipConflict();
        }

        // Repetir exatamente a mesma ligacao e idempotente e nao cria novo audit.
        return membershipResponse(existing, user, charity);
      }

      const now = new Date();
      const membership = {
        userId: userObjectId,
        charityId: charityObjectId,
        createdBy: createdByObjectId,
        createdAt: now,
        updatedAt: now,
      };
      const result = await db
        .collection("charity_memberships")
        .insertOne(membership, { session });
      const persistedMembership = { ...membership, _id: result.insertedId };

      await writeAdminAudit({
        db,
        session,
        actorUserId: createdByObjectId,
        action: "charity.membership_create",
        targetType: "charity_membership",
        targetId: result.insertedId,
        before: null,
        after: persistedMembership,
        requestId: context.requestId,
      });

      return membershipResponse(persistedMembership, user, charity);
    });
  } catch (error) {
    // O indice unico fecha a race entre leituras concorrentes.
    if (Number(error?.code) === 11000) {
      throw membershipConflict();
    }

    throw error;
  }
}

/**
 * Lista apenas identificadores e nomes de associações elegíveis para seletores.
 *
 * @param {Record<string, unknown>} [query={}] Pesquisa e paginação.
 * @returns {Promise<{ charities: object[], page: number, limit: number, total: number, totalPages: number }>} Página segura.
 */
export async function lookupAdminCharities(query = {}) {
  const { search, page, limit } = assertAdminCharityLookupQuery(query);
  const db = await getDb();
  const filter = { status: "active", poolStatus: "eligible" };
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: escaped, $options: "i" };
  }
  const collection = db.collection("charities");
  const [charities, total] = await Promise.all([
    collection
      .find(filter, { projection: { name: 1 } })
      .sort({ name: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    charities: charities.map((charity) => ({
      id: String(charity._id),
      name: charity.name,
    })),
    ...paginationMetadata({ page, limit, total }),
  };
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
 * Resolve a associação ligada ao utilizador sem transformar a ausência normal
 * de membership num erro da página pública.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {Promise<{ charity: null | { id: string, name: string } }>} Associação própria ou ausência explícita.
 */
export async function getMyCharitySummary(userId) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const membership = await db
    .collection("charity_memberships")
    .findOne({ userId: userObjectId });

  if (!membership) {
    return { charity: null };
  }

  const charity = await db
    .collection("charities")
    .findOne({ _id: membership.charityId });

  return {
    charity: charity ? publicOwnCharity(charity) : null,
  };
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
 * @returns {Promise<{ charities: object[], impact: { eligibleCharities: number, totalDistributedCents: number, completedMonths: number, currency: "EUR" } }>} Associações e impacto agregado sem dados privados.
 */
export async function listPublicCharities() {
  const db = await getDb();
  const [charities, completedRuns] = await Promise.all([
    db
      .collection("charities")
      .find({
        status: "active",
        poolStatus: "eligible",
      })
      .sort({ approvedAt: 1 })
      .toArray(),
    db
      .collection("pool_distributions")
      .find({ status: "completed" })
      .toArray(),
  ]);
  const totalDistributedCents = completedRuns.reduce((total, run) => {
    const amount = run.totalPoolCents;
    return Number.isInteger(amount) && amount >= 0 ? total + amount : total;
  }, 0);

  return {
    charities: charities.map(publicCharity),
    impact: {
      eligibleCharities: charities.length,
      totalDistributedCents,
      completedMonths: completedRuns.length,
      currency: "EUR",
    },
  };
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
