import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { ensureCatalogIndexes } from "./modules/catalog/catalog.service.js";

const app = createApp();

await ensureCatalogIndexes();

app.listen(env.port, () => {
    logger.info("FaithFlix API started", {
        port: env.port,
    });
});
