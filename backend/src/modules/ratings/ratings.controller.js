import {
  getMyRating,
  getRatingSummary,
  removeMyRating,
  saveMyRating,
} from "./ratings.service.js";

export async function getContentRatingSummary(req, res) {
  res.status(200).json({ summary: await getRatingSummary(req.params.contentId) });
}

export async function getMyContentRating(req, res) {
  res.status(200).json(await getMyRating(req.user.id, req.params.contentId));
}

export async function putMyContentRating(req, res) {
  res.status(200).json(await saveMyRating(req.user.id, req.params.contentId, req.body.value));
}

export async function deleteMyContentRating(req, res) {
  res.status(200).json(await removeMyRating(req.user.id, req.params.contentId));
}