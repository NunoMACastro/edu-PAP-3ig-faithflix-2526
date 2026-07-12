/**
 * @file Testes transacionais do catalogo administrativo.
 *
 * A suite usa uma DB estritamente in-memory com rollback para provar que
 * revisoes, conteudo e audit log formam uma unica unidade atomica, sem abrir
 * ligacoes, executar seeds ou depender da base configurada.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import {
    changeContentStatus,
    createContent,
    assertCatalogHierarchyReady,
    ensureCatalogIndexes,
    getAdminCatalogContent,
    getAdminCatalogOptions,
    getPublishedContentDetail,
    listAdminCatalog,
    listContentRevisions,
    listPublishedCatalog,
    revertContentRevision,
    updateContent,
} from "../../src/modules/catalog/catalog.service.js";
import {
    assertExpectedVersion,
    assertTaxonomyPayload,
    assertTaxonomyStatusPayload,
    parseAdminCatalogSort,
    parseAdminTaxonomyQuery,
} from "../../src/modules/catalog/catalog.validation.js";
import {
    changeTaxonomyStatus,
    createTaxonomy,
    listAdminTaxonomies,
    listTaxonomies,
    updateTaxonomy,
} from "../../src/modules/catalog/taxonomy.service.js";

/**
 * Clona os tipos usados nos documentos de teste sem perder ObjectId ou Date.
 *
 * @param {unknown} value Valor original.
 * @returns {unknown} Copia independente.
 */
function cloneValue(value) {
    if (value instanceof ObjectId) {
        return new ObjectId(value.toHexString());
    }

    if (value instanceof Date) {
        return new Date(value.getTime());
    }

    if (Array.isArray(value)) {
        return value.map(cloneValue);
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, nested]) => [
                key,
                cloneValue(nested),
            ]),
        );
    }

    return value;
}

/**
 * Compara valores primitivos e ObjectId pelo seu valor canonico.
 *
 * @param {unknown} actual Valor no documento.
 * @param {unknown} expected Valor do filtro.
 * @returns {boolean} Resultado da comparacao.
 */
function matchesValue(actual, expected) {
    if (Array.isArray(actual) && !Array.isArray(expected)) {
        return actual.some((value) => matchesValue(value, expected));
    }

    if (expected instanceof ObjectId) {
        return String(actual) === String(expected);
    }

    if (expected && typeof expected === "object") {
        if ("$exists" in expected) {
            return (actual !== undefined) === expected.$exists;
        }

        if ("$in" in expected) {
            return expected.$in.some((candidate) =>
                matchesValue(actual, candidate),
            );
        }

        if ("$regex" in expected) {
            return new RegExp(expected.$regex, expected.$options ?? "").test(
                String(actual ?? ""),
            );
        }
    }

    return actual === expected;
}

/**
 * Avalia a subset de filtros MongoDB usada pelo service de catalogo.
 *
 * @param {Record<string, unknown>} row Documento candidato.
 * @param {Record<string, unknown>} filter Filtro MongoDB simplificado.
 * @returns {boolean} Verdadeiro quando o documento corresponde.
 */
function matches(row, filter = {}) {
    return Object.entries(filter).every(([key, expected]) => {
        if (key === "$or") {
            return expected.some((branch) => matches(row, branch));
        }

        return matchesValue(row[key], expected);
    });
}

/**
 * Normaliza valores usados pelo sort simplificado dos cursores de teste.
 *
 * @param {unknown} value Valor MongoDB ou primitivo.
 * @returns {unknown} Valor comparável de forma determinística.
 */
function comparableValue(value) {
    if (value instanceof ObjectId) return value.toHexString();
    if (value instanceof Date) return value.getTime();
    return value;
}

/**
 * Cria o comparador para os sorts estáveis usados pelo catálogo.
 *
 * @param {Record<string, 1 | -1>} sort Ordenação MongoDB simplificada.
 * @returns {(left: object, right: object) => number} Comparador.
 */
function compareBySort(sort = {}) {
    return (left, right) => {
        for (const [field, direction] of Object.entries(sort)) {
            const leftValue = comparableValue(left[field]);
            const rightValue = comparableValue(right[field]);

            if (leftValue < rightValue) return -1 * direction;
            if (leftValue > rightValue) return 1 * direction;
        }

        return 0;
    };
}

/**
 * DB transacional minima para fault injection e observacao de sessoes.
 */
class TransactionalCatalogDb {
    /**
     * Cria tabelas isoladas para cada teste.
     *
     * @param {Record<string, Record<string, unknown>[]>} initialRows Dados iniciais.
     */
    constructor(initialRows = {}) {
        this.tables = new Map(
            Object.entries(initialRows).map(([name, rows]) => [
                name,
                cloneValue(rows),
            ]),
        );
        this.session = { testTransaction: true };
        this.writeOperations = [];
        this.failNextContentUpdate = false;
        this.missNextContentUpdate = false;
        this.failNextAuditInsert = false;
        this.indexDefinitions = [];
    }

    /**
     * Devolve a tabela, criando-a quando ainda nao existe.
     *
     * @param {string} name Nome da colecao.
     * @returns {Record<string, unknown>[]} Linhas mutaveis.
     */
    rows(name) {
        if (!this.tables.has(name)) {
            this.tables.set(name, []);
        }

        return this.tables.get(name);
    }

    /**
     * Executa trabalho atomico e restaura todas as tabelas quando ha erro.
     *
     * @template T
     * @param {(context: { db: TransactionalCatalogDb, session: object }) => Promise<T>} work Unidade de trabalho.
     * @returns {Promise<T>} Resultado depois do commit simulado.
     */
    async runInTransaction(work) {
        const snapshot = new Map(
            [...this.tables.entries()].map(([name, rows]) => [
                name,
                cloneValue(rows),
            ]),
        );
        const operationCount = this.writeOperations.length;

        try {
            return await work({ db: this, session: this.session });
        } catch (error) {
            this.tables = snapshot;
            this.writeOperations.length = operationCount;
            throw error;
        }
    }

    /**
     * Expoe uma subset do contrato de Collection do driver MongoDB.
     *
     * @param {string} name Nome da colecao.
     * @returns {Record<string, Function>} Collection fake.
     */
    collection(name) {
        return {
            createIndex: async (keys, options = {}) => {
                this.indexDefinitions.push({
                    collection: name,
                    keys: cloneValue(keys),
                    options: cloneValue(options),
                });
                return `${name}_index`;
            },
            find: (filter = {}) => {
                let result = this.rows(name).filter((row) =>
                    matches(row, filter),
                );

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
                    toArray: async () => cloneValue(result),
                };
            },
            countDocuments: async (filter = {}) =>
                this.rows(name).filter((row) => matches(row, filter)).length,
            findOne: async (filter = {}) => {
                const row = this.rows(name).find((candidate) =>
                    matches(candidate, filter),
                );
                return row ? cloneValue(row) : null;
            },
            insertOne: async (document, options = {}) => {
                if (name === "admin_audit_logs" && this.failNextAuditInsert) {
                    this.failNextAuditInsert = false;
                    throw new Error("audit write failed");
                }

                const insertedId = document._id ?? new ObjectId();
                this.rows(name).push(
                    cloneValue({ ...document, _id: insertedId }),
                );
                this.writeOperations.push({
                    collection: name,
                    operation: "insertOne",
                    session: options.session,
                });
                return { insertedId };
            },
            findOneAndUpdate: async (filter, update, options = {}) => {
                if (name === "contents" && this.failNextContentUpdate) {
                    this.failNextContentUpdate = false;
                    throw new Error("content update failed");
                }

                if (name === "contents" && this.missNextContentUpdate) {
                    this.missNextContentUpdate = false;
                    return null;
                }

                const row = this.rows(name).find((candidate) =>
                    matches(candidate, filter),
                );

                if (!row) {
                    return null;
                }

                Object.assign(row, cloneValue(update.$set ?? {}));
                this.writeOperations.push({
                    collection: name,
                    operation: "findOneAndUpdate",
                    session: options.session,
                });
                return cloneValue(row);
            },
        };
    }
}

/**
 * Constroi campos editoriais validos para criacao ou atualizacao.
 *
 * @param {Record<string, unknown>} overrides Campos substituidos pelo teste.
 * @returns {Record<string, unknown>} Payload completo.
 */
function catalogPayload(overrides = {}) {
    return {
        title: "Filme de teste",
        synopsis: "Uma sinopse suficientemente longa para validar o catalogo.",
        type: "movie",
        durationSeconds: 120,
        ageRating: 6,
        releaseYear: 2025,
        taxonomyIds: [],
        assets: {
            posterUrl: "/poster.webp",
            backdropUrl: "",
            previewUrl: "/previews/filme.mp4",
        },
        credits: {
            directors: ["Realizador Demo"],
            creators: [],
            cast: [{ name: "Atriz Demo", role: "Protagonista" }],
        },
        ...overrides,
    };
}

/**
 * Cria um documento persistido com metadados editoriais previsiveis.
 *
 * @param {Record<string, unknown>} overrides Campos substituidos pelo teste.
 * @returns {Record<string, unknown>} Documento MongoDB in-memory.
 */
function storedContent(overrides = {}) {
    const now = new Date("2026-07-09T10:00:00.000Z");
    return {
        _id: new ObjectId(),
        ...catalogPayload(),
        slug: "filme-de-teste",
        version: 1,
        status: "draft",
        media: { playbackUrl: "" },
        mediaStatus: "pending",
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [],
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
        createdBy: new ObjectId(),
        updatedBy: new ObjectId(),
        ...overrides,
    };
}

afterEach(() => {
    setDbForTests(null);
});

test("expectedVersion exige um numero JSON inteiro positivo", () => {
    assert.equal(assertExpectedVersion(2), 2);
    assert.throws(
        () => assertExpectedVersion("2"),
        (error) =>
            error.statusCode === 400 &&
            error.code === "EXPECTED_VERSION_REQUIRED",
    );
    assert.throws(
        () => assertExpectedVersion(undefined),
        (error) => error.code === "EXPECTED_VERSION_REQUIRED",
    );
});

test("ordenação e filtros administrativos recusam enums e limites inválidos", () => {
    assert.deepEqual(parseAdminCatalogSort({}), {
        sort: "updatedAt",
        direction: "desc",
    });
    assert.deepEqual(parseAdminCatalogSort({ sort: "title", direction: "asc" }), {
        sort: "title",
        direction: "asc",
    });
    assert.throws(
        () => parseAdminCatalogSort({ sort: "createdBy" }),
        (error) => error.statusCode === 400,
    );
    assert.deepEqual(parseAdminTaxonomyQuery({ status: "active", page: "2" }), {
        page: 2,
        limit: 20,
        search: "",
        status: "active",
    });
    assert.throws(
        () => parseAdminTaxonomyQuery({ status: "deleted" }),
        (error) => error.statusCode === 400,
    );
    assert.throws(
        () => assertTaxonomyPayload({ name: "Família", admin: true }),
        (error) => error.code === "TAXONOMY_FIELD_INVALID",
    );
    assert.throws(
        () => assertTaxonomyStatusPayload({ status: "active", expectedVersion: 1, delete: true }),
        (error) => error.code === "TAXONOMY_FIELD_INVALID",
    );
});

test("detalhe admin obtém draft por id e opções devolvem apenas séries", async () => {
    const movie = storedContent({ title: "Rascunho direto" });
    const series = storedContent({
        _id: new ObjectId("64f300000000000000000099"),
        title: "Série disponível",
        type: "series",
        status: "archived",
    });
    const db = new TransactionalCatalogDb({ contents: [movie, series] });
    setDbForTests(db);

    const detail = await getAdminCatalogContent(String(movie._id));
    const options = await getAdminCatalogOptions();

    assert.equal(detail.title, "Rascunho direto");
    assert.equal(detail.status, "draft");
    assert.ok(detail.updatedAt instanceof Date);
    assert.deepEqual(options.seriesOptions, [
        { id: String(series._id), title: "Série disponível", status: "archived" },
    ]);
    await assert.rejects(
        () => getAdminCatalogContent("invalid"),
        (error) => error.statusCode === 400,
    );
});

test("taxonomias admin contam utilizações e arquivo preserva ligações", async () => {
    const taxonomyId = new ObjectId("64f300000000000000000088");
    const actorId = new ObjectId();
    const taxonomy = {
        _id: taxonomyId,
        name: "Família",
        slug: "familia",
        description: "Conteúdos familiares",
        createdAt: new Date("2026-07-10T10:00:00.000Z"),
        updatedAt: new Date("2026-07-10T10:00:00.000Z"),
    };
    const content = storedContent({ taxonomyIds: [taxonomyId] });
    const db = new TransactionalCatalogDb({
        taxonomies: [taxonomy],
        contents: [content],
    });
    setDbForTests(db);

    const page = await listAdminTaxonomies({ status: "active" });
    assert.equal(page.items[0].usageCount, 1);
    assert.equal(page.items[0].version, 1);
    assert.equal(page.items[0].status, "active");

    const updated = await updateTaxonomy(
        String(taxonomyId),
        {
            name: "Famílias",
            slug: "familias",
            description: "Conteúdos para famílias",
            expectedVersion: 1,
        },
        String(actorId),
    );
    assert.equal(updated.version, 2);
    assert.equal(updated.usageCount, 1);

    const archived = await changeTaxonomyStatus(
        String(taxonomyId),
        { status: "archived", expectedVersion: 2 },
        String(actorId),
    );
    assert.equal(archived.status, "archived");
    assert.equal(db.rows("contents")[0].taxonomyIds.length, 1);
    assert.deepEqual(await listTaxonomies(), []);
    assert.equal(db.rows("admin_audit_logs").length, 2);
});

test("criacao inicializa version 1 e audit no mesmo commit", async () => {
    const db = new TransactionalCatalogDb();
    const actorId = new ObjectId();
    setDbForTests(db);

    const created = await createContent(
        catalogPayload({
            media: { playbackUrl: "/private/injected.mp4" },
            mediaStatus: "ready",
            tracks: {
                subtitles: [
                    { language: "pt", label: "PT", src: "/private.vtt" },
                ],
            },
            qualityOptions: [
                {
                    label: "HD",
                    value: "720p",
                    playbackUrl: "/private-720.mp4",
                },
            ],
        }),
        String(actorId),
        { requestId: "request-catalog-create" },
    );

    assert.equal(created.version, 1);
    assert.equal(created.status, "draft");
    assert.equal(created.mediaStatus, "pending");
    assert.equal(created.media.playbackUrl, "");
    assert.deepEqual(created.tracks, { subtitles: [], audio: [] });
    assert.deepEqual(created.qualityOptions, []);
    assert.equal(created.assets.previewUrl, "/previews/filme.mp4");
    assert.equal(created.credits.cast[0].name, "Atriz Demo");
    assert.equal(db.rows("contents").length, 1);
    assert.equal(db.rows("admin_audit_logs").length, 1);
    assert.equal(
        db.rows("admin_audit_logs")[0].requestId,
        "request-catalog-create",
    );
});

test("detalhe publico resolve taxonomias sem alterar os ids existentes", async () => {
    const taxonomy = {
        _id: new ObjectId(),
        name: "Família",
        slug: "familia",
    };
    const content = storedContent({
        status: "published",
        taxonomyIds: [taxonomy._id],
        releaseYear: 2025,
    });
    const db = new TransactionalCatalogDb({
        contents: [content],
        taxonomies: [taxonomy],
    });
    setDbForTests(db);

    const detail = await getPublishedContentDetail(content.slug);

    assert.deepEqual(detail.content.taxonomyIds, [String(taxonomy._id)]);
    assert.deepEqual(detail.content.taxonomies, [
        { id: String(taxonomy._id), name: "Família", slug: "familia" },
    ]);
});

test("falha do audit reverte criação de conteúdo e taxonomia", async () => {
    const actorId = new ObjectId();
    const contentDb = new TransactionalCatalogDb();
    contentDb.failNextAuditInsert = true;
    setDbForTests(contentDb);
    await assert.rejects(
        () => createContent(catalogPayload(), String(actorId)),
        /audit write failed/,
    );
    assert.equal(contentDb.rows("contents").length, 0);

    const taxonomyDb = new TransactionalCatalogDb();
    taxonomyDb.failNextAuditInsert = true;
    setDbForTests(taxonomyDb);
    await assert.rejects(
        () => createTaxonomy(
            {
                name: "Esperança",
                slug: "esperanca",
                description: "Conteúdos sobre esperança cristã.",
            },
            String(actorId),
        ),
        /audit write failed/,
    );
    assert.equal(taxonomyDb.rows("taxonomies").length, 0);
});

test("update preserva media, guarda revisao, avanca versao e recusa CAS obsoleto", async () => {
    const content = storedContent({
        media: { playbackUrl: "/private/current.mp4" },
        mediaStatus: "ready",
        tracks: {
            subtitles: [
                { language: "pt", label: "Portugues", src: "/current.vtt" },
            ],
            audio: [],
        },
        qualityOptions: [
            {
                label: "HD",
                value: "720p",
                playbackUrl: "/current-720.mp4",
            },
        ],
    });
    const db = new TransactionalCatalogDb({ contents: [content] });
    const actorId = new ObjectId();
    setDbForTests(db);

    const updated = await updateContent(
        String(content._id),
        catalogPayload({ title: "Titulo atualizado", expectedVersion: 1 }),
        String(actorId),
        { requestId: "request-catalog-update" },
    );

    assert.equal(updated.title, "Titulo atualizado");
    assert.equal(updated.version, 2);
    assert.deepEqual(updated.media, content.media);
    assert.deepEqual(updated.tracks, content.tracks);
    assert.deepEqual(updated.qualityOptions, content.qualityOptions);
    assert.equal(updated.mediaStatus, "ready");
    assert.equal(updated.releaseYear, 2025);
    assert.equal(updated.assets.previewUrl, "/previews/filme.mp4");
    assert.equal(updated.credits.directors[0], "Realizador Demo");
    assert.equal(db.rows("content_revisions").length, 1);
    assert.equal(db.rows("content_revisions")[0].snapshot.version, 1);
    assert.equal(db.rows("admin_audit_logs").length, 1);
    assert.equal(
        db.rows("admin_audit_logs")[0].requestId,
        "request-catalog-update",
    );
    assert.ok(
        db.writeOperations.every(
            (operation) => operation.session === db.session,
        ),
    );

    await assert.rejects(
        updateContent(
            String(content._id),
            catalogPayload({ title: "Escrita obsoleta", expectedVersion: 1 }),
            String(actorId),
        ),
        (error) =>
            error.statusCode === 409 &&
            error.code === "CONTENT_VERSION_CONFLICT",
    );

    assert.equal(db.rows("contents")[0].title, "Titulo atualizado");
    assert.equal(db.rows("content_revisions").length, 1);
    assert.equal(db.rows("admin_audit_logs").length, 1);
});

test("PATCH parcial preserva campos omitidos e valida a allowlist", async () => {
    const content = storedContent({
        title: "Titulo original",
        assets: {
            posterUrl: "/poster-original.webp",
            backdropUrl: "/backdrop-original.webp",
            previewUrl: "/preview-original.mp4",
        },
    });
    const db = new TransactionalCatalogDb({ contents: [content] });
    const actorId = String(new ObjectId());
    setDbForTests(db);

    const updated = await updateContent(
        String(content._id),
        { expectedVersion: 1, title: "Titulo parcial" },
        actorId,
    );

    assert.equal(updated.title, "Titulo parcial");
    assert.equal(updated.synopsis, content.synopsis);
    assert.equal(updated.type, content.type);
    assert.equal(updated.releaseYear, content.releaseYear);
    assert.deepEqual(updated.assets, content.assets);
    assert.deepEqual(updated.credits, content.credits);

    await assert.rejects(
        updateContent(
            String(content._id),
            { expectedVersion: 2, unknownEditorialField: true },
            actorId,
        ),
        (error) =>
            error.code === "CATALOG_UPDATE_FIELD_INVALID" &&
            error.details.field === "unknownEditorialField",
    );
    await assert.rejects(
        updateContent(
            String(content._id),
            { expectedVersion: 2 },
            actorId,
        ),
        (error) => error.code === "CATALOG_UPDATE_EMPTY",
    );
    await assert.rejects(
        updateContent(
            String(content._id),
            { expectedVersion: 2, type: "series", title: "Outro tipo" },
            actorId,
        ),
        (error) => error.code === "CATALOG_TYPE_IMMUTABLE",
    );

    assert.equal(db.rows("contents")[0].version, 2);
    assert.equal(db.rows("content_revisions").length, 1);
    assert.equal(db.rows("admin_audit_logs").length, 1);
});

test("PATCH parcial funde assets e creditos sem apagar subcampos omitidos", async () => {
    const content = storedContent();
    const db = new TransactionalCatalogDb({ contents: [content] });
    setDbForTests(db);

    const updated = await updateContent(
        String(content._id),
        {
            expectedVersion: 1,
            assets: { posterUrl: "/poster-novo.webp" },
            credits: { directors: ["Nova Realizadora"] },
        },
        String(new ObjectId()),
    );

    assert.equal(updated.assets.posterUrl, "/poster-novo.webp");
    assert.equal(updated.assets.previewUrl, content.assets.previewUrl);
    assert.deepEqual(updated.credits.directors, ["Nova Realizadora"]);
    assert.deepEqual(updated.credits.cast, content.credits.cast);
});

test("update rejeita qualquer campo media antes de criar revisão ou audit", async () => {
    const content = storedContent();
    const db = new TransactionalCatalogDb({ contents: [content] });
    setDbForTests(db);

    for (const [field, value] of [
        ["media", null],
        ["mediaStatus", "pending"],
        ["tracks", {}],
        ["qualityOptions", []],
        ["playbackUrl", ""],
        ["src", ""],
    ]) {
        await assert.rejects(
            updateContent(
                String(content._id),
                catalogPayload({ expectedVersion: 1, [field]: value }),
                String(new ObjectId()),
            ),
            (error) =>
                error.statusCode === 400 &&
                error.code === "CATALOG_MEDIA_MUTATION_FORBIDDEN" &&
                error.details.field === field,
        );
    }

    assert.equal(db.rows("contents")[0].version, 1);
    assert.equal(db.rows("content_revisions").length, 0);
    assert.equal(db.rows("admin_audit_logs").length, 0);
});

test("documento legado sem version entra no CAS como versao 1", async () => {
    const content = storedContent();
    delete content.version;
    const db = new TransactionalCatalogDb({ contents: [content] });
    setDbForTests(db);

    const updated = await updateContent(
        String(content._id),
        catalogPayload({ expectedVersion: 1 }),
        String(new ObjectId()),
    );

    assert.equal(updated.version, 2);
    assert.equal(db.rows("contents")[0].version, 2);
});

test("CAS perdido depois da leitura aborta tambem a revisao", async () => {
    const content = storedContent();
    const db = new TransactionalCatalogDb({ contents: [content] });
    setDbForTests(db);
    db.missNextContentUpdate = true;

    await assert.rejects(
        updateContent(
            String(content._id),
            catalogPayload({ expectedVersion: 1 }),
            String(new ObjectId()),
        ),
        (error) =>
            error.statusCode === 409 &&
            error.code === "CONTENT_VERSION_CONFLICT",
    );

    assert.equal(db.rows("contents")[0].version, 1);
    assert.equal(db.rows("content_revisions").length, 0);
    assert.equal(db.rows("admin_audit_logs").length, 0);
});

test("falha da escrita de conteudo reverte a revisao previamente inserida", async () => {
    const content = storedContent();
    const db = new TransactionalCatalogDb({ contents: [content] });
    setDbForTests(db);
    db.failNextContentUpdate = true;

    await assert.rejects(
        updateContent(
            String(content._id),
            catalogPayload({ title: "Nao deve persistir", expectedVersion: 1 }),
            String(new ObjectId()),
        ),
        /content update failed/,
    );

    assert.equal(db.rows("contents")[0].title, content.title);
    assert.equal(db.rows("contents")[0].version, 1);
    assert.equal(db.rows("content_revisions").length, 0);
    assert.equal(db.rows("admin_audit_logs").length, 0);
});

test("falha do audit reverte em conjunto update e revisao", async () => {
    const content = storedContent();
    const db = new TransactionalCatalogDb({ contents: [content] });
    setDbForTests(db);
    db.failNextAuditInsert = true;

    await assert.rejects(
        updateContent(
            String(content._id),
            catalogPayload({ title: "Sem commit parcial", expectedVersion: 1 }),
            String(new ObjectId()),
        ),
        /audit write failed/,
    );

    assert.equal(db.rows("contents")[0].title, content.title);
    assert.equal(db.rows("contents")[0].version, 1);
    assert.equal(db.rows("content_revisions").length, 0);
    assert.equal(db.rows("admin_audit_logs").length, 0);
});

test("publish repetido e idempotente e preserva publishedAt", async () => {
    const content = storedContent();
    const db = new TransactionalCatalogDb({ contents: [content] });
    const actorId = String(new ObjectId());
    setDbForTests(db);

    const first = await changeContentStatus(
        String(content._id),
        "published",
        actorId,
        1,
    );
    const second = await changeContentStatus(
        String(content._id),
        "published",
        actorId,
        2,
    );

    assert.equal(first.version, 2);
    assert.equal(second.version, 2);
    assert.equal(first.publishedAt.getTime(), second.publishedAt.getTime());
    assert.equal(db.rows("content_revisions").length, 1);
    assert.equal(db.rows("admin_audit_logs").length, 1);
});

test("revert usa CAS, cria revisao do estado corrente e avanca versao", async () => {
    const content = storedContent({
        title: "Versao corrente",
        slug: "versao-corrente",
        version: 3,
        releaseYear: 2026,
        credits: {
            directors: ["Realizador Atual"],
            creators: [],
            cast: [{ name: "Elenco Atual", role: "Atual" }],
        },
        status: "published",
        publishedAt: new Date("2026-07-09T11:00:00.000Z"),
        media: { playbackUrl: "/private/current.mp4" },
        mediaStatus: "ready",
        tracks: {
            subtitles: [
                { language: "pt", label: "Portugues", src: "/current.vtt" },
            ],
            audio: [],
        },
        qualityOptions: [
            {
                label: "HD",
                value: "720p",
                playbackUrl: "/current-720.mp4",
            },
        ],
    });
    const revisionId = new ObjectId();
    const targetSnapshot = storedContent({
        _id: content._id,
        title: "Versao historica",
        slug: "versao-historica",
        version: 1,
        status: "draft",
        releaseYear: 2020,
        credits: {
            directors: ["Realizadora Historica"],
            creators: ["Criador Historico"],
            cast: [{ name: "Elenco Historico", role: "Historico" }],
        },
        media: { playbackUrl: "/private/historical.mp4" },
        mediaStatus: "failed",
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [],
    });
    const db = new TransactionalCatalogDb({
        contents: [content],
        content_revisions: [
            {
                _id: revisionId,
                contentId: content._id,
                action: "update",
                snapshot: targetSnapshot,
                changedBy: new ObjectId(),
                createdAt: new Date(),
            },
        ],
    });
    setDbForTests(db);

    const reverted = await revertContentRevision(
        String(content._id),
        String(revisionId),
        String(new ObjectId()),
        3,
    );

    assert.equal(reverted.title, "Versao historica");
    assert.equal(reverted.status, "draft");
    assert.equal(reverted.version, 4);
    assert.equal(reverted.releaseYear, 2020);
    assert.deepEqual(reverted.credits, targetSnapshot.credits);
    assert.deepEqual(reverted.media, content.media);
    assert.deepEqual(reverted.tracks, content.tracks);
    assert.deepEqual(reverted.qualityOptions, content.qualityOptions);
    assert.equal(reverted.mediaStatus, "ready");
    assert.equal(db.rows("content_revisions").length, 2);
    assert.equal(db.rows("content_revisions")[1].action, "revert");
    assert.equal(db.rows("content_revisions")[1].snapshot.version, 3);
    assert.equal(
        db.rows("admin_audit_logs")[0].action,
        "catalog.content.reverted",
    );
});

test("revert falhado nao deixa uma revisao orfa", async () => {
    const content = storedContent({ version: 4 });
    const revisionId = new ObjectId();
    const db = new TransactionalCatalogDb({
        contents: [content],
        content_revisions: [
            {
                _id: revisionId,
                contentId: content._id,
                action: "update",
                snapshot: storedContent({ _id: content._id }),
                changedBy: new ObjectId(),
                createdAt: new Date(),
            },
        ],
    });
    setDbForTests(db);
    db.failNextContentUpdate = true;

    await assert.rejects(
        revertContentRevision(
            String(content._id),
            String(revisionId),
            String(new ObjectId()),
            4,
        ),
        /content update failed/,
    );

    assert.equal(db.rows("contents")[0].version, 4);
    assert.equal(db.rows("content_revisions").length, 1);
    assert.equal(db.rows("admin_audit_logs").length, 0);
});

test("revert não despublica série enquanto existem episódios publicados", async () => {
    const series = storedContent({
        type: "series",
        status: "published",
        version: 3,
        publishedAt: new Date("2026-07-09T11:00:00.000Z"),
    });
    const episode = storedContent({
        type: "episode",
        status: "published",
        seriesId: series._id,
        seasonNumber: 1,
        episodeNumber: 1,
    });
    const revisionId = new ObjectId();
    const db = new TransactionalCatalogDb({
        contents: [series, episode],
        content_revisions: [
            {
                _id: revisionId,
                contentId: series._id,
                action: "update",
                snapshot: storedContent({
                    _id: series._id,
                    type: "series",
                    status: "draft",
                    publishedAt: null,
                }),
                changedBy: new ObjectId(),
                createdAt: new Date(),
            },
        ],
    });
    setDbForTests(db);

    await assert.rejects(
        () => revertContentRevision(
            String(series._id),
            String(revisionId),
            String(new ObjectId()),
            3,
        ),
        (error) => error.code === "SERIES_HAS_PUBLISHED_EPISODES",
    );

    assert.equal(db.rows("contents")[0].status, "published");
    assert.equal(db.rows("content_revisions").length, 1);
    assert.equal(db.rows("admin_audit_logs").length, 0);
});

test("catalogo admin e revisoes paginam com total e desempate por _id", async () => {
    const contentId = new ObjectId("64f400000000000000000099");
    const sharedUpdatedAt = new Date("2026-07-10T09:00:00.000Z");
    const contents = [1, 2, 3, 4, 5].map((suffix) =>
        storedContent({
            _id: new ObjectId(`64f40000000000000000000${suffix}`),
            title: `Conteudo ${suffix}`,
            slug: `conteudo-${suffix}`,
            updatedAt: sharedUpdatedAt,
        }),
    );
    const sharedCreatedAt = new Date("2026-07-10T10:00:00.000Z");
    const revisions = [1, 2, 3].map((suffix) => ({
        _id: new ObjectId(`64f50000000000000000000${suffix}`),
        contentId,
        action: "update",
        snapshot: storedContent({ _id: contentId }),
        changedBy: new ObjectId(),
        createdAt: sharedCreatedAt,
    }));
    const db = new TransactionalCatalogDb({
        contents,
        content_revisions: revisions,
    });
    setDbForTests(db);

    const catalogPage = await listAdminCatalog({ page: "2", limit: "2" });
    const revisionPage = await listContentRevisions(String(contentId), {
        page: "2",
        limit: "1",
    });

    assert.deepEqual(
        {
            page: catalogPage.page,
            limit: catalogPage.limit,
            total: catalogPage.total,
            totalPages: catalogPage.totalPages,
        },
        { page: 2, limit: 2, total: 5, totalPages: 3 },
    );
    assert.deepEqual(
        catalogPage.items.map((item) => item.id),
        [
            "64f400000000000000000003",
            "64f400000000000000000004",
        ],
    );
    assert.deepEqual(
        {
            page: revisionPage.page,
            limit: revisionPage.limit,
            total: revisionPage.total,
            totalPages: revisionPage.totalPages,
        },
        { page: 2, limit: 1, total: 3, totalPages: 3 },
    );
    assert.equal(revisionPage.items[0].id, "64f500000000000000000002");
});

test("catálogo público agrega série e ordena episódios sem os listar isoladamente", async () => {
    const series = storedContent({
        _id: new ObjectId("64f600000000000000000001"),
        type: "series",
        title: "Caminhos de Fé",
        slug: "caminhos-de-fe",
        status: "published",
    });
    const episodeTwo = storedContent({
        _id: new ObjectId("64f600000000000000000003"),
        type: "episode",
        title: "Segundo passo",
        slug: "caminhos-fe-ep-2",
        status: "published",
        seriesId: series._id,
        seasonNumber: 1,
        episodeNumber: 2,
    });
    const episodeOne = storedContent({
        _id: new ObjectId("64f600000000000000000002"),
        type: "episode",
        title: "Primeiro passo",
        slug: "caminhos-fe-ep-1",
        status: "published",
        seriesId: series._id,
        seasonNumber: 1,
        episodeNumber: 1,
    });
    const movie = storedContent({
        _id: new ObjectId("64f600000000000000000004"),
        status: "published",
        title: "Filme público",
        slug: "filme-publico",
    });
    const db = new TransactionalCatalogDb({
        contents: [series, episodeTwo, episodeOne, movie],
    });
    setDbForTests(db);

    const page = await listPublishedCatalog({ limit: "24" });
    assert.deepEqual(
        new Set(page.items.map((item) => item.type)),
        new Set(["series", "movie"]),
    );
    const detail = await getPublishedContentDetail(series.slug);
    assert.equal(detail.content.isPlayable, false);
    assert.equal(detail.content.episodeCount, 2);
    assert.deepEqual(
        detail.seasons[0].episodes.map((episode) => episode.episodeNumber),
        [1, 2],
    );

    const episodeDetail = await getPublishedContentDetail(episodeTwo.slug);
    assert.equal(episodeDetail.series.id, String(series._id));
    assert.equal(
        episodeDetail.canonicalPath,
        "/catalogo/caminhos-de-fe/episodios/caminhos-fe-ep-2",
    );
    assert.equal(episodeDetail.previousEpisode.id, String(episodeOne._id));
    assert.equal(episodeDetail.nextEpisode, null);
});

test("transições não deixam episódios publicados sem série publicada", async () => {
    const series = storedContent({
        _id: new ObjectId("64f700000000000000000001"),
        type: "series",
        status: "published",
    });
    const episode = storedContent({
        _id: new ObjectId("64f700000000000000000002"),
        type: "episode",
        status: "published",
        seriesId: series._id,
        seasonNumber: 1,
        episodeNumber: 1,
    });
    const db = new TransactionalCatalogDb({ contents: [series, episode] });
    setDbForTests(db);

    await assert.rejects(
        () => changeContentStatus(
            String(series._id),
            "archived",
            String(new ObjectId()),
            1,
        ),
        (error) => error.code === "SERIES_HAS_PUBLISHED_EPISODES",
    );

    db.rows("contents")[0].status = "draft";
    db.rows("contents")[1].status = "draft";
    await assert.rejects(
        () => changeContentStatus(
            String(episode._id),
            "published",
            String(new ObjectId()),
            1,
        ),
        (error) => error.code === "EPISODE_SERIES_NOT_PUBLISHED",
    );
});

test("startup gate recusa posições duplicadas antes de criar o índice", async () => {
    const seriesId = new ObjectId();
    const duplicate = (id) => storedContent({
        _id: id,
        type: "episode",
        status: "draft",
        seriesId,
        seasonNumber: 1,
        episodeNumber: 1,
    });
    const db = new TransactionalCatalogDb({
        contents: [
            storedContent({ _id: seriesId, type: "series" }),
            duplicate(new ObjectId()),
            duplicate(new ObjectId()),
        ],
    });

    await assert.rejects(
        () => assertCatalogHierarchyReady(db),
        (error) => error.code === "EPISODE_POSITION_CONFLICT",
    );
});

test("índice único ignora episódios draft ainda sem posição válida", async () => {
    const draftEpisode = storedContent({
        type: "episode",
        status: "draft",
        seriesId: null,
        seasonNumber: null,
        episodeNumber: null,
    });
    const db = new TransactionalCatalogDb({ contents: [draftEpisode] });
    setDbForTests(db);

    await ensureCatalogIndexes();

    const hierarchyIndex = db.indexDefinitions.find(
        (index) =>
            index.collection === "contents" &&
            index.keys.seriesId === 1 &&
            index.keys.seasonNumber === 1 &&
            index.keys.episodeNumber === 1 &&
            index.options.unique === true,
    );
    assert.deepEqual(hierarchyIndex?.options.partialFilterExpression, {
        type: "episode",
        seriesId: { $type: "objectId" },
        seasonNumber: { $type: "number", $gt: 0 },
        episodeNumber: { $type: "number", $gt: 0 },
    });
});
