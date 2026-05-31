import { randomUUID } from "node:crypto";
import { logger } from "../utils/logger.js";

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
            path: req.path,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });

    next();
}