/**
 * @file Tabela de rotas do frontend FaithFlix.
 *
 * Centraliza páginas públicas, área de conta, streaming e ecrãs administrativos
 * para que cada macrofase acrescente rotas sem duplicar layouts.
 */

import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AdminRoute } from "../components/auth/AdminRoute.jsx";
import { AnonymousRoute } from "../components/auth/AnonymousRoute.jsx";
import { AuthenticatedRoute } from "../components/auth/AuthenticatedRoute.jsx";
import { ErrorBoundary } from "../components/errors/ErrorBoundary.jsx";
import { env } from "../config/env.js";
import { AppLayout } from "../layouts/AppLayout.jsx";
import { AdminLayout } from "../layouts/AdminLayout.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { RouteLifecycle } from "./RouteLifecycle.jsx";

/**
 * Converte um export nomeado de página num componente lazy sem obrigar as
 * páginas existentes a introduzir exports default artificiais.
 *
 * @param {() => Promise<Record<string, unknown>>} loader Import dinâmico.
 * @param {string} exportName Nome do componente exportado.
 * @returns {React.LazyExoticComponent<React.ComponentType>} Página lazy.
 */
function lazyNamedPage(loader, exportName) {
  return lazy(async () => {
    const pageModule = await loader();
    const Page = pageModule[exportName];

    if (!Page) {
      throw new Error("ROUTE_COMPONENT_UNAVAILABLE");
    }

    return { default: Page };
  });
}

const AccountPage = lazyNamedPage(
  () => import("../pages/AccountPage.jsx"),
  "AccountPage",
);
const AdminBiblicalPassagesPage = lazyNamedPage(
  () => import("../pages/AdminBiblicalPassagesPage.jsx"),
  "AdminBiblicalPassagesPage",
);
const AdminBiblicalPassagesListPage = lazyNamedPage(
  () => import("../pages/AdminBiblicalPassagesListPage.jsx"),
  "AdminBiblicalPassagesListPage",
);
const AdminCatalogCreatePage = lazyNamedPage(
  () => import("../pages/AdminCatalogCreatePage.jsx"),
  "AdminCatalogCreatePage",
);
const AdminCatalogEditPage = lazyNamedPage(
  () => import("../pages/AdminCatalogEditPage.jsx"),
  "AdminCatalogEditPage",
);
const AdminCatalogListPage = lazyNamedPage(
  () => import("../pages/AdminCatalogListPage.jsx"),
  "AdminCatalogListPage",
);
const AdminTaxonomiesPage = lazyNamedPage(
  () => import("../pages/AdminTaxonomiesPage.jsx"),
  "AdminTaxonomiesPage",
);
const AdminDashboardPage = lazyNamedPage(
  () => import("../pages/AdminDashboardPage.jsx"),
  "AdminDashboardPage",
);
const AdminCharityApplicationsPage = lazyNamedPage(
  () => import("../pages/AdminCharityApplicationsPage.jsx"),
  "AdminCharityApplicationsPage",
);
const AdminCharityMembersPage = lazyNamedPage(
  () => import("../pages/AdminCharityMembersPage.jsx"),
  "AdminCharityMembersPage",
);
const AdminIntegrationsPage = lazyNamedPage(
  () => import("../pages/AdminIntegrationsPage.jsx"),
  "AdminIntegrationsPage",
);
const AdminMetricsPage = lazyNamedPage(
  () => import("../pages/AdminMetricsPage.jsx"),
  "AdminMetricsPage",
);
const AdminPoolDashboardPage = lazyNamedPage(
  () => import("../pages/AdminPoolDashboardPage.jsx"),
  "AdminPoolDashboardPage",
);
const AdminPoolDistributionPage = lazyNamedPage(
  () => import("../pages/AdminPoolDistributionPage.jsx"),
  "AdminPoolDistributionPage",
);
const AdminUsersPage = lazyNamedPage(
  () => import("../pages/AdminUsersPage.jsx"),
  "AdminUsersPage",
);
const CatalogPage = lazyNamedPage(
  () => import("../pages/CatalogPage.jsx"),
  "CatalogPage",
);
const CharityApplicationPage = lazyNamedPage(
  () => import("../pages/CharityApplicationPage.jsx"),
  "CharityApplicationPage",
);
const CharityHistoryPage = lazyNamedPage(
  () => import("../pages/CharityHistoryPage.jsx"),
  "CharityHistoryPage",
);
const ContentDetailPage = lazyNamedPage(
  () => import("../pages/ContentDetailPage.jsx"),
  "ContentDetailPage",
);
const EpisodeContextPage = lazyNamedPage(
  () => import("../pages/ContentDetailPage.jsx"),
  "EpisodeContextPage",
);
const DiscoveryHomePage = lazyNamedPage(
  () => import("../pages/DiscoveryHomePage.jsx"),
  "DiscoveryHomePage",
);
const DemoMailboxPage = lazyNamedPage(
  () => import("../pages/DemoMailboxPage.jsx"),
  "DemoMailboxPage",
);
const ForYouPage = lazyNamedPage(
  () => import("../pages/ForYouPage.jsx"),
  "ForYouPage",
);
const LoginPage = lazyNamedPage(
  () => import("../pages/LoginPage.jsx"),
  "LoginPage",
);
const MyLibraryPage = lazyNamedPage(
  () => import("../pages/MyLibraryPage.jsx"),
  "MyLibraryPage",
);
const NotificationsPage = lazyNamedPage(
  () => import("../pages/NotificationsPage.jsx"),
  "NotificationsPage",
);
const PlaybackPage = lazyNamedPage(
  () => import("../pages/PlaybackPage.jsx"),
  "PlaybackPage",
);
const PublicCharitiesPage = lazyNamedPage(
  () => import("../pages/PublicCharitiesPage.jsx"),
  "PublicCharitiesPage",
);
const SearchPage = lazyNamedPage(
  () => import("../pages/SearchPage.jsx"),
  "SearchPage",
);
const SubscriptionPage = lazyNamedPage(
  () => import("../pages/SubscriptionPage.jsx"),
  "SubscriptionPage",
);
const NotFoundPage = lazyNamedPage(
  () => import("../pages/pages.jsx"),
  "NotFoundPage",
);

/**
 * Recarrega o documento por ação explícita do utilizador. Um reload é
 * necessário para permitir nova transferência quando um chunk lazy falha.
 *
 * @returns {void}
 */
function retryRouteLoad() {
  window.location.reload();
}

/**
 * @returns {JSX.Element} Estado acessível enquanto o chunk da rota é carregado.
 */
function RouteLoadingFallback() {
  return (
    <p className="page-section" role="status" aria-live="polite">
      A carregar página...
    </p>
  );
}

/**
 * Envolve páginas administrativas na guarda visual.
 *
 * @param {React.ReactNode} page Página administrativa.
 * @param {string[]} [allowedRoles=["admin"]] Roles aceites pela rota.
 * @returns {JSX.Element} Rota protegida pela sessão.
 */
function withAdminRoute(page, allowedRoles = ["admin"]) {
  return <AdminRoute allowedRoles={allowedRoles}>{page}</AdminRoute>;
}

/**
 * Envolve páginas que exigem sessão autenticada.
 *
 * @param {React.ReactNode} page Página privada.
 * @returns {JSX.Element} Rota protegida por sessão.
 */
function withAuthenticatedRoute(page) {
  return <AuthenticatedRoute>{page}</AuthenticatedRoute>;
}

/** @returns {JSX.Element} Landing administrativa dependente da role confirmada. */
function AdminIndexRoute() {
  const { user } = useSession();

  if (user?.role === "moderator") {
    return <Navigate to="/admin/catalogo" replace />;
  }

  return <AdminDashboardPage />;
}

function AdminPassageEditorRoute() {
  const { passageId = "" } = useParams();
  return <AdminBiblicalPassagesPage initialPassageId={passageId} />;
}

/**
 * Declara a árvore de rotas renderizada dentro do layout partilhado.
 *
 * @returns {JSX.Element} Rotas da aplicação.
 */
export function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <RouteLifecycle />
      <ErrorBoundary
        resetKey={location.key}
        onRetry={retryRouteLoad}
      >
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DiscoveryHomePage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/catalogo/:seriesSlug/episodios/:episodeSlug" element={<EpisodeContextPage />} />
              <Route path="/catalogo/:idOrSlug" element={<ContentDetailPage />} />
              <Route path="/ver/:contentId" element={withAuthenticatedRoute(<PlaybackPage />)} />
              <Route path="/login" element={<AnonymousRoute><LoginPage /></AnonymousRoute>} />
              <Route path="/para-si" element={withAuthenticatedRoute(<ForYouPage />)} />
              <Route path="/associacoes" element={<PublicCharitiesPage />} />
              <Route path="/associacoes/candidatura" element={<CharityApplicationPage />} />
              <Route path="/associacoes/:charityId/historico" element={withAuthenticatedRoute(<CharityHistoryPage />)} />
              <Route path="/planos" element={<SubscriptionPage />} />
              <Route path="/conta" element={withAuthenticatedRoute(<AccountPage />)} />
              <Route path="/biblioteca" element={withAuthenticatedRoute(<MyLibraryPage />)} />
              <Route path="/notificacoes" element={withAuthenticatedRoute(<NotificationsPage />)} />
              <Route path="/pesquisa" element={<SearchPage />} />
              {env.demoMode ? <Route path="/caixa-demo" element={<DemoMailboxPage />} /> : null}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/admin" element={withAdminRoute(<AdminLayout />, ["admin", "moderator"])}>
              <Route index element={<AdminIndexRoute />} />
              <Route path="catalogo" element={<AdminCatalogListPage />} />
              <Route path="catalogo/novo" element={<AdminCatalogCreatePage />} />
              <Route path="catalogo/:contentId/editar" element={<AdminCatalogEditPage />} />
              <Route path="catalogo/taxonomias" element={<AdminTaxonomiesPage />} />
              <Route path="passagens-biblicas" element={<AdminBiblicalPassagesListPage />} />
              <Route path="passagens-biblicas/novo" element={<AdminBiblicalPassagesPage />} />
              <Route path="passagens-biblicas/:passageId/editar" element={<AdminPassageEditorRoute />} />
              <Route path="passagens-biblicas/associacoes" element={<AdminBiblicalPassagesPage />} />
              <Route path="utilizadores" element={withAdminRoute(<AdminUsersPage />)} />
              <Route path="metricas" element={withAdminRoute(<AdminMetricsPage />)} />
              <Route path="integracoes" element={withAdminRoute(<AdminIntegrationsPage />)} />
              <Route path="charity-applications" element={withAdminRoute(<AdminCharityApplicationsPage />)} />
              <Route path="pool/distribution" element={withAdminRoute(<AdminPoolDistributionPage />)} />
              <Route path="pool/dashboard" element={withAdminRoute(<AdminPoolDashboardPage />)} />
              <Route path="charity-members" element={withAdminRoute(<AdminCharityMembersPage />)} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
