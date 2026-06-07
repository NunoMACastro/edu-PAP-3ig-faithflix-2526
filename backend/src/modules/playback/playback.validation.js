import { HttpError } from "../../utils/http-error.js";

/**
 * Validates playback progress and computes completion.
 *
 * @param {{ currentTimeSeconds?: unknown }} input - Progress payload.
 * @param {number} durationSeconds - Content duration.
 * @returns {{ currentTimeSeconds: number, durationSeconds: number, completed: boolean }} Safe progress.
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
