import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { asObjectId, assertListType } from "./library.validation.js";

/**
 * Ensures a published content item exists before list operations.
 *
 * @param {import("mongodb").Db} db - MongoDB database.
 * @param {import("mongodb").ObjectId} contentId - Content id.
 * @returns {Promise<Record<string, unknown>>} Published content document.
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
 * Converts a content document into a compact library item.
 *
 * @param {Record<string, unknown>} content - Content document.
 * @returns {Record<string, unknown>} Public library item.
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
 * Ensures indexes for favorites/watchlist exist.
 *
 * @returns {Promise<void>} Resolves after index creation.
 */
export async function ensureLibraryIndexes() {
    const db = await getDb();
    await db.collection("user_content_lists").createIndex(
        { userId: 1, contentId: 1, type: 1 },
        { unique: true },
    );
}

/**
 * Adds a published content item to one personal list.
 *
 * @param {string} userId - Authenticated user id.
 * @param {string} contentId - Content id.
 * @param {"favorite" | "watchlist"} type - List type.
 * @returns {Promise<{ contentId: string, type: string, saved: true }>} Saved state.
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
 * Removes a content item from one personal list.
 *
 * @param {string} userId - Authenticated user id.
 * @param {string} contentId - Content id.
 * @param {"favorite" | "watchlist"} type - List type.
 * @returns {Promise<{ contentId: string, type: string, saved: false }>} Saved state.
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
 * Lists one personal list for the authenticated user.
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
 * Lists viewing history from playback progress.
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
