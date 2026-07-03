/**
 * @file Página de recomendações pessoais baseline.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RecommendationExplanation } from "../components/recommendations/RecommendationExplanation.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { recommendationsApi } from "../services/api/recommendationsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Converte grupos em eventos agregados de recomendação.
 *
 * @param {Record<string, unknown>[]} groups Grupos devolvidos pelo backend.
 * @param {"shown" | "clicked"} eventType Tipo de evento.
 * @param {string} [contentId] Conteúdo específico para eventos de clique.
 * @returns {Array<{ eventType: string, contentId: string, groupId: string, reasonCode: string }>} Eventos seguros.
 */
function recommendationEvents(groups, eventType, contentId = "") {
    return groups.flatMap((group) =>
        (group.items ?? [])
            .filter((item) => !contentId || item.id === contentId)
            .map((item) => ({
                eventType,
                contentId: item.id,
                groupId: group.id,
                reasonCode: group.reasonCode,
            })),
    );
}

/**
 * Remove um conteúdo de todos os grupos mantendo a resposta restante intacta.
 *
 * @param {Record<string, unknown>} recommendations Resposta atual.
 * @param {string} contentId Conteúdo a esconder localmente.
 * @returns {Record<string, unknown>} Próximo estado.
 */
function removeRecommendedItem(recommendations, contentId) {
    return {
        ...recommendations,
        groups: (recommendations.groups ?? []).map((group) => ({
            ...group,
            items: (group.items ?? []).filter((item) => item.id !== contentId),
        })),
    };
}

/**
 * Mostra um grupo de recomendações com feedback explícito por conteúdo.
 *
 * @param {{ group: Record<string, unknown>, pendingFeedback: string, onFeedback: Function, onContentClick: Function }} props Props do grupo.
 * @returns {JSX.Element} Grupo visual.
 */
function RecommendationGroup({
    group,
    pendingFeedback,
    onFeedback,
    onContentClick,
}) {
    return (
        <section className="recommendation-group">
            <RecommendationExplanation explanation={group.explanation} />
            <section className="discovery-carousel" aria-label={group.title}>
                <h2>{group.title}</h2>
                {group.items.length === 0 ? (
                    <p>Sem conteúdos publicados para este grupo.</p>
                ) : null}
                <div className="content-row">
                    {group.items.map((content) => (
                        <article className="content-tile" key={content.id}>
                            {content.posterUrl ? (
                                <img src={content.posterUrl} alt="" />
                            ) : null}
                            <p className="content-card-eyebrow">{content.type}</p>
                            <h3>{content.title}</h3>
                            <div className="recommendation-actions">
                                <Link
                                    className="button-link"
                                    onClick={() => onContentClick(content.id)}
                                    to={`/catalogo/${content.slug}`}
                                >
                                    Ver detalhe
                                </Link>
                                <button
                                    disabled={
                                        pendingFeedback ===
                                        `${content.id}:more_like_this`
                                    }
                                    onClick={() =>
                                        onFeedback(
                                            content.id,
                                            "more_like_this",
                                        )
                                    }
                                    type="button"
                                >
                                    Mais deste tipo
                                </button>
                                <button
                                    disabled={
                                        pendingFeedback ===
                                        `${content.id}:not_interested`
                                    }
                                    onClick={() =>
                                        onFeedback(
                                            content.id,
                                            "not_interested",
                                        )
                                    }
                                    type="button"
                                >
                                    Não recomendar
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}

/**
 * Mostra recomendações baseline para o utilizador autenticado.
 *
 * @returns {JSX.Element} Página de recomendações pessoais.
 */
export function ForYouPage() {
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [pendingFeedback, setPendingFeedback] = useState("");

    /**
     * Regista eventos sem bloquear a experiência visual.
     *
     * @param {Array<Record<string, string>>} events Eventos a enviar.
     * @returns {void}
     */
    function recordEvents(events) {
        if (events.length === 0) {
            return;
        }

        recommendationsApi.events({ events }).catch(() => {});
    }

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
                    recordEvents(
                        recommendationEvents(response.groups ?? [], "shown"),
                    );
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

    /**
     * Guarda feedback do utilizador e atualiza a lista local quando aplicável.
     *
     * @param {string} contentId Conteúdo avaliado.
     * @param {string} action Ação de feedback.
     * @returns {Promise<void>} Termina após feedback.
     */
    async function handleFeedback(contentId, action) {
        setPendingFeedback(`${contentId}:${action}`);
        setFeedbackMessage("");

        try {
            await recommendationsApi.feedback({ contentId, action });

            if (action === "not_interested") {
                setRecommendations((current) =>
                    current ? removeRecommendedItem(current, contentId) : current,
                );
                setFeedbackMessage("Conteúdo removido das tuas sugestões.");
            } else {
                setFeedbackMessage("Feedback guardado para futuras sugestões.");
            }
        } catch (requestError) {
            setFeedbackMessage(toUserMessage(requestError));
        } finally {
            setPendingFeedback("");
        }
    }

    /**
     * Regista clique num item recomendado.
     *
     * @param {string} contentId Conteúdo clicado.
     * @returns {void}
     */
    function handleContentClick(contentId) {
        recordEvents(
            recommendationEvents(
                recommendations?.groups ?? [],
                "clicked",
                contentId,
            ),
        );
    }

    const groups = recommendations?.groups ?? [];

    return (
        <section className="page-section">
            <p className="section-kicker">Recomendação baseline</p>
            <h1>Para si</h1>

            {loading ? <p role="status">A preparar recomendações...</p> : null}
            {error ? (
                <EmptyState title="Não foi possível carregar recomendações" description={error} tone="error" />
            ) : null}
            {recommendations ? (
                <p className="status-message">
                    {recommendations.coldStart
                        ? "Ainda há poucos sinais teus, por isso mostramos sugestões gerais e explicáveis."
                        : "As sugestões usam sinais agregados da tua atividade na FaithFlix."}
                </p>
            ) : null}
            {feedbackMessage ? (
                <p className="status-message" role="status">
                    {feedbackMessage}
                </p>
            ) : null}
            {!loading && !error && groups.length === 0 ? (
                <EmptyState
                    title="Ainda sem sinais suficientes"
                    description="Quando existirem conteúdos elegíveis ou atividade suficiente, as sugestões aparecem aqui."
                />
            ) : null}

            {groups.map((group) => (
                <RecommendationGroup
                    group={group}
                    key={group.id}
                    onContentClick={handleContentClick}
                    onFeedback={handleFeedback}
                    pendingFeedback={pendingFeedback}
                />
            ))}
        </section>
    );
}
