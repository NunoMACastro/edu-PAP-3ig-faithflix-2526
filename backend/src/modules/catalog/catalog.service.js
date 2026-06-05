import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertCatalogPayload, assertStatus } from "./catalog.validation.js";

function asContentObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const error = new Error("Conteudo invalido.");
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

function asRevisionObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const error = new Error("Revisao invalida.");
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

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
    assets: content.assets,
    media: content.media,
    publishedAt: content.publishedAt ?? null,
  };
}

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

async function saveRevision(db, content, userId, action) {
  await db.collection("content_revisions").insertOne({
    contentId: content._id,
    action,
    snapshot: content,
    changedBy: new ObjectId(userId),
    createdAt: new Date(),
  });
}

function buildPublishedDetailQuery(idOrSlug) {
  const value = String(idOrSlug ?? "").trim();

  if (ObjectId.isValid(value)) {
    return { _id: new ObjectId(value), status: "published" };
  }

  return { slug: value, status: "published" };
}

export async function getPublishedContentDetail(idOrSlug) {
  const db = await getDb();
  const content = await db.collection("contents").findOne(buildPublishedDetailQuery(idOrSlug));

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return publicContent(content);
}

async function assertExistingTaxonomies(db, taxonomyIds) {
  if (taxonomyIds.length === 0) {
    return;
  }

  const existing = await db
    .collection("taxonomies")
    .find({ _id: { $in: taxonomyIds } }, { projection: { _id: 1 } })
    .toArray();

  if (existing.length !== taxonomyIds.length) {
    const error = new Error("Uma ou mais taxonomias nao existem.");
    error.statusCode = 400;
    throw error;
  }
}

export async function ensureCatalogIndexes() {
  const db = await getDb();
  await db.collection("contents").createIndex({ slug: 1 }, { unique: true });
  await db.collection("contents").createIndex({ status: 1, publishedAt: -1 });
  await db.collection("taxonomies").createIndex({ slug: 1 }, { unique: true });
}

export async function listPublishedCatalog() {
  const db = await getDb();
  const contents = await db
    .collection("contents")
    .find({ status: "published" })
    .sort({ publishedAt: -1, title: 1 })
    .toArray();

  return contents.map(publicContent);
}

export async function listAdminCatalog() {
  const db = await getDb();
  const contents = await db.collection("contents").find({}).sort({ updatedAt: -1 }).toArray();
  return contents.map((content) => ({ ...publicContent(content), status: content.status }));
}

export async function createContent(input, userId) {
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

  const result = await db.collection("contents").insertOne(document);
  return { ...publicContent({ ...document, _id: result.insertedId }), status: document.status };
}

export async function updateContent(contentId, input, userId) {
  const db = await getDb();
  const _id = asContentObjectId(contentId);
  const existing = await db.collection("contents").findOne({ _id });

  if (!existing) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const payload = assertCatalogPayload(input);
  await assertExistingTaxonomies(db, payload.taxonomyIds);
  await saveRevision(db, existing, userId, "update");

  const updated = await db.collection("contents").findOneAndUpdate(
    { _id },
    { $set: { ...payload, updatedBy: new ObjectId(userId), updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  return { ...publicContent(updated), status: updated.status };
}

export async function changeContentStatus(contentId, status, userId) {
  const db = await getDb();
  const _id = asContentObjectId(contentId);
  const existing = await db.collection("contents").findOne({ _id });

  if (!existing) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
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
        publishedAt: nextStatus === "published" ? now : existing.publishedAt ?? null,
      },
    },
    { returnDocument: "after" },
  );

  return { ...publicContent(updated), status: updated.status };
}

export async function listContentRevisions(contentId) {
  const db = await getDb();
  const contentObjectId = asContentObjectId(contentId);
  const revisions = await db
    .collection("content_revisions")
    .find({ contentId: contentObjectId })
    .sort({ createdAt: -1 })
    .toArray();

  return revisions.map(publicRevision);
}

export async function revertContentRevision(contentId, revisionId, userId) {
  const db = await getDb();
  const contentObjectId = asContentObjectId(contentId);
  const revisionObjectId = asRevisionObjectId(revisionId);
  const existing = await db.collection("contents").findOne({ _id: contentObjectId });

  if (!existing) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const revision = await db.collection("content_revisions").findOne({
    _id: revisionObjectId,
    contentId: contentObjectId,
  });

  if (!revision) {
    const error = new Error("Revisao nao encontrada.");
    error.statusCode = 404;
    throw error;
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
        publishedAt: snapshot.publishedAt ?? null,
        updatedBy: new ObjectId(userId),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  return { ...publicContent(updated), status: updated.status };
}