import { useEffect, useState } from "react";
import { ratingsApi } from "../../services/api/ratingsApi.js";

const emptySummary = {
  average: 0,
  count: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

export function RatingBox({ contentId }) {
  const [summary, setSummary] = useState(emptySummary);
  const [myRating, setMyRating] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");

    Promise.all([
      ratingsApi.getSummary(contentId),
      ratingsApi.getMine(contentId).catch(() => ({ myRating: null })),
    ])
      .then(([summaryResponse, mineResponse]) => {
        if (!active) return;
        setSummary(summaryResponse.summary);
        setMyRating(mineResponse.myRating);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setError("Nao foi possivel carregar os ratings.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [contentId]);

  async function chooseRating(value) {
    setError("");
    setStatus("saving");

    try {
      const response = await ratingsApi.save(contentId, value);
      setMyRating(response.myRating);
      setSummary(response.summary);
      setStatus("success");
    } catch {
      setError("Entra na tua conta para avaliar este conteudo.");
      setStatus("error");
    }
  }

  async function clearRating() {
    setError("");
    setStatus("saving");

    try {
      const response = await ratingsApi.remove(contentId);
      setMyRating(response.myRating);
      setSummary(response.summary);
      setStatus("success");
    } catch {
      setError("Nao foi possivel remover o rating.");
      setStatus("error");
    }
  }

  return (
    <section className="rating-box" aria-label="Rating do conteudo">
      <h2>Rating</h2>
      <p>{summary.count === 0 ? "Ainda sem ratings." : `${summary.average}/5 em ${summary.count} rating(s).`}</p>

      <div className="rating-actions">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={myRating === value}
            disabled={status === "saving"}
            onClick={() => chooseRating(value)}
          >
            {value}
          </button>
        ))}
        {myRating !== null && (
          <button type="button" disabled={status === "saving"} onClick={clearRating}>
            Remover
          </button>
        )}
      </div>

      {myRating !== null && <p>O teu rating: {myRating}/5.</p>}
      {status === "loading" && <p>A carregar ratings...</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}