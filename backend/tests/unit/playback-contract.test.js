/**
 * @file Contratos unitários do playback canónico da Fase 4.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
    getPlayback,
    listContinueWatching,
    savePlaybackProgress,
} from "../../src/modules/playback/playback.service.js";

/**
 * Compara valores MongoDB usados pelos doubles desta suite.
 *
 * @param {unknown} actual Valor do documento.
 * @param {unknown} expected Filtro esperado.
 * @returns {boolean} Verdadeiro quando o valor satisfaz o filtro.
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
 * Aplica o subset de filtros MongoDB necessário aos serviços de playback.
 *
 * @param {Record<string, unknown>} row Documento candidato.
 * @param {Record<string, unknown>} query Filtro MongoDB simplificado.
 * @returns {boolean} Verdadeiro quando o documento corresponde.
 */
function matches(row, query = {}) {
    return Object.entries(query).every(([key, expected]) =>
        matchesValue(row[key], expected),
    );
}

/**
 * Cria uma coleção in-memory com operações mínimas de leitura/escrita.
 *
 * @param {Record<string, unknown>[]} initialRows Documentos iniciais.
 * @param {{ findOneError?: Error, aggregateRows?: Record<string, unknown>[] }} [options] Falhas e resultados especiais.
 * @returns {Record<string, unknown>} Double de coleção MongoDB.
 */
function collection(initialRows = [], options = {}) {
    const rows = initialRows;

    return {
        rows,
        async createIndex() {},
        async findOne(query = {}) {
            if (options.findOneError) {
                throw options.findOneError;
            }

            return rows.find((row) => matches(row, query)) ?? null;
        },
        find(query = {}) {
            let result = rows.filter((row) => matches(row, query));
            return {
                sort(sort = {}) {
                    const fields = Object.entries(sort);
                    result = [...result].sort((left, right) => {
                        for (const [field, direction] of fields) {
                            if (left[field] < right[field]) return -1 * direction;
                            if (left[field] > right[field]) return 1 * direction;
                        }
                        return 0;
                    });
                    return this;
                },
                async toArray() {
                    return result;
                },
            };
        },
        async updateOne(filter, update, updateOptions = {}) {
            let row = rows.find((candidate) => matches(candidate, filter));

            if (!row && updateOptions.upsert) {
                row = { ...filter, ...(update.$setOnInsert ?? {}) };
                rows.push(row);
            }

            if (!row) {
                return { matchedCount: 0, modifiedCount: 0 };
            }

            Object.assign(row, update.$set ?? {});
            return { matchedCount: 1, modifiedCount: 1 };
        },
        async insertOne(document) {
            const insertedId = document._id ?? new ObjectId();
            rows.push({ ...document, _id: insertedId });
            return { insertedId };
        },
        aggregate() {
            return {
                async toArray() {
                    return options.aggregateRows ?? [];
                },
            };
        },
    };
}

/**
 * Instala uma base mínima com utilizador Pro e uma subscrição ativa.
 *
 * @param {{ content: Record<string, unknown>, preferences?: Record<string, string>, overrides?: Record<string, ReturnType<typeof collection>> }} input Dados variáveis do cenário.
 * @returns {{ userId: ObjectId, contentId: ObjectId, collections: Record<string, ReturnType<typeof collection>> }} Identificadores e coleções observáveis.
 */
function installPlaybackDb({ content, preferences = {}, overrides = {} }) {
    const userId = content.userId ?? new ObjectId();
    const contentId = content._id ?? new ObjectId();
    const collections = {
        users: collection([
            {
                _id: userId,
                parentalMaxAgeRating: 18,
                accountStatus: "active",
            },
        ]),
        contents: collection([{ ...content, _id: contentId }]),
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
                    ...preferences,
                },
            },
        ]),
        playback_progress: collection([]),
        notification_preferences: collection([]),
        user_consents: collection([]),
        notifications: collection([]),
        ...overrides,
    };

    setDbForTests({
        collection(name) {
            collections[name] ??= collection([]);
            return collections[name];
        },
    });

    return { userId, contentId, collections };
}

/**
 * Cria conteúdo publicado e pronto com uma variante de qualidade.
 *
 * @param {Record<string, unknown>} source Campos internos da fonte.
 * @returns {Record<string, unknown>} Conteúdo apto para getPlayback.
 */
function readyContent(source) {
    const protectedUrl =
        typeof source?.url === "string" && source.url.startsWith("/api/media/")
            ? source.url
            : `/api/media/${new ObjectId()}`;
    return {
        _id: new ObjectId(),
        title: "Fixture canónica de playback",
        slug: "fixture-canonica-playback",
        status: "published",
        mediaStatus: "ready",
        ageRating: 6,
        durationSeconds: 300,
        media: {
            url: protectedUrl,
            protocol: source?.protocol ?? "progressive",
            mimeType: source?.mimeType ?? "video/mp4",
            quality: "1080p",
        },
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [],
    };
}

afterEach(() => {
    setDbForTests(null);
});

for (const sourceCase of [{
    protocol: "progressive",
    mimeType: "video/mp4",
    url: "/api/media/64f200000000000000000001",
}]) {
    test(`playback devolve uma única fonte ${sourceCase.protocol} explícita`, async () => {
        const content = readyContent({
            url: sourceCase.url,
            protocol: sourceCase.protocol,
            mimeType: sourceCase.mimeType,
        });
        const { userId, contentId } = installPlaybackDb({ content });

        const response = await getPlayback(String(contentId), String(userId));

        assert.deepEqual(response.content.source, sourceCase);
        assert.equal(response.content.selectedQuality, "1080p");
        assert.deepEqual(response.content.qualityOptions, []);
        assert.equal("media" in response.content, false);
    });
}

test("playback rejeita URLs legacy e protocolos HLS/DASH no produto", async () => {
    const legacyContent = readyContent({
        protocol: "progressive",
        mimeType: "video/mp4",
    });
    legacyContent.media.url = "/public/legacy.mp4";
    const legacy = installPlaybackDb({ content: legacyContent });
    await assert.rejects(
        () => getPlayback(String(legacy.contentId), String(legacy.userId)),
        (error) => error.statusCode === 409 && error.code === "MEDIA_NOT_READY",
    );

    const invalidContent = readyContent({
        protocol: "hls",
        mimeType: "application/vnd.apple.mpegurl",
    });
    const invalid = installPlaybackDb({ content: invalidContent });

    await assert.rejects(
        () => getPlayback(String(invalid.contentId), String(invalid.userId)),
        (error) => error.statusCode === 409 && error.code === "MEDIA_NOT_READY",
    );
});

test("qualidade desconhecida fica locked e nunca é a fonte canónica", async () => {
    const content = readyContent({});
    content.qualityOptions.push({
        value: "ultra",
        label: "Ultra desconhecida",
        source: {
            url: `/api/media/${new ObjectId()}`,
            protocol: "progressive",
            mimeType: "video/mp4",
        },
    });
    const { userId, contentId } = installPlaybackDb({
        content,
        preferences: { quality: "ultra" },
    });

    const response = await getPlayback(String(contentId), String(userId));

    assert.equal(response.content.source.url, content.media.url);
    assert.equal(response.content.selectedQuality, "1080p");
    assert.equal(response.content.qualityOptions[0].locked, true);
    assert.equal(response.content.qualityOptions[0].selected, false);
});

test("containers media malformados são normalizados sem 500 ou fonte ambígua", async () => {
    const content = readyContent({});
    content.media = {
        url: "/api/media/64f200000000000000000002",
        protocol: "progressive",
        mimeType: "video/mp4",
        quality: "720p",
    };
    content.qualityOptions = {};
    content.tracks = { subtitles: {}, audio: {} };
    const { userId, contentId } = installPlaybackDb({ content });

    const response = await getPlayback(String(contentId), String(userId));

    assert.deepEqual(response.content.source, {
        url: "/api/media/64f200000000000000000002",
        protocol: "progressive",
        mimeType: "video/mp4",
    });
    assert.deepEqual(response.content.qualityOptions, []);
    assert.deepEqual(response.content.tracks, { subtitles: [], audio: [] });
});

test("progresso recusa parental e media pending antes de qualquer escrita", async () => {
    const parentalContent = readyContent({
        playbackUrl: "/__fixtures__/parental.mp4",
    });
    parentalContent.ageRating = 16;
    const parentalUserId = new ObjectId();
    parentalContent.userId = parentalUserId;
    const parental = installPlaybackDb({ content: parentalContent });
    parental.collections.users.rows[0].parentalMaxAgeRating = 12;

    await assert.rejects(
        () =>
            savePlaybackProgress(
                String(parental.contentId),
                String(parental.userId),
                { currentTimeSeconds: 70 },
            ),
        (error) => error.statusCode === 403 && /parental/u.test(error.message),
    );
    assert.equal(parental.collections.playback_progress.rows.length, 0);

    const pendingContent = readyContent({
        playbackUrl: "/__fixtures__/pending.mp4",
    });
    pendingContent.mediaStatus = "pending";
    const pending = installPlaybackDb({ content: pendingContent });

    await assert.rejects(
        () =>
            savePlaybackProgress(
                String(pending.contentId),
                String(pending.userId),
                { currentTimeSeconds: 70 },
            ),
        (error) => error.statusCode === 409 && error.code === "MEDIA_NOT_READY",
    );
    assert.equal(pending.collections.playback_progress.rows.length, 0);
});

test("falha da notificação opcional não converte progresso persistido em erro", async () => {
    const content = readyContent({
        playbackUrl: "/__fixtures__/progress.mp4",
    });
    const notificationFailure = new Error("notification unavailable");
    const setup = installPlaybackDb({
        content,
        overrides: {
            notification_preferences: collection([], {
                findOneError: notificationFailure,
            }),
        },
    });

    const progress = await savePlaybackProgress(
        String(setup.contentId),
        String(setup.userId),
        { currentTimeSeconds: 70 },
    );

    assert.equal(progress.currentTimeSeconds, 70);
    assert.equal(setup.collections.playback_progress.rows.length, 1);
    assert.equal(
        setup.collections.playback_progress.rows[0].currentTimeSeconds,
        70,
    );
});

test("continue-watching exclui draft, parental, pending e fonte desconhecida", async () => {
    const userId = new ObjectId();
    const now = new Date("2026-07-10T10:00:00.000Z");
    const createRow = (content) => ({
        _id: new ObjectId(),
        userId,
        contentId: content._id,
        currentTimeSeconds: 80,
        durationSeconds: 300,
        completed: false,
        lastWatchedAt: now,
        content,
    });
    const allowed = {
        ...readyContent({}),
        qualityOptions: [],
    };
    const pending = {
        ...allowed,
        _id: new ObjectId(),
        title: "Pending",
        mediaStatus: "pending",
    };
    const parental = {
        ...allowed,
        _id: new ObjectId(),
        title: "Parental",
        ageRating: 16,
    };
    const draft = {
        ...allowed,
        _id: new ObjectId(),
        title: "Draft",
        status: "draft",
    };
    const unknown = {
        ...allowed,
        _id: new ObjectId(),
        title: "Unknown",
        media: { url: "/public/unknown.mp4", protocol: "progressive", mimeType: "video/mp4" },
    };
    const joinedRows = [allowed, pending, parental, draft, unknown].map(createRow);
    const progressCollection = collection([], {
        aggregateRows: joinedRows,
    });

    setDbForTests({
        collection(name) {
            if (name === "users") {
                return collection([{
                    _id: userId,
                    parentalMaxAgeRating: 12,
                    accountStatus: "active",
                }]);
            }
            if (name === "playback_progress") return progressCollection;
            if (name === "subscriptions") {
                return collection([{
                    _id: new ObjectId(),
                    userId,
                    status: "active",
                    planCode: "faithflix-monthly",
                    currentPeriodEnd: new Date("2999-01-01T00:00:00.000Z"),
                }]);
            }
            if (name === "subscription_plans") {
                return collection([{
                    code: "faithflix-monthly",
                    active: true,
                    tier: "pro",
                    maxQuality: "1080p",
                    familySharing: false,
                    maxFamilyMembers: 1,
                }]);
            }
            return collection([]);
        },
    });

    const result = await listContinueWatching(String(userId));

    assert.deepEqual(result.items.map((item) => item.title), [allowed.title]);
    assert.equal(result.items[0].mediaStatus, "ready");
    assert.equal(result.items[0].isPlayable, true);
    assert.equal(result.items[0].canResume, true);
    assert.equal(result.page, 1);
    assert.equal(result.limit, 12);
    assert.equal(result.total, 1);
});

test("série não reproduz e episódio devolve contexto canónico entre temporadas", async () => {
    const series = {
        ...readyContent({}),
        _id: new ObjectId(),
        type: "series",
        title: "Caminhos de Fé",
        slug: "caminhos-de-fe",
    };
    const blocked = installPlaybackDb({ content: series });
    await assert.rejects(
        () => getPlayback(String(blocked.contentId), String(blocked.userId)),
        (error) => error.code === "SERIES_NOT_PLAYABLE",
    );

    const previous = {
        ...readyContent({}),
        _id: new ObjectId(),
        type: "episode",
        title: "Fim da primeira temporada",
        slug: "fim-primeira-temporada",
        seriesId: series._id,
        seasonNumber: 1,
        episodeNumber: 8,
    };
    const episode = {
        ...readyContent({}),
        _id: new ObjectId(),
        type: "episode",
        title: "Novo começo",
        slug: "novo-comeco",
        seriesId: series._id,
        seasonNumber: 2,
        episodeNumber: 1,
    };
    const next = {
        ...readyContent({}),
        _id: new ObjectId(),
        type: "episode",
        title: "Segundo passo",
        slug: "segundo-passo",
        seriesId: series._id,
        seasonNumber: 2,
        episodeNumber: 2,
    };
    const setup = installPlaybackDb({
        content: episode,
        overrides: {
            contents: collection([series, previous, episode, next]),
        },
    });

    const response = await getPlayback(
        String(episode._id),
        String(setup.userId),
    );
    assert.equal(response.content.type, "episode");
    assert.equal(response.series.id, String(series._id));
    assert.equal(response.previousEpisode.id, String(previous._id));
    assert.equal(response.nextEpisode.id, String(next._id));
    assert.equal(
        response.canonicalPath,
        "/catalogo/caminhos-de-fe/episodios/novo-comeco",
    );
});
