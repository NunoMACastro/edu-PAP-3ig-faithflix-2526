/**
 * Error type used by the frontend API client.
 */
export class ApiError extends Error {
    /**
     * Creates a normalized API error.
     *
     * @param {{ status: number, message: string, details?: unknown, requestId?: string }} params - API error parameters.
     * @param {number} params.status - HTTP status code, or 0 for network failures.
     * @param {string} params.message - Safe user-facing message.
     * @param {unknown} [params.details=undefined] - Optional structured error details.
     * @param {string} [params.requestId=undefined] - Optional request id returned by the backend.
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
 * Returns a safe Portuguese message for a given API status.
 *
 * @param {number} status - HTTP status code, or 0 when there was no response.
 * @returns {string} User-facing error message in Portuguese.
 */
export function getDefaultApiErrorMessage(status) {
    if (status === 0) {
        return "Nao foi possivel contactar o servidor. Confirma a ligacao e tenta novamente.";
    }

    if (status === 401) {
        return "Sessao nao autenticada. Entra novamente na tua conta.";
    }

    if (status === 403) {
        return "Nao tens permissao para executar esta acao.";
    }

    if (status === 404) {
        return "O recurso pedido nao foi encontrado.";
    }

    if (status >= 500) {
        return "O servidor teve um problema. Tenta novamente dentro de momentos.";
    }

    return "O pedido nao foi concluido. Verifica os dados e tenta novamente.";
}

/**
 * Converts any thrown value into a safe message for the UI.
 *
 * @param {unknown} error - Error caught by a component or service.
 * @returns {string} Message that can be displayed to the user.
 */
export function toUserMessage(error) {
    if (error instanceof ApiError) {
        return error.message;
    }

    return "Ocorreu um erro inesperado. Tenta novamente.";
}
