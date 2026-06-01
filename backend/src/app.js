import express from "express";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { attachSession } from "./middlewares/session.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { healthRouter } from "./modules/system/health.routes.js";
import { systemRouter } from "./modules/system/system.routes.js";

/**
 * Creates the Express application without opening a network port.
 *
 * @returns {import("express").Express} Configured Express application ready for server or tests.
 */
export function createApp() {
    const app = express();

    // Order matters: request ids should exist before routes and error handling run.
    app.use(requestLogger);
    // Browser requests from the Vite frontend need explicit CORS with credentials.
    app.use(corsMiddleware);
    // Body size is intentionally limited during the foundation stage.
    app.use(express.json({ limit: "1mb" }));
    // Every route receives a predictable req.session object.
    app.use(attachSession);

    app.use("/health", healthRouter);
    app.use("/api", systemRouter);
    app.use("/api/session", authRouter);

    // Error middlewares remain last so they see all unmatched routes and failures.
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
