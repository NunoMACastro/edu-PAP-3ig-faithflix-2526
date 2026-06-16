import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureAuthIndexes } from "./modules/auth/auth.indexes.js";
import { ensureCatalogIndexes } from "./modules/catalog/catalog.service.js";
import { ensureTaxonomyIndexes } from "./modules/catalog/taxonomy.service.js";
import { ensureLibraryIndexes } from "./modules/library/library.service.js";
import { ensurePlaybackIndexes } from "./modules/playback/playback.service.js";
import { logger } from "./utils/logger.js";
import { ensureSubscriptionIndexes } from "./modules/subscriptions/subscriptions.service.js";
import { ensurePaymentIndexes } from "./modules/payments/payments.service.js";
import { ensureNotificationIndexes } from "./modules/notifications/notifications.service.js";
import { ensureCharityIndexes } from "./modules/charities/charity-review.service.js";
import { ensurePoolDistributionIndexes } from "./modules/charities/pool-distribution.service.js";
import { ensureCharityReportIndexes } from "./modules/charities/charity-reports.service.js";


await ensureAuthIndexes();
await ensureCatalogIndexes();
await ensureTaxonomyIndexes();
await ensurePlaybackIndexes();
await ensureLibraryIndexes();
await ensureSubscriptionIndexes();
await ensurePaymentIndexes();
await ensureNotificationIndexes();
await ensureCharityIndexes();
await ensurePoolDistributionIndexes();
await ensureCharityReportIndexes();


const app = createApp();

app.listen(env.port, () => {
    logger.info("FaithFlix API started", {
        port: env.port,
    });
});