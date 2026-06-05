export function assertProgressPayload(input, durationSeconds) {
  const currentTimeSeconds = Number(input.currentTimeSeconds);

  if (!Number.isFinite(currentTimeSeconds) || currentTimeSeconds < 0) {
    const error = new Error("Progresso invalido.");
    error.statusCode = 400;
    throw error;
  }

  const safeDuration = Number(durationSeconds);
  const safeTime = Math.min(currentTimeSeconds, safeDuration);
  const completed = safeDuration > 0 && (safeTime >= safeDuration * 0.95 || safeDuration - safeTime <= 60);

  return {
    currentTimeSeconds: safeTime,
    durationSeconds: safeDuration,
    completed,
  };
}