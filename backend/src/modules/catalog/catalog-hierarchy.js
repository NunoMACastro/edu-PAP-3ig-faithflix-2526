/**
 * @file Invariantes partilhadas da hierarquia série -> episódio.
 */

import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

export const PUBLIC_CATALOG_TYPES = ["movie", "series", "documentary"];
export const ENGAGEABLE_CONTENT_TYPES = PUBLIC_CATALOG_TYPES;

/**
 * Indica se um conteúdo pode surgir autonomamente na descoberta pública.
 *
 * @param {Record<string, unknown>} content Documento de conteúdo.
 * @returns {boolean} `true` para filmes, séries e documentários.
 */
export function isPublicCatalogContent(content) {
    return PUBLIC_CATALOG_TYPES.includes(content?.type);
}

/**
 * Impede favoritos, watchlist, ratings e comentários diretamente em episódios.
 *
 * @param {Record<string, unknown>} content Documento de conteúdo.
 * @returns {void}
 */
export function assertEngageableContent(content) {
    if (!ENGAGEABLE_CONTENT_TYPES.includes(content?.type)) {
        throw new HttpError(
            409,
            "As interacoes de episodios pertencem a serie.",
        );
    }
}

/**
 * Carrega e valida a série referenciada por um episódio.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @param {unknown} seriesId Identificador da série.
 * @param {{ requirePublished?: boolean }} [options] Requisitos de visibilidade.
 * @returns {Promise<Record<string, unknown>>} Documento da série.
 */
export async function getEpisodeSeries(
    db,
    seriesId,
    { requirePublished = false } = {},
) {
    if (!ObjectId.isValid(seriesId)) {
        throw new HttpError(400, "Serie do episodio invalida.");
    }

    const filter = {
        _id: new ObjectId(seriesId),
        type: "series",
    };

    if (requirePublished) {
        filter.status = "published";
    }

    const series = await db.collection("contents").findOne(filter);

    if (!series) {
        throw new HttpError(
            requirePublished ? 404 : 400,
            requirePublished
                ? "Serie do episodio nao encontrada."
                : "O episodio deve pertencer a uma serie existente.",
        );
    }

    return series;
}

/**
 * Cria o resumo seguro de série usado em respostas contextuais.
 *
 * @param {Record<string, unknown>} series Documento da série.
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
 * Devolve a rota canónica de um episódio dentro da respetiva série.
 *
 * @param {Record<string, unknown>} series Documento da série.
 * @param {Record<string, unknown>} episode Documento do episódio.
 * @returns {string} Caminho frontend canónico.
 */
export function episodeCanonicalPath(series, episode) {
    return `/catalogo/${encodeURIComponent(String(series.slug))}/episodios/${encodeURIComponent(String(episode.slug))}`;
}
