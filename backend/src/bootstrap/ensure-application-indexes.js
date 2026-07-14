/**
 * @file Preparação centralizada dos índices persistentes FaithFlix.
 *
 * O servidor e o seed integral de demonstração usam a mesma lista para evitar
 * que uma base acabada de recriar arranque sem constraints de domínio.
 */

import { ensureRateLimitIndexes } from "../middlewares/rate-limit.middleware.js";
import { ensureAnonymousMetricIndexes } from "../modules/analytics/analytics.service.js";
import { ensureAuditIndexes } from "../modules/audit/audit.service.js";
import { ensureAuthIndexes } from "../modules/auth/auth.indexes.js";
import { ensureBiblicalPassageIndexes } from "../modules/biblical-passages/biblical-passages.service.js";
import { ensureCatalogIndexes } from "../modules/catalog/catalog.service.js";
import { ensureTaxonomyIndexes } from "../modules/catalog/taxonomy.service.js";
import { ensureCharityApplicationIndexes } from "../modules/charities/charity-applications.service.js";
import { ensureCharityReportIndexes } from "../modules/charities/charity-reports.service.js";
import { ensureCharityIndexes } from "../modules/charities/charity-review.service.js";
import { ensurePoolDistributionIndexes } from "../modules/charities/pool-distribution.service.js";
import { ensureCommentIndexes } from "../modules/comments/comments.service.js";
import { ensureScheduledJobIndexes } from "../modules/jobs/scheduled-jobs.service.js";
import { ensureLibraryIndexes } from "../modules/library/library.service.js";
import { ensureNotificationIndexes } from "../modules/notifications/notifications.service.js";
import { ensurePaymentIndexes } from "../modules/payments/payments.service.js";
import { ensurePlaybackIndexes } from "../modules/playback/playback.service.js";
import { ensurePrivacyIndexes } from "../modules/privacy/privacy.service.js";
import { ensureRatingIndexes } from "../modules/ratings/ratings.service.js";
import { ensureContentEmbeddingIndexes } from "../modules/recommendations/content-embeddings.service.js";
import { ensureSubscriptionIndexes } from "../modules/subscriptions/subscriptions.service.js";
import { ensureIntegrationIndexes } from "../modules/integrations/integrations.indexes.js";
import { ensureMediaAssetIndexes } from "../modules/media/media-assets.service.js";

/**
 * Cria todos os índices usados pela aplicação e pelos datasets de demo.
 *
 * @returns {Promise<void>} Termina quando todas as constraints existem.
 */
export async function ensureApplicationIndexes() {
    await ensureAuthIndexes();
    await ensureAuditIndexes();
    await ensureRateLimitIndexes();
    await ensureIntegrationIndexes();
    await ensureCatalogIndexes();
    await ensureMediaAssetIndexes();
    await ensureBiblicalPassageIndexes();
    await ensureContentEmbeddingIndexes();
    await ensureTaxonomyIndexes();
    await ensurePlaybackIndexes();
    await ensureLibraryIndexes();
    await ensureCommentIndexes();
    await ensureRatingIndexes();
    await ensureScheduledJobIndexes();
    await ensureSubscriptionIndexes();
    await ensurePaymentIndexes();
    await ensureNotificationIndexes();
    await ensurePrivacyIndexes();
    await ensureAnonymousMetricIndexes();
    await ensureCharityApplicationIndexes();
    await ensureCharityIndexes();
    await ensurePoolDistributionIndexes();
    await ensureCharityReportIndexes();
}
