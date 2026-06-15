/**
 * Módulo de serviço para distribuição mensal da pool solidária.
 *
 * Calcula valores em cêntimos, aplica rotação entre associações elegíveis e
 * grava execuções idempotentes para evitar duplicar distribuições do mesmo mês.
 */
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertDistributionMonth } from "./pool-distribution.validation.js";

/**
 * Converte uma distribuição mensal para o formato público da API.
 *
 * @param {object} run Documento da colecao `pool_distributions`.
 * @returns {object} Distribuição sem campos internos.
 */
function toPublicRun(run) {
  return {
    id: String(run._id),
    month: run.month,
    totalPoolCents: run.totalPoolCents,
    status: run.status,
    items: run.items.map((item) => ({
      charityId: String(item.charityId),
      charityName: item.charityName,
      amountCents: item.amountCents,
      rotationPosition: item.rotationPosition,
    })),
    createdAt: run.createdAt,
  };
}

/**
 * Divide um total em cêntimos por associações, preservando a soma exata.
 *
 * @param {number} totalCents Valor total da pool em cêntimos.
 * @param {object[]} charities Associações já ordenadas pela rotação deste mês.
 * @returns {object[]} Itens de distribuição.
 */
function splitCents(totalCents, charities) {
  const base = Math.floor(totalCents / charities.length);
  let remainder = totalCents - base * charities.length;

  return charities.map((charity, index) => {
    // Os cêntimos sobrantes sao atribuidos aos primeiros itens da rotação atual.
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return {
      charityId: charity._id,
      charityName: charity.name,
      amountCents: base + extra,
      rotationPosition: index + 1,
    };
  });
}

/**
 * Calcula o ponto de arranque da proxima rotação.
 *
 * @param {object[]} charities Associações elegíveis ordenadas por aprovação.
 * @param {object | null} lastRun Ultima distribuição gravada.
 * @returns {number} Offset usado para rodar a lista.
 */
function nextRotationOffset(charities, lastRun) {
  if (!lastRun?.items?.length) {
    return 0;
  }

  const previousFirstCharityId = String(lastRun.items[0].charityId);
  const previousIndex = charities.findIndex((charity) => String(charity._id) === previousFirstCharityId);

  if (previousIndex === -1) {
    return 0;
  }

  return (previousIndex + 1) % charities.length;
}

/**
 * Cria indices para idempotência mensal e consultas por associação.
 *
 * @returns {Promise<void>}
 */
export async function ensurePoolDistributionIndexes() {
  const db = await getDb();
  await db.collection("pool_distributions").createIndex({ month: 1 }, { unique: true });
  await db.collection("pool_distributions").createIndex({ "items.charityId": 1, month: -1 });
}

/**
 * Executa a distribuição mensal da pool solidária.
 *
 * @param {string} monthInput Mês no formato `YYYY-MM`.
 * @param {string} createdByUserId Identificador do admin que executa a distribuição.
 * @returns {Promise<{ distribution: object }>} Distribuição persistida.
 * @throws {Error} Quando o mês já existe ou não há associações elegíveis.
 */
export async function runMonthlyDistribution(monthInput, createdByUserId) {
  const db = await getDb();
  const month = assertDistributionMonth(monthInput);
  const now = new Date();
  const existing = await db.collection("pool_distributions").findOne({ month });
  if (existing) {
    const error = new Error("Distribuição deste mês já existe.");
    error.statusCode = 409;
    throw error;
  }

  // Apenas subscrições pagas ativas contribuem para receita; trials não entram na pool.
  const subscriptions = await db.collection("subscriptions").find({
    status: "active",
    currentPeriodEnd: { $gt: now },
  }).toArray();
  const plans = await db.collection("subscription_plans").find({ active: true }).toArray();
  const planByCode = new Map(plans.map((plan) => [plan.code, plan]));

  // O calculo e sempre feito em cêntimos para evitar erros de ponto flutuante.
  const totalPoolCents = subscriptions.reduce((total, subscription) => {
    const plan = planByCode.get(subscription.planCode);
    if (!plan) return total;
    return total + Math.round((plan.priceCents * plan.solidaritySharePercent) / 100);
  }, 0);

  const charities = await db.collection("charities").find({
    status: "active",
    poolStatus: "eligible",
  }).sort({ approvedAt: 1 }).toArray();

  if (charities.length === 0) {
    const error = new Error("Não existem associações elegíveis.");
    error.statusCode = 409;
    throw error;
  }

  const lastRun = await db.collection("pool_distributions").findOne({}, { sort: { month: -1 } });
  const offset = nextRotationOffset(charities, lastRun);
  // A lista rodada torna visível que a prioridade muda entre meses.
  const rotated = [...charities.slice(offset), ...charities.slice(0, offset)];
  const items = splitCents(totalPoolCents, rotated);

  const run = {
    month,
    totalPoolCents,
    status: "completed",
    items,
    createdBy: ObjectId.isValid(createdByUserId) ? new ObjectId(createdByUserId) : null,
    createdAt: now,
  };

  const result = await db.collection("pool_distributions").insertOne(run);
  return { distribution: toPublicRun({ ...run, _id: result.insertedId }) };
}

/**
 * Consulta uma distribuição mensal já persistida.
 *
 * @param {string} monthInput Mês no formato `YYYY-MM`.
 * @returns {Promise<{ distribution: object }>} Distribuição encontrada.
 * @throws {Error} Quando o mês não existe.
 */
export async function getDistributionByMonth(monthInput) {
  const db = await getDb();
  const month = assertDistributionMonth(monthInput);
  const run = await db.collection("pool_distributions").findOne({ month });
  if (!run) {
    const error = new Error("Distribuição não encontrada.");
    error.statusCode = 404;
    throw error;
  }
  return { distribution: toPublicRun(run) };
}