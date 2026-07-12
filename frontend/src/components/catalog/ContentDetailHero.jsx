/**
 * @file Hero cinematográfico acessível para a ficha pública de conteúdo.
 */

import { useEffect, useRef, useState } from "react";
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
 * Hero full-bleed com preview promocional e fallback para imagem editorial.
 *
 * @param {{ content: Record<string, unknown>, durationLabel: string, ageRatingLabel: string, primaryAction: React.ReactNode, children?: React.ReactNode }} props Propriedades do hero.
 * @returns {JSX.Element} Cabeçalho cinematográfico.
 */
export function ContentDetailHero({
    content,
    durationLabel,
    ageRatingLabel,
    primaryAction,
    children,
}) {
    const heroRef = useRef(null);
    const videoRef = useRef(null);
    const [largeViewport, setLargeViewport] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(true);
    const [saveData, setSaveData] = useState(prefersDataSaving);
    const [previewFailed, setPreviewFailed] = useState(false);
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
        setPaused(false);
        setMuted(true);
    }, [content.id, content.assets?.previewUrl]);

    const canShowPreview = Boolean(
        content.assets?.previewUrl &&
            largeViewport &&
            !reducedMotion &&
            !saveData &&
            !previewFailed,
    );

    useEffect(() => {
        if (!canShowPreview || !videoRef.current) return undefined;

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
    }, [canShowPreview, paused]);

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
            className={`content-detail-hero${reducedMotion || !largeViewport ? " content-detail-hero-static" : ""}`}
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
                        src={content.assets.previewUrl}
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
                        onClick={togglePaused}
                    >
                        {paused ? "Reproduzir preview" : "Pausar preview"}
                    </button>
                    <button
                        type="button"
                        className="content-detail-control"
                        aria-pressed={!muted}
                        onClick={toggleMuted}
                    >
                        {muted ? "Ativar som do preview" : "Silenciar preview"}
                    </button>
                </div>
            ) : null}
        </header>
    );
}
