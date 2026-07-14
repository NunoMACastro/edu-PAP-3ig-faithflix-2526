/**
 * @file Ficheiro `real_dev/backend/src/modules/library/library.service.js` da implementação real_dev.
 */

import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { paginationMetadata } from "../../utils/pagination.js";
import {
    PUBLIC_CATALOG_TYPES,
    assertEngageableContent,
} from "../catalog/catalog-hierarchy.js";
import {
    asObjectId,
    assertListType,
    parsePersonalListPagination,
} from "./library.validation.js";

/**
 * Garante que um conteúdo publicado existe antes de operações de lista.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {import("mongodb").ObjectId} contentId - Id do conteúdo.
 * @returns {Promise<Record<string, unknown>>} Documento de conteúdo publicado.
 */
async function assertPublishedContent(db, contentId) {
    const content = await db.collection("contents").findOne({
        _id: contentId,
        status: "published",
    });

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    return content;
}

/**
 * Converte um documento de conteúdo num item compacto de biblioteca.
 *
 * @param {Record<string, unknown>} content - Documento de conteúdo.
 * @returns {Record<string, unknown>} Item público de biblioteca.
 */
function publicContent(content) {
    return {
        id: String(content._id),
        title: content.title,
        slug: content.slug,
        posterUrl: content.assets?.posterUrl ?? "",
        type: content.type,
        durationSeconds: content.durationSeconds,
    };
}

/**
 * Executa uma pagina MongoDB sobre um pipeline que ja restringe pertença e visibilidade.
 *
 * @param {import("mongodb").Collection} collection Colecao de origem.
 * @param {Record<string, unknown>[]} pipeline Filtros e joins anteriores a paginacao.
 * @param {Record<string, 1 | -1>} sort Ordenacao total e estavel.
 * @param {{ page: number, limit: number }} pagination Pagina validada.
 * @returns {Promise<{ rows: Record<string, unknown>[], page: number, limit: number, total: number, totalPages: number }>} Resultado paginado.
 */
async function aggregatePersonalPage(collection, pipeline, sort, pagination) {
    const { page, limit } = pagination;
    const [result = {}] = await collection
        .aggregate([
            ...pipeline,
            {
                $facet: {
                    items: [
                        { $sort: sort },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                    ],
                    metadata: [{ $count: "total" }],
                },
            },
        ])
        .toArray();
    const total = result.metadata?.[0]?.total ?? 0;

    return {
        rows: result.items ?? [],
        ...paginationMetadata({ page, limit, total }),
    };
}

/**
 * Garante que existem os índices de favoritos/watchlist.
 *
 * @returns {Promise<void>} Termina depois da criação de índices.
 */
export async function ensureLibraryIndexes() {
    const db = await getDb();
    await db.collection("user_content_lists").createIndex(
        { userId: 1, contentId: 1, type: 1 },
        { unique: true },
    );
}

/**
 * Adiciona conteúdo publicado a uma lista pessoal.
 *
 * @param {string} userId - Authenticated user id.
 * @param {string} contentId - Id do conteúdo.
 * @param {"favorite" | "watchlist"} type - List type.
 * @returns {Promise<{ contentId: string, type: string, saved: true }>} Estado de gravação.
 */
export async function addToList(userId, contentId, type) {
    await ensureLibraryIndexes();

    const db = await getDb();
    const userObjectId = asObjectId(userId, "Utilizador");
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const listType = assertListType(type);
    const now = new Date();

    const content = await assertPublishedContent(db, contentObjectId);
    assertEngageableContent(content);

    await db.collection("user_content_lists").updateOne(
        { userId: userObjectId, contentId: contentObjectId, type: listType },
        {
            $set: { updatedAt: now },
            $setOnInsert: {
                userId: userObjectId,
                contentId: contentObjectId,
                type: listType,
                createdAt: now,
            },
        },
        { upsert: true },
    );

    return { contentId, type: listType, saved: true };
}

/**
 * Remove conteúdo de uma lista pessoal.
 *
 * @param {string} userId - Authenticated user id.
 * @param {string} contentId - Id do conteúdo.
 * @param {"favorite" | "watchlist"} type - List type.
 * @returns {Promise<{ contentId: string, type: string, saved: false }>} Estado de gravação.
 */
export async function removeFromList(userId, contentId, type) {
    const db = await getDb();
    const listType = assertListType(type);
    const contentObjectId = asObjectId(contentId, "Conteudo");

    const content = await assertPublishedContent(db, contentObjectId);
    assertEngageableContent(content);

    await db.collection("user_content_lists").deleteOne({
        userId: asObjectId(userId, "Utilizador"),
        contentId: contentObjectId,
        type: listType,
    });

    return { contentId, type: listType, saved: false };
}

/**
 * Lista uma lista pessoal do utilizador autenticado.
 *
 * @param {string} userId - Authenticated user id.
 * @param {"favorite" | "watchlist"} type - List type.
 * @param {Record<string, unknown>} [query={}] Query de paginacao.
 * @returns {Promise<{items: Record<string, unknown>[], page: number, limit: number, total: number, totalPages: number}>} Pagina de conteudos publicados guardados.
 */
export async function listSavedContent(userId, type, query = {}) {
    const db = await getDb();
    const page = await aggregatePersonalPage(
        db.collection("user_content_lists"),
        [
            {
                $match: {
                    userId: asObjectId(userId, "Utilizador"),
                    type: assertListType(type),
                },
            },
            {
                $lookup: {
                    from: "contents",
                    localField: "contentId",
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
        ],
        { updatedAt: -1, _id: 1 },
        parsePersonalListPagination(query),
    );

    return {
        items: page.rows.map((row) => publicContent(row.content)),
        page: page.page,
        limit: page.limit,
        total: page.total,
        totalPages: page.totalPages,
    };
}

/**
 * Lista histórico de visualização a partir do progresso de reprodução.
 *
 * @param {string} userId - Authenticated user id.
 * @param {Record<string, unknown>} [query={}] Query de paginacao.
 * @returns {Promise<{items: Record<string, unknown>[], page: number, limit: number, total: number, totalPages: number}>} Pagina de historico.
 */
export async function listHistory(userId, query = {}) {
    const db = await getDb();
    const page = await aggregatePersonalPage(
        db.collection("playback_progress"),
        [
            { $match: { userId: asObjectId(userId, "Utilizador") } },
            {
                $lookup: {
                    from: "contents",
                    localField: "contentId",
                    foreignField: "_id",
                    as: "content",
                },
            },
            { $unwind: "$content" },
            { $match: { "content.status": "published" } },
        ],
        { lastWatchedAt: -1, _id: 1 },
        parsePersonalListPagination(query),
    );

    return {
        items: page.rows.map((row) => ({
            ...publicContent(row.content),
            currentTimeSeconds: row.currentTimeSeconds,
            durationSeconds: row.durationSeconds,
            completed: row.completed,
            lastWatchedAt: row.lastWatchedAt,
        })),
        page: page.page,
        limit: page.limit,
        total: page.total,
        totalPages: page.totalPages,
    };
}
