// backend/scripts/check-security-baseline.mjs
/**
 * @file Verificação estática de segurança e privacidade da MF6.
 *
 * Procura padrões incompatíveis com os RNF críticos sem adicionar dependências
 * novas ao projeto.
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
    label: "armazenamento persistente do browser para dados de sessão",
    needle: "local" + "Storage",
  },
  {
    label: "armazenamento temporário do browser para dados de sessão",
    needle: "session" + "Storage",
  },
  {
    label: "injeção direta de HTML em React",
    needle: "dangerously" + "SetInnerHTML",
  },
  {
    label: "construtor dinâmico de código",
    needle: "new " + "Function",
  },
];

const sourceRules = [
  {
    label: "execução dinâmica de código",
    test: (line) => /\beval\s*\(/u.test(line),
  },
  {
    label: "remoção MongoDB sem filtro",
    test: (line) => /deleteMany\s*\(\s*\{\s*\}\s*\)/u.test(line),
  },
  {
    label: "connection string MongoDB não local em ficheiro fonte",
    test: hasUnsafeMongoUri,
  },
  {
    label: "segredo literal provável em ficheiro fonte",
    test: hasLiteralSecretAssignment,
  },
];

/**
 * Indica se um URI MongoDB é apenas o fallback local de desenvolvimento.
 *
 * @param {string} uri URI MongoDB encontrado no código.
 * @returns {boolean} `true` quando aponta para localhost/127.0.0.1 sem segredo.
 */
function isAllowedLocalMongoUri(uri) {
  return /^mongodb:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/[\w-]+)?$/iu.test(uri);
}

/**
 * Deteta connection strings MongoDB que parecem apontar para infraestrutura real.
 *
 * @param {string} line Linha de código a analisar.
 * @returns {boolean} `true` quando a linha contém URI MongoDB não local.
 */
function hasUnsafeMongoUri(line) {
  const uris = line.match(/mongodb(?:\+srv)?:\/\/[^\s"'`]+/giu) ?? [];
  return uris.some((uri) => !isAllowedLocalMongoUri(uri));
}

/**
 * Deteta segredos escritos como literais, sem confundir variáveis locais legítimas.
 *
 * @param {string} line Linha de código a analisar.
 * @returns {boolean} `true` quando há sinal forte de segredo hardcoded.
 */
function hasLiteralSecretAssignment(line) {
  const match = line.match(/\b(api[_-]?key|apiKey|secret|password)\b\s*[:=]\s*([^,;]+)/iu);

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

  if (/^input\?\.password/u.test(value)) {
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
 * Analisa um ficheiro e devolve violações encontradas.
 *
 * @param {string} filePath Caminho absoluto do ficheiro.
 * @returns {Promise<string[]>} Lista de mensagens de violação.
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

const files = (await Promise.all(scanRoots.map(listSourceFiles))).flat();
const failures = (await Promise.all(files.map(scanFile))).flat();

if (failures.length > 0) {
  console.error("Hardening MF6: FAIL");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Hardening MF6: PASS");
}