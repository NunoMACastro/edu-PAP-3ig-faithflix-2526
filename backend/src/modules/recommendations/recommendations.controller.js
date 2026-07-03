/**
 * @file Ficheiro `real_dev/backend/src/modules/recommendations/recommendations.controller.js` da implementação real_dev.
 */

import {
    getRecommendationsForUser,
    recordRecommendationEvents,
    saveRecommendationFeedback,
} from "./recommendations.service.js";

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

/**
 * Guarda feedback explícito do utilizador autenticado para uma recomendação.
 *
 * @param {unknown} req Valor recebido por `postRecommendationFeedback`.
 * @param {unknown} res Valor recebido por `postRecommendationFeedback`.
 * @returns {Promise<unknown>} Resultado devolvido por `postRecommendationFeedback`.
 */
export async function postRecommendationFeedback(req, res) {
    return res
        .status(200)
        .json(await saveRecommendationFeedback(req.user.id, req.body));
}

/**
 * Regista eventos agregados de recomendação do utilizador autenticado.
 *
 * @param {unknown} req Valor recebido por `postRecommendationEvents`.
 * @param {unknown} res Valor recebido por `postRecommendationEvents`.
 * @returns {Promise<unknown>} Resultado devolvido por `postRecommendationEvents`.
 */
export async function postRecommendationEvents(req, res) {
    return res
        .status(202)
        .json(await recordRecommendationEvents(req.user.id, req.body));
}
