import { env } from "../../config/env.js";
import { ApiError, getDefaultApiErrorMessage } from "./apiErrors.js";

/**
 * Builds an absolute API URL from a route path.
 *
 * @param {string} path - API path, with or without leading slash.
 * @returns {string} Absolute URL pointing to the configured backend.
 */
function buildUrl(path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${env.apiBaseUrl}${normalizedPath}`;
}

/**
 * Parses an HTTP response body according to its content type.
 *
 * @param {Response} response - Fetch response returned by the browser.
 * @returns {Promise<unknown>} Parsed JSON, text wrapper, or null for empty responses.
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
 * Sends one HTTP request through the central FaithFlix API client.
 *
 * @param {string} path - API path to call.
 * @param {{ method?: string, body?: unknown, headers?: Record<string, string> } & RequestInit} [options={}] - Fetch options.
 * @returns {Promise<unknown>} Parsed response body.
 * @throws {ApiError} Throws normalized errors for HTTP and network failures.
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
        // This is required for future HttpOnly session cookies.
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
 * Sends a GET request.
 *
 * @param {string} path - API path to call.
 * @param {RequestInit} [options] - Optional fetch configuration.
 * @returns {Promise<unknown>} Parsed response body.
 */
function get(path, options) {
    return request(path, { ...options, method: "GET" });
}

/**
 * Sends a POST request with an optional JSON body.
 *
 * @param {string} path - API path to call.
 * @param {unknown} body - JSON body to send.
 * @param {RequestInit} [options] - Optional fetch configuration.
 * @returns {Promise<unknown>} Parsed response body.
 */
function post(path, body, options) {
    return request(path, { ...options, method: "POST", body });
}

/**
 * Sends a PUT request with an optional JSON body.
 *
 * @param {string} path - API path to call.
 * @param {unknown} body - JSON body to send.
 * @param {RequestInit} [options] - Optional fetch configuration.
 * @returns {Promise<unknown>} Parsed response body.
 */
function put(path, body, options) {
    return request(path, { ...options, method: "PUT", body });
}

/**
 * Sends a PATCH request with an optional JSON body.
 *
 * @param {string} path - API path to call.
 * @param {unknown} body - JSON body to send.
 * @param {RequestInit} [options] - Optional fetch configuration.
 * @returns {Promise<unknown>} Parsed response body.
 */
function patch(path, body, options) {
    return request(path, { ...options, method: "PATCH", body });
}

/**
 * Sends a DELETE request.
 *
 * @param {string} path - API path to call.
 * @param {RequestInit} [options] - Optional fetch configuration.
 * @returns {Promise<unknown>} Parsed response body.
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
