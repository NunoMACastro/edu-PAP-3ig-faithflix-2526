/**
 * @file Verificacao estatica de seguranca e privacidade da MF6.
 *
 * Procura padroes incompatíveis com os RNF criticos do FaithFlix sem adicionar
 * dependencias novas ao projeto. O script combina pesquisa textual com controlos
 * estruturais pequenos, porque alguns contratos de hardening dependem de ficheiros
 * especificos continuarem a existir com guards e redacao ativos.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { cwd } from "node:process";

const rootDir = cwd();
const scanRoots = [
    join(rootDir, "src"),
    join(rootDir, "..", "frontend", "src"),
];

const textRules = [
    {
        label: "armazenamento persistente do browser para dados de sessao",
        needle: "local" + "Storage",
    },
    {
        label: "armazenamento temporario do browser para dados de sessao",
        needle: "session" + "Storage",
    },
    {
        label: "injecao direta de HTML em React",
        needle: "dangerously" + "SetInnerHTML",
    },
    {
        label: "construtor dinamico de codigo",
        needle: "new " + "Function",
    },
];

const sourceRules = [
    {
        label: "execucao dinamica de codigo",
        test: (line) => /\beval\s*\(/u.test(line),
    },
    {
        label: "remocao MongoDB sem filtro",
        test: (line) => /deleteMany\s*\(\s*\{\s*\}\s*\)/u.test(line),
    },
    {
        label: "connection string MongoDB nao local em ficheiro fonte",
        test: hasUnsafeMongoUri,
    },
    {
        label: "segredo literal provavel em ficheiro fonte",
        test: hasLiteralSecretAssignment,
    },
];

const requiredControls = [
    {
        file: "src/modules/auth/auth.password.js",
        label: "RNF14 password hashing com scrypt",
        fragments: ["scrypt", "randomBytes", "timingSafeEqual"],
    },
    {
        file: "src/modules/users/user.routes.js",
        label: "RNF16/RNF19 rotas admin de utilizadores protegidas",
        fragments: ['requireRole(["admin"])', '"/:id/admin"'],
    },
    {
        file: "src/modules/privacy/privacy.service.js",
        label: "RNF17 exportacao RGPD sem campos sensiveis",
        fragments: ["SENSITIVE_EXPORT_KEYS", "passwordHash", "tokenHash"],
    },
    {
        file: "src/modules/integrations/integrations.validation.js",
        label: "RNF17 configuracao publica de integracoes sem segredos",
        fragments: [
            "SENSITIVE_PUBLIC_CONFIG_KEY_PATTERN",
            "Configuracao publica nao pode guardar segredos",
        ],
    },
    {
        file: "src/modules/recommendations/recommendations.routes.js",
        label: "RNF37 recomendacoes apenas para utilizador autenticado",
        fragments: ["requireAuth", '"/me"'],
    },
    {
        file: "../frontend/src/services/api/apiClient.js",
        label: "RNF16 cliente API preserva cookies de sessao",
        fragments: ['credentials: "include"'],
    },
];

/**
 * Indica se um URI MongoDB e apenas o fallback local de desenvolvimento.
 *
 * @param {string} uri URI MongoDB encontrado no codigo.
 * @returns {boolean} Verdadeiro quando aponta para localhost/127.0.0.1 sem segredo.
 */
function isAllowedLocalMongoUri(uri) {
    return /^mongodb:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/[\w-]+)?$/iu.test(
        uri,
    );
}

/**
 * Deteta connection strings MongoDB que parecem apontar para infraestrutura real.
 *
 * @param {string} line Linha de codigo a analisar.
 * @returns {boolean} Verdadeiro quando a linha contem URI MongoDB nao local.
 */
function hasUnsafeMongoUri(line) {
    const uris = line.match(/mongodb(?:\+srv)?:\/\/[^\s"'`]+/giu) ?? [];
    return uris.some((uri) => !isAllowedLocalMongoUri(uri));
}

/**
 * Deteta segredos escritos como literais, sem confundir variaveis locais legitimas.
 *
 * @param {string} line Linha de codigo a analisar.
 * @returns {boolean} Verdadeiro quando ha sinal forte de segredo hardcoded.
 */
function hasLiteralSecretAssignment(line) {
    const match = line.match(
        /\b(api[_-]?key|apiKey|secret|password|token)\b\s*[:=]\s*([^,;]+)/iu,
    );

    if (!match) {
        return false;
    }

    const value = match[2].trim();

    if (/^process\.env\./u.test(value)) {
        return false;
    }

    if (/^(String|assertValidPassword|hashPassword|verifyPassword)\s*\(/u.test(value)) {
        return false;
    }

    if (/^(input|req\.body|form|payload)\?*\.[A-Za-z_$][\w$]*/u.test(value)) {
        return false;
    }

    if (/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/u.test(value)) {
        return false;
    }

    return /^["'`][^"'`]+["'`]/u.test(value) || /^[A-Za-z0-9._~+/-]{3,}$/u.test(value);
}

/**
 * Lista ficheiros JavaScript e JSX de forma recursiva.
 *
 * @param {string} directory Diretoria a percorrer.
 * @returns {Promise<string[]>} Ficheiros encontrados.
 */
async function listSourceFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
        entries.map(async (entry) => {
            const absolutePath = join(directory, entry.name);

            if (entry.isDirectory()) {
                return listSourceFiles(absolutePath);
            }

            if (/\.(js|jsx|mjs)$/u.test(entry.name)) {
                return [absolutePath];
            }

            return [];
        }),
    );

    return files.flat();
}

/**
 * Analisa um ficheiro e devolve violacoes encontradas.
 *
 * @param {string} filePath Caminho absoluto do ficheiro.
 * @returns {Promise<string[]>} Lista de mensagens de violacao.
 */
async function scanFile(filePath) {
    const source = await readFile(filePath, "utf8");
    const location = relative(rootDir, filePath);
    const lines = source.split(/\r?\n/u);
    const failures = [];

    for (const [index, line] of lines.entries()) {
        for (const rule of textRules) {
            if (line.includes(rule.needle)) {
                // A linha aparece no erro para o aluno corrigir a causa sem procurar no ficheiro inteiro.
                failures.push(`${location}:${index + 1}: ${rule.label}`);
            }
        }

        for (const rule of sourceRules) {
            if (rule.test(line)) {
                failures.push(`${location}:${index + 1}: ${rule.label}`);
            }
        }
    }

    return failures;
}

/**
 * Confirma controlos estruturais que o BK exige em ficheiros concretos.
 *
 * @returns {Promise<string[]>} Falhas de controlo estrutural.
 */
async function checkRequiredControls() {
    const failures = [];

    for (const control of requiredControls) {
        const filePath = join(rootDir, control.file);
        let source;

        try {
            source = await readFile(filePath, "utf8");
        } catch {
            failures.push(`${control.file}: controlo em falta - ${control.label}`);
            continue;
        }

        for (const fragment of control.fragments) {
            if (!source.includes(fragment)) {
                failures.push(
                    `${control.file}: ${control.label} sem fragmento esperado ${JSON.stringify(
                        fragment,
                    )}`,
                );
            }
        }
    }

    return failures;
}

const files = (await Promise.all(scanRoots.map(listSourceFiles))).flat();
const failures = [
    ...(await Promise.all(files.map(scanFile))).flat(),
    ...(await checkRequiredControls()),
];

if (failures.length > 0) {
    console.error("Hardening MF6: FAIL");
    for (const failure of failures) {
        console.error(`- ${failure}`);
    }
    process.exitCode = 1;
} else {
    console.log("Hardening MF6: PASS");
}
