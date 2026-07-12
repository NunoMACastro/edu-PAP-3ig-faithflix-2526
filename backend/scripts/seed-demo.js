/**
 * @file Orquestrador dos seeds de demonstracao FaithFlix.
 */

import { generateContentEmbeddings } from "../src/modules/recommendations/content-embeddings.service.js";
import {
    DEMO_FIXTURE,
    demoContentIdList,
    getDemoDb,
    runSeedCli,
} from "./demo-seed-utils.js";
import { seedDemoBiblical } from "./seed-demo-biblical.js";
import { seedDemoCatalog } from "./seed-demo-catalog.js";
import { seedDemoCharities } from "./seed-demo-charities.js";
import { seedDemoEngagement } from "./seed-demo-engagement.js";
import { seedDemoOps } from "./seed-demo-ops.js";
import { seedDemoSubscriptions } from "./seed-demo-subscriptions.js";
import { seedDemoUsers } from "./seed-demo-users.js";

/**
 * Executa todos os seeds de demo pela ordem necessaria para manter referencias.
 *
 * @returns {Promise<object>} Resumo consolidado.
 */
export async function seedDemo() {
    const users = await seedDemoUsers();
    const catalog = await seedDemoCatalog();
    const subscriptions = await seedDemoSubscriptions();
    const charities = await seedDemoCharities();
    const engagement = await seedDemoEngagement();
    const biblical = await seedDemoBiblical();
    const ops = await seedDemoOps();
    const embeddings = await generateContentEmbeddings();
    const db = await getDemoDb();

    await db.collection("content_embeddings").updateMany(
        { contentId: { $in: demoContentIdList } },
        { $set: { demoFixture: DEMO_FIXTURE } },
    );

    const demoEmbeddings = await db.collection("content_embeddings").countDocuments({
        contentId: { $in: demoContentIdList },
        demoFixture: DEMO_FIXTURE,
    });

    return {
        users,
        catalog,
        subscriptions,
        charities,
        engagement,
        biblical,
        ops,
        embeddings: {
            ...embeddings,
            demoTagged: demoEmbeddings,
        },
    };
}

await runSeedCli(import.meta.url, seedDemo, "Seed demo");
