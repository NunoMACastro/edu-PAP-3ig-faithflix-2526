/**
 * @file Página de histórico privado de uma associação.
 *
 * Carrega histórico da pool para uma associação específica e expõe download CSV
 * protegido pelas mesmas regras de autorização do backend.
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Mostra histórico de distribuição para uma associação.
 *
 * @returns {JSX.Element} Página privada de histórico.
 */
export function CharityHistoryPage() {
  const { charityId } = useParams();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    charitiesApi
      .getCharityHistory(charityId)
      .then((response) => setHistory(response))
      .catch((requestError) => setError(toUserMessage(requestError)))
      .finally(() => setLoading(false));
  }, [charityId]);

  return (
    <main>
      <h1>Histórico da associação</h1>
      {loading && <p>A carregar histórico...</p>}
      {error && <p role="alert">{error}</p>}
      {history && (
        <section>
          <p>Total recebido: {(history.totalCents / 100).toFixed(2)} EUR</p>
          <a href={charitiesApi.historyCsvUrl(charityId)}>Exportar CSV</a>
          {history.rows.map((row) => (
            <article key={row.month}>
              <h2>{row.month}</h2>
              <p>{(row.amountCents / 100).toFixed(2)} EUR</p>
              <p>Posição na rotação: {row.rotationPosition}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
