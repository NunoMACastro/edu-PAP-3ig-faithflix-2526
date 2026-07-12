/**
 * @file Formulários públicos de identidade da FaithFlix.
 *
 * Mantém login e registo como escolhas principais e apresenta a recuperação
 * de palavra-passe de forma progressiva, sem expor tokens ou alterar os
 * contratos públicos da API.
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";
import { authApi } from "../../services/api/authApi.js";
import { toUserMessage } from "../../services/api/apiErrors.js";
import { resolveAuthenticatedPath } from "../../utils/authRedirect.js";

const INITIAL_FORM = { name: "", email: "", password: "", token: "" };

const MODE_CONTENT = {
    login: {
        eyebrow: "A tua conta",
        title: "Entrar na FaithFlix",
        description: "Continua a descobrir histórias escolhidas para ti.",
        submitLabel: "Entrar",
        loadingLabel: "A iniciar sessão...",
    },
    register: {
        eyebrow: "Primeiro passo",
        title: "Criar a minha conta",
        description: "Cria o teu acesso e começa a construir a tua biblioteca.",
        submitLabel: "Criar conta",
        loadingLabel: "A criar conta...",
    },
    forgot: {
        eyebrow: "Recuperar acesso",
        title: "Esqueceste-te da palavra-passe?",
        description:
            "Indica o email da conta. A resposta será sempre discreta e segura.",
        submitLabel: "Enviar instruções",
        loadingLabel: "A enviar...",
    },
    reset: {
        eyebrow: "Nova palavra-passe",
        title: "Definir nova palavra-passe",
        description:
            "Introduz o código recebido e escolhe uma nova palavra-passe.",
        submitLabel: "Atualizar palavra-passe",
        loadingLabel: "A atualizar...",
    },
};

/**
 * Authentication forms for login, register and password recovery.
 *
 * @param {{ redirectTo?: string | null }} props Propriedades do formulário.
 * @param {string | null} [props.redirectTo=null] Destino interno depois de autenticar.
 * @returns {JSX.Element} Painel de autenticação ligado aos serviços de identidade.
 */
export function AuthForms({ redirectTo = null }) {
    const navigate = useNavigate();
    const { refreshSession } = useSession();
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const activeRequestRef = useRef(null);
    const submittingRef = useRef(false);
    const mountedRef = useRef(true);
    const nameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const tokenInputRef = useRef(null);
    const previousModeRef = useRef(null);
    const modeContent = MODE_CONTENT[mode];

    useEffect(() => {
        if (previousModeRef.current === null) {
            previousModeRef.current = mode;
            return;
        }

        previousModeRef.current = mode;
        const firstInput =
            mode === "register"
                ? nameInputRef.current
                : mode === "reset"
                  ? tokenInputRef.current
                  : emailInputRef.current;

        firstInput?.focus();
    }, [mode]);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            activeRequestRef.current?.abort();
            activeRequestRef.current = null;
            submittingRef.current = false;
        };
    }, []);

    /**
     * Atualiza o campo editado no formulário de autenticação.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event Evento emitido pelo input.
     * @returns {void} Atualiza o estado controlado do formulário.
     */
    function updateField(event) {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    }

    /**
     * Troca o fluxo visível e elimina os valores que não devem atravessar modos.
     *
     * Email e nome permanecem para reduzir repetição; password e token são sempre
     * descartados quando o utilizador abandona o passo atual.
     *
     * @param {keyof typeof MODE_CONTENT} nextMode Próximo fluxo.
     * @returns {void}
     */
    function changeMode(nextMode) {
        if (submittingRef.current || nextMode === mode) {
            return;
        }

        setMode(nextMode);
        setForm((current) => ({
            ...current,
            password: "",
            token: "",
        }));
        setPasswordVisible(false);
        setError("");
        setStatus("");
    }

    /**
     * Regressa ao login depois de um reset confirmado pelo backend.
     *
     * @returns {void}
     */
    function completePasswordReset() {
        setMode("login");
        setForm((current) => ({
            ...current,
            password: "",
            token: "",
        }));
        setPasswordVisible(false);
        setError("");
        setStatus("Palavra-passe atualizada. Já podes iniciar sessão.");
    }

    /**
     * Submete o fluxo ativo, impedindo concorrência e cancelando-o no unmount.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento de submissão.
     * @returns {Promise<void>} Termina depois de atualizar sessão ou feedback.
     */
    async function submit(event) {
        event.preventDefault();

        if (submittingRef.current) {
            return;
        }

        const controller = new AbortController();
        submittingRef.current = true;
        activeRequestRef.current = controller;
        setLoading(true);
        setError("");
        setStatus("");

        try {
            if (mode === "register") {
                await authApi.register(
                    {
                        name: form.name,
                        email: form.email,
                        password: form.password,
                    },
                    { signal: controller.signal },
                );

                if (controller.signal.aborted || !mountedRef.current) return;
                const currentUser = await refreshSession();
                if (controller.signal.aborted || !mountedRef.current) return;
                setStatus("Conta criada e sessão iniciada.");
                navigate(resolveAuthenticatedPath(currentUser, redirectTo), { replace: true });
            } else if (mode === "login") {
                await authApi.login(
                    {
                        email: form.email,
                        password: form.password,
                    },
                    { signal: controller.signal },
                );

                if (controller.signal.aborted || !mountedRef.current) return;
                const currentUser = await refreshSession();
                if (controller.signal.aborted || !mountedRef.current) return;
                setStatus("Sessão iniciada.");
                navigate(resolveAuthenticatedPath(currentUser, redirectTo), { replace: true });
            } else if (mode === "forgot") {
                const response = await authApi.forgotPassword(
                    { email: form.email },
                    { signal: controller.signal },
                );

                if (controller.signal.aborted || !mountedRef.current) return;
                setStatus(response.message);
            } else {
                await authApi.resetPassword(
                    {
                        token: form.token,
                        password: form.password,
                    },
                    { signal: controller.signal },
                );

                if (controller.signal.aborted || !mountedRef.current) return;
                completePasswordReset();
            }
        } catch (requestError) {
            if (
                mountedRef.current &&
                !controller.signal.aborted &&
                requestError?.code !== "REQUEST_ABORTED"
            ) {
                setError(toUserMessage(requestError));
            }
        } finally {
            if (activeRequestRef.current === controller) {
                activeRequestRef.current = null;
                submittingRef.current = false;
                if (mountedRef.current) {
                    setLoading(false);
                }
            }
        }
    }

    return (
        <section className="auth-panel" data-testid="auth-form">
            <div className="auth-primary-modes" aria-label="Acesso à conta">
                <button
                    type="button"
                    className={mode === "login" ? "active" : ""}
                    aria-pressed={mode === "login"}
                    disabled={loading}
                    onClick={() => changeMode("login")}
                >
                    Entrar
                </button>
                <button
                    type="button"
                    className={mode === "register" ? "active" : ""}
                    aria-pressed={mode === "register"}
                    disabled={loading}
                    onClick={() => changeMode("register")}
                >
                    Criar conta
                </button>
            </div>

            <header className="auth-form-heading">
                <p>{modeContent.eyebrow}</p>
                <h2>{modeContent.title}</h2>
                <p>{modeContent.description}</p>
            </header>

            <form onSubmit={submit} className="auth-form app-form app-form--contained">
                {mode === "register" ? (
                    <div className="auth-field">
                        <label htmlFor="auth-name">Nome</label>
                        <input
                            ref={nameInputRef}
                            id="auth-name"
                            data-testid="name-input"
                            name="name"
                            value={form.name}
                            onChange={updateField}
                            autoComplete="name"
                            minLength={2}
                            maxLength={80}
                            required
                            disabled={loading}
                        />
                    </div>
                ) : null}

                {mode !== "reset" ? (
                    <div className="auth-field">
                        <label htmlFor="auth-email">Email</label>
                        <input
                            ref={emailInputRef}
                            id="auth-email"
                            data-testid="email-input"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={updateField}
                            autoComplete="email"
                            maxLength={254}
                            required
                            disabled={loading}
                        />
                    </div>
                ) : null}

                {mode === "reset" ? (
                    <div className="auth-field">
                        <label htmlFor="auth-token">Código de recuperação</label>
                        <input
                            ref={tokenInputRef}
                            id="auth-token"
                            data-testid="token-input"
                            name="token"
                            value={form.token}
                            onChange={updateField}
                            autoComplete="one-time-code"
                            inputMode="text"
                            minLength={64}
                            maxLength={64}
                            pattern="[A-Fa-f0-9]{64}"
                            required
                            disabled={loading}
                            spellCheck="false"
                        />
                        <p className="auth-field-help">
                            Utiliza o código completo recebido. Só pode ser usado uma vez.
                        </p>
                    </div>
                ) : null}

                {mode !== "forgot" ? (
                    <div className="auth-field">
                        <label htmlFor="auth-password">Palavra-passe</label>
                        <div className="auth-password-control">
                            <input
                                id="auth-password"
                                data-testid="password-input"
                                name="password"
                                type={passwordVisible ? "text" : "password"}
                                value={form.password}
                                onChange={updateField}
                                autoComplete={
                                    mode === "login"
                                        ? "current-password"
                                        : "new-password"
                                }
                                minLength={10}
                                maxLength={128}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="auth-password-toggle"
                                aria-label={
                                    passwordVisible
                                        ? "Ocultar palavra-passe"
                                        : "Mostrar palavra-passe"
                                }
                                aria-pressed={passwordVisible}
                                disabled={loading}
                                onClick={() =>
                                    setPasswordVisible((current) => !current)
                                }
                            >
                                {passwordVisible ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                        {mode !== "login" ? (
                            <p className="auth-field-help">
                                Usa entre 10 e 128 caracteres.
                            </p>
                        ) : null}
                    </div>
                ) : null}

                {mode === "login" ? (
                    <button
                        type="button"
                        className="auth-text-action auth-forgot-action"
                        disabled={loading}
                        onClick={() => changeMode("forgot")}
                    >
                        Esqueceste-te da palavra-passe?
                    </button>
                ) : null}

                <button
                    className="auth-submit"
                    data-testid={
                        mode === "login" ? "login-submit" : `${mode}-submit`
                    }
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? modeContent.loadingLabel
                        : modeContent.submitLabel}
                </button>
            </form>

            {status ? (
                <p className="form-status auth-feedback" role="status" aria-live="polite">
                    {status}
                </p>
            ) : null}
            {error ? (
                <p className="form-error auth-feedback" role="alert">
                    {error}
                </p>
            ) : null}

            {mode === "forgot" ? (
                <div className="auth-recovery-actions">
                    <button
                        type="button"
                        className="auth-text-action"
                        disabled={loading}
                        onClick={() => changeMode("reset")}
                    >
                        Já tenho um código
                    </button>
                    <button
                        type="button"
                        className="auth-text-action"
                        disabled={loading}
                        onClick={() => changeMode("login")}
                    >
                        Voltar a entrar
                    </button>
                </div>
            ) : null}

            {mode === "reset" ? (
                <div className="auth-recovery-actions">
                    <button
                        type="button"
                        className="auth-text-action"
                        disabled={loading}
                        onClick={() => changeMode("forgot")}
                    >
                        Pedir novo código
                    </button>
                    <button
                        type="button"
                        className="auth-text-action"
                        disabled={loading}
                        onClick={() => changeMode("login")}
                    >
                        Voltar a entrar
                    </button>
                </div>
            ) : null}
        </section>
    );
}
