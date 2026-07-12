/**
 * @file Ficheiro `real_dev/backend/src/modules/playback/playback.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { createContinueWatchingNotification } from "../notifications/notifications.service.js";
import {
    episodeCanonicalPath,
    getEpisodeSeries,
    publicSeriesSummary,
} from "../catalog/catalog-hierarchy.js";
import {
    filterQualityOptionsByEntitlements,
    getEffectiveSubscriptionAccess,
    qualityRankForValue,
} from "../subscriptions/subscriptions.service.js";
import {
    getMediaPreferences,
    ensureMediaPreferenceIndexes,
} from "./media-preferences.service.js";
import { assertProgressPayload } from "./playback.validation.js";

/**
 * Converte uma string de id em ObjectId com erro de domínio.
 *
 * @param {string} id - Id bruto.
 * @param {string} label - Domain label for error messages.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
 */
function asObjectId(id, label) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(id);
}

/**
 * Converte um documento de progresso para o formato público da API.
 *
 * @param {Record<string, unknown> | null} progress - Progress document or null.
 * @param {number} durationSeconds - Content duration.
 * @returns {{ currentTimeSeconds: number, durationSeconds: number, completed: boolean, lastWatchedAt: Date | null }} Progresso público.
 */
function publicProgress(progress, durationSeconds) {
    if (!progress) {
        return {
            currentTimeSeconds: 0,
            durationSeconds,
            completed: false,
            lastWatchedAt: null,
        };
    }

    return {
        currentTimeSeconds: progress.currentTimeSeconds,
        durationSeconds: progress.durationSeconds,
        completed: progress.completed,
        lastWatchedAt: progress.lastWatchedAt,
    };
}

/**
 * Resolve media reproduzível sem construir URLs a partir de input do utilizador.
 *
 * @param {Record<string, unknown>} content - Documento de conteúdo.
 * @param {{ audioLanguage: string, quality: string }} preferences - Preferências do utilizador.
 * @param {Record<string, unknown>} entitlements - Entitlements efetivos do utilizador.
 * @returns {{ playbackUrl: string, selectedAudioLanguage: string, selectedQuality: string }} Playable media.
 */
function resolvePlayableMedia(content, preferences, entitlements) {
    const selectedAudio = content.tracks?.audio?.find(
        (track) => track.language === preferences.audioLanguage,
    );
    const qualityOptions = filterQualityOptionsByEntitlements(
        content.qualityOptions ?? [],
        entitlements,
    );
    const allowedQualityOptions = qualityOptions
        .filter((option) => !option.locked && option.playbackUrl)
        .sort(
            (left, right) =>
                qualityRankForValue(left.value) - qualityRankForValue(right.value),
        );
    const selectedQuality = allowedQualityOptions.find(
        (option) => option.value === preferences.quality,
    );
    const fallbackQuality =
        selectedQuality ?? allowedQualityOptions[allowedQualityOptions.length - 1];

    return {
        playbackUrl:
            selectedAudio?.src ??
            fallbackQuality?.playbackUrl ??
            content.media.playbackUrl,
        selectedAudioLanguage: selectedAudio?.language ?? "",
        selectedQuality: fallbackQuality?.value ?? "",
    };
}

/**
 * Lança erro quando as definições parentais bloqueiam um conteúdo.
 *
 * @param {{ parentalMaxAgeRating?: number } | null} user - User document.
 * @param {{ ageRating?: number }} content - Documento de conteúdo.
 * @returns {void}
 */
function assertParentalAccess(user, content) {
    const maxAge = Number.isInteger(user?.parentalMaxAgeRating)
        ? user.parentalMaxAgeRating
        : 18;

    if (Number(content.ageRating) > maxAge) {
        throw new HttpError(403, "Conteudo bloqueado pelo controlo parental.");
    }
}

/**
 * Converte conteúdo para o formato de resposta de reprodução.
 *
 * @param {Record<string, unknown>} content - Documento de conteúdo.
 * @param {Record<string, string>} preferences - Preferências do utilizador.
 * @param {Record<string, unknown>} entitlements Entitlements efetivos.
 * @returns {Record<string, unknown>} Conteúdo público de reprodução.
 */
function publicPlaybackContent(content, preferences, entitlements) {
    return {
        id: String(content._id),
        title: content.title,
        type: content.type,
        durationSeconds: content.durationSeconds,
        media: resolvePlayableMedia(content, preferences, entitlements),
        tracks: content.tracks ?? { subtitles: [], audio: [] },
        qualityOptions: filterQualityOptionsByEntitlements(
            content.qualityOptions ?? [],
            entitlements,
        ),
        preferences,
        entitlements,
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
 * Constrói navegação contextual entre episódios publicados da mesma série.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @param {Record<string, unknown>} episode Episódio atual.
 * @param {Record<string, unknown>} series Série publicada.
 * @returns {Promise<{ previousEpisode: Record<string, unknown> | null, nextEpisode: Record<string, unknown> | null }>} Navegação adjacente.
 */
async function loadEpisodeNavigation(db, episode, series) {
    const episodes = await db
        .collection("contents")
        .find({
            type: "episode",
            seriesId: series._id,
            status: "published",
        })
        .sort({ seasonNumber: 1, episodeNumber: 1, title: 1 })
        .toArray();
    const currentIndex = episodes.findIndex(
        (candidate) => String(candidate._id) === String(episode._id),
    );

    /**
     * Converte um episódio adjacente num link seguro.
     *
     * @param {Record<string, unknown> | undefined} candidate Episódio adjacente.
     * @returns {Record<string, unknown> | null} Link contextual.
     */
    function navigationItem(candidate) {
        if (!candidate) {
            return null;
        }

        return {
            id: String(candidate._id),
            title: candidate.title,
            slug: candidate.slug,
            seasonNumber: candidate.seasonNumber,
            episodeNumber: candidate.episodeNumber,
            canonicalPath: episodeCanonicalPath(series, candidate),
        };
    }

    return {
        previousEpisode: navigationItem(episodes[currentIndex - 1]),
        nextEpisode: navigationItem(episodes[currentIndex + 1]),
    };
}

/**
 * Valida se o conteúdo pode ser reproduzido e carrega a série do episódio.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @param {Record<string, unknown>} content Conteúdo publicado.
 * @returns {Promise<Record<string, unknown> | null>} Série do episódio ou null.
 */
async function assertPlayableHierarchy(db, content) {
    if (content.type === "series") {
        throw new HttpError(409, "A serie nao e reproduzivel; escolhe um episodio.");
    }

    if (content.type !== "episode") {
        return null;
    }

    return getEpisodeSeries(db, content.seriesId, { requirePublished: true });
}

/**
 * Garante que existem os índices de reprodução.
 *
 * @returns {Promise<void>} Termina depois da criação de índices.
 */
export async function ensurePlaybackIndexes() {
    const db = await getDb();
    await db
        .collection("playback_progress")
        .createIndex({ userId: 1, contentId: 1 }, { unique: true });
    await db
        .collection("playback_progress")
        .createIndex({ userId: 1, lastWatchedAt: -1 });
    await ensureMediaPreferenceIndexes();
}

/**
 * Carrega dados de reprodução de conteúdo publicado para um utilizador autenticado.
 *
 * @param {string} contentId - Id do conteúdo.
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<{ content: Record<string, unknown>, progress: ReturnType<typeof publicProgress> }>} Resposta de reprodução.
 */
export async function getPlayback(contentId, userId) {
    const db = await getDb();
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const userObjectId = asObjectId(userId, "Utilizador");
    const content = await db.collection("contents").findOne({
        _id: contentObjectId,
        status: "published",
    });

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const series = await assertPlayableHierarchy(db, content);

    const user = await db.collection("users").findOne({ _id: userObjectId });
    assertParentalAccess(user, content);

    const preferences = await getMediaPreferences(userId);
    const effectiveAccess = await getEffectiveSubscriptionAccess(userId);
    const progress = await db.collection("playback_progress").findOne({
        userId: userObjectId,
        contentId: contentObjectId,
    });

    const hierarchy = series
        ? {
              series: publicSeriesSummary(series),
              canonicalPath: episodeCanonicalPath(series, content),
              ...(await loadEpisodeNavigation(db, content, series)),
          }
        : {};

    return {
        content: publicPlaybackContent(content, preferences, effectiveAccess.entitlements),
        progress: publicProgress(progress, content.durationSeconds),
        ...hierarchy,
    };
}

/**
 * Guarda progresso de reprodução para um par utilizador/conteúdo.
 *
 * @param {string} contentId - Id do conteúdo.
 * @param {string} userId - Authenticated user id.
 * @param {{ currentTimeSeconds?: unknown }} input - Progress dados.
 * @returns {Promise<ReturnType<typeof publicProgress>>} Saved progress.
 */
/**
 * Guarda progresso de visualizacao e cria alerta de continuidade quando faz sentido.
 *
 * @param {string} contentId Identificador do conteúdo.
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {object} input Progresso recebido da UI.
 * @returns {Promise<object>} Progresso público atualizado.
 */
export async function savePlaybackProgress(contentId, userId, input) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteúdo");
  const userObjectId = asObjectId(userId, "Utilizador");
  const content = await db.collection("contents").findOne({ _id: contentObjectId, status: "published" });

  if (!content) {
    const error = new Error("Conteúdo não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  await assertPlayableHierarchy(db, content);

  const progress = assertProgressPayload(input, content.durationSeconds);
  const now = new Date();

  await db.collection("playback_progress").updateOne(
    { userId: userObjectId, contentId: contentObjectId },
    {
      $set: { ...progress, lastWatchedAt: now, updatedAt: now },
      $setOnInsert: { userId: userObjectId, contentId: contentObjectId, createdAt: now },
    },
    { upsert: true },
  );

  if (!progress.completed && progress.currentTimeSeconds >= 60) {
    // O alerta só nasce depois de haver progresso real e fica deduplicado por conteúdo.
    await createContinueWatchingNotification(userId, {
      contentId,
      contentTitle: content.title,
    });
  }

  return publicProgress({ ...progress, lastWatchedAt: now }, content.durationSeconds);
}

/**
 * Lista progresso inacabado do utilizador autenticado.
 *
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<Record<string, unknown>[]>} Continue-watching items.
 */
export async function listContinueWatching(userId) {
    const db = await getDb();
    const rows = await db
        .collection("playback_progress")
        .aggregate([
            {
                $match: {
                    userId: asObjectId(userId, "Utilizador"),
                    completed: false,
                },
            },
            { $sort: { lastWatchedAt: -1 } },
            { $limit: 12 },
            {
                $lookup: {
                    from: "contents",
                    localField: "contentId",
                    foreignField: "_id",
                    as: "content",
                },
            },
            { $unwind: "$content" },
            { $match: { "content.status": "published" } },
        ])
        .toArray();

    const items = await Promise.all(
        rows.map(async (row) => {
            const item = {
                id: String(row.content._id),
                title: row.content.title,
                slug: row.content.slug,
                type: row.content.type,
                posterUrl: row.content.assets?.posterUrl ?? "",
                currentTimeSeconds: row.currentTimeSeconds,
                durationSeconds: row.durationSeconds,
                lastWatchedAt: row.lastWatchedAt,
            };

            if (row.content.type === "series") {
                return null;
            }

            if (row.content.type !== "episode") {
                return item;
            }

            try {
                const series = await getEpisodeSeries(db, row.content.seriesId, {
                    requirePublished: true,
                });

                return {
                    ...item,
                    series: publicSeriesSummary(series),
                    seasonNumber: row.content.seasonNumber,
                    episodeNumber: row.content.episodeNumber,
                    canonicalPath: episodeCanonicalPath(series, row.content),
                };
            } catch (error) {
                if (error.statusCode === 404) {
                    return null;
                }

                throw error;
            }
        }),
    );

    return items.filter(Boolean);
}
