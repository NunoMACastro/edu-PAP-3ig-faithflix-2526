/**
 * @file Ação de logout reutilizável pelos shells público e administrativo.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { toUserMessage } from "../../services/api/apiErrors.js";

/**
 * Termina a sessão com estado busy, erro acessível e destino explícito.
 *
 * @param {{ className?: string, onComplete?: () => void }} props Propriedades visuais.
 * @returns {JSX.Element} Ação de sessão autónoma.
 */
export function SessionActionButton({ className = "session-action", onComplete }) {
    const session = useSession();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogout() {
        if (loading) return;
        setLoading(true);
        setError("");

        try {
            await session.logout();
            onComplete?.();
            navigate("/", { replace: true });
        } catch (requestError) {
            setError(toUserMessage(requestError));
        } finally {
            setLoading(false);
        }
    }

    return (
        <span className="session-action-wrapper">
            <button
                className={className}
                type="button"
                disabled={loading}
                aria-busy={loading}
                onClick={handleLogout}
            >
                {loading ? "A sair…" : "Sair"}
            </button>
            {error ? <span className="form-error" role="alert">{error}</span> : null}
        </span>
    );
}
