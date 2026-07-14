/**
 * @file Service fail-closed dos controlos operacionais de integração.
 */

import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import {
    assertIntegrationKey,
    assertIntegrationUpdate,
    assertPersistedIntegration,
    INTEGRATION_DEFINITIONS,
    INTEGRATION_KEYS,
} from "./integrations.validation.js";

/**
 * Converte o id do administrador para auditoria.
 *
 * @param {string} userId Id vindo da sessão.
 * @returns {ObjectId} Id MongoDB.
 * @throws {HttpError} Quando o id é inválido.
 */
function asUserObjectId(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new HttpError(400, "Administrador inválido.");
    }

    return new ObjectId(userId);
}

/**
 * Cria o estado canónico usado quando a integração ainda não foi persistida.
 *
 * @param {keyof typeof INTEGRATION_DEFINITIONS} key Chave validada.
 * @returns {{ enabled: boolean, mode: string, publicConfig: Record<string, string> }} Estado por defeito.
 */
function defaultSetting(key) {
    const definition = INTEGRATION_DEFINITIONS[key];
    return {
        enabled: true,
        mode: definition.defaultMode,
        publicConfig: { ...definition.defaultPublicConfig },
    };
}

/**
 * Constrói o snapshot mínimo usado na auditoria.
 *
 * @param {string} key Chave canónica.
 * @param {{ enabled: boolean, mode: string, publicConfig: Record<string, string> }} setting Estado validado.
 * @returns {{ key: string, enabled: boolean, mode: string, publicConfig: Record<string, string> }} Snapshot sem metadados internos.
 */
function auditSnapshot(key, setting) {
    return {
        key,
        enabled: setting.enabled,
        mode: setting.mode,
        publicConfig: { ...setting.publicConfig },
    };
}

/**
 * Revalida uma linha persistida; qualquer documento legacy inválido fica
 * explicitamente desativado sem propagar a sua configuração livre.
 *
 * @param {string} key Chave esperada.
 * @param {Record<string, unknown> | null} row Documento persistido.
 * @returns {{ setting: { enabled: boolean, mode: string, publicConfig: Record<string, string> }, configurationValid: boolean, persisted: boolean }} Resultado seguro.
 */
function resolvePersistedSetting(key, row) {
    if (!row) {
        return {
            setting: defaultSetting(key),
            configurationValid: true,
            persisted: false,
        };
    }

    try {
        return {
            setting: assertPersistedIntegration(key, row),
            configurationValid: true,
            persisted: true,
        };
    } catch (error) {
        if (error instanceof HttpError) {
            return {
                setting: {
                    enabled: false,
                    mode: "disabled",
                    publicConfig: {},
                },
                configurationValid: false,
                persisted: true,
            };
        }
        throw error;
    }
}

/**
 * Converte um estado validado no DTO administrativo.
 *
 * @param {string} key Chave canónica.
 * @param {{ setting: { enabled: boolean, mode: string, publicConfig: Record<string, string> }, configurationValid: boolean, persisted: boolean }} resolved Estado resolvido.
 * @param {Date | null | undefined} updatedAt Data persistida.
 * @returns {Record<string, unknown>} Estado público da integração.
 */
function toPublicIntegration(key, resolved, updatedAt) {
    const definition = INTEGRATION_DEFINITIONS[key];
    const operational =
        resolved.configurationValid &&
        resolved.setting.enabled &&
        resolved.setting.mode !== "disabled";

    return {
        key,
        label: definition.label,
        envVars: [...definition.envVars],
        allowedModes: [...definition.allowedModes],
        enabled: operational,
        mode: resolved.setting.mode,
        publicConfig: { ...resolved.setting.publicConfig },
        configurationValid: resolved.configurationValid,
        persisted: resolved.persisted,
        updatedAt: updatedAt?.toISOString?.() ?? null,
    };
}

/**
 * Lê uma integração com revalidação fail-closed.
 *
 * @param {unknown} keyInput Chave recebida.
 * @param {{ db?: import("mongodb").Db, session?: import("mongodb").ClientSession }} [options] Contexto transacional opcional.
 * @returns {Promise<Record<string, unknown>>} DTO operacional seguro.
 */
export async function getIntegrationSetting(keyInput, options = {}) {
    const key = assertIntegrationKey(keyInput);
    const db = options.db ?? (await getDb());
    const row = await db.collection("integration_settings").findOne(
        { key },
        { session: options.session },
    );
    return toPublicIntegration(
        key,
        resolvePersistedSetting(key, row),
        row?.updatedAt,
    );
}

/**
 * Confirma de forma não-excecional se o controlo operacional está ativo.
 *
 * @param {unknown} keyInput Chave da integração.
 * @param {{ db?: import("mongodb").Db, session?: import("mongodb").ClientSession }} [options] Contexto transacional opcional.
 * @returns {Promise<boolean>} Verdadeiro apenas para configuração atual válida e ativa.
 */
export async function isIntegrationEnabled(keyInput, options = {}) {
    const setting = await getIntegrationSetting(keyInput, options);
    return setting.enabled === true;
}

/**
 * Exige uma integração ativa antes de criar uma nova operação dependente.
 *
 * Replays idempotentes devem ser resolvidos pelo chamador antes deste guard.
 *
 * @param {unknown} keyInput Chave da integração.
 * @param {{ db?: import("mongodb").Db, session?: import("mongodb").ClientSession }} [options] Contexto transacional opcional.
 * @returns {Promise<void>}
 * @throws {HttpError} HTTP 503 estável quando o controlo está desativado.
 */
export async function assertIntegrationEnabled(keyInput, options = {}) {
    const key = assertIntegrationKey(keyInput);
    if (!(await isIntegrationEnabled(key, options))) {
        throw new HttpError(
            503,
            "Integração temporariamente indisponível.",
            { integration: key },
            "INTEGRATION_DISABLED",
        );
    }
}

/**
 * Lista as integrações aceites no MVP, ignorando chaves desconhecidas.
 *
 * @param {{ db?: import("mongodb").Db }} [options] Contexto de persistência opcional.
 * @returns {Promise<Record<string, unknown>[]>} Integrações visíveis ao admin.
 */
export async function listIntegrationSettings(options = {}) {
    const db = options.db ?? await getDb();
    const rows = await db
        .collection("integration_settings")
        .find({ key: { $in: [...INTEGRATION_KEYS] } })
        .toArray();
    const byKey = new Map(rows.map((row) => [row.key, row]));

    return INTEGRATION_KEYS.map((key) => {
        const row = byKey.get(key) ?? null;
        return toPublicIntegration(
            key,
            resolvePersistedSetting(key, row),
            row?.updatedAt,
        );
    });
}

/**
 * Atualiza uma integração e regista snapshots reais e minimizados.
 *
 * @param {string} actorUserId Id do admin autenticado.
 * @param {unknown} keyInput Chave recebida por parâmetro.
 * @param {Record<string, unknown>} input Corpo recebido.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<Record<string, unknown>>} Integração atualizada.
 */
export async function updateIntegrationSetting(
    actorUserId,
    keyInput,
    input,
    context = {},
) {
    const key = assertIntegrationKey(keyInput);
    const update = assertIntegrationUpdate(key, input);
    const actorObjectId = asUserObjectId(actorUserId);

    return runInTransaction(async ({ db, session }) => {
        const collection = db.collection("integration_settings");
        const existing = await collection.findOne({ key }, { session });
        const beforeResolved = existing
            ? resolvePersistedSetting(key, existing)
            : null;
        const now = new Date();
        const replacement = {
            ...(existing && Object.hasOwn(existing, "_id")
                ? { _id: existing._id }
                : {}),
            key,
            ...update,
            updatedBy: actorObjectId,
            updatedAt: now,
            createdAt: existing?.createdAt instanceof Date
                ? existing.createdAt
                : now,
        };

        // Uma substituição canónica é intencional: `$set` preservaria campos
        // legacy desconhecidos (incluindo potenciais segredos) e a leitura
        // seguinte voltaria a falhar fechada.
        await collection.replaceOne(
            { key },
            replacement,
            { upsert: true, session },
        );

        await writeAdminAudit({
            db,
            session,
            actorUserId: actorObjectId,
            action: "integration.update",
            targetType: "integration",
            targetId: key,
            before: beforeResolved
                ? auditSnapshot(key, beforeResolved.setting)
                : null,
            after: auditSnapshot(key, update),
            requestId: context.requestId,
        });

        return toPublicIntegration(
            key,
            {
                setting: update,
                configurationValid: true,
                persisted: true,
            },
            now,
        );
    });
}
