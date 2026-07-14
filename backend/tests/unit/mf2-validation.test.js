/**
 * @file Ficheiro `real_dev/backend/tests/unit/mf2-validation.test.js` da implementação real_dev.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import {
    getLatestDevPasswordResetToken,
    requestPasswordReset,
} from "../../src/modules/auth/auth.service.js";
import { hashToken } from "../../src/modules/auth/token.js";
import { listDemoMailbox } from "../../src/modules/demo-mailbox/demo-mailbox.service.js";
import {
    assertValidEmail,
    assertValidName,
    assertValidPassword,
} from "../../src/modules/auth/auth.validation.js";
import {
    assertCatalogPayload,
    assertCatalogUpdatePayload,
    assertMediaOptions,
    assertStatus,
    parseCatalogFilters,
    parseAdminCatalogFilters,
    parseAdminCatalogPagination,
    parseCatalogPagination,
    slugify,
} from "../../src/modules/catalog/catalog.validation.js";
import { parseAdminBiblicalPassageFilters } from "../../src/modules/biblical-passages/biblical-passages.validation.js";
import { assertListType } from "../../src/modules/library/library.validation.js";
import { assertProgressPayload } from "../../src/modules/playback/playback.validation.js";
import {
    assertParentalSettings,
    assertProfileUpdate,
    assertRoleUpdate,
} from "../../src/modules/users/user.validation.js";

test("auth validation normaliza email e rejeita password fraca", () => {
    assert.equal(assertValidName(" Aluno Teste "), "Aluno Teste");
    assert.equal(assertValidEmail("ALUNO@EXAMPLE.COM"), "aluno@example.com");
    assert.throws(() => assertValidPassword("curta"), /password/);
});

test("password reset nao revela se o email existe", async () => {
    const createDb = (user) => {
        const insertedTokens = [];

        return {
            insertedTokens,
            /**
             * Documenta `collection`, mantendo explícita a responsabilidade desta função no módulo.
             *
             * @param {unknown} name Valor recebido por `collection`.
             * @returns {unknown} Resultado devolvido por `collection`.
             */
            collection(name) {
                if (name === "users") {
                    return {
                        findOne: async () => user,
                    };
                }

                if (name === "password_reset_tokens") {
                    return {
                        insertOne: async (document) => {
                            insertedTokens.push(document);
                            return { insertedId: "reset-token-id" };
                        },
                    };
                }

                throw new Error(`Colecao inesperada em teste: ${name}`);
            },
        };
    };

    const existingDb = createDb({ _id: "user-id" });
    const missingDb = createDb(null);
    const existingResponse = await requestPasswordReset(
        { email: "aluno@example.com" },
        { db: existingDb },
    );
    const missingResponse = await requestPasswordReset(
        { email: "inexistente@example.com" },
        { db: missingDb },
    );

    assert.deepEqual(existingResponse, missingResponse);
    assert.deepEqual(Object.keys(existingResponse), ["message"]);
    assert.equal(existingDb.insertedTokens.length, 1);
    assert.equal(missingDb.insertedTokens.length, 1);
    assert.equal(existingDb.insertedTokens[0].dummy, false);
    assert.equal(missingDb.insertedTokens[0].dummy, true);
    assert.equal("userId" in missingDb.insertedTokens[0], false);
});

test("password reset expoe token apenas no canal dev-only separado", async () => {
    const previousFlag = process.env.ENABLE_DEV_RESET_TOKEN_OUTBOX;
    const previousNodeEnv = process.env.NODE_ENV;
    const insertedTokens = [];
    const devOutbox = [];

    process.env.ENABLE_DEV_RESET_TOKEN_OUTBOX = "true";
    process.env.NODE_ENV = "development";

    /**
     * Cria o cursor mínimo usado pela caixa demo, sem simular operações MongoDB
     * que não participam nesta jornada.
     *
     * @param {object[]} rows Registos já limitados ao cenário.
     * @returns {{ sort: () => object, limit: () => object, toArray: () => Promise<object[]> }} Cursor encadeável.
     */
    function mailboxCursor(rows) {
        return {
            sort() {
                return this;
            },
            limit() {
                return this;
            },
            async toArray() {
                return [...rows];
            },
        };
    }

    const db = {
        databaseName: "faithflix_demo",
        /**
         * Documenta `collection`, mantendo explícita a responsabilidade desta função no módulo.
         *
         * @param {unknown} name Valor recebido por `collection`.
         * @returns {unknown} Resultado devolvido por `collection`.
         */
        collection(name) {
            if (name === "users") {
                return {
                    findOne: async () => ({ _id: "user-id" }),
                };
            }

            if (name === "password_reset_tokens") {
                return {
                    insertOne: async (document) => {
                        insertedTokens.push(document);
                        return { insertedId: "reset-token-id" };
                    },
                };
            }

            if (name === "password_reset_dev_outbox") {
                return {
                    insertOne: async (document) => {
                        devOutbox.push(document);
                        return { insertedId: "dev-reset-token-id" };
                    },
                    findOne: async () => devOutbox.at(-1),
                    find: () => mailboxCursor(devOutbox),
                };
            }

            if (name === "demo_email_outbox") {
                return {
                    find: () => mailboxCursor([]),
                };
            }

            throw new Error(`Colecao inesperada em teste: ${name}`);
        },
    };

    try {
        const publicResponse = await requestPasswordReset(
            { email: "aluno@example.com" },
            { db },
        );
        const devResponse = await getLatestDevPasswordResetToken(
            "aluno@example.com",
            { db },
        );
        const mailbox = await listDemoMailbox(
            { email: "aluno@example.com" },
            {
                db,
                source: {
                    NODE_ENV: "development",
                    DEMO_MODE: "true",
                    ENABLE_DEMO_MAILBOX: "true",
                    MONGODB_DB_NAME: "faithflix_demo",
                },
                remoteAddress: "127.0.0.1",
            },
        );

        assert.deepEqual(Object.keys(publicResponse), ["message"]);
        assert.equal(insertedTokens.length, 1);
        assert.equal(devOutbox.length, 1);
        assert.equal(typeof devOutbox[0].resetToken, "string");
        assert.equal(devResponse.resetToken, devOutbox[0].resetToken);
        assert.equal(mailbox.messages.length, 1);
        assert.equal(mailbox.messages[0].resetToken, devResponse.resetToken);
        assert.equal(
            hashToken(mailbox.messages[0].resetToken),
            insertedTokens[0].tokenHash,
        );
    } finally {
        if (previousFlag === undefined) {
            delete process.env.ENABLE_DEV_RESET_TOKEN_OUTBOX;
        } else {
            process.env.ENABLE_DEV_RESET_TOKEN_OUTBOX = previousFlag;
        }

        if (previousNodeEnv === undefined) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = previousNodeEnv;
        }
    }
});

test("catalog validation separa campos editoriais de media", () => {
    const payload = assertCatalogPayload({
        title: "Piloto FaithFlix",
        synopsis: "Conteudo curto usado para validar o catalogo FaithFlix.",
        type: "movie",
        durationSeconds: 120,
        ageRating: 6,
        releaseYear: 2025,
        assets: {
            previewUrl: "/media/previews/piloto.mp4",
        },
        credits: {
            directors: ["Realizadora Demo"],
            creators: ["Criador Demo"],
            cast: [{ name: "Atriz Demo", role: "Marta" }],
        },
        media: { playbackUrl: "/media/piloto.mp4" },
        tracks: {
            subtitles: [
                {
                    language: "pt",
                    label: "Portugues",
                    src: "/tracks/piloto-pt.vtt",
                },
            ],
        },
        qualityOptions: [
            {
                label: "720p",
                value: "720p",
                playbackUrl: "/media/piloto.mp4",
            },
        ],
    });

    assert.equal(slugify("Piloto FaithFlix"), "piloto-faithflix");
    assert.equal(payload.slug, "piloto-faithflix");
    assert.equal(payload.mediaStatus, "pending");
    assert.equal(payload.media.playbackUrl, "");
    assert.deepEqual(payload.tracks, { subtitles: [], audio: [] });
    assert.deepEqual(payload.qualityOptions, []);
    assert.equal(payload.releaseYear, 2025);
    assert.equal(payload.assets.previewUrl, "/media/previews/piloto.mp4");
    assert.deepEqual(payload.credits.cast, [
        { name: "Atriz Demo", role: "Marta" },
    ]);
    assert.equal(assertStatus("published"), "published");
    assert.equal(assertMediaOptions({}).qualityOptions.length, 0);
    assert.deepEqual(parseCatalogPagination({ page: "2", limit: "12" }), {
        page: 2,
        limit: 12,
    });
    assert.deepEqual(parseCatalogFilters({ type: "movie" }), {
        type: "movie",
    });
    assert.deepEqual(parseCatalogFilters({}), { type: null });
    assert.deepEqual(parseAdminCatalogPagination({ page: "2", limit: "50" }), {
        page: 2,
        limit: 50,
    });
    assert.deepEqual(
        parseAdminCatalogFilters({ search: "  Esperança  ", status: "draft", type: "movie", mediaStatus: "failed" }),
        { search: "Esperança", status: "draft", type: "movie", mediaStatus: "failed" },
    );
    assert.deepEqual(
        parseAdminBiblicalPassageFilters({ search: " João ", status: "published" }),
        { search: "João", status: "published" },
    );
    assert.throws(() => assertStatus("publicado"), /Estado/);
    assert.throws(() => parseCatalogPagination({ limit: "100" }), /Limite/);
    assert.throws(
        () => parseAdminCatalogPagination({ limit: "51" }),
        /Limite/,
    );
    assert.throws(() => parseCatalogFilters({ type: "invalid" }), /Tipo/);
    assert.throws(() => parseAdminCatalogFilters({ mediaStatus: "javascript" }), /media/u);
    assert.throws(() => parseAdminBiblicalPassageFilters({ search: "x".repeat(81) }), /pesquisa/u);
    assert.throws(
        () => assertCatalogPayload({
            title: "Preview inseguro",
            synopsis: "Conteúdo editorial com uma URL promocional insegura.",
            type: "movie",
            durationSeconds: 120,
            ageRating: 6,
            assets: { previewUrl: "javascript:alert(1)" },
        }),
        /previewUrl/u,
    );
    assert.throws(
        () => assertCatalogPayload({
            title: "Elenco excessivo",
            synopsis: "Conteúdo editorial com demasiados elementos no elenco.",
            type: "movie",
            durationSeconds: 120,
            ageRating: 6,
            credits: {
                cast: Array.from({ length: 21 }, (_, index) => ({
                    name: `Pessoa ${index}`,
                    role: "Participação",
                })),
            },
        }),
        /Elenco/u,
    );
    assert.throws(
        () =>
            assertCatalogUpdatePayload({
                title: "Sem media pronta",
                synopsis: "Conteudo que ainda nao tem uma fonte pronta para playback.",
                type: "movie",
                durationSeconds: 120,
                ageRating: 6,
                mediaStatus: "ready",
            }),
        (error) =>
            error.statusCode === 400 &&
            error.code === "CATALOG_MEDIA_MUTATION_FORBIDDEN" &&
            error.details.field === "mediaStatus",
    );
});

test("playback progress limita tempo e marca conteudo completo", () => {
    const progress = assertProgressPayload({ currentTimeSeconds: 119 }, 120);

    assert.equal(progress.currentTimeSeconds, 119);
    assert.equal(progress.completed, true);
    assert.throws(
        () => assertProgressPayload({ currentTimeSeconds: -1 }, 120),
        /Progresso/,
    );
});

test("episodio exige hierarquia positiva e filtro publico recusa episodios", () => {
    const seriesId = "64f200000000000000000099";
    const episode = assertCatalogPayload({
        title: "Primeiro episódio",
        synopsis: "Um episódio válido associado explicitamente à sua série.",
        type: "episode",
        durationSeconds: 1_200,
        ageRating: 6,
        seriesId,
        seasonNumber: 1,
        episodeNumber: 1,
    });

    assert.equal(String(episode.seriesId), seriesId);
    assert.equal(episode.seasonNumber, 1);
    assert.equal(episode.episodeNumber, 1);
    assert.throws(
        () => assertCatalogPayload({
            ...episode,
            seriesId,
            seasonNumber: 0,
        }),
        /seasonNumber/u,
    );
    assert.throws(
        () => parseCatalogFilters({ type: "episode" }),
        /Tipo/u,
    );
});

test("users e library validam roles, parental e tipos de lista", () => {
    assert.deepEqual(assertProfileUpdate({ name: "Nuno" }), { name: "Nuno" });
    assert.deepEqual(assertRoleUpdate({ role: "moderator" }), {
        role: "moderator",
    });
    assert.deepEqual(assertParentalSettings({ parentalMaxAgeRating: 12 }), {
        parentalMaxAgeRating: 12,
    });
    assert.equal(assertListType("favorite"), "favorite");
    assert.throws(() => assertRoleUpdate({ role: "owner" }), /Role/);
    assert.throws(
        () =>
            assertRoleUpdate({
                role: "moderator",
                accountStatus: "blocked",
            }),
        /Atualização de role inválida/u,
    );
    assert.throws(
        () => assertRoleUpdate({ accountStatus: "blocked" }),
        /Atualização de role inválida/u,
    );
    assert.throws(() => assertListType("favourite"), /lista/);
});

test("seed E2E limita cleanup sem marcador a identidades reservadas", async () => {
    const seedSource = await readFile(
        new URL("../../scripts/seed-mf2-e2e.js", import.meta.url),
        "utf8",
    );

    assert.doesNotMatch(seedSource, /deleteMany\(\{\s*\$or:/);
    assert.doesNotMatch(seedSource, /deleteMany\(\{\s*slug:/);
    assert.match(seedSource, /cleanupMarkedFixtureCollections/u);
    assert.match(seedSource, /MF2_REGISTER_EMAIL/u);
    assert.match(seedSource, /email:\s*MF2_REGISTER_EMAIL/u);
    assert.match(seedSource, /userId:\s*registeredUser\._id/u);
    assert.doesNotMatch(seedSource, /collection\("users"\)\.deleteMany/u);
    assert.match(seedSource, /runE2eSeedCli/u);
});
