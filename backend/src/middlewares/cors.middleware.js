/**
 * @file Ficheiro `real_dev/backend/src/middlewares/cors.middleware.js` da implementação real_dev.
 */

import { corsConfig } from "../config/cors.js";

const ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const ALLOWED_HEADERS = "Content-Type,X-Request-Id";

/**
 * Adiciona cabeçalhos CORS para as origens frontend configuradas.
 *
 * @param {import("express").Request} req - Pedido HTTP atual.
 * @param {import("express").Response} res - Resposta HTTP onde os cabeçalhos CORS podem ser definidos.
 * @param {import("express").NextFunction} next - Callback Express usado para continuar a pipeline.
 * @returns {void | import("express").Response} Termina pedidos preflight ou continua pedidos normais.
 */
export function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;

    if (typeof origin === "string" && corsConfig.allowedOrigins.includes(origin)) {
        // Credenciais exigem uma origem explícita; wildcard não é seguro aqui.
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
        res.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
        res.setHeader("Vary", "Origin");
    }

    if (req.method === "OPTIONS") {
        return res.status(204).send();
    }

    next();
}
