/**
 * @file Ficheiro `real_dev/frontend/src/services/api/playbackApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

export const playbackApi = {
    /**
     * Obtém o estado de reprodução de um conteúdo.
     *
     * A API devolve progresso, preferências e dados necessários para retomar a
     * experiência de visualização do utilizador autenticado.
     *
     * @param {string} contentId Identificador do conteúdo a reproduzir.
     * @returns {Promise<unknown>} Estado de reprodução devolvido pela API.
     */
    getPlayback(contentId, options = {}) {
        return apiClient.get(
            `/api/playback/${encodeURIComponent(contentId)}`,
            options,
        );
    },
    /**
     * Guarda o ponto de progresso atual de um conteúdo.
     *
     * O tempo é enviado em segundos para o backend poder reconstruir a posição
     * quando o utilizador regressar ao mesmo conteúdo.
     *
     * @param {string} contentId Identificador do conteúdo em reprodução.
     * @param {number} currentTimeSeconds Posição atual do leitor em segundos.
     * @returns {Promise<unknown>} Progresso persistido devolvido pela API.
     */
    saveProgress(contentId, currentTimeSeconds, options = {}) {
        return apiClient.put(
            `/api/playback/${encodeURIComponent(contentId)}/progress`,
            { currentTimeSeconds },
            options,
        );
    },
    /**
     * Lista conteúdos que o utilizador pode continuar a ver.
     *
     * A função consulta a fila pessoal calculada pelo backend a partir do
     * histórico de progresso.
     *
     * @returns {Promise<unknown>} Lista "continuar a ver" devolvida pela API.
     */
    listContinueWatching(pagination = {}, options = {}) {
        const params = new URLSearchParams();
        if (pagination.page) params.set("page", String(pagination.page));
        if (pagination.limit) params.set("limit", String(pagination.limit));
        const query = params.toString();
        return apiClient.get(
            `/api/playback/me/continue-watching${query ? `?${query}` : ""}`,
            options,
        );
    },
    /**
     * Obtém as preferências globais de reprodução da conta.
     *
     * Estas preferências alimentam opções como legendas, áudio ou comportamento
     * padrão do leitor.
     *
     * @returns {Promise<unknown>} Preferências de reprodução devolvidas pela API.
     */
    getPreferences() {
        return apiClient.get("/api/playback/preferences");
    },
    /**
     * Atualiza as preferências globais de reprodução da conta.
     *
     * O objeto recebido vem da UI de preferências e é validado no backend antes
     * de ser persistido.
     *
     * @param {Record<string, unknown>} input Preferências escolhidas pelo utilizador.
     * @returns {Promise<unknown>} Preferências atualizadas devolvidas pela API.
     */
    savePreferences(input, options = {}) {
        return apiClient.put("/api/playback/preferences", input, options);
    },
};
