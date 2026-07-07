/**
 * @file Embeddings locais determinísticos para conteúdos FaithFlix.
 *
 * Este módulo não usa IA externa nem envia dados para fora da aplicação. O vetor
 * é uma simulação técnica estável baseada em hashing de tokens, suficiente para
 * demonstrar o conceito de similaridade semântica na PAP.
 */

import { createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

export const CONTENT_EMBEDDING_MODEL = "faithflix-local-v1";
export const CONTENT_EMBEDDING_DIMENSIONS = 64;

/**
 * Normaliza texto para uma forma simples e comparável.
 *
 * @param {unknown} value Texto bruto.
 * @returns {string} Texto normalizado.
 */
export function normalizeEmbeddingText(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Divide texto normalizado em tokens úteis.
 *
 * @param {unknown} value Texto bruto.
 * @returns {string[]} Tokens.
 */
export function tokenizeEmbeddingText(value) {
    const normalized = normalizeEmbeddingText(value);
    return normalized ? normalized.split(" ").filter(Boolean) : [];
}

/**
 * Hash FNV-1a de 32 bits para manter os vetores estáveis entre execuções.
 *
 * @param {string} value Token.
 * @returns {number} Hash unsigned.
 */
function stableHash(value) {
    let hash = 2166136261;

    for (const char of value) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619) >>> 0;
    }

    return hash >>> 0;
}

/**
 * Normaliza um vetor pelo comprimento L2.
 *
 * @param {number[]} vector Vetor bruto.
 * @returns {number[]} Vetor normalizado.
 */
export function normalizeVector(vector) {
    const length = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));

    if (length === 0) {
        return Array.from({ length: vector.length }, () => 0);
    }

    return vector.map((value) => Number((value / length).toFixed(8)));
}

/**
 * Cria embedding local determinístico a partir de texto.
 *
 * @param {unknown} text Fonte textual.
 * @param {number} [dimensions=CONTENT_EMBEDDING_DIMENSIONS] Dimensões.
 * @returns {number[]} Vetor normalizado.
 */
export function buildLocalContentEmbedding(
    text,
    dimensions = CONTENT_EMBEDDING_DIMENSIONS,
) {
    const vector = Array.from({ length: dimensions }, () => 0);

    for (const token of tokenizeEmbeddingText(text)) {
        const hash = stableHash(token);
        const index = hash % dimensions;
        const direction = hash & 1 ? 1 : -1;
        const weight = 1 + ((hash >>> 8) % 7) / 10;
        vector[index] += direction * weight;
    }

    return normalizeVector(vector);
}

/**
 * Calcula similaridade de cosseno entre dois vetores.
 *
 * @param {number[]} left Primeiro vetor.
 * @param {number[]} right Segundo vetor.
 * @returns {number} Similaridade.
 */
export function cosineSimilarity(left, right) {
    const length = Math.min(left.length, right.length);
    let score = 0;

    for (let index = 0; index < length; index += 1) {
        score += Number(left[index] ?? 0) * Number(right[index] ?? 0);
    }

    return Number(score.toFixed(8));
}

/**
 * Cria um hash SHA-256 da fonte usada no embedding.
 *
 * @param {string} source Fonte textual canónica.
 * @returns {string} Hash hexadecimal.
 */
export function hashEmbeddingSource(source) {
    return createHash("sha256").update(source).digest("hex");
}

/**
 * Garante os índices da coleção de embeddings.
 *
 * @returns {Promise<void>} Termina depois da criação dos índices.
 */
export async function ensureContentEmbeddingIndexes() {
    const db = await getDb();

    await db
        .collection("content_embeddings")
        .createIndex({ contentId: 1, model: 1 }, { unique: true });
    await db.collection("content_embeddings").createIndex({ model: 1 });
}

/**
 * Ordena nomes de taxonomias para uma fonte estável.
 *
 * @param {Record<string, unknown>[]} taxonomies Taxonomias.
 * @returns {string[]} Nomes ordenados.
 */
function taxonomyNames(taxonomies) {
    return taxonomies
        .map((taxonomy) => String(taxonomy.name ?? "").trim())
        .filter(Boolean)
        .toSorted((left, right) => left.localeCompare(right, "pt-PT"));
}

/**
 * Constrói a fonte textual usada para gerar o embedding de um conteúdo.
 *
 * @param {Record<string, unknown>} content Conteúdo.
 * @param {Record<string, unknown>[]} [taxonomies=[]] Taxonomias associadas.
 * @param {Record<string, unknown>[]} [passages=[]] Passagens bíblicas publicadas associadas.
 * @returns {{ text: string, sourceHash: string }} Fonte textual e hash.
 */
export function buildContentEmbeddingSource(
    content,
    taxonomies = [],
    passages = [],
) {
    const passageText = passages
        .map((passage) =>
            [
                passage.book,
                passage.theme,
                passage.reflection,
                passage.text,
            ]
                .filter(Boolean)
                .join(" "),
        )
        .filter(Boolean);
    const parts = [
        content.title,
        content.synopsis,
        content.type,
        ...taxonomyNames(taxonomies),
        ...passageText,
    ];
    const text = normalizeEmbeddingText(parts.filter(Boolean).join(" "));

    return {
        text,
        sourceHash: hashEmbeddingSource(text),
    };
}

/**
 * Carrega taxonomias e passagens publicadas necessárias para a fonte do embedding.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {Record<string, unknown>} content Conteúdo publicado.
 * @returns {Promise<{ taxonomies: object[], passages: object[] }>} Dados associados.
 */
async function loadEmbeddingSourceRelations(db, content) {
    const taxonomyIds = (content.taxonomyIds ?? [])
        .filter((id) => ObjectId.isValid(String(id)))
        .map((id) => (id instanceof ObjectId ? id : new ObjectId(String(id))));
    const [taxonomies, associations] = await Promise.all([
        taxonomyIds.length > 0
            ? db
                  .collection("taxonomies")
                  .find({ _id: { $in: taxonomyIds } })
                  .toArray()
            : [],
        db
            .collection("content_biblical_passages")
            .find({ contentId: content._id })
            .sort({ sortOrder: 1, createdAt: 1 })
            .toArray(),
    ]);

    if (associations.length === 0) {
        return { taxonomies, passages: [] };
    }

    const passages = await db
        .collection("biblical_passages")
        .find({
            _id: { $in: associations.map((association) => association.passageId) },
            status: "published",
        })
        .toArray();
    const passageById = new Map(
        passages.map((passage) => [String(passage._id), passage]),
    );

    return {
        taxonomies,
        passages: associations
            .map((association) => passageById.get(String(association.passageId)))
            .filter(Boolean),
    };
}

/**
 * Cria o documento de embedding para um conteúdo publicado.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {Record<string, unknown>} content Conteúdo publicado.
 * @returns {Promise<Record<string, unknown>>} Documento de embedding.
 */
export async function buildContentEmbeddingDocument(db, content) {
    const { taxonomies, passages } = await loadEmbeddingSourceRelations(db, content);
    const source = buildContentEmbeddingSource(content, taxonomies, passages);

    return {
        contentId: content._id,
        model: CONTENT_EMBEDDING_MODEL,
        sourceHash: source.sourceHash,
        dimensions: CONTENT_EMBEDDING_DIMENSIONS,
        vector: buildLocalContentEmbedding(source.text),
        generatedAt: new Date(),
    };
}

/**
 * Gera ou regenera embeddings para conteúdos publicados.
 *
 * @param {{ force?: boolean }} [options={}] Opções de geração.
 * @returns {Promise<{ scanned: number, generated: number, skipped: number, model: string, dimensions: number }>} Resumo.
 */
export async function generateContentEmbeddings(options = {}) {
    await ensureContentEmbeddingIndexes();

    const db = await getDb();
    const contents = await db
        .collection("contents")
        .find({ status: "published" })
        .sort({ updatedAt: -1, publishedAt: -1, title: 1 })
        .toArray();
    const contentIds = contents.map((content) => content._id);
    const pruneFilter =
        contentIds.length > 0
            ? {
                  model: CONTENT_EMBEDDING_MODEL,
                  contentId: { $nin: contentIds },
              }
            : { model: CONTENT_EMBEDDING_MODEL };
    const pruneResult = await db.collection("content_embeddings").deleteMany(pruneFilter);
    const summary = {
        scanned: contents.length,
        generated: 0,
        skipped: 0,
        pruned: pruneResult.deletedCount ?? 0,
        model: CONTENT_EMBEDDING_MODEL,
        dimensions: CONTENT_EMBEDDING_DIMENSIONS,
    };

    for (const content of contents) {
        const document = await buildContentEmbeddingDocument(db, content);
        const existing = await db.collection("content_embeddings").findOne({
            contentId: content._id,
            model: CONTENT_EMBEDDING_MODEL,
        });

        if (
            existing &&
            existing.sourceHash === document.sourceHash &&
            options.force !== true
        ) {
            summary.skipped += 1;
            continue;
        }

        await db.collection("content_embeddings").updateOne(
            { contentId: content._id, model: CONTENT_EMBEDDING_MODEL },
            { $set: document },
            { upsert: true },
        );
        summary.generated += 1;
    }

    return summary;
}
