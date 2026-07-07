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
     * Obtém o perfil da conta autenticada.
     *
     * A sessão é resolvida pelo backend através dos cookies enviados pelo
     * `apiClient`, sem o frontend transportar tokens.
     *
     * @returns {Promise<unknown>} Perfil do utilizador autenticado.
     */
    getMe() {
        return apiClient.get("/api/users/me");
    },
    /**
     * Atualiza dados editáveis do perfil da conta autenticada.
     *
     * O payload vem do formulário de conta e a API decide que campos podem ser
     * alterados pelo próprio utilizador.
     *
     * @param {Record<string, unknown>} input Dados de perfil a atualizar.
     * @returns {Promise<unknown>} Perfil atualizado devolvido pela API.
     */
    updateMe(input) {
        return apiClient.patch("/api/users/me", input);
    },
    /**
     * Atualiza o limite parental da conta autenticada.
     *
     * O valor máximo permitido segue no corpo do pedido para o backend aplicar
     * validação e persistência segura.
     *
     * @param {string | number | null} parentalMaxAgeRating Limite etário máximo escolhido.
     * @returns {Promise<unknown>} Perfil parental atualizado devolvido pela API.
     */
    updateParental(parentalMaxAgeRating) {
        return apiClient.patch("/api/users/me/parental", {
            parentalMaxAgeRating,
        });
    },
    /**
     * Lista contas para a área administrativa de utilizadores.
     *
     * Os filtros recebidos pelo formulário são serializados para query string,
     * deixando a paginação e pesquisa efetiva a cargo da API.
     *
     * @param {{ search?: string, role?: string, status?: string, page?: number, limit?: number }} filters Filtros opcionais de pesquisa e paginação.
     * @returns {Promise<unknown>} Lista de utilizadores devolvida pela API.
     */
    listUsers(filters = {}) {
        return apiClient.get(`/api/users${buildUserFilters(filters)}`);
    },
    /**
     * Atualiza o papel administrativo de uma conta.
     *
     * A função envia o identificador no URL e o novo papel no corpo, deixando a
     * API aplicar autorização administrativa.
     *
     * @param {string} userId Identificador da conta a alterar.
     * @param {string} role Novo papel atribuído à conta.
     * @returns {Promise<unknown>} Utilizador atualizado devolvido pela API.
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
