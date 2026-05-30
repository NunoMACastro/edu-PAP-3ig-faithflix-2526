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
            </Routes>
        </AppLayout>
    );
}