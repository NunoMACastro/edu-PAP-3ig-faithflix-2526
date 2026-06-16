/**
 * @file Ficheiro `real_dev/frontend/src/services/api/playbackApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

export const playbackApi = {
    /**
     * Documenta `getPlayback`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `getPlayback`.
     * @returns {unknown} Resultado devolvido por `getPlayback`.
     */
    getPlayback(contentId) {
        return apiClient.get(`/api/playback/${encodeURIComponent(contentId)}`);
    },
    /**
     * Documenta `saveProgress`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} contentId Valor recebido por `saveProgress`.
     * @param {unknown} currentTimeSeconds Valor recebido por `saveProgress`.
     * @returns {unknown} Resultado devolvido por `saveProgress`.
     */
    saveProgress(contentId, currentTimeSeconds) {
        return apiClient.put(
            `/api/playback/${encodeURIComponent(contentId)}/progress`,
            { currentTimeSeconds },
        );
    },
    /**
     * Documenta `listContinueWatching`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `listContinueWatching`.
     */
    listContinueWatching() {
        return apiClient.get("/api/playback/me/continue-watching");
    },
    /**
     * Documenta `getPreferences`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `getPreferences`.
     */
    getPreferences() {
        return apiClient.get("/api/playback/preferences");
    },
    /**
     * Documenta `savePreferences`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} input Valor recebido por `savePreferences`.
     * @returns {unknown} Resultado devolvido por `savePreferences`.
     */
    savePreferences(input) {
        return apiClient.put("/api/playback/preferences", input);
    },
};
