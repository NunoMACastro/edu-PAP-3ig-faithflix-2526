/**
 * @file Serviço editorial de passagens bíblicas e respetivas associações a conteúdos.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { getEpisodeSeries } from "../catalog/catalog-hierarchy.js";
import {
    asObjectId,
    assertBiblicalPassageAssociationPayload,
    assertBiblicalPassagePayload,
    assertBiblicalPassageStatus,
    parseBiblicalPassagePagination,
} from "./biblical-passages.validation.js";

/**
 * Cria os índices usados pelo módulo de passagens.
 *
 * @returns {Promise<void>} Termina depois da criação de índices.
 */
export async function ensureBiblicalPassageIndexes() {
    const db = await getDb();

    await db
        .collection("biblical_passages")
        .createIndex({ status: 1, book: 1, chapterStart: 1, verseStart: 1 });
    await db
        .collection("content_biblical_passages")
        .createIndex({ contentId: 1, sortOrder: 1 });
    await db
        .collection("content_biblical_passages")
        .createIndex({ contentId: 1, passageId: 1 }, { unique: true });
}

/**
 * Formata uma referência bíblica curta para a API pública.
 *
 * @param {Record<string, unknown>} passage Documento da passagem.
 * @returns {string} Referência legível.
 */
export function formatBiblicalReference(passage) {
    const start = `${passage.book} ${passage.chapterStart}:${passage.verseStart}`;

    if (
        passage.chapterEnd === passage.chapterStart &&
        passage.verseEnd === passage.verseStart
    ) {
        return start;
    }

    if (passage.chapterEnd === passage.chapterStart) {
        return `${start}-${passage.verseEnd}`;
    }

    return `${start}-${passage.chapterEnd}:${passage.verseEnd}`;
}

/**
 * Converte uma passagem interna numa resposta pública sem metadados editoriais.
 *
 * @param {Record<string, unknown>} passage Documento interno.
 * @param {Record<string, unknown>} [association={}] Associação opcional.
 * @returns {Record<string, unknown>} Passagem pública.
 */
export function publicBiblicalPassage(passage, association = {}) {
    return {
        id: String(passage._id),
        reference: formatBiblicalReference(passage),
        book: passage.book,
        chapterStart: passage.chapterStart,
        verseStart: passage.verseStart,
        chapterEnd: passage.chapterEnd,
        verseEnd: passage.verseEnd,
        translation: passage.translation,
        text: passage.text,
        theme: passage.theme ?? "",
        reflection: passage.reflection ?? "",
        note: association.note ?? "",
        sortOrder: association.sortOrder ?? 0,
    };
}

/**
 * Converte uma passagem para resposta administrativa.
 *
 * @param {Record<string, unknown>} passage Documento interno.
 * @returns {Record<string, unknown>} Passagem admin.
 */
function adminBiblicalPassage(passage) {
    return {
        ...publicBiblicalPassage(passage),
        status: passage.status,
        createdAt: passage.createdAt,
        updatedAt: passage.updatedAt,
        publishedAt: passage.publishedAt ?? null,
    };
}

/**
 * Converte uma associação para gestão editorial.
 *
 * @param {Record<string, unknown>} passage Passagem associada.
 * @param {Record<string, unknown>} association Documento de associação.
 * @param {import("mongodb").ObjectId} contentId Conteúdo consultado.
 * @returns {Record<string, unknown>} Associação admin.
 */
function adminBiblicalPassageAssociation(passage, association, contentId) {
    if (!passage) {
        return {
            id: String(association.passageId),
            passageId: String(association.passageId),
            contentId: String(contentId),
            reference: "Passagem removida",
            status: "missing",
            note: association.note ?? "",
            sortOrder: association.sortOrder ?? 0,
            createdAt: association.createdAt,
        };
    }

    return {
        ...publicBiblicalPassage(passage, association),
        passageId: String(passage._id),
        contentId: String(contentId),
        status: passage.status,
        createdAt: association.createdAt,
    };
}

/**
 * Constrói uma query pública por ObjectId ou slug de conteúdo.
 *
 * @param {unknown} idOrSlug Identificador de conteúdo.
 * @returns {Record<string, unknown>} Query MongoDB.
 */
function publishedContentQuery(idOrSlug) {
    const value = String(idOrSlug ?? "").trim();

    if (ObjectId.isValid(value)) {
        return { _id: new ObjectId(value), status: "published" };
    }

    return { slug: value, status: "published" };
}

/**
 * Lista passagens bíblicas já publicadas para consumo público.
 *
 * A função aplica paginação, ordena as passagens pela posição bíblica e converte
 * cada documento MongoDB para o formato seguro exposto ao frontend, sem campos
 * editoriais internos.
 *
 * @param {{ page?: unknown, limit?: unknown }} queryParams Parâmetros opcionais
 * de paginação recebidos da camada HTTP.
 * @returns {Promise<{ page: number, limit: number, total: number, items: Record<string, unknown>[] }>} Página de passagens públicas.
 */
export async function listPublishedBiblicalPassages(queryParams = {}) {
    const { page, limit } = parseBiblicalPassagePagination(queryParams);
    const db = await getDb();
    const filter = { status: "published" };
    const [passages, total] = await Promise.all([
        db
            .collection("biblical_passages")
            .find(filter)
            .sort({ book: 1, chapterStart: 1, verseStart: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        db.collection("biblical_passages").countDocuments(filter),
    ]);

    return {
        page,
        limit,
        total,
        items: passages.map((passage) => publicBiblicalPassage(passage)),
    };
}

/**
 * Obtém uma passagem publicada por id.
 *
 * @param {string} passageId Id público.
 * @returns {Promise<Record<string, unknown>>} Passagem pública.
 */
export async function getPublishedBiblicalPassage(passageId) {
    const db = await getDb();
    const passage = await db.collection("biblical_passages").findOne({
        _id: asObjectId(passageId, "Passagem biblica"),
        status: "published",
    });

    if (!passage) {
        throw new HttpError(404, "Passagem biblica nao encontrada.");
    }

    return publicBiblicalPassage(passage);
}

/**
 * Lista passagens bíblicas para a área administrativa.
 *
 * Ao contrário da listagem pública, inclui todos os estados editoriais e devolve
 * dados preparados para revisão, edição e publicação pela equipa de gestão.
 *
 * @param {{ page?: unknown, limit?: unknown }} queryParams Parâmetros opcionais
 * de paginação recebidos da camada HTTP.
 * @returns {Promise<{ page: number, limit: number, total: number, items: Record<string, unknown>[] }>} Página de passagens administrativas.
 */
export async function listAdminBiblicalPassages(queryParams = {}) {
    const { page, limit } = parseBiblicalPassagePagination(queryParams);
    const db = await getDb();
    const [passages, total] = await Promise.all([
        db
            .collection("biblical_passages")
            .find({})
            .sort({ updatedAt: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        db.collection("biblical_passages").countDocuments({}),
    ]);

    return {
        page,
        limit,
        total,
        items: passages.map(adminBiblicalPassage),
    };
}

/**
 * Cria uma passagem bíblica como rascunho editorial.
 *
 * @param {Record<string, unknown>} input Payload recebido.
 * @param {string} userId Editor autenticado.
 * @returns {Promise<Record<string, unknown>>} Passagem criada.
 */
export async function createBiblicalPassage(input, userId) {
    await ensureBiblicalPassageIndexes();

    const db = await getDb();
    const now = new Date();
    const editorId = asObjectId(userId, "Utilizador");
    const document = {
        ...assertBiblicalPassagePayload(input),
        status: "draft",
        createdBy: editorId,
        updatedBy: editorId,
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
    };

    const result = await db.collection("biblical_passages").insertOne(document);
    return adminBiblicalPassage({ ...document, _id: result.insertedId });
}

/**
 * Atualiza os campos editoriais de uma passagem existente.
 *
 * @param {string} passageId Id da passagem.
 * @param {Record<string, unknown>} input Payload recebido.
 * @param {string} userId Editor autenticado.
 * @returns {Promise<Record<string, unknown>>} Passagem atualizada.
 */
export async function updateBiblicalPassage(passageId, input, userId) {
    const db = await getDb();
    const _id = asObjectId(passageId, "Passagem biblica");
    const existing = await db.collection("biblical_passages").findOne({ _id });

    if (!existing) {
        throw new HttpError(404, "Passagem biblica nao encontrada.");
    }

    const updated = await db.collection("biblical_passages").findOneAndUpdate(
        { _id },
        {
            $set: {
                ...assertBiblicalPassagePayload(input),
                updatedBy: asObjectId(userId, "Utilizador"),
                updatedAt: new Date(),
            },
        },
        { returnDocument: "after" },
    );

    return adminBiblicalPassage(updated);
}

/**
 * Altera o estado editorial de uma passagem.
 *
 * @param {string} passageId Id da passagem.
 * @param {unknown} status Estado recebido.
 * @param {string} userId Editor autenticado.
 * @returns {Promise<Record<string, unknown>>} Passagem atualizada.
 */
export async function changeBiblicalPassageStatus(passageId, status, userId) {
    const db = await getDb();
    const _id = asObjectId(passageId, "Passagem biblica");
    const existing = await db.collection("biblical_passages").findOne({ _id });

    if (!existing) {
        throw new HttpError(404, "Passagem biblica nao encontrada.");
    }

    const nextStatus = assertBiblicalPassageStatus(status);
    const now = new Date();
    const updated = await db.collection("biblical_passages").findOneAndUpdate(
        { _id },
        {
            $set: {
                status: nextStatus,
                updatedBy: asObjectId(userId, "Utilizador"),
                updatedAt: now,
                publishedAt:
                    nextStatus === "published"
                        ? existing.publishedAt ?? now
                        : existing.publishedAt ?? null,
            },
        },
        { returnDocument: "after" },
    );

    return adminBiblicalPassage(updated);
}

/**
 * Lista passagens publicadas associadas a um conteúdo publicado.
 *
 * @param {string} idOrSlug Id ou slug público do conteúdo.
 * @returns {Promise<Record<string, unknown>[]>} Passagens associadas.
 */
export async function listBiblicalPassagesForPublishedContent(idOrSlug) {
    const db = await getDb();
    const content = await db
        .collection("contents")
        .findOne(publishedContentQuery(idOrSlug));

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    if (content.type === "episode") {
        await getEpisodeSeries(db, content.seriesId, { requirePublished: true });
    }

    const associations = await db
        .collection("content_biblical_passages")
        .find({ contentId: content._id })
        .sort({ sortOrder: 1, createdAt: 1 })
        .toArray();

    if (associations.length === 0) {
        return [];
    }

    const passages = await db
        .collection("biblical_passages")
        .find({
            _id: { $in: associations.map((association) => association.passageId) },
            status: "published",
        })
        .toArray();
    const passageById = new Map(
        passages.map((passage) => [String(passage._id), passage]),
    );

    return associations
        .map((association) => {
            const passage = passageById.get(String(association.passageId));
            return passage ? publicBiblicalPassage(passage, association) : null;
        })
        .filter(Boolean);
}

/**
 * Lista todas as associações de passagens de um conteúdo para administração.
 *
 * @param {string} contentId Id do conteúdo.
 * @returns {Promise<Record<string, unknown>[]>} Associações admin.
 */
export async function listAdminBiblicalPassagesForContent(contentId) {
    const db = await getDb();
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const content = await db.collection("contents").findOne({ _id: contentObjectId });

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    const associations = await db
        .collection("content_biblical_passages")
        .find({ contentId: contentObjectId })
        .sort({ sortOrder: 1, createdAt: 1 })
        .toArray();

    if (associations.length === 0) {
        return [];
    }

    const passages = await db
        .collection("biblical_passages")
        .find({
            _id: { $in: associations.map((association) => association.passageId) },
        })
        .toArray();
    const passageById = new Map(
        passages.map((passage) => [String(passage._id), passage]),
    );

    return associations.map((association) =>
        adminBiblicalPassageAssociation(
            passageById.get(String(association.passageId)),
            association,
            contentObjectId,
        ),
    );
}

/**
 * Associa uma passagem a um conteúdo existente de forma idempotente.
 *
 * @param {string} contentId Id do conteúdo.
 * @param {Record<string, unknown>} input Payload recebido.
 * @param {string} userId Editor autenticado.
 * @returns {Promise<Record<string, unknown>>} Associação pública.
 */
export async function linkBiblicalPassageToContent(contentId, input, userId) {
    await ensureBiblicalPassageIndexes();

    const db = await getDb();
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const payload = assertBiblicalPassageAssociationPayload(input);
    const [content, passage] = await Promise.all([
        db.collection("contents").findOne({ _id: contentObjectId }),
        db.collection("biblical_passages").findOne({ _id: payload.passageId }),
    ]);

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    if (!passage) {
        throw new HttpError(404, "Passagem biblica nao encontrada.");
    }

    const now = new Date();
    await db.collection("content_biblical_passages").updateOne(
        { contentId: contentObjectId, passageId: payload.passageId },
        {
            $set: {
                note: payload.note,
                sortOrder: payload.sortOrder,
                updatedAt: now,
            },
            $setOnInsert: {
                contentId: contentObjectId,
                passageId: payload.passageId,
                createdBy: asObjectId(userId, "Utilizador"),
                createdAt: now,
            },
        },
        { upsert: true },
    );

    return publicBiblicalPassage(passage, payload);
}

/**
 * Remove uma associação entre conteúdo e passagem.
 *
 * @param {string} contentId Id do conteúdo.
 * @param {string} passageId Id da passagem.
 * @returns {Promise<{ contentId: string, passageId: string, removed: boolean }>} Resultado.
 */
export async function unlinkBiblicalPassageFromContent(contentId, passageId) {
    const db = await getDb();
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const passageObjectId = asObjectId(passageId, "Passagem biblica");
    const result = await db.collection("content_biblical_passages").deleteOne({
        contentId: contentObjectId,
        passageId: passageObjectId,
    });

    return {
        contentId,
        passageId,
        removed: result.deletedCount > 0,
    };
}
