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
import {
    assertValidEmail,
    assertValidName,
    assertValidPassword,
} from "../../src/modules/auth/auth.validation.js";
import {
    assertCatalogPayload,
    assertMediaOptions,
    assertStatus,
    slugify,
} from "../../src/modules/catalog/catalog.validation.js";
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
    assert.equal(missingDb.insertedTokens.length, 0);
});

test("password reset expoe token apenas no canal dev-only separado", async () => {
    const previousFlag = process.env.ENABLE_DEV_RESET_TOKEN_OUTBOX;
    const previousNodeEnv = process.env.NODE_ENV;
    const insertedTokens = [];
    const devOutbox = [];

    process.env.ENABLE_DEV_RESET_TOKEN_OUTBOX = "true";
    process.env.NODE_ENV = "development";

    const db = {
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

        assert.deepEqual(Object.keys(publicResponse), ["message"]);
        assert.equal(insertedTokens.length, 1);
        assert.equal(devOutbox.length, 1);
        assert.equal(typeof devOutbox[0].resetToken, "string");
        assert.equal(devResponse.resetToken, devOutbox[0].resetToken);
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

test("catalog validation fecha tipos, estados e media", () => {
    const payload = assertCatalogPayload({
        title: "Piloto FaithFlix",
        synopsis: "Conteudo curto usado para validar o catalogo FaithFlix.",
        type: "movie",
        durationSeconds: 120,
        ageRating: 6,
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
    assert.equal(assertStatus("published"), "published");
    assert.equal(assertMediaOptions({}).qualityOptions.length, 0);
    assert.throws(() => assertStatus("publicado"), /Estado/);
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
    assert.throws(() => assertListType("favourite"), /lista/);
});

test("seed E2E nao limpa conteudo por slug sem fixture", async () => {
    const seedSource = await readFile(
        new URL("../../scripts/seed-mf2-e2e.js", import.meta.url),
        "utf8",
    );

    assert.doesNotMatch(seedSource, /deleteMany\(\{\s*\$or:/);
    assert.doesNotMatch(seedSource, /deleteMany\(\{\s*slug:/);
    assert.match(seedSource, /deleteMany\(\{\s*e2eFixture:\s*E2E_TAG\s*\}\)/);
    assert.match(seedSource, /Seed E2E abortada para preservar dados locais/);
});
