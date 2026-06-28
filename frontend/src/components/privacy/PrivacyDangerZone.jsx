/**
 * @file Zona de perigo para eliminação da própria conta.
 */

import { useState } from "react";
import { privacyApi } from "../../services/api/privacyApi.js";

const CONFIRMATION = "ELIMINAR CONTA";

/**
 * Renderiza o fluxo destrutivo de eliminação de conta.
 *
 * @returns {JSX.Element} Painel de eliminacao.
 */
export function PrivacyDangerZone() {
    const [confirmation, setConfirmation] = useState("");
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
            await privacyApi.deleteMyAccount({ confirmation });
            setStatus("Conta eliminada. A sessão foi terminada.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="form-panel danger-panel">
            <h2>Zona de perigo</h2>
            <p>Esta operação anonimiza a conta e remove dados pessoais diretos.</p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form className="inline-form" onSubmit={handleSubmit}>
                <label>
                    Escreve {CONFIRMATION}
                    <input
                        value={confirmation}
                        onChange={(event) =>
                            setConfirmation(event.target.value)
                        }
                    />
                </label>
                <button
                    type="submit"
                    disabled={loading || confirmation !== CONFIRMATION}
                >
                    {loading ? "A eliminar..." : "Eliminar conta"}
                </button>
            </form>
        </section>
    );
}
