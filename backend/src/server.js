import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureAuthIndexes } from "./modules/auth/auth.indexes.js";
import { ensureCatalogIndexes } from "./modules/catalog/catalog.service.js";
import { ensureTaxonomyIndexes } from "./modules/catalog/taxonomy.service.js";
import { ensureLibraryIndexes } from "./modules/library/library.service.js";
import { ensurePlaybackIndexes } from "./modules/playback/playback.service.js";
import { logger } from "./utils/logger.js";
import { ensureRatingIndexes } from "./modules/ratings/ratings.service.js";
import { ensureCommentIndexes } from "./modules/comments/comments.service.js";
import { ensureSearchIndexes } from "./modules/search/search.service.js";


await ensureAuthIndexes();
await ensureCatalogIndexes();
await ensureTaxonomyIndexes();
await ensurePlaybackIndexes();
await ensureLibraryIndexes();
await ensureRatingIndexes();
await ensureCommentIndexes();
await ensureSearchIndexes();

const app = createApp();

app.listen(env.port, () => {
    logger.info("FaithFlix API started", {
        port: env.port,
    });
});
