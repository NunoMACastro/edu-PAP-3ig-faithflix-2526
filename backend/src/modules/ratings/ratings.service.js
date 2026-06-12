import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { asObjectId, assertRatingValue } from "./ratings.validation.js";

/**
 * Ensures ratings can only target published content.
 *
 * @param {import("mongodb").Db} db - MongoDB database.
 * @param {import("mongodb").ObjectId} contentId - Content ObjectId.
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
 * Builds an empty rating summary for content without ratings.
 *
 * @param {string} contentId - Public content id.
 * @returns {Record<string, unknown>} Empty aggregate response.
 */
function emptySummary(contentId) {
    return {
        contentId,
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
}

/**
 * Creates indexes required by the rating contract.
 *
 * @returns {Promise<void>} Resolves after index creation.
 */
export async function ensureRatingIndexes() {
    const db = await getDb();

    await db.collection("content_ratings").createIndex(
        { userId: 1, contentId: 1 },
        { unique: true },
    );
    await db.collection("content_ratings").createIndex({ contentId: 1 });
}

/**
 * Creates or updates the authenticated user's rating for one content item.
 *
 * @param {string} userId - Authenticated user id from the session.
 * @param {string} contentId - Public content id from route params.
 * @param {unknown} value - Raw rating value.
 * @returns {Promise<Record<string, unknown>>} Saved rating state.
 */
export async function upsertRating(userId, contentId, value) {
    const userObjectId = asObjectId(userId, "Utilizador");
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const rating = assertRatingValue(value);
    await ensureRatingIndexes();

    const db = await getDb();
    const now = new Date();

    await assertPublishedContent(db, contentObjectId);

    await db.collection("content_ratings").updateOne(
        { userId: userObjectId, contentId: contentObjectId },
        {
            $set: { value: rating, updatedAt: now },
            $setOnInsert: {
                userId: userObjectId,
                contentId: contentObjectId,
                createdAt: now,
            },
        },
        { upsert: true },
    );

    return {
        contentId,
        value: rating,
        saved: true,
    };
}

/**
 * Returns the authenticated user's rating for one content item.
 *
 * @param {string} userId - Authenticated user id from the session.
 * @param {string} contentId - Public content id from route params.
 * @returns {Promise<Record<string, unknown>>} Current user rating state.
 */
export async function getMyRating(userId, contentId) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const userObjectId = asObjectId(userId, "Utilizador");
    const db = await getDb();

    await assertPublishedContent(db, contentObjectId);

    const rating = await db.collection("content_ratings").findOne({
        userId: userObjectId,
        contentId: contentObjectId,
    });

    return {
        contentId,
        value: rating?.value ?? null,
    };
}

/**
 * Removes the authenticated user's rating for one content item.
 *
 * @param {string} userId - Authenticated user id from the session.
 * @param {string} contentId - Public content id from route params.
 * @returns {Promise<Record<string, unknown>>} Removed rating state.
 */
export async function deleteMyRating(userId, contentId) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const userObjectId = asObjectId(userId, "Utilizador");
    const db = await getDb();

    await assertPublishedContent(db, contentObjectId);
    await db.collection("content_ratings").deleteOne({
        userId: userObjectId,
        contentId: contentObjectId,
    });

    return {
        contentId,
        value: null,
        saved: false,
    };
}

/**
 * Calculates the public rating aggregate for one published content item.
 *
 * @param {string} contentId - Public content id from route params.
 * @returns {Promise<Record<string, unknown>>} Rating summary.
 */
export async function getRatingSummary(contentId) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const db = await getDb();

    await assertPublishedContent(db, contentObjectId);

    const rows = await db
        .collection("content_ratings")
        .aggregate([
            { $match: { contentId: contentObjectId } },
            {
                $group: {
                    _id: "$value",
                    count: { $sum: 1 },
                },
            },
        ])
        .toArray();

    if (rows.length === 0) {
        return emptySummary(contentId);
    }

    const summary = emptySummary(contentId);
    let weightedTotal = 0;

    for (const row of rows) {
        summary.distribution[row._id] = row.count;
        summary.total += row.count;
        weightedTotal += row._id * row.count;
    }

    summary.average = Number((weightedTotal / summary.total).toFixed(2));

    return summary;
}
