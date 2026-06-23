/**
 * @file Ficheiro `real_dev/backend/src/modules/discovery/discovery.service.js` da implementação real_dev.
 */

import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { asObjectId } from "./discovery.validation.js";

/**
 * Converte um documento de conteúdo num cartão de descoberta.
 *
 * @param {Record<string, unknown>} content - Documento de conteúdo MongoDB.
 * @returns {Record<string, unknown>} Cartão público de descoberta.
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
 * Carrega conteúdo publicado ordenado por uma regra simples de descoberta.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {Record<string, unknown>} match - Additional match filters.
 * @param {Record<string, 1 | -1>} sort - Sort object.
 * @param {number} limit - Maximum items to return.
 * @returns {Promise<Record<string, unknown>[]>} Cartões públicos.
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
 * Constrói os carrosséis públicos da página de descoberta.
 *
 * @returns {Promise<{ carousels: Record<string, unknown>[] }>} Resposta da página inicial de descoberta.
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
 * Lista conteúdo relacionado por taxonomias partilhadas primeiro e tipo depois.
 *
 * @param {string} contentId - Id público do conteúdo.
 * @returns {Promise<{ items: Record<string, unknown>[] }>} Resposta de conteúdo relacionado.
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
