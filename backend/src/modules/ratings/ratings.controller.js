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
 * Cria ou atualiza a avaliação do utilizador para um conteúdo.
 *
 * O controller junta o utilizador autenticado, o conteúdo da rota e o valor do
 * body antes de delegar a validação no serviço.
 *
 * @param {import("express").Request} req Pedido Express com `user.id`, `params.contentId` e `body.value`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com a avaliação guardada.
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
 * Devolve a avaliação pessoal do utilizador para um conteúdo.
 *
 * A função usa a sessão para consultar apenas a avaliação do próprio utilizador.
 *
 * @param {import("express").Request} req Pedido Express com `user.id` e `params.contentId`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com a avaliação pessoal.
 */
export async function getRatingMe(req, res) {
    return res.status(200).json({
        rating: await getMyRating(req.user.id, req.params.contentId),
    });
}

/**
 * Remove a avaliação pessoal do utilizador para um conteúdo.
 *
 * O conteúdo vem da rota e a conta vem da sessão, impedindo remoção de avaliações
 * de outros utilizadores.
 *
 * @param {import("express").Request} req Pedido Express com `user.id` e `params.contentId`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com a avaliação removida.
 */
export async function deleteRating(req, res) {
    return res.status(200).json({
        rating: await deleteMyRating(req.user.id, req.params.contentId),
    });
}

/**
 * Devolve o resumo agregado de avaliações de um conteúdo.
 *
 * A rota pública recebe apenas o conteúdo e o serviço calcula totais e média sem
 * revelar dados pessoais de avaliadores.
 *
 * @param {import("express").Request} req Pedido Express com `params.contentId`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com resumo de avaliações.
 */
export async function getRatingSummaryController(req, res) {
    return res.status(200).json({
        summary: await getRatingSummary(req.params.contentId),
    });
}
