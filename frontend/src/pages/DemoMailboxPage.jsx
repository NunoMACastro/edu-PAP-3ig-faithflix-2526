/**
 * @file Caixa de email local para demonstrar reset e notificações sem envio real.
 */

import { useEffect, useRef, useState } from "react";
import { useSession } from "../context/SessionContext.jsx";
import { demoMailboxApi } from "../services/api/demoMailboxApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página demo-only para consultar a outbox pelo email da conta local.
 *
 * @returns {JSX.Element} Formulário e mensagens sem expor ids internos.
 */
export function DemoMailboxPage() {
    const { status: sessionStatus } = useSession();
    const [email, setEmail] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const activeControllerRef = useRef(null);

    useEffect(
        () => () => {
            activeControllerRef.current?.abort();
        },
        [],
    );

    /**
     * Consulta a caixa local e substitui integralmente o resultado anterior.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Submissão do formulário.
     * @returns {Promise<void>} Termina quando a resposta fica visível.
     */
    async function handleSubmit(event) {
        event.preventDefault();
        activeControllerRef.current?.abort();
        const controller = new AbortController();
        activeControllerRef.current = controller;
        setLoading(true);
        setError("");

        try {
            const response = await demoMailboxApi.list(email, {
                signal: controller.signal,
                // Sem sessão o POST read-only passa apenas pelo guard de Origin;
                // com cookie autenticado conserva a proteção CSRF normal.
                csrf: sessionStatus !== "anonymous",
            });
            setMessages(response?.messages ?? []);
        } catch (requestError) {
            if (requestError?.code !== "REQUEST_ABORTED") {
                setMessages([]);
                setError(toUserMessage(requestError));
            }
        } finally {
            if (activeControllerRef.current === controller) {
                activeControllerRef.current = null;
                setLoading(false);
            }
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Mensagens</p>
            <h1>Caixa de email</h1>
            <p>
                Consulta as mensagens associadas à tua conta FaithFlix.
            </p>
            <form className="form-panel app-form app-form--compact" onSubmit={handleSubmit}>
                <label htmlFor="demo-mailbox-email">Email da conta</label>
                <input
                    id="demo-mailbox-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading || sessionStatus === "loading"}
                >
                    {loading
                        ? "A consultar..."
                        : sessionStatus === "loading"
                          ? "A confirmar sessão..."
                          : "Consultar caixa"}
                </button>
            </form>
            {error ? <p role="alert">{error}</p> : null}
            {!loading && !error && messages.length === 0 ? (
                <p>Não existem mensagens para apresentar.</p>
            ) : null}
            <div className="content-grid" aria-live="polite">
                {messages.map((message) => (
                    <article className="form-panel" key={message.id}>
                        <h2>{message.subject}</h2>
                        <p>{message.message}</p>
                        {message.resetToken ? (
                            <p>
                                Código de recuperação: <code>{message.resetToken}</code>
                            </p>
                        ) : null}
                        <p className="muted-text">
                            Criada em {new Date(message.createdAt).toLocaleString("pt-PT")}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}
