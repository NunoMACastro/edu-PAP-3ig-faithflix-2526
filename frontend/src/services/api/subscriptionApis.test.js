/**
 * @file Contratos HTTP do checkout/trial idempotentes e família codificada.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { paymentsApi } from "./paymentsApi.js";
import { subscriptionsApi } from "./subscriptionsApi.js";

const mocks = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    del: vi.fn(),
}));

vi.mock("./apiClient.js", () => ({ apiClient: mocks }));

describe("APIs de subscrição", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("coloca Idempotency-Key no header e nunca no payload", () => {
        paymentsApi.simulatedCheckout(
            { planCode: "family-monthly" },
            { idempotencyKey: "checkout-key", signal: new AbortController().signal },
        );

        expect(mocks.post).toHaveBeenCalledWith(
            "/api/payments/simulated-checkout",
            { planCode: "family-monthly" },
            expect.objectContaining({
                headers: expect.any(Headers),
                signal: expect.any(AbortSignal),
            }),
        );
        const options = mocks.post.mock.calls[0][2];
        expect(options.headers.get("Idempotency-Key")).toBe("checkout-key");
        expect(mocks.post.mock.calls[0][1]).not.toHaveProperty(
            "idempotencyKey",
        );
    });

    it("codifica identificadores familiares no URL", () => {
        subscriptionsApi.declineFamilyInvitation("id/com espaço");
        subscriptionsApi.removeFamilyMember("user/id");

        expect(mocks.post.mock.calls[0][0]).toBe(
            "/api/subscriptions/family/invitations/id%2Fcom%20espa%C3%A7o/decline",
        );
        expect(mocks.del.mock.calls[0][0]).toBe(
            "/api/subscriptions/family/members/user%2Fid",
        );
    });
});
