/**
 * @file Fila serial e coalescida para progresso de reprodução.
 */

/**
 * Cria uma fila que nunca executa duas escritas em paralelo.
 *
 * Valores recebidos antes do próximo drain são coalescidos para a posição mais
 * recente. O marcador confirmado só avança depois do sucesso do backend.
 *
 * @param {(position: number) => Promise<unknown>} saveProgress Escrita real.
 * @param {{ initialPosition?: number }} [options] Última posição já confirmada pelo backend.
 * @returns {{ enqueue: (position: number) => Promise<number>, close: (position?: number) => Promise<number>, getLastSaved: () => number }} Fila.
 */
export function createProgressQueue(saveProgress, options = {}) {
    if (typeof saveProgress !== "function") {
        throw new TypeError("Função de progresso obrigatória.");
    }

    let pendingPosition = null;
    let pendingWaiters = [];
    let running = false;
    let closed = false;
    let lastSaved = 0;

    /** @param {unknown} value Posição candidata. @returns {number} Posição segura. */
    function positionValue(value) {
        const position = Number(value);
        if (!Number.isFinite(position) || position < 0) {
            throw new TypeError("Posição de progresso inválida.");
        }
        return position;
    }

    lastSaved = positionValue(options.initialPosition ?? 0);

    /** @returns {Promise<void>} Consome todos os lotes pendentes. */
    async function drain() {
        while (pendingPosition !== null) {
            const position = pendingPosition;
            const waiters = pendingWaiters;
            pendingPosition = null;
            pendingWaiters = [];

            try {
                await saveProgress(position);
                lastSaved = position;
                waiters.forEach(({ resolve }) => resolve(lastSaved));
            } catch (error) {
                waiters.forEach(({ reject }) => reject(error));
            }
        }
        running = false;
    }

    /** @returns {void} Agenda drain para permitir coalescing no mesmo tick. */
    function scheduleDrain() {
        if (running) return;
        running = true;
        Promise.resolve().then(drain);
    }

    /** @param {number} position Posição. @returns {Promise<number>} Confirmação. */
    function enqueueInternal(position) {
        pendingPosition = positionValue(position);
        const promise = new Promise((resolve, reject) => {
            pendingWaiters.push({ resolve, reject });
        });
        scheduleDrain();
        return promise;
    }

    return {
        enqueue(position) {
            if (closed) return Promise.resolve(lastSaved);
            return enqueueInternal(position);
        },
        close(position = undefined) {
            if (closed) return Promise.resolve(lastSaved);
            const completion = position === undefined
                ? Promise.resolve(lastSaved)
                : enqueueInternal(position);
            closed = true;
            return completion;
        },
        getLastSaved() {
            return lastSaved;
        },
    };
}
