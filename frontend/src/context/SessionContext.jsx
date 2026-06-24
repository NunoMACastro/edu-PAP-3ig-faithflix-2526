// frontend/src/context/SessionContext.jsx
/**
 * @file Contexto de sessão usado pela navegação segura da MF7.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api/authApi.js";

const SessionContext = createContext(null);

/**
 * Disponibiliza estado de sessão para toda a aplicação.
 *
 * @param {{ children: React.ReactNode }} props Propriedades do provider.
 * @param {React.ReactNode} props.children Árvore React que precisa da sessão.
 * @returns {JSX.Element} Provider com estado `loading`, `anonymous` ou `authenticated`.
 */
export function SessionProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  /**
   * Recarrega a sessão a partir do backend.
   *
   * @returns {Promise<void>} Termina depois de atualizar o estado local.
   */
  const refreshSession = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      const response = await authApi.me();
      const currentUser = response?.user ?? null;

      // O perfil vem do backend para evitar que a UI aceite permissões inventadas no browser.
      setUser(currentUser);
      setStatus(currentUser ? "authenticated" : "anonymous");
    } catch (requestError) {
      setUser(null);
      setStatus("anonymous");
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      status,
      user,
      error,
      isAdmin: user?.role === "admin",
      refreshSession,
    }),
    [error, refreshSession, status, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * Lê o contexto de sessão no componente atual.
 *
 * @returns {{ status: string, user: unknown, error: string, isAdmin: boolean, refreshSession: () => Promise<void> }} Estado de sessão.
 * @throws {Error} Quando usado fora de `SessionProvider`.
 */
export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession deve ser usado dentro de SessionProvider.");
  }

  return context;
}