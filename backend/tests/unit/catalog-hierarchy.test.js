/**
 * @file Contratos unitários das invariantes partilhadas série -> episódio.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { ObjectId } from "mongodb";
import {
    assertEngageableContent,
    episodeCanonicalPath,
    getEpisodeSeries,
    isPublicCatalogContent,
} from "../../src/modules/catalog/catalog-hierarchy.js";

test("apenas tipos agregáveis surgem autonomamente no catálogo", () => {
    assert.equal(isPublicCatalogContent({ type: "movie" }), true);
    assert.equal(isPublicCatalogContent({ type: "series" }), true);
    assert.equal(isPublicCatalogContent({ type: "documentary" }), true);
    assert.equal(isPublicCatalogContent({ type: "episode" }), false);
    assert.throws(
        () => assertEngageableContent({ type: "episode" }),
        (error) => error.code === "EPISODE_ENGAGEMENT_FORBIDDEN",
    );
});

test("série do episódio é validada por tipo e publicação", async () => {
    const series = {
        _id: new ObjectId(),
        type: "series",
        status: "published",
        title: "Família em Oração",
        slug: "familia-em-oracao",
    };
    const queries = [];
    const db = {
        collection(name) {
            assert.equal(name, "contents");
            return {
                async findOne(query, options) {
                    queries.push({ query, options });
                    return series;
                },
            };
        },
    };

    assert.equal(
        await getEpisodeSeries(db, String(series._id), {
            requirePublished: true,
            session: { test: true },
        }),
        series,
    );
    assert.equal(queries[0].query.status, "published");
    assert.deepEqual(queries[0].options, { session: { test: true } });
    await assert.rejects(
        () => getEpisodeSeries(db, "id-inválido"),
        (error) => error.code === "EPISODE_SERIES_INVALID",
    );
});

test("caminho canónico codifica série e episódio", () => {
    assert.equal(
        episodeCanonicalPath(
            { slug: "serie/com espaço" },
            { slug: "episódio?um" },
        ),
        "/catalogo/serie%2Fcom%20espa%C3%A7o/episodios/epis%C3%B3dio%3Fum",
    );
});
