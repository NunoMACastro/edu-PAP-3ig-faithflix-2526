/**
 * @file Ficheiro `real_dev/backend/src/modules/playback/playback.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { createContinueWatchingNotification } from "../notifications/notifications.service.js";
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
 * @returns {{ playbackUrl: string, selectedAudioLanguage: string, selectedQuality: string }} Playable media.
 */
function resolvePlayableMedia(content, preferences) {
    const selectedAudio = content.tracks?.audio?.find(
        (track) => track.language === preferences.audioLanguage,
    );
    const selectedQuality = content.qualityOptions?.find(
        (option) => option.value === preferences.quality,
    );

    return {
        playbackUrl:
            selectedAudio?.src ??
            selectedQuality?.playbackUrl ??
            content.media.playbackUrl,
        selectedAudioLanguage: selectedAudio?.language ?? "",
        selectedQuality: selectedQuality?.value ?? "",
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
 * @returns {Record<string, unknown>} Conteúdo público de reprodução.
 */
function publicPlaybackContent(content, preferences) {
    return {
        id: String(content._id),
        title: content.title,
        durationSeconds: content.durationSeconds,
        media: resolvePlayableMedia(content, preferences),
        tracks: content.tracks ?? { subtitles: [], audio: [] },
        qualityOptions: content.qualityOptions ?? [],
        preferences,
    };
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

    const user = await db.collection("users").findOne({ _id: userObjectId });
    assertParentalAccess(user, content);

    const preferences = await getMediaPreferences(userId);
    const progress = await db.collection("playback_progress").findOne({
        userId: userObjectId,
        contentId: contentObjectId,
    });

    return {
        content: publicPlaybackContent(content, preferences),
        progress: publicProgress(progress, content.durationSeconds),
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

    return rows.map((row) => ({
        id: String(row.content._id),
        title: row.content.title,
        slug: row.content.slug,
        posterUrl: row.content.assets?.posterUrl ?? "",
        currentTimeSeconds: row.currentTimeSeconds,
        durationSeconds: row.durationSeconds,
        lastWatchedAt: row.lastWatchedAt,
    }));
}
