/**
 * @file Ficheiro `real_dev/frontend/src/config/env.js` da implementação real_dev.
 */

const rawApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

/**
 * Configuração de ambiente do frontend exposta pelo Vite.
 *
 * @type {{ apiBaseUrl: string }}
 */
export const env = {
    // Remover a barra final evita URLs acidentais como //api.
    apiBaseUrl: rawApiBaseUrl.replace(/\/$/, ""),
};
