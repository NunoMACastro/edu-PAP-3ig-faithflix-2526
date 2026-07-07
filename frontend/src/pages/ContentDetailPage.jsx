/**
 * @file Ficheiro `real_dev/frontend/src/pages/ContentDetailPage.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CommentsPanel } from "../components/comments/CommentsPanel.jsx";
import { RelatedContent } from "../components/discovery/RelatedContent.jsx";
import { LibraryActions } from "../components/library/LibraryActions.jsx";
import { RatingBox } from "../components/ratings/RatingBox.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { biblicalPassagesApi } from "../services/api/biblicalPassagesApi.js";
import { catalogApi } from "../services/api/catalogApi.js";

/**
 * Converte duração em segundos para texto curto de minutos.
 *
 * A página recebe duração técnica do backend, mas mostra uma leitura simples para
 * o utilizador na ficha do conteúdo.
 *
 * @param {number | string} seconds Duração total do conteúdo em segundos.
 * @returns {string} Duração arredondada no formato `<minutos> min`.
 */
function formatDuration(seconds) {
    const minutes = Math.round(Number(seconds) / 60);
    return `${minutes} min`;
}

/**
 * Página pública de detalhe de conteúdo.
 *
 * @returns {JSX.Element} Página de detalhe de conteúdo.
 */
export function ContentDetailPage() {
    const { idOrSlug } = useParams();
    const [content, setContent] = useState(null);
    const [passages, setPassages] = useState([]);
    const [passageLoading, setPassageLoading] = useState(false);
    const [passageError, setPassageError] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");
        setPassages([]);
        setPassageError("");
        setPassageLoading(true);

        catalogApi
            .getDetail(idOrSlug)
            .then((response) => {
                if (active) {
                    setContent(response.content);
                }
            })
            .catch((requestError) => {
                if (active) {
                    setError(requestError.message);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        biblicalPassagesApi
            .listForContent(idOrSlug)
            .then((response) => {
                if (active) {
                    setPassages(response.items ?? []);
                }
            })
            .catch((requestError) => {
                if (active) {
                    setPassageError(requestError.message);
                }
            })
            .finally(() => {
                if (active) {
                    setPassageLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [idOrSlug]);

    if (loading) {
        return (
            <section className="page-section">
                <p role="status">A carregar conteúdo...</p>
            </section>
        );
    }

    if (error || !content) {
        return (
            <section className="page-section">
                <h1>Conteúdo indisponível</h1>
                <p>{error || "Conteúdo não encontrado."}</p>
            </section>
        );
    }

    return (
        <section className="page-section" data-testid="content-detail">
            {content.assets?.backdropUrl || content.assets?.posterUrl ? (
                <img
                    className="detail-media"
                    src={content.assets.backdropUrl || content.assets.posterUrl}
                    alt=""
                />
            ) : null}
            <p className="section-kicker">{content.type}</p>
            <h1>{content.title}</h1>
            <p>{content.synopsis}</p>
            <dl className="meta-list">
                <dt>Duração</dt>
                <dd>{formatDuration(content.durationSeconds)}</dd>
                <dt>Classificação</dt>
                <dd>{content.ageRating}+</dd>
            </dl>
            <div className="button-row">
                <Link className="button-link" to={`/ver/${content.id}`}>
                    Reproduzir
                </Link>
            </div>
            <LibraryActions contentId={content.id} />
            <RatingBox contentId={content.id} />
            <section
                aria-labelledby="biblical-passages-heading"
                data-testid="biblical-passages-section"
            >
                <h2 id="biblical-passages-heading">Passagens bíblicas</h2>
                {passageLoading ? (
                    <p role="status">A carregar passagens bíblicas...</p>
                ) : null}
                {passageError ? (
                    <EmptyState
                        title="Não foi possível carregar as passagens"
                        description={passageError}
                        tone="error"
                    />
                ) : null}
                {!passageLoading && !passageError && passages.length === 0 ? (
                    <EmptyState
                        title="Sem passagens bíblicas associadas"
                        description="Este conteúdo ainda não tem referências bíblicas publicadas pela equipa editorial."
                    />
                ) : null}
                {!passageError && passages.length > 0 ? (
                    <div className="content-grid">
                        {passages.map((passage) => (
                            <article className="content-card" key={passage.id}>
                                <p className="content-card-eyebrow">
                                    {passage.reference} · {passage.translation}
                                </p>
                                <h3>{passage.theme || "Reflexão bíblica"}</h3>
                                <p>{passage.text}</p>
                                {passage.reflection ? (
                                    <p>{passage.reflection}</p>
                                ) : null}
                                {passage.note ? <p>{passage.note}</p> : null}
                            </article>
                        ))}
                    </div>
                ) : null}
            </section>
            <CommentsPanel contentId={content.id} />
            <RelatedContent contentId={content.id} />
        </section>
    );
}
