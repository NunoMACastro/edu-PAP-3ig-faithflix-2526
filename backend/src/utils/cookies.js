/**
 * @file Ficheiro `real_dev/backend/src/utils/cookies.js` da implementação real_dev.
 */

import { getSessionCookieOptions, sessionConfig } from "../config/session.js";

/**
 * Interpreta um cabeçalho HTTP Cookie para um objeto simples.
 *
 * @param {string} [cookieCabeçalho=""] - Cabeçalho `Cookie` bruto recebido pelo Express.
 * @returns {Record<string, string>} Nomes dos cookies e valores descodificados.
 */
export function parseCookies(cookieHeader = "") {
    return cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .reduce((cookies, part) => {
            const separatorIndex = part.indexOf("=");

            // Invalid cookie fragments are ignored instead of breaking the API.
            if (separatorIndex === -1) {
                return cookies;
            }

            const key = part.slice(0, separatorIndex);
            const value = part.slice(separatorIndex + 1);

            try {
                cookies[key] = decodeURIComponent(value);
            } catch {
                // Um cookie mal codificado não deve quebrar a pipeline do pedido.
                cookies[key] = value;
            }

            return cookies;
        }, {});
}

/**
 * Lê um valor de cookie de um pedido Express.
 *
 * @param {import("express").Request} req - Pedido HTTP atual.
 * @param {string} name - Cookie name to read.
 * @returns {string | undefined} Valor do cookie quando existe.
 */
export function readCookie(req, name) {
    return parseCookies(req.headers.cookie)[name];
}

/**
 * Limpa o cookie de sessão configurado na resposta HTTP.
 *
 * @param {import("express").Response} res - Resposta HTTP onde o cookie expirado é escrito.
 * @returns {void}
 */
export function clearSessionCookie(res) {
    res.cookie(
        sessionConfig.cookieName,
        "",
        getSessionCookieOptions({ maxAge: 0 }),
    );
}
