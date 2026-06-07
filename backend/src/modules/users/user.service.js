import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { toPublicUser as toSessionPublicUser } from "../auth/session.service.js";
import {
    assertParentalSettings,
    assertProfileUpdate,
    assertRoleUpdate,
} from "./user.validation.js";

/**
 * Converts an internal user document into a public profile shape.
 *
 * @param {{ _id: import("mongodb").ObjectId, name: string, email: string, role: string, parentalMaxAgeRating?: number, createdAt?: Date, updatedAt?: Date }} user - MongoDB user document.
 * @returns {{ id: string, name: string, email: string, role: string, parentalMaxAgeRating: number, createdAt?: Date, updatedAt?: Date }} Public user profile.
 */
function toPublicUser(user) {
    return {
        ...toSessionPublicUser(user),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

/**
 * Converts a user id into a MongoDB ObjectId.
 *
 * @param {string} userId - User id from params or session.
 * @returns {import("mongodb").ObjectId} MongoDB ObjectId.
 */
function asUserObjectId(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new HttpError(400, "Utilizador invalido.");
    }

    return new ObjectId(userId);
}

/**
 * Gets the authenticated user's profile.
 *
 * @param {string} userId - Authenticated user id.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Public profile.
 */
export async function getMyProfile(userId) {
    const db = await getDb();
    const user = await db
        .collection("users")
        .findOne({ _id: asUserObjectId(userId) });

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    return toPublicUser(user);
}

/**
 * Updates only self-service profile fields.
 *
 * @param {string} userId - Authenticated user id.
 * @param {{ name?: unknown }} input - Profile payload.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Updated public profile.
 */
export async function updateMyProfile(userId, input) {
    const update = assertProfileUpdate(input);
    const db = await getDb();
    const user = await db.collection("users").findOneAndUpdate(
        { _id: asUserObjectId(userId) },
        { $set: { ...update, updatedAt: new Date() } },
        { returnDocument: "after" },
    );

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    return toPublicUser(user);
}

/**
 * Updates the authenticated user's parental limit.
 *
 * @param {string} userId - Authenticated user id.
 * @param {{ parentalMaxAgeRating?: unknown }} input - Parental payload.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Updated public profile.
 */
export async function updateParentalSettings(userId, input) {
    const update = assertParentalSettings(input);
    const db = await getDb();
    const user = await db.collection("users").findOneAndUpdate(
        { _id: asUserObjectId(userId) },
        { $set: { ...update, updatedAt: new Date() } },
        { returnDocument: "after" },
    );

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    return toPublicUser(user);
}

/**
 * Lists users for administrators without internal auth fields.
 *
 * @returns {Promise<Array<ReturnType<typeof toPublicUser>>>} Public user list.
 */
export async function listUsers() {
    const db = await getDb();
    const users = await db
        .collection("users")
        .find({}, { projection: { passwordHash: 0 } })
        .sort({ createdAt: -1 })
        .toArray();

    return users.map(toPublicUser);
}

/**
 * Updates one user's role.
 *
 * @param {string} targetUserId - Target user id.
 * @param {{ role?: unknown }} input - Role payload.
 * @returns {Promise<ReturnType<typeof toPublicUser>>} Updated public user.
 */
export async function updateUserRole(targetUserId, input) {
    const update = assertRoleUpdate(input);
    const db = await getDb();
    const user = await db.collection("users").findOneAndUpdate(
        { _id: asUserObjectId(targetUserId) },
        { $set: { ...update, updatedAt: new Date() } },
        { returnDocument: "after" },
    );

    if (!user) {
        throw new HttpError(404, "Utilizador nao encontrado.");
    }

    return toPublicUser(user);
}
