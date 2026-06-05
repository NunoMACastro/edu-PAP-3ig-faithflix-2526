import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { ensureCatalogIndexes } from "./modules/catalog/catalog.service.js";
import { ensurePlaybackIndexes } from "./modules/playback/playback.service.js";
import { ensureLibraryIndexes } from "./modules/library/library.service.js";


const app = createApp();

await ensureCatalogIndexes();
await ensurePlaybackIndexes();
await ensureLibraryIndexes();

app.listen(env.port, () => {
    logger.info("FaithFlix API started", {
        port: env.port,
    });
});
