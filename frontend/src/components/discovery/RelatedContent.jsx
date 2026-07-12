/**
 * @file Ficheiro `real_dev/frontend/src/components/discovery/RelatedContent.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { discoveryApi } from "../../services/api/discoveryApi.js";
import { formatContentType } from "../../utils/contentTypeLabels.js";

/** @param {unknown} seconds Duração em segundos. @returns {string} Duração curta. */
function formatDuration(seconds) {
    const minutes = Math.round(Number(seconds) / 60);
    return Number.isFinite(minutes) && minutes > 0 ? `${minutes} min` : "";
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

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        setItems([]);
        setLoading(true);
        setError("");

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
            <div className="content-detail-section-heading">
                <p className="section-kicker">Descoberta</p>
                <h2 id="related-titles-heading">Títulos semelhantes</h2>
            </div>
            {items.length === 0 ? (
                <p>Não existem títulos semelhantes publicados neste momento.</p>
            ) : (
                <div className="related-titles-rail">
                    {items.map((content) => {
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
