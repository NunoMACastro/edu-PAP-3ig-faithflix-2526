/**
 * @file Ações canceláveis de favoritos e lista para ver mais tarde.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { libraryApi } from "../../services/api/libraryApi.js";
import { buildLoginRedirectPath } from "../../utils/authRedirect.js";

/**
 * Verifica se a resposta de biblioteca contém o conteúdo atual.
 *
 * @param {{ items?: Array<{ id?: string }> } | null | undefined} response Resposta da API.
 * @param {string} contentId Identificador do conteúdo atual.
 * @returns {boolean} `true` quando o conteúdo está presente na lista.
 */
function hasCurrentContent(response, contentId) {
    return (response?.items ?? []).some((item) => item.id === contentId);
}

/**
 * Percorre apenas as páginas declaradas pelo backend até encontrar o conteúdo.
 *
 * A listagem deixou de ser ilimitada na Fase 5; esta pesquisa preserva o estado
 * correto do botão mesmo quando o título não está na primeira página.
 *
 * @param {Function} listPage Função paginada de favoritos ou lista futura.
 * @param {string} contentId Conteúdo a procurar.
 * @param {AbortSignal} signal Sinal partilhado por todas as páginas.
 * @returns {Promise<boolean>} `true` quando alguma página contém o conteúdo.
 */
async function listContainsContent(listPage, contentId, signal) {
    let page = 1;
    let totalPages = 1;

    do {
        const response = await listPage(
            { page, limit: 50 },
            { signal },
        );

        if (hasCurrentContent(response, contentId)) {
            return true;
        }

        totalPages = Number.isInteger(response?.totalPages)
            ? Math.max(response.totalPages, 1)
            : 1;
        page += 1;
    } while (page <= totalPages);

    return false;
}

/**
 * Ações de favoritos e lista para ver mais tarde na página de detalhe.
 *
 * @param {{ contentId: string, variant?: "default"|"hero" }} props Propriedades do componente.
 * @param {string} props.contentId Identificador do conteúdo atual.
 * @param {"default"|"hero"} [props.variant="default"] Apresentação visual sem alterar comportamento.
 * @returns {JSX.Element} Ações de biblioteca.
 */
export function LibraryActions({ contentId, variant = "default" }) {
    const { status: sessionStatus } = useSession();
    const location = useLocation();
    const [favoriteSaved, setFavoriteSaved] = useState(false);
    const [watchlistSaved, setWatchlistSaved] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [busyActions, setBusyActions] = useState(() => new Set());
    const activeActionsRef = useRef(new Set());
    const controllersRef = useRef(new Set());
    const generationRef = useRef(0);
    const mountedRef = useRef(true);

    /**
     * Cria um pedido cancelável acompanhado pelo ciclo de vida do componente.
     *
     * @returns {AbortController} Controlador registado até o pedido terminar.
     */
    function trackedController() {
        const controller = new AbortController();
        controllersRef.current.add(controller);
        return controller;
    }

    useEffect(() => {
        const generation = generationRef.current + 1;
        generationRef.current = generation;
        const controller = trackedController();
        let active = true;

        setFavoriteSaved(false);
        setWatchlistSaved(false);
        setStatus("");
        setError("");
        activeActionsRef.current.clear();
        setBusyActions(new Set());

        if (sessionStatus !== "authenticated") {
            controllersRef.current.delete(controller);
            return () => {
                active = false;
                controller.abort();
            };
        }

        Promise.all([
            listContainsContent(
                libraryApi.listFavorites,
                contentId,
                controller.signal,
            ),
            listContainsContent(
                libraryApi.listWatchlist,
                contentId,
                controller.signal,
            ),
        ])
            .then(([isFavorite, isInWatchlist]) => {
                if (!active || generationRef.current !== generation) {
                    return;
                }

                setFavoriteSaved(isFavorite);
                setWatchlistSaved(isInWatchlist);
            })
            .catch((requestError) => {
                if (
                    !active ||
                    generationRef.current !== generation ||
                    requestError?.code === "REQUEST_ABORTED"
                ) {
                    return;
                }

                setFavoriteSaved(false);
                setWatchlistSaved(false);
                setError(toUserMessage(requestError));
            })
            .finally(() => {
                controllersRef.current.delete(controller);
            });

        return () => {
            active = false;
            for (const pendingController of controllersRef.current) {
                pendingController.abort();
            }
            controllersRef.current.clear();
        };
    }, [contentId, sessionStatus]);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            generationRef.current += 1;
            for (const controller of controllersRef.current) {
                controller.abort();
            }
            controllersRef.current.clear();
            activeActionsRef.current.clear();
        };
    }, []);

    /**
     * Reserva uma ação antes do próximo render, impedindo duplo clique.
     *
     * @param {"favorite" | "watchlist"} action Ação a reservar.
     * @returns {boolean} `true` quando a ação ficou reservada.
     */
    function startAction(action) {
        if (activeActionsRef.current.has(action)) {
            return false;
        }

        activeActionsRef.current.add(action);
        setBusyActions(new Set(activeActionsRef.current));
        return true;
    }

    /**
     * Liberta o estado ocupado de uma ação ainda montada.
     *
     * @param {"favorite" | "watchlist"} action Ação a libertar.
     * @returns {void}
     */
    function finishAction(action) {
        activeActionsRef.current.delete(action);
        if (mountedRef.current) {
            setBusyActions(new Set(activeActionsRef.current));
        }
    }

    /**
     * Alterna o favorito de forma otimista e reverte em falha.
     *
     * @returns {Promise<void>} Termina depois da API ou da reversão segura.
     */
    async function toggleFavorite() {
        setError("");
        setStatus("");

        if (sessionStatus !== "authenticated") {
            setError("Inicia sessão para gerir favoritos.");
            return;
        }

        if (!startAction("favorite")) {
            return;
        }

        const generation = generationRef.current;
        const previous = favoriteSaved;
        const next = !previous;
        const controller = trackedController();
        setFavoriteSaved(next);

        try {
            if (previous) {
                await libraryApi.removeFavorite(contentId, {
                    signal: controller.signal,
                });
            } else {
                await libraryApi.addFavorite(contentId, {
                    signal: controller.signal,
                });
            }

            if (mountedRef.current && generationRef.current === generation) {
                setStatus(
                    next
                        ? "Adicionado aos favoritos."
                        : "Removido dos favoritos.",
                );
            }
        } catch (requestError) {
            if (
                mountedRef.current &&
                generationRef.current === generation &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setFavoriteSaved(previous);
                setError(toUserMessage(requestError));
            }
        } finally {
            controllersRef.current.delete(controller);
            finishAction("favorite");
        }
    }

    /**
     * Alterna a lista para ver mais tarde de forma otimista e reversível.
     *
     * @returns {Promise<void>} Termina depois da API ou da reversão segura.
     */
    async function toggleWatchlist() {
        setError("");
        setStatus("");

        if (sessionStatus !== "authenticated") {
            setError("Inicia sessão para gerir a lista para ver mais tarde.");
            return;
        }

        if (!startAction("watchlist")) {
            return;
        }

        const generation = generationRef.current;
        const previous = watchlistSaved;
        const next = !previous;
        const controller = trackedController();
        setWatchlistSaved(next);

        try {
            if (previous) {
                await libraryApi.removeWatchlist(contentId, {
                    signal: controller.signal,
                });
            } else {
                await libraryApi.addWatchlist(contentId, {
                    signal: controller.signal,
                });
            }

            if (mountedRef.current && generationRef.current === generation) {
                setStatus(
                    next
                        ? "Adicionado à lista para ver mais tarde."
                        : "Removido da lista para ver mais tarde.",
                );
            }
        } catch (requestError) {
            if (
                mountedRef.current &&
                generationRef.current === generation &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setWatchlistSaved(previous);
                setError(toUserMessage(requestError));
            }
        } finally {
            controllersRef.current.delete(controller);
            finishAction("watchlist");
        }
    }

    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    const className = variant === "hero"
        ? "library-actions library-actions-hero"
        : "library-actions";

    if (sessionStatus === "loading") {
        return (
            <section className={className} aria-label="Biblioteca pessoal">
                <p role="status">A confirmar sessão...</p>
            </section>
        );
    }

    if (sessionStatus !== "authenticated") {
        return (
            <section className={className} aria-label="Biblioteca pessoal">
                {variant === "hero" ? null : (
                    <p>Entra para guardar este título na tua biblioteca.</p>
                )}
                <Link className="button-link" to={buildLoginRedirectPath(returnTo)}>
                    {variant === "hero" ? "Guardar na biblioteca" : "Entrar para guardar"}
                </Link>
            </section>
        );
    }

    return (
        <section className={className} aria-label="Biblioteca pessoal">
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <button
                type="button"
                disabled={busyActions.has("favorite")}
                onClick={toggleFavorite}
            >
                {busyActions.has("favorite")
                    ? "A guardar favorito..."
                    : favoriteSaved
                      ? "Remover dos favoritos"
                      : "Adicionar aos favoritos"}
            </button>
            <button
                type="button"
                disabled={busyActions.has("watchlist")}
                onClick={toggleWatchlist}
            >
                {busyActions.has("watchlist")
                    ? "A guardar lista..."
                    : watchlistSaved
                      ? "Remover da lista para ver mais tarde"
                      : "Adicionar à lista para ver mais tarde"}
            </button>
        </section>
    );
}
