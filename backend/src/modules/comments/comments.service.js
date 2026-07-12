/**
 * @file Ficheiro `real_dev/backend/src/modules/comments/comments.service.js` da implementação real_dev.
 */

import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
    asObjectId,
    assertCommentBody,
    assertModerationStatus,
    initialModerationFor,
} from "./comments.validation.js";
import { assertEngageableContent } from "../catalog/catalog-hierarchy.js";

/**
 * Garante que comentários só podem apontar para conteúdo publicado.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {import("mongodb").ObjectId} contentId - ObjectId do conteúdo.
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

    assertEngageableContent(content);
    return content;
}

/**
 * Verifica se o visualizador atual pode apagar um comentário sem expor ids de utilizadores.
 *
 * @param {Record<string, unknown>} comment - Documento de comentário MongoDB.
 * @param {{ id?: string, role?: string } | null} viewer - Visualizador atual, quando autenticado.
 * @returns {boolean} Verdadeiro quando o visualizador é dono do comentário ou pode moderá-lo.
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
 * Converte um documento de comentário para o formato público da API.
 *
 * @param {Record<string, unknown>} comment - Documento de comentário MongoDB.
 * @param {{ id?: string, role?: string } | null} [viewer=null] - Visualizador atual, quando autenticado.
 * @returns {Record<string, unknown>} Comentário público.
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
 * Cria índices exigidos por listagem e moderação de comentários.
 *
 * @returns {Promise<void>} Termina depois da criação de índices.
 */
export async function ensureCommentIndexes() {
    const db = await getDb();

    await db
        .collection("content_comments")
        .createIndex({ contentId: 1, status: 1, createdAt: -1 });
    await db.collection("content_comments").createIndex({ userId: 1 });
}

/**
 * Lista comentários visíveis de um conteúdo publicado.
 *
 * @param {string} contentId - Id público do conteúdo.
 * @param {{ id?: string, role?: string } | null} [viewer=null] - Visualizador atual, quando autenticado.
 * @returns {Promise<Record<string, unknown>[]>} Comentários visíveis.
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
 * Cria um comentário pertencente ao utilizador autenticado.
 *
 * @param {{ id: string, role?: string }} user - Utilizador autenticado.
 * @param {string} contentId - Id público do conteúdo.
 * @param {unknown} bodyValue - Corpo bruto do comentário.
 * @returns {Promise<Record<string, unknown>>} Comentário criado.
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
 * Apaga um comentário quando o utilizador é dono ou tem permissões de moderação.
 *
 * @param {string} userId - Authenticated user id.
 * @param {string} role - Role do utilizador autenticado.
 * @param {string} commentId - Id público do comentário.
 * @returns {Promise<{ id: string, deleted: true }>} Estado de remoção.
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
 * Atualiza o estado de moderação de um comentário.
 *
 * @param {string} commentId - Id público do comentário.
 * @param {unknown} estadoValue - Estado bruto de moderação.
 * @param {unknown} reasonValue - Motivo opcional de moderação.
 * @returns {Promise<Record<string, unknown>>} Comentário atualizado.
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
