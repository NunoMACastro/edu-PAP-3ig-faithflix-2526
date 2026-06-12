import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { assertCatalogPayload, assertStatus } from "./catalog.validation.js";

/**
 * Converts a content id into a MongoDB ObjectId.
 *
 * @param {string} id - Content id.
 * @returns {import("mongodb").ObjectId} MongoDB ObjectId.
 */
function asContentObjectId(id) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, "Conteudo invalido.");
    }

    return new ObjectId(id);
}

/**
 * Converts a revision id into a MongoDB ObjectId.
 *
 * @param {string} id - Revision id.
 * @returns {import("mongodb").ObjectId} MongoDB ObjectId.
 */
function asRevisionObjectId(id) {
    if (!ObjectId.isValid(id)) {
        throw new HttpError(400, "Revisao invalida.");
    }

    return new ObjectId(id);
}

/**
 * Converts an internal content document into the public API shape.
 *
 * @param {Record<string, unknown> & { _id: import("mongodb").ObjectId }} content - MongoDB content document.
 * @returns {Record<string, unknown>} Public content.
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
 * Converts an internal revision document into a safe API response.
 *
 * @param {Record<string, unknown> & { _id: import("mongodb").ObjectId }} revision - Revision document.
 * @returns {Record<string, unknown>} Public revision.
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
 * Saves the previous content state before an editorial change.
 *
 * @param {import("mongodb").Db} db - MongoDB database.
 * @param {Record<string, unknown>} content - Existing content document.
 * @param {string} userId - Authenticated editor id.
 * @param {string} action - Revision action label.
 * @returns {Promise<void>} Resolves after inserting the revision.
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
 * @param {import("mongodb").Db} db - MongoDB database.
 * @param {import("mongodb").ObjectId[]} taxonomyIds - Referenced taxonomy ids.
 * @returns {Promise<void>} Resolves when all taxonomies exist.
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
 * Ensures indexes used by catalog and revisions exist.
 *
 * @returns {Promise<void>} Resolves after index creation.
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
 * Lists public published content.
 *
 * @returns {Promise<Record<string, unknown>[]>} Published catalog items.
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
 * Lists catalog items for editorial roles.
 *
 * @returns {Promise<Record<string, unknown>[]>} Admin catalog items.
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
 * Creates a draft content item.
 *
 * @param {Record<string, unknown>} input - Catalog payload.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Created content.
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
 * Updates a content item and stores a revision of the previous state.
 *
 * @param {string} contentId - Content id.
 * @param {Record<string, unknown>} input - Catalog payload.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Updated content.
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
 * Changes a content publication status.
 *
 * @param {string} contentId - Content id.
 * @param {unknown} status - New status.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Updated content.
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
 * Lists content revisions.
 *
 * @param {string} contentId - Content id.
 * @returns {Promise<Record<string, unknown>[]>} Revision list.
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
 * Reverts content to a previous revision snapshot.
 *
 * @param {string} contentId - Content id.
 * @param {string} revisionId - Revision id.
 * @param {string} userId - Authenticated editor id.
 * @returns {Promise<Record<string, unknown>>} Updated content.
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
 * Builds a public-detail query for ObjectId or slug.
 *
 * @param {string} idOrSlug - Public identifier.
 * @returns {Record<string, unknown>} MongoDB query.
 */
function buildPublishedDetailQuery(idOrSlug) {
    const value = String(idOrSlug ?? "").trim();

    if (ObjectId.isValid(value)) {
        return { _id: new ObjectId(value), status: "published" };
    }

    return { slug: value, status: "published" };
}

/**
 * Gets one published content detail by id or slug.
 *
 * @param {string} idOrSlug - Content id or slug.
 * @returns {Promise<Record<string, unknown>>} Public detail.
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
