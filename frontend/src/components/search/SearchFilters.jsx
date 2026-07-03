/**
 * @file Ficheiro `real_dev/frontend/src/components/search/SearchFilters.jsx` da implementação real_dev.
 */

import { catalogApi } from "../../services/api/catalogApi.js";
import { useEffect, useState } from "react";

const CONTENT_TYPES = [
    { value: "", label: "Todos os tipos" },
    { value: "movie", label: "Filmes" },
    { value: "series", label: "Séries" },
    { value: "episode", label: "Episódios" },
    { value: "documentary", label: "Documentários" },
];

const SORT_OPTIONS = [
    { value: "title", label: "Título" },
    { value: "recent", label: "Recentes" },
    { value: "rating", label: "Melhor avaliados" },
];

/**
 * Formulário de pesquisa com filtros e ordenação da MF3.
 *
 * @param {{ filters: Record<string, string>, onChange: Function, onSubmit: Function }} props - Propriedades do componente.
 * @returns {JSX.Element} Formulário de filtros de pesquisa.
 */
export function SearchFilters({ filters, onChange, onSubmit }) {
    const [taxonomies, setTaxonomies] = useState([]);

    useEffect(() => {
        let active = true;

        catalogApi
            .listTaxonomies()
            .then((response) => {
                if (active) {
                    setTaxonomies(response.items);
                }
            })
            .catch(() => {
                if (active) {
                    setTaxonomies([]);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    /**
     * Documenta `updateField`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} field Valor recebido por `updateField`.
     * @param {unknown} value Valor recebido por `updateField`.
     * @returns {unknown} Resultado devolvido por `updateField`.
     */
    function updateField(field, value) {
        onChange({ ...filters, [field]: value });
    }

    return (
        <form className="search-filters" onSubmit={onSubmit}>
            <label htmlFor="search-query">
                Pesquisa
                <input
                    id="search-query"
                    value={filters.query}
                    onChange={(event) =>
                        updateField("query", event.target.value)
                    }
                    placeholder="Ex.: fé, família, documentário"
                />
            </label>
            <label htmlFor="search-type">
                Tipo
                <select
                    id="search-type"
                    value={filters.type}
                    onChange={(event) => updateField("type", event.target.value)}
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
                    onChange={(event) => updateField("sort", event.target.value)}
                >
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit">Pesquisar</button>
        </form>
    );
}
