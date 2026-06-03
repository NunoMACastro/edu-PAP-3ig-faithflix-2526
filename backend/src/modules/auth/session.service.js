import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { ensureAuthIndexes } from "./auth.indexes.js";
import { createOpaqueToken, hashToken } from "./token.js";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function createSession(user) {
  await ensureAuthIndexes();

  const db = await getDb();
  const token = createOpaqueToken();
  const now = new Date();

  await db.collection("sessions").insertOne({
    userId: user._id,
    tokenHash: hashToken(token),
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
  });

  return token;
}

export async function resolveSession(token) {
  if (!token) return null;

  const db = await getDb();
  const session = await db.collection("sessions").findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });

  if (!session) return null;

  const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
  if (!user) return null;

  return { token, user: toPublicUser(user) };
}

export async function deleteSession(token) {
  if (!token) return;

  const db = await getDb();
  await db.collection("sessions").deleteOne({ tokenHash: hashToken(token) });
}