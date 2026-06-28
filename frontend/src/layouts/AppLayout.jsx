/**
 * @file Ficheiro `real_dev/frontend/src/layouts/AppLayout.jsx` da implementação real_dev.
 */

import { AppFooter } from "../components/layout/AppFooter.jsx";
import { AppHeader } from "../components/layout/AppHeader.jsx";
import { SkipLink } from "../components/a11y/SkipLink.jsx";

/**
 * Estrutura de página partilhada por todas as rotas do frontend.
 *
 * @param {{ children: React.ReactNode }} props - Propriedades do layout.
 * @param {React.ReactNode} props.children - Conteúdo de página selecionado pelo React Router.
 * @returns {JSX.Element} Estrutura da aplicação com salto acessível, cabeçalho, conteúdo principal e rodapé.
 */
export function AppLayout({ children }) {
    return (
        <div className="app-shell">
            {/* O skip link vem antes do cabeçalho para ser o primeiro destino no fluxo de teclado. */}
            <SkipLink />
            <AppHeader />
            <main id="conteudo-principal" className="app-main" tabIndex={-1}>
                {children}
            </main>
            <AppFooter />
        </div>
    );
}
