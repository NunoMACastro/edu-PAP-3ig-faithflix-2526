/**
 * @file Ficheiro `real_dev/backend/src/modules/comments/comments.controller.js` da implementação real_dev.
 */

import {
    createComment,
    deleteComment,
    listVisibleComments,
    moderateComment,
} from "./comments.service.js";

/**
 * Lista comentários visíveis de um conteúdo.
 *
 * O controller entrega ao serviço o conteúdo da rota e a sessão atual, permitindo
 * filtrar comentários conforme permissões ou estado de moderação.
 *
 * @param {import("express").Request} req Pedido Express com `params.contentId` e utilizador opcional.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com comentários visíveis.
 */
export async function getComments(req, res) {
    return res.status(200).json({
        items: await listVisibleComments(req.params.contentId, req.user),
    });
}

/**
 * Cria um comentário para o conteúdo indicado.
 *
 * A função recolhe autor, conteúdo e texto do pedido e delega no serviço a
 * validação, moderação inicial e persistência.
 *
 * @param {import("express").Request} req Pedido Express com utilizador, conteúdo e `body.body`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o comentário criado.
 */
export async function postComment(req, res) {
    return res.status(201).json({
        comment: await createComment(
            req.user,
            req.params.contentId,
            req.body?.body,
        ),
    });
}

/**
 * Remove um comentário autorizado.
 *
 * O controller passa o utilizador, o papel e o comentário alvo para o serviço,
 * que decide se a remoção pode ser feita pelo autor ou por administração.
 *
 * @param {import("express").Request} req Pedido Express com sessão e `params.commentId`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o comentário removido.
 */
export async function deleteCommentController(req, res) {
    return res.status(200).json({
        comment: await deleteComment(
            req.user.id,
            req.user.role,
            req.params.commentId,
        ),
    });
}

/**
 * Atualiza o estado de moderação de um comentário.
 *
 * A função lê a decisão e a justificação do body e deixa o serviço aplicar as
 * regras de moderação antes de devolver o comentário atualizado.
 *
 * @param {import("express").Request} req Pedido Express com comentário alvo e decisão no body.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o comentário moderado.
 */
export async function patchCommentModeration(req, res) {
    return res.status(200).json({
        comment: await moderateComment(
            req.params.commentId,
            req.body?.status,
            req.body?.moderationReason,
        ),
    });
}
