/**
 * @file Página de conta autenticada com perfil, controlo parental e privacidade.
 */

import { useEffect, useRef, useState } from "react";
import { AccountSubscriptionPanel } from "../components/account/AccountSubscriptionPanel.jsx";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { PrivacyConsentsPanel } from "../components/privacy/PrivacyConsentsPanel.jsx";
import { PrivacyDangerZone } from "../components/privacy/PrivacyDangerZone.jsx";
import { PrivacyExportPanel } from "../components/privacy/PrivacyExportPanel.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { subscriptionsApi } from "../services/api/subscriptionsApi.js";
import { userApi } from "../services/api/userApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const ROLE_LABELS = {
    admin: "Administrador",
    moderator: "Moderador",
    user: "Utilizador",
};

/**
 * Traduz uma role técnica para texto visível em português de Portugal.
 *
 * @param {string} role Role persistida no backend.
 * @returns {string} Texto visível para o utilizador.
 */
function formatRole(role) {
    return ROLE_LABELS[role] ?? "Utilizador";
}

/**
 * Formata uma data da subscrição sem permitir que valores inválidos interrompam a conta.
 *
 * @param {unknown} value Data recebida da API.
 * @returns {string} Data legível ou fallback do ciclo atual.
 */
function formatAccountDate(value) {
    if (!value) return "ao fim do período atual";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "ao fim do período atual";
    return new Intl.DateTimeFormat("pt-PT", { dateStyle: "long" }).format(date);
}

/**
 * Mostra e atualiza dados da conta autenticada.
 *
 * @returns {JSX.Element} Página de conta.
 */
export function AccountPage() {
    const [name, setName] = useState("");
    const [parentalMaxAgeRating, setParentalMaxAgeRating] = useState("18");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState("");
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const [subscription, setSubscription] = useState(null);
    const [access, setAccess] = useState(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);
    const [subscriptionError, setSubscriptionError] = useState("");
    const [subscriptionStatus, setSubscriptionStatus] = useState("");
    const [subscriptionReloadVersion, setSubscriptionReloadVersion] = useState(0);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const mountedRef = useRef(true);
    const savingRef = useRef(false);
    const mutationControllersRef = useRef(new Set());

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            for (const controller of mutationControllersRef.current) {
                controller.abort();
            }
            mutationControllersRef.current.clear();
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;

        /**
         * Carrega a conta do utilizador autenticado.
         *
         * @returns {Promise<void>} Termina depois de preencher formulário e resumo.
         */
        async function loadAccount() {
            try {
                const response = await userApi.getMe({
                    signal: controller.signal,
                });

                if (active) {
                    setUser(response.user);
                    setName(response.user.name);
                    setParentalMaxAgeRating(
                        String(response.user.parentalMaxAgeRating),
                    );
                }
            } catch (requestError) {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setError(toUserMessage(requestError));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadAccount();

        return () => {
            active = false;
            controller.abort();
        };
    }, [reloadVersion]);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setSubscriptionLoading(true);
        setSubscriptionError("");

        subscriptionsApi
            .getMine({ signal: controller.signal })
            .then((response) => {
                if (!active) return;
                const ownSubscription = response?.subscription ?? null;
                setSubscription(ownSubscription);
                setAccess(response?.access ?? ownSubscription);
            })
            .catch((requestError) => {
                if (active && requestError?.code !== "REQUEST_ABORTED") {
                    setSubscriptionError(toUserMessage(requestError));
                }
            })
            .finally(() => {
                if (active) setSubscriptionLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [subscriptionReloadVersion]);

    /**
     * Guarda nome público do utilizador autenticado.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
     * @returns {Promise<void>} Termina quando a API responde.
     */
    async function handleProfileSubmit(event) {
        event.preventDefault();
        if (savingRef.current) return;

        setStatus("");
        setError("");
        savingRef.current = true;
        setSaving("profile");
        const controller = new AbortController();
        mutationControllersRef.current.add(controller);

        try {
            // A rota usa a sessão atual; a UI não envia userId nem tenta alterar outra conta.
            const response = await userApi.updateMe(
                { name: name.trim() },
                { signal: controller.signal },
            );
            if (mountedRef.current) {
                setUser(response.user);
                setName(response.user.name);
                setStatus("Perfil atualizado.");
            }
        } catch (requestError) {
            if (
                mountedRef.current &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setError(toUserMessage(requestError));
            }
        } finally {
            mutationControllersRef.current.delete(controller);
            savingRef.current = false;
            if (mountedRef.current) setSaving("");
        }
    }

    /**
     * Guarda limite parental da conta autenticada.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
     * @returns {Promise<void>} Termina quando a API responde.
     */
    async function handleParentalSubmit(event) {
        event.preventDefault();
        if (savingRef.current) return;

        setStatus("");
        setError("");

        const normalizedRating = String(parentalMaxAgeRating).trim();
        const parsedRating = Number(normalizedRating);

        if (
            normalizedRating === "" ||
            !Number.isInteger(parsedRating) ||
            parsedRating < 0 ||
            parsedRating > 18
        ) {
            setError("Seleciona um limite parental inteiro entre 0 e 18.");
            return;
        }

        savingRef.current = true;
        setSaving("parental");
        const controller = new AbortController();
        mutationControllersRef.current.add(controller);

        try {
            const response = await userApi.updateParental(
                parsedRating,
                { signal: controller.signal },
            );
            if (mountedRef.current) {
                setUser(response.user);
                setParentalMaxAgeRating(
                    String(response.user.parentalMaxAgeRating),
                );
                setStatus("Controlo parental atualizado.");
            }
        } catch (requestError) {
            if (
                mountedRef.current &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setError(toUserMessage(requestError));
            }
        } finally {
            mutationControllersRef.current.delete(controller);
            savingRef.current = false;
            if (mountedRef.current) setSaving("");
        }
    }

    /**
     * Cancela apenas a renovação futura, mantendo o acesso contratado.
     *
     * @returns {Promise<void>} Termina depois de atualizar o resumo local.
     */
    async function handleCancelRenewal() {
        if (savingRef.current) return;

        savingRef.current = true;
        setSaving("subscription");
        setSubscriptionError("");
        setSubscriptionStatus("");
        const controller = new AbortController();
        mutationControllersRef.current.add(controller);

        try {
            const response = await subscriptionsApi.cancelRenewal({
                signal: controller.signal,
            });
            if (mountedRef.current) {
                const updatedSubscription = response.subscription;
                setSubscription(updatedSubscription);
                setAccess((current) =>
                    current?.accessSource === "own"
                        ? { ...current, ...updatedSubscription, accessSource: "own" }
                        : current,
                );
                setSubscriptionStatus("Renovação cancelada para o fim do ciclo atual.");
                setCancelDialogOpen(false);
            }
        } catch (requestError) {
            if (mountedRef.current && requestError?.code !== "REQUEST_ABORTED") {
                setSubscriptionError(toUserMessage(requestError));
            }
        } finally {
            mutationControllersRef.current.delete(controller);
            savingRef.current = false;
            if (mountedRef.current) setSaving("");
        }
    }

    if (loading) {
        return (
            <section className="page-section account-page">
                <p role="status">A carregar conta...</p>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="page-section account-page">
                <p className="section-kicker">Conta</p>
                <h1>A minha conta</h1>
                {error ? (
                    <EmptyState title="Conta indisponível" description={error} tone="error">
                        <button
                            type="button"
                            onClick={() => setReloadVersion((value) => value + 1)}
                        >
                            Tentar novamente
                        </button>
                    </EmptyState>
                ) : null}
            </section>
        );
    }

    const profileChanged = name.trim() !== user.name;
    const parentalChanged = String(parentalMaxAgeRating) !== String(user.parentalMaxAgeRating);
    const accountInitial = user.name.trim().charAt(0).toLocaleUpperCase("pt-PT") || "U";
    const cancellationDate = access?.currentPeriodEnd ?? subscription?.currentPeriodEnd;

    return (
        <section className="page-section account-page">
            <header className="account-hero">
                <div className="account-hero-copy">
                    <p className="section-kicker">A tua área</p>
                    <h1>A minha conta</h1>
                    <p>Gere o perfil, o plano e as escolhas de privacidade num só lugar.</p>
                </div>
                <div className="account-identity-card">
                    <span className="account-avatar" aria-hidden="true">{accountInitial}</span>
                    <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        <small>{formatRole(user.role)}</small>
                    </div>
                </div>
            </header>

            {error ? <EmptyState title="Não foi possível atualizar a conta" description={error} tone="error" /> : null}
            {status ? <EmptyState title="Alteração guardada" description={status} tone="success" /> : null}

            <AccountSubscriptionPanel
                subscription={subscription}
                access={access}
                loading={subscriptionLoading}
                error={subscriptionError}
                status={subscriptionStatus}
                busy={saving === "subscription"}
                onRetry={() => setSubscriptionReloadVersion((value) => value + 1)}
                onRequestCancellation={() => setCancelDialogOpen(true)}
            />

            <section className="account-section" aria-labelledby="account-preferences-title">
                <header className="account-section-heading">
                    <div>
                        <p className="section-kicker">Preferências</p>
                        <h2 id="account-preferences-title">Perfil e visualização</h2>
                    </div>
                    <p>Atualiza como apareces na FaithFlix e o limite etário desta conta.</p>
                </header>
                <div className="account-settings-grid">
                    <form className="form-panel account-form-card app-form app-form--contained" onSubmit={handleProfileSubmit}>
                        <div>
                            <h3>Perfil</h3>
                            <p>Este é o nome apresentado na tua experiência FaithFlix.</p>
                        </div>
                        <label>
                            Nome
                            <input
                                maxLength="80"
                                minLength="2"
                                required
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </label>
                        <button type="submit" disabled={Boolean(saving) || !profileChanged}>
                            {saving === "profile" ? "A guardar..." : "Guardar perfil"}
                        </button>
                    </form>

                    <form className="form-panel account-form-card app-form app-form--contained" onSubmit={handleParentalSubmit}>
                        <div>
                            <h3>Controlo parental</h3>
                            <p>Restringe conteúdos acima da idade máxima definida para esta conta.</p>
                        </div>
                        <label>
                            Idade máxima permitida
                            <input
                                min="0"
                                max="18"
                                step="1"
                                required
                                type="number"
                                value={parentalMaxAgeRating}
                                onChange={(event) => setParentalMaxAgeRating(event.target.value)}
                            />
                        </label>
                        <button type="submit" disabled={Boolean(saving) || !parentalChanged}>
                            {saving === "parental" ? "A guardar..." : "Guardar limite"}
                        </button>
                    </form>
                </div>
            </section>

            <section className="account-section" aria-labelledby="account-privacy-title">
                <header className="account-section-heading">
                    <div>
                        <p className="section-kicker">Privacidade</p>
                        <h2 id="account-privacy-title">Dados e consentimentos</h2>
                    </div>
                    <p>Controla os teus dados e as escolhas opcionais associadas à conta.</p>
                </header>
                <div className="account-privacy-grid">
                    <PrivacyExportPanel />
                    <PrivacyConsentsPanel />
                    <PrivacyDangerZone />
                </div>
            </section>

            <ConfirmDialog
                open={cancelDialogOpen}
                title="Cancelar renovação"
                confirmLabel="Cancelar renovação"
                danger
                busy={saving === "subscription"}
                onCancel={() => saving !== "subscription" && setCancelDialogOpen(false)}
                onConfirm={handleCancelRenewal}
            >
                <p>A subscrição não será renovada no próximo ciclo.</p>
                <p>
                    Manténs o acesso até {formatAccountDate(cancellationDate)}.
                </p>
                {subscriptionError ? <p role="alert">{subscriptionError}</p> : null}
            </ConfirmDialog>
        </section>
    );
}
