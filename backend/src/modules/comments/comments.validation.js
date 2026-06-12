import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

export const COMMENT_STATUS = ["visible", "pending_review", "rejected"];

/**
 * Converts a public id into a MongoDB ObjectId.
 *
 * @param {string} id - Raw id received from route params or session.
 * @param {string} label - Portuguese domain label used in validation errors.
 * @returns {import("mongodb").ObjectId} Safe MongoDB ObjectId.
 */
export function asObjectId(id, label) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}

/**
 * Normalizes and validates a short plain-text comment body.
 *
 * @param {unknown} value - Raw body received from the request.
 * @returns {string} Safe normalized comment body.
 */
export function assertCommentBody(value) {
    const body = String(value ?? "").replace(/\s+/g, " ").trim();

    if (body.length < 3 || body.length > 280) {
        throw new HttpError(
            400,
            "O comentario deve ter entre 3 e 280 caracteres.",
        );
    }

    return body;
}

/**
 * Applies the minimal moderation rule defined for MF3.
 *
 * @param {string} body - Normalized comment body.
 * @returns {{ status: string, moderationReason: string | null }} Initial moderation state.
 */
export function initialModerationFor(body) {
    const lower = body.toLowerCase();
    const hasLink =
        lower.includes("http://") ||
        lower.includes("https://") ||
        lower.includes("www.");

    if (hasLink) {
        return {
            status: "pending_review",
            moderationReason: "Comentario com link aguarda revisao.",
        };
    }

    return {
        status: "visible",
        moderationReason: null,
    };
}

/**
 * Validates a moderation state from the closed MF3 state list.
 *
 * @param {unknown} value - Raw moderation status.
 * @returns {string} Safe moderation status.
 */
export function assertModerationStatus(value) {
    const status = String(value ?? "").trim();

    if (!COMMENT_STATUS.includes(status)) {
        throw new HttpError(400, "Estado de moderacao invalido.");
    }

    return status;
}
