import { getDb } from "../../config/database.js";
import { assertTaxonomyPayload } from "./catalog.validation.js";

function publicTaxonomy(taxonomy) {
  return {
    id: String(taxonomy._id),
    name: taxonomy.name,
    slug: taxonomy.slug,
    description: taxonomy.description,
  };
}

export async function listTaxonomies() {
  const db = await getDb();
  const taxonomies = await db.collection("taxonomies").find({}).sort({ name: 1 }).toArray();
  return taxonomies.map(publicTaxonomy);
}

export async function createTaxonomy(input) {
  const db = await getDb();
  const now = new Date();
  const document = {
    ...assertTaxonomyPayload(input),
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("taxonomies").insertOne(document);
  return publicTaxonomy({ ...document, _id: result.insertedId });
}