/**
 * @file Fabrica da aplicacao Express e composicao de rotas.
 */

import express from "express";
import { env } from "./config/env.js";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import { csrfProtection } from "./middlewares/csrf.middleware.js";
import {
    errorHandler,
    notFoundHandler,
} from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { attachSession } from "./middlewares/session.middleware.js";
import {
    requireHttps,
    securityHeaders,
} from "./middlewares/security.middleware.js";
import { adminMetricsRouter } from "./modules/admin-metrics/admin-metrics.routes.js";
import { analyticsRouter } from "./modules/analytics/analytics.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { sessionRouter } from "./modules/auth/session.routes.js";
import { biblicalPassagesRouter } from "./modules/biblical-passages/biblical-passages.routes.js";
import { catalogRouter } from "./modules/catalog/catalog.routes.js";
import { commentsRouter } from "./modules/comments/comments.routes.js";
import { discoveryRouter } from "./modules/discovery/discovery.routes.js";
import { isDemoMailboxEnvironmentEnabled } from "./modules/demo-mailbox/demo-mailbox.config.js";
import { demoMailboxRouter } from "./modules/demo-mailbox/demo-mailbox.routes.js";
import { integrationsRouter } from "./modules/integrations/integrations.routes.js";
import { healthRouter } from "./modules/system/health.routes.js";
import { systemRouter } from "./modules/system/system.routes.js";
import { libraryRouter } from "./modules/library/library.routes.js";
import { playbackRouter } from "./modules/playback/playback.routes.js";
import { ratingsRouter } from "./modules/ratings/ratings.routes.js";
import { recommendationsRouter } from "./modules/recommendations/recommendations.routes.js";
import { searchRouter } from "./modules/search/search.routes.js";
import { userRouter } from "./modules/users/user.routes.js";
import { subscriptionsRouter } from "./modules/subscriptions/subscriptions.routes.js";
import { paymentsRouter } from "./modules/payments/payments.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";
import { charitiesRouter } from "./modules/charities/charities.routes.js";
import { privacyRouter } from "./modules/privacy/privacy.routes.js";
import {
    catalogMediaRouter,
    mediaRouter,
} from "./modules/media/media.routes.js";

/**
 * Cria a aplicação Express com middlewares e routers principais.
 *
 * @returns {import("express").Express} Aplicação configurada.
 */
export function createApp() {
    const app = express();

    app.disable("x-powered-by");
    if (env.trustProxy !== false) {
        app.set("trust proxy", env.trustProxy);
    }

    // A ordem importa: os ids de pedido devem existir antes das rotas e do tratamento de erros.
    app.use(requestLogger);
    app.use(securityHeaders);
    app.use(requireHttps);
    // Os pedidos do frontend Vite precisam de CORS explicito com credenciais.
    app.use(corsMiddleware);

    // Health não depende de parsing de body, sessão ou CSRF. Readiness consulta
    // apenas MongoDB; liveness continua disponível quando essa dependência falha.
    app.use("/health", healthRouter);

    // O tamanho do corpo fica limitado de proposito nesta fase base.
    app.use(express.json({ limit: "1mb" }));
    // Todas as rotas recebem um objeto req.session previsivel.
    app.use(attachSession);
    app.use(csrfProtection);

    app.use("/api", systemRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/session", sessionRouter);
    app.use("/api/users", userRouter);
    app.use("/api/biblical-passages", biblicalPassagesRouter);
    // As rotas específicas de ingestão precedem o detalhe genérico `/:idOrSlug`.
    app.use("/api/catalog", catalogMediaRouter);
    app.use("/api/catalog", catalogRouter);
    app.use("/api/media", mediaRouter);
    app.use("/api/playback", playbackRouter);
    app.use("/api/me", libraryRouter);
    app.use("/api/ratings", ratingsRouter);
    app.use("/api/comments", commentsRouter);
    app.use("/api/search", searchRouter);
    app.use("/api/discovery", discoveryRouter);
    app.use("/api/recommendations", recommendationsRouter);
    app.use("/api/payments", paymentsRouter);
    app.use("/api/notifications", notificationsRouter);
    app.use("/api/subscriptions", subscriptionsRouter);
    app.use("/api/charities", charitiesRouter);
    app.use("/api/privacy", privacyRouter);
    app.use("/api/analytics", analyticsRouter);
    app.use("/api/admin/metrics", adminMetricsRouter);
    app.use("/api/admin/integrations", integrationsRouter);

    // Este endpoint nem sequer é montado fora da configuração local fechada.
    if (isDemoMailboxEnvironmentEnabled(process.env, env.mongoDbName)) {
        app.use("/api/demo", demoMailboxRouter);
    }

    // Os middlewares de erro ficam no fim para receberem rotas sem correspondencia e falhas.
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
