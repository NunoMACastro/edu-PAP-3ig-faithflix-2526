/** @file Testes do modelo editorial puro. */

import { describe, expect, it } from "vitest";
import {
    catalogFormSnapshot,
    catalogFormToPayload,
    contentToCatalogForm,
    emptyCatalogForm,
} from "./catalogEditorModel.js";

describe("catalogEditorModel", () => {
    it("cria cópias independentes e nunca inclui fontes privadas de media", () => {
        const first = emptyCatalogForm();
        const second = emptyCatalogForm();
        first.assets.posterUrl = "/poster.webp";

        expect(second.assets.posterUrl).toBe("");
        expect(catalogFormToPayload({ ...first, media: { playbackUrl: "/private.mp4" } })).not.toHaveProperty("media");
    });

    it("preserva CAS e campos de episódio no payload", () => {
        const form = contentToCatalogForm({
            id: "content-1",
            version: 4,
            title: "Episódio",
            synopsis: "Uma sinopse suficientemente longa para o contrato.",
            type: "episode",
            seriesId: "series-1",
            seasonNumber: 2,
            episodeNumber: 3,
            durationSeconds: 120,
            ageRating: 6,
            taxonomyIds: [],
            credits: {},
            assets: {},
        });

        expect(catalogFormToPayload(form)).toMatchObject({
            expectedVersion: 4,
            seriesId: "series-1",
            seasonNumber: 2,
            episodeNumber: 3,
        });
        expect(catalogFormSnapshot(form)).toBe(catalogFormSnapshot(form));
    });
});
