import { getMyRecommendations } from "./recommendations.service.js";

export async function getRecommendationsForMe(req, res) {
  res.status(200).json(await getMyRecommendations(req.user.id));
}