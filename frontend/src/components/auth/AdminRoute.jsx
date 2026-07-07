/**
 * @file Guarda visual para páginas administrativas.
 */

import { Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";

/**
 * Impede que visitantes e utilizadores sem role permitida vejam conteúdo administrativo.
 *
 * @param {{ children: React.ReactNode, allowedRoles?: string[] }} props Propriedades do componente.
 * @param {React.ReactNode} props.children Página administrativa protegida visualmente.
 * @param {string[]} [props.allowedRoles=["admin"]] Roles aceites pela rota visual.
 * @returns {JSX.Element} Página protegida, redirecionamento ou aviso de permissão.
 */
export function AdminRoute({ children, allowedRoles = ["admin"] }) {
    const { status, hasRole } = useSession();

    if (status === "loading") {
        return <p role="status">A confirmar sessão...</p>;
    }

    if (status === "anonymous") {
        // O visitante deve autenticar-se antes de tentar abrir qualquer área administrativa.
        return <Navigate to="/login" replace />;
    }

    if (!hasRole(allowedRoles)) {
        // Esta guarda melhora a UX; o backend mantém a decisão final com 403.
        return <p role="alert">Não tem permissão para aceder a esta área.</p>;
    }

    return children;
}
