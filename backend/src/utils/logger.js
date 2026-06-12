import { env } from "../config/env.js";

const SENSITIVE_KEYS = [
    "authorization",
    "cookie",
    "password",
    "token",
    "secret",
    "set-cookie",
];

/**
 * Checks whether a context key should be redacted before logging.
 *
 * @param {string} key - Object key being inspected.
 * @returns {boolean} True when the key may contain sensitive information.
 */
function shouldRedact(key) {
    return SENSITIVE_KEYS.some((sensitiveKey) =>
        key.toLowerCase().includes(sensitiveKey),
    );
}

/**
 * Recursively redacts sensitive fields from log context.
 *
 * @param {unknown} value - Context value that may contain sensitive information.
 * @returns {unknown} Redacted copy that is safe to serialize in logs.
 */
function redact(value) {
    if (Array.isArray(value)) {
        return value.map((item) => redact(item));
    }

    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                shouldRedact(key) ? "[REDACTED]" : redact(item),
            ]),
        );
    }

    return value;
}

/**
 * Writes one structured JSON log line to the correct console stream.
 *
 * @param {"info" | "warn" | "error"} level - Severity level for the log entry.
 * @param {string} message - Short machine-readable event name.
 * @param {Record<string, unknown>} [context={}] - Additional structured context.
 * @returns {void}
 */
function writeLog(level, message, context = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        service: env.serviceName,
        message,
        ...redact(context),
    };

    const line = JSON.stringify(entry);

    if (level === "error") {
        console.error(line);
        return;
    }

    if (level === "warn") {
        console.warn(line);
        return;
    }

    console.log(line);
}

/**
 * Structured logger used by backend middlewares and future modules.
 */
export const logger = {
    /**
     * Writes an informational log entry.
     *
     * @param {string} message - Short machine-readable event name.
     * @param {Record<string, unknown>} [context] - Additional structured context.
     * @returns {void}
     */
    info(message, context) {
        writeLog("info", message, context);
    },

    /**
     * Writes a warning log entry.
     *
     * @param {string} message - Short machine-readable event name.
     * @param {Record<string, unknown>} [context] - Additional structured context.
     * @returns {void}
     */
    warn(message, context) {
        writeLog("warn", message, context);
    },

    /**
     * Writes an error log entry.
     *
     * @param {string} message - Short machine-readable event name.
     * @param {Record<string, unknown>} [context] - Additional structured context.
     * @returns {void}
     */
    error(message, context) {
        writeLog("error", message, context);
    },
};
