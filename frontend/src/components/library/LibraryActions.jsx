import { useState } from "react";
import { libraryApi } from "../../services/api/libraryApi.js";

export function LibraryActions({ contentId }) {
  const [favoriteSaved, setFavoriteSaved] = useState(false);
  const [watchlistSaved, setWatchlistSaved] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function toggleFavorite() {
    setError("");
    try {
      if (favoriteSaved) {
        await libraryApi.removeFavorite(contentId);
        setFavoriteSaved(false);
        setStatus("Removido dos favoritos.");
      } else {
        await libraryApi.addFavorite(contentId);
        setFavoriteSaved(true);
        setStatus("Adicionado aos favoritos.");
      }
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
      } else {
        await libraryApi.addWatchlist(contentId);
        setWatchlistSaved(true);
        setStatus("Adicionado a watchlist.");
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <section aria-label="Biblioteca pessoal">
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      <button type="button" onClick={toggleFavorite}>
        {favoriteSaved ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      </button>
      <button type="button" onClick={toggleWatchlist}>
        {watchlistSaved ? "Remover da watchlist" : "Adicionar a watchlist"}
      </button>
    </section>
  );
}