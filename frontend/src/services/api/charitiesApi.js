/**
 * @file Cliente HTTP para a API de associações.
 *
 * Agrupa chamadas usadas pelos ecrãs públicos e administrativos, mantendo
 * autenticação, autorização e validação final no backend.
 */

import { env } from "../../config/env.js";
import { apiClient } from "./apiClient.js";

/**
 * Constrói URL absoluta para downloads servidos diretamente pelo backend.
 *
 * @param {string} path Caminho HTTP da API.
 * @returns {string} URL absoluta.
 */
function apiUrl(path) {
  return `${env.apiBaseUrl}${path}`;
}

export const charitiesApi = {
  /**
   * Pesquisa associações ativas elegíveis sem devolver contactos privados.
   */
  lookupAdminCharities(search, options = {}) {
    const query = new URLSearchParams({ search, page: "1", limit: "10" });
    return apiClient.get(`/api/charities/admin/lookup?${query}`, options);
  },
  /**
   * Submete uma candidatura pública.
   *
   * @param {object} input Campos do formulário.
   * @returns {Promise<{ application: object }>} Candidatura criada.
   */
  submitApplication(input, options = {}) {
    return apiClient.post("/api/charities/applications", input, options);
  },

  /**
   * Lista candidaturas para ecrãs de administração.
   *
   * @param {string} [status="pending"] Estado a consultar.
   * @returns {Promise<{ applications: object[] }>} Lista devolvida pela API.
   */
  listApplications(params = {}, options = {}) {
    const normalizedParams =
      typeof params === "string" ? { status: params } : params;
    const query = new URLSearchParams();

    query.set("status", normalizedParams.status ?? "pending");
    if (normalizedParams.page !== undefined) {
      query.set("page", String(normalizedParams.page));
    }
    if (normalizedParams.limit !== undefined) {
      query.set("limit", String(normalizedParams.limit));
    }

    return apiClient.get(
      `/api/charities/applications?${query.toString()}`,
      options,
    );
  },

  /**
   * Revê uma candidatura pendente.
   *
   * @param {string} id Identificador da candidatura.
   * @param {{ decision: "approved" | "rejected", reason?: string }} input Decisão administrativa.
   * @returns {Promise<object>} Resultado da revisão.
   */
  reviewApplication(id, input, options = {}) {
    return apiClient.patch(
      `/api/charities/applications/${encodeURIComponent(id)}/review`,
      input,
      options,
    );
  },

  /**
   * Executa a distribuição mensal da pool solidária.
   *
   * @param {string} month Mês no formato `YYYY-MM`.
   * @returns {Promise<{ distribution: object }>} Distribuição persistida.
   */
  runDistribution(month, previewToken, options = {}) {
    return apiClient.post(
      "/api/charities/pool/distributions",
      { month, previewToken },
      options,
    );
  },

  /**
   * Calcula uma preview financeira sem escrita nem audit log.
   *
   * @param {string} month Mês fechado no formato `YYYY-MM`.
   * @returns {Promise<{ preview: object }>} Candidato e token de consistência.
   */
  previewDistribution(month, options = {}) {
    return apiClient.get(
      `/api/charities/pool/distributions/${encodeURIComponent(month)}/preview`,
      options,
    );
  },

  /**
   * Consulta uma distribuição mensal já criada.
   *
   * @param {string} month Mês no formato `YYYY-MM`.
   * @returns {Promise<{ distribution: object }>} Distribuição persistida.
   */
  getDistribution(month) {
    return apiClient.get(
      `/api/charities/pool/distributions/${encodeURIComponent(month)}`,
    );
  },

  /**
   * Lista associações públicas elegíveis.
   *
   * @returns {Promise<{ charities: object[], impact?: object }>} Associações e impacto público agregado.
   */
  listPublicCharities(options = {}) {
    return apiClient.get("/api/charities/public", options);
  },

  /**
   * Obtém o resumo da associação ligada à sessão atual.
   *
   * @param {{ signal?: AbortSignal }} [options] Opções canceláveis do pedido.
   * @returns {Promise<{ charity: null | { id: string, name: string } }>} Associação própria ou ausência explícita.
   */
  getMine(options = {}) {
    return apiClient.get("/api/charities/me", options);
  },

  /**
   * Alias curto usado por páginas antigas do frontend.
   *
   * @returns {Promise<{ charities: object[] }>} Associações públicas.
   */
  listPublic(options = {}) {
    return this.listPublicCharities(options);
  },

  /**
   * Obtém o dashboard administrativo da pool.
   *
   * @returns {Promise<{ months: object[] }>} Meses agregados.
   */
  getPoolDashboard(options = {}) {
    return apiClient.get("/api/charities/pool/dashboard", options);
  },

  /**
   * Obtém histórico privado de uma associação.
   *
   * @param {string} charityId Identificador da associação.
   * @returns {Promise<{ charityId: string, totalCents: number, rows: object[] }>} Histórico de distribuição.
   */
  getCharityHistory(charityId, options = {}) {
    return apiClient.get(
      `/api/charities/${encodeURIComponent(charityId)}/history`,
      options,
    );
  },

  /**
   * Constrói URL para download CSV do histórico.
   *
   * @param {string} charityId Identificador da associação.
   * @returns {string} URL absoluta do CSV.
   */
  historyCsvUrl(charityId) {
    return apiUrl(
      `/api/charities/${encodeURIComponent(charityId)}/history.csv`,
    );
  },

  /**
   * Liga um utilizador a uma associação.
   *
   * @param {string} charityId Identificador da associação.
   * @param {string} userId Identificador do utilizador.
   * @returns {Promise<{ membership: object }>} Ligação criada ou atualizada.
   */
  linkUserToCharity(charityId, userId, options = {}) {
    return apiClient.post(
      `/api/charities/${encodeURIComponent(charityId)}/members`,
      { userId },
      options,
    );
  },
};
