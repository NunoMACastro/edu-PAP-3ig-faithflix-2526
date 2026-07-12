/**
 * @file Persistência anónima, consentida e temporária de métricas locais.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { assertAnonymousMetricEvent } from "./analytics.validation.js";

const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Converte o utilizador autenticado apenas para consultar consentimento.
 * Este identificador nunca é copiado para o documento analítico.
 *
 * @param {unknown} userId Id da sessão.
 * @returns {ObjectId} Id MongoDB.
 */
function userObjectId(userId) {
    if (!ObjectId.isValid(String(userId ?? ""))) {
        throw new HttpError(400, "Utilizador inválido.");
    }
    return new ObjectId(String(userId));
}

/**
 * Cria o início UTC do dia sem preservar hora ou timezone do cliente.
 *
 * @param {Date} date Instante válido.
 * @returns {Date} Meia-noite UTC.
 */
function utcDay(date) {
    return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
}

/**
 * Garante os índices de retenção e agregação anónima.
 *
 * @returns {Promise<void>} Termina quando os índices existem.
 */
export async function ensureAnonymousMetricIndexes() {
    const db = await getDb();
    await db.collection("anonymous_metric_events").createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0, name: "anonymous_metric_events_ttl" },
    );
    await db.collection("anonymous_metric_events").createIndex(
        { day: 1, type: 1, category: 1 },
        { name: "anonymous_metric_events_aggregate" },
    );
}

/**
 * Regista uma métrica apenas quando o consentimento atual está ativo.
 *
 * O documento persistido contém exclusivamente tipo, categoria opcional, dia
 * UTC e expiração. O id usado na leitura de consentimento nunca é persistido.
 *
 * @param {unknown} userId Id autenticado.
 * @param {unknown} input Evento fechado.
 * @param {{ db?: import("mongodb").Db, now?: Date }} [options] Dependências para testes.
 * @returns {Promise<boolean>} Verdadeiro quando existiu escrita.
 */
export async function recordAnonymousMetric(userId, input, options = {}) {
    const event = assertAnonymousMetricEvent(input);
    const db = options.db ?? (await getDb());
    const consent = await db.collection("user_consents").findOne(
        { userId: userObjectId(userId) },
        { projection: { "consents.anonymousMetrics": 1 } },
    );

    if (consent?.consents?.anonymousMetrics !== true) {
        return false;
    }

    const now = options.now instanceof Date ? new Date(options.now) : new Date();
    if (Number.isNaN(now.getTime())) {
        throw new HttpError(500, "Relógio analítico inválido.");
    }

    await db.collection("anonymous_metric_events").insertOne({
        type: event.type,
        ...(event.category ? { category: event.category } : {}),
        day: utcDay(now),
        expiresAt: new Date(now.getTime() + RETENTION_MS),
    });
    return true;
}
