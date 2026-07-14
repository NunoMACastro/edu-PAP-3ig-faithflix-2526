/**
 * @file Provas unitarias F5 de validacao fechada e paginacao sem MongoDB real.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
    assertValidEmail,
    assertValidPassword,
} from "../../src/modules/auth/auth.validation.js";
import {
    assertCharityApplicationListQuery,
    assertCharityApplicationPayload,
} from "../../src/modules/charities/charity-applications.validation.js";
import { listCharityApplications } from "../../src/modules/charities/charity-applications.service.js";
import { assertReviewPayload } from "../../src/modules/charities/charity-review.validation.js";
import { assertModerationReason } from "../../src/modules/comments/comments.validation.js";
import {
    listHistory,
    listSavedContent,
} from "../../src/modules/library/library.service.js";
import {
    assertPreferencePayload,
    parseNotificationPagination,
} from "../../src/modules/notifications/notifications.validation.js";
import { listMyNotifications } from "../../src/modules/notifications/notifications.service.js";
import {
    assertMediaPreferences,
    getMediaPreferences,
    saveMediaPreferences,
} from "../../src/modules/playback/media-preferences.service.js";
import { listContinueWatching } from "../../src/modules/playback/playback.service.js";
import { parseContinueWatchingPagination } from "../../src/modules/playback/playback.validation.js";
import { assertDeleteAccountPayload } from "../../src/modules/privacy/privacy.validation.js";
import {
    buildAdminUserQuery,
    listUsers,
} from "../../src/modules/users/user.service.js";
import {
    assertParentalSettings,
    assertAdminUserFilters,
    assertAdminUserUpdate,
    parseAdminUserPagination,
} from "../../src/modules/users/user.validation.js";
import { parsePagination } from "../../src/utils/pagination.js";

afterEach(() => {
    setDbForTests(null);
});

/**
 * Cria um cursor MongoDB minimo com rastreio de ordenacao e offsets.
 *
 * @param {Record<string, unknown>[]} rows Linhas devolvidas pelo cursor.
 * @param {Record<string, unknown>} trace Objeto de rastreio mutavel.
 * @returns {Record<string, Function>} Cursor in-memory encadeavel.
 */
function cursor(rows, trace) {
    let skip = 0;
    let limit = rows.length;

    return {
        sort(value) {
            trace.sort = value;
            return this;
        },
        skip(value) {
            skip = value;
            trace.skip = value;
            return this;
        },
        limit(value) {
            limit = value;
            trace.limit = value;
            return this;
        },
        async toArray() {
            return rows.slice(skip, skip + limit);
        },
    };
}

test("F5 paginacao rejeita coercoes ambiguas e limita cada pagina a 50", () => {
    assert.deepEqual(parsePagination({}, { defaultLimit: 20 }), {
        page: 1,
        limit: 20,
    });
    assert.deepEqual(parseAdminUserPagination({ page: "2", limit: "50" }), {
        page: 2,
        limit: 50,
    });
    assert.throws(() => parsePagination({ page: true }), /Pagina/);
    assert.throws(() => parsePagination(null), /Paginacao/);
    assert.throws(() => parsePagination({ page: "01" }), /Pagina/);
    assert.throws(() => parsePagination({ limit: "0" }), /Limite/);
    assert.throws(() => parsePagination({ limit: "51" }), /Limite maximo/);
    assert.throws(
        () => parsePagination({ page: String(Number.MAX_SAFE_INTEGER), limit: "50" }),
        /Pagina demasiado alta/,
    );
    assert.throws(
        () => parseNotificationPagination({ limit: ["20"] }),
        /Limite/,
    );
    assert.deepEqual(parseContinueWatchingPagination({}), {
        page: 1,
        limit: 12,
    });
});

test("F5 booleanos e preferencias media aceitam apenas campos e valores fechados", () => {
    assert.deepEqual(
        assertPreferencePayload({
            inApp: false,
            email: true,
            continueWatching: false,
        }),
        { inApp: false, email: true, continueWatching: false },
    );
    assert.throws(
        () => assertPreferencePayload({ inApp: "false" }),
        /verdadeiro ou falso/,
    );
    assert.throws(() => assertPreferencePayload(null), /Preferências/);

    assert.deepEqual(
        assertMediaPreferences({
            subtitleLanguage: "en",
            audioLanguage: "pt",
            quality: "1080p",
        }),
        {
            subtitleLanguage: "en",
            audioLanguage: "pt",
            quality: "1080p",
        },
    );
    assert.throws(
        () => assertMediaPreferences({ quality: "auto" }),
        /Qualidade/,
    );
    assert.throws(
        () => assertMediaPreferences({ audioLanguage: "pt-PT" }),
        /audioLanguage/,
    );
    assert.throws(
        () => assertMediaPreferences({ quality: "720p", playbackUrl: "/x" }),
        (error) => error.code === "MEDIA_PREFERENCE_FIELD_INVALID",
    );
    assert.deepEqual(assertParentalSettings({ parentalMaxAgeRating: 12 }), {
        parentalMaxAgeRating: 12,
    });
    assert.throws(
        () => assertParentalSettings({ parentalMaxAgeRating: "" }),
        /parental/i,
    );
    assert.throws(
        () => assertParentalSettings({ parentalMaxAgeRating: "12" }),
        /parental/i,
    );
    assert.throws(
        () => assertAdminUserUpdate({ role: ["admin"] }),
        /Role/,
    );
    assert.throws(
        () => assertAdminUserFilters({ status: ["active"] }),
        /estado/,
    );
    assert.equal(
        assertAdminUserFilters({ status: "deleted" }).status,
        "deleted",
    );
    assert.throws(
        () => assertAdminUserUpdate({ accountStatus: "deleted" }),
        /Estado de conta/,
    );
});

test("F5 filtro ativo inclui contas legacy/null e deleted e apenas leitura", () => {
    assert.deepEqual(buildAdminUserQuery({ status: "active" }), {
        $or: [
            { accountStatus: "active" },
            { accountStatus: null },
            { accountStatus: { $exists: false } },
        ],
    });
    assert.deepEqual(buildAdminUserQuery({ status: "deleted" }), {
        accountStatus: "deleted",
    });
});

test("F5 emails e motivos criticos respeitam limites explicitos", () => {
    const validApplication = {
        name: "Associacao Teste",
        contactName: "Pessoa Responsavel",
        email: "contacto@example.com",
        phone: "+351 210 000 000",
        mission:
            "Apoiar familias e comunidades locais com um programa solidario continuado.",
        websiteUrl: "https://example.com",
    };

    assert.equal(
        assertCharityApplicationPayload(validApplication).email,
        "contacto@example.com",
    );
    assert.equal(assertValidEmail("  Pessoa@Example.com "), "pessoa@example.com");
    assert.equal(assertValidEmail(`${"a".repeat(242)}@example.com`).length, 254);
    assert.throws(
        () => assertValidEmail(`${"a".repeat(243)}@example.com`),
        /Email/,
    );
    assert.equal(assertValidPassword("password-segura"), "password-segura");
    assert.throws(() => assertValidEmail(["pessoa@example.com"]), /Email/);
    assert.throws(() => assertValidPassword(["password-segura"]), /128/);
    assert.throws(
        () =>
            assertDeleteAccountPayload({
                confirmation: "ELIMINAR CONTA",
                password: ["password-segura"],
            }),
        /password atual/,
    );
    assert.throws(
        () =>
            assertCharityApplicationPayload({
                ...validApplication,
                email: `${"a".repeat(246)}@example.com`,
            }),
        /Email/,
    );
    assert.throws(
        () =>
            assertCharityApplicationPayload({
                ...validApplication,
                phone: "1".repeat(41),
            }),
        /Telefone/,
    );
    assert.throws(
        () => assertReviewPayload({ decision: "rejected", reason: "x".repeat(501) }),
        /500/,
    );
    assert.throws(() => assertModerationReason("x".repeat(501)), /500/);
    assert.throws(
        () => assertCharityApplicationListQuery({ status: "deleted" }),
        /Estado/,
    );
    assert.throws(
        () => assertCharityApplicationListQuery({ status: ["pending"] }),
        /Estado/,
    );
    assert.throws(
        () => assertReviewPayload({ decision: ["approved"] }),
        /Decisão/,
    );
    assert.equal(
        assertReviewPayload({
            decision: "rejected",
            reason: "x".repeat(500),
        }).reason.length,
        500,
    );
});

test("F5 preferencias media persistem allowlist e dados legacy invalidos falham seguro", async () => {
    const writes = [];
    const preferenceCollection = {
        async createIndex() {},
        async findOne() {
            return {
                values: {
                    subtitleLanguage: "pt-BR",
                    audioLanguage: "qualquer",
                    quality: "ultra",
                },
            };
        },
        async updateOne(filter, update) {
            writes.push({ filter, update });
            return { matchedCount: 1 };
        },
    };

    setDbForTests({
        collection(name) {
            assert.equal(name, "media_preferences");
            return preferenceCollection;
        },
    });

    const userId = String(new ObjectId());
    assert.deepEqual(await getMediaPreferences(userId), {
        subtitleLanguage: "",
        audioLanguage: "pt",
        quality: "720p",
    });
    assert.deepEqual(
        await saveMediaPreferences(userId, {
            subtitleLanguage: "pt",
            audioLanguage: "en",
            quality: "2160p",
        }),
        {
            subtitleLanguage: "pt",
            audioLanguage: "en",
            quality: "2160p",
        },
    );
    assert.equal(writes.length, 1);
    assert.deepEqual(writes[0].update.$set.values, {
        subtitleLanguage: "pt",
        audioLanguage: "en",
        quality: "2160p",
    });
});

test("F5 GET users conserva array e acrescenta pagina com sort estavel", async () => {
    const trace = {};
    const users = [
        {
            _id: new ObjectId(),
            name: "Primeiro",
            email: "primeiro@example.com",
            role: "user",
            createdAt: new Date("2026-01-03T00:00:00.000Z"),
        },
        {
            _id: new ObjectId(),
            name: "Segundo",
            email: "segundo@example.com",
            role: "user",
            createdAt: new Date("2026-01-02T00:00:00.000Z"),
        },
    ];

    setDbForTests({
        collection(name) {
            assert.equal(name, "users");
            return {
                find() {
                    return cursor(users, trace);
                },
                async countDocuments() {
                    return 3;
                },
            };
        },
    });

    const result = await listUsers({ page: "2", limit: "1" });

    assert.deepEqual(trace.sort, { createdAt: -1, _id: 1 });
    assert.equal(trace.skip, 1);
    assert.equal(trace.limit, 1);
    assert.equal(result.users[0].name, "Segundo");
    assert.deepEqual(
        {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
        { page: 2, limit: 1, total: 3, totalPages: 3 },
    );
});

test("F5 listas pessoais contam apenas conteudo publicado antes da pagina", async () => {
    const userId = String(new ObjectId());
    const listPipelines = [];
    const progressPipelines = [];
    const content = {
        _id: new ObjectId(),
        title: "Conteudo",
        slug: "conteudo",
        type: "movie",
        durationSeconds: 120,
        assets: { posterUrl: "/poster.webp" },
    };

    setDbForTests({
        collection(name) {
            return {
                aggregate(pipeline) {
                    const target =
                        name === "user_content_lists"
                            ? listPipelines
                            : progressPipelines;
                    target.push(pipeline);
                    return {
                        async toArray() {
                            return [
                                {
                                    items: [
                                        {
                                            _id: new ObjectId(),
                                            content,
                                            currentTimeSeconds: 30,
                                            durationSeconds: 120,
                                            completed: false,
                                            lastWatchedAt: new Date(),
                                        },
                                    ],
                                    metadata: [{ total: 4 }],
                                },
                            ];
                        },
                    };
                },
            };
        },
    });

    const favorites = await listSavedContent(userId, "favorite", {
        page: "2",
        limit: "1",
    });
    const history = await listHistory(userId, { page: "1", limit: "2" });

    assert.equal(favorites.items[0].id, String(content._id));
    assert.deepEqual(
        {
            page: favorites.page,
            limit: favorites.limit,
            total: favorites.total,
            totalPages: favorites.totalPages,
        },
        { page: 2, limit: 1, total: 4, totalPages: 4 },
    );
    assert.equal(history.items[0].currentTimeSeconds, 30);
    assert.equal(history.totalPages, 2);

    const favoriteFacet = listPipelines[0].at(-1).$facet;
    const historyFacet = progressPipelines[0].at(-1).$facet;
    assert.deepEqual(favoriteFacet.items[0], {
        $sort: { updatedAt: -1, _id: 1 },
    });
    assert.deepEqual(historyFacet.items[0], {
        $sort: { lastWatchedAt: -1, _id: 1 },
    });
    assert.deepEqual(favoriteFacet.metadata, [{ $count: "total" }]);
});

test("F5 notificacoes e candidaturas admin preservam arrays com metadata", async () => {
    const traces = { notifications: {}, charity_applications: {} };
    const notificationId = new ObjectId();
    const applicationId = new ObjectId();
    const rows = {
        notifications: [
            {
                _id: notificationId,
                type: "continue_watching",
                title: "Notificação demo 1",
                message: "Evento representativo da atividade FaithFlix de demonstração.",
                createdAt: new Date(),
            },
        ],
        charity_applications: [
            {
                _id: applicationId,
                name: "Associacao",
                contactName: "Pessoa",
                email: "associacao@example.com",
                phone: "",
                mission: "Missao solidaria suficientemente detalhada.",
                websiteUrl: "",
                status: "rejected",
                submittedAt: new Date(),
                reviewReason: "Documentação insuficiente para a demonstração.",
            },
        ],
    };

    setDbForTests({
        collection(name) {
            return {
                find() {
                    return cursor(rows[name], traces[name]);
                },
                async countDocuments() {
                    return 3;
                },
            };
        },
    });

    const notifications = await listMyNotifications(String(new ObjectId()), {
        page: "1",
        limit: "1",
    });
    const applications = await listCharityApplications({
        status: "rejected",
        page: "1",
        limit: "1",
    });

    assert.equal(notifications.notifications[0].id, String(notificationId));
    assert.equal(notifications.notifications[0].title, "Atualização FaithFlix 1");
    assert.equal(
        notifications.notifications[0].message,
        "Há uma nova atualização na tua conta FaithFlix.",
    );
    assert.equal(notifications.totalPages, 3);
    assert.deepEqual(traces.notifications.sort, {
        createdAt: -1,
        _id: 1,
    });
    assert.equal(applications.applications[0].id, String(applicationId));
    assert.equal(
        applications.applications[0].reviewReason,
        "A documentação apresentada não permite validar a candidatura.",
    );
    assert.equal(applications.totalPages, 3);
    assert.deepEqual(traces.charity_applications.sort, {
        submittedAt: -1,
        _id: 1,
    });
});

test("F5 continue-watching aplica pagina limitada, metadata e ordem estavel", async () => {
    const userId = new ObjectId();
    const contentIds = [new ObjectId(), new ObjectId(), new ObjectId()];
    const trace = {};
    const progressRows = contentIds.map((contentId, index) => ({
        _id: new ObjectId(),
        currentTimeSeconds: 30 + index,
        durationSeconds: 120,
        lastWatchedAt: new Date(2026, 6, 10 - index),
        content: {
            _id: contentId,
            title: `Conteudo ${index + 1}`,
            slug: `conteudo-${index + 1}`,
            status: "published",
            mediaStatus: "ready",
            ageRating: 6,
            assets: { posterUrl: "/poster.webp" },
            media: {
                url: `/api/media/${contentId}`,
                protocol: "progressive",
                mimeType: "video/mp4",
                quality: "1080p",
            },
            tracks: { audio: [], subtitles: [] },
            qualityOptions: [],
        },
    }));

    setDbForTests({
        collection(name) {
            if (name === "users") {
                return {
                    async findOne() {
                        return {
                            _id: userId,
                            parentalMaxAgeRating: 12,
                            accountStatus: "active",
                        };
                    },
                };
            }
            if (name === "subscriptions") {
                return {
                    async findOne() {
                        return {
                            _id: new ObjectId(),
                            userId,
                            status: "active",
                            planCode: "faithflix-monthly",
                            currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
                        };
                    },
                };
            }
            if (name === "subscription_plans") {
                return {
                    async findOne() {
                        return {
                            code: "faithflix-monthly",
                            active: true,
                            tier: "pro",
                            maxQuality: "1080p",
                            familySharing: false,
                            maxFamilyMembers: 1,
                        };
                    },
                };
            }
            if (name === "subscription_family_memberships") {
                return { async findOne() { return null; } };
            }
            if (name === "playback_progress") {
                return {
                    aggregate(pipeline) {
                        trace.pipeline = pipeline;
                        return {
                            async toArray() {
                                return progressRows;
                            },
                        };
                    },
                };
            }
            throw new Error(`Colecao inesperada: ${name}`);
        },
    });

    const result = await listContinueWatching(String(userId), {
        page: "2",
        limit: "1",
    });
    assert.deepEqual(trace.pipeline[1], {
        $sort: { lastWatchedAt: -1, _id: 1 },
    });
    assert.equal(trace.pipeline.some((stage) => stage.$facet), false);
    assert.equal(result.items[0].id, String(contentIds[1]));
    assert.equal(result.items[0].canResume, true);
    assert.deepEqual(
        {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
        { page: 2, limit: 1, total: 3, totalPages: 3 },
    );
});
