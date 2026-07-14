/**
 * @file Guarda visual para páginas administrativas.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { buildLoginRedirectPath } from "../../utils/authRedirect.js";

/**
 * Impede que visitantes e utilizadores sem role permitida vejam conteúdo administrativo.
 *
 * @param {{ children: React.ReactNode, allowedRoles?: string[] }} props Propriedades do componente.
 * @param {React.ReactNode} props.children Página administrativa protegida visualmente.
 * @param {string[]} [props.allowedRoles=["admin"]] Roles aceites pela rota visual.
 * @returns {JSX.Element} Página protegida, redirecionamento ou aviso de permissão.
 */
export function AdminRoute({ children, allowedRoles = ["admin"] }) {
    const { status, error, hasRole, refreshSession } = useSession();
    const location = useLocation();
    const returnTo = `${location.pathname}${location.search}${location.hash}`;

    if (status === "loading") {
        return <p role="status">A confirmar sessão...</p>;
    }

    if (status === "anonymous") {
        // O visitante deve autenticar-se antes de tentar abrir qualquer área administrativa.
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

    if (!hasRole(allowedRoles)) {
        // Esta guarda melhora a UX; o backend mantém a decisão final com 403.
        return <p role="alert">Não tem permissão para aceder a esta área.</p>;
    }

    return children;
}
