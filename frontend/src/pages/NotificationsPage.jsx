/**
 * @file Ficheiro `real_dev/frontend/src/pages/NotificationsPage.jsx` da implementação real_dev.
 */

/**
 * Módulo da página de notificações e preferências.
 *
 * Carrega mensagens e preferências do utilizador autenticado, permitindo alterar
 * opções sem expor dados de outros utilizadores ou depender de estado local como fonte de verdade.
 */
import { useEffect, useRef, useState } from "react";
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
  const [reloadVersion, setReloadVersion] = useState(0);
  const [savingPreference, setSavingPreference] = useState("");
  const [readingIds, setReadingIds] = useState(() => new Set());
  const controllersRef = useRef(new Set());
  const mountedRef = useRef(true);

  /**
   * Carrega notificações e preferências em paralelo.
   *
   * @returns {Promise<void>}
   */
  function trackedController() {
    const controller = new AbortController();
    controllersRef.current.add(controller);
    return controller;
  }

  useEffect(() => {
    const controller = trackedController();
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([
      notificationsApi.list({ signal: controller.signal }),
      notificationsApi.getPreferences({ signal: controller.signal }),
    ])
      .then(([notificationsResponse, preferencesResponse]) => {
        if (!active) return;
        setNotifications(notificationsResponse.notifications);
        setPreferences(preferencesResponse.preferences);
      })
      .catch((apiError) => {
        if (active && apiError?.code !== "REQUEST_ABORTED") {
          setError(toUserMessage(apiError));
        }
      })
      .finally(() => {
        controllersRef.current.delete(controller);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
      controllersRef.current.delete(controller);
    };
  }, [reloadVersion]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      for (const controller of controllersRef.current) controller.abort();
      controllersRef.current.clear();
    };
  }, []);

  /**
   * Atualiza uma preferência e guarda a alteracao no backend.
   *
   * @param {"inApp" | "email" | "continueWatching"} field Preferência alterada.
   * @param {boolean} value Novo valor.
   * @returns {Promise<void>}
   */
  async function updatePreference(field, value) {
    if (savingPreference) return;
    const previous = preferences;
    const next = { ...preferences, [field]: value };
    const controller = trackedController();
    setError("");
    setSavingPreference(field);
    setPreferences(next);
    try {
      const response = await notificationsApi.updatePreferences(next, {
        signal: controller.signal,
      });
      if (mountedRef.current) setPreferences(response.preferences);
    } catch (apiError) {
      if (mountedRef.current && apiError?.code !== "REQUEST_ABORTED") {
        setPreferences(previous);
        setError(toUserMessage(apiError));
      }
    } finally {
      controllersRef.current.delete(controller);
      if (mountedRef.current) setSavingPreference("");
    }
  }

  /**
   * Marca uma notificação como lida e recarrega a lista.
   *
   * @param {string} id Identificador da notificação.
   * @returns {Promise<void>}
   */
  async function markAsRead(id) {
    if (readingIds.has(id)) return;
    const controller = trackedController();
    setError("");
    setReadingIds((current) => new Set(current).add(id));
    try {
      const response = await notificationsApi.markAsRead(id, {
        signal: controller.signal,
      });
      if (mountedRef.current) {
        setNotifications((current) => current.map((notification) =>
          notification.id === id ? response.notification : notification));
      }
    } catch (apiError) {
      if (mountedRef.current && apiError?.code !== "REQUEST_ABORTED") {
        setError(toUserMessage(apiError));
      }
    } finally {
      controllersRef.current.delete(controller);
      if (mountedRef.current) {
        setReadingIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    }
  }

  return (
    <section className="page-section">
      <h1>Notificações</h1>
      {error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
            Tentar novamente
          </button>
        </div>
      ) : null}
      <section>
        <h2>Preferências</h2>
        <label><input type="checkbox" checked={preferences.inApp} disabled={Boolean(savingPreference)} onChange={(e) => updatePreference("inApp", e.target.checked)} /> Notificações na aplicação</label>
        <label><input type="checkbox" checked={preferences.email} disabled={Boolean(savingPreference)} onChange={(e) => updatePreference("email", e.target.checked)} /> Notificações por email</label>
        <label><input type="checkbox" checked={preferences.continueWatching} disabled={Boolean(savingPreference)} onChange={(e) => updatePreference("continueWatching", e.target.checked)} /> Alertas de continuidade</label>
        {savingPreference ? <p role="status">A guardar preferências...</p> : null}
      </section>
      <section>
        <h2>Recentes</h2>
        {loading && <p role="status">A carregar notificações...</p>}
        {!loading && notifications.length === 0 && !error && <p>Sem notificações.</p>}
        {notifications.map((notification) => (
          <article key={notification.id}>
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            {!notification.readAt && (
              <button
                type="button"
                disabled={readingIds.has(notification.id)}
                onClick={() => markAsRead(notification.id)}
              >
                {readingIds.has(notification.id) ? "A marcar..." : "Marcar como lida"}
              </button>
            )}
          </article>
        ))}
      </section>
    </section>
  );
}
