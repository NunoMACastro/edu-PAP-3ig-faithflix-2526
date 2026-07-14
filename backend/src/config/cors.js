/**
 * @file Ficheiro `real_dev/backend/src/config/cors.js` da implementação real_dev.
 */

const DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:5181",
    "http://127.0.0.1:5181",
];
const isProduction = (process.env.NODE_ENV ?? "development") === "production";

/**
 * Interpreta uma lista de origens separadas por vírgulas a partir de uma variável de ambiente.
 *
 * @param {string | undefined} value - Valor bruto de `process.env.FRONTEND_ORIGIN`.
 * @param {{ production?: boolean }} [options] Override puro usado por testes.
 * @returns {string[]} Lista de origens de navegador permitidas.
 */
export function parseAllowedOrigins(value, options = {}) {
    const production = options.production ?? isProduction;
    if (value === undefined && !production) {
        return DEFAULT_ALLOWED_ORIGINS;
    }

    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(
            production
                ? "FRONTEND_ORIGIN é obrigatória em produção."
                : "FRONTEND_ORIGIN deve conter pelo menos uma origin válida.",
        );
    }

    const origins = [...new Set(value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean))];

    if (origins.length === 0) {
        throw new Error("FRONTEND_ORIGIN deve conter pelo menos uma origin válida.");
    }

    for (const origin of origins) {
        const parsed = new URL(origin);
        if (parsed.origin !== origin || (production && parsed.protocol !== "https:")) {
            throw new Error(
                "FRONTEND_ORIGIN deve conter apenas origins HTTPS válidas em produção.",
            );
        }
    }

    return origins;
}

/**
 * Configuração CORS para pedidos do frontend no navegador.
 *
 * @type {{ allowedOrigins: string[] }}
 */
export const corsConfig = {
    allowedOrigins: parseAllowedOrigins(process.env.FRONTEND_ORIGIN),
};
