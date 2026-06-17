/**
 * @file Ficheiro `real_dev/frontend/src/pages/AccountPage.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { userApi } from "../services/api/userApi.js";
import { PrivacyExportPanel } from "../components/privacy/PrivacyExportPanel.jsx";


/**
 * Authenticated account page with profile and parental settings.
 *
 * @returns {JSX.Element} Página de conta.
 */
export function AccountPage() {
    const [name, setName] = useState("");
    const [parentalMaxAgeRating, setParentalMaxAgeRating] = useState(18);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        userApi
            .getMe()
            .then((response) => {
                setUser(response.user);
                setName(response.user.name);
                setParentalMaxAgeRating(response.user.parentalMaxAgeRating);
            })
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Documenta `handleProfileSubmit`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} event Valor recebido por `handleProfileSubmit`.
     * @returns {Promise<unknown>} Resultado devolvido por `handleProfileSubmit`.
     */
    async function handleProfileSubmit(event) {
        event.preventDefault();
        setStatus("");
        setError("");

        try {
            const response = await userApi.updateMe({ name });
            setUser(response.user);
            setStatus("Perfil atualizado.");
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    /**
     * Documenta `handleParentalSubmit`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} event Valor recebido por `handleParentalSubmit`.
     * @returns {Promise<unknown>} Resultado devolvido por `handleParentalSubmit`.
     */
    async function handleParentalSubmit(event) {
        event.preventDefault();
        setStatus("");
        setError("");

        try {
            const response = await userApi.updateParental(
                Number(parentalMaxAgeRating),
            );
            setUser(response.user);
            setStatus("Controlo parental atualizado.");
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    if (loading) {
        return (
            <section className="page-section">
                <p>A carregar conta...</p>
            </section>
        );
    }

    return (
        <section className="page-section narrow-section">
            <p className="section-kicker">Conta</p>
            <h1>A minha conta</h1>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form className="form-panel" onSubmit={handleProfileSubmit}>
                <label>
                    Nome
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </label>
                <button type="submit">Guardar perfil</button>
            </form>
            <form className="form-panel" onSubmit={handleParentalSubmit}>
                <label>
                    Limite parental
                    <input
                        min="0"
                        max="18"
                        type="number"
                        value={parentalMaxAgeRating}
                        onChange={(event) =>
                            setParentalMaxAgeRating(event.target.value)
                        }
                    />
                </label>
                <button type="submit">Guardar limite</button>
            </form>
            {user ? (
                <dl className="meta-list">
                    <dt>Email</dt>
                    <dd>{user.email}</dd>
                    <dt>Role</dt>
                    <dd>{user.role}</dd>
                </dl>
            ) : null}

            <PrivacyExportPanel />
        </section>
            
    );
}
