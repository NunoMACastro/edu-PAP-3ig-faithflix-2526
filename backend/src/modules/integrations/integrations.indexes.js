/**
 * @file Índices persistentes das configurações de integração.
 */

import { getDb } from "../../config/database.js";

/**
 * Garante uma única configuração por chave canónica.
 *
 * A criação falha perante duplicados legacy, impedindo que a aplicação
 * escolha silenciosamente um estado operacional não determinístico.
 *
 * @returns {Promise<void>} Termina quando o índice único existe.
 */
export async function ensureIntegrationIndexes() {
    const db = await getDb();
    await db.collection("integration_settings").createIndex(
        { key: 1 },
        { unique: true, name: "integration_settings_key_unique" },
    );
}
