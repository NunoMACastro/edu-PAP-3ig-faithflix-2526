import express from "express";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { attachSession } from "./middlewares/session.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { sessionRouter } from "./modules/auth/session.routes.js";
import { catalogRouter } from "./modules/catalog/catalog.routes.js";
import { healthRouter } from "./modules/system/health.routes.js";
import { systemRouter } from "./modules/system/system.routes.js";
import { libraryRouter } from "./modules/library/library.routes.js";
import { playbackRouter } from "./modules/playback/playback.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { ratingsRouter } from "./modules/ratings/ratings.routes.js";
import { commentsRouter } from "./modules/comments/comments.routes.js";
import { searchRouter } from "./modules/search/search.routes.js";
import { discoveryRouter } from "./modules/discovery/discovery.routes.js";



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
    app.use("/api/auth", authRouter);
    app.use("/api/session", sessionRouter);
    app.use("/api/users", userRouter);
    app.use("/api/catalog", catalogRouter);
    app.use("/api/playback", playbackRouter);
    app.use("/api/me", libraryRouter);

    // Error middlewares remain last so they see all unmatched routes and failures.
    app.use(notFoundHandler);
    app.use(errorHandler);

    //API de avaliações
    app.use("/api/ratings", ratingsRouter);

    //API de comentários
    app.use("/api/comments", commentsRouter);

    //API de busca
    app.use("/api/search", searchRouter);

    //API de descoberta
    app.use("/api/discovery", discoveryRouter);


    return app;
}
