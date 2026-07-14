/**
 * @file Ficheiro `real_dev/backend/src/modules/playback/playback.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { logger } from "../../utils/logger.js";
import { paginationMetadata } from "../../utils/pagination.js";
import {
    canonicalMediaSource as canonicalSource,
    getMediaAvailability,
    hasPlayableMediaSource as hasRecognizedMediaSource,
    mediaCandidateQuality as candidateQuality,
} from "../catalog/catalog-media.js";
import {
    episodeCanonicalPath,
    getEpisodeSeries,
    publicSeriesSummary,
} from "../catalog/catalog-hierarchy.js";
import { createContinueWatchingNotification } from "../notifications/notifications.service.js";
import {
    filterQualityOptionsByEntitlements,
    getEffectiveSubscriptionAccess,
    isSupportedQualityValue,
    qualityRankForValue,
} from "../subscriptions/subscriptions.service.js";
import {
    getMediaPreferences,
    ensureMediaPreferenceIndexes,
} from "./media-preferences.service.js";
import {
    assertProgressPayload,
    parseContinueWatchingPagination,
} from "./playback.validation.js";

/**
 * Converte uma string de id em ObjectId com erro de domínio.
 *
 * @param {string} id - Id bruto.
 * @param {string} label - Domain label for error messages.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
 */
function asObjectId(id, label) {
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
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
 * Normaliza uma fonte de playback e rejeita valores vazios ou não textuais.
 *
 * @param {unknown} value Fonte candidata do documento interno.
 * @returns {string} Fonte utilizável ou string vazia.
 */
function playbackSource(value) {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Confirma que a qualidade de uma variante está dentro dos entitlements.
 *
 * @param {string} quality Qualidade fechada.
 * @param {Record<string, unknown>} entitlements Entitlements efetivos.
 * @returns {boolean} Verdadeiro apenas para qualidades conhecidas e permitidas.
 */
function isAllowedQuality(quality, entitlements) {
    if (!isSupportedQualityValue(quality)) {
        return false;
    }

    const maxRank = Number(
        entitlements.qualityRank ??
            qualityRankForValue(entitlements.maxQuality),
    );
    return qualityRankForValue(quality) <= maxRank;
}

/**
 * Constrói as opções públicas sem transportar qualquer alias de fonte.
 *
 * @param {Record<string, unknown>[]} options Opções filtradas por entitlement.
 * @param {string} selectedQuality Qualidade canónica selecionada.
 * @returns {Array<{ value: string, label: string, locked: boolean, selected: boolean, requiredTier?: string, lockedReason?: string }>} Opções seguras.
 */
function publicQualityOptions(options, selectedQuality) {
    return options.map((option) => {
        const value = playbackSource(option.value);
        const publicOption = {
            value,
            label: playbackSource(option.label) || value,
            locked: Boolean(option.locked),
            selected: !option.locked && value === selectedQuality,
        };

        if (typeof option.requiredTier === "string") {
            publicOption.requiredTier = option.requiredTier;
        }

        if (typeof option.lockedReason === "string") {
            publicOption.lockedReason = option.lockedReason;
        }

        return publicOption;
    });
}

/**
 * Expõe apenas labels de faixas; URLs, metadata interna e aliases de fonte não
 * atravessam a fronteira privada do playback.
 *
 * @param {{ subtitles?: Record<string, unknown>[], audio?: Record<string, unknown>[] }} tracks Faixas internas.
 * @returns {{ subtitles: Array<{ language: string, label: string }>, audio: Array<{ language: string, label: string }> }} Faixas públicas.
 */
function publicTracks(tracks = {}) {
    const serialize = (track) => ({
        language: playbackSource(track?.language),
        label: playbackSource(track?.label),
    });

    const subtitles = Array.isArray(tracks?.subtitles)
        ? tracks.subtitles
        : [];
    const audio = Array.isArray(tracks?.audio) ? tracks.audio : [];

    return {
        subtitles: subtitles.map(serialize),
        audio: audio.map(serialize),
    };
}

/**
 * Resolve media reproduzível sem construir URLs a partir de input do utilizador.
 *
 * @param {Record<string, unknown>} content - Documento de conteúdo.
 * @param {{ audioLanguage: string, quality: string }} preferences - Preferências do utilizador.
 * @param {Record<string, unknown>} entitlements - Entitlements efetivos do utilizador.
 * @returns {{ source: { url: string, protocol: "progressive" | "hls" | "dash", mimeType: string } | null, selectedAudioLanguage: string, selectedQuality: string, qualityOptions: Record<string, unknown>[] }} Variante canónica.
 */
function resolvePlayableMedia(content, preferences, entitlements) {
    const declaredQualityOptions = Array.isArray(content.qualityOptions)
        ? content.qualityOptions
        : [];
    const qualityOptions = filterQualityOptionsByEntitlements(
        declaredQualityOptions,
        entitlements,
    );
    const playableVariants = declaredQualityOptions
        .map((option) => {
            const quality = playbackSource(
                option?.value ?? option?.label,
            ).toLowerCase();
            const source = canonicalSource(option);

            if (!source || !isAllowedQuality(quality, entitlements)) {
                return null;
            }

            return { quality, source };
        })
        .filter(Boolean)
        .sort(
            (left, right) =>
                qualityRankForValue(left.quality) -
                qualityRankForValue(right.quality),
        );
    const preferredQuality = playbackSource(preferences?.quality).toLowerCase();
    const selectedVariant =
        playableVariants.find(
            (variant) => variant.quality === preferredQuality,
        ) ?? playableVariants.at(-1);
    const baseSource = canonicalSource(content.media);
    const baseQuality = candidateQuality(content.media);
    const canUseBase =
        baseSource &&
        (!baseQuality || isAllowedQuality(baseQuality, entitlements));
    const effectiveQuality = isSupportedQualityValue(baseQuality)
        ? baseQuality
        : "";
    const selectedQuality = selectedVariant?.quality ?? effectiveQuality;

    return {
        source: selectedVariant?.source ?? (canUseBase ? baseSource : null),
        selectedAudioLanguage: "",
        selectedQuality,
        qualityOptions: publicQualityOptions(qualityOptions, selectedQuality),
    };
}

/**
 * Cria o erro de dominio devolvido quando o catalogo ainda nao tem media pronta.
 *
 * @returns {HttpError & { code: "MEDIA_NOT_READY" }} Erro HTTP estruturado.
 */
function mediaNotReadyError() {
    const error = new HttpError(
        409,
        "Conteudo ainda nao tem media pronta para reproducao.",
    );
    error.code = "MEDIA_NOT_READY";
    return error;
}

/**
 * Exige estado `ready` e pelo menos uma fonte configurada.
 *
 * @param {Record<string, unknown>} content Documento de conteudo.
 * @returns {void}
 * @throws {HttpError} Quando o conteudo nao esta pronto.
 */
export function assertMediaReady(content) {
    if (!getMediaAvailability(content).isPlayable) {
        throw mediaNotReadyError();
    }
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
 * Constrói links seguros para os episódios adjacentes publicados.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @param {Record<string, unknown>} episode Episódio atual.
 * @param {Record<string, unknown>} series Série publicada.
 * @returns {Promise<{previousEpisode: Record<string, unknown> | null, nextEpisode: Record<string, unknown> | null}>} Navegação contextual.
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
    const navigationItem = (candidate) =>
        candidate
            ? {
                  id: String(candidate._id),
                  title: candidate.title,
                  slug: candidate.slug,
                  seasonNumber: candidate.seasonNumber,
                  episodeNumber: candidate.episodeNumber,
                  canonicalPath: episodeCanonicalPath(series, candidate),
              }
            : null;

    return {
        previousEpisode: navigationItem(episodes[currentIndex - 1]),
        nextEpisode: navigationItem(episodes[currentIndex + 1]),
    };
}

/**
 * Impede playback direto de séries e valida a série publicada de episódios.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @param {Record<string, unknown>} content Conteúdo publicado.
 * @returns {Promise<Record<string, unknown> | null>} Série do episódio ou null.
 */
async function assertPlayableHierarchy(db, content) {
    if (content.type === "series") {
        throw new HttpError(
            409,
            "A serie nao e reproduzivel; escolhe um episodio.",
            undefined,
            "SERIES_NOT_PLAYABLE",
        );
    }

    if (content.type !== "episode") return null;

    return getEpisodeSeries(db, content.seriesId, { requirePublished: true });
}

/**
 * Valida publicação, autenticação e controlo parental antes da media.
 *
 * @param {Record<string, unknown> | null} content Conteúdo candidato.
 * @param {Record<string, unknown> | null} user Utilizador autenticado.
 * @returns {void}
 */
function assertPlaybackAccess(content, user) {
    if (!content || content.status !== "published") {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    if (!user) {
        throw new HttpError(
            401,
            "Autenticacao obrigatoria.",
            undefined,
            "AUTH_REQUIRED",
        );
    }

    assertParentalAccess(user, content);
}

/**
 * Aplica a mesma fronteira de publicação, parental e media em todos os fluxos.
 *
 * @param {Record<string, unknown> | null} content Conteúdo candidato.
 * @param {Record<string, unknown> | null} user Utilizador autenticado.
 * @returns {void}
 */
function assertPlaybackEligibility(content, user) {
    assertPlaybackAccess(content, user);
    assertMediaReady(content);

    if (!hasRecognizedMediaSource(content)) {
        throw mediaNotReadyError();
    }
}

/**
 * Carrega e valida um conteúdo para operações de playback.
 *
 * @param {import("mongodb").Db} db Base de dados.
 * @param {import("mongodb").ObjectId} contentObjectId Conteúdo pedido.
 * @param {import("mongodb").ObjectId} userObjectId Utilizador autenticado.
 * @returns {Promise<{ content: Record<string, unknown>, user: Record<string, unknown>, series: Record<string, unknown> | null }>} Contexto autorizado.
 */
async function loadPlaybackEligibility(db, contentObjectId, userObjectId) {
    const [content, user] = await Promise.all([
        db.collection("contents").findOne({ _id: contentObjectId }),
        db.collection("users").findOne({ _id: userObjectId }),
    ]);

    assertPlaybackAccess(content, user);
    const series = await assertPlayableHierarchy(db, content);
    if (series) assertParentalAccess(user, series);
    assertMediaReady(content);
    if (!hasRecognizedMediaSource(content)) throw mediaNotReadyError();

    return { content, user, series };
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
    const selectedMedia = resolvePlayableMedia(
        content,
        preferences,
        entitlements,
    );

    if (!selectedMedia.source) {
        throw mediaNotReadyError();
    }

    return {
        id: String(content._id),
        title: content.title,
        slug: content.slug,
        type: content.type,
        durationSeconds: content.durationSeconds,
        mediaStatus: "ready",
        isPlayable: true,
        source: selectedMedia.source,
        selectedAudioLanguage: selectedMedia.selectedAudioLanguage,
        selectedQuality: selectedMedia.selectedQuality,
        tracks: publicTracks(content.tracks),
        qualityOptions: selectedMedia.qualityOptions,
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
        .createIndex({ userId: 1, completed: 1, lastWatchedAt: -1, _id: 1 });
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
    const { content, series } = await loadPlaybackEligibility(
        db,
        contentObjectId,
        userObjectId,
    );
    const [preferences, effectiveAccess, progress] = await Promise.all([
        getMediaPreferences(userId),
        getEffectiveSubscriptionAccess(userId),
        db.collection("playback_progress").findOne({
            userId: userObjectId,
            contentId: contentObjectId,
        }),
    ]);

    if (!effectiveAccess.hasPremiumAccess) {
        throw new HttpError(
            403,
            "Subscricao ativa obrigatoria para reproduzir este conteudo.",
            undefined,
            "SUBSCRIPTION_REQUIRED",
        );
    }

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
 * Devolve uma fonte privada adequada a preview editorial no detalhe.
 *
 * O preview reutiliza toda a elegibilidade do playback, mas aplica um teto
 * independente de 1080p. Assim, uma conta com acesso a 4K nunca transfere essa
 * variante em autoplay e uma obra exclusivamente 4K mantém o backdrop.
 *
 * @param {string} contentId Identificador do conteúdo publicado.
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {Promise<{ content: { id: string, title: string, source: Record<string, string>, selectedQuality: string } }>} DTO mínimo do preview privado.
 */
export async function getPlaybackPreview(contentId, userId) {
    const db = await getDb();
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const userObjectId = asObjectId(userId, "Utilizador");
    const { content } = await loadPlaybackEligibility(
        db,
        contentObjectId,
        userObjectId,
    );
    const effectiveAccess = await getEffectiveSubscriptionAccess(userId);

    if (!effectiveAccess.hasPremiumAccess) {
        throw new HttpError(
            403,
            "Subscricao ativa obrigatoria para reproduzir este conteudo.",
            undefined,
            "SUBSCRIPTION_REQUIRED",
        );
    }

    const previewEntitlements = {
        ...effectiveAccess.entitlements,
        maxQuality: "1080p",
        qualityRank: Math.min(
            qualityRankForValue("1080p"),
            Number(effectiveAccess.entitlements?.qualityRank) ||
                qualityRankForValue(effectiveAccess.entitlements?.maxQuality),
        ),
    };
    const selectedMedia = resolvePlayableMedia(
        content,
        { audioLanguage: "", quality: "1080p" },
        previewEntitlements,
    );

    if (!selectedMedia.source) {
        throw mediaNotReadyError();
    }

    return {
        content: {
            id: String(content._id),
            title: content.title,
            source: selectedMedia.source,
            selectedQuality: selectedMedia.selectedQuality,
        },
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
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const userObjectId = asObjectId(userId, "Utilizador");
    const { content } = await loadPlaybackEligibility(
        db,
        contentObjectId,
        userObjectId,
    );
    const progress = assertProgressPayload(input, content.durationSeconds);
    const now = new Date();

    await db.collection("playback_progress").updateOne(
        { userId: userObjectId, contentId: contentObjectId },
        {
            $set: { ...progress, lastWatchedAt: now, updatedAt: now },
            $setOnInsert: {
                userId: userObjectId,
                contentId: contentObjectId,
                createdAt: now,
            },
        },
        { upsert: true },
    );

    if (!progress.completed && progress.currentTimeSeconds >= 60) {
        try {
            // O alerta e opcional: uma falha nunca transforma uma gravacao confirmada
            // de progresso num falso erro para o player.
            await createContinueWatchingNotification(userId, {
                contentId,
                contentTitle: content.title,
            });
        } catch (error) {
            logger.warn("continue_watching_notification_failed", {
                userId,
                contentId,
                errorName: error instanceof Error ? error.name : "UnknownError",
            });
        }
    }

    return publicProgress(
        { ...progress, lastWatchedAt: now },
        content.durationSeconds,
    );
}

/**
 * Lista progresso inacabado do utilizador autenticado.
 *
 * @param {string} userId - Authenticated user id.
 * @param {Record<string, unknown>} [query={}] Query de paginação.
 * @returns {Promise<{items: Record<string, unknown>[], page: number, limit: number, total: number, totalPages: number}>} Página de conteúdos por continuar.
 */
export async function listContinueWatching(userId, query = {}) {
    const db = await getDb();
    const userObjectId = asObjectId(userId, "Utilizador");
    const { page, limit } = parseContinueWatchingPagination(query);
    const [user, effectiveAccess] = await Promise.all([
        db.collection("users").findOne({ _id: userObjectId }),
        getEffectiveSubscriptionAccess(userId),
    ]);

    if (!user) {
        throw new HttpError(
            401,
            "Autenticacao obrigatoria.",
            undefined,
            "AUTH_REQUIRED",
        );
    }

    const maxAge = Number.isInteger(user.parentalMaxAgeRating)
        ? user.parentalMaxAgeRating
        : 18;
    const rows = await db
        .collection("playback_progress")
        .aggregate([
            {
                $match: {
                    userId: userObjectId,
                    completed: false,
                },
            },
            { $sort: { lastWatchedAt: -1, _id: 1 } },
            {
                $lookup: {
                    from: "contents",
                    localField: "contentId",
                    foreignField: "_id",
                    as: "content",
                },
            },
            { $unwind: "$content" },
            {
                $match: {
                    "content.status": "published",
                    "content.mediaStatus": "ready",
                    $or: [
                        { "content.ageRating": { $lte: maxAge } },
                        { "content.ageRating": { $exists: false } },
                    ],
                },
            },
        ])
        .toArray();

    // A fonte canónica inclui regras que não devem ser reimplementadas numa
    // aproximação MongoDB. Filtra-se antes de contar e paginar para que `total`
    // e as páginas nunca incluam media malformada.
    const eligibleRows = [];
    for (const row of rows) {
        try {
            assertPlaybackEligibility(row.content, user);
            if (row.content.type === "series") continue;

            if (row.content.type === "episode") {
                const series = await getEpisodeSeries(
                    db,
                    row.content.seriesId,
                    { requirePublished: true },
                );
                assertParentalAccess(user, series);
                row.series = series;
            }
            eligibleRows.push(row);
        } catch {
            // Conteúdo removido, órfão ou bloqueado é omitido antes do total.
        }
    }
    const total = eligibleRows.length;
    const pageRows = eligibleRows.slice((page - 1) * limit, page * limit);
    const items = pageRows
        .map((row) => ({
            id: String(row.content._id),
            title: row.content.title,
            slug: row.content.slug,
            type: row.content.type,
            posterUrl: row.content.assets?.posterUrl ?? "",
            mediaStatus: "ready",
            isPlayable: true,
            canResume: effectiveAccess.hasPremiumAccess,
            currentTimeSeconds: row.currentTimeSeconds,
            durationSeconds: row.durationSeconds,
            lastWatchedAt: row.lastWatchedAt,
            ...(row.series
                ? {
                      series: publicSeriesSummary(row.series),
                      seasonNumber: row.content.seasonNumber,
                      episodeNumber: row.content.episodeNumber,
                      canonicalPath: episodeCanonicalPath(
                          row.series,
                          row.content,
                      ),
                  }
                : {}),
        }));

    return {
        items,
        ...paginationMetadata({ page, limit, total }),
    };
}
