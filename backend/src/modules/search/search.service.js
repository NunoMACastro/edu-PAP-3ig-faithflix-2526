import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import {
    assertSearchQuery,
    escapeRegExp,
    parsePagination,
    parseSearchFilters,
} from "./search.validation.js";

/**
 * Converts one content document into a public search card.
 *
 * @param {Record<string, unknown>} content - MongoDB content document.
 * @param {Map<string, string>} taxonomyNamesById - Taxonomy names indexed by id.
 * @returns {Record<string, unknown>} Public search result item.
 */
function publicSearchItem(content, taxonomyNamesById) {
    const taxonomyNames = (content.taxonomyIds ?? [])
        .map((id) => taxonomyNamesById.get(String(id)))
        .filter(Boolean);

    return {
        id: String(content._id),
        title: content.title,
        slug: content.slug,
        synopsis: content.synopsis,
        type: content.type,
        posterUrl: content.assets?.posterUrl ?? "",
        taxonomyNames,
        ratingAverage: content.ratingAverage ?? 0,
    };
}

/**
 * Loads names for all taxonomy ids used by returned contents.
 *
 * @param {import("mongodb").Db} db - MongoDB database.
 * @param {Record<string, unknown>[]} contents - Content documents.
 * @returns {Promise<Map<string, string>>} Taxonomy names indexed by id.
 */
async function loadTaxonomyNames(db, contents) {
    const ids = [
        ...new Set(
            contents.flatMap((content) =>
                (content.taxonomyIds ?? []).map((id) => String(id)),
            ),
        ),
    ];

    if (ids.length === 0) {
        return new Map();
    }

    const taxonomies = await db
        .collection("taxonomies")
        .find({
            _id: { $in: ids.map((id) => ObjectId.createFromHexString(id)) },
        })
        .toArray();

    return new Map(
        taxonomies.map((taxonomy) => [String(taxonomy._id), taxonomy.name]),
    );
}

/**
 * Builds a MongoDB sort object from the public sort option.
 *
 * @param {string} sort - Validated sort option.
 * @returns {Record<string, 1 | -1>} MongoDB sort object.
 */
function buildSort(sort) {
    if (sort === "recent") {
        return { publishedAt: -1, title: 1 };
    }

    if (sort === "rating") {
        return { ratingAverage: -1, publishedAt: -1, title: 1 };
    }

    return { title: 1 };
}

/**
 * Runs the public unified search over published content and taxonomies.
 *
 * @param {Record<string, unknown>} queryParams - Raw request query.
 * @returns {Promise<Record<string, unknown>>} Search response.
 */
export async function searchContents(queryParams) {
    const query = assertSearchQuery(queryParams.q);
    const { page, limit } = parsePagination(queryParams);
    const filters = parseSearchFilters(queryParams);
    const db = await getDb();
    const regex = new RegExp(escapeRegExp(query), "i");

    const matchingTaxonomies = await db
        .collection("taxonomies")
        .find({ name: regex }, { projection: { _id: 1 } })
        .toArray();
    const taxonomyIds = matchingTaxonomies.map((taxonomy) => taxonomy._id);
    const filter = {
        status: "published",
        $or: [
            { title: regex },
            { slug: regex },
            { synopsis: regex },
            { taxonomyIds: { $in: taxonomyIds } },
        ],
    };

    if (filters.type) {
        filter.type = filters.type;
    }

    if (filters.taxonomyId) {
        filter.taxonomyIds = ObjectId.createFromHexString(filters.taxonomyId);
    }

    const pipeline = [
        { $match: filter },
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
        { $sort: buildSort(filters.sort) },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
            },
        },
    ];

    const [result] = await db.collection("contents").aggregate(pipeline).toArray();
    const items = result?.items ?? [];
    const taxonomyNamesById = await loadTaxonomyNames(db, items);

    return {
        query,
        page,
        limit,
        total: result?.metadata?.[0]?.total ?? 0,
        sort: filters.sort,
        filters: {
            type: filters.type,
            taxonomyId: filters.taxonomyId,
        },
        items: items.map((content) =>
            publicSearchItem(content, taxonomyNamesById),
        ),
    };
}
