import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import {
    AccountPage,
    AssociationsPage,
    CatalogPage,
    HomePage,
    LoginPage,
    NotFoundPage,
    NotificationsPage,
    PlansPage,
    SearchPage,
} from "../pages/pages.jsx";
import { AccountPage } from "../pages/AccountPage.jsx";
import { AdminUsersPage } from "../pages/AdminUsersPage.jsx";
import { CatalogPage } from "../pages/CatalogPage.jsx";
import { AdminCatalogPage } from "../pages/AdminCatalogPage.jsx";



/**
 * Declares the route table for the MF1 frontend foundation.
 *
 * @returns {JSX.Element} Route tree rendered inside the shared application layout.
 */
export function AppRoutes() {
    return (
        <AppLayout>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalogo" element={<CatalogPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/associacoes" element={<AssociationsPage />} />
                <Route path="/planos" element={<PlansPage />} />
                <Route path="/conta" element={<AccountPage />} />
                <Route path="/notificacoes" element={<NotificationsPage />} />
                <Route path="/pesquisa" element={<SearchPage />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route path="/conta" element={<AccountPage />} />
                <Route path="/admin/utilizadores" element={<AdminUsersPage />} />
                <Route path="/catalogo" element={<CatalogPage />} />
                <Route path="/admin/catalogo" element={<AdminCatalogPage />} />
            </Routes>
        </AppLayout>
    );
}
