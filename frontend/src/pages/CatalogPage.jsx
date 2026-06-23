/**
 * @file Ficheiro `real_dev/frontend/src/pages/CatalogPage.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ContinueWatchingStrip } from "../components/playback/ContinueWatchingStrip.jsx";
import { catalogApi } from "../services/api/catalogApi.js";

/**
 * Página pública de catálogo que mostra apenas conteúdo publicado.
 *
 * @returns {JSX.Element} Catalog page.
 */
export function CatalogPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        catalogApi
            .listPublished()
            .then((response) => setItems(response.items))
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="page-section">
            <p className="section-kicker">Catalogo</p>
            <h1>Catalogo FaithFlix</h1>
            <ContinueWatchingStrip />
            {loading ? <p>A carregar catalogo...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {!loading && items.length === 0 ? (
                <p>Ainda nao existem conteudos publicados.</p>
            ) : null}
            <section className="content-grid" aria-label="Conteudos publicados">
                {items.map((content) => (
                    <article className="content-tile" key={content.id}>
                        {content.assets?.posterUrl ? (
                            <img src={content.assets.posterUrl} alt="" />
                        ) : null}
                        <p className="content-card-eyebrow">{content.type}</p>
                        <h2>{content.title}</h2>
                        <p>{content.synopsis}</p>
                        <Link
                            className="button-link"
                            to={`/catalogo/${content.slug}`}
                        >
                            Ver detalhe
                        </Link>
                    </article>
                ))}
            </section>
        </section>
    );
}
