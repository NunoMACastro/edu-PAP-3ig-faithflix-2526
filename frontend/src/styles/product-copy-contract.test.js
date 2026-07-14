/**
 * @file Contrato que impede linguagem de implementação na copy apresentada pela aplicação.
 */

import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = resolve(process.cwd(), "src");
const uiRoots = ["pages", "components", "layouts"].map((directory) =>
    join(sourceRoot, directory),
);
const FORBIDDEN_COPY = [
    /\bsimula(?:ção|do|da|dos|das)\b/iu,
    /\bdemonstração\b/iu,
    /\bPAP\b/u,
    /\bMF\d+\b/u,
    /código técnico/iu,
    /variáveis de ambiente/iu,
    /os IDs/iu,
    /token de recuperação/iu,
    /já tenho um token/iu,
    /pedir novo token/iu,
    /introduz o token/iu,
    /o token tem/iu,
    /CRUD de catálogo/iu,
    /core streaming MVP/iu,
];

/**
 * Lista componentes JSX de produção sem incluir testes.
 *
 * @param {string} directory Diretório a percorrer.
 * @returns {string[]} Caminhos absolutos dos componentes.
 */
function listProductionJsx(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);

        if (entry.isDirectory()) return listProductionJsx(path);
        if (extname(entry.name) !== ".jsx" || entry.name.endsWith(".test.jsx")) return [];
        return [path];
    });
}

/**
 * Remove comentários para que o contrato avalie copy potencialmente renderizável,
 * sem proibir vocabulário técnico legítimo na documentação interna do código.
 *
 * @param {string} source Código-fonte JSX.
 * @returns {string} Código sem comentários de bloco nem linhas de comentário.
 */
function withoutComments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
}

describe("copy final da aplicação", () => {
    it("não expõe fases, simulações ou detalhes de infraestrutura", () => {
        const violations = uiRoots
            .flatMap(listProductionJsx)
            .flatMap((path) => {
                const source = withoutComments(readFileSync(path, "utf8"));

                return FORBIDDEN_COPY.flatMap((pattern) =>
                    pattern.test(source)
                        ? [{ file: relative(sourceRoot, path), pattern: pattern.source }]
                        : [],
                );
            });

        expect(violations).toEqual([]);
    });

    it("traduz chaves e modos de integração sem os usar como fallback visual", () => {
        const integrationsSource = readFileSync(
            join(sourceRoot, "pages/AdminIntegrationsPage.jsx"),
            "utf8",
        );

        expect(integrationsSource).toContain('return MODE_LABELS[mode] ?? "Indisponível"');
        expect(integrationsSource).not.toContain("MODE_LABELS[mode] ?? mode");
        expect(integrationsSource).not.toContain("integration.label ?? integration.key");
    });
});
