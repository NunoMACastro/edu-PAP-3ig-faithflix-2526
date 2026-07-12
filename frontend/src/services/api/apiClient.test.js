/**
 * @file Testes do transporte HTTP, cancelamento, erros e proteção CSRF.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./apiErrors.js";
import {
    API_REQUEST_TIMEOUT_MS,
    apiClient,
    clearCsrfToken,
    setUnauthorizedHandler,
} from "./apiClient.js";

/**
 * Cria uma resposta Fetch determinística sem depender de um servidor HTTP.
 *
 * @param {unknown} body Corpo JSON, texto ou null.
 * @param {{ status?: number, contentType?: string, headers?: Record<string, string>, raw?: boolean }} [options] Opções da resposta.
 * @returns {Response} Resposta compatível com Fetch.
 */
function createResponse(
    body,
    {
        status = 200,
        contentType = "application/json",
        headers = {},
        raw = false,
    } = {},
) {
    const responseBody =
        body === null || body === undefined
            ? null
            : raw
              ? String(body)
              : JSON.stringify(body);

    return new Response(responseBody, {
        status,
        headers: {
            ...(contentType ? { "content-type": contentType } : {}),
            ...headers,
        },
    });
}

describe("apiClient", () => {
    beforeEach(() => {
        clearCsrfToken();
        setUnauthorizedHandler(null);
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        setUnauthorizedHandler(null);
        clearCsrfToken();
        vi.unstubAllGlobals();
    });

    it("define um timeout por omissão de dez segundos", () => {
        expect(API_REQUEST_TIMEOUT_MS).toBe(10_000);
    });

    it.each([204, 205])("trata HTTP %i como resposta vazia", async (status) => {
        fetch.mockResolvedValueOnce(createResponse(null, { status }));

        await expect(apiClient.get("/api/empty")).resolves.toBeNull();
    });

    it("trata um corpo vazio HTTP 200 como null", async () => {
        fetch.mockResolvedValueOnce(createResponse(null));

        await expect(apiClient.get("/api/empty")).resolves.toBeNull();
    });

    it("normaliza JSON inválido com request id", async () => {
        fetch.mockResolvedValueOnce(
            createResponse("{invalid", {
                raw: true,
                headers: { "x-request-id": "req-invalid-json" },
            }),
        );

        await expect(apiClient.get("/api/invalid")).rejects.toMatchObject({
            name: "ApiError",
            status: 200,
            code: "INVALID_RESPONSE",
            requestId: "req-invalid-json",
        });
    });

    it("não apresenta texto bruto de uma resposta de erro não JSON", async () => {
        fetch.mockResolvedValueOnce(
            createResponse("stack trace interno", {
                status: 502,
                contentType: "text/plain",
                raw: true,
            }),
        );

        await expect(apiClient.get("/api/untrusted-error")).rejects.toMatchObject({
            status: 502,
            code: "REQUEST_FAILED",
            message: "O servidor teve um problema. Tenta novamente dentro de momentos.",
        });
    });

    it("preserva code/requestId e notifica o callback em HTTP 401", async () => {
        const onUnauthorized = vi.fn();
        setUnauthorizedHandler(onUnauthorized);
        fetch.mockResolvedValueOnce(
            createResponse(
                {
                    code: "SESSION_EXPIRED",
                    message: "Sessão expirada.",
                    requestId: "req-body",
                },
                {
                    status: 401,
                    headers: { "x-request-id": "req-header" },
                },
            ),
        );

        const request = apiClient.get("/api/private");

        await expect(request).rejects.toMatchObject({
            status: 401,
            code: "SESSION_EXPIRED",
            requestId: "req-header",
        });
        expect(onUnauthorized).toHaveBeenCalledOnce();
        expect(onUnauthorized.mock.calls[0][0]).toBeInstanceOf(ApiError);
    });

    it("descarrega Blob autenticado e respeita Content-Disposition", async () => {
        fetch.mockResolvedValueOnce(
            createResponse("metric,value\nusers.total,2", {
                contentType: "text/csv; charset=utf-8",
                headers: {
                    "content-disposition":
                        'attachment; filename="faithflix-metricas.csv"',
                },
                raw: true,
            }),
        );

        const file = await apiClient.download("/api/admin/metrics/export.csv");

        expect(file.filename).toBe("faithflix-metricas.csv");
        expect(file.blob).toBeInstanceOf(Blob);
        expect(fetch.mock.calls[0][1].credentials).toBe("include");
        expect(fetch.mock.calls[0][1].headers.get("Accept")).toBe("text/csv");
    });

    it("envia CSRF em mutações e renova-o uma única vez", async () => {
        fetch
            .mockResolvedValueOnce(createResponse({ csrfToken: "token-1" }))
            .mockResolvedValueOnce(
                createResponse(
                    { code: "CSRF_INVALID", message: "Token expirado." },
                    { status: 403 },
                ),
            )
            .mockResolvedValueOnce(createResponse({ csrfToken: "token-2" }))
            .mockResolvedValueOnce(createResponse({ saved: true }));

        await expect(
            apiClient.post("/api/preferences", { enabled: true }),
        ).resolves.toEqual({ saved: true });

        expect(fetch).toHaveBeenCalledTimes(4);
        expect(new URL(fetch.mock.calls[0][0]).pathname).toBe(
            "/api/session/csrf-token",
        );
        expect(fetch.mock.calls[1][1].headers.get("X-CSRF-Token")).toBe(
            "token-1",
        );
        expect(fetch.mock.calls[3][1].headers.get("X-CSRF-Token")).toBe(
            "token-2",
        );
        expect(fetch.mock.calls[3][1].credentials).toBe("include");
    });

    it("envia um Blob raw sem serialização JSON e mantém CSRF", async () => {
        const file = new Blob(["mp4-bytes"], { type: "video/mp4" });
        fetch
            .mockResolvedValueOnce(createResponse({ csrfToken: "token-media" }))
            .mockResolvedValueOnce(createResponse({ asset: { id: "asset-1" } }));

        await expect(
            apiClient.putRaw("/api/catalog/content-1/media-uploads/upload-1", file, {
                headers: { "Content-Type": "video/mp4" },
            }),
        ).resolves.toEqual({ asset: { id: "asset-1" } });

        const request = fetch.mock.calls[1][1];
        expect(request.body).toBe(file);
        expect(request.headers.get("Content-Type")).toBe("video/mp4");
        expect(request.headers.get("X-CSRF-Token")).toBe("token-media");
        expect(request.credentials).toBe("include");
    });

    it("permite omitir CSRF apenas quando o consumidor o declara", async () => {
        fetch.mockResolvedValueOnce(createResponse({ authenticated: true }));

        await expect(
            apiClient.post(
                "/api/auth/login",
                { email: "user@example.test", password: "password-segura" },
                { csrf: false },
            ),
        ).resolves.toEqual({ authenticated: true });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(new URL(fetch.mock.calls[0][0]).pathname).toBe("/api/auth/login");
        expect(fetch.mock.calls[0][1].headers.has("X-CSRF-Token")).toBe(false);
    });

    it("não entra num ciclo quando o segundo token CSRF também falha", async () => {
        fetch
            .mockResolvedValueOnce(createResponse({ csrfToken: "token-1" }))
            .mockResolvedValueOnce(
                createResponse(
                    { code: "CSRF_INVALID", message: "Token inválido." },
                    { status: 403 },
                ),
            )
            .mockResolvedValueOnce(createResponse({ csrfToken: "token-2" }))
            .mockResolvedValueOnce(
                createResponse(
                    { code: "CSRF_INVALID", message: "Token inválido." },
                    { status: 403 },
                ),
            );

        await expect(
            apiClient.del("/api/account"),
        ).rejects.toMatchObject({ code: "CSRF_INVALID" });
        expect(fetch).toHaveBeenCalledTimes(4);
    });

    it("distingue cancelamento externo de timeout", async () => {
        fetch.mockImplementation((_url, { signal }) =>
            new Promise((_resolve, reject) => {
                signal.addEventListener(
                    "abort",
                    () => reject(new DOMException("Abortado", "AbortError")),
                    { once: true },
                );
            }),
        );

        const controller = new AbortController();
        const abortedRequest = apiClient.get("/api/slow", {
            signal: controller.signal,
        });
        controller.abort();

        await expect(abortedRequest).rejects.toMatchObject({
            status: 0,
            code: "REQUEST_ABORTED",
        });
        await expect(
            apiClient.get("/api/slow", { timeoutMs: 5 }),
        ).rejects.toMatchObject({
            status: 0,
            code: "REQUEST_TIMEOUT",
        });
    });
});
