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
  /**
   * Lista os planos de subscrição disponíveis para escolha pública.
   *
   * A resposta vem do backend para manter preços, ciclos e limites familiares
   * sincronizados com as regras comerciais atuais.
   *
   * @returns {Promise<object>} Planos ativos públicos.
   */
  listPlans(options = {}) {
    return apiClient.get("/api/subscriptions/plans", options);
  },
  /**
   * Obtém a subscrição associada à sessão atual.
   *
   * Usa os cookies HttpOnly enviados pelo `apiClient`, por isso não recebe token
   * nem identificador de utilizador como argumento.
   *
   * @returns {Promise<object>} Estado da subscrição do utilizador autenticado.
   */
  getMine(options = {}) {
    return apiClient.get("/api/subscriptions/me", options);
  },
  /**
   * Cancela a renovação automática da subscrição atual.
   *
   * A chamada não apaga imediatamente o acesso; pede ao backend para marcar a
   * subscrição como não renovável no fim do período contratado.
   *
   * @returns {Promise<object>} Subscrição atualizada com renovação cancelada.
   */
  cancelRenewal(options = {}) {
    return apiClient.post(
      "/api/subscriptions/me/cancel-renewal",
      undefined,
      options,
    );
  },
  /**
   * Obtém o estado do grupo familiar ligado à subscrição atual.
   *
   * Devolve membros, convites pendentes e permissões que a interface usa para
   * decidir se mostra ações de convite, remoção ou saída.
   *
   * @returns {Promise<object>} Estado familiar do utilizador autenticado.
   */
  getFamily(options = {}) {
    return apiClient.get("/api/subscriptions/family", options);
  },
  /**
   * Convida uma conta existente para o plano Familia.
   *
   * @param {{ email: string }} input Email da conta convidada.
   * @returns {Promise<object>} Convite criado e estado familiar atualizado.
   */
  inviteFamilyMember(input, options = {}) {
    return apiClient.post(
      "/api/subscriptions/family/invitations",
      input,
      options,
    );
  },
  /**
   * Aceita um convite familiar pendente.
   *
   * O identificador é colocado no URL para o backend validar se o convite ainda
   * existe, pertence ao utilizador autenticado e pode ser aceite.
   *
   * @param {string} invitationId Identificador do convite familiar.
   * @returns {Promise<object>} Estado familiar atualizado depois da aceitação.
   */
  acceptFamilyInvitation(invitationId, options = {}) {
    return apiClient.post(
      `/api/subscriptions/family/invitations/${encodeURIComponent(invitationId)}/accept`,
      undefined,
      options,
    );
  },
  /**
   * Recusa um convite familiar pendente.
   *
   * A operação informa o backend de que o convite não deve continuar disponível
   * para a conta autenticada.
   *
   * @param {string} invitationId Identificador do convite familiar.
   * @returns {Promise<object>} Estado familiar atualizado depois da recusa.
   */
  declineFamilyInvitation(invitationId, options = {}) {
    return apiClient.post(
      `/api/subscriptions/family/invitations/${encodeURIComponent(invitationId)}/decline`,
      undefined,
      options,
    );
  },
  /**
   * Remove um membro do grupo familiar.
   *
   * Só envia o identificador do membro; a autorização para remover esse membro é
   * sempre confirmada no backend com base na sessão atual.
   *
   * @param {string} memberId Identificador do utilizador membro.
   * @returns {Promise<object>} Estado familiar atualizado sem o membro removido.
   */
  removeFamilyMember(memberId, options = {}) {
    return apiClient.del(
      `/api/subscriptions/family/members/${encodeURIComponent(memberId)}`,
      options,
    );
  },
  /**
   * Remove a conta autenticada do grupo familiar atual.
   *
   * Esta ação representa a saída voluntária do utilizador, sem permitir escolher
   * outro membro por engano a partir do frontend.
   *
   * @returns {Promise<object>} Estado familiar depois da saída.
   */
  leaveFamily(options = {}) {
    return apiClient.post(
      "/api/subscriptions/family/leave",
      undefined,
      options,
    );
  },
};
