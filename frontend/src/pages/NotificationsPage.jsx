/**
 * @file Ficheiro `real_dev/frontend/src/pages/NotificationsPage.jsx` da implementação real_dev.
 */

/**
 * Módulo da página de notificações e preferências.
 *
 * Carrega mensagens e preferências do utilizador autenticado, permitindo alterar
 * opções sem expor dados de outros utilizadores ou depender de estado local como fonte de verdade.
 */
import { useEffect, useState } from "react";
import { notificationsApi } from "../services/api/notificationsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página de notificações e preferências do utilizador autenticado.
 *
 * @returns {JSX.Element} Interface de leitura e configuracao de notificações.
 */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({ inApp: true, email: false, continueWatching: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Carrega notificações e preferências em paralelo.
   *
   * @returns {Promise<void>}
   */
  async function load() {
    setLoading(true);
    setError("");
    try {
      const [notificationsResponse, preferencesResponse] = await Promise.all([
        notificationsApi.list(),
        notificationsApi.getPreferences(),
      ]);
      setNotifications(notificationsResponse.notifications);
      setPreferences(preferencesResponse.preferences);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /**
   * Atualiza uma preferência e guarda a alteracao no backend.
   *
   * @param {"inApp" | "continueWatching"} field Preferência alterada.
   * @param {boolean} value Novo valor.
   * @returns {Promise<void>}
   */
  async function updatePreference(field, value) {
    const next = { ...preferences, [field]: value };
    setPreferences(next);
    try {
      await notificationsApi.updatePreferences(next);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    }
  }

  /**
   * Marca uma notificação como lida e recarrega a lista.
   *
   * @param {string} id Identificador da notificação.
   * @returns {Promise<void>}
   */
  async function markAsRead(id) {
    setError("");
    try {
      await notificationsApi.markAsRead(id);
      await load();
    } catch (apiError) {
      setError(toUserMessage(apiError));
    }
  }

  return (
    <section className="page-section">
      <h1>Notificações</h1>
      {error && <p role="alert">{error}</p>}
      <section>
        <h2>Preferências</h2>
        <label><input type="checkbox" checked={preferences.inApp} onChange={(e) => updatePreference("inApp", e.target.checked)} /> Notificações internas</label>
        <label><input type="checkbox" checked={preferences.continueWatching} onChange={(e) => updatePreference("continueWatching", e.target.checked)} /> Alertas de continuidade</label>
      </section>
      <section>
        <h2>Recentes</h2>
        {loading && <p>A carregar notificações...</p>}
        {!loading && notifications.length === 0 && !error && <p>Sem notificações.</p>}
        {notifications.map((notification) => (
          <article key={notification.id}>
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            {!notification.readAt && <button type="button" onClick={() => markAsRead(notification.id)}>Marcar como lida</button>}
          </article>
        ))}
      </section>
    </section>
  );
}
