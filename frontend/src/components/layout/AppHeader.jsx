import { NavLink } from "react-router-dom";

const navItems = [
    { to: "/", label: "Inicio" },
    { to: "/catalogo", label: "Catalogo" },
    { to: "/pesquisa", label: "Pesquisa" },
    { to: "/associacoes", label: "Associacoes" },
    { to: "/planos", label: "Planos" },
    { to: "/conta", label: "Conta" },
];

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
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        className={({ isActive }) =>
                            isActive ? "nav-link nav-link-active" : "nav-link"
                        }
                        to={item.to}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </header>
    );
}