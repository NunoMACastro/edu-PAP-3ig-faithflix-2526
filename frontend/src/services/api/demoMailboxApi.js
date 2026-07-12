/**
 * @file Cliente da caixa de email exclusivamente local da demo PAP.
 */

import { apiClient } from "./apiClient.js";

export const demoMailboxApi = Object.freeze({
    /**
     * Consulta mensagens locais pelo email exato.
     *
     * A rota é pública apenas no processo demo/loopback. O caller ativa CSRF
     * quando o contexto confirma uma sessão autenticada; sem sessão não deve
     * tentar obter um token num endpoint que exige autenticação.
     *
     * @param {string} email Email da conta demo.
     * @param {RequestInit} [options] Opções de cancelamento.
     * @returns {Promise<{ messages: object[] }>} Mensagens locais recentes.
     */
    list(email, options = {}) {
        return apiClient.post(
            "/api/demo/mailbox",
            { email },
            { ...options, csrf: options.csrf === true },
        );
    },
});
