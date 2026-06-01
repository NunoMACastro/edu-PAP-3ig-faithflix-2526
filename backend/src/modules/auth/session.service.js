/**
 * Resolves a session token into a user object.
 *
 * @param {string | undefined} sessionToken - Token read from the session cookie.
 * @returns {Promise<null>} Always returns `null` in MF1 because real login is not in scope yet.
 */
export async function resolveSession(sessionToken) {
    // This explicit branch documents the future extension point for BK-MF2-01.
    if (!sessionToken) {
        return null;
    }

    // Security rule for MF1: a random or fake cookie must never authenticate.
    return null;
}
