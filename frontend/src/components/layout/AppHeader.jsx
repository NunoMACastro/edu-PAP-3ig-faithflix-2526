/**
 * @file Cabeçalho exclusivo da experiência pública FaithFlix.
 */

import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/faithflix-logo.png";
import { useSession } from "../../context/SessionContext.jsx";
import { SessionActionButton } from "./SessionActionButton.jsx";

const PUBLIC_ITEMS = [
    { to: "/", label: "Início", end: true },
    { to: "/catalogo", label: "Catálogo" },
    { to: "/pesquisa", label: "Pesquisa" },
    { to: "/associacoes", label: "Associações" },
    { to: "/planos", label: "Planos" },
];

const CUSTOMER_ITEMS = [
    { to: "/para-si", label: "Para si", featured: true },
    ...PUBLIC_ITEMS.filter((item) => item.to !== "/planos"),
];

const PERSONAL_ITEMS = [
    { to: "/biblioteca", label: "Biblioteca" },
    { to: "/notificacoes", label: "Notificações" },
    { to: "/conta", label: "Conta" },
];

/** @param {{ isActive: boolean }} state Estado do NavLink. */
function navClassName({ isActive }) {
    return isActive ? "nav-link nav-link-active" : "nav-link";
}

/**
 * A navegação pública nunca volta a receber links funcionais do backoffice.
 * Sessões staff obtêm apenas uma ação explícita de regresso à administração.
 *
 * @returns {JSX.Element} Cabeçalho público responsivo.
 */
export function AppHeader() {
    const session = useSession();
    const location = useLocation();
    const menuButtonRef = useRef(null);
    const accountMenuRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const isStaff = session.status === "authenticated" && session.hasRole(["admin", "moderator"]);
    const isCustomer = session.status === "authenticated" && !isStaff;
    const primaryItems = isCustomer ? CUSTOMER_ITEMS : PUBLIC_ITEMS;

    useEffect(() => {
        setMenuOpen(false);
        accountMenuRef.current?.removeAttribute("open");
    }, [location.pathname]);

    useEffect(() => {
        function handleEscape(event) {
            if (event.key !== "Escape") return;

            if (accountMenuRef.current?.open) {
                accountMenuRef.current.removeAttribute("open");
                accountMenuRef.current.querySelector("summary")?.focus();
                return;
            }

            if (menuOpen) {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
            }
        }

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [menuOpen]);

    return (
        <header className="app-header" data-menu-open={menuOpen ? "true" : "false"}>
            <div className="app-header-bar">
                <NavLink className="brand-link" to="/" aria-label="FaithFlix - início">
                    <span className="brand-mark" aria-hidden="true">
                        <img className="brand-logo" src={logo} alt="" width="141" height="160" />
                    </span>
                    <span className="brand-name">FaithFlix</span>
                </NavLink>
                <button
                    ref={menuButtonRef}
                    className="nav-menu-toggle"
                    type="button"
                    aria-controls="navegacao-principal"
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? "Fechar menu principal" : "Abrir menu principal"}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    Menu
                </button>
            </div>

            <nav id="navegacao-principal" className="main-nav" aria-label="Navegação principal">
                {primaryItems.map((item) => (
                    <NavLink
                        key={item.to}
                        className={(state) => `${navClassName(state)}${item.featured ? " nav-link-featured" : ""}`}
                        end={item.end}
                        to={item.to}
                    >
                        {item.featured ? <span aria-hidden="true">✦</span> : null}
                        {item.label}
                    </NavLink>
                ))}

                {session.status === "anonymous" ? (
                    <NavLink className={navClassName} to="/login">Entrar</NavLink>
                ) : null}

                {isCustomer ? (
                    <details ref={accountMenuRef} className="public-account-menu">
                        <summary className="nav-link">A minha conta</summary>
                        <div className="public-account-menu-panel">
                            {PERSONAL_ITEMS.map((item) => (
                                <NavLink key={item.to} className={navClassName} to={item.to}>{item.label}</NavLink>
                            ))}
                        </div>
                    </details>
                ) : null}

                {isStaff ? (
                    <NavLink className="nav-link staff-return-link" to={session.user?.role === "moderator" ? "/admin/catalogo" : "/admin"}>
                        Voltar à administração
                    </NavLink>
                ) : null}

                {session.status === "authenticated" ? <SessionActionButton className="nav-link nav-logout" /> : null}
            </nav>
        </header>
    );
}
