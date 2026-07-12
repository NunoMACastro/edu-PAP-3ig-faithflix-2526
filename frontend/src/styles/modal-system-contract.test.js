/**
 * @file Inventário e contrato visual das superfícies modais da aplicação.
 */

import { readdirSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = resolve(process.cwd(), "src");
const globalCss = readFileSync(join(sourceRoot, "styles/global.css"), "utf8");

/**
 * Lista os ficheiros JSX de produção para manter o inventário automático.
 *
 * @param {string} directory Diretório a percorrer.
 * @returns {string[]} Caminhos absolutos encontrados.
 */
function listJsxFiles(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);

        if (entry.isDirectory()) return listJsxFiles(path);
        if (extname(entry.name) !== ".jsx" || entry.name.endsWith(".test.jsx")) return [];
        return [path];
    });
}

describe("sistema visual de janelas modais", () => {
    const sources = listJsxFiles(sourceRoot).map((path) => readFileSync(path, "utf8"));

    it("mantém as confirmações de negócio na infraestrutura partilhada", () => {
        const consumers = sources.reduce(
            (total, source) => total + (source.match(/<ConfirmDialog\b/g)?.length ?? 0),
            0,
        );

        expect(consumers).toBeGreaterThanOrEqual(12);
        expect(globalCss).toContain(".confirm-dialog-header {");
        expect(globalCss).toContain(".confirm-dialog-wide {");
        expect(globalCss).toContain(".confirm-dialog-actions {");
    });

    it("classifica cada dialog nativo como janela comum ou drawer especializado", () => {
        const dialogs = sources.flatMap((source) => [
            ...source.matchAll(/<dialog\b[\s\S]*?>/g),
        ]).map(([openingTag]) => openingTag);
        const unclassified = dialogs.filter(
            (openingTag) =>
                !openingTag.includes("app-dialog") &&
                !openingTag.includes("admin-drawer"),
        );

        expect(dialogs).toHaveLength(3);
        expect(unclassified).toEqual([]);
        expect(globalCss).toContain(".app-dialog::backdrop {");
    });

    it("representa decisões binárias como opções segmentadas acessíveis", () => {
        const applicationSource = readFileSync(
            join(sourceRoot, "pages/AdminCharityApplicationsPage.jsx"),
            "utf8",
        );

        expect(applicationSource).toContain('className="decision-toggle"');
        expect(applicationSource).toContain('aria-label="Aprovar"');
        expect(applicationSource).toContain('aria-label="Rejeitar"');
        expect(globalCss).toContain(".decision-option.is-selected {");
        expect(globalCss).toContain(".decision-option:has(input:focus-visible)");
    });
});
