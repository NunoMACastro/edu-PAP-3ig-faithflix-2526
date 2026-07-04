// frontend/src/services/api/subscriptionsApi.js
import { apiClient } from "./apiClient.js";

/**
 * Cliente frontend para rotas de subscrições.
 *
 * Usa o `apiClient` da MF1 para herdar `credentials: "include"` e enviar
 * cookies HttpOnly sem expor tokens no navegador.
 */
export const subscriptionsApi = {
  /** @returns {Promise<object>} Planos ativos públicos. */
  listPlans() {
    return apiClient.get("/api/subscriptions/plans");
  },

  /** @returns {Promise<object>} Subscrição do utilizador autenticado. */
  getMine() {
    return apiClient.get("/api/subscriptions/me");
  },

  /** @returns {Promise<object>} Subscrição com renovação cancelada. */
  cancelRenewal() {
    return apiClient.post("/api/subscriptions/me/cancel-renewal");
  },

  /** @returns {Promise<object>} Estado familiar do utilizador autenticado. */
  getFamily() {
    return apiClient.get("/api/subscriptions/family");
  },

  /**
   * Convida uma conta existente para o plano Família.
   *
   * @param {{ email: string }} input Email da conta convidada.
   * @returns {Promise<object>} Convite criado e estado familiar atualizado.
   */
  inviteFamilyMember(input) {
    // A sessão segue no cookie HttpOnly configurado no apiClient da MF1.
    return apiClient.post("/api/subscriptions/family/invitations", input);
  },

  /**
   * Aceita um convite familiar pendente.
   *
   * @param {string} invitationId Id do convite.
   * @returns {Promise<object>} Estado familiar atualizado.
   */
  acceptFamilyInvitation(invitationId) {
    return apiClient.post(`/api/subscriptions/family/invitations/${invitationId}/accept`);
  },

  /**
   * Recusa um convite familiar pendente.
   *
   * @param {string} invitationId Id do convite.
   * @returns {Promise<object>} Estado familiar atualizado.
   */
  declineFamilyInvitation(invitationId) {
    return apiClient.post(`/api/subscriptions/family/invitations/${invitationId}/decline`);
  },

  /**
   * Remove um membro da família do owner autenticado.
   *
   * @param {string} memberId Id do utilizador membro.
   * @returns {Promise<object>} Estado familiar atualizado.
   */
  removeFamilyMember(memberId) {
    return apiClient.del(`/api/subscriptions/family/members/${memberId}`);
  },

  /** @returns {Promise<object>} Estado familiar depois de sair. */
  leaveFamily() {
    return apiClient.post("/api/subscriptions/family/leave");
  },
};