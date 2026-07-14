/**
 * @file Ficheiro `real_dev/frontend/src/components/discovery/RelatedContent.jsx` da implementação real_dev.
 */

import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { discoveryApi } from "../../services/api/discoveryApi.js";
import { formatContentType } from "../../utils/contentTypeLabels.js";

const MOBILE_CAROUSEL_QUERY = "(max-width: 767px)";
const TABLET_CAROUSEL_QUERY = "(max-width: 980px)";

/** @param {unknown} seconds Duração em segundos. @returns {string} Duração curta. */
function formatDuration(seconds) {
    const minutes = Math.round(Number(seconds) / 60);
    return Number.isFinite(minutes) && minutes > 0 ? `${minutes} min` : "";
}

/**
 * Determina quantos títulos cabem em cada página sem depender de medições do DOM.
 * O valor por omissão mantém três cartões em SSR e em ambientes de teste.
 *
 * @returns {number} Número de cartões visíveis por página.
 */
function getCarouselPageSize() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return 3;
    }
    if (window.matchMedia(MOBILE_CAROUSEL_QUERY).matches) {
        return 1;
    }
    if (window.matchMedia(TABLET_CAROUSEL_QUERY).matches) {
        return 2;
    }
    return 3;
}

/**
 * Mostra conteúdo publicado relacionado para a página de detalhe atual.
 *
 * @param {{ contentId: string }} props - Propriedades do componente.
 * @param {string} props.contentId - Id do conteúdo atual.
 * @returns {JSX.Element} Painel de conteúdo relacionado.
 */
export function RelatedContent({ contentId }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const [pageSize, setPageSize] = useState(getCarouselPageSize);
    const [currentPage, setCurrentPage] = useState(0);
    const carouselId = useId();

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return undefined;
        }

        const mediaQueries = [
            window.matchMedia(MOBILE_CAROUSEL_QUERY),
            window.matchMedia(TABLET_CAROUSEL_QUERY),
        ];
        const updatePageSize = () => setPageSize(getCarouselPageSize());

        mediaQueries.forEach((query) => query.addEventListener("change", updatePageSize));
        return () => {
            mediaQueries.forEach((query) => query.removeEventListener("change", updatePageSize));
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        setItems([]);
        setLoading(true);
        setError("");
        setCurrentPage(0);

        discoveryApi
            .related(contentId, { signal: controller.signal })
            .then((response) => {
                if (active) {
                    setItems(response.items ?? []);
                }
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setError(toUserMessage(requestError));
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [contentId, reloadVersion]);

    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    const visiblePage = Math.min(currentPage, pageCount - 1);
    const maximumStartIndex = Math.max(0, items.length - pageSize);
    const visibleStartIndex = Math.min(visiblePage * pageSize, maximumStartIndex);
    const visibleItems = items.slice(visibleStartIndex, visibleStartIndex + pageSize);
    const visibleEndIndex = visibleStartIndex + visibleItems.length;
    const hasMultiplePages = items.length > pageSize;

    if (loading) {
        return (
            <section className="related-titles" aria-label="Títulos semelhantes">
                <p role="status">A carregar títulos semelhantes...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="related-titles" aria-label="Títulos semelhantes">
                <p role="alert">{error}</p>
                <button
                    type="button"
                    onClick={() => setReloadVersion((value) => value + 1)}
                >
                    Tentar novamente
                </button>
            </section>
        );
    }

    return (
        <section className="related-titles" aria-labelledby="related-titles-heading">
            <div className="related-titles-heading-row">
                <div className="content-detail-section-heading">
                    <p className="section-kicker">Descoberta</p>
                    <h2 id="related-titles-heading">Títulos semelhantes</h2>
                </div>
                {hasMultiplePages ? (
                    <div className="related-carousel-controls">
                        <span aria-live="polite" aria-atomic="true">
                            {visibleStartIndex + 1}–{visibleEndIndex} de {items.length}
                        </span>
                        <div className="related-carousel-buttons">
                            <button
                                className="related-carousel-button"
                                type="button"
                                aria-label="Ver títulos anteriores"
                                aria-controls={carouselId}
                                disabled={visiblePage === 0}
                                onClick={() => setCurrentPage(Math.max(0, visiblePage - 1))}
                            >
                                <span aria-hidden="true">←</span>
                            </button>
                            <button
                                className="related-carousel-button"
                                type="button"
                                aria-label="Ver títulos seguintes"
                                aria-controls={carouselId}
                                disabled={visiblePage >= pageCount - 1}
                                onClick={() => setCurrentPage(Math.min(pageCount - 1, visiblePage + 1))}
                            >
                                <span aria-hidden="true">→</span>
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
            {items.length === 0 ? (
                <p>Não existem títulos semelhantes publicados neste momento.</p>
            ) : (
                <div
                    className="related-titles-rail"
                    id={carouselId}
                    role="group"
                    aria-label={`Títulos ${visibleStartIndex + 1} a ${visibleEndIndex} de ${items.length}`}
                >
                    {visibleItems.map((content) => {
                        const imageUrl = content.backdropUrl || content.posterUrl || "";
                        const duration = formatDuration(content.durationSeconds);
                        const metadata = [
                            formatContentType(content.type),
                            duration,
                            content.ageRating === null || content.ageRating === undefined
                                ? ""
                                : `${content.ageRating}+`,
                            content.ratingAverage
                                ? `★ ${content.ratingAverage.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}`
                                : "",
                        ].filter(Boolean);

                        return (
                            <article className="related-title-card" key={content.id}>
                                <Link
                                    to={`/catalogo/${encodeURIComponent(content.slug || content.id)}`}
                                    aria-label={`Ver detalhe: ${content.title}`}
                                >
                                    <span className="related-title-image-frame">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt=""
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <span className="related-title-fallback" aria-hidden="true">
                                                {content.title}
                                            </span>
                                        )}
                                        <span className="related-title-type">
                                            {formatContentType(content.type)}
                                        </span>
                                        <span className="related-title-link-hint">Ver detalhe</span>
                                    </span>
                                    <strong>{content.title}</strong>
                                    {metadata.length > 0 ? <span>{metadata.join(" · ")}</span> : null}
                                </Link>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
