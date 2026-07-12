/**
 * @file Auditoria e migração idempotente da hierarquia série -> episódio.
 *
 * Por omissão apenas imprime um relatório. A escrita exige simultaneamente
 * `--apply` e `--mapping <ficheiro.json>`; relações nunca são inferidas por texto.
 */

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { ObjectId } from "mongodb";
import { getDb } from "../src/config/database.js";

/**
 * Converte e valida um identificador do mapping.
 *
 * @param {unknown} value Valor recebido.
 * @param {string} label Campo para diagnóstico.
 * @returns {ObjectId} Identificador MongoDB.
 */
function objectId(value, label) {
    if (!ObjectId.isValid(value)) throw new Error(`${label} invalido.`);
    return new ObjectId(value);
}

/**
 * Lê os argumentos seguros suportados pelo script.
 *
 * @param {string[]} argv Argumentos CLI.
 * @returns {{ apply: boolean, mappingPath: string | null }} Opções.
 */
function parseArgs(argv) {
    const mappingIndex = argv.indexOf("--mapping");
    return {
        apply: argv.includes("--apply"),
        mappingPath:
            mappingIndex >= 0 && argv[mappingIndex + 1]
                ? argv[mappingIndex + 1]
                : null,
    };
}

/**
 * Carrega um mapping explícito ou devolve a estrutura vazia em dry-run.
 *
 * @param {string | null} mappingPath Caminho indicado pelo operador.
 * @returns {Promise<{ episodes: object[], seriesProgress: object[] }>} Mapping normalizado.
 */
async function loadMapping(mappingPath) {
    if (!mappingPath) return { episodes: [], seriesProgress: [] };
    const parsed = JSON.parse(await readFile(mappingPath, "utf8"));
    return {
        episodes: Array.isArray(parsed.episodes) ? parsed.episodes : [],
        seriesProgress: Array.isArray(parsed.seriesProgress)
            ? parsed.seriesProgress
            : [],
    };
}

/**
 * Constrói o diagnóstico do estado atual sem fazer escritas.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @returns {Promise<Record<string, unknown>>} Relatório serializável.
 */
export async function inspectSeriesEpisodeMigration(db) {
    const [series, episodes] = await Promise.all([
        db.collection("contents").find({ type: "series" }).toArray(),
        db.collection("contents").find({ type: "episode" }).toArray(),
    ]);
    const seriesIds = new Set(series.map((item) => String(item._id)));
    const episodeIds = episodes.map((item) => item._id);
    const positions = new Map();
    const duplicatePositions = [];

    for (const episode of episodes) {
        if (
            !seriesIds.has(String(episode.seriesId)) ||
            !Number.isInteger(episode.seasonNumber) ||
            episode.seasonNumber <= 0 ||
            !Number.isInteger(episode.episodeNumber) ||
            episode.episodeNumber <= 0
        ) {
            continue;
        }
        const key = `${episode.seriesId}:${episode.seasonNumber}:${episode.episodeNumber}`;
        if (positions.has(key)) {
            duplicatePositions.push([positions.get(key), String(episode._id)]);
        } else {
            positions.set(key, String(episode._id));
        }
    }

    const orphanEpisodeIds = episodes
        .filter(
            (episode) =>
                !seriesIds.has(String(episode.seriesId)) ||
                !Number.isInteger(episode.seasonNumber) ||
                episode.seasonNumber <= 0 ||
                !Number.isInteger(episode.episodeNumber) ||
                episode.episodeNumber <= 0,
        )
        .map((episode) => String(episode._id));
    const seriesProgress = await db.collection("playback_progress").find({
        contentId: { $in: series.map((item) => item._id) },
    }).toArray();
    const [listCount, ratingCount, commentCount] = episodeIds.length
        ? await Promise.all([
              db.collection("user_content_lists").countDocuments({ contentId: { $in: episodeIds } }),
              db.collection("content_ratings").countDocuments({ contentId: { $in: episodeIds } }),
              db.collection("content_comments").countDocuments({ contentId: { $in: episodeIds } }),
          ])
        : [0, 0, 0];

    return {
        seriesCount: series.length,
        episodeCount: episodes.length,
        orphanEpisodeIds,
        publishedOrphanEpisodeIds: episodes
            .filter((episode) => episode.status === "published" && orphanEpisodeIds.includes(String(episode._id)))
            .map((episode) => String(episode._id)),
        duplicatePositions,
        playableSeriesIds: series
            .filter((item) => item.durationSeconds || item.media || item.tracks || item.qualityOptions)
            .map((item) => String(item._id)),
        seriesProgress: seriesProgress.map((row) => ({
            id: String(row._id),
            userId: String(row.userId),
            seriesId: String(row.contentId),
        })),
        episodeInteractions: {
            lists: listCount,
            ratings: ratingCount,
            comments: commentCount,
        },
    };
}

/**
 * Migra uma entrada de lista de episódio para a série, deduplicando timestamps.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {Record<string, unknown>} row Entrada original.
 * @param {ObjectId} seriesId Série destino.
 * @returns {Promise<void>} Termina depois da convergência.
 */
async function migrateListRow(db, row, seriesId) {
    const collection = db.collection("user_content_lists");
    const existing = await collection.findOne({
        userId: row.userId,
        contentId: seriesId,
        type: row.type,
    });
    if (!existing) {
        await collection.updateOne({ _id: row._id }, { $set: { contentId: seriesId } });
        return;
    }
    await collection.updateOne(
        { _id: existing._id },
        {
            $set: {
                createdAt: new Date(Math.min(new Date(existing.createdAt), new Date(row.createdAt))),
                updatedAt: new Date(Math.max(new Date(existing.updatedAt), new Date(row.updatedAt))),
            },
        },
    );
    await collection.deleteOne({ _id: row._id });
}

/**
 * Migra uma classificação para a série, conservando a alteração mais recente.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {Record<string, unknown>} row Rating original.
 * @param {ObjectId} seriesId Série destino.
 * @returns {Promise<void>} Termina depois da convergência.
 */
async function migrateRatingRow(db, row, seriesId) {
    const collection = db.collection("content_ratings");
    const existing = await collection.findOne({ userId: row.userId, contentId: seriesId });
    if (!existing) {
        await collection.updateOne({ _id: row._id }, { $set: { contentId: seriesId } });
        return;
    }
    if (new Date(row.updatedAt) > new Date(existing.updatedAt)) {
        await collection.updateOne(
            { _id: existing._id },
            { $set: { value: row.value, updatedAt: row.updatedAt } },
        );
    }
    await collection.deleteOne({ _id: row._id });
}

/**
 * Move progresso legado de série para um episódio escolhido explicitamente.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {ObjectId} seriesId Série origem.
 * @param {ObjectId} episodeId Episódio destino.
 * @returns {Promise<void>} Termina depois de deduplicar por utilizador.
 */
async function migrateSeriesProgress(db, seriesId, episodeId) {
    const collection = db.collection("playback_progress");
    const rows = await collection.find({ contentId: seriesId }).toArray();
    for (const row of rows) {
        const existing = await collection.findOne({ userId: row.userId, contentId: episodeId });
        if (!existing) {
            await collection.updateOne({ _id: row._id }, { $set: { contentId: episodeId } });
            continue;
        }
        if (new Date(row.lastWatchedAt) > new Date(existing.lastWatchedAt)) {
            await collection.updateOne(
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
            );
        }
        await collection.deleteOne({ _id: row._id });
    }
}

/**
 * Aplica um mapping já confirmado pelo operador.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {{ episodes: object[], seriesProgress: object[] }} mapping Mapping explícito.
 * @returns {Promise<Record<string, unknown>>} Relatório final.
 */
export async function applySeriesEpisodeMigration(db, mapping) {
    const episodeToSeries = new Map();
    const episodeMappings = new Map();
    const proposedPositions = new Set();

    for (const entry of mapping.episodes) {
        const episodeId = objectId(entry.episodeId, "episodeId");
        const seriesId = objectId(entry.seriesId, "seriesId");
        if (!Number.isInteger(entry.seasonNumber) || entry.seasonNumber <= 0) throw new Error("seasonNumber invalido.");
        if (!Number.isInteger(entry.episodeNumber) || entry.episodeNumber <= 0) throw new Error("episodeNumber invalido.");
        const [episode, series] = await Promise.all([
            db.collection("contents").findOne({ _id: episodeId, type: "episode" }),
            db.collection("contents").findOne({ _id: seriesId, type: "series" }),
        ]);
        if (!episode || !series) throw new Error("Mapping referencia conteudo inexistente ou de tipo incorreto.");
        const position = `${seriesId}:${entry.seasonNumber}:${entry.episodeNumber}`;
        if (proposedPositions.has(position)) throw new Error(`Posicao duplicada no mapping: ${position}.`);
        proposedPositions.add(position);
        episodeToSeries.set(String(episodeId), seriesId);
        episodeMappings.set(String(episodeId), entry);
    }

    const [currentEpisodes, currentSeries] = await Promise.all([
        db.collection("contents").find({ type: "episode" }).toArray(),
        db.collection("contents").find({ type: "series" }).toArray(),
    ]);
    const validSeriesIds = new Set(currentSeries.map((item) => String(item._id)));
    const finalPositions = new Set();

    for (const episode of currentEpisodes) {
        const entry = episodeMappings.get(String(episode._id));
        const seriesId = String(entry?.seriesId ?? episode.seriesId ?? "");
        const seasonNumber = entry?.seasonNumber ?? episode.seasonNumber;
        const episodeNumber = entry?.episodeNumber ?? episode.episodeNumber;
        const hierarchyValid =
            validSeriesIds.has(seriesId) &&
            Number.isInteger(seasonNumber) &&
            seasonNumber > 0 &&
            Number.isInteger(episodeNumber) &&
            episodeNumber > 0;

        if (!hierarchyValid) {
            if (episode.status === "published") {
                throw new Error(`Episodio publicado sem mapping valido: ${episode._id}.`);
            }
            continue;
        }

        const position = `${seriesId}:${seasonNumber}:${episodeNumber}`;
        if (finalPositions.has(position)) {
            throw new Error(`Posicao final duplicada: ${position}.`);
        }
        finalPositions.add(position);
    }

    const progressMappings = new Map(
        mapping.seriesProgress.map((entry) => [String(entry.seriesId), entry.episodeId]),
    );
    const seriesProgress = await db.collection("playback_progress").find({
        contentId: { $in: currentSeries.map((item) => item._id) },
    }).toArray();
    for (const row of seriesProgress) {
        if (!progressMappings.has(String(row.contentId))) {
            throw new Error(`Falta seriesProgress explícito para a serie ${row.contentId}.`);
        }
    }
    for (const [seriesId, episodeId] of progressMappings) {
        const episode = currentEpisodes.find(
            (item) => String(item._id) === String(episodeId),
        );
        const finalSeriesId = String(
            episodeMappings.get(String(episodeId))?.seriesId ??
                episode?.seriesId ??
                "",
        );
        if (!episode || finalSeriesId !== seriesId) {
            throw new Error("Destino de progresso nao pertence a serie indicada.");
        }
    }

    for (const entry of mapping.episodes) {
        await db.collection("contents").updateOne(
            { _id: objectId(entry.episodeId, "episodeId"), type: "episode" },
            {
                $set: {
                    seriesId: objectId(entry.seriesId, "seriesId"),
                    seasonNumber: entry.seasonNumber,
                    episodeNumber: entry.episodeNumber,
                    updatedAt: new Date(),
                },
            },
        );
    }

    const allEpisodes = await db.collection("contents").find({ type: "episode" }).toArray();
    for (const episode of allEpisodes) {
        const seriesId = episodeToSeries.get(String(episode._id)) ?? episode.seriesId;
        if (!ObjectId.isValid(seriesId)) continue;
        const [lists, ratings] = await Promise.all([
            db.collection("user_content_lists").find({ contentId: episode._id }).toArray(),
            db.collection("content_ratings").find({ contentId: episode._id }).toArray(),
        ]);
        for (const row of lists) await migrateListRow(db, row, new ObjectId(seriesId));
        for (const row of ratings) await migrateRatingRow(db, row, new ObjectId(seriesId));
        await db.collection("content_comments").updateMany(
            { contentId: episode._id },
            { $set: { contentId: new ObjectId(seriesId) } },
        );
    }

    for (const [seriesId, episodeId] of progressMappings) {
        await migrateSeriesProgress(db, new ObjectId(seriesId), new ObjectId(episodeId));
    }

    await db.collection("contents").updateMany(
        { type: "series" },
        { $unset: { durationSeconds: "", media: "", tracks: "", qualityOptions: "" } },
    );

    return inspectSeriesEpisodeMigration(db);
}

/**
 * Executa a interface CLI do migrador.
 *
 * @returns {Promise<void>} Termina depois de imprimir o relatório.
 */
async function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.apply && !options.mappingPath) {
        throw new Error("--apply exige --mapping <ficheiro.json>.");
    }
    const db = await getDb();
    const mapping = await loadMapping(options.mappingPath);
    const before = await inspectSeriesEpisodeMigration(db);
    if (!options.apply) {
        process.stdout.write(`${JSON.stringify({ mode: "dry-run", report: before }, null, 2)}\n`);
        return;
    }
    const after = await applySeriesEpisodeMigration(db, mapping);
    process.stdout.write(`${JSON.stringify({ mode: "apply", before, after }, null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((error) => {
        process.stderr.write(`${error.message}\n`);
        process.exitCode = 1;
    });
}
