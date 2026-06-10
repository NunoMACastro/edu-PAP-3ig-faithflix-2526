import {
  createComment,
  deleteOwnComment,
  listVisibleComments,
  moderateComment,
} from "./comments.service.js";

export async function getCommentsByContent(req, res) {
  res.status(200).json({ items: await listVisibleComments(req.params.contentId) });
}

export async function postCommentByContent(req, res) {
  res.status(201).json(await createComment(req.user.id, req.params.contentId, req.body));
}

export async function deleteComment(req, res) {
  res.status(200).json(await deleteOwnComment(req.user.id, req.params.commentId));
}

export async function patchCommentModeration(req, res) {
  res.status(200).json(await moderateComment(req.params.commentId, req.body));
}