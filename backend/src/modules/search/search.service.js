/**
 * @file Ficheiro `real_dev/backend/src/modules/search/search.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import {
    assertSearchQuery,
    escapeRegExp,
    parsePagination,
    parseSearchFilters,
} from "./search.validation.js";

/**
 * Converte um documento de conteúdo num cartão público de pesquisa.
 *
 * @param {Record<string, unknown>} content - Documento de conteúdo MongoDB.
 * @param {Map<string, string>} taxonomyNamesById - Nomes de taxonomias indexados por id.
 * @returns {Record<string, unknown>} Item público de resultado de pesquisa.
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
 * Carrega nomes de todas as taxonomias usadas pelos conteúdos devolvidos.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {Record<string, unknown>[]} contents - Content documents.
 * @returns {Promise<Map<string, string>>} Nomes de taxonomias indexados por id.
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
 * Constrói um objeto sort MongoDB a partir da opção pública de ordenação.
 *
 * @param {string} sort - Validated sort option.
 * @returns {Record<string, 1 | -1>} Objeto sort MongoDB.
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
 * Executa a pesquisa pública unificada sobre conteúdo publicado e taxonomias.
 *
 * @param {Record<string, unknown>} queryParams - Query bruta do pedido.
 * @returns {Promise<Record<string, unknown>>} Resposta da pesquisa.
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
