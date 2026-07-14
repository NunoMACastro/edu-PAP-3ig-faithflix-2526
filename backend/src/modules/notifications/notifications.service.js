/**
 * @file Serviços de negócio do módulo de notificações.
 *
 * Centraliza pertença, deduplicação e validação de tipos para garantir que cada
 * utilizador só lê e altera notificações pertencentes à própria sessão.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { paginationMetadata } from "../../utils/pagination.js";
import { isIntegrationEnabled } from "../integrations/integrations.service.js";
import {
  assertNotificationContent,
  assertNotificationType,
  assertPreferencePayload,
  parseNotificationPagination,
} from "./notifications.validation.js";

const TRANSACTIONAL_NOTIFICATION_TYPES = new Set([
  "subscription_activated",
  "payment_failed",
  "trial_started",
  "family_invitation",
  "family_invitation_accepted",
  "family_member_removed",
]);
const EMAIL_OUTBOX_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const title = String(notification.title ?? "").replace(
    /^Notificação demo (\d+)$/iu,
    "Atualização FaithFlix $1",
  );
  const message = String(notification.message ?? "").replace(
    "Evento representativo da atividade FaithFlix de demonstração.",
    "Há uma nova atualização na tua conta FaithFlix.",
  );

  return {
    id: String(notification._id),
    type: notification.type,
    title,
    message,
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
  await db.collection("demo_email_outbox").createIndex(
    { toEmail: 1, createdAt: -1 },
    { name: "demo_email_outbox_mailbox" },
  );
  await db.collection("demo_email_outbox").createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: "demo_email_outbox_ttl" },
  );
  await db.collection("demo_email_outbox").createIndex(
    { userId: 1, notificationType: 1, dedupeKey: 1 },
    {
      unique: true,
      name: "demo_email_outbox_notification_dedupe",
      partialFilterExpression: { dedupeKey: { $type: "string" } },
    },
  );
}

/**
 * Coloca uma mensagem de notificação na outbox local quando o utilizador
 * optou explicitamente pelo canal email.
 *
 * A função falha fechada para contas/email legacy inválidos e reutiliza a
 * sessão do domínio para não publicar mensagens de transações abortadas.
 *
 * @param {ObjectId} userId Utilizador validado.
 * @param {{ type: string, title: string, message: string, dedupeKey: string | null }} input Mensagem canónica.
 * @param {{ db: import("mongodb").Db, session?: import("mongodb").ClientSession, now?: Date }} options Contexto persistente.
 * @returns {Promise<boolean>} Verdadeiro quando foi criada uma nova mensagem.
 */
async function enqueueEmailNotification(userId, input, options) {
  const user = await options.db.collection("users").findOne(
    { _id: userId },
    {
      session: options.session,
      projection: { email: 1, accountStatus: 1 },
    },
  );
  const toEmail = typeof user?.email === "string"
    ? user.email.trim().toLowerCase()
    : "";

  if (
    !EMAIL_PATTERN.test(toEmail) ||
    (user?.accountStatus ?? "active") !== "active"
  ) {
    return false;
  }

  const now = options.now instanceof Date ? new Date(options.now) : new Date();
  const document = {
    kind: "notification",
    userId,
    toEmail,
    notificationType: input.type,
    subject: input.title,
    message: input.message,
    ...(input.dedupeKey ? { dedupeKey: input.dedupeKey } : {}),
    createdAt: now,
    expiresAt: new Date(now.getTime() + EMAIL_OUTBOX_TTL_MS),
  };
  const collection = options.db.collection("demo_email_outbox");

  if (input.dedupeKey) {
    const result = await collection.updateOne(
      {
        userId,
        notificationType: input.type,
        dedupeKey: input.dedupeKey,
      },
      { $setOnInsert: document },
      { upsert: true, session: options.session },
    );
    return Boolean(result.upsertedId || result.upsertedCount);
  }

  await collection.insertOne(document, { session: options.session });
  return true;
}

/**
 * Obtém preferências de notificação do utilizador.
 *
 * @param {string} userId Identificador do utilizador.
 * @param {{ db?: import("mongodb").Db, session?: import("mongodb").ClientSession }} [options] Contexto transacional opcional.
 * @returns {Promise<{ preferences: object }>} Preferências persistidas ou valores por defeito.
 */
export async function getPreferences(userId, options = {}) {
  const db = options.db ?? (await getDb());
  const userObjectId = asUserObjectId(userId);
  const preferences = await db
    .collection("notification_preferences")
    .findOne({ userId: userObjectId }, { session: options.session });

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
 * @param {{ db?: import("mongodb").Db, session?: import("mongodb").ClientSession, now?: Date }} [options] Contexto transacional opcional.
 * @returns {Promise<{ notification: object | null, skipped: boolean, deliveries: { inApp: boolean, email: boolean } }>} Resultado da entrega.
 */
export async function createNotification(userId, input, options = {}) {
  const db = options.db ?? (await getDb());
  const { session } = options;
  const userObjectId = asUserObjectId(userId);
  const type = assertNotificationType(input.type);
  // O driver MongoDB não suporta operações paralelas na mesma transação.
  const { preferences } = await getPreferences(userId, { db, session });
  const privacyConsent = await db.collection("user_consents").findOne(
    { userId: userObjectId },
    { session },
  );
  const isTransactional = TRANSACTIONAL_NOTIFICATION_TYPES.has(type);

  // A preferência granular só bloqueia alertas de continuidade, não eventos transacionais.
  if (
    type === "continue_watching" &&
    (!preferences.continueWatching ||
      privacyConsent?.consents?.operationalNotifications === false)
  ) {
    return {
      notification: null,
      skipped: true,
      deliveries: { inApp: false, email: false },
    };
  }

  const content = assertNotificationContent(input);
  const dedupeKey = input.dedupeKey ? String(input.dedupeKey).trim() : null;
  const optionalNotificationsEnabled =
    isTransactional ||
    await isIntegrationEnabled("internal_notifications", { db, session });
  const deliverInApp =
    isTransactional ||
    (preferences.inApp === true && optionalNotificationsEnabled);
  const deliverEmail =
    preferences.email === true &&
    (isTransactional || optionalNotificationsEnabled);

  if (!deliverInApp && !deliverEmail) {
    return {
      notification: null,
      skipped: true,
      deliveries: { inApp: false, email: false },
    };
  }

  let existing = null;

  if (deliverInApp && dedupeKey) {
    // A deduplicação evita repetir alertas para o mesmo conteúdo ou evento.
    existing = await db.collection("notifications").findOne(
      { userId: userObjectId, type, dedupeKey },
      { session },
    );
  }

  const emailQueued = deliverEmail
    ? await enqueueEmailNotification(
        userObjectId,
        { type, ...content, dedupeKey },
        { db, session, now: options.now },
      )
    : false;

  if (existing) {
    return {
      notification: publicNotification(existing),
      skipped: true,
      deliveries: { inApp: false, email: emailQueued },
    };
  }

  if (!deliverInApp) {
    return {
      notification: null,
      skipped: !emailQueued,
      deliveries: { inApp: false, email: emailQueued },
    };
  }

  const createdAt = options.now instanceof Date ? new Date(options.now) : new Date();
  const notification = {
    userId: userObjectId,
    type,
    title: content.title,
    message: content.message,
    ...(dedupeKey ? { dedupeKey } : {}),
    readAt: null,
    createdAt,
  };

  const result = await db
    .collection("notifications")
    .insertOne(notification, { session });

  return {
    notification: publicNotification({ ...notification, _id: result.insertedId }),
    skipped: false,
    deliveries: { inApp: true, email: emailQueued },
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
 * @param {Record<string, unknown>} [query={}] Query de paginacao.
 * @returns {Promise<{ notifications: object[], page: number, limit: number, total: number, totalPages: number }>} Página de notificações ordenada por data.
 */
export async function listMyNotifications(userId, query = {}) {
  const db = await getDb();
  const filter = { userId: asUserObjectId(userId) };
  const { page, limit } = parseNotificationPagination(query);
  const collection = db.collection("notifications");
  const [notifications, total] = await Promise.all([
    collection
    .find(filter)
    .sort({ createdAt: -1, _id: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray(),
    collection.countDocuments(filter),
  ]);

  return {
    notifications: notifications.map(publicNotification),
    ...paginationMetadata({ page, limit, total }),
  };
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
