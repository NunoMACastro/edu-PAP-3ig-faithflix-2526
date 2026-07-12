/**
 * @file Emissão e validação de tokens CSRF associados à sessão opaca.
 */

import { timingSafeEqual } from "node:crypto";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { createOpaqueToken, hashToken, isOpaqueToken } from "./token.js";

/**
 * Roda o token CSRF da sessão autenticada.
 *
 * @param {string | undefined} sessionToken Token do cookie HttpOnly.
 * @returns {Promise<string>} Token bruto entregue apenas ao cliente atual.
 */
export async function rotateCsrfToken(sessionToken) {
    if (!sessionToken || !isOpaqueToken(sessionToken)) {
        throw new HttpError(
            401,
            "Autenticacao obrigatoria.",
            undefined,
            "AUTH_REQUIRED",
        );
    }

    const csrfToken = createOpaqueToken();
    const csrfTokenHash = hashToken(csrfToken);
    const now = new Date();
    const db = await getDb();
    const result = await db.collection("sessions").updateOne(
        {
            tokenHash: hashToken(sessionToken),
            expiresAt: { $gt: new Date() },
        },
        {
            $set: { csrfTokenHash, csrfRotatedAt: now },
            $push: {
                csrfTokenHashes: {
                    $each: [{ hash: csrfTokenHash, createdAt: now }],
                    $slice: -4,
                },
            },
        },
    );

    if (result.modifiedCount !== 1) {
        throw new HttpError(
            401,
            "Autenticacao obrigatoria.",
            undefined,
            "AUTH_REQUIRED",
        );
    }

    return csrfToken;
}

/**
 * Confirma que o token recebido pertence à sessão atual.
 *
 * @param {string | undefined} sessionToken Token de sessão.
 * @param {unknown} csrfToken Token recebido no header.
 * @returns {Promise<boolean>} Resultado em tempo constante para hashes válidos.
 */
export async function verifyCsrfToken(sessionToken, csrfToken) {
    if (
        !sessionToken ||
        !isOpaqueToken(sessionToken) ||
        !isOpaqueToken(csrfToken)
    ) {
        return false;
    }

    const db = await getDb();
    const session = await db.collection("sessions").findOne({
        tokenHash: hashToken(sessionToken),
        expiresAt: { $gt: new Date() },
    });

    const acceptedHashes = [
        session?.csrfTokenHash,
        ...(Array.isArray(session?.csrfTokenHashes)
            ? session.csrfTokenHashes.map((entry) => entry?.hash ?? entry)
            : []),
    ].filter((value) => typeof value === "string" && value.length === 64);

    if (acceptedHashes.length === 0) {
        return false;
    }

    const received = Buffer.from(hashToken(csrfToken), "hex");
    return acceptedHashes.some((hash) => {
        const expected = Buffer.from(hash, "hex");
        return (
            expected.length === received.length &&
            timingSafeEqual(expected, received)
        );
    });
}
