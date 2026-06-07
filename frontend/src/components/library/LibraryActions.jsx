import { useEffect, useState } from "react";
import { libraryApi } from "../../services/api/libraryApi.js";

function hasCurrentContent(response, contentId) {
    return (response?.items ?? []).some((item) => item.id === contentId);
}

/**
 * Favorite and watchlist actions for a content detail page.
 *
 * @param {{ contentId: string }} props - Component props.
 * @param {string} props.contentId - Current content id.
 * @returns {JSX.Element} Library actions.
 */
export function LibraryActions({ contentId }) {
    const [favoriteSaved, setFavoriteSaved] = useState(false);
    const [watchlistSaved, setWatchlistSaved] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        setFavoriteSaved(false);
        setWatchlistSaved(false);
        setStatus("");
        setError("");

        Promise.all([libraryApi.listFavorites(), libraryApi.listWatchlist()])
            .then(([favoriteResponse, watchlistResponse]) => {
                if (!active) {
                    return;
                }

                setFavoriteSaved(hasCurrentContent(favoriteResponse, contentId));
                setWatchlistSaved(
                    hasCurrentContent(watchlistResponse, contentId),
                );
            })
            .catch(() => {
                if (!active) {
                    return;
                }

                setFavoriteSaved(false);
                setWatchlistSaved(false);
            });

        return () => {
            active = false;
        };
    }, [contentId]);

    async function toggleFavorite() {
        setError("");

        try {
            if (favoriteSaved) {
                await libraryApi.removeFavorite(contentId);
                setFavoriteSaved(false);
                setStatus("Removido dos favoritos.");
                return;
            }

            await libraryApi.addFavorite(contentId);
            setFavoriteSaved(true);
            setStatus("Adicionado aos favoritos.");
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    async function toggleWatchlist() {
        setError("");

        try {
            if (watchlistSaved) {
                await libraryApi.removeWatchlist(contentId);
                setWatchlistSaved(false);
                setStatus("Removido da watchlist.");
                return;
            }

            await libraryApi.addWatchlist(contentId);
            setWatchlistSaved(true);
            setStatus("Adicionado a watchlist.");
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <section className="library-actions" aria-label="Biblioteca pessoal">
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <button type="button" onClick={toggleFavorite}>
                {favoriteSaved
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"}
            </button>
            <button type="button" onClick={toggleWatchlist}>
                {watchlistSaved
                    ? "Remover da watchlist"
                    : "Adicionar a watchlist"}
            </button>
        </section>
    );
}
