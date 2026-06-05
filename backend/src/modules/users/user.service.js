import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertProfileUpdate, assertRoleUpdate } from "./user.validation.js";
import { assertParentalSettings } from "./user.validation.js";

function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function asUserObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    const error = new Error("Utilizador invalido.");
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(userId);
}

export async function getMyProfile(userId) {
  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: asUserObjectId(userId) });

  if (!user) {
    const error = new Error("Utilizador nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}

export async function updateMyProfile(userId, input) {
  const update = assertProfileUpdate(input);
  const db = await getDb();
  const now = new Date();

  const user = await db.collection("users").findOneAndUpdate(
    { _id: asUserObjectId(userId) },
    { $set: { ...update, updatedAt: now } },
    { returnDocument: "after" },
  );

  if (!user) {
    const error = new Error("Utilizador nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}

export async function listUsers() {
  const db = await getDb();
  const users = await db
    .collection("users")
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return users.map(toPublicUser);
}

export async function updateUserRole(targetUserId, input) {
  const update = assertRoleUpdate(input);
  const db = await getDb();
  const now = new Date();

  const user = await db.collection("users").findOneAndUpdate(
    { _id: asUserObjectId(targetUserId) },
    { $set: { ...update, updatedAt: now } },
    { returnDocument: "after" },
  );

  if (!user) {
    const error = new Error("Utilizador nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}

export async function updateParentalSettings(userId, input) {
  const db = await getDb();
  const user = await db.collection("users").findOneAndUpdate(
    { _id: asUserObjectId(userId) },
    { $set: { ...assertParentalSettings(input), updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!user) {
    const error = new Error("Utilizador nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return toPublicUser(user);
}
