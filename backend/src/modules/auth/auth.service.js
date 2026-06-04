import { getDb } from "../../config/database.js";
import { hashPassword, verifyPassword } from "./auth.password.js";
import { ensureAuthIndexes } from "./auth.indexes.js";
import { assertValidEmail, assertValidName, assertValidPassword } from "./auth.validation.js";
import { createSession, toPublicUser } from "./session.service.js";
import { createOpaqueToken, hashToken } from "./token.js";

const RESET_TTL_MS = 1000 * 60 * 30;

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function registerUser(input) {
  await ensureAuthIndexes();

  const name = assertValidName(input.name);
  const email = assertValidEmail(input.email);
  const password = assertValidPassword(input.password);
  const db = await getDb();

  try {
    const now = new Date();
    const result = await db.collection("users").insertOne({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "user",
      createdAt: now,
      updatedAt: now,
    });

    const user = { _id: result.insertedId, name, email, role: "user" };
    return { user: toPublicUser(user), token: await createSession(user) };
  } catch (error) {
    if (error.code === 11000) {
      throw httpError("Este email ja esta registado.", 409);
    }
    throw error;
  }
}

export async function loginUser(input) {
  const email = assertValidEmail(input.email);
  const password = String(input.password ?? "");
  const db = await getDb();
  const user = await db.collection("users").findOne({ email });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw httpError("Credenciais invalidas.", 401);
  }

  return { user: toPublicUser(user), token: await createSession(user) };
}

export async function requestPasswordReset(input) {
  const email = assertValidEmail(input.email);
  const db = await getDb();
  const user = await db.collection("users").findOne({ email });
  const response = { message: "Se o email existir, foi criado um pedido de recuperacao." };

  if (!user) return response;

  const resetToken = createOpaqueToken();
  await db.collection("password_reset_tokens").insertOne({
    userId: user._id,
    tokenHash: hashToken(resetToken),
    usedAt: null,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
  });

  return { ...response, resetToken };
}

export async function resetPassword(input) {
  const token = String(input.token ?? "").trim();
  const password = assertValidPassword(input.password);
  const db = await getDb();
  const reset = await db.collection("password_reset_tokens").findOne({
    tokenHash: hashToken(token),
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!reset) {
    throw httpError("Token de recuperacao invalido ou expirado.", 400);
  }

  await db.collection("users").updateOne(
    { _id: reset.userId },
    { $set: { passwordHash: await hashPassword(password), updatedAt: new Date() } },
  );

  await db.collection("password_reset_tokens").updateOne(
    { _id: reset._id },
    { $set: { usedAt: new Date() } },
  );

  return { message: "Password atualizada com sucesso." };
}