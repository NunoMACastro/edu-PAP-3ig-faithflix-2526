/**
 * @file Edição explícita e independente das integrações administrativas.
 */

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { toUserMessage } from "../services/api/apiErrors.js";
import { integrationsApi } from "../services/api/integrationsApi.js";

const MODE_LABELS = { internal: "Automático", simulation: "Automático", manual: "Manual", disabled: "Desativado" };
const INTEGRATION_LABELS = {
    internal_notifications: "Notificações na aplicação",
    simulated_payments: "Pagamentos",
    aggregate_analytics_export: "Exportação de métricas",
};
const INTEGRATION_DESCRIPTIONS = {
    internal_notifications: "Envia notificações diretamente para as contas FaithFlix.",
    simulated_payments: "Gere pagamentos e ativações de subscrições.",
    aggregate_analytics_export: "Prepara ficheiros com as métricas administrativas.",
};

function integrationLabel(integration) {
    return INTEGRATION_LABELS[integration.key] ?? integration.label ?? "Integração";
}

function integrationDescription(integration) {
    return INTEGRATION_DESCRIPTIONS[integration.key] ?? "Serviço ligado à operação da FaithFlix.";
}

function modeLabel(mode) {
    return MODE_LABELS[mode] ?? "Indisponível";
}

function editableValue(integration) {
    return { enabled: integration.enabled, mode: integration.mode, publicConfig: integration.publicConfig ?? {} };
}

function hasChanges(integration, draft) {
    return Boolean(draft) && JSON.stringify(editableValue(integration)) !== JSON.stringify(draft);
}

/** @returns {JSX.Element} Cartões com drafts locais e confirmação do diff. */
export function AdminIntegrationsPage() {
    const [integrations, setIntegrations] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const [busyKey, setBusyKey] = useState("");
    const [confirming, setConfirming] = useState(null);
    const controllerRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        integrationsApi.listIntegrations({ signal: controller.signal })
            .then((response) => {
                const items = response.integrations ?? [];
                setIntegrations(items);
                setDrafts(Object.fromEntries(items.map((item) => [item.key, editableValue(item)])));
            })
            .catch((requestError) => {
                if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [reloadVersion]);

    useEffect(() => () => controllerRef.current?.abort(), []);

    function updateDraft(key, patch) {
        setDrafts((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
        setStatus("");
    }

    function cancelDraft(integration) {
        updateDraft(integration.key, editableValue(integration));
    }

    async function saveIntegration() {
        if (!confirming || busyKey) return;
        const draft = drafts[confirming.key];
        const controller = new AbortController();
        controllerRef.current = controller;
        setBusyKey(confirming.key);
        setError("");

        try {
            const response = await integrationsApi.updateIntegration(confirming.key, draft, { signal: controller.signal });
            const saved = response.integration;
            setIntegrations((items) => items.map((item) => item.key === saved.key ? saved : item));
            setDrafts((current) => ({ ...current, [saved.key]: editableValue(saved) }));
            setStatus(`«${integrationLabel(saved)}» foi guardada.`);
            setConfirming(null);
        } catch (requestError) {
            if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
        } finally {
            controllerRef.current = null;
            setBusyKey("");
        }
    }

    return (
        <section className="page-section">
            <header className="admin-page-header"><div><p className="section-kicker">Operação</p><h1>Integrações</h1><p>Revê o estado de cada serviço e guarda apenas as alterações pretendidas.</p></div></header>
            {loading ? <p role="status">A carregar integrações…</p> : null}
            {error && !confirming ? <EmptyState title="Não foi possível carregar as integrações" description={error} tone="error"><button type="button" onClick={() => setReloadVersion((value) => value + 1)}>Tentar novamente</button></EmptyState> : null}
            {status ? <p role="status">{status}</p> : null}
            {!loading && !error && integrations.length === 0 ? <EmptyState title="Sem integrações" description="Não existem integrações configuráveis." /> : null}

            <div className="content-grid">
                {integrations.map((integration) => {
                    const draft = drafts[integration.key] ?? editableValue(integration);
                    const dirty = hasChanges(integration, draft);
                    const busy = busyKey === integration.key;
                    const allowedModes = Array.isArray(integration.allowedModes) ? integration.allowedModes : [integration.mode];

                    return (
                        <article className="form-panel integration-card" key={integration.key} aria-busy={busy}>
                            <div className="integration-heading"><div><h2>{integrationLabel(integration)}</h2><p className="muted-text">{integrationDescription(integration)}</p></div>{dirty ? <span className="unsaved-badge">Alterações por guardar</span> : null}</div>
                            {integration.configurationValid === false ? <p role="alert">Esta integração precisa de ser revista antes de poder ser ativada.</p> : null}
                            <label className="switch-row"><span>Estado: {draft.enabled ? "Ativa" : "Desativada"}</span><input type="checkbox" checked={draft.enabled} disabled={busy} onChange={(event) => updateDraft(integration.key, { enabled: event.target.checked })} /></label>
                            <label>Funcionamento<select value={draft.mode} disabled={busy} onChange={(event) => updateDraft(integration.key, { mode: event.target.value })}>{allowedModes.map((mode) => <option key={mode} value={mode}>{modeLabel(mode)}</option>)}</select></label>
                            <div className="button-row"><button type="button" disabled={!dirty || busy} onClick={() => setConfirming(integration)}>Guardar</button><button type="button" disabled={!dirty || busy} onClick={() => cancelDraft(integration)}>Cancelar</button></div>
                        </article>
                    );
                })}
            </div>

            <ConfirmDialog open={Boolean(confirming)} title="Confirmar configuração" confirmLabel="Guardar alterações" busy={Boolean(busyKey)} onCancel={() => !busyKey && setConfirming(null)} onConfirm={saveIntegration}>
                {confirming ? <div><p>Confirma as alterações em <strong>{integrationLabel(confirming)}</strong>:</p><dl className="detail-list"><dt>Estado</dt><dd>{confirming.enabled ? "Ativa" : "Desativada"} → {drafts[confirming.key]?.enabled ? "Ativa" : "Desativada"}</dd><dt>Funcionamento</dt><dd>{modeLabel(confirming.mode)} → {modeLabel(drafts[confirming.key]?.mode)}</dd></dl>{error ? <p className="form-error" role="alert">{error}</p> : null}</div> : null}
            </ConfirmDialog>
        </section>
    );
}
