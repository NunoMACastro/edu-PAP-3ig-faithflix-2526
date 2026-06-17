// apps/frontend/src/components/privacy/PrivacyConsentsPanel.jsx
import { useEffect, useState } from "react";
import { privacyApi } from "../../services/api/privacyApi.js";

const EMPTY_CONSENTS = {
    personalizedRecommendations: false,
    operationalNotifications: true,
    anonymousMetrics: false,
};

/**
 * Painel de gestão de consentimentos do utilizador autenticado.
 *
 * @returns {JSX.Element} Formulário de consentimentos.
 */
export function PrivacyConsentsPanel() {
    const [consents, setConsents] = useState(EMPTY_CONSENTS);
    const [version, setVersion] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        privacyApi
            .getMyConsents()
            .then((response) => {
                setConsents(response.consentState.consents);
                setVersion(response.consentState.version);
            })
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Alterna uma categoria booleana.
     *
     * @param {keyof typeof EMPTY_CONSENTS} key Categoria alterada.
     * @returns {void}
     */
    function toggleConsent(key) {
        setConsents((current) => ({ ...current, [key]: !current[key] }));
    }

    /**
     * Guarda os consentimentos no backend.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
     * @returns {Promise<void>} Termina quando o pedido é processado.
     */
    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setStatus("");
        setError("");

        try {
            const response = await privacyApi.updateMyConsents(consents);
            setConsents(response.consentState.consents);
            setVersion(response.consentState.version);
            setStatus("Consentimentos atualizados.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>A carregar consentimentos...</p>;
    }

    return (
        <section className="form-panel" aria-labelledby="privacy-consents-title">
            <h2 id="privacy-consents-title">Consentimentos</h2>
            <p>Versão: {version}</p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form onSubmit={handleSubmit}>
                <label>
                    <input
                        type="checkbox"
                        checked={consents.personalizedRecommendations}
                        onChange={() => toggleConsent("personalizedRecommendations")}
                    />
                    Recomendações personalizadas
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={consents.operationalNotifications}
                        onChange={() => toggleConsent("operationalNotifications")}
                    />
                    Notificações operacionais
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={consents.anonymousMetrics}
                        onChange={() => toggleConsent("anonymousMetrics")}
                    />
                    Métricas anónimas
                </label>
                <button type="submit" disabled={saving}>
                    {saving ? "A guardar..." : "Guardar consentimentos"}
                </button>
            </form>
        </section>
    );
}