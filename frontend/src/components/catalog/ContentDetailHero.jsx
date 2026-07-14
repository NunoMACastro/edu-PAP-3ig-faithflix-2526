/**
 * @file Hero cinematográfico acessível para a ficha pública de conteúdo.
 */

import { useEffect, useRef, useState } from "react";
import { attachMediaSource } from "../playback/mediaAdapter.js";
import { formatContentType } from "../../utils/contentTypeLabels.js";

/**
 * Lê a preferência de dados reduzidos quando o browser a disponibiliza.
 *
 * @returns {boolean} Verdadeiro quando o utilizador pediu poupança de dados.
 */
function prefersDataSaving() {
    return globalThis.navigator?.connection?.saveData === true;
}

/**
 * Desenha o símbolo do controlo de preview sem depender de uma biblioteca de
 * ícones. O SVG é decorativo porque o botão fornece sempre um nome acessível.
 *
 * @param {{ type: "pause" | "play" | "muted" | "sound" }} props Estado visual.
 * @returns {JSX.Element} Ícone vetorial decorativo.
 */
function PreviewControlIcon({ type }) {
    if (type === "pause") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M7 5.5h3.5v13H7zM13.5 5.5H17v13h-3.5z" />
            </svg>
        );
    }

    if (type === "play") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M8 5.2v13.6L18.5 12z" />
            </svg>
        );
    }

    if (type === "muted") {
        return (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 9.25v5.5h3.5L12 18.5v-13L7.5 9.25z" />
                <path
                    d="m15.25 9.25 4.5 4.5m0-4.5-4.5 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 9.25v5.5h3.5L12 18.5v-13L7.5 9.25z" />
            <path
                d="M15 8.5a5 5 0 0 1 0 7M17.5 6a8.5 8.5 0 0 1 0 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

/**
 * Hero full-bleed com preview promocional e fallback para imagem editorial.
 *
 * @param {{ content: Record<string, unknown>, durationLabel: string, ageRatingLabel: string, primaryAction: React.ReactNode, previewSource?: Record<string, string> | null, children?: React.ReactNode }} props Propriedades do hero.
 * @returns {JSX.Element} Cabeçalho cinematográfico.
 */
export function ContentDetailHero({
    content,
    durationLabel,
    ageRatingLabel,
    primaryAction,
    previewSource = null,
    children,
}) {
    const heroRef = useRef(null);
    const videoRef = useRef(null);
    const [largeViewport, setLargeViewport] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(true);
    const [saveData, setSaveData] = useState(prefersDataSaving);
    const [previewFailed, setPreviewFailed] = useState(false);
    const [previewReady, setPreviewReady] = useState(false);
    const [paused, setPaused] = useState(false);
    const [muted, setMuted] = useState(true);

    useEffect(() => {
        const largeQuery = globalThis.matchMedia?.("(min-width: 768px)");
        const motionQuery = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)");
        const connection = globalThis.navigator?.connection;

        function syncPreferences() {
            setLargeViewport(largeQuery?.matches ?? false);
            setReducedMotion(motionQuery?.matches ?? true);
            setSaveData(prefersDataSaving());
        }

        syncPreferences();
        largeQuery?.addEventListener?.("change", syncPreferences);
        motionQuery?.addEventListener?.("change", syncPreferences);
        connection?.addEventListener?.("change", syncPreferences);

        return () => {
            largeQuery?.removeEventListener?.("change", syncPreferences);
            motionQuery?.removeEventListener?.("change", syncPreferences);
            connection?.removeEventListener?.("change", syncPreferences);
        };
    }, []);

    useEffect(() => {
        setPreviewFailed(false);
        setPreviewReady(false);
        setPaused(false);
        setMuted(true);
    }, [
        content.id,
        content.assets?.previewUrl,
        previewSource?.mimeType,
        previewSource?.protocol,
        previewSource?.url,
    ]);

    const editorialPreviewUrl = content.assets?.previewUrl;
    const hasPreview = Boolean(previewSource?.url || editorialPreviewUrl);

    const canShowPreview = Boolean(
        hasPreview &&
            largeViewport &&
            !reducedMotion &&
            !saveData &&
            !previewFailed,
    );

    useEffect(() => {
        if (!canShowPreview || !previewSource || !videoRef.current) {
            return undefined;
        }

        const controller = new AbortController();
        let active = true;
        let adapter = null;

        setPreviewReady(false);
        attachMediaSource(videoRef.current, previewSource, {
            signal: controller.signal,
            onError: () => {
                if (active) setPreviewFailed(true);
            },
        })
            .then((nextAdapter) => {
                if (!active) {
                    nextAdapter.destroy();
                    return;
                }
                adapter = nextAdapter;
                setPreviewReady(true);
            })
            .catch((error) => {
                if (active && error?.name !== "AbortError") {
                    setPreviewFailed(true);
                }
            });

        return () => {
            active = false;
            controller.abort();
            adapter?.destroy();
        };
    }, [
        canShowPreview,
        previewSource,
        previewSource?.mimeType,
        previewSource?.protocol,
        previewSource?.url,
    ]);

    const previewPrepared = previewSource ? previewReady : true;

    useEffect(() => {
        if (!canShowPreview || !previewPrepared || !videoRef.current) {
            return undefined;
        }

        const video = videoRef.current;
        let intersecting = true;

        function safelyPlay() {
            if (paused || document.hidden || !intersecting) return;
            const playResult = video.play?.();
            playResult?.catch?.(() => setPreviewFailed(true));
        }

        function syncVisibility() {
            if (document.hidden) video.pause?.();
            else safelyPlay();
        }

        const observer = globalThis.IntersectionObserver
            ? new IntersectionObserver(([entry]) => {
                  intersecting = entry.isIntersecting;
                  if (intersecting) safelyPlay();
                  else video.pause?.();
              }, { threshold: 0.25 })
            : null;

        if (heroRef.current) observer?.observe(heroRef.current);
        document.addEventListener("visibilitychange", syncVisibility);
        safelyPlay();

        return () => {
            observer?.disconnect();
            document.removeEventListener("visibilitychange", syncVisibility);
            video.pause?.();
        };
    }, [canShowPreview, paused, previewPrepared]);

    /** @returns {void} Alterna pausa explícita do preview. */
    function togglePaused() {
        const video = videoRef.current;
        if (!video) return;

        if (paused) {
            const playResult = video.play?.();
            playResult?.catch?.(() => setPreviewFailed(true));
            setPaused(false);
        } else {
            video.pause?.();
            setPaused(true);
        }
    }

    /** @returns {void} Alterna som apenas por ação explícita. */
    function toggleMuted() {
        const nextMuted = !muted;
        setMuted(nextMuted);
        if (videoRef.current) videoRef.current.muted = nextMuted;
    }

    const themes = (content.taxonomies ?? [])
        .map((taxonomy) => taxonomy.name)
        .filter(Boolean);

    return (
        <header
            className={[
                "content-detail-hero",
                canShowPreview ? "content-detail-hero-previewing" : "",
                reducedMotion || !largeViewport
                    ? "content-detail-hero-static"
                    : "",
            ].filter(Boolean).join(" ")}
            ref={heroRef}
            aria-labelledby="content-detail-title"
        >
            <div className="content-detail-visual" aria-hidden="true">
                {content.assets?.backdropUrl || content.assets?.posterUrl ? (
                    <img
                        className="content-detail-backdrop"
                        src={content.assets.backdropUrl || content.assets.posterUrl}
                        alt=""
                    />
                ) : (
                    <div className="content-detail-backdrop-fallback" />
                )}
                {canShowPreview ? (
                    <video
                        ref={videoRef}
                        className="content-detail-preview"
                        src={previewSource ? undefined : editorialPreviewUrl}
                        poster={content.assets?.backdropUrl || undefined}
                        autoPlay
                        loop
                        muted={muted}
                        playsInline
                        preload="metadata"
                        onError={() => setPreviewFailed(true)}
                    />
                ) : null}
            </div>
            <div className="content-detail-shade" aria-hidden="true" />
            <div className="content-detail-hero-inner">
                <p className="content-detail-kicker">
                    {formatContentType(content.type)}
                </p>
                <h1 id="content-detail-title">{content.title}</h1>
                <div className="content-detail-meta" aria-label="Informação principal">
                    {content.releaseYear ? <span>{content.releaseYear}</span> : null}
                    {durationLabel ? <span>{durationLabel}</span> : null}
                    {ageRatingLabel ? (
                        <span className="content-detail-age">{ageRatingLabel}</span>
                    ) : null}
                    {themes.slice(0, 2).map((theme) => (
                        <span key={theme}>{theme}</span>
                    ))}
                </div>
                <p className="content-detail-hero-synopsis">{content.synopsis}</p>
                <div className="content-detail-hero-actions">
                    {primaryAction}
                    {children}
                </div>
            </div>
            {canShowPreview ? (
                <div className="content-detail-preview-controls" aria-label="Controlos do preview">
                    <button
                        type="button"
                        className="content-detail-control"
                        aria-pressed={paused}
                        aria-label={paused ? "Reproduzir preview" : "Pausar preview"}
                        title={paused ? "Reproduzir preview" : "Pausar preview"}
                        onClick={togglePaused}
                    >
                        <PreviewControlIcon type={paused ? "play" : "pause"} />
                    </button>
                    <button
                        type="button"
                        className="content-detail-control"
                        aria-pressed={!muted}
                        aria-label={muted ? "Ativar som do preview" : "Silenciar preview"}
                        title={muted ? "Ativar som do preview" : "Silenciar preview"}
                        onClick={toggleMuted}
                    >
                        <PreviewControlIcon type={muted ? "muted" : "sound"} />
                    </button>
                </div>
            ) : null}
        </header>
    );
}
