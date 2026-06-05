import { getDb } from "../../config/database.js";
import { asObjectId, assertListType } from "./library.validation.js";

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

export async function ensureLibraryIndexes() {
  const db = await getDb();
  await db.collection("user_content_lists").createIndex(
    { userId: 1, contentId: 1, type: 1 },
    { unique: true },
  );
}

export async function addToList(userId, contentId, type) {
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
      $setOnInsert: { userId: userObjectId, contentId: contentObjectId, type: listType, createdAt: now },
    },
    { upsert: true },
  );

  return { contentId, type: listType, saved: true };
}

export async function removeFromList(userId, contentId, type) {
  const listType = assertListType(type);
  const db = await getDb();

  await db.collection("user_content_lists").deleteOne({
    userId: asObjectId(userId, "Utilizador"),
    contentId: asObjectId(contentId, "Conteudo"),
    type: listType,
  });

  return { contentId, type: listType, saved: false };
}

export async function listSavedContent(userId, type) {
  const db = await getDb();
  const rows = await db.collection("user_content_lists").aggregate([
    { $match: { userId: asObjectId(userId, "Utilizador"), type: assertListType(type) } },
    { $sort: { updatedAt: -1 } },
    { $lookup: { from: "contents", localField: "contentId", foreignField: "_id", as: "content" } },
    { $unwind: "$content" },
    { $match: { "content.status": "published" } },
  ]).toArray();

  return rows.map((row) => publicContent(row.content));
}

export async function listHistory(userId) {
  const db = await getDb();
  const rows = await db.collection("playback_progress").aggregate([
    { $match: { userId: asObjectId(userId, "Utilizador") } },
    { $sort: { lastWatchedAt: -1 } },
    { $lookup: { from: "contents", localField: "contentId", foreignField: "_id", as: "content" } },
    { $unwind: "$content" },
    { $match: { "content.status": "published" } },
  ]).toArray();

  return rows.map((row) => ({
    ...publicContent(row.content),
    currentTimeSeconds: row.currentTimeSeconds,
    durationSeconds: row.durationSeconds,
    completed: row.completed,
    lastWatchedAt: row.lastWatchedAt,
  }));
}