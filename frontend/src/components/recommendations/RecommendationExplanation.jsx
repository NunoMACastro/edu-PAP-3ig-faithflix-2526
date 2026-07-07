/**
 * @file Ficheiro `real_dev/frontend/src/components/recommendations/RecommendationExplanation.jsx` da implementação real_dev.
 */

/**
 * Mostra uma explicação segura para um grupo de recomendações.
 *
 * @param {{ explanation: { title: string, message: string, signals: string[], confidence: string } }} props - Propriedades do componente.
 * @returns {JSX.Element} Explicação de recomendação.
 */
export function RecommendationExplanation({ explanation }) {
    return (
        <aside className="recommendation-explanation">
            <strong>{explanation.title}</strong>
            <p>{explanation.message}</p>
            <small>
                Sinais: {explanation.signals.join(", ")}. Confianca:{" "}
                {explanation.confidence}.
            </small>
        </aside>
    );
}
