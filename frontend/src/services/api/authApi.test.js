/**
 * @file Contratos internos do cliente público de autenticação.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    post: vi.fn(),
    clearCsrfToken: vi.fn(),
}));

vi.mock("./apiClient.js", () => ({
    apiClient: {
        post: mocks.post,
        get: vi.fn(),
    },
    clearCsrfToken: mocks.clearCsrfToken,
}));

import { authApi } from "./authApi.js";

describe("authApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.post.mockResolvedValue({ ok: true });
    });

    it.each([
        ["register", "/api/auth/register"],
        ["login", "/api/auth/login"],
        ["forgotPassword", "/api/auth/forgot-password"],
        ["resetPassword", "/api/auth/reset-password"],
    ])("passa AbortSignal em %s sem permitir CSRF público", async (method, path) => {
        const controller = new AbortController();
        const payload = { email: "user@faithflix.test" };

        await authApi[method](payload, { signal: controller.signal });

        expect(mocks.post).toHaveBeenCalledWith(path, payload, {
            signal: controller.signal,
            csrf: false,
        });
    });

    it.each(["register", "login"])(
        "limpa o token CSRF anterior depois de %s bem-sucedido",
        async (method) => {
            await authApi[method]({});
            expect(mocks.clearCsrfToken).toHaveBeenCalledTimes(1);
        },
    );
});
