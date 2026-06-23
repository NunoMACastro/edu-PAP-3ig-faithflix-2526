/**
 * @file Ficheiro `real_dev/frontend/src/services/api/userApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

/**
 * Constrói query string da listagem admin.
 *
 * @param {{ search?: string, status?: string }} filters Filtros da UI.
 * @returns {string} Query string.
 */
function buildUserFilters(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);

    const query = params.toString();
    return query ? `?${query}` : "";
}

export const userApi = {
    /**
     * Documenta `getMe`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `getMe`.
     */
    getMe() {
        return apiClient.get("/api/users/me");
    },
    /**
     * Documenta `updateMe`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} input Valor recebido por `updateMe`.
     * @returns {unknown} Resultado devolvido por `updateMe`.
     */
    updateMe(input) {
        return apiClient.patch("/api/users/me", input);
    },
    /**
     * Documenta `updateParental`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} parentalMaxAgeRating Valor recebido por `updateParental`.
     * @returns {unknown} Resultado devolvido por `updateParental`.
     */
    updateParental(parentalMaxAgeRating) {
        return apiClient.patch("/api/users/me/parental", {
            parentalMaxAgeRating,
        });
    },
    /**
     * Documenta `listUsers`, mantendo explícita a responsabilidade desta função no módulo.
     * @returns {unknown} Resultado devolvido por `listUsers`.
     */
    listUsers(filters = {}) {
        return apiClient.get(`/api/users${buildUserFilters(filters)}`);
    },
    /**
     * Documenta `updateRole`, mantendo explícita a responsabilidade desta função no módulo.
     *
     * @param {unknown} userId Valor recebido por `updateRole`.
     * @param {unknown} role Valor recebido por `updateRole`.
     * @returns {unknown} Resultado devolvido por `updateRole`.
     */
    updateRole(userId, role) {
        return apiClient.patch(
            `/api/users/${encodeURIComponent(userId)}/role`,
            { role },
        );
    },
    /**
     * Atualiza role e/ou estado operacional pela rota admin MF5.
     *
     * @param {string} userId Identificador do utilizador alvo.
     * @param {{ role?: string, accountStatus?: string }} input Alteracao admin.
     * @returns {unknown} Resultado devolvido pelo backend.
     */
    updateUserAdmin(userId, input) {
        return apiClient.patch(
            `/api/users/${encodeURIComponent(userId)}/admin`,
            input,
        );
    },
};
