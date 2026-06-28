/**
 * @file Ficheiro `real_dev/backend/src/modules/ratings/ratings.controller.js` da implementação real_dev.
 */

import {
    deleteMyRating,
    getMyRating,
    getRatingSummary,
    upsertRating,
} from "./ratings.service.js";

/**
 * Documenta `putRating`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `putRating`.
 * @param {unknown} res Valor recebido por `putRating`.
 * @returns {Promise<unknown>} Resultado devolvido por `putRating`.
 */
export async function putRating(req, res) {
    return res.status(200).json({
        rating: await upsertRating(
            req.user.id,
            req.params.contentId,
            req.body?.value,
        ),
    });
}

/**
 * Documenta `getRatingMe`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getRatingMe`.
 * @param {unknown} res Valor recebido por `getRatingMe`.
 * @returns {Promise<unknown>} Resultado devolvido por `getRatingMe`.
 */
export async function getRatingMe(req, res) {
    return res.status(200).json({
        rating: await getMyRating(req.user.id, req.params.contentId),
    });
}

/**
 * Documenta `deleteRating`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `deleteRating`.
 * @param {unknown} res Valor recebido por `deleteRating`.
 * @returns {Promise<unknown>} Resultado devolvido por `deleteRating`.
 */
export async function deleteRating(req, res) {
    return res.status(200).json({
        rating: await deleteMyRating(req.user.id, req.params.contentId),
    });
}

/**
 * Documenta `getRatingSummaryController`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getRatingSummaryController`.
 * @param {unknown} res Valor recebido por `getRatingSummaryController`.
 * @returns {Promise<unknown>} Resultado devolvido por `getRatingSummaryController`.
 */
export async function getRatingSummaryController(req, res) {
    return res.status(200).json({
        summary: await getRatingSummary(req.params.contentId),
    });
}
