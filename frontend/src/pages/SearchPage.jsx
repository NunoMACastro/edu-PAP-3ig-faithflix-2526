/**
 * @file Página pública de pesquisa e descoberta do FaithFlix.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CatalogPosterCard } from "../components/catalog/CatalogPosterCard.jsx";
import { SearchFilters } from "../components/search/SearchFilters.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { catalogApi } from "../services/api/catalogApi.js";
import { discoveryApi } from "../services/api/discoveryApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import { searchApi } from "../services/api/searchApi.js";
import { reportAnonymousMetric } from "../services/api/analyticsApi.js";
import { formatContentType } from "../utils/contentTypeLabels.js";
import { useSession } from "../context/SessionContext.jsx";

const INITIAL_FILTERS = {
    query: "",
    type: "",
    taxonomyId: "",
    sort: "title",
};

const SORT_LABELS = Object.freeze({
    title: "Título",
    recent: "Recentes",
    rating: "Melhor avaliados",
});

const PAGE_SIZE = 12;

/**
 * Converte os parâmetros partilháveis da rota num pedido seguro.
 *
 * @param {URLSearchParams} params Query string atual.
 * @returns {{ query: string, type: string, taxonomyId: string, sort: string, page: number, limit: number }} Estado normalizado.
 */
function filtersFromSearchParams(params) {
    const rawPage = Number(params.get("page") ?? 1);
    const sort = params.get("sort") ?? INITIAL_FILTERS.sort;

    return {
        query: params.get("q") ?? "",
        type: params.get("type") ?? "",
        taxonomyId: params.get("taxonomyId") ?? "",
        sort: ["title", "recent", "rating"].includes(sort)
            ? sort
            : INITIAL_FILTERS.sort,
        page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
        limit: PAGE_SIZE,
    };
}

/**
 * Serializa filtros submetidos, omitindo filtros opcionais vazios.
 *
 * @param {Record<string, string>} filters Estado do formulário.
 * @param {number} page Página pretendida.
 * @returns {URLSearchParams} Query string canónica.
 */
function toSearchParams(filters, page) {
    const params = new URLSearchParams();
    params.set("q", filters.query.trim());
    params.set("page", String(page));
    params.set("sort", filters.sort || INITIAL_FILTERS.sort);
    if (filters.type) params.set("type", filters.type);
    if (filters.taxonomyId) params.set("taxonomyId", filters.taxonomyId);
    return params;
}

/**
 * Constrói uma rota de detalhe a partir de um identificador não confiável.
 *
 * @param {Record<string, unknown>} content Resultado público da pesquisa.
 * @returns {string} Rota interna com o segmento codificado.
 */
function buildContentDetailPath(content) {
    const identifier = String(content?.slug || content?.id || "").trim();

    return identifier
        ? `/catalogo/${encodeURIComponent(identifier)}`
        : "/catalogo";
}

/**
 * Junta taxonomias e classificação numa única linha curta de decisão.
 *
 * @param {Record<string, unknown>} content Resultado de pesquisa.
 * @returns {string} Metadados compactos do card.
 */
function formatSearchMeta(content) {
    const rating = Number(content.ratingAverage);

    return [
        ...(content.taxonomyNames ?? []).slice(0, 2),
        Number.isFinite(rating) && rating > 0
            ? `Classificação ${rating.toLocaleString("pt-PT", {
                  maximumFractionDigits: 2,
              })}`
            : "",
    ]
        .filter(Boolean)
        .join(" · ");
}

/**
 * Devolve apenas os campos editáveis usados pelo formulário.
 *
 * @param {Record<string, unknown>} source Filtros vindos do URL ou formulário.
 * @returns {Record<string, string>} Filtros controlados.
 */
function editableFilters(source) {
    return {
        query: source.query ?? "",
        type: source.type ?? "",
        taxonomyId: source.taxonomyId ?? "",
        sort: source.sort ?? INITIAL_FILTERS.sort,
    };
}

/**
 * Permite pesquisar conteúdos publicados por texto, tipo e taxonomia.
 *
 * @returns {JSX.Element} Página de pesquisa.
 */
export function SearchPage() {
    const { user: sessionUser } = useSession();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParamsKey = searchParams.toString();
    const requestFilters = useMemo(
        () => filtersFromSearchParams(new URLSearchParams(searchParamsKey)),
        [searchParamsKey],
    );
    const [filters, setFilters] = useState(() =>
        editableFilters(requestFilters),
    );
    const [taxonomies, setTaxonomies] = useState([]);
    const [taxonomyLoading, setTaxonomyLoading] = useState(true);
    const [taxonomyError, setTaxonomyError] = useState("");
    const [taxonomyReloadVersion, setTaxonomyReloadVersion] = useState(0);
    const [recentItems, setRecentItems] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const hasValidQuery = requestFilters.query.trim().length >= 2;

    useEffect(() => {
        setFilters(editableFilters(requestFilters));
    }, [requestFilters]);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setTaxonomyLoading(true);
        setTaxonomyError("");

        catalogApi
            .listTaxonomies({ signal: controller.signal })
            .then((response) => {
                if (active) {
                    setTaxonomies(
                        Array.isArray(response.items) ? response.items : [],
                    );
                }
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setTaxonomies([]);
                    setTaxonomyError(toUserMessage(requestError));
                }
            })
            .finally(() => {
                if (active) setTaxonomyLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [taxonomyReloadVersion]);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setRecentItems([]);

        if (hasValidQuery) {
            return () => {
                active = false;
                controller.abort();
            };
        }

        discoveryApi
            .home({ signal: controller.signal })
            .then((response) => {
                if (!active) return;
                const recent = response.carousels?.find(
                    (carousel) => carousel.id === "recent",
                );
                setRecentItems((recent?.items ?? []).slice(0, 5));
            })
            .catch(() => {
                if (active) setRecentItems([]);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [hasValidQuery]);

    useEffect(() => {
        if (!hasValidQuery) {
            setResult(null);
            setError("");
            setLoading(false);
            return undefined;
        }

        const controller = new AbortController();
        let active = true;
        setLoading(true);
        setError("");

        searchApi
            .search(requestFilters, { signal: controller.signal })
            .then((response) => {
                if (active) setResult(response);
            })
            .catch((requestError) => {
                if (!active || requestError?.code === "REQUEST_ABORTED") return;
                setResult(null);
                setError(toUserMessage(requestError));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [hasValidQuery, reloadVersion, requestFilters]);

    const taxonomyNameById = useMemo(
        () => new Map(taxonomies.map((taxonomy) => [taxonomy.id, taxonomy.name])),
        [taxonomies],
    );
    const activeFilterLabels = [
        requestFilters.type
            ? {
                  field: "type",
                  label: `Tipo: ${formatContentType(requestFilters.type)}`,
              }
            : null,
        requestFilters.taxonomyId
            ? {
                  field: "taxonomyId",
                  label: `Tema: ${taxonomyNameById.get(requestFilters.taxonomyId) ?? "Selecionado"}`,
              }
            : null,
        requestFilters.sort !== INITIAL_FILTERS.sort
            ? {
                  field: "sort",
                  label: `Ordenação: ${SORT_LABELS[requestFilters.sort]}`,
              }
            : null,
    ].filter(Boolean);
    const items = result?.items ?? [];
    const totalPages = result
        ? Math.max(Math.ceil(result.total / result.limit), 1)
        : 1;

    /**
     * Confirma os filtros no URL e reinicia a paginação.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
     * @returns {void}
     */
    function submitSearch(event) {
        event.preventDefault();
        if (sessionUser) {
            reportAnonymousMetric("search_submit", {
                category: filters.type || "uncategorized",
            });
        }
        setSearchParams(toSearchParams(filters, 1));
    }

    /**
     * Inicia uma pesquisa imediata a partir de uma taxonomia pública.
     *
     * @param {Record<string, unknown>} taxonomy Tema selecionado.
     * @returns {void}
     */
    function searchByTaxonomy(taxonomy) {
        const nextFilters = {
            ...INITIAL_FILTERS,
            query: taxonomy.name,
            taxonomyId: taxonomy.id,
        };
        setFilters(nextFilters);
        if (sessionUser) {
            reportAnonymousMetric("search_submit", {
                category: "uncategorized",
            });
        }
        setSearchParams(toSearchParams(nextFilters, 1));
    }

    /**
     * Remove um filtro secundário, preserva a query e regressa à primeira página.
     *
     * @param {"type" | "taxonomyId" | "sort"} field Filtro a limpar.
     * @returns {void}
     */
    function removeFilter(field) {
        const nextFilters = {
            ...editableFilters(requestFilters),
            [field]: field === "sort" ? INITIAL_FILTERS.sort : "",
        };
        setFilters(nextFilters);
        setSearchParams(toSearchParams(nextFilters, 1));
    }

    /**
     * Limpa filtros secundários sem apagar a pesquisa atual.
     *
     * @returns {void}
     */
    function clearSecondaryFilters() {
        const nextFilters = {
            ...INITIAL_FILTERS,
            query: requestFilters.query,
        };
        setFilters(nextFilters);
        setSearchParams(toSearchParams(nextFilters, 1));
    }

    /**
     * Navega para outra página preservando query e filtros no URL.
     *
     * @param {number} page Página válida.
     * @returns {void}
     */
    function changePage(page) {
        setSearchParams(toSearchParams(requestFilters, page));
    }

    return (
        <section className="page-section search-page">
            <section className="search-hero" aria-labelledby="search-title">
                <div className="search-hero-copy">
                    <p className="section-kicker">Descoberta</p>
                    <h1 id="search-title">O que queres descobrir?</h1>
                    <p>
                        Pesquisa por título, tema, formato ou palavra-chave em
                        todo o catálogo FaithFlix.
                    </p>
                </div>
                <SearchFilters
                    filters={filters}
                    taxonomies={taxonomies}
                    taxonomyLoading={taxonomyLoading}
                    taxonomyError={taxonomyError}
                    onChange={setFilters}
                    onSubmit={submitSearch}
                    onTaxonomyRetry={() =>
                        setTaxonomyReloadVersion((value) => value + 1)
                    }
                />
            </section>

            {!hasValidQuery ? (
                <section className="search-start" aria-labelledby="search-start-title">
                    <div className="search-section-header">
                        <div>
                            <p className="section-kicker">Começar</p>
                            <h2 id="search-start-title">Explora por tema</h2>
                        </div>
                        <Link className="catalog-search-link" to="/catalogo">
                            Ver catálogo completo
                        </Link>
                    </div>
                    {taxonomies.length > 0 ? (
                        <div className="search-quick-topics" aria-label="Temas rápidos">
                            {taxonomies.slice(0, 6).map((taxonomy) => (
                                <button
                                    key={taxonomy.id}
                                    type="button"
                                    onClick={() => searchByTaxonomy(taxonomy)}
                                >
                                    {taxonomy.name}
                                </button>
                            ))}
                        </div>
                    ) : null}
                    {recentItems.length > 0 ? (
                        <section
                            className="search-recent-section"
                            aria-labelledby="search-recent-title"
                        >
                            <h2 id="search-recent-title">Adicionados recentemente</h2>
                            <div className="search-recent-rail">
                                {recentItems.map((content) => (
                                    <CatalogPosterCard
                                        key={content.id}
                                        eyebrow={formatContentType(content.type)}
                                        title={content.title}
                                        imageUrl={content.posterUrl}
                                        imageAlt={`Cartaz de ${content.title}`}
                                        to={buildContentDetailPath(content)}
                                    />
                                ))}
                            </div>
                        </section>
                    ) : null}
                </section>
            ) : null}

            {loading ? <p role="status">A pesquisar...</p> : null}
            {error ? (
                <EmptyState
                    title="Não foi possível pesquisar"
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

            {result ? (
                <section className="search-results" aria-labelledby="search-results-title">
                    <div className="search-section-header search-results-header">
                        <div>
                            <p className="section-kicker">Resultados</p>
                            <h2 id="search-results-title">
                                Resultados para «{result.query}»
                            </h2>
                        </div>
                        <p className="muted-text">
                            {result.total} conteúdo{result.total === 1 ? "" : "s"}
                        </p>
                    </div>

                    {activeFilterLabels.length > 0 ? (
                        <div className="search-active-filters" aria-label="Filtros ativos">
                            {activeFilterLabels.map((filter) => (
                                <button
                                    key={filter.field}
                                    type="button"
                                    aria-label={`Remover filtro ${filter.label}`}
                                    onClick={() => removeFilter(filter.field)}
                                >
                                    {filter.label}
                                    <span aria-hidden="true"> ×</span>
                                </button>
                            ))}
                            <button
                                className="search-clear-filters"
                                type="button"
                                onClick={clearSecondaryFilters}
                            >
                                Limpar filtros
                            </button>
                        </div>
                    ) : null}

                    {items.length === 0 ? (
                        <EmptyState
                            title="Sem resultados para a pesquisa"
                            description="Experimenta retirar filtros ou pesquisar por outro título, tema ou categoria."
                        >
                            <Link className="button-link" to="/catalogo">
                                Ver catálogo completo
                            </Link>
                            {taxonomies.slice(0, 3).map((taxonomy) => (
                                <button
                                    key={taxonomy.id}
                                    className="secondary-button"
                                    type="button"
                                    onClick={() => searchByTaxonomy(taxonomy)}
                                >
                                    Pesquisar {taxonomy.name}
                                </button>
                            ))}
                        </EmptyState>
                    ) : (
                        <section
                            className="catalog-poster-grid search-results-grid"
                            aria-label="Resultados da pesquisa"
                        >
                            {items.map((content) => (
                                <CatalogPosterCard
                                    key={content.id}
                                    eyebrow={formatContentType(content.type)}
                                    title={content.title}
                                    description={content.synopsis}
                                    imageUrl={content.posterUrl}
                                    imageAlt={`Cartaz de ${content.title}`}
                                    meta={formatSearchMeta(content)}
                                    to={buildContentDetailPath(content)}
                                />
                            ))}
                        </section>
                    )}

                    {result.total > 0 ? (
                        <nav
                            className="catalog-pagination"
                            aria-label="Paginação da pesquisa"
                        >
                            <button
                                type="button"
                                disabled={loading || result.page <= 1}
                                onClick={() => changePage(result.page - 1)}
                            >
                                Anterior
                            </button>
                            <span>
                                Página {result.page} de {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={loading || result.page >= totalPages}
                                onClick={() => changePage(result.page + 1)}
                            >
                                Seguinte
                            </button>
                        </nav>
                    ) : null}
                </section>
            ) : null}
        </section>
    );
}
