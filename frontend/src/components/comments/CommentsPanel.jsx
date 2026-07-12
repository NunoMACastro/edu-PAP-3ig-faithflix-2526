/**
 * @file Ficheiro `real_dev/frontend/src/components/comments/CommentsPanel.jsx` da implementação real_dev.
 */

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { commentsApi } from "../../services/api/commentsApi.js";
import { buildLoginRedirectPath } from "../../utils/authRedirect.js";

/**
 * Lista comentários visíveis e permite a utilizadores autenticados adicionar comentários curtos.
 *
 * @param {{ contentId: string }} props - Propriedades do componente.
 * @param {string} props.contentId - Id do conteúdo publicado atual.
 * @returns {JSX.Element} Painel de comentários.
 */
export function CommentsPanel({ contentId }) {
    const { status: sessionStatus } = useSession();
    const location = useLocation();
    const [comments, setComments] = useState([]);
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [pendingMutationKeys, setPendingMutationKeys] = useState(
        () => new Set(),
    );
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const mountedRef = useRef(false);
    const contextVersionRef = useRef(0);
    const readControllerRef = useRef(null);
    const mutationQueueRef = useRef(null);

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
     * Confirma que a fila serial ainda pertence ao contexto visível.
     *
     * @param {Record<string, unknown>} queue Fila capturada pela mutação.
     * @returns {boolean} `true` quando a fila ainda é a fila ativa.
     */
    function isCurrentQueue(queue) {
        return (
            mountedRef.current &&
            mutationQueueRef.current === queue &&
            contextVersionRef.current === queue.contextVersion
        );
    }

    /**
     * Carrega comentários visíveis de forma cancelável e autoritativa.
     *
     * @param {{ targetContentId: string, contextVersion: number, controller: AbortController, clearError?: boolean }} input Contexto imutável do pedido.
     * @returns {Promise<boolean>} Indica se a lista devolvida foi aplicada.
     */
    async function loadComments({
        targetContentId,
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
            const commentsResponse = await commentsApi.list(targetContentId, {
                signal: controller.signal,
            });

            if (!isCurrentRequest(contextVersion, controller)) {
                return false;
            }

            setComments(commentsResponse.items);
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
            mutationQueueRef.current?.controller?.abort();
        };
    }, []);

    useEffect(() => {
        const previousQueue = mutationQueueRef.current;
        previousQueue?.controller?.abort();
        readControllerRef.current?.abort();

        const contextVersion = contextVersionRef.current + 1;
        contextVersionRef.current = contextVersion;
        const queue = {
            contextVersion,
            controller: null,
            pendingKeys: new Set(),
            tail: Promise.resolve(),
        };
        mutationQueueRef.current = queue;
        const controller = new AbortController();

        setComments([]);
        setBody("");
        setStatus("");
        setError("");
        setPendingMutationKeys(new Set());
        void loadComments({
            targetContentId: contentId,
            contextVersion,
            controller,
        });

        return () => {
            controller.abort();
            queue.controller?.abort();
        };
    }, [contentId, sessionStatus]);

    /**
     * Enfileira uma mutação sem sobrepor escritas no mesmo painel.
     *
     * As chaves pendentes permitem mostrar busy state só no formulário ou linha
     * afetados. Cada escrita e o respetivo reload terminam antes da seguinte.
     *
     * @param {string} key Chave estável da ação ou linha.
     * @param {(signal: AbortSignal, queue: Record<string, unknown>) => Promise<string>} operation Escrita que devolve a mensagem de sucesso.
     * @returns {Promise<void>} Promessa da posição desta operação na fila.
     */
    function enqueueMutation(key, operation) {
        const queue = mutationQueueRef.current;
        if (!queue || !isCurrentQueue(queue) || queue.pendingKeys.has(key)) {
            return queue?.tail ?? Promise.resolve();
        }

        setStatus("");
        setError("");
        queue.pendingKeys.add(key);
        setPendingMutationKeys(new Set(queue.pendingKeys));

        const queuedOperation = queue.tail
            .catch(() => undefined)
            .then(async () => {
                if (!isCurrentQueue(queue)) {
                    return;
                }

                setStatus("");
                setError("");
                const controller = new AbortController();
                queue.controller = controller;
                readControllerRef.current?.abort();

                try {
                    const successMessage = await operation(
                        controller.signal,
                        queue,
                    );

                    if (!isCurrentRequest(queue.contextVersion, controller)) {
                        return;
                    }

                    const reloaded = await loadComments({
                        targetContentId: contentId,
                        contextVersion: queue.contextVersion,
                        controller,
                        clearError: false,
                    });

                    if (reloaded && isCurrentQueue(queue)) {
                        setStatus(successMessage);
                    }
                } catch (requestError) {
                    if (
                        isCurrentRequest(queue.contextVersion, controller) &&
                        requestError?.code !== "REQUEST_ABORTED"
                    ) {
                        setError(toUserMessage(requestError));
                    }
                } finally {
                    if (queue.controller === controller) {
                        queue.controller = null;
                    }
                }
            })
            .finally(() => {
                queue.pendingKeys.delete(key);
                if (isCurrentQueue(queue)) {
                    setPendingMutationKeys(new Set(queue.pendingKeys));
                }
            });

        queue.tail = queuedOperation;
        return queuedOperation;
    }

    /**
     * Submete um novo comentário para o conteúdo atual.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento de submissão do formulário.
     * @returns {Promise<void>} Termina depois de publicar ou apresentar erro.
     */
    async function submitComment(event) {
        event.preventDefault();
        if (sessionStatus !== "authenticated") {
            setError("Inicia sessão para publicares comentários.");
            return;
        }

        const submittedBody = body;
        await enqueueMutation("create", async (signal, queue) => {
            const response = await commentsApi.create(contentId, submittedBody, {
                signal,
            });

            if (isCurrentQueue(queue)) {
                setBody((currentBody) =>
                    currentBody === submittedBody ? "" : currentBody,
                );
            }

            return response.comment.status === "pending_review"
                ? "Comentário guardado e pendente de revisão."
                : "Comentário publicado.";
        });
    }

    /**
     * Remove um comentário visível no painel.
     *
     * @param {string} commentId Identificador do comentário a remover.
     * @returns {Promise<void>} Termina depois de remover ou apresentar erro.
     */
    async function removeComment(commentId) {
        setStatus("");
        setError("");

        if (sessionStatus !== "authenticated") {
            setError("Inicia sessão para removeres comentários.");
            return;
        }

        await enqueueMutation(`remove:${commentId}`, async (signal) => {
            await commentsApi.remove(commentId, { signal });
            return "Comentário removido.";
        });
    }

    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    const submitting = pendingMutationKeys.has("create");

    return (
        <section className="interaction-panel" aria-label="Comentários">
            <div>
                <p className="section-kicker">Comunidade</p>
                <h2>Comentários curtos</h2>
            </div>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            {sessionStatus === "authenticated" ? (
                <form className="comment-form app-form app-form--standard" onSubmit={submitComment}>
                    <label htmlFor="comment-body">
                        Escrever comentário
                        <textarea
                            id="comment-body"
                            minLength={3}
                            maxLength={280}
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            placeholder="Partilha uma opinião curta"
                        />
                    </label>
                    <button type="submit" disabled={submitting}>
                        {submitting
                            ? "A guardar..."
                            : "Publicar comentário"}
                    </button>
                </form>
            ) : (
                <div className="comment-form">
                    <p>
                        {sessionStatus === "loading"
                            ? "A confirmar sessão..."
                            : "Entra para publicares comentários."}
                    </p>
                    {sessionStatus !== "loading" ? (
                        <Link
                            className="button-link"
                            to={buildLoginRedirectPath(returnTo)}
                        >
                            Entrar para comentar
                        </Link>
                    ) : null}
                </div>
            )}
            {loading ? <p>A carregar comentários...</p> : null}
            {!loading && comments.length === 0 ? (
                <p>Ainda não existem comentários visíveis.</p>
            ) : null}
            <div className="comment-list">
                {comments.map((comment) => (
                    <article className="comment-item" key={comment.id}>
                        <p>{comment.body}</p>
                        <small>
                            {new Date(comment.createdAt).toLocaleDateString(
                                "pt-PT",
                            )}
                        </small>
                        {comment.canDelete ? (
                            <button
                                type="button"
                                onClick={() => removeComment(comment.id)}
                                disabled={pendingMutationKeys.has(
                                    `remove:${comment.id}`,
                                )}
                            >
                                {pendingMutationKeys.has(
                                    `remove:${comment.id}`,
                                )
                                    ? "A remover..."
                                    : "Remover"}
                            </button>
                        ) : null}
                    </article>
                ))}
            </div>
        </section>
    );
}
