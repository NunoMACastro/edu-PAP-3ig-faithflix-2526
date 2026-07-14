/**
 * @file Contratos de propagação de cancelamento dos clientes de interação.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { commentsApi } from "./commentsApi.js";
import { ratingsApi } from "./ratingsApi.js";

const mocks = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
}));

vi.mock("./apiClient.js", () => ({
    apiClient: mocks,
}));

describe("interaction APIs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("propaga opções canceláveis em todos os pedidos de ratings", () => {
        const options = { signal: new AbortController().signal };

        ratingsApi.getSummary("content/1", options);
        ratingsApi.getMine("content/1", options);
        ratingsApi.save("content/1", 4, options);
        ratingsApi.remove("content/1", options);

        expect(mocks.get).toHaveBeenNthCalledWith(
            1,
            "/api/ratings/content%2F1/summary",
            options,
        );
        expect(mocks.get).toHaveBeenNthCalledWith(
            2,
            "/api/ratings/content%2F1/me",
            options,
        );
        expect(mocks.put).toHaveBeenCalledWith(
            "/api/ratings/content%2F1",
            { value: 4 },
            options,
        );
        expect(mocks.del).toHaveBeenCalledWith(
            "/api/ratings/content%2F1",
            options,
        );
    });

    it("propaga opções canceláveis em todos os pedidos de comentários", () => {
        const options = { signal: new AbortController().signal };

        commentsApi.list("content/1", options);
        commentsApi.create("content/1", "Corpo", options);
        commentsApi.remove("comment/1", options);
        commentsApi.moderate("comment/1", { status: "approved" }, options);

        expect(mocks.get).toHaveBeenCalledWith(
            "/api/comments/content%2F1",
            options,
        );
        expect(mocks.post).toHaveBeenCalledWith(
            "/api/comments/content%2F1",
            { body: "Corpo" },
            options,
        );
        expect(mocks.del).toHaveBeenCalledWith(
            "/api/comments/comment%2F1",
            options,
        );
        expect(mocks.patch).toHaveBeenCalledWith(
            "/api/comments/comment%2F1/moderation",
            { status: "approved" },
            options,
        );
    });
});
