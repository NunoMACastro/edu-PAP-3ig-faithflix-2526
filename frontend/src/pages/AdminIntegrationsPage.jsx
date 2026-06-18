// apps/frontend/src/pages/AdminIntegrationsPage.jsx
import { useEffect, useState } from "react";
import { integrationsApi } from "../services/api/integrationsApi.js";

const MODES = ["internal", "simulation", "manual", "disabled"];

/**
 * Página admin para configuração de integrações controladas.
 *
 * @returns {JSX.Element} Painel de integrações.
 */
export function AdminIntegrationsPage() {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        integrationsApi
            .listIntegrations()
            .then((response) => setIntegrations(response.integrations))
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Atualiza uma integração no backend.
     *
     * @param {Record<string, unknown>} integration Integração atual.
     * @param {Record<string, unknown>} changes Alterações locais.
     * @returns {Promise<void>} Termina quando a integração é atualizada.
     */
    async function updateIntegration(integration, changes) {
        setSavingKey(integration.key);
        setError("");
        setStatus("");

        try {
            const response = await integrationsApi.updateIntegration(
                integration.key,
                {
                    enabled: integration.enabled,
                    mode: integration.mode,
                    publicConfig: integration.publicConfig ?? {},
                    ...changes,
                },
            );
            setIntegrations((current) =>
                current.map((item) =>
                    item.key === integration.key ? response.integration : item,
                ),
            );
            setStatus("Integração atualizada.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSavingKey("");
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Integrações</h1>
            {loading ? <p>A carregar integrações...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <div className="metric-grid">
                {integrations.map((integration) => (
                    <article key={integration.key}>
                        <h2>{integration.label}</h2>
                        <p>Chave: {integration.key}</p>
                        <p>
                            Variáveis:{" "}
                            {integration.requiredEnvVars.length > 0
                                ? integration.requiredEnvVars.join(", ")
                                : "sem variáveis obrigatórias"}
                        </p>
                        <label>
                            <input
                                type="checkbox"
                                checked={integration.enabled}
                                disabled={savingKey === integration.key}
                                onChange={(event) =>
                                    updateIntegration(integration, {
                                        enabled: event.target.checked,
                                    })
                                }
                            />
                            Ativa
                        </label>
                        <label>
                            Modo
                            <select
                                value={integration.mode}
                                disabled={savingKey === integration.key}
                                onChange={(event) =>
                                    updateIntegration(integration, {
                                        mode: event.target.value,
                                    })
                                }
                            >
                                {MODES.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {mode}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </article>
                ))}
            </div>
        </section>
    );
}