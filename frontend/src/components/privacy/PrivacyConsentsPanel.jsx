/**
 * @file Painel de gestão de consentimentos do utilizador.
 */

import { useEffect, useRef, useState } from "react";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { privacyApi } from "../../services/api/privacyApi.js";

const CONSENT_LABELS = {
    personalizedRecommendations: "Recomendações personalizadas",
    operationalNotifications: "Alertas opcionais de continuidade",
    anonymousMetrics: "Partilha de utilização anónima",
};

/**
 * Renderiza opções de consentimento persistidas no backend.
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
    const [reloadVersion, setReloadVersion] = useState(0);
    const confirmedConsentsRef = useRef(null);
    const mountedRef = useRef(false);
    const savingRef = useRef(false);
    const writeControllerRef = useRef(null);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            writeControllerRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        setLoading(true);
        setError("");
        setStatus("");

        privacyApi
            .getMyConsents({ signal: controller.signal })
            .then((response) => {
                if (!active) return;

                const confirmedConsents = response.consentState.consents;
                confirmedConsentsRef.current = confirmedConsents;
                setConsents(confirmedConsents);
                setUpdatedAt(response.consentState.updatedAt ?? null);
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setError(toUserMessage(requestError));
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [reloadVersion]);

    /**
     * Alterna uma categoria localmente antes de guardar.
     *
     * @param {string} key Categoria.
     * @returns {void}
     */
    function toggleConsent(key) {
        if (savingRef.current) return;

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

        if (savingRef.current || !consents) return;

        const controller = new AbortController();
        const requestedConsents = { ...consents };
        savingRef.current = true;
        writeControllerRef.current = controller;
        setSaving(true);
        setError("");
        setStatus("");

        try {
            const response = await privacyApi.updateMyConsents(
                requestedConsents,
                { signal: controller.signal },
            );

            if (
                !mountedRef.current ||
                writeControllerRef.current !== controller
            ) {
                return;
            }

            const confirmedConsents = response.consentState.consents;
            confirmedConsentsRef.current = confirmedConsents;
            setConsents(confirmedConsents);
            setUpdatedAt(response.consentState.updatedAt ?? null);
            setStatus("Consentimentos atualizados.");
        } catch (requestError) {
            if (
                mountedRef.current &&
                writeControllerRef.current === controller &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setConsents(confirmedConsentsRef.current);
                setError(toUserMessage(requestError));
            }
        } finally {
            if (writeControllerRef.current === controller) {
                writeControllerRef.current = null;
                savingRef.current = false;

                if (mountedRef.current) setSaving(false);
            }
        }
    }

    if (loading) {
        return (
            <section className="form-panel">
                <p role="status">A carregar consentimentos...</p>
            </section>
        );
    }

    if (!consents && error) {
        return (
            <section className="form-panel">
                <h2>Consentimentos</h2>
                <p role="alert">{error}</p>
                <button
                    type="button"
                    onClick={() => setReloadVersion((value) => value + 1)}
                >
                    Tentar novamente
                </button>
            </section>
        );
    }

    return (
        <section className="form-panel">
            <h2>Consentimentos</h2>
            <p>Controla escolhas opcionais associadas à tua conta.</p>
            <p className="muted-text">
                Os avisos essenciais de segurança, subscrição e conta mantêm-se
                ativos mesmo quando desligas os alertas opcionais de continuidade.
            </p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form
                className="preference-list app-form app-form--compact"
                onSubmit={handleSubmit}
                aria-busy={saving}
            >
                {Object.entries(CONSENT_LABELS).map(([key, label]) => (
                    <label className="switch-row" key={key}>
                        <span>{label}</span>
                        <input
                            type="checkbox"
                            checked={Boolean(consents?.[key])}
                            onChange={() => toggleConsent(key)}
                            disabled={saving}
                        />
                    </label>
                ))}
                <button type="submit" disabled={saving}>
                    {saving ? "A guardar..." : "Guardar consentimentos"}
                </button>
            </form>
            {updatedAt ? (
                <p className="muted-text">
                    Última atualização: {new Date(updatedAt).toLocaleString("pt-PT")}
                </p>
            ) : null}
        </section>
    );
}
