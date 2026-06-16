/**
 * @file Ficheiro `real_dev/frontend/src/pages/AdminUsersPage.jsx` da implementação real_dev.
 */

import { useEffect, useState } from "react";
import { userApi } from "../services/api/userApi.js";

const ROLES = ["user", "moderator", "admin"];

/**
 * Página administrativa mínima para gestão de roles de utilizadores.
 *
 * @returns {JSX.Element} Página administrativa de utilizadores.
 */
export function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /**
     * Documenta `loadUsers`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {Promise<unknown>} Resultado devolvido por `loadUsers`.
     */
    async function loadUsers() {
        const response = await userApi.listUsers();
        setUsers(response.users);
    }

    useEffect(() => {
        loadUsers()
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Documenta `handleRoleChange`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} userId Valor recebido por `handleRoleChange`.
     * @param {unknown} role Valor recebido por `handleRoleChange`.
     * @returns {Promise<unknown>} Resultado devolvido por `handleRoleChange`.
     */
    async function handleRoleChange(userId, role) {
        setError("");

        try {
            const response = await userApi.updateRole(userId, role);
            setUsers((current) =>
                current.map((user) =>
                    user.id === userId ? response.user : user,
                ),
            );
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Utilizadores</h1>
            {loading ? <p>A carregar utilizadores...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Role</th>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
