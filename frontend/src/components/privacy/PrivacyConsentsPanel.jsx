/**
 * @file Painel de gestao de consentimentos do utilizador.
 */

import { useEffect, useState } from "react";
import { privacyApi } from "../../services/api/privacyApi.js";

const CONSENT_LABELS = {
    personalizedRecommendations: "Recomendacoes personalizadas",
    operationalNotifications: "Notificacoes operacionais",
    anonymousMetrics: "Metricas anonimas",
};

/**
 * Renderiza switches de consentimento persistidos no backend.
 *
 * @returns {JSX.Element} Painel de consentimentos.
 */
export function PrivacyConsentsPanel() {
    const [consents, setConsents] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        privacyApi
            .getMyConsents()
            .then((response) => {
                setConsents(response.consentState.consents);
                setUpdatedAt(response.consentState.updatedAt);
            })
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Alterna uma categoria localmente antes de guardar.
     *
     * @param {string} key Categoria.
     * @returns {void}
     */
    function toggleConsent(key) {
        setConsents((current) => ({
            ...current,
            [key]: !current[key],
        }));
    }

    /**
     * Guarda escolhas no backend autenticado.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulario.
     * @returns {Promise<void>} Termina quando o pedido foi tratado.
     */
    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setStatus("");

        try {
            const response = await privacyApi.updateMyConsents(consents);
            setConsents(response.consentState.consents);
            setUpdatedAt(response.consentState.updatedAt);
            setStatus("Consentimentos atualizados.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <section className="form-panel">
                <p>A carregar consentimentos...</p>
            </section>
        );
    }

    return (
        <section className="form-panel">
            <h2>Consentimentos</h2>
            <p>Controla escolhas opcionais associadas à tua conta.</p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form className="preference-list" onSubmit={handleSubmit}>
                {Object.entries(CONSENT_LABELS).map(([key, label]) => (
                    <label className="switch-row" key={key}>
                        <span>{label}</span>
                        <input
                            type="checkbox"
                            checked={Boolean(consents?.[key])}
                            onChange={() => toggleConsent(key)}
                        />
                    </label>
                ))}
                <button type="submit" disabled={saving}>
                    {saving ? "A guardar..." : "Guardar consentimentos"}
                </button>
            </form>
            {updatedAt ? (
                <p className="muted-text">
                    Ultima atualizacao: {new Date(updatedAt).toLocaleString("pt-PT")}
                </p>
            ) : null}
        </section>
    );
}
