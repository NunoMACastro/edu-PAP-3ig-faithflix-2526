import { AppFooter } from "../components/layout/AppFooter.jsx";
import { AppHeader } from "../components/layout/AppHeader.jsx";

/**
 * Shared page shell used by every frontend route.
 *
 * @param {{ children: React.ReactNode }} props - Layout props.
 * @param {React.ReactNode} props.children - Page content selected by React Router.
 * @returns {JSX.Element} Application shell with header, main content, and footer.
 */
export function AppLayout({ children }) {
    return (
        <div className="app-shell">
            <AppHeader />
            <main className="app-main">{children}</main>
            <AppFooter />
        </div>
    );
}
