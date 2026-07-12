/**
 * @file Ligação administrativa por pesquisa segura de utilizadores e associações.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { toUserMessage } from "../services/api/apiErrors.js";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { userApi } from "../services/api/userApi.js";

/**
 * Combobox cancelável com resultados navegáveis por teclado e seleção nominal.
 *
 * @param {{ label: string, helper: string, value: string, onChange: (value: string) => void, selected: Record<string, unknown> | null, onSelect: (item: Record<string, unknown> | null) => void, loadResults: (search: string, signal: AbortSignal) => Promise<Array>, resultLabel: (item: Record<string, unknown>) => string, disabled: boolean }} props Propriedades de pesquisa.
 * @returns {JSX.Element} Pesquisa ou resumo da entidade selecionada.
 */
function SearchCombobox({
    label,
    helper,
    value,
    onChange,
    selected,
    onSelect,
    loadResults,
    resultLabel,
    disabled,
}) {
    const inputId = useId();
    const helperId = useId();
    const listId = useId();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);

    useEffect(() => {
        setActiveIndex(-1);
        if (selected || value.trim().length < 2) {
            setResults([]);
            setError("");
            return undefined;
        }

        const controller = new AbortController();
        const timer = setTimeout(() => {
            setLoading(true);
            loadResults(value.trim(), controller.signal)
                .then((items) => setResults(items))
                .catch((requestError) => {
                    if (requestError?.code !== "REQUEST_ABORTED") {
                        setError(toUserMessage(requestError));
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [loadResults, selected, value]);

    function selectResult(result) {
        onSelect(result);
        setResults([]);
        setActiveIndex(-1);
    }

    function handleKeyDown(event) {
        if (!results.length) return;
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, results.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === "Enter" && activeIndex >= 0) {
            event.preventDefault();
            selectResult(results[activeIndex]);
        } else if (event.key === "Escape") {
            setResults([]);
            setActiveIndex(-1);
        }
    }

    if (selected) {
        const selectedLabel = resultLabel(selected);
        return (
            <div className="membership-entity-selected">
                <span className="membership-entity-mark" aria-hidden="true">
                    {selectedLabel.trim().charAt(0).toLocaleUpperCase("pt-PT")}
                </span>
                <div>
                    <span>{label} selecionado</span>
                    <strong>{selected.name ?? selectedLabel}</strong>
                    {selected.email ? <small>{selected.email}</small> : null}
                </div>
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        onSelect(null);
                        onChange("");
                    }}
                >
                    Alterar
                </button>
            </div>
        );
    }

    return (
        <div className="admin-combobox membership-combobox">
            <label htmlFor={inputId}>{label}</label>
            <p id={helperId} className="membership-combobox-helper">{helper}</p>
            <div className="membership-search-control">
                <span aria-hidden="true">⌕</span>
                <input
                    id={inputId}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls={listId}
                    aria-describedby={helperId}
                    aria-expanded={results.length > 0}
                    aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
                    value={value}
                    disabled={disabled}
                    placeholder="Escreve pelo menos 2 caracteres"
                    onChange={(event) => onChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            {loading ? <p role="status" className="membership-search-status">A pesquisar…</p> : null}
            {error ? <p role="alert" className="form-error">{error}</p> : null}
            {!loading && !error && value.trim().length >= 2 && results.length === 0 ? (
                <p className="membership-search-status">Sem resultados para esta pesquisa.</p>
            ) : null}
            {results.length ? (
                <ul id={listId} role="listbox" className="lookup-results membership-lookup-results">
                    {results.map((result, index) => (
                        <li key={result.id}>
                            <button
                                id={`${listId}-${index}`}
                                type="button"
                                role="option"
                                aria-selected={activeIndex === index}
                                className={activeIndex === index ? "is-active" : ""}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => selectResult(result)}
                            >
                                <span className="membership-result-mark" aria-hidden="true">
                                    {resultLabel(result).trim().charAt(0).toLocaleUpperCase("pt-PT")}
                                </span>
                                <span>{resultLabel(result)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}

/** @returns {JSX.Element} Autocomplete cancelável e confirmação nominal. */
export function AdminCharityMembersPage() {
    const [charitySearch, setCharitySearch] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [charity, setCharity] = useState(null);
    const [user, setUser] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const controllerRef = useRef(null);

    useEffect(() => () => controllerRef.current?.abort(), []);
    const loadCharities = useCallback(
        async (search, signal) =>
            (await charitiesApi.lookupAdminCharities(search, { signal })).charities ?? [],
        [],
    );
    const loadUsers = useCallback(
        async (search, signal) =>
            (await userApi.listUsers(
                { search, status: "active", page: 1, limit: 10 },
                { signal },
            )).users ?? [],
        [],
    );

    function resetSelection() {
        setCharitySearch("");
        setUserSearch("");
        setCharity(null);
        setUser(null);
        setResult(null);
        setError("");
    }

    async function linkMembership() {
        if (!charity || !user || submitting) return;
        const controller = new AbortController();
        controllerRef.current = controller;
        setSubmitting(true);
        setError("");
        try {
            const response = await charitiesApi.linkUserToCharity(
                charity.id,
                user.id,
                { signal: controller.signal },
            );
            setResult(response);
            setConfirmOpen(false);
        } catch (requestError) {
            if (requestError?.code !== "REQUEST_ABORTED") {
                setError(toUserMessage(requestError));
            }
        } finally {
            controllerRef.current = null;
            setSubmitting(false);
        }
    }

    const ready = Boolean(charity && user);

    return (
        <section className="page-section membership-page">
            <header className="admin-page-header">
                <div>
                    <p className="section-kicker">Solidariedade</p>
                    <h1>Membros de associações</h1>
                    <p>Concede acesso ao histórico privado através de uma seleção nominal e confirmada.</p>
                </div>
            </header>

            <div className="membership-workspace">
                <section className="membership-selection-panel" aria-labelledby="membership-selection-title">
                    <header>
                        <p className="section-kicker">Nova ligação</p>
                        <h2 id="membership-selection-title">Selecionar intervenientes</h2>
                        <p>Pesquisa uma associação elegível e uma conta ativa. Confirma os dados antes de conceder o acesso.</p>
                    </header>
                    <ol className="membership-progress" aria-label="Progresso da seleção">
                        <li className={charity ? "is-complete" : "is-current"}><span>1</span> Associação</li>
                        <li className={user ? "is-complete" : charity ? "is-current" : ""}><span>2</span> Utilizador</li>
                        <li className={ready ? "is-current" : ""}><span>3</span> Confirmar</li>
                    </ol>
                    <div className="membership-fields">
                        <SearchCombobox
                            label="Associação"
                            helper="Apenas associações ativas e elegíveis aparecem nos resultados."
                            value={charitySearch}
                            selected={charity}
                            disabled={submitting}
                            onChange={(value) => {
                                setCharitySearch(value);
                                setCharity(null);
                                setResult(null);
                            }}
                            onSelect={(item) => {
                                setCharity(item);
                                if (item) setCharitySearch(item.name);
                            }}
                            loadResults={loadCharities}
                            resultLabel={(item) => item.name}
                        />
                        <SearchCombobox
                            label="Utilizador"
                            helper="Pesquisa por nome ou email entre contas ativas."
                            value={userSearch}
                            selected={user}
                            disabled={submitting}
                            onChange={(value) => {
                                setUserSearch(value);
                                setUser(null);
                                setResult(null);
                            }}
                            onSelect={(item) => {
                                setUser(item);
                                if (item) setUserSearch(`${item.name} · ${item.email}`);
                            }}
                            loadResults={loadUsers}
                            resultLabel={(item) => `${item.name} · ${item.email}`}
                        />
                    </div>
                </section>

                <aside className={`membership-review-panel${ready ? " is-ready" : ""}`} aria-labelledby="membership-review-title">
                    {result ? (
                        <div className="membership-success" role="status">
                            <span aria-hidden="true">✓</span>
                            <p className="section-kicker">Ligação criada</p>
                            <h2 id="membership-review-title">Acesso concedido</h2>
                            <p><strong>{result.user?.name ?? user?.name}</strong> ({result.user?.email ?? user?.email}) foi ligado a <strong>{result.charity?.name ?? charity?.name}</strong>.</p>
                            <button type="button" onClick={resetSelection}>Criar outra ligação</button>
                        </div>
                    ) : ready ? (
                        <>
                            <p className="section-kicker">Resumo</p>
                            <h2 id="membership-review-title">Confirmar ligação</h2>
                            <div className="membership-link-preview">
                                <div><span>Utilizador</span><strong>{user.name}</strong><small>{user.email}</small></div>
                                <span aria-hidden="true">→</span>
                                <div><span>Associação</span><strong>{charity.name}</strong></div>
                            </div>
                            <p>Esta ação concede acesso ao histórico privado da associação.</p>
                            <button type="button" disabled={submitting} onClick={() => { setError(""); setConfirmOpen(true); }}>Ligar utilizador</button>
                        </>
                    ) : (
                        <EmptyState
                            title="A aguardar seleção"
                            description="O resumo da ligação aparecerá aqui depois de escolheres a associação e o utilizador."
                        />
                    )}
                </aside>
            </div>

            {error && !confirmOpen ? (
                <EmptyState title="Não foi possível criar a ligação" description={error} tone="error" />
            ) : null}
            <ConfirmDialog
                open={confirmOpen}
                title="Confirmar acesso à associação"
                confirmLabel="Criar ligação"
                busy={submitting}
                onCancel={() => !submitting && setConfirmOpen(false)}
                onConfirm={linkMembership}
            >
                <p>Ligar <strong>{user?.name}</strong> ({user?.email}) a <strong>{charity?.name}</strong>?</p>
                <p>Esta ação concede acesso ao histórico privado da associação.</p>
                {error ? <p role="alert" className="form-error">{error}</p> : null}
            </ConfirmDialog>
        </section>
    );
}
