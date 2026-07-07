/**
 * @file Ficheiro `real_dev/backend/src/config/env.js` da implementação real_dev.
 */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_PORT = 3000;
const CONFIG_DIR = dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = resolve(CONFIG_DIR, "../..");
const LOCAL_ENV_PATH = resolve(BACKEND_ROOT, ".env");

/**
 * Carrega o `.env` local do backend antes de ler `process.env`.
 *
 * A API nativa do Node respeita variaveis ja exportadas no ambiente, mantendo
 * overrides explicitos de CI/deploy acima dos valores locais de desenvolvimento.
 *
 * @returns {void}
 */
function loadLocalEnvFile() {
    if (typeof process.loadEnvFile !== "function") {
        return;
    }

    if (!existsSync(LOCAL_ENV_PATH)) {
        return;
    }

    process.loadEnvFile(LOCAL_ENV_PATH);
}

loadLocalEnvFile();

/**
 * Converte a variável de ambiente PORT num número de porta TCP seguro.
 *
 * @param {string | undefined} value - Valor bruto lido de `process.env.PORT`.
 * @returns {number} Número de porta válido para usar pelo servidor HTTP.
 * @throws {Error} Lança erro quando o valor não é um inteiro entre 1 e 65535.
 */
function parsePort(value) {
    // PORT vazio significa “usar o valor por defeito do projeto”; não é erro.
    if (value === undefined || value === "") {
        return DEFAULT_PORT;
    }

    const parsed = Number(value);

    // Falhar cedo dá aos estudantes e às ferramentas de deploy uma mensagem clara.
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error("PORT deve ser um numero inteiro entre 1 e 65535.");
    }

    return parsed;
}

/**
 * Configuração centralizada de ambiente do backend.
 *
 * @type {{ nodeEnv: string, port: number, serviceName: string, mongoUri: string, mongoDbName: string }}
 */
export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: parsePort(process.env.PORT),
    serviceName: process.env.SERVICE_NAME ?? "faithflix-api",
    mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
    mongoDbName: process.env.MONGODB_DB_NAME ?? "faithflix",
};

/**
 * Indica se o backend está a correr com configuração de produção.
 *
 * @type {boolean}
 */
export const isProduction = env.nodeEnv === "production";
