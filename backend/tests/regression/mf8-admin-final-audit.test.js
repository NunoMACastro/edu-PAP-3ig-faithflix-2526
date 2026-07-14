/**
 * @file Regressao MF8 para auditoria administrativa final.
 *
 * A suite valida a superficie administrativa sem criar novas capacidades:
 * visitantes e utilizadores comuns continuam bloqueados, enquanto operacoes
 * administrativas criticas ja existentes mantem auditoria segura.
 */

import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { sessionConfig } from "../../src/config/session.js";
import { hashToken } from "../../src/modules/auth/token.js";
import { updateIntegrationSetting } from "../../src/modules/integrations/integrations.service.js";
import { updateUserByAdmin } from "../../src/modules/users/user.service.js";
import { startTestServer } from "../helpers/test-server.js";

const userSessionToken = "a".repeat(64);
const adminSessionToken = "b".repeat(64);

const testIds = {
    regularUser: new ObjectId("64f800000000000000000001"),
    adminUser: new ObjectId("64f800000000000000000002"),
    targetUser: new ObjectId("64f800000000000000000003"),
    content: new ObjectId("64f800000000000000000020"),
    secondContent: new ObjectId("64f800000000000000000021"),
    firstRevision: new ObjectId("64f800000000000000000030"),
    secondRevision: new ObjectId("64f800000000000000000031"),
    charityApplication: new ObjectId("64f800000000000000000040"),
    charity: new ObjectId("64f800000000000000000041"),
    biblicalPassage: new ObjectId("64f800000000000000000042"),
    comment: new ObjectId("64f800000000000000000043"),
    taxonomy: new ObjectId("64f800000000000000000044"),
};

const catalogPayload = {
    title: "Conteudo sintetico para RBAC",
    synopsis:
        "Sinopse sintetica suficientemente longa para validar o contrato editorial.",
    type: "movie",
    durationSeconds: 120,
    ageRating: 6,
    taxonomyIds: [],
    assets: { posterUrl: "", backdropUrl: "" },
};

const biblicalPassagePayload = {
    book: "Joao",
    chapterStart: 3,
    verseStart: 16,
    translation: "ARA",
    text: "Texto biblico sintetico usado exclusivamente pelo negativo de RBAC.",
    theme: "Esperanca",
    reflection: "Reflexao sintetica para o contrato administrativo.",
};

let collections;
let testServer;

/**
 * Compara ids MongoDB por valor textual.
 *
 * @param {unknown} left Primeiro id.
 * @param {unknown} right Segundo id.
 * @returns {boolean} Verdadeiro quando representam o mesmo id.
 */
function sameId(left, right) {
    return String(left) === String(right);
}

/**
 * Le valores aninhados atraves de caminhos `campo.subcampo`.
 *
 * @param {Record<string, unknown>} row Documento em memoria.
 * @param {string} path Caminho a consultar.
 * @returns {unknown} Valor encontrado.
 */
function valueForPath(row, path) {
    return path.split(".").reduce((current, key) => current?.[key], row);
}

/**
 * Compara documentos pelos sorts estáveis usados nas listagens admin.
 *
 * @param {Record<string, 1 | -1>} sort Ordenação MongoDB simplificada.
 * @returns {(left: object, right: object) => number} Comparador.
 */
function compareBySort(sort = {}) {
    return (left, right) => {
        for (const [field, direction] of Object.entries(sort)) {
            const leftValue = valueForPath(left, field);
            const rightValue = valueForPath(right, field);
            const comparableLeft = leftValue instanceof ObjectId
                ? leftValue.toHexString()
                : leftValue instanceof Date
                    ? leftValue.getTime()
                    : leftValue;
            const comparableRight = rightValue instanceof ObjectId
                ? rightValue.toHexString()
                : rightValue instanceof Date
                    ? rightValue.getTime()
                    : rightValue;

            if (comparableLeft < comparableRight) return -1 * direction;
            if (comparableLeft > comparableRight) return 1 * direction;
        }

        return 0;
    };
}

/**
 * Aplica operadores MongoDB usados pelos services administrativos.
 *
 * @param {Record<string, unknown>} row Documento alvo.
 * @param {Record<string, unknown>} update Operadores de update.
 * @param {boolean} isInsert Indica se e um upsert.
 * @returns {Record<string, unknown>} Documento atualizado.
 */
function applyUpdate(row, update = {}, isInsert = false) {
    Object.assign(row, update.$set ?? {});

    if (isInsert) {
        Object.assign(row, update.$setOnInsert ?? {});
    }

    return row;
}

/**
 * Converte um filtro simples na base de documento de upsert.
 *
 * @param {Record<string, unknown>} filter Filtro MongoDB simplificado.
 * @returns {Record<string, unknown>} Campos seguros para documento novo.
 */
function rowFromFilter(filter = {}) {
    return Object.fromEntries(
        Object.entries(filter).filter(
            ([key, value]) =>
                !key.startsWith("$") &&
                !(value && typeof value === "object" && !Array.isArray(value)),
        ),
    );
}

/**
 * Compara um valor com os operadores usados nesta suite.
 *
 * @param {unknown} actual Valor real.
 * @param {unknown} expected Condicao esperada.
 * @returns {boolean} Resultado da comparacao.
 */
function matchesValue(actual, expected) {
    if (expected instanceof ObjectId) {
        return sameId(actual, expected);
    }

    if (expected && typeof expected === "object" && !Array.isArray(expected)) {
        if ("$gt" in expected && actual <= expected.$gt) return false;
        if ("$ne" in expected && actual === expected.$ne) return false;
        if ("$exists" in expected) {
            return (actual !== undefined) === expected.$exists;
        }

        return true;
    }

    return actual === expected;
}

/**
 * Verifica se um documento satisfaz uma query MongoDB minima.
 *
 * @param {Record<string, unknown>} row Documento em memoria.
 * @param {Record<string, unknown>} query Query simplificada.
 * @returns {boolean} Verdadeiro quando corresponde.
 */
function matches(row, query = {}) {
    return Object.entries(query).every(([key, expected]) => {
        if (key === "$or") {
            return expected.some((nested) => matches(row, nested));
        }

        return matchesValue(valueForPath(row, key), expected);
    });
}

/**
 * Cria uma colecao fake com a subset MongoDB necessaria para os checks MF8.
 *
 * @param {Record<string, unknown>[]} initialRows Documentos iniciais.
 * @returns {Record<string, Function> & { rows: Record<string, unknown>[] }} Colecao fake.
 */
function collection(initialRows = []) {
    let rows = initialRows;

    return {
        rows,

        /**
         * Procura um documento por query.
         *
         * @param {Record<string, unknown>} query Query simplificada.
         * @returns {Promise<Record<string, unknown> | null>} Documento encontrado.
         */
        async findOne(query = {}) {
            return rows.find((row) => matches(row, query)) ?? null;
        },

        /**
         * Atualiza o primeiro documento e devolve o estado final.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @param {Record<string, unknown>} update Operadores de update.
         * @returns {Promise<Record<string, unknown> | null>} Documento final.
         */
        async findOneAndUpdate(filter, update) {
            const existing = rows.find((row) => matches(row, filter));

            if (!existing) {
                return null;
            }

            return applyUpdate(existing, update, false);
        },

        /**
         * Atualiza ou cria documento quando o service pede upsert.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @param {Record<string, unknown>} update Operadores de update.
         * @param {{ upsert?: boolean }} options Opcoes MongoDB.
         * @returns {Promise<{ matchedCount: number, modifiedCount: number }>} Resultado fake.
         */
        async updateOne(filter, update, options = {}) {
            const existing = rows.find((row) => matches(row, filter));

            if (existing) {
                applyUpdate(existing, update, false);
                return { matchedCount: 1, modifiedCount: 1 };
            }

            if (options.upsert) {
                rows.push(applyUpdate(rowFromFilter(filter), update, true));
                this.rows = rows;
            }

            return { matchedCount: 0, modifiedCount: 0 };
        },

        /**
         * Substitui integralmente uma configuração canónica.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @param {Record<string, unknown>} replacement Documento canónico.
         * @param {{ upsert?: boolean }} options Opções MongoDB.
         * @returns {Promise<{ matchedCount: number, modifiedCount: number }>} Resultado fake.
         */
        async replaceOne(filter, replacement, options = {}) {
            const index = rows.findIndex((row) => matches(row, filter));

            if (index >= 0) {
                rows[index] = { ...replacement };
                this.rows = rows;
                return { matchedCount: 1, modifiedCount: 1 };
            }

            if (options.upsert) {
                rows.push({
                    ...replacement,
                    _id: replacement._id ?? new ObjectId(),
                });
                this.rows = rows;
            }

            return { matchedCount: 0, modifiedCount: 0 };
        },

        /**
         * Insere documento novo.
         *
         * @param {Record<string, unknown>} document Documento a inserir.
         * @returns {Promise<{ insertedId: ObjectId }>} Resultado fake.
         */
        async insertOne(document) {
            const insertedId = document._id ?? new ObjectId();
            rows.push({ ...document, _id: insertedId });
            this.rows = rows;
            return { insertedId };
        },

        /**
         * Remove documentos que correspondam ao filtro.
         *
         * @param {Record<string, unknown>} filter Filtro simplificado.
         * @returns {Promise<{ deletedCount: number }>} Resultado fake.
         */
        async deleteMany(filter) {
            const before = rows.length;
            rows = rows.filter((row) => !matches(row, filter));
            this.rows = rows;
            return { deletedCount: before - rows.length };
        },

        /**
         * Lista documentos com cursor simplificado.
         *
         * @param {Record<string, unknown>} query Query simplificada.
         * @returns {{ toArray: () => Promise<Record<string, unknown>[]> }} Cursor fake.
         */
        find(query = {}) {
            let result = rows.filter((row) => matches(row, query));

            return {
                sort(sort = {}) {
                    result = [...result].sort(compareBySort(sort));
                    return this;
                },
                skip(count) {
                    result = result.slice(count);
                    return this;
                },
                limit(count) {
                    result = result.slice(0, count);
                    return this;
                },
                async toArray() {
                    return result;
                },
            };
        },

        async countDocuments(query = {}) {
            return rows.filter((row) => matches(row, query)).length;
        },
    };
}

/**
 * Instala DB fake com utilizador comum, admin e alvo administrativo.
 *
 * @returns {Record<string, ReturnType<typeof collection>>} Colecoes instaladas.
 */
function installTestDatabase() {
    collections = {
        users: collection([
            {
                _id: testIds.regularUser,
                name: "Utilizador comum",
                email: "user@example.test",
                role: "user",
                accountStatus: "active",
            },
            {
                _id: testIds.adminUser,
                name: "Admin",
                email: "admin@example.test",
                role: "admin",
                accountStatus: "active",
            },
            {
                _id: testIds.targetUser,
                name: "Conta auditada",
                email: "target@example.test",
                role: "user",
                accountStatus: "active",
            },
        ]),
        sessions: collection([
            {
                _id: new ObjectId("64f800000000000000000010"),
                userId: testIds.regularUser,
                tokenHash: hashToken(userSessionToken),
                expiresAt: new Date("2027-01-01T00:00:00.000Z"),
            },
            {
                _id: new ObjectId("64f800000000000000000011"),
                userId: testIds.adminUser,
                tokenHash: hashToken(adminSessionToken),
                expiresAt: new Date("2027-01-01T00:00:00.000Z"),
            },
            {
                _id: new ObjectId("64f800000000000000000012"),
                userId: testIds.targetUser,
                tokenHash: hashToken("c".repeat(64)),
                expiresAt: new Date("2027-01-01T00:00:00.000Z"),
            },
        ]),
        contents: collection([
            {
                _id: testIds.content,
                version: 1,
                title: "Primeiro conteúdo",
                slug: "primeiro-conteudo",
                synopsis: "Conteúdo administrativo usado para paginação HTTP.",
                type: "movie",
                durationSeconds: 120,
                ageRating: 6,
                taxonomyIds: [],
                assets: { posterUrl: "", backdropUrl: "" },
                media: { playbackUrl: "" },
                mediaStatus: "pending",
                tracks: { subtitles: [], audio: [] },
                qualityOptions: [],
                status: "draft",
                publishedAt: null,
                updatedAt: new Date("2026-07-10T10:00:00.000Z"),
            },
            {
                _id: testIds.secondContent,
                version: 1,
                title: "Segundo conteúdo",
                slug: "segundo-conteudo",
                synopsis: "Segundo conteúdo administrativo para paginação HTTP.",
                type: "documentary",
                durationSeconds: 180,
                ageRating: 12,
                taxonomyIds: [],
                assets: { posterUrl: "", backdropUrl: "" },
                media: { playbackUrl: "" },
                mediaStatus: "pending",
                tracks: { subtitles: [], audio: [] },
                qualityOptions: [],
                status: "draft",
                publishedAt: null,
                updatedAt: new Date("2026-07-10T10:00:00.000Z"),
            },
        ]),
        content_revisions: collection([
            {
                _id: testIds.firstRevision,
                contentId: testIds.content,
                action: "update",
                snapshot: {
                    _id: testIds.content,
                    version: 1,
                    title: "Primeira revisão",
                    slug: "primeira-revisao",
                    synopsis: "Snapshot editorial usado pela paginação HTTP.",
                    type: "movie",
                    durationSeconds: 120,
                    ageRating: 6,
                    taxonomyIds: [],
                    assets: { posterUrl: "", backdropUrl: "" },
                    media: { playbackUrl: "" },
                    mediaStatus: "pending",
                    tracks: { subtitles: [], audio: [] },
                    qualityOptions: [],
                    status: "draft",
                    publishedAt: null,
                },
                changedBy: testIds.adminUser,
                createdAt: new Date("2026-07-10T11:00:00.000Z"),
            },
            {
                _id: testIds.secondRevision,
                contentId: testIds.content,
                action: "update",
                snapshot: {
                    _id: testIds.content,
                    version: 1,
                    title: "Segunda revisão",
                    slug: "segunda-revisao",
                    synopsis: "Segundo snapshot usado pela paginação HTTP.",
                    type: "movie",
                    durationSeconds: 120,
                    ageRating: 6,
                    taxonomyIds: [],
                    assets: { posterUrl: "", backdropUrl: "" },
                    media: { playbackUrl: "" },
                    mediaStatus: "pending",
                    tracks: { subtitles: [], audio: [] },
                    qualityOptions: [],
                    status: "draft",
                    publishedAt: null,
                },
                changedBy: testIds.adminUser,
                createdAt: new Date("2026-07-10T11:00:00.000Z"),
            },
        ]),
        content_comments: collection([
            {
                _id: testIds.comment,
                userId: testIds.targetUser,
                contentId: testIds.content,
                body: "Comentario sintetico pertencente a outro utilizador.",
                status: "visible",
                moderationReason: null,
                createdAt: new Date("2026-07-10T12:00:00.000Z"),
                updatedAt: new Date("2026-07-10T12:00:00.000Z"),
            },
        ]),
        admin_audit_logs: collection([]),
        integration_settings: collection([]),
    };

    setDbForTests({
        /**
         * Devolve a colecao pedida e cria uma vazia quando nao existe.
         *
         * @param {string} name Nome da colecao.
         * @returns {ReturnType<typeof collection>} Colecao fake.
         */
        collection(name) {
            collections[name] ??= collection([]);
            return collections[name];
        },
    });

    return collections;
}

/**
 * Executa pedido HTTP contra o servidor de teste.
 *
 * @param {{ method?: string, path: string, userCookie?: boolean, adminCookie?: boolean, csrfToken?: string, body?: Record<string, unknown> }} input Pedido.
 * @returns {Promise<Response>} Resposta fetch.
 */
function requestAdminSurface({
    method = "GET",
    path,
    userCookie = false,
    adminCookie = false,
    csrfToken,
    body,
}) {
    const headers = {
        "content-type": "application/json",
    };

    if (userCookie || adminCookie) {
        const token = adminCookie ? adminSessionToken : userSessionToken;
        headers.cookie = `${sessionConfig.cookieName}=${token}`;
    }

    if (csrfToken) {
        headers["x-csrf-token"] = csrfToken;
    }

    return fetch(`${testServer.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * Confirma o envelope de acesso recusado e a correlação do pedido.
 *
 * @param {Response} response Resposta HTTP recebida.
 * @param {{ status: number, code: string, label: string }} expected Contrato esperado.
 * @returns {Promise<Record<string, unknown>>} Body normalizado para asserções adicionais.
 */
async function assertAccessDenied(response, expected) {
    const body = await response.json();

    assert.equal(response.status, expected.status, expected.label);
    assert.equal(body.code, expected.code, `${expected.label}: codigo seguro`);
    assert.equal(
        typeof body.requestId,
        "string",
        `${expected.label}: requestId no envelope`,
    );
    assert.ok(body.requestId.length > 0, `${expected.label}: requestId preenchido`);
    assert.equal(
        response.headers.get("x-request-id"),
        body.requestId,
        `${expected.label}: requestId correlacionado com o header`,
    );

    return body;
}

before(async () => {
    installTestDatabase();
    testServer = await startTestServer();
});

after(async () => {
    if (testServer) {
        await testServer.close();
    }

    setDbForTests(null);
});

test("MF8 leituras admin bloqueiam visitantes e utilizadores comuns", async () => {
    const surfaces = [
        { method: "GET", path: "/api/users" },
        { method: "GET", path: "/api/admin/metrics" },
        { method: "GET", path: "/api/admin/integrations" },
        { method: "GET", path: "/api/catalog/admin" },
        { method: "GET", path: "/api/catalog/admin/options" },
        { method: "GET", path: `/api/catalog/admin/${testIds.content}` },
        { method: "GET", path: "/api/catalog/taxonomies/admin" },
        {
            method: "GET",
            path: `/api/catalog/${testIds.content}/revisions`,
        },
        {
            method: "GET",
            path: `/api/catalog/${testIds.content}/biblical-passages/admin`,
        },
        { method: "GET", path: "/api/biblical-passages/admin" },
        { method: "GET", path: "/api/charities/applications" },
        { method: "GET", path: "/api/charities/pool/dashboard" },
        {
            method: "GET",
            path: "/api/charities/pool/distributions/2026-06",
        },
    ];

    for (const surface of surfaces) {
        const anonymous = await requestAdminSurface(surface);
        await assertAccessDenied(anonymous, {
            status: 401,
            code: "AUTH_REQUIRED",
            label: `${surface.method} ${surface.path} deve exigir sessao`,
        });

        const regularUser = await requestAdminSurface({
            ...surface,
            userCookie: true,
        });
        await assertAccessDenied(regularUser, {
            status: 403,
            code: "FORBIDDEN",
            label: `${surface.method} ${surface.path} deve recusar role user`,
        });
    }
});

test("MF8 todas as mutacoes privilegiadas exigem role autorizada", async () => {
    const csrfResponse = await requestAdminSurface({
        path: "/api/session/csrf-token",
        userCookie: true,
    });
    const csrfBody = await csrfResponse.json();

    assert.equal(csrfResponse.status, 200);
    assert.equal(typeof csrfBody.csrfToken, "string");

    const surfaces = [
        {
            method: "PATCH",
            path: `/api/users/${testIds.targetUser}/role`,
            body: { role: "moderator" },
        },
        {
            method: "PATCH",
            path: `/api/users/${testIds.targetUser}/admin`,
            body: { accountStatus: "blocked" },
        },
        {
            method: "POST",
            path: "/api/catalog/taxonomies",
            body: {
                name: "Taxonomia sintetica",
                slug: "taxonomia-sintetica",
                description: "Taxonomia usada apenas pelo negativo de RBAC.",
            },
        },
        {
            method: "PATCH",
            path: `/api/catalog/taxonomies/${testIds.taxonomy}`,
            body: {
                name: "Taxonomia sintetica",
                slug: "taxonomia-sintetica",
                description: "Taxonomia usada apenas pelo negativo de RBAC.",
                expectedVersion: 1,
            },
        },
        {
            method: "PATCH",
            path: `/api/catalog/taxonomies/${testIds.taxonomy}/status`,
            body: { status: "archived", expectedVersion: 1 },
        },
        {
            method: "POST",
            path: "/api/catalog",
            body: catalogPayload,
        },
        {
            method: "PATCH",
            path: `/api/catalog/${testIds.content}`,
            body: { expectedVersion: 1, ...catalogPayload },
        },
        {
            method: "PATCH",
            path: `/api/catalog/${testIds.content}/status`,
            body: { status: "published", expectedVersion: 1 },
        },
        {
            method: "POST",
            path: `/api/catalog/${testIds.content}/revisions/${testIds.firstRevision}/revert`,
            body: { expectedVersion: 1 },
        },
        {
            method: "PATCH",
            path: `/api/charities/applications/${testIds.charityApplication}/review`,
            body: { decision: "approved", reason: "Candidatura valida." },
        },
        {
            method: "POST",
            path: `/api/charities/${testIds.charity}/members`,
            body: { userId: String(testIds.targetUser) },
        },
        {
            method: "PATCH",
            path: "/api/admin/integrations/simulated_payments",
            body: { enabled: false, mode: "disabled", publicConfig: {} },
        },
        {
            method: "POST",
            path: "/api/charities/pool/distributions",
            body: { month: "2026-06" },
        },
        {
            method: "POST",
            path: "/api/biblical-passages",
            body: biblicalPassagePayload,
        },
        {
            method: "PATCH",
            path: `/api/biblical-passages/${testIds.biblicalPassage}`,
            body: biblicalPassagePayload,
        },
        {
            method: "PATCH",
            path: `/api/biblical-passages/${testIds.biblicalPassage}/status`,
            body: { status: "published" },
        },
        {
            method: "POST",
            path: `/api/catalog/${testIds.content}/biblical-passages`,
            body: {
                passageId: String(testIds.biblicalPassage),
                note: "Associacao sintetica para RBAC.",
                sortOrder: 0,
            },
        },
        {
            method: "DELETE",
            path: `/api/catalog/${testIds.content}/biblical-passages/${testIds.biblicalPassage}`,
        },
        {
            method: "PATCH",
            path: `/api/comments/${testIds.comment}/moderation`,
            body: {
                status: "rejected",
                moderationReason: "Moderacao sintetica para RBAC.",
            },
        },
        {
            method: "DELETE",
            path: `/api/comments/${testIds.comment}`,
            regularCode: "REQUEST_FAILED",
        },
    ];

    for (const surface of surfaces) {
        const anonymous = await requestAdminSurface(surface);
        await assertAccessDenied(anonymous, {
            status: 401,
            code: "AUTH_REQUIRED",
            label: `${surface.method} ${surface.path} deve exigir sessao`,
        });

        const regularUser = await requestAdminSurface({
            ...surface,
            userCookie: true,
            csrfToken: csrfBody.csrfToken,
        });
        await assertAccessDenied(regularUser, {
            status: 403,
            code: surface.regularCode ?? "FORBIDDEN",
            label: `${surface.method} ${surface.path} deve recusar role user`,
        });
    }

    assert.equal(collections.contents.rows.length, 2);
    assert.equal(collections.content_revisions.rows.length, 2);
    assert.equal(collections.content_comments.rows.length, 1);
    assert.equal(collections.integration_settings.rows.length, 0);
    assert.equal(collections.admin_audit_logs.rows.length, 0);
});

test("MF8 operacoes admin criticas mantem logs sem segredos", async () => {
    const userUpdateRequestId = "mf8-admin-user-update";
    const updatedUser = await updateUserByAdmin(
        String(testIds.adminUser),
        String(testIds.targetUser),
        { role: "moderator" },
        { requestId: userUpdateRequestId },
    );
    const integrationUpdateRequestId = "mf8-admin-integration-update";
    const integration = await updateIntegrationSetting(
        String(testIds.adminUser),
        "simulated_payments",
        {
            enabled: false,
            mode: "disabled",
            publicConfig: {},
        },
        { requestId: integrationUpdateRequestId },
    );

    assert.equal(updatedUser.role, "moderator");
    assert.equal(integration.enabled, false);
    assert.equal(collections.admin_audit_logs.rows.length, 2);
    assert.deepEqual(
        collections.admin_audit_logs.rows.map((row) => row.action),
        ["user.admin_update", "integration.update"],
    );
    assert.equal(
        collections.admin_audit_logs.rows[0].requestId,
        userUpdateRequestId,
    );
    assert.equal(
        collections.admin_audit_logs.rows[1].requestId,
        integrationUpdateRequestId,
    );

    const serializedLogs = JSON.stringify(collections.admin_audit_logs.rows);
    const forbiddenFragments = [
        "passwordHash",
        "authorization",
        "cookie",
        "Bearer ",
        "sk_live",
        "mongodb://",
    ];

    for (const fragment of forbiddenFragments) {
        assert.equal(
            serializedLogs.includes(fragment),
            false,
            `admin_audit_logs nao deve expor ${fragment}`,
        );
    }
});

test("F4 HTTP pagina catálogo admin e revisões com metadados estáveis", async () => {
    const catalogResponse = await requestAdminSurface({
        path: "/api/catalog/admin?page=2&limit=1",
        adminCookie: true,
    });
    const catalogBody = await catalogResponse.json();
    const revisionsResponse = await requestAdminSurface({
        path: `/api/catalog/${testIds.content}/revisions?page=2&limit=1`,
        adminCookie: true,
    });
    const revisionsBody = await revisionsResponse.json();

    assert.equal(catalogResponse.status, 200);
    assert.deepEqual(
        {
            page: catalogBody.page,
            limit: catalogBody.limit,
            total: catalogBody.total,
            totalPages: catalogBody.totalPages,
        },
        { page: 2, limit: 1, total: 2, totalPages: 2 },
    );
    assert.equal(catalogBody.items[0].id, String(testIds.secondContent));

    assert.equal(revisionsResponse.status, 200);
    assert.deepEqual(
        {
            page: revisionsBody.page,
            limit: revisionsBody.limit,
            total: revisionsBody.total,
            totalPages: revisionsBody.totalPages,
        },
        { page: 2, limit: 1, total: 2, totalPages: 2 },
    );
    assert.equal(
        revisionsBody.items[0].id,
        String(testIds.secondRevision),
    );

    const csrfResponse = await requestAdminSurface({
        path: "/api/session/csrf-token",
        adminCookie: true,
    });
    const { csrfToken } = await csrfResponse.json();
    const forbiddenResponse = await requestAdminSurface({
        method: "PATCH",
        path: `/api/catalog/${testIds.content}`,
        adminCookie: true,
        csrfToken,
        body: {
            expectedVersion: 1,
            title: "Tentativa de media",
            synopsis: "Payload HTTP tenta alterar media pela rota editorial.",
            type: "movie",
            durationSeconds: 120,
            ageRating: 6,
            taxonomyIds: [],
            assets: { posterUrl: "", backdropUrl: "" },
            mediaStatus: "ready",
        },
    });
    const forbiddenBody = await forbiddenResponse.json();

    assert.equal(csrfResponse.status, 200);
    assert.equal(forbiddenResponse.status, 400);
    assert.equal(
        forbiddenBody.code,
        "CATALOG_MEDIA_MUTATION_FORBIDDEN",
    );
    assert.deepEqual(forbiddenBody.details, { field: "mediaStatus" });
    assert.equal(collections.content_revisions.rows.length, 2);
});

test("users HTTP liga perfil e parental à sessão autenticada", async () => {
    const csrfResponse = await requestAdminSurface({
        path: "/api/session/csrf-token",
        userCookie: true,
    });
    const { csrfToken } = await csrfResponse.json();
    const profileResponse = await requestAdminSurface({
        method: "PATCH",
        path: "/api/users/me",
        userCookie: true,
        csrfToken,
        body: { name: "Utilizador atualizado", role: "admin" },
    });
    const profileBody = await profileResponse.json();
    const parentalResponse = await requestAdminSurface({
        method: "PATCH",
        path: "/api/users/me/parental",
        userCookie: true,
        csrfToken,
        body: { parentalMaxAgeRating: 12 },
    });
    const parentalBody = await parentalResponse.json();
    const persistedUser = collections.users.rows.find((user) =>
        sameId(user._id, testIds.regularUser));

    assert.equal(csrfResponse.status, 200);
    assert.equal(profileResponse.status, 200);
    assert.equal(profileBody.user.id, String(testIds.regularUser));
    assert.equal(profileBody.user.name, "Utilizador atualizado");
    assert.equal(profileBody.user.role, "user");
    assert.equal("passwordHash" in profileBody.user, false);
    assert.equal(parentalResponse.status, 200);
    assert.equal(parentalBody.user.parentalMaxAgeRating, 12);
    assert.equal(persistedUser.name, "Utilizador atualizado");
    assert.equal(persistedUser.role, "user");
    assert.equal(persistedUser.parentalMaxAgeRating, 12);
});

test("users HTTP confirma update admin e fecha o contrato da rota legacy", async () => {
    const csrfResponse = await requestAdminSurface({
        path: "/api/session/csrf-token",
        adminCookie: true,
    });
    const { csrfToken } = await csrfResponse.json();
    const auditCountBefore = collections.admin_audit_logs.rows.length;
    const legacyRoleResponse = await requestAdminSurface({
        method: "PATCH",
        path: `/api/users/${testIds.targetUser}/role`,
        adminCookie: true,
        csrfToken,
        body: { role: "moderator" },
    });
    const legacyRoleBody = await legacyRoleResponse.json();
    const updateResponse = await requestAdminSurface({
        method: "PATCH",
        path: `/api/users/${testIds.targetUser}/admin`,
        adminCookie: true,
        csrfToken,
        body: { role: "user", accountStatus: "blocked" },
    });
    const updateBody = await updateResponse.json();
    const legacyResponse = await requestAdminSurface({
        method: "PATCH",
        path: `/api/users/${testIds.targetUser}/role`,
        adminCookie: true,
        csrfToken,
        body: { accountStatus: "active" },
    });
    const legacyBody = await legacyResponse.json();
    const targetSessions = collections.sessions.rows.filter((session) =>
        sameId(session.userId, testIds.targetUser));

    assert.equal(csrfResponse.status, 200);
    assert.equal(legacyRoleResponse.status, 200);
    assert.equal(legacyRoleBody.user.role, "moderator");
    assert.equal(updateResponse.status, 200);
    assert.equal(updateBody.user.role, "user");
    assert.equal(updateBody.user.accountStatus, "blocked");
    assert.equal(targetSessions.length, 0);
    assert.equal(
        collections.admin_audit_logs.rows.length,
        auditCountBefore + 2,
    );
    assert.equal(legacyResponse.status, 400);
    assert.equal(legacyBody.message, "Atualização de role inválida.");
    assert.equal(collections.admin_audit_logs.rows.length, auditCountBefore + 2);
});
