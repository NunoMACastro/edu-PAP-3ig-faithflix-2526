/**
 * @file Rate limiting distribuído com contadores MongoDB e chaves pseudonimizadas.
 */

import { createHmac } from "node:crypto";
import { getDb } from "../config/database.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

/**
 * Cria os índices dos contadores com expiração automática.
 *
 * @returns {Promise<void>}
 */
export async function ensureRateLimitIndexes() {
    const db = await getDb();
    await db.collection("rate_limit_counters").createIndex(
        { scope: 1, keyHash: 1, windowStart: 1 },
        { unique: true },
    );
    await db
        .collection("rate_limit_counters")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

/**
 * Pseudonimiza IP, email ou user id antes de persistir o contador.
 *
 * @param {unknown} value Identificador bruto.
 * @returns {string} HMAC SHA-256.
 */
function hashRateLimitKey(value) {
    return createHmac("sha256", env.rateLimitPepper)
        .update(String(value ?? "missing").trim().toLowerCase())
        .digest("hex");
}

/**
 * Reserva atomicamente uma tentativa numa janela fixa.
 *
 * O chamador pode libertar a reserva depois de um sucesso. Assim, o contador
 * persistente representa apenas falhas sem perder a serialização distribuída.
 *
 * @param {{ scope: string, subject: unknown, limit: number, windowMs: number }} options Configuração.
 * @returns {Promise<{ count: number, limit: number, retryAfterSeconds: number, filter: Record<string, unknown> }>} Reserva criada.
 */
export async function reserveRateLimit({ scope, subject, limit, windowMs }) {
    const now = Date.now();
    const windowStartMs = Math.floor(now / windowMs) * windowMs;
    const windowStart = new Date(windowStartMs);
    const filter = {
        scope,
        keyHash: hashRateLimitKey(subject),
        windowStart,
    };
    const db = await getDb();
    const updated = await db.collection("rate_limit_counters").findOneAndUpdate(
        filter,
        {
            $inc: { count: 1 },
            $setOnInsert: {
                scope,
                windowStart,
                expiresAt: new Date(windowStartMs + windowMs * 2),
            },
        },
        { upsert: true, returnDocument: "after" },
    );

    return {
        count: updated?.count ?? updated?.value?.count ?? 1,
        limit,
        retryAfterSeconds: Math.max(
            1,
            Math.ceil((windowStartMs + windowMs - now) / 1000),
        ),
        filter,
    };
}

/**
 * Remove a tentativa reservada quando a operação terminou com sucesso.
 *
 * @param {{ filter: Record<string, unknown> }} reservation Reserva anterior.
 * @returns {Promise<void>}
 */
export async function releaseRateLimit(reservation) {
    const db = await getDb();
    await db
        .collection("rate_limit_counters")
        .updateOne(reservation.filter, { $inc: { count: -1 } });
}

/**
 * Constrói o erro público para uma reserva que ultrapassou o limite.
 *
 * @param {{ retryAfterSeconds: number }} reservation Reserva excedida.
 * @returns {HttpError}
 */
export function rateLimitExceededError(reservation) {
    return new HttpError(
        429,
        "Demasiados pedidos. Tenta novamente mais tarde.",
        { retryAfterSeconds: reservation.retryAfterSeconds },
        "RATE_LIMITED",
    );
}

/**
 * Cria middleware configurável de rate limit.
 *
 * @param {{ scope: string, limit: number, windowMs: number, key: (req: import("express").Request) => unknown }} options Configuração.
 * @returns {import("express").RequestHandler} Middleware assíncrono.
 */
export function rateLimit({ scope, limit, windowMs, key }) {
    return async (req, res, next) => {
        try {
            const reservation = await reserveRateLimit({
                scope,
                subject: key(req),
                limit,
                windowMs,
            });
            const { count } = reservation;

            res.setHeader(
                "RateLimit-Policy",
                `${limit};w=${Math.ceil(windowMs / 1000)}`,
            );
            res.setHeader("RateLimit-Remaining", String(Math.max(0, limit - count)));

            if (count > limit) {
                res.setHeader(
                    "Retry-After",
                    String(reservation.retryAfterSeconds),
                );
                next(rateLimitExceededError(reservation));
                return;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

export const rateLimitKeys = {
    ip(req) {
        return req.ip ?? req.socket?.remoteAddress ?? "unknown";
    },
    email(req) {
        return req.body?.email ?? "missing";
    },
    user(req) {
        return req.user?.id ?? req.ip ?? "anonymous";
    },
    token(req) {
        return req.body?.token ?? "missing";
    },
};
