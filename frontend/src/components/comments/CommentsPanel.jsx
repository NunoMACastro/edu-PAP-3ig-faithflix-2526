/**
 * @file Ficheiro `real_dev/frontend/src/components/comments/CommentsPanel.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { authApi } from "../../services/api/authApi.js";
import { commentsApi } from "../../services/api/commentsApi.js";

/**
 * Lista comentários visíveis e permite a utilizadores autenticados adicionar comentários curtos.
 *
 * @param {{ contentId: string }} props - Propriedades do componente.
 * @param {string} props.contentId - Id do conteúdo publicado atual.
 * @returns {JSX.Element} Painel de comentários.
 */
export function CommentsPanel({ contentId }) {
    const [comments, setComments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    /**
     * Documenta `loadComments`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} active Valor recebido por `loadComments`.
     * @returns {Promise<unknown>} Resultado devolvido por `loadComments`.
     */
    async function loadComments(active = true) {
        setLoading(true);
        setError("");

        try {
            const [commentsResponse, sessionResponse] = await Promise.all([
                commentsApi.list(contentId),
                authApi.me().catch(() => ({ user: null })),
            ]);

            if (!active) {
                return;
            }

            setComments(commentsResponse.items);
            setCurrentUser(sessionResponse.user);
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

        setBody("");
        setStatus("");
        loadComments(active);

        return () => {
            active = false;
        };
    }, [contentId]);

    /**
     * Documenta `submitComment`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} event Valor recebido por `submitComment`.
     * @returns {Promise<unknown>} Resultado devolvido por `submitComment`.
     */
    async function submitComment(event) {
        event.preventDefault();
        setSubmitting(true);
        setStatus("");
        setError("");

        try {
            const response = await commentsApi.create(contentId, body);
            setBody("");
            setStatus(
                response.comment.status === "pending_review"
                    ? "Comentario guardado e pendente de revisao."
                    : "Comentario publicado.",
            );
            await loadComments();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    }

    /**
     * Documenta `removeComment`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} commentId Valor recebido por `removeComment`.
     * @returns {Promise<unknown>} Resultado devolvido por `removeComment`.
     */
    async function removeComment(commentId) {
        setStatus("");
        setError("");

        try {
            await commentsApi.remove(commentId);
            setStatus("Comentario removido.");
            await loadComments();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <section className="interaction-panel" aria-label="Comentarios">
            <div>
                <p className="section-kicker">Comunidade</p>
                <h2>Comentarios curtos</h2>
            </div>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form className="comment-form" onSubmit={submitComment}>
                <label htmlFor="comment-body">
                    Escrever comentario
                    <textarea
                        id="comment-body"
                        minLength={3}
                        maxLength={280}
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        placeholder="Partilha uma opiniao curta"
                    />
                </label>
                <button type="submit" disabled={submitting}>
                    {submitting ? "A guardar..." : "Publicar comentario"}
                </button>
            </form>
            {loading ? <p>A carregar comentarios...</p> : null}
            {!loading && comments.length === 0 ? (
                <p>Ainda nao existem comentarios visiveis.</p>
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
                            >
                                Remover
                            </button>
                        ) : null}
                    </article>
                ))}
            </div>
        </section>
    );
}
