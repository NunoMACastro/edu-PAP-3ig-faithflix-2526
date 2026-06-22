// frontend/src/components/a11y/SkipLink.jsx
/**
 * @file Link de salto acessível para navegação por teclado.
 */

/**
 * Renderiza um link que fica visível quando recebe foco.
 *
 * @param {{ targetId?: string }} props Propriedades do componente.
 * @param {string} [props.targetId="conteudo-principal"] Identificador do elemento principal.
 * @returns {JSX.Element} Link de salto para o conteúdo.
 */
export function SkipLink({ targetId = "conteudo-principal" }) {
  return (
    <a className="skip-link" href={`#${targetId}`}>
      {/* O texto é curto e explícito para ser útil tanto visualmente como em leitores de ecrã. */}
      Saltar para o conteúdo principal
    </a>
  );
}