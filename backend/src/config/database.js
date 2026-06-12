import { MongoClient } from "mongodb";
import { env } from "./env.js";

let clientPromise;
let testDb;

/**
 * Returns the configured MongoDB database, reusing one client connection.
 *
 * @returns {Promise<import("mongodb").Db>} MongoDB database used by the FaithFlix backend.
 */
export async function getDb() {
    if (testDb) {
        return testDb;
    }

    if (!clientPromise) {
        const client = new MongoClient(env.mongoUri);
        clientPromise = client.connect();
    }

    const client = await clientPromise;
    return client.db(env.mongoDbName);
}

/**
 * Replaces the database used by services during node:test suites.
 *
 * @param {import("mongodb").Db | null} db - Test double, or null to restore MongoDB.
 * @returns {void}
 */
export function setDbForTests(db) {
    testDb = db;
}
