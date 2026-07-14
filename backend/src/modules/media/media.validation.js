/**
 * @file Validação fechada dos pedidos de ingestão local de media.
 *
 * A API aceita exclusivamente MP4 progressive. Nomes de ficheiro, paths e
 * storage keys nunca fazem parte do input público: esses valores são gerados
 * internamente pela camada de armazenamento.
 */

import { HttpError } from "../../utils/http-error.js";

export const MEDIA_MP4_MIME_TYPE = "video/mp4";
export const MAX_MEDIA_UPLOAD_BYTES = 512 * 1024 * 1024;
export const MEDIA_ASSET_QUALITIES = Object.freeze([
    "480p",
    "720p",
    "1080p",
    "2160p",
    "4k",
]);

const MEDIA_ASSET_QUALITY_SET = new Set(MEDIA_ASSET_QUALITIES);
const CREATE_FIELDS = new Set([
    "quality",
    "mimeType",
    "expectedSizeBytes",
    "expectedSha256",
]);
const ACTIVATE_FIELDS = new Set(["expectedVersion"]);

/**
 * Cria o erro público estável usado para payloads de upload inválidos.
 *
 * @param {string} message Mensagem segura para o cliente administrativo.
 * @param {string} [code="MEDIA_UPLOAD_INVALID"] Código de domínio.
 * @returns {HttpError} Erro HTTP normalizado.
 */
function invalidUpload(message, code = "MEDIA_UPLOAD_INVALID") {
    return new HttpError(400, message, undefined, code);
}

/**
 * Exige um objeto JSON simples, sem arrays nem valores nulos.
 *
 * @param {unknown} input Valor recebido.
 * @returns {Record<string, unknown>} Objeto validado.
 */
function plainInput(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw invalidUpload("Payload de media invalido.");
    }

    return input;
}

/**
 * Rejeita campos não documentados para impedir configuração implícita de
 * paths, URLs ou metadata privada.
 *
 * @param {Record<string, unknown>} input Payload validado.
 * @param {Set<string>} allowedFields Allowlist da operação.
 * @returns {void}
 */
function assertAllowedFields(input, allowedFields) {
    const unknownFields = Object.keys(input).filter(
        (field) => !allowedFields.has(field),
    );

    if (unknownFields.length > 0) {
        throw invalidUpload("Payload de media contem campos desconhecidos.");
    }
}

/**
 * Valida a criação de uma sessão de upload MP4.
 *
 * `expectedSizeBytes` e `expectedSha256` são opcionais, mas, quando presentes,
 * tornam-se constraints obrigatórias no fim do stream.
 *
 * @param {unknown} input Corpo JSON do pedido.
 * @returns {{ quality: string, mimeType: "video/mp4", expectedSizeBytes: number | null, expectedSha256: string | null }} Payload canónico.
 */
export function assertCreateMediaUploadPayload(input) {
    const payload = plainInput(input);
    assertAllowedFields(payload, CREATE_FIELDS);

    const quality =
        typeof payload.quality === "string"
            ? payload.quality.trim().toLowerCase()
            : "";
    if (!MEDIA_ASSET_QUALITY_SET.has(quality)) {
        throw invalidUpload("Qualidade de media invalida.");
    }

    const mimeType =
        payload.mimeType === undefined
            ? MEDIA_MP4_MIME_TYPE
            : typeof payload.mimeType === "string"
              ? payload.mimeType.trim().toLowerCase()
              : "";
    if (mimeType !== MEDIA_MP4_MIME_TYPE) {
        throw invalidUpload("Apenas ficheiros MP4 progressive sao suportados.");
    }

    let expectedSizeBytes = null;
    if (payload.expectedSizeBytes !== undefined) {
        if (
            typeof payload.expectedSizeBytes !== "number" ||
            !Number.isSafeInteger(payload.expectedSizeBytes) ||
            payload.expectedSizeBytes < 1 ||
            payload.expectedSizeBytes > MAX_MEDIA_UPLOAD_BYTES
        ) {
            throw invalidUpload(
                "expectedSizeBytes deve ser um inteiro entre 1 e 536870912.",
            );
        }
        expectedSizeBytes = payload.expectedSizeBytes;
    }

    let expectedSha256 = null;
    if (payload.expectedSha256 !== undefined) {
        expectedSha256 =
            typeof payload.expectedSha256 === "string"
                ? payload.expectedSha256.trim().toLowerCase()
                : "";
        if (!/^[a-f0-9]{64}$/.test(expectedSha256)) {
            throw invalidUpload("expectedSha256 deve ser um SHA-256 hexadecimal.");
        }
    }

    return {
        quality,
        mimeType: MEDIA_MP4_MIME_TYPE,
        expectedSizeBytes,
        expectedSha256,
    };
}

/**
 * Valida o compare-and-swap usado ao ativar um ficheiro já ingerido.
 *
 * @param {unknown} input Corpo JSON do pedido de ativação.
 * @returns {{ expectedVersion: number }} Versão editorial positiva.
 */
export function assertActivateMediaUploadPayload(input) {
    const payload = plainInput(input);
    assertAllowedFields(payload, ACTIVATE_FIELDS);

    if (
        typeof payload.expectedVersion !== "number" ||
        !Number.isSafeInteger(payload.expectedVersion) ||
        payload.expectedVersion < 1
    ) {
        throw invalidUpload(
            "expectedVersion deve ser um inteiro positivo.",
            "EXPECTED_VERSION_REQUIRED",
        );
    }

    return { expectedVersion: payload.expectedVersion };
}

/**
 * Valida os headers do `PUT` que transporta o corpo binário sem multipart.
 *
 * `Content-Length` é opcional para permitir streaming chunked, mas, quando é
 * enviado, é verificado antes de abrir qualquer ficheiro.
 *
 * @param {Record<string, unknown>} headers Headers HTTP normalizados pelo Node.
 * @param {{ expectedSizeBytes?: number | null }} asset Sessão de upload.
 * @param {number} [maxBytes=MAX_MEDIA_UPLOAD_BYTES] Limite efetivo do processo.
 * @returns {{ contentLength: number | null }} Metadata validada.
 */
export function assertMediaUploadHeaders(
    headers,
    asset,
    maxBytes = MAX_MEDIA_UPLOAD_BYTES,
) {
    const rawContentType = headers?.["content-type"];
    const contentType =
        typeof rawContentType === "string"
            ? rawContentType.split(";", 1)[0].trim().toLowerCase()
            : "";

    if (contentType !== MEDIA_MP4_MIME_TYPE) {
        throw new HttpError(
            415,
            "O upload deve usar Content-Type video/mp4.",
            undefined,
            "MEDIA_UPLOAD_INVALID",
        );
    }

    const rawLength = headers?.["content-length"];
    if (rawLength === undefined) {
        return { contentLength: null };
    }

    if (typeof rawLength !== "string" || !/^\d+$/.test(rawLength)) {
        throw invalidUpload("Content-Length invalido.");
    }

    const contentLength = Number(rawLength);
    if (
        !Number.isSafeInteger(contentLength) ||
        contentLength < 1 ||
        contentLength > maxBytes
    ) {
        throw new HttpError(
            contentLength > maxBytes ? 413 : 400,
            contentLength > maxBytes
                ? "O ficheiro excede o limite maximo permitido."
                : "Content-Length invalido.",
            undefined,
            contentLength > maxBytes
                ? "MEDIA_UPLOAD_TOO_LARGE"
                : "MEDIA_UPLOAD_INVALID",
        );
    }

    if (
        Number.isSafeInteger(asset?.expectedSizeBytes) &&
        asset.expectedSizeBytes !== contentLength
    ) {
        throw invalidUpload(
            "Content-Length nao corresponde ao tamanho esperado do upload.",
        );
    }

    return { contentLength };
}
