import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { ensureAuthIndexes } from "./auth.indexes.js";
import { createOpaqueToken, hashToken, isOpaqueToken } from "./token.js";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

/**
 * Converts an internal user document into the public session shape.
 *
 * @param {{ _id: import("mongodb").ObjectId, name: string, email: string, role: string, parentalMaxAgeRating?: number }} user - MongoDB user document.
 * @returns {{ id: string, name: string, email: string, role: string, parentalMaxAgeRating: number }} Public user data.
 */
export function toPublicUser(user) {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        parentalMaxAgeRating: Number.isInteger(user.parentalMaxAgeRating)
            ? user.parentalMaxAgeRating
            : 18,
    };
}

/**
 * Creates a server-side session and returns the opaque cookie token.
 *
 * @param {{ _id: import("mongodb").ObjectId }} user - User document receiving the new session.
 * @returns {Promise<string>} Opaque session token to store in the HttpOnly cookie.
 */
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

/**
 * Resolves a session token into the authenticated public user.
 *
 * @param {string | undefined} sessionToken - Token read from the session cookie.
 * @returns {Promise<null | { token: string, user: ReturnType<typeof toPublicUser> }>} Resolved session or null.
 */
export async function resolveSession(sessionToken) {
    if (!sessionToken || !isOpaqueToken(sessionToken)) {
        return null;
    }

    const db = await getDb();
    const session = await db.collection("sessions").findOne({
        tokenHash: hashToken(sessionToken),
        expiresAt: { $gt: new Date() },
    });

    if (!session) {
        return null;
    }

    const userId =
        session.userId instanceof ObjectId
            ? session.userId
            : new ObjectId(session.userId);
    const user = await db.collection("users").findOne({ _id: userId });

    if (!user) {
        return null;
    }

    return { token: sessionToken, user: toPublicUser(user) };
}

/**
 * Deletes one server-side session by cookie token.
 *
 * @param {string | undefined} sessionToken - Token read from the current request.
 * @returns {Promise<void>} Resolves after the session is deleted or ignored.
 */
export async function deleteSession(sessionToken) {
    if (!sessionToken || !isOpaqueToken(sessionToken)) {
        return;
    }

    const db = await getDb();
    await db
        .collection("sessions")
        .deleteOne({ tokenHash: hashToken(sessionToken) });
}
