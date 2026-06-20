/**
 * @file Página administrativa para ligar utilizadores a associações.
 *
 * Cria memberships que permitem a uma conta autenticada consultar o histórico
 * privado da respetiva associação.
 */

import { useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Formulário administrativo de ligação utilizador-associação.
 *
 * @returns {JSX.Element} Interface simples para criar ou atualizar membership.
 */
export function AdminCharityMembersPage() {
  const [charityId, setCharityId] = useState("");
  const [userId, setUserId] = useState("");
  const [membership, setMembership] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /**
   * Envia a ligação para o backend.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMembership(null);

    try {
      const response = await charitiesApi.linkUserToCharity(charityId, userId);
      setMembership(response.membership);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Membros de associações</h1>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          ID da associação
          <input
            value={charityId}
            onChange={(event) => setCharityId(event.target.value)}
            required
          />
        </label>
        <label>
          ID do utilizador
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "A guardar..." : "Ligar utilizador"}
        </button>
      </form>
      {membership && (
        <p role="status">
          Utilizador {membership.userId} ligado à associação {membership.charityId}.
        </p>
      )}
    </main>
  );
}
