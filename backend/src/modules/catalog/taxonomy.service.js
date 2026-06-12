import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { assertTaxonomyPayload } from "./catalog.validation.js";

/**
 * Converts a taxonomy document into its public shape.
 *
 * @param {{ _id: import("mongodb").ObjectId, name: string, slug: string, description: string }} taxonomy - Taxonomy document.
 * @returns {{ id: string, name: string, slug: string, description: string }} Public taxonomy.
 */
function publicTaxonomy(taxonomy) {
    return {
        id: String(taxonomy._id),
        name: taxonomy.name,
        slug: taxonomy.slug,
        description: taxonomy.description,
    };
}

/**
 * Ensures taxonomy indexes exist.
 *
 * @returns {Promise<void>} Resolves after index creation.
 */
export async function ensureTaxonomyIndexes() {
    const db = await getDb();
    await db
        .collection("taxonomies")
        .createIndex({ slug: 1 }, { unique: true });
}

/**
 * Lists taxonomies alphabetically.
 *
 * @returns {Promise<Array<ReturnType<typeof publicTaxonomy>>>} Public taxonomy list.
 */
export async function listTaxonomies() {
    const db = await getDb();
    const taxonomies = await db
        .collection("taxonomies")
        .find({})
        .sort({ name: 1 })
        .toArray();

    return taxonomies.map(publicTaxonomy);
}

/**
 * Creates a taxonomy.
 *
 * @param {{ name?: unknown, slug?: unknown, description?: unknown }} input - Taxonomy payload.
 * @returns {Promise<ReturnType<typeof publicTaxonomy>>} Created taxonomy.
 */
export async function createTaxonomy(input) {
    await ensureTaxonomyIndexes();

    const db = await getDb();
    const now = new Date();
    const document = {
        ...assertTaxonomyPayload(input),
        createdAt: now,
        updatedAt: now,
    };

    try {
        const result = await db.collection("taxonomies").insertOne(document);
        return publicTaxonomy({ ...document, _id: result.insertedId });
    } catch (error) {
        if (error.code === 11000) {
            throw new HttpError(409, "Slug de taxonomia ja existe.");
        }

        throw error;
    }
}
