/**
 * @file Página admin de configuração de integrações controladas.
 */

import { useEffect, useState } from "react";
import { integrationsApi } from "../services/api/integrationsApi.js";

const MODES = ["internal", "simulation", "manual", "disabled"];

/**
 * Página para gerir integrações previstas no MVP sem guardar segredos.
 *
 * @returns {JSX.Element} Página de integrações.
 */
export function AdminIntegrationsPage() {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    /**
     * Carrega integrações do backend.
     *
     * @returns {Promise<void>} Termina depois de atualizar estado.
     */
    async function loadIntegrations() {
        const response = await integrationsApi.listIntegrations();
        setIntegrations(response.integrations);
    }

    useEffect(() => {
        loadIntegrations()
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Atualiza uma integração com o novo valor.
     *
     * @param {string} key Chave da integração.
     * @param {Record<string, unknown>} patch Alteração parcial.
     * @returns {Promise<void>} Termina quando a lista local foi atualizada.
     */
    async function updateIntegration(key, patch) {
        setError("");
        setStatus("");

        const current = integrations.find((item) => item.key === key);
        const response = await integrationsApi.updateIntegration(key, {
            enabled: current.enabled,
            mode: current.mode,
            publicConfig: current.publicConfig ?? {},
            ...patch,
        });

        setIntegrations((items) =>
            items.map((item) =>
                item.key === key ? response.integration : item,
            ),
        );
        setStatus("Integração atualizada.");
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Integrações</h1>
            {loading ? <p>A carregar integrações...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <div className="content-grid">
                {integrations.map((integration) => (
                    <article className="form-panel" key={integration.key}>
                        <h2>{integration.label}</h2>
                        <p className="muted-text">{integration.key}</p>
                        <label className="switch-row">
                            <span>Ativa</span>
                            <input
                                type="checkbox"
                                checked={integration.enabled}
                                onChange={(event) =>
                                    updateIntegration(integration.key, {
                                        enabled: event.target.checked,
                                    }).catch((requestError) =>
                                        setError(requestError.message),
                                    )
                                }
                            />
                        </label>
                        <label>
                            Modo
                            <select
                                value={integration.mode}
                                onChange={(event) =>
                                    updateIntegration(integration.key, {
                                        mode: event.target.value,
                                    }).catch((requestError) =>
                                        setError(requestError.message),
                                    )
                                }
                            >
                                {MODES.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {mode}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <dl className="meta-list">
                            <dt>Variáveis de ambiente</dt>
                            <dd>
                                {integration.envVars.length
                                    ? integration.envVars.join(", ")
                                    : "Sem segredos necessários"}
                            </dd>
                        </dl>
                    </article>
                ))}
            </div>
        </section>
    );
}
