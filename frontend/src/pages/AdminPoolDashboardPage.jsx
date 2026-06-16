/**
 * Módulo da página administrativa de dashboard da pool.
 *
 * Mostra meses já distribuídos a partir do backend para que totais e rotação
 * sejam auditados sem cálculos paralelos no frontend.
 */
import { useEffect, useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Painel administrativo com resumo dos ultimos meses da pool.
 *
 * @returns {JSX.Element} Lista de meses e totais agregados.
 */
export function AdminPoolDashboardPage() {
  const [months, setMonths] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Carrega dashboard admin sem recalcular valores no browser.
     *
     * @returns {Promise<void>}
     */
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const response = await charitiesApi.getPoolDashboard();
        setMonths(response.months);
      } catch (apiError) {
        setError(toUserMessage(apiError));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <main>
      <h1>Painel da pool</h1>
      {error && <p role="alert">{error}</p>}
      {loading && <p>A carregar painel...</p>}
      {!loading && months.length === 0 && !error && <p>Sem distribuicoes registadas.</p>}
      {months.map((month) => (
        <article key={month.month}>
          <h2>{month.month}</h2>
          <p>Total: {(month.totalPoolCents / 100).toFixed(2)} EUR</p>
          <p>Associações: {month.charitiesCount}</p>
        </article>
      ))}
    </main>
  );
}