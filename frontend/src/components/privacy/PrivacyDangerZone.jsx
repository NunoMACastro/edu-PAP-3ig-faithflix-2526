/**
 * @file Zona de perigo para eliminação da própria conta.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { privacyApi } from "../../services/api/privacyApi.js";

const CONFIRMATION = "ELIMINAR CONTA";

/**
 * Renderiza o fluxo destrutivo de eliminação de conta.
 *
 * @returns {JSX.Element} Painel de eliminacao.
 */
export function PrivacyDangerZone() {
    const navigate = useNavigate();
    const { clearSession } = useSession();
    const [confirmation, setConfirmation] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    /**
     * Envia o pedido de eliminação ao backend.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulario.
     * @returns {Promise<void>} Termina quando o pedido foi tratado.
     */
    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setStatus("");
        setLoading(true);

        try {
            await privacyApi.deleteMyAccount({ confirmation, password });
            setStatus("Conta eliminada. A sessão foi terminada.");
            clearSession();
            navigate("/login", {
                replace: true,
                state: { accountDeleted: true },
            });
        } catch (requestError) {
            setError(toUserMessage(requestError));
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="form-panel danger-panel">
            <h2>Zona de perigo</h2>
            <p>Esta ação elimina os teus dados pessoais e termina a sessão.</p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form className="inline-form app-form app-form--standard" onSubmit={handleSubmit}>
                <label>
                    Escreve {CONFIRMATION}
                    <input
                        value={confirmation}
                        onChange={(event) =>
                            setConfirmation(event.target.value)
                        }
                    />
                </label>
                <label>
                    Password atual
                    <input
                        type="password"
                        autoComplete="current-password"
                        maxLength={128}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </label>
                <button
                    type="submit"
                    disabled={
                        loading ||
                        confirmation !== CONFIRMATION ||
                        password.length === 0
                    }
                >
                    {loading ? "A eliminar..." : "Eliminar conta"}
                </button>
            </form>
        </section>
    );
}
