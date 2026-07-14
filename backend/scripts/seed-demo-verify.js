/** @file CLI read-only de verificação do dataset FaithFlix demo-v2. */

import { MongoClient } from "mongodb";
import { verifyDemoDataset } from "./demo-seed-verifier.js";
import { assertDemoVerifyEnvironment } from "./seed-safety.js";

const config = assertDemoVerifyEnvironment();
const client = new MongoClient(config.mongoUri);

try {
    await client.connect();
    const summary = await verifyDemoDataset(client.db(config.mongoDbName));
    console.log(`Demo verify concluído: ${JSON.stringify(summary)}`);
} catch (error) {
    let safeMessage = String(error.message)
        .replace(/mongodb(?:\+srv)?:\/\/\S+/giu, "[MONGODB_URI_REDACTED]");
    const parsed = new URL(config.mongoUri);
    for (const secret of [
        config.mongoUri,
        decodeURIComponent(parsed.username),
        decodeURIComponent(parsed.password),
    ]) {
        if (secret) safeMessage = safeMessage.replaceAll(secret, "[SECRET_REDACTED]");
    }
    console.error(`Demo verify falhou: ${safeMessage}`);
    process.exitCode = 1;
} finally {
    await client.close();
}
