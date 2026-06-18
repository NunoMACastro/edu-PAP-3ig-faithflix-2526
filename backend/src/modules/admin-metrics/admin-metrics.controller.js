// apps/backend/src/modules/admin-metrics/admin-metrics.controller.js
import { getAdminMetrics } from "./admin-metrics.service.js";

/**
 * Devolve métricas agregadas para administradores.
 *
 * @param {import("express").Request} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Métricas agregadas.
 */
export async function getAdminMetricsController(req, res) {
    return res.status(200).json({
        metrics: await getAdminMetrics(req.query),
    });
}