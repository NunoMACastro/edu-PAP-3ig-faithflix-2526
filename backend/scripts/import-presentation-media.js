/**
 * @file Importação explícita dos seis MP4 locais usados na apresentação PAP.
 *
 * O script é deliberadamente restrito à base demo confirmada e aos três slugs
 * conhecidos. Converte esses registos de série em filme sem apagar os antigos
 * episódios: cada episódio dependente passa a filme autónomo e conserva título,
 * estado e identificador. A ingestão reutiliza os serviços reais de media para
 * validar MP4, calcular integridade, criar revisões e registar auditoria.
 */

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, realpath } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ObjectId } from "mongodb";
import {
    assertTransactionSupport,
    closeDatabase,
    getDb,
    runInTransaction,
} from "../src/config/database.js";
import { env } from "../src/config/env.js";
import { writeAdminAudit } from "../src/modules/audit/audit.service.js";
import {
    abortMediaUpload,
    activateMediaUpload,
    createMediaUpload,
    receiveMediaUpload,
} from "../src/modules/media/media-assets.service.js";
import {
    getMediaPreferences,
    saveMediaPreferences,
} from "../src/modules/playback/media-preferences.service.js";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const TEMP_ROOT = resolve(SCRIPT_DIR, "../../temp");
const ADMIN_EMAIL = "admin@faithflix.demo";
const INITIAL_CONTENT_VERSION = 1;

/**
 * Associação editorial da apresentação.
 *
 * Os nomes dos dois ficheiros `floresta` estão trocados relativamente à
 * resolução real; as qualidades abaixo resultam da inspeção de metadata do MP4,
 * não do nome do ficheiro.
 */
const PRESENTATION_CONTENTS = Object.freeze([
    Object.freeze({
        title: "O Valor do Silêncio",
        slug: "o-valor-do-silencio",
        durationSeconds: 37,
        variants: Object.freeze([
            Object.freeze({ fileName: "floresta(4k).mp4", quality: "1080p" }),
            Object.freeze({ fileName: "floresta.mp4", quality: "2160p" }),
        ]),
    }),
    Object.freeze({
        title: "Cartas à Próxima Geração",
        slug: "cartas-a-proxima-geracao",
        durationSeconds: 20,
        variants: Object.freeze([
            Object.freeze({ fileName: "pessoas a andar.mp4", quality: "1080p" }),
            Object.freeze({ fileName: "pessoas a andar(4k).mp4", quality: "2160p" }),
        ]),
    }),
    Object.freeze({
        title: "A Oficina do Bairro",
        slug: "a-oficina-do-bairro",
        durationSeconds: 8,
        variants: Object.freeze([
            Object.freeze({ fileName: "mulher e dog.mp4", quality: "1080p" }),
            Object.freeze({ fileName: "mulher e dog(4k).mp4", quality: "2160p" }),
        ]),
    }),
]);

/**
 * Constrói uma versão editorial positiva para documentos legacy.
 *
 * @param {Record<string, unknown>} content Conteúdo persistido.
 * @returns {number} Versão corrente.
 */
function contentVersion(content) {
    return Number.isSafeInteger(content?.version) && content.version >= 1
        ? content.version
        : INITIAL_CONTENT_VERSION;
}

/**
 * Cria um filtro CAS compatível com documentos que ainda não têm `version`.
 *
 * @param {ObjectId} contentId Identificador interno.
 * @param {number} expectedVersion Versão observada.
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
 * Impede a execução acidental numa base não dedicada à demonstração.
 *
 * @returns {void}
 */
function assertImportEnvironment() {
    if (env.nodeEnv === "production") {
        throw new Error("A importação de apresentação é proibida em produção.");
    }
    if (!env.mongoDbName.endsWith("_demo")) {
        throw new Error("A importação exige uma base terminada em _demo.");
    }
    if (process.env.ALLOW_PRESENTATION_MEDIA_IMPORT !== "true") {
        throw new Error(
            "Defina ALLOW_PRESENTATION_MEDIA_IMPORT=true para confirmar a importação.",
        );
    }
    if (process.env.PRESENTATION_MEDIA_CONFIRM !== env.mongoDbName) {
        throw new Error(
            "PRESENTATION_MEDIA_CONFIRM deve corresponder ao nome da base demo.",
        );
    }
}

/**
 * Confirma que um ficheiro é regular, não é symlink e permanece dentro de temp.
 *
 * @param {string} fileName Nome fechado declarado no manifesto interno.
 * @returns {Promise<{ path: string, sizeBytes: number }>} Ficheiro validado.
 */
async function inspectInputFile(fileName) {
    const root = await realpath(TEMP_ROOT);
    const path = resolve(root, fileName);
    const pathFromRoot = relative(root, path);
    if (pathFromRoot.startsWith("..") || pathFromRoot === "") {
        throw new Error(`Ficheiro de entrada inválido: ${fileName}.`);
    }

    const entry = await lstat(path);
    if (!entry.isFile() || entry.isSymbolicLink()) {
        throw new Error(`A entrada não é um ficheiro regular: ${fileName}.`);
    }
    const canonicalPath = await realpath(path);
    if (canonicalPath !== path) {
        throw new Error(`O ficheiro atravessa um alias não permitido: ${fileName}.`);
    }

    return { path, sizeBytes: entry.size };
}

/**
 * Calcula SHA-256 antes da ingestão para detetar alterações entre leituras.
 *
 * @param {string} path Path local já validado.
 * @returns {Promise<string>} Digest hexadecimal.
 */
async function sha256File(path) {
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(path)) {
        hash.update(chunk);
    }
    return hash.digest("hex");
}

/**
 * Persiste uma conversão editorial com revisão, CAS e auditoria transacional.
 *
 * @param {object} input Dados da conversão.
 * @param {import("mongodb").Db} input.db Base transacional.
 * @param {import("mongodb").ClientSession | undefined} input.session Sessão.
 * @param {Record<string, unknown> & { _id: ObjectId }} input.content Snapshot.
 * @param {ObjectId} input.actorUserId Administrador responsável.
 * @param {number} [input.durationSeconds] Duração a atualizar no filme alvo.
 * @returns {Promise<void>}
 */
async function convertContentToMovie({
    db,
    session,
    content,
    actorUserId,
    durationSeconds,
}) {
    const currentVersion = contentVersion(content);
    const nextVersion = currentVersion + 1;
    const now = new Date();
    const nextDuration = durationSeconds ?? content.durationSeconds;

    await db.collection("content_revisions").insertOne(
        {
            contentId: content._id,
            action: "presentation_media_prepare",
            snapshot: content,
            changedBy: actorUserId,
            createdAt: now,
        },
        { session },
    );
    const result = await db.collection("contents").updateOne(
        contentVersionFilter(content._id, currentVersion),
        {
            $set: {
                type: "movie",
                durationSeconds: nextDuration,
                version: nextVersion,
                updatedBy: actorUserId,
                updatedAt: now,
            },
            $unset: {
                seriesId: "",
                seasonNumber: "",
                episodeNumber: "",
            },
        },
        { session },
    );
    if (!result.matchedCount) {
        const error = new Error(
            `O conteúdo ${content.slug} foi alterado em simultâneo.`,
        );
        error.code = "CONTENT_VERSION_CONFLICT";
        throw error;
    }

    await writeAdminAudit({
        db,
        session,
        actorUserId,
        action: "catalog.presentation_media_prepared",
        targetType: "content",
        targetId: content._id,
        before: {
            type: content.type,
            durationSeconds: content.durationSeconds,
            version: currentVersion,
        },
        after: {
            type: "movie",
            durationSeconds: nextDuration,
            version: nextVersion,
        },
        requestId: "presentation-media-import",
        operationId: `presentation-media:prepare:${content._id}`,
    });
}

/**
 * Corrige os três títulos e preserva os antigos episódios como filmes autónomos.
 *
 * @param {ObjectId} actorUserId Administrador responsável.
 * @returns {Promise<{ targetsChanged: number, childrenDetached: number }>} Resumo.
 */
async function preparePresentationContents(actorUserId) {
    return runInTransaction(async ({ db, session }) => {
        let targetsChanged = 0;
        let childrenDetached = 0;

        for (const definition of PRESENTATION_CONTENTS) {
            const content = await db.collection("contents").findOne(
                { slug: definition.slug },
                { session },
            );
            if (!content || content.title !== definition.title) {
                throw new Error(`Conteúdo esperado não encontrado: ${definition.slug}.`);
            }
            if (!["series", "movie"].includes(content.type)) {
                throw new Error(
                    `Tipo inesperado em ${definition.slug}: ${content.type}.`,
                );
            }

            if (content.type === "series") {
                const children = await db.collection("contents")
                    .find({ seriesId: content._id, type: "episode" }, { session })
                    .toArray();
                for (const child of children) {
                    await convertContentToMovie({
                        db,
                        session,
                        content: child,
                        actorUserId,
                    });
                    childrenDetached += 1;
                }
            }

            if (
                content.type !== "movie" ||
                content.durationSeconds !== definition.durationSeconds
            ) {
                await convertContentToMovie({
                    db,
                    session,
                    content,
                    actorUserId,
                    durationSeconds: definition.durationSeconds,
                });
                targetsChanged += 1;
            }
        }

        return { targetsChanged, childrenDetached };
    });
}

/**
 * Importa uma variante através do mesmo fluxo usado pela API administrativa.
 *
 * @param {object} input Dados fechados da variante.
 * @param {Record<string, unknown> & { _id: ObjectId }} input.content Filme alvo.
 * @param {{ fileName: string, quality: string }} input.variant Variante local.
 * @param {ObjectId} input.actorUserId Administrador responsável.
 * @returns {Promise<Record<string, unknown>>} Resultado sanitizado.
 */
async function importVariant({ content, variant, actorUserId }) {
    const db = await getDb();
    const inputFile = await inspectInputFile(variant.fileName);
    const sha256 = await sha256File(inputFile.path);
    const existing = await db.collection("media_assets").findOne({
        contentId: content._id,
        quality: variant.quality,
        sha256,
        sizeBytes: inputFile.sizeBytes,
        status: "ready",
        active: true,
    });
    if (existing) {
        return {
            title: content.title,
            quality: variant.quality,
            sizeBytes: inputFile.sizeBytes,
            assetId: String(existing._id),
            skipped: true,
        };
    }

    let uploadId;
    try {
        const pending = await createMediaUpload(
            String(content._id),
            {
                quality: variant.quality,
                mimeType: "video/mp4",
                expectedSizeBytes: inputFile.sizeBytes,
                expectedSha256: sha256,
            },
            String(actorUserId),
        );
        uploadId = pending.id;
        await receiveMediaUpload(
            String(content._id),
            uploadId,
            createReadStream(inputFile.path),
            {
                "content-type": "video/mp4",
                "content-length": String(inputFile.sizeBytes),
            },
        );
        const current = await db.collection("contents").findOne(
            { _id: content._id },
            { projection: { version: 1 } },
        );
        if (!current) {
            throw new Error(`Conteúdo desapareceu durante a importação: ${content.slug}.`);
        }
        const activated = await activateMediaUpload(
            String(content._id),
            uploadId,
            { expectedVersion: contentVersion(current) },
            String(actorUserId),
            { requestId: `presentation-media-${content.slug}-${variant.quality}` },
        );

        return {
            title: content.title,
            quality: variant.quality,
            sizeBytes: inputFile.sizeBytes,
            assetId: activated.asset.id,
            skipped: false,
        };
    } catch (error) {
        if (uploadId) {
            await abortMediaUpload(String(content._id), uploadId).catch(
                () => undefined,
            );
        }
        throw error;
    }
}

/**
 * Executa preparação e importação sequencial para manter CAS previsível.
 *
 * @returns {Promise<void>}
 */
async function main() {
    assertImportEnvironment();
    await assertTransactionSupport(3_000);
    const db = await getDb();
    const admin = await db.collection("users").findOne({
        email: ADMIN_EMAIL,
        role: "admin",
        accountStatus: { $ne: "deleted" },
    });
    if (!admin) {
        throw new Error("Administrador demo esperado não encontrado.");
    }
    const familyOwner = await db.collection("users").findOne({
        email: "familia-owner@faithflix.demo",
        role: "user",
        accountStatus: { $ne: "deleted" },
    });
    if (!familyOwner) {
        throw new Error("Responsável Família demo esperado não encontrado.");
    }

    // Valida todos os inputs antes da primeira alteração persistente.
    for (const definition of PRESENTATION_CONTENTS) {
        for (const variant of definition.variants) {
            await inspectInputFile(variant.fileName);
        }
    }

    const preparation = await preparePresentationContents(admin._id);
    const familyPreferences = await getMediaPreferences(String(familyOwner._id));
    await saveMediaPreferences(String(familyOwner._id), {
        ...familyPreferences,
        quality: "2160p",
    });
    const imported = [];
    for (const definition of PRESENTATION_CONTENTS) {
        const content = await db.collection("contents").findOne({
            slug: definition.slug,
            type: "movie",
            status: "published",
        });
        if (!content) {
            throw new Error(`Filme publicado não encontrado: ${definition.slug}.`);
        }

        for (const variant of definition.variants) {
            const result = await importVariant({
                content,
                variant,
                actorUserId: admin._id,
            });
            imported.push(result);
            console.log(
                `${result.skipped ? "Mantido" : "Importado"}: ${result.title} ${result.quality}.`,
            );
        }
    }

    console.log(
        JSON.stringify(
            {
                database: env.mongoDbName,
                preparation,
                familyDemoQuality: "2160p",
                imported,
            },
            null,
            2,
        ),
    );
}

try {
    await main();
} catch (error) {
    console.error(
        error instanceof Error ? error.message : "A importação de media falhou.",
    );
    process.exitCode = 1;
} finally {
    await closeDatabase();
}
