/**
 * @file Guard fail-closed do ambiente usado pelo Playwright funcional.
 *
 * A validação é deliberadamente independente da aplicação e da ligação
 * MongoDB. Assim, configuração insegura falha antes do build, dos servidores,
 * dos seeds ou de qualquer acesso à base de dados.
 */

import { fileURLToPath } from "node:url";

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);
const FORBIDDEN_DATABASE_SEGMENT =
    /(?:^|[_-])(?:prod(?:uction)?|shared|staging)(?:[_-]|$)/iu;
const REPLICA_SET_NAME_RE = /^[A-Za-z0-9._-]+$/u;

/**
 * Cria um erro seguro que nunca inclui valores do ambiente.
 *
 * @param {string} message Diagnóstico composto apenas por nomes/contratos.
 * @returns {Error & { code: string }} Erro reconhecível pelo harness.
 */
function environmentError(message) {
    const error = new Error(message);
    error.code = "E2E_ENVIRONMENT_INVALID";
    return error;
}

/**
 * Lê uma string obrigatória sem expor o respetivo conteúdo.
 *
 * @param {Record<string, string | undefined>} source Ambiente recebido.
 * @param {string} name Nome da variável.
 * @returns {string} Valor sem whitespace periférico.
 */
function requiredValue(source, name) {
    const value = source[name];
    if (typeof value !== "string" || value.trim().length === 0) {
        throw environmentError(`${name} tem de ser definida explicitamente.`);
    }
    return value.trim();
}

/**
 * Extrai os hosts de uma connection string MongoDB local.
 *
 * O E2E formal desta baseline é local e não pode resolver SRV nem comunicar
 * com hosts externos. O nome da base também não pode ficar embebido na URI:
 * `TEST_MONGODB_DB_NAME` é a única fonte de verdade desse identificador.
 *
 * @param {string} mongoUri URI a validar.
 * @returns {string[]} Hosts normalizados da connection string.
 */
function parseLocalMongoHosts(mongoUri) {
    if (/\s|[\u0000-\u001f\u007f]/u.test(mongoUri)) {
        throw environmentError("TEST_MONGODB_URI contém caracteres inválidos.");
    }
    if (!mongoUri.startsWith("mongodb://")) {
        throw environmentError(
            "TEST_MONGODB_URI tem de usar mongodb:// numa instância local explícita.",
        );
    }

    const connection = mongoUri.slice("mongodb://".length);
    const authorityEnd = connection.search(/[/?#]/u);
    const authority = (
        authorityEnd === -1 ? connection : connection.slice(0, authorityEnd)
    );
    const suffix = authorityEnd === -1 ? "" : connection.slice(authorityEnd);
    const path = suffix.split(/[?#]/u, 1)[0];

    if (
        !authority
        || authority.includes("@")
        || (path !== "" && path !== "/")
        || suffix.includes("#")
    ) {
        throw environmentError(
            "TEST_MONGODB_URI não pode incluir credenciais, base de dados ou fragmento.",
        );
    }

    const queryStart = suffix.indexOf("?");
    const query = new URLSearchParams(
        queryStart === -1 ? "" : suffix.slice(queryStart + 1),
    );
    const queryKeys = [...query.keys()];
    if (
        queryKeys.length !== 1
        || queryKeys[0] !== "replicaSet"
    ) {
        throw environmentError(
            "TEST_MONGODB_URI permite apenas o parâmetro replicaSet.",
        );
    }
    const replicaSet = query.get("replicaSet");
    if (!replicaSet || !REPLICA_SET_NAME_RE.test(replicaSet)) {
        throw environmentError(
            "TEST_MONGODB_URI tem de declarar um replicaSet ASCII seguro.",
        );
    }

    const hosts = authority.split(",");
    if (hosts.length === 0 || hosts.some((host) => host.length === 0)) {
        throw environmentError("TEST_MONGODB_URI não contém hosts válidos.");
    }

    for (const endpoint of hosts) {
        let host;
        let port = "";
        if (endpoint.startsWith("[")) {
            const match = endpoint.match(/^(\[[^\]]+\])(?::(\d+))?$/u);
            if (!match) {
                throw environmentError("TEST_MONGODB_URI contém um host inválido.");
            }
            [, host, port = ""] = match;
        } else {
            const parts = endpoint.split(":");
            if (parts.length > 2) {
                throw environmentError("TEST_MONGODB_URI contém um host inválido.");
            }
            [host, port = ""] = parts;
        }

        if (!LOOPBACK_HOSTS.has(host.toLowerCase())) {
            throw environmentError(
                "TEST_MONGODB_URI tem de apontar exclusivamente para loopback.",
            );
        }
        if (
            port &&
            (!/^\d+$/u.test(port) || Number(port) < 1 || Number(port) > 65_535)
        ) {
            throw environmentError("TEST_MONGODB_URI contém uma porta inválida.");
        }
    }

    return hosts.map((host) => host.toLowerCase());
}

/**
 * Valida a configuração mínima do E2E funcional sem tocar na DB.
 *
 * @param {Record<string, string | undefined>} [source=process.env] Ambiente.
 * @returns {{ mongoUri: string, mongoDbName: string }} Alvo isolado validado.
 */
export function assertFormalE2eEnvironment(source = process.env) {
    if (source.NODE_ENV !== "test") {
        throw environmentError("O E2E funcional exige NODE_ENV=test.");
    }
    if (source.PUBLISH_EVIDENCE === "true") {
        throw environmentError(
            "O E2E formal não pode publicar artefactos diretamente em docs/evidence.",
        );
    }

    const mongoUri = requiredValue(source, "TEST_MONGODB_URI");
    const mongoDbName = requiredValue(source, "TEST_MONGODB_DB_NAME");
    parseLocalMongoHosts(mongoUri);

    if (!/^[A-Za-z0-9_-]+$/u.test(mongoDbName) || !mongoDbName.endsWith("_e2e")) {
        throw environmentError(
            "TEST_MONGODB_DB_NAME tem de ser ASCII seguro e terminar em _e2e.",
        );
    }
    if (FORBIDDEN_DATABASE_SEGMENT.test(mongoDbName)) {
        throw environmentError(
            "TEST_MONGODB_DB_NAME não pode identificar produção, staging ou uma base partilhada.",
        );
    }
    if (
        source.MONGODB_URI?.trim() === mongoUri ||
        source.MONGODB_DB_NAME?.trim() === mongoDbName
    ) {
        throw environmentError(
            "TEST_MONGODB_* não pode reutilizar a configuração MongoDB normal.",
        );
    }

    return Object.freeze({ mongoUri, mongoDbName });
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isCli) {
    try {
        assertFormalE2eEnvironment(process.env);
        console.log("Ambiente E2E isolado validado.");
    } catch (error) {
        console.error(`${error.code ?? "E2E_ENVIRONMENT_INVALID"}: ${error.message}`);
        process.exitCode = 1;
    }
}
