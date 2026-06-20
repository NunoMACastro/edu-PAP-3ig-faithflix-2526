/**
 * @file Página pública de candidatura de associações.
 *
 * Gere formulário, validação mínima de UI e feedback ao utilizador, enviando
 * apenas dados da candidatura para validação definitiva no backend.
 */

import { useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Estado inicial do formulário público.
 * Fica fora do componente para permitir reposição limpa após submissão com sucesso.
 */
const INITIAL_FORM = {
  name: "",
  contactName: "",
  email: "",
  phone: "",
  mission: "",
  websiteUrl: "",
};

/**
 * Página pública para candidatura de associações.
 *
 * @returns {JSX.Element} Formulário de submissão com feedback de erro e sucesso.
 */
export function CharityApplicationPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  /**
   * Atualiza um campo isolado mantendo os restantes valores do formulário.
   *
   * @param {string} field Nome do campo.
   * @param {string} value Novo valor.
   * @returns {void}
   */
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  /**
   * Envia candidatura para o backend e evita duplo envio enquanto o pedido decorre.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setStatus("");

    try {
      await charitiesApi.submitApplication(form);
      setForm(INITIAL_FORM);
      setStatus("Candidatura submetida para revisão.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Candidatura de associação</h1>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Nome da associação
          <input
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
        </label>
        <label>
          Contacto principal
          <input
            value={form.contactName}
            onChange={(event) => updateField("contactName", event.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />
        </label>
        <label>
          Telefone
          <input
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </label>
        <label>
          Missão
          <textarea
            value={form.mission}
            onChange={(event) => updateField("mission", event.target.value)}
            required
          />
        </label>
        <label>
          Website
          <input
            value={form.websiteUrl}
            onChange={(event) => updateField("websiteUrl", event.target.value)}
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "A submeter..." : "Submeter candidatura"}
        </button>
      </form>
    </main>
  );
}
