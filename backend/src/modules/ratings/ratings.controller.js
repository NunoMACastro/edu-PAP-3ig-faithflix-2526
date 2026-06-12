import {
    deleteMyRating,
    getMyRating,
    getRatingSummary,
    upsertRating,
} from "./ratings.service.js";

export async function putRating(req, res) {
    return res.status(200).json({
        rating: await upsertRating(
            req.user.id,
            req.params.contentId,
            req.body?.value,
        ),
    });
}

export async function getRatingMe(req, res) {
    return res.status(200).json({
        rating: await getMyRating(req.user.id, req.params.contentId),
    });
}

export async function deleteRating(req, res) {
    return res.status(200).json({
        rating: await deleteMyRating(req.user.id, req.params.contentId),
    });
}

export async function getRatingSummaryController(req, res) {
    return res.status(200).json({
        summary: await getRatingSummary(req.params.contentId),
    });
}
