/**
 * @file Página de conta autenticada com perfil, controlo parental e privacidade.
 */

import { useEffect, useState } from "react";
import { PrivacyConsentsPanel } from "../components/privacy/PrivacyConsentsPanel.jsx";
import { PrivacyDangerZone } from "../components/privacy/PrivacyDangerZone.jsx";
import { PrivacyExportPanel } from "../components/privacy/PrivacyExportPanel.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { userApi } from "../services/api/userApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Mostra e atualiza dados da conta autenticada.
 *
 * @returns {JSX.Element} Página de conta.
 */
export function AccountPage() {
  const [name, setName] = useState("");
  const [parentalMaxAgeRating, setParentalMaxAgeRating] = useState(18);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    /**
     * Carrega a conta do utilizador autenticado.
     *
     * @returns {Promise<void>} Termina depois de preencher formulário e resumo.
     */
    async function loadAccount() {
      try {
        const response = await userApi.getMe();

        if (active) {
          setUser(response.user);
          setName(response.user.name);
          setParentalMaxAgeRating(response.user.parentalMaxAgeRating);
        }
      } catch (requestError) {
        if (active) {
          setError(toUserMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, []);

  /**
   * Guarda nome público do utilizador autenticado.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>} Termina quando a API responde.
   */
  async function handleProfileSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");

    try {
      // A rota usa a sessão atual; a UI não envia userId nem tenta alterar outra conta.
      const response = await userApi.updateMe({ name });
      setUser(response.user);
      setStatus("Perfil atualizado.");
    } catch (requestError) {
      setError(toUserMessage(requestError));
    }
  }

  /**
   * Guarda limite parental da conta autenticada.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>} Termina quando a API responde.
   */
  async function handleParentalSubmit(event) {
    event.preventDefault();
    setStatus("");
    setError("");

    try {
      const response = await userApi.updateParental(Number(parentalMaxAgeRating));
      setUser(response.user);
      setStatus("Controlo parental atualizado.");
    } catch (requestError) {
      setError(toUserMessage(requestError));
    }
  }

  if (loading) {
    return (
      <section className="page-section narrow-section">
        <p role="status">A carregar conta...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="page-section narrow-section">
        <p className="section-kicker">Conta</p>
        <h1>A minha conta</h1>
        {error ? <EmptyState title="Conta indisponível" description={error} tone="error" /> : null}
      </section>
    );
  }

  return (
    <section className="page-section narrow-section">
      <p className="section-kicker">Conta</p>
      <h1>A minha conta</h1>
      {error ? <EmptyState title="Não foi possível atualizar a conta" description={error} tone="error" /> : null}
      {status ? <EmptyState title="Alteração guardada" description={status} tone="success" /> : null}

      <form className="form-panel" onSubmit={handleProfileSubmit}>
        <h2>Perfil</h2>
        <label>
          Nome
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <button type="submit">Guardar perfil</button>
      </form>

      <form className="form-panel" onSubmit={handleParentalSubmit}>
        <h2>Controlo parental</h2>
        <label>
          Limite parental
          <input
            min="0"
            max="18"
            type="number"
            value={parentalMaxAgeRating}
            onChange={(event) => setParentalMaxAgeRating(event.target.value)}
          />
        </label>
        <button type="submit">Guardar limite</button>
      </form>

      <dl className="meta-list">
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Papel</dt>
        <dd>{user.role}</dd>
      </dl>

      <PrivacyExportPanel />
      <PrivacyConsentsPanel />
      <PrivacyDangerZone />
    </section>
  );
}