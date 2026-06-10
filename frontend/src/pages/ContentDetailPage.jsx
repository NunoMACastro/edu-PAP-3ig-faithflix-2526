import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LibraryActions } from "../components/library/LibraryActions.jsx";
import { catalogApi } from "../services/api/catalogApi.js";

function formatDuration(seconds) {
    const minutes = Math.round(Number(seconds) / 60);
    return `${minutes} min`;
}

/**
 * Public content detail page.
 *
 * @returns {JSX.Element} Content detail page.
 */
export function ContentDetailPage() {
    const { idOrSlug } = useParams();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");

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
                }0
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [idOrSlug]);

    if (loading) {
        return (
            <section className="page-section">
                <p>A carregar conteudo...</p>
            </section>
        );
    }

    if (error || !content) {
        return (
            <section className="page-section">
                <h1>Conteudo indisponivel</h1>
                <p>{error || "Conteudo nao encontrado."}</p>
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
                <dt>Duracao</dt>
                <dd>{formatDuration(content.durationSeconds)}</dd>
                <dt>Classificacao</dt>
                <dd>{content.ageRating}+</dd>
            </dl>
            <div className="button-row">
                <Link className="button-link" to={`/ver/${content.id}`}>
                    Reproduzir
                </Link>
            </div>
            <LibraryActions contentId={content.id} />
            <CommentsPanel contentId={content.id} />
        </section>
    );

    
}
