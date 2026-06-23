/**
 * @file Ficheiro `real_dev/frontend/src/pages/pages.jsx` da implementação real_dev.
 */

import { Link } from "react-router-dom";
import { ApiStatusBadge } from "../components/system/ApiStatusBadge.jsx";
import { BaseButton } from "../components/ui/BaseButton.jsx";
import { ContentCard } from "../components/ui/ContentCard.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { TextField } from "../components/ui/TextField.jsx";

/**
 * Página inicial da base frontend da MF1.
 *
 * @returns {JSX.Element} Página inicial do produto com estado técnico da API.
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
                    Experiencia web com identidade, catalogo, detalhe,
                    reproducao, progresso e biblioteca pessoal implementados
                    no core streaming MVP.
                </p>
                <Link className="button-link" to="/catalogo">
                    Ver catalogo
                </Link>
            </div>
            <ApiStatusBadge />
        </section>
    );
}

/**
 * Página provisória controlada para trabalho posterior do catálogo MF2.
 *
 * @returns {JSX.Element} Página base de catálogo sem dados reais de catálogo.
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
 * Página provisória de associações.
 *
 * @returns {JSX.Element} Estado vazio para fluxos futuros de candidatura de associações.
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
 * Página provisória de planos.
 *
 * @returns {JSX.Element} Estado vazio para planos de subscrição futuros.
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
 * Página provisória de conta.
 *
 * @returns {JSX.Element} Estado vazio para funcionalidades futuras de perfil e privacidade.
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
 * Página provisória de notificações.
 *
 * @returns {JSX.Element} Estado vazio para notificações transacionais futuras.
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
 * Página provisória de pesquisa.
 *
 * @returns {JSX.Element} Estado vazio para pesquisa unificada futura.
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
 * Rota fallback para URLs desconhecidas do frontend.
 *
 * @returns {JSX.Element} Página amigável de recurso não encontrado.
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
