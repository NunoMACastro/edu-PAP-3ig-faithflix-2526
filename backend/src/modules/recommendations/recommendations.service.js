import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

function publicCard(content) {
  return {
    id: String(content._id),
    title: content.title,
    slug: content.slug,
    type: content.type,
    posterUrl: content.assets?.posterUrl ?? "",
  };
}

function addCount(map, key) {
  if (!key) return;
  map.set(String(key), (map.get(String(key)) ?? 0) + 1);
}

function topKeys(map, limit = 5) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

async function loadUserSignals(db, userObjectId) {
  const [lists, history, ratings] = await Promise.all([
    db.collection("user_content_lists").find({ userId: userObjectId }).toArray(),
    db.collection("playback_progress").find({ userId: userObjectId }).toArray(),
    db.collection("content_ratings").find({ userId: userObjectId, value: { $gte: 4 } }).toArray(),
  ]);

  const contentIds = [
    ...new Set(
      [...lists, ...history, ...ratings].map((row) => String(row.contentId)),
    ),
  ];

  if (contentIds.length === 0) {
    return { contentIds: [], taxonomyIds: [], types: [], signalsUsed: [] };
  }

  const contents = await db.collection("contents").find({
    _id: { $in: contentIds.map((id) => ObjectId.createFromHexString(id)) },
    status: "published",
  }).toArray();

  const taxonomyCounts = new Map();
  const typeCounts = new Map();

  for (const content of contents) {
    addCount(typeCounts, content.type);
    for (const taxonomyId of content.taxonomyIds ?? []) {
      addCount(taxonomyCounts, taxonomyId);
    }
  }

  const signalsUsed = [];
  if (history.length > 0) signalsUsed.push("history");
  if (lists.some((item) => item.type === "favorite")) signalsUsed.push("favorites");
  if (lists.some((item) => item.type === "watchlist")) signalsUsed.push("watchlist");
  if (ratings.length > 0) signalsUsed.push("ratings");

  return {
    contentIds,
    taxonomyIds: topKeys(taxonomyCounts),
    types: topKeys(typeCounts),
    signalsUsed,
  };
}

async function listByThemes(db, taxonomyIds, excludedIds) {
  if (taxonomyIds.length === 0) return [];

  return db.collection("contents").find({
    _id: { $nin: excludedIds.map((id) => ObjectId.createFromHexString(id)) },
    status: "published",
    taxonomyIds: { $in: taxonomyIds.map((id) => ObjectId.createFromHexString(id)) },
  })
    .sort({ publishedAt: -1, title: 1 })
    .limit(8)
    .toArray();
}

async function listByActivityTypes(db, types, excludedIds) {
  if (types.length === 0) return [];

  return db.collection("contents").find({
    _id: { $nin: excludedIds.map((id) => ObjectId.createFromHexString(id)) },
    status: "published",
    type: { $in: types },
  })
    .sort({ publishedAt: -1, title: 1 })
    .limit(8)
    .toArray();
}

async function listPopularStart(db, excludedIds = []) {
  return db.collection("contents").aggregate([
    {
      $match: {
        _id: { $nin: excludedIds.map((id) => ObjectId.createFromHexString(id)) },
        status: "published",
      },
    },
    {
      $lookup: {
        from: "content_ratings",
        localField: "_id",
        foreignField: "contentId",
        as: "ratings",
      },
    },
    { $addFields: { ratingAverage: { $ifNull: [{ $avg: "$ratings.value" }, 0] } } },
    { $sort: { ratingAverage: -1, publishedAt: -1, title: 1 } },
    { $limit: 8 },
  ]).toArray();
}

async function listRecentStart(db) {
  return db.collection("contents")
    .find({ status: "published" })
    .sort({ publishedAt: -1, title: 1 })
    .limit(8)
    .toArray();
}

async function listCatalogStart(db) {
  return db.collection("contents")
    .find({ status: "published" })
    .sort({ title: 1 })
    .limit(8)
    .toArray();
}

function group(id, title, reasonCode, items) {
  return {
    id,
    title,
    reasonCode,
    items: items.map(publicCard),
  };
}

export async function getMyRecommendations(userId) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const signals = await loadUserSignals(db, userObjectId);
  const coldStart = signals.signalsUsed.length === 0;

  if (coldStart) {
    const [popular, recent, catalog] = await Promise.all([
      listPopularStart(db),
      listRecentStart(db),
      listCatalogStart(db),
    ]);

    return {
      coldStart: true,
      signalsUsed: [],
      groups: [
        group("popular-start", "Populares para comecar", "cold-start-popular", popular),
        group("recent-start", "Adicionados recentemente", "cold-start-recent", recent),
        group("catalog-start", "Sugestoes do catalogo", "cold-start-catalog", catalog),
      ],
    };
  }

  const byThemes = await listByThemes(db, signals.taxonomyIds, signals.contentIds);
  const byTypes = await listByActivityTypes(db, signals.types, signals.contentIds);
  const popular = await listPopularStart(db, signals.contentIds);

  return {
    coldStart: false,
    signalsUsed: signals.signalsUsed,
    groups: [
      group("because-your-themes", "Com base nos teus temas", "themes-from-user-signals", byThemes),
      group("because-your-activity", "Com base na tua atividade", "activity-types", byTypes),
      group("popular-start", "Tambem podes gostar", "popular-fallback", popular),
    ],
  };
}