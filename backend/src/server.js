/**
 * @file Ponto de arranque HTTP da API FaithFlix.
 *
 * Prepara índices e seeds mínimos antes de aceitar tráfego, para que as rotas
 * possam assumir constraints essenciais de autenticação, catálogo, subscrições
 * e pool solidária.
 */

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureAuthIndexes } from "./modules/auth/auth.indexes.js";
import { ensureBiblicalPassageIndexes } from "./modules/biblical-passages/biblical-passages.service.js";
import { ensureCatalogIndexes } from "./modules/catalog/catalog.service.js";
import { ensureTaxonomyIndexes } from "./modules/catalog/taxonomy.service.js";
import { ensureCharityApplicationIndexes } from "./modules/charities/charity-applications.service.js";
import { ensureCharityReportIndexes } from "./modules/charities/charity-reports.service.js";
import { ensureCharityIndexes } from "./modules/charities/charity-review.service.js";
import { ensurePoolDistributionIndexes } from "./modules/charities/pool-distribution.service.js";
import { ensureLibraryIndexes } from "./modules/library/library.service.js";
import { ensureNotificationIndexes } from "./modules/notifications/notifications.service.js";
import { ensurePaymentIndexes } from "./modules/payments/payments.service.js";
import { ensurePlaybackIndexes } from "./modules/playback/playback.service.js";
import { ensureContentEmbeddingIndexes } from "./modules/recommendations/content-embeddings.service.js";
import { ensureSubscriptionIndexes } from "./modules/subscriptions/subscriptions.service.js";
import { logger } from "./utils/logger.js";

// Os índices são preparados antes do `listen` para evitar janelas com constraints ausentes.
await ensureAuthIndexes();
await ensureCatalogIndexes();
await ensureBiblicalPassageIndexes();
await ensureContentEmbeddingIndexes();
await ensureTaxonomyIndexes();
await ensurePlaybackIndexes();
await ensureLibraryIndexes();
await ensureSubscriptionIndexes();
await ensurePaymentIndexes();
await ensureNotificationIndexes();
await ensureCharityApplicationIndexes();
await ensureCharityIndexes();
await ensurePoolDistributionIndexes();
await ensureCharityReportIndexes();

const app = createApp();

app.listen(env.port, () => {
  logger.info("FaithFlix API started", {
    port: env.port,
  });
});
