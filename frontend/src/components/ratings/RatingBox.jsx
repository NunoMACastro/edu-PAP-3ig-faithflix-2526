import { useEffect, useState } from "react";
import { ratingsApi } from "../../services/api/ratingsApi.js";

const RATING_VALUES = [1, 2, 3, 4, 5];

/**
 * Shows aggregate rating and lets authenticated users save their own rating.
 *
 * @param {{ contentId: string }} props - Component props.
 * @param {string} props.contentId - Current published content id.
 * @returns {JSX.Element} Rating control.
 */
export function RatingBox({ contentId }) {
    const [summary, setSummary] = useState(null);
    const [myRating, setMyRating] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    async function loadRatingState(active = true) {
        setLoading(true);
        setError("");

        try {
            const summaryResponse = await ratingsApi.getSummary(contentId);

            if (!active) {
                return;
            }

            setSummary(summaryResponse.summary);

            try {
                const meResponse = await ratingsApi.getMine(contentId);
                if (active) {
                    setMyRating(meResponse.rating.value);
                }
            } catch {
                if (active) {
                    setMyRating(null);
                }
            }
        } catch (requestError) {
            if (active) {
                setError(requestError.message);
            }
        } finally {
            if (active) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        let active = true;

        setSummary(null);
        setMyRating(null);
        setStatus("");
        loadRatingState(active);

        return () => {
            active = false;
        };
    }, [contentId]);

    async function saveRating(value) {
        setStatus("");
        setError("");

        try {
            await ratingsApi.save(contentId, value);
            setStatus("Rating guardado.");
            await loadRatingState();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function removeRating() {
        setStatus("");
        setError("");

        try {
            await ratingsApi.remove(contentId);
            setStatus("Rating removido.");
            await loadRatingState();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <section className="interaction-panel" aria-label="Ratings">
            <div>
                <p className="section-kicker">Rating</p>
                <h2>Classificacao dos utilizadores</h2>
                {loading ? <p>A carregar ratings...</p> : null}
                {summary ? (
                    <p>
                        Media {summary.average} em 5, com {summary.total}{" "}
                        classificacoes.
                    </p>
                ) : null}
            </div>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <div className="rating-actions" aria-label="Escolher rating">
                {RATING_VALUES.map((value) => (
                    <button
                        className={
                            value === myRating
                                ? "rating-button rating-button-active"
                                : "rating-button"
                        }
                        key={value}
                        type="button"
                        onClick={() => saveRating(value)}
                        aria-pressed={value === myRating}
                    >
                        {value}
                    </button>
                ))}
                {myRating ? (
                    <button type="button" onClick={removeRating}>
                        Remover
                    </button>
                ) : null}
            </div>
        </section>
    );
}
