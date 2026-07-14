/**
 * @file Ficheiro `real_dev/frontend/src/pages/pages.jsx` da implementação real_dev.
 */

import { Link } from "react-router-dom";
import { BaseButton } from "../components/ui/BaseButton.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { TextField } from "../components/ui/TextField.jsx";

/**
 * Página inicial alternativa preservada para compatibilidade.
 *
 * @returns {JSX.Element} Página inicial do produto com estado técnico da API.
 */
export function HomePage() {
    return (
        <section className="page-section hero-section">
            <div className="hero-copy">
                <p className="section-kicker">
                    Streaming cristão com impacto social
                </p>
                <h1>FaithFlix</h1>
                <p>
                    Histórias que inspiram, uma experiência pensada para a
                    família e um impacto solidário que cresce com a comunidade.
                </p>
                <Link className="button-link" to="/catalogo">
                    Ver catálogo
                </Link>
            </div>
        </section>
    );
}

/**
 * Página alternativa de catálogo preservada para compatibilidade.
 *
 * @returns {JSX.Element} Página base de catálogo sem dados reais de catálogo.
 */
export function CatalogPage() {
    return (
        <section className="page-section">
            <p className="section-kicker">Catálogo</p>
            <h1>Catálogo FaithFlix</h1>
            <div className="card-grid">
                <ContentCard
                    eyebrow="Descobrir"
                    title="Histórias para todos"
                    description="Explora filmes, documentários, séries e episódios selecionados pela FaithFlix."
                />
                <ContentCard
                    eyebrow="Continuar"
                    title="A tua experiência"
                    description="Guarda favoritos, acompanha o progresso e regressa facilmente ao que estavas a ver."
                />
            </div>
        </section>
    );
}

/**
 * Pré-visualização de login sem autenticação real.
 *
 * @returns {JSX.Element} Formulário de login desativado que evita comportamento falso de autenticação.
 */
export function LoginPage() {
    return (
        <section className="page-section narrow-section">
            <p className="section-kicker">Identidade</p>
            <h1>Entrada na conta</h1>
            <form
                className="form-preview app-form app-form--compact"
                aria-label="Formulário de login ainda inativo"
            >
                <TextField
                    id="email-preview"
                    label="Email"
                    type="email"
                    disabled
                    placeholder="nome@exemplo.pt"
                />
                <TextField
                    id="password-preview"
                    label="Password"
                    type="password"
                    disabled
                    placeholder="A tua palavra-passe"
                />
                <BaseButton disabled>Entrar</BaseButton>
            </form>
        </section>
    );
}

/**
 * Página provisória de associações.
 *
 * @returns {JSX.Element} Estado vazio para fluxos futuros de candidatura de associações.
 */
export function AssociationsPage() {
    return (
        <EmptyState
            title="Associações"
            description="A candidatura e a pool solidária entram na macrofase de monetização solidária."
        />
    );
}

/**
 * Página provisória de planos.
 *
 * @returns {JSX.Element} Estado vazio para planos de subscrição futuros.
 */
export function PlansPage() {
    return (
        <EmptyState
            title="Planos"
            description="Escolhe a experiência FaithFlix mais adequada para ti ou para a tua família."
        />
    );
}

/**
 * Página provisória de conta.
 *
 * @returns {JSX.Element} Estado vazio para funcionalidades futuras de perfil e privacidade.
 */
export function AccountPage() {
    return (
        <EmptyState
            title="Conta"
            description="Perfil, consentimentos e dados pessoais dependem de autenticação segura."
        />
    );
}

/**
 * Página provisória de notificações.
 *
 * @returns {JSX.Element} Estado vazio para notificações transacionais futuras.
 */
export function NotificationsPage() {
    return (
        <EmptyState
            title="Notificações"
            description="As notificações transacionais entram depois dos fluxos principais estarem definidos."
        />
    );
}

/**
 * Página provisória de pesquisa.
 *
 * @returns {JSX.Element} Estado vazio para pesquisa unificada futura.
 */
export function SearchPage() {
    return (
        <EmptyState
            title="Pesquisa"
            description="A pesquisa unificada será ligada ao catálogo quando existirem conteúdos persistidos."
        />
    );
}

/**
 * Rota fallback para URLs desconhecidas do frontend.
 *
 * @returns {JSX.Element} Página amigável de recurso não encontrado.
 */
export function NotFoundPage() {
    return (
        <EmptyState
            title="Página não encontrada"
            description="Confirma o endereço ou volta ao início."
            headingLevel={1}
        >
            <Link className="button-link" to="/">
                Voltar ao início
            </Link>
        </EmptyState>
    );
}
