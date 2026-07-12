/**
 * @file Player autenticado com uma fonte canónica escolhida pelo backend.
 *
 * A página nunca reconstrói URLs a partir das opções públicas. O backend
 * aplica subscrição, família e controlo parental e devolve exatamente uma
 * `source`; esta camada limita-se a ligar o adapter adequado, preservar a
 * posição e serializar as escritas de progresso.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { attachMediaSource } from "../components/playback/mediaAdapter.js";
import { createProgressQueue } from "../components/playback/progressQueue.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import { playbackApi } from "../services/api/playbackApi.js";
import { reportAnonymousMetric } from "../services/api/analyticsApi.js";

const SAVE_INTERVAL_SECONDS = 15;

const EMPTY_PREFERENCES = Object.freeze({
    subtitleLanguage: "",
    audioLanguage: "",
    quality: "",
});

/**
 * Confirma se uma opção de media está disponível para seleção.
 *
 * @param {Array<Record<string, unknown>>} options Opções fechadas do backend.
 * @param {unknown} value Valor atualmente selecionado.
 * @param {string} key Campo usado na comparação.
 * @returns {boolean} `true` quando a opção existe e não está bloqueada.
 */
function hasOption(options, value, key) {
    return options.some((option) => option[key] === value && !option.locked);
}

/**
 * Deriva a seleção apresentada a partir da decisão canónica do backend.
 *
 * `selectedQuality` e `selectedAudioLanguage` têm precedência sobre preferências
 * antigas, porque podem refletir downgrade de plano, parental ou uma variante
 * inexistente. Nenhuma opção transporta uma URL reproduzível.
 *
 * @param {Record<string, unknown>} response DTO autenticado de playback.
 * @returns {{ subtitleLanguage: string, audioLanguage: string, quality: string }} Preferências fechadas.
 */
function canonicalPreferences(response) {
    const content = response?.content ?? {};
    const saved = content.preferences ?? {};

    return {
        subtitleLanguage: String(saved.subtitleLanguage ?? ""),
        audioLanguage: String(
            content.selectedAudioLanguage ?? saved.audioLanguage ?? "",
        ),
        quality: String(content.selectedQuality ?? saved.quality ?? ""),
    };
}

/**
 * Devolve uma posição finita e não negativa do elemento de vídeo.
 *
 * @param {HTMLVideoElement | null} video Elemento atual.
 * @param {number} fallback Última posição observada.
 * @returns {number} Posição segura em segundos.
 */
function currentPosition(video, fallback = 0) {
    const position = Number(video?.currentTime);
    return Number.isFinite(position) && position >= 0 ? position : fallback;
}

/**
 * Authenticated playback page with protocol adapters and durable progress.
 *
 * @returns {JSX.Element} Página de reprodução.
 */
export function PlaybackPage() {
    const { contentId } = useParams();
    const videoRef = useRef(null);
    const progressQueueRef = useRef(null);
    const resumeAtRef = useRef(0);
    const lastPositionRef = useRef(0);
    const routeContentIdRef = useRef(contentId);
    const mountedRef = useRef(true);
    const startedMetricForRef = useRef("");
    const completedMetricForRef = useRef("");
    const [playbackState, setPlaybackState] = useState(null);
    const [preferences, setPreferences] = useState(EMPTY_PREFERENCES);
    const [requestError, setRequestError] = useState(null);
    const [mediaError, setMediaError] = useState("");
    const [progressError, setProgressError] = useState("");
    const [loading, setLoading] = useState(true);
    const [mediaStatus, setMediaStatus] = useState("loading");
    const [preferenceBusy, setPreferenceBusy] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const [mediaRetryVersion, setMediaRetryVersion] = useState(0);

    const activePlayback =
        playbackState?.contentId === contentId
            ? playbackState.response
            : null;

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (routeContentIdRef.current !== contentId) {
            routeContentIdRef.current = contentId;
            resumeAtRef.current = 0;
            lastPositionRef.current = 0;
            setPreferences(EMPTY_PREFERENCES);
            setProgressError("");
            startedMetricForRef.current = "";
            completedMetricForRef.current = "";
        }

        const controller = new AbortController();
        let active = true;
        setLoading(true);
        setRequestError(null);

        playbackApi.getPlayback(contentId, { signal: controller.signal })
            .then((response) => {
                if (!active) return;
                setPlaybackState({ contentId, response });
                setPreferences(canonicalPreferences(response));
            })
            .catch((error) => {
                if (!active || error?.code === "REQUEST_ABORTED") return;
                if (
                    error?.code === "MEDIA_NOT_READY" ||
                    [401, 403, 404].includes(error?.status)
                ) {
                    setPlaybackState((current) =>
                        current?.contentId === contentId ? null : current,
                    );
                }
                setRequestError({
                    code: error?.code ?? "REQUEST_FAILED",
                    message: toUserMessage(error),
                });
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [contentId, reloadVersion]);

    const source = activePlayback?.content?.source;

    useEffect(() => {
        if (!source) return undefined;

        const video = videoRef.current;
        const controller = new AbortController();
        let active = true;
        let adapter = null;

        setMediaStatus("loading");
        setMediaError("");

        attachMediaSource(video, source, {
            signal: controller.signal,
            onError: () => {
                if (!active) return;
                setMediaStatus("error");
                setMediaError(
                    "Não foi possível reproduzir este vídeo. Tenta novamente.",
                );
            },
        })
            .then((nextAdapter) => {
                if (!active) {
                    nextAdapter.destroy();
                    return;
                }
                adapter = nextAdapter;
            })
            .catch((error) => {
                if (!active || error?.name === "AbortError") return;
                setMediaStatus("error");
                setMediaError(
                    "Não foi possível preparar o vídeo neste browser. Tenta novamente.",
                );
            });

        return () => {
            active = false;
            controller.abort();
            const position = currentPosition(video, lastPositionRef.current);
            resumeAtRef.current = position;
            lastPositionRef.current = position;
            adapter?.destroy();
        };
    }, [
        contentId,
        mediaRetryVersion,
        source?.mimeType,
        source?.protocol,
        source?.url,
    ]);

    const hasPlayback = Boolean(activePlayback);
    const initialProgress = Number(
        activePlayback?.progress?.currentTimeSeconds ?? 0,
    );

    useEffect(() => {
        if (!hasPlayback) return undefined;

        const safeInitialProgress =
            Number.isFinite(initialProgress) && initialProgress >= 0
                ? initialProgress
                : 0;
        lastPositionRef.current = safeInitialProgress;
        const queue = createProgressQueue(
            (position) => playbackApi.saveProgress(
                contentId,
                position,
                { keepalive: true },
            ),
            { initialPosition: safeInitialProgress },
        );
        progressQueueRef.current = queue;

        const enqueueCurrentPosition = () => {
            const position = currentPosition(
                videoRef.current,
                lastPositionRef.current,
            );
            lastPositionRef.current = position;
            queue.enqueue(position).catch((error) => {
                if (mountedRef.current) {
                    setProgressError(toUserMessage(error));
                }
            });
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                enqueueCurrentPosition();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        globalThis.addEventListener("pagehide", enqueueCurrentPosition);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            globalThis.removeEventListener("pagehide", enqueueCurrentPosition);
            if (progressQueueRef.current === queue) {
                progressQueueRef.current = null;
            }
            void queue.close(lastPositionRef.current).catch(() => {});
        };
    }, [contentId, hasPlayback, initialProgress]);

    /**
     * Ativa apenas a text track já presente no elemento.
     *
     * Neste corte o DTO expõe só metadata das legendas e não contém `src`; a
     * função fica preparada para tracks nativas incorporadas no próprio media,
     * sem fabricar endpoints nem contornar autorização.
     *
     * @param {HTMLVideoElement} video Elemento com eventuais tracks incorporadas.
     * @param {string} language Idioma pretendido ou vazio.
     * @returns {void}
     */
    function applySubtitlePreference(video, language) {
        Array.from(video.textTracks ?? []).forEach((track) => {
            track.mode =
                language && track.language === language
                    ? "showing"
                    : "disabled";
        });
    }

    /**
     * Retoma o conteúdo depois de o adapter disponibilizar metadata.
     *
     * @returns {void}
     */
    function handleLoadedMetadata() {
        const video = videoRef.current;
        if (!video) return;

        applySubtitlePreference(video, preferences.subtitleLanguage);
        const startAt =
            resumeAtRef.current ||
            activePlayback?.progress?.currentTimeSeconds ||
            0;

        if (startAt > 0) video.currentTime = startAt;
        lastPositionRef.current = startAt;
        resumeAtRef.current = 0;
    }

    /**
     * Regista a posição e agenda uma escrita apenas após o intervalo mínimo.
     *
     * @returns {void}
     */
    function handleTimeUpdate() {
        const queue = progressQueueRef.current;
        const position = currentPosition(
            videoRef.current,
            lastPositionRef.current,
        );
        lastPositionRef.current = position;

        if (
            !queue ||
            Math.abs(position - queue.getLastSaved()) < SAVE_INTERVAL_SECONDS
        ) {
            return;
        }

        queue.enqueue(position).catch((error) => {
            if (mountedRef.current) setProgressError(toUserMessage(error));
        });
    }

    /**
     * Faz flush não bloqueante da posição atual em pause.
     *
     * @returns {void}
     */
    function handlePause() {
        const queue = progressQueueRef.current;
        if (!queue) return;

        const position = currentPosition(
            videoRef.current,
            lastPositionRef.current,
        );
        lastPositionRef.current = position;
        queue.enqueue(position).catch((error) => {
            if (mountedRef.current) setProgressError(toUserMessage(error));
        });
    }

    /** @returns {void} Regista uma única vez o início consentido da rota. */
    function handlePlay() {
        if (startedMetricForRef.current === contentId) return;
        startedMetricForRef.current = contentId;
        reportAnonymousMetric("playback_started", {
            category: activePlayback?.content?.type ?? "uncategorized",
        });
    }

    /** @returns {void} Faz flush terminal e regista conclusão anónima. */
    function handleEnded() {
        const queue = progressQueueRef.current;
        const position = currentPosition(
            videoRef.current,
            Number(activePlayback?.content?.durationSeconds ?? 0),
        );
        lastPositionRef.current = position;
        queue?.enqueue(position).catch((error) => {
            if (mountedRef.current) setProgressError(toUserMessage(error));
        });

        if (completedMetricForRef.current !== contentId) {
            completedMetricForRef.current = contentId;
            reportAnonymousMetric("playback_completed", {
                category: activePlayback?.content?.type ?? "uncategorized",
            });
        }
    }

    /**
     * Persiste uma preferência e pede ao backend uma nova fonte canónica.
     *
     * A UI é otimista, mas reverte em falha. Áudio e qualidade nunca escolhem
     * URLs localmente: uma leitura autenticada posterior volta a aplicar os
     * entitlements e devolve a única `source` autorizada.
     *
     * @param {"subtitleLanguage"|"audioLanguage"|"quality"} name Campo fechado.
     * @param {string} value Novo valor.
     * @returns {Promise<void>} Resultado da mutação.
     */
    async function updatePreference(name, value) {
        if (preferenceBusy) return;

        const previousPreferences = preferences;
        const nextPreferences = { ...preferences, [name]: value };
        setPreferenceBusy(name);
        setProgressError("");
        setRequestError(null);
        setPreferences(nextPreferences);

        try {
            await playbackApi.savePreferences(nextPreferences);
            if (name === "subtitleLanguage" && videoRef.current) {
                applySubtitlePreference(videoRef.current, value);
            }
            if (videoRef.current) {
                resumeAtRef.current = currentPosition(
                    videoRef.current,
                    lastPositionRef.current,
                );
            }
            setReloadVersion((current) => current + 1);
        } catch (error) {
            setPreferences(previousPreferences);
            setRequestError({
                code: error?.code ?? "REQUEST_FAILED",
                message: toUserMessage(error),
            });
        } finally {
            setPreferenceBusy("");
        }
    }

    if (!activePlayback && requestError) {
        const mediaPending = requestError.code === "MEDIA_NOT_READY";
        return (
            <section className="page-section">
                <h1>{mediaPending ? "Vídeo ainda não disponível" : "Reprodução indisponível"}</h1>
                <p role="alert">
                    {mediaPending
                        ? "Este conteúdo já está no catálogo, mas o vídeo ainda está a ser preparado."
                        : requestError.message}
                </p>
                <button
                    type="button"
                    onClick={() => setReloadVersion((current) => current + 1)}
                >
                    Tentar novamente
                </button>
            </section>
        );
    }

    if (!activePlayback) {
        return (
            <section className="page-section">
                <p role="status">A carregar player...</p>
            </section>
        );
    }

    const content = activePlayback.content;
    const audioTracks = Array.isArray(content.tracks?.audio)
        ? content.tracks.audio
        : [];
    const subtitleTracks = Array.isArray(content.tracks?.subtitles)
        ? content.tracks.subtitles
        : [];
    const qualityOptions = Array.isArray(content.qualityOptions)
        ? content.qualityOptions
        : [];
    const subtitleValue = hasOption(
        subtitleTracks,
        preferences.subtitleLanguage,
        "language",
    )
        ? preferences.subtitleLanguage
        : "";
    const audioValue = hasOption(
        audioTracks,
        preferences.audioLanguage,
        "language",
    )
        ? preferences.audioLanguage
        : "";
    const qualityValue = hasOption(
        qualityOptions,
        preferences.quality,
        "value",
    )
        ? preferences.quality
        : "";
    const controlsDisabled = Boolean(preferenceBusy) || loading;

    return (
        <section className="page-section">
            {activePlayback.series ? (
                <nav aria-label="Contexto do episódio">
                    <Link
                        to={`/catalogo/${encodeURIComponent(activePlayback.series.slug)}`}
                    >
                        {activePlayback.series.title}
                    </Link>
                    <span>
                        {" "}· T{content.seasonNumber} E{content.episodeNumber}
                    </span>
                </nav>
            ) : null}
            <h1>{content.title}</h1>
            {requestError ? (
                <div role="alert">
                    <p>{requestError.message}</p>
                    <button
                        type="button"
                        onClick={() => setReloadVersion((current) => current + 1)}
                    >
                        Repetir atualização
                    </button>
                </div>
            ) : null}
            {progressError ? <p role="alert">{progressError}</p> : null}
            <div
                className="player-controls"
                role="group"
                aria-label="Opções de média"
            >
                <label>
                    Legendas
                    <select
                        value={subtitleValue}
                        disabled={controlsDisabled}
                        onChange={(event) =>
                            updatePreference(
                                "subtitleLanguage",
                                event.target.value,
                            )
                        }
                    >
                        <option value="">Sem legendas</option>
                        {subtitleTracks.map((track) => (
                            <option
                                key={track.language}
                                value={track.language}
                                disabled={Boolean(track.locked)}
                            >
                                {track.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Áudio
                    <select
                        value={audioValue}
                        disabled={controlsDisabled}
                        onChange={(event) =>
                            updatePreference(
                                "audioLanguage",
                                event.target.value,
                            )
                        }
                    >
                        <option value="">Original</option>
                        {audioTracks.map((track) => (
                            <option
                                key={track.language}
                                value={track.language}
                                disabled={Boolean(track.locked)}
                            >
                                {track.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Qualidade
                    <select
                        value={qualityValue}
                        disabled={controlsDisabled}
                        onChange={(event) =>
                            updatePreference("quality", event.target.value)
                        }
                    >
                        <option value="">Automática</option>
                        {qualityOptions.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.locked}
                            >
                                {option.locked
                                    ? `${option.label} - ${option.lockedReason ?? "indisponível no plano atual"}`
                                    : option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            {mediaStatus === "loading" ? (
                <p role="status">A preparar vídeo...</p>
            ) : null}
            {mediaError ? (
                <div role="alert">
                    <p>{mediaError}</p>
                    <button
                        type="button"
                        onClick={() => {
                            setMediaError("");
                            setMediaRetryVersion((current) => current + 1);
                        }}
                    >
                        Tentar reproduzir novamente
                    </button>
                </div>
            ) : null}
            <video
                ref={videoRef}
                controls
                hidden={mediaStatus === "error"}
                data-testid="faithflix-player"
                aria-label={`Player de vídeo: ${content.title}`}
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={() => setMediaStatus("ready")}
                onError={() => {
                    setMediaStatus("error");
                    setMediaError(
                        "O vídeo ficou indisponível durante a reprodução. Tenta novamente.",
                    );
                }}
                onTimeUpdate={handleTimeUpdate}
                onPause={handlePause}
                onPlay={handlePlay}
                onEnded={handleEnded}
            >
                O teu browser não suporta vídeo HTML5.
            </video>
            {activePlayback.series ? (
                <nav className="button-row" aria-label="Navegação entre episódios">
                    {activePlayback.previousEpisode ? (
                        <Link
                            className="secondary-button"
                            to={activePlayback.previousEpisode.canonicalPath}
                        >
                            Episódio anterior
                        </Link>
                    ) : <span />}
                    <Link
                        className="secondary-button"
                        to={`/catalogo/${encodeURIComponent(activePlayback.series.slug)}`}
                    >
                        Voltar à série
                    </Link>
                    {activePlayback.nextEpisode ? (
                        <Link
                            className="secondary-button"
                            to={activePlayback.nextEpisode.canonicalPath}
                        >
                            Episódio seguinte
                        </Link>
                    ) : null}
                </nav>
            ) : null}
        </section>
    );
}
