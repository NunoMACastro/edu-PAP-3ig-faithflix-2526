/**
 * @file Proteção CSRF por Origin/Fetch Metadata e token ligado à sessão.
 */

import { corsConfig } from "../config/cors.js";
import { verifyCsrfToken } from "../modules/auth/csrf.service.js";
import { HttpError } from "../utils/http-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Valida pedidos mutáveis iniciados por browsers.
 *
 * Clientes server-to-server sem `Origin` nem Fetch Metadata continuam aceites;
 * browsers autenticados têm de apresentar origin allowlisted e token CSRF.
 *
 * @param {import("express").Request & { session?: { token?: string, isAuthenticated?: boolean } }} req Pedido.
 * @param {import("express").Response} _res Resposta não usada.
 * @param {import("express").NextFunction} next Continuação Express.
 * @returns {Promise<void>}
 */
export async function csrfProtection(req, _res, next) {
    if (SAFE_METHODS.has(req.method)) {
        next();
        return;
    }

    try {
        const origin = req.headers.origin;
        const fetchSite = req.headers["sec-fetch-site"];
        const isBrowserRequest = Boolean(origin || fetchSite);

        if (fetchSite === "cross-site") {
            throw new HttpError(
                403,
                "Origem do pedido recusada.",
                undefined,
                "ORIGIN_FORBIDDEN",
            );
        }

        if (
            isBrowserRequest &&
            (typeof origin !== "string" ||
                !corsConfig.allowedOrigins.includes(origin))
        ) {
            throw new HttpError(
                403,
                "Origem do pedido recusada.",
                undefined,
                "ORIGIN_FORBIDDEN",
            );
        }

        if (req.session?.isAuthenticated) {
            const valid = await verifyCsrfToken(
                req.session.token,
                req.headers["x-csrf-token"],
            );

            if (!valid) {
                throw new HttpError(
                    403,
                    "Token de seguranca invalido ou expirado.",
                    undefined,
                    "CSRF_INVALID",
                );
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}
