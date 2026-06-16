/**
 * @file Ficheiro `real_dev/backend/src/config/database.js` da implementação real_dev.
 */

import { MongoClient } from "mongodb";
import { env } from "./env.js";

let clientPromise;
let testDb;

/**
 * Devolve a base de dados MongoDB configurada, reutilizando uma ligação de cliente.
 *
 * @returns {Promise<import("mongodb").Db>} Base de dados MongoDB usada pelo backend FaithFlix.
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
 * Substitui a base de dados usada pelos serviços durante suites node:test.
 *
 * @param {import("mongodb").Db | null} db - Duplo de teste, ou null para restaurar MongoDB.
 * @returns {void}
 */
export function setDbForTests(db) {
    testDb = db;
}
