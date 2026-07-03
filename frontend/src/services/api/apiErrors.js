/**
 * @file Ficheiro `real_dev/frontend/src/services/api/apiErrors.js` da implementação real_dev.
 */

/**
 * Tipo de erro usado pelo cliente API do frontend.
 */
export class ApiError extends Error {
    /**
     * Cria um erro API normalizado.
     *
     * @param {{ status: number, message: string, details?: unknown, requestId?: string }} params - Parâmetros do erro API.
     * @param {number} params.status - Código HTTP, ou 0 em falhas de rede.
     * @param {string} params.message - Mensagem segura para apresentar ao utilizador.
     * @param {unknown} [params.details=undefined] - Detalhes estruturados opcionais do erro.
     * @param {string} [params.requestId=undefined] - Identificador de pedido opcional devolvido pelo backend.
     */
    constructor({
        status,
        message,
        details = undefined,
        requestId = undefined,
    }) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.details = details;
        this.requestId = requestId;
    }
}

/**
 * Devolve uma mensagem segura em Português para um estado da API.
 *
 * @param {number} estado - Código HTTP, ou 0 quando não houve resposta.
 * @returns {string} Mensagem de erro em Português para o utilizador.
 */
export function getDefaultApiErrorMessage(status) {
    if (status === 0) {
        return "Não foi possível contactar o servidor. Confirma a ligação e tenta novamente.";
    }

    if (status === 401) {
        return "Sessão não autenticada. Entra novamente na tua conta.";
    }

    if (status === 403) {
        return "Não tens permissão para executar esta ação.";
    }

    if (status === 404) {
        return "O recurso pedido não foi encontrado.";
    }

    if (status >= 500) {
        return "O servidor teve um problema. Tenta novamente dentro de momentos.";
    }

    return "O pedido não foi concluído. Verifica os dados e tenta novamente.";
}

/**
 * Converte qualquer valor lançado numa mensagem segura para a UI.
 *
 * @param {unknown} error - Error caught by a component or service.
 * @returns {string} Mensagem que pode ser apresentada ao utilizador.
 */
export function toUserMessage(error) {
    if (error instanceof ApiError) {
        return error.message;
    }

    return "Ocorreu um erro inesperado. Tenta novamente.";
}
