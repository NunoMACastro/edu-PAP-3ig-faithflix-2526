/**
 * @file Contratos HTTP do playback privado da Fase 4.
 */

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { sessionConfig } from "../../src/config/session.js";
import { hashToken } from "../../src/modules/auth/token.js";
import { startTestServer } from "../helpers/test-server.js";

const userId = new ObjectId("64f100000000000000000071");
const progressiveId = new ObjectId("64f200000000000000000071");
const pendingId = new ObjectId("64f200000000000000000072");
const parentalId = new ObjectId("64f200000000000000000073");
const sessionToken = "7".repeat(64);

let testServer;

/**
 * Compara filtros simples usados por sessão, subscrição e playback.
 *
 * @param {unknown} actual Valor persistido.
 * @param {unknown} expected Condição MongoDB.
 * @returns {boolean} Verdadeiro quando a condição é satisfeita.
 */
function matchesValue(actual, expected) {
    if (expected instanceof ObjectId) {
        return String(actual) === String(expected);
    }

    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
        if ("$gt" in expected) return actual > expected.$gt;
        if ("$ne" in expected) return String(actual) !== String(expected.$ne);
    }

    return actual === expected;
}

/**
 * Aplica um filtro MongoDB raso aos documentos do double.
 *
 * @param {Record<string, unknown>} row Documento candidato.
 * @param {Record<string, unknown>} query Filtro.
 * @returns {boolean} Verdadeiro quando o documento corresponde.
 */
function matches(row, query = {}) {
    return Object.entries(query).every(([key, expected]) =>
        matchesValue(row[key], expected),
    );
}

/**
 * Cria uma coleção de leitura suficiente para o caminho HTTP testado.
 *
 * @param {Record<string, unknown>[]} rows Documentos iniciais.
 * @returns {Record<string, unknown>} Double MongoDB.
 */
function collection(rows = []) {
    return {
        rows,
        async findOne(query = {}) {
            return rows.find((row) => matches(row, query)) ?? null;
        },
        async deleteOne() {
            return { deletedCount: 0 };
        },
    };
}

/**
 * Cria um documento de conteúdo com media sintética local.
 *
 * @param {{ _id: ObjectId, title: string, mediaStatus?: string, ageRating?: number }} input Campos variáveis.
 * @returns {Record<string, unknown>} Conteúdo persistido.
 */
function contentDocument({
    _id,
    title,
    mediaStatus = "ready",
    ageRating = 6,
}) {
    return {
        _id,
        title,
        slug: title.toLowerCase().replace(/\s+/gu, "-"),
        status: "published",
        mediaStatus,
        ageRating,
        durationSeconds: 300,
        media: {
            url: `/api/media/${_id}`,
            protocol: "progressive",
            mimeType: "video/mp4",
            quality: "1080p",
        },
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [],
    };
}

before(async () => {
    const collections = {
        users: collection([
            {
                _id: userId,
                name: "Utilizador Playback",
                email: "playback@example.test",
                role: "user",
                accountStatus: "active",
                parentalMaxAgeRating: 12,
            },
        ]),
        sessions: collection([
            {
                _id: new ObjectId(),
                userId,
                tokenHash: hashToken(sessionToken),
                expiresAt: new Date("2999-01-01T00:00:00.000Z"),
            },
        ]),
        subscriptions: collection([
            {
                _id: new ObjectId(),
                userId,
                status: "active",
                planCode: "faithflix-monthly",
                currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
            },
        ]),
        subscription_plans: collection([
            {
                _id: new ObjectId(),
                code: "faithflix-monthly",
                active: true,
                tier: "pro",
                maxQuality: "1080p",
                familySharing: false,
                maxFamilyMembers: 1,
            },
        ]),
        subscription_family_memberships: collection([]),
        media_preferences: collection([
            {
                _id: new ObjectId(),
                userId,
                values: {
                    subtitleLanguage: "",
                    audioLanguage: "",
                    quality: "1080p",
                },
            },
        ]),
        playback_progress: collection([]),
        contents: collection([
            contentDocument({
                _id: progressiveId,
                title: "Progressive Fixture",
            }),
            contentDocument({
                _id: pendingId,
                title: "Pending Fixture",
                mediaStatus: "pending",
            }),
            contentDocument({
                _id: parentalId,
                title: "Parental Fixture",
                ageRating: 16,
            }),
        ]),
    };

    setDbForTests({
        collection(name) {
            collections[name] ??= collection([]);
            return collections[name];
        },
    });
    testServer = await startTestServer();
});

after(async () => {
    if (testServer) {
        await testServer.close();
    }
    setDbForTests(null);
});

/**
 * Constrói o cookie de sessão usado nos pedidos privados.
 *
 * @returns {Record<string, string>} Headers de autenticação.
 */
function authHeaders() {
    return { cookie: `${sessionConfig.cookieName}=${sessionToken}` };
}

test("GET playback devolve fonte canónica e no-store", async () => {
    const response = await fetch(
        `${testServer.baseUrl}/api/playback/${progressiveId}`,
        { headers: authHeaders() },
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(body.content.source, {
        url: `/api/media/${progressiveId}`,
        protocol: "progressive",
        mimeType: "video/mp4",
    });
    assert.deepEqual(body.content.qualityOptions, []);
});

test("MEDIA_NOT_READY mantém envelope e no-store na resposta 409", async () => {
    const response = await fetch(
        `${testServer.baseUrl}/api/playback/${pendingId}`,
        { headers: authHeaders() },
    );
    const body = await response.json();

    assert.equal(response.status, 409);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(body.code, "MEDIA_NOT_READY");
    assert.equal(typeof body.requestId, "string");
});

test("bloqueio parental mantém no-store e não devolve fonte", async () => {
    const response = await fetch(
        `${testServer.baseUrl}/api/playback/${parentalId}`,
        { headers: authHeaders() },
    );
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.match(body.message, /parental/u);
    assert.equal("source" in body, false);
});
