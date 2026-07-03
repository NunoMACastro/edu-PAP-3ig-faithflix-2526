/**
 * @file Ficheiro `real_dev/backend/src/modules/playback/playback.validation.js` da implementação real_dev.
 */

import { HttpError } from "../../utils/http-error.js";

/**
 * Valida progresso de reprodução e calcula conclusão.
 *
 * @param {{ currentTimeSeconds?: unknown }} input - Progress dados.
 * @param {number} durationSeconds - Content duration.
 * @returns {{ currentTimeSeconds: number, durationSeconds: number, completed: boolean }} Progresso seguro.
 */
export function assertProgressPayload(input, durationSeconds) {
    const currentTimeSeconds = Number(input?.currentTimeSeconds);

    if (!Number.isFinite(currentTimeSeconds) || currentTimeSeconds < 0) {
        throw new HttpError(400, "Progresso invalido.");
    }

    const safeDuration = Number(durationSeconds);
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
