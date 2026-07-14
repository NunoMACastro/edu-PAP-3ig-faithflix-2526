/**
 * @file Aceitação HTTP da ingestão e entrega privada de media local.
 *
 * A suite usa a aplicação Express real, uma base em memória e ficheiros numa
 * raiz temporária. Não consulta MongoDB nem reutiliza media pública do frontend.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { ObjectId } from "mongodb";

const contentId = new ObjectId("64f200000000000000000081");
const qualityContentId = new ObjectId("64f200000000000000000082");
const assetId = new ObjectId("64f300000000000000000081");
const qualityAssetId = new ObjectId("64f300000000000000000082");
const invalidUploadId = new ObjectId("64f300000000000000000083");
const interruptedUploadId = new ObjectId("64f300000000000000000084");
const tamperedUploadId = new ObjectId("64f300000000000000000085");
const variantUploadId = new ObjectId("64f300000000000000000086");

const allowedUserId = new ObjectId("64f100000000000000000081");
const noSubscriptionUserId = new ObjectId("64f100000000000000000082");
const parentalUserId = new ObjectId("64f100000000000000000083");
const qualityUserId = new ObjectId("64f100000000000000000084");
const adminUserId = new ObjectId("64f100000000000000000085");

const sessionTokens = Object.freeze({
    allowed: "a".repeat(64),
    noSubscription: "b".repeat(64),
    parental: "c".repeat(64),
    quality: "d".repeat(64),
    admin: "e".repeat(64),
});

const storageKeys = Object.freeze({
    allowed: `${"1".repeat(64)}.mp4`,
    quality: `${"2".repeat(64)}.mp4`,
    invalid: `${"3".repeat(64)}.mp4`,
    interrupted: `${"4".repeat(64)}.mp4`,
    tampered: `${"5".repeat(64)}.mp4`,
    variant: `${"6".repeat(64)}.mp4`,
});

const mediaBytes = Buffer.from(
    "FaithFlix-private-progressive-media-fixture",
    "utf8",
);
const qualityMediaBytes = Buffer.from(
    "FaithFlix-private-quality-fixture",
    "utf8",
);
const invalidMediaBytes = Buffer.from("not-an-mp4", "utf8");
const expectedTamperedBytes = Buffer.from("original-same-size", "utf8");
const actualTamperedBytes = Buffer.from("tampered-same-size", "utf8");
const variantMediaBytes = Buffer.from("FaithFlix-private-4k-fixture", "utf8");

let storageRoot;
let server;
let baseUrl;
let sessionConfig;
let setDbForTests;
let catalogMediaRouter;
let collections;
let adminCsrfToken = "";

/**
 * Compara ids, datas e escalares sem depender da identidade do ObjectId.
 *
 * @param {unknown} left Valor persistido.
 * @param {unknown} right Valor do filtro.
 * @returns {boolean} Verdadeiro quando representam o mesmo valor.
 */
function sameValue(left, right) {
    if (left instanceof ObjectId || right instanceof ObjectId) {
        return String(left) === String(right);
    }
    if (left instanceof Date || right instanceof Date) {
        return new Date(left).getTime() === new Date(right).getTime();
    }
    return left === right;
}

/**
 * Resolve uma condição MongoDB curta usada pelos serviços exercitados.
 *
 * @param {unknown} actual Valor do documento.
 * @param {unknown} expected Condição do filtro.
 * @returns {boolean} Resultado da condição.
 */
function matchesCondition(actual, expected) {
    if (
        !expected ||
        typeof expected !== "object" ||
        expected instanceof ObjectId ||
        expected instanceof Date ||
        Array.isArray(expected)
    ) {
        return sameValue(actual, expected);
    }

    return Object.entries(expected).every(([operator, operand]) => {
        if (operator === "$gt") return actual > operand;
        if (operator === "$ne") return !sameValue(actual, operand);
        if (operator === "$in") {
            return Array.isArray(operand) &&
                operand.some((candidate) => sameValue(actual, candidate));
        }
        if (operator === "$exists") {
            return operand ? actual !== undefined : actual === undefined;
        }
        return sameValue(actual?.[operator], operand);
    });
}

/**
 * Aplica filtros com `$or` ao subset MongoDB necessário à aceitação.
 *
 * @param {Record<string, unknown>} row Documento candidato.
 * @param {Record<string, unknown>} query Filtro MongoDB.
 * @returns {boolean} Verdadeiro quando o documento corresponde.
 */
function matches(row, query = {}) {
    return Object.entries(query).every(([field, expected]) => {
        if (field === "$or") {
            return expected.some((condition) => matches(row, condition));
        }
        return matchesCondition(row[field], expected);
    });
}

/**
 * Aplica operadores de update usados por sessão e media_assets.
 *
 * @param {Record<string, unknown>} row Documento mutável.
 * @param {Record<string, unknown>} update Update MongoDB.
 * @returns {void}
 */
function applyUpdate(row, update) {
    Object.assign(row, update.$set ?? {});
    for (const field of Object.keys(update.$unset ?? {})) {
        delete row[field];
    }
    for (const [field, amount] of Object.entries(update.$inc ?? {})) {
        row[field] = Number(row[field] ?? 0) + Number(amount);
    }
    for (const [field, push] of Object.entries(update.$push ?? {})) {
        const additions = Array.isArray(push?.$each) ? push.$each : [push];
        let values = [...(Array.isArray(row[field]) ? row[field] : []), ...additions];
        if (Number.isInteger(push?.$slice)) {
            values = push.$slice < 0
                ? values.slice(push.$slice)
                : values.slice(0, push.$slice);
        }
        row[field] = values;
    }
}

/**
 * Cria um cursor chainable com paginação e ordenação em memória.
 *
 * @param {Record<string, unknown>[]} source Linhas filtradas.
 * @returns {Record<string, Function>} Cursor mínimo.
 */
function cursor(source) {
    let rows = [...source];
    let offset = 0;
    let maximum = Number.POSITIVE_INFINITY;

    const api = {
        sort(spec = {}) {
            const entries = Object.entries(spec);
            rows.sort((left, right) => {
                for (const [field, direction] of entries) {
                    const leftValue = left[field] instanceof Date
                        ? left[field].getTime()
                        : String(left[field] ?? "");
                    const rightValue = right[field] instanceof Date
                        ? right[field].getTime()
                        : String(right[field] ?? "");
                    if (leftValue < rightValue) return -1 * direction;
                    if (leftValue > rightValue) return 1 * direction;
                }
                return 0;
            });
            return api;
        },
        skip(value) {
            offset = value;
            return api;
        },
        limit(value) {
            maximum = value;
            return api;
        },
        async toArray() {
            return rows.slice(offset, offset + maximum);
        },
    };
    return api;
}

/**
 * Cria uma coleção mutável suficiente para sessões, catálogo e media.
 *
 * @param {Record<string, unknown>[]} rows Documentos iniciais.
 * @returns {Record<string, Function | Record<string, unknown>[]>} Double MongoDB.
 */
function collection(rows = []) {
    return {
        rows,
        async findOne(query = {}) {
            return rows.find((row) => matches(row, query)) ?? null;
        },
        find(query = {}) {
            return cursor(rows.filter((row) => matches(row, query)));
        },
        async countDocuments(query = {}) {
            return rows.filter((row) => matches(row, query)).length;
        },
        async updateOne(query, update) {
            const row = rows.find((candidate) => matches(candidate, query));
            if (!row) return { matchedCount: 0, modifiedCount: 0 };
            applyUpdate(row, update);
            return { matchedCount: 1, modifiedCount: 1 };
        },
        async updateMany(query, update) {
            const matched = rows.filter((candidate) => matches(candidate, query));
            matched.forEach((row) => applyUpdate(row, update));
            return {
                matchedCount: matched.length,
                modifiedCount: matched.length,
            };
        },
        async findOneAndUpdate(query, update, options = {}) {
            const row = rows.find((candidate) => matches(candidate, query));
            if (!row) return null;
            const before = { ...row };
            applyUpdate(row, update);
            return options.returnDocument === "before" ? before : row;
        },
        async deleteOne(query) {
            const index = rows.findIndex((row) => matches(row, query));
            if (index < 0) return { deletedCount: 0 };
            rows.splice(index, 1);
            return { deletedCount: 1 };
        },
        async insertOne(document) {
            const insertedId = document._id ?? new ObjectId();
            rows.push({ ...document, _id: insertedId });
            return { insertedId };
        },
        async createIndex() {
            return "test-index";
        },
    };
}

/**
 * Cria conteúdo publicado cuja única fonte é o endpoint opaco do backend.
 *
 * @param {{ _id: ObjectId, assetId: ObjectId, title: string, quality: string, ageRating?: number }} input Campos variáveis.
 * @returns {Record<string, unknown>} Documento editorial completo.
 */
function contentDocument({
    _id,
    assetId: sourceAssetId,
    title,
    quality,
    ageRating = 12,
}) {
    return {
        _id,
        version: 3,
        title,
        slug: title.toLowerCase().replaceAll(" ", "-"),
        synopsis: "Conteúdo sintético de integração com media privada local.",
        type: "movie",
        durationSeconds: 300,
        ageRating,
        releaseYear: 2026,
        taxonomyIds: [],
        assets: { posterUrl: "", backdropUrl: "", previewUrl: "" },
        credits: { directors: [], creators: [], cast: [] },
        status: "published",
        publishedAt: new Date("2026-07-01T00:00:00.000Z"),
        mediaStatus: "ready",
        media: {
            url: `/api/media/${sourceAssetId}`,
            protocol: "progressive",
            mimeType: "video/mp4",
            quality,
        },
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [],
        createdAt: new Date("2026-07-01T00:00:00.000Z"),
        updatedAt: new Date("2026-07-01T00:00:00.000Z"),
    };
}

/**
 * Constrói utilizador ativo para os cenários de autorização.
 *
 * @param {ObjectId} _id Id.
 * @param {string} role Role da sessão.
 * @param {number} parentalMaxAgeRating Limite parental.
 * @returns {Record<string, unknown>} Utilizador persistido.
 */
function userDocument(_id, role = "user", parentalMaxAgeRating = 18) {
    return {
        _id,
        name: `Utilizador ${String(_id).slice(-4)}`,
        email: `${String(_id)}@example.test`,
        role,
        accountStatus: "active",
        parentalMaxAgeRating,
    };
}

/**
 * Constrói cookie autenticado para um token de teste.
 *
 * @param {string} token Token opaco.
 * @returns {Record<string, string>} Headers de sessão.
 */
function authHeaders(token) {
    return { Cookie: `${sessionConfig.cookieName}=${token}` };
}

/**
 * Confirma headers privados comuns, incluindo a variação por Cookie.
 *
 * @param {Response} response Resposta HTTP.
 * @returns {void}
 */
function assertPrivateResponse(response) {
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    const vary = (response.headers.get("vary") ?? "")
        .split(",")
        .map((value) => value.trim().toLowerCase());
    assert.ok(vary.includes("cookie"));
}

/**
 * Espera por uma mutação assíncrona curta do servidor sem sleeps bloqueantes.
 *
 * @param {() => boolean} predicate Condição observável.
 * @param {number} [timeoutMs=2000] Limite total.
 * @returns {Promise<void>} Termina quando a condição é verdadeira.
 */
async function waitFor(predicate, timeoutMs = 2_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 20));
    }
    assert.fail("A condição HTTP assíncrona não ficou pronta dentro do limite.");
}

/**
 * Obtém uma vez o token CSRF ligado à sessão administrativa.
 *
 * @returns {Promise<string>} Token opaco reutilizável pela suite curta.
 */
async function getAdminCsrfToken() {
    if (adminCsrfToken) return adminCsrfToken;

    const csrfResponse = await fetch(`${baseUrl}/api/session/csrf-token`, {
        headers: authHeaders(sessionTokens.admin),
    });
    const csrfBody = await csrfResponse.json();
    assert.equal(csrfResponse.status, 200);
    adminCsrfToken = csrfBody.csrfToken;
    return adminCsrfToken;
}

before(async () => {
    storageRoot = await mkdtemp(join(tmpdir(), "faithflix-media-http-"));
    process.env.MEDIA_STORAGE_ROOT = storageRoot;

    const databaseModule = await import("../../src/config/database.js");
    const sessionModule = await import("../../src/config/session.js");
    const tokenModule = await import("../../src/modules/auth/token.js");
    const routesModule = await import("../../src/modules/media/media.routes.js");
    const { createApp } = await import("../../src/app.js");

    setDbForTests = databaseModule.setDbForTests;
    sessionConfig = sessionModule.sessionConfig;
    catalogMediaRouter = routesModule.catalogMediaRouter;

    const users = [
        userDocument(allowedUserId),
        userDocument(noSubscriptionUserId),
        userDocument(parentalUserId, "user", 6),
        userDocument(qualityUserId),
        userDocument(adminUserId, "admin"),
    ];
    const tokenUsers = [
        [sessionTokens.allowed, allowedUserId],
        [sessionTokens.noSubscription, noSubscriptionUserId],
        [sessionTokens.parental, parentalUserId],
        [sessionTokens.quality, qualityUserId],
        [sessionTokens.admin, adminUserId],
    ];
    const sessions = tokenUsers.map(([token, userId]) => ({
        _id: new ObjectId(),
        userId,
        tokenHash: tokenModule.hashToken(token),
        expiresAt: new Date("2999-01-01T00:00:00.000Z"),
    }));
    const plan = {
        _id: new ObjectId(),
        code: "faithflix-monthly",
        active: true,
        tier: "pro",
        maxQuality: "1080p",
        familySharing: false,
        maxFamilyMembers: 1,
    };
    const subscriptions = [allowedUserId, parentalUserId, qualityUserId].map(
        (userId) => ({
            _id: new ObjectId(),
            userId,
            status: "active",
            planCode: plan.code,
            currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
        }),
    );
    const contents = [
        contentDocument({
            _id: contentId,
            assetId,
            title: "Media Privada",
            quality: "1080p",
        }),
        contentDocument({
            _id: qualityContentId,
            assetId: qualityAssetId,
            title: "Media Qualidade Alta",
            quality: "2160p",
            ageRating: 6,
        }),
    ];
    const now = new Date("2026-07-11T12:00:00.000Z");
    const assets = [
        {
            _id: assetId,
            contentId,
            storageKey: storageKeys.allowed,
            quality: "1080p",
            mimeType: "video/mp4",
            sizeBytes: mediaBytes.length,
            sha256: createHash("sha256").update(mediaBytes).digest("hex"),
            status: "ready",
            active: true,
            createdAt: now,
            updatedAt: now,
            uploadedAt: now,
            activatedAt: now,
        },
        {
            _id: qualityAssetId,
            contentId: qualityContentId,
            storageKey: storageKeys.quality,
            quality: "2160p",
            mimeType: "video/mp4",
            sizeBytes: qualityMediaBytes.length,
            sha256: createHash("sha256")
                .update(qualityMediaBytes)
                .digest("hex"),
            status: "ready",
            active: true,
            createdAt: now,
            updatedAt: now,
            uploadedAt: now,
            activatedAt: now,
        },
        {
            _id: invalidUploadId,
            contentId,
            storageKey: storageKeys.invalid,
            quality: "1080p",
            mimeType: "video/mp4",
            expectedSizeBytes: invalidMediaBytes.length,
            expectedSha256: null,
            sizeBytes: null,
            sha256: null,
            status: "pending",
            active: false,
            createdBy: adminUserId,
            createdAt: now,
            updatedAt: now,
        },
        {
            _id: interruptedUploadId,
            contentId,
            storageKey: storageKeys.interrupted,
            quality: "1080p",
            mimeType: "video/mp4",
            expectedSizeBytes: null,
            expectedSha256: null,
            sizeBytes: null,
            sha256: null,
            status: "pending",
            active: false,
            createdBy: adminUserId,
            createdAt: now,
            updatedAt: now,
        },
        {
            _id: tamperedUploadId,
            contentId,
            storageKey: storageKeys.tampered,
            quality: "1080p",
            mimeType: "video/mp4",
            expectedSizeBytes: expectedTamperedBytes.length,
            expectedSha256: null,
            sizeBytes: expectedTamperedBytes.length,
            sha256: createHash("sha256")
                .update(expectedTamperedBytes)
                .digest("hex"),
            status: "uploaded",
            active: false,
            createdBy: adminUserId,
            createdAt: now,
            updatedAt: now,
            uploadedAt: now,
        },
        {
            _id: variantUploadId,
            contentId,
            storageKey: storageKeys.variant,
            quality: "2160p",
            mimeType: "video/mp4",
            expectedSizeBytes: variantMediaBytes.length,
            expectedSha256: createHash("sha256")
                .update(variantMediaBytes)
                .digest("hex"),
            sizeBytes: variantMediaBytes.length,
            sha256: createHash("sha256")
                .update(variantMediaBytes)
                .digest("hex"),
            status: "uploaded",
            active: false,
            createdBy: adminUserId,
            createdAt: now,
            updatedAt: now,
            uploadedAt: now,
        },
    ];

    collections = {
        users: collection(users),
        sessions: collection(sessions),
        subscriptions: collection(subscriptions),
        subscription_plans: collection([plan]),
        subscription_family_memberships: collection([]),
        contents: collection(contents),
        media_assets: collection(assets),
    };
    setDbForTests({
        collection(name) {
            collections[name] ??= collection([]);
            return collections[name];
        },
    });

    await writeFile(join(storageRoot, storageKeys.allowed), mediaBytes, {
        mode: 0o600,
    });
    await writeFile(join(storageRoot, storageKeys.quality), qualityMediaBytes, {
        mode: 0o600,
    });
    assert.equal(actualTamperedBytes.length, expectedTamperedBytes.length);
    await writeFile(
        join(storageRoot, storageKeys.tampered),
        actualTamperedBytes,
        { mode: 0o600 },
    );
    await writeFile(join(storageRoot, storageKeys.variant), variantMediaBytes, {
        mode: 0o600,
    });

    const app = createApp();
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });
    const address = server.address();
    assert.ok(address && typeof address === "object");
    baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
    if (server) {
        server.closeIdleConnections?.();
        server.closeAllConnections?.();
        await new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
    }
    setDbForTests?.(null);
    if (storageRoot) {
        await rm(storageRoot, { recursive: true, force: true });
    }
    delete process.env.MEDIA_STORAGE_ROOT;
});

test("router administrativo aplica role por rota e não bloqueia catálogo público", async () => {
    assert.equal(
        catalogMediaRouter.stack.some((layer) => !layer.route),
        false,
        "catalogMediaRouter não deve ter middleware de role global",
    );
    assert.deepEqual(
        catalogMediaRouter.stack.map((layer) => layer.route.path),
        [
            "/:contentId/media-uploads",
            "/:contentId/media-uploads/:uploadId",
            "/:contentId/media-uploads/:uploadId/activate",
            "/:contentId/media-uploads/:uploadId",
            "/:contentId/media-assets",
        ],
    );

    const response = await fetch(`${baseUrl}/api/catalog?limit=12`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.ok(body.items.some((item) => item.id === String(contentId)));
    assert.equal(JSON.stringify(body).includes(storageKeys.allowed), false);
    assert.equal(JSON.stringify(body).includes(storageRoot), false);
});

test("GET anónimo devolve 401 privado e varia por Cookie", async () => {
    const response = await fetch(`${baseUrl}/api/media/${assetId}`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.code, "AUTH_REQUIRED");
    assertPrivateResponse(response);
    assert.equal(JSON.stringify(body).includes(storageKeys.allowed), false);
});

test("GET sem subscrição devolve SUBSCRIPTION_REQUIRED sem abrir storage", async () => {
    const response = await fetch(`${baseUrl}/api/media/${assetId}`, {
        headers: authHeaders(sessionTokens.noSubscription),
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.code, "SUBSCRIPTION_REQUIRED");
    assertPrivateResponse(response);
});

test("GET revalida bloqueio parental antes de entregar bytes", async () => {
    const response = await fetch(`${baseUrl}/api/media/${assetId}`, {
        headers: authHeaders(sessionTokens.parental),
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.code, "PARENTAL_CONTROL_BLOCKED");
    assertPrivateResponse(response);
});

test("GET recusa qualidade acima do entitlement Pro", async () => {
    const response = await fetch(`${baseUrl}/api/media/${qualityAssetId}`, {
        headers: authHeaders(sessionTokens.quality),
    });
    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.code, "MEDIA_QUALITY_FORBIDDEN");
    assertPrivateResponse(response);
});

test("GET completo entrega MP4 privado com headers defensivos", async () => {
    const response = await fetch(`${baseUrl}/api/media/${assetId}`, {
        headers: authHeaders(sessionTokens.allowed),
    });
    const body = Buffer.from(await response.arrayBuffer());

    assert.equal(response.status, 200);
    assert.deepEqual(body, mediaBytes);
    assert.equal(response.headers.get("content-type"), "video/mp4");
    assert.equal(response.headers.get("content-length"), String(mediaBytes.length));
    assert.equal(response.headers.get("accept-ranges"), "bytes");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assertPrivateResponse(response);
});

test("HEAD valida acesso e devolve metadata sem corpo", async () => {
    const response = await fetch(`${baseUrl}/api/media/${assetId}`, {
        method: "HEAD",
        headers: authHeaders(sessionTokens.allowed),
    });
    const body = await response.arrayBuffer();

    assert.equal(response.status, 200);
    assert.equal(body.byteLength, 0);
    assert.equal(response.headers.get("content-length"), String(mediaBytes.length));
    assert.equal(response.headers.get("accept-ranges"), "bytes");
    assertPrivateResponse(response);
});

test("Range válido devolve 206, bytes exatos e Content-Range", async () => {
    const response = await fetch(`${baseUrl}/api/media/${assetId}`, {
        headers: {
            ...authHeaders(sessionTokens.allowed),
            Range: "bytes=5-12",
        },
    });
    const body = Buffer.from(await response.arrayBuffer());

    assert.equal(response.status, 206);
    assert.deepEqual(body, mediaBytes.subarray(5, 13));
    assert.equal(
        response.headers.get("content-range"),
        `bytes 5-12/${mediaBytes.length}`,
    );
    assert.equal(response.headers.get("accept-ranges"), "bytes");
    assertPrivateResponse(response);
});

test("Range inválido devolve 416 e tamanho total sem path interno", async () => {
    const response = await fetch(`${baseUrl}/api/media/${assetId}`, {
        headers: {
            ...authHeaders(sessionTokens.allowed),
            Range: `bytes=${mediaBytes.length}-`,
        },
    });
    const body = await response.json();

    assert.equal(response.status, 416);
    assert.equal(body.code, "MEDIA_RANGE_INVALID");
    assert.equal(
        response.headers.get("content-range"),
        `bytes */${mediaBytes.length}`,
    );
    assert.equal(response.headers.get("accept-ranges"), "bytes");
    assertPrivateResponse(response);
    assert.equal(JSON.stringify(body).includes(storageKeys.allowed), false);
    assert.equal(JSON.stringify(body).includes(storageRoot), false);
});

test("listagem admin nunca expõe storageKey nem path local", async () => {
    const response = await fetch(
        `${baseUrl}/api/catalog/${contentId}/media-assets`,
        { headers: authHeaders(sessionTokens.admin) },
    );
    const body = await response.json();
    const serialized = JSON.stringify(body);

    assert.equal(response.status, 200);
    assert.ok(body.items.some((item) => item.id === String(assetId)));
    for (const storageKey of Object.values(storageKeys)) {
        assert.equal(serialized.includes(storageKey), false);
    }
    assert.equal(serialized.includes(storageRoot), false);
    assertPrivateResponse(response);
});

test("ativação recalcula SHA-256 e recusa tamper com o mesmo tamanho", async () => {
    const csrfToken = await getAdminCsrfToken();
    const content = collections.contents.rows.find(
        (row) => String(row._id) === String(contentId),
    );
    const asset = collections.media_assets.rows.find(
        (row) => String(row._id) === String(tamperedUploadId),
    );
    const response = await fetch(
        `${baseUrl}/api/catalog/${contentId}/media-uploads/${tamperedUploadId}/activate`,
        {
            method: "POST",
            headers: {
                ...authHeaders(sessionTokens.admin),
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
            },
            body: JSON.stringify({ expectedVersion: content.version }),
        },
    );
    const body = await response.json();

    assert.equal(response.status, 409);
    assert.equal(body.code, "MEDIA_ASSET_NOT_READY");
    assert.equal(asset.status, "uploaded");
    assert.equal(asset.active, false);
    assert.equal(content.version, 3);
    assert.equal(JSON.stringify(body).includes(storageKeys.tampered), false);
    assert.equal(JSON.stringify(body).includes(storageRoot), false);
});

test("ativação conserva HD e acrescenta 4K como variante ativa", async () => {
    const csrfToken = await getAdminCsrfToken();
    const content = collections.contents.rows.find(
        (row) => String(row._id) === String(contentId),
    );
    const hdAsset = collections.media_assets.rows.find(
        (row) => String(row._id) === String(assetId),
    );
    const response = await fetch(
        `${baseUrl}/api/catalog/${contentId}/media-uploads/${variantUploadId}/activate`,
        {
            method: "POST",
            headers: {
                ...authHeaders(sessionTokens.admin),
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
            },
            body: JSON.stringify({ expectedVersion: content.version }),
        },
    );
    const body = await response.json();
    const variantAsset = collections.media_assets.rows.find(
        (row) => String(row._id) === String(variantUploadId),
    );

    assert.equal(response.status, 200);
    assert.equal(body.contentVersion, 4);
    assert.equal(hdAsset.active, true);
    assert.equal(hdAsset.status, "ready");
    assert.equal(variantAsset.active, true);
    assert.equal(variantAsset.status, "ready");
    assert.equal(content.media.quality, "1080p");
    assert.deepEqual(
        content.qualityOptions.map((option) => option.value),
        ["1080p", "2160p"],
    );
    assert.equal(
        content.qualityOptions[1].source.url,
        `/api/media/${variantUploadId}`,
    );
});

test("PUT MP4 inválido falha fechado e remove final/partial", async () => {
    await getAdminCsrfToken();

    const response = await fetch(
        `${baseUrl}/api/catalog/${contentId}/media-uploads/${invalidUploadId}`,
        {
            method: "PUT",
            headers: {
                ...authHeaders(sessionTokens.admin),
                "Content-Type": "video/mp4",
                "X-CSRF-Token": adminCsrfToken,
            },
            body: invalidMediaBytes,
        },
    );
    const body = await response.json();
    const asset = collections.media_assets.rows.find(
        (row) => String(row._id) === String(invalidUploadId),
    );

    assert.equal(response.status, 400);
    assert.equal(body.code, "MEDIA_UPLOAD_INVALID");
    assert.equal(asset.status, "failed");
    assert.equal(asset.active, false);
    await assert.rejects(
        access(join(storageRoot, storageKeys.invalid)),
        { code: "ENOENT" },
    );
    await assert.rejects(
        access(join(storageRoot, `${storageKeys.invalid}.partial`)),
        { code: "ENOENT" },
    );
    assert.equal(JSON.stringify(body).includes(storageKeys.invalid), false);
    assert.equal(JSON.stringify(body).includes(storageRoot), false);
});

test("PUT interrompido não ativa nem conserva ficheiro partial", async () => {
    const asset = collections.media_assets.rows.find(
        (row) => String(row._id) === String(interruptedUploadId),
    );
    const url = new URL(
        `/api/catalog/${contentId}/media-uploads/${interruptedUploadId}`,
        baseUrl,
    );
    const request = httpRequest(url, {
        method: "PUT",
        headers: {
            ...authHeaders(sessionTokens.admin),
            "Content-Type": "video/mp4",
            "Content-Length": "100",
            "X-CSRF-Token": adminCsrfToken,
        },
    });
    request.on("error", () => undefined);
    request.on("response", (response) => response.resume());
    request.flushHeaders();
    request.write(
        Buffer.concat([
            Buffer.from([0, 0, 0, 24]),
            Buffer.from("ftypisom", "ascii"),
        ]),
    );

    await waitFor(() => asset.status === "uploading");
    request.destroy();
    await waitFor(() => asset.status === "failed");

    assert.equal(asset.active, false);
    assert.notEqual(asset.status, "ready");
    await assert.rejects(
        access(join(storageRoot, storageKeys.interrupted)),
        { code: "ENOENT" },
    );
    await assert.rejects(
        access(join(storageRoot, `${storageKeys.interrupted}.partial`)),
        { code: "ENOENT" },
    );
});
