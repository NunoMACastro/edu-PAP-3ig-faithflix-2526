import { useEffect, useState } from "react";
import { commentsApi } from "../../services/api/commentsApi.js";

export function CommentsPanel({ contentId }) {
  const [items, setItems] = useState([]);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");

    commentsApi.list(contentId)
      .then((response) => {
        if (!active) return;
        setItems(response.items);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setMessage("Nao foi possivel carregar comentarios.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [contentId]);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setStatus("saving");

    try {
      const response = await commentsApi.create(contentId, body);
      setBody("");
      setStatus("success");

      if (response.status === "visible") {
        const refreshed = await commentsApi.list(contentId);
        setItems(refreshed.items);
        setMessage("Comentario publicado.");
      } else {
        setMessage("Comentario recebido e em revisao.");
      }
    } catch {
      setStatus("error");
      setMessage("Confirma o texto e tenta novamente com sessao iniciada.");
    }
  }

  return (
    <section className="comments-panel" aria-label="Comentarios">
      <h2>Comentarios</h2>

      <form onSubmit={submit}>
        <label htmlFor="comment-body">Comentario curto</label>
        <textarea
          id="comment-body"
          minLength={3}
          maxLength={280}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <button type="submit" disabled={status === "saving" || body.trim().length < 3}>
          Publicar
        </button>
      </form>

      {message && <p role={status === "error" ? "alert" : "status"}>{message}</p>}
      {status === "loading" && <p>A carregar comentarios...</p>}
      {items.length === 0 && status === "success" && <p>Ainda nao existem comentarios visiveis.</p>}

      <ul>
        {items.map((comment) => (
          <li key={comment.id}>
            <p>{comment.body}</p>
            <small>{new Date(comment.createdAt).toLocaleDateString("pt-PT")}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}