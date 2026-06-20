/**
 * @file Ficheiro `real_dev/frontend/src/pages/DiscoveryHomePage.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DiscoveryCarousel } from "../components/discovery/DiscoveryCarousel.jsx";
import { ApiStatusBadge } from "../components/system/ApiStatusBadge.jsx";
import { discoveryApi } from "../services/api/discoveryApi.js";

/**
 * Página inicial orientada à descoberta da MF3.
 *
 * @returns {JSX.Element} Página inicial de descoberta.
 */
export function DiscoveryHomePage() {
    const [carousels, setCarousels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        discoveryApi
            .home()
            .then((response) => setCarousels(response.carousels))
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="page-section">
            <section className="hero-section">
                <div className="hero-copy">
                    <p className="section-kicker">
                        Streaming cristao com descoberta curada
                    </p>
                    <h1>FaithFlix</h1>
                    <p>
                        Pesquisa, ratings, comentarios, relacionados e
                        recomendacao baseline trabalham sobre conteudos
                        publicados.
                    </p>
                    <div className="button-row">
                        <Link className="button-link" to="/pesquisa">
                            Pesquisar
                        </Link>
                        <Link className="button-link" to="/para-si">
                            Para si
                        </Link>
                    </div>
                </div>
                <ApiStatusBadge />
            </section>
            {loading ? <p>A carregar descoberta...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {carousels.map((carousel) => (
                <DiscoveryCarousel
                    key={carousel.id}
                    title={carousel.title}
                    items={carousel.items}
                />
            ))}
        </section>
    );
}
