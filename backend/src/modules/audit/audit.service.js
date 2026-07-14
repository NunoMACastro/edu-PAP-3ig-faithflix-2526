/**
 * @file Escrita transacional e sanitizada do audit log administrativo.
 */

import { ObjectId } from "mongodb";
import {
    assertActiveTransaction,
    getDb,
} from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";

const SENSITIVE_KEYS = new Set([
    "password",
    "passwordhash",
    "token",
    "tokenhash",
    "csrftokenhash",
    "csrftokenhashes",
    "cookie",
    "secret",
    "email",
    "contactemail",
    "phone",
    "contactphone",
    "telephone",
]);

/**
 * Remove segredos de snapshots antes de os guardar no audit log.
 *
 * @param {unknown} value Valor de domínio.
 * @returns {unknown} Cópia serializável sem campos sensíveis.
 */
function sanitizeAuditValue(value) {
    if (value instanceof Date) {
        return new Date(value);
    }

    if (value instanceof ObjectId) {
        return String(value);
    }

    if (Buffer.isBuffer(value) || ArrayBuffer.isView(value)) {
        return "[BINARY_REDACTED]";
    }

    if (Array.isArray(value)) {
        return value.map(sanitizeAuditValue);
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([key]) => !SENSITIVE_KEYS.has(key.toLowerCase()))
                .map(([key, nested]) => [key, sanitizeAuditValue(nested)]),
        );
    }

    return value;
}

/**
 * Garante índices de consulta e deduplicação do audit administrativo.
 *
 * @returns {Promise<void>}
 */
export async function ensureAuditIndexes() {
    const db = await getDb();
    const audit = db.collection("admin_audit_logs");
    await audit.createIndex({ actorUserId: 1, createdAt: -1 });
    await audit.createIndex({ targetType: 1, targetId: 1, createdAt: -1 });
    await audit.createIndex(
        { operationId: 1 },
        {
            unique: true,
            partialFilterExpression: { operationId: { $type: "string" } },
        },
    );
}

/**
 * Persiste um evento no mesmo contexto transacional da alteração auditada.
 *
 * @param {{ db: import("mongodb").Db, session?: import("mongodb").ClientSession, actorUserId: string | ObjectId, action: string, targetType: string, targetId: string | ObjectId, before?: unknown, after?: unknown, requestId?: string, operationId?: string, metadata?: unknown, eventId?: string|ObjectId, createdAt?: Date }} input Evento e contexto.
 * @returns {Promise<string>} Id público do evento.
 */
export async function writeAdminAudit(input) {
    assertActiveTransaction();

    const actorUserId = String(input.actorUserId ?? "");

    if (!ObjectId.isValid(actorUserId)) {
        throw new HttpError(400, "Administrador invalido.");
    }

    const action = String(input.action ?? "").trim();
    const targetType = String(input.targetType ?? "").trim();
    const targetId = String(input.targetId ?? "").trim();

    if (!action || !targetType || !targetId) {
        throw new HttpError(400, "Evento de auditoria incompleto.");
    }

    const event = {
        ...(input.eventId ? { _id: new ObjectId(String(input.eventId)) } : {}),
        actorUserId: new ObjectId(actorUserId),
        action,
        targetType,
        targetId,
        before: sanitizeAuditValue(input.before ?? null),
        after: sanitizeAuditValue(input.after ?? null),
        metadata: sanitizeAuditValue(input.metadata ?? null),
        ...(input.requestId ? { requestId: String(input.requestId) } : {}),
        ...(input.operationId ? { operationId: String(input.operationId) } : {}),
        createdAt: input.createdAt instanceof Date ? input.createdAt : new Date(),
    };
    const result = await input.db
        .collection("admin_audit_logs")
        .insertOne(event, { session: input.session });

    return String(result.insertedId);
}
