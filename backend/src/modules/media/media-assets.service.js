/**
 * @file Ciclo de vida persistente dos assets MP4 locais.
 *
 * A ingestão e a ativação são deliberadamente separadas: o upload calcula e
 * valida metadata no filesystem; só uma ativação posterior, protegida por CAS e
 * transação MongoDB, altera a fonte editorial do conteúdo.
 */

import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import { canonicalMediaSource } from "../catalog/catalog-media.js";
import {
    getEffectiveSubscriptionAccess,
    isSupportedQualityValue,
    qualityRankForValue,
} from "../subscriptions/subscriptions.service.js";
import {
    createOpaqueMediaStorageKey,
    inspectMediaStorageFile,
    mediaStorageConfig,
    removeMediaStorageFiles,
    storeMediaUpload,
} from "./media-storage.service.js";
import {
    assertActivateMediaUploadPayload,
    assertCreateMediaUploadPayload,
    assertMediaUploadHeaders,
    MEDIA_MP4_MIME_TYPE,
} from "./media.validation.js";

const INITIAL_CONTENT_VERSION = 1;
const ABORTABLE_ASSET_STATUSES = [
    "pending",
    "uploading",
    "uploaded",
    "failed",
];

/**
 * Converte um identificador externo em ObjectId com erro de domínio estável.
 *
 * @param {unknown} value Id recebido.
 * @param {string} label Nome seguro do recurso.
 * @returns {ObjectId} Id MongoDB.
 */
function asObjectId(value, label) {
    if (typeof value !== "string" || !ObjectId.isValid(value)) {
        throw new HttpError(400, `${label} invalido.`);
    }

    return new ObjectId(value);
}

/**
 * Normaliza documentos editoriais anteriores ao campo `version`.
 *
 * @param {Record<string, unknown>} content Documento de conteúdo.
 * @returns {number} Versão positiva corrente.
 */
function contentVersion(content) {
    return Number.isSafeInteger(content?.version) && content.version >= 1
        ? content.version
        : INITIAL_CONTENT_VERSION;
}

/**
 * Constrói o filtro CAS com compatibilidade limitada a documentos legacy.
 *
 * @param {ObjectId} contentId Conteúdo a alterar.
 * @param {number} expectedVersion Versão vista pelo administrador.
 * @returns {Record<string, unknown>} Filtro MongoDB.
 */
function contentVersionFilter(contentId, expectedVersion) {
    if (expectedVersion === INITIAL_CONTENT_VERSION) {
        return {
            _id: contentId,
            $or: [
                { version: INITIAL_CONTENT_VERSION },
                { version: { $exists: false } },
            ],
        };
    }

    return { _id: contentId, version: expectedVersion };
}

/**
 * Cria o conflito canónico usado por mutações editoriais concorrentes.
 *
 * @returns {HttpError} Erro 409 com código estável.
 */
function contentVersionConflict() {
    return new HttpError(
        409,
        "O conteudo foi alterado por outro utilizador. Recarregue e tente novamente.",
        undefined,
        "CONTENT_VERSION_CONFLICT",
    );
}

/**
 * Rejeita séries agregadoras como destino de ficheiros reproduzíveis.
 *
 * @param {Record<string, unknown>} content Conteúdo candidato.
 * @returns {void}
 */
function assertPlayableContentType(content) {
    if (content?.type === "series") {
        throw new HttpError(
            409,
            "Uma serie agregadora nao pode receber media de reproducao.",
            undefined,
            "SERIES_NOT_PLAYABLE",
        );
    }
}

/**
 * Expõe apenas metadata administrativa; `storageKey` nunca atravessa a API.
 *
 * @param {Record<string, unknown> & { _id: ObjectId }} asset Documento interno.
 * @returns {Record<string, unknown>} Asset administrativo seguro.
 */
export function toPublicMediaAsset(asset) {
    return {
        id: String(asset._id),
        contentId: String(asset.contentId),
        quality: asset.quality,
        mimeType: asset.mimeType,
        sizeBytes: Number.isSafeInteger(asset.sizeBytes)
            ? asset.sizeBytes
            : null,
        sha256: typeof asset.sha256 === "string" ? asset.sha256 : null,
        status: asset.status,
        active: asset.active === true,
        failureCode:
            typeof asset.failureCode === "string" ? asset.failureCode : null,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
        uploadedAt: asset.uploadedAt ?? null,
        activatedAt: asset.activatedAt ?? null,
    };
}

/**
 * Garante constraints de unicidade e os índices de consulta do domínio.
 *
 * @returns {Promise<void>} Termina quando todos os índices existem.
 */
export async function ensureMediaAssetIndexes() {
    const db = await getDb();
    const assets = db.collection("media_assets");
    await assets.createIndex({ storageKey: 1 }, { unique: true });
    await assets.createIndex({ contentId: 1, createdAt: -1, _id: 1 });
    await assets.createIndex({ status: 1, updatedAt: 1 });
    await assets.createIndex(
        { contentId: 1, active: 1 },
        {
            unique: true,
            partialFilterExpression: { active: true },
        },
    );
}

/**
 * Cria uma sessão de ingestão para um conteúdo editorial existente.
 *
 * @param {string} contentId Identificador do conteúdo.
 * @param {unknown} input Metadata fechada do MP4.
 * @param {string} actorUserId Administrador autenticado.
 * @returns {Promise<Record<string, unknown>>} Asset público em estado pending.
 */
export async function createMediaUpload(contentId, input, actorUserId) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const actorObjectId = asObjectId(actorUserId, "Administrador");
    const payload = assertCreateMediaUploadPayload(input);
    if (
        Number.isSafeInteger(payload.expectedSizeBytes) &&
        payload.expectedSizeBytes > mediaStorageConfig.maxUploadBytes
    ) {
        throw new HttpError(
            413,
            "O ficheiro excede o limite maximo permitido.",
            undefined,
            "MEDIA_UPLOAD_TOO_LARGE",
        );
    }
    await ensureMediaAssetIndexes();

    const db = await getDb();
    const content = await db.collection("contents").findOne({
        _id: contentObjectId,
    });
    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }
    assertPlayableContentType(content);

    const now = new Date();
    const asset = {
        contentId: contentObjectId,
        storageKey: createOpaqueMediaStorageKey(),
        quality: payload.quality,
        mimeType: MEDIA_MP4_MIME_TYPE,
        expectedSizeBytes: payload.expectedSizeBytes,
        expectedSha256: payload.expectedSha256,
        sizeBytes: null,
        sha256: null,
        status: "pending",
        active: false,
        createdBy: actorObjectId,
        createdAt: now,
        updatedAt: now,
    };
    const result = await db.collection("media_assets").insertOne(asset);

    return toPublicMediaAsset({ ...asset, _id: result.insertedId });
}

/**
 * Marca uma sessão como falhada sem permitir que uma falha secundária de MongoDB
 * esconda o erro original do stream.
 *
 * @param {import("mongodb").Collection} assets Coleção de assets.
 * @param {ObjectId} assetId Asset reclamado.
 * @param {unknown} error Falha original.
 * @returns {Promise<void>} Termina após a tentativa best-effort.
 */
async function recordUploadFailure(assets, assetId, error) {
    const failureCode =
        typeof error?.code === "string" && error.code.startsWith("MEDIA_")
            ? error.code
            : "MEDIA_UPLOAD_FAILED";

    await assets
        .updateOne(
            { _id: assetId, status: "uploading" },
            {
                $set: {
                    status: "failed",
                    active: false,
                    failureCode,
                    updatedAt: new Date(),
                },
            },
        )
        .catch(() => undefined);
}

/**
 * Faz streaming do corpo MP4 para storage privado e persiste a metadata
 * calculada apenas depois da promoção atómica do `.partial`.
 *
 * @param {string} contentId Conteúdo dono do upload.
 * @param {string} uploadId Sessão de upload.
 * @param {NodeJS.ReadableStream} readable Corpo binário bruto.
 * @param {Record<string, unknown>} headers Headers HTTP.
 * @returns {Promise<Record<string, unknown>>} Asset público em estado uploaded.
 */
export async function receiveMediaUpload(
    contentId,
    uploadId,
    readable,
    headers = {},
) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const assetObjectId = asObjectId(uploadId, "Upload");
    const db = await getDb();
    const assets = db.collection("media_assets");
    const pendingAsset = await assets.findOne({
        _id: assetObjectId,
        contentId: contentObjectId,
    });

    if (!pendingAsset) {
        throw new HttpError(404, "Upload de media nao encontrado.");
    }
    if (pendingAsset.status !== "pending") {
        throw new HttpError(
            409,
            "O upload de media ja foi iniciado ou terminado.",
            undefined,
            "MEDIA_UPLOAD_CONFLICT",
        );
    }

    const { contentLength } = assertMediaUploadHeaders(
        headers,
        pendingAsset,
        mediaStorageConfig.maxUploadBytes,
    );
    const now = new Date();
    const claimed = await assets.findOneAndUpdate(
        {
            _id: assetObjectId,
            contentId: contentObjectId,
            status: "pending",
        },
        {
            $set: {
                status: "uploading",
                uploadStartedAt: now,
                updatedAt: now,
            },
        },
        { returnDocument: "after" },
    );
    if (!claimed) {
        throw new HttpError(
            409,
            "O upload de media foi iniciado por outro pedido.",
            undefined,
            "MEDIA_UPLOAD_CONFLICT",
        );
    }

    try {
        const stored = await storeMediaUpload(readable, {
            storageKey: claimed.storageKey,
            expectedSizeBytes: claimed.expectedSizeBytes,
            expectedSha256: claimed.expectedSha256,
            contentLength,
        });
        const uploadedAt = new Date();
        const updateResult = await assets.updateOne(
            { _id: assetObjectId, status: "uploading" },
            {
                $set: {
                    status: "uploaded",
                    active: false,
                    sizeBytes: stored.sizeBytes,
                    sha256: stored.sha256,
                    uploadedAt,
                    updatedAt: uploadedAt,
                },
                $unset: { failureCode: "" },
            },
        );

        if (!updateResult.matchedCount) {
            await removeMediaStorageFiles(claimed.storageKey);
            throw new HttpError(
                409,
                "O upload deixou de estar disponivel para conclusao.",
                undefined,
                "MEDIA_UPLOAD_CONFLICT",
            );
        }

        return toPublicMediaAsset({
            ...claimed,
            ...stored,
            status: "uploaded",
            active: false,
            uploadedAt,
            updatedAt: uploadedAt,
        });
    } catch (error) {
        await removeMediaStorageFiles(claimed.storageKey).catch(
            () => undefined,
        );
        await recordUploadFailure(assets, assetObjectId, error);
        throw error;
    }
}

/**
 * Confirma que o ficheiro final ainda existe e corresponde ao tamanho validado.
 *
 * @param {Record<string, unknown>} asset Asset interno em estado uploaded.
 * @returns {Promise<void>} Termina depois de fechar o handle de verificação.
 */
async function assertStoredAssetReady(asset) {
    const expectedSha256 = String(asset.sha256 ?? "");
    const inspected = await inspectMediaStorageFile(asset.storageKey);
    if (
        !Number.isSafeInteger(asset.sizeBytes) ||
        inspected.sizeBytes !== asset.sizeBytes ||
        !/^[a-f0-9]{64}$/.test(expectedSha256) ||
        inspected.sha256 !== expectedSha256
    ) {
        throw new HttpError(
            409,
            "Asset de media indisponivel.",
            undefined,
            "MEDIA_ASSET_NOT_READY",
        );
    }
}

/**
 * Ativa um MP4 validado, preservando a fonte anterior até ao commit.
 *
 * A transação guarda a revisão editorial, desativa o asset anterior, ativa o
 * novo e troca a fonte no conteúdo com compare-and-swap.
 *
 * @param {string} contentId Conteúdo a alterar.
 * @param {string} uploadId Asset já ingerido.
 * @param {unknown} input Corpo com `expectedVersion`.
 * @param {string} actorUserId Administrador autenticado.
 * @param {{ requestId?: string }} [context] Metadata segura do pedido.
 * @returns {Promise<{ asset: Record<string, unknown>, contentVersion: number }>} Resultado público.
 */
export async function activateMediaUpload(
    contentId,
    uploadId,
    input,
    actorUserId,
    context = {},
) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const assetObjectId = asObjectId(uploadId, "Upload");
    asObjectId(actorUserId, "Administrador");
    const { expectedVersion } = assertActivateMediaUploadPayload(input);
    const db = await getDb();
    const candidate = await db.collection("media_assets").findOne({
        _id: assetObjectId,
        contentId: contentObjectId,
        status: "uploaded",
        active: false,
    });
    if (!candidate) {
        throw new HttpError(
            409,
            "O asset ainda nao esta pronto para ativacao.",
            undefined,
            "MEDIA_ASSET_NOT_READY",
        );
    }
    await assertStoredAssetReady(candidate);

    return runInTransaction(async ({ db: transactionDb, session }) => {
        const assets = transactionDb.collection("media_assets");
        // O driver MongoDB não permite operações paralelas na mesma sessão
        // transacional; as leituras são intencionalmente sequenciais.
        const asset = await assets.findOne(
            {
                _id: assetObjectId,
                contentId: contentObjectId,
                status: "uploaded",
                active: false,
            },
            { session },
        );
        const content = await transactionDb
            .collection("contents")
            .findOne({ _id: contentObjectId }, { session });

        if (!asset) {
            throw new HttpError(
                409,
                "O asset ainda nao esta pronto para ativacao.",
                undefined,
                "MEDIA_ASSET_NOT_READY",
            );
        }
        if (!content) {
            throw new HttpError(404, "Conteudo nao encontrado.");
        }
        assertPlayableContentType(content);

        const currentVersion = contentVersion(content);
        if (currentVersion !== expectedVersion) {
            throw contentVersionConflict();
        }

        const now = new Date();
        const mediaUrl = `/api/media/${assetObjectId}`;
        const nextMedia = {
            url: mediaUrl,
            protocol: "progressive",
            mimeType: MEDIA_MP4_MIME_TYPE,
            quality: asset.quality,
        };
        const nextTracks = {
            subtitles: Array.isArray(content.tracks?.subtitles)
                ? content.tracks.subtitles
                : [],
            audio: [],
        };

        await transactionDb.collection("content_revisions").insertOne(
            {
                contentId: contentObjectId,
                action: "media_activate",
                snapshot: content,
                changedBy: new ObjectId(actorUserId),
                createdAt: now,
            },
            { session },
        );
        await assets.updateMany(
            {
                contentId: contentObjectId,
                active: true,
                _id: { $ne: assetObjectId },
            },
            {
                $set: {
                    status: "superseded",
                    active: false,
                    supersededAt: now,
                    updatedAt: now,
                },
            },
            { session },
        );
        const activationResult = await assets.updateOne(
            {
                _id: assetObjectId,
                contentId: contentObjectId,
                status: "uploaded",
                active: false,
            },
            {
                $set: {
                    status: "ready",
                    active: true,
                    activatedAt: now,
                    activatedBy: new ObjectId(actorUserId),
                    updatedAt: now,
                },
            },
            { session },
        );
        if (!activationResult.matchedCount) {
            throw new HttpError(
                409,
                "O asset foi alterado por outro pedido.",
                undefined,
                "MEDIA_ASSET_NOT_READY",
            );
        }

        const nextVersion = currentVersion + 1;
        const contentResult = await transactionDb
            .collection("contents")
            .updateOne(
                contentVersionFilter(contentObjectId, expectedVersion),
                {
                    $set: {
                        media: nextMedia,
                        mediaStatus: "ready",
                        tracks: nextTracks,
                        qualityOptions: [],
                        version: nextVersion,
                        updatedBy: new ObjectId(actorUserId),
                        updatedAt: now,
                    },
                },
                { session },
            );
        if (!contentResult.matchedCount) {
            throw contentVersionConflict();
        }

        await writeAdminAudit({
            db: transactionDb,
            session,
            actorUserId,
            action: "catalog.media.activated",
            targetType: "content",
            targetId: contentObjectId,
            before: {
                media: content.media ?? null,
                mediaStatus: content.mediaStatus ?? "pending",
                version: currentVersion,
            },
            after: {
                media: nextMedia,
                mediaStatus: "ready",
                version: nextVersion,
                assetId: String(assetObjectId),
            },
            requestId: context.requestId,
            operationId: `catalog:media-activate:${assetObjectId}:${expectedVersion}`,
        });

        return {
            asset: toPublicMediaAsset({
                ...asset,
                status: "ready",
                active: true,
                activatedAt: now,
                updatedAt: now,
            }),
            contentVersion: nextVersion,
        };
    });
}

/**
 * Aborta uma sessão não ativa e remove os ficheiros associados.
 *
 * A alteração de estado acontece antes da remoção; um `PUT` concorrente deixa
 * de conseguir promover o asset na base e limpa o ficheiro que acabou de criar.
 *
 * @param {string} contentId Conteúdo dono do upload.
 * @param {string} uploadId Asset abortado.
 * @returns {Promise<void>} Termina após a limpeza.
 */
export async function abortMediaUpload(contentId, uploadId) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const assetObjectId = asObjectId(uploadId, "Upload");
    const db = await getDb();
    const now = new Date();
    const asset = await db.collection("media_assets").findOneAndUpdate(
        {
            _id: assetObjectId,
            contentId: contentObjectId,
            status: { $in: ABORTABLE_ASSET_STATUSES },
            active: false,
        },
        {
            $set: {
                status: "aborted",
                active: false,
                abortedAt: now,
                updatedAt: now,
            },
        },
        { returnDocument: "before" },
    );

    if (!asset) {
        const existing = await db.collection("media_assets").findOne({
            _id: assetObjectId,
            contentId: contentObjectId,
        });
        if (!existing) {
            throw new HttpError(404, "Upload de media nao encontrado.");
        }
        throw new HttpError(
            409,
            "Um asset ativo nao pode ser abortado.",
            undefined,
            "MEDIA_UPLOAD_CONFLICT",
        );
    }

    await removeMediaStorageFiles(asset.storageKey);
}

/**
 * Lista assets administrativos de um conteúdo sem expor paths ou storage keys.
 *
 * @param {string} contentId Conteúdo consultado.
 * @returns {Promise<Record<string, unknown>[]>} Assets do mais recente para o antigo.
 */
export async function listMediaAssets(contentId) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const db = await getDb();
    const content = await db
        .collection("contents")
        .findOne({ _id: contentObjectId }, { projection: { _id: 1 } });
    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const assets = await db
        .collection("media_assets")
        .find({ contentId: contentObjectId })
        .sort({ createdAt: -1, _id: -1 })
        .toArray();
    return assets.map(toPublicMediaAsset);
}

/**
 * Revalida todas as regras de acesso imediatamente antes de abrir o ficheiro.
 *
 * @param {string} assetId Asset pedido pela URL privada.
 * @param {string} userId Utilizador autenticado.
 * @returns {Promise<{ storageKey: string, sizeBytes: number, mimeType: "video/mp4", assetId: string }>} Contexto interno para o controller.
 */
export async function getMediaDeliveryContext(assetId, userId) {
    const assetObjectId = asObjectId(assetId, "Asset");
    const userObjectId = asObjectId(userId, "Utilizador");
    const db = await getDb();
    const asset = await db.collection("media_assets").findOne({
        _id: assetObjectId,
        status: "ready",
        active: true,
    });
    if (!asset) {
        throw new HttpError(404, "Asset de media nao encontrado.");
    }

    const [content, user] = await Promise.all([
        db.collection("contents").findOne({ _id: asset.contentId }),
        db.collection("users").findOne({ _id: userObjectId }),
    ]);
    if (!content || content.status !== "published") {
        throw new HttpError(404, "Asset de media nao encontrado.");
    }
    assertPlayableContentType(content);

    if (!user || (user.accountStatus ?? "active") !== "active") {
        throw new HttpError(
            401,
            "Autenticacao obrigatoria.",
            undefined,
            "AUTH_REQUIRED",
        );
    }

    const maxAge = Number.isInteger(user.parentalMaxAgeRating)
        ? user.parentalMaxAgeRating
        : 18;
    if (Number(content.ageRating) > maxAge) {
        throw new HttpError(
            403,
            "Conteudo bloqueado pelo controlo parental.",
            undefined,
            "PARENTAL_CONTROL_BLOCKED",
        );
    }

    const source = canonicalMediaSource(content.media);
    const expectedUrl = `/api/media/${assetObjectId}`;
    if (
        content.mediaStatus !== "ready" ||
        source?.url !== expectedUrl ||
        source.protocol !== "progressive" ||
        source.mimeType !== MEDIA_MP4_MIME_TYPE
    ) {
        throw new HttpError(
            409,
            "Asset de media indisponivel.",
            undefined,
            "MEDIA_ASSET_NOT_READY",
        );
    }

    const access = await getEffectiveSubscriptionAccess(userId);
    if (!access.hasPremiumAccess) {
        throw new HttpError(
            403,
            "Subscricao ativa obrigatoria para reproduzir este conteudo.",
            undefined,
            "SUBSCRIPTION_REQUIRED",
        );
    }

    const maxQualityRank = Number(
        access.entitlements?.qualityRank ??
            qualityRankForValue(access.entitlements?.maxQuality),
    );
    if (
        !isSupportedQualityValue(asset.quality) ||
        qualityRankForValue(asset.quality) > maxQualityRank
    ) {
        throw new HttpError(
            403,
            "A qualidade deste asset nao esta incluida no plano atual.",
            undefined,
            "MEDIA_QUALITY_FORBIDDEN",
        );
    }

    if (
        !Number.isSafeInteger(asset.sizeBytes) ||
        asset.sizeBytes < 1 ||
        asset.mimeType !== MEDIA_MP4_MIME_TYPE
    ) {
        throw new HttpError(
            409,
            "Asset de media indisponivel.",
            undefined,
            "MEDIA_ASSET_NOT_READY",
        );
    }

    return {
        storageKey: asset.storageKey,
        sizeBytes: asset.sizeBytes,
        mimeType: MEDIA_MP4_MIME_TYPE,
        assetId: String(assetObjectId),
    };
}
