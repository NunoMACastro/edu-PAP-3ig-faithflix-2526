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
     * Carrega comentários e sessão atual para o painel.
     *
     * O parâmetro `active` evita atualizar estado depois de o componente desmontar
     * ou trocar de conteúdo durante o pedido.
     *
     * @param {boolean} active Indica se o resultado ainda pode atualizar o componente.
     * @returns {Promise<void>} Termina depois de sincronizar comentários e utilizador.
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
     * Submete um novo comentário para o conteúdo atual.
     *
     * A função previne o submit nativo, chama a API, limpa o campo e recarrega a
     * lista para mostrar o estado aprovado ou pendente.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento de submissão do formulário.
     * @returns {Promise<void>} Termina depois de publicar ou apresentar erro.
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
                    ? "Comentário guardado e pendente de revisão."
                    : "Comentário publicado.",
            );
            await loadComments();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSubmitting(false);
        }
    }

    /**
     * Remove um comentário visível no painel.
     *
     * Depois da remoção, recarrega a lista para refletir permissões e estado de
     * moderação calculados pelo backend.
     *
     * @param {string} commentId Identificador do comentário a remover.
     * @returns {Promise<void>} Termina depois de remover ou apresentar erro.
     */
    async function removeComment(commentId) {
        setStatus("");
        setError("");

        try {
            await commentsApi.remove(commentId);
            setStatus("Comentário removido.");
            await loadComments();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <section className="interaction-panel" aria-label="Comentários">
            <div>
                <p className="section-kicker">Comunidade</p>
                <h2>Comentários curtos</h2>
            </div>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form className="comment-form" onSubmit={submitComment}>
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
                    {submitting ? "A guardar..." : "Publicar comentário"}
                </button>
            </form>
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
