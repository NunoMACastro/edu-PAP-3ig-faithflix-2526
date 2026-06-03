import { MongoClient } from "mongodb";
import { env } from "./env.js";

let clientPromise;

export async function getDb() {
  if (!clientPromise) {
    const client = new MongoClient(env.mongoUri);
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  return client.db(env.mongoDbName);
}