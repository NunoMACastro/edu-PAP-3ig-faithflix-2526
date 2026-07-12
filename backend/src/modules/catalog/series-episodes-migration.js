/**
 * @file Preflight e migração transacional explícita série -> episódio.
 *
 * O mapping usa apenas ObjectIds revistos pelo operador. Não existe qualquer
 * inferência por título, slug ou posição textual.
 */

import { ObjectId } from "mongodb";
import { assertActiveTransaction } from "../../config/database.js";

const MAPPING_FIELDS = new Set([
    "reviewed",
    "reviewedBy",
    "episodes",
    "seriesProgress",
]);
const EPISODE_MAPPING_FIELDS = new Set([
    "episodeId",
    "seriesId",
    "seasonNumber",
    "episodeNumber",
]);
const PROGRESS_MAPPING_FIELDS = new Set(["seriesId", "episodeId"]);

/** @param {Record<string, unknown>} value Objeto. @param {Set<string>} allowed Allowlist. @param {string} label Contexto. @returns {void} */
function assertAllowedFields(value, allowed, label) {
    const unknown = Object.keys(value).find((field) => !allowed.has(field));
    if (unknown) {
        const error = new Error(`${label} contém campo desconhecido: ${unknown}.`);
        error.code = "MIGRATION_MAPPING_INVALID";
        throw error;
    }
}

/** @param {unknown} value Valor candidato. @param {string} field Campo. @returns {ObjectId} Id seguro. */
function objectId(value, field) {
    if (!ObjectId.isValid(value)) {
        const error = new Error(`${field} invalido.`);
        error.code = "MIGRATION_MAPPING_INVALID";
        throw error;
    }
    return new ObjectId(value);
}

/** @param {unknown} value Valor candidato. @param {string} field Campo. @returns {number} Inteiro positivo. */
function positiveInteger(value, field) {
    if (!Number.isSafeInteger(value) || value < 1) {
        const error = new Error(`${field} invalido.`);
        error.code = "MIGRATION_MAPPING_INVALID";
        throw error;
    }
    return value;
}

/**
 * Valida a declaração humana de revisão e normaliza todas as entradas.
 *
 * @param {unknown} input JSON lido do ficheiro.
 * @returns {{reviewed: true, reviewedBy: string, episodes: Record<string, unknown>[], seriesProgress: Record<string, unknown>[]}} Mapping seguro.
 */
export function assertReviewedSeriesEpisodeMapping(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        const error = new Error("Mapping invalido.");
        error.code = "MIGRATION_MAPPING_INVALID";
        throw error;
    }
    assertAllowedFields(input, MAPPING_FIELDS, "Mapping");
    const reviewedBy =
        typeof input.reviewedBy === "string" ? input.reviewedBy.trim() : "";
    if (input.reviewed !== true || reviewedBy.length < 2 || reviewedBy.length > 120) {
        const error = new Error("O mapping tem de declarar reviewed=true e reviewedBy.");
        error.code = "MIGRATION_MAPPING_NOT_REVIEWED";
        throw error;
    }
    if (!Array.isArray(input.episodes) || !Array.isArray(input.seriesProgress ?? [])) {
        const error = new Error("Listas do mapping invalidas.");
        error.code = "MIGRATION_MAPPING_INVALID";
        throw error;
    }

    const episodeIds = new Set();
    const episodes = input.episodes.map((entry) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            const error = new Error("Entrada de episódio inválida.");
            error.code = "MIGRATION_MAPPING_INVALID";
            throw error;
        }
        assertAllowedFields(entry, EPISODE_MAPPING_FIELDS, "Episódio");
        const normalized = {
            episodeId: objectId(entry?.episodeId, "episodeId"),
            seriesId: objectId(entry?.seriesId, "seriesId"),
            seasonNumber: positiveInteger(entry?.seasonNumber, "seasonNumber"),
            episodeNumber: positiveInteger(entry?.episodeNumber, "episodeNumber"),
        };
        const key = String(normalized.episodeId);
        if (episodeIds.has(key)) {
            const error = new Error(`episodeId repetido: ${key}.`);
            error.code = "MIGRATION_MAPPING_INVALID";
            throw error;
        }
        episodeIds.add(key);
        return normalized;
    });
    const progressSeriesIds = new Set();
    const seriesProgress = (input.seriesProgress ?? []).map((entry) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            const error = new Error("Entrada de progresso inválida.");
            error.code = "MIGRATION_MAPPING_INVALID";
            throw error;
        }
        assertAllowedFields(entry, PROGRESS_MAPPING_FIELDS, "seriesProgress");
        const normalized = {
            seriesId: objectId(entry?.seriesId, "seriesProgress.seriesId"),
            episodeId: objectId(entry?.episodeId, "seriesProgress.episodeId"),
        };
        const key = String(normalized.seriesId);
        if (progressSeriesIds.has(key)) {
            const error = new Error(`seriesProgress repetido: ${key}.`);
            error.code = "MIGRATION_MAPPING_INVALID";
            throw error;
        }
        progressSeriesIds.add(key);
        return normalized;
    });

    return { reviewed: true, reviewedBy, episodes, seriesProgress };
}

/**
 * Produz um relatório estritamente read-only do estado atual.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {{session?: import("mongodb").ClientSession}} [options] Sessão opcional.
 * @returns {Promise<Record<string, unknown>>} Diagnóstico serializável.
 */
export async function inspectSeriesEpisodeMigration(db, options = {}) {
    const queryOptions = options.session ? { session: options.session } : {};
    const series = await db
        .collection("contents")
        .find({ type: "series" }, queryOptions)
        .toArray();
    const episodes = await db
        .collection("contents")
        .find({ type: "episode" }, queryOptions)
        .toArray();
    const seriesById = new Map(series.map((item) => [String(item._id), item]));
    const occupied = new Map();
    const invalidEpisodeIds = [];
    const publishedOrphanEpisodeIds = [];
    const duplicatePositions = [];

    for (const episode of episodes) {
        const valid =
            seriesById.has(String(episode.seriesId)) &&
            Number.isSafeInteger(episode.seasonNumber) &&
            episode.seasonNumber > 0 &&
            Number.isSafeInteger(episode.episodeNumber) &&
            episode.episodeNumber > 0;
        if (!valid) {
            invalidEpisodeIds.push(String(episode._id));
            if (episode.status === "published") {
                publishedOrphanEpisodeIds.push(String(episode._id));
            }
            continue;
        }
        const position = `${episode.seriesId}:${episode.seasonNumber}:${episode.episodeNumber}`;
        if (occupied.has(position)) {
            duplicatePositions.push([occupied.get(position), String(episode._id)]);
        } else {
            occupied.set(position, String(episode._id));
        }
    }

    const seriesProgress = series.length
        ? await db.collection("playback_progress").find(
              { contentId: { $in: series.map((item) => item._id) } },
              queryOptions,
          ).toArray()
        : [];

    return {
        seriesCount: series.length,
        episodeCount: episodes.length,
        invalidEpisodeIds,
        publishedOrphanEpisodeIds,
        duplicatePositions,
        seriesProgressCount: seriesProgress.length,
    };
}

/**
 * Executa todo o preflight sobre o estado final projetado, antes de uma escrita.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {ReturnType<typeof assertReviewedSeriesEpisodeMapping>} mapping Mapping normalizado.
 * @param {{session?: import("mongodb").ClientSession}} [options] Sessão.
 * @returns {Promise<Record<string, unknown>>} Plano validado para aplicação.
 */
export async function preflightSeriesEpisodeMigration(db, mapping, options = {}) {
    const queryOptions = options.session ? { session: options.session } : {};
    const series = await db
        .collection("contents")
        .find({ type: "series" }, queryOptions)
        .toArray();
    const episodes = await db
        .collection("contents")
        .find({ type: "episode" }, queryOptions)
        .toArray();
    const seriesById = new Map(series.map((item) => [String(item._id), item]));
    const episodeById = new Map(episodes.map((item) => [String(item._id), item]));
    const mappingsByEpisode = new Map(
        mapping.episodes.map((entry) => [String(entry.episodeId), entry]),
    );
    const finalHierarchy = new Map();
    const occupiedPositions = new Set();

    for (const entry of mapping.episodes) {
        if (!episodeById.has(String(entry.episodeId))) {
            const error = new Error(`Episodio inexistente: ${entry.episodeId}.`);
            error.code = "MIGRATION_PREFLIGHT_FAILED";
            throw error;
        }
        if (!seriesById.has(String(entry.seriesId))) {
            const error = new Error(`Serie inexistente: ${entry.seriesId}.`);
            error.code = "MIGRATION_PREFLIGHT_FAILED";
            throw error;
        }
    }

    for (const episode of episodes) {
        const mapped = mappingsByEpisode.get(String(episode._id));
        const hierarchy = {
            seriesId: mapped?.seriesId ?? episode.seriesId,
            seasonNumber: mapped?.seasonNumber ?? episode.seasonNumber,
            episodeNumber: mapped?.episodeNumber ?? episode.episodeNumber,
        };
        const series = seriesById.get(String(hierarchy.seriesId));
        if (
            !series ||
            !Number.isSafeInteger(hierarchy.seasonNumber) ||
            hierarchy.seasonNumber < 1 ||
            !Number.isSafeInteger(hierarchy.episodeNumber) ||
            hierarchy.episodeNumber < 1
        ) {
            const error = new Error(`Hierarquia incompleta para ${episode._id}.`);
            error.code = "MIGRATION_PREFLIGHT_FAILED";
            throw error;
        }
        if (episode.status === "published" && series.status !== "published") {
            const error = new Error(`Episodio publicado sem serie publicada: ${episode._id}.`);
            error.code = "MIGRATION_PREFLIGHT_FAILED";
            throw error;
        }
        const position = `${hierarchy.seriesId}:${hierarchy.seasonNumber}:${hierarchy.episodeNumber}`;
        if (occupiedPositions.has(position)) {
            const error = new Error(`Posicao final duplicada: ${position}.`);
            error.code = "EPISODE_POSITION_CONFLICT";
            throw error;
        }
        occupiedPositions.add(position);
        finalHierarchy.set(String(episode._id), hierarchy);
    }

    const progressDestinationBySeries = new Map(
        mapping.seriesProgress.map((entry) => [String(entry.seriesId), entry.episodeId]),
    );
    const seriesProgress = series.length
        ? await db.collection("playback_progress").find(
              { contentId: { $in: series.map((item) => item._id) } },
              queryOptions,
          ).toArray()
        : [];
    for (const row of seriesProgress) {
        if (!progressDestinationBySeries.has(String(row.contentId))) {
            const error = new Error(`Falta seriesProgress para ${row.contentId}.`);
            error.code = "MIGRATION_PREFLIGHT_FAILED";
            throw error;
        }
    }
    for (const [seriesId, episodeId] of progressDestinationBySeries) {
        const hierarchy = finalHierarchy.get(String(episodeId));
        if (!hierarchy || String(hierarchy.seriesId) !== seriesId) {
            const error = new Error("Destino de progresso não pertence à série indicada.");
            error.code = "MIGRATION_PREFLIGHT_FAILED";
            throw error;
        }
    }

    return {
        series,
        episodes,
        finalHierarchy,
        progressDestinationBySeries,
    };
}

/** @param {Date | string | undefined} value Data. @returns {number} Timestamp seguro. */
function timestamp(value) {
    const parsed = new Date(value ?? 0).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Migra listas deduplicando a chave única por utilizador/tipo.
 *
 * @param {import("mongodb").Db} db Base de dados. @param {Record<string, unknown>} row Linha. @param {ObjectId} seriesId Destino. @param {object} options Opções Mongo.
 * @returns {Promise<void>}
 */
async function migrateListRow(db, row, seriesId, options) {
    const collection = db.collection("user_content_lists");
    const existing = await collection.findOne(
        { userId: row.userId, contentId: seriesId, type: row.type },
        options,
    );
    if (!existing) {
        await collection.updateOne(
            { _id: row._id, contentId: { $ne: seriesId } },
            { $set: { contentId: seriesId } },
            options,
        );
        return;
    }
    await collection.updateOne(
        { _id: existing._id },
        {
            $set: {
                createdAt: new Date(Math.min(timestamp(existing.createdAt), timestamp(row.createdAt))),
                updatedAt: new Date(Math.max(timestamp(existing.updatedAt), timestamp(row.updatedAt))),
            },
        },
        options,
    );
    await collection.deleteOne({ _id: row._id }, options);
}

/** @returns {Promise<void>} Migra uma classificação, conservando a mais recente. */
async function migrateRatingRow(db, row, seriesId, options) {
    const collection = db.collection("content_ratings");
    const existing = await collection.findOne(
        { userId: row.userId, contentId: seriesId },
        options,
    );
    if (!existing) {
        await collection.updateOne(
            { _id: row._id, contentId: { $ne: seriesId } },
            { $set: { contentId: seriesId } },
            options,
        );
        return;
    }
    if (timestamp(row.updatedAt) > timestamp(existing.updatedAt)) {
        await collection.updateOne(
            { _id: existing._id },
            { $set: { value: row.value, updatedAt: row.updatedAt } },
            options,
        );
    }
    await collection.deleteOne({ _id: row._id }, options);
}

/**
 * Aplica o plano já revisto. Deve ser chamado dentro de `runInTransaction`.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {ReturnType<typeof assertReviewedSeriesEpisodeMapping>} mapping Mapping.
 * @param {{session?: import("mongodb").ClientSession}} [options] Sessão.
 * @returns {Promise<Record<string, unknown>>} Relatório pós-aplicação.
 */
export async function applySeriesEpisodeMigration(db, mapping, options = {}) {
    assertActiveTransaction();
    const mongoOptions = options.session ? { session: options.session } : {};
    const plan = await preflightSeriesEpisodeMigration(db, mapping, options);

    for (const entry of mapping.episodes) {
        await db.collection("contents").updateOne(
            {
                _id: entry.episodeId,
                type: "episode",
                $or: [
                    { seriesId: { $ne: entry.seriesId } },
                    { seasonNumber: { $ne: entry.seasonNumber } },
                    { episodeNumber: { $ne: entry.episodeNumber } },
                ],
            },
            {
                $set: {
                    seriesId: entry.seriesId,
                    seasonNumber: entry.seasonNumber,
                    episodeNumber: entry.episodeNumber,
                },
            },
            mongoOptions,
        );
    }

    for (const episode of plan.episodes) {
        const hierarchy = plan.finalHierarchy.get(String(episode._id));
        const lists = await db.collection("user_content_lists").find(
            { contentId: episode._id },
            mongoOptions,
        ).toArray();
        const ratings = await db.collection("content_ratings").find(
            { contentId: episode._id },
            mongoOptions,
        ).toArray();
        for (const row of lists) {
            await migrateListRow(db, row, hierarchy.seriesId, mongoOptions);
        }
        for (const row of ratings) {
            await migrateRatingRow(db, row, hierarchy.seriesId, mongoOptions);
        }
        await db.collection("content_comments").updateMany(
            { contentId: episode._id },
            { $set: { contentId: hierarchy.seriesId } },
            mongoOptions,
        );
    }

    for (const [seriesId, episodeId] of plan.progressDestinationBySeries) {
        const rows = await db.collection("playback_progress").find(
            { contentId: new ObjectId(seriesId) },
            mongoOptions,
        ).toArray();
        for (const row of rows) {
            const existing = await db.collection("playback_progress").findOne(
                { userId: row.userId, contentId: episodeId },
                mongoOptions,
            );
            if (!existing) {
                await db.collection("playback_progress").updateOne(
                    { _id: row._id },
                    { $set: { contentId: episodeId } },
                    mongoOptions,
                );
                continue;
            }
            if (timestamp(row.lastWatchedAt) > timestamp(existing.lastWatchedAt)) {
                await db.collection("playback_progress").updateOne(
                    { _id: existing._id },
                    {
                        $set: {
                            currentTimeSeconds: row.currentTimeSeconds,
                            durationSeconds: row.durationSeconds,
                            completed: row.completed,
                            lastWatchedAt: row.lastWatchedAt,
                            updatedAt: row.updatedAt,
                        },
                    },
                    mongoOptions,
                );
            }
            await db.collection("playback_progress").deleteOne(
                { _id: row._id },
                mongoOptions,
            );
        }
    }

    await db.collection("contents").updateMany(
        {
            type: "series",
            $or: [
                { media: { $exists: true } },
                { mediaAssetId: { $exists: true } },
                { tracks: { $exists: true } },
                { qualityOptions: { $exists: true } },
            ],
        },
        {
            $unset: {
                media: "",
                mediaAssetId: "",
                tracks: "",
                qualityOptions: "",
            },
            $set: { mediaStatus: "pending" },
        },
        mongoOptions,
    );

    return inspectSeriesEpisodeMigration(db, options);
}
