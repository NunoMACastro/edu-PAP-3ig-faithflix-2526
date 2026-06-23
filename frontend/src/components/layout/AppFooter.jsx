/**
 * @file Ficheiro `real_dev/frontend/src/components/layout/AppFooter.jsx` da implementação real_dev.
 */

/**
 * Rodapé partilhado da base frontend da MF1.
 *
 * @returns {JSX.Element} Rodapé com identificação do projeto académico.
 */
export function AppFooter() {
    return (
        <footer className="app-footer">
            <div>
                <strong>FaithFlix</strong>
                <span> PAP 2025/2026</span>
            </div>
            <span>Conteudo, comunidade e impacto solidario.</span>
        </footer>
    );
}
