import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";

const USER_EXPORT_COLLECTIONS = [
    "playback_progress",
    "media_preferences",
    "user_content_lists",
    "content_ratings",
    "content_comments",
    "subscriptions",
    "payment_attempts",
    "trials",
    "notification_preferences",
    "notifications",
];

/**
 * Converte o id vindo da sessão para `ObjectId`.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {ObjectId} Id convertido para consultas MongoDB.
 * @throws {HttpError} Quando o id da sessão não é válido.
 */
function asUserObjectId(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new HttpError(400, "Utilizador inválido.");
    }

    return new ObjectId(userId);
}

/**
 * Converte valores MongoDB para JSON legível e estável.
 *
 * @param {unknown} value Valor vindo da base de dados.
 * @returns {unknown} Valor seguro para serialização.
 */
function toExportValue(value) {
    if (value instanceof ObjectId) {
        return String(value);
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (Array.isArray(value)) {
        return value.map(toExportValue);
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, nested]) => [
                key,
                toExportValue(nested),
            ]),
        );
    }

    return value;
}

/**
 * Remove campos internos do documento de utilizador.
 *
 * @param {Record<string, unknown>} user Documento `users`.
 * @returns {Record<string, unknown>} Dados públicos da conta para exportação.
 */
function toExportableUser(user) {
    return toExportValue({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        parentalMaxAgeRating: user.parentalMaxAgeRating ?? 18,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
}

/**
 * Remove campos técnicos que não acrescentam transparência ao utilizador.
 *
 * @param {Record<string, unknown>} row Documento de uma coleção associada ao utilizador.
 * @returns {Record<string, unknown>} Documento serializável sem campos internos perigosos.
 */
function toExportableRow(row) {
    const { passwordHash, tokenHash, sessionToken, cookie, ...safeRow } = row;
    return toExportValue(safeRow);
}

/**
 * Carrega documentos de uma coleção filtrando sempre pelo dono autenticado.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {string} collectionName Nome da coleção a exportar.
 * @param {ObjectId} userObjectId Id do utilizador autenticado.
 * @returns {Promise<Record<string, unknown>[]>} Documentos exportáveis.
 */
async function exportOwnedCollection(db, collectionName, userObjectId) {
    const rows = await db
        .collection(collectionName)
        .find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .toArray();

    return rows.map(toExportableRow);
}

/**
 * Gera a exportação RGPD do utilizador autenticado.
 *
 * @param {string} userId Id do utilizador obtido em `req.user.id`.
 * @returns {Promise<{ generatedAt: string, user: Record<string, unknown>, sections: Record<string, Record<string, unknown>[]> }>} Exportação completa.
 * @throws {HttpError} Quando a conta não existe.
 */
export async function buildUserDataExport(userId) {
    const db = await getDb();
    const userObjectId = asUserObjectId(userId);
    const user = await db.collection("users").findOne({ _id: userObjectId });

    if (!user) {
        throw new HttpError(404, "Utilizador não encontrado.");
    }

    const sectionEntries = await Promise.all(
        USER_EXPORT_COLLECTIONS.map(async (collectionName) => [
            collectionName,
            await exportOwnedCollection(db, collectionName, userObjectId),
        ]),
    );

    return {
        generatedAt: new Date().toISOString(),
        user: toExportableUser(user),
        sections: Object.fromEntries(sectionEntries),
    };
}