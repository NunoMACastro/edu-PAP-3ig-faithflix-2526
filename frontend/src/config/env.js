/**
 * @file Configuração pública fail-closed do frontend FaithFlix.
 */

import { resolveApiBaseUrl } from "./apiBaseUrl.js";

const viteMode = import.meta.env.MODE ?? "production";

/**
 * Configuração de ambiente validada antes de a aplicação arrancar.
 *
 * @type {Readonly<{ apiBaseUrl: string, demoMode: boolean }>}
 */
export const env = Object.freeze({
    apiBaseUrl: resolveApiBaseUrl({
        rawValue: import.meta.env.VITE_API_BASE_URL,
        mode: viteMode,
    }),
    demoMode:
        viteMode === "development" &&
        import.meta.env.VITE_DEMO_MODE === "true",
});
