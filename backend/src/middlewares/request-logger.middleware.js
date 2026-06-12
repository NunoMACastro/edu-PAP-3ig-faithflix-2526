import { randomUUID } from "node:crypto";
import { logger } from "../utils/logger.js";

/**
 * Adds a request id, exposes it in the response, and logs request completion.
 *
 * @param {import("express").Request & { id?: string }} req - Current HTTP request.
 * @param {import("express").Response} res - HTTP response where `x-request-id` is set.
 * @param {import("express").NextFunction} next - Express callback used to continue the pipeline.
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
