/**
 * @file Ficheiro `real_dev/backend/src/modules/charities/pool-distribution.service.js` da implementação real_dev.
 */

/**
 * Módulo de serviço para distribuição mensal da pool solidária.
 *
 * Calcula valores em cêntimos, aplica rotação entre associações elegíveis e
 * grava execuções idempotentes para evitar duplicar distribuições do mesmo mês.
 */
import { ObjectId } from "mongodb";
import { createHash } from "node:crypto";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import { assertDistributionMonth } from "./pool-distribution.validation.js";

const DISTRIBUTION_TRIGGERS = new Set(["admin", "worker"]);

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
    deferredReason: run.deferredReason ?? null,
    replayed: run.replayed === true,
    financialSnapshot: run.financialSnapshot ?? {
      source: "legacy",
      paymentCount: 0,
      approvedRevenueCents: 0,
      accountingEstimate: true,
    },
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
 * Calcula o intervalo UTC fechado-aberto de um mês contabilístico.
 *
 * @param {string} month Mês `YYYY-MM` já validado.
 * @returns {{ start: Date, end: Date }} Limites UTC.
 */
function monthBounds(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1)),
    end: new Date(Date.UTC(year, monthNumber, 1)),
  };
}

/**
 * Devolve o mês UTC que contém a data indicada.
 *
 * @param {Date} date Data de referência.
 * @returns {string} Mês `YYYY-MM`.
 */
function utcMonthKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Produz uma rotação determinística, independente da ordem de execução dos jobs.
 *
 * @param {string} month Mês contabilístico.
 * @param {number} count Total de associações.
 * @returns {number} Offset estável.
 */
function rotationOffsetForMonth(month, count) {
  const [year, monthNumber] = month.split("-").map(Number);
  return (year * 12 + monthNumber - 1) % count;
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
 * Confirma que o mês contabilístico terminou antes de qualquer cálculo.
 *
 * @param {string} month Mês validado.
 * @param {Date} now Relógio do cálculo.
 * @returns {void}
 */
function assertClosedAccountingMonth(month, now) {
  if (month >= utcMonthKey(now)) {
    throw new HttpError(
      409,
      "A pool só pode fechar meses UTC já terminados.",
      undefined,
      "ACCOUNTING_MONTH_NOT_CLOSED",
    );
  }
}

/**
 * Calcula uma distribuição sem persistir dados nem escrever audit log.
 *
 * @param {import("mongodb").Db} db Base de dados autoritativa.
 * @param {string} month Mês validado.
 * @param {Date} now Relógio do cálculo.
 * @param {import("mongodb").ClientSession | undefined} session Sessão opcional.
 * @returns {Promise<Record<string, unknown>>} Candidato determinístico.
 */
async function calculateDistributionCandidate(db, month, now, session) {
  assertClosedAccountingMonth(month, now);
  const { start, end } = monthBounds(month);
  const payments = await db.collection("payment_attempts").find(
    {
      schemaVersion: 2,
      status: "approved",
      approvedAt: { $gte: start, $lt: end },
      accountingEstimate: false,
    },
    { session },
  ).sort({ approvedAt: 1, _id: 1 }).toArray();
  payments.sort((left, right) => String(left._id).localeCompare(String(right._id)));

  const hasInvalidSnapshot = payments.some(
    (payment) =>
      !Number.isInteger(payment.amountCents) ||
      payment.amountCents < 0 ||
      !Number.isFinite(payment.solidaritySharePercent) ||
      payment.solidaritySharePercent < 0 ||
      payment.solidaritySharePercent > 100 ||
      !/^[A-Z]{3}$/.test(String(payment.currency ?? "").toUpperCase()),
  );
  if (hasInvalidSnapshot) {
    throw new HttpError(
      409,
      "Existem pagamentos aprovados com snapshot financeiro inválido.",
      undefined,
      "PAYMENT_SNAPSHOT_INVALID",
    );
  }
  if (payments.some((payment) => String(payment.currency).toUpperCase() !== "EUR")) {
    throw new HttpError(
      409,
      "A pool local suporta apenas pagamentos em EUR.",
      undefined,
      "POOL_CURRENCY_UNSUPPORTED",
    );
  }

  const paymentSnapshots = payments.map((payment) => ({
    paymentAttemptId: payment._id,
    amountCents: payment.amountCents,
    currency: String(payment.currency).toUpperCase(),
    solidaritySharePercent: payment.solidaritySharePercent,
    poolCents: Math.round(
      (payment.amountCents * payment.solidaritySharePercent) / 100,
    ),
    cycle: payment.cycle ?? null,
  }));
  const totalPoolCents = paymentSnapshots.reduce(
    (total, payment) => total + payment.poolCents,
    0,
  );
  const approvedRevenueCents = paymentSnapshots.reduce(
    (total, payment) => total + payment.amountCents,
    0,
  );
  const charities = await db.collection("charities").find(
    {
      status: "active",
      poolStatus: "eligible",
      approvedAt: { $lt: end },
    },
    { session },
  ).sort({ approvedAt: 1, _id: 1 }).toArray();
  const rotated = charities.length > 0
    ? (() => {
        const offset = rotationOffsetForMonth(month, charities.length);
        return [...charities.slice(offset), ...charities.slice(0, offset)];
      })()
    : [];

  return {
    month,
    totalPoolCents,
    status: charities.length > 0
      ? "completed"
      : "deferred_no_eligible_charities",
    items: charities.length > 0 ? splitCents(totalPoolCents, rotated) : [],
    ...(charities.length === 0
      ? { deferredReason: "NO_ELIGIBLE_CHARITIES_AT_CLOSE" }
      : {}),
    paymentSnapshots,
    financialSnapshot: {
      source: "payment_attempts_v2",
      paymentCount: paymentSnapshots.length,
      approvedRevenueCents,
      accountingEstimate: false,
      periodStart: start,
      periodEnd: end,
      eligibleCharityCount: charities.length,
    },
  };
}

/**
 * Produz um fingerprint estável dos inputs financeiros e da rotação calculada.
 *
 * @param {Record<string, unknown>} candidate Candidato calculado.
 * @returns {string} SHA-256 hexadecimal.
 */
function distributionPreviewToken(candidate) {
  const canonical = {
    month: candidate.month,
    payments: candidate.paymentSnapshots.map((payment) => ({
      id: String(payment.paymentAttemptId),
      amountCents: payment.amountCents,
      currency: payment.currency,
      solidaritySharePercent: payment.solidaritySharePercent,
      poolCents: payment.poolCents,
      cycle: payment.cycle,
    })),
    items: candidate.items.map((item) => ({
      charityId: String(item.charityId),
      amountCents: item.amountCents,
      rotationPosition: item.rotationPosition,
    })),
  };
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

/**
 * Converte o candidato para uma resposta administrativa sem snapshots internos.
 *
 * @param {Record<string, unknown>} candidate Cálculo atual.
 * @param {Date} generatedAt Momento da preview.
 * @returns {Record<string, unknown>} Preview segura.
 */
function toPublicPreview(candidate, generatedAt) {
  return {
    month: candidate.month,
    status: candidate.status,
    deferredReason: candidate.deferredReason ?? null,
    totalPoolCents: candidate.totalPoolCents,
    financialSnapshot: candidate.financialSnapshot,
    items: candidate.items.map((item) => ({
      charityId: String(item.charityId),
      charityName: item.charityName,
      amountCents: item.amountCents,
      rotationPosition: item.rotationPosition,
    })),
    generatedAt: generatedAt.toISOString(),
    previewToken: distributionPreviewToken(candidate),
    alreadyDistributed: false,
  };
}

/**
 * Normaliza a origem do fecho mensal e valida o ator administrativo.
 *
 * O caminho HTTP usa `admin` por compatibilidade com os callers existentes e
 * exige sempre um ObjectId válido. O worker tem de se declarar explicitamente e
 * não pode fabricar um utilizador para preencher o audit log administrativo.
 *
 * @param {string | ObjectId | null | undefined} createdByUserId Ator recebido.
 * @param {unknown} triggerValue Origem declarada da execução.
 * @returns {{ trigger: "admin" | "worker", actorUserId: ObjectId | null }} Contexto validado.
 */
function resolveDistributionExecution(createdByUserId, triggerValue) {
  const trigger = triggerValue ?? "admin";

  if (!DISTRIBUTION_TRIGGERS.has(trigger)) {
    throw new HttpError(
      400,
      "Origem do fecho mensal invalida.",
      undefined,
      "POOL_TRIGGER_INVALID",
    );
  }

  if (trigger === "worker") {
    if (createdByUserId !== null && createdByUserId !== undefined) {
      throw new HttpError(
        400,
        "O worker nao pode assumir uma identidade administrativa.",
        undefined,
        "POOL_WORKER_ACTOR_FORBIDDEN",
      );
    }

    return { trigger, actorUserId: null };
  }

  const actorValue = String(createdByUserId ?? "");
  if (!ObjectId.isValid(actorValue)) {
    throw new HttpError(
      400,
      "Administrador invalido.",
      undefined,
      "POOL_ADMIN_ACTOR_INVALID",
    );
  }

  return { trigger, actorUserId: new ObjectId(actorValue) };
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
 * Pré-visualiza a distribuição mensal sem qualquer escrita persistente.
 *
 * @param {string} monthInput Mês no formato `YYYY-MM`.
 * @param {{ referenceDate?: Date }} [options] Relógio opcional de teste.
 * @returns {Promise<{ preview: object }>} Preview ou distribuição já existente.
 */
export async function previewMonthlyDistribution(monthInput, options = {}) {
  const month = assertDistributionMonth(monthInput);
  const now = options.referenceDate instanceof Date
    ? options.referenceDate
    : new Date();
  assertClosedAccountingMonth(month, now);
  const db = await getDb();
  const existing = await db.collection("pool_distributions").findOne({ month });
  if (existing) {
    return {
      preview: {
        month,
        alreadyDistributed: true,
        previewToken: null,
        generatedAt: now.toISOString(),
        distribution: toPublicRun(existing),
      },
    };
  }

  const candidate = await calculateDistributionCandidate(db, month, now);
  return { preview: toPublicPreview(candidate, now) };
}

/**
 * Executa a distribuição mensal da pool solidária.
 *
 * @param {string} monthInput Mês no formato `YYYY-MM`.
 * @param {string | ObjectId | null | undefined} createdByUserId Identificador do admin ou ausência explícita no worker.
 * @param {{ referenceDate?: Date, trigger?: "admin" | "worker", requestId?: string, distributionId?: ObjectId|string, auditId?: ObjectId|string, expectedPreviewToken?: string }} [options] Relógio, origem, correlação, preview e ids determinísticos opcionais de fixture.
 * @returns {Promise<{ distribution: object }>} Distribuição persistida ou replay existente.
 * @throws {Error} Quando o mês ainda não fechou ou os dados financeiros são inválidos.
 */
export async function runMonthlyDistribution(monthInput, createdByUserId, options = {}) {
  const month = assertDistributionMonth(monthInput);
  const execution = resolveDistributionExecution(
    createdByUserId,
    options.trigger,
  );
  const now = options.referenceDate instanceof Date
    ? options.referenceDate
    : new Date();
  const distributionId = options.distributionId === undefined
    ? null
    : String(options.distributionId);
  if (distributionId !== null && !ObjectId.isValid(distributionId)) {
    throw new HttpError(
      400,
      "Identificador de distribuição inválido.",
      undefined,
      "POOL_DISTRIBUTION_ID_INVALID",
    );
  }

  assertClosedAccountingMonth(month, now);

  try {
    return await runInTransaction(async ({ db, session }) => {
      const existing = await db
        .collection("pool_distributions")
        .findOne({ month }, { session });
      if (existing) {
        return {
          distribution: toPublicRun({ ...existing, replayed: true }),
        };
      }

      const candidate = await calculateDistributionCandidate(
        db,
        month,
        now,
        session,
      );
      if (
        options.expectedPreviewToken !== undefined &&
        distributionPreviewToken(candidate) !== options.expectedPreviewToken
      ) {
        throw new HttpError(
          409,
          "Os dados da distribuição mudaram. Atualiza a pré-visualização.",
          undefined,
          "POOL_PREVIEW_STALE",
        );
      }
      const run = {
        ...(distributionId ? { _id: new ObjectId(distributionId) } : {}),
        ...candidate,
        createdBy: execution.actorUserId,
        trigger: execution.trigger,
        createdAt: now,
      };
      const result = await db
        .collection("pool_distributions")
        .insertOne(run, { session });

      if (execution.trigger === "admin") {
        await writeAdminAudit({
          db,
          session,
          actorUserId: execution.actorUserId,
          action: "charity.pool_distribution.created",
          targetType: "pool_distribution",
          targetId: result.insertedId,
          before: null,
          after: {
            month: run.month,
            status: run.status,
            totalPoolCents: run.totalPoolCents,
            paymentCount: run.financialSnapshot.paymentCount,
            eligibleCharityCount:
              run.financialSnapshot.eligibleCharityCount,
          },
          requestId: options.requestId,
          eventId: options.auditId,
          createdAt: now,
          operationId: `pool-distribution:${month}`,
          metadata: { trigger: execution.trigger },
        });
      }

      return {
        distribution: toPublicRun({ ...run, _id: result.insertedId }),
      };
    });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const db = await getDb();
    const existing = await db.collection("pool_distributions").findOne({ month });
    if (!existing) throw error;
    return { distribution: toPublicRun({ ...existing, replayed: true }) };
  }
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
