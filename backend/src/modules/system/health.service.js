/**
 * @file Estados de liveness e readiness do processo backend FaithFlix.
 */

import { env } from "../../config/env.js";
import { assertTransactionSupport } from "../../config/database.js";

export const READINESS_DEADLINE_MS = 500;

/**
 * Cria a parte comum dos payloads de health sem expor configuração interna.
 *
 * @param {"ok" | "unavailable"} status Estado agregado.
 * @param {"ok" | "unavailable" | "not_checked"} database Estado seguro da dependência MongoDB.
 * @returns {{ status: "ok" | "unavailable", service: string, timestamp: string, uptimeSeconds: number, dependencies: { api: "ok", database: "ok" | "unavailable" | "not_checked" } }} Payload operacional seguro.
 */
function buildHealthStatus(status, database) {
    return {
        status,
        service: env.serviceName,
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        dependencies: {
            api: "ok",
            database,
        },
    };
}

/**
 * Confirma apenas que o processo HTTP está vivo.
 *
 * Esta função não consulta MongoDB nem qualquer outra dependência externa, para
 * que um orquestrador nunca reinicie um processo saudável apenas porque a base
 * de dados está temporariamente indisponível.
 *
 * @returns {{ status: "ok", service: string, timestamp: string, uptimeSeconds: number, live: true, dependencies: { api: "ok", database: "not_checked" } }} Estado de liveness.
 */
export function getLivenessStatus() {
    return {
        ...buildHealthStatus("ok", "not_checked"),
        live: true,
    };
}

/**
 * Confirma readiness transacional com um deadline externo ao driver MongoDB.
 *
 * O `maxTimeMS` do comando `hello` limita o probe no servidor, mas não limita a obtenção
 * inicial da ligação. O `Promise.race` cobre ambas as etapas e impede que o
 * endpoint ultrapasse indefinidamente o budget operacional. A promessa do ping
 * mantém handlers de sucesso/falha depois do timeout, evitando rejeições tardias
 * não tratadas. Um standalone pode responder a `ping`, mas continua indisponível
 * porque as mutações da aplicação exigem transações multi-documento.
 *
 * @param {{ probe?: (maxTimeMS: number) => Promise<void>, ping?: (maxTimeMS: number) => Promise<void>, deadlineMs?: number }} [options] Dependências injetáveis para testes locais. `ping` é mantido como alias de compatibilidade nos testes.
 * @returns {Promise<{ ready: boolean, status: "ok" | "unavailable", service: string, timestamp: string, uptimeSeconds: number, dependencies: { api: "ok", database: "ok" | "unavailable" } }>} Estado de readiness sem detalhes internos.
 */
export async function getReadinessStatus(options = {}) {
    const probe = options.probe ?? options.ping ?? assertTransactionSupport;
    const deadlineMs = Number.isFinite(options.deadlineMs)
        ? Math.max(1, Math.floor(options.deadlineMs))
        : READINESS_DEADLINE_MS;
    let timeoutId;

    const pingResult = Promise.resolve()
        .then(() => probe(deadlineMs))
        .then(
            () => true,
            () => false,
        );
    const deadlineResult = new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve(false), deadlineMs);
    });

    const ready = await Promise.race([pingResult, deadlineResult]);
    clearTimeout(timeoutId);

    return {
        ...buildHealthStatus(
            ready ? "ok" : "unavailable",
            ready ? "ok" : "unavailable",
        ),
        ready,
    };
}
