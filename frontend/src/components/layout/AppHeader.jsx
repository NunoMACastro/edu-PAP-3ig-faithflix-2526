/**
 * @file Ficheiro `real_dev/frontend/src/components/layout/AppHeader.jsx` da implementação real_dev.
 */

import { NavLink } from "react-router-dom";
import logo from "../../assets/faithflix-logo.png";
import { useSession } from "../../context/SessionContext.jsx";

const navItems = [
  { to: "/", label: "Início", visibility: "public" },
  { to: "/catalogo", label: "Catálogo", visibility: "public" },
  { to: "/pesquisa", label: "Pesquisa", visibility: "public" },
  { to: "/para-si", label: "Para si", visibility: "authenticated" },
  { to: "/biblioteca", label: "Biblioteca", visibility: "authenticated" },
  { to: "/associacoes", label: "Associações", visibility: "public" },
  { to: "/planos", label: "Planos", visibility: "public" },
  { to: "/conta", label: "Conta", visibility: "authenticated" },
  { to: "/admin/catalogo", label: "Admin catálogo", visibility: "admin" },
  { to: "/admin/utilizadores", label: "Admin utilizadores", visibility: "admin" },
  { to: "/admin/metricas", label: "Métricas", visibility: "admin" },
  { to: "/admin/integracoes", label: "Integrações", visibility: "admin" },
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
 * Decide se um item pode aparecer para o perfil atual.
 *
 * @param {{ visibility: string }} item Item de navegação.
 * @param {{ status: string, isAdmin: boolean }} session Estado de sessão.
 * @returns {boolean} Verdadeiro quando o link deve ser visível.
 */
function canShowNavItem(item, session) {
  if (item.visibility === "public") return true;
  if (item.visibility === "authenticated") return session.status === "authenticated";
  if (item.visibility === "admin") return session.isAdmin;
  return false;
}

/**
 * Renderiza uma ligação de navegação a partir da lista de rotas.
 *
 * @param {{ to: string, label: string }} item - Item de navegação com rota e texto visível.
 * @returns {JSX.Element} Ligação de navegação do React Router.
 */
function renderNavItem(item) {
    return (
        <NavLink
            key={item.to}
            className={getNavLinkClassName}
            to={item.to}
        >
            {/* Texto em português de Portugal para cumprir clareza e localização da interface. */}
            {item.label}
        </NavLink>
    );
}

/**
 * Renderiza o cabeçalho visível em todas as páginas.
 *
 * @returns {JSX.Element} Cabeçalho visível em todas as páginas.
 */
export function AppHeader() {
    const session = useSession();
    const visibleItems = navItems.filter((item) => canShowNavItem(item, session));

   return (
    <header className="app-header">
      <NavLink className="brand-link" to="/" aria-label="FaithFlix - início">
        <span className="brand-mark" aria-hidden="true">F</span>
        <span className="brand-name">FaithFlix</span>
      </NavLink>

      <nav className="main-nav" aria-label="Navegação principal">
        {visibleItems.map((item) => (
          <NavLink key={item.to} className={getNavLinkClassName} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
