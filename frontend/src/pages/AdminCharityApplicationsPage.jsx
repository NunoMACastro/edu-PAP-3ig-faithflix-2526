/**
 * Módulo da página administrativa de revisão de candidaturas.
 *
 * Lista candidaturas pendentes e envia decisões para o backend, onde a role
 * `admin` e a regra de decisão única são aplicadas.
 */
import { useEffect, useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Painel administrativo para decidir candidaturas pendentes.
 *
 * @returns {JSX.Element} Lista de candidaturas com acoes de aprovar e rejeitar.
 */
export function AdminCharityApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Carrega candidaturas pendentes para revisão.
   *
   * @returns {Promise<void>}
   */
  async function loadApplications() {
    setLoading(true);
    setError("");
    try {
      const response = await charitiesApi.listApplications("pending");
      setApplications(response.applications);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  /**
   * Envia a decisão do admin e recarrega a lista para evitar segunda decisão.
   *
   * @param {string} id Identificador da candidatura.
   * @param {"approved" | "rejected"} decision Decisão escolhida.
   * @returns {Promise<void>}
   */
  async function decide(id, decision) {
    setError("");
    try {
      await charitiesApi.reviewApplication(id, {
        decision,
        reason: decision === "rejected" ? "Não cumpre os criterios minimos da pool." : "",
      });
      await loadApplications();
    } catch (apiError) {
      setError(toUserMessage(apiError));
    }
  }

  if (loading) return <main><p>A carregar candidaturas...</p></main>;

  return (
    <main>
      <h1>Candidaturas</h1>
      {error && <p role="alert">{error}</p>}
      {applications.length === 0 && <p>Não existem candidaturas pendentes.</p>}
      {applications.map((application) => (
        <article key={application.id}>
          <h2>{application.name}</h2>
          <p>{application.mission}</p>
          <button type="button" onClick={() => decide(application.id, "approved")}>Aprovar</button>
          <button type="button" onClick={() => decide(application.id, "rejected")}>Rejeitar</button>
        </article>
      ))}
    </main>
  );
}