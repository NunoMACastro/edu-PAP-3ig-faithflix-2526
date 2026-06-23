/**
 * @file Ficheiro `real_dev/frontend/src/services/api/systemApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

/**
 * Obtém o estado técnico exposto por `GET /api`.
 *
 * @returns {Promise<unknown>} Dados de estado da API devolvidos pelo backend.
 */
export function getApiStatus() {
    return apiClient.get("/api");
}
