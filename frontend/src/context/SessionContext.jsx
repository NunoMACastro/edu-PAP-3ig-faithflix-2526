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

            // O perfil vem do backend para evitar permissões inventadas no browser.
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

    /**
     * Verifica se a role da sessão pertence à lista autorizada.
     *
     * @param {string[]} allowedRoles Roles aceites para uma área da interface.
     * @returns {boolean} Verdadeiro quando o utilizador autenticado tem uma role permitida.
     */
    const hasRole = useCallback(
        (allowedRoles) => allowedRoles.includes(user?.role),
        [user?.role],
    );

    const value = useMemo(
        () => ({
            status,
            user,
            error,
            isAdmin: user?.role === "admin",
            hasRole,
            refreshSession,
        }),
        [error, hasRole, refreshSession, status, user],
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * Lê o contexto de sessão no componente atual.
 *
 * @returns {{ status: string, user: object | null, error: string, isAdmin: boolean, hasRole: (allowedRoles: string[]) => boolean, refreshSession: () => Promise<void> }} Estado de sessão.
 * @throws {Error} Quando usado fora de `SessionProvider`.
 */
export function useSession() {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error("useSession deve ser usado dentro de SessionProvider.");
    }

    return context;
}
