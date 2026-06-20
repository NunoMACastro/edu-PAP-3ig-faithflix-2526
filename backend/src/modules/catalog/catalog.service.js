/**
 * @file Ficheiro `real_dev/backend/src/modules/catalog/catalog.service.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { assertCatalogPayload, assertStatus } from "./catalog.validation.js";

/**
 * Converte um id de conteúdo num ObjectId MongoDB.
 *
 * @param {string} id - Id do conteúdo.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
 */
function asContentObjectId(id) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, "Conteudo invalido.");
    }

    return new ObjectId(id);
}

/**
 * Converte um id de revisão num ObjectId MongoDB.
 *
 * @param {string} id - Revision id.
 * @returns {import("mongodb").ObjectId} ObjectId MongoDB.
 */
function asRevisionObjectId(id) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, "Revisao invalida.");
    }

    return new ObjectId(id);
}

/**
 * Converte um documento interno de conteúdo para o formato público da API.
 *
 * @param {Record<string, unknown> & { _id: import("mongodb").ObjectId }} content - Documento de conteúdo MongoDB.
 * @returns {Record<string, unknown>} Conteúdo público.
 */
function publicContent(content) {
    return {
        id: String(content._id),
        title: content.title,
        slug: content.slug,
        synopsis: content.synopsis,
        type: content.type,
        durationSeconds: content.durationSeconds,
        ageRating: content.ageRating,
        taxonomyIds: (content.taxonomyIds ?? []).map(String),
        assets: content.assets ?? { posterUrl: "", backdropUrl: "" },
        media: content.media,
        tracks: content.tracks ?? { subtitles: [], audio: [] },
        qualityOptions: content.qualityOptions ?? [],
        publishedAt: content.publishedAt ?? null,
    };
}

/**
 * Converte um documento interno de revisão para uma resposta segura da API.
 *
 * @param {Record<string, unknown> & { _id: import("mongodb").ObjectId }} revision - Revision document.
 * @returns {Record<string, unknown>} Revisão pública.
 */
function publicRevision(revision) {
    return {
        id: String(revision._id),
        contentId: String(revision.contentId),
        action: revision.action,
        snapshot: {
            ...publicContent(revision.snapshot),
            status: revision.snapshot.status,
        },
        changedBy: String(revision.changedBy),
        createdAt: revision.createdAt,
    };
}

/**
 * Guarda o estado anterior do conteúdo antes de uma alteração editorial.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {Record<string, unknown>} content - Documento de conteúdo existente.
 * @param {string} userId - Authenticated editor id.
 * @param {string} action - Revision action label.
 * @returns {Promise<void>} Termina depois de inserir a revisão.
 */
async function saveRevision(db, content, userId, action) {
    await db.collection("content_revisions").insertOne({
        contentId: content._id,
        action,
        snapshot: content,
        changedBy: new ObjectId(userId),
        createdAt: new Date(),
    });
}

/**
 * Confirms all referenced taxonomies exist.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {import("mongodb").ObjectId[]} taxonomyIds - Ids de taxonomias referenciadas.
 * @returns {Promise<void>} Termina quando todas as taxonomias existem.
 */
async function assertExistingTaxonomies(db, taxonomyIds) {
    if (taxonomyIds.length === 0) {
        return;
    }

    const existing = await db
        .collection("taxonomies")
        .find({ _id: { $in: taxonomyIds } }, { projection: { _id: 1 } })
        .toArray();

    if (existing.length !== taxonomyIds.length) {
        throw new HttpError(400, "Uma ou mais taxonomias nao existem.");
    }
}

/**
 * Garante que existem os índices usados por catálogo e revisões.
 *
 * @returns {Promise<void>} Termina depois da criação de índices.
 */
export async function ensureCatalogIndexes() {
    const db = await getDb();
    await db.collection("contents").createIndex({ slug: 1 }, { unique: true });
    await db
        .collection("contents")
        .createIndex({ status: 1, publishedAt: -1 });
    await db
        .collection("content_revisions")
        .createIndex({ contentId: 1, createdAt: -1 });
}

/**
 * Lista conteúdo público publicado.
 *
 * @returns {Promise<Record<string, unknown>[]>} Itens publicados do catálogo.
 */
export async function listPublishedCatalog() {
    const db = await getDb();
    const contents = await db
        .collection("contents")
        .find({ status: "published" })
        .sort({ publishedAt: -1, title: 1 })
        .toArray();

    return contents.map(publicContent);
}

/**
 * Lista itens de catálogo para roles editoriais.
 *
 * @returns {Promise<Record<string, unknown>[]>} Itens administrativos do catálogo.
 */
export async function listAdminCatalog() {
    const db = await getDb();
    const contents = await db
        .collection("contents")
        .find({})
        .sort({ updatedAt: -1 })
        .toArray();

    return contents.map((content) => ({
        ...publicContent(content),
        status: content.status,
    }));
}

/**
 * Cria um conteúdo em rascunho.
 *
 * @param {Record<string, unknown>} input - Catalog dados.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Conteúdo criado.
 */
export async function createContent(input, userId) {
    await ensureCatalogIndexes();

    const db = await getDb();
    const now = new Date();
    const payload = assertCatalogPayload(input);

    await assertExistingTaxonomies(db, payload.taxonomyIds);

    const document = {
        ...payload,
        status: "draft",
        createdBy: new ObjectId(userId),
        updatedBy: new ObjectId(userId),
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
    };

    try {
        const result = await db.collection("contents").insertOne(document);
        return {
            ...publicContent({ ...document, _id: result.insertedId }),
            status: document.status,
        };
    } catch (error) {
        if (error.code === 11000) {
            throw new HttpError(409, "Slug de conteudo ja existe.");
        }

        throw error;
    }
}

/**
 * Atualiza um conteúdo e guarda uma revisão do estado anterior.
 *
 * @param {string} contentId - Id do conteúdo.
 * @param {Record<string, unknown>} input - Catalog dados.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Conteúdo atualizado.
 */
export async function updateContent(contentId, input, userId) {
    const db = await getDb();
    const _id = asContentObjectId(contentId);
    const existing = await db.collection("contents").findOne({ _id });

    if (!existing) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const payload = assertCatalogPayload(input);
    await assertExistingTaxonomies(db, payload.taxonomyIds);
    await saveRevision(db, existing, userId, "update");

    try {
        const updated = await db.collection("contents").findOneAndUpdate(
            { _id },
            {
                $set: {
                    ...payload,
                    updatedBy: new ObjectId(userId),
                    updatedAt: new Date(),
                },
            },
            { returnDocument: "after" },
        );

        return { ...publicContent(updated), status: updated.status };
    } catch (error) {
        if (error.code === 11000) {
            throw new HttpError(409, "Slug de conteudo ja existe.");
        }

        throw error;
    }
}

/**
 * Altera o estado de publicação de um conteúdo.
 *
 * @param {string} contentId - Id do conteúdo.
 * @param {unknown} estado - Novo estado.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Conteúdo atualizado.
 */
export async function changeContentStatus(contentId, status, userId) {
    const db = await getDb();
    const _id = asContentObjectId(contentId);
    const existing = await db.collection("contents").findOne({ _id });

    if (!existing) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const nextStatus = assertStatus(status);
    const now = new Date();

    await saveRevision(db, existing, userId, nextStatus);

    const updated = await db.collection("contents").findOneAndUpdate(
        { _id },
        {
            $set: {
                status: nextStatus,
                updatedBy: new ObjectId(userId),
                updatedAt: now,
                publishedAt:
                    nextStatus === "published"
                        ? now
                        : existing.publishedAt ?? null,
            },
        },
        { returnDocument: "after" },
    );

    return { ...publicContent(updated), status: updated.status };
}

/**
 * Lista revisões de conteúdo.
 *
 * @param {string} contentId - Id do conteúdo.
 * @returns {Promise<Record<string, unknown>[]>} Lista de revisões.
 */
export async function listContentRevisions(contentId) {
    const db = await getDb();
    const revisions = await db
        .collection("content_revisions")
        .find({ contentId: asContentObjectId(contentId) })
        .sort({ createdAt: -1 })
        .toArray();

    return revisions.map(publicRevision);
}

/**
 * Repõe conteúdo a partir de uma revisão anterior.
 *
 * @param {string} contentId - Id do conteúdo.
 * @param {string} revisionId - Revision id.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Conteúdo atualizado.
 */
export async function revertContentRevision(contentId, revisionId, userId) {
    const db = await getDb();
    const contentObjectId = asContentObjectId(contentId);
    const revisionObjectId = asRevisionObjectId(revisionId);
    const existing = await db
        .collection("contents")
        .findOne({ _id: contentObjectId });

    if (!existing) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const revision = await db.collection("content_revisions").findOne({
        _id: revisionObjectId,
        contentId: contentObjectId,
    });

    if (!revision) {
        throw new HttpError(404, "Revisao nao encontrada.");
    }

    await saveRevision(db, existing, userId, "revert");

    const snapshot = revision.snapshot;
    const updated = await db.collection("contents").findOneAndUpdate(
        { _id: contentObjectId },
        {
            $set: {
                title: snapshot.title,
                slug: snapshot.slug,
                synopsis: snapshot.synopsis,
                type: snapshot.type,
                durationSeconds: snapshot.durationSeconds,
                ageRating: snapshot.ageRating,
                status: snapshot.status,
                taxonomyIds: snapshot.taxonomyIds ?? [],
                assets: snapshot.assets,
                media: snapshot.media,
                tracks: snapshot.tracks ?? { subtitles: [], audio: [] },
                qualityOptions: snapshot.qualityOptions ?? [],
                publishedAt: snapshot.publishedAt ?? null,
                updatedBy: new ObjectId(userId),
                updatedAt: new Date(),
            },
        },
        { returnDocument: "after" },
    );

    return { ...publicContent(updated), status: updated.status };
}

/**
 * Constrói uma query de detalhe público para ObjectId ou slug.
 *
 * @param {string} idOrSlug - Identificador público.
 * @returns {Record<string, unknown>} Query MongoDB.
 */
function buildPublishedDetailQuery(idOrSlug) {
    const value = String(idOrSlug ?? "").trim();

    if (ObjectId.isValid(value)) {
        return { _id: new ObjectId(value), status: "published" };
    }

    return { slug: value, status: "published" };
}

/**
 * Obtém o detalhe de um conteúdo publicado por id ou slug.
 *
 * @param {string} idOrSlug - Content id or slug.
 * @returns {Promise<Record<string, unknown>>} Detalhe público.
 */
export async function getPublishedContentDetail(idOrSlug) {
    const db = await getDb();
    const content = await db
        .collection("contents")
        .findOne(buildPublishedDetailQuery(idOrSlug));

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    return publicContent(content);
}
