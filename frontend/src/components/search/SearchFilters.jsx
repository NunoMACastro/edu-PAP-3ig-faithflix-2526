/**
 * @file Formulário controlado da pesquisa pública FaithFlix.
 */

import { useState } from "react";

const CONTENT_TYPES = [
    { value: "", label: "Todos os tipos" },
    { value: "movie", label: "Filmes" },
    { value: "series", label: "Séries" },
    { value: "documentary", label: "Documentários" },
];

const SORT_OPTIONS = [
    { value: "title", label: "Título" },
    { value: "recent", label: "Recentes" },
    { value: "rating", label: "Melhor avaliados" },
];

/**
 * Mostra a pesquisa principal e os filtros secundários controlados pela página.
 *
 * Em mobile, os filtros ficam recolhidos para preservar a prioridade da query;
 * em desktop, o CSS mantém o painel sempre exposto.
 *
 * @param {{ filters: Record<string, string>, taxonomies?: Record<string, unknown>[], taxonomyLoading?: boolean, taxonomyError?: string, onChange: Function, onSubmit: Function, onTaxonomyRetry?: Function }} props Propriedades do formulário.
 * @returns {JSX.Element} Formulário acessível de pesquisa.
 */
export function SearchFilters({
    filters,
    taxonomies = [],
    taxonomyLoading = false,
    taxonomyError = "",
    onChange,
    onSubmit,
    onTaxonomyRetry,
}) {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    /**
     * Propaga uma alteração sem mutar o estado recebido do componente pai.
     *
     * @param {string} field Nome do filtro.
     * @param {string} value Novo valor.
     * @returns {void}
     */
    function updateField(field, value) {
        onChange({ ...filters, [field]: value });
    }

    /**
     * Fecha os filtros mobile depois de confirmar a pesquisa.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Submissão do formulário.
     * @returns {void}
     */
    function handleSubmit(event) {
        setMobileFiltersOpen(false);
        onSubmit(event);
    }

    return (
        <form className="search-studio-form app-form app-form--editorial" onSubmit={handleSubmit}>
            <div className="search-primary-row">
                <label htmlFor="search-query">
                    <span>Pesquisa</span>
                    <input
                        id="search-query"
                        value={filters.query}
                        onChange={(event) =>
                            updateField("query", event.target.value)
                        }
                        placeholder="Ex.: fé, família, documentário"
                        minLength={2}
                        maxLength={80}
                        required
                    />
                </label>
                <button className="search-submit-button" type="submit">
                    Pesquisar
                </button>
            </div>

            <button
                className="search-filter-toggle secondary-button"
                type="button"
                aria-controls="search-secondary-filters"
                aria-expanded={mobileFiltersOpen}
                onClick={() => setMobileFiltersOpen((isOpen) => !isOpen)}
            >
                {mobileFiltersOpen ? "Ocultar filtros" : "Mostrar filtros"}
            </button>

            <div
                id="search-secondary-filters"
                className="search-secondary-filters"
                data-open={mobileFiltersOpen ? "true" : "false"}
            >
                <label htmlFor="search-type">
                    Tipo
                    <select
                        id="search-type"
                        value={filters.type}
                        onChange={(event) =>
                            updateField("type", event.target.value)
                        }
                    >
                        {CONTENT_TYPES.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                <label htmlFor="search-taxonomy">
                    Tema
                    <select
                        id="search-taxonomy"
                        disabled={taxonomyLoading}
                        value={filters.taxonomyId}
                        onChange={(event) =>
                            updateField("taxonomyId", event.target.value)
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
                <label htmlFor="search-sort">
                    Ordenar por
                    <select
                        id="search-sort"
                        value={filters.sort}
                        onChange={(event) =>
                            updateField("sort", event.target.value)
                        }
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                {taxonomyLoading ? (
                    <p className="search-taxonomy-status" role="status">
                        A carregar temas...
                    </p>
                ) : null}
                {taxonomyError ? (
                    <div className="search-taxonomy-error" role="alert">
                        <p>{taxonomyError}</p>
                        <button type="button" onClick={onTaxonomyRetry}>
                            Tentar carregar temas novamente
                        </button>
                    </div>
                ) : null}
            </div>
        </form>
    );
}
