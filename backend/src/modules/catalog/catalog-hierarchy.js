/**
 * @file Invariantes partilhadas da hierarquia editorial série -> episódio.
 */

import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

export const PUBLIC_CATALOG_TYPES = ["movie", "series", "documentary"];

/**
 * Indica se um conteúdo deve surgir autonomamente no catálogo público.
 *
 * @param {Record<string, unknown>} content - Documento de conteúdo.
 * @returns {boolean} Verdadeiro para filmes, séries e documentários.
 */
export function isPublicCatalogContent(content) {
    return PUBLIC_CATALOG_TYPES.includes(content?.type);
}

/**
 * Impede engagement diretamente em episódios; esse estado pertence à série.
 *
 * @param {Record<string, unknown>} content - Documento validado.
 * @returns {void}
 * @throws {HttpError} Quando o conteúdo é um episódio.
 */
export function assertEngageableContent(content) {
    if (content?.type === "episode") {
        throw new HttpError(
            409,
            "As interações de episódios pertencem à série.",
            undefined,
            "EPISODE_ENGAGEMENT_FORBIDDEN",
        );
    }
}

/**
 * Carrega e valida a série referenciada por um episódio.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {unknown} seriesId - Identificador da série.
 * @param {{ requirePublished?: boolean, session?: import("mongodb").ClientSession }} [options] - Requisitos de leitura.
 * @returns {Promise<Record<string, unknown>>} Documento da série.
 */
export async function getEpisodeSeries(
    db,
    seriesId,
    { requirePublished = false, session = undefined } = {},
) {
    if (!ObjectId.isValid(seriesId)) {
        throw new HttpError(
            400,
            "Série do episódio inválida.",
            undefined,
            "EPISODE_SERIES_INVALID",
        );
    }

    const filter = {
        _id: new ObjectId(seriesId),
        type: "series",
        ...(requirePublished ? { status: "published" } : {}),
    };
    const series = await db.collection("contents").findOne(filter, { session });

    if (!series) {
        throw new HttpError(
            requirePublished ? 404 : 400,
            requirePublished
                ? "Série do episódio não encontrada."
                : "O episódio deve pertencer a uma série existente.",
            undefined,
            requirePublished
                ? "EPISODE_SERIES_NOT_PUBLISHED"
                : "EPISODE_SERIES_REQUIRED",
        );
    }

    return series;
}

/**
 * Produz o resumo público de uma série sem dados de media.
 *
 * @param {Record<string, unknown>} series - Documento da série.
 * @returns {{ id: string, title: unknown, slug: unknown }} Resumo público.
 */
export function publicSeriesSummary(series) {
    return {
        id: String(series._id),
        title: series.title,
        slug: series.slug,
    };
}

/**
 * Constrói a rota frontend canónica de um episódio.
 *
 * @param {Record<string, unknown>} series - Série publicada.
 * @param {Record<string, unknown>} episode - Episódio publicado.
 * @returns {string} Caminho interno codificado.
 */
export function episodeCanonicalPath(series, episode) {
    return `/catalogo/${encodeURIComponent(String(series.slug))}/episodios/${encodeURIComponent(String(episode.slug))}`;
}
