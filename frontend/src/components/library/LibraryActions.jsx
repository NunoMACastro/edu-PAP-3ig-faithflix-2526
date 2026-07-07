/**
 * @file Ficheiro `real_dev/frontend/src/components/library/LibraryActions.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { libraryApi } from "../../services/api/libraryApi.js";

/**
 * Verifica se a resposta de biblioteca contém o conteúdo atual.
 *
 * A função protege contra respostas vazias e permite reutilizar a mesma lógica
 * para favoritos e watchlist.
 *
 * @param {{ items?: Array<{ id?: string }> } | null | undefined} response Resposta da API de biblioteca.
 * @param {string} contentId Identificador do conteúdo atualmente aberto.
 * @returns {boolean} `true` quando o conteúdo está presente na lista.
 */
function hasCurrentContent(response, contentId) {
    return (response?.items ?? []).some((item) => item.id === contentId);
}

/**
 * Ações de favoritos e watchlist para a página de detalhe de conteúdo.
 *
 * @param {{ contentId: string }} props - Propriedades do componente.
 * @param {string} props.contentId - Id do conteúdo atual.
 * @returns {JSX.Element} Ações de biblioteca.
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

    /**
     * Alterna o conteúdo atual na lista de favoritos.
     *
     * A função escolhe entre adicionar e remover conforme o estado local e depois
     * mostra feedback textual ao utilizador.
     *
     * @returns {Promise<void>} Termina depois da chamada à API ou de reportar erro.
     */
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

    /**
     * Alterna o conteúdo atual na watchlist.
     *
     * Usa o estado local para decidir se deve criar ou remover a entrada e mantém
     * a mensagem de feedback alinhada com a ação concluída.
     *
     * @returns {Promise<void>} Termina depois da chamada à API ou de reportar erro.
     */
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
