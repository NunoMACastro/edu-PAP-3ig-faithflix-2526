import { getDb } from "../../config/database.js";
import { asObjectId, assertRatingValue } from "./ratings.validation.js";

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

function emptySummary(contentId) {
  return {
    contentId,
    average: 0,
    count: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

export async function ensureRatingIndexes() {
  const db = await getDb();
  await db.collection("content_ratings").createIndex(
    { userId: 1, contentId: 1 },
    { unique: true },
  );
  await db.collection("content_ratings").createIndex({ contentId: 1, value: 1 });
}

export async function saveMyRating(userId, contentId, value) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const rating = assertRatingValue(value);
  const now = new Date();

  await assertPublishedContent(db, contentObjectId);

  await db.collection("content_ratings").updateOne(
    { userId: userObjectId, contentId: contentObjectId },
    {
      $set: { value: rating, updatedAt: now },
      $setOnInsert: { userId: userObjectId, contentId: contentObjectId, createdAt: now },
    },
    { upsert: true },
  );

  return {
    myRating: rating,
    summary: await getRatingSummary(contentId),
  };
}

export async function getMyRating(userId, contentId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");

  await assertPublishedContent(db, contentObjectId);

  const rating = await db.collection("content_ratings").findOne({
    userId: asObjectId(userId, "Utilizador"),
    contentId: contentObjectId,
  });

  return { myRating: rating?.value ?? null };
}

export async function removeMyRating(userId, contentId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");

  await db.collection("content_ratings").deleteOne({
    userId: asObjectId(userId, "Utilizador"),
    contentId: contentObjectId,
  });

  return {
    myRating: null,
    summary: await getRatingSummary(contentId),
  };
}

export async function getRatingSummary(contentId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");

  await assertPublishedContent(db, contentObjectId);

  const rows = await db.collection("content_ratings").aggregate([
    { $match: { contentId: contentObjectId } },
    {
      $group: {
        _id: "$value",
        count: { $sum: 1 },
      },
    },
  ]).toArray();

  if (rows.length === 0) return emptySummary(contentId);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let count = 0;

  for (const row of rows) {
    distribution[row._id] = row.count;
    total += row._id * row.count;
    count += row.count;
  }

  return {
    contentId,
    average: Number((total / count).toFixed(2)),
    count,
    distribution,
  };
}