import { MongoClient } from "mongodb";
import { env } from "./env.js";

let clientPromise;

/**
 * Returns the configured MongoDB database, reusing one client connection.
 *
 * @returns {Promise<import("mongodb").Db>} MongoDB database used by the FaithFlix backend.
 */
export async function getDb() {
    if (!clientPromise) {
        const client = new MongoClient(env.mongoUri);
        clientPromise = client.connect();
    }

    const client = await clientPromise;
    return client.db(env.mongoDbName);
}
