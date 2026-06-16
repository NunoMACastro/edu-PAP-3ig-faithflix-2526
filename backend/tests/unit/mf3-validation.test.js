/**
 * @file Ficheiro `real_dev/backend/tests/unit/mf3-validation.test.js` da implementação real_dev.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
    assertCommentBody,
    assertModerationStatus,
    initialModerationFor,
} from "../../src/modules/comments/comments.validation.js";
import { listVisibleComments } from "../../src/modules/comments/comments.service.js";
import { buildRecommendationExplanation } from "../../src/modules/recommendations/recommendation-explanations.js";
import { assertRatingValue } from "../../src/modules/ratings/ratings.validation.js";
import { getRatingSummary } from "../../src/modules/ratings/ratings.service.js";
import { searchContents } from "../../src/modules/search/search.service.js";
import {
    assertSearchQuery,
    parsePagination,
    parseSearchFilters,
} from "../../src/modules/search/search.validation.js";

/**
 * Documenta `useDbForTest`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} collections Valor recebido por `useDbForTest`.
 * @returns {unknown} Resultado devolvido por `useDbForTest`.
 */
function useDbForTest(collections) {
    setDbForTests({
        /**
         * Documenta `collection`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} name Valor recebido por `collection`.
         * @returns {unknown} Resultado devolvido por `collection`.
         */
        collection(name) {
            return collections[name];
        },
    });
}

test("ratings validam escala canonica de 1 a 5", () => {
    assert.equal(assertRatingValue(5), 5);
    assert.equal(assertRatingValue("3"), 3);
    assert.throws(() => assertRatingValue(0), /rating/);
    assert.throws(() => assertRatingValue(6), /rating/);
    assert.throws(() => assertRatingValue("bom"), /rating/);
});

test("comentarios normalizam texto e aplicam moderacao minima", () => {
    assert.equal(assertCommentBody("  Muito   bom  "), "Muito bom");
    assert.equal(initialModerationFor("Muito bom").status, "visible");
    assert.equal(
        initialModerationFor("Ver em https://example.com").status,
        "pending_review",
    );
    assert.equal(assertModerationStatus("rejected"), "rejected");
    assert.throws(() => assertCommentBody("  "), /comentario/);
    assert.throws(() => assertModerationStatus("published"), /moderacao/);
});

test("pesquisa valida query, paginacao, filtros e ordenacao", () => {
    assert.equal(assertSearchQuery("  fe  "), "fe");
    assert.deepEqual(parsePagination({ page: "2", limit: "12" }), {
        page: 2,
        limit: 12,
    });
    assert.equal(parseSearchFilters({ sort: "recent" }).sort, "recent");
    assert.equal(parseSearchFilters({ type: "movie" }).type, "movie");
    assert.throws(() => assertSearchQuery("f"), /pesquisa/);
    assert.throws(() => parsePagination({ page: "0" }), /Pagina/);
    assert.throws(() => parseSearchFilters({ sort: "random" }), /Ordenacao/);
});

test("explicabilidade tem mensagens fechadas e fallback seguro", () => {
    assert.equal(
        buildRecommendationExplanation("cold-start-popular").confidence,
        "cold-start",
    );
    assert.deepEqual(
        buildRecommendationExplanation("codigo-desconhecido").signals,
        ["catalogo publicado"],
    );
});

test("ratings agregam apenas conteudo publicado e rejeitam draft", async () => {
    const publishedId = new ObjectId();
    const draftId = new ObjectId();

    useDbForTest({
        contents: {
            /**
             * Documenta `findOne`, mantendo explícita a responsabilidade desta função no módulo.
             *
             * @param {unknown} query Valor recebido por `findOne`.
             * @returns {Promise<unknown>} Resultado devolvido por `findOne`.
             */
            async findOne(query) {
                if (String(query._id) === String(publishedId) && query.status === "published") {
                    return { _id: publishedId, status: "published" };
                }

                if (String(query._id) === String(draftId)) {
                    return null;
                }

                return null;
            },
        },
        content_ratings: {
            /**
             * Documenta `aggregate`, mantendo explícita a responsabilidade desta função no módulo.
             * @returns {unknown} Resultado devolvido por `aggregate`.
             */
            aggregate() {
                return {
                    /**
                     * Documenta `toArray`, mantendo explícita a responsabilidade desta função no módulo.
                     * @returns {Promise<unknown>} Resultado devolvido por `toArray`.
                     */
                    async toArray() {
                        return [
                            { _id: 5, count: 2 },
                            { _id: 3, count: 1 },
                        ];
                    },
                };
            },
        },
    });

    const summary = await getRatingSummary(String(publishedId));

    assert.equal(summary.total, 3);
    assert.equal(summary.average, 4.33);
    await assert.rejects(() => getRatingSummary(String(draftId)), /Conteudo/);
    setDbForTests(null);
});

test("comentarios publicos escondem userId e devolvem canDelete calculado", async () => {
    const contentId = new ObjectId();
    const userId = new ObjectId();
    const commentId = new ObjectId();

    useDbForTest({
        contents: {
            /**
             * Documenta `findOne`, mantendo explícita a responsabilidade desta função no módulo.
             *
             * @param {unknown} query Valor recebido por `findOne`.
             * @returns {Promise<unknown>} Resultado devolvido por `findOne`.
             */
            async findOne(query) {
                if (String(query._id) === String(contentId) && query.status === "published") {
                    return { _id: contentId, status: "published" };
                }

                return null;
            },
        },
        content_comments: {
            /**
             * Documenta `find`, mantendo explícita a responsabilidade desta função no módulo.
             * @returns {unknown} Resultado devolvido por `find`.
             */
            find() {
                return {
                    /**
                     * Documenta `sort`, mantendo explícita a responsabilidade desta função no módulo.
                     * @returns {unknown} Resultado devolvido por `sort`.
                     */
                    sort() {
                        return this;
                    },
                    /**
                     * Documenta `limit`, mantendo explícita a responsabilidade desta função no módulo.
                     * @returns {unknown} Resultado devolvido por `limit`.
                     */
                    limit() {
                        return this;
                    },
                    /**
                     * Documenta `toArray`, mantendo explícita a responsabilidade desta função no módulo.
                     * @returns {Promise<unknown>} Resultado devolvido por `toArray`.
                     */
                    async toArray() {
                        return [
                            {
                                _id: commentId,
                                contentId,
                                userId,
                                body: "Muito bom",
                                status: "visible",
                                moderationReason: null,
                                createdAt: new Date("2026-01-01T00:00:00.000Z"),
                                updatedAt: new Date("2026-01-01T00:00:00.000Z"),
                            },
                        ];
                    },
                };
            },
        },
    });

    const [ownerComment] = await listVisibleComments(String(contentId), {
        id: String(userId),
        role: "user",
    });
    const [anonymousComment] = await listVisibleComments(String(contentId));

    assert.equal(ownerComment.userId, undefined);
    assert.equal(ownerComment.canDelete, true);
    assert.equal(anonymousComment.canDelete, false);
    setDbForTests(null);
});

test("pesquisa usa filtro published no contrato de DB", async () => {
    let observedPipeline;

    useDbForTest({
        taxonomies: {
            /**
             * Documenta `find`, mantendo explícita a responsabilidade desta função no módulo.
             * @returns {unknown} Resultado devolvido por `find`.
             */
            find() {
                return {
                    /**
                     * Documenta `toArray`, mantendo explícita a responsabilidade desta função no módulo.
                     * @returns {Promise<unknown>} Resultado devolvido por `toArray`.
                     */
                    async toArray() {
                        return [];
                    },
                };
            },
        },
        contents: {
            /**
             * Documenta `aggregate`, mantendo explícita a responsabilidade desta função no módulo.
             *
             * @param {unknown} pipeline Valor recebido por `aggregate`.
             * @returns {unknown} Resultado devolvido por `aggregate`.
             */
            aggregate(pipeline) {
                observedPipeline = pipeline;
                return {
                    /**
                     * Documenta `toArray`, mantendo explícita a responsabilidade desta função no módulo.
                     * @returns {Promise<unknown>} Resultado devolvido por `toArray`.
                     */
                    async toArray() {
                        return [
                            {
                                metadata: [{ total: 0 }],
                                items: [],
                            },
                        ];
                    },
                };
            },
        },
    });

    const response = await searchContents({ q: "fe", page: 1, limit: 12 });
    const match = observedPipeline.find((stage) => stage.$match)?.$match;

    assert.equal(response.total, 0);
    assert.equal(match.status, "published");
    setDbForTests(null);
});
