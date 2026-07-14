/**
 * @file Hardening HTTP nativo e enforcement HTTPS da API FaithFlix.
 */

import { env, isProduction } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

/**
 * Aplica headers defensivos a todas as respostas da API.
 *
 * @param {import("express").Request} req Pedido atual.
 * @param {import("express").Response} res Resposta atual.
 * @param {import("express").NextFunction} next Continuação Express.
 * @returns {void}
 */
export function securityHeaders(req, res, next) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=()",
    );
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    );

    if (isProduction && req.secure) {
        res.setHeader(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains",
        );
    }

    if (/^\/api\/(auth|session|privacy)(?:\/|$)/u.test(req.path)) {
        res.setHeader("Cache-Control", "no-store");
    }

    next();
}

/**
 * Rejeita transporte HTTP quando o deployment declarou HTTPS obrigatório.
 *
 * @param {import("express").Request} req Pedido atual.
 * @param {import("express").Response} _res Resposta não usada.
 * @param {import("express").NextFunction} next Continuação Express.
 * @returns {void}
 */
export function requireHttps(req, _res, next) {
    if (env.forceHttps && !req.secure) {
        next(
            new HttpError(
                426,
                "Este serviço exige HTTPS.",
                undefined,
                "HTTPS_REQUIRED",
            ),
        );
        return;
    }

    next();
}
