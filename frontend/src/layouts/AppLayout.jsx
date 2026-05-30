import { AppFooter } from "../components/layout/AppFooter.jsx";
import { AppHeader } from "../components/layout/AppHeader.jsx";

export function AppLayout({ children }) {
    return (
        <div className="app-shell">
            <AppHeader />
            <main className="app-main">{children}</main>
            <AppFooter />
        </div>
    );
}