/**
 * @file Ficheiro `real_dev/backend/src/middlewares/error.middleware.js` da implementação real_dev.
 */

import { notFound } from "../utils/http-error.js";
import { logger } from "../utils/logger.js";

/**
 * Converte pedidos sem rota correspondente num erro JSON 404.
 *
 * @param {import("express").Request} req - Pedido HTTP atual.
 * @param {import("express").Response} _res - Objeto de resposta não usado.
 * @param {import("express").NextFunction} next - Express callback used to forward the generated error.
 * @returns {void}
 */
export function notFoundHandler(req, _res, next) {
    next(notFound(req.originalUrl));
}

/**
 * Converte erros lançados em respostas JSON seguras e logs estruturados.
 *
 * @param {Error & { statusCode?: number, status?: number, details?: unknown }} error - Erro recebido de rotas ou middlewares.
 * @param {import("express").Request & { id?: string }} req - Pedido HTTP atual.
 * @param {import("express").Response} res - Resposta HTTP usada para devolver o erro JSON.
 * @param {import("express").NextFunction} _next - Unused Express callback required by the error middleware signature.
 * @returns {import("express").Response} Resposta Express com erro normalizado.
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

    // Erros 4xx são falhas esperadas do cliente; erros 5xx indicam risco no servidor.
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
