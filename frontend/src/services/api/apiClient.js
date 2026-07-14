/**
 * @file Cliente HTTP central com sessão por cookie, timeout e proteção CSRF.
 */

import { env } from "../../config/env.js";
import {
    ApiError,
    getClientApiErrorMessage,
    getDefaultApiErrorMessage,
} from "./apiErrors.js";

export const API_REQUEST_TIMEOUT_MS = 10_000;

const CSRF_ENDPOINT = "/api/session/csrf-token";
const SAFE_HTTP_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

let csrfToken = null;
let unauthorizedHandler = null;

/**
 * Remove o token CSRF mantido exclusivamente em memória.
 *
 * @returns {void}
 */
export function clearCsrfToken() {
    csrfToken = null;
}

/**
 * Regista o callback chamado quando qualquer pedido recebe HTTP 401.
 *
 * Só existe um consumidor global, o `SessionProvider`. A função de limpeza
 * evita que um provider desmontado continue a receber eventos.
 *
 * @param {((error: ApiError) => void) | null} handler Callback ou null.
 * @returns {() => void} Função que remove este callback se ainda estiver ativo.
 */
export function setUnauthorizedHandler(handler) {
    if (handler !== null && typeof handler !== "function") {
        throw new TypeError("O callback de 401 tem de ser uma função ou null.");
    }

    unauthorizedHandler = handler;

    return () => {
        if (unauthorizedHandler === handler) {
            unauthorizedHandler = null;
        }
    };
}

/**
 * Constrói uma URL absoluta da API a partir de um caminho interno.
 *
 * @param {string} path Caminho da API, com ou sem barra inicial.
 * @returns {string} URL absoluta para o backend configurado.
 */
function buildUrl(path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${env.apiBaseUrl}${normalizedPath}`;
}

/**
 * Extrai uma mensagem utilizável de uma causa desconhecida.
 *
 * @param {unknown} error Valor lançado.
 * @returns {string | undefined} Mensagem técnica curta para diagnóstico.
 */
function getCauseMessage(error) {
    return error instanceof Error ? error.message : undefined;
}

/**
 * Cria um sinal que combina o cancelamento do chamador com o limite temporal.
 *
 * @param {AbortSignal | undefined} externalSignal Sinal fornecido pelo consumidor.
 * @param {number} timeoutMs Limite total do pedido, incluindo renovação CSRF.
 * @returns {{ signal: AbortSignal, didTimeout: () => boolean, cleanup: () => void }} Âmbito de cancelamento.
 */
function createAbortScope(externalSignal, timeoutMs) {
    const controller = new AbortController();
    let timedOut = false;

    const abortFromCaller = () => {
        controller.abort(externalSignal?.reason);
    };

    if (externalSignal?.aborted) {
        abortFromCaller();
    } else {
        externalSignal?.addEventListener("abort", abortFromCaller, {
            once: true,
        });
    }

    const timeoutId = globalThis.setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, timeoutMs);

    return {
        signal: controller.signal,
        didTimeout: () => timedOut,
        cleanup() {
            globalThis.clearTimeout(timeoutId);
            externalSignal?.removeEventListener("abort", abortFromCaller);
        },
    };
}

/**
 * Interpreta uma resposta sem assumir que todo o backend devolve JSON.
 *
 * @param {Response} response Resposta Fetch devolvida pelo navegador.
 * @returns {Promise<unknown>} JSON, mensagem textual ou null para corpo vazio.
 * @throws {ApiError} Quando uma resposta declarada como JSON é inválida.
 */
async function parseResponseBody(response) {
    if (response.status === 204 || response.status === 205) {
        return null;
    }

    const text = await response.text();

    if (!text.trim()) {
        return null;
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

    if (!contentType.includes("json")) {
        return { message: text };
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        throw new ApiError({
            status: response.status,
            code: "INVALID_RESPONSE",
            message: getClientApiErrorMessage("INVALID_RESPONSE"),
            details: { cause: getCauseMessage(error) },
            requestId:
                response.headers.get("x-request-id") ?? undefined,
        });
    }
}

/**
 * Notifica o contexto de sessão sem permitir que um erro no callback esconda
 * o erro HTTP original.
 *
 * @param {ApiError} error Erro 401 normalizado.
 * @returns {void}
 */
function notifyUnauthorized(error) {
    clearCsrfToken();

    try {
        unauthorizedHandler?.(error);
    } catch {
        // O consumidor não pode alterar o resultado determinístico do pedido.
    }
}

/**
 * Executa uma tentativa HTTP já preparada.
 *
 * @param {string} path Caminho interno da API.
 * @param {{ method: string, body?: unknown, rawBody?: BodyInit, headers?: HeadersInit, signal: AbortSignal } & RequestInit} options Opções da tentativa.
 * @returns {Promise<unknown>} Corpo interpretado.
 * @throws {ApiError} Para respostas HTTP não bem-sucedidas ou JSON inválido.
 */
async function performFetch(
    path,
    { method, body, rawBody, headers, signal, ...fetchOptions },
) {
    const requestHeaders = new Headers(headers);
    requestHeaders.set("Accept", "application/json");

    const requestOptions = {
        ...fetchOptions,
        method,
        credentials: "include",
        headers: requestHeaders,
        signal,
    };

    if (rawBody !== undefined) {
        requestOptions.body = rawBody;
    } else if (body !== undefined) {
        requestHeaders.set("Content-Type", "application/json");
        requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(buildUrl(path), requestOptions);

    let data;

    try {
        data = await parseResponseBody(response);
    } catch (error) {
        if (response.status === 401 && error instanceof ApiError) {
            notifyUnauthorized(error);
        }

        throw error;
    }

    if (!response.ok) {
        const responseIsJson = response.headers
            .get("content-type")
            ?.toLowerCase()
            .includes("json") === true;
        const payload =
            data && typeof data === "object" && !Array.isArray(data)
                ? data
                : {};
        const error = new ApiError({
            status: response.status,
            code:
                responseIsJson && typeof payload.code === "string"
                    ? payload.code
                    : "REQUEST_FAILED",
            message:
                responseIsJson && typeof payload.message === "string"
                    ? payload.message
                    : getDefaultApiErrorMessage(response.status),
            details: payload.details,
            requestId:
                response.headers.get("x-request-id") ??
                (typeof payload.requestId === "string"
                    ? payload.requestId
                    : undefined),
        });

        if (response.status === 401) {
            notifyUnauthorized(error);
        }

        throw error;
    }

    return data;
}

/**
 * Obtém e valida o token CSRF da sessão atual.
 *
 * @param {AbortSignal} signal Sinal comum ao pedido original.
 * @returns {Promise<string>} Token guardado apenas no módulo em memória.
 */
async function ensureCsrfToken(signal) {
    if (csrfToken) {
        return csrfToken;
    }

    const response = await performFetch(CSRF_ENDPOINT, {
        method: "GET",
        signal,
    });
    const receivedToken =
        response && typeof response === "object"
            ? response.csrfToken
            : undefined;

    if (typeof receivedToken !== "string" || !receivedToken.trim()) {
        throw new ApiError({
            status: 0,
            code: "CSRF_TOKEN_INVALID",
            message: getClientApiErrorMessage("CSRF_TOKEN_INVALID"),
        });
    }

    csrfToken = receivedToken;
    return csrfToken;
}

/**
 * Executa um pedido, acrescentando CSRF a métodos inseguros e renovando o token
 * no máximo uma vez quando o backend devolve `CSRF_INVALID`.
 *
 * @param {string} path Caminho interno da API.
 * @param {{ method: string, body?: unknown, rawBody?: BodyInit, headers?: HeadersInit, signal: AbortSignal, csrf?: boolean } & RequestInit} options Opções do pedido.
 * @returns {Promise<unknown>} Corpo interpretado.
 */
async function performRequest(path, { csrf = true, ...options }) {
    if (SAFE_HTTP_METHODS.has(options.method) || !csrf) {
        return performFetch(path, options);
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
        const currentToken = await ensureCsrfToken(options.signal);
        const csrfHeaders = new Headers(options.headers);
        csrfHeaders.set("X-CSRF-Token", currentToken);

        try {
            return await performFetch(path, {
                ...options,
                headers: csrfHeaders,
            });
        } catch (error) {
            const canRenew =
                attempt === 0 &&
                error instanceof ApiError &&
                error.code === "CSRF_INVALID";

            if (!canRenew) {
                throw error;
            }

            clearCsrfToken();
        }
    }

    throw new ApiError({
        status: 0,
        code: "CSRF_TOKEN_INVALID",
        message: getClientApiErrorMessage("CSRF_TOKEN_INVALID"),
    });
}

/**
 * Envia um pedido HTTP através do cliente central da API FaithFlix.
 *
 * @param {string} path Caminho da API a chamar.
 * @param {{ method?: string, body?: unknown, rawBody?: BodyInit, headers?: HeadersInit, timeoutMs?: number, signal?: AbortSignal, csrf?: boolean } & RequestInit} [options={}] Opções Fetch e limite temporal. `rawBody` é reservado a transports binários explícitos e `csrf:false` a endpoints públicos sem sessão.
 * @returns {Promise<unknown>} Corpo da resposta interpretado.
 * @throws {ApiError} Lança erros normalizados para falhas HTTP, de rede ou cancelamento.
 */
async function request(
    path,
    {
        method = "GET",
        body,
        headers,
        timeoutMs = API_REQUEST_TIMEOUT_MS,
        signal: externalSignal,
        csrf = true,
        ...options
    } = {},
) {
    const normalizedMethod = method.toUpperCase();
    const normalizedTimeout =
        Number.isFinite(timeoutMs) && timeoutMs > 0
            ? timeoutMs
            : API_REQUEST_TIMEOUT_MS;
    const abortScope = createAbortScope(externalSignal, normalizedTimeout);

    try {
        return await performRequest(path, {
            ...options,
            method: normalizedMethod,
            body,
            headers,
            csrf,
            signal: abortScope.signal,
        });
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        const code = abortScope.signal.aborted
            ? abortScope.didTimeout()
                ? "REQUEST_TIMEOUT"
                : "REQUEST_ABORTED"
            : "NETWORK_ERROR";

        throw new ApiError({
            status: 0,
            code,
            message:
                code === "NETWORK_ERROR"
                    ? getDefaultApiErrorMessage(0)
                    : getClientApiErrorMessage(code),
            details: { cause: getCauseMessage(error) },
        });
    } finally {
        abortScope.cleanup();
    }
}

/** @param {string} path @param {RequestInit & { timeoutMs?: number }} [options] @returns {Promise<unknown>} */
function get(path, options) {
    return request(path, { ...options, method: "GET" });
}

/** @param {string} path @param {unknown} body @param {RequestInit & { timeoutMs?: number }} [options] @returns {Promise<unknown>} */
function post(path, body, options) {
    return request(path, { ...options, method: "POST", body });
}

/** @param {string} path @param {unknown} body @param {RequestInit & { timeoutMs?: number }} [options] @returns {Promise<unknown>} */
function put(path, body, options) {
    return request(path, { ...options, method: "PUT", body });
}

/**
 * Envia um corpo Fetch binário sem serialização JSON.
 *
 * O consumidor tem de declarar o `Content-Type`; sessão, timeout, cancelamento
 * e renovação CSRF continuam a pertencer ao cliente central.
 *
 * @param {string} path Caminho interno da API.
 * @param {BodyInit} rawBody Blob/File/stream suportado pelo Fetch.
 * @param {RequestInit & { timeoutMs?: number }} [options] Opções do pedido.
 * @returns {Promise<unknown>} Resposta JSON interpretada.
 */
function putRaw(path, rawBody, options) {
    return request(path, { ...options, method: "PUT", rawBody });
}

/** @param {string} path @param {unknown} body @param {RequestInit & { timeoutMs?: number }} [options] @returns {Promise<unknown>} */
function patch(path, body, options) {
    return request(path, { ...options, method: "PATCH", body });
}

/** @param {string} path @param {RequestInit & { body?: unknown, timeoutMs?: number }} [options] @returns {Promise<unknown>} */
function del(path, options) {
    return request(path, { ...options, method: "DELETE" });
}

/**
 * Extrai um nome de ficheiro simples sem aceitar segmentos de caminho.
 *
 * @param {string | null} disposition Header Content-Disposition.
 * @returns {string} Nome seguro ou vazio.
 */
function downloadFilename(disposition) {
    if (!disposition) return "";

    const encoded = /filename\*=UTF-8''([^;]+)/iu.exec(disposition)?.[1];
    const quoted = /filename="([^"]+)"/iu.exec(disposition)?.[1];
    const plain = /filename=([^;\s]+)/iu.exec(disposition)?.[1];
    const candidate = encoded
        ? (() => {
            try {
                return decodeURIComponent(encoded);
            } catch {
                return "";
            }
        })()
        : quoted ?? plain ?? "";

    const basename = candidate
        .replaceAll("\\", "/")
        .split("/")
        .at(-1) ?? "";

    return Array.from(basename)
        .filter((character) => {
            const codePoint = character.codePointAt(0);
            return codePoint > 31 && codePoint !== 127;
        })
        .join("")
        .slice(0, 180);
}

/**
 * Descarrega um ficheiro privado por fetch autenticado sem navegar para a API.
 *
 * @param {string} path Caminho interno da API.
 * @param {{ timeoutMs?: number, signal?: AbortSignal, headers?: HeadersInit } & RequestInit} [options] Opções de leitura.
 * @returns {Promise<{ blob: Blob, filename: string }>} Blob e nome sugerido pelo backend.
 */
async function download(
    path,
    {
        timeoutMs = API_REQUEST_TIMEOUT_MS,
        signal: externalSignal,
        headers,
        ...options
    } = {},
) {
    const normalizedTimeout =
        Number.isFinite(timeoutMs) && timeoutMs > 0
            ? timeoutMs
            : API_REQUEST_TIMEOUT_MS;
    const abortScope = createAbortScope(externalSignal, normalizedTimeout);
    const requestHeaders = new Headers(headers);
    requestHeaders.set("Accept", "text/csv");

    try {
        const response = await fetch(buildUrl(path), {
            ...options,
            method: "GET",
            credentials: "include",
            headers: requestHeaders,
            signal: abortScope.signal,
        });

        if (!response.ok) {
            const data = await parseResponseBody(response);
            const payload =
                data && typeof data === "object" && !Array.isArray(data)
                    ? data
                    : {};
            const responseIsJson = response.headers
                .get("content-type")
                ?.toLowerCase()
                .includes("json") === true;
            const error = new ApiError({
                status: response.status,
                code:
                    responseIsJson && typeof payload.code === "string"
                        ? payload.code
                        : "REQUEST_FAILED",
                message:
                    responseIsJson && typeof payload.message === "string"
                        ? payload.message
                        : getDefaultApiErrorMessage(response.status),
                details: payload.details,
                requestId:
                    response.headers.get("x-request-id") ??
                    (typeof payload.requestId === "string"
                        ? payload.requestId
                        : undefined),
            });

            if (response.status === 401) notifyUnauthorized(error);
            throw error;
        }

        return {
            blob: await response.blob(),
            filename: downloadFilename(
                response.headers.get("content-disposition"),
            ),
        };
    } catch (error) {
        if (error instanceof ApiError) throw error;

        const code = abortScope.signal.aborted
            ? abortScope.didTimeout()
                ? "REQUEST_TIMEOUT"
                : "REQUEST_ABORTED"
            : "NETWORK_ERROR";
        throw new ApiError({
            status: 0,
            code,
            message:
                code === "NETWORK_ERROR"
                    ? getDefaultApiErrorMessage(0)
                    : getClientApiErrorMessage(code),
            details: { cause: getCauseMessage(error) },
        });
    } finally {
        abortScope.cleanup();
    }
}

export const apiClient = Object.freeze({
    get,
    post,
    put,
    putRaw,
    patch,
    del,
    download,
});
