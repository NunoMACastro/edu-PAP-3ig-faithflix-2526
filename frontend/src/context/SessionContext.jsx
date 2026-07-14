/**
 * @file Contexto autoritativo da sessão e respetivo ciclo de vida no browser.
 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { authApi } from "../services/api/authApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import {
    clearCsrfToken,
    setUnauthorizedHandler,
} from "../services/api/apiClient.js";

const SessionContext = createContext(null);

/**
 * Identifica um erro de sessão expirada sem depender da classe concreta usada
 * por mocks ou adaptadores.
 *
 * @param {unknown} error Erro recebido do cliente HTTP.
 * @returns {boolean} Verdadeiro para HTTP 401.
 */
function isUnauthorizedError(error) {
    return (
        error !== null &&
        typeof error === "object" &&
        error.status === 401
    );
}

/**
 * Disponibiliza estado de sessão para toda a aplicação.
 *
 * `unavailable` é diferente de `anonymous`: uma falha de rede ou HTTP 5xx não
 * autoriza o frontend a concluir que o utilizador terminou a sessão.
 *
 * @param {{ children: React.ReactNode }} props Propriedades do provider.
 * @param {React.ReactNode} props.children Árvore React que precisa da sessão.
 * @returns {JSX.Element} Provider com estado de sessão e ações centralizadas.
 */
export function SessionProvider({ children }) {
    const [status, setStatus] = useState("loading");
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const refreshVersion = useRef(0);

    /**
     * Limpa imediatamente todo o estado local associado à sessão.
     *
     * Incrementar a versão também impede um `/session/me` antigo de voltar a
     * autenticar a interface depois de um logout ou HTTP 401.
     *
     * @returns {void}
     */
    const clearSession = useCallback(() => {
        refreshVersion.current += 1;
        clearCsrfToken();
        setUser(null);
        setStatus("anonymous");
        setError("");
    }, []);

    /**
     * Recarrega a sessão a partir do backend, distinguindo ausência de sessão
     * de indisponibilidade operacional.
     *
     * @returns {Promise<object | null>} Utilizador confirmado ou null.
     * @throws {unknown} Propaga falhas não-401 para o consumidor poder informar a UI.
     */
    const refreshSession = useCallback(async () => {
        const currentVersion = refreshVersion.current + 1;
        refreshVersion.current = currentVersion;
        setStatus("loading");
        setError("");

        try {
            const response = await authApi.me();
            const currentUser = response?.user ?? null;

            if (refreshVersion.current !== currentVersion) {
                return null;
            }

            // O perfil vem do backend para evitar permissões inventadas no browser.
            setUser(currentUser);
            setStatus(currentUser ? "authenticated" : "anonymous");
            return currentUser;
        } catch (requestError) {
            if (refreshVersion.current !== currentVersion) {
                return null;
            }

            if (isUnauthorizedError(requestError)) {
                clearSession();
                return null;
            }

            setUser(null);
            setStatus("unavailable");
            setError(toUserMessage(requestError));
            throw requestError;
        }
    }, [clearSession]);

    /**
     * Termina a sessão no backend antes de limpar o estado local.
     *
     * Um 401 já significa que a sessão deixou de existir e é tratado como
     * logout concluído. Falhas de rede preservam o estado para não fingir que o
     * cookie HttpOnly foi invalidado.
     *
     * @returns {Promise<void>} Termina quando backend e contexto estão alinhados.
     */
    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (requestError) {
            if (!isUnauthorizedError(requestError)) {
                throw requestError;
            }
        }

        clearSession();
    }, [clearSession]);

    useEffect(() => {
        let active = true;
        const removeUnauthorizedHandler = setUnauthorizedHandler(() => {
            if (active) {
                clearSession();
            }
        });

        // A indisponibilidade fica no estado do provider; não gerar rejection global.
        refreshSession().catch(() => {});

        return () => {
            active = false;
            refreshVersion.current += 1;
            removeUnauthorizedHandler();
        };
    }, [clearSession, refreshSession]);

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
            logout,
            clearSession,
        }),
        [
            clearSession,
            error,
            hasRole,
            logout,
            refreshSession,
            status,
            user,
        ],
    );

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

/**
 * Lê o contexto de sessão no componente atual.
 *
 * @returns {{ status: "loading" | "authenticated" | "anonymous" | "unavailable", user: object | null, error: string, isAdmin: boolean, hasRole: (allowedRoles: string[]) => boolean, refreshSession: () => Promise<object | null>, logout: () => Promise<void>, clearSession: () => void }} Estado e ações de sessão.
 * @throws {Error} Quando usado fora de `SessionProvider`.
 */
export function useSession() {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error("useSession deve ser usado dentro de SessionProvider.");
    }

    return context;
}
