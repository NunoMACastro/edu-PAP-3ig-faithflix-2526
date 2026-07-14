/**
 * @file Leitura unificada das outboxes locais de reset e notificações.
 */

import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
    isDemoMailboxEnvironmentEnabled,
    isLoopbackAddress,
} from "./demo-mailbox.config.js";
import { assertDemoMailboxQuery } from "./demo-mailbox.validation.js";

const MAILBOX_LIMIT = 50;

/**
 * Devolve sempre o mesmo 404 para ambiente, base ou origem inadequados.
 *
 * @returns {HttpError} Erro que não revela qual dos guards falhou.
 */
function unavailableError() {
    return new HttpError(
        404,
        "Recurso não encontrado.",
        undefined,
        "DEMO_MAILBOX_NOT_FOUND",
    );
}

/**
 * Converte uma mensagem de reset num DTO sem ids de utilizador internos.
 *
 * @param {Record<string, unknown>} row Documento da outbox de reset.
 * @returns {Record<string, unknown>} Mensagem visível na demo.
 */
function resetMessage(row) {
    return {
        id: `reset:${String(row._id)}`,
        kind: "password_reset",
        toEmail: row.email,
        subject: "Recuperação de password",
        message: "Utiliza o código abaixo para definir uma nova password.",
        resetToken: row.resetToken,
        createdAt: row.createdAt,
        expiresAt: row.expiresAt,
    };
}

/**
 * Converte uma notificação simulada num DTO sem ids internos.
 *
 * @param {Record<string, unknown>} row Documento da outbox de email.
 * @returns {Record<string, unknown>} Mensagem visível na demo.
 */
function notificationMessage(row) {
    return {
        id: `notification:${String(row._id)}`,
        kind: "notification",
        toEmail: row.toEmail,
        notificationType: row.notificationType,
        subject: row.subject,
        message: row.message,
        createdAt: row.createdAt,
        expiresAt: row.expiresAt,
    };
}

/**
 * Lista as mensagens locais recentes para um email exato.
 *
 * O guard consulta `socket.remoteAddress`, nunca `X-Forwarded-For`, e volta a
 * confirmar a base efetiva para que uma montagem acidental permaneça 404.
 *
 * @param {unknown} input Corpo `{ email }`.
 * @param {{ remoteAddress?: string, source?: Record<string, unknown>, db?: import("mongodb").Db, now?: Date }} [options] Dependências observáveis em teste.
 * @returns {Promise<{ messages: Record<string, unknown>[] }>} Mensagens ordenadas da mais recente para a mais antiga.
 */
export async function listDemoMailbox(input, options = {}) {
    const db = options.db ?? (await getDb());
    const databaseName = String(
        db.databaseName ?? options.source?.MONGODB_DB_NAME ?? "",
    );
    if (
        !isDemoMailboxEnvironmentEnabled(
            options.source ?? process.env,
            databaseName,
        ) ||
        !isLoopbackAddress(options.remoteAddress)
    ) {
        throw unavailableError();
    }

    const { email } = assertDemoMailboxQuery(input);
    const now = options.now instanceof Date ? new Date(options.now) : new Date();
    const [resets, notifications] = await Promise.all([
        db.collection("password_reset_dev_outbox")
            .find({ email, expiresAt: { $gt: now } })
            .sort({ createdAt: -1 })
            .limit(MAILBOX_LIMIT)
            .toArray(),
        db.collection("demo_email_outbox")
            .find({ toEmail: email, expiresAt: { $gt: now } })
            .sort({ createdAt: -1 })
            .limit(MAILBOX_LIMIT)
            .toArray(),
    ]);
    const messages = [
        ...resets.map(resetMessage),
        ...notifications.map(notificationMessage),
    ]
        .sort(
            (left, right) =>
                new Date(right.createdAt).getTime() -
                new Date(left.createdAt).getTime(),
        )
        .slice(0, MAILBOX_LIMIT);

    return { messages };
}
