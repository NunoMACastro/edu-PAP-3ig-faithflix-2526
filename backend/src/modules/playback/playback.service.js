import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
    getMediaPreferences,
    ensureMediaPreferenceIndexes,
} from "./media-preferences.service.js";
import { assertProgressPayload } from "./playback.validation.js";

/**
 * Converts a string id into ObjectId with a domain-specific error.
 *
 * @param {string} id - Raw id.
 * @param {string} label - Domain label for error messages.
 * @returns {import("mongodb").ObjectId} MongoDB ObjectId.
 */
function asObjectId(id, label) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}

/**
 * Converts a progress document into the public API shape.
 *
 * @param {Record<string, unknown> | null} progress - Progress document or null.
 * @param {number} durationSeconds - Content duration.
 * @returns {{ currentTimeSeconds: number, durationSeconds: number, completed: boolean, lastWatchedAt: Date | null }} Public progress.
 */
function publicProgress(progress, durationSeconds) {
    if (!progress) {
        return {
            currentTimeSeconds: 0,
            durationSeconds,
            completed: false,
            lastWatchedAt: null,
        };
    }

    return {
        currentTimeSeconds: progress.currentTimeSeconds,
        durationSeconds: progress.durationSeconds,
        completed: progress.completed,
        lastWatchedAt: progress.lastWatchedAt,
    };
}

/**
 * Resolves playable media without constructing URLs from user input.
 *
 * @param {Record<string, unknown>} content - Content document.
 * @param {{ audioLanguage: string, quality: string }} preferences - User preferences.
 * @returns {{ playbackUrl: string, selectedAudioLanguage: string, selectedQuality: string }} Playable media.
 */
function resolvePlayableMedia(content, preferences) {
    const selectedAudio = content.tracks?.audio?.find(
        (track) => track.language === preferences.audioLanguage,
    );
    const selectedQuality = content.qualityOptions?.find(
        (option) => option.value === preferences.quality,
    );

    return {
        playbackUrl:
            selectedAudio?.src ??
            selectedQuality?.playbackUrl ??
            content.media.playbackUrl,
        selectedAudioLanguage: selectedAudio?.language ?? "",
        selectedQuality: selectedQuality?.value ?? "",
    };
}

/**
 * Throws when user parental settings block a content item.
 *
 * @param {{ parentalMaxAgeRating?: number } | null} user - User document.
 * @param {{ ageRating?: number }} content - Content document.
 * @returns {void}
 */
function assertParentalAccess(user, content) {
    const maxAge = Number.isInteger(user?.parentalMaxAgeRating)
        ? user.parentalMaxAgeRating
        : 18;

    if (Number(content.ageRating) > maxAge) {
        throw new HttpError(403, "Conteudo bloqueado pelo controlo parental.");
    }
}

/**
 * Converts content to the playback response shape.
 *
 * @param {Record<string, unknown>} content - Content document.
 * @param {Record<string, string>} preferences - User preferences.
 * @returns {Record<string, unknown>} Public playback content.
 */
function publicPlaybackContent(content, preferences) {
    return {
        id: String(content._id),
        title: content.title,
        durationSeconds: content.durationSeconds,
        media: resolvePlayableMedia(content, preferences),
        tracks: content.tracks ?? { subtitles: [], audio: [] },
        qualityOptions: content.qualityOptions ?? [],
        preferences,
    };
}

/**
 * Ensures playback indexes exist.
 *
 * @returns {Promise<void>} Resolves after index creation.
 */
export async function ensurePlaybackIndexes() {
    const db = await getDb();
    await db
        .collection("playback_progress")
        .createIndex({ userId: 1, contentId: 1 }, { unique: true });
    await db
        .collection("playback_progress")
        .createIndex({ userId: 1, lastWatchedAt: -1 });
    await ensureMediaPreferenceIndexes();
}

/**
 * Loads a published content playback payload for one authenticated user.
 *
 * @param {string} contentId - Content id.
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<{ content: Record<string, unknown>, progress: ReturnType<typeof publicProgress> }>} Playback response.
 */
export async function getPlayback(contentId, userId) {
    const db = await getDb();
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const userObjectId = asObjectId(userId, "Utilizador");
    const content = await db.collection("contents").findOne({
        _id: contentObjectId,
        status: "published",
    });

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const user = await db.collection("users").findOne({ _id: userObjectId });
    assertParentalAccess(user, content);

    const preferences = await getMediaPreferences(userId);
    const progress = await db.collection("playback_progress").findOne({
        userId: userObjectId,
        contentId: contentObjectId,
    });

    return {
        content: publicPlaybackContent(content, preferences),
        progress: publicProgress(progress, content.durationSeconds),
    };
}

/**
 * Saves playback progress for one user/content pair.
 *
 * @param {string} contentId - Content id.
 * @param {string} userId - Authenticated user id.
 * @param {{ currentTimeSeconds?: unknown }} input - Progress payload.
 * @returns {Promise<ReturnType<typeof publicProgress>>} Saved progress.
 */
export async function savePlaybackProgress(contentId, userId, input) {
    await ensurePlaybackIndexes();

    const db = await getDb();
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const userObjectId = asObjectId(userId, "Utilizador");
    const content = await db.collection("contents").findOne({
        _id: contentObjectId,
        status: "published",
    });

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const progress = assertProgressPayload(input, content.durationSeconds);
    const now = new Date();

    await db.collection("playback_progress").updateOne(
        { userId: userObjectId, contentId: contentObjectId },
        {
            $set: { ...progress, lastWatchedAt: now, updatedAt: now },
            $setOnInsert: {
                userId: userObjectId,
                contentId: contentObjectId,
                createdAt: now,
            },
        },
        { upsert: true },
    );

    return publicProgress({ ...progress, lastWatchedAt: now }, content.durationSeconds);
}

/**
 * Lists unfinished progress for the authenticated user.
 *
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<Record<string, unknown>[]>} Continue-watching items.
 */
export async function listContinueWatching(userId) {
    const db = await getDb();
    const rows = await db
        .collection("playback_progress")
        .aggregate([
            {
                $match: {
                    userId: asObjectId(userId, "Utilizador"),
                    completed: false,
                },
            },
            { $sort: { lastWatchedAt: -1 } },
            { $limit: 12 },
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
        id: String(row.content._id),
        title: row.content.title,
        slug: row.content.slug,
        posterUrl: row.content.assets?.posterUrl ?? "",
        currentTimeSeconds: row.currentTimeSeconds,
        durationSeconds: row.durationSeconds,
        lastWatchedAt: row.lastWatchedAt,
    }));
}
