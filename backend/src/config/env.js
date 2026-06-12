const DEFAULT_PORT = 3000;

/**
 * Converts the PORT environment variable into a safe TCP port number.
 *
 * @param {string | undefined} value - Raw value read from `process.env.PORT`.
 * @returns {number} Valid port number to be used by the HTTP server.
 * @throws {Error} Throws when the value is not an integer between 1 and 65535.
 */
function parsePort(value) {
    // Empty PORT means "use the project default"; it is not an error.
    if (value === undefined || value === "") {
        return DEFAULT_PORT;
    }

    const parsed = Number(value);

    // Failing early gives students and deployment tools a clear error message.
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
        throw new Error("PORT deve ser um numero inteiro entre 1 e 65535.");
    }

    return parsed;
}

/**
 * Centralized environment configuration for the backend.
 *
 * @type {{ nodeEnv: string, port: number, serviceName: string, mongoUri: string, mongoDbName: string }}
 */
export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: parsePort(process.env.PORT),
    serviceName: process.env.SERVICE_NAME ?? "faithflix-api",
    mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
    mongoDbName: process.env.MONGODB_DB_NAME ?? "faithflix",
};

/**
 * Indicates whether the backend is running with production settings.
 *
 * @type {boolean}
 */
export const isProduction = env.nodeEnv === "production";
