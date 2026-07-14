/**
 * @file Contratos de segurança da origem pública da API.
 */

import { describe, expect, it } from "vitest";
import { resolveApiBaseUrl } from "./apiBaseUrl.js";

describe("resolveApiBaseUrl", () => {
    it("usa localhost apenas como fallback de development/test", () => {
        expect(resolveApiBaseUrl({ mode: "development" })).toBe(
            "http://localhost:3101",
        );
        expect(resolveApiBaseUrl({ mode: "test" })).toBe(
            "http://localhost:3101",
        );
    });

    it("falha sem configuração explícita em production", () => {
        expect(() => resolveApiBaseUrl({ mode: "production" })).toThrow(
            /VITE_API_BASE_URL é obrigatório/u,
        );
    });

    it("exige HTTPS e rejeita localhost em production", () => {
        expect(() =>
            resolveApiBaseUrl({
                rawValue: "http://api.faithflix.test",
                mode: "production",
            }),
        ).toThrow(/HTTPS/u);
        expect(() =>
            resolveApiBaseUrl({
                rawValue: "https://localhost:3101",
                mode: "production",
            }),
        ).toThrow(/localhost/u);
    });

    it("normaliza uma origem HTTPS válida sem barra final", () => {
        expect(
            resolveApiBaseUrl({
                rawValue: "https://api.faithflix.test/base/",
                mode: "production",
            }),
        ).toBe("https://api.faithflix.test/base");
    });

    it("não permite HTTP remoto nem credenciais em development", () => {
        expect(() =>
            resolveApiBaseUrl({
                rawValue: "http://api.faithflix.test",
                mode: "development",
            }),
        ).toThrow(/HTTPS/u);
        expect(() =>
            resolveApiBaseUrl({
                rawValue: "https://user:secret@api.faithflix.test",
                mode: "development",
            }),
        ).toThrow(/credenciais/u);
    });
});
