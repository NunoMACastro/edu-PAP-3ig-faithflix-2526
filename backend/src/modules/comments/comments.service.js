import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
    asObjectId,
    assertCommentBody,
    assertModerationStatus,
    initialModerationFor,
} from "./comments.validation.js";

/**
 * Ensures comments can only target published content.
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
 * Checks whether the current viewer can delete one comment without exposing user ids.
 *
 * @param {Record<string, unknown>} comment - MongoDB comment document.
 * @param {{ id?: string, role?: string } | null} viewer - Current viewer, when authenticated.
 * @returns {boolean} True when the viewer owns the comment or can moderate it.
 */
function canDeleteComment(comment, viewer) {
    if (!viewer) {
        return false;
    }

    return (
        String(comment.userId) === String(viewer.id) ||
        ["admin", "moderator"].includes(viewer.role)
    );
}

/**
 * Converts a comment document into the public API shape.
 *
 * @param {Record<string, unknown>} comment - MongoDB comment document.
 * @param {{ id?: string, role?: string } | null} [viewer=null] - Current viewer, when authenticated.
 * @returns {Record<string, unknown>} Public comment.
 */
export function publicComment(comment, viewer = null) {
    return {
        id: String(comment._id),
        contentId: String(comment.contentId),
        body: comment.body,
        status: comment.status,
        moderationReason: comment.moderationReason ?? null,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        canDelete: canDeleteComment(comment, viewer),
    };
}

/**
 * Creates indexes required by comment listing and moderation.
 *
 * @returns {Promise<void>} Resolves after index creation.
 */
export async function ensureCommentIndexes() {
    const db = await getDb();

    await db
        .collection("content_comments")
        .createIndex({ contentId: 1, status: 1, createdAt: -1 });
    await db.collection("content_comments").createIndex({ userId: 1 });
}

/**
 * Lists visible comments for one published content item.
 *
 * @param {string} contentId - Public content id.
 * @param {{ id?: string, role?: string } | null} [viewer=null] - Current viewer, when authenticated.
 * @returns {Promise<Record<string, unknown>[]>} Visible comments.
 */
export async function listVisibleComments(contentId, viewer = null) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const db = await getDb();

    await assertPublishedContent(db, contentObjectId);

    const comments = await db
        .collection("content_comments")
        .find({ contentId: contentObjectId, status: "visible" })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

    return comments.map((comment) => publicComment(comment, viewer));
}

/**
 * Creates a comment owned by the authenticated user.
 *
 * @param {{ id: string, role?: string }} user - Authenticated user.
 * @param {string} contentId - Public content id.
 * @param {unknown} bodyValue - Raw comment body.
 * @returns {Promise<Record<string, unknown>>} Created comment.
 */
export async function createComment(user, contentId, bodyValue) {
    const userObjectId = asObjectId(user.id, "Utilizador");
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const body = assertCommentBody(bodyValue);
    const moderation = initialModerationFor(body);
    await ensureCommentIndexes();

    const db = await getDb();
    const now = new Date();

    await assertPublishedContent(db, contentObjectId);

    const document = {
        userId: userObjectId,
        contentId: contentObjectId,
        body,
        status: moderation.status,
        moderationReason: moderation.moderationReason,
        createdAt: now,
        updatedAt: now,
    };

    const result = await db.collection("content_comments").insertOne(document);

    return publicComment({ ...document, _id: result.insertedId }, user);
}

/**
 * Deletes one comment when the user owns it or has moderation privileges.
 *
 * @param {string} userId - Authenticated user id.
 * @param {string} role - Authenticated user role.
 * @param {string} commentId - Public comment id.
 * @returns {Promise<{ id: string, deleted: true }>} Deleted state.
 */
export async function deleteComment(userId, role, commentId) {
    const commentObjectId = asObjectId(commentId, "Comentario");
    const db = await getDb();
    const comment = await db
        .collection("content_comments")
        .findOne({ _id: commentObjectId });

    if (!comment) {
        throw new HttpError(404, "Comentario nao encontrado.");
    }

    const isOwner = String(comment.userId) === String(userId);
    const canModerate = ["admin", "moderator"].includes(role);

    if (!isOwner && !canModerate) {
        throw new HttpError(403, "Permissao insuficiente.");
    }

    await db.collection("content_comments").deleteOne({ _id: commentObjectId });

    return { id: commentId, deleted: true };
}

/**
 * Updates moderation status for one comment.
 *
 * @param {string} commentId - Public comment id.
 * @param {unknown} statusValue - Raw moderation status.
 * @param {unknown} reasonValue - Optional moderation reason.
 * @returns {Promise<Record<string, unknown>>} Updated comment.
 */
export async function moderateComment(commentId, statusValue, reasonValue) {
    const commentObjectId = asObjectId(commentId, "Comentario");
    const status = assertModerationStatus(statusValue);
    const moderationReason = String(reasonValue ?? "").trim() || null;
    const db = await getDb();

    const updated = await db.collection("content_comments").findOneAndUpdate(
        { _id: commentObjectId },
        {
            $set: {
                status,
                moderationReason,
                updatedAt: new Date(),
            },
        },
        { returnDocument: "after" },
    );

    if (!updated) {
        throw new HttpError(404, "Comentario nao encontrado.");
    }

    return publicComment(updated);
}
