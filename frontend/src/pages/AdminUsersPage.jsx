/**
 * @file Ficheiro `real_dev/frontend/src/pages/AdminUsersPage.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { userApi } from "../services/api/userApi.js";

const ROLES = ["user", "moderator", "admin"];
const STATUSES = ["active", "blocked"];

/**
 * Página administrativa mínima para gestão de roles de utilizadores.
 *
 * @returns {JSX.Element} Página administrativa de utilizadores.
 */
export function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    /**
     * Carrega utilizadores para a tabela administrativa.
     *
     * Os filtros opcionais vêm do formulário da página e a resposta substitui o
     * estado local de utilizadores.
     *
     * @param {{ search?: string, status?: string }} filters Filtros de pesquisa aplicados à listagem.
     * @returns {Promise<void>} Termina depois de atualizar a lista local.
     */
    async function loadUsers(filters = {}) {
        const response = await userApi.listUsers(filters);
        setUsers(response.users);
    }

    useEffect(() => {
        loadUsers()
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Atualiza o papel de uma conta na tabela administrativa.
     *
     * Após a resposta da API, troca apenas o utilizador alterado no estado local
     * para preservar a lista já carregada.
     *
     * @param {string} userId Identificador do utilizador alvo.
     * @param {string} role Novo papel administrativo.
     * @returns {Promise<void>} Termina depois de atualizar estado local ou erro.
     */
    async function handleRoleChange(userId, role) {
        setError("");
        setStatus("");

        try {
            const response = await userApi.updateUserAdmin(userId, { role });
            setUsers((current) =>
                current.map((user) =>
                    user.id === userId ? response.user : user,
                ),
            );
            setStatus("Role atualizada.");
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    /**
     * Atualiza o estado operacional de uma conta.
     *
     * @param {string} userId Identificador do utilizador alvo.
     * @param {string} accountStatus Novo estado.
     * @returns {Promise<void>} Termina depois de atualizar estado local.
     */
    async function handleStatusChange(userId, accountStatus) {
        setError("");
        setStatus("");

        try {
            const response = await userApi.updateUserAdmin(userId, {
                accountStatus,
            });
            setUsers((current) =>
                current.map((user) =>
                    user.id === userId ? response.user : user,
                ),
            );
            setStatus("Estado atualizado.");
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    /**
     * Aplica filtros administrativos.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulario.
     * @returns {Promise<void>} Termina depois de recarregar a lista.
     */
    async function handleFilterSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");
        setStatus("");

        try {
            await loadUsers({ search, status: statusFilter });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Utilizadores</h1>
            {loading ? <p>A carregar utilizadores...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form className="filter-bar" onSubmit={handleFilterSubmit}>
                <label>
                    Pesquisa
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Nome ou email"
                    />
                </label>
                <label>
                    Estado
                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="">Todos</option>
                        {STATUSES.map((accountStatus) => (
                            <option key={accountStatus} value={accountStatus}>
                                {accountStatus}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit">Filtrar</button>
            </form>
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(event) =>
                                            handleRoleChange(
                                                user.id,
                                                event.target.value,
                                            )
                                        }
                                    >
                                        {ROLES.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        value={user.accountStatus ?? "active"}
                                        onChange={(event) =>
                                            handleStatusChange(
                                                user.id,
                                                event.target.value,
                                            )
                                        }
                                    >
                                        {STATUSES.map((accountStatus) => (
                                            <option
                                                key={accountStatus}
                                                value={accountStatus}
                                            >
                                                {accountStatus}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
