import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { AccountPage } from "../pages/AccountPage.jsx";
import { AdminCatalogPage } from "../pages/AdminCatalogPage.jsx";
import { AdminUsersPage } from "../pages/AdminUsersPage.jsx";
import { CatalogPage } from "../pages/CatalogPage.jsx";
import { ContentDetailPage } from "../pages/ContentDetailPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { MyLibraryPage } from "../pages/MyLibraryPage.jsx";
import { PlaybackPage } from "../pages/PlaybackPage.jsx";
import { SearchPage } from "../pages/SearchPage.jsx";
import { DiscoveryHomePage } from "../pages/DiscoveryHomePage.jsx";
import {
    AssociationsPage,
    HomePage,
    NotFoundPage,
    NotificationsPage,
    PlansPage,
    SearchPage,
} from "../pages/pages.jsx";

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
                <Route path="/catalogo/:idOrSlug" element={<ContentDetailPage />} />
                <Route path="/ver/:contentId" element={<PlaybackPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/associacoes" element={<AssociationsPage />} />
                <Route path="/planos" element={<PlansPage />} />
                <Route path="/conta" element={<AccountPage />} />
                <Route path="/biblioteca" element={<MyLibraryPage />} />
                <Route path="/admin/catalogo" element={<AdminCatalogPage />} />
                <Route path="/admin/utilizadores" element={<AdminUsersPage />} />
                <Route path="/notificacoes" element={<NotificationsPage />} />
                <Route path="/pesquisa" element={<SearchPage />} />
                <Route path="/descobrir" element={<DiscoveryHomePage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </AppLayout>
    );
}
