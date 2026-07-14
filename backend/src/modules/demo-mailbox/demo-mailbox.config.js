/**
 * @file Guardas puros do canal de email exclusivamente local da demo PAP.
 */

/**
 * Confirma todas as flags exigidas para montar a caixa de email local.
 *
 * @param {Record<string, unknown>} [source=process.env] Ambiente bruto.
 * @param {string | undefined} [databaseName] Base efetiva, quando já conhecida.
 * @returns {boolean} Verdadeiro apenas para uma base descartável `_demo` em desenvolvimento.
 */
export function isDemoMailboxEnvironmentEnabled(
    source = process.env,
    databaseName = undefined,
) {
    const effectiveDatabaseName = String(
        databaseName ?? source.MONGODB_DB_NAME ?? "",
    ).trim();

    return (
        source.NODE_ENV === "development" &&
        source.DEMO_MODE === "true" &&
        source.ENABLE_DEMO_MAILBOX === "true" &&
        effectiveDatabaseName.endsWith("_demo")
    );
}

/**
 * Identifica endereços de socket locais sem confiar em headers de proxy.
 *
 * @param {unknown} address `remoteAddress` fornecido pelo socket TCP.
 * @returns {boolean} Verdadeiro para IPv4/IPv6 loopback.
 */
export function isLoopbackAddress(address) {
    const value = typeof address === "string" ? address.trim().toLowerCase() : "";
    return (
        value === "127.0.0.1" ||
        value === "::1" ||
        value === "::ffff:127.0.0.1"
    );
}
