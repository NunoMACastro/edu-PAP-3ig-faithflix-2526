/**
 * @file Ficheiro `real_dev/backend/src/modules/recommendations/recommendations.controller.js` da implementação real_dev.
 */

import { getRecommendationsForUser } from "./recommendations.service.js";

/**
 * Devolve recomendações personalizadas para a sessão atual.
 *
 * O controller usa apenas o `user.id` autenticado e delega no serviço a escolha
 * dos blocos recomendados, incluindo fallback cold-start quando necessário.
 *
 * @param {import("express").Request} req Pedido Express com `user.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com recomendações do utilizador.
 */
export async function getMyRecommendations(req, res) {
    return res.status(200).json(await getRecommendationsForUser(req.user.id));
}
