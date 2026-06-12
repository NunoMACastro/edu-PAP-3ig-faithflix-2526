import { useEffect, useState } from "react";
import { authApi } from "../../services/api/authApi.js";
import { commentsApi } from "../../services/api/commentsApi.js";

/**
 * Lists visible comments and lets authenticated users add short comments.
 *
 * @param {{ contentId: string }} props - Component props.
 * @param {string} props.contentId - Current published content id.
 * @returns {JSX.Element} Comments panel.
 */
export function CommentsPanel({ contentId }) {
    const [comments, setComments] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

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
