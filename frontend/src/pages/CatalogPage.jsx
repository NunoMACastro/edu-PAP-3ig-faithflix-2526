/**
 * @file Página pública de catálogo FaithFlix.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DiscoveryCarousel } from "../components/discovery/DiscoveryCarousel.jsx";
import { ContinueWatchingStrip } from "../components/playback/ContinueWatchingStrip.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { catalogApi } from "../services/api/catalogApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import { discoveryApi } from "../services/api/discoveryApi.js";
import { searchApi } from "../services/api/searchApi.js";
import {
    PUBLIC_CONTENT_TYPE_OPTIONS,
    formatContentType,
} from "../utils/contentTypeLabels.js";

const PAGE_SIZE = 12;
const DEFAULT_FILTERS = {
    query: "",
    type: "",
    taxonomyId: "",
    sort: "recent",
};
const SORT_OPTIONS = [
    { value: "recent", label: "Recentes" },
    { value: "title", label: "Título" },
    { value: "rating", label: "Melhor avaliados" },
];

/**
 * Converte duração técnica em texto curto.
 *
 * @param {number | string | undefined} seconds Duração em segundos.
 * @returns {string} Duração arredondada em minutos ou texto vazio.
 */
function formatDuration(seconds) {
    const minutes = Math.round(Number(seconds) / 60);
    return Number.isFinite(minutes) && minutes > 0 ? `${minutes} min` : "";
}

/**
 * Descreve a contagem de conteúdos respeitando singular e plural.
 *
 * @param {number} total Total devolvido pela API.
 * @returns {string} Texto de contagem para a página.
 */
function formatTotal(total) {
    return `${total} conteúdo${total === 1 ? "" : "s"}`;
}

/**
 * Normaliza itens vindos de catálogo ou pesquisa para o mesmo card visual.
 *
 * @param {Record<string, unknown>} content Conteúdo devolvido pela API.
 * @returns {Record<string, unknown>} Conteúdo normalizado para a UI.
 */
function normalizeCatalogItem(content) {
    return {
        ...content,
        assets: content.assets ?? { posterUrl: content.posterUrl ?? "" },
    };
}

/**
 * Junta metadados úteis do conteúdo sem inventar campos quando a API não os devolve.
 *
 * @param {Record<string, unknown>} content Conteúdo normalizado.
 * @returns {string} Metadados curtos do card.
 */
function buildCardMeta(content) {
    const metadata = [
        formatDuration(content.durationSeconds),
        content.ageRating !== undefined ? `${content.ageRating}+` : "",
        content.ratingAverage > 0 ? `Rating ${content.ratingAverage}` : "",
        ...(content.taxonomyNames ?? []),
    ].filter(Boolean);

    return metadata.join(" · ");
}

/**
 * Mostra conteúdos publicados e o bloco "continuar a ver".
 *
 * @returns {JSX.Element} Página de catálogo.
 */
export function CatalogPage() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [taxonomies, setTaxonomies] = useState([]);
    const [editorialCarousels, setEditorialCarousels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        /**
         * Carrega taxonomias e blocos editoriais sem bloquear a listagem principal.
         *
         * @returns {Promise<void>} Termina depois de atualizar filtros e carrosséis.
         */
        async function loadSupportData() {
            const [taxonomyResult, discoveryResult] = await Promise.allSettled([
                catalogApi.listTaxonomies(),
                discoveryApi.home(),
            ]);

            if (!active) {
                return;
            }

            setTaxonomies(
                taxonomyResult.status === "fulfilled"
                    ? taxonomyResult.value.items ?? []
                    : [],
            );
            setEditorialCarousels(
                discoveryResult.status === "fulfilled"
                    ? discoveryResult.value.carousels ?? []
                    : [],
            );
        }

        loadSupportData();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        const trimmedQuery = filters.query.trim();

        if (trimmedQuery.length === 1) {
            setItems([]);
            setTotal(0);
            setError("");
            setLoading(false);
            setLoadingMore(false);
            return () => {
                active = false;
            };
        }

        const timer = window.setTimeout(() => {
            /**
             * Carrega catálogo ou pesquisa mantendo a paginação no backend.
             *
             * @returns {Promise<void>} Termina depois de atualizar a grelha.
             */
            async function loadCatalog() {
                setError("");
                setLoading(page === 1);
                setLoadingMore(page > 1);

                try {
                    const commonParams = {
                        page,
                        limit: PAGE_SIZE,
                        type: filters.type,
                        taxonomyId: filters.taxonomyId,
                        sort: filters.sort,
                    };
                    const response =
                        trimmedQuery.length >= 2
                            ? await searchApi.search({
                                  ...commonParams,
                                  query: trimmedQuery,
                              })
                            : await catalogApi.listPublished(commonParams);
                    const nextItems = (response.items ?? []).map(
                        normalizeCatalogItem,
                    );

                    if (active) {
                        setTotal(response.total ?? nextItems.length);
                        setItems((currentItems) =>
                            page === 1
                                ? nextItems
                                : [...currentItems, ...nextItems],
                        );
                    }
                } catch (requestError) {
                    if (active) {
                        setError(toUserMessage(requestError));
                        if (page === 1) {
                            setItems([]);
                            setTotal(0);
                        }
                    }
                } finally {
                    if (active) {
                        setLoading(false);
                        setLoadingMore(false);
                    }
                }
            }

            loadCatalog();
        }, 220);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [filters, page]);

    const taxonomyNameById = useMemo(
        () =>
            new Map(
                taxonomies.map((taxonomy) => [taxonomy.id, taxonomy.name]),
            ),
        [taxonomies],
    );
    const hasVisibleFilter =
        filters.query.trim().length > 0 ||
        filters.type ||
        filters.taxonomyId ||
        filters.sort !== DEFAULT_FILTERS.sort;
    const hasAppliedFilter =
        filters.query.trim().length >= 2 ||
        filters.type ||
        filters.taxonomyId ||
        filters.sort !== DEFAULT_FILTERS.sort;
    const visibleEditorialCarousels = hasAppliedFilter
        ? []
        : editorialCarousels
              .filter((carousel) => (carousel.items ?? []).length > 0)
              .slice(0, 3);
    const activeFilterLabels = [
        filters.query.trim()
            ? `Pesquisa: ${filters.query.trim()}`
            : "",
        filters.type ? `Tipo: ${formatContentType(filters.type)}` : "",
        filters.taxonomyId
            ? `Tema: ${taxonomyNameById.get(filters.taxonomyId) ?? "Selecionado"}`
            : "",
        filters.sort !== DEFAULT_FILTERS.sort
            ? `Ordenação: ${
                  SORT_OPTIONS.find((option) => option.value === filters.sort)
                      ?.label ?? filters.sort
              }`
            : "",
    ].filter(Boolean);
    const queryTooShort = filters.query.trim().length === 1;
    const canLoadMore = !loading && !loadingMore && items.length < total;

    /**
     * Atualiza um filtro e reinicia a paginação.
     *
     * @param {string} field Nome do filtro.
     * @param {string} value Valor escolhido.
     * @returns {void}
     */
    function updateFilter(field, value) {
        setPage(1);
        setFilters((currentFilters) => ({
            ...currentFilters,
            [field]: value,
        }));
    }

    /**
     * Repõe a descoberta geral do catálogo.
     *
     * @returns {void}
     */
    function clearFilters() {
        setPage(1);
        setFilters(DEFAULT_FILTERS);
    }

    return (
        <section className="page-section">
            <section className="catalog-hero" aria-labelledby="catalog-title">
                <div className="catalog-hero-copy">
                    <p className="section-kicker">Catálogo</p>
                    <h1 id="catalog-title">Catálogo FaithFlix</h1>
                    <p>
                        Explora conteúdos publicados por formato, tema e
                        relevância editorial, com a mesma curadoria da página
                        inicial.
                    </p>
                    <div className="button-row">
                        <Link className="button-link" to="/pesquisa">
                            Pesquisa avançada
                        </Link>
                    </div>
                </div>
                <div className="catalog-hero-meta" aria-label="Resumo do catálogo">
                    <strong>
                        {loading && page === 1
                            ? "A carregar"
                            : formatTotal(total)}
                    </strong>
                    <span>
                        {hasAppliedFilter
                            ? "encontrados com os filtros atuais"
                            : "publicados e prontos a explorar"}
                    </span>
                </div>
            </section>

            <ContinueWatchingStrip />

            <form
                className="search-filters catalog-filters"
                onSubmit={(event) => event.preventDefault()}
            >
                <label htmlFor="catalog-query">
                    Pesquisa rápida
                    <input
                        id="catalog-query"
                        value={filters.query}
                        onChange={(event) =>
                            updateFilter("query", event.target.value)
                        }
                        placeholder="Ex.: família, fé, missão"
                    />
                </label>
                <label htmlFor="catalog-type">
                    Tipo
                    <select
                        id="catalog-type"
                        value={filters.type}
                        onChange={(event) =>
                            updateFilter("type", event.target.value)
                        }
                    >
                        <option value="">Todos os tipos</option>
                        {PUBLIC_CONTENT_TYPE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label htmlFor="catalog-taxonomy">
                    Tema
                    <select
                        id="catalog-taxonomy"
                        value={filters.taxonomyId}
                        onChange={(event) =>
                            updateFilter("taxonomyId", event.target.value)
                        }
                    >
                        <option value="">Todos os temas</option>
                        {taxonomies.map((taxonomy) => (
                            <option key={taxonomy.id} value={taxonomy.id}>
                                {taxonomy.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label htmlFor="catalog-sort">
                    Ordenar por
                    <select
                        id="catalog-sort"
                        value={filters.sort}
                        onChange={(event) =>
                            updateFilter("sort", event.target.value)
                        }
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    className="secondary-button"
                    disabled={!hasVisibleFilter}
                    onClick={clearFilters}
                    type="button"
                >
                    Limpar
                </button>
            </form>

            {activeFilterLabels.length > 0 ? (
                <div className="active-filter-list" aria-label="Filtros ativos">
                    {activeFilterLabels.map((label) => (
                        <span key={label}>{label}</span>
                    ))}
                </div>
            ) : null}

            {visibleEditorialCarousels.length > 0 ? (
                <section className="catalog-editorial" aria-label="Destaques editoriais">
                    <div className="catalog-section-header">
                        <div>
                            <p className="section-kicker">Destaques</p>
                            <h2>Escolhas para começar</h2>
                        </div>
                        <p>{formatTotal(total)} no catálogo completo</p>
                    </div>
                    {visibleEditorialCarousels.map((carousel) => (
                        <DiscoveryCarousel
                            key={carousel.id}
                            title={carousel.title}
                            items={carousel.items}
                        />
                    ))}
                </section>
            ) : null}

            <div className="catalog-section-header">
                <div>
                    <p className="section-kicker">Todos os conteúdos</p>
                    <h2>Explorar catálogo</h2>
                </div>
                <p>{queryTooShort ? "Pesquisa incompleta" : `${formatTotal(total)} encontrados`}</p>
            </div>

            {loading ? <p role="status">A carregar catálogo...</p> : null}
            {error ? (
                <EmptyState
                    title="Não foi possível carregar o catálogo"
                    description={error}
                    tone="error"
                />
            ) : null}
            {queryTooShort ? (
                <EmptyState
                    title="Escreve pelo menos 2 caracteres"
                    description="A pesquisa rápida começa a filtrar quando houver texto suficiente."
                />
            ) : null}
            {!loading && !error && !queryTooShort && items.length === 0 ? (
                <EmptyState
                    title={
                        hasAppliedFilter
                            ? "Sem conteúdos com estes filtros"
                            : "Ainda não existem conteúdos publicados"
                    }
                    description={
                        hasAppliedFilter
                            ? "Experimenta limpar os filtros ou escolher outro tipo, tema ou ordenação."
                            : "Volta a esta página depois de o catálogo público ser atualizado."
                    }
                >
                    {hasAppliedFilter ? (
                        <button type="button" onClick={clearFilters}>
                            Limpar filtros
                        </button>
                    ) : null}
                </EmptyState>
            ) : null}

            <section className="content-grid" aria-label="Conteúdos publicados">
                {items.map((content) => (
                    <ContentCard
                        key={content.id}
                        eyebrow={formatContentType(content.type)}
                        title={content.title}
                        description={content.synopsis}
                        imageUrl={content.assets?.posterUrl}
                        imageAlt={`Cartaz de ${content.title}`}
                        meta={buildCardMeta(content)}
                        to={`/catalogo/${content.slug}`}
                    />
                ))}
            </section>
            {canLoadMore ? (
                <div className="load-more-row">
                    <button
                        disabled={loadingMore}
                        onClick={() => setPage((currentPage) => currentPage + 1)}
                        type="button"
                    >
                        {loadingMore ? "A carregar..." : "Carregar mais"}
                    </button>
                </div>
            ) : null}
        </section>
    );
}
