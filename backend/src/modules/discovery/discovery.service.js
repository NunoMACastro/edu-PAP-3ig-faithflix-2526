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
    synopsis: content.synopsis,
  };
}

async function listRecent(db) {
  return db.collection("contents")
    .find({ status: "published" })
    .sort({ publishedAt: -1, title: 1 })
    .limit(12)
    .toArray();
}

async function listDocumentaries(db) {
  return db.collection("contents")
    .find({ status: "published", type: "documentary" })
    .sort({ title: 1 })
    .limit(12)
    .toArray();
}

async function listTopRated(db) {
  return db.collection("contents").aggregate([
    { $match: { status: "published" } },
    {
      $lookup: {
        from: "content_ratings",
        localField: "_id",
        foreignField: "contentId",
        as: "ratings",
      },
    },
    { $addFields: { ratingAverage: { $ifNull: [{ $avg: "$ratings.value" }, 0] } } },
    { $sort: { ratingAverage: -1, title: 1 } },
    { $limit: 12 },
  ]).toArray();
}

export async function getDiscoveryHome() {
  const db = await getDb();
  const [recent, documentaries, topRated] = await Promise.all([
    listRecent(db),
    listDocumentaries(db),
    listTopRated(db),
  ]);

  return {
    carousels: [
      { id: "recent", title: "Adicionados recentemente", items: recent.map(publicCard) },
      { id: "documentaries", title: "Documentarios", items: documentaries.map(publicCard) },
      { id: "top-rated", title: "Melhor avaliados", items: topRated.map(publicCard) },
    ],
  };
}

export async function getRelatedContent(contentId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const content = await db.collection("contents").findOne({
    _id: contentObjectId,
    status: "published",
  });

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const taxonomyIds = content.taxonomyIds ?? [];
  const related = await db.collection("contents").find({
    _id: { $ne: contentObjectId },
    status: "published",
    $or: [
      ...(taxonomyIds.length > 0 ? [{ taxonomyIds: { $in: taxonomyIds } }] : []),
      { type: content.type },
    ],
  })
    .sort({ publishedAt: -1, title: 1 })
    .limit(8)
    .toArray();

  return {
    contentId,
    items: related.map(publicCard),
  };
}