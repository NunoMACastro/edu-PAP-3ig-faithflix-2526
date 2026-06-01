import { Link } from "react-router-dom";
import { ApiStatusBadge } from "../components/system/ApiStatusBadge.jsx";
import { BaseButton } from "../components/ui/BaseButton.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { TextField } from "../components/ui/TextField.jsx";

/**
 * Home page for the MF1 frontend foundation.
 *
 * @returns {JSX.Element} Initial product page with technical API status.
 */
export function HomePage() {
    return (
        <section className="page-section hero-section">
            <div className="hero-copy">
                <p className="section-kicker">
                    Streaming cristao com impacto social
                </p>
                <h1>FaithFlix</h1>
                <p>
                    Base inicial da experiencia web. Catalogo, streaming,
                    perfis, subscricoes e pool solidaria entram nos BKs
                    seguintes.
                </p>
                <Link className="button-link" to="/catalogo">
                    Ver estrutura do catalogo
                </Link>
            </div>
            <ApiStatusBadge />
        </section>
    );
}

/**
 * Controlled catalog placeholder page for later MF2 catalog work.
 *
 * @returns {JSX.Element} Catalog foundation page without real catalog data.
 */
export function CatalogPage() {
    return (
        <section className="page-section">
            <p className="section-kicker">Catalogo</p>
            <h1>Catalogo FaithFlix</h1>
            <div className="card-grid">
                <ContentCard
                    eyebrow="MF2"
                    title="Metadados de conteudo"
                    description="O CRUD de catalogo e taxonomias sera implementado nos BKs de core streaming."
                />
                <ContentCard
                    eyebrow="MF2"
                    title="Detalhe e reproducao"
                    description="A separacao entre metadados e reproducao sera tratada antes do player."
                />
            </div>
        </section>
    );
}

/**
 * Login preview page without real authentication.
 *
 * @returns {JSX.Element} Disabled login form that avoids false auth behaviour.
 */
export function LoginPage() {
    return (
        <section className="page-section narrow-section">
            <p className="section-kicker">Identidade</p>
            <h1>Entrada na conta</h1>
            <form
                className="form-preview"
                aria-label="Formulario de login ainda inativo"
            >
                <TextField
                    id="email-preview"
                    label="Email"
                    type="email"
                    disabled
                    placeholder="Ativado em MF2"
                />
                <TextField
                    id="password-preview"
                    label="Password"
                    type="password"
                    disabled
                    placeholder="Ativado em MF2"
                />
                <BaseButton disabled>Login disponivel em MF2</BaseButton>
            </form>
        </section>
    );
}

/**
 * Associations placeholder page.
 *
 * @returns {JSX.Element} Empty state for future charity application flows.
 */
export function AssociationsPage() {
    return (
        <EmptyState
            title="Associacoes"
            description="A candidatura e a pool solidaria entram na macrofase de monetizacao solidaria."
        />
    );
}

/**
 * Plans placeholder page.
 *
 * @returns {JSX.Element} Empty state for future subscription plans.
 */
export function PlansPage() {
    return (
        <EmptyState
            title="Planos"
            description="Os planos e a subscricao serao definidos sem inventar pagamentos reais nesta fase."
        />
    );
}

/**
 * Account placeholder page.
 *
 * @returns {JSX.Element} Empty state for future profile and privacy features.
 */
export function AccountPage() {
    return (
        <EmptyState
            title="Conta"
            description="Perfil, consentimentos e dados pessoais dependem de autenticacao segura."
        />
    );
}

/**
 * Notifications placeholder page.
 *
 * @returns {JSX.Element} Empty state for future transactional notifications.
 */
export function NotificationsPage() {
    return (
        <EmptyState
            title="Notificacoes"
            description="As notificacoes transacionais entram depois dos fluxos principais estarem definidos."
        />
    );
}

/**
 * Search placeholder page.
 *
 * @returns {JSX.Element} Empty state for future unified search.
 */
export function SearchPage() {
    return (
        <EmptyState
            title="Pesquisa"
            description="A pesquisa unificada sera ligada ao catalogo quando existirem conteudos persistidos."
        />
    );
}

/**
 * Fallback route for unknown frontend URLs.
 *
 * @returns {JSX.Element} User-friendly not-found page.
 */
export function NotFoundPage() {
    return (
        <EmptyState
            title="Pagina nao encontrada"
            description="Confirma o endereco ou volta ao inicio."
        >
            <Link className="button-link" to="/">
                Voltar ao inicio
            </Link>
        </EmptyState>
    );
}
