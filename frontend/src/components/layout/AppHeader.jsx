/**
 * @file Ficheiro `real_dev/frontend/src/components/layout/AppHeader.jsx` da implementação real_dev.
 */

import { NavLink } from "react-router-dom";

const navItems = [
    { to: "/", label: "Inicio" },
    { to: "/catalogo", label: "Catalogo" },
    { to: "/biblioteca", label: "Biblioteca" },
    { to: "/pesquisa", label: "Pesquisa" },
    { to: "/para-si", label: "Para si" },
    { to: "/associacoes", label: "Associacoes" },
    { to: "/planos", label: "Planos" },
    { to: "/conta", label: "Conta" },
    { to: "/admin/catalogo", label: "Admin catalogo" },
    { to: "/admin/utilizadores", label: "Admin users" },
];

/**
 * Devolve a classe CSS de um item de navegação conforme o estado da rota.
 *
 * @param {{ isActive: boolean }} routeState - Estado passado pelo React Router.
 * @returns {string} Lista de classes CSS da ligação de navegação.
 */
function getNavLinkClassName({ isActive }) {
    return isActive ? "nav-link nav-link-active" : "nav-link";
}

/**
 * Renderiza uma ligação de navegação a partir da lista de rotas.
 *
 * @param {{ to: string, label: string }} item - Navigation item definition.
 * @returns {JSX.Element} Ligação de navegação do React Router.
 */
function renderNavItem(item) {
    return (
        <NavLink
            key={item.to}
            className={getNavLinkClassName}
            to={item.to}
        >
            {item.label}
        </NavLink>
    );
}

/**
 * Main application header with brand link and primary navigation.
 *
 * @returns {JSX.Element} Cabeçalho visível em todas as páginas.
 */
export function AppHeader() {
    return (
        <header className="app-header">
            <NavLink
                className="brand-link"
                to="/"
                aria-label="FaithFlix - inicio"
            >
                <span className="brand-mark" aria-hidden="true">
                    F
                </span>
                <span className="brand-name">FaithFlix</span>
            </NavLink>

            <nav className="main-nav" aria-label="Navegacao principal">
                {navItems.map(renderNavItem)}
            </nav>
        </header>
    );
}
