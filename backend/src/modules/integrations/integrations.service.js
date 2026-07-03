/**
 * @file Service de configuracao administrativa de integracoes controladas.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
    assertIntegrationKey,
    assertIntegrationUpdate,
    INTEGRATION_DEFINITIONS,
} from "./integrations.validation.js";

/**
 * Converte id de admin para auditoria.
 *
 * @param {string} userId Id vindo da sessao.
 * @returns {ObjectId} Id MongoDB.
 * @throws {HttpError} Quando o id e invalido.
 */
function asUserObjectId(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new HttpError(400, "Administrador invalido.");
    }

    return new ObjectId(userId);
}

/**
 * Junta definicao canonica e configuracao persistida.
 *
 * @param {string} key Chave da integracao.
 * @param {Record<string, unknown> | null} setting Configuracao persistida.
 * @returns {Record<string, unknown>} Estado publico da integracao.
 */
function toPublicIntegration(key, setting) {
    const definition = INTEGRATION_DEFINITIONS[key];

    return {
        key,
        label: definition.label,
        envVars: definition.envVars,
        enabled: setting?.enabled ?? true,
        mode: setting?.mode ?? definition.defaultMode,
        publicConfig: setting?.publicConfig ?? {},
        updatedAt: setting?.updatedAt?.toISOString?.() ?? null,
    };
}

/**
 * Lista configuracoes de integracoes aceites no MVP.
 *
 * @returns {Promise<Record<string, unknown>[]>} Integracoes visiveis ao admin.
 */
export async function listIntegrationSettings() {
    const db = await getDb();
    const rows = await db.collection("integration_settings").find({}).toArray();
    const byKey = new Map(rows.map((row) => [row.key, row]));

    return Object.keys(INTEGRATION_DEFINITIONS).map((key) =>
        toPublicIntegration(key, byKey.get(key) ?? null),
    );
}

/**
 * Atualiza uma integracao e regista auditoria administrativa.
 *
 * @param {string} actorUserId Id do admin autenticado.
 * @param {unknown} key Chave recebida por parametro.
 * @param {Record<string, unknown>} input Corpo recebido.
 * @returns {Promise<Record<string, unknown>>} Integracao atualizada.
 */
export async function updateIntegrationSetting(actorUserId, key, input) {
    const integrationKey = assertIntegrationKey(key);
    const update = assertIntegrationUpdate(input);
    const db = await getDb();
    const actorObjectId = asUserObjectId(actorUserId);
    const now = new Date();

    await db.collection("integration_settings").updateOne(
        { key: integrationKey },
        {
            $set: {
                key: integrationKey,
                ...update,
                updatedBy: actorObjectId,
                updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
        },
        { upsert: true },
    );

    await db.collection("admin_audit_logs").insertOne({
        actorUserId: actorObjectId,
        action: "integration.update",
        targetType: "integration",
        targetKey: integrationKey,
        changes: update,
        createdAt: now,
    });

    return toPublicIntegration(integrationKey, {
        key: integrationKey,
        ...update,
        updatedAt: now,
    });
}
