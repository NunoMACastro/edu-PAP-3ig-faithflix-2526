/**
 * @file Ficheiro `real_dev/backend/src/modules/playback/playback.validation.js` da implementação real_dev.
 */

import { HttpError } from "../../utils/http-error.js";
import { parsePagination } from "../../utils/pagination.js";

/**
 * Valida a pagina da fila pessoal de conteúdos por continuar.
 *
 * @param {Record<string, unknown>} query Query string recebida.
 * @returns {{ page: number, limit: number }} Paginação segura e limitada.
 */
export function parseContinueWatchingPagination(query = {}) {
    return parsePagination(query, { defaultLimit: 12, maxLimit: 50 });
}

/**
 * Valida progresso de reprodução e calcula conclusão.
 *
 * @param {{ currentTimeSeconds?: unknown }} input - Progress dados.
 * @param {number} durationSeconds - Content duration.
 * @returns {{ currentTimeSeconds: number, durationSeconds: number, completed: boolean }} Progresso seguro.
 */
export function assertProgressPayload(input, durationSeconds) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Progresso invalido.");
    }

    const currentTimeSeconds = input.currentTimeSeconds;

    if (
        typeof currentTimeSeconds !== "number" ||
        !Number.isFinite(currentTimeSeconds) ||
        currentTimeSeconds < 0
    ) {
        throw new HttpError(400, "Progresso invalido.");
    }

    if (
        typeof durationSeconds !== "number" ||
        !Number.isFinite(durationSeconds) ||
        durationSeconds < 0
    ) {
        throw new HttpError(400, "Duracao de conteudo invalida.");
    }

    const safeDuration = durationSeconds;
    const safeTime = Math.min(currentTimeSeconds, safeDuration);
    const completed =
        safeDuration > 0 &&
        (safeTime >= safeDuration * 0.95 || safeDuration - safeTime <= 60);

    return {
        currentTimeSeconds: safeTime,
        durationSeconds: safeDuration,
        completed,
    };
}
