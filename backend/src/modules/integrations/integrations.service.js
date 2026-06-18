// apps/backend/src/modules/integrations/integrations.service.js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
    assertIntegrationKey,
    assertIntegrationUpdate,
    INTEGRATION_DEFINITIONS,
} from "./integrations.validation.js";

/**
 * Converte id de admin em ObjectId para auditoria.
 *
 * @param {string} userId Id vindo da sessão.
 * @returns {ObjectId} Id MongoDB.
 */
function asUserObjectId(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new HttpError(400, "Administrador inválido.");
    }

    return new ObjectId(userId);
}

/**
 * Junta definição canónica com configuração persistida.
 *
 * @param {string} key Chave da integração.
 * @param {Record<string, unknown> | null} stored Configuração guardada.
 * @returns {Record<string, unknown>} Integração pública.
 */
function toPublicIntegration(key, stored) {
    const definition = INTEGRATION_DEFINITIONS[key];

    return {
        key,
        label: definition.label,
        requiredEnvVars: definition.envVars,
        enabled: stored?.enabled ?? false,
        mode: stored?.mode ?? definition.defaultMode,
        publicConfig: stored?.publicConfig ?? {},
        updatedAt: stored?.updatedAt?.toISOString?.() ?? null,
    };
}

/**
 * Lista todas as integrações conhecidas com configuração atual.
 *
 * @returns {Promise<Record<string, unknown>[]>} Lista pública para admin.
 */
export async function listIntegrationSettings() {
    const db = await getDb();
    const storedRows = await db.collection("integration_settings").find({}).toArray();
    const storedByKey = new Map(storedRows.map((row) => [row.key, row]));

    return Object.keys(INTEGRATION_DEFINITIONS).map((key) =>
        toPublicIntegration(key, storedByKey.get(key) ?? null),
    );
}

/**
 * Atualiza uma integração e regista auditoria.
 *
 * @param {string} actorUserId Id do administrador autenticado.
 * @param {string} key Chave da integração.
 * @param {{ enabled?: unknown, mode?: unknown, publicConfig?: unknown }} input Dados recebidos.
 * @returns {Promise<Record<string, unknown>>} Integração atualizada.
 */
export async function updateIntegrationSetting(actorUserId, key, input) {
    const integrationKey = assertIntegrationKey(key);
    const update = assertIntegrationUpdate(input);
    const db = await getDb();
    const actorObjectId = asUserObjectId(actorUserId);
    const now = new Date();

    const stored = await db.collection("integration_settings").findOneAndUpdate(
        { key: integrationKey },
        {
            $set: {
                ...update,
                updatedAt: now,
                updatedBy: actorObjectId,
            },
            $setOnInsert: {
                key: integrationKey,
                createdAt: now,
            },
        },
        { upsert: true, returnDocument: "after" },
    );

    await db.collection("admin_audit_logs").insertOne({
        actorUserId: actorObjectId,
        target: integrationKey,
        action: "integration_update",
        changes: update,
        createdAt: now,
    });

    return toPublicIntegration(integrationKey, stored);
}