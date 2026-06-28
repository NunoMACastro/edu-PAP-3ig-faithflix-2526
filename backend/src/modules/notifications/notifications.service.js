/**
 * @file Serviços de negócio do módulo de notificações.
 *
 * Centraliza pertença, deduplicação e validação de tipos para garantir que cada
 * utilizador só lê e altera notificações pertencentes à própria sessão.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import {
  assertNotificationContent,
  assertNotificationType,
  assertPreferencePayload,
} from "./notifications.validation.js";

/**
 * Converte o identificador de utilizador em `ObjectId`.
 *
 * @param {string} userId Identificador do utilizador.
 * @returns {ObjectId} Identificador pronto para filtros MongoDB.
 * @throws {Error} Quando o identificador é inválido.
 */
function asUserObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    const error = new Error("Utilizador inválido.");
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(userId);
}

/**
 * Converte o identificador de notificação em `ObjectId`.
 *
 * @param {string} notificationId Identificador da notificação.
 * @returns {ObjectId} Identificador pronto para filtros MongoDB.
 * @throws {Error} Quando o identificador é inválido.
 */
function asNotificationObjectId(notificationId) {
  if (!ObjectId.isValid(notificationId)) {
    const error = new Error("Notificação inválida.");
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(notificationId);
}

/**
 * Remove campos internos antes de devolver uma notificação.
 *
 * @param {Record<string, unknown>} notification Documento MongoDB de `notifications`.
 * @returns {object} Notificação pública para a API.
 */
function publicNotification(notification) {
  return {
    id: String(notification._id),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    readAt: notification.readAt ?? null,
    createdAt: notification.createdAt,
  };
}

/**
 * Cria índices usados por preferências, listagem e deduplicação.
 *
 * @returns {Promise<void>}
 */
export async function ensureNotificationIndexes() {
  const db = await getDb();

  await db.collection("notification_preferences").createIndex({ userId: 1 }, { unique: true });
  await db.collection("notifications").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("notifications").createIndex(
    { userId: 1, type: 1, dedupeKey: 1 },
    { unique: true, partialFilterExpression: { dedupeKey: { $exists: true } } },
  );
}

/**
 * Obtém preferências de notificação do utilizador.
 *
 * @param {string} userId Identificador do utilizador.
 * @returns {Promise<{ preferences: object }>} Preferências persistidas ou valores por defeito.
 */
export async function getPreferences(userId) {
  const db = await getDb();
  const userObjectId = asUserObjectId(userId);
  const preferences = await db
    .collection("notification_preferences")
    .findOne({ userId: userObjectId });

  return {
    preferences: preferences?.settings ?? {
      inApp: true,
      email: false,
      continueWatching: true,
    },
  };
}

/**
 * Atualiza preferências de notificação do utilizador.
 *
 * @param {string} userId Identificador do utilizador.
 * @param {Record<string, unknown>} input Dados recebido da API.
 * @returns {Promise<{ preferences: object }>} Preferências normalizadas.
 */
export async function updatePreferences(userId, input) {
  const db = await getDb();
  const userObjectId = asUserObjectId(userId);
  const settings = assertPreferencePayload(input);

  // `upsert` cria preferências na primeira visita sem exigir passo de inicialização.
  await db.collection("notification_preferences").updateOne(
    { userId: userObjectId },
    {
      $set: { settings, updatedAt: new Date() },
      $setOnInsert: { userId: userObjectId, createdAt: new Date() },
    },
    { upsert: true },
  );

  return { preferences: settings };
}

/**
 * Cria uma notificação respeitando preferências e deduplicação.
 *
 * @param {string} userId Identificador do utilizador.
 * @param {Record<string, unknown>} input Dados da notificação.
 * @returns {Promise<{ notification: object | null, skipped: boolean }>} Resultado da entrega.
 */
export async function createNotification(userId, input) {
  const db = await getDb();
  const userObjectId = asUserObjectId(userId);
  const { preferences } = await getPreferences(userId);

  // Se o utilizador desligou notificações internas, o evento fica sem entrega in-app.
  if (!preferences.inApp) {
    return { notification: null, skipped: true };
  }

  const type = assertNotificationType(input.type);

  // A preferência granular só bloqueia alertas de continuidade, não eventos transacionais.
  if (type === "continue_watching" && !preferences.continueWatching) {
    return { notification: null, skipped: true };
  }

  const content = assertNotificationContent(input);
  const dedupeKey = input.dedupeKey ? String(input.dedupeKey).trim() : null;

  if (dedupeKey) {
    // A deduplicação evita repetir alertas para o mesmo conteúdo ou evento.
    const existing = await db.collection("notifications").findOne({
      userId: userObjectId,
      type,
      dedupeKey,
    });

    if (existing) {
      return { notification: publicNotification(existing), skipped: true };
    }
  }

  const notification = {
    userId: userObjectId,
    type,
    title: content.title,
    message: content.message,
    ...(dedupeKey ? { dedupeKey } : {}),
    readAt: null,
    createdAt: new Date(),
  };

  const result = await db.collection("notifications").insertOne(notification);

  return {
    notification: publicNotification({ ...notification, _id: result.insertedId }),
    skipped: false,
  };
}

/**
 * Cria alerta deduplicado para continuar visualização.
 *
 * @param {string} userId Identificador do utilizador.
 * @param {Record<string, unknown>} input Dados do conteúdo interrompido.
 * @returns {Promise<{ notification: object | null, skipped: boolean }>} Resultado da entrega.
 */
export async function createContinueWatchingNotification(userId, input) {
  const contentId = String(input.contentId ?? "").trim();
  const contentTitle = String(input.contentTitle ?? "um conteúdo").trim();

  if (!contentId) {
    const error = new Error("Conteúdo inválido para alerta de continuidade.");
    error.statusCode = 400;
    throw error;
  }

  return createNotification(userId, {
    type: "continue_watching",
    title: "Continua a ver",
    message: `Tens "${contentTitle}" por terminar.`,
    dedupeKey: `continue:${contentId}`,
  });
}

/**
 * Lista notificações do utilizador autenticado.
 *
 * @param {string} userId Identificador do utilizador.
 * @returns {Promise<{ notifications: object[] }>} Notificações ordenadas por data.
 */
export async function listMyNotifications(userId) {
  const db = await getDb();
  const notifications = await db
    .collection("notifications")
    .find({ userId: asUserObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return { notifications: notifications.map(publicNotification) };
}

/**
 * Marca uma notificação do utilizador como lida.
 *
 * @param {string} userId Identificador do utilizador.
 * @param {string} notificationId Identificador da notificação.
 * @returns {Promise<{ notification: object }>} Notificação atualizada.
 * @throws {Error} Quando a notificação não existe ou pertence a outro utilizador.
 */
export async function markNotificationAsRead(userId, notificationId) {
  const db = await getDb();

  // O filtro por `userId` impede marcar notificações pertencentes a outro utilizador.
  const notification = await db.collection("notifications").findOneAndUpdate(
    { _id: asNotificationObjectId(notificationId), userId: asUserObjectId(userId) },
    { $set: { readAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!notification) {
    const error = new Error("Notificação não encontrada.");
    error.statusCode = 404;
    throw error;
  }

  return { notification: publicNotification(notification) };
}
