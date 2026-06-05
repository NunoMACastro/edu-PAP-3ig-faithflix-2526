import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { catalogApi } from "../services/api/catalogApi.js";
import { ContinueWatchingStrip } from "../components/playback/ContinueWatchingStrip.jsx";

export function CatalogPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    catalogApi.listPublished()
      .then((response) => setItems(response.items))
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
   <main className="page-shell">
      <h1>Catalogo</h1>
      <ContinueWatchingStrip />
      <section className="content-grid" aria-label="Conteudos publicados">
        {items.map((content) => (
          <article key={content.id}>
            <img src={content.assets.posterUrl} alt="" />
            <h2>{content.title}</h2>
            <p>{content.synopsis}</p>
            <Link to={`/catalogo/${content.slug}`}>Ver detalhe</Link>
          </article>
        ))}
      </section>
    </main>
  );
}