import { notFound } from "../utils/http-error.js";
import { logger } from "../utils/logger.js";

export function notFoundHandler(req, _res, next) {
    next(notFound(req.originalUrl));
}

export function errorHandler(error, req, res, _next) {
    const statusCode = error.statusCode ?? error.status ?? 500;
    const safeStatusCode =
        statusCode >= 400 && statusCode <= 599 ? statusCode : 500;

    const logContext = {
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode: safeStatusCode,
        errorName: error.name,
        errorMessage: error.message,
    };

    if (safeStatusCode >= 500) {
        logger.error("http_error", logContext);
    } else {
        logger.warn("http_error", logContext);
    }

    const response = {
        message:
            safeStatusCode === 500
                ? "Erro interno do servidor."
                : error.message,
    };

    if (error.details !== undefined) {
        response.details = error.details;
    }

    return res.status(safeStatusCode).json(response);
}