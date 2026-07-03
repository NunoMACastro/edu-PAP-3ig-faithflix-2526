/**
 * @file Ficheiro `real_dev/frontend/src/services/api/subscriptionsApi.js` da implementação real_dev.
 */

/**
 * Cliente frontend para rotas de subscrições.
 *
 * Usa o `apiClient` da MF1 para herdar `credentials: "include"` e enviar
 * cookies HttpOnly sem expor tokens no navegador.
 */
import { apiClient } from "./apiClient.js";

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
   * Convida uma conta existente para o plano Familia.
   *
   * @param {{ email: string }} input Email da conta convidada.
   * @returns {Promise<object>} Convite criado e estado familiar atualizado.
   */
  inviteFamilyMember(input) {
    return apiClient.post("/api/subscriptions/family/invitations", input);
  },
  /** @param {string} invitationId Id do convite. */
  acceptFamilyInvitation(invitationId) {
    return apiClient.post(`/api/subscriptions/family/invitations/${invitationId}/accept`);
  },
  /** @param {string} invitationId Id do convite. */
  declineFamilyInvitation(invitationId) {
    return apiClient.post(`/api/subscriptions/family/invitations/${invitationId}/decline`);
  },
  /** @param {string} memberId Id do utilizador membro. */
  removeFamilyMember(memberId) {
    return apiClient.del(`/api/subscriptions/family/members/${memberId}`);
  },
  /** @returns {Promise<object>} Estado familiar depois de sair. */
  leaveFamily() {
    return apiClient.post("/api/subscriptions/family/leave");
  },
};
