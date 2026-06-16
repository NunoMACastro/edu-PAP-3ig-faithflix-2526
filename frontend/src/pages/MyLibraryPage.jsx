/**
 * @file Ficheiro `real_dev/frontend/src/pages/MyLibraryPage.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { libraryApi } from "../services/api/libraryApi.js";

/**
 * Documenta `ContentList`, mantendo explícita a responsabilidade desta função no módulo.
 * @returns {JSX.Element} Resultado devolvido por `ContentList`.
 */
function ContentList({ title, items }) {
    return (
        <section>
            <h2>{title}</h2>
            {items.length === 0 ? (
                <p>Sem itens.</p>
            ) : (
                <div className="content-row">
                    {items.map((item) => (
                        <article className="content-tile" key={`${title}-${item.id}`}>
                            {item.posterUrl ? <img src={item.posterUrl} alt="" /> : null}
                            <h3>{item.title}</h3>
                            <Link
                                className="button-link"
                                to={`/catalogo/${item.slug}`}
                            >
                                Ver detalhe
                            </Link>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

/**
 * Página da biblioteca pessoal para favoritos, watchlist e histórico.
 *
 * @returns {JSX.Element} Página da minha biblioteca.
 */
export function MyLibraryPage() {
    const [favorites, setFavorites] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
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
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="page-section" data-testid="my-library">
            <p className="section-kicker">Biblioteca</p>
            <h1>Biblioteca</h1>
            {loading ? <p>A carregar biblioteca...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            <ContentList title="Favoritos" items={favorites} />
            <ContentList title="Watchlist" items={watchlist} />
            <ContentList title="Historico" items={history} />
        </section>
    );
}
