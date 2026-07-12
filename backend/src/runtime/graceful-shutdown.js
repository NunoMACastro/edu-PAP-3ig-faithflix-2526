/**
 * @file Coordenação testável de sinais e graceful shutdown do backend.
 *
 * O servidor deixa primeiro de aceitar pedidos, fecha ligações idle e concede
 * um intervalo limitado aos pedidos ativos. Só depois fecha MongoDB. Chamadas
 * concorrentes de shutdown partilham a mesma Promise e nunca repetem o fecho.
 */

const DEFAULT_SHUTDOWN_TIMEOUT_MS = 10_000;
const DEFAULT_FORCE_CLOSE_GRACE_MS = 250;
const TIMEOUT = Symbol("timeout");

/**
 * Aguarda uma Promise durante um intervalo limitado.
 *
 * @template T
 * @param {Promise<T>} promise Operação a aguardar.
 * @param {number} timeoutMs Limite em milissegundos.
 * @returns {Promise<T | typeof TIMEOUT>} Resultado ou marcador de timeout.
 */
async function waitWithin(promise, timeoutMs) {
    let timeout;
    const timeoutPromise = new Promise((resolve) => {
        timeout = setTimeout(() => resolve(TIMEOUT), timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Normaliza um budget interno sem permitir esperas ilimitadas.
 *
 * @param {unknown} value Valor configurado pelo chamador.
 * @param {number} fallback Valor por defeito.
 * @returns {number} Inteiro entre 1 ms e 60 s.
 */
function boundedMilliseconds(value, fallback) {
    if (!Number.isInteger(value)) return fallback;
    return Math.min(Math.max(value, 1), 60_000);
}

/**
 * Para o servidor HTTP e aguarda pedidos ativos dentro do budget definido.
 *
 * @param {import("node:http").Server} server Servidor HTTP já criado.
 * @param {{ timeoutMs?: number, forceCloseGraceMs?: number, logger?: { warn?: Function } }} [options] Opções do fecho.
 * @returns {Promise<{ forced: boolean, drained: boolean }>} Resultado sanitizado.
 */
export async function closeHttpServer(server, options = {}) {
    if (!server || typeof server.close !== "function") {
        const error = new Error("Servidor HTTP invalido para shutdown.");
        error.code = "HTTP_SERVER_INVALID";
        throw error;
    }

    const timeoutMs = boundedMilliseconds(
        options.timeoutMs,
        DEFAULT_SHUTDOWN_TIMEOUT_MS,
    );
    const forceCloseGraceMs = boundedMilliseconds(
        options.forceCloseGraceMs,
        DEFAULT_FORCE_CLOSE_GRACE_MS,
    );
    const closePromise = new Promise((resolve, reject) => {
        try {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });

    // Deve ser chamado depois de `close` para não existir uma janela de race.
    server.closeIdleConnections?.();

    const initialResult = await waitWithin(closePromise, timeoutMs);
    if (initialResult !== TIMEOUT) {
        return { forced: false, drained: true };
    }

    const supportsForcedClose =
        typeof server.closeAllConnections === "function";
    options.logger?.warn?.("FaithFlix HTTP shutdown timeout", {
        forcedCloseSupported: supportsForcedClose,
    });

    if (!supportsForcedClose) {
        return { forced: false, drained: false };
    }

    server.closeAllConnections();
    const forcedResult = await waitWithin(closePromise, forceCloseGraceMs);
    return {
        forced: true,
        drained: forcedResult !== TIMEOUT,
    };
}

/**
 * Cria um shutdown HTTP/Mongo idempotente e ordenado.
 *
 * A base é fechada uma única vez mesmo quando o fecho HTTP falha. O erro
 * devolvido é genérico; causas internas não são incluídas em logs pelo helper.
 *
 * @param {{ server: import("node:http").Server, closeDatabase: () => Promise<void>, logger?: { info?: Function, warn?: Function }, timeoutMs?: number, forceCloseGraceMs?: number }} dependencies Dependências explícitas.
 * @returns {(signal: string) => Promise<{ forced: boolean, drained: boolean }>} Função idempotente de shutdown.
 */
export function createGracefulShutdown(dependencies) {
    const {
        server,
        closeDatabase,
        logger,
        timeoutMs,
        forceCloseGraceMs,
    } = dependencies ?? {};

    if (typeof closeDatabase !== "function") {
        throw new TypeError("closeDatabase e obrigatoria.");
    }

    let shutdownPromise;

    return function requestShutdown(signal) {
        if (shutdownPromise) return shutdownPromise;

        logger?.info?.("FaithFlix API shutdown requested", { signal });
        shutdownPromise = (async () => {
            let httpResult = { forced: false, drained: false };
            let httpError;
            let databaseError;

            try {
                httpResult = await closeHttpServer(server, {
                    timeoutMs,
                    forceCloseGraceMs,
                    logger,
                });
            } catch (error) {
                httpError = error;
            }

            try {
                await closeDatabase();
            } catch (error) {
                databaseError = error;
            }

            if (httpError || databaseError) {
                const error = new Error("Graceful shutdown incompleto.");
                error.code = "GRACEFUL_SHUTDOWN_FAILED";
                error.cause = httpError ?? databaseError;
                throw error;
            }

            logger?.info?.("FaithFlix API stopped", httpResult);
            return httpResult;
        })();

        return shutdownPromise;
    };
}

/**
 * Regista handlers com labels explícitas e devolve cleanup idempotente.
 *
 * @param {{ target?: NodeJS.Process, signals?: string[], onSignal: (signal: string) => unknown, onError?: (error: unknown, signal: string) => unknown }} options Opções dos handlers.
 * @returns {() => void} Função que remove todos os listeners instalados.
 */
export function installSignalHandlers(options) {
    const {
        target = process,
        signals = ["SIGTERM", "SIGINT"],
        onSignal,
        onError = () => {},
    } = options ?? {};

    if (typeof onSignal !== "function") {
        throw new TypeError("onSignal e obrigatoria.");
    }

    const handlers = new Map();
    let installed = true;

    const reportError = (error, signal) => {
        try {
            onError(error, signal);
        } catch {
            // Nunca transformar uma falha de logging num unhandled rejection.
        }
    };

    for (const signal of signals) {
        const handler = () => {
            try {
                Promise.resolve(onSignal(signal)).catch((error) => {
                    reportError(error, signal);
                });
            } catch (error) {
                reportError(error, signal);
            }
        };
        handlers.set(signal, handler);
        // `on`, em vez de `once`, mantém o processo protegido se o mesmo sinal
        // chegar novamente enquanto o primeiro shutdown ainda está a drenar.
        // A idempotência pertence ao coordenador e o cleanup remove os handlers.
        target.on(signal, handler);
    }

    return function removeSignalHandlers() {
        if (!installed) return;
        installed = false;
        for (const [signal, handler] of handlers) {
            target.removeListener(signal, handler);
        }
    };
}
