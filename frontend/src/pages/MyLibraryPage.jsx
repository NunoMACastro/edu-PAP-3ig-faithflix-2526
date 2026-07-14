/**
 * @file Biblioteca pessoal paginada, cancelável e com estados independentes.
 */

import { useEffect, useState } from "react";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { toUserMessage } from "../services/api/apiErrors.js";
import { libraryApi } from "../services/api/libraryApi.js";

const PAGE_LIMIT = 12;

/**
 * Mostra uma lista pessoal paginada sem bloquear as restantes secções.
 *
 * @param {{ id: string, title: string, loadItems: Function }} props Propriedades da secção.
 * @param {string} props.id Identificador estável para títulos e acessibilidade.
 * @param {string} props.title Título visível.
 * @param {(pagination: {page: number, limit: number}, options: {signal: AbortSignal}) => Promise<object>} props.loadItems Pedido da lista.
 * @returns {JSX.Element} Secção paginada.
 */
function PaginatedLibrarySection({ id, title, loadItems }) {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setLoading(true);
        setError("");

        loadItems(
            { page, limit: PAGE_LIMIT },
            { signal: controller.signal },
        )
            .then((response) => {
                if (!active) return;
                setItems(response.items ?? []);
                setPagination({
                    page: response.page ?? page,
                    total: response.total ?? response.items?.length ?? 0,
                    totalPages: Math.max(response.totalPages ?? 1, 1),
                });
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setError(toUserMessage(requestError));
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [loadItems, page, reloadVersion]);

    return (
        <section aria-labelledby={`${id}-title`}>
            <h2 id={`${id}-title`}>{title}</h2>
            {loading ? <p role="status">A carregar {title.toLowerCase()}...</p> : null}
            {error ? (
                <EmptyState
                    title={`Não foi possível carregar ${title.toLowerCase()}`}
                    description={error}
                    tone="error"
                >
                    <button
                        type="button"
                        onClick={() => setReloadVersion((value) => value + 1)}
                    >
                        Tentar novamente
                    </button>
                </EmptyState>
            ) : null}
            {!loading && !error && items.length === 0 ? (
                <EmptyState
                    title={`${title} sem conteúdos`}
                    description="Usa o catálogo para adicionar conteúdos a esta secção."
                />
            ) : null}
            {!error && items.length > 0 ? (
                <div className="content-grid">
                    {items.map((item) => (
                        <ContentCard
                            key={`${id}-${item.id}`}
                            title={item.title}
                            imageUrl={item.posterUrl}
                            imageAlt={`Cartaz de ${item.title}`}
                            to={`/catalogo/${encodeURIComponent(item.slug || item.id)}`}
                        />
                    ))}
                </div>
            ) : null}
            {!error && pagination.totalPages > 1 ? (
                <nav className="pagination" aria-label={`Paginação de ${title}`}>
                    <button
                        type="button"
                        disabled={loading || page <= 1}
                        aria-label={`Página anterior de ${title}`}
                        onClick={() => setPage((value) => Math.max(1, value - 1))}
                    >
                        Anterior
                    </button>
                    <span>
                        Página {pagination.page} de {pagination.totalPages} ({pagination.total} conteúdos)
                    </span>
                    <button
                        type="button"
                        disabled={loading || page >= pagination.totalPages}
                        aria-label={`Página seguinte de ${title}`}
                        onClick={() =>
                            setPage((value) =>
                                Math.min(pagination.totalPages, value + 1),
                            )
                        }
                    >
                        Seguinte
                    </button>
                </nav>
            ) : null}
        </section>
    );
}

/**
 * Mostra favoritos, lista para ver mais tarde e histórico da sessão atual.
 *
 * @returns {JSX.Element} Página da biblioteca pessoal.
 */
export function MyLibraryPage() {
    return (
        <section className="page-section" data-testid="my-library">
            <p className="section-kicker">Biblioteca</p>
            <h1>A minha biblioteca</h1>
            <PaginatedLibrarySection
                id="favorites"
                title="Favoritos"
                loadItems={libraryApi.listFavorites}
            />
            <PaginatedLibrarySection
                id="watchlist"
                title="Para ver mais tarde"
                loadItems={libraryApi.listWatchlist}
            />
            <PaginatedLibrarySection
                id="history"
                title="Histórico"
                loadItems={libraryApi.listHistory}
            />
        </section>
    );
}
