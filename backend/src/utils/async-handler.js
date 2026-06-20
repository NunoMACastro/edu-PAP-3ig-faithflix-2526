/**
 * @file Ficheiro `real_dev/backend/src/utils/async-handler.js` da implementação real_dev.
 */

/**
 * Envolve um controlador Express assíncrono e encaminha promises rejeitadas para o middleware de erro.
 *
 * @param {import("express").RequestGestor} controlador - Gestor assíncrono de rota.
 * @returns {import("express").RequestGestor} Gestor Express com encaminhamento centralizado de erros.
 */
export function asyncHandler(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}
