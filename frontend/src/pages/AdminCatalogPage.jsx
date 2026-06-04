import { useEffect, useState } from "react";
import { catalogApi } from "../services/api/catalogApi.js";

const EMPTY_FORM = {
  title: "",
  synopsis: "",
  type: "movie",
  durationSeconds: 120,
  ageRating: 6,
  assets: { posterUrl: "", backdropUrl: "" },
  media: { playbackUrl: "/media/piloto.mp4" },
};

export function AdminCatalogPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [revisionsByContent, setRevisionsByContent] = useState({});
  const [error, setError] = useState("");

  async function loadItems() {
    const response = await catalogApi.listAdmin();
    setItems(response.items);
  }

  useEffect(() => {
    loadItems().catch((requestError) => setError(requestError.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await catalogApi.createContent(form);
      setForm(EMPTY_FORM);
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function changeStatus(contentId, status) {
    setError("");

    try {
      await catalogApi.updateStatus(contentId, status);
      await loadItems();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function loadRevisions(contentId) {
    setError("");

    try {
      const response = await catalogApi.listRevisions(contentId);
      setRevisionsByContent((current) => ({ ...current, [contentId]: response.items }));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function revertRevision(contentId, revisionId) {
    setError("");

    try {
      await catalogApi.revertRevision(contentId, revisionId);
      await loadItems();
      await loadRevisions(contentId);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="page-shell">
      <h1>Gestao de catalogo</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input aria-label="Titulo" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <textarea aria-label="Sinopse" value={form.synopsis} onChange={(event) => setForm({ ...form, synopsis: event.target.value })} />
        <button type="submit">Criar conteudo</button>
      </form>
      <section>
        {items.map((content) => (
          <article key={content.id}>
            <h2>{content.title}</h2>
            <p>{content.status}</p>
            <button type="button" onClick={() => changeStatus(content.id, "published")}>Publicar</button>
            <button type="button" onClick={() => changeStatus(content.id, "archived")}>Arquivar</button>
            <button type="button" onClick={() => loadRevisions(content.id)}>Ver revisoes</button>
            <ul>
              {(revisionsByContent[content.id] ?? []).map((revision) => (
                <li key={revision.id}>
                  <span>{revision.action} - {new Date(revision.createdAt).toLocaleString("pt-PT")}</span>
                  <button type="button" onClick={() => revertRevision(content.id, revision.id)}>Reverter</button>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}