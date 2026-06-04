import { useEffect, useState } from "react";
import { userApi } from "../services/api/userApi.js";

export function AccountPage() {
  const [name, setName] = useState("");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    userApi.getMe()
      .then((response) => {
        setUser(response.user);
        setName(response.user.name);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  async function handleSubmit(event) {
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

  return (
    <main className="page-shell">
      <h1>A minha conta</h1>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="profile-name">Nome</label>
        <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
        <button type="submit">Guardar</button>
      </form>
      {user && (
        <dl>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Role</dt>
          <dd>{user.role}</dd>
        </dl>
      )}
    </main>
  );
}