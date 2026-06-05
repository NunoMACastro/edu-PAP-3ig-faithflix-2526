import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertProgressPayload } from "./playback.validation.js";

function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

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

function publicPlaybackContent(content) {
  return {
    id: String(content._id),
    title: content.title,
    durationSeconds: content.durationSeconds,
    media: content.media,
    tracks: content.tracks ?? { subtitles: [], audio: [] },
    qualityOptions: content.qualityOptions ?? [],
  };
}

export async function ensurePlaybackIndexes() {
  const db = await getDb();
  await db.collection("playback_progress").createIndex({ userId: 1, contentId: 1 }, { unique: true });
  await db.collection("playback_progress").createIndex({ userId: 1, lastWatchedAt: -1 });
}

export async function getPlayback(contentId, userId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const userObjectId = asObjectId(userId, "Utilizador");

  const content = await db.collection("contents").findOne({
    _id: contentObjectId,
    status: "published",
  });

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const progress = await db.collection("playback_progress").findOne({
    userId: userObjectId,
    contentId: contentObjectId,
  });

  return {
    content: publicPlaybackContent(content),
    progress: publicProgress(progress, content.durationSeconds),
  };
}

export async function savePlaybackProgress(contentId, userId, input) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const userObjectId = asObjectId(userId, "Utilizador");
  const content = await db.collection("contents").findOne({ _id: contentObjectId, status: "published" });

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const progress = assertProgressPayload(input, content.durationSeconds);
  const now = new Date();

  await db.collection("playback_progress").updateOne(
    { userId: userObjectId, contentId: contentObjectId },
    {
      $set: { ...progress, lastWatchedAt: now, updatedAt: now },
      $setOnInsert: { userId: userObjectId, contentId: contentObjectId, createdAt: now },
    },
    { upsert: true },
  );

  return publicProgress({ ...progress, lastWatchedAt: now }, content.durationSeconds);
}

export async function listContinueWatching(userId) {
  const db = await getDb();
  const rows = await db.collection("playback_progress").aggregate([
    { $match: { userId: asObjectId(userId, "Utilizador"), completed: false } },
    { $sort: { lastWatchedAt: -1 } },
    { $limit: 12 },
    { $lookup: { from: "contents", localField: "contentId", foreignField: "_id", as: "content" } },
    { $unwind: "$content" },
    { $match: { "content.status": "published" } },
  ]).toArray();

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