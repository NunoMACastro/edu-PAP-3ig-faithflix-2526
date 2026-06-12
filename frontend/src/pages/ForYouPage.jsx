import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { recommendationsApi } from "../services/api/recommendationsApi.js";

function RecommendationGroup({ group }) {
  if (group.items.length === 0) return null;

  return (
    <section className="recommendation-group" aria-label={group.title}>
      <h2>{group.title}</h2>
      <ul className="content-grid">
        {group.items.map((item) => (
          <li key={item.id}>
            <article className="content-card">
              {item.posterUrl && <img src={item.posterUrl} alt="" />}
              <h3>{item.title}</h3>
              <p>{item.type}</p>
              <Link to={`/catalogo/${item.slug}`}>Ver detalhe</Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ForYouPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    recommendationsApi.getMine()
      .then((response) => {
        setData(response);
        setStatus("success");
      })
      .catch(() => {
        setError("Entra na tua conta para veres recomendacoes.");
        setStatus("error");
      });
  }, []);

  return (
    <main className="for-you-page">
      <h1>Para si</h1>
      {status === "loading" && <p>A carregar recomendacoes...</p>}
      {error && <p role="alert">{error}</p>}
      {data?.coldStart && <p>Como ainda ha poucos sinais, mostramos sugestoes gerais do catalogo.</p>}
      {data?.groups.map((group) => (
        <RecommendationGroup key={group.id} group={group} />
      ))}
      {data?.groups.every((group) => group.items.length === 0) && (
        <p>Ainda nao existem conteudos publicados suficientes para recomendar.</p>
      )}
    </main>
  );
}