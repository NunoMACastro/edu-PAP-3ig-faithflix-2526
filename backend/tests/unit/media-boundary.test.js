/**
 * @file Testes unitarios da fronteira entre catalogo publico e playback privado.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { ObjectId } from "mongodb";
import {
    toAdminCatalogContent,
    toPublicCatalogContent,
} from "../../src/modules/catalog/catalog.service.js";
import { toPublicDiscoveryCard } from "../../src/modules/discovery/discovery.service.js";
import {
    assertCatalogPayload,
    assertCatalogUpdatePayload,
} from "../../src/modules/catalog/catalog.validation.js";
import { assertMediaReady } from "../../src/modules/playback/playback.service.js";

const FORBIDDEN_PUBLIC_KEYS = new Set([
    "media",
    "tracks",
    "qualityOptions",
    "playbackUrl",
    "src",
    "source",
    "url",
]);

/**
 * Percorre uma resposta e falha quando encontra uma chave privada de media.
 *
 * @param {unknown} value Valor serializado.
 * @param {string} [path="response"] Caminho usado na mensagem de erro.
 * @returns {void}
 */
function assertNoPrivateMediaKeys(value, path = "response") {
    if (Array.isArray(value)) {
        value.forEach((item, index) =>
            assertNoPrivateMediaKeys(item, `${path}[${index}]`),
        );
        return;
    }

    if (!value || typeof value !== "object") {
        return;
    }

    for (const [key, nested] of Object.entries(value)) {
        assert.equal(
            FORBIDDEN_PUBLIC_KEYS.has(key),
            false,
            `Chave privada ${path}.${key} exposta`,
        );
        assertNoPrivateMediaKeys(nested, `${path}.${key}`);
    }
}

/**
 * Cria um documento editorial com fontes em varios niveis para testar redacao.
 *
 * @returns {Record<string, unknown>} Documento de conteudo completo.
 */
function readyContent() {
    return {
        _id: new ObjectId(),
        title: "Fixture de media",
        slug: "fixture-de-media",
        synopsis: "Conteudo sintetico usado apenas para validar a fronteira API.",
        type: "movie",
        durationSeconds: 60,
        ageRating: 6,
        releaseYear: 2025,
        taxonomyIds: [],
        assets: {
            posterUrl: "/fixtures/poster.svg",
            backdropUrl: "",
            previewUrl: "/public/preview.mp4",
        },
        credits: {
            directors: ["Realizadora Demo"],
            creators: [],
            cast: [{ name: "Atriz Demo", role: "Marta" }],
        },
        mediaStatus: "ready",
        media: {
            url: "/api/media/64f200000000000000000001",
            protocol: "progressive",
            mimeType: "video/mp4",
            quality: "1080p",
        },
        tracks: {
            subtitles: [
                { language: "pt", label: "Portugues", src: "/private/pt.vtt" },
            ],
            audio: [
                {
                    language: "pt",
                    label: "Portugues",
                    url: "/private/audio-url.mp4",
                    source: { url: "/private/audio-source-url.mp4" },
                    metadata: { playbackUrl: "/private/nested.mp4" },
                },
            ],
        },
        qualityOptions: [
            {
                label: "Full HD",
                value: "1080p",
                url: "/private/quality-url.mp4",
                source: { url: "/private/quality-source-url.mp4" },
                variants: [{ src: "/private/variant.mp4" }],
            },
        ],
        status: "published",
        publishedAt: new Date("2026-07-09T00:00:00.000Z"),
    };
}

test("catalogo publico usa allowlist e preserva apenas disponibilidade", () => {
    const content = readyContent();
    const publicContent = toPublicCatalogContent(content);

    assert.equal(publicContent.mediaStatus, "ready");
    assert.equal(publicContent.isPlayable, true);
    assert.equal(publicContent.publishedAt, content.publishedAt);
    assert.equal(publicContent.releaseYear, 2025);
    assert.equal(publicContent.assets.previewUrl, "/public/preview.mp4");
    assert.deepEqual(publicContent.credits.cast, [
        { name: "Atriz Demo", role: "Marta" },
    ]);
    assertNoPrivateMediaKeys(publicContent);
    assert.equal("tracks" in publicContent, false);
    assert.equal("qualityOptions" in publicContent, false);
    for (const privateUrl of [
        "/private/audio-url.mp4",
        "/private/audio-source-url.mp4",
        "/private/quality-url.mp4",
        "/private/quality-source-url.mp4",
    ]) {
        assert.equal(JSON.stringify(publicContent).includes(privateUrl), false);
    }
});

test("discovery reutiliza a disponibilidade canonica sem expor fontes", () => {
    const ready = toPublicDiscoveryCard(readyContent());
    const malformed = toPublicDiscoveryCard({
        ...readyContent(),
        media: { playbackUrl: "javascript:alert(1)" },
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [],
    });

    assert.equal(ready.mediaStatus, "ready");
    assert.equal(ready.isPlayable, true);
    assert.equal(malformed.mediaStatus, "ready");
    assert.equal(malformed.isPlayable, false);
    assertNoPrivateMediaKeys(ready);
    assertNoPrivateMediaKeys(malformed);
});

test("catalogo administrativo preserva as fontes editoriais", () => {
    const content = readyContent();
    const adminContent = toAdminCatalogContent(content);

    assert.equal(
        adminContent.media.url,
        "/api/media/64f200000000000000000001",
    );
    assert.equal(adminContent.tracks.audio[0].url, "/private/audio-url.mp4");
    assert.equal(
        adminContent.tracks.audio[0].source.url,
        "/private/audio-source-url.mp4",
    );
    assert.equal(
        adminContent.qualityOptions[0].source.url,
        "/private/quality-source-url.mp4",
    );
    assert.equal(adminContent.mediaStatus, "ready");
    assert.equal(adminContent.isPlayable, true);
    assert.equal(adminContent.assets.previewUrl, "/public/preview.mp4");
});

test("catalogo normaliza metadados editoriais ausentes em documentos legacy", () => {
    const legacy = readyContent();
    delete legacy.releaseYear;
    delete legacy.credits;
    delete legacy.assets.previewUrl;

    const publicContent = toPublicCatalogContent(legacy);

    assert.equal(publicContent.releaseYear, null);
    assert.equal(publicContent.assets.previewUrl, "");
    assert.deepEqual(publicContent.credits, {
        directors: [],
        creators: [],
        cast: [],
    });
});

test("catalogo só ativa CTA para a mesma fonte canónica aceite pelo playback", () => {
    for (const media of [
        { playbackUrl: "javascript:alert(1)" },
        { playbackUrl: "//media.example.test/video.mp4" },
        {
            playbackUrl: "/private/incoerente.m3u8",
            protocol: "hls",
            mimeType: "video/mp4",
        },
    ]) {
        const content = {
            ...readyContent(),
            media,
            tracks: { subtitles: [], audio: [] },
            qualityOptions: [],
        };
        const publicContent = toPublicCatalogContent(content);

        assert.equal(publicContent.mediaStatus, "ready");
        assert.equal(publicContent.isPlayable, false);
        assert.throws(
            () => assertMediaReady(content),
            (error) =>
                error.statusCode === 409 && error.code === "MEDIA_NOT_READY",
        );
    }
});

test("conteudo sem estado explicito fica pending e playback falha fechado", () => {
    const legacyContent = {
        ...readyContent(),
        mediaStatus: undefined,
    };

    const publicContent = toPublicCatalogContent(legacyContent);

    assert.equal(publicContent.mediaStatus, "pending");
    assert.equal(publicContent.isPlayable, false);
    assert.throws(
        () => assertMediaReady(legacyContent),
        (error) => {
            assert.equal(error.statusCode, 409);
            assert.equal(error.code, "MEDIA_NOT_READY");
            return true;
        },
    );
});

test("criacao editorial força pending vazio e update recusa campos media", () => {
    const base = {
        title: "Conteudo pendente",
        synopsis: "Conteudo ainda sem ficheiro de reproducao disponivel.",
        type: "movie",
        durationSeconds: 120,
        ageRating: 6,
    };
    const pending = assertCatalogPayload({
        ...base,
        mediaStatus: "ready",
        media: { playbackUrl: "/private/injected.mp4" },
        tracks: {
            subtitles: [{ language: "pt", label: "PT", src: "/private.vtt" }],
        },
    });

    assert.equal(pending.mediaStatus, "pending");
    assert.equal(pending.media.playbackUrl, "");
    assert.deepEqual(pending.tracks, { subtitles: [], audio: [] });
    assert.throws(
        () => assertCatalogUpdatePayload({ ...base, media: null }),
        (error) => error.code === "CATALOG_MEDIA_MUTATION_FORBIDDEN",
    );
});
