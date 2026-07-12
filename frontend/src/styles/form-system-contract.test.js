/**
 * @file Contrato transversal de classificação e medida dos formulários da aplicação.
 */

import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = resolve(process.cwd(), "src");
const globalCss = readFileSync(join(sourceRoot, "styles/global.css"), "utf8");
const tokensCss = readFileSync(join(sourceRoot, "styles/tokens.css"), "utf8");

/**
 * Percorre a árvore de código sem depender de glob ou de bibliotecas externas.
 *
 * @param {string} directory Diretório a percorrer.
 * @returns {string[]} Ficheiros JSX encontrados.
 */
function listJsxFiles(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);

        if (entry.isDirectory()) {
            return listJsxFiles(path);
        }

        return extname(entry.name) === ".jsx" ? [path] : [];
    });
}

/**
 * Extrai os elementos form declarados num ficheiro e a respetiva classe estática.
 *
 * @param {string} path Caminho absoluto do ficheiro.
 * @returns {{file: string, className: string}[]} Inventário local de formulários.
 */
function inventoryForms(path) {
    const source = readFileSync(path, "utf8");

    return [...source.matchAll(/<form\b[\s\S]*?>/g)].map(([openingTag]) => ({
        file: relative(sourceRoot, path),
        className: openingTag.match(/className="([^"]+)"/)?.[1] ?? "",
    }));
}

describe("sistema visual de formulários", () => {
    it("classifica todos os formulários como dimensionados ou como barra de filtros", () => {
        const forms = listJsxFiles(sourceRoot).flatMap(inventoryForms);
        const unclassified = forms.filter(
            ({ className }) =>
                !className.split(/\s+/).includes("app-form") &&
                !className.split(/\s+/).includes("filter-bar"),
        );

        expect(forms.length).toBeGreaterThanOrEqual(20);
        expect(unclassified).toEqual([]);
    });

    it("mantém uma escala crescente e limitada para as três medidas de leitura", () => {
        const extractRem = (token) =>
            Number(tokensCss.match(new RegExp(`${token}:\\s*([0-9.]+)rem`))?.[1]);
        const compact = extractRem("--form-width-compact");
        const standard = extractRem("--form-width-standard");
        const editorial = extractRem("--form-width-editorial");

        expect(compact).toBeGreaterThan(0);
        expect(compact).toBeLessThan(standard);
        expect(standard).toBeLessThan(editorial);
        expect(editorial).toBeLessThanOrEqual(60);
        expect(globalCss).toContain("width: min(100%, var(--app-form-max-width))");
        expect(globalCss).toContain(".filter-bar {");
    });
});
