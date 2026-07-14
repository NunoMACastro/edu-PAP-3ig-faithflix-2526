/**
 * @file Armazenamento local privado para MP4 progressive.
 *
 * Os nomes são aleatórios e opacos. O stream é escrito num `.partial` com
 * criação exclusiva; apenas um ficheiro completamente validado é renomeado para
 * a localização final que pode ser aberta pela rota autenticada.
 */

import { createHash, randomBytes } from "node:crypto";
import { constants as fsConstants, createWriteStream } from "node:fs";
import {
    chmod,
    lstat,
    mkdir,
    open,
    realpath,
    rename,
    rm,
} from "node:fs/promises";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import {
    basename,
    dirname,
    isAbsolute,
    relative,
    resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import { HttpError } from "../../utils/http-error.js";
import {
    MAX_MEDIA_UPLOAD_BYTES,
    MEDIA_MP4_MIME_TYPE,
} from "./media.validation.js";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = resolve(MODULE_DIR, "../../..");
const DEFAULT_MEDIA_STORAGE_ROOT = resolve(BACKEND_ROOT, ".local-media");
const FRONTEND_PUBLIC_ROOT = resolve(BACKEND_ROOT, "../frontend/public");
const STORAGE_KEY_PATTERN = /^[a-f0-9]{64}\.mp4$/;
const MP4_HEADER_BYTES = 12;

/**
 * Confirma se `candidate` está dentro de `parent` sem usar comparação textual
 * vulnerável a prefixos comuns (`public` vs `public-backup`).
 *
 * @param {string} parent Diretório pai absoluto.
 * @param {string} candidate Diretório candidato absoluto.
 * @returns {boolean} Verdadeiro quando o candidato é o próprio pai ou descendente.
 */
function pathIsInside(parent, candidate) {
    const pathFromParent = relative(parent, candidate);
    return (
        pathFromParent === "" ||
        (!pathFromParent.startsWith("..") && !isAbsolute(pathFromParent))
    );
}

/**
 * Cria um erro de configuração sem incluir paths potencialmente sensíveis.
 *
 * @param {string} message Diagnóstico sanitizado.
 * @returns {Error & { code: string }} Erro estável de arranque/storage.
 */
function storageConfigurationError(message) {
    const error = new Error(message);
    error.code = "MEDIA_STORAGE_CONFIGURATION_INVALID";
    return error;
}

/**
 * Resolve o path que um diretório ainda inexistente terá, seguindo apenas o
 * ancestral já presente. Isto deteta aliases intermédios antes de `mkdir` poder
 * criar qualquer entrada dentro do respetivo destino real.
 *
 * @param {string} targetPath Path absoluto pretendido.
 * @returns {Promise<string>} Path real ou prospetivo absoluto.
 */
async function prospectiveRealPath(targetPath) {
    let candidate = targetPath;
    const missingSegments = [];

    while (true) {
        try {
            const existingRealPath = await realpath(candidate);
            return resolve(existingRealPath, ...missingSegments);
        } catch (error) {
            if (error?.code !== "ENOENT") {
                throw storageConfigurationError(
                    "MEDIA_STORAGE_ROOT nao pode ser resolvida em seguranca.",
                );
            }

            const parent = dirname(candidate);
            if (parent === candidate) {
                throw storageConfigurationError(
                    "MEDIA_STORAGE_ROOT nao pode ser resolvida em seguranca.",
                );
            }
            missingSegments.unshift(basename(candidate));
            candidate = parent;
        }
    }
}

/**
 * Constrói configuração segura e testável para o storage local.
 *
 * O limite pode ser reduzido por ambiente, mas nunca aumentado além dos
 * 512 MiB definidos para a demonstração.
 *
 * @param {Record<string, unknown>} [source=process.env] Variáveis de ambiente.
 * @returns {{ root: string, maxUploadBytes: number }} Configuração canónica.
 */
export function buildMediaStorageConfig(source = process.env) {
    const configuredRoot = source.MEDIA_STORAGE_ROOT;
    if (
        configuredRoot !== undefined &&
        (typeof configuredRoot !== "string" || configuredRoot.trim() === "")
    ) {
        throw storageConfigurationError("MEDIA_STORAGE_ROOT invalida.");
    }

    const root = configuredRoot
        ? resolve(BACKEND_ROOT, configuredRoot.trim())
        : DEFAULT_MEDIA_STORAGE_ROOT;
    if (pathIsInside(FRONTEND_PUBLIC_ROOT, root)) {
        throw storageConfigurationError(
            "MEDIA_STORAGE_ROOT nao pode estar dentro de frontend/public.",
        );
    }

    const rawLimit = source.MEDIA_UPLOAD_MAX_BYTES;
    let maxUploadBytes = MAX_MEDIA_UPLOAD_BYTES;
    if (rawLimit !== undefined && rawLimit !== "") {
        if (typeof rawLimit !== "string" || !/^\d+$/.test(rawLimit)) {
            throw storageConfigurationError(
                "MEDIA_UPLOAD_MAX_BYTES invalida.",
            );
        }

        maxUploadBytes = Number(rawLimit);
        if (
            !Number.isSafeInteger(maxUploadBytes) ||
            maxUploadBytes < 1 ||
            maxUploadBytes > MAX_MEDIA_UPLOAD_BYTES
        ) {
            throw storageConfigurationError(
                "MEDIA_UPLOAD_MAX_BYTES invalida.",
            );
        }
    }

    return { root, maxUploadBytes };
}

export const mediaStorageConfig = buildMediaStorageConfig();

/**
 * Gera uma chave sem semântica externa e com entropia suficiente para impedir
 * enumeração ou colisões práticas.
 *
 * @returns {string} Chave hexadecimal opaca com extensão interna fixa.
 */
export function createOpaqueMediaStorageKey() {
    return `${randomBytes(32).toString("hex")}.mp4`;
}

/**
 * Valida uma storage key já persistida. Nunca aceita nomes vindos de params ou
 * do corpo do pedido.
 *
 * @param {unknown} storageKey Chave interna do documento MongoDB.
 * @returns {string} Chave validada.
 */
function assertStorageKey(storageKey) {
    if (typeof storageKey !== "string" || !STORAGE_KEY_PATTERN.test(storageKey)) {
        const error = new Error("Storage key de media invalida.");
        error.code = "MEDIA_STORAGE_KEY_INVALID";
        throw error;
    }

    return storageKey;
}

/**
 * Deriva os únicos dois paths permitidos para uma chave interna.
 *
 * @param {unknown} storageKey Chave persistida.
 * @param {string} [root=mediaStorageConfig.root] Raiz configurada.
 * @returns {{ finalPath: string, partialPath: string }} Paths privados.
 */
export function mediaStoragePaths(
    storageKey,
    root = mediaStorageConfig.root,
) {
    const key = assertStorageKey(storageKey);
    return {
        finalPath: resolve(root, key),
        partialPath: resolve(root, `${key}.partial`),
    };
}

/**
 * Cria a raiz com permissões privadas. `chmod` corrige diretórios preexistentes
 * criados pela própria demo com umask mais permissiva.
 *
 * @param {string} [root=mediaStorageConfig.root] Raiz de storage.
 * @returns {Promise<void>} Termina quando a raiz está pronta.
 */
export async function ensureMediaStorageRoot(root = mediaStorageConfig.root) {
    let existingStats = null;
    try {
        existingStats = await lstat(root);
    } catch (error) {
        if (error?.code !== "ENOENT") {
            throw storageConfigurationError(
                "MEDIA_STORAGE_ROOT nao pode ser inspecionada em seguranca.",
            );
        }
    }

    if (
        existingStats &&
        (existingStats.isSymbolicLink() || !existingStats.isDirectory())
    ) {
        throw storageConfigurationError(
            "MEDIA_STORAGE_ROOT deve ser um diretorio real.",
        );
    }

    let publicRealPath;
    try {
        publicRealPath = await realpath(FRONTEND_PUBLIC_ROOT);
    } catch {
        publicRealPath = FRONTEND_PUBLIC_ROOT;
    }
    const candidateRealPath = await prospectiveRealPath(root);
    if (pathIsInside(publicRealPath, candidateRealPath)) {
        throw storageConfigurationError(
            "MEDIA_STORAGE_ROOT nao pode resolver para frontend/public.",
        );
    }

    await mkdir(root, { recursive: true, mode: 0o700 });

    let finalStats;
    let finalRealPath;
    try {
        finalStats = await lstat(root);
        finalRealPath = await realpath(root);
    } catch {
        throw storageConfigurationError(
            "MEDIA_STORAGE_ROOT nao pode ser validada em seguranca.",
        );
    }
    if (
        finalStats.isSymbolicLink() ||
        !finalStats.isDirectory() ||
        pathIsInside(publicRealPath, finalRealPath)
    ) {
        throw storageConfigurationError(
            "MEDIA_STORAGE_ROOT deve ser um diretorio privado real.",
        );
    }

    await chmod(root, 0o700);
}

/**
 * Confirma a assinatura mínima ISO Base Media File Format (`ftyp`).
 *
 * @param {Buffer} header Primeiros bytes do upload.
 * @returns {boolean} Verdadeiro para um cabeçalho MP4 plausível.
 */
function hasMp4FileTypeBox(header) {
    if (!Buffer.isBuffer(header) || header.length < MP4_HEADER_BYTES) {
        return false;
    }

    const boxSize = header.readUInt32BE(0);
    return (
        (boxSize === 1 || boxSize >= 8) &&
        header.subarray(4, 8).toString("ascii") === "ftyp"
    );
}

/**
 * Converte falhas de filesystem/stream esperadas num erro público estável.
 *
 * @param {unknown} error Falha original.
 * @returns {Error} Erro seguro.
 */
function safeUploadError(error) {
    if (error instanceof HttpError) return error;

    if (error?.code === "EEXIST") {
        return new HttpError(
            409,
            "Este upload ja foi iniciado.",
            undefined,
            "MEDIA_UPLOAD_CONFLICT",
        );
    }

    if (
        error?.code === "ERR_STREAM_PREMATURE_CLOSE" ||
        error?.code === "ABORT_ERR" ||
        error?.code === "ECONNRESET" ||
        error?.code === "EPIPE"
    ) {
        return new HttpError(
            400,
            "Upload de media interrompido.",
            undefined,
            "MEDIA_UPLOAD_INVALID",
        );
    }

    return error;
}

/**
 * Recebe e valida um MP4 sem carregar o ficheiro inteiro em memória.
 *
 * @param {NodeJS.ReadableStream} readable Corpo bruto do pedido HTTP.
 * @param {{ storageKey: string, root?: string, maxBytes?: number, expectedSizeBytes?: number | null, expectedSha256?: string | null, contentLength?: number | null }} options Regras internas do upload.
 * @returns {Promise<{ sizeBytes: number, sha256: string, mimeType: "video/mp4" }>} Metadata calculada.
 */
export async function storeMediaUpload(readable, options) {
    if (!readable || typeof readable.pipe !== "function") {
        throw new HttpError(
            400,
            "Stream de media invalido.",
            undefined,
            "MEDIA_UPLOAD_INVALID",
        );
    }

    const root = options?.root ?? mediaStorageConfig.root;
    const maxBytes = options?.maxBytes ?? mediaStorageConfig.maxUploadBytes;
    const { finalPath, partialPath } = mediaStoragePaths(
        options?.storageKey,
        root,
    );

    if (
        Number.isSafeInteger(options?.contentLength) &&
        options.contentLength > maxBytes
    ) {
        throw new HttpError(
            413,
            "O ficheiro excede o limite maximo permitido.",
            undefined,
            "MEDIA_UPLOAD_TOO_LARGE",
        );
    }

    await ensureMediaStorageRoot(root);

    let sizeBytes = 0;
    let header = Buffer.alloc(0);
    const hash = createHash("sha256");
    const validator = new Transform({
        transform(chunk, _encoding, callback) {
            const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            sizeBytes += bytes.length;

            if (sizeBytes > maxBytes) {
                callback(
                    new HttpError(
                        413,
                        "O ficheiro excede o limite maximo permitido.",
                        undefined,
                        "MEDIA_UPLOAD_TOO_LARGE",
                    ),
                );
                return;
            }

            hash.update(bytes);
            if (header.length < MP4_HEADER_BYTES) {
                header = Buffer.concat([
                    header,
                    bytes.subarray(0, MP4_HEADER_BYTES - header.length),
                ]);
            }
            callback(null, bytes);
        },
    });

    try {
        await pipeline(
            readable,
            validator,
            createWriteStream(partialPath, {
                flags: "wx",
                mode: 0o600,
            }),
        );

        if (sizeBytes < 1 || !hasMp4FileTypeBox(header)) {
            throw new HttpError(
                400,
                "O ficheiro recebido nao e um MP4 valido.",
                undefined,
                "MEDIA_UPLOAD_INVALID",
            );
        }

        if (
            Number.isSafeInteger(options?.expectedSizeBytes) &&
            sizeBytes !== options.expectedSizeBytes
        ) {
            throw new HttpError(
                400,
                "O tamanho recebido nao corresponde ao upload criado.",
                undefined,
                "MEDIA_UPLOAD_INVALID",
            );
        }

        if (
            Number.isSafeInteger(options?.contentLength) &&
            sizeBytes !== options.contentLength
        ) {
            throw new HttpError(
                400,
                "O tamanho recebido nao corresponde ao Content-Length.",
                undefined,
                "MEDIA_UPLOAD_INVALID",
            );
        }

        const sha256 = hash.digest("hex");
        if (
            typeof options?.expectedSha256 === "string" &&
            sha256 !== options.expectedSha256
        ) {
            throw new HttpError(
                400,
                "O SHA-256 recebido nao corresponde ao upload criado.",
                undefined,
                "MEDIA_UPLOAD_INVALID",
            );
        }

        try {
            await lstat(finalPath);
            throw Object.assign(new Error("Media file already exists."), {
                code: "EEXIST",
            });
        } catch (error) {
            if (error?.code !== "ENOENT") throw error;
        }

        await rename(partialPath, finalPath);
        return { sizeBytes, sha256, mimeType: MEDIA_MP4_MIME_TYPE };
    } catch (error) {
        await rm(partialPath, { force: true }).catch(() => undefined);
        throw safeUploadError(error);
    }
}

/**
 * Remove resíduos finais e parciais associados a uma chave já validada.
 *
 * @param {string} storageKey Chave interna.
 * @param {string} [root=mediaStorageConfig.root] Raiz configurada.
 * @returns {Promise<void>} Termina quando ambos os paths deixam de existir.
 */
export async function removeMediaStorageFiles(
    storageKey,
    root = mediaStorageConfig.root,
) {
    const { finalPath, partialPath } = mediaStoragePaths(storageKey, root);
    await Promise.all([
        rm(partialPath, { force: true }),
        rm(finalPath, { force: true }),
    ]);
}

/**
 * Abre um ficheiro final sem seguir symlinks e confirma que é regular.
 *
 * O `FileHandle` devolvido pertence ao caller: HEAD deve fechá-lo diretamente;
 * GET deve entregá-lo a `FileHandle.createReadStream({ autoClose: true })`.
 *
 * @param {string} storageKey Chave interna persistida.
 * @param {string} [root=mediaStorageConfig.root] Raiz configurada.
 * @returns {Promise<{ handle: import("node:fs/promises").FileHandle, sizeBytes: number }>} Handle privado e tamanho.
 */
export async function openMediaStorageFile(
    storageKey,
    root = mediaStorageConfig.root,
) {
    const { finalPath } = mediaStoragePaths(storageKey, root);
    const noFollow = fsConstants.O_NOFOLLOW ?? 0;
    let handle;

    try {
        handle = await open(finalPath, fsConstants.O_RDONLY | noFollow);
        const stats = await handle.stat();
        if (!stats.isFile() || !Number.isSafeInteger(stats.size) || stats.size < 1) {
            throw new Error("Stored media is not a regular non-empty file.");
        }

        return { handle, sizeBytes: stats.size };
    } catch (error) {
        await handle?.close().catch(() => undefined);
        if (["ENOENT", "ELOOP"].includes(error?.code)) {
            throw new HttpError(
                409,
                "Asset de media indisponivel.",
                undefined,
                "MEDIA_ASSET_NOT_READY",
            );
        }
        throw error;
    }
}

/**
 * Recalcula o SHA-256 de um ficheiro final por stream.
 *
 * Esta inspeção é usada imediatamente antes da ativação para detetar alterações
 * locais entre a ingestão e o commit editorial sem carregar o MP4 em memória.
 *
 * @param {string} storageKey Chave interna persistida.
 * @param {string} [root=mediaStorageConfig.root] Raiz configurada.
 * @returns {Promise<{ sizeBytes: number, sha256: string }>} Metadata observada no disco.
 */
export async function inspectMediaStorageFile(
    storageKey,
    root = mediaStorageConfig.root,
) {
    const opened = await openMediaStorageFile(storageKey, root);
    const hash = createHash("sha256");
    const stream = opened.handle.createReadStream({ autoClose: true });

    try {
        for await (const chunk of stream) {
            hash.update(chunk);
        }
        return {
            sizeBytes: opened.sizeBytes,
            sha256: hash.digest("hex"),
        };
    } catch (error) {
        stream.destroy();
        await opened.handle.close().catch(() => undefined);
        throw error;
    }
}
