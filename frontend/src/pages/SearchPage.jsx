import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchApi } from "../services/api/searchApi.js";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formQuery, setFormQuery] = useState(searchParams.get("q") ?? "");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const query = searchParams.get("q") ?? "";

  useEffect(() => {
    if (query.trim().length < 2) {
      setResult(null);
      setStatus("idle");
      return;
    }

    let active = true;
    setStatus("loading");
    setError("");

    searchApi.search({ q: query })
      .then((response) => {
        if (!active) return;
        setResult(response);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setError("Nao foi possivel concluir a pesquisa.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [query]);

  function submit(event) {
    event.preventDefault();
    const trimmed = formQuery.trim();
    if (trimmed.length >= 2) setSearchParams({ q: trimmed });
  }

  return (
    <main className="search-page">
      <h1>Pesquisa</h1>

      <form onSubmit={submit} role="search">
        <label htmlFor="search-query">Pesquisar conteudos e temas</label>
        <input
          id="search-query"
          value={formQuery}
          minLength={2}
          maxLength={80}
          onChange={(event) => setFormQuery(event.target.value)}
        />
        <button type="submit">Pesquisar</button>
      </form>

      {status === "idle" && <p>Escreve pelo menos 2 caracteres para pesquisar.</p>}
      {status === "loading" && <p>A pesquisar...</p>}
      {error && <p role="alert">{error}</p>}
      {status === "success" && result.items.length === 0 && <p>Nao foram encontrados conteudos publicados.</p>}

      {result?.items.length > 0 && (
        <section aria-label="Resultados de pesquisa">
          <p>{result.total} resultado(s) para "{result.query}".</p>
          <ul className="content-grid">
            {result.items.map((item) => (
              <li key={item.id}>
                <article className="content-card">
                  {item.posterUrl && <img src={item.posterUrl} alt="" />}
                  <h2>{item.title}</h2>
                  <p>{item.synopsis}</p>
                  <p>{item.taxonomyNames.join(", ")}</p>
                  <Link to={`/catalogo/${item.slug}`}>Ver detalhe</Link>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}