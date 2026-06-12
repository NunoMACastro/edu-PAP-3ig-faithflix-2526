import {
    createComment,
    deleteComment,
    listVisibleComments,
    moderateComment,
} from "./comments.service.js";

export async function getComments(req, res) {
    return res.status(200).json({
        items: await listVisibleComments(req.params.contentId, req.user),
    });
}

export async function postComment(req, res) {
    return res.status(201).json({
        comment: await createComment(
            req.user,
            req.params.contentId,
            req.body?.body,
        ),
    });
}

export async function deleteCommentController(req, res) {
    return res.status(200).json({
        comment: await deleteComment(
            req.user.id,
            req.user.role,
            req.params.commentId,
        ),
    });
}

export async function patchCommentModeration(req, res) {
    return res.status(200).json({
        comment: await moderateComment(
            req.params.commentId,
            req.body?.status,
            req.body?.moderationReason,
        ),
    });
}
