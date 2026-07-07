/**
 * @file Página inicial de descoberta FaithFlix.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DiscoveryCarousel } from "../components/discovery/DiscoveryCarousel.jsx";
import { ApiStatusBadge } from "../components/system/ApiStatusBadge.jsx";
import { discoveryApi } from "../services/api/discoveryApi.js";

/**
 * Mostra a entrada principal da plataforma e os carrosséis de descoberta.
 *
 * @returns {JSX.Element} Página inicial da aplicação.
 */
export function DiscoveryHomePage() {
    const [carousels, setCarousels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        /**
         * Carrega a descoberta pública sem alterar contratos de catálogo ou recomendação.
         *
         * @returns {Promise<void>} Termina depois de atualizar a página.
         */
        async function loadDiscovery() {
            try {
                const response = await discoveryApi.home();

                if (!ignore) {
                    setCarousels(response.carousels);
                }
            } catch (requestError) {
                if (!ignore) {
                    setError(requestError.message);
                }
            } finally {
                // A flag evita atualizar estado se o componente sair do ecrã durante o pedido.
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadDiscovery();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <section className="page-section">
            <section className="hero-section" aria-labelledby="home-title">
                <div className="hero-copy">
                    <p className="section-kicker">
                        Streaming cristão curado
                    </p>
                    <h1 id="home-title">FaithFlix</h1>
                    <p>
                        Conteúdos, pesquisa, recomendações simples e impacto
                        solidário numa experiência preparada para desktop,
                        tablet e telemóvel.
                    </p>
                    <div className="button-row">
                        <Link className="button-link" to="/catalogo">
                            Explorar catálogo
                        </Link>
                        <Link className="button-link" to="/planos">
                            Ver planos
                        </Link>
                    </div>
                </div>
                {/* O badge confirma saúde da API sem interromper o fluxo visual do hero. */}
                <ApiStatusBadge />
            </section>

            {loading ? <p role="status">A carregar descoberta...</p> : null}
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
