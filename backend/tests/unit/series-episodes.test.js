/**
 * @file Contratos unitários da hierarquia série -> episódio.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
    assertCatalogHierarchyReady,
    getPublishedContentDetail,
} from "../../src/modules/catalog/catalog.service.js";
import { getPlayback } from "../../src/modules/playback/playback.service.js";
import { getRatingSummary } from "../../src/modules/ratings/ratings.service.js";
import { applySeriesEpisodeMigration } from "../../scripts/migrate-series-episodes.js";

/**
 * Cria um cursor mínimo ordenável para serviços de catálogo.
 *
 * @param {object[]} rows Documentos devolvidos.
 * @returns {object} Cursor fake.
 */
function cursor(rows) {
    return {
        sort() {
            return this;
        },
        async toArray() {
            return rows;
        },
    };
}

/**
 * Compara uma linha com o subconjunto de operadores usado pelo migrador.
 *
 * @param {Record<string, unknown>} row Documento em memória.
 * @param {Record<string, unknown>} query Filtro MongoDB simplificado.
 * @returns {boolean} Resultado do filtro.
 */
function matches(row, query) {
    return Object.entries(query).every(([key, expected]) => {
        const value = row[key];
        if (expected && typeof expected === "object" && "$in" in expected) {
            return expected.$in.some((candidate) => String(candidate) === String(value));
        }
        return String(value) === String(expected);
    });
}

/**
 * Cria uma base em memória suficiente para provar o migrador.
 *
 * @param {Record<string, Record<string, unknown>[]>} initial Coleções iniciais.
 * @returns {{ db: import("mongodb").Db, rows: Record<string, Record<string, unknown>[]> }} DB e estado observável.
 */
function migrationDb(initial) {
    const rows = Object.fromEntries(
        Object.entries(initial).map(([name, documents]) => [
            name,
            documents.map((document) => ({ ...document })),
        ]),
    );

    return {
        rows,
        db: {
            collection(name) {
                rows[name] ??= [];
                return {
                    find(query) {
                        return cursor(rows[name].filter((row) => matches(row, query)));
                    },
                    async findOne(query) {
                        return rows[name].find((row) => matches(row, query)) ?? null;
                    },
                    async countDocuments(query) {
                        return rows[name].filter((row) => matches(row, query)).length;
                    },
                    async updateOne(query, update) {
                        const row = rows[name].find((candidate) => matches(candidate, query));
                        if (!row) return { matchedCount: 0 };
                        if (update.$set) Object.assign(row, update.$set);
                        if (update.$unset) {
                            for (const key of Object.keys(update.$unset)) delete row[key];
                        }
                        return { matchedCount: 1 };
                    },
                    async updateMany(query, update) {
                        for (const row of rows[name].filter((candidate) => matches(candidate, query))) {
                            if (update.$set) Object.assign(row, update.$set);
                            if (update.$unset) {
                                for (const key of Object.keys(update.$unset)) delete row[key];
                            }
                        }
                    },
                    async deleteOne(query) {
                        const index = rows[name].findIndex((row) => matches(row, query));
                        if (index >= 0) rows[name].splice(index, 1);
                    },
                };
            },
        },
    };
}

test("detalhe de serie agrupa episodios publicados por temporada", async () => {
    const seriesId = new ObjectId();
    const series = {
        _id: seriesId,
        title: "Familia em Oracao",
        slug: "familia-em-oracao",
        synopsis: "Serie familiar de demonstracao.",
        type: "series",
        status: "published",
        ageRating: 6,
    };
    const episodes = [
        {
            _id: new ObjectId(),
            title: "Primeiro",
            slug: "primeiro",
            synopsis: "Primeiro episodio publicado.",
            type: "episode",
            status: "published",
            seriesId,
            seasonNumber: 1,
            episodeNumber: 1,
            durationSeconds: 600,
            ageRating: 6,
        },
        {
            _id: new ObjectId(),
            title: "Segundo",
            slug: "segundo",
            synopsis: "Segundo episodio publicado.",
            type: "episode",
            status: "published",
            seriesId,
            seasonNumber: 1,
            episodeNumber: 2,
            durationSeconds: 900,
            ageRating: 6,
        },
    ];
    setDbForTests({
        collection(name) {
            assert.equal(name, "contents");
            return {
                async findOne(query) {
                    return query.slug === series.slug ? series : null;
                },
                find() {
                    return cursor(episodes);
                },
            };
        },
    });

    try {
        const detail = await getPublishedContentDetail(series.slug);
        assert.equal(detail.content.isPlayable, false);
        assert.equal(detail.content.episodeCount, 2);
        assert.equal(detail.content.totalDurationSeconds, 1500);
        assert.equal(detail.seasons[0].episodes[0].episodeNumber, 1);
        assert.equal("media" in detail.seasons[0].episodes[0], false);
    } finally {
        setDbForTests(null);
    }
});

test("detalhe direto de episodio devolve serie e caminho canonico", async () => {
    const series = {
        _id: new ObjectId(),
        title: "Juventude com Proposito",
        slug: "juventude-com-proposito",
        type: "series",
        status: "published",
    };
    const episode = {
        _id: new ObjectId(),
        title: "Plano de Sabado",
        slug: "plano-de-sabado",
        synopsis: "Um episodio sobre servico comunitario.",
        type: "episode",
        status: "published",
        seriesId: series._id,
        seasonNumber: 1,
        episodeNumber: 1,
        durationSeconds: 1200,
        ageRating: 6,
    };
    setDbForTests({
        collection() {
            return {
                async findOne(query) {
                    if (query.slug === episode.slug) return episode;
                    if (query.type === "series") return series;
                    return null;
                },
            };
        },
    });

    try {
        const detail = await getPublishedContentDetail(episode.slug);
        assert.equal(detail.series.id, String(series._id));
        assert.equal(
            detail.canonicalPath,
            "/catalogo/juventude-com-proposito/episodios/plano-de-sabado",
        );
    } finally {
        setDbForTests(null);
    }
});

test("series nao podem ser reproduzidas nem avaliadas como episodios", async () => {
    const contentId = new ObjectId();
    const series = {
        _id: contentId,
        title: "Serie",
        type: "series",
        status: "published",
    };
    setDbForTests({
        collection() {
            return {
                async findOne() {
                    return series;
                },
            };
        },
    });

    try {
        await assert.rejects(
            () => getPlayback(String(contentId), String(new ObjectId())),
            (error) => error.statusCode === 409,
        );
    } finally {
        setDbForTests(null);
    }

    const episode = { ...series, type: "episode" };
    setDbForTests({
        collection(name) {
            if (name === "contents") {
                return { async findOne() { return episode; } };
            }
            throw new Error(`Colecao inesperada: ${name}`);
        },
    });
    try {
        await assert.rejects(
            () => getRatingSummary(String(contentId)),
            (error) => error.statusCode === 409,
        );
    } finally {
        setDbForTests(null);
    }
});

test("gate de arranque rejeita episodio publicado orfao", async () => {
    const orphan = {
        _id: new ObjectId(),
        type: "episode",
        status: "published",
        seasonNumber: 1,
        episodeNumber: 1,
    };
    const db = {
        collection(name) {
            if (name !== "contents") throw new Error(`Colecao inesperada: ${name}`);
            return {
                find(query) {
                    return cursor(query.type === "series" ? [] : [orphan]);
                },
            };
        },
    };

    await assert.rejects(
        () => assertCatalogHierarchyReady(db),
        /Catalogo bloqueado/,
    );
});

test("migrador move engagement e progresso de forma idempotente", async () => {
    const seriesId = new ObjectId();
    const episodeId = new ObjectId();
    const userId = new ObjectId();
    const now = new Date("2026-07-11T10:00:00.000Z");
    const older = new Date("2026-07-10T10:00:00.000Z");
    const { db, rows } = migrationDb({
        contents: [
            {
                _id: seriesId,
                type: "series",
                status: "published",
                durationSeconds: 1800,
                media: { playbackUrl: "/legacy.mp4" },
            },
            { _id: episodeId, type: "episode", status: "published" },
        ],
        user_content_lists: [
            {
                _id: new ObjectId(),
                userId,
                contentId: seriesId,
                type: "favorite",
                createdAt: now,
                updatedAt: older,
            },
            {
                _id: new ObjectId(),
                userId,
                contentId: episodeId,
                type: "favorite",
                createdAt: older,
                updatedAt: now,
            },
        ],
        content_ratings: [
            { _id: new ObjectId(), userId, contentId: seriesId, value: 2, updatedAt: older },
            { _id: new ObjectId(), userId, contentId: episodeId, value: 5, updatedAt: now },
        ],
        content_comments: [
            { _id: new ObjectId(), userId, contentId: episodeId, body: "Comentario" },
        ],
        playback_progress: [
            {
                _id: new ObjectId(),
                userId,
                contentId: seriesId,
                currentTimeSeconds: 300,
                durationSeconds: 1800,
                completed: false,
                lastWatchedAt: now,
                updatedAt: now,
            },
        ],
    });
    const mapping = {
        episodes: [
            {
                episodeId: String(episodeId),
                seriesId: String(seriesId),
                seasonNumber: 1,
                episodeNumber: 1,
            },
        ],
        seriesProgress: [
            { seriesId: String(seriesId), episodeId: String(episodeId) },
        ],
    };

    await applySeriesEpisodeMigration(db, mapping);
    await applySeriesEpisodeMigration(db, mapping);

    const episode = rows.contents.find((item) => String(item._id) === String(episodeId));
    const series = rows.contents.find((item) => String(item._id) === String(seriesId));
    assert.equal(String(episode.seriesId), String(seriesId));
    assert.equal(episode.seasonNumber, 1);
    assert.equal("media" in series, false);
    assert.equal(rows.user_content_lists.length, 1);
    assert.equal(rows.user_content_lists[0].createdAt.toISOString(), older.toISOString());
    assert.equal(rows.user_content_lists[0].updatedAt.toISOString(), now.toISOString());
    assert.equal(rows.content_ratings.length, 1);
    assert.equal(rows.content_ratings[0].value, 5);
    assert.equal(String(rows.content_comments[0].contentId), String(seriesId));
    assert.equal(String(rows.playback_progress[0].contentId), String(episodeId));
});
