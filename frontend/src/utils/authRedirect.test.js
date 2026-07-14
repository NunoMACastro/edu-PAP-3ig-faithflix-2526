/**
 * @file Baseline dos redirecionamentos internos de autenticação.
 */

import { describe, expect, it } from "vitest";
import {
    buildLoginRedirectPath,
    getDefaultAuthenticatedPath,
    getSafeRedirectPath,
    resolveAuthenticatedPath,
} from "./authRedirect.js";

describe("authRedirect", () => {
    it("preserva paths internos simples", () => {
        expect(getSafeRedirectPath("/catalogo?page=2")).toBe(
            "/catalogo?page=2",
        );
        expect(buildLoginRedirectPath("/catalogo")).toBe(
            "/login?next=%2Fcatalogo",
        );
    });

    it("rejeita destinos protocol-relative", () => {
        expect(getSafeRedirectPath("//example.test")).toBeNull();
    });

    it.each([
        "https://example.test",
        "/\\example.test",
        "/%5Cexample.test",
        "/%255Cexample.test",
        "/%0Aexample.test",
        "/%250Aexample.test",
        " /catalogo",
        "/catalogo ",
        "/%",
    ])("rejeita um destino ambíguo ou perigoso: %s", (destination) => {
        expect(getSafeRedirectPath(destination)).toBeNull();
        expect(buildLoginRedirectPath(destination)).toBe(
            "/login?next=%2F",
        );
    });

    it("preserva query string e fragmento de um path interno", () => {
        expect(getSafeRedirectPath("/catalogo?page=2#resultados")).toBe(
            "/catalogo?page=2#resultados",
        );
    });

    it("resolve landings por role e mantém next interno como prioridade", () => {
        expect(getDefaultAuthenticatedPath({ role: "admin" })).toBe("/admin");
        expect(getDefaultAuthenticatedPath({ role: "moderator" })).toBe("/admin/catalogo");
        expect(getDefaultAuthenticatedPath({ role: "user" })).toBe("/");
        expect(resolveAuthenticatedPath({ role: "admin" }, "/catalogo?preview=1")).toBe("/catalogo?preview=1");
        expect(resolveAuthenticatedPath({ role: "admin" }, "https://example.test")).toBe("/admin");
    });
});
