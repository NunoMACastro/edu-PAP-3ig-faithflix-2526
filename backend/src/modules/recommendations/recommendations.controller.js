/**
 * @file Ficheiro `real_dev/backend/src/modules/recommendations/recommendations.controller.js` da implementação real_dev.
 */

import { getRecommendationsForUser } from "./recommendations.service.js";

/**
 * Documenta `getMyRecommendations`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getMyRecommendations`.
 * @param {unknown} res Valor recebido por `getMyRecommendations`.
 * @returns {Promise<unknown>} Resultado devolvido por `getMyRecommendations`.
 */
export async function getMyRecommendations(req, res) {
    return res.status(200).json(await getRecommendationsForUser(req.user.id));
}
