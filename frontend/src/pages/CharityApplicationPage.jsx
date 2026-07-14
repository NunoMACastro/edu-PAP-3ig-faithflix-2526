/**
 * @file Candidatura pública de associações com contexto e feedback acessível.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const INITIAL_FORM = {
    name: "",
    contactName: "",
    email: "",
    phone: "",
    mission: "",
    websiteUrl: "",
};

/**
 * Página pública para submeter uma candidatura à revisão FaithFlix.
 *
 * @returns {JSX.Element} Formulário controlado ou confirmação de receção.
 */
export function CharityApplicationPage() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const requestRef = useRef(null);

    useEffect(() => () => requestRef.current?.abort(), []);

    /**
     * Atualiza um único campo sem perder os restantes dados introduzidos.
     *
     * @param {keyof typeof INITIAL_FORM} field Campo do formulário.
     * @param {string} value Novo valor.
     * @returns {void}
     */
    function updateField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    /**
     * Submete a candidatura uma única vez e ignora respostas depois do unmount.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Submissão do formulário.
     * @returns {Promise<void>}
     */
    async function handleSubmit(event) {
        event.preventDefault();
        if (submitting) return;

        const controller = new AbortController();
        requestRef.current = controller;
        setSubmitting(true);
        setError("");

        try {
            await charitiesApi.submitApplication(form, {
                signal: controller.signal,
            });
            if (!controller.signal.aborted) setSubmitted(true);
        } catch (requestError) {
            if (!controller.signal.aborted && requestError?.code !== "REQUEST_ABORTED") {
                setError(toUserMessage(requestError));
            }
        } finally {
            if (requestRef.current === controller) requestRef.current = null;
            if (!controller.signal.aborted) setSubmitting(false);
        }
    }

    /**
     * Reabre o formulário vazio apenas quando o utilizador pede nova submissão.
     *
     * @returns {void}
     */
    function startAnotherApplication() {
        setForm(INITIAL_FORM);
        setError("");
        setSubmitted(false);
        setSubmitting(false);
    }

    return (
        <div className="charity-application-page">
            <aside className="charity-application-intro" aria-labelledby="charity-application-title">
                <Link className="charity-application-back" to="/associacoes">
                    <span aria-hidden="true">←</span> Voltar às associações
                </Link>
                <p className="section-kicker">Candidatura</p>
                <h1 id="charity-application-title">Candidatura de associação</h1>
                <p>
                    Conta-nos quem são, qual é a missão da organização e como a
                    equipa FaithFlix pode conhecer melhor o vosso trabalho.
                </p>
                <div className="charity-application-notes">
                    <h2>Antes de começar</h2>
                    <ul>
                        <li>A candidatura será analisada pela equipa FaithFlix.</li>
                        <li>O envio não representa aprovação automática.</li>
                        <li>Os contactos ficam reservados ao processo de revisão.</li>
                    </ul>
                </div>
            </aside>

            <section className="charity-application-panel" aria-label="Formulário de candidatura">
                {submitted ? (
                    <div className="charity-application-success" role="status">
                        <span aria-hidden="true">✓</span>
                        <p className="section-kicker">Recebida</p>
                        <h2>Candidatura submetida para revisão.</h2>
                        <p>
                            A equipa FaithFlix recebeu os dados. Uma decisão será
                            tomada através do processo de revisão existente.
                        </p>
                        <div className="button-row">
                            <Link className="button-link" to="/associacoes">
                                Voltar às associações
                            </Link>
                            <button type="button" onClick={startAnotherApplication}>
                                Submeter outra candidatura
                            </button>
                        </div>
                    </div>
                ) : (
                    <form className="charity-application-form app-form app-form--contained" onSubmit={handleSubmit} aria-busy={submitting}>
                        <div className="charity-application-form-heading">
                            <p className="section-kicker">A organização</p>
                            <h2>Dados da candidatura</h2>
                            <p>Todos os campos obrigatórios são validados novamente pelo servidor.</p>
                        </div>

                        {error ? <p className="status-message status-message-error" role="alert">{error}</p> : null}

                        <div className="charity-application-fields">
                            <label htmlFor="charity-application-name">
                                Nome da associação
                                <input
                                    id="charity-application-name"
                                    name="name"
                                    value={form.name}
                                    onChange={(event) => updateField("name", event.target.value)}
                                    minLength={3}
                                    maxLength={120}
                                    autoComplete="organization"
                                    disabled={submitting}
                                    required
                                />
                            </label>
                            <label htmlFor="charity-application-contact-name">
                                Contacto principal
                                <input
                                    id="charity-application-contact-name"
                                    name="contactName"
                                    value={form.contactName}
                                    onChange={(event) => updateField("contactName", event.target.value)}
                                    minLength={3}
                                    maxLength={120}
                                    autoComplete="name"
                                    disabled={submitting}
                                    required
                                />
                            </label>
                            <div className="charity-application-field-row">
                                <label htmlFor="charity-application-email">
                                    Email
                                    <input
                                        id="charity-application-email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={(event) => updateField("email", event.target.value)}
                                        maxLength={254}
                                        autoComplete="email"
                                        disabled={submitting}
                                        required
                                    />
                                </label>
                                <label htmlFor="charity-application-phone">
                                    Telefone <span className="field-optional">(opcional)</span>
                                    <input
                                        id="charity-application-phone"
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={(event) => updateField("phone", event.target.value)}
                                        maxLength={40}
                                        autoComplete="tel"
                                        disabled={submitting}
                                    />
                                </label>
                            </div>
                            <label htmlFor="charity-application-mission">
                                Missão
                                <textarea
                                    id="charity-application-mission"
                                    name="mission"
                                    value={form.mission}
                                    onChange={(event) => updateField("mission", event.target.value)}
                                    minLength={30}
                                    maxLength={1200}
                                    rows={7}
                                    aria-describedby="charity-mission-help"
                                    disabled={submitting}
                                    required
                                />
                                <span className="field-help" id="charity-mission-help">
                                    Entre 30 e 1200 caracteres.
                                </span>
                            </label>
                            <label htmlFor="charity-application-website">
                                Website <span className="field-optional">(opcional)</span>
                                <input
                                    id="charity-application-website"
                                    name="websiteUrl"
                                    type="url"
                                    value={form.websiteUrl}
                                    onChange={(event) => updateField("websiteUrl", event.target.value)}
                                    maxLength={500}
                                    placeholder="https://"
                                    autoComplete="url"
                                    disabled={submitting}
                                />
                            </label>
                        </div>
                        <button className="charity-application-submit" type="submit" disabled={submitting}>
                            {submitting ? "A submeter..." : "Submeter candidatura"}
                        </button>
                    </form>
                )}
            </section>
        </div>
    );
}
