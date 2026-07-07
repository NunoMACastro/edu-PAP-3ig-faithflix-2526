/**
 * @file Página da biblioteca pessoal do utilizador autenticado.
 */

import { useEffect, useState } from "react";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { libraryApi } from "../services/api/libraryApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Mostra uma lista de conteúdos da biblioteca pessoal.
 *
 * @param {{ title: string, items: Array<{ id: string, title: string, slug: string, posterUrl?: string }> }} props Propriedades da lista.
 * @param {string} props.title Título da secção.
 * @param {Array<{ id: string, title: string, slug: string, posterUrl?: string }>} props.items Conteúdos da lista.
 * @returns {JSX.Element} Secção de biblioteca.
 */
function LibrarySection({ title, items }) {
    return (
        <section>
            <h2>{title}</h2>
            {items.length === 0 ? (
                <EmptyState
                    title={`${title} sem conteúdos`}
                    description="Usa o catálogo para adicionar conteúdos a esta secção."
                />
            ) : (
                // Cada item vem das rotas autenticadas da biblioteca; a UI não aceita userId vindo do browser.
                <div className="content-grid">
                    {items.map((item) => (
                        <ContentCard
                            key={`${title}-${item.id}`}
                            title={item.title}
                            imageUrl={item.posterUrl}
                            imageAlt={`Cartaz de ${item.title}`}
                            to={`/catalogo/${item.slug}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

/**
 * Mostra favoritos, watchlist e histórico do utilizador autenticado.
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
        let active = true;

        /**
         * Carrega as três listas autenticadas da biblioteca pessoal.
         *
         * @returns {Promise<void>} Termina quando todos os pedidos terminarem.
         */
        async function loadLibrary() {
            try {
                const [favoriteResponse, watchlistResponse, historyResponse] = await Promise.all([
                    libraryApi.listFavorites(),
                    libraryApi.listWatchlist(),
                    libraryApi.listHistory(),
                ]);

                if (active) {
                    setFavorites(favoriteResponse.items);
                    setWatchlist(watchlistResponse.items);
                    setHistory(historyResponse.items);
                }
            } catch (requestError) {
                if (active) {
                    setError(toUserMessage(requestError));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadLibrary();

        return () => {
            active = false;
        };
    }, []);

    return (
        <section className="page-section" data-testid="my-library">
            <p className="section-kicker">Biblioteca</p>
            <h1>Biblioteca</h1>

            {loading ? <p role="status">A carregar biblioteca...</p> : null}
            {error ? <EmptyState title="Não foi possível carregar a biblioteca" description={error} tone="error" /> : null}

            {!loading && !error ? (
                <>
                    <LibrarySection title="Favoritos" items={favorites} />
                    <LibrarySection title="Watchlist" items={watchlist} />
                    <LibrarySection title="Histórico" items={history} />
                </>
            ) : null}
        </section>
    );
}
