/**
 * @file Guarda visual reutilizável para páginas que exigem sessão autenticada.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { buildLoginRedirectPath } from "../../utils/authRedirect.js";

/**
 * Protege uma página autenticada no frontend e preserva o destino original.
 *
 * @param {{ children: React.ReactNode }} props Propriedades do componente.
 * @param {React.ReactNode} props.children Página a apresentar depois de confirmar sessão.
 * @returns {JSX.Element} Página protegida, estado de carregamento ou redirecionamento.
 */
export function AuthenticatedRoute({ children }) {
    const { status, error, refreshSession } = useSession();
    const location = useLocation();
    const returnTo = `${location.pathname}${location.search}${location.hash}`;

    if (status === "loading") {
        return <p role="status">A confirmar sessão...</p>;
    }

    if (status === "anonymous") {
        return <Navigate to={buildLoginRedirectPath(returnTo)} replace />;
    }

    if (status !== "authenticated") {
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
