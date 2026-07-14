/**
 * @file Página pública de login, registo e recuperação da FaithFlix.
 */

import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AuthForms } from "../components/auth/AuthForms.jsx";
import { getSafeRedirectPath } from "../utils/authRedirect.js";

/**
 * Página pública de autenticação e recuperação de acesso.
 *
 * @returns {JSX.Element} Experiência pública de identidade numa única rota.
 */
export function LoginPage() {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const redirectTo = getSafeRedirectPath(searchParams.get("next"));

    return (
        <section className="auth-page">
            <div className="auth-page-inner">
                <div className="auth-editorial">
                    <div className="auth-editorial-copy">
                        <p className="section-kicker">Bem-vindo à FaithFlix</p>
                        <h1>A tua próxima história começa aqui.</h1>
                        <p>
                            Entra para acompanhar conteúdos, participar na
                            comunidade e descobrir o impacto solidário da FaithFlix.
                        </p>
                        <Link className="auth-catalog-link" to="/catalogo">
                            Explorar o catálogo
                            <span aria-hidden="true"> →</span>
                        </Link>
                    </div>
                    <div className="auth-editorial-mark" aria-hidden="true">
                        <span>F</span>
                    </div>
                </div>

                <div className="auth-access-surface">
                    {location.state?.accountDeleted ? (
                        <p className="auth-account-notice" role="status">
                            Conta eliminada e sessão terminada.
                        </p>
                    ) : null}
                    <AuthForms redirectTo={redirectTo} />
                </div>
            </div>
        </section>
    );
}
