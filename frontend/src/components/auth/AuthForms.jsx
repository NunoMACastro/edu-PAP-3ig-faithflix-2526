import { useState } from "react";
import { authApi } from "../../services/api/authApi.js";

const INITIAL_FORM = { name: "", email: "", password: "", token: "" };

export function AuthForms() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");

    try {
      if (mode === "register") {
        await authApi.register({ name: form.name, email: form.email, password: form.password });
        setStatus("Conta criada e sessao iniciada.");
      }

      if (mode === "login") {
        await authApi.login({ email: form.email, password: form.password });
        setStatus("Sessao iniciada.");
      }

      if (mode === "forgot") {
        const response = await authApi.forgotPassword({ email: form.email });
        setStatus(response.resetToken ? `Token de recuperacao: ${response.resetToken}` : response.message);
      }

      if (mode === "reset") {
        await authApi.resetPassword({ token: form.token, password: form.password });
        setStatus("Password atualizada. Ja podes iniciar sessao.");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-panel" data-testid="auth-form">
      <div className="auth-tabs" aria-label="Autenticacao">
        {["login", "register", "forgot", "reset"].map((item) => (
          <button key={item} type="button" className={mode === item ? "active" : ""} onClick={() => setMode(item)}>
            {item}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="auth-form">
        {mode === "register" ? (
          <label>
            Nome
            <input data-testid="name-input" name="name" value={form.name} onChange={updateField} autoComplete="name" />
          </label>
        ) : null}

        {mode !== "reset" ? (
          <label>
            Email
            <input data-testid="email-input" name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" />
          </label>
        ) : null}

        {mode === "reset" ? (
          <label>
            Token
            <input data-testid="token-input" name="token" value={form.token} onChange={updateField} />
          </label>
        ) : null}

        {mode !== "forgot" ? (
          <label>
            Password
            <input data-testid="password-input" name="password" type="password" value={form.password} onChange={updateField} autoComplete="current-password" />
          </label>
        ) : null}

        <button data-testid={mode === "login" ? "login-submit" : `${mode}-submit`} type="submit" disabled={loading}>
          {loading ? "A validar..." : "Confirmar"}
        </button>
      </form>

      {status ? <p className="form-status">{status}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
    </section>
  );
}