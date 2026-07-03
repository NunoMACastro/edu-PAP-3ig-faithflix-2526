/**
 * @file Embeddings de conteúdo para recomendações FaithFlix.
 *
 * Este módulo mantém a primeira versão de embeddings centrada em conteúdos,
 * não em perfis persistentes de utilizador. O provider externo recebe apenas
 * texto editorial minimizado de conteúdos publicados; histórico pessoal bruto
 * nunca é enviado para fora da aplicação.
 */

import { createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { env } from "../../config/env.js";
import { getDb } from "../../config/database.js";

const EXTERNAL_PROVIDER_TIMEOUT_MS = 10_000;

/**
 * Normaliza texto editorial antes de o usar como fonte de embedding.
 *
 * @param {unknown} value - Valor bruto vindo do documento de conteúdo.
 * @param {number} maxLength - Tamanho máximo preservado.
 * @returns {string} Texto limpo e limitado.
 */
function safeEmbeddingText(value, maxLength) {
    return String(value ?? "")
        .replace(/\s+/gu, " ")
        .trim()
        .slice(0, maxLength);
}

/**
 * Gera um hash SHA-256 estável para detectar alterações na fonte editorial.
 *
 * @param {string} text - Texto normalizado usado para gerar embedding.
 * @returns {string} Hash hexadecimal.
 */
export function calculateContentEmbeddingSourceHash(text) {
    return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Constrói o texto seguro usado para gerar embedding de um conteúdo.
 *
 * @param {Record<string, unknown>} content - Documento de conteúdo MongoDB.
 * @param {Map<string, string>} taxonomyNamesById - Nomes de taxonomias por id.
 * @returns {string} Texto editorial minimizado e estável.
 */
export function buildContentEmbeddingInput(content, taxonomyNamesById = new Map()) {
    const taxonomyNames = (content.taxonomyIds ?? [])
        .map((taxonomyId) => taxonomyNamesById.get(String(taxonomyId)))
        .filter(Boolean)
        .toSorted((left, right) => left.localeCompare(right));

    return [
        `Titulo: ${safeEmbeddingText(content.title, 160)}`,
        `Tipo: ${safeEmbeddingText(content.type, 40)}`,
        `Sinopse: ${safeEmbeddingText(content.synopsis, 1_000)}`,
        `Temas: ${taxonomyNames.join(", ") || "sem temas"}`,
    ].join("\n");
}

/**
 * Normaliza um vector para comprimento unitário quando possível.
 *
 * @param {number[]} vector - Vector bruto.
 * @returns {number[]} Vector normalizado ou vector original quando vazio.
 */
function normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));

    if (magnitude === 0) {
        return vector;
    }

    return vector.map((value) => Number((value / magnitude).toFixed(8)));
}

/**
 * Gera um embedding local determinístico para testes e desenvolvimento.
 *
 * @param {string} text - Texto fonte.
 * @param {number} dimensions - Dimensão esperada do vector.
 * @returns {number[]} Vector estável normalizado.
 */
export function generateDeterministicEmbedding(text, dimensions) {
    const vector = Array.from({ length: dimensions }, () => 0);
    const tokens =
        text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/gu, "")
            .toLowerCase()
            .match(/[a-z0-9]+/gu) ?? [];

    for (const token of tokens) {
        const digest = createHash("sha256").update(token, "utf8").digest();

        for (let index = 0; index < dimensions; index += 1) {
            const byte = digest[index % digest.length];
            const direction = byte % 2 === 0 ? 1 : -1;
            const strength = 1 + (byte % 7);
            vector[index] += direction * strength;
        }
    }

    return normalizeVector(vector);
}

/**
 * Extrai o vector de respostas comuns de providers de embeddings.
 *
 * @param {unknown} payload - JSON devolvido pelo provider externo.
 * @returns {unknown} Candidato a vector.
 */
function extractExternalEmbedding(payload) {
    return (
        payload?.embedding ??
        payload?.vector ??
        payload?.data?.[0]?.embedding ??
        payload?.data?.[0]?.vector
    );
}

/**
 * Valida a forma e dimensão de um vector de embedding.
 *
 * @param {unknown} vector - Vector bruto.
 * @param {number} dimensions - Dimensão esperada.
 * @returns {number[]} Vector numérico seguro.
 * @throws {Error} Lança erro quando o vector não cumpre o contrato.
 */
export function assertEmbeddingVector(vector, dimensions) {
    if (!Array.isArray(vector) || vector.length !== dimensions) {
        throw new Error("Vector de embedding com dimensao invalida.");
    }

    return vector.map((value) => {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            throw new Error("Vector de embedding contem valor invalido.");
        }

        return number;
    });
}

/**
 * Chama um provider externo de embeddings com timeout e sem expor segredos.
 *
 * @param {string} text - Texto editorial minimizado.
 * @param {{ provider: string, model: string, dimensions: number, apiUrl: string, apiKey: string }} config - Configuração de embeddings.
 * @param {typeof fetch} fetchImpl - Implementação de fetch injectável para testes.
 * @returns {Promise<number[]>} Vector validado.
 * @throws {Error} Lança erro operacional seguro em falhas de provider.
 */
async function generateExternalEmbedding(text, config, fetchImpl) {
    if (!config.apiUrl) {
        throw new Error("EMBEDDINGS_API_URL e obrigatorio para provider external.");
    }

    if (!config.apiKey) {
        throw new Error("EMBEDDINGS_API_KEY e obrigatorio para provider external.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), EXTERNAL_PROVIDER_TIMEOUT_MS);

    try {
        const response = await fetchImpl(config.apiUrl, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                input: text,
            }),
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`provider respondeu ${response.status}`);
        }

        const payload = await response.json();
        return assertEmbeddingVector(
            extractExternalEmbedding(payload),
            config.dimensions,
        );
    } catch (error) {
        if (error?.name === "AbortError") {
            throw new Error("Provider externo de embeddings excedeu o timeout.");
        }

        throw new Error(`Falha ao gerar embedding externo: ${error.message}`);
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Gera um vector de embedding conforme o provider configurado.
 *
 * @param {string} text - Texto editorial minimizado.
 * @param {{ config?: typeof env.embeddings, fetchImpl?: typeof fetch }} [options] - Dependências injectáveis.
 * @returns {Promise<number[] | null>} Vector, ou null quando o provider está desativado.
 */
export async function generateEmbeddingVector(
    text,
    { config = env.embeddings, fetchImpl = fetch } = {},
) {
    if (config.provider === "disabled") {
        return null;
    }

    if (config.provider === "deterministic") {
        return generateDeterministicEmbedding(text, config.dimensions);
    }

    return generateExternalEmbedding(text, config, fetchImpl);
}

/**
 * Calcula similaridade por cosseno entre dois vectores.
 *
 * @param {number[]} left - Primeiro vector.
 * @param {number[]} right - Segundo vector.
 * @returns {number} Similaridade entre -1 e 1.
 */
export function cosineSimilarity(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
        return 0;
    }

    let dot = 0;
    let leftMagnitude = 0;
    let rightMagnitude = 0;

    for (let index = 0; index < left.length; index += 1) {
        dot += left[index] * right[index];
        leftMagnitude += left[index] * left[index];
        rightMagnitude += right[index] * right[index];
    }

    if (leftMagnitude === 0 || rightMagnitude === 0) {
        return 0;
    }

    return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

/**
 * Calcula a média ponderada de embeddings positivos do utilizador em runtime.
 *
 * @param {Array<{ vector: number[], weight: number }>} embeddings - Vectores com peso.
 * @param {number} dimensions - Dimensão esperada.
 * @returns {number[] | null} Perfil semântico temporário, ou null sem dados suficientes.
 */
export function averageWeightedEmbedding(embeddings, dimensions) {
    const vector = Array.from({ length: dimensions }, () => 0);
    let totalWeight = 0;

    for (const embedding of embeddings) {
        if (!Array.isArray(embedding.vector) || embedding.vector.length !== dimensions) {
            continue;
        }

        const weight = Number(embedding.weight);

        if (!Number.isFinite(weight) || weight <= 0) {
            continue;
        }

        totalWeight += weight;

        for (let index = 0; index < dimensions; index += 1) {
            vector[index] += embedding.vector[index] * weight;
        }
    }

    if (totalWeight === 0) {
        return null;
    }

    return normalizeVector(vector.map((value) => value / totalWeight));
}

/**
 * Carrega nomes de taxonomias para construir textos de embedding sem lookup externo.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {Record<string, unknown>[]} contents - Conteúdos a processar.
 * @returns {Promise<Map<string, string>>} Nomes de taxonomias por id.
 */
async function loadTaxonomyNames(db, contents) {
    const taxonomyIds = [
        ...new Set(
            contents.flatMap((content) =>
                (content.taxonomyIds ?? []).map((taxonomyId) => String(taxonomyId)),
            ),
        ),
    ].filter((taxonomyId) => ObjectId.isValid(taxonomyId));

    if (taxonomyIds.length === 0) {
        return new Map();
    }

    const rows = await db
        .collection("taxonomies")
        .find({
            _id: {
                $in: taxonomyIds.map((taxonomyId) =>
                    ObjectId.createFromHexString(taxonomyId),
                ),
            },
        })
        .toArray();

    return new Map(rows.map((taxonomy) => [String(taxonomy._id), taxonomy.name]));
}

/**
 * Garante índices da coleção de embeddings de conteúdo.
 *
 * @returns {Promise<void>} Termina depois de criar os índices necessários.
 */
export async function ensureContentEmbeddingIndexes() {
    const db = await getDb();

    await db
        .collection("content_embeddings")
        .createIndex({ contentId: 1, model: 1 }, { unique: true });
    await db.collection("content_embeddings").createIndex({ updatedAt: -1 });
}

/**
 * Cria ou actualiza o embedding de um conteúdo quando a fonte mudou.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {Record<string, unknown>} content - Conteúdo publicado.
 * @param {Map<string, string>} taxonomyNamesById - Nomes de taxonomias por id.
 * @param {{ config?: typeof env.embeddings, fetchImpl?: typeof fetch }} [options] - Dependências injectáveis.
 * @returns {Promise<{ status: "disabled" | "skipped" | "updated", contentId: string }>} Resultado da operação.
 */
export async function upsertContentEmbedding(
    db,
    content,
    taxonomyNamesById,
    { config = env.embeddings, fetchImpl = fetch } = {},
) {
    const contentId = content._id;
    const text = buildContentEmbeddingInput(content, taxonomyNamesById);
    const sourceHash = calculateContentEmbeddingSourceHash(text);

    const existing = await db.collection("content_embeddings").findOne({
        contentId,
        model: config.model,
    });

    if (
        existing?.sourceHash === sourceHash &&
        existing?.dimensions === config.dimensions
    ) {
        return { status: "skipped", contentId: String(contentId) };
    }

    const vector = await generateEmbeddingVector(text, { config, fetchImpl });

    if (vector === null) {
        return { status: "disabled", contentId: String(contentId) };
    }

    const now = new Date();
    await db.collection("content_embeddings").updateOne(
        { contentId, model: config.model },
        {
            $set: {
                contentId,
                model: config.model,
                dimensions: config.dimensions,
                sourceHash,
                vector: assertEmbeddingVector(vector, config.dimensions),
                updatedAt: now,
            },
            $setOnInsert: {
                createdAt: now,
            },
        },
        { upsert: true },
    );

    return { status: "updated", contentId: String(contentId) };
}

/**
 * Processa todos os conteúdos publicados de forma idempotente.
 *
 * @param {{ config?: typeof env.embeddings, fetchImpl?: typeof fetch }} [options] - Dependências injectáveis.
 * @returns {Promise<{ provider: string, model: string, processed: number, updated: number, skipped: number, disabled: number }>} Resumo operacional.
 */
export async function generatePublishedContentEmbeddings({
    config = env.embeddings,
    fetchImpl = fetch,
} = {}) {
    if (config.provider === "disabled") {
        return {
            provider: config.provider,
            model: config.model,
            processed: 0,
            updated: 0,
            skipped: 0,
            disabled: 1,
        };
    }

    const db = await getDb();

    await ensureContentEmbeddingIndexes();

    const contents = await db
        .collection("contents")
        .find({ status: "published" })
        .sort({ updatedAt: -1, publishedAt: -1, title: 1 })
        .toArray();
    const taxonomyNamesById = await loadTaxonomyNames(db, contents);
    const summary = {
        provider: config.provider,
        model: config.model,
        processed: contents.length,
        updated: 0,
        skipped: 0,
        disabled: 0,
    };

    for (const content of contents) {
        const result = await upsertContentEmbedding(db, content, taxonomyNamesById, {
            config,
            fetchImpl,
        });
        summary[result.status] += 1;
    }

    return summary;
}
