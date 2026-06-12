import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { asObjectId } from "./discovery.validation.js";

/**
 * Converts a content document into a discovery card.
 *
 * @param {Record<string, unknown>} content - MongoDB content document.
 * @returns {Record<string, unknown>} Public discovery card.
 */
function publicDiscoveryCard(content) {
    return {
        id: String(content._id),
        title: content.title,
        slug: content.slug,
        synopsis: content.synopsis,
        type: content.type,
        posterUrl: content.assets?.posterUrl ?? "",
        ratingAverage: Number((content.ratingAverage ?? 0).toFixed?.(2) ?? 0),
    };
}

/**
 * Loads published content sorted by a simple discovery rule.
 *
 * @param {import("mongodb").Db} db - MongoDB database.
 * @param {Record<string, unknown>} match - Additional match filters.
 * @param {Record<string, 1 | -1>} sort - Sort object.
 * @param {number} limit - Maximum items to return.
 * @returns {Promise<Record<string, unknown>[]>} Public cards.
 */
async function loadCards(db, match, sort, limit = 10) {
    const rows = await db
        .collection("contents")
        .aggregate([
            { $match: { status: "published", ...match } },
            {
                $lookup: {
                    from: "content_ratings",
                    localField: "_id",
                    foreignField: "contentId",
                    as: "ratings",
                },
            },
            {
                $addFields: {
                    ratingAverage: { $ifNull: [{ $avg: "$ratings.value" }, 0] },
                },
            },
            { $sort: sort },
            { $limit: limit },
        ])
        .toArray();

    return rows.map(publicDiscoveryCard);
}

/**
 * Builds the public discovery home carousels.
 *
 * @returns {Promise<{ carousels: Record<string, unknown>[] }>} Discovery home response.
 */
export async function getDiscoveryHome() {
    const db = await getDb();
    const [recent, documentaries, topRated] = await Promise.all([
        loadCards(db, {}, { publishedAt: -1, title: 1 }),
        loadCards(db, { type: "documentary" }, { publishedAt: -1, title: 1 }),
        loadCards(db, {}, { ratingAverage: -1, publishedAt: -1, title: 1 }),
    ]);

    return {
        carousels: [
            {
                id: "recent",
                title: "Adicionados recentemente",
                items: recent,
            },
            {
                id: "documentaries",
                title: "Documentarios",
                items: documentaries,
            },
            {
                id: "top-rated",
                title: "Melhor avaliados",
                items: topRated,
            },
        ],
    };
}

/**
 * Lists content related by shared taxonomies first and type second.
 *
 * @param {string} contentId - Public content id.
 * @returns {Promise<{ items: Record<string, unknown>[] }>} Related content response.
 */
export async function getRelatedContent(contentId) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const db = await getDb();
    const content = await db.collection("contents").findOne({
        _id: contentObjectId,
        status: "published",
    });

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const taxonomyIds = content.taxonomyIds ?? [];
    const rows = await db
        .collection("contents")
        .aggregate([
            {
                $match: {
                    _id: { $ne: contentObjectId },
                    status: "published",
                    $or: [
                        { taxonomyIds: { $in: taxonomyIds } },
                        { type: content.type },
                    ],
                },
            },
            {
                $addFields: {
                    relatedScore: {
                        $add: [
                            {
                                $size: {
                                    $setIntersection: [
                                        { $ifNull: ["$taxonomyIds", []] },
                                        taxonomyIds,
                                    ],
                                },
                            },
                            {
                                $cond: [{ $eq: ["$type", content.type] }, 1, 0],
                            },
                        ],
                    },
                },
            },
            { $sort: { relatedScore: -1, publishedAt: -1, title: 1 } },
            { $limit: 8 },
        ])
        .toArray();

    return {
        items: rows.map(publicDiscoveryCard),
    };
}
