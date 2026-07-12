/**
 * @file Regressões mensuráveis dos tokens de contraste e dimensões acessíveis.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const globalCss = readFileSync(resolve(process.cwd(), "src/styles/global.css"), "utf8");
const tokensCss = readFileSync(resolve(process.cwd(), "src/styles/tokens.css"), "utf8");

/**
 * Obtém um token hexadecimal fechado a partir da folha de estilos.
 *
 * @param {string} name - Nome CSS completo, incluindo os dois hífenes.
 * @returns {string} Cor hexadecimal do token.
 */
function extractHexToken(name) {
    const match = tokensCss.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, "i"));

    if (!match) {
        throw new Error(`Token de cor em falta: ${name}`);
    }

    return match[1];
}

/**
 * Converte uma cor sRGB hexadecimal em luminância relativa WCAG.
 *
 * @param {string} hex - Cor hexadecimal com seis dígitos.
 * @returns {number} Luminância relativa entre zero e um.
 */
function relativeLuminance(hex) {
    const channels = hex
        .slice(1)
        .match(/.{2}/g)
        .map((channel) => Number.parseInt(channel, 16) / 255)
        .map((channel) =>
            channel <= 0.04045
                ? channel / 12.92
                : ((channel + 0.055) / 1.055) ** 2.4,
        );

    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/**
 * Calcula a razão de contraste WCAG entre duas cores opacas.
 *
 * @param {string} foreground - Cor de primeiro plano.
 * @param {string} background - Cor de fundo.
 * @returns {number} Razão de contraste, em que 1 representa cores iguais.
 */
function contrastRatio(foreground, background) {
    const first = relativeLuminance(foreground);
    const second = relativeLuminance(background);
    const lighter = Math.max(first, second);
    const darker = Math.min(first, second);

    return (lighter + 0.05) / (darker + 0.05);
}

describe("contratos CSS de acessibilidade", () => {
    it.each([
        ["texto principal", "--color-text", "--color-bg", 4.5],
        ["texto secundário", "--color-muted", "--color-surface", 4.5],
        ["marca sobre fundo", "--color-brand-strong", "--color-bg", 4.5],
        ["marca sobre superfície", "--color-brand-strong", "--color-surface", 4.5],
        ["marca sobre superfície suave", "--color-brand-strong", "--color-surface-soft", 4.5],
        ["erro sobre fundo", "--color-danger", "--color-bg", 4.5],
        ["erro sobre superfície", "--color-danger", "--color-surface", 4.5],
        ["texto de botão", "--color-text-inverse", "--color-brand-strong", 4.5],
        ["texto de botão em hover", "--color-text-inverse", "--color-brand-hover", 4.5],
        ["texto de ação perigosa", "--color-text-inverse", "--color-danger", 4.5],
        ["texto de ação perigosa em hover", "--color-text-inverse", "--color-danger-hover", 4.5],
        ["foco sobre superfície", "--color-focus", "--color-surface", 3],
        ["limite de controlo", "--color-control-border", "--color-surface", 3],
    ])("mantém contraste suficiente para %s", (_label, foreground, background, minimum) => {
        expect(
            contrastRatio(extractHexToken(foreground), extractHexToken(background)),
        ).toBeGreaterThanOrEqual(minimum);
    });

    it("mantém alvos de 44 px, header fechado compacto e redução global de movimento", () => {
        const targetSize = Number(tokensCss.match(/--target-size:\s*([0-9.]+)rem/)[1]);
        const headerHeight = Number(
            tokensCss.match(/--header-height-closed:\s*([0-9.]+)rem/)[1],
        );

        expect(targetSize * 16).toBeGreaterThanOrEqual(44);
        expect(headerHeight * 16).toBeLessThanOrEqual(72);
        expect(globalCss).toContain("@media (prefers-reduced-motion: reduce)");
        expect(globalCss).toContain("transition-duration: 0.01ms !important");
        expect(globalCss).toContain("@media (max-width: 900px)");
        expect(globalCss).toContain('.app-header[data-menu-open="true"] .main-nav');
    });
});
