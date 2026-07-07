/**
 * @file Ficheiro `real_dev/frontend/src/components/ratings/RatingBox.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { ratingsApi } from "../../services/api/ratingsApi.js";

const RATING_VALUES = [1, 2, 3, 4, 5];

/**
 * Mostra classificação agregada e permite ao utilizador autenticado guardar a sua classificação.
 *
 * @param {{ contentId: string }} props - Propriedades do componente.
 * @param {string} props.contentId - Id do conteúdo publicado atual.
 * @returns {JSX.Element} Controlo de classificação.
 */
export function RatingBox({ contentId }) {
    const [summary, setSummary] = useState(null);
    const [myRating, setMyRating] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    /**
     * Carrega resumo público e avaliação pessoal do conteúdo.
     *
     * O parâmetro `active` impede atualizações de estado quando o componente já
     * foi desmontado ou mudou de conteúdo durante o pedido.
     *
     * @param {boolean} active Indica se o resultado ainda deve atualizar o componente.
     * @returns {Promise<void>} Termina depois de sincronizar estado ou erro.
     */
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

    /**
     * Guarda uma nova avaliação escolhida pelo utilizador.
     *
     * Depois de persistir, recarrega resumo e avaliação pessoal para refletir a
     * agregação calculada pelo backend.
     *
     * @param {number} value Valor selecionado na escala de classificação.
     * @returns {Promise<void>} Termina depois de guardar ou apresentar erro.
     */
    async function saveRating(value) {
        setStatus("");
        setError("");

        try {
            await ratingsApi.save(contentId, value);
            setStatus("Classificação guardada.");
            await loadRatingState();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    /**
     * Remove a avaliação pessoal do utilizador.
     *
     * A função limpa mensagens anteriores, chama a API e recarrega o estado para
     * atualizar média e seleção visual.
     *
     * @returns {Promise<void>} Termina depois de remover ou apresentar erro.
     */
    async function removeRating() {
        setStatus("");
        setError("");

        try {
            await ratingsApi.remove(contentId);
            setStatus("Classificação removida.");
            await loadRatingState();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <section className="interaction-panel" aria-label="Classificações">
            <div>
                <p className="section-kicker">Classificação</p>
                <h2>Classificação dos utilizadores</h2>
                {loading ? <p>A carregar classificações...</p> : null}
                {summary ? (
                    <p>
                        Média {summary.average} em 5, com {summary.total}{" "}
                        classificações.
                    </p>
                ) : null}
            </div>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <div className="rating-actions" aria-label="Escolher classificação">
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
