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
 * Returns the CSS class for a navigation item according to route state.
 *
 * @param {{ isActive: boolean }} routeState - State passed by React Router.
 * @returns {string} CSS class list for the navigation link.
 */
function getNavLinkClassName({ isActive }) {
    return isActive ? "nav-link nav-link-active" : "nav-link";
}

/**
 * Renders one navigation link from the configured route list.
 *
 * @param {{ to: string, label: string }} item - Navigation item definition.
 * @returns {JSX.Element} React Router navigation link.
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
 * @returns {JSX.Element} Header visible on every page.
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
