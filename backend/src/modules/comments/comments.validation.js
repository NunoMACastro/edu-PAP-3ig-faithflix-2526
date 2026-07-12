/**
 * @file Ficheiro `real_dev/backend/src/modules/comments/comments.validation.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

export const COMMENT_STATUS = ["visible", "pending_review", "rejected"];

/**
 * Converte um id público num ObjectId MongoDB.
 *
 * @param {string} id - Id bruto recebido dos parâmetros da rota ou da sessão.
 * @param {string} label - Portuguese domain label used in validation errors.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB seguro.
 */
export function asObjectId(id, label) {
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}

/**
 * Normalizes and validates a short plain-text comment body.
 *
 * @param {unknown} value - Corpo bruto recebido no pedido.
 * @returns {string} Corpo de comentário normalizado e seguro.
 */
export function assertCommentBody(value) {
    const body =
        typeof value === "string"
            ? value.replace(/\s+/g, " ").trim()
            : "";

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
 * @returns {{ status: string, moderationReason: string | null }} Estado inicial de moderação.
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
 * Valida um estado de moderação a partir da lista fechada da MF3.
 *
 * @param {unknown} value - Estado bruto de moderação.
 * @returns {string} Estado seguro de moderação.
 */
export function assertModerationStatus(value) {
    const status = typeof value === "string" ? value.trim() : "";

    if (!COMMENT_STATUS.includes(status)) {
        throw new HttpError(400, "Estado de moderacao invalido.");
    }

    return status;
}

/**
 * Valida a justificação opcional de uma decisão de moderação.
 *
 * @param {unknown} value Motivo recebido no corpo do pedido.
 * @returns {string | null} Motivo normalizado ou `null`.
 */
export function assertModerationReason(value) {
    if (value !== undefined && value !== null && typeof value !== "string") {
        throw new HttpError(400, "Motivo de moderacao invalido.");
    }

    const reason = typeof value === "string" ? value.trim() : "";

    if (reason.length > 500) {
        throw new HttpError(
            400,
            "O motivo de moderacao nao pode exceder 500 caracteres.",
        );
    }

    return reason || null;
}
