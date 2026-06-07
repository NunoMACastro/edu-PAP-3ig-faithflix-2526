/**
 * Wraps an async Express handler and forwards rejected promises to error middleware.
 *
 * @param {import("express").RequestHandler} handler - Async route handler.
 * @returns {import("express").RequestHandler} Express handler with centralized error forwarding.
 */
export function asyncHandler(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}
