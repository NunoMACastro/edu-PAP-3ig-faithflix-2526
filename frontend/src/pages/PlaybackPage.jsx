/**
 * @file Ficheiro `real_dev/frontend/src/pages/PlaybackPage.jsx` da implementação real_dev.
 */

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { playbackApi } from "../services/api/playbackApi.js";

const SAVE_INTERVAL_SECONDS = 15;

/**
 * Documenta `hasOption`, mantendo explícita a responsabilidade desta função no módulo.
 *
 * @param {unknown} options Valor recebido por `hasOption`.
 * @param {unknown} value Valor recebido por `hasOption`.
 * @param {unknown} key Valor recebido por `hasOption`.
 * @returns {unknown} Resultado devolvido por `hasOption`.
 */
function hasOption(options, value, key) {
    return options.some((option) => option[key] === value && !option.locked);
}

/**
 * Ordena qualidades de video por resolução.
 *
 * @param {string} value Valor como `1080p` ou `2160p`.
 * @returns {number} Ranking numerico.
 */
function qualityRank(value) {
    const normalized = String(value ?? "").toLowerCase();
    if (normalized === "4k") return 2160;
    return Number(normalized.match(/\d+/)?.[0] ?? 0);
}

/**
 * Authenticated playback page with media controls and progress persistence.
 *
 * @returns {JSX.Element} Playback page.
 */
export function PlaybackPage() {
    const { contentId } = useParams();
    const videoRef = useRef(null);
    const lastSavedRef = useRef(0);
    const resumeAtRef = useRef(0);
    const [playback, setPlayback] = useState(null);
    const [preferences, setPreferences] = useState({
        subtitleLanguage: "",
        audioLanguage: "",
        quality: "",
    });
    const [videoSrc, setVideoSrc] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        playbackApi
            .getPlayback(contentId)
            .then((response) => {
                setPlayback(response);
                setPreferences(response.content.preferences);
                setVideoSrc(response.content.media.playbackUrl);
            })
            .catch((requestError) => setError(requestError.message));
    }, [contentId]);

    /**
     * Documenta `applySubtitlePreference`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} video Valor recebido por `applySubtitlePreference`.
     * @param {unknown} language Valor recebido por `applySubtitlePreference`.
     * @returns {unknown} Resultado devolvido por `applySubtitlePreference`.
     */
    function applySubtitlePreference(video, language) {
        Array.from(video.textTracks).forEach((track) => {
            track.mode =
                language && track.language === language
                    ? "showing"
                    : "disabled";
        });
    }

    /**
     * Documenta `resolveVideoSource`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} nextPreferences Valor recebido por `resolveVideoSource`.
     * @returns {unknown} Resultado devolvido por `resolveVideoSource`.
     */
    function resolveVideoSource(nextPreferences) {
        if (!playback) {
            return videoSrc;
        }

        const selectedAudio = playback.content.tracks.audio.find(
            (track) => track.language === nextPreferences.audioLanguage,
        );
        const allowedQualities = playback.content.qualityOptions
            .filter((option) => !option.locked && option.playbackUrl)
            .sort((left, right) => qualityRank(left.value) - qualityRank(right.value));
        const selectedQuality = allowedQualities.find(
            (option) => option.value === nextPreferences.quality,
        );
        const fallbackQuality =
            selectedQuality ?? allowedQualities[allowedQualities.length - 1];

        return (
            selectedAudio?.src ??
            fallbackQuality?.playbackUrl ??
            playback.content.media.playbackUrl
        );
    }

    /**
     * Documenta `handleLoadedMetadata`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `handleLoadedMetadata`.
     */
    function handleLoadedMetadata() {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        applySubtitlePreference(video, preferences.subtitleLanguage);

        const startAt =
            resumeAtRef.current || playback?.progress.currentTimeSeconds || 0;

        if (startAt > 0) {
            video.currentTime = startAt;
        }

        resumeAtRef.current = 0;
    }

    /**
     * Documenta `handleTimeUpdate`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `handleTimeUpdate`.
     */
    function handleTimeUpdate() {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        if (
            Math.abs(video.currentTime - lastSavedRef.current) <
            SAVE_INTERVAL_SECONDS
        ) {
            return;
        }

        lastSavedRef.current = video.currentTime;
        playbackApi.saveProgress(contentId, video.currentTime).catch(() => {});
    }

    /**
     * Documenta `handlePause`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {Promise<unknown>} Resultado devolvido por `handlePause`.
     */
    async function handlePause() {
        const video = videoRef.current;

        if (video) {
            await playbackApi.saveProgress(contentId, video.currentTime);
        }
    }

    /**
     * Documenta `updatePreference`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} name Valor recebido por `updatePreference`.
     * @param {unknown} value Valor recebido por `updatePreference`.
     * @returns {Promise<unknown>} Resultado devolvido por `updatePreference`.
     */
    async function updatePreference(name, value) {
        const nextPreferences = { ...preferences, [name]: value };

        setError("");
        setPreferences(nextPreferences);

        try {
            await playbackApi.savePreferences(nextPreferences);

            if (name === "subtitleLanguage" && videoRef.current) {
                applySubtitlePreference(videoRef.current, value);
                return;
            }

            if (
                (name === "audioLanguage" || name === "quality") &&
                playback &&
                videoRef.current
            ) {
                resumeAtRef.current = videoRef.current.currentTime;
                setVideoSrc(resolveVideoSource(nextPreferences));
            }
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    if (error) {
        return (
            <section className="page-section">
                <p role="alert">{error}</p>
            </section>
        );
    }

    if (!playback) {
        return (
            <section className="page-section">
                <p>A carregar player...</p>
            </section>
        );
    }

    const audioValue = hasOption(
        playback.content.tracks.audio,
        preferences.audioLanguage,
        "language",
    )
        ? preferences.audioLanguage
        : "";
    const qualityValue = hasOption(
        playback.content.qualityOptions,
        preferences.quality,
        "value",
    )
        ? preferences.quality
        : "";

    return (
        <section className="page-section">
            <h1>{playback.content.title}</h1>
            <div
                className="player-controls"
                role="group"
                aria-label="Opções de média"
            >
                <label>
                    Legendas
                    <select
                        value={preferences.subtitleLanguage}
                        onChange={(event) =>
                            updatePreference(
                                "subtitleLanguage",
                                event.target.value,
                            )
                        }
                    >
                        <option value="">Sem legendas</option>
                        {playback.content.tracks.subtitles.map((track) => (
                            <option key={track.language} value={track.language}>
                                {track.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Áudio
                    <select
                        value={audioValue}
                        onChange={(event) =>
                            updatePreference("audioLanguage", event.target.value)
                        }
                    >
                        <option value="">Original</option>
                        {playback.content.tracks.audio.map((track) => (
                            <option key={track.language} value={track.language}>
                                {track.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Qualidade
                    <select
                        value={qualityValue}
                        onChange={(event) =>
                            updatePreference("quality", event.target.value)
                        }
                    >
                        <option value="">Automática</option>
                        {playback.content.qualityOptions.map((option) => (
                            <option key={option.value} value={option.value} disabled={option.locked}>
                                {option.locked ? `${option.label} - Plano Família` : option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <video
                ref={videoRef}
                controls
                data-testid="faithflix-player"
                aria-label={`Player de vídeo: ${playback.content.title}`}
                src={videoSrc}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onPause={handlePause}
            >
                {/* As faixas continuam no vídeo para preservar legendas criadas nos BKs de streaming. */}
                {playback.content.tracks.subtitles.map((track) => (
                    <track
                        key={track.language}
                        kind="subtitles"
                        srcLang={track.language}
                        label={track.label}
                        src={track.src}
                    />
                ))}
                O teu browser não suporta vídeo HTML5.
            </video>
        </section>
    );
}
