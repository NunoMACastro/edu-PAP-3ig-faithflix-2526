import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { libraryApi } from "../services/api/libraryApi.js";

function ContentList({ title, items }) {
  return (
    <section>
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p>Sem itens.</p>
      ) : (
        <div className="content-row">
          {items.map((item) => (
            <article key={`${title}-${item.id}`}>
              <img src={item.posterUrl} alt="" />
              <h3>{item.title}</h3>
              <Link to={`/catalogo/${item.slug}`}>Ver detalhe</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function MyLibraryPage() {
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      libraryApi.listFavorites(),
      libraryApi.listWatchlist(),
      libraryApi.listHistory(),
    ])
      .then(([favoriteResponse, watchlistResponse, historyResponse]) => {
        setFavorites(favoriteResponse.items);
        setWatchlist(watchlistResponse.items);
        setHistory(historyResponse.items);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <main className="page-shell" data-testid="my-library">
      <h1>Biblioteca</h1>
      {error && <p role="alert">{error}</p>}
      <ContentList title="Favoritos" items={favorites} />
      <ContentList title="Watchlist" items={watchlist} />
      <ContentList title="Historico" items={history} />
    </main>
  );
}