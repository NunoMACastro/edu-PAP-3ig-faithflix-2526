/**
 * @file Lease distribuído em MongoDB para jobs locais idempotentes.
 */

import { getDb } from "../../config/database.js";

const JOB_KEY_PATTERN = /^[a-z0-9:_-]{1,160}$/u;
const MIN_LEASE_MS = 5_000;
const MAX_LEASE_MS = 15 * 60_000;

/**
 * Garante índices de unicidade e seleção de jobs prontos.
 *
 * @returns {Promise<void>}
 */
export async function ensureScheduledJobIndexes() {
    const db = await getDb();
    const jobs = db.collection("scheduled_jobs");
    await jobs.createIndex({ key: 1 }, { unique: true });
    await jobs.createIndex({ status: 1, nextRunAt: 1 });
    await jobs.createIndex({ leaseExpiresAt: 1 });
}

/**
 * Valida uma chave estável sem aceitar dados arbitrários em nomes operacionais.
 *
 * @param {unknown} value Chave bruta.
 * @returns {string} Chave normalizada.
 */
function assertJobKey(value) {
    const key = String(value ?? "").trim().toLowerCase();
    if (!JOB_KEY_PATTERN.test(key)) {
        throw new TypeError("Chave de job invalida.");
    }
    return key;
}

/**
 * Limita a duração do lease para recuperar workers terminados.
 *
 * @param {unknown} value Duração solicitada.
 * @returns {number} Duração segura em milissegundos.
 */
function assertLeaseMs(value) {
    const leaseMs = Number(value);
    if (
        !Number.isInteger(leaseMs) ||
        leaseMs < MIN_LEASE_MS ||
        leaseMs > MAX_LEASE_MS
    ) {
        throw new TypeError("Duracao de lease invalida.");
    }
    return leaseMs;
}

/**
 * Regista o job sem antecipar um agendamento já existente.
 *
 * @param {{ key: string, type: string, nextRunAt: Date, db?: import("mongodb").Db }} input Definição.
 * @returns {Promise<void>}
 */
export async function registerScheduledJob(input) {
    const db = input.db ?? (await getDb());
    const key = assertJobKey(input.key);
    const type = String(input.type ?? "").trim();

    if (!type || !(input.nextRunAt instanceof Date)) {
        throw new TypeError("Definicao de job invalida.");
    }

    const now = new Date();
    try {
        await db.collection("scheduled_jobs").updateOne(
            { key },
            {
                $set: { type, updatedAt: now },
                $setOnInsert: {
                    key,
                    status: "idle",
                    nextRunAt: input.nextRunAt,
                    attempts: 0,
                    createdAt: now,
                },
            },
            { upsert: true },
        );
    } catch (error) {
        // Dois upserts simultâneos da mesma key podem produzir E11000 no
        // perdedor. O documento vencedor já é exatamente o lock pretendido.
        if (Number(error?.code) !== 11000) throw error;
    }
}

/**
 * Reclama um job pronto através de compare-and-set atómico.
 *
 * @param {{ key: string, ownerId: string, leaseMs: number, now?: Date, db?: import("mongodb").Db }} input Pedido de lease.
 * @returns {Promise<Record<string, unknown> | null>} Job reclamado ou null.
 */
export async function claimScheduledJob(input) {
    const db = input.db ?? (await getDb());
    const key = assertJobKey(input.key);
    const ownerId = String(input.ownerId ?? "").trim();
    const leaseMs = assertLeaseMs(input.leaseMs);
    const now = input.now instanceof Date ? input.now : new Date();

    if (!ownerId || ownerId.length > 128) {
        throw new TypeError("Owner do lease invalido.");
    }

    const result = await db.collection("scheduled_jobs").findOneAndUpdate(
        {
            key,
            nextRunAt: { $lte: now },
            $or: [
                { status: { $in: ["idle", "failed"] } },
                { status: "running", leaseExpiresAt: { $lte: now } },
            ],
        },
        {
            $set: {
                status: "running",
                leaseOwner: ownerId,
                leaseExpiresAt: new Date(now.getTime() + leaseMs),
                lastStartedAt: now,
                updatedAt: now,
            },
            $inc: { attempts: 1 },
            $unset: { lastErrorCode: "" },
        },
        { returnDocument: "after" },
    );

    // Drivers antigos podem devolver `{ value }`; no driver v6 o documento é
    // devolvido diretamente. Um `value: null` nunca deve contar como claim.
    if (
        result &&
        typeof result === "object" &&
        Object.prototype.hasOwnProperty.call(result, "value")
    ) {
        return result.value ?? null;
    }

    return result ?? null;
}

/**
 * Fecha um lease apenas se ainda pertencer ao worker chamador.
 *
 * @param {{ key: string, ownerId: string, nextRunAt?: Date, terminal?: boolean, now?: Date, db?: import("mongodb").Db }} input Resultado.
 * @returns {Promise<boolean>} Verdadeiro quando o lease foi fechado.
 */
export async function completeScheduledJob(input) {
    const db = input.db ?? (await getDb());
    const now = input.now instanceof Date ? input.now : new Date();
    const terminal = input.terminal === true;
    const update = {
        $set: {
            status: terminal ? "completed" : "idle",
            lastCompletedAt: now,
            updatedAt: now,
            ...(!terminal && input.nextRunAt instanceof Date
                ? { nextRunAt: input.nextRunAt }
                : {}),
        },
        $unset: {
            leaseOwner: "",
            leaseExpiresAt: "",
            lastErrorCode: "",
            ...(terminal ? { nextRunAt: "" } : {}),
        },
    };
    const result = await db.collection("scheduled_jobs").updateOne(
        {
            key: assertJobKey(input.key),
            leaseOwner: String(input.ownerId ?? ""),
            status: "running",
        },
        update,
    );

    return result.modifiedCount === 1;
}

/**
 * Liberta uma execução falhada para retry futuro sem guardar mensagens internas.
 *
 * @param {{ key: string, ownerId: string, retryAt: Date, errorCode?: string, now?: Date, db?: import("mongodb").Db }} input Falha.
 * @returns {Promise<boolean>} Verdadeiro quando o lease pertencia ao worker.
 */
export async function failScheduledJob(input) {
    const db = input.db ?? (await getDb());
    const now = input.now instanceof Date ? input.now : new Date();

    if (!(input.retryAt instanceof Date)) {
        throw new TypeError("Data de retry invalida.");
    }

    const result = await db.collection("scheduled_jobs").updateOne(
        {
            key: assertJobKey(input.key),
            leaseOwner: String(input.ownerId ?? ""),
            status: "running",
        },
        {
            $set: {
                status: "failed",
                nextRunAt: input.retryAt,
                lastFailedAt: now,
                lastErrorCode: String(input.errorCode ?? "JOB_FAILED").slice(
                    0,
                    80,
                ),
                updatedAt: now,
            },
            $unset: { leaseOwner: "", leaseExpiresAt: "" },
        },
    );

    return result.modifiedCount === 1;
}
