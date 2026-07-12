/**
 * @file Controller neutro das métricas anónimas consentidas.
 */

import { recordAnonymousMetric } from "./analytics.service.js";

/**
 * Aceita um evento sem revelar ao browser o estado do consentimento.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido autenticado.
 * @param {import("express").Response} res Resposta vazia.
 * @returns {Promise<import("express").Response>} HTTP 204 tanto em opt-in como opt-out.
 */
export async function postAnonymousMetric(req, res) {
    await recordAnonymousMetric(req.user.id, req.body);
    return res.status(204).end();
}
