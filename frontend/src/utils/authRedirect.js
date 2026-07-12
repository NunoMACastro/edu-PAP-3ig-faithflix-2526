/**
 * @file Utilitários de redirecionamento para fluxos que exigem autenticação.
 */

/**
 * Deteta caracteres ASCII de controlo sem os introduzir num padrão regex.
 *
 * @param {string} value Valor a inspecionar.
 * @returns {boolean} Verdadeiro quando contém U+0000..U+001F ou U+007F.
 */
function containsControlCharacters(value) {
    return Array.from(value).some((character) => {
        const codePoint = character.codePointAt(0);
        return codePoint <= 31 || codePoint === 127;
    });
}

/**
 * Confirma se um destino de redirecionamento é interno à aplicação.
 *
 * @param {unknown} value Valor recebido do query string ou da rota atual.
 * @returns {value is string} Verdadeiro quando o destino pode ser usado com segurança.
 */
export function isSafeInternalPath(value) {
    if (
        typeof value !== "string" ||
        value !== value.trim() ||
        !value.startsWith("/")
    ) {
        return false;
    }

    let decodedCandidate = value;

    // Duas passagens cobrem query strings duplamente codificadas sem tentar
    // "corrigir" input malformado. Backslashes são separadores de host em
    // parsers URL de browsers e caracteres de controlo nunca são destinos.
    for (let pass = 0; pass < 2; pass += 1) {
        if (
            decodedCandidate.startsWith("//") ||
            decodedCandidate.includes("\\") ||
            containsControlCharacters(decodedCandidate)
        ) {
            return false;
        }

        try {
            const decodedValue = decodeURIComponent(decodedCandidate);

            if (decodedValue === decodedCandidate) {
                break;
            }

            decodedCandidate = decodedValue;
        } catch {
            return false;
        }
    }

    if (
        decodedCandidate.startsWith("//") ||
        decodedCandidate.includes("\\") ||
        containsControlCharacters(decodedCandidate)
    ) {
        return false;
    }

    try {
        const internalOrigin = "https://faithflix.invalid";
        const parsedUrl = new URL(value, internalOrigin);
        return parsedUrl.origin === internalOrigin;
    } catch {
        return false;
    }
}

/**
 * Normaliza um destino de retorno depois do login.
 *
 * @param {unknown} value Valor a validar.
 * @returns {string | null} Caminho interno seguro ou null.
 */
export function getSafeRedirectPath(value) {
    if (!isSafeInternalPath(value)) {
        return null;
    }

    const parsedUrl = new URL(value, "https://faithflix.invalid");
    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}

/**
 * Devolve a landing padrão adequada à role confirmada pelo backend.
 *
 * @param {{ role?: string } | null | undefined} user Utilizador autenticado.
 * @returns {string} Landing interna da sessão.
 */
export function getDefaultAuthenticatedPath(user) {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "moderator") return "/admin/catalogo";
    return "/";
}

/**
 * Centraliza a precedência entre um `next` seguro e a landing da role.
 *
 * @param {{ role?: string } | null | undefined} user Utilizador autenticado.
 * @param {unknown} requestedPath Destino opcional recebido do fluxo de login.
 * @returns {string} Destino final interno.
 */
export function resolveAuthenticatedPath(user, requestedPath = null) {
    return getSafeRedirectPath(requestedPath) ?? getDefaultAuthenticatedPath(user);
}

/**
 * Constrói a rota de login com destino interno de retorno.
 *
 * @param {string} returnTo Caminho interno para abrir depois de autenticar.
 * @returns {string} Rota de login com query string `next`.
 */
export function buildLoginRedirectPath(returnTo) {
    const safeReturnTo = getSafeRedirectPath(returnTo) ?? "/";
    return `/login?next=${encodeURIComponent(safeReturnTo)}`;
}
