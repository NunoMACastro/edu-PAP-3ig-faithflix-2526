import { getDb } from "../../config/database.js";
import {
  asObjectId,
  assertCommentBody,
  assertModerationStatus,
  initialModerationFor,
} from "./comments.validation.js";

async function assertPublishedContent(db, contentId) {
  const content = await db.collection("contents").findOne({
    _id: contentId,
    status: "published",
  });

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return content;
}

function publicComment(comment) {
  return {
    id: String(comment._id),
    contentId: String(comment.contentId),
    userId: String(comment.userId),
    body: comment.body,
    createdAt: comment.createdAt,
  };
}

export async function ensureCommentIndexes() {
  const db = await getDb();
  await db.collection("content_comments").createIndex({ contentId: 1, status: 1, createdAt: -1 });
  await db.collection("content_comments").createIndex({ userId: 1, createdAt: -1 });
}

export async function listVisibleComments(contentId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");

  await assertPublishedContent(db, contentObjectId);

  const comments = await db.collection("content_comments")
    .find({ contentId: contentObjectId, status: "visible" })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return comments.map(publicComment);
}

export async function createComment(userId, contentId, input) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const userObjectId = asObjectId(userId, "Utilizador");
  const body = assertCommentBody(input.body);
  const moderation = initialModerationFor(body);
  const now = new Date();

  await assertPublishedContent(db, contentObjectId);

  const result = await db.collection("content_comments").insertOne({
    userId: userObjectId,
    contentId: contentObjectId,
    body,
    status: moderation.status,
    moderationReason: moderation.moderationReason,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: String(result.insertedId),
    status: moderation.status,
    moderationReason: moderation.moderationReason,
  };
}

export async function deleteOwnComment(userId, commentId) {
  const db = await getDb();
  const result = await db.collection("content_comments").deleteOne({
    _id: asObjectId(commentId, "Comentario"),
    userId: asObjectId(userId, "Utilizador"),
  });

  if (result.deletedCount === 0) {
    const error = new Error("Comentario nao encontrado para este utilizador.");
    error.statusCode = 404;
    throw error;
  }

  return { deleted: true };
}

export async function moderateComment(commentId, input) {
  const db = await getDb();
  const status = assertModerationStatus(input.status);
  const moderationReason = String(input.reason ?? "").trim() || null;

  const result = await db.collection("content_comments").findOneAndUpdate(
    { _id: asObjectId(commentId, "Comentario") },
    { $set: { status, moderationReason, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!result) {
    const error = new Error("Comentario nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: String(result._id),
    status: result.status,
    moderationReason: result.moderationReason,
  };
}