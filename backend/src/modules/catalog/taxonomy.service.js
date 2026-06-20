/**
 * @file Ficheiro `real_dev/backend/src/modules/catalog/taxonomy.service.js` da implementação real_dev.
 */

import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { assertTaxonomyPayload } from "./catalog.validation.js";

/**
 * Converte um documento de taxonomia para o formato público.
 *
 * @param {{ _id: import("mongodb").ObjectId, name: string, slug: string, description: string }} taxonomy - Documento de taxonomia.
 * @returns {{ id: string, name: string, slug: string, description: string }} Taxonomia pública.
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
 * Garante que existem os índices de taxonomias.
 *
 * @returns {Promise<void>} Termina depois da criação de índices.
 */
export async function ensureTaxonomyIndexes() {
    const db = await getDb();
    await db
        .collection("taxonomies")
        .createIndex({ slug: 1 }, { unique: true });
}

/**
 * Lista taxonomias alfabeticamente.
 *
 * @returns {Promise<Array<ReturnType<typeof publicTaxonomy>>>} Lista pública de taxonomias.
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
 * Cria uma taxonomia.
 *
 * @param {{ name?: unknown, slug?: unknown, description?: unknown }} input - Taxonomy dados.
 * @returns {Promise<ReturnType<typeof publicTaxonomy>>} Taxonomia criada.
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
