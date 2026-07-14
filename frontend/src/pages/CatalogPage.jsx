/**
 * @file Página pública de catálogo FaithFlix.
 */

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CatalogPosterCard } from "../components/catalog/CatalogPosterCard.jsx";
import { ContinueWatchingStrip } from "../components/playback/ContinueWatchingStrip.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { catalogApi } from "../services/api/catalogApi.js";
import { discoveryApi } from "../services/api/discoveryApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import { recommendationsApi } from "../services/api/recommendationsApi.js";
import { reportAnonymousMetric } from "../services/api/analyticsApi.js";
import { formatContentType } from "../utils/contentTypeLabels.js";

const CATALOG_TYPE_LABELS = Object.freeze({
    movie: "Filmes",
    series: "Séries",
    documentary: "Documentários",
});

const CATALOG_FILTERS = Object.freeze([
    { value: "", label: "Todos" },
    { value: "movie", label: "Filmes" },
    { value: "series", label: "Séries" },
    { value: "documentary", label: "Documentários" },
]);

const PUBLIC_CATALOG_PAGE_LIMIT = 24;

const EMPTY_CATALOG = {
    items: [],
    page: 1,
    limit: PUBLIC_CATALOG_PAGE_LIMIT,
    total: 0,
};

/**
 * Devolve uma label plural para o filtro público do catálogo.
 *
 * @param {string} type Tipo técnico recebido na query string.
 * @returns {string} Label PT-PT para o filtro ativo.
 */
function formatCatalogTypeLabel(type) {
    return CATALOG_TYPE_LABELS[type] ?? formatContentType(type);
}

/**
 * Constrói a rota pública do catálogo preservando filtros conhecidos.
 *
 * @param {{ type?: string, page?: number }} input Query pública pretendida.
 * @returns {string} URL interna para a página de catálogo.
 */
function buildCatalogPath({ type = "", page = 1 } = {}) {
    const query = new URLSearchParams();

    if (type) {
        query.set("type", type);
    }

    if (page > 1) {
        query.set("page", String(page));
    }

    const suffix = query.toString();

    return suffix ? `/catalogo?${suffix}` : "/catalogo";
}

/**
 * Constrói uma rota de detalhe sem permitir que slugs ou IDs alterem o URL.
 *
 * @param {Record<string, unknown>} content Conteúdo público.
 * @returns {string} Rota interna codificada ou catálogo como fallback seguro.
 */
function buildContentDetailPath(content) {
    const identifier = String(content?.slug || content?.id || "").trim();

    return identifier
        ? `/catalogo/${encodeURIComponent(identifier)}`
        : "/catalogo";
}

/**
 * Converte o parâmetro de página num inteiro seguro para a UI pública.
 *
 * @param {string | null} value Valor recebido na query string.
 * @returns {number} Página positiva ou primeira página por defeito.
 */
function parseCatalogPage(value) {
    const page = Number(value ?? 1);

    return Number.isInteger(page) && page > 0 ? page : 1;
}

/**
 * Converte duração técnica em etiqueta curta para cards do catálogo.
 *
 * @param {number | string | undefined} seconds Duração total em segundos.
 * @returns {string} Etiqueta de duração ou string vazia.
 */
function formatDurationLabel(seconds) {
    const minutes = Math.round(Number(seconds) / 60);

    return Number.isFinite(minutes) && minutes > 0 ? `${minutes} min` : "";
}

/**
 * Converte classificação etária em etiqueta pública.
 *
 * @param {number | string | undefined} ageRating Classificação etária do conteúdo.
 * @returns {string} Etiqueta como `12+` ou string vazia.
 */
function formatAgeRatingLabel(ageRating) {
    if (ageRating === undefined || ageRating === null || ageRating === "") {
        return "";
    }

    return `${ageRating}+`;
}

/**
 * Formata a data pública de publicação no padrão português.
 *
 * @param {string | Date | null | undefined} publishedAt Data devolvida pela API.
 * @returns {string} Etiqueta de publicação ou string vazia.
 */
function formatPublishedDateLabel(publishedAt) {
    if (!publishedAt) {
        return "";
    }

    const date = new Date(publishedAt);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return `Publicado em ${date.toLocaleDateString("pt-PT")}`;
}

/**
 * Junta metadados úteis para decisão rápida sem inventar campos de backend.
 *
 * @param {Record<string, unknown>} content Conteúdo público do catálogo.
 * @returns {string} Metadados visíveis do card.
 */
function formatCatalogMeta(content) {
    return [
        formatDurationLabel(content.durationSeconds),
        formatAgeRatingLabel(content.ageRating),
        formatPublishedDateLabel(content.publishedAt),
    ]
        .filter(Boolean)
        .join(" · ");
}

/**
 * Calcula a frase de contagem para a página atual.
 *
 * @param {{ page: number, limit: number, total: number, items: unknown[] }} catalog Página atual.
 * @returns {string} Resumo de intervalo e total.
 */
function formatCatalogRange(catalog) {
    if (catalog.total === 0 || catalog.items.length === 0) {
        return "Sem conteúdos para mostrar nesta página.";
    }

    const start = (catalog.page - 1) * catalog.limit + 1;
    const end = start + catalog.items.length - 1;
    const totalLabel =
        catalog.total === 1 ? "1 conteúdo" : `${catalog.total} conteúdos`;

    return `${start}-${end} de ${totalLabel}`;
}

/**
 * Normaliza os diferentes cartões públicos usados como destaque do catálogo.
 *
 * @param {Record<string, unknown> | null | undefined} content Conteúdo vindo de catálogo ou discovery.
 * @returns {Record<string, unknown> | null} Conteúdo com URLs de imagem uniformes.
 */
function normalizeSpotlightContent(content) {
    if (!content) {
        return null;
    }

    return {
        ...content,
        posterUrl: content.posterUrl || content.assets?.posterUrl || "",
        backdropUrl: content.backdropUrl || content.assets?.backdropUrl || "",
    };
}

/**
 * Escolhe a primeira recomendação disponível preservando a prioridade do backend.
 *
 * O serviço coloca recomendações semânticas em primeiro lugar quando existem;
 * percorrer a resposta por ordem evita duplicar essa regra no browser.
 *
 * @param {Record<string, unknown> | null | undefined} response Resposta de recomendações.
 * @returns {{ item: Record<string, unknown>, group: Record<string, unknown>, personalized: boolean } | null} Seleção ou null.
 */
function selectRecommendation(response) {
    const group = response?.groups?.find(
        (candidate) => Array.isArray(candidate.items) && candidate.items.length > 0,
    );
    const item = group?.items?.[0];

    if (!item) {
        return null;
    }

    return {
        item,
        group,
        personalized:
            response.personalizationEnabled === true &&
            response.coldStart === false &&
            group.id !== "popular-start",
    };
}

/**
 * Obtém o primeiro conteúdo recente da resposta pública de discovery.
 *
 * @param {Record<string, unknown> | null | undefined} response Resposta da home pública.
 * @returns {Record<string, unknown> | null} Conteúdo recente ou null.
 */
function selectRecentContent(response) {
    return (
        response?.carousels?.find((carousel) => carousel.id === "recent")
            ?.items?.[0] ?? null
    );
}

/**
 * Mostra os filtros públicos por formato.
 *
 * @param {{ activeType: string }} props Props do componente.
 * @returns {JSX.Element} Lista de filtros navegáveis.
 */
function CatalogFilters({ activeType }) {
    return (
        <nav className="catalog-filters" aria-label="Filtrar catálogo por formato">
            {CATALOG_FILTERS.map((filter) => (
                <Link
                    aria-current={activeType === filter.value ? "page" : undefined}
                    className={
                        activeType === filter.value
                            ? "catalog-filter-chip catalog-filter-chip-active"
                            : "catalog-filter-chip"
                    }
                    key={filter.value || "all"}
                    to={buildCatalogPath({ type: filter.value })}
                >
                    {filter.label}
                </Link>
            ))}
        </nav>
    );
}

/**
 * Mostra um destaque cinematográfico recomendado ou editorial.
 *
 * @param {{ spotlight: { content: Record<string, unknown>, personalized?: boolean, reason?: string } | null, loading: boolean }} props Props do componente.
 * @returns {JSX.Element | null} Destaque público ou respetivo esqueleto.
 */
function CatalogSpotlight({ spotlight, loading }) {
    if (!spotlight && !loading) {
        return null;
    }

    if (!spotlight) {
        return (
            <section
                className="catalog-spotlight catalog-spotlight-loading"
                aria-label="A preparar destaque"
                aria-busy="true"
            >
                <p role="status">A preparar uma sugestão para explorar...</p>
            </section>
        );
    }

    const { content, personalized, reason } = spotlight;
    const backdropUrl = content.backdropUrl || content.posterUrl;
    const metadata = [
        content.type ? formatContentType(content.type) : "",
        formatDurationLabel(content.durationSeconds),
        formatAgeRatingLabel(content.ageRating),
    ].filter(Boolean);

    return (
        <section className="catalog-spotlight" aria-labelledby="catalog-spotlight-title">
            {backdropUrl ? (
                <img
                    className="catalog-spotlight-image"
                    src={backdropUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                />
            ) : null}
            <span className="catalog-spotlight-overlay" aria-hidden="true" />
            <div className="catalog-spotlight-copy">
                <p className="catalog-spotlight-kicker">
                    {personalized ? "Recomendado para ti" : "Em destaque"}
                </p>
                <h2 id="catalog-spotlight-title">{content.title}</h2>
                {content.synopsis ? <p>{content.synopsis}</p> : null}
                {metadata.length > 0 ? (
                    <p className="catalog-spotlight-meta">
                        {metadata.map((item) => (
                            <span key={item}>{item}</span>
                        ))}
                    </p>
                ) : null}
                {personalized && reason ? (
                    <p className="catalog-spotlight-reason">{reason}</p>
                ) : null}
                <Link
                    className="button-link"
                    to={buildContentDetailPath(content)}
                    aria-label={`Ver detalhe: ${content.title}`}
                >
                    Ver detalhe
                </Link>
            </div>
        </section>
    );
}

/**
 * Mostra controlos de paginação mantendo o filtro ativo.
 *
 * @param {{ activeType: string, currentPage: number, totalPages: number }} props Props do componente.
 * @returns {JSX.Element | null} Navegação paginada.
 */
function CatalogPagination({ activeType, currentPage, totalPages }) {
    if (totalPages <= 1 && currentPage <= 1) {
        return null;
    }

    const hasPrevious = currentPage > 1;
    const hasNext = currentPage < totalPages;

    return (
        <nav className="catalog-pagination" aria-label="Paginação do catálogo">
            {hasPrevious ? (
                <Link
                    className="button-link"
                    to={buildCatalogPath({
                        type: activeType,
                        page: currentPage - 1,
                    })}
                >
                    Página anterior
                </Link>
            ) : (
                <button type="button" disabled>
                    Página anterior
                </button>
            )}
            <span>
                Página {currentPage} de {Math.max(totalPages, 1)}
            </span>
            {hasNext ? (
                <Link
                    className="button-link"
                    to={buildCatalogPath({
                        type: activeType,
                        page: currentPage + 1,
                    })}
                >
                    Página seguinte
                </Link>
            ) : (
                <button type="button" disabled>
                    Página seguinte
                </button>
            )}
        </nav>
    );
}

/**
 * Mostra conteúdos publicados, filtros, paginação e blocos editoriais de apoio.
 *
 * @returns {JSX.Element} Página de catálogo.
 */
export function CatalogPage() {
    const { status: sessionStatus, user: sessionUser } = useSession();
    const analyticsEnabledForSession = Boolean(sessionUser);
    const [searchParams] = useSearchParams();
    const activeType = searchParams.get("type") ?? "";
    const currentPage = parseCatalogPage(searchParams.get("page"));
    const [catalog, setCatalog] = useState(EMPTY_CATALOG);
    const [spotlight, setSpotlight] = useState(null);
    const [spotlightLoading, setSpotlightLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const activeTypeLabel = activeType ? formatCatalogTypeLabel(activeType) : "";
    const totalPages = Math.ceil(catalog.total / catalog.limit);
    const hasFilter = Boolean(activeType);
    const hasCatalogItems = catalog.items.length > 0;

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setLoading(true);
        setError("");

        /**
         * Carrega apenas a página pública pedida para respeitar RNF09.
         *
         * @returns {Promise<void>} Termina depois de atualizar o estado visual.
         */
        async function loadCatalogPage() {
            try {
                const response = await catalogApi.listPublished({
                    type: activeType,
                    page: currentPage,
                    limit: PUBLIC_CATALOG_PAGE_LIMIT,
                }, {
                    signal: controller.signal,
                });

                if (active) {
                    setCatalog({
                        items: Array.isArray(response.items) ? response.items : [],
                        page: Number(response.page) || currentPage,
                        limit:
                            Number(response.limit) || PUBLIC_CATALOG_PAGE_LIMIT,
                        total: Number(response.total) || 0,
                    });
                    if (analyticsEnabledForSession) {
                        reportAnonymousMetric("catalog_view", {
                            category: activeType || "uncategorized",
                        });
                    }
                }
            } catch (requestError) {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setCatalog({
                        ...EMPTY_CATALOG,
                        page: currentPage,
                    });
                    setError(toUserMessage(requestError));
                }
            } finally {
                // A flag evita atualizar estado se o utilizador sair da página durante o pedido.
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadCatalogPage();

        return () => {
            active = false;
            controller.abort();
        };
    }, [
        activeType,
        analyticsEnabledForSession,
        currentPage,
        reloadVersion,
    ]);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        setSpotlight(null);

        if (hasFilter) {
            setSpotlightLoading(false);
            return () => {
                active = false;
                controller.abort();
            };
        }

        if (sessionStatus === "loading") {
            setSpotlightLoading(true);
            return () => {
                active = false;
                controller.abort();
            };
        }

        setSpotlightLoading(true);

        /**
         * Resolve o spotlight com prioridade para recomendações autenticadas e
         * fallback para o conteúdo mais recente da discovery pública.
         *
         * @returns {Promise<void>} Termina depois de escolher o destaque seguro.
         */
        async function loadSpotlight() {
            const discoveryPromise = discoveryApi.home({
                signal: controller.signal,
            });
            const recommendationPromise =
                sessionStatus === "authenticated"
                    ? recommendationsApi.mine({ signal: controller.signal })
                    : Promise.resolve(null);
            const [discoveryResult, recommendationResult] =
                await Promise.allSettled([
                    discoveryPromise,
                    recommendationPromise,
                ]);

            if (!active) {
                return;
            }

            const recentContent =
                discoveryResult.status === "fulfilled"
                    ? selectRecentContent(discoveryResult.value)
                    : null;
            const recommendation =
                recommendationResult.status === "fulfilled"
                    ? selectRecommendation(recommendationResult.value)
                    : null;

            if (recommendation) {
                const identifier = String(
                    recommendation.item.slug || recommendation.item.id || "",
                ).trim();

                if (identifier) {
                    try {
                        const detailResponse = await catalogApi.getDetail(
                            identifier,
                            { signal: controller.signal },
                        );

                        if (active && detailResponse.content) {
                            setSpotlight({
                                content: normalizeSpotlightContent(
                                    detailResponse.content,
                                ),
                                personalized: recommendation.personalized,
                                reason: recommendation.personalized
                                    ? recommendation.group.explanation?.message ?? ""
                                    : "",
                            });
                            return;
                        }
                    } catch {
                        // O destaque é suplementar; a listagem e o fallback continuam disponíveis.
                    }
                }
            }

            if (active) {
                setSpotlight(
                    recentContent
                        ? {
                              content: normalizeSpotlightContent(recentContent),
                              personalized: false,
                              reason: "",
                          }
                        : null,
                );
            }
        }

        loadSpotlight().finally(() => {
            if (active) {
                setSpotlightLoading(false);
            }
        });

        return () => {
            active = false;
            controller.abort();
        };
    }, [hasFilter, sessionStatus]);

    const resolvedSpotlight =
        spotlight ??
        (!spotlightLoading && !hasFilter && catalog.items[0]
            ? {
                  content: normalizeSpotlightContent(catalog.items[0]),
                  personalized: false,
                  reason: "",
              }
            : null);

    return (
        <section className="page-section catalog-page">
            <section className="catalog-hero" aria-labelledby="catalog-title">
                <div className="catalog-hero-copy">
                    <p className="section-kicker">Catálogo</p>
                    <h1 id="catalog-title">Catálogo FaithFlix</h1>
                    <p>
                        {activeTypeLabel
                            ? `Explora ${activeTypeLabel.toLowerCase()} publicados pela equipa editorial, com detalhe, reprodução e ações de biblioteca à distância de um clique.`
                            : "Descobre conteúdos cristãos organizados por formato, novidades e uma grelha pública paginada preparada para crescer sem perder clareza."}
                    </p>
                    <p className="catalog-hero-count" aria-label="Resumo do catálogo">
                        <strong>{loading ? "..." : catalog.total}</strong>
                        <span>
                            {catalog.total === 1
                                ? "conteúdo para descobrir"
                                : "conteúdos para descobrir"}
                        </span>
                    </p>
                </div>
            </section>

            <div className="catalog-toolbar">
                <CatalogFilters activeType={activeType} />
                <Link className="catalog-search-link" to="/pesquisa">
                    Pesquisa avançada
                </Link>
            </div>

            {!hasFilter ? (
                <CatalogSpotlight
                    spotlight={resolvedSpotlight}
                    loading={spotlightLoading}
                />
            ) : null}

            <ContinueWatchingStrip />

            <section aria-labelledby="catalog-list-title">
                <div className="catalog-section-header">
                    <div>
                        <p className="section-kicker">
                            {activeTypeLabel || "Todos os conteúdos"}
                        </p>
                        <h2 id="catalog-list-title">
                            {activeTypeLabel
                                ? `${activeTypeLabel} no catálogo`
                                : "Todos os conteúdos publicados"}
                        </h2>
                    </div>
                    {!loading && !error ? (
                        <p className="muted-text">{formatCatalogRange(catalog)}</p>
                    ) : null}
                </div>

                {loading ? <p role="status">A carregar catálogo...</p> : null}
                {error ? (
                    <EmptyState
                        title="Não foi possível carregar o catálogo"
                        description={error}
                        tone="error"
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setReloadVersion((value) => value + 1)
                            }
                        >
                            Tentar novamente
                        </button>
                    </EmptyState>
                ) : null}
                {!loading && !error && !hasCatalogItems ? (
                    <EmptyState
                        title={
                            hasFilter
                                ? "Sem conteúdos neste formato"
                                : currentPage > 1
                                  ? "Esta página não tem conteúdos"
                                  : "Ainda não existem conteúdos publicados"
                        }
                        description={
                            hasFilter
                                ? "Experimenta voltar ao catálogo completo ou escolher outro formato."
                                : currentPage > 1
                                  ? "Volta à primeira página para retomar a exploração."
                                  : "Volta a esta página depois de o catálogo público ser atualizado."
                        }
                    >
                        {hasFilter || currentPage > 1 ? (
                            <Link className="button-link" to="/catalogo">
                                Ver catálogo completo
                            </Link>
                        ) : null}
                    </EmptyState>
                ) : null}

                {hasCatalogItems ? (
                    <section
                        className="catalog-poster-grid"
                        aria-label="Conteúdos publicados"
                    >
                        {catalog.items.map((content) => (
                            <CatalogPosterCard
                                key={content.id}
                                eyebrow={formatContentType(content.type)}
                                title={content.title}
                                imageUrl={content.assets?.posterUrl}
                                imageAlt={`Cartaz de ${content.title}`}
                                meta={formatCatalogMeta(content)}
                                to={buildContentDetailPath(content)}
                            />
                        ))}
                    </section>
                ) : null}

                <CatalogPagination
                    activeType={activeType}
                    currentPage={currentPage}
                    totalPages={totalPages}
                />
            </section>
        </section>
    );
}
