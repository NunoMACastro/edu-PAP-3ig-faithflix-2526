/**
 * @file Ficheiro `real_dev/backend/src/utils/http-error.js` da implementação real_dev.
 */

/**
 * Tipo de erro usado por controllers e middlewares para representar falhas HTTP.
 */
export class HttpError extends Error {
    /**
     * Cria um erro com semântica HTTP.
     *
     * @param {number} statusCode - Código HTTP que deve ser devolvido ao cliente.
     * @param {string} message - Mensagem segura que pode ser devolvida na resposta JSON.
     * @param {unknown} [details=undefined] - Detalhes estruturados opcionais sobre a falha.
     * @param {string | undefined} [code=undefined] - Código estável consumido pelo frontend.
     */
    constructor(statusCode, message, details = undefined, code = undefined) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
        this.details = details;
        this.code = code;
    }
}

/**
 * Cria o erro 404 padrão para rotas API desconhecidas.
 *
 * @param {string} path - Original URL requested by the client.
 * @returns {HttpError} Erro padronizado de recurso não encontrado.
 */
export function notFound(path) {
    return new HttpError(404, "Recurso nao encontrado.", { path });
}
