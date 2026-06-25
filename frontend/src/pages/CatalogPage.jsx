/**
 * @file Página pública de catálogo FaithFlix.
 */

import { useEffect, useState } from "react";
import { ContinueWatchingStrip } from "../components/playback/ContinueWatchingStrip.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { catalogApi } from "../services/api/catalogApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Mostra conteúdos publicados e o bloco "continuar a ver".
 *
 * @returns {JSX.Element} Página de catálogo.
 */
export function CatalogPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    /**
     * Carrega o catálogo público sem alterar a regra backend de publicação.
     *
     * @returns {Promise<void>} Termina depois de atualizar o estado visual.
     */
    async function loadCatalog() {
      try {
        const response = await catalogApi.listPublished();

        if (active) {
          setItems(response.items);
        }
      } catch (requestError) {
        if (active) {
          setError(toUserMessage(requestError));
        }
      } finally {
        // A flag evita atualizar estado se o utilizador sair da página durante o pedido.
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="page-section">
      <p className="section-kicker">Catálogo</p>
      <h1>Catálogo FaithFlix</h1>
      <ContinueWatchingStrip />

      {loading ? <p role="status">A carregar catálogo...</p> : null}
      {error ? (
        <EmptyState title="Não foi possível carregar o catálogo" description={error} tone="error" />
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="Ainda não existem conteúdos publicados"
          description="Volta a esta página depois de o catálogo público ser atualizado."
        />
      ) : null}

      <section className="content-grid" aria-label="Conteúdos publicados">
        {items.map((content) => (
          <ContentCard
            key={content.id}
            eyebrow={content.type}
            title={content.title}
            description={content.synopsis}
            imageUrl={content.assets?.posterUrl}
            imageAlt={`Cartaz de ${content.title}`}
            to={`/catalogo/${content.slug}`}
          />
        ))}
      </section>
    </section>
  );
}