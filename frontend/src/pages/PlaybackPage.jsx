/**
 * @file Ficheiro `real_dev/frontend/src/pages/PlaybackPage.jsx` da implementação real_dev.
 */

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { playbackApi } from "../services/api/playbackApi.js";

const SAVE_INTERVAL_SECONDS = 15;

/**
 * Confirma se uma opção de media está disponível para seleção.
 *
 * A função procura pelo valor indicado numa lista de opções e ignora entradas
 * bloqueadas, evitando que a UI mantenha uma preferência indisponível.
 *
 * @param {Array<Record<string, unknown>>} options Opções de áudio, qualidade ou legendas.
 * @param {unknown} value Valor atualmente guardado nas preferências.
 * @param {string} key Campo usado para comparar cada opção.
 * @returns {boolean} `true` quando a opção existe e não está bloqueada.
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
     * Aplica a preferência de legendas ao elemento de vídeo.
     *
     * Percorre as text tracks disponíveis e deixa ativa apenas a faixa que
     * corresponde ao idioma escolhido.
     *
     * @param {HTMLVideoElement} video Elemento de vídeo que contém as faixas.
     * @param {string} language Código de idioma a ativar, ou vazio para desativar.
     * @returns {void} Não devolve valor; altera o modo das text tracks.
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
     * Escolhe a melhor fonte de vídeo para as preferências atuais.
     *
     * Dá prioridade à faixa de áudio selecionada, depois à qualidade permitida e
     * finalmente ao URL de reprodução base do conteúdo.
     *
     * @param {{ audioLanguage?: string, quality?: string }} nextPreferences Preferências a aplicar.
     * @returns {string} URL de reprodução que deve ficar ativo no player.
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
     * Prepara o vídeo quando os metadados ficam disponíveis.
     *
     * Aplica legendas e reposiciona o player no último ponto guardado ou no ponto
     * capturado antes de trocar de fonte.
     *
     * @returns {void} Não devolve valor; atualiza diretamente o elemento de vídeo.
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
     * Guarda progresso de reprodução em intervalos controlados.
     *
     * O handler evita escrever no backend a cada segundo, persistindo apenas
     * quando a posição mudou o suficiente desde a última gravação.
     *
     * @returns {void} Não devolve valor; pode disparar gravação assíncrona.
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
     * Guarda imediatamente o progresso quando o utilizador pausa.
     *
     * Esta gravação reduz a probabilidade de perder o ponto de retoma quando a
     * sessão termina logo após a pausa.
     *
     * @returns {Promise<void>} Termina depois de tentar persistir o progresso.
     */
    async function handlePause() {
        const video = videoRef.current;

        if (video) {
            await playbackApi.saveProgress(contentId, video.currentTime);
        }
    }

    /**
     * Atualiza uma preferência de reprodução escolhida na UI.
     *
     * A função persiste as preferências no backend e, quando necessário, troca a
     * fonte do vídeo preservando a posição atual.
     *
     * @param {"subtitleLanguage" | "audioLanguage" | "quality"} name Nome da preferência alterada.
     * @param {string} value Novo valor escolhido pelo utilizador.
     * @returns {Promise<void>} Termina depois de persistir ou reportar erro.
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
