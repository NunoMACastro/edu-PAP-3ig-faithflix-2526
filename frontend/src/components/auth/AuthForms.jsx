/**
 * @file Ficheiro `real_dev/frontend/src/components/auth/AuthForms.jsx` da implementação real_dev.
 */

import { useState } from "react";
import { useSession } from "../../context/SessionContext.jsx";
import { authApi } from "../../services/api/authApi.js";

const INITIAL_FORM = { name: "", email: "", password: "", token: "" };

const MODE_LABELS = {
    login: "Entrar",
    register: "Registo",
    forgot: "Recuperar",
    reset: "Repor",
};

/**
 * Authentication forms for login, register and password recovery.
 *
 * @returns {JSX.Element} Painel de autenticação ligado à API real da MF2.
 */
export function AuthForms() {
    const { refreshSession } = useSession();
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    /**
     * Atualiza o campo editado no formulário de autenticação.
     *
     * O `name` do input escolhe a propriedade do estado, permitindo reutilizar o
     * mesmo handler nos modos de login, registo e recuperação.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event Evento emitido pelo input.
     * @returns {void} Não devolve valor; atualiza o estado do formulário.
     */
    function updateField(event) {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
        }));
    }

    /**
     * Submete o fluxo de autenticação ativo.
     *
     * A função escolhe entre registo, login, pedido de recuperação ou reposição
     * de palavra-passe conforme o modo selecionado.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento de submissão do formulário.
     * @returns {Promise<void>} Termina depois de concluir o fluxo ou apresentar erro.
     */
    async function submit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setStatus("");

        try {
            if (mode === "register") {
                await authApi.register({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                });
                await refreshSession();
                setStatus("Conta criada e sessão iniciada.");
            }

            if (mode === "login") {
                await authApi.login({
                    email: form.email,
                    password: form.password,
                });
                await refreshSession();
                setStatus("Sessão iniciada.");
            }

            if (mode === "forgot") {
                const response = await authApi.forgotPassword({
                    email: form.email,
                });
                setStatus(response.message);
            }

            if (mode === "reset") {
                await authApi.resetPassword({
                    token: form.token,
                    password: form.password,
                });
                setStatus("Palavra-passe atualizada. Já podes iniciar sessão.");
            }
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="auth-panel" data-testid="auth-form">
            <div className="auth-tabs" aria-label="Autenticação">
                {Object.entries(MODE_LABELS).map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        className={mode === key ? "active" : ""}
                        onClick={() => {
                            setMode(key);
                            setError("");
                            setStatus("");
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <form onSubmit={submit} className="auth-form">
                {mode === "register" ? (
                    <label>
                        Nome
                        <input
                            data-testid="name-input"
                            name="name"
                            value={form.name}
                            onChange={updateField}
                            autoComplete="name"
                        />
                    </label>
                ) : null}

                {mode !== "reset" ? (
                    <label>
                        Email
                        <input
                            data-testid="email-input"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={updateField}
                            autoComplete="email"
                        />
                    </label>
                ) : null}

                {mode === "reset" ? (
                    <label>
                        Token
                        <input
                            data-testid="token-input"
                            name="token"
                            value={form.token}
                            onChange={updateField}
                        />
                    </label>
                ) : null}

                {mode !== "forgot" ? (
                    <label>
                        Palavra-passe
                        <input
                            data-testid="password-input"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={updateField}
                            autoComplete={
                                mode === "register"
                                    ? "new-password"
                                    : "current-password"
                            }
                        />
                    </label>
                ) : null}

                <button
                    data-testid={
                        mode === "login" ? "login-submit" : `${mode}-submit`
                    }
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "A validar..." : "Confirmar"}
                </button>
            </form>

            {status ? (
                <p className="form-status" role="status">
                    {status}
                </p>
            ) : null}
            {error ? (
                <p className="form-error" role="alert">
                    {error}
                </p>
            ) : null}
        </section>
    );
}
