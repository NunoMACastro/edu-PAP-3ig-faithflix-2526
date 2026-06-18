/**
 * @file Ficheiro `real_dev/frontend/src/services/api/userApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

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
    // apps/frontend/src/services/api/userApi.js
listUsers(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);

    const query = params.toString();
    return apiClient.get(`/api/users${query ? `?${query}` : ""}`);
},

updateUserAdmin(userId, input) {
    return apiClient.patch(
        `/api/users/${encodeURIComponent(userId)}/admin`,
        input,
    );
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
};
