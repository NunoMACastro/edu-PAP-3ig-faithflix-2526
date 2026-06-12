import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DiscoveryCarousel } from "../components/discovery/DiscoveryCarousel.jsx";
import { ApiStatusBadge } from "../components/system/ApiStatusBadge.jsx";
import { discoveryApi } from "../services/api/discoveryApi.js";

/**
 * Discovery-oriented home page for MF3.
 *
 * @returns {JSX.Element} Discovery home page.
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
