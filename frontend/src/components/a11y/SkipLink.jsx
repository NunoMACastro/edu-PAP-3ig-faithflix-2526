/**
 * @file Link de salto acessível para navegação por teclado.
 */

/**
 * Renderiza um link que fica visível quando recebe foco.
 *
 * @param {{ targetId?: string }} props - Propriedades do componente.
 * @param {string} [props.targetId="conteudo-principal"] - Identificador do elemento principal.
 * @returns {JSX.Element} Link de salto para o conteúdo principal.
 */
export function SkipLink({ targetId = "conteudo-principal" }) {
    return (
        <a className="skip-link" href={`#${targetId}`}>
            {/* Texto curto para orientar utilizadores de teclado sem criar ruído visual em repouso. */}
            Saltar para o conteúdo principal
        </a>
    );
}
