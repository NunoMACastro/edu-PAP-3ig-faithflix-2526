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
     * @param {{ status: number, message: string, code?: string, details?: unknown, requestId?: string }} params - Parâmetros do erro API.
     * @param {number} params.status - Código HTTP, ou 0 em falhas de rede.
     * @param {string} params.message - Mensagem segura para apresentar ao utilizador.
     * @param {string} [params.code="REQUEST_FAILED"] - Código estável e legível por máquina.
     * @param {unknown} [params.details=undefined] - Detalhes estruturados opcionais do erro.
     * @param {string} [params.requestId=undefined] - Identificador de pedido opcional devolvido pelo backend.
     */
    constructor({
        status,
        message,
        code = "REQUEST_FAILED",
        details = undefined,
        requestId = undefined,
    }) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
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
 * Devolve mensagens seguras para falhas produzidas antes de existir uma
 * resposta HTTP utilizável.
 *
 * @param {string} code Código normalizado pelo cliente HTTP.
 * @returns {string} Mensagem em português de Portugal.
 */
export function getClientApiErrorMessage(code) {
    if (code === "REQUEST_TIMEOUT") {
        return "O servidor demorou demasiado a responder. Tenta novamente.";
    }

    if (code === "REQUEST_ABORTED") {
        return "O pedido foi cancelado.";
    }

    if (code === "INVALID_RESPONSE") {
        return "O servidor devolveu uma resposta inválida. Tenta novamente.";
    }

    if (code === "CSRF_TOKEN_INVALID") {
        return "Não foi possível preparar o pedido em segurança. Atualiza a página e tenta novamente.";
    }

    return getDefaultApiErrorMessage(0);
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
