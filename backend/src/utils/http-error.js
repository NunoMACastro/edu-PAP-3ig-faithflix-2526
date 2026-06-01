/**
 * Error type used by controllers and middlewares to represent HTTP failures.
 */
export class HttpError extends Error {
    /**
     * Creates a new HTTP-aware error.
     *
     * @param {number} statusCode - HTTP status code that should be returned to the client.
     * @param {string} message - Safe message that can be returned in the JSON response.
     * @param {unknown} [details=undefined] - Optional structured details about the failure.
     */
    constructor(statusCode, message, details = undefined) {
        super(message);
        this.name = "HttpError";
        this.statusCode = statusCode;
        this.details = details;
    }
}

/**
 * Creates the standard 404 error for unknown API routes.
 *
 * @param {string} path - Original URL requested by the client.
 * @returns {HttpError} Standardized not-found error.
 */
export function notFound(path) {
    return new HttpError(404, "Recurso nao encontrado.", { path });
}
