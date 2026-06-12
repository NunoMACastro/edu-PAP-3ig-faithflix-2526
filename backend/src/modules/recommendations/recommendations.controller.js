import { getRecommendationsForUser } from "./recommendations.service.js";

export async function getMyRecommendations(req, res) {
    return res.status(200).json(await getRecommendationsForUser(req.user.id));
}
