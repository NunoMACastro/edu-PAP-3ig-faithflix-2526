/**
 * @file Ficheiro `real_dev/frontend/src/layouts/AppLayout.jsx` da implementação real_dev.
 */

import { AppFooter } from "../components/layout/AppFooter.jsx";
import { AppHeader } from "../components/layout/AppHeader.jsx";
import { SkipLink } from "../components/a11y/SkipLink.jsx";
import { Outlet, useLocation } from "react-router-dom";

/**
 * Estrutura de página partilhada por todas as rotas do frontend.
 *
 * @param {{ children: React.ReactNode }} props - Propriedades do layout.
 * @param {React.ReactNode} props.children - Conteúdo de página selecionado pelo React Router.
 * @returns {JSX.Element} Estrutura da aplicação com salto acessível, cabeçalho, conteúdo principal e rodapé.
 */
export function AppLayout({ children }) {
    const { pathname } = useLocation();
    const isPlaybackRoute = pathname.startsWith("/ver/");

    return (
        <div
            className={`app-shell${isPlaybackRoute ? " app-shell-playback" : ""}`}
        >
            {/* O skip link vem antes do cabeçalho para ser o primeiro destino no fluxo de teclado. */}
            <SkipLink />
            {isPlaybackRoute ? null : <AppHeader />}
            <main
                id="conteudo-principal"
                className={`app-main${isPlaybackRoute ? " app-main-playback" : ""}`}
                tabIndex={-1}
            >
                {children ?? <Outlet />}
            </main>
            {isPlaybackRoute ? null : <AppFooter />}
        </div>
    );
}
