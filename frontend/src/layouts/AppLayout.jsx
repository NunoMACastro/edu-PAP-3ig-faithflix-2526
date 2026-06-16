/**
 * @file Ficheiro `real_dev/frontend/src/layouts/AppLayout.jsx` da implementação real_dev.
 */

import { AppFooter } from "../components/layout/AppFooter.jsx";
import { AppHeader } from "../components/layout/AppHeader.jsx";

/**
 * Estrutura de página partilhada por todas as rotas do frontend.
 *
 * @param {{ children: React.ReactNode }} props - Propriedades do layout.
 * @param {React.ReactNode} props.children - Conteúdo de página selecionado pelo React Router.
 * @returns {JSX.Element} Estrutura da aplicação com cabeçalho, conteúdo principal e rodapé.
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
