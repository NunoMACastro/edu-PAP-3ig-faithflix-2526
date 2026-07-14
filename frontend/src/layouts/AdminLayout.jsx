/**
 * @file Shell dedicado ao backoffice FaithFlix.
 */

import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../assets/faithflix-logo.png";
import { SkipLink } from "../components/a11y/SkipLink.jsx";
import { AdminNavigation } from "../components/admin/AdminNavigation.jsx";
import { SessionActionButton } from "../components/layout/SessionActionButton.jsx";
import { useSession } from "../context/SessionContext.jsx";

const BREADCRUMB_LABELS = {
    admin: "Administração",
    catalogo: "Catálogo",
    novo: "Novo",
    editar: "Editar",
    taxonomias: "Taxonomias",
    "passagens-biblicas": "Passagens bíblicas",
    associacoes: "Associações",
    utilizadores: "Utilizadores",
    metricas: "Métricas",
    integracoes: "Integrações",
    "charity-applications": "Candidaturas",
    "charity-members": "Membros",
    pool: "Pool solidária",
    distribution: "Distribuição mensal",
    dashboard: "Histórico",
};

/** @returns {string} Breadcrumb textual da rota administrativa atual. */
function useAdminBreadcrumb() {
    const { pathname } = useLocation();
    return pathname
        .split("/")
        .filter(Boolean)
        .map((part) => BREADCRUMB_LABELS[part] ?? part)
        .join(" / ");
}

/**
 * Renderiza sidebar desktop e drawer modal móvel sem misturar UI pública.
 *
 * @returns {JSX.Element} Layout administrativo.
 */
export function AdminLayout() {
    const { user } = useSession();
    const location = useLocation();
    const breadcrumb = useAdminBreadcrumb();
    const dialogRef = useRef(null);
    const menuButtonRef = useRef(null);
    const restoreDrawerFocusRef = useRef(true);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (drawerOpen && !dialog.open) {
            if (typeof dialog.showModal === "function") dialog.showModal();
            else dialog.setAttribute("open", "");
        }
        if (!drawerOpen && dialog.open) {
            if (typeof dialog.close === "function") dialog.close();
            else {
                dialog.removeAttribute("open");
                if (restoreDrawerFocusRef.current) menuButtonRef.current?.focus();
                restoreDrawerFocusRef.current = true;
            }
        }
    }, [drawerOpen]);

    useEffect(() => {
        setDrawerOpen(false);
    }, [location.pathname]);

    function closeDrawer({ restoreFocus = true } = {}) {
        restoreDrawerFocusRef.current = restoreFocus;
        setDrawerOpen(false);
    }

    return (
        <div className="admin-shell">
            <SkipLink />
            <aside className="admin-sidebar">
                <Link className="admin-brand" to="/admin" aria-label="FaithFlix Administração">
                    <img src={logo} alt="" width="34" height="40" />
                    <span>FaithFlix <small>Administração</small></span>
                </Link>
                <AdminNavigation />
                <a className="admin-public-link" href="/" target="_blank" rel="noreferrer">
                    Ver site público <span aria-hidden="true">↗</span>
                </a>
            </aside>

            <div className="admin-workspace">
                <header className="admin-topbar">
                    <button
                        ref={menuButtonRef}
                        className="admin-menu-button"
                        type="button"
                        aria-label="Abrir navegação administrativa"
                        aria-haspopup="dialog"
                        onClick={() => setDrawerOpen(true)}
                    >
                        Menu
                    </button>
                    <p className="admin-breadcrumb" aria-label="Breadcrumb">{breadcrumb}</p>
                    <div className="admin-session-identity">
                        <span><strong>{user?.name || "Sessão staff"}</strong><small>{user?.role === "moderator" ? "Moderador" : "Administrador"}</small></span>
                        <SessionActionButton />
                    </div>
                </header>
                <main id="conteudo-principal" className="admin-main" tabIndex={-1}>
                    <Outlet />
                </main>
            </div>

            <dialog
                ref={dialogRef}
                className="admin-drawer"
                aria-label="Navegação administrativa"
                onCancel={(event) => {
                    event.preventDefault();
                    closeDrawer();
                }}
                onClose={() => {
                    setDrawerOpen(false);
                    if (restoreDrawerFocusRef.current) menuButtonRef.current?.focus();
                    restoreDrawerFocusRef.current = true;
                }}
                onClick={(event) => {
                    if (event.target === dialogRef.current) closeDrawer();
                }}
            >
                <div className="admin-drawer-panel">
                    <div className="admin-drawer-heading">
                        <strong>Administração</strong>
                        <button type="button" onClick={() => closeDrawer()} aria-label="Fechar navegação">Fechar</button>
                    </div>
                    <AdminNavigation onNavigate={() => closeDrawer({ restoreFocus: false })} />
                    <a className="admin-public-link" href="/" target="_blank" rel="noreferrer">Ver site público ↗</a>
                </div>
            </dialog>
        </div>
    );
}
