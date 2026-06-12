import { AuthForms } from "../components/auth/AuthForms.jsx";

/**
 * Authentication page for MF2.
 *
 * @returns {JSX.Element} Login/register/recovery page.
 */
export function LoginPage() {
    return (
        <section className="page-section narrow-section">
            <p className="section-kicker">Identidade</p>
            <h1>Entrar no FaithFlix</h1>
            <p>Cria conta, inicia sessao ou recupera o acesso com seguranca.</p>
            <AuthForms />
        </section>
    );
}
