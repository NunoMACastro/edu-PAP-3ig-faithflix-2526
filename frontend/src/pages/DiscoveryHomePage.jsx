/**
 * @file Página inicial de descoberta FaithFlix.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DiscoveryCarousel } from "../components/discovery/DiscoveryCarousel.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { toUserMessage } from "../services/api/apiErrors.js";
import { discoveryApi } from "../services/api/discoveryApi.js";
import { buildLoginRedirectPath } from "../utils/authRedirect.js";
import { formatContentType } from "../utils/contentTypeLabels.js";

const HOME_FORMAT_TYPES = Object.freeze(["movie", "series", "documentary"]);

// React 18 aceita o atributo HTML lowercase sem o warning emitido pela prop
// camelCase; o spread evita que a regra JSX o interprete como prop React.
const HIGH_PRIORITY_IMAGE_ATTRIBUTES = Object.freeze({ fetchpriority: "high" });

const HOME_FORMAT_LABELS = Object.freeze({
    movie: "Filmes",
    series: "Séries",
    documentary: "Documentários",
});

/**
 * Converte duração técnica em segundos para uma etiqueta curta.
 *
 * @param {number | string | undefined} seconds Duração total em segundos.
 * @returns {string} Etiqueta de duração ou string vazia quando não existe valor válido.
 */
function formatDurationLabel(seconds) {
    const minutes = Math.round(Number(seconds) / 60);

    return Number.isFinite(minutes) && minutes > 0 ? `${minutes} min` : "";
}

/**
 * Devolve label plural para os formatos destacados na home.
 *
 * @param {string} type Tipo técnico do conteúdo.
 * @returns {string} Label PT-PT do formato.
 */
function formatHomeFormatLabel(type) {
    return HOME_FORMAT_LABELS[type] ?? formatContentType(type);
}

/**
 * Mostra atalhos editoriais para os formatos principais do catálogo.
 *
 * @param {{ formats: Record<string, unknown>[] }} props - Formatos devolvidos pela discovery pública.
 * @returns {JSX.Element | null} Secção de exploração por formato.
 */
function ExploreByFormatSection({ formats }) {
    const visibleFormats = HOME_FORMAT_TYPES.map((type) =>
        formats.find((format) => format.type === type),
    ).filter(Boolean);

    if (visibleFormats.length === 0) {
        return null;
    }

    return (
        <section className="format-explorer" aria-label="Atalhos do catálogo">
            <div className="format-explorer-heading">
                <p className="section-kicker">Catálogo</p>
            </div>
            <div className="format-explorer-grid">
                {visibleFormats.map((format) => {
                    const label = formatHomeFormatLabel(format.type);
                    const count = Number(format.count ?? 0);
                    const imageUrl = format.backdropUrl || format.posterUrl || "";
                    const countLabel =
                        count === 1 ? "1 conteúdo" : `${count} conteúdos`;

                    return (
                        <Link
                            className={
                                imageUrl
                                    ? "format-tile format-tile-with-image"
                                    : "format-tile"
                            }
                            key={format.type}
                            to={`/catalogo?type=${encodeURIComponent(format.type)}`}
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt=""
                                    aria-hidden="true"
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : null}
                            <span className="format-tile-overlay" aria-hidden="true" />
                            <span className="format-tile-content">
                                <span className="format-tile-label">{label}</span>
                                <strong>{countLabel}</strong>
                                {format.sampleTitle ? (
                                    <span className="format-tile-sample">
                                        Inclui {format.sampleTitle}
                                    </span>
                                ) : null}
                                <span className="format-tile-cta">Explorar</span>
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

/**
 * Mostra a faixa pública de conteúdos mais vistos quando existem dados reais.
 *
 * @param {{ items: Record<string, unknown>[] }} props - Propriedades da faixa.
 * @returns {JSX.Element | null} Faixa de conteúdos populares ou null.
 */
function MostWatchedStrip({ items }) {
    const visibleItems = items.slice(0, 4);

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <section className="most-watched-section" aria-labelledby="most-watched-title">
            <div className="most-watched-heading">
                <p className="most-watched-kicker">Comunidade</p>
                <h2 id="most-watched-title">Mais vistos</h2>
            </div>
            <div className="most-watched-list">
                {visibleItems.map((content, index) => (
                    <Link
                        className={
                            content.posterUrl
                                ? "most-watched-item most-watched-item-with-cover"
                                : "most-watched-item most-watched-item-text"
                        }
                        key={content.id}
                        aria-label={`Ver detalhe de ${content.title}`}
                        to={`/catalogo/${encodeURIComponent(content.slug || content.id)}`}
                    >
                        <span className="most-watched-rank">
                            #{index + 1}
                        </span>
                        {content.posterUrl ? (
                            <>
                                <span
                                    className="most-watched-thumb-frame"
                                    aria-hidden="true"
                                >
                                    <img
                                        className="most-watched-thumb"
                                        src={content.posterUrl}
                                        alt=""
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </span>
                                <img
                                    className="most-watched-cover-preview"
                                    src={content.posterUrl}
                                    alt=""
                                    aria-hidden="true"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </>
                        ) : null}
                        <span className="most-watched-copy">
                            <span className="content-card-eyebrow">
                                {formatContentType(content.type)}
                            </span>
                            <strong>{content.title}</strong>
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}

/**
 * Mostra a entrada principal da plataforma e os carrosséis de descoberta.
 *
 * @returns {JSX.Element} Página inicial da aplicação.
 */
export function DiscoveryHomePage() {
    const { status: sessionStatus } = useSession();
    const [carousels, setCarousels] = useState([]);
    const [formats, setFormats] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);

    const heroItems = useMemo(() => {
        const carouselWithItems =
            carousels.find(
                (carousel) =>
                    carousel.id === "recent" && carousel.items?.length > 0,
            ) ?? carousels.find((carousel) => carousel.items?.length > 0);

        return carouselWithItems?.items ?? [];
    }, [carousels]);
    const mostWatchedItems =
        carousels.find((carousel) => carousel.id === "most-watched")?.items ?? [];
    const discoveryCarousels = carousels.filter(
        (carousel) => carousel.id === "recent",
    );

    useEffect(() => {
        setActiveIndex(0);
    }, [heroItems]);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        setLoading(true);
        setError("");

        /**
         * Carrega a descoberta pública sem alterar contratos de catálogo ou recomendação.
         *
         * @returns {Promise<void>} Termina depois de atualizar a página.
         */
        async function loadDiscovery() {
            try {
                const response = await discoveryApi.home({
                    signal: controller.signal,
                });

                if (active) {
                    setCarousels(response.carousels ?? []);
                    setFormats(response.formats ?? []);
                }
            } catch (requestError) {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setError(toUserMessage(requestError));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadDiscovery();

        return () => {
            active = false;
            controller.abort();
        };
    }, [reloadVersion]);

    const currentHeroIndex =
        heroItems.length > 0 ? activeIndex % heroItems.length : 0;
    const activeHero = heroItems[currentHeroIndex] ?? null;
    const heroImageUrl = activeHero?.backdropUrl || activeHero?.posterUrl || "";
    const heroCoverUrl = activeHero?.posterUrl || activeHero?.backdropUrl || "";
    const detailPath = activeHero
        ? `/catalogo/${encodeURIComponent(activeHero.slug || activeHero.id)}`
        : "/catalogo";
    const playbackPath = activeHero
        ? `/ver/${encodeURIComponent(activeHero.id)}`
        : "";
    const canPlayDirectly = sessionStatus === "authenticated";
    const isHeroPlayable = activeHero?.isPlayable === true;
    const ageRatingLabel =
        activeHero && (activeHero.ageRating || activeHero.ageRating === 0)
            ? `${activeHero.ageRating}+`
            : "";
    const metadata = [
        activeHero?.type ? formatContentType(activeHero.type) : "",
        formatDurationLabel(activeHero?.durationSeconds),
        ageRatingLabel,
    ].filter(Boolean);

    /**
     * Mostra o destaque anterior, fechando o ciclo no último item.
     *
     * @returns {void}
     */
    function showPreviousHero() {
        setActiveIndex((current) =>
            currentHeroIndex === 0 ? heroItems.length - 1 : current - 1,
        );
    }

    /**
     * Mostra o destaque seguinte, fechando o ciclo no primeiro item.
     *
     * @returns {void}
     */
    function showNextHero() {
        setActiveIndex((current) =>
            currentHeroIndex === heroItems.length - 1 ? 0 : current + 1,
        );
    }

    return (
        <>
            <section className="home-hero-carousel" aria-labelledby="home-title">
                {heroImageUrl ? (
                    <img
                        className="home-hero-image"
                        src={heroImageUrl}
                        alt=""
                        {...HIGH_PRIORITY_IMAGE_ATTRIBUTES}
                        decoding="async"
                    />
                ) : null}
                <div className="home-hero-overlay" aria-hidden="true" />
                <div className="home-hero-inner">
                    <div className="home-hero-copy">
                        <p className="section-kicker">
                            {activeHero ? "Destaque" : "Streaming cristão curado"}
                        </p>
                        <h1 id="home-title">
                            {activeHero?.title ?? "FaithFlix"}
                        </h1>
                        <p>
                            {activeHero?.synopsis ??
                                "Conteúdos, pesquisa, recomendações simples e impacto solidário numa experiência preparada para desktop, tablet e telemóvel."}
                        </p>
                        {metadata.length > 0 ? (
                            <p className="home-hero-meta">
                                {metadata.map((item) => (
                                    <span key={item}>{item}</span>
                                ))}
                            </p>
                        ) : null}
                        <div className="button-row home-hero-actions">
                            <Link className="button-link" to={detailPath}>
                                {activeHero ? "Ver detalhe" : "Explorar catálogo"}
                            </Link>
                            {activeHero &&
                            isHeroPlayable &&
                            sessionStatus === "loading" ? (
                                <button type="button" disabled>
                                    A confirmar sessão...
                                </button>
                            ) : null}
                            {activeHero && !isHeroPlayable ? (
                                <button type="button" disabled>
                                    Vídeo ainda não disponível
                                </button>
                            ) : null}
                            {activeHero &&
                            isHeroPlayable &&
                            sessionStatus === "unavailable" ? (
                                <button type="button" disabled>
                                    Sessão temporariamente indisponível
                                </button>
                            ) : null}
                            {activeHero &&
                            isHeroPlayable &&
                            sessionStatus !== "loading" &&
                            sessionStatus !== "unavailable" ? (
                                <Link
                                    className="button-link"
                                    to={
                                        canPlayDirectly
                                            ? playbackPath
                                            : buildLoginRedirectPath(playbackPath)
                                    }
                                >
                                    {canPlayDirectly
                                        ? "Reproduzir"
                                        : "Entrar para reproduzir"}
                                </Link>
                            ) : null}
                            {sessionStatus === "anonymous" ? (
                                <Link className="button-link" to="/planos">
                                    Ver planos
                                </Link>
                            ) : null}
                        </div>
                    </div>
                    {activeHero ? (
                        <div className="home-hero-feature">
                            <div className="home-hero-poster" aria-hidden="true">
                                {heroCoverUrl ? (
                                    <img
                                        src={heroCoverUrl}
                                        alt=""
                                        decoding="async"
                                    />
                                ) : (
                                    <span>{activeHero.title}</span>
                                )}
                            </div>
                            {heroItems.length > 1 ? (
                                <div className="home-hero-navigation">
                                    <div
                                        className="home-hero-controls"
                                        aria-label="Controlos do destaque"
                                    >
                                        <button
                                            type="button"
                                            className="home-hero-control"
                                            onClick={showPreviousHero}
                                            aria-label="Destaque anterior"
                                        >
                                            {"<"}
                                        </button>
                                        <button
                                            type="button"
                                            className="home-hero-control"
                                            onClick={showNextHero}
                                            aria-label="Destaque seguinte"
                                        >
                                            {">"}
                                        </button>
                                    </div>
                                    <div
                                        className="home-hero-dots"
                                        aria-label="Escolher destaque"
                                    >
                                        {heroItems.map((item, index) => (
                                            <button
                                                type="button"
                                                key={item.id}
                                                className={
                                                    index === currentHeroIndex
                                                        ? "home-hero-dot home-hero-dot-active"
                                                        : "home-hero-dot"
                                                }
                                                onClick={() => setActiveIndex(index)}
                                                aria-label={`Mostrar ${item.title}`}
                                                aria-pressed={index === currentHeroIndex}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </section>

            <MostWatchedStrip items={mostWatchedItems} />

            <section className="page-section">
                {loading ? <p role="status">A carregar descoberta...</p> : null}
                {error ? (
                    <div>
                        <p role="alert">{error}</p>
                        <button
                            type="button"
                            onClick={() =>
                                setReloadVersion((value) => value + 1)
                            }
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : null}
                {discoveryCarousels.map((carousel) => (
                    <DiscoveryCarousel
                        key={carousel.id}
                        title={carousel.title}
                        items={carousel.items}
                    />
                ))}
                <ExploreByFormatSection formats={formats} />
            </section>
        </>
    );
}
