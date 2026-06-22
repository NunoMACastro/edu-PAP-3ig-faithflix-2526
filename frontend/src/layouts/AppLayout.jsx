// frontend/src/layouts/AppLayout.jsx
/**
 * @file Layout principal partilhado pelas páginas FaithFlix.
 */

import { SkipLink } from "../components/a11y/SkipLink.jsx";
import { AppFooter } from "../components/layout/AppFooter.jsx";
import { AppHeader } from "../components/layout/AppHeader.jsx";

/**
 * Estrutura de página partilhada por todas as rotas do frontend.
 *
 * @param {{ children: React.ReactNode }} props Propriedades do layout.
 * @param {React.ReactNode} props.children Conteúdo de página selecionado pelo React Router.
 * @returns {JSX.Element} Estrutura da aplicação com salto acessível, cabeçalho, conteúdo principal e rodapé.
 */
export function AppLayout({ children }) {
  return (
    <div className="app-shell">
      {/* O skip link vem antes do header para ser o primeiro destino quando o utilizador carrega em Tab. */}
      <SkipLink />
      <AppHeader />

      {/* O id liga o link ao conteúdo e o tabIndex permite foco sem entrar na tabulação normal. */}
      <main id="conteudo-principal" className="app-main" tabIndex={-1}>
        {children}
      </main>

      <AppFooter />
    </div>
  );
}