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
 * Documenta `getComments`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `getComments`.
 * @param {unknown} res Valor recebido por `getComments`.
 * @returns {Promise<unknown>} Resultado devolvido por `getComments`.
 */
export async function getComments(req, res) {
    return res.status(200).json({
        items: await listVisibleComments(req.params.contentId, req.user),
    });
}

/**
 * Documenta `postComment`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `postComment`.
 * @param {unknown} res Valor recebido por `postComment`.
 * @returns {Promise<unknown>} Resultado devolvido por `postComment`.
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
 * Documenta `deleteCommentController`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `deleteCommentController`.
 * @param {unknown} res Valor recebido por `deleteCommentController`.
 * @returns {Promise<unknown>} Resultado devolvido por `deleteCommentController`.
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
 * Documenta `patchCommentModeration`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} req Valor recebido por `patchCommentModeration`.
 * @param {unknown} res Valor recebido por `patchCommentModeration`.
 * @returns {Promise<unknown>} Resultado devolvido por `patchCommentModeration`.
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
