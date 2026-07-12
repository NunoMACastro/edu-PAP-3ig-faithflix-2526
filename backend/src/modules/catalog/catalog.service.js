/**
 * @file Ficheiro `real_dev/backend/src/modules/catalog/catalog.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
    assertCatalogPayload,
    assertStatus,
    parseCatalogQuery,
} from "./catalog.validation.js";
import {
    PUBLIC_CATALOG_TYPES,
    episodeCanonicalPath,
    getEpisodeSeries,
    publicSeriesSummary,
} from "./catalog-hierarchy.js";

/**
 * Converte um id de conteúdo num ObjectId MongoDB.
 *
 * @param {string} id - Id do conteúdo.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
 */
function asContentObjectId(id) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, "Conteudo invalido.");
    }

    return new ObjectId(id);
}

/**
 * Converte um id de revisão num ObjectId MongoDB.
 *
 * @param {string} id - Revision id.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
 */
function asRevisionObjectId(id) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, "Revisao invalida.");
    }

    return new ObjectId(id);
}

/**
 * Converte um documento interno de conteúdo para o formato público da API.
 *
 * @param {Record<string, unknown> & { _id: import("mongodb").ObjectId }} content - Documento de conteúdo MongoDB.
 * @returns {Record<string, unknown>} Conteúdo público.
 */
function publicContent(content) {
    const result = {
        id: String(content._id),
        title: content.title,
        slug: content.slug,
        synopsis: content.synopsis,
        type: content.type,
        ageRating: content.ageRating,
        taxonomyIds: (content.taxonomyIds ?? []).map(String),
        assets: content.assets ?? { posterUrl: "", backdropUrl: "" },
        publishedAt: content.publishedAt ?? null,
        ratingAverage: Number((content.ratingAverage ?? 0).toFixed?.(2) ?? 0),
    };

    if (content.type === "series") {
        return { ...result, isPlayable: false };
    }

    return {
        ...result,
        durationSeconds: content.durationSeconds,
        media: content.media,
        tracks: content.tracks ?? { subtitles: [], audio: [] },
        qualityOptions: content.qualityOptions ?? [],
        ...(content.type === "episode"
            ? {
                  seriesId: String(content.seriesId),
                  seasonNumber: content.seasonNumber,
                  episodeNumber: content.episodeNumber,
              }
            : {}),
    };
}

/**
 * Converte um episódio num resumo público sem expor localizações de media.
 *
 * @param {Record<string, unknown>} episode Documento do episódio.
 * @returns {Record<string, unknown>} Resumo usado dentro da página da série.
 */
function publicEpisodeSummary(episode) {
    return {
        id: String(episode._id),
        title: episode.title,
        slug: episode.slug,
        synopsis: episode.synopsis,
        type: "episode",
        seriesId: String(episode.seriesId),
        seasonNumber: episode.seasonNumber,
        episodeNumber: episode.episodeNumber,
        durationSeconds: episode.durationSeconds,
        ageRating: episode.ageRating,
        assets: episode.assets ?? { posterUrl: "", backdropUrl: "" },
        publishedAt: episode.publishedAt ?? null,
    };
}

/**
 * Constrói o filtro público do catálogo a partir da query validada.
 *
 * @param {{ type: string | null, taxonomyId: string | null }} filters Filtros públicos normalizados.
 * @returns {Record<string, unknown>} Filtro MongoDB para conteúdos publicados.
 */
function buildPublishedCatalogFilter(filters) {
    const filter = {
        status: "published",
        type: { $in: PUBLIC_CATALOG_TYPES },
    };

    if (filters.type) {
        filter.type = filters.type;
    }

    if (filters.taxonomyId) {
        filter.taxonomyIds = ObjectId.createFromHexString(filters.taxonomyId);
    }

    return filter;
}

/**
 * Converte a ordenação pública do catálogo num sort MongoDB estável.
 *
 * @param {string} sort Opção pública validada.
 * @returns {Record<string, 1 | -1>} Ordenação MongoDB.
 */
function buildCatalogSort(sort) {
    if (sort === "title") {
        return { title: 1, publishedAt: -1 };
    }

    if (sort === "rating") {
        return { ratingAverage: -1, publishedAt: -1, title: 1 };
    }

    return { publishedAt: -1, title: 1 };
}

/**
 * Converte um documento interno de revisão para uma resposta segura da API.
 *
 * @param {Record<string, unknown> & { _id: import("mongodb").ObjectId }} revision - Revision document.
 * @returns {Record<string, unknown>} Revisão pública.
 */
function publicRevision(revision) {
    return {
        id: String(revision._id),
        contentId: String(revision.contentId),
        action: revision.action,
        snapshot: {
            ...publicContent(revision.snapshot),
            status: revision.snapshot.status,
        },
        changedBy: String(revision.changedBy),
        createdAt: revision.createdAt,
    };
}

/**
 * Guarda o estado anterior do conteúdo antes de uma alteração editorial.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {Record<string, unknown>} content - Documento de conteúdo existente.
 * @param {string} userId - Authenticated editor id.
 * @param {string} action - Revision action label.
 * @returns {Promise<void>} Termina depois de inserir a revisão.
 */
async function saveRevision(db, content, userId, action) {
    await db.collection("content_revisions").insertOne({
        contentId: content._id,
        action,
        snapshot: content,
        changedBy: new ObjectId(userId),
        createdAt: new Date(),
    });
}

/**
 * Confirms all referenced taxonomies exist.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {import("mongodb").ObjectId[]} taxonomyIds - Ids de taxonomias referenciadas.
 * @returns {Promise<void>} Termina quando todas as taxonomias existem.
 */
async function assertExistingTaxonomies(db, taxonomyIds) {
    if (taxonomyIds.length === 0) {
        return;
    }

    const existing = await db
        .collection("taxonomies")
        .find({ _id: { $in: taxonomyIds } }, { projection: { _id: 1 } })
        .toArray();

    if (existing.length !== taxonomyIds.length) {
        throw new HttpError(400, "Uma ou mais taxonomias nao existem.");
    }
}

/**
 * Impede o arranque sobre dados legados ambíguos que exigem mapping explícito.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @returns {Promise<void>} Termina quando a hierarquia persistida está pronta.
 */
export async function assertCatalogHierarchyReady(db) {
    const [series, publishedEpisodes] = await Promise.all([
        db.collection("contents").find({ type: "series" }).toArray(),
        db
            .collection("contents")
            .find({ type: "episode", status: "published" })
            .toArray(),
    ]);
    const publishedSeriesIds = new Set(
        series
            .filter((content) => content.status === "published")
            .map((content) => String(content._id)),
    );
    const invalidEpisode = publishedEpisodes.find(
        (episode) =>
            !publishedSeriesIds.has(String(episode.seriesId)) ||
            !Number.isInteger(episode.seasonNumber) ||
            episode.seasonNumber <= 0 ||
            !Number.isInteger(episode.episodeNumber) ||
            episode.episodeNumber <= 0,
    );

    if (invalidEpisode) {
        throw new Error(
            `Catalogo bloqueado: episodio publicado ${invalidEpisode._id} sem serie publicada/posicao valida. Executa migrate:series-episodes.`,
        );
    }

    if (series.length === 0) {
        return;
    }

    const legacyProgress = await db.collection("playback_progress").findOne({
        contentId: { $in: series.map((content) => content._id) },
    });

    if (legacyProgress) {
        throw new Error(
            "Catalogo bloqueado: existe progresso diretamente numa serie. Executa migrate:series-episodes com seriesProgress explicito.",
        );
    }
}

/**
 * Garante que existem os índices usados por catálogo e revisões.
 *
 * @returns {Promise<void>} Termina depois da criação de índices.
 */
export async function ensureCatalogIndexes() {
    const db = await getDb();
    await assertCatalogHierarchyReady(db);
    await db.collection("contents").createIndex({ slug: 1 }, { unique: true });
    await db
        .collection("contents")
        .createIndex({ status: 1, publishedAt: -1 });
    await db.collection("contents").createIndex(
        { seriesId: 1, seasonNumber: 1, episodeNumber: 1 },
        {
            unique: true,
            partialFilterExpression: { type: "episode" },
        },
    );
    await db.collection("contents").createIndex({
        seriesId: 1,
        status: 1,
        seasonNumber: 1,
        episodeNumber: 1,
    });
    await db
        .collection("content_revisions")
        .createIndex({ contentId: 1, createdAt: -1 });
}

/**
 * Valida as referências condicionais do payload editorial.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @param {Record<string, unknown>} payload Payload já normalizado.
 * @returns {Promise<void>} Termina quando a hierarquia é válida.
 */
async function assertCatalogHierarchy(db, payload) {
    if (payload.type === "episode") {
        await getEpisodeSeries(db, payload.seriesId);
    }
}

/**
 * Traduz conflitos de índices do catálogo para uma resposta editorial clara.
 *
 * @param {unknown} error Erro devolvido pelo MongoDB.
 * @returns {never} Nunca devolve; relança erro HTTP ou original.
 */
function throwCatalogWriteError(error) {
    if (error?.code === 11000) {
        const duplicatedEpisodePosition =
            error?.keyPattern?.seriesId ||
            error?.keyPattern?.seasonNumber ||
            error?.keyPattern?.episodeNumber;

        throw new HttpError(
            409,
            duplicatedEpisodePosition
                ? "Ja existe um episodio nessa posicao da serie."
                : "Slug de conteudo ja existe.",
        );
    }

    throw error;
}

/**
 * Lista conteudo publico publicado com paginacao segura.
 *
 * @param {Record<string, unknown>} [queryParams={}] Query params recebidos pela rota publica.
 * @returns {Promise<{ page: number, limit: number, total: number, items: Record<string, unknown>[] }>} Pagina publica do catalogo.
 */
export async function listPublishedCatalog(queryParams = {}) {
    const query = parseCatalogQuery(queryParams);
    const db = await getDb();
    const filter = buildPublishedCatalogFilter(query);
    const sort = buildCatalogSort(query.sort);
    const skip = (query.page - 1) * query.limit;

    if (query.sort === "rating") {
        const [result] = await db
            .collection("contents")
            .aggregate([
                { $match: filter },
                {
                    $lookup: {
                        from: "content_ratings",
                        localField: "_id",
                        foreignField: "contentId",
                        as: "ratings",
                    },
                },
                {
                    $addFields: {
                        ratingAverage: { $ifNull: [{ $avg: "$ratings.value" }, 0] },
                    },
                },
                { $sort: sort },
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        items: [{ $skip: skip }, { $limit: query.limit }],
                    },
                },
            ])
            .toArray();
        const items = result?.items ?? [];

        return {
            page: query.page,
            limit: query.limit,
            total: result?.metadata?.[0]?.total ?? 0,
            items: items.map(publicContent),
        };
    }

    const [contents, total] = await Promise.all([
        db
            .collection("contents")
            .find(filter)
            .sort(sort)
            // A pagina fica no MongoDB para evitar carregar todo o catalogo publico em memoria.
            .skip(skip)
            .limit(query.limit)
            .toArray(),
        // O total em paralelo permite UI/evidence sem duplicar a listagem completa.
        db.collection("contents").countDocuments(filter),
    ]);

    return {
        page: query.page,
        limit: query.limit,
        total,
        items: contents.map(publicContent),
    };
}

/**
 * Lista itens de catálogo para roles editoriais.
 *
 * @returns {Promise<Record<string, unknown>[]>} Itens administrativos do catálogo.
 */
export async function listAdminCatalog() {
    const db = await getDb();
    const contents = await db
        .collection("contents")
        .find({})
        .sort({ updatedAt: -1 })
        .toArray();

    return contents.map((content) => ({
        ...publicContent(content),
        status: content.status,
    }));
}

/**
 * Cria um conteúdo em rascunho.
 *
 * @param {Record<string, unknown>} input - Catalog dados.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Conteúdo criado.
 */
export async function createContent(input, userId) {
    await ensureCatalogIndexes();

    const db = await getDb();
    const now = new Date();
    const payload = assertCatalogPayload(input);

    await assertExistingTaxonomies(db, payload.taxonomyIds);
    await assertCatalogHierarchy(db, payload);

    const document = {
        ...payload,
        status: "draft",
        createdBy: new ObjectId(userId),
        updatedBy: new ObjectId(userId),
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
    };

    try {
        const result = await db.collection("contents").insertOne(document);
        return {
            ...publicContent({ ...document, _id: result.insertedId }),
            status: document.status,
        };
    } catch (error) {
        throwCatalogWriteError(error);
    }
}

/**
 * Atualiza um conteúdo e guarda uma revisão do estado anterior.
 *
 * @param {string} contentId - Id do conteúdo.
 * @param {Record<string, unknown>} input - Catalog dados.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Conteúdo atualizado.
 */
export async function updateContent(contentId, input, userId) {
    const db = await getDb();
    const _id = asContentObjectId(contentId);
    const existing = await db.collection("contents").findOne({ _id });

    if (!existing) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const payload = assertCatalogPayload(input);

    if (payload.type !== existing.type) {
        throw new HttpError(409, "O tipo de conteudo nao pode ser alterado.");
    }

    await assertExistingTaxonomies(db, payload.taxonomyIds);
    await assertCatalogHierarchy(db, payload);
    await saveRevision(db, existing, userId, "update");

    try {
        const updated = await db.collection("contents").findOneAndUpdate(
            { _id },
            {
                $set: {
                    ...payload,
                    updatedBy: new ObjectId(userId),
                    updatedAt: new Date(),
                },
            },
            { returnDocument: "after" },
        );

        return { ...publicContent(updated), status: updated.status };
    } catch (error) {
        throwCatalogWriteError(error);
    }
}

/**
 * Altera o estado de publicação de um conteúdo.
 *
 * @param {string} contentId - Id do conteúdo.
 * @param {unknown} estado - Novo estado.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Conteúdo atualizado.
 */
export async function changeContentStatus(contentId, status, userId) {
    const db = await getDb();
    const _id = asContentObjectId(contentId);
    const existing = await db.collection("contents").findOne({ _id });

    if (!existing) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const nextStatus = assertStatus(status);
    const now = new Date();

    if (existing.type === "episode" && nextStatus === "published") {
        await getEpisodeSeries(db, existing.seriesId, {
            requirePublished: true,
        }).catch((error) => {
            if (error.statusCode === 404) {
                throw new HttpError(
                    409,
                    "Publica primeiro a serie deste episodio.",
                );
            }

            throw error;
        });
    }

    await saveRevision(db, existing, userId, nextStatus);

    const updated = await db.collection("contents").findOneAndUpdate(
        { _id },
        {
            $set: {
                status: nextStatus,
                updatedBy: new ObjectId(userId),
                updatedAt: now,
                publishedAt:
                    nextStatus === "published"
                        ? now
                        : existing.publishedAt ?? null,
            },
        },
        { returnDocument: "after" },
    );

    return { ...publicContent(updated), status: updated.status };
}

/**
 * Lista revisões de conteúdo.
 *
 * @param {string} contentId - Id do conteúdo.
 * @returns {Promise<Record<string, unknown>[]>} Lista de revisões.
 */
export async function listContentRevisions(contentId) {
    const db = await getDb();
    const revisions = await db
        .collection("content_revisions")
        .find({ contentId: asContentObjectId(contentId) })
        .sort({ createdAt: -1 })
        .toArray();

    return revisions.map(publicRevision);
}

/**
 * Repõe conteúdo a partir de uma revisão anterior.
 *
 * @param {string} contentId - Id do conteúdo.
 * @param {string} revisionId - Revision id.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Conteúdo atualizado.
 */
export async function revertContentRevision(contentId, revisionId, userId) {
    const db = await getDb();
    const contentObjectId = asContentObjectId(contentId);
    const revisionObjectId = asRevisionObjectId(revisionId);
    const existing = await db
        .collection("contents")
        .findOne({ _id: contentObjectId });

    if (!existing) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const revision = await db.collection("content_revisions").findOne({
        _id: revisionObjectId,
        contentId: contentObjectId,
    });

    if (!revision) {
        throw new HttpError(404, "Revisao nao encontrada.");
    }

    await saveRevision(db, existing, userId, "revert");

    const snapshot = revision.snapshot;
    const payload = assertCatalogPayload(snapshot);

    if (payload.type !== existing.type) {
        throw new HttpError(409, "A revisao altera o tipo de conteudo.");
    }

    await assertExistingTaxonomies(db, payload.taxonomyIds);
    await assertCatalogHierarchy(db, payload);

    if (payload.type === "episode" && snapshot.status === "published") {
        await getEpisodeSeries(db, payload.seriesId, {
            requirePublished: true,
        }).catch((error) => {
            if (error.statusCode === 404) {
                throw new HttpError(
                    409,
                    "A revisao publicaria um episodio sem serie publicada.",
                );
            }

            throw error;
        });
    }

    const updated = await db.collection("contents").findOneAndUpdate(
        { _id: contentObjectId },
        {
            $set: {
                ...payload,
                status: snapshot.status,
                publishedAt: snapshot.publishedAt ?? null,
                updatedBy: new ObjectId(userId),
                updatedAt: new Date(),
            },
        },
        { returnDocument: "after" },
    );

    return { ...publicContent(updated), status: updated.status };
}

/**
 * Constrói uma query de detalhe público para ObjectId ou slug.
 *
 * @param {string} idOrSlug - Identificador público.
 * @returns {Record<string, unknown>} Query MongoDB.
 */
function buildPublishedDetailQuery(idOrSlug) {
    const value = String(idOrSlug ?? "").trim();

    if (ObjectId.isValid(value)) {
        return { _id: new ObjectId(value), status: "published" };
    }

    return { slug: value, status: "published" };
}

/**
 * Obtém o detalhe de um conteúdo publicado por id ou slug.
 *
 * @param {string} idOrSlug - Content id or slug.
 * @returns {Promise<Record<string, unknown>>} Detalhe público.
 */
export async function getPublishedContentDetail(idOrSlug) {
    const db = await getDb();
    const content = await db
        .collection("contents")
        .findOne(buildPublishedDetailQuery(idOrSlug));

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    if (content.type === "series") {
        const episodes = await db
            .collection("contents")
            .find({
                type: "episode",
                seriesId: content._id,
                status: "published",
            })
            .sort({ seasonNumber: 1, episodeNumber: 1, title: 1 })
            .toArray();
        const seasonsByNumber = new Map();

        for (const episode of episodes) {
            const seasonNumber = episode.seasonNumber;
            const season = seasonsByNumber.get(seasonNumber) ?? {
                seasonNumber,
                episodes: [],
            };
            season.episodes.push(publicEpisodeSummary(episode));
            seasonsByNumber.set(seasonNumber, season);
        }

        return {
            content: {
                ...publicContent(content),
                seasonCount: seasonsByNumber.size,
                episodeCount: episodes.length,
                totalDurationSeconds: episodes.reduce(
                    (total, episode) => total + Number(episode.durationSeconds ?? 0),
                    0,
                ),
            },
            seasons: [...seasonsByNumber.values()],
        };
    }

    if (content.type === "episode") {
        const series = await getEpisodeSeries(db, content.seriesId, {
            requirePublished: true,
        });

        return {
            content: publicContent(content),
            series: publicSeriesSummary(series),
            canonicalPath: episodeCanonicalPath(series, content),
        };
    }

    return { content: publicContent(content) };
}
