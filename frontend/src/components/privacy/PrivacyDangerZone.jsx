// apps/frontend/src/components/privacy/PrivacyDangerZone.jsx
import { useState } from "react";
import { privacyApi } from "../../services/api/privacyApi.js";

const CONFIRMATION = "ELIMINAR CONTA";

/**
 * Zona de perigo para eliminação da própria conta.
 *
 * @returns {JSX.Element} Formulário de eliminação com confirmação forte.
 */
export function PrivacyDangerZone() {
    const [confirmation, setConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    /**
     * Envia o pedido de eliminação para o backend.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
     * @returns {Promise<void>} Termina quando o pedido é processado.
     */
    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setStatus("");
        setError("");

        try {
            await privacyApi.deleteMyAccount({ confirmation });
            setStatus("Conta eliminada. Volta a iniciar sessão apenas se criares nova conta.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="form-panel danger-zone" aria-labelledby="delete-account-title">
            <h2 id="delete-account-title">Eliminar conta</h2>
            <p>
                Esta ação remove dados pessoais diretos e termina sessões ativas.
                Escreve {CONFIRMATION} para confirmar.
            </p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form onSubmit={handleSubmit}>
                <label>
                    Confirmação
                    <input
                        value={confirmation}
                        onChange={(event) => setConfirmation(event.target.value)}
                    />
                </label>
                <button type="submit" disabled={loading || confirmation !== CONFIRMATION}>
                    {loading ? "A eliminar..." : "Eliminar conta"}
                </button>
            </form>
        </section>
    );
}