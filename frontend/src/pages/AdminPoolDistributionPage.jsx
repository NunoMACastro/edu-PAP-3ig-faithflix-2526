/**
 * Módulo da página administrativa de distribuição da pool.
 *
 * Permite executar ou consultar uma distribuição mensal e mostra o resultado
 * persistido sem recalcular valores críticos no browser.
 */
import { useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Painel administrativo para executar e consultar a distribuição mensal.
 *
 * @returns {JSX.Element} Formulário mensal e resultado persistido.
 */
export function AdminPoolDistributionPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [distribution, setDistribution] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /**
   * Executa a distribuição no backend e mostra o resultado gravado.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>}
   */
  async function handleRun(event) {
    event.preventDefault();
    setError("");
    setDistribution(null);
    setSubmitting(true);
    try {
      const response = await charitiesApi.runDistribution(month);
      setDistribution(response.distribution);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Distribuição mensal</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleRun}>
        <label>Mês<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} required /></label>
        <button type="submit" disabled={submitting}>{submitting ? "A executar..." : "Executar distribuição"}</button>
      </form>
      {distribution && (
        <section>
          <h2>{distribution.month}</h2>
          <p>Total: {(distribution.totalPoolCents / 100).toFixed(2)} EUR</p>
          {distribution.items.map((item) => (
            <article key={item.charityId}>
              <h3>{item.charityName}</h3>
              <p>{(item.amountCents / 100).toFixed(2)} EUR</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}