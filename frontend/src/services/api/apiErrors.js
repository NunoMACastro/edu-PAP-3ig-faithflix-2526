export class ApiError extends Error {
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

export function toUserMessage(error) {
    if (error instanceof ApiError) {
        return error.message;
    }

    return "Ocorreu um erro inesperado. Tenta novamente.";
}