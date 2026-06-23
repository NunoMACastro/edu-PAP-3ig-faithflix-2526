/**
 * @file Página pública de associações apoiadas.
 *
 * Mostra apenas dados públicos das associações elegíveis para a pool solidária.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Lista associações públicas e dá acesso ao formulário de candidatura.
 *
 * @returns {JSX.Element} Página pública de associações.
 */
export function PublicCharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    charitiesApi
      .listPublicCharities()
      .then((response) => setCharities(response.charities))
      .catch((requestError) => setError(toUserMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page-section">
      <p className="section-kicker">Pool solidária</p>
      <h1>Associações apoiadas</h1>
      <div className="button-row">
        <Link className="button-link" to="/associacoes/candidatura">
          Candidatar associação
        </Link>
      </div>
      {loading ? <p>A carregar associações...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!loading && charities.length === 0 ? (
        <p>Ainda não existem associações públicas.</p>
      ) : null}
      <div className="card-grid">
        {charities.map((charity) => (
          <article className="content-card" key={charity.id}>
            <h2>{charity.name}</h2>
            <p>{charity.mission}</p>
            {charity.websiteUrl ? (
              <a href={charity.websiteUrl}>{charity.websiteUrl}</a>
            ) : null}
            <Link
              className="button-link"
              to={`/associacoes/${charity.id}/historico`}
            >
              Histórico privado
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
