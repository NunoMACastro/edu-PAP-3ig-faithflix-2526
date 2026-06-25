/**
 * @file Página de pesquisa unificada do FaithFlix.
 */

import { useState } from "react";
import { SearchFilters } from "../components/search/SearchFilters.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { searchApi } from "../services/api/searchApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const INITIAL_FILTERS = {
  query: "",
  type: "",
  taxonomyId: "",
  sort: "title",
};

/**
 * Permite pesquisar conteúdos publicados por texto, tipo e taxonomia.
 *
 * @returns {JSX.Element} Página de pesquisa.
 */
export function SearchPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Executa a pesquisa com os filtros atuais.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>} Termina quando a API responde ou falha.
   */
  async function submitSearch(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // A API de pesquisa continua a aplicar publicação e filtros; a UI só apresenta o resultado.
      const response = await searchApi.search({
        ...filters,
        page: 1,
        limit: 12,
      });
      setResult(response);
    } catch (requestError) {
      setResult(null);
      setError(toUserMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  const items = result?.items ?? [];

  return (
    <section className="page-section">
      <p className="section-kicker">Descoberta</p>
      <h1>Pesquisa</h1>
      <SearchFilters filters={filters} onChange={setFilters} onSubmit={submitSearch} />

      {loading ? <p role="status">A pesquisar...</p> : null}
      {error ? <EmptyState title="Não foi possível pesquisar" description={error} tone="error" /> : null}
      {result ? (
        <p className="status-message">
          {result.total} resultado{result.total === 1 ? "" : "s"} para "{result.query}".
        </p>
      ) : null}
      {result && items.length === 0 ? (
        <EmptyState
          title="Sem resultados para a pesquisa"
          description="Experimenta retirar filtros ou pesquisar por outro título, tema ou categoria."
        />
      ) : null}

      <section className="content-grid" aria-label="Resultados da pesquisa">
        {items.map((content) => (
          <ContentCard
            key={content.id}
            eyebrow={content.type}
            title={content.title}
            description={content.synopsis}
            imageUrl={content.posterUrl}
            imageAlt={`Cartaz de ${content.title}`}
            meta={content.taxonomyNames?.join(", ")}
            to={`/catalogo/${content.slug}`}
          />
        ))}
      </section>
    </section>
  );
}