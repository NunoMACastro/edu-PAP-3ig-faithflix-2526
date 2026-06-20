/**
 * @file Controller do painel de metricas admin.
 */

import { getAdminMetrics } from "./admin-metrics.service.js";

/**
 * Devolve metricas administrativas agregadas.
 *
 * @param {import("express").Request} req Pedido HTTP.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resposta com metricas.
 */
export async function getMetrics(req, res) {
    return res.status(200).json({ metrics: await getAdminMetrics(req.query) });
}
