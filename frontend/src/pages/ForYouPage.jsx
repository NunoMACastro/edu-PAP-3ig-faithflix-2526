/**
 * @file Página pública de descoberta personalizada para a sessão atual.
 */

import { useEffect, useState } from "react";
import { DiscoveryCarousel } from "../components/discovery/DiscoveryCarousel.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { recommendationsApi } from "../services/api/recommendationsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const GROUP_TITLES = {
    "semantic-similar": "Parecidos com o que acompanhas",
    "because-your-themes": "Temas de que gostas",
    "because-your-activity": "Mais do que costumas ver",
    "popular-start": "Populares para começar",
    "recent-start": "Novidades do catálogo",
    "catalog-start": "Para explorar",
};

/**
 * Normaliza títulos recebidos da API sem expor categorias operacionais.
 *
 * @param {{ id: string, title?: string }} group Grupo de recomendações.
 * @returns {string} Título editorial apresentado ao utilizador.
 */
function recommendationGroupTitle(group) {
    return GROUP_TITLES[group.id] ?? group.title ?? "Mais histórias para descobrir";
}

/**
 * Mostra uma seleção pessoal sem expor detalhes internos da recomendação.
 *
 * @returns {JSX.Element} Página de recomendações pessoais.
 */
export function ForYouPage() {
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setLoading(true);
        setError("");

        /**
         * Carrega recomendações mantendo uma explicação compreensível na interface.
         *
         * @returns {Promise<void>} Termina depois de atualizar a página.
         */
        async function loadRecommendations() {
            try {
                const response = await recommendationsApi.mine({
                    signal: controller.signal,
                });

                if (active) {
                    setRecommendations(response);
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

        loadRecommendations();

        return () => {
            active = false;
            controller.abort();
        };
    }, [reloadVersion]);

    const groups = recommendations?.groups ?? [];

    return (
        <section className="page-section for-you-page">
            <header className="for-you-hero">
                <div>
                    <p className="section-kicker">Escolhido para ti</p>
                    <h1>Para si</h1>
                    <p>Histórias para descobrir, reunidas num só lugar e renovadas à medida que exploras a FaithFlix.</p>
                </div>
                <span className="for-you-hero-mark" aria-hidden="true">✦</span>
            </header>

            {loading ? <p role="status">A escolher histórias para si...</p> : null}
            {error ? (
                <EmptyState title="Não foi possível preparar a tua seleção" description={error} tone="error">
                    <button
                        type="button"
                        onClick={() => setReloadVersion((value) => value + 1)}
                    >
                        Tentar novamente
                    </button>
                </EmptyState>
            ) : null}
            {recommendations ? (
                <p className="for-you-guidance">
                    {recommendations.coldStart
                        ? "Para começar, reunimos histórias populares, novidades e algumas escolhas do catálogo."
                        : "A tua seleção evolui à medida que descobres, guardas e avalias conteúdos."}
                </p>
            ) : null}
            {!loading && !error && groups.length === 0 ? (
                <EmptyState
                    title="Ainda não temos sugestões para mostrar"
                    description="Explora o catálogo e guarda títulos na tua biblioteca. Esta página ganha forma à medida que descobres novas histórias."
                />
            ) : null}

            {groups.map((group) => (
                <section className="recommendation-group" key={group.id}>
                    <DiscoveryCarousel title={recommendationGroupTitle(group)} items={group.items} />
                </section>
            ))}
        </section>
    );
}
