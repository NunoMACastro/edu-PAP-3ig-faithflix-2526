/**
 * @file Ficheiro `real_dev/backend/src/modules/catalog/catalog.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import {
    assertCatalogPayload,
    assertCatalogUpdatePayload,
    assertExpectedVersion,
    assertStatus,
    parseAdminCatalogFilters,
    parseAdminCatalogPagination,
    parseAdminCatalogSort,
    parseCatalogFilters,
    parseCatalogPagination,
} from "./catalog.validation.js";
import { getMediaAvailability } from "./catalog-media.js";
import {
    PUBLIC_CATALOG_TYPES,
    episodeCanonicalPath,
    getEpisodeSeries,
    publicSeriesSummary,
} from "./catalog-hierarchy.js";

const INITIAL_CONTENT_VERSION = 1;

/**
 * Escapa metacaracteres antes de construir uma pesquisa literal MongoDB.
 *
 * @param {string} value Texto já limitado e normalizado.
 * @returns {string} Texto seguro para `RegExp`.
 */
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normaliza documentos legados sem versao para a primeira versao editorial.
 *
 * @param {Record<string, unknown>} content Documento de conteudo.
 * @returns {number} Versao editorial positiva.
 */
function contentVersion(content) {
    return Number.isSafeInteger(content?.version) && content.version >= 1
        ? content.version
        : INITIAL_CONTENT_VERSION;
}

/**
 * Constroi o filtro CAS, incluindo compatibilidade controlada com legado.
 *
 * Documentos anteriores ao schema de concorrencia nao têm `version` e sao
 * tratados como versao 1 apenas na primeira mutacao protegida.
 *
 * @param {import("mongodb").ObjectId} contentId Id MongoDB do conteudo.
 * @param {number} expectedVersion Versao observada pelo cliente.
 * @returns {Record<string, unknown>} Filtro atomico para a escrita.
 */
function contentVersionFilter(contentId, expectedVersion) {
    if (expectedVersion === INITIAL_CONTENT_VERSION) {
        return {
            _id: contentId,
            $or: [
                { version: INITIAL_CONTENT_VERSION },
                { version: { $exists: false } },
            ],
        };
    }

    return { _id: contentId, version: expectedVersion };
}

/**
 * Cria o erro estavel usado por clientes para recarregar dados concorrentes.
 *
 * @returns {HttpError} Conflito editorial seguro.
 */
function contentVersionConflict() {
    return new HttpError(
        409,
        "O conteudo foi alterado por outro utilizador. Recarregue e tente novamente.",
        undefined,
        "CONTENT_VERSION_CONFLICT",
    );
}

/**
 * Confirma que a versao lida ainda corresponde ao contrato do cliente.
 *
 * @param {Record<string, unknown>} content Documento corrente.
 * @param {number} expectedVersion Versao observada pelo cliente.
 * @returns {number} Versao corrente normalizada.
 */
function assertCurrentContentVersion(content, expectedVersion) {
    const currentVersion = contentVersion(content);

    if (currentVersion !== expectedVersion) {
        throw contentVersionConflict();
    }

    return currentVersion;
}

/**
 * Converte um id de conteúdo num ObjectId MongoDB.
 *
 * @param {string} id - Id do conteúdo.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
 */
function asContentObjectId(id) {
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
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
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
        throw new HttpError(400, "Revisao invalida.");
    }

    return new ObjectId(id);
}

/**
 * Normaliza créditos opcionais de documentos legados para o contrato público.
 *
 * @param {Record<string, unknown> | null | undefined} credits Créditos persistidos.
 * @returns {{ directors: string[], creators: string[], cast: Array<{ name: string, role: string }> }} Créditos públicos seguros.
 */
function publicCredits(credits) {
    return {
        directors: Array.isArray(credits?.directors)
            ? credits.directors.filter((value) => typeof value === "string")
            : [],
        creators: Array.isArray(credits?.creators)
            ? credits.creators.filter((value) => typeof value === "string")
            : [],
        cast: Array.isArray(credits?.cast)
            ? credits.cast
                  .filter(
                      (member) =>
                          member &&
                          typeof member === "object" &&
                          typeof member.name === "string",
                  )
                  .map((member) => ({
                      name: member.name,
                      role: typeof member.role === "string" ? member.role : "",
                  }))
            : [],
    };
}

/**
 * Converte um documento interno de conteúdo para o formato público da API.
 *
 * @param {Record<string, unknown> & { _id: import("mongodb").ObjectId }} content - Documento de conteúdo MongoDB.
 * @returns {Record<string, unknown>} Conteúdo público.
 */
export function toPublicCatalogContent(content) {
    const mediaAvailability = getMediaAvailability(content);

    return {
        id: String(content._id),
        title: content.title,
        slug: content.slug,
        synopsis: content.synopsis,
        type: content.type,
        durationSeconds: content.durationSeconds,
        ageRating: content.ageRating,
        releaseYear: Number.isSafeInteger(content.releaseYear)
            ? content.releaseYear
            : null,
        taxonomyIds: (content.taxonomyIds ?? []).map(String),
        assets: {
            posterUrl:
                typeof content.assets?.posterUrl === "string"
                    ? content.assets.posterUrl
                    : "",
            backdropUrl:
                typeof content.assets?.backdropUrl === "string"
                    ? content.assets.backdropUrl
                    : "",
            previewUrl:
                typeof content.assets?.previewUrl === "string"
                    ? content.assets.previewUrl
                    : "",
        },
        credits: publicCredits(content.credits),
        ...mediaAvailability,
        isPlayable:
            content.type === "series" ? false : mediaAvailability.isPlayable,
        ...(content.type === "episode"
            ? {
                  seriesId: String(content.seriesId),
                  seasonNumber: content.seasonNumber,
                  episodeNumber: content.episodeNumber,
              }
            : {}),
        publishedAt: content.publishedAt ?? null,
    };
}

/**
 * Converte um documento interno para a resposta editorial completa.
 *
 * Esta representacao e usada apenas por rotas protegidas de administracao e
 * preserva as fontes necessarias para editar e auditar o conteudo.
 *
 * @param {Record<string, unknown> & { _id: import("mongodb").ObjectId }} content Documento MongoDB.
 * @returns {Record<string, unknown>} Conteudo administrativo completo.
 */
export function toAdminCatalogContent(content) {
    return {
        id: String(content._id),
        version: contentVersion(content),
        status: content.status,
        title: content.title,
        slug: content.slug,
        synopsis: content.synopsis,
        type: content.type,
        durationSeconds: content.durationSeconds,
        ageRating: content.ageRating,
        releaseYear: Number.isSafeInteger(content.releaseYear)
            ? content.releaseYear
            : null,
        taxonomyIds: (content.taxonomyIds ?? []).map(String),
        assets: {
            posterUrl: content.assets?.posterUrl ?? "",
            backdropUrl: content.assets?.backdropUrl ?? "",
            previewUrl: content.assets?.previewUrl ?? "",
        },
        credits: publicCredits(content.credits),
        media: content.media ?? { playbackUrl: "" },
        tracks: content.tracks ?? { subtitles: [], audio: [] },
        qualityOptions: content.qualityOptions ?? [],
        ...getMediaAvailability(content),
        isPlayable:
            content.type === "series"
                ? false
                : getMediaAvailability(content).isPlayable,
        ...(content.type === "episode"
            ? {
                  seriesId: String(content.seriesId),
                  seasonNumber: content.seasonNumber,
                  episodeNumber: content.episodeNumber,
              }
            : {}),
        publishedAt: content.publishedAt ?? null,
        createdAt: content.createdAt ?? null,
        updatedAt: content.updatedAt ?? null,
    };
}

/**
 * Converte um episódio num resumo seguro para a árvore pública da série.
 *
 * @param {Record<string, unknown>} episode Documento MongoDB publicado.
 * @returns {Record<string, unknown>} Episódio sem fontes internas de media.
 */
function publicEpisodeSummary(episode) {
    const availability = getMediaAvailability(episode);

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
        releaseYear: Number.isSafeInteger(episode.releaseYear)
            ? episode.releaseYear
            : null,
        assets: {
            posterUrl: episode.assets?.posterUrl ?? "",
            backdropUrl: episode.assets?.backdropUrl ?? "",
            previewUrl: episode.assets?.previewUrl ?? "",
        },
        mediaStatus: availability.mediaStatus,
        isPlayable: availability.isPlayable,
        publishedAt: episode.publishedAt ?? null,
    };
}

/**
 * Converte um documento interno de revisão para uma resposta segura da API.
 *
 * @param {Record<string, unknown> & { _id: import("mongodb").ObjectId }} revision - Revision document.
 * @returns {Record<string, unknown>} Revisão pública.
 */
function adminRevision(revision) {
    return {
        id: String(revision._id),
        contentId: String(revision.contentId),
        action: revision.action,
        snapshot: {
            ...toAdminCatalogContent(revision.snapshot),
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
 * @param {import("mongodb").ClientSession | undefined} session Sessao transacional.
 * @returns {Promise<void>} Termina depois de inserir a revisão.
 */
async function saveRevision(db, content, userId, action, session) {
    await db.collection("content_revisions").insertOne(
        {
            contentId: content._id,
            action,
            snapshot: content,
            changedBy: new ObjectId(userId),
            createdAt: new Date(),
        },
        { session },
    );
}

/**
 * Confirms all referenced taxonomies exist.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {import("mongodb").ObjectId[]} taxonomyIds - Ids de taxonomias referenciadas.
 * @param {import("mongodb").ClientSession | undefined} session Sessao transacional.
 * @returns {Promise<void>} Termina quando todas as taxonomias existem.
 */
async function assertExistingTaxonomies(db, taxonomyIds, session) {
    if (taxonomyIds.length === 0) {
        return;
    }

    const existing = await db
        .collection("taxonomies")
        .find(
            { _id: { $in: taxonomyIds } },
            { projection: { _id: 1 }, session },
        )
        .toArray();

    if (existing.length !== taxonomyIds.length) {
        throw new HttpError(400, "Uma ou mais taxonomias nao existem.");
    }
}

/**
 * Bloqueia o arranque quando a hierarquia persistida não permite criar o
 * índice único com segurança ou exporia episódios publicados órfãos.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @returns {Promise<void>} Termina apenas para uma hierarquia coerente.
 */
export async function assertCatalogHierarchyReady(db) {
    const [series, episodes] = await Promise.all([
        db.collection("contents").find({ type: "series" }).toArray(),
        db.collection("contents").find({ type: "episode" }).toArray(),
    ]);
    const publishedSeriesIds = new Set(
        series
            .filter((content) => content.status === "published")
            .map((content) => String(content._id)),
    );
    const occupiedPositions = new Set();

    for (const episode of episodes) {
        const validPosition =
            ObjectId.isValid(episode.seriesId) &&
            Number.isSafeInteger(episode.seasonNumber) &&
            episode.seasonNumber > 0 &&
            Number.isSafeInteger(episode.episodeNumber) &&
            episode.episodeNumber > 0;

        if (
            episode.status === "published" &&
            (!validPosition ||
                !publishedSeriesIds.has(String(episode.seriesId)))
        ) {
            throw new Error(
                `Catalogo bloqueado: episodio publicado ${episode._id} sem serie publicada ou posicao valida. Executa migrate:series-episodes.`,
            );
        }

        if (!validPosition) continue;

        const position = `${episode.seriesId}:${episode.seasonNumber}:${episode.episodeNumber}`;
        if (occupiedPositions.has(position)) {
            const error = new Error(
                `Catalogo bloqueado: posicao de episodio duplicada ${position}. Executa migrate:series-episodes.`,
            );
            error.code = "EPISODE_POSITION_CONFLICT";
            throw error;
        }
        occupiedPositions.add(position);
    }
}

/**
 * Valida referências condicionais depois da normalização do payload.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @param {Record<string, unknown>} payload Payload editorial seguro.
 * @param {import("mongodb").ClientSession | undefined} session Sessão ativa.
 * @returns {Promise<void>} Termina quando a série referenciada existe.
 */
async function assertCatalogHierarchy(db, payload, session) {
    if (payload.type === "episode") {
        await getEpisodeSeries(db, payload.seriesId, { session });
    }
}

/**
 * Traduz colisões de índices para códigos de domínio estáveis.
 *
 * @param {unknown} error Erro MongoDB ou de domínio.
 * @returns {never} Relança sempre.
 */
function throwCatalogWriteError(error) {
    if (error?.code !== 11000) throw error;

    const duplicatedEpisodePosition =
        error?.keyPattern?.seriesId ||
        error?.keyPattern?.seasonNumber ||
        error?.keyPattern?.episodeNumber;

    if (duplicatedEpisodePosition) {
        throw new HttpError(
            409,
            "Ja existe um episodio nessa posicao da serie.",
            undefined,
            "EPISODE_POSITION_CONFLICT",
        );
    }

    throw new HttpError(409, "Slug de conteudo ja existe.");
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
    await db
        .collection("contents")
        .createIndex({ updatedAt: -1, _id: 1 });
    await db.collection("contents").createIndex({
        status: 1,
        type: 1,
        mediaStatus: 1,
        updatedAt: -1,
        _id: 1,
    });
    await db.collection("contents").createIndex(
        { seriesId: 1, seasonNumber: 1, episodeNumber: 1 },
        {
            unique: true,
            partialFilterExpression: {
                type: "episode",
                seriesId: { $type: "objectId" },
                seasonNumber: { $type: "number", $gt: 0 },
                episodeNumber: { $type: "number", $gt: 0 },
            },
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
        .createIndex({ contentId: 1, createdAt: -1, _id: 1 });
}

/**
 * Lista conteudo publico publicado com paginacao segura.
 *
 * @param {Record<string, unknown>} [queryParams={}] Query params recebidos pela rota publica.
 * @returns {Promise<{ page: number, limit: number, total: number, items: Record<string, unknown>[] }>} Pagina publica do catalogo.
 */
export async function listPublishedCatalog(queryParams = {}) {
    const { page, limit } = parseCatalogPagination(queryParams);
    const { type } = parseCatalogFilters(queryParams);
    const db = await getDb();
    const filter = {
        status: "published",
        type: { $in: PUBLIC_CATALOG_TYPES },
    };

    if (type) {
        filter.type = type;
    }

    const [contents, total] = await Promise.all([
        db
            .collection("contents")
            .find(filter)
            .sort({ publishedAt: -1, title: 1 })
            // A pagina fica no MongoDB para evitar carregar todo o catalogo publico em memoria.
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        // O total em paralelo permite UI/evidence sem duplicar a listagem completa.
        db.collection("contents").countDocuments(filter),
    ]);

    return {
        page,
        limit,
        total,
        items: contents.map(toPublicCatalogContent),
    };
}

/**
 * Lista itens de catálogo para roles editoriais.
 *
 * @param {Record<string, unknown>} [queryParams={}] Query params de paginação.
 * @returns {Promise<{page: number, limit: number, total: number, totalPages: number, items: Record<string, unknown>[], seriesOptions: Record<string, unknown>[]}>} Página administrativa.
 */
export async function listAdminCatalog(queryParams = {}) {
    const { page, limit } = parseAdminCatalogPagination(queryParams);
    const { search, status, type, mediaStatus } =
        parseAdminCatalogFilters(queryParams);
    const { sort, direction } = parseAdminCatalogSort(queryParams);
    const db = await getDb();
    const filter = {};

    if (search) {
        filter.title = { $regex: escapeRegex(search), $options: "i" };
    }
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (mediaStatus) filter.mediaStatus = mediaStatus;
    const [contents, total, series] = await Promise.all([
        db
            .collection("contents")
            .find(filter)
            .sort({ [sort]: direction === "asc" ? 1 : -1, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        db.collection("contents").countDocuments(filter),
        db
            .collection("contents")
            .find(
                { type: "series" },
                { projection: { _id: 1, title: 1, status: 1 } },
            )
            .sort({ title: 1, _id: 1 })
            .toArray(),
    ]);

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        seriesOptions: series.map((content) => ({
            id: String(content._id),
            title: content.title,
            status: content.status,
        })),
        items: contents.map(toAdminCatalogContent),
    };
}

/**
 * Obtém diretamente um conteúdo administrativo por identificador.
 *
 * @param {string} contentId Identificador MongoDB recebido pela rota protegida.
 * @returns {Promise<Record<string, unknown>>} Conteúdo editorial completo e seguro.
 */
export async function getAdminCatalogContent(contentId) {
    const id = asContentObjectId(contentId);
    const db = await getDb();
    const content = await db.collection("contents").findOne({ _id: id });

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    return toAdminCatalogContent(content);
}

/**
 * Lista apenas as opções de séries necessárias ao editor de episódios.
 *
 * @returns {Promise<{seriesOptions: Array<{id: string, title: string, status: string}>}>} Opções editoriais mínimas.
 */
export async function getAdminCatalogOptions() {
    const db = await getDb();
    const series = await db
        .collection("contents")
        .find(
            { type: "series" },
            { projection: { _id: 1, title: 1, status: 1 } },
        )
        .sort({ title: 1, _id: 1 })
        .toArray();

    return {
        seriesOptions: series.map((content) => ({
            id: String(content._id),
            title: content.title,
            status: content.status,
        })),
    };
}

/**
 * Cria um conteúdo em rascunho.
 *
 * @param {Record<string, unknown>} input - Catalog dados.
 * @param {string} userId - Authenticated editor id.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<Record<string, unknown>>} Conteúdo criado.
 */
export async function createContent(input, userId, context = {}) {
    await ensureCatalogIndexes();

    const payload = assertCatalogPayload(input);

    try {
        return await runInTransaction(async ({ db, session }) => {
            const now = new Date();
            await assertExistingTaxonomies(
                db,
                payload.taxonomyIds,
                session,
            );
            await assertCatalogHierarchy(db, payload, session);
            const document = {
                ...payload,
                version: INITIAL_CONTENT_VERSION,
                status: "draft",
                createdBy: new ObjectId(userId),
                updatedBy: new ObjectId(userId),
                publishedAt: null,
                createdAt: now,
                updatedAt: now,
            };
            const result = await db
                .collection("contents")
                .insertOne(document, { session });
            const persisted = { ...document, _id: result.insertedId };
            await writeAdminAudit({
                db,
                session,
                actorUserId: userId,
                action: "catalog.content.created",
                targetType: "content",
                targetId: result.insertedId,
                before: null,
                after: persisted,
                requestId: context.requestId,
                operationId: `catalog:create:${result.insertedId}`,
            });
            return {
                ...toAdminCatalogContent(persisted),
                status: document.status,
            };
        });
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
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<Record<string, unknown>>} Conteúdo atualizado.
 */
export async function updateContent(contentId, input, userId, context = {}) {
    const _id = asContentObjectId(contentId);
    const expectedVersion = assertExpectedVersion(input?.expectedVersion);

    try {
        return await runInTransaction(async ({ db, session }) => {
            const existing = await db
                .collection("contents")
                .findOne({ _id }, { session });

            if (!existing) {
                throw new HttpError(404, "Conteudo nao encontrado.");
            }

            const currentVersion = assertCurrentContentVersion(
                existing,
                expectedVersion,
            );
            const payload = assertCatalogUpdatePayload(input, existing);
            await assertExistingTaxonomies(
                db,
                payload.taxonomyIds,
                session,
            );
            await assertCatalogHierarchy(db, payload, session);
            if (payload.type === "episode" && existing.status === "published") {
                try {
                    await getEpisodeSeries(db, payload.seriesId, {
                        requirePublished: true,
                        session,
                    });
                } catch (error) {
                    if (error?.code === "EPISODE_SERIES_NOT_PUBLISHED") {
                        throw new HttpError(
                            409,
                            "Um episodio publicado exige uma serie publicada.",
                            undefined,
                            "EPISODE_SERIES_NOT_PUBLISHED",
                        );
                    }
                    throw error;
                }
            }
            await saveRevision(db, existing, userId, "update", session);

            const updated = await db.collection("contents").findOneAndUpdate(
                contentVersionFilter(_id, expectedVersion),
                {
                    $set: {
                        ...payload,
                        version: currentVersion + 1,
                        updatedBy: new ObjectId(userId),
                        updatedAt: new Date(),
                    },
                },
                { returnDocument: "after", session },
            );

            if (!updated) {
                throw contentVersionConflict();
            }

            await writeAdminAudit({
                db,
                session,
                actorUserId: userId,
                action: "catalog.content.updated",
                targetType: "content",
                targetId: _id,
                before: existing,
                after: updated,
                requestId: context.requestId,
            });

            return {
                ...toAdminCatalogContent(updated),
                status: updated.status,
            };
        });
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
 * @param {unknown} expectedVersionInput Versao observada pelo cliente.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<Record<string, unknown>>} Conteúdo atualizado.
 */
export async function changeContentStatus(
    contentId,
    status,
    userId,
    expectedVersionInput,
    context = {},
) {
    const _id = asContentObjectId(contentId);
    const nextStatus = assertStatus(status);
    const expectedVersion = assertExpectedVersion(expectedVersionInput);

    return runInTransaction(async ({ db, session }) => {
        const existing = await db
            .collection("contents")
            .findOne({ _id }, { session });

        if (!existing) {
            throw new HttpError(404, "Conteudo nao encontrado.");
        }

        const currentVersion = assertCurrentContentVersion(
            existing,
            expectedVersion,
        );

        // Repetir a mesma transicao, incluindo publish, e um no-op observavel:
        // nao cria revisao, nao muda `publishedAt` e nao avanca a versao.
        if (existing.status === nextStatus) {
            return {
                ...toAdminCatalogContent(existing),
                status: existing.status,
            };
        }

        if (existing.type === "episode" && nextStatus === "published") {
            try {
                await getEpisodeSeries(db, existing.seriesId, {
                    requirePublished: true,
                    session,
                });
            } catch (error) {
                if (error?.code === "EPISODE_SERIES_NOT_PUBLISHED") {
                    throw new HttpError(
                        409,
                        "Publica primeiro a serie deste episodio.",
                        undefined,
                        "EPISODE_SERIES_NOT_PUBLISHED",
                    );
                }
                throw error;
            }
        }

        if (existing.type === "series" && nextStatus !== "published") {
            const publishedEpisode = await db.collection("contents").findOne(
                {
                    type: "episode",
                    seriesId: existing._id,
                    status: "published",
                },
                { projection: { _id: 1 }, session },
            );
            if (publishedEpisode) {
                throw new HttpError(
                    409,
                    "Despublica primeiro os episodios desta serie.",
                    undefined,
                    "SERIES_HAS_PUBLISHED_EPISODES",
                );
            }
        }

        const now = new Date();
        await saveRevision(db, existing, userId, nextStatus, session);

        const updated = await db.collection("contents").findOneAndUpdate(
            contentVersionFilter(_id, expectedVersion),
            {
                $set: {
                    status: nextStatus,
                    version: currentVersion + 1,
                    updatedBy: new ObjectId(userId),
                    updatedAt: now,
                    publishedAt:
                        nextStatus === "published"
                            ? now
                            : existing.publishedAt ?? null,
                },
            },
            { returnDocument: "after", session },
        );

        if (!updated) {
            throw contentVersionConflict();
        }

        await writeAdminAudit({
            db,
            session,
            actorUserId: userId,
            action: "catalog.content.status_changed",
            targetType: "content",
            targetId: _id,
            before: existing,
            after: updated,
            requestId: context.requestId,
            metadata: { previousStatus: existing.status, nextStatus },
        });

        return { ...toAdminCatalogContent(updated), status: updated.status };
    });
}

/**
 * Lista revisões de conteúdo.
 *
 * @param {string} contentId - Id do conteúdo.
 * @param {Record<string, unknown>} [queryParams={}] Query params de paginação.
 * @returns {Promise<{page: number, limit: number, total: number, totalPages: number, items: Record<string, unknown>[]}>} Página de revisões.
 */
export async function listContentRevisions(contentId, queryParams = {}) {
    const { page, limit } = parseAdminCatalogPagination(queryParams);
    const db = await getDb();
    const filter = { contentId: asContentObjectId(contentId) };
    const [revisions, total] = await Promise.all([
        db
            .collection("content_revisions")
            .find(filter)
            .sort({ createdAt: -1, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        db.collection("content_revisions").countDocuments(filter),
    ]);

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        items: revisions.map(adminRevision),
    };
}

/**
 * Repõe conteúdo a partir de uma revisão anterior.
 *
 * @param {string} contentId - Id do conteúdo.
 * @param {string} revisionId - Revision id.
 * @param {string} userId - Authenticated editor id.
 * @param {unknown} expectedVersionInput Versao observada pelo cliente.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido.
 * @returns {Promise<Record<string, unknown>>} Conteúdo atualizado.
 */
export async function revertContentRevision(
    contentId,
    revisionId,
    userId,
    expectedVersionInput,
    context = {},
) {
    const contentObjectId = asContentObjectId(contentId);
    const revisionObjectId = asRevisionObjectId(revisionId);
    const expectedVersion = assertExpectedVersion(expectedVersionInput);

    try {
        return await runInTransaction(async ({ db, session }) => {
            const existing = await db
                .collection("contents")
                .findOne({ _id: contentObjectId }, { session });

            if (!existing) {
                throw new HttpError(404, "Conteudo nao encontrado.");
            }

            const currentVersion = assertCurrentContentVersion(
                existing,
                expectedVersion,
            );
            const revision = await db.collection("content_revisions").findOne(
                {
                    _id: revisionObjectId,
                    contentId: contentObjectId,
                },
                { session },
            );

            if (!revision) {
                throw new HttpError(404, "Revisao nao encontrada.");
            }

            await saveRevision(db, existing, userId, "revert", session);

            const snapshot = revision.snapshot;
            if (snapshot.type !== existing.type) {
                throw new HttpError(
                    409,
                    "A revisao altera o tipo do conteudo.",
                    undefined,
                    "CATALOG_TYPE_IMMUTABLE",
                );
            }
            const restoredEditorial = assertCatalogUpdatePayload(
                {
                    title: snapshot.title,
                    slug: snapshot.slug,
                    synopsis: snapshot.synopsis,
                    durationSeconds: snapshot.durationSeconds,
                    ageRating: snapshot.ageRating,
                    releaseYear: snapshot.releaseYear ?? null,
                    taxonomyIds: (snapshot.taxonomyIds ?? []).map(String),
                    assets: snapshot.assets ?? {},
                    credits: snapshot.credits ?? {},
                    ...(snapshot.type === "episode"
                        ? {
                              seriesId: String(snapshot.seriesId),
                              seasonNumber: snapshot.seasonNumber,
                              episodeNumber: snapshot.episodeNumber,
                          }
                        : {}),
                },
                existing,
            );
            await assertExistingTaxonomies(
                db,
                restoredEditorial.taxonomyIds,
                session,
            );
            await assertCatalogHierarchy(db, restoredEditorial, session);
            if (
                restoredEditorial.type === "episode" &&
                snapshot.status === "published"
            ) {
                try {
                    await getEpisodeSeries(db, restoredEditorial.seriesId, {
                        requirePublished: true,
                        session,
                    });
                } catch (error) {
                    if (error?.code === "EPISODE_SERIES_NOT_PUBLISHED") {
                        throw new HttpError(
                            409,
                            "A revisao publicaria um episodio sem serie publicada.",
                            undefined,
                            "EPISODE_SERIES_NOT_PUBLISHED",
                        );
                    }
                    throw error;
                }
            }
            if (
                restoredEditorial.type === "series" &&
                snapshot.status !== "published"
            ) {
                const publishedEpisode = await db.collection("contents").findOne(
                    {
                        type: "episode",
                        seriesId: existing._id,
                        status: "published",
                    },
                    { projection: { _id: 1 }, session },
                );
                if (publishedEpisode) {
                    throw new HttpError(
                        409,
                        "Despublica primeiro os episodios desta serie.",
                        undefined,
                        "SERIES_HAS_PUBLISHED_EPISODES",
                    );
                }
            }
            const updated = await db.collection("contents").findOneAndUpdate(
                contentVersionFilter(contentObjectId, expectedVersion),
                {
                    $set: {
                        ...restoredEditorial,
                        status: snapshot.status,
                        publishedAt: snapshot.publishedAt ?? null,
                        version: currentVersion + 1,
                        updatedBy: new ObjectId(userId),
                        updatedAt: new Date(),
                    },
                },
                { returnDocument: "after", session },
            );

            if (!updated) {
                throw contentVersionConflict();
            }

            await writeAdminAudit({
                db,
                session,
                actorUserId: userId,
                action: "catalog.content.reverted",
                targetType: "content",
                targetId: contentObjectId,
                before: existing,
                after: updated,
                requestId: context.requestId,
                metadata: { revisionId: String(revisionObjectId) },
            });

            return {
                ...toAdminCatalogContent(updated),
                status: updated.status,
            };
        });
    } catch (error) {
        throwCatalogWriteError(error);
    }
}

/**
 * Constrói uma query de detalhe público para ObjectId ou slug.
 *
 * @param {string} idOrSlug - Identificador público.
 * @returns {Record<string, unknown>} Query MongoDB.
 */
function buildPublishedDetailQuery(idOrSlug) {
    if (typeof idOrSlug !== "string") {
        throw new HttpError(400, "Conteudo invalido.");
    }

    const value = idOrSlug.trim();

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
    const query = buildPublishedDetailQuery(idOrSlug);
    const db = await getDb();
    const content = await db
        .collection("contents")
        .findOne(query);

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const taxonomyIds = (content.taxonomyIds ?? []).filter((id) =>
        ObjectId.isValid(String(id)),
    );
    const taxonomies = taxonomyIds.length
        ? await db
              .collection("taxonomies")
              .find({ _id: { $in: taxonomyIds } })
              .toArray()
        : [];
    const taxonomiesById = new Map(
        taxonomies.map((taxonomy) => [String(taxonomy._id), taxonomy]),
    );

    const publicContent = {
        ...toPublicCatalogContent(content),
        taxonomies: taxonomyIds
            .map((id) => taxonomiesById.get(String(id)))
            .filter(Boolean)
            .map((taxonomy) => ({
                id: String(taxonomy._id),
                name: taxonomy.name,
                slug: taxonomy.slug,
            })),
    };

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
            const season = seasonsByNumber.get(episode.seasonNumber) ?? {
                seasonNumber: episode.seasonNumber,
                episodes: [],
            };
            season.episodes.push({
                ...publicEpisodeSummary(episode),
                canonicalPath: episodeCanonicalPath(content, episode),
            });
            seasonsByNumber.set(episode.seasonNumber, season);
        }

        return {
            content: {
                ...publicContent,
                seasonCount: seasonsByNumber.size,
                episodeCount: episodes.length,
                totalDurationSeconds: episodes.reduce(
                    (total, episode) =>
                        total + Number(episode.durationSeconds ?? 0),
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
        const siblings = await db
            .collection("contents")
            .find({
                type: "episode",
                seriesId: series._id,
                status: "published",
            })
            .sort({ seasonNumber: 1, episodeNumber: 1, title: 1 })
            .toArray();
        const currentIndex = siblings.findIndex(
            (candidate) => String(candidate._id) === String(content._id),
        );
        const navigationItem = (episode) =>
            episode
                ? {
                      id: String(episode._id),
                      title: episode.title,
                      slug: episode.slug,
                      seasonNumber: episode.seasonNumber,
                      episodeNumber: episode.episodeNumber,
                      canonicalPath: episodeCanonicalPath(series, episode),
                  }
                : null;

        return {
            content: publicContent,
            series: publicSeriesSummary(series),
            canonicalPath: episodeCanonicalPath(series, content),
            previousEpisode: navigationItem(siblings[currentIndex - 1]),
            nextEpisode: navigationItem(siblings[currentIndex + 1]),
        };
    }

    return { content: publicContent };
}
