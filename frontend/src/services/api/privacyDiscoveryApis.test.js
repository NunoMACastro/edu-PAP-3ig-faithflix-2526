/**
 * @file Contratos de propagação de cancelamento em privacidade e discovery.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { discoveryApi } from "./discoveryApi.js";
import { privacyApi } from "./privacyApi.js";

const mocks = vi.hoisted(() => ({
    get: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
}));

vi.mock("./apiClient.js", () => ({
    apiClient: mocks,
}));

describe("privacy/discovery APIs", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("propaga opções canceláveis nas leituras e escrita de consentimentos", () => {
        const options = { signal: new AbortController().signal };
        const consents = {
            personalizedRecommendations: true,
            operationalNotifications: false,
            anonymousMetrics: true,
        };

        privacyApi.getMyConsents(options);
        privacyApi.exportMyData(options);
        privacyApi.updateMyConsents(consents, options);

        expect(mocks.get).toHaveBeenNthCalledWith(
            1,
            "/api/privacy/consents",
            options,
        );
        expect(mocks.get).toHaveBeenNthCalledWith(
            2,
            "/api/privacy/export",
            options,
        );
        expect(mocks.put).toHaveBeenCalledWith(
            "/api/privacy/consents",
            consents,
            options,
        );
    });

    it("propaga opções e codifica o identificador nas leituras discovery", () => {
        const options = { signal: new AbortController().signal };

        discoveryApi.home(options);
        discoveryApi.related("content/with space", options);

        expect(mocks.get).toHaveBeenNthCalledWith(
            1,
            "/api/discovery/home",
            options,
        );
        expect(mocks.get).toHaveBeenNthCalledWith(
            2,
            "/api/discovery/related/content%2Fwith%20space",
            options,
        );
    });
});
