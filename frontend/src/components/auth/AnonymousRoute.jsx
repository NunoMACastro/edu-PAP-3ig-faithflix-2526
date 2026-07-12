/**
 * @file Guarda para fluxos públicos de autenticação que exigem ausência de sessão.
 */

import { Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { getDefaultAuthenticatedPath } from "../../utils/authRedirect.js";

/**
 * Evita apresentar login/registo/reset a uma sessão já autenticada.
 *
 * O estado `unavailable` não é tratado como anónimo: um cookie pode continuar
 * válido e os endpoints públicos não usam CSRF autenticado.
 *
 * @param {{ children: React.ReactNode }} props Propriedades da guarda.
 * @param {React.ReactNode} props.children Página pública de autenticação.
 * @returns {JSX.Element} Página, redirect ou estado operacional.
 */
export function AnonymousRoute({ children }) {
    const { status, user, error, refreshSession } = useSession();

    if (status === "loading") {
        return <p role="status">A confirmar sessão...</p>;
    }

    if (status === "authenticated") {
        return <Navigate to={getDefaultAuthenticatedPath(user)} replace />;
    }

    if (status === "unavailable") {
        return (
            <section className="page-section narrow-section">
                <p role="alert">
                    {error || "Não foi possível confirmar a sessão."}
                </p>
                <button
                    type="button"
                    onClick={() => refreshSession().catch(() => {})}
                >
                    Tentar novamente
                </button>
            </section>
        );
    }

    return children;
}
