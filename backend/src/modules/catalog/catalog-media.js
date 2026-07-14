/**
 * @file Regras partilhadas de disponibilidade e exposicao de media do catalogo.
 *
 * Mantem fontes de reproducao fora de respostas publicas e concentra a decisao
 * fail-closed usada pelo catalogo e pelo playback. Documentos legados sem estado
 * explicito sao tratados como pendentes ate serem revistos ou migrados.
 */

export const MEDIA_STATUSES = ["pending", "ready", "failed"];

const SOURCE_PROTOCOLS = Object.freeze({
    progressive: Object.freeze({
        mimeType: "video/mp4",
        mimeTypes: new Set(["video/mp4"]),
    }),
    hls: Object.freeze({
        mimeType: "application/vnd.apple.mpegurl",
        mimeTypes: new Set([
            "application/vnd.apple.mpegurl",
            "application/x-mpegurl",
        ]),
    }),
    dash: Object.freeze({
        mimeType: "application/dash+xml",
        mimeTypes: new Set(["application/dash+xml"]),
    }),
});

const LEGACY_PROTOCOL_BY_EXTENSION = Object.freeze({
    ".mp4": "progressive",
    ".m3u8": "hls",
    ".mpd": "dash",
});

const SUPPORTED_MEDIA_QUALITIES = new Set([
    "480p",
    "720p",
    "1080p",
    "2160p",
    "4k",
]);

/**
 * Normaliza texto interno sem converter números, objetos ou arrays.
 *
 * @param {unknown} value Valor candidato vindo do documento de conteudo.
 * @returns {string} Texto sem espaços exteriores ou vazio.
 */
function mediaText(value) {
    return typeof value === "string" ? value.trim() : "";
}

/**
 * Confirma que uma localização de media é transportável e não ambígua.
 *
 * @param {string} url Localização candidata.
 * @returns {boolean} Verdadeiro apenas para path root-relative ou HTTP(S) sem credenciais.
 */
function isSafeSourceLocation(url) {
    if (!url || url.length > 2_048 || url.includes("\\")) {
        return false;
    }

    if (
        Array.from(url).some((character) => {
            const codePoint = character.codePointAt(0);
            return codePoint <= 31 || codePoint === 127;
        })
    ) {
        return false;
    }

    if (url.startsWith("/")) {
        return !url.startsWith("//");
    }

    try {
        const parsed = new URL(url);
        return (
            ["http:", "https:"].includes(parsed.protocol) &&
            !parsed.username &&
            !parsed.password
        );
    } catch {
        return false;
    }
}

/**
 * Resolve o protocolo correspondente a um MIME type fechado.
 *
 * @param {string} mimeType MIME normalizado.
 * @returns {"progressive" | "hls" | "dash" | ""} Protocolo reconhecido.
 */
function protocolForMimeType(mimeType) {
    return (
        Object.entries(SOURCE_PROTOCOLS).find(([, definition]) =>
            definition.mimeTypes.has(mimeType),
        )?.[0] ?? ""
    );
}

/**
 * Infere apenas protocolos legacy inequívocos pela extensão do pathname.
 *
 * @param {string} url Localização já validada.
 * @returns {"progressive" | "hls" | "dash" | ""} Protocolo inferido.
 */
function inferLegacyProtocol(url) {
    let pathname;

    try {
        pathname = new URL(url, "https://faithflix.invalid").pathname;
    } catch {
        return "";
    }

    const normalizedPath = pathname.toLowerCase();
    return (
        Object.entries(LEGACY_PROTOCOL_BY_EXTENSION).find(([extension]) =>
            normalizedPath.endsWith(extension),
        )?.[1] ?? ""
    );
}

/**
 * Converte uma variante interna numa fonte canónica segura.
 *
 * Protocolo e MIME explícitos têm de ser coerentes. Sem ambos, apenas extensões
 * MP4/HLS/DASH inequívocas são aceites. Este helper é partilhado pelo catálogo
 * e playback para impedir CTAs públicos falso-positivos.
 *
 * @param {Record<string, unknown> | null | undefined} candidate Variante interna.
 * @returns {{ url: string, protocol: "progressive" | "hls" | "dash", mimeType: string } | null} Fonte canónica ou `null`.
 */
export function canonicalMediaSource(candidate) {
    const nestedSource =
        candidate?.source && typeof candidate.source === "object"
            ? candidate.source
            : {};
    const url = mediaText(
        nestedSource.url ??
            nestedSource.playbackUrl ??
            nestedSource.src ??
            candidate?.url ??
            candidate?.playbackUrl ??
            candidate?.src,
    );

    if (!isSafeSourceLocation(url)) {
        return null;
    }

    // A baseline de produto serve apenas MP4 progressive por um identificador
    // opaco do backend. URLs públicas/legacy e manifests HLS/DASH continuam a
    // existir apenas nas fixtures dos adapters de browser, nunca no catálogo.
    if (!/^\/api\/media\/[a-f\d]{24}$/i.test(url)) {
        return null;
    }

    const explicitProtocol = mediaText(
        nestedSource.protocol ?? candidate?.protocol,
    ).toLowerCase();
    const explicitMimeType = mediaText(
        nestedSource.mimeType ?? candidate?.mimeType,
    ).toLowerCase();
    const protocolFromMime = explicitMimeType
        ? protocolForMimeType(explicitMimeType)
        : "";

    if (
        explicitProtocol !== "progressive" ||
        explicitMimeType !== "video/mp4"
    ) {
        return null;
    }

    if (explicitProtocol || explicitMimeType) {
        if (
            (explicitProtocol && !SOURCE_PROTOCOLS[explicitProtocol]) ||
            (explicitMimeType && !protocolFromMime) ||
            (explicitProtocol &&
                protocolFromMime &&
                explicitProtocol !== protocolFromMime)
        ) {
            return null;
        }

        const protocol = explicitProtocol || protocolFromMime;
        return {
            url,
            protocol,
            mimeType: SOURCE_PROTOCOLS[protocol].mimeType,
        };
    }

    const legacyProtocol = inferLegacyProtocol(url);

    if (!legacyProtocol) {
        return null;
    }

    return {
        url,
        protocol: legacyProtocol,
        mimeType: SOURCE_PROTOCOLS[legacyProtocol].mimeType,
    };
}

/**
 * Lê a qualidade fechada declarada por uma variante interna.
 *
 * @param {Record<string, unknown> | null | undefined} candidate Variante de media.
 * @returns {string} Qualidade normalizada ou vazio.
 */
export function mediaCandidateQuality(candidate) {
    return mediaText(
        candidate?.quality ?? candidate?.qualityValue ?? candidate?.value,
    ).toLowerCase();
}

/**
 * Confirma que uma qualidade pertence ao contrato suportado.
 *
 * @param {unknown} value Qualidade candidata.
 * @returns {boolean} Verdadeiro apenas para uma qualidade fechada.
 */
function isSupportedMediaQuality(value) {
    return SUPPORTED_MEDIA_QUALITIES.has(mediaText(value).toLowerCase());
}

/**
 * Indica se um documento tem pelo menos uma fonte que o playback consegue usar.
 *
 * Legendas nao contam como fonte de video. O contrato atual aceita a fonte base,
 * uma faixa de audio/video ou uma variante de qualidade.
 *
 * @param {Record<string, unknown>} content Documento interno de conteudo.
 * @returns {boolean} `true` quando existe uma fonte de reproducao configurada.
 */
export function hasPlayableMediaSource(content = {}) {
    const qualityOptions = Array.isArray(content.qualityOptions)
        ? content.qualityOptions
        : [];
    const hasDeclaredQualityOptions =
        content.qualityOptions !== undefined &&
        content.qualityOptions !== null &&
        (!Array.isArray(content.qualityOptions) || qualityOptions.length > 0);
    const hasRecognizedQuality = qualityOptions.some(
        (option) =>
            isSupportedMediaQuality(option?.value ?? option?.label) &&
            canonicalMediaSource(option),
    );

    if (hasRecognizedQuality) {
        return true;
    }

    const baseSource = canonicalMediaSource(content.media);
    const baseQuality = mediaCandidateQuality(content.media);

    if (
        baseSource &&
        (isSupportedMediaQuality(baseQuality) || !hasDeclaredQualityOptions)
    ) {
        return true;
    }

    const audioTracks = Array.isArray(content.tracks?.audio)
        ? content.tracks.audio
        : [];
    return audioTracks.some(
        (track) =>
            isSupportedMediaQuality(mediaCandidateQuality(track)) &&
            canonicalMediaSource(track),
    );
}

/**
 * Normaliza o estado persistido sem promover automaticamente documentos legados.
 *
 * @param {Record<string, unknown>} content Documento interno de conteudo.
 * @returns {"pending" | "ready" | "failed"} Estado efetivo fail-closed.
 */
export function resolveMediaStatus(content = {}) {
    const status = String(content.mediaStatus ?? "").trim();
    return MEDIA_STATUSES.includes(status) ? status : "pending";
}

/**
 * Calcula os campos publicos usados pela UI para decidir se mostra o CTA.
 *
 * @param {Record<string, unknown>} content Documento interno de conteudo.
 * @returns {{ mediaStatus: "pending" | "ready" | "failed", isPlayable: boolean }} Disponibilidade segura.
 */
export function getMediaAvailability(content = {}) {
    const mediaStatus = resolveMediaStatus(content);

    return {
        mediaStatus,
        isPlayable:
            mediaStatus === "ready" && hasPlayableMediaSource(content),
    };
}
