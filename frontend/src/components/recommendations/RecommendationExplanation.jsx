/**
 * Shows a safe explanation for one recommendation group.
 *
 * @param {{ explanation: { title: string, message: string, signals: string[], confidence: string } }} props - Component props.
 * @returns {JSX.Element} Recommendation explanation.
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
