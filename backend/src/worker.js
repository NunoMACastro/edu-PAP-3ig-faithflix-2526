/**
 * @file Processo separado para jobs financeiros locais da FaithFlix.
 *
 * Cada passagem reclama leases distribuídos. SIGTERM/SIGINT cancelam apenas a
 * próxima espera: o ciclo já ativo termina antes do fecho único de MongoDB.
 * A renovação continua explicitamente simulada.
 */

import { randomUUID } from "node:crypto";
import { hostname } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
    assertTransactionSupport,
    closeDatabase,
} from "./config/database.js";
import { ensurePoolDistributionIndexes } from "./modules/charities/pool-distribution.service.js";
import { runBillingWorkerCycle } from "./modules/jobs/billing-jobs.service.js";
import { ensureScheduledJobIndexes } from "./modules/jobs/scheduled-jobs.service.js";
import { ensureNotificationIndexes } from "./modules/notifications/notifications.service.js";
import { ensurePaymentIndexes } from "./modules/payments/payments.service.js";
import { ensureSubscriptionIndexes } from "./modules/subscriptions/subscriptions.service.js";
import { installSignalHandlers } from "./runtime/graceful-shutdown.js";
import { logger } from "./utils/logger.js";

const DEFAULT_POLL_MS = 60_000;
const MIN_POLL_MS = 10_000;
const MAX_POLL_MS = 60 * 60_000;

/**
 * Lê o intervalo do worker com limites que evitam busy loops e pausas ocultas.
 *
 * @param {unknown} value Valor opcional `WORKER_POLL_MS`.
 * @returns {number} Intervalo seguro.
 */
export function workerPollMs(value) {
    if (value === undefined || value === "") return DEFAULT_POLL_MS;
    const parsed = Number(value);
    if (
        !Number.isInteger(parsed) ||
        parsed < MIN_POLL_MS ||
        parsed > MAX_POLL_MS
    ) {
        const error = new Error("WORKER_POLL_MS inválido.");
        error.code = "WORKER_POLL_INVALID";
        throw error;
    }
    return parsed;
}

/**
 * Cria uma espera cancelável sem acumular listeners entre ciclos.
 *
 * @param {number} milliseconds Duração.
 * @param {AbortSignal} signal Sinal de shutdown.
 * @returns {Promise<void>} Resolve no timeout ou cancelamento.
 */
export function waitForNextCycle(milliseconds, signal) {
    return new Promise((resolveWait) => {
        if (signal.aborted) {
            resolveWait();
            return;
        }

        let settled = false;
        let timeout;
        const finish = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            signal.removeEventListener("abort", finish);
            resolveWait();
        };

        timeout = setTimeout(finish, milliseconds);
        timeout.unref?.();
        signal.addEventListener("abort", finish, { once: true });
    });
}

/**
 * Prepara os invariantes e índices necessários antes do primeiro ciclo.
 *
 * @returns {Promise<void>}
 */
async function prepareWorker() {
    // O worker depende sempre de transações; não há fallback standalone.
    await assertTransactionSupport();
    await ensureScheduledJobIndexes();
    await ensureSubscriptionIndexes();
    await ensurePaymentIndexes();
    await ensureNotificationIndexes();
    await ensurePoolDistributionIndexes();
}

/**
 * Arranca o loop do worker e devolve apenas depois de shutdown limpo.
 *
 * As dependências opcionais existem exclusivamente para testes unitários
 * isolados; o entry point usa sempre os serviços reais declarados acima.
 *
 * @param {{ processTarget?: NodeJS.Process, log?: typeof logger, prepare?: () => Promise<void>, runCycle?: (options: { ownerId: string }) => Promise<{ subscriptions?: unknown, pool?: unknown }>, closeDb?: () => Promise<void>, ownerId?: string, pollMs?: number }} [options] Dependências testáveis.
 * @returns {Promise<void>}
 */
export async function runWorker(options = {}) {
    const processTarget = options.processTarget ?? process;
    const log = options.log ?? logger;
    const prepare = options.prepare ?? prepareWorker;
    const runCycle = options.runCycle ?? runBillingWorkerCycle;
    const closeDb = options.closeDb ?? closeDatabase;
    const ownerId =
        options.ownerId ??
        `${hostname()}:${process.pid}:${randomUUID()}`.slice(0, 128);
    const pollMs =
        options.pollMs ?? workerPollMs(process.env.WORKER_POLL_MS);
    const controller = new AbortController();
    let shutdownRequested = false;

    const requestShutdown = (signal) => {
        if (shutdownRequested) return;
        shutdownRequested = true;
        log.info("FaithFlix worker shutdown requested", { signal });
        controller.abort();
    };

    let removeSignalHandlers = () => {};
    removeSignalHandlers = installSignalHandlers({
        target: processTarget,
        onSignal: requestShutdown,
        onError: (error, signal) => {
            log.error("FaithFlix worker signal handler failed", {
                signal,
                code: error?.code ?? "WORKER_SIGNAL_FAILED",
            });
        },
    });

    try {
        await prepare();
        log.info("FaithFlix worker started", { pollMs });

        while (!controller.signal.aborted) {
            try {
                const result = await runCycle({ ownerId });
                log.info("FaithFlix worker cycle completed", {
                    subscriptionJobs: result?.subscriptions,
                    poolJob: result?.pool,
                });
            } catch (error) {
                log.error("FaithFlix worker cycle failed", {
                    code: error?.code ?? "WORKER_CYCLE_FAILED",
                });
            }

            await waitForNextCycle(pollMs, controller.signal);
        }
    } finally {
        removeSignalHandlers();
        await closeDb();
        log.info("FaithFlix worker stopped");
    }
}

/**
 * Evita arrancar o worker quando o módulo é importado por testes.
 *
 * @returns {boolean} Verdadeiro apenas para `node src/worker.js`.
 */
function isMainModule() {
    if (!process.argv[1]) return false;
    return import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
}

if (isMainModule()) {
    runWorker().catch((error) => {
        logger.error("FaithFlix worker startup failed", {
            code: error?.code ?? "WORKER_STARTUP_FAILED",
        });
        process.exitCode = 1;
    });
}
