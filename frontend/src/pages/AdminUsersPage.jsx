// apps/frontend/src/pages/AdminUsersPage.jsx
import { useEffect, useState } from "react";
import { userApi } from "../services/api/userApi.js";

const ROLES = ["user", "moderator", "admin"];
const STATUSES = ["active", "blocked"];

/**
 * Página admin para gestão operacional de utilizadores.
 *
 * @returns {JSX.Element} Tabela admin com filtros e ações.
 */
export function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    /**
     * Carrega utilizadores com os filtros atuais.
     *
     * @returns {Promise<void>} Termina quando a tabela é atualizada.
     */
    async function loadUsers() {
        setLoading(true);
        const response = await userApi.listUsers({ search, status: statusFilter });
        setUsers(response.users);
        setLoading(false);
    }

    useEffect(() => {
        loadUsers().catch((requestError) => {
            setError(requestError.message);
            setLoading(false);
        });
    }, []);

    /**
     * Atualiza role ou estado de um utilizador.
     *
     * @param {string} userId Id do utilizador alvo.
     * @param {Record<string, string>} input Alteração a enviar.
     * @returns {Promise<void>} Termina quando a linha é atualizada.
     */
    async function updateUser(userId, input) {
        setSavingId(userId);
        setError("");
        setStatus("");

        try {
            const response = await userApi.updateUserAdmin(userId, input);
            setUsers((current) =>
                current.map((user) =>
                    user.id === userId ? response.user : user,
                ),
            );
            setStatus("Utilizador atualizado.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSavingId("");
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Utilizadores</h1>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form
                className="form-panel"
                onSubmit={(event) => {
                    event.preventDefault();
                    loadUsers().catch((requestError) => setError(requestError.message));
                }}
            >
                <label>
                    Pesquisa
                    <input value={search} onChange={(event) => setSearch(event.target.value)} />
                </label>
                <label>
                    Estado
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                        <option value="">Todos</option>
                        {STATUSES.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </label>
                <button type="submit">Filtrar</button>
            </form>
            {loading ? <p>A carregar utilizadores...</p> : null}
            {!loading && users.length === 0 ? <p>Nenhum utilizador encontrado.</p> : null}
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
                                        disabled={savingId === user.id}
                                        onChange={(event) => updateUser(user.id, { role: event.target.value })}
                                    >
                                        {ROLES.map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        value={user.accountStatus ?? "active"}
                                        disabled={savingId === user.id}
                                        onChange={(event) => updateUser(user.id, { accountStatus: event.target.value })}
                                    >
                                        {STATUSES.map((item) => (
                                            <option key={item} value={item}>{item}</option>
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