/**
 * @file Ficheiro `real_dev/backend/src/modules/ratings/ratings.service.js` da implementação real_dev.
 */

import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { asObjectId, assertRatingValue } from "./ratings.validation.js";

/**
 * Garante que classificações só podem apontar para conteúdo publicado.
 *
 * @param {import("mongodb").Db} db - Base de dados MongoDB.
 * @param {import("mongodb").ObjectId} contentId - ObjectId do conteúdo.
 * @returns {Promise<Record<string, unknown>>} Documento de conteúdo publicado.
 */
async function assertPublishedContent(db, contentId) {
    const content = await db.collection("contents").findOne({
        _id: contentId,
        status: "published",
    });

    if (!content) {
        throw new HttpError(404, "Conteudo nao encontrado.");
    }

    return content;
}

/**
 * Constrói um resumo vazio de classificação para conteúdo sem classificações.
 *
 * @param {string} contentId - Id público do conteúdo.
 * @returns {Record<string, unknown>} Resposta agregada vazia.
 */
function emptySummary(contentId) {
    return {
        contentId,
        average: 0,
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
}

/**
 * Cria índices exigidos pelo contrato de classificações.
 *
 * @returns {Promise<void>} Termina depois da criação de índices.
 */
export async function ensureRatingIndexes() {
    const db = await getDb();

    await db.collection("content_ratings").createIndex(
        { userId: 1, contentId: 1 },
        { unique: true },
    );
    await db.collection("content_ratings").createIndex({ contentId: 1 });
}

/**
 * Cria ou atualiza a classificação do utilizador autenticado para um conteúdo.
 *
 * @param {string} userId - Authenticated user id from the session.
 * @param {string} contentId - Id público do conteúdo vindo dos parâmetros da rota.
 * @param {unknown} value - Valor bruto da classificação.
 * @returns {Promise<Record<string, unknown>>} Estado de classificação gravado.
 */
export async function upsertRating(userId, contentId, value) {
    const userObjectId = asObjectId(userId, "Utilizador");
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const rating = assertRatingValue(value);
    await ensureRatingIndexes();

    const db = await getDb();
    const now = new Date();

    await assertPublishedContent(db, contentObjectId);

    await db.collection("content_ratings").updateOne(
        { userId: userObjectId, contentId: contentObjectId },
        {
            $set: { value: rating, updatedAt: now },
            $setOnInsert: {
                userId: userObjectId,
                contentId: contentObjectId,
                createdAt: now,
            },
        },
        { upsert: true },
    );

    return {
        contentId,
        value: rating,
        saved: true,
    };
}

/**
 * Devolve a classificação do utilizador autenticado para um conteúdo.
 *
 * @param {string} userId - Authenticated user id from the session.
 * @param {string} contentId - Id público do conteúdo vindo dos parâmetros da rota.
 * @returns {Promise<Record<string, unknown>>} Estado atual da classificação do utilizador.
 */
export async function getMyRating(userId, contentId) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const userObjectId = asObjectId(userId, "Utilizador");
    const db = await getDb();

    await assertPublishedContent(db, contentObjectId);

    const rating = await db.collection("content_ratings").findOne({
        userId: userObjectId,
        contentId: contentObjectId,
    });

    return {
        contentId,
        value: rating?.value ?? null,
    };
}

/**
 * Remove a classificação do utilizador autenticado para um conteúdo.
 *
 * @param {string} userId - Authenticated user id from the session.
 * @param {string} contentId - Id público do conteúdo vindo dos parâmetros da rota.
 * @returns {Promise<Record<string, unknown>>} Estado de classificação removida.
 */
export async function deleteMyRating(userId, contentId) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const userObjectId = asObjectId(userId, "Utilizador");
    const db = await getDb();

    await assertPublishedContent(db, contentObjectId);
    await db.collection("content_ratings").deleteOne({
        userId: userObjectId,
        contentId: contentObjectId,
    });

    return {
        contentId,
        value: null,
        saved: false,
    };
}

/**
 * Calcula o agregado público de classificações para um conteúdo publicado.
 *
 * @param {string} contentId - Id público do conteúdo vindo dos parâmetros da rota.
 * @returns {Promise<Record<string, unknown>>} Resumo de classificações.
 */
export async function getRatingSummary(contentId) {
    const contentObjectId = asObjectId(contentId, "Conteudo");
    const db = await getDb();

    await assertPublishedContent(db, contentObjectId);

    const rows = await db
        .collection("content_ratings")
        .aggregate([
            { $match: { contentId: contentObjectId } },
            {
                $group: {
                    _id: "$value",
                    count: { $sum: 1 },
                },
            },
        ])
        .toArray();

    if (rows.length === 0) {
        return emptySummary(contentId);
    }

    const summary = emptySummary(contentId);
    let weightedTotal = 0;

    for (const row of rows) {
        summary.distribution[row._id] = row.count;
        summary.total += row.count;
        weightedTotal += row._id * row.count;
    }

    summary.average = Number((weightedTotal / summary.total).toFixed(2));

    return summary;
}
