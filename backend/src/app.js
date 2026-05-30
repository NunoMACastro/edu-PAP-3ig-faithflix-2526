import express from "express";
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/error.middleware.js";
import { attachSession } from "./middlewares/session.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { systemRouter } from "./modules/system/system.routes.js";

export function createApp() {
    const app = express();

    app.use(express.json({ limit: "1mb" }));
    app.use(attachSession);

    app.use("/api", systemRouter);
    app.use("/api/session", authRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}