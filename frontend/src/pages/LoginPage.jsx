/**
 * @file Ficheiro `real_dev/frontend/src/pages/LoginPage.jsx` da implementação real_dev.
 */

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
            <p>Cria conta, inicia sessão ou recupera o acesso com segurança.</p>
            <AuthForms />
        </section>
    );
}
