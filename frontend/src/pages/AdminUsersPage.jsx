import { useEffect, useState } from "react";
import { userApi } from "../services/api/userApi.js";

const ROLES = ["user", "moderator", "admin"];

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  async function loadUsers() {
    const response = await userApi.listUsers();
    setUsers(response.users);
  }

  useEffect(() => {
    loadUsers().catch((requestError) => setError(requestError.message));
  }, []);

  async function handleRoleChange(userId, role) {
    setError("");
    try {
      const response = await userApi.updateRole(userId, role);
      setUsers((current) => current.map((user) => (user.id === userId ? response.user : user)));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="page-shell">
      <h1>Utilizadores</h1>
      {error && <p role="alert">{error}</p>}
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
                <select value={user.role} onChange={(event) => handleRoleChange(user.id, event.target.value)}>
                  {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}