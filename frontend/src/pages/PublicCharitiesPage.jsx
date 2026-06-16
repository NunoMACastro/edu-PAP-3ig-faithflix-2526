/**
 * Módulo da página pública de associações apoiadas.
 *
 * Apresenta apenas dados públicos devolvidos pela API, evitando expor contactos
 * internos ou regras administrativas ao visitante.
 */
import { useEffect, useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página pública com associações apoiadas pelo FaithFlix.
 *
 * @returns {JSX.Element} Lista pública sem contactos internos.
 */
export function PublicCharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Carrega associações públicas e separa loading de estado vazio.
     *
     * @returns {Promise<void>}
     */
    async function loadCharities() {
      setLoading(true);
      setError("");
      try {
        const response = await charitiesApi.listPublicCharities();
        setCharities(response.charities);
      } catch (apiError) {
        setError(toUserMessage(apiError));
      } finally {
        setLoading(false);
      }
    }

    loadCharities();
  }, []);

  return (
    <main>
      <h1>Associações apoiadas</h1>
      {error && <p role="alert">{error}</p>}
      {loading && <p>A carregar associações...</p>}
      {!loading && charities.length === 0 && !error && <p>Ainda não existem associações públicas.</p>}
      {charities.map((charity) => (
        <article key={charity.id}>
          <h2>{charity.name}</h2>
          <p>{charity.mission}</p>
          {charity.websiteUrl && <a href={charity.websiteUrl} target="_blank" rel="noreferrer">Website</a>}
        </article>
      ))}
    </main>
  );
}