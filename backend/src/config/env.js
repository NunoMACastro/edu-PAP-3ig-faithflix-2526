/**
 * @file Configuração validada do ambiente de execução do backend FaithFlix.
 *
 * O builder exportado é puro para permitir validar configurações sem alterar o
 * processo nem carregar a aplicação. Em produção, os valores operacionais são
 * sempre explícitos e os erros identificam apenas nomes de variáveis, nunca os
 * respetivos valores.
 */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_PORT = 3101;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_SERVICE_NAME = "faithflix-api";
const DEFAULT_MONGODB_URI = "mongodb://127.0.0.1:27017";
const DEFAULT_MONGODB_DB_NAME = "faithflix";
const DEVELOPMENT_RATE_LIMIT_PEPPER = "faithflix-development-only";
const SUPPORTED_NODE_ENVS = new Set(["development", "test", "production"]);
const SUPPORTED_BIND_HOSTS = new Set(["127.0.0.1", "::1", "0.0.0.0", "::"]);
const CONFIG_DIR = dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = resolve(CONFIG_DIR, "../..");
const LOCAL_ENV_PATH = resolve(BACKEND_ROOT, ".env");

/**
 * Carrega o `.env` local antes de construir a configuração efetiva.
 *
 * `process.loadEnvFile` preserva variáveis já exportadas pelo processo. O
 * conteúdo do ficheiro nunca é escrito em logs ou mensagens de erro.
 *
 * @returns {void}
 */
function loadLocalEnvFile() {
    if (typeof process.loadEnvFile !== "function") return;
    if (!existsSync(LOCAL_ENV_PATH)) return;
    process.loadEnvFile(LOCAL_ENV_PATH);
}

/**
 * Cria um erro sanitizado com apenas os nomes das variáveis inválidas.
 *
 * @param {Iterable<string>} names Nomes das variáveis inválidas.
 * @returns {Error & { code: string, fields: string[] }} Erro seguro.
 */
function createEnvironmentError(names) {
    const fields = [...new Set(names)].sort();
    const error = new Error(
        `Configuracao de ambiente invalida: ${fields.join(", ")}.`,
    );
    error.code = "ENVIRONMENT_INVALID";
    error.fields = fields;
    return error;
}

/**
 * Indica se um valor de ambiente é uma string não vazia.
 *
 * @param {unknown} value Valor bruto.
 * @returns {value is string} Verdadeiro quando existe conteúdo útil.
 */
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * Converte `PORT` num número TCP válido, registando apenas o nome em erro.
 *
 * @param {unknown} value Valor bruto.
 * @param {Set<string>} invalidNames Acumulador de variáveis inválidas.
 * @returns {number} Porta normalizada.
 */
function parsePort(value, invalidNames) {
    if (value === undefined || value === "") return DEFAULT_PORT;
    if (typeof value !== "string" || !/^\d+$/.test(value)) {
        invalidNames.add("PORT");
        return DEFAULT_PORT;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        invalidNames.add("PORT");
        return DEFAULT_PORT;
    }

    return parsed;
}

/**
 * Interpreta uma flag booleana estrita.
 *
 * @param {unknown} value Valor bruto.
 * @param {boolean} fallback Valor usado quando a variável está ausente.
 * @param {string} name Nome da variável.
 * @param {Set<string>} invalidNames Acumulador de variáveis inválidas.
 * @returns {boolean} Flag normalizada.
 */
function parseBoolean(value, fallback, name, invalidNames) {
    if (value === undefined || value === "") return fallback;
    if (value === "true") return true;
    if (value === "false") return false;
    invalidNames.add(name);
    return fallback;
}

/**
 * Interpreta a confiança no reverse proxy sem aceitar confiança global.
 *
 * @param {unknown} value Valor bruto.
 * @param {Set<string>} invalidNames Acumulador de variáveis inválidas.
 * @returns {false | number} Número explícito de proxies ou `false`.
 */
function parseTrustProxy(value, invalidNames) {
    if (value === undefined || value === "" || value === "0") return false;
    if (typeof value !== "string" || !/^\d+$/.test(value)) {
        invalidNames.add("TRUST_PROXY_HOPS");
        return false;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
        invalidNames.add("TRUST_PROXY_HOPS");
        return false;
    }

    return parsed;
}

/**
 * Constrói a configuração do backend sem consultar ou alterar estado global.
 *
 * Produção exige identidade de serviço, alvo MongoDB, pepper forte, HTTPS
 * explicitamente ativo e um número fechado de proxies confiáveis. Esta
 * identidade explícita é necessária para distinguir logs e health checks de
 * processos diferentes durante operação e diagnóstico.
 *
 * @param {Record<string, unknown>} [source={}] Mapa equivalente a `process.env`.
 * @returns {{ nodeEnv: string, host: string, port: number, serviceName: string, mongoUri: string, mongoDbName: string, forceHttps: boolean, trustProxy: false | number, rateLimitPepper: string, buildVersion: string }} Configuração validada.
 * @throws {Error} Erro sanitizado com apenas nomes de variáveis inválidas.
 */
export function buildEnv(source = {}) {
    const invalidNames = new Set();
    let nodeEnv = "development";
    if (source.NODE_ENV !== undefined && source.NODE_ENV !== "") {
        if (isNonEmptyString(source.NODE_ENV)) {
            nodeEnv = source.NODE_ENV.trim();
        } else {
            invalidNames.add("NODE_ENV");
        }
    }
    if (!SUPPORTED_NODE_ENVS.has(nodeEnv)) {
        invalidNames.add("NODE_ENV");
    }
    const production = nodeEnv === "production";

    const host = isNonEmptyString(source.HOST)
        ? source.HOST.trim()
        : production
          ? ""
          : DEFAULT_HOST;
    if (!SUPPORTED_BIND_HOSTS.has(host)) {
        invalidNames.add("HOST");
    }

    const serviceName = isNonEmptyString(source.SERVICE_NAME)
        ? source.SERVICE_NAME.trim()
        : production
          ? ""
          : DEFAULT_SERVICE_NAME;
    const mongoUri = isNonEmptyString(source.MONGODB_URI)
        ? source.MONGODB_URI.trim()
        : production
          ? ""
          : DEFAULT_MONGODB_URI;
    const mongoDbName = isNonEmptyString(source.MONGODB_DB_NAME)
        ? source.MONGODB_DB_NAME.trim()
        : production
          ? ""
          : DEFAULT_MONGODB_DB_NAME;
    const rateLimitPepper = isNonEmptyString(source.RATE_LIMIT_PEPPER)
        ? source.RATE_LIMIT_PEPPER
        : production
          ? ""
          : DEVELOPMENT_RATE_LIMIT_PEPPER;

    if (production && !serviceName) invalidNames.add("SERVICE_NAME");
    if (production && !mongoUri) invalidNames.add("MONGODB_URI");
    if (production && !mongoDbName) invalidNames.add("MONGODB_DB_NAME");
    if (production && rateLimitPepper.length < 32) {
        invalidNames.add("RATE_LIMIT_PEPPER");
    }

    const forceHttps = parseBoolean(
        source.FORCE_HTTPS,
        false,
        "FORCE_HTTPS",
        invalidNames,
    );
    if (production && source.FORCE_HTTPS !== "true") {
        invalidNames.add("FORCE_HTTPS");
    }

    const trustProxy = parseTrustProxy(source.TRUST_PROXY_HOPS, invalidNames);
    if (production && trustProxy === false) {
        invalidNames.add("TRUST_PROXY_HOPS");
    }

    const port = parsePort(source.PORT, invalidNames);
    if (invalidNames.size > 0) {
        throw createEnvironmentError(invalidNames);
    }

    return {
        nodeEnv,
        host,
        port,
        serviceName,
        mongoUri,
        mongoDbName,
        forceHttps,
        trustProxy,
        rateLimitPepper,
        buildVersion: isNonEmptyString(source.BUILD_VERSION)
            ? source.BUILD_VERSION.trim()
            : "local",
    };
}

loadLocalEnvFile();

/** Configuração centralizada efetiva do processo backend. */
export const env = buildEnv(process.env);

/** Indica se o backend está a correr com configuração de produção. */
export const isProduction = env.nodeEnv === "production";
