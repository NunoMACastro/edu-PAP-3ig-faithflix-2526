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
    /**
     * Garante que o destino recebe foco real depois do salto, incluindo browsers
     * que apenas deslocam a página quando a âncora aponta para um elemento focável.
     *
     * @param {React.MouseEvent<HTMLAnchorElement>} event Evento de ativação do link.
     * @returns {void}
     */
    function handleClick(event) {
        const target = document.getElementById(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: "start" });
        window.history.replaceState(null, "", `#${targetId}`);
    }

    return (
        <a className="skip-link" href={`#${targetId}`} onClick={handleClick}>
            {/* Texto curto para orientar utilizadores de teclado sem criar ruído visual em repouso. */}
            Saltar para o conteúdo principal
        </a>
    );
}
