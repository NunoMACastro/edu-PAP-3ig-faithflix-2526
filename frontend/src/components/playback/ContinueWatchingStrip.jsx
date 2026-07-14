/**
 * @file Faixa cancelável e paginada de conteúdos por continuar.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { playbackApi } from "../../services/api/playbackApi.js";

/**
 * Calcula uma percentagem finita e limitada ao intervalo do elemento progress.
 *
 * @param {{ currentTimeSeconds?: number, durationSeconds?: number }} item Item de progresso.
 * @returns {number} Percentagem inteira entre 0 e 100.
 */
function progressPercent(item) {
    const currentTime = Number(item.currentTimeSeconds);
    const duration = Number(item.durationSeconds);

    if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) {
        return 0;
    }

    return Math.min(100, Math.max(0, Math.round((currentTime / duration) * 100)));
}

/**
 * Mostra os primeiros conteúdos inacabados da sessão autenticada.
 *
 * @returns {JSX.Element | null} Faixa, estado de carregamento/erro ou null.
 */
export function ContinueWatchingStrip() {
    const { status } = useSession();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        setItems([]);
        setError("");

        if (status !== "authenticated") {
            setLoading(false);
            return () => {
                active = false;
                controller.abort();
            };
        }

        setLoading(true);
        playbackApi
            .listContinueWatching(
                { page: 1, limit: 12 },
                { signal: controller.signal },
            )
            .then((response) => {
                if (active) setItems(response.items ?? []);
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setError(toUserMessage(requestError));
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [reloadVersion, status]);

    if (status !== "authenticated") {
        return null;
    }

    if (loading) {
        return (
            <section aria-label="Continuar a ver">
                <p role="status">A carregar conteúdos por continuar...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section aria-label="Continuar a ver">
                <p role="alert">{error}</p>
                <button
                    type="button"
                    onClick={() => setReloadVersion((value) => value + 1)}
                >
                    Tentar novamente
                </button>
            </section>
        );
    }

    if (items.length === 0) {
        return null;
    }

    return (
        <section className="continue-watching-strip" aria-label="Continuar a ver">
            <div className="continue-watching-heading">
                <p className="most-watched-kicker">Retomar</p>
                <h2>Continuar a ver</h2>
            </div>
            <div className="continue-watching-rail">
                {items.map((item) => (
                    <article className="continue-watching-card" key={item.id}>
                        <Link
                            aria-label={
                                item.canResume === true
                                    ? `Continuar a ver ${item.title}`
                                    : `Ver planos para retomar ${item.title}`
                            }
                            className="continue-watching-link"
                            to={
                                item.canResume === true
                                    ? `/ver/${encodeURIComponent(item.id)}`
                                    : "/planos"
                            }
                        >
                            <span className="continue-watching-poster">
                                {item.posterUrl ? (
                                    <img
                                        src={item.posterUrl}
                                        alt={`Cartaz de ${item.title}`}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <span aria-hidden="true">{item.title}</span>
                                )}
                                <span
                                    className="continue-watching-overlay"
                                    aria-hidden="true"
                                >
                                    {item.canResume === true
                                        ? "Continuar"
                                        : "Ver planos"}
                                </span>
                            </span>
                            <span className="continue-watching-copy">
                                <strong>{item.title}</strong>
                                <progress
                                    aria-label={`Progresso de ${item.title}`}
                                    max="100"
                                    value={progressPercent(item)}
                                />
                            </span>
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}
