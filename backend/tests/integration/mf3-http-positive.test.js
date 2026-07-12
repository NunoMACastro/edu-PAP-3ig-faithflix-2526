/**
 * @file Ficheiro `real_dev/backend/tests/integration/mf3-http-positive.test.js` da implementação real_dev.
 */

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { sessionConfig } from "../../src/config/session.js";
import { hashToken } from "../../src/modules/auth/token.js";
import { startTestServer } from "../helpers/test-server.js";

const userId = new ObjectId("64f100000000000000000001");
const adminId = new ObjectId("64f100000000000000000002");
const movieId = new ObjectId("64f200000000000000000001");
const documentaryId = new ObjectId("64f200000000000000000002");
const relatedId = new ObjectId("64f200000000000000000003");
const taxonomyId = new ObjectId("64f300000000000000000001");
const otherTaxonomyId = new ObjectId("64f300000000000000000002");

const userToken = "a".repeat(64);
const adminToken = "b".repeat(64);
const userCsrfToken = "c".repeat(64);
const adminCsrfToken = "d".repeat(64);

let testServer;
let db;

/**
 * Documenta `oid`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} value Valor recebido por `oid`.
 * @returns {unknown} Resultado devolvido por `oid`.
 */
function oid(value) {
    return value instanceof ObjectId ? value : new ObjectId(value);
}

/**
 * Documenta `sameId`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} left Valor recebido por `sameId`.
 * @param {unknown} right Valor recebido por `sameId`.
 * @returns {unknown} Resultado devolvido por `sameId`.
 */
function sameId(left, right) {
    return String(left) === String(right);
}

/**
 * Documenta `valueForPath`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} row Valor recebido por `valueForPath`.
 * @param {unknown} path Valor recebido por `valueForPath`.
 * @returns {unknown} Resultado devolvido por `valueForPath`.
 */
function valueForPath(row, path) {
    return path.split(".").reduce((current, key) => current?.[key], row);
}

/**
 * Documenta `matchesValue`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} actual Valor recebido por `matchesValue`.
 * @param {unknown} expected Valor recebido por `matchesValue`.
 * @returns {unknown} Resultado devolvido por `matchesValue`.
 */
function matchesValue(actual, expected) {
    if (expected instanceof RegExp) {
        return expected.test(String(actual ?? ""));
    }

    if (expected instanceof ObjectId) {
        return sameId(actual, expected);
    }

    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
        if ("$in" in expected) {
            const candidates = Array.isArray(actual) ? actual : [actual];
            return candidates.some((candidate) =>
                expected.$in.some((entry) => sameId(candidate, entry)),
            );
        }

        if ("$nin" in expected) {
            return expected.$nin.every((entry) => !sameId(actual, entry));
        }

        if ("$ne" in expected) {
            return !sameId(actual, expected.$ne);
        }

        if ("$gte" in expected) {
            return actual >= expected.$gte;
        }

        if ("$gt" in expected) {
            return actual > expected.$gt;
        }

        if ("$lte" in expected) {
            return actual <= expected.$lte;
        }
    }

    return actual === expected;
}

/**
 * Documenta `matches`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} row Valor recebido por `matches`.
 * @param {unknown} query Valor recebido por `matches`.
 * @returns {unknown} Resultado devolvido por `matches`.
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
 * Documenta `compareBySort`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} sort Valor recebido por `compareBySort`.
 * @returns {unknown} Resultado devolvido por `compareBySort`.
 */
function compareBySort(sort) {
    const entries = Object.entries(sort ?? {});

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
 * Documenta `publicContent`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} title Valor recebido por `publicContent`.
 * @param {unknown} slug Valor recebido por `publicContent`.
 * @param {unknown} type Valor recebido por `publicContent`.
 * @param {unknown} taxonomyIds Valor recebido por `publicContent`.
 * @returns {unknown} Resultado devolvido por `publicContent`.
 */
function publicContent({ _id, title, slug, type, taxonomyIds, publishedAt }) {
    return {
        _id,
        title,
        slug,
        type,
        taxonomyIds,
        status: "published",
        ageRating: 12,
        synopsis: `${title} de teste`,
        publishedAt,
        assets: { posterUrl: `/media/${slug}.jpg` },
    };
}

/**
 * Documenta `createCollection`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} rows Valor recebido por `createCollection`.
 * @returns {unknown} Resultado devolvido por `createCollection`.
 */
function createCollection(rows) {
    return {
        rows,

        async createIndex() {},

        /**
         * Documenta `findOne`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} query Valor recebido por `findOne`.
         * @returns {Promise<unknown>} Resultado devolvido por `findOne`.
         */
        async findOne(query) {
            return rows.find((row) => matches(row, query)) ?? null;
        },

        /**
         * Documenta `find`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} query Valor recebido por `find`.
         * @returns {unknown} Resultado devolvido por `find`.
         */
        find(query = {}) {
            let result = rows.filter((row) => matches(row, query));

            return {
                /**
                 * Documenta `sort`, mantendo explícita a responsabilidade desta função no módulo.
                 *
                 * @param {unknown} sort Valor recebido por `sort`.
                 * @returns {unknown} Resultado devolvido por `sort`.
                 */
                sort(sort) {
                    result = result.toSorted(compareBySort(sort));
                    return this;
                },
                /**
                 * Documenta `limit`, mantendo explícita a responsabilidade desta função no módulo.
                 *
                 * @param {unknown} limit Valor recebido por `limit`.
                 * @returns {unknown} Resultado devolvido por `limit`.
                 */
                limit(limit) {
                    result = result.slice(0, limit);
                    return this;
                },
                /**
                 * Documenta `toArray`, mantendo explícita a responsabilidade desta função no módulo.
                 * @returns {Promise<unknown>} Resultado devolvido por `toArray`.
                 */
                async toArray() {
                    return result;
                },
            };
        },

        /**
         * Documenta `insertOne`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} document Valor recebido por `insertOne`.
         * @returns {Promise<unknown>} Resultado devolvido por `insertOne`.
         */
        async insertOne(document) {
            const insertedId = document._id ?? new ObjectId();
            rows.push({ ...document, _id: insertedId });
            return { insertedId };
        },

        /**
         * Documenta `updateOne`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} filter Valor recebido por `updateOne`.
         * @param {unknown} update Valor recebido por `updateOne`.
         * @param {unknown} options Valor recebido por `updateOne`.
         * @returns {Promise<unknown>} Resultado devolvido por `updateOne`.
         */
        async updateOne(filter, update, options = {}) {
            const existing = rows.find((row) => matches(row, filter));

            if (existing) {
                Object.assign(existing, update.$set ?? {});
                return { matchedCount: 1, modifiedCount: 1, upsertedId: null };
            }

            if (!options.upsert) {
                return { matchedCount: 0, modifiedCount: 0, upsertedId: null };
            }

            const upsertedId = new ObjectId();
            rows.push({
                _id: upsertedId,
                ...filter,
                ...(update.$setOnInsert ?? {}),
                ...(update.$set ?? {}),
            });
            return { matchedCount: 0, modifiedCount: 0, upsertedId };
        },

        /**
         * Documenta `deleteOne`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} filter Valor recebido por `deleteOne`.
         * @returns {Promise<unknown>} Resultado devolvido por `deleteOne`.
         */
        async deleteOne(filter) {
            const index = rows.findIndex((row) => matches(row, filter));

            if (index === -1) {
                return { deletedCount: 0 };
            }

            rows.splice(index, 1);
            return { deletedCount: 1 };
        },

        /**
         * Documenta `findOneAndUpdate`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} filter Valor recebido por `findOneAndUpdate`.
         * @param {unknown} update Valor recebido por `findOneAndUpdate`.
         * @returns {Promise<unknown>} Resultado devolvido por `findOneAndUpdate`.
         */
        async findOneAndUpdate(filter, update) {
            const row = rows.find((entry) => matches(entry, filter));

            if (!row) {
                return null;
            }

            Object.assign(row, update.$set ?? {});
            return row;
        },

        /**
         * Documenta `aggregate`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} pipeline Valor recebido por `aggregate`.
         * @returns {unknown} Resultado devolvido por `aggregate`.
         */
        aggregate(pipeline = []) {
            let result = [...rows];

            for (const stage of pipeline) {
                if (stage.$match) {
                    result = result.filter((row) => matches(row, stage.$match));
                }

                if (stage.$lookup?.from === "content_ratings") {
                    result = result.map((row) => ({
                        ...row,
                        ratings: db
                            .collection("content_ratings")
                            .rows.filter((rating) => sameId(rating.contentId, row._id)),
                    }));
                }

                if (stage.$addFields?.ratingAverage) {
                    result = result.map((row) => {
                        const ratings = row.ratings ?? [];
                        const average =
                            ratings.length === 0
                                ? 0
                                : ratings.reduce((sum, rating) => sum + rating.value, 0) /
                                  ratings.length;

                        return { ...row, ratingAverage: average };
                    });
                }

                if (stage.$addFields?.relatedScore) {
                    result = result.map((row) => {
                        const expression = stage.$addFields.relatedScore.$add;
                        const expectedTaxonomies =
                            expression?.[0]?.$size?.$setIntersection?.[1] ?? [];
                        const expectedType = expression?.[1]?.$cond?.[0]?.$eq?.[1];
                        const sharedTaxonomies = (row.taxonomyIds ?? []).filter((id) =>
                            expectedTaxonomies.some((expectedId) => sameId(id, expectedId)),
                        ).length;
                        const typeScore = row.type === expectedType ? 1 : 0;

                        return {
                            ...row,
                            relatedScore: sharedTaxonomies + typeScore,
                        };
                    });
                }

                if (stage.$group) {
                    const grouped = new Map();

                    for (const row of result) {
                        const key = valueForPath(row, stage.$group._id.slice(1));
                        grouped.set(key, (grouped.get(key) ?? 0) + 1);
                    }

                    result = [...grouped.entries()].map(([key, count]) => ({
                        _id: key,
                        count,
                    }));
                }

                if (stage.$sort) {
                    result = result.toSorted(compareBySort(stage.$sort));
                }

                if (stage.$limit) {
                    result = result.slice(0, stage.$limit);
                }

                if (stage.$facet) {
                    const metadata = [{ total: result.length }];
                    const skip = stage.$facet.items.find((item) => "$skip" in item)?.$skip ?? 0;
                    const limit = stage.$facet.items.find((item) => "$limit" in item)?.$limit;
                    const items = result.slice(skip, limit ? skip + limit : undefined);
                    result = [{ metadata, items }];
                }
            }

            return {
                /**
                 * Documenta `toArray`, mantendo explícita a responsabilidade desta função no módulo.
                 * @returns {Promise<unknown>} Resultado devolvido por `toArray`.
                 */
                async toArray() {
                    return result;
                },
            };
        },
    };
}

/**
 * Documenta `createTestDb`, mantendo explícita a responsabilidade desta função no módulo.
 * @returns {unknown} Resultado devolvido por `createTestDb`.
 */
function createTestDb() {
    const collections = {
        users: createCollection([
            {
                _id: userId,
                name: "Utilizador MF3",
                email: "mf3-user@example.test",
                role: "user",
            },
            {
                _id: adminId,
                name: "Moderador MF3",
                email: "mf3-admin@example.test",
                role: "moderator",
            },
        ]),
        sessions: createCollection([
            {
                _id: new ObjectId(),
                userId,
                tokenHash: hashToken(userToken),
                csrfTokenHash: hashToken(userCsrfToken),
                expiresAt: new Date("2999-01-01T00:00:00.000Z"),
            },
            {
                _id: new ObjectId(),
                userId: adminId,
                tokenHash: hashToken(adminToken),
                csrfTokenHash: hashToken(adminCsrfToken),
                expiresAt: new Date("2999-01-01T00:00:00.000Z"),
            },
        ]),
        contents: createCollection([
            publicContent({
                _id: movieId,
                title: "Fe em Acao",
                slug: "fe-em-acao",
                type: "movie",
                taxonomyIds: [taxonomyId],
                publishedAt: new Date("2026-01-03T00:00:00.000Z"),
            }),
            publicContent({
                _id: documentaryId,
                title: "Documentario da Fe",
                slug: "documentario-da-fe",
                type: "documentary",
                taxonomyIds: [taxonomyId],
                publishedAt: new Date("2026-01-02T00:00:00.000Z"),
            }),
            publicContent({
                _id: relatedId,
                title: "Esperanca Viva",
                slug: "esperanca-viva",
                type: "movie",
                taxonomyIds: [otherTaxonomyId],
                publishedAt: new Date("2026-01-01T00:00:00.000Z"),
            }),
        ]),
        taxonomies: createCollection([
            { _id: taxonomyId, name: "Fe" },
            { _id: otherTaxonomyId, name: "Esperanca" },
        ]),
        content_ratings: createCollection([
            {
                _id: new ObjectId(),
                userId: adminId,
                contentId: movieId,
                value: 4,
            },
            {
                _id: new ObjectId(),
                userId: adminId,
                contentId: documentaryId,
                value: 5,
            },
        ]),
        content_comments: createCollection([]),
        user_content_lists: createCollection([
            {
                _id: new ObjectId(),
                userId,
                contentId: movieId,
                type: "favorite",
            },
        ]),
        playback_progress: createCollection([
            {
                _id: new ObjectId(),
                userId,
                contentId: documentaryId,
                currentTimeSeconds: 120,
            },
        ]),
        user_consents: createCollection([
            {
                _id: new ObjectId(),
                userId,
                version: "faithflix-privacy-v1",
                consents: {
                    personalizedRecommendations: true,
                    operationalNotifications: true,
                    anonymousMetrics: false,
                },
                updatedAt: new Date("2026-01-01T00:00:00.000Z"),
            },
        ]),
    };

    return {
        /**
         * Documenta `collection`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} name Valor recebido por `collection`.
         * @returns {unknown} Resultado devolvido por `collection`.
         */
        collection(name) {
            return collections[name] ?? createCollection([]);
        },
    };
}

/**
 * Documenta `authCookie`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} token Valor recebido por `authCookie`.
 * @returns {unknown} Resultado devolvido por `authCookie`.
 */
function authCookie(token = userToken) {
    return `${sessionConfig.cookieName}=${token}`;
}

/**
 * Constrói os headers mínimos de uma mutação autenticada com CSRF.
 *
 * @param {string} token Token da sessão usada pelo pedido.
 * @returns {Record<string, string>} Cookie e token CSRF correspondentes.
 */
function authenticatedMutationHeaders(token = userToken) {
    return {
        cookie: authCookie(token),
        "x-csrf-token":
            token === adminToken ? adminCsrfToken : userCsrfToken,
    };
}

/**
 * Documenta `json`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} response Valor recebido por `json`.
 * @returns {Promise<unknown>} Resultado devolvido por `json`.
 */
async function json(response) {
    return response.json();
}

before(async () => {
    db = createTestDb();
    setDbForTests(db);
    testServer = await startTestServer();
});

after(async () => {
    if (testServer) {
        await testServer.close();
    }

    setDbForTests(null);
});

test("MF3 executa ciclo HTTP positivo de ratings com DB controlada", async () => {
    const saveResponse = await fetch(`${testServer.baseUrl}/api/ratings/${movieId}`, {
        method: "PUT",
        headers: {
            "content-type": "application/json",
            ...authenticatedMutationHeaders(),
        },
        body: JSON.stringify({ value: 5 }),
    });
    const saved = await json(saveResponse);

    assert.equal(saveResponse.status, 200);
    assert.equal(saved.rating.value, 5);

    const meResponse = await fetch(`${testServer.baseUrl}/api/ratings/${movieId}/me`, {
        headers: authenticatedMutationHeaders(),
    });
    const mine = await json(meResponse);

    assert.equal(meResponse.status, 200);
    assert.equal(mine.rating.value, 5);

    const summaryResponse = await fetch(
        `${testServer.baseUrl}/api/ratings/${movieId}/summary`,
    );
    const summary = await json(summaryResponse);

    assert.equal(summaryResponse.status, 200);
    assert.equal(summary.summary.total, 2);
    assert.equal(summary.summary.distribution[5], 1);

    const deleteResponse = await fetch(`${testServer.baseUrl}/api/ratings/${movieId}`, {
        method: "DELETE",
        headers: authenticatedMutationHeaders(),
    });
    const deleted = await json(deleteResponse);

    assert.equal(deleteResponse.status, 200);
    assert.equal(deleted.rating.value, null);
});

test("MF3 executa ciclo HTTP positivo de comentarios com ownership e moderacao", async () => {
    const createResponse = await fetch(
        `${testServer.baseUrl}/api/comments/${movieId}`,
        {
            method: "POST",
            headers: {
                "content-type": "application/json",
                ...authenticatedMutationHeaders(),
            },
            body: JSON.stringify({ body: "Muito bom para a familia." }),
        },
    );
    const created = await json(createResponse);

    assert.equal(createResponse.status, 201);
    assert.equal(created.comment.status, "visible");
    assert.equal(created.comment.userId, undefined);
    assert.equal(created.comment.canDelete, true);

    const listResponse = await fetch(`${testServer.baseUrl}/api/comments/${movieId}`, {
        headers: { cookie: authCookie() },
    });
    const list = await json(listResponse);

    assert.equal(listResponse.status, 200);
    assert.equal(
        listResponse.headers.get("cache-control"),
        "private, no-store",
    );
    assert.match(listResponse.headers.get("vary") ?? "", /(?:^|,)\s*Cookie\s*(?:,|$)/iu);
    assert.equal(list.items.length, 1);
    assert.equal(list.items[0].canDelete, true);
    assert.equal(list.items[0].userId, undefined);

    const moderationResponse = await fetch(
        `${testServer.baseUrl}/api/comments/${created.comment.id}/moderation`,
        {
            method: "PATCH",
            headers: {
                "content-type": "application/json",
                ...authenticatedMutationHeaders(adminToken),
            },
            body: JSON.stringify({
                status: "rejected",
                moderationReason: "Teste de moderacao",
            }),
        },
    );
    const moderated = await json(moderationResponse);

    assert.equal(moderationResponse.status, 200);
    assert.equal(moderated.comment.status, "rejected");
});

test("MF3 devolve pesquisa, discovery e relacionados positivos sobre publicados", async () => {
    const searchResponse = await fetch(
        `${testServer.baseUrl}/api/search?q=fe&type=movie&sort=rating`,
    );
    const search = await json(searchResponse);

    assert.equal(searchResponse.status, 200);
    assert.equal(search.items.length, 1);
    assert.equal(search.items[0].id, String(movieId));
    assert.equal(search.filters.type, "movie");
    assert.equal(search.sort, "rating");

    const discoveryResponse = await fetch(`${testServer.baseUrl}/api/discovery/home`);
    const discovery = await json(discoveryResponse);

    assert.equal(discoveryResponse.status, 200);
    assert.equal(discovery.carousels.length, 2);
    assert.deepEqual(
        discovery.carousels.map((carousel) => carousel.id),
        ["most-watched", "recent"],
    );
    assert.deepEqual(
        discovery.formats.map((format) => format.type),
        ["movie", "series", "documentary"],
    );
    assert.equal(discovery.formats.find((format) => format.type === "movie").count, 2);
    assert.equal(
        discovery.formats.some((format) => format.type === "episode"),
        false,
    );

    const relatedResponse = await fetch(
        `${testServer.baseUrl}/api/discovery/related/${movieId}`,
    );
    const related = await json(relatedResponse);

    assert.equal(relatedResponse.status, 200);
    assert.ok(related.items.length > 0);
    assert.equal(
        related.items.some((item) => item.id === String(movieId)),
        false,
    );
});

test("MF3 devolve recomendacoes positivas com explicabilidade por grupo", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/recommendations/me`, {
        headers: { cookie: authCookie() },
    });
    const recommendations = await json(response);

    assert.equal(response.status, 200);
    assert.equal(recommendations.coldStart, false);
    assert.ok(recommendations.signalsUsed.includes("favorites"));
    assert.ok(recommendations.signalsUsed.includes("history"));
    assert.equal(recommendations.groups.length, 3);

    for (const group of recommendations.groups) {
        assert.equal(group.explanation.title, "Porque recomendamos");
        assert.equal("message" in group.explanation, true);
    }
});
