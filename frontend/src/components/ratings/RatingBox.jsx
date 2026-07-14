/**
 * @file Ficheiro `real_dev/frontend/src/components/ratings/RatingBox.jsx` da implementação real_dev.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { ratingsApi } from "../../services/api/ratingsApi.js";
import { buildLoginRedirectPath } from "../../utils/authRedirect.js";

const RATING_VALUES = [1, 2, 3, 4, 5];

/**
 * Mostra classificação agregada e permite ao utilizador autenticado guardar a sua classificação.
 *
 * @param {{ contentId: string }} props - Propriedades do componente.
 * @param {string} props.contentId - Id do conteúdo publicado atual.
 * @returns {JSX.Element} Controlo de classificação.
 */
export function RatingBox({ contentId }) {
    const { status: sessionStatus } = useSession();
    const location = useLocation();
    const [summary, setSummary] = useState(null);
    const [myRating, setMyRating] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [mutation, setMutation] = useState(null);
    const mountedRef = useRef(false);
    const contextVersionRef = useRef(0);
    const readControllerRef = useRef(null);
    const mutationControllerRef = useRef(null);
    const mutationPendingRef = useRef(false);

    /**
     * Confirma que um resultado ainda pertence ao conteúdo e sessão atuais.
     *
     * @param {number} contextVersion Versão capturada antes do pedido.
     * @param {AbortController} controller Controller associado ao pedido.
     * @returns {boolean} `true` apenas enquanto o resultado pode atualizar a UI.
     */
    function isCurrentRequest(contextVersion, controller) {
        return (
            mountedRef.current &&
            contextVersionRef.current === contextVersion &&
            !controller.signal.aborted
        );
    }

    /**
     * Carrega, de forma cancelável, o resumo e a avaliação pessoal autoritativos.
     *
     * @param {{ targetContentId: string, targetSessionStatus: string, contextVersion: number, controller: AbortController, clearError?: boolean }} input Contexto imutável do pedido.
     * @returns {Promise<boolean>} Indica se o estado autoritativo foi aplicado.
     */
    async function loadRatingState({
        targetContentId,
        targetSessionStatus,
        contextVersion,
        controller,
        clearError = true,
    }) {
        readControllerRef.current = controller;
        setLoading(true);
        if (clearError) {
            setError("");
        }

        try {
            const [summaryResponse, meResponse] = await Promise.all([
                ratingsApi.getSummary(targetContentId, {
                    signal: controller.signal,
                }),
                targetSessionStatus === "authenticated"
                    ? ratingsApi.getMine(targetContentId, {
                          signal: controller.signal,
                      })
                    : Promise.resolve(null),
            ]);

            if (!isCurrentRequest(contextVersion, controller)) {
                return false;
            }

            setSummary(summaryResponse.summary);
            setMyRating(meResponse?.rating?.value ?? null);
            return true;
        } catch (requestError) {
            if (
                isCurrentRequest(contextVersion, controller) &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setError(toUserMessage(requestError));
            }
            return false;
        } finally {
            if (readControllerRef.current === controller) {
                readControllerRef.current = null;
            }
            if (isCurrentRequest(contextVersion, controller)) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            contextVersionRef.current += 1;
            readControllerRef.current?.abort();
            mutationControllerRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        const contextVersion = contextVersionRef.current + 1;
        contextVersionRef.current = contextVersion;
        readControllerRef.current?.abort();
        mutationControllerRef.current?.abort();
        mutationPendingRef.current = false;

        const controller = new AbortController();

        setSummary(null);
        setMyRating(null);
        setStatus("");
        setError("");
        setMutation(null);
        void loadRatingState({
            targetContentId: contentId,
            targetSessionStatus: sessionStatus,
            contextVersion,
            controller,
        });

        return () => {
            controller.abort();
            mutationControllerRef.current?.abort();
        };
    }, [contentId, sessionStatus]);

    /**
     * Executa uma escrita exclusiva e confirma o resultado com nova leitura.
     *
     * @param {{ type: "save", value: number } | { type: "remove" }} operation Operação pedida.
     * @returns {Promise<void>} Termina depois da confirmação autoritativa.
     */
    async function mutateRating(operation) {
        setStatus("");
        setError("");

        if (sessionStatus !== "authenticated") {
            setError(
                operation.type === "remove"
                    ? "Inicia sessão para removeres a tua classificação."
                    : "Inicia sessão para classificares este conteúdo.",
            );
            return;
        }

        if (mutationPendingRef.current) {
            return;
        }

        const targetContentId = contentId;
        const targetSessionStatus = sessionStatus;
        const contextVersion = contextVersionRef.current;
        const controller = new AbortController();
        readControllerRef.current?.abort();
        mutationControllerRef.current = controller;
        mutationPendingRef.current = true;
        setMutation(operation);

        try {
            if (operation.type === "remove") {
                await ratingsApi.remove(targetContentId, {
                    signal: controller.signal,
                });
            } else {
                await ratingsApi.save(targetContentId, operation.value, {
                    signal: controller.signal,
                });
            }

            if (!isCurrentRequest(contextVersion, controller)) {
                return;
            }

            const reloaded = await loadRatingState({
                targetContentId,
                targetSessionStatus,
                contextVersion,
                controller,
                clearError: false,
            });

            if (reloaded && isCurrentRequest(contextVersion, controller)) {
                setStatus(
                    operation.type === "remove"
                        ? "Classificação removida."
                        : "Classificação guardada.",
                );
            }
        } catch (requestError) {
            if (
                isCurrentRequest(contextVersion, controller) &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setError(toUserMessage(requestError));
            }
        } finally {
            if (mutationControllerRef.current === controller) {
                mutationControllerRef.current = null;
            }
            if (isCurrentRequest(contextVersion, controller)) {
                mutationPendingRef.current = false;
                setMutation(null);
            }
        }
    }

    /**
     * Guarda uma nova avaliação escolhida pelo utilizador.
     *
     * @param {number} value Valor selecionado na escala de classificação.
     * @returns {Promise<void>} Termina depois de guardar ou apresentar erro.
     */
    async function saveRating(value) {
        await mutateRating({ type: "save", value });
    }

    /**
     * Remove a avaliação pessoal do utilizador.
     *
     * @returns {Promise<void>} Termina depois de remover ou apresentar erro.
     */
    async function removeRating() {
        await mutateRating({ type: "remove" });
    }

    const returnTo = `${location.pathname}${location.search}${location.hash}`;

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
            {sessionStatus === "authenticated" ? (
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
                            disabled={mutation !== null}
                            aria-busy={
                                mutation?.type === "save" &&
                                mutation.value === value
                            }
                            aria-pressed={value === myRating}
                        >
                            {mutation?.type === "save" &&
                            mutation.value === value
                                ? `${value} - A guardar...`
                                : value}
                        </button>
                    ))}
                    {myRating ? (
                        <button
                            type="button"
                            onClick={removeRating}
                            disabled={mutation !== null}
                            aria-busy={mutation?.type === "remove"}
                        >
                            {mutation?.type === "remove"
                                ? "A remover..."
                                : "Remover"}
                        </button>
                    ) : null}
                </div>
            ) : (
                <div className="rating-actions">
                    <p>
                        {sessionStatus === "loading"
                            ? "A confirmar sessão..."
                            : "Entra para classificares este conteúdo."}
                    </p>
                    {sessionStatus !== "loading" ? (
                        <Link
                            className="button-link"
                            to={buildLoginRedirectPath(returnTo)}
                        >
                            Entrar para classificar
                        </Link>
                    ) : null}
                </div>
            )}
        </section>
    );
}
