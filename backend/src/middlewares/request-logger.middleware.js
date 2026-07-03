/**
 * @file Ficheiro `real_dev/backend/src/middlewares/request-logger.middleware.js` da implementação real_dev.
 */

import { randomUUID } from "node:crypto";
import { logger } from "../utils/logger.js";

/**
 * Adiciona um id de pedido, expõe-no na resposta e regista a conclusão do pedido.
 *
 * @param {import("express").Request & { id?: string }} req - Pedido HTTP atual.
 * @param {import("express").Response} res - Resposta HTTP onde `x-request-id` é definido.
 * @param {import("express").NextFunction} next - Callback Express usado para continuar a pipeline.
 * @returns {void}
 */
export function requestLogger(req, res, next) {
    const startedAt = Date.now();
    const incomingRequestId = req.headers["x-request-id"];

    req.id =
        typeof incomingRequestId === "string" && incomingRequestId.trim() !== ""
            ? incomingRequestId
            : randomUUID();

    res.setHeader("x-request-id", req.id);

    res.on("finish", () => {
        logger.info("http_request", {
            requestId: req.id,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });

    next();
}
