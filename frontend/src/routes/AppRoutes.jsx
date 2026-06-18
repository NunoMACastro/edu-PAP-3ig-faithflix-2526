/**
 * @file Tabela de rotas do frontend FaithFlix.
 *
 * Centraliza páginas públicas, área de conta, streaming e ecrãs administrativos
 * para que cada macrofase acrescente rotas sem duplicar layouts.
 */

import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { AccountPage } from "../pages/AccountPage.jsx";
import { AdminCatalogPage } from "../pages/AdminCatalogPage.jsx";
import { AdminCharityApplicationsPage } from "../pages/AdminCharityApplicationsPage.jsx";
import { AdminCharityMembersPage } from "../pages/AdminCharityMembersPage.jsx";
import { AdminPoolDashboardPage } from "../pages/AdminPoolDashboardPage.jsx";
import { AdminPoolDistributionPage } from "../pages/AdminPoolDistributionPage.jsx";
import { AdminUsersPage } from "../pages/AdminUsersPage.jsx";
import { CatalogPage } from "../pages/CatalogPage.jsx";
import { CharityApplicationPage } from "../pages/CharityApplicationPage.jsx";
import { CharityHistoryPage } from "../pages/CharityHistoryPage.jsx";
import { ContentDetailPage } from "../pages/ContentDetailPage.jsx";
import { DiscoveryHomePage } from "../pages/DiscoveryHomePage.jsx";
import { ForYouPage } from "../pages/ForYouPage.jsx";
import { LoginPage } from "../pages/LoginPage.jsx";
import { MyLibraryPage } from "../pages/MyLibraryPage.jsx";
import { NotificationsPage } from "../pages/NotificationsPage.jsx";
import { PlaybackPage } from "../pages/PlaybackPage.jsx";
import { PublicCharitiesPage } from "../pages/PublicCharitiesPage.jsx";
import { SearchPage } from "../pages/SearchPage.jsx";
import { SubscriptionPage } from "../pages/SubscriptionPage.jsx";
import { NotFoundPage } from "../pages/pages.jsx";
import { AdminMetricsPage } from "../pages/AdminMetricsPage.jsx";

/**
 * Declara a árvore de rotas renderizada dentro do layout partilhado.
 *
 * @returns {JSX.Element} Rotas da aplicação.
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
        <Route path="/associacoes" element={<PublicCharitiesPage />} />
        <Route path="/associacoes/candidatura" element={<CharityApplicationPage />} />
        <Route path="/associacoes/:charityId/historico" element={<CharityHistoryPage />} />
        <Route path="/planos" element={<SubscriptionPage />} />
        <Route path="/conta" element={<AccountPage />} />
        <Route path="/biblioteca" element={<MyLibraryPage />} />
        <Route path="/notificacoes" element={<NotificationsPage />} />
        <Route path="/pesquisa" element={<SearchPage />} />
        <Route path="/admin/catalogo" element={<AdminCatalogPage />} />
        <Route path="/admin/utilizadores" element={<AdminUsersPage />} />
        <Route path="/admin/charity-applications" element={<AdminCharityApplicationsPage />} />
        <Route path="/admin/pool/distribution" element={<AdminPoolDistributionPage />} />
        <Route path="/admin/pool/dashboard" element={<AdminPoolDashboardPage />} />
        <Route path="/admin/charity-members" element={<AdminCharityMembersPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/admin/metricas" element={<AdminMetricsPage />} />
      </Routes>
    </AppLayout>
  );
}
