export function RecommendationExplanation({ explanation }) {
  if (!explanation) return null;

  return (
    <aside className="recommendation-explanation">
      <h3>{explanation.title}</h3>
      <p>{explanation.message}</p>
      <ul aria-label="Sinais usados">
        {explanation.signals.map((signal) => (
          <li key={signal}>{signal}</li>
        ))}
      </ul>
    </aside>
  );
}