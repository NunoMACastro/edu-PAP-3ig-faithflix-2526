import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { catalogApi } from "../services/api/catalogApi.js";

function formatDuration(seconds) {
  const minutes = Math.round(Number(seconds) / 60);
  return `${minutes} min`;
}

export function ContentDetailPage() {
  const { idOrSlug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    catalogApi.getDetail(idOrSlug)
      .then((response) => {
        if (active) setContent(response.content);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [idOrSlug]);

  if (loading) {
    return <main className="page-shell"><p>A carregar conteudo...</p></main>;
  }

  if (error || !content) {
    return (
      <main className="page-shell">
        <h1>Conteudo indisponivel</h1>
        <p>{error || "Conteudo nao encontrado."}</p>
      </main>
    );
  }

  return (
    <main className="page-shell" data-testid="content-detail">
      <img src={content.assets.backdropUrl || content.assets.posterUrl} alt="" />
      <p>{content.type}</p>
      <h1>{content.title}</h1>
      <p>{content.synopsis}</p>
      <dl>
        <dt>Duracao</dt>
        <dd>{formatDuration(content.durationSeconds)}</dd>
        <dt>Classificacao</dt>
        <dd>{content.ageRating}+</dd>
      </dl>
      <Link to={`/ver/${content.id}`}>Reproduzir</Link>
    </main>
  );
}