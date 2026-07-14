/**
 * @file Navegação administrativa agrupada e filtrada pela role da sessão.
 */

import { NavLink } from "react-router-dom";
import { useSession } from "../../context/SessionContext.jsx";

export const ADMIN_NAVIGATION_GROUPS = [
    {
        label: "Visão geral",
        roles: ["admin"],
        items: [{ to: "/admin", label: "Dashboard", end: true }],
    },
    {
        label: "Conteúdo",
        roles: ["admin", "moderator"],
        items: [
            { to: "/admin/catalogo", label: "Catálogo" },
            { to: "/admin/passagens-biblicas", label: "Passagens bíblicas" },
        ],
    },
    {
        label: "Utilizadores",
        roles: ["admin"],
        items: [{ to: "/admin/utilizadores", label: "Contas e permissões" }],
    },
    {
        label: "Solidariedade",
        roles: ["admin"],
        items: [
            { to: "/admin/charity-applications", label: "Candidaturas" },
            { to: "/admin/charity-members", label: "Membros" },
            { to: "/admin/pool/distribution", label: "Distribuição mensal" },
            { to: "/admin/pool/dashboard", label: "Histórico da pool" },
        ],
    },
    {
        label: "Operação",
        roles: ["admin"],
        items: [
            { to: "/admin/metricas", label: "Métricas" },
            { to: "/admin/integracoes", label: "Integrações" },
        ],
    },
    {
        label: "Conta",
        roles: ["admin", "moderator"],
        items: [{ to: "/conta", label: "A minha conta" }],
    },
];

/**
 * @param {{ onNavigate?: () => void }} props Callback usado pelo drawer móvel.
 * @returns {JSX.Element} Grupos administrativos permitidos.
 */
export function AdminNavigation({ onNavigate }) {
    const { user } = useSession();
    const role = user?.role;

    return (
        <nav className="admin-navigation" aria-label="Navegação administrativa">
            {ADMIN_NAVIGATION_GROUPS
                .filter((group) => group.roles.includes(role))
                .map((group) => (
                    <section className="admin-navigation-group" key={group.label}>
                        <h2>{group.label}</h2>
                        {group.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => isActive
                                    ? "admin-navigation-link is-active"
                                    : "admin-navigation-link"}
                                onClick={onNavigate}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </section>
                ))}
        </nav>
    );
}
