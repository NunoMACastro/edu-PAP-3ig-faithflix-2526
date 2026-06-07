import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { requestPasswordReset } from "../../src/modules/auth/auth.service.js";
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
