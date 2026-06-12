import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { buildRecommendationExplanation } from "./recommendation-explanations.js";

/**
 * Converts a public id into a MongoDB ObjectId.
 *
 * @param {string} id - Raw id from session or data.
 * @param {string} label - Portuguese domain label used in errors.
 * @returns {import("mongodb").ObjectId} Safe ObjectId.
 */
function asObjectId(id, label) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}

/**
 * Converts one content document into a compact recommendation card.
 *
 * @param {Record<string, unknown>} content - MongoDB content document.
 * @returns {Record<string, unknown>} Public recommendation card.
 */
function publicCard(content) {
    return {
        id: String(content._id),
        title: content.title,
        slug: content.slug,
        type: content.type,
        posterUrl: content.assets?.posterUrl ?? "",
    };
}

/**
 * Increments one occurrence counter.
 *
 * @param {Map<string, number>} map - Counter map.
 * @param {unknown} key - Key to count.
 * @returns {void}
 */
function addCount(map, key) {
    if (!key) {
        return;
    }

    map.set(String(key), (map.get(String(key)) ?? 0) + 1);
}

/**
 * Returns the highest-frequency keys from a counter map.
 *
 * @param {Map<string, number>} map - Counter map.
 * @param {number} limit - Maximum number of keys.
 * @returns {string[]} Most frequent keys.
 */
function topKeys(map, limit = 5) {
    return [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([key]) => key);
}

/**
 * Loads allowed recommendation signals for the authenticated user.
 *
 * @param {import("mongodb").Db} db - MongoDB database.
 * @param {import("mongodb").ObjectId} userObjectId - Authenticated user ObjectId.
 * @returns {Promise<Record<string, unknown>>} Aggregated signal summary.
 */
async function loadUserSignals(db, userObjectId) {
    const [lists, history, ratings] = await Promise.all([
        db.collection("user_content_lists").find({ userId: userObjectId }).toArray(),
        db.collection("playback_progress").find({ userId: userObjectId }).toArray(),
        db
            .collection("content_ratings")
            .find({ userId: userObjectId, value: { $gte: 4 } })
            .toArray(),
    ]);

    const contentIds = [
        ...new Set(
            [...lists, ...history, ...ratings].map((row) =>
                String(row.contentId),
            ),
        ),
    ];

    if (contentIds.length === 0) {
        return { contentIds: [], taxonomyIds: [], types: [], signalsUsed: [] };
    }

    const contents = await db
        .collection("contents")
        .find({
            _id: {
                $in: contentIds
                    .filter((id) => ObjectId.isValid(id))
                    .map((id) => ObjectId.createFromHexString(id)),
            },
            status: "published",
        })
        .toArray();

    const taxonomyCounts = new Map();
    const typeCounts = new Map();

    for (const content of contents) {
        addCount(typeCounts, content.type);
        for (const taxonomyId of content.taxonomyIds ?? []) {
            addCount(taxonomyCounts, taxonomyId);
        }
    }

    const signalsUsed = [];
    if (history.length > 0) signalsUsed.push("history");
    if (lists.some((item) => item.type === "favorite")) {
        signalsUsed.push("favorites");
    }
    if (lists.some((item) => item.type === "watchlist")) {
        signalsUsed.push("watchlist");
    }
    if (ratings.length > 0) signalsUsed.push("ratings");

    return {
        contentIds,
        taxonomyIds: topKeys(taxonomyCounts),
        types: topKeys(typeCounts, 3),
        signalsUsed,
    };
}

/**
 * Loads published cards using a filter and excludes already seen cards.
 *
 * @param {import("mongodb").Db} db - MongoDB database.
 * @param {Record<string, unknown>} match - MongoDB match filter.
 * @param {Set<string>} excludedIds - Ids already used or part of user signals.
 * @param {Record<string, 1 | -1>} sort - MongoDB sort.
 * @param {number} limit - Maximum number of cards.
 * @returns {Promise<Record<string, unknown>[]>} Recommendation cards.
 */
async function loadCandidateCards(db, match, excludedIds, sort, limit = 8) {
    const rows = await db
        .collection("contents")
        .aggregate([
            {
                $match: {
                    status: "published",
                    _id: {
                        $nin: [...excludedIds]
                            .filter((id) => ObjectId.isValid(id))
                            .map((id) => ObjectId.createFromHexString(id)),
                    },
                    ...match,
                },
            },
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

    return rows.map(publicCard);
}

/**
 * Builds a recommendation group with its MF3 explanation.
 *
 * @param {string} id - Public group id.
 * @param {string} title - Public group title.
 * @param {string} reasonCode - Internal reason code.
 * @param {Record<string, unknown>[]} items - Recommendation cards.
 * @returns {Record<string, unknown>} Public group.
 */
function group(id, title, reasonCode, items) {
    return {
        id,
        title,
        reasonCode,
        explanation: buildRecommendationExplanation(reasonCode),
        items,
    };
}

/**
 * Builds the cold-start response for users without enough signals.
 *
 * @param {import("mongodb").Db} db - MongoDB database.
 * @returns {Promise<Record<string, unknown>>} Recommendation response.
 */
async function buildColdStart(db) {
    const excludedIds = new Set();
    const popular = await loadCandidateCards(
        db,
        {},
        excludedIds,
        { ratingAverage: -1, publishedAt: -1, title: 1 },
        8,
    );
    popular.forEach((item) => excludedIds.add(item.id));

    const recent = await loadCandidateCards(
        db,
        {},
        excludedIds,
        { publishedAt: -1, title: 1 },
        8,
    );
    recent.forEach((item) => excludedIds.add(item.id));

    const catalog = await loadCandidateCards(
        db,
        {},
        excludedIds,
        { title: 1 },
        8,
    );

    return {
        coldStart: true,
        signalsUsed: [],
        groups: [
            group(
                "popular-start",
                "Populares para comecar",
                "cold-start-popular",
                popular,
            ),
            group(
                "recent-start",
                "Novidades do catalogo",
                "cold-start-recent",
                recent,
            ),
            group(
                "catalog-start",
                "Selecao geral",
                "cold-start-catalog",
                catalog,
            ),
        ],
    };
}

/**
 * Builds baseline recommendations for the authenticated user.
 *
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<Record<string, unknown>>} Recommendation response.
 */
export async function getRecommendationsForUser(userId) {
    const db = await getDb();
    const userObjectId = asObjectId(userId, "Utilizador");
    const signals = await loadUserSignals(db, userObjectId);

    if (signals.contentIds.length === 0) {
        return buildColdStart(db);
    }

    const excludedIds = new Set(signals.contentIds);
    const taxonomyIds = signals.taxonomyIds
        .filter((id) => ObjectId.isValid(id))
        .map((id) => ObjectId.createFromHexString(id));

    const themeItems =
        taxonomyIds.length > 0
            ? await loadCandidateCards(
                  db,
                  { taxonomyIds: { $in: taxonomyIds } },
                  excludedIds,
                  { publishedAt: -1, title: 1 },
              )
            : [];
    themeItems.forEach((item) => excludedIds.add(item.id));

    const activityItems =
        signals.types.length > 0
            ? await loadCandidateCards(
                  db,
                  { type: { $in: signals.types } },
                  excludedIds,
                  { publishedAt: -1, title: 1 },
              )
            : [];
    activityItems.forEach((item) => excludedIds.add(item.id));

    const fallbackItems = await loadCandidateCards(
        db,
        {},
        excludedIds,
        { ratingAverage: -1, publishedAt: -1, title: 1 },
    );

    return {
        coldStart: false,
        signalsUsed: signals.signalsUsed,
        groups: [
            group(
                "because-your-themes",
                "Com temas que acompanhas",
                "themes-from-user-signals",
                themeItems,
            ),
            group(
                "because-your-activity",
                "Com base na tua atividade",
                "activity-types",
                activityItems,
            ),
            group(
                "popular-start",
                "Tambem podes gostar",
                "popular-fallback",
                fallbackItems,
            ),
        ],
    };
}
