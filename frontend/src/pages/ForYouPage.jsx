/**
 * @file Ficheiro `real_dev/frontend/src/pages/ForYouPage.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { DiscoveryCarousel } from "../components/discovery/DiscoveryCarousel.jsx";
import { RecommendationExplanation } from "../components/recommendations/RecommendationExplanation.jsx";
import { recommendationsApi } from "../services/api/recommendationsApi.js";

/**
 * Authenticated recommendations page.
 *
 * @returns {JSX.Element} Página de recomendações pessoais.
 */
export function ForYouPage() {
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        recommendationsApi
            .mine()
            .then((response) => setRecommendations(response))
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="page-section">
            <p className="section-kicker">Recomendacao baseline</p>
            <h1>Para si</h1>
            {loading ? <p>A preparar recomendacoes...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {recommendations ? (
                <p>
                    {recommendations.coldStart
                        ? "Ainda ha poucos sinais teus, por isso mostramos sugestoes gerais."
                        : "As sugestoes usam sinais agregados da tua atividade na FaithFlix."}
                </p>
            ) : null}
            {(recommendations?.groups ?? []).map((group) => (
                <section className="recommendation-group" key={group.id}>
                    <RecommendationExplanation explanation={group.explanation} />
                    <DiscoveryCarousel title={group.title} items={group.items} />
                </section>
            ))}
        </section>
    );
}
