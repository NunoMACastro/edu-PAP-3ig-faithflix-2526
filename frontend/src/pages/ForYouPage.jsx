/**
 * @file Página de recomendações pessoais baseline.
 */

import { useEffect, useState } from "react";
import { DiscoveryCarousel } from "../components/discovery/DiscoveryCarousel.jsx";
import { RecommendationExplanation } from "../components/recommendations/RecommendationExplanation.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { recommendationsApi } from "../services/api/recommendationsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Mostra recomendações baseline para o utilizador autenticado.
 *
 * @returns {JSX.Element} Página de recomendações pessoais.
 */
export function ForYouPage() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    /**
     * Carrega recomendações mantendo a explicabilidade definida em MF3.
     *
     * @returns {Promise<void>} Termina depois de atualizar a página.
     */
    async function loadRecommendations() {
      try {
        const response = await recommendationsApi.mine();

        if (active) {
          setRecommendations(response);
        }
      } catch (requestError) {
        if (active) {
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
    };
  }, []);

  const groups = recommendations?.groups ?? [];

  return (
    <section className="page-section">
      <p className="section-kicker">Recomendação baseline</p>
      <h1>Para si</h1>

      {loading ? <p role="status">A preparar recomendações...</p> : null}
      {error ? <EmptyState title="Não foi possível carregar recomendações" description={error} tone="error" /> : null}
      {recommendations ? (
        <p className="status-message">
          {recommendations.coldStart
            ? "Ainda há poucos sinais teus, por isso mostramos sugestões gerais e explicáveis."
            : "As sugestões usam sinais agregados da tua atividade na FaithFlix."}
        </p>
      ) : null}
      {!loading && !error && groups.length === 0 ? (
        <EmptyState
          title="Ainda sem sinais suficientes"
          description="Quando existirem conteúdos elegíveis ou atividade suficiente, as sugestões aparecem aqui."
        />
      ) : null}

      {groups.map((group) => (
        <section className="recommendation-group" key={group.id}>
          <RecommendationExplanation explanation={group.explanation} />
          <DiscoveryCarousel title={group.title} items={group.items} />
        </section>
      ))}
    </section>
  );
}