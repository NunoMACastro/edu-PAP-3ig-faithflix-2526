import { notFound } from "../utils/http-error.js";
import { logger } from "../utils/logger.js";

/**
 * Converts requests that reached no route into a JSON 404 error.
 *
 * @param {import("express").Request} req - Current HTTP request.
 * @param {import("express").Response} _res - Unused response object.
 * @param {import("express").NextFunction} next - Express callback used to forward the generated error.
 * @returns {void}
 */
export function notFoundHandler(req, _res, next) {
    next(notFound(req.originalUrl));
}

/**
 * Converts thrown errors into safe JSON responses and structured logs.
 *
 * @param {Error & { statusCode?: number, status?: number, details?: unknown }} error - Error received from routes or middlewares.
 * @param {import("express").Request & { id?: string }} req - Current HTTP request.
 * @param {import("express").Response} res - HTTP response used to return the error JSON.
 * @param {import("express").NextFunction} _next - Unused Express callback required by the error middleware signature.
 * @returns {import("express").Response} Express response with the normalized error payload.
 */
export function errorHandler(error, req, res, _next) {
    const statusCode = error.statusCode ?? error.status ?? 500;
    const safeStatusCode =
        statusCode >= 400 && statusCode <= 599 ? statusCode : 500;

    const isServerError = safeStatusCode >= 500;
    const logContext = {
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
        statusCode: safeStatusCode,
        errorName: error.name,
        errorMessage: isServerError
            ? "Erro interno do servidor."
            : error.message,
    };

    // 4xx errors are expected client-side failures; 5xx errors indicate server risk.
    if (isServerError) {
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
