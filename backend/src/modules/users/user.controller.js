import {
    getMyProfile,
    listUsers,
    updateMyProfile,
    updateParentalSettings,
    updateUserRole,
} from "./user.service.js";

/**
 * Returns the authenticated user's profile.
 *
 * @param {import("express").Request & { user: { id: string } }} req - Current request.
 * @param {import("express").Response} res - HTTP response.
 * @returns {Promise<import("express").Response>} Profile response.
 */
export async function getMe(req, res) {
    return res.status(200).json({ user: await getMyProfile(req.user.id) });
}

/**
 * Updates the authenticated user's editable profile fields.
 *
 * @param {import("express").Request & { user: { id: string } }} req - Current request.
 * @param {import("express").Response} res - HTTP response.
 * @returns {Promise<import("express").Response>} Updated profile response.
 */
export async function patchMe(req, res) {
    return res
        .status(200)
        .json({ user: await updateMyProfile(req.user.id, req.body) });
}

/**
 * Updates the authenticated user's parental settings.
 *
 * @param {import("express").Request & { user: { id: string } }} req - Current request.
 * @param {import("express").Response} res - HTTP response.
 * @returns {Promise<import("express").Response>} Updated profile response.
 */
export async function patchMyParentalSettings(req, res) {
    return res.status(200).json({
        user: await updateParentalSettings(req.user.id, req.body),
    });
}

/**
 * Lists users for admins.
 *
 * @param {import("express").Request} _req - Current request.
 * @param {import("express").Response} res - HTTP response.
 * @returns {Promise<import("express").Response>} User list response.
 */
export async function getUsers(_req, res) {
    return res.status(200).json({ users: await listUsers() });
}

/**
 * Updates one user's role for admins.
 *
 * @param {import("express").Request} req - Current request with target user id.
 * @param {import("express").Response} res - HTTP response.
 * @returns {Promise<import("express").Response>} Updated user response.
 */
export async function patchUserRole(req, res) {
    return res.status(200).json({
        user: await updateUserRole(req.params.id, req.body),
    });
}
