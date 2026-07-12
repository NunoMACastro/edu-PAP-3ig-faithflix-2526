/**
 * @file Adapter lazy para fontes progressive, HLS e MPEG-DASH.
 */

import { env } from "../../config/env.js";

const SOURCE_PROTOCOLS = new Set(["progressive", "hls", "dash"]);

/** @returns {Promise<unknown>} Chunk HLS carregado apenas quando necessário. */
function importHls() {
    return import("hls.js");
}

/** @returns {Promise<unknown>} Chunk DASH carregado apenas quando necessário. */
function importDash() {
    return import("dashjs");
}

/**
 * Remove a fonte direta sem conservar pedidos/adapters anteriores.
 *
 * @param {HTMLVideoElement} video Elemento alvo.
 * @returns {void}
 */
function clearVideoSource(video) {
    video.removeAttribute("src");
    if (video.readyState > 0) video.load();
}

/**
 * Valida o DTO fechado recebido do backend.
 *
 * @param {unknown} source Fonte candidata.
 * @returns {{ url: string, protocol: "progressive"|"hls"|"dash", mimeType: string }} Fonte normalizada.
 */
function assertSource(source) {
    const url = typeof source?.url === "string" ? source.url.trim() : "";
    const protocol = String(source?.protocol ?? "").trim().toLowerCase();
    const mimeType = String(source?.mimeType ?? "").trim().toLowerCase();

    if (!url || !SOURCE_PROTOCOLS.has(protocol) || !mimeType) {
        throw new TypeError("Fonte de reprodução inválida.");
    }

    return { url, protocol, mimeType };
}

/**
 * Resolve URLs relativas para adapters que constroem telemetria com `URL`.
 *
 * @param {string} url URL autorizada pelo backend.
 * @returns {string} URL absoluta quando existe base de documento.
 */
function absoluteMediaUrl(url) {
    if (url.startsWith("/api/")) {
        return `${env.apiBaseUrl}${url}`;
    }
    const baseUrl = globalThis.document?.baseURI ?? globalThis.location?.href;
    return baseUrl ? new URL(url, baseUrl).href : url;
}

/**
 * Mantém fixtures relativas, mas envia media protegida para a origem da API.
 *
 * @param {string} url - URL autorizada pelo backend.
 * @returns {string} URL apropriada para o pedido do browser.
 */
function mediaRequestUrl(url) {
    return url.startsWith("/api/") ? absoluteMediaUrl(url) : url;
}

/**
 * Liga uma única fonte canónica ao vídeo e devolve destruição idempotente.
 *
 * @param {HTMLVideoElement} video Elemento de vídeo.
 * @param {unknown} source DTO `{url, protocol, mimeType}`.
 * @param {{ signal?: AbortSignal, onError?: (error: Error) => void, loadHls?: typeof importHls, loadDash?: typeof importDash }} [options] Dependências/cancelamento.
 * @returns {Promise<{ destroy: () => void, kind: string }>} Adapter ativo.
 */
export async function attachMediaSource(video, source, options = {}) {
    if (!video) throw new TypeError("Elemento de vídeo obrigatório.");
    const normalized = assertSource(source);
    const mediaUrl = mediaRequestUrl(normalized.url);
    video.crossOrigin = "use-credentials";
    const onError = typeof options.onError === "function"
        ? options.onError
        : () => {};
    let destroyed = false;

    const ensureActive = () => {
        if (options.signal?.aborted || destroyed) {
            const error = new DOMException("Adapter cancelado.", "AbortError");
            throw error;
        }
    };

    if (normalized.protocol === "progressive") {
        ensureActive();
        video.src = mediaUrl;
        return {
            kind: "progressive",
            destroy() {
                if (destroyed) return;
                destroyed = true;
                clearVideoSource(video);
            },
        };
    }

    if (
        normalized.protocol === "hls" &&
        video.canPlayType(normalized.mimeType)
    ) {
        ensureActive();
        video.src = mediaUrl;
        return {
            kind: "hls-native",
            destroy() {
                if (destroyed) return;
                destroyed = true;
                clearVideoSource(video);
            },
        };
    }

    if (normalized.protocol === "hls") {
        const module = await (options.loadHls ?? importHls)();
        ensureActive();
        const Hls = module.default ?? module.Hls;
        if (!Hls?.isSupported?.()) {
            throw new Error("HLS não é suportado neste browser.");
        }
        const adapter = new Hls({
            xhrSetup(xhr) {
                xhr.withCredentials = true;
            },
        });
        const errorEvent = Hls.Events?.ERROR;
        const handleError = (_event, data = {}) => {
            if (data.fatal) onError(new Error("Falha fatal no stream HLS."));
        };
        if (errorEvent) adapter.on(errorEvent, handleError);
        adapter.loadSource(mediaUrl);
        adapter.attachMedia(video);

        return {
            kind: "hls.js",
            destroy() {
                if (destroyed) return;
                destroyed = true;
                if (errorEvent) adapter.off?.(errorEvent, handleError);
                adapter.destroy();
                clearVideoSource(video);
            },
        };
    }

    const module = await (options.loadDash ?? importDash)();
    ensureActive();
    const factory = module.MediaPlayer ?? module.default?.MediaPlayer;
    if (typeof factory !== "function") {
        throw new Error("Adapter MPEG-DASH indisponível.");
    }
    const adapter = factory().create();
    const errorEvent = factory.events?.ERROR;
    const handleError = () => onError(new Error("Falha no stream MPEG-DASH."));
    if (errorEvent) adapter.on?.(errorEvent, handleError);
    for (const requestType of ["MPD", "MediaSegment", "InitializationSegment"]) {
        adapter.setXHRWithCredentialsForType?.(requestType, true);
    }
    adapter.initialize(video, absoluteMediaUrl(mediaUrl), false);

    return {
        kind: "dashjs",
        destroy() {
            if (destroyed) return;
            destroyed = true;
            if (errorEvent) adapter.off?.(errorEvent, handleError);
            adapter.reset();
            clearVideoSource(video);
        },
    };
}
