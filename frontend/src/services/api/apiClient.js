import { env } from "../../config/env.js";
import { ApiError, getDefaultApiErrorMessage } from "./apiErrors.js";

function buildUrl(path) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${env.apiBaseUrl}${normalizedPath}`;
}

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

export const apiClient = {
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) =>
        request(path, { ...options, method: "POST", body }),
    put: (path, body, options) =>
        request(path, { ...options, method: "PUT", body }),
    patch: (path, body, options) =>
        request(path, { ...options, method: "PATCH", body }),
    del: (path, options) => request(path, { ...options, method: "DELETE" }),
};