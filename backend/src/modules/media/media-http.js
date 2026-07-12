/**
 * @file Semântica HTTP para entrega privada de ficheiros MP4 com byte ranges.
 */

import { HttpError } from "../../utils/http-error.js";

/**
 * Cria um erro 416 que transporta apenas o tamanho necessário ao header
 * `Content-Range`, sem expor qualquer detalhe de storage.
 *
 * @param {number} sizeBytes Tamanho total do ficheiro.
 * @returns {HttpError & { contentRange: string }} Erro HTTP Range.
 */
function rangeNotSatisfiable(sizeBytes) {
    const error = new HttpError(
        416,
        "Intervalo de media invalido.",
        undefined,
        "MEDIA_RANGE_INVALID",
    );
    error.contentRange = `bytes */${sizeBytes}`;
    return error;
}

/**
 * Resolve um único byte range segundo RFC 9110.
 *
 * Múltiplos ranges não são aceites nesta baseline MP4 progressive. Um limite
 * final acima do tamanho é truncado; início fora do ficheiro produz 416.
 *
 * @param {unknown} headerValue Valor do header `Range`.
 * @param {number} sizeBytes Tamanho total do ficheiro.
 * @returns {{ statusCode: 200 | 206, start: number, end: number, length: number, contentRange: string | null }} Intervalo normalizado.
 */
export function resolveMediaByteRange(headerValue, sizeBytes) {
    if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1) {
        throw new HttpError(
            409,
            "Asset de media indisponivel.",
            undefined,
            "MEDIA_ASSET_NOT_READY",
        );
    }

    if (headerValue === undefined) {
        return {
            statusCode: 200,
            start: 0,
            end: sizeBytes - 1,
            length: sizeBytes,
            contentRange: null,
        };
    }

    if (typeof headerValue !== "string") {
        throw rangeNotSatisfiable(sizeBytes);
    }

    const match = /^bytes=(\d*)-(\d*)$/i.exec(headerValue.trim());
    if (!match || (!match[1] && !match[2])) {
        throw rangeNotSatisfiable(sizeBytes);
    }

    let start;
    let end;
    if (!match[1]) {
        const suffixLength = Number(match[2]);
        if (!Number.isSafeInteger(suffixLength) || suffixLength < 1) {
            throw rangeNotSatisfiable(sizeBytes);
        }
        start = Math.max(sizeBytes - suffixLength, 0);
        end = sizeBytes - 1;
    } else {
        start = Number(match[1]);
        end = match[2] ? Number(match[2]) : sizeBytes - 1;

        if (
            !Number.isSafeInteger(start) ||
            !Number.isSafeInteger(end) ||
            start >= sizeBytes ||
            start > end
        ) {
            throw rangeNotSatisfiable(sizeBytes);
        }
        end = Math.min(end, sizeBytes - 1);
    }

    return {
        statusCode: 206,
        start,
        end,
        length: end - start + 1,
        contentRange: `bytes ${start}-${end}/${sizeBytes}`,
    };
}
