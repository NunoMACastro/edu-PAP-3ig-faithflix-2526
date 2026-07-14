/**
 * @file Ficheiro `real_dev/backend/src/modules/discovery/discovery.service.js` da implementação real_dev.
 */

import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { getMediaAvailability } from "../catalog/catalog-media.js";
import {
    PUBLIC_CATALOG_TYPES,
    getEpisodeSeries,
} from "../catalog/catalog-hierarchy.js";
import { asObjectId } from "./discovery.validation.js";

const FEATURED_FORMAT_TYPES = ["movie", "series", "documentary"];

/**
 * Converte um documento de conteúdo num cartão de descoberta.
 *
 * @param {Record<string, unknown>} content - Documento de conteúdo MongoDB.
 * @returns {Record<string, unknown>} Cartão público de descoberta.
 */
export function toPublicDiscoveryCard(content) {
    const availability = getMediaAvailability(content);

    return {
        id: String(content._id),
        title: content.title,
        slug: content.slug,
        synopsis: content.synopsis,
        type: content.type,
        posterUrl: content.assets?.posterUrl ?? "",
        backdropUrl: content.assets?.backdropUrl ?? "",
        durationSeconds: content.durationSeconds,
        ageRating: content.ageRating,
        ratingAverage: Number((content.ratingAverage ?? 0).toFixed?.(2) ?? 0),
        ...availability,
        isPlayable:
            content.type === "series" ? false : availability.isPlayable,
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
            {
                $match: {
                    status: "published",
                    type: { $in: PUBLIC_CATALOG_TYPES },
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

    return rows.map(toPublicDiscoveryCard);
}

/**
 * Carrega conteúdos mais vistos a partir de progresso real de reprodução.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {number} limit - Maximum items to return.
 * @returns {Promise<Record<string, unknown>[]>} Cartões públicos ordenados por visualização.
 */
async function loadMostWatchedCards(db, limit = 4) {
    const rows = await db
        .collection("playback_progress")
        .aggregate([
            {
                $match: {
                    $or: [
                        { completed: true },
                        { currentTimeSeconds: { $gte: 60 } },
                    ],
                },
            },
            {
                $group: {
                    _id: "$contentId",
                    watchCount: { $sum: 1 },
                    lastWatchedAt: { $max: "$lastWatchedAt" },
                },
            },
            { $sort: { watchCount: -1, lastWatchedAt: -1 } },
            {
                $lookup: {
                    from: "contents",
                    localField: "_id",
                    foreignField: "_id",
                    as: "content",
                },
            },
            { $unwind: "$content" },
            { $match: { "content.status": "published" } },
            {
                $addFields: {
                    effectiveContentId: {
                        $cond: [
                            { $eq: ["$content.type", "episode"] },
                            "$content.seriesId",
                            "$content._id",
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$effectiveContentId",
                    watchCount: { $sum: "$watchCount" },
                    lastWatchedAt: { $max: "$lastWatchedAt" },
                },
            },
            { $sort: { watchCount: -1, lastWatchedAt: -1 } },
            {
                $lookup: {
                    from: "contents",
                    localField: "_id",
                    foreignField: "_id",
                    as: "content",
                },
            },
            { $unwind: "$content" },
            {
                $match: {
                    "content.status": "published",
                    "content.type": { $in: PUBLIC_CATALOG_TYPES },
                },
            },
            { $limit: limit },
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
                    "content.ratingAverage": {
                        $ifNull: [{ $avg: "$ratings.value" }, 0],
                    },
                },
            },
        ])
        .toArray();

    return rows.map((row) => toPublicDiscoveryCard(row.content));
}

/**
 * Carrega resumos reais dos formatos principais usados na home pública.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @returns {Promise<Record<string, unknown>[]>} Formatos com contagem e amostra publicada.
 */
async function loadFormatSummaries(db) {
    const rows = await db
        .collection("contents")
        .aggregate([
            {
                $match: {
                    status: "published",
                    type: { $in: FEATURED_FORMAT_TYPES },
                },
            },
            { $sort: { publishedAt: -1, title: 1 } },
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    sampleTitle: { $first: "$title" },
                    posterUrl: { $first: "$assets.posterUrl" },
                    backdropUrl: { $first: "$assets.backdropUrl" },
                },
            },
        ])
        .toArray();
    const summariesByType = new Map(rows.map((row) => [row._id, row]));

    return FEATURED_FORMAT_TYPES.map((type) => {
        const summary = summariesByType.get(type);

        return {
            type,
            count: summary?.count ?? 0,
            sampleTitle: summary?.sampleTitle ?? "",
            posterUrl: summary?.posterUrl ?? "",
            backdropUrl: summary?.backdropUrl ?? "",
        };
    });
}

/**
 * Constrói os carrosséis públicos da página de descoberta.
 *
 * @returns {Promise<{ carousels: Record<string, unknown>[], formats: Record<string, unknown>[] }>} Resposta da página inicial de descoberta.
 */
export async function getDiscoveryHome() {
    const db = await getDb();
    const [mostWatched, recent, formats] = await Promise.all([
        loadMostWatchedCards(db, 4),
        loadCards(db, {}, { publishedAt: -1, title: 1 }, 5),
        loadFormatSummaries(db),
    ]);

    return {
        carousels: [
            {
                id: "most-watched",
                title: "Mais vistos",
                items: mostWatched,
            },
            {
                id: "recent",
                title: "Adicionados recentemente",
                items: recent,
            },
        ],
        formats,
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
    let content = await db.collection("contents").findOne({
        _id: contentObjectId,
        status: "published",
    });

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    if (content.type === "episode") {
        content = await getEpisodeSeries(db, content.seriesId, {
            requirePublished: true,
        });
    }

    const taxonomyIds = content.taxonomyIds ?? [];
    const rows = await db
        .collection("contents")
        .aggregate([
            {
                $match: {
                    _id: { $ne: content._id },
                    status: "published",
                    type: { $in: PUBLIC_CATALOG_TYPES },
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
        items: rows.map(toPublicDiscoveryCard),
    };
}
