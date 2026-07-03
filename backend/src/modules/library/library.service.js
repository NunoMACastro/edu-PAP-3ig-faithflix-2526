/**
 * @file Ficheiro `real_dev/backend/src/modules/library/library.service.js` da implementação real_dev.
 */

import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { asObjectId, assertListType } from "./library.validation.js";

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

    await assertPublishedContent(db, contentObjectId);

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

    await db.collection("user_content_lists").deleteOne({
        userId: asObjectId(userId, "Utilizador"),
        contentId: asObjectId(contentId, "Conteudo"),
        type: listType,
    });

    return { contentId, type: listType, saved: false };
}

/**
 * Lista uma lista pessoal do utilizador autenticado.
 *
 * @param {string} userId - Authenticated user id.
 * @param {"favorite" | "watchlist"} type - List type.
 * @returns {Promise<Record<string, unknown>[]>} Saved published items.
 */
export async function listSavedContent(userId, type) {
    const db = await getDb();
    const rows = await db
        .collection("user_content_lists")
        .aggregate([
            {
                $match: {
                    userId: asObjectId(userId, "Utilizador"),
                    type: assertListType(type),
                },
            },
            { $sort: { updatedAt: -1 } },
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
        ])
        .toArray();

    return rows.map((row) => publicContent(row.content));
}

/**
 * Lista histórico de visualização a partir do progresso de reprodução.
 *
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<Record<string, unknown>[]>} History items.
 */
export async function listHistory(userId) {
    const db = await getDb();
    const rows = await db
        .collection("playback_progress")
        .aggregate([
            { $match: { userId: asObjectId(userId, "Utilizador") } },
            { $sort: { lastWatchedAt: -1 } },
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
        ])
        .toArray();

    return rows.map((row) => ({
        ...publicContent(row.content),
        currentTimeSeconds: row.currentTimeSeconds,
        durationSeconds: row.durationSeconds,
        completed: row.completed,
        lastWatchedAt: row.lastWatchedAt,
    }));
}
