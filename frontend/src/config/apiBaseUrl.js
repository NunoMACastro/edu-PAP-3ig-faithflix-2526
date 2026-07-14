/**
 * @file Regra pura e reutilizável para validar a origem pública da API.
 */

const LOCAL_MODES = new Set(["development", "test"]);
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Indica se um hostname aponta inequivocamente para a máquina local.
 *
 * @param {string} hostname Hostname já interpretado pela API URL.
 * @returns {boolean} Verdadeiro apenas para hosts loopback suportados.
 */
function isLocalHostname(hostname) {
    const normalizedHostname = hostname.toLowerCase();

    return (
        LOCAL_HOSTNAMES.has(normalizedHostname) ||
        normalizedHostname.endsWith(".localhost")
    );
}

/**
 * Valida e normaliza a origem configurada para a API.
 *
 * Ambientes locais podem usar HTTP em loopback. Qualquer build não local exige
 * configuração explícita, HTTPS e uma origem que não seja localhost.
 *
 * @param {{ rawValue?: unknown, mode?: string }} [options={}] Opções a validar.
 * @param {unknown} [options.rawValue] Valor de `VITE_API_BASE_URL`.
 * @param {string} [options.mode="production"] Modo Vite atual.
 * @returns {string} URL absoluta sem barra final.
 * @throws {Error} Quando a configuração permitiria uma origem insegura ou ambígua.
 */
export function resolveApiBaseUrl({
    rawValue,
    mode = "production",
} = {}) {
    const isLocalMode = LOCAL_MODES.has(mode);
    const configuredValue =
        typeof rawValue === "string" ? rawValue.trim() : "";
    const candidate =
        configuredValue || (isLocalMode ? "http://localhost:3101" : "");

    if (!candidate) {
        throw new Error(
            "VITE_API_BASE_URL é obrigatório fora dos modos development/test.",
        );
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(candidate);
    } catch {
        throw new Error("VITE_API_BASE_URL tem de ser uma URL absoluta válida.");
    }

    const isLocalOrigin = isLocalHostname(parsedUrl.hostname);

    if (parsedUrl.username || parsedUrl.password) {
        throw new Error("VITE_API_BASE_URL não pode incluir credenciais.");
    }

    if (parsedUrl.search || parsedUrl.hash) {
        throw new Error("VITE_API_BASE_URL não pode incluir query string ou fragmento.");
    }

    if (parsedUrl.protocol !== "https:") {
        const allowsLocalHttp =
            isLocalMode && isLocalOrigin && parsedUrl.protocol === "http:";

        if (!allowsLocalHttp) {
            throw new Error(
                "VITE_API_BASE_URL tem de usar HTTPS; HTTP só é aceite em localhost nos modos development/test.",
            );
        }
    }

    if (!isLocalMode && isLocalOrigin) {
        throw new Error(
            "VITE_API_BASE_URL não pode apontar para localhost fora dos modos development/test.",
        );
    }

    return parsedUrl.toString().replace(/\/+$/, "");
}
