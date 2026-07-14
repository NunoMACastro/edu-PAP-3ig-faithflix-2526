/**
 * @file Gestão administrativa de contas com revisão conjunta de role e estado.
 */

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { toUserMessage } from "../services/api/apiErrors.js";
import { userApi } from "../services/api/userApi.js";

const PAGE_LIMIT = 20;
const ROLES = ["user", "moderator", "admin"];
const MUTABLE_STATUSES = ["active", "blocked"];
const FILTER_STATUSES = [...MUTABLE_STATUSES, "deleted"];
const ROLE_LABELS = { user: "Utilizador", moderator: "Moderador", admin: "Administrador" };
const STATUS_LABELS = { active: "Ativa", blocked: "Bloqueada", deleted: "Eliminada" };

/** @returns {JSX.Element} Tabela pesquisável e diálogo de gestão. */
export function AdminUsersPage() {
    const { user: sessionUser } = useSession();
    const searchParams = new URLSearchParams(window.location.search);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
    const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") ?? "");
    const [filters, setFilters] = useState(() => ({
        search: searchParams.get("search") ?? "",
        status: searchParams.get("status") ?? "",
    }));
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const [selected, setSelected] = useState(null);
    const [draft, setDraft] = useState({ role: "user", accountStatus: "active" });
    const [busy, setBusy] = useState(false);
    const controllerRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        userApi.listUsers({ ...filters, page, limit: PAGE_LIMIT }, { signal: controller.signal })
            .then((response) => {
                const totalPages = Math.max(response.totalPages ?? 1, 1);
                if (page > totalPages) { setPage(totalPages); return; }
                setUsers(response.users ?? []);
                setPagination({ page: response.page ?? page, total: response.total ?? 0, totalPages });
            })
            .catch((requestError) => {
                if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [filters, page, reloadVersion]);

    useEffect(() => () => controllerRef.current?.abort(), []);

    function openManagement(user) {
        setSelected(user);
        setDraft({ role: user.role, accountStatus: user.accountStatus ?? "active" });
        setError("");
        setStatus("");
    }

    async function saveUser() {
        if (!selected || busy) return;
        const changes = {};
        if (draft.role !== selected.role) changes.role = draft.role;
        if (draft.accountStatus !== (selected.accountStatus ?? "active")) changes.accountStatus = draft.accountStatus;
        if (Object.keys(changes).length === 0) { setSelected(null); return; }

        const controller = new AbortController();
        controllerRef.current = controller;
        setBusy(true);
        setError("");
        try {
            const response = await userApi.updateUserAdmin(selected.id, changes, { signal: controller.signal });
            setUsers((items) => items.map((item) => item.id === selected.id ? response.user : item));
            setStatus("Conta atualizada.");
            setSelected(null);
        } catch (requestError) {
            if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
        } finally {
            controllerRef.current = null;
            setBusy(false);
        }
    }

    function applyFilters(event) {
        event.preventDefault();
        setFilters({ search: search.trim(), status: statusFilter });
        setPage(1);
    }

    const changes = selected ? [
        draft.role !== selected.role ? `Papel: ${ROLE_LABELS[selected.role]} → ${ROLE_LABELS[draft.role]}` : null,
        draft.accountStatus !== (selected.accountStatus ?? "active") ? `Estado: ${STATUS_LABELS[selected.accountStatus ?? "active"]} → ${STATUS_LABELS[draft.accountStatus]}` : null,
    ].filter(Boolean) : [];

    return (
        <section className="page-section">
            <header className="admin-page-header"><div><p className="section-kicker">Utilizadores</p><h1>Contas e permissões</h1><p>Role e estado são revistos em conjunto antes de guardar.</p></div></header>
            <form className="filter-bar" onSubmit={applyFilters}><label>Pesquisa<input maxLength="80" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou email" /></label><label>Estado<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Todos</option>{FILTER_STATUSES.map((value) => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}</select></label><button type="submit" disabled={loading}>Filtrar</button></form>
            {loading ? <p role="status">A carregar utilizadores…</p> : null}
            {error && !selected ? <EmptyState title="Não foi possível carregar os utilizadores" description={error} tone="error"><button type="button" onClick={() => setReloadVersion((value) => value + 1)}>Tentar novamente</button></EmptyState> : null}
            {status ? <p role="status">{status}</p> : null}
            {!loading && !error && users.length === 0 ? <EmptyState title="Sem utilizadores" description="Não existem contas para os filtros aplicados." /> : null}

            {users.length ? <div className="table-wrap" role="region" aria-label="Tabela de utilizadores" tabIndex={0}><table><thead><tr><th>Nome</th><th>Email</th><th>Papel</th><th>Estado</th><th><span className="visually-hidden">Ações</span></th></tr></thead><tbody>{users.map((user) => {
                const isCurrentUser = user.id === sessionUser?.id;
                const isDeleted = user.accountStatus === "deleted";
                const actionLabel = isCurrentUser
                    ? "Conta atual"
                    : isDeleted
                      ? "Só leitura"
                      : "Gerir";

                return <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td><span className={`status-badge status-${user.role}`}>{ROLE_LABELS[user.role]}</span></td><td><span className={`status-badge status-${user.accountStatus ?? "active"}`}>{STATUS_LABELS[user.accountStatus ?? "active"]}</span></td><td><button type="button" disabled={isCurrentUser || isDeleted} onClick={() => openManagement(user)}>{actionLabel}</button></td></tr>;
            })}</tbody></table></div> : null}

            {pagination.totalPages > 1 ? <nav className="pagination" aria-label="Paginação de utilizadores"><button type="button" disabled={loading || page <= 1} onClick={() => setPage((value) => value - 1)}>Anterior</button><span>Página {pagination.page} de {pagination.totalPages} ({pagination.total})</span><button type="button" disabled={loading || page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Seguinte</button></nav> : null}

            <ConfirmDialog open={Boolean(selected)} title="Gerir conta" confirmLabel="Guardar alterações" busy={busy} danger={draft.accountStatus === "blocked"} onCancel={() => !busy && setSelected(null)} onConfirm={saveUser}>
                {selected ? <div className="user-management-form"><p><strong>{selected.name}</strong><br />{selected.email}</p><label>Papel<select value={draft.role} disabled={busy} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))}>{ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select></label><label>Estado<select value={draft.accountStatus} disabled={busy} onChange={(event) => setDraft((current) => ({ ...current, accountStatus: event.target.value }))}>{MUTABLE_STATUSES.map((value) => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}</select></label><section className="change-summary"><h3>Alterações a guardar</h3>{changes.length ? <ul>{changes.map((change) => <li key={change}>{change}</li>)}</ul> : <p>Sem alterações.</p>}</section>{draft.accountStatus === "blocked" && draft.accountStatus !== selected.accountStatus ? <p>Ao bloquear esta conta, as sessões ativas serão invalidadas.</p> : null}{error ? <p className="form-error" role="alert">{error}</p> : null}</div> : null}
            </ConfirmDialog>
        </section>
    );
}
