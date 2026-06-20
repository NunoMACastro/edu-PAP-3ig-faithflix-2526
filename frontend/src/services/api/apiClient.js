/**
 * @file Ficheiro `real_dev/frontend/src/services/api/apiClient.js` da implementação real_dev.
 */

import { env } from "../../config/env.js";
import { ApiError, getDefaultApiErrorMessage } from "./apiErrors.js";

/**
 * Constrói uma URL absoluta da API a partir de um caminho de rota.
 *
 * @param {string} path - Caminho da API, com ou sem barra inicial.
 * @returns {string} URL absoluta para o backend configurado.
 */
function buildUrl(path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${env.apiBaseUrl}${normalizedPath}`;
}

/**
 * Interpreta o corpo de uma resposta HTTP de acordo com o respetivo tipo de conteúdo.
 *
 * @param {Response} response - Resposta Fetch devolvida pelo navegador.
 * @returns {Promise<unknown>} JSON interpretado, invólucro de texto ou null para respostas vazias.
 */
async function parseResponseBody(response) {
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : null;
}

/**
 * Envia um pedido HTTP através do cliente central da API FaithFlix.
 *
 * @param {string} path - Caminho da API a chamar.
 * @param {{ method?: string, body?: unknown, headers?: Record<string, string> } & RequestInit} [options={}] - Opções de Fetch.
 * @returns {Promise<unknown>} Corpo da resposta interpretado.
 * @throws {ApiError} Lança erros normalizados para falhas HTTP ou de rede.
 */
async function request(
    path,
    { method = "GET", body, headers = {}, ...options } = {},
) {
    const requestHeaders = {
        Accept: "application/json",
        ...headers,
    };

    const requestOptions = {
        method,
        // Isto é necessário para futuros cookies de sessão HttpOnly.
        credentials: "include",
        headers: requestHeaders,
        ...options,
    };

    if (body !== undefined) {
        requestHeaders["Content-Type"] = "application/json";
        requestOptions.body = JSON.stringify(body);
    }

    let response;

    try {
        response = await fetch(buildUrl(path), requestOptions);
    } catch (error) {
        throw new ApiError({
            status: 0,
            message: getDefaultApiErrorMessage(0),
            details: { cause: error.message },
        });
    }

    const data = await parseResponseBody(response);

    if (!response.ok) {
        throw new ApiError({
            status: response.status,
            message:
                data?.message ?? getDefaultApiErrorMessage(response.status),
            details: data?.details,
            requestId: response.headers.get("x-request-id") ?? undefined,
        });
    }

    return data;
}

/**
 * Envia um pedido GET.
 *
 * @param {string} path - Caminho da API a chamar.
 * @param {RequestInit} [options] - Configuração Fetch opcional.
 * @returns {Promise<unknown>} Corpo da resposta interpretado.
 */
function get(path, options) {
    return request(path, { ...options, method: "GET" });
}

/**
 * Envia um pedido POST com corpo JSON opcional.
 *
 * @param {string} path - Caminho da API a chamar.
 * @param {unknown} body - Corpo JSON a enviar.
 * @param {RequestInit} [options] - Configuração Fetch opcional.
 * @returns {Promise<unknown>} Corpo da resposta interpretado.
 */
function post(path, body, options) {
    return request(path, { ...options, method: "POST", body });
}

/**
 * Envia um pedido PUT com corpo JSON opcional.
 *
 * @param {string} path - Caminho da API a chamar.
 * @param {unknown} body - Corpo JSON a enviar.
 * @param {RequestInit} [options] - Configuração Fetch opcional.
 * @returns {Promise<unknown>} Corpo da resposta interpretado.
 */
function put(path, body, options) {
    return request(path, { ...options, method: "PUT", body });
}

/**
 * Envia um pedido PATCH com corpo JSON opcional.
 *
 * @param {string} path - Caminho da API a chamar.
 * @param {unknown} body - Corpo JSON a enviar.
 * @param {RequestInit} [options] - Configuração Fetch opcional.
 * @returns {Promise<unknown>} Corpo da resposta interpretado.
 */
function patch(path, body, options) {
    return request(path, { ...options, method: "PATCH", body });
}

/**
 * Envia um pedido DELETE.
 *
 * @param {string} path - Caminho da API a chamar.
 * @param {RequestInit} [options] - Configuração Fetch opcional.
 * @returns {Promise<unknown>} Corpo da resposta interpretado.
 */
function del(path, options) {
    return request(path, { ...options, method: "DELETE" });
}

export const apiClient = {
    get,
    post,
    put,
    patch,
    del,
};
