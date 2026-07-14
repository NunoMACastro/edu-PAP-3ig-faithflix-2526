/**
 * @file Ficheiro `real_dev/backend/src/modules/auth/auth.middleware.js` da implementação real_dev.
 */

import { HttpError } from "../../utils/http-error.js";

/**
 * Marca respostas associadas a sessão como privadas e não reutilizáveis.
 *
 * A função é chamada antes de validar autenticação para que respostas `401` e
 * `403` também não possam ser guardadas por proxies partilhados.
 *
 * @param {import("express").Response} res - Resposta HTTP atual.
 * @returns {void}
 */
export function markPrivateResponse(res) {
    res.setHeader("Cache-Control", "private, no-store");
    const currentVary = res.getHeader?.("Vary");
    const varyValues = String(currentVary ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    if (!varyValues.some((value) => value.toLowerCase() === "cookie")) {
        varyValues.push("Cookie");
    }
    res.setHeader("Vary", varyValues.join(", "));
}

/**
 * Exige um utilizador autenticado válido no pedido atual.
 *
 * @param {import("express").Request & { user?: unknown }} req - Pedido atual.
 * @param {import("express").Response} res - Resposta HTTP marcada como privada.
 * @param {import("express").NextFunction} next - Next middleware callback.
 * @returns {import("express").Response | void} Continua ou devolve 401.
 */
export function requireAuth(req, res, next) {
    markPrivateResponse(res);
    if (!req.user) {
        return next(
            new HttpError(
                401,
                "Autenticacao obrigatoria.",
                undefined,
                "AUTH_REQUIRED",
            ),
        );
    }

    return next();
}

/**
 * Exige que o utilizador autenticado tenha uma das roles permitidas.
 *
 * @param {string[]} allowedRoles - Roles aceites pela rota protegida.
 * @returns {import("express").RequestGestor} Middleware Express.
 */
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        markPrivateResponse(res);
        if (!req.user) {
            return next(
                new HttpError(
                    401,
                    "Autenticacao obrigatoria.",
                    undefined,
                    "AUTH_REQUIRED",
                ),
            );
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new HttpError(
                    403,
                    "Permissao insuficiente.",
                    undefined,
                    "FORBIDDEN",
                ),
            );
        }

        return next();
    };
}
