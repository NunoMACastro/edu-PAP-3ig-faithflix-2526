/**
 * @file Ficheiro `real_dev/frontend/src/pages/SearchPage.jsx` da implementação real_dev.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { SearchFilters } from "../components/search/SearchFilters.jsx";
import { searchApi } from "../services/api/searchApi.js";

const INITIAL_FILTERS = {
    query: "",
    type: "",
    taxonomyId: "",
    sort: "title",
};

/**
 * Unified MF3 search page.
 *
 * @returns {JSX.Element} Página de pesquisa.
 */
export function SearchPage() {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /**
     * Documenta `submitSearch`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} event Valor recebido por `submitSearch`.
     * @returns {Promise<unknown>} Resultado devolvido por `submitSearch`.
     */
    async function submitSearch(event) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await searchApi.search({
                ...filters,
                page: 1,
                limit: 12,
            });
            setResult(response);
        } catch (requestError) {
            setResult(null);
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Descoberta</p>
            <h1>Pesquisa</h1>
            <SearchFilters
                filters={filters}
                onChange={setFilters}
                onSubmit={submitSearch}
            />
            {loading ? <p>A pesquisar...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {result ? (
                <p>
                    {result.total} resultados para "{result.query}".
                </p>
            ) : null}
            {result && result.items.length === 0 ? (
                <p>Nao foram encontrados conteudos publicados.</p>
            ) : null}
            <section className="content-grid" aria-label="Resultados">
                {(result?.items ?? []).map((content) => (
                    <article className="content-tile" key={content.id}>
                        {content.posterUrl ? (
                            <img src={content.posterUrl} alt="" />
                        ) : null}
                        <p className="content-card-eyebrow">{content.type}</p>
                        <h2>{content.title}</h2>
                        <p>{content.synopsis}</p>
                        {content.taxonomyNames.length > 0 ? (
                            <p>{content.taxonomyNames.join(", ")}</p>
                        ) : null}
                        <Link
                            className="button-link"
                            to={`/catalogo/${content.slug}`}
                        >
                            Ver detalhe
                        </Link>
                    </article>
                ))}
            </section>
        </section>
    );
}
