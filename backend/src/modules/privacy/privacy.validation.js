// apps/backend/src/modules/privacy/privacy.validation.js
import { HttpError } from "../../utils/http-error.js";

export const DELETE_ACCOUNT_CONFIRMATION = "ELIMINAR CONTA";

/**
 * Valida o pedido de eliminação da própria conta.
 *
 * @param {{ confirmation?: unknown }} input Dados recebidos do frontend.
 * @returns {{ confirmation: string }} Dados normalizados para o service.
 * @throws {HttpError} Quando a confirmação não corresponde ao contrato.
 */
export function assertDeleteAccountPayload(input) {
    const confirmation = String(input?.confirmation ?? "").trim();

    if (confirmation !== DELETE_ACCOUNT_CONFIRMATION) {
        throw new HttpError(
            400,
            "Escreve ELIMINAR CONTA para confirmar a eliminação.",
        );
    }

    return { confirmation };
}