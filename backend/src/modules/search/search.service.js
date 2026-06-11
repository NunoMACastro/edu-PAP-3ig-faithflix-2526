import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertSearchQuery, escapeRegExp, parsePagination, parseSearchFilters } from "./search.validation.js";

function publicSearchItem(content, taxonomyNamesById) {
  const taxonomyNames = (content.taxonomyIds ?? [])
    .map((id) => taxonomyNamesById.get(String(id)))
    .filter(Boolean);

  return {
    id: String(content._id),
    title: content.title,
    slug: content.slug,
    synopsis: content.synopsis,
    type: content.type,
    posterUrl: content.assets?.posterUrl ?? "",
    taxonomyNames,
  };
}

export async function ensureSearchIndexes() {
  const db = await getDb();
  await db.collection("contents").createIndex({ status: 1, title: 1 });
  await db.collection("contents").createIndex({ status: 1, slug: 1 });
  await db.collection("taxonomies").createIndex({ name: 1 });
}

export async function searchContents(params) {
  const db = await getDb();
  const query = assertSearchQuery(params.q);
  const { page, limit } = parsePagination(params);
  const filters = parseSearchFilters(params);
  const expression = new RegExp(escapeRegExp(query), "i");

  const matchingTaxonomies = await db.collection("taxonomies")
    .find({ name: expression })
    .project({ _id: 1, name: 1 })
    .toArray();

  const taxonomyIdsFromQuery = matchingTaxonomies.map((taxonomy) => taxonomy._id);
  const taxonomyNamesById = new Map(
    matchingTaxonomies.map((taxonomy) => [String(taxonomy._id), taxonomy.name]),
  );

  const match = {
    status: "published",
    $or: [
      { title: expression },
      { synopsis: expression },
      { slug: expression },
      ...(taxonomyIdsFromQuery.length > 0 ? [{ taxonomyIds: { $in: taxonomyIdsFromQuery } }] : []),
    ],
  };

  if (filters.type) match.type = filters.type;
  if (filters.taxonomyId) match.taxonomyIds = new ObjectId(filters.taxonomyId);

  const sort =
    filters.sort === "recent"
      ? { publishedAt: -1, title: 1 }
      : { title: 1 };

  const basePipeline = [
    { $match: match },
    {
      $lookup: {
        from: "content_ratings",
        localField: "_id",
        foreignField: "contentId",
        as: "ratings",
      },
    },
    {
      $addFields: {
        ratingAverage: { $ifNull: [{ $avg: "$ratings.value" }, 0] },
      },
    },
    { $sort: filters.sort === "rating" ? { ratingAverage: -1, title: 1 } : sort },
  ];

  const [totalRows, contents] = await Promise.all([
    db.collection("contents").aggregate([...basePipeline, { $count: "total" }]).toArray(),
    db.collection("contents").aggregate([
      ...basePipeline,
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]).toArray(),
  ]);

  const missingTaxonomyIds = [
    ...new Set(
      contents
        .flatMap((content) => content.taxonomyIds ?? [])
        .map((id) => String(id))
        .filter((id) => !taxonomyNamesById.has(id)),
    ),
  ];

  if (missingTaxonomyIds.length > 0) {
    const extraTaxonomies = await db.collection("taxonomies")
      .find({ _id: { $in: missingTaxonomyIds.map((id) => ObjectId.createFromHexString(id)) } })
      .project({ _id: 1, name: 1 })
      .toArray();

    for (const taxonomy of extraTaxonomies) {
      taxonomyNamesById.set(String(taxonomy._id), taxonomy.name);
    }
  }

  return {
    query,
    page,
    limit,
    total: totalRows[0]?.total ?? 0,
    filters,
    items: contents.map((content) => publicSearchItem(content, taxonomyNamesById)),
  };
}