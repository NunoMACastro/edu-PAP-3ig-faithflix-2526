import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { AccountPage } from "../pages/AccountPage.jsx";
import { AdminCatalogPage } from "../pages/AdminCatalogPage.jsx";
import { AdminUsersPage } from "../pages/AdminUsersPage.jsx";
import { CatalogPage } from "../pages/CatalogPage.jsx";
import { ContentDetailPage } from "../pages/ContentDetailPage.jsx";
import { DiscoveryHomePage } from "../pages/DiscoveryHomePage.jsx";
import { ForYouPage } from "../pages/ForYouPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { MyLibraryPage } from "../pages/MyLibraryPage.jsx";
import { PlaybackPage } from "../pages/PlaybackPage.jsx";
import { SearchPage } from "../pages/SearchPage.jsx";
import {
    AssociationsPage,
    NotFoundPage,
    NotificationsPage,
    PlansPage,
} from "../pages/pages.jsx";
import { AdminPoolDistributionPage } from "../pages/AdminPoolDistributionPage.jsx";
import { CharityHistoryPage } from "../pages/CharityHistoryPage.jsx";
import { PublicCharitiesPage } from "../pages/PublicCharitiesPage.jsx";
import { AdminPoolDashboardPage } from "../pages/AdminPoolDashboardPage.jsx";
import { AdminCharityMembershipsPage } from "../pages/AdminCharityMembershipsPage.jsx";

/**
 * Declares the route table for the MF1 frontend foundation.
 *
 * @returns {JSX.Element} Route tree rendered inside the shared application layout.
 */
export function AppRoutes() {
    return (
        <AppLayout>
            <Routes>
                <Route path="/" element={<DiscoveryHomePage />} />
                <Route path="/catalogo" element={<CatalogPage />} />
                <Route path="/catalogo/:idOrSlug" element={<ContentDetailPage />} />
                <Route path="/ver/:contentId" element={<PlaybackPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/para-si" element={<ForYouPage />} />
                <Route path="/associacoes" element={<AssociationsPage />} />
                <Route path="/planos" element={<PlansPage />} />
                <Route path="/conta" element={<AccountPage />} />
                <Route path="/biblioteca" element={<MyLibraryPage />} />
                <Route path="/admin/catalogo" element={<AdminCatalogPage />} />
                <Route path="/admin/utilizadores" element={<AdminUsersPage />} />
                <Route path="/notificacoes" element={<NotificationsPage />} />
                <Route path="/pesquisa" element={<SearchPage />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route path="/caridade" element={ <AdminPoolDistributionPage />} />
                <Route path="/caridade/:charityId/historico" element={<CharityHistoryPage />} />
                <Route path="/caridade/dashboard" element={<AdminPoolDashboardPage />} />
                <Route path="/caridade/associacoes" element={<PublicCharitiesPage />} />
                <Route path="/caridade/membros" element={<AdminCharityMembershipsPage />} />
            </Routes>
        </AppLayout>
    );
}
