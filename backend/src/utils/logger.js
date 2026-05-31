import { env } from "../config/env.js";

const SENSITIVE_KEYS = [
    "authorization",
    "cookie",
    "password",
    "token",
    "secret",
    "set-cookie",
];

function shouldRedact(key) {
    return SENSITIVE_KEYS.some((sensitiveKey) =>
        key.toLowerCase().includes(sensitiveKey),
    );
}

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

export const logger = {
    info: (message, context) => writeLog("info", message, context),
    warn: (message, context) => writeLog("warn", message, context),
    error: (message, context) => writeLog("error", message, context),
};