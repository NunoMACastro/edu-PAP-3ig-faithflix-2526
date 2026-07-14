/**
 * @file Testes unitários para passagens bíblicas e embeddings locais.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
    assertBiblicalPassagePayload,
    assertBiblicalPassageStatus,
} from "../../src/modules/biblical-passages/biblical-passages.validation.js";
import {
    linkBiblicalPassageToContent,
    listAdminBiblicalPassages,
    listBiblicalPassagesForPublishedContent,
    listPublishedBiblicalPassages,
} from "../../src/modules/biblical-passages/biblical-passages.service.js";
import {
    buildContentEmbeddingDocument,
    buildContentEmbeddingSource,
    buildLocalContentEmbedding,
    CONTENT_EMBEDDING_MODEL,
    cosineSimilarity,
    generateContentEmbeddings,
} from "../../src/modules/recommendations/content-embeddings.service.js";
import { getRecommendationsForUser } from "../../src/modules/recommendations/recommendations.service.js";

let activeCollections = {};

/**
 * Compara ids MongoDB por valor textual.
 *
 * @param {unknown} left Valor esquerdo.
 * @param {unknown} right Valor direito.
 * @returns {boolean} Verdadeiro quando representam o mesmo id.
 */
function sameId(left, right) {
    return String(left) === String(right);
}

/**
 * Lê caminhos simples `campo.subcampo`.
 *
 * @param {Record<string, unknown>} row Documento.
 * @param {string} path Caminho.
 * @returns {unknown} Valor encontrado.
 */
function valueForPath(row, path) {
    return path.split(".").reduce((current, key) => current?.[key], row);
}

/**
 * Aplica operadores MongoDB usados nesta suite.
 *
 * @param {unknown} actual Valor real.
 * @param {unknown} expected Condição esperada.
 * @returns {boolean} Resultado.
 */
function matchesValue(actual, expected) {
    if (expected instanceof ObjectId) {
        return sameId(actual, expected);
    }

    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
        if ("$in" in expected) {
            const actualValues = Array.isArray(actual) ? actual : [actual];
            return actualValues.some((value) =>
                expected.$in.some((entry) => sameId(value, entry)),
            );
        }

        if ("$nin" in expected) {
            const actualValues = Array.isArray(actual) ? actual : [actual];
            return actualValues.every((value) =>
                expected.$nin.every((entry) => !sameId(value, entry)),
            );
        }

        if ("$gte" in expected) {
            return Number(actual) >= Number(expected.$gte);
        }

        if ("$lte" in expected) {
            return Number(actual) <= Number(expected.$lte);
        }
    }

    return actual === expected;
}

/**
 * Aplica query MongoDB mínima.
 *
 * @param {Record<string, unknown>} row Documento.
 * @param {Record<string, unknown>} query Query.
 * @returns {boolean} Verdadeiro quando corresponde.
 */
function matches(row, query = {}) {
    return Object.entries(query).every(([key, expected]) => {
        if (key === "$or") {
            return expected.some((condition) => matches(row, condition));
        }

        return matchesValue(valueForPath(row, key), expected);
    });
}

/**
 * Ordena por campos simples.
 *
 * @param {Record<string, 1 | -1>} sort Ordenação.
 * @returns {(left: object, right: object) => number} Comparador.
 */
function compareBySort(sort = {}) {
    const entries = Object.entries(sort);

    return (left, right) => {
        for (const [key, direction] of entries) {
            const leftValue = valueForPath(left, key);
            const rightValue = valueForPath(right, key);

            if (leftValue < rightValue) return -1 * direction;
            if (leftValue > rightValue) return 1 * direction;
        }

        return 0;
    };
}

/**
 * Aplica update simplificado.
 *
 * @param {Record<string, unknown>} row Documento.
 * @param {Record<string, unknown>} update Update.
 * @param {boolean} isInsert Indica upsert.
 * @returns {Record<string, unknown>} Documento atualizado.
 */
function applyUpdate(row, update = {}, isInsert = false) {
    Object.assign(row, update.$set ?? {});

    if (isInsert) {
        Object.assign(row, update.$setOnInsert ?? {});
    }

    return row;
}

/**
 * Cria documento base a partir de filtros simples.
 *
 * @param {Record<string, unknown>} filter Filtro.
 * @returns {Record<string, unknown>} Documento base.
 */
function rowFromFilter(filter = {}) {
    return Object.fromEntries(
        Object.entries(filter).filter(
            ([, value]) =>
                !(value && typeof value === "object" && !(value instanceof ObjectId)),
        ),
    );
}

/**
 * Cria uma coleção fake com subset MongoDB usado pelos services.
 *
 * @param {Record<string, unknown>[]} initialRows Linhas iniciais.
 * @returns {Record<string, unknown>} Coleção fake.
 */
function collection(initialRows = []) {
    let rows = [...initialRows];

    return {
        rows,

        async createIndex() {},

        async findOne(query = {}, options = {}) {
            let result = rows.filter((row) => matches(row, query));

            if (options.sort) {
                result = result.toSorted(compareBySort(options.sort));
            }

            return result[0] ?? null;
        },

        async countDocuments(query = {}) {
            return rows.filter((row) => matches(row, query)).length;
        },

        find(query = {}) {
            let result = rows.filter((row) => matches(row, query));

            return {
                sort(sort) {
                    result = result.toSorted(compareBySort(sort));
                    return this;
                },
                skip(count) {
                    result = result.slice(count);
                    return this;
                },
                limit(limit) {
                    result = result.slice(0, limit);
                    return this;
                },
                async toArray() {
                    return result;
                },
            };
        },

        async insertOne(document) {
            const insertedId = document._id ?? new ObjectId();
            rows.push({ ...document, _id: insertedId });
            this.rows = rows;
            return { insertedId };
        },

        async insertMany(documents) {
            for (const document of documents) {
                await this.insertOne(document);
            }

            return { insertedCount: documents.length };
        },

        async updateOne(filter, update, options = {}) {
            const existing = rows.find((row) => matches(row, filter));

            if (existing) {
                applyUpdate(existing, update, false);
                return { matchedCount: 1, modifiedCount: 1 };
            }

            if (options.upsert) {
                rows.push(applyUpdate(rowFromFilter(filter), update, true));
                this.rows = rows;
            }

            return { matchedCount: 0, modifiedCount: 0 };
        },

        async deleteOne(filter) {
            const index = rows.findIndex((row) => matches(row, filter));

            if (index === -1) {
                return { deletedCount: 0 };
            }

            rows.splice(index, 1);
            this.rows = rows;
            return { deletedCount: 1 };
        },

        async deleteMany(filter) {
            const before = rows.length;
            rows = rows.filter((row) => !matches(row, filter));
            this.rows = rows;
            return { deletedCount: before - rows.length };
        },

        async findOneAndUpdate(filter, update) {
            const existing = rows.find((row) => matches(row, filter));

            if (!existing) {
                return null;
            }

            applyUpdate(existing, update, false);
            return existing;
        },

        aggregate(pipeline = []) {
            let result = [...rows];

            for (const stage of pipeline) {
                if (stage.$match) {
                    result = result.filter((row) => matches(row, stage.$match));
                }

                if (stage.$lookup?.from === "content_ratings") {
                    result = result.map((row) => ({
                        ...row,
                        ratings: (activeCollections.content_ratings?.rows ?? []).filter(
                            (rating) => sameId(rating.contentId, row._id),
                        ),
                    }));
                }

                if (stage.$addFields?.ratingAverage) {
                    result = result.map((row) => {
                        const ratings = row.ratings ?? [];
                        const ratingAverage =
                            ratings.length === 0
                                ? 0
                                : ratings.reduce(
                                      (sum, rating) => sum + rating.value,
                                      0,
                                  ) / ratings.length;

                        return { ...row, ratingAverage };
                    });
                }

                if (stage.$sort) {
                    result = result.toSorted(compareBySort(stage.$sort));
                }

                if (stage.$limit) {
                    result = result.slice(0, stage.$limit);
                }
            }

            return {
                async toArray() {
                    return result;
                },
            };
        },
    };
}

/**
 * Instala coleções fake no database provider.
 *
 * @param {Record<string, ReturnType<typeof collection>>} collections Coleções.
 * @returns {Record<string, ReturnType<typeof collection>>} Coleções.
 */
function setCollectionsForTests(collections) {
    activeCollections = collections;
    setDbForTests({
        collection(name) {
            collections[name] ??= collection([]);
            return collections[name];
        },
    });

    return collections;
}

afterEach(() => {
    activeCollections = {};
    setDbForTests(null);
});

test("passagens biblicas validam campos, intervalos e estados fechados", () => {
    const payload = assertBiblicalPassagePayload({
        book: "Joao",
        chapterStart: 3,
        verseStart: 16,
        text: "Deus amou o mundo e chama a humanidade a vida.",
    });

    assert.equal(payload.chapterEnd, 3);
    assert.equal(payload.verseEnd, 16);
    assert.equal(assertBiblicalPassageStatus("published"), "published");
    assert.throws(
        () =>
            assertBiblicalPassagePayload({
                chapterStart: 1,
                verseStart: 1,
                text: "Texto suficientemente longo.",
            }),
        /book/,
    );
    assert.throws(
        () =>
            assertBiblicalPassagePayload({
                book: "Joao",
                chapterStart: 3,
                verseStart: 16,
                chapterEnd: 2,
                verseEnd: 1,
                text: "Texto suficientemente longo.",
            }),
        /Intervalo/,
    );
    assert.throws(() => assertBiblicalPassageStatus("visible"), /Estado/);
});

test("servico de passagens separa publico, admin e associacoes publicadas", async () => {
    const userId = new ObjectId();
    const contentId = new ObjectId();
    const draftContentId = new ObjectId();
    const publishedPassageId = new ObjectId();
    const draftPassageId = new ObjectId();
    const now = new Date("2026-01-01T00:00:00.000Z");

    const collections = setCollectionsForTests({
        contents: collection([
            { _id: contentId, slug: "conteudo-publicado", status: "published" },
            { _id: draftContentId, slug: "conteudo-draft", status: "draft" },
        ]),
        biblical_passages: collection([
            {
                _id: publishedPassageId,
                book: "Joao",
                chapterStart: 3,
                verseStart: 16,
                chapterEnd: 3,
                verseEnd: 16,
                translation: "Parafraseado",
                text: "Texto biblico de exemplo suficientemente longo.",
                theme: "amor",
                reflection: "Reflexao editorial.",
                status: "published",
                createdBy: userId,
                updatedBy: userId,
                createdAt: now,
                updatedAt: now,
                publishedAt: now,
            },
            {
                _id: draftPassageId,
                book: "Tiago",
                chapterStart: 1,
                verseStart: 22,
                chapterEnd: 1,
                verseEnd: 22,
                translation: "Parafraseado",
                text: "Texto biblico draft suficientemente longo.",
                theme: "pratica",
                reflection: "Rascunho.",
                status: "draft",
                createdBy: userId,
                updatedBy: userId,
                createdAt: now,
                updatedAt: now,
                publishedAt: null,
            },
        ]),
        content_biblical_passages: collection([
            {
                contentId,
                passageId: publishedPassageId,
                note: "Nota publica.",
                sortOrder: 1,
                createdBy: userId,
                createdAt: now,
            },
            {
                contentId,
                passageId: draftPassageId,
                note: "Nao deve aparecer.",
                sortOrder: 2,
                createdBy: userId,
                createdAt: now,
            },
        ]),
    });

    const publicPassages = await listPublishedBiblicalPassages();
    const adminPassages = await listAdminBiblicalPassages();
    const contentPassages = await listBiblicalPassagesForPublishedContent(
        String(contentId),
    );

    assert.equal(publicPassages.total, 1);
    assert.equal(publicPassages.items[0].createdBy, undefined);
    assert.equal(adminPassages.total, 2);
    assert.equal(contentPassages.length, 1);
    assert.equal(contentPassages[0].note, "Nota publica.");
    await assert.rejects(
        () => listBiblicalPassagesForPublishedContent(String(draftContentId)),
        /Conteudo/,
    );

    await linkBiblicalPassageToContent(
        String(contentId),
        { passageId: String(publishedPassageId), note: "Atualizada", sortOrder: 0 },
        String(userId),
    );
    await linkBiblicalPassageToContent(
        String(contentId),
        { passageId: String(publishedPassageId), note: "Atualizada", sortOrder: 0 },
        String(userId),
    );

    assert.equal(collections.content_biblical_passages.rows.length, 2);
    assert.equal(collections.content_biblical_passages.rows[0].note, "Atualizada");
});

test("embeddings locais sao deterministicos e sourceHash muda com fonte editorial", () => {
    const first = buildLocalContentEmbedding("fe esperanca familia");
    const second = buildLocalContentEmbedding("fé esperança família");
    const different = buildLocalContentEmbedding("tecnologia ciencia espaco");
    const baseSource = buildContentEmbeddingSource(
        {
            title: "Esperanca Viva",
            synopsis: "Uma familia encontra fe em tempos dificeis.",
            type: "movie",
        },
        [{ name: "Familia" }],
        [],
    );
    const passageSource = buildContentEmbeddingSource(
        {
            title: "Esperanca Viva",
            synopsis: "Uma familia encontra fe em tempos dificeis.",
            type: "movie",
        },
        [{ name: "Familia" }],
        [{ theme: "consolo", reflection: "Deus acompanha no medo." }],
    );

    assert.deepEqual(first, second);
    assert.equal(cosineSimilarity(first, first), 1);
    assert.ok(cosineSimilarity(first, different) < 1);
    assert.notEqual(baseSource.sourceHash, passageSource.sourceHash);
});

test("fonte de embeddings respeita ordem editorial das associacoes", async () => {
    const contentId = new ObjectId();
    const firstPassageId = new ObjectId();
    const secondPassageId = new ObjectId();
    const collections = setCollectionsForTests({
        taxonomies: collection([]),
        content_biblical_passages: collection([
            {
                contentId,
                passageId: firstPassageId,
                sortOrder: 1,
                createdAt: new Date("2026-01-01T00:00:00.000Z"),
            },
            {
                contentId,
                passageId: secondPassageId,
                sortOrder: 2,
                createdAt: new Date("2026-01-02T00:00:00.000Z"),
            },
        ]),
        biblical_passages: collection([
            {
                _id: secondPassageId,
                status: "published",
                book: "Segundo",
                theme: "tema dois",
                reflection: "reflexao dois",
                text: "texto dois",
            },
            {
                _id: firstPassageId,
                status: "published",
                book: "Primeiro",
                theme: "tema um",
                reflection: "reflexao um",
                text: "texto um",
            },
        ]),
    });
    const db = {
        collection(name) {
            collections[name] ??= collection([]);
            return collections[name];
        },
    };

    const document = await buildContentEmbeddingDocument(db, {
        _id: contentId,
        title: "Conteudo",
        synopsis: "Sinopse do conteudo.",
        type: "movie",
        taxonomyIds: [],
    });
    const expected = buildContentEmbeddingSource(
        {
            title: "Conteudo",
            synopsis: "Sinopse do conteudo.",
            type: "movie",
        },
        [],
        [
            {
                book: "Primeiro",
                theme: "tema um",
                reflection: "reflexao um",
                text: "texto um",
            },
            {
                book: "Segundo",
                theme: "tema dois",
                reflection: "reflexao dois",
                text: "texto dois",
            },
        ],
    );

    assert.equal(document.sourceHash, expected.sourceHash);
});

test("geracao de embeddings remove vetores de conteudos nao publicados", async () => {
    const publishedId = new ObjectId();
    const archivedId = new ObjectId();
    const collections = setCollectionsForTests({
        contents: collection([
            {
                _id: publishedId,
                title: "Publicado",
                synopsis: "Conteudo publicado para embedding.",
                type: "movie",
                status: "published",
                taxonomyIds: [],
                publishedAt: new Date("2026-01-01T00:00:00.000Z"),
            },
        ]),
        taxonomies: collection([]),
        content_biblical_passages: collection([]),
        biblical_passages: collection([]),
        content_embeddings: collection([
            {
                contentId: archivedId,
                model: CONTENT_EMBEDDING_MODEL,
                sourceHash: "stale",
                vector: [1],
            },
        ]),
    });

    const summary = await generateContentEmbeddings();

    assert.equal(summary.pruned, 1);
    assert.equal(
        collections.content_embeddings.rows.some((row) =>
            sameId(row.contentId, archivedId),
        ),
        false,
    );
    assert.equal(
        collections.content_embeddings.rows.some((row) =>
            sameId(row.contentId, publishedId),
        ),
        true,
    );
});

test("recomendacoes adicionam grupo semantico sem persistir nem expor embeddings", async () => {
    const userId = new ObjectId();
    const sourceId = new ObjectId();
    const similarId = new ObjectId();
    const otherId = new ObjectId();
    const draftId = new ObjectId();
    const sourceVector = buildLocalContentEmbedding("fe esperanca familia");
    const similarVector = buildLocalContentEmbedding("fe esperanca familia");
    const otherVector = buildLocalContentEmbedding("tecnologia ciencia espaco");

    setCollectionsForTests({
        users: collection([
            { _id: userId, parentalMaxAgeRating: 18 },
        ]),
        user_consents: collection([
            {
                userId,
                consents: { personalizedRecommendations: true },
            },
        ]),
        user_content_lists: collection([
            {
                _id: new ObjectId(),
                userId,
                contentId: sourceId,
                type: "favorite",
            },
        ]),
        playback_progress: collection([]),
        content_ratings: collection([]),
        contents: collection([
            {
                _id: sourceId,
                title: "Origem",
                slug: "origem",
                type: "movie",
                status: "published",
                ageRating: 6,
                taxonomyIds: [],
                assets: {},
                publishedAt: new Date("2026-01-01T00:00:00.000Z"),
            },
            {
                _id: similarId,
                title: "Esperanca Similar",
                slug: "esperanca-similar",
                type: "movie",
                status: "published",
                ageRating: 6,
                taxonomyIds: [],
                assets: {},
                publishedAt: new Date("2026-01-02T00:00:00.000Z"),
            },
            {
                _id: otherId,
                title: "Outro Tema",
                slug: "outro-tema",
                type: "documentary",
                status: "published",
                ageRating: 6,
                taxonomyIds: [],
                assets: {},
                publishedAt: new Date("2026-01-03T00:00:00.000Z"),
            },
            {
                _id: draftId,
                title: "Draft Similar",
                slug: "draft-similar",
                type: "movie",
                status: "draft",
                taxonomyIds: [],
                assets: {},
            },
        ]),
        content_embeddings: collection([
            {
                contentId: sourceId,
                model: CONTENT_EMBEDDING_MODEL,
                vector: sourceVector,
            },
            {
                contentId: similarId,
                model: CONTENT_EMBEDDING_MODEL,
                vector: similarVector,
            },
            {
                contentId: otherId,
                model: CONTENT_EMBEDDING_MODEL,
                vector: otherVector,
            },
            {
                contentId: draftId,
                model: CONTENT_EMBEDDING_MODEL,
                vector: similarVector,
            },
        ]),
    });

    const response = await getRecommendationsForUser(String(userId));
    const semanticGroup = response.groups.find(
        (group) => group.id === "semantic-similar",
    );

    assert.equal(response.coldStart, false);
    assert.ok(semanticGroup);
    assert.equal(semanticGroup.items[0].id, String(similarId));
    assert.equal(
        semanticGroup.items.some((item) => item.id === String(sourceId)),
        false,
    );
    assert.equal(
        semanticGroup.items.some((item) => item.id === String(draftId)),
        false,
    );
    assert.equal("vector" in semanticGroup.items[0], false);
    assert.equal("sourceHash" in semanticGroup.items[0], false);
    assert.equal(semanticGroup.explanation.confidence, "semantic-baseline");
});

test("recomendacoes sem sinais mantem cold start sem grupo semantico", async () => {
    const userId = new ObjectId();
    setCollectionsForTests({
        users: collection([{ _id: userId, parentalMaxAgeRating: 18 }]),
        user_consents: collection([
            {
                userId,
                consents: { personalizedRecommendations: true },
            },
        ]),
        user_content_lists: collection([]),
        playback_progress: collection([]),
        content_ratings: collection([]),
        contents: collection([]),
        content_embeddings: collection([]),
    });

    const response = await getRecommendationsForUser(String(userId));

    assert.equal(response.coldStart, true);
    assert.equal(
        response.groups.some((group) => group.id === "semantic-similar"),
        false,
    );
});

test("consentimento recusado evita leituras pessoais e respeita parental", async () => {
    const userId = new ObjectId();
    const allowedId = new ObjectId();
    const blockedId = new ObjectId();
    const personalCollection = {
        find() {
            throw new Error("Coleção pessoal não devia ser consultada.");
        },
    };

    setCollectionsForTests({
        users: collection([{ _id: userId, parentalMaxAgeRating: 12 }]),
        user_consents: collection([
            {
                userId,
                consents: { personalizedRecommendations: false },
            },
        ]),
        user_content_lists: personalCollection,
        playback_progress: personalCollection,
        content_ratings: personalCollection,
        contents: collection([
            {
                _id: allowedId,
                title: "Permitido",
                slug: "permitido",
                type: "movie",
                status: "published",
                ageRating: 12,
                taxonomyIds: [],
                assets: {},
            },
            {
                _id: blockedId,
                title: "Bloqueado",
                slug: "bloqueado",
                type: "movie",
                status: "published",
                ageRating: 18,
                taxonomyIds: [],
                assets: {},
            },
        ]),
    });

    const response = await getRecommendationsForUser(String(userId));
    const ids = response.groups.flatMap((entry) =>
        entry.items.map((item) => item.id),
    );

    assert.equal(response.personalizationEnabled, false);
    assert.deepEqual(response.signalsUsed, []);
    assert.equal(ids.includes(String(allowedId)), true);
    assert.equal(ids.includes(String(blockedId)), false);
});

test("recomendacoes excluem conteudos avaliados negativamente sem os usar como sinal positivo", async () => {
    const userId = new ObjectId();
    const dislikedId = new ObjectId();
    const candidateId = new ObjectId();

    setCollectionsForTests({
        users: collection([{ _id: userId, parentalMaxAgeRating: 18 }]),
        user_consents: collection([
            {
                userId,
                consents: { personalizedRecommendations: true },
            },
        ]),
        user_content_lists: collection([]),
        playback_progress: collection([]),
        content_ratings: collection([
            {
                _id: new ObjectId(),
                userId,
                contentId: dislikedId,
                value: 2,
            },
        ]),
        contents: collection([
            {
                _id: dislikedId,
                title: "Nao Gostou",
                slug: "nao-gostou",
                type: "movie",
                status: "published",
                ageRating: 6,
                taxonomyIds: [],
                assets: {},
                publishedAt: new Date("2026-01-01T00:00:00.000Z"),
            },
            {
                _id: candidateId,
                title: "Candidato",
                slug: "candidato",
                type: "movie",
                status: "published",
                ageRating: 6,
                taxonomyIds: [],
                assets: {},
                publishedAt: new Date("2026-01-02T00:00:00.000Z"),
            },
        ]),
        content_embeddings: collection([]),
    });

    const response = await getRecommendationsForUser(String(userId));
    const recommendedIds = response.groups.flatMap((group) =>
        group.items.map((item) => item.id),
    );

    assert.equal(response.coldStart, true);
    assert.equal(response.signalsUsed.length, 0);
    assert.equal(recommendedIds.includes(String(dislikedId)), false);
    assert.equal(recommendedIds.includes(String(candidateId)), true);
});
