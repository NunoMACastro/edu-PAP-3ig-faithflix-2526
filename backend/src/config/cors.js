/**
 * @file Ficheiro `real_dev/backend/src/config/cors.js` da implementação real_dev.
 */

const DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

/**
 * Interpreta uma lista de origens separadas por vírgulas a partir de uma variável de ambiente.
 *
 * @param {string | undefined} value - Valor bruto de `process.env.FRONTEND_ORIGIN`.
 * @returns {string[]} Lista de origens de navegador permitidas.
 */
function parseAllowedOrigins(value) {
    if (!value) {
        return DEFAULT_ALLOWED_ORIGINS;
    }

    return value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
}

/**
 * Configuração CORS para pedidos do frontend no navegador.
 *
 * @type {{ allowedOrigins: string[] }}
 */
export const corsConfig = {
    allowedOrigins: parseAllowedOrigins(process.env.FRONTEND_ORIGIN),
};
