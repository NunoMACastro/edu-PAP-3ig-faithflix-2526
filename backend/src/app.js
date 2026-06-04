import express from "express";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { attachSession } from "./middlewares/session.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { sessionRouter } from "./modules/auth/session.routes.js";
import { healthRouter } from "./modules/system/health.routes.js";
import { systemRouter } from "./modules/system/system.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { catalogRouter } from "./modules/catalog/catalog.routes.js";


export function createApp() {
  const app = express();

  app.use(attachSession);
  app.use("/api/users", userRouter);
  app.use("/api/catalog", catalogRouter);

  app.use(requestLogger);
  app.use(express.json({ limit: "1mb" }));
  app.use(attachSession);

  app.use("/health", healthRouter);
  app.use("/api", systemRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/session", sessionRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}