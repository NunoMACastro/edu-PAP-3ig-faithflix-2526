/**
 * @file Dashboard administrativo da pool solidária.
 *
 * Apresenta os últimos meses de distribuição persistidos pelo backend, sem
 * recalcular totais no navegador.
 */

import { useEffect, useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Mostra totais mensais agregados da pool.
 *
 * @returns {JSX.Element} Dashboard administrativo da pool solidária.
 */
export function AdminPoolDashboardPage() {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    charitiesApi
      .getPoolDashboard()
      .then((response) => setMonths(response.months))
      .catch((requestError) => setError(toUserMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <h1>Dashboard da pool solidária</h1>
      {loading && <p>A carregar dashboard...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && months.length === 0 && <p>Ainda não existem distribuições.</p>}
      {months.map((month) => (
        <article key={month.month}>
          <h2>{month.month}</h2>
          <p>Total: {(month.totalPoolCents / 100).toFixed(2)} EUR</p>
          <p>Associações: {month.charitiesCount}</p>
          <p>Estado: {month.status}</p>
        </article>
      ))}
    </main>
  );
}
