// frontend/src/components/layout/AppHeader.jsx
/**
 * @file Cabeçalho principal com navegação FaithFlix.
 */

import { NavLink } from "react-router-dom";

const navItems = [
    { to: "/", label: "Início" },
    { to: "/catalogo", label: "Catálogo" },
    { to: "/biblioteca", label: "Biblioteca" },
    { to: "/pesquisa", label: "Pesquisa" },
    { to: "/para-si", label: "Para si" },
    { to: "/associacoes", label: "Associações" },
    { to: "/planos", label: "Planos" },
    { to: "/conta", label: "Conta" },
    { to: "/admin/catalogo", label: "Admin catálogo" },
    { to: "/admin/utilizadores", label: "Admin utilizadores" },
    { to: "/admin/metricas", label: "Métricas" },
    { to: "/admin/integracoes", label: "Integrações" },
];

/**
 * Devolve a classe CSS de um item de navegação conforme o estado da rota.
 *
 * @param {{ isActive: boolean }} routeState Estado passado pelo React Router.
 * @returns {string} Lista de classes CSS da ligação de navegação.
 */
function getNavLinkClassName({ isActive }) {
    return isActive ? "nav-link nav-link-active" : "nav-link";
}

/**
 * Renderiza uma ligação de navegação a partir da lista de rotas.
 *
 * @param {{ to: string, label: string }} item Item de navegação com rota e texto visível.
 * @returns {JSX.Element} Ligação de navegação do React Router.
 */
function renderNavItem(item) {
    return (
        <NavLink
            key={item.to}
            className={getNavLinkClassName}
            to={item.to}
        >
            {/* O texto visível fica em português de Portugal para cumprir clareza e localização da interface. */}
            {item.label}
        </NavLink>
    );
}

/**
 * Renderiza o cabeçalho visível em todas as páginas.
 *
 * @returns {JSX.Element} Cabeçalho com marca e navegação principal.
 */
export function AppHeader() {
    return (
        <header className="app-header">
            <NavLink
                className="brand-link"
                to="/"
                aria-label="FaithFlix - início"
            >
                <span className="brand-mark" aria-hidden="true">
                    F
                </span>
                <span className="brand-name">FaithFlix</span>
            </NavLink>

            {/* A label do nav descreve a região para quem navega por leitor de ecrã. */}
            <nav className="main-nav" aria-label="Navegação principal">
                {navItems.map(renderNavItem)}
            </nav>
        </header>
    );
}