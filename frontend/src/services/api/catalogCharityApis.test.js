/**
 * @file Contratos de cancelamento e codificação nas APIs públicas residuais.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { biblicalPassagesApi } from "./biblicalPassagesApi.js";
import { catalogApi } from "./catalogApi.js";
import { charitiesApi } from "./charitiesApi.js";

const mocks = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    putRaw: vi.fn(),
    del: vi.fn(),
}));

vi.mock("./apiClient.js", () => ({ apiClient: mocks }));
vi.mock("../../config/env.js", () => ({
    env: { apiBaseUrl: "https://api.faithflix.test" },
}));

describe("APIs públicas de catálogo e associações", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("propaga o sinal e codifica detalhe e passagens", () => {
        const options = { signal: new AbortController().signal };

        catalogApi.listPublished(
            { type: "movie", page: 2, limit: 24 },
            options,
        );
        catalogApi.getDetail("slug/com espaço", options);
        biblicalPassagesApi.listForContent("slug/com espaço", options);

        expect(mocks.get).toHaveBeenNthCalledWith(
            1,
            "/api/catalog?type=movie&page=2&limit=24",
            options,
        );
        expect(mocks.get).toHaveBeenNthCalledWith(
            2,
            "/api/catalog/slug%2Fcom%20espa%C3%A7o",
            options,
        );
        expect(mocks.get).toHaveBeenNthCalledWith(
            3,
            "/api/catalog/slug%2Fcom%20espa%C3%A7o/biblical-passages",
            options,
        );
    });

    it("codifica o identificador no URL absoluto do CSV", () => {
        expect(
            charitiesApi.historyCsvUrl("charity/com espaço?formato=csv"),
        ).toBe(
            "https://api.faithflix.test/api/charities/charity%2Fcom%20espa%C3%A7o%3Fformato%3Dcsv/history.csv",
        );
    });

    it("expõe o ciclo completo de ingestão MP4 com paths codificados", () => {
        const options = { signal: new AbortController().signal };
        const file = new Blob(["mp4"], { type: "video/mp4" });
        const input = {
            quality: "1080p",
            mimeType: "video/mp4",
            expectedSizeBytes: file.size,
        };

        catalogApi.listMediaAssets("conteúdo/1", options);
        catalogApi.createMediaUpload("conteúdo/1", input, options);
        catalogApi.uploadMediaFile("conteúdo/1", "upload/1", file, options);
        catalogApi.activateMediaUpload("conteúdo/1", "upload/1", 7, options);
        catalogApi.abortMediaUpload("conteúdo/1", "upload/1", options);

        const contentPath = "conte%C3%BAdo%2F1";
        const uploadPath = "upload%2F1";
        expect(mocks.get).toHaveBeenCalledWith(
            `/api/catalog/${contentPath}/media-assets`,
            options,
        );
        expect(mocks.post).toHaveBeenNthCalledWith(
            1,
            `/api/catalog/${contentPath}/media-uploads`,
            input,
            options,
        );
        expect(mocks.putRaw).toHaveBeenCalledWith(
            `/api/catalog/${contentPath}/media-uploads/${uploadPath}`,
            file,
            expect.objectContaining({
                signal: options.signal,
                timeoutMs: 600_000,
                headers: expect.any(Headers),
            }),
        );
        expect(mocks.putRaw.mock.calls[0][2].headers.get("Content-Type")).toBe(
            "video/mp4",
        );
        expect(mocks.post).toHaveBeenNthCalledWith(
            2,
            `/api/catalog/${contentPath}/media-uploads/${uploadPath}/activate`,
            { expectedVersion: 7 },
            options,
        );
        expect(mocks.del).toHaveBeenCalledWith(
            `/api/catalog/${contentPath}/media-uploads/${uploadPath}`,
            options,
        );
    });

    it("propaga cancelamento na área própria e candidatura", () => {
        const options = { signal: new AbortController().signal };
        const application = { name: "Associação Segura" };

        charitiesApi.getMine(options);
        charitiesApi.submitApplication(application, options);

        expect(mocks.get).toHaveBeenCalledWith("/api/charities/me", options);
        expect(mocks.post).toHaveBeenCalledWith(
            "/api/charities/applications",
            application,
            options,
        );
    });
});
