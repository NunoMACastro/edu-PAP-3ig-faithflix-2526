/**
 * Módulo da página administrativa de ligação entre utilizador e associação.
 *
 * Envia IDs explícitos para um endpoint protegido por `admin`, permitindo criar
 * ownership operacional sem transformar associações em utilizadores comuns.
 */
import { useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Painel admin para criar ownership entre utilizador e associação.
 *
 * @returns {JSX.Element} Formulário administrativo de ligacao.
 */
export function AdminCharityMembersPage() {
  const [charityId, setCharityId] = useState("");
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /**
   * Envia a ligacao para o backend e mostra o resultado.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    setError("");

    try {
      const response = await charitiesApi.linkUserToCharity(charityId, userId);
      setStatus(`Utilizador ligado a associação ${response.membership.charityId}.`);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Ligar utilizador a associação</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="charityId">ID da associação</label>
        <input id="charityId" value={charityId} onChange={(event) => setCharityId(event.target.value)} required />
        <label htmlFor="userId">ID do utilizador</label>
        <input id="userId" value={userId} onChange={(event) => setUserId(event.target.value)} required />
        <button type="submit" disabled={submitting}>
          {submitting ? "A guardar..." : "Guardar ligacao"}
        </button>
      </form>
      {status && <p>{status}</p>}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}