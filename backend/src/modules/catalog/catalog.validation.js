/**
 * @file Ficheiro `real_dev/backend/src/modules/catalog/catalog.validation.js` da implementação real_dev.
 */

import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";
import { parsePagination } from "../../utils/pagination.js";

export const CONTENT_TYPES = ["movie", "series", "episode", "documentary"];
export const CONTENT_STATUS = ["draft", "published", "archived"];
export const CONTENT_MEDIA_STATUS = ["pending", "ready", "failed"];
export const ADMIN_CATALOG_SORT_FIELDS = ["updatedAt", "title", "status"];
export const TAXONOMY_STATUS = ["active", "archived"];
const MAX_CREDIT_NAMES = 5;
const MAX_CAST_MEMBERS = 20;
const CATALOG_MEDIA_MUTATION_FIELDS = [
    "media",
    "mediaStatus",
    "tracks",
    "qualityOptions",
    "playbackUrl",
    "src",
];
const CATALOG_EDITORIAL_UPDATE_FIELDS = [
    "title",
    "slug",
    "synopsis",
    "durationSeconds",
    "ageRating",
    "releaseYear",
    "taxonomyIds",
    "assets",
    "credits",
    "seriesId",
    "seasonNumber",
    "episodeNumber",
];
const CATALOG_UPDATE_FIELDS = new Set([
    ...CATALOG_EDITORIAL_UPDATE_FIELDS,
    "expectedVersion",
    "type",
]);

/**
 * Valida a versao editorial usada no compare-and-swap das mutacoes admin.
 *
 * A API exige um numero JSON inteiro, em vez de coagir strings, para que um
 * cliente desatualizado nunca contorne acidentalmente o controlo concorrente.
 *
 * @param {unknown} value Versao que o cliente observou antes de editar.
 * @returns {number} Versao positiva e segura.
 */
export function assertExpectedVersion(value) {
    if (
        typeof value !== "number" ||
        !Number.isSafeInteger(value) ||
        value < 1
    ) {
        throw new HttpError(
            400,
            "expectedVersion deve ser um inteiro positivo.",
            undefined,
            "EXPECTED_VERSION_REQUIRED",
        );
    }

    return value;
}

/**
 * Valida campos de texto obrigatórios.
 *
 * @param {unknown} value - Valor bruto.
 * @param {string} field - Field name used in the error message.
 * @param {number} [min=2] - Minimum length.
 * @param {number} [max=160] - Maximum length.
 * @returns {string} Texto sem espaços externos.
 */
function requiredText(value, field, min = 2, max = 160) {
    const text = typeof value === "string" ? value.trim() : "";

    if (text.length < min || text.length > max) {
        throw new HttpError(400, `${field} invalido.`);
    }

    return text;
}

/**
 * Normaliza texto opcional com tamanho máximo seguro.
 *
 * @param {unknown} value - Valor bruto.
 * @param {number} [max=500] - Maximum length.
 * @param {string} [field="Campo"] - Nome usado na mensagem segura.
 * @returns {string} Texto opcional sem espaços externos.
 */
function optionalText(value, max = 500, field = "Campo") {
    if (value === undefined) {
        return "";
    }

    if (typeof value !== "string") {
        throw new HttpError(400, `${field} invalido.`);
    }

    const text = value.trim();

    if (text.length > max) {
        throw new HttpError(400, `${field} nao pode exceder ${max} caracteres.`);
    }

    return text;
}

/**
 * Valida um campo inteiro positivo.
 *
 * @param {unknown} value - Valor bruto.
 * @param {string} field - Field name.
 * @returns {number} Inteiro válido.
 */
function positiveInteger(value, field) {
    if (
        typeof value !== "number" ||
        !Number.isSafeInteger(value) ||
        value <= 0
    ) {
        throw new HttpError(400, `${field} deve ser um inteiro positivo.`);
    }

    return value;
}

/**
 * Valida classificação etária entre 0 e 18.
 *
 * @param {unknown} value - Classificação etária bruta.
 * @returns {number} Classificação etária segura.
 */
function assertAgeRating(value) {
    if (
        typeof value !== "number" ||
        !Number.isSafeInteger(value) ||
        value < 0 ||
        value > 18
    ) {
        throw new HttpError(400, "Classificacao etaria invalida.");
    }

    return value;
}

/**
 * Valida o ano editorial sem obrigar documentos antigos a inventar um valor.
 *
 * @param {unknown} value Ano bruto ou vazio.
 * @returns {number | null} Ano válido ou ausência explícita.
 */
function assertReleaseYear(value) {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    const maximumYear = new Date().getUTCFullYear() + 1;
    if (
        typeof value !== "number" ||
        !Number.isSafeInteger(value) ||
        value < 1888 ||
        value > maximumYear
    ) {
        throw new HttpError(400, "Ano de lancamento invalido.");
    }

    return value;
}

/**
 * Valida uma URL promocional pública sem aceitar protocolos executáveis.
 *
 * @param {unknown} value URL bruta.
 * @returns {string} URL HTTPS/root-relative ou vazio.
 */
function optionalPublicAssetUrl(value) {
    const url = optionalText(value, 500, "previewUrl");
    if (!url) return "";

    if (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\")) {
        return url;
    }

    try {
        const parsed = new URL(url);
        if (parsed.protocol === "https:") return url;
    } catch {
        // A mensagem pública abaixo é deliberadamente única para todos os erros.
    }

    throw new HttpError(400, "previewUrl invalido.");
}

/**
 * Valida uma lista curta de nomes editoriais.
 *
 * @param {unknown} value Lista bruta.
 * @param {string} field Nome do campo.
 * @returns {string[]} Nomes normalizados.
 */
function creditNames(value, field) {
    if (value === undefined) return [];
    if (!Array.isArray(value) || value.length > MAX_CREDIT_NAMES) {
        throw new HttpError(400, `${field} invalido.`);
    }

    return value.map((name) => requiredText(name, field, 2, 120));
}

/**
 * Valida o bloco editorial de créditos incorporado no conteúdo.
 *
 * @param {unknown} value Créditos brutos.
 * @returns {{ directors: string[], creators: string[], cast: Array<{ name: string, role: string }> }} Créditos seguros.
 */
function editorialCredits(value) {
    if (value === undefined) {
        return { directors: [], creators: [], cast: [] };
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new HttpError(400, "Creditos invalidos.");
    }

    const cast = value.cast === undefined ? [] : value.cast;
    if (!Array.isArray(cast) || cast.length > MAX_CAST_MEMBERS) {
        throw new HttpError(400, "Elenco invalido.");
    }

    return {
        directors: creditNames(value.directors, "directors"),
        creators: creditNames(value.creators, "creators"),
        cast: cast.map((member) => {
            if (!member || typeof member !== "object" || Array.isArray(member)) {
                throw new HttpError(400, "Elemento de elenco invalido.");
            }
            return {
                name: requiredText(member.name, "cast.name", 2, 120),
                role: optionalText(member.role, 120, "cast.role"),
            };
        }),
    };
}

/**
 * Converte ids de taxonomias para ObjectIds.
 *
 * @param {unknown} value - Lista bruta de ids de taxonomias.
 * @returns {import("mongodb").ObjectId[]} Lista de ObjectId.
 */
function taxonomyObjectIds(value) {
    if (value === undefined) {
        return [];
    }

    if (!Array.isArray(value)) {
        throw new HttpError(400, "Taxonomias invalidas.");
    }

    return value.map((id) => {
        if (typeof id !== "string" || !ObjectId.isValid(id)) {
            throw new HttpError(400, "Taxonomia invalida.");
        }

        return new ObjectId(id);
    });
}

/**
 * Valida uma faixa de legendas ou áudio.
 *
 * @param {{ language?: unknown, label?: unknown, src?: unknown }} track - Faixa bruta.
 * @returns {{ language: string, label: string, src: string }} Faixa segura.
 */
function mediaTrack(track) {
    if (!track || typeof track !== "object" || Array.isArray(track)) {
        throw new HttpError(400, "Faixa media invalida.");
    }

    return {
        language: requiredText(track?.language, "language", 2, 12),
        label: requiredText(track?.label, "label", 2, 80),
        src: requiredText(track?.src, "src", 1, 500),
    };
}

/**
 * Valida uma opção de qualidade.
 *
 * @param {{ label?: unknown, value?: unknown, playbackUrl?: unknown }} option - Opção de qualidade bruta.
 * @returns {{ label: string, value: string, playbackUrl: string }} Opção de qualidade segura.
 */
function qualityOption(option) {
    if (!option || typeof option !== "object" || Array.isArray(option)) {
        throw new HttpError(400, "Opcao de qualidade invalida.");
    }

    return {
        label: requiredText(option?.label, "label", 2, 40),
        value: requiredText(option?.value, "value", 2, 40),
        playbackUrl: requiredText(option?.playbackUrl, "playbackUrl", 1, 500),
    };
}

/**
 * Constrói um slug estável a partir de texto.
 *
 * @param {unknown} value - Texto bruto.
 * @returns {string} Slug seguro para URL.
 */
export function slugify(value) {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

/**
 * Valida faixas media e opções de qualidade.
 *
 * @param {{ tracks?: { subtitles?: unknown[], audio?: unknown[] }, qualityOptions?: unknown[] }} input - Opções media brutas.
 * @returns {{ tracks: { subtitles: Array<{ language: string, label: string, src: string }>, audio: Array<{ language: string, label: string, src: string }> }, qualityOptions: Array<{ label: string, value: string, playbackUrl: string }> }} Opções media seguras.
 */
export function assertMediaOptions(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Opcoes media invalidas.");
    }

    if (
        input.tracks !== undefined &&
        (!input.tracks ||
            typeof input.tracks !== "object" ||
            Array.isArray(input.tracks))
    ) {
        throw new HttpError(400, "Faixas media invalidas.");
    }

    for (const value of [
        input.tracks?.subtitles,
        input.tracks?.audio,
        input.qualityOptions,
    ]) {
        if (value !== undefined && !Array.isArray(value)) {
            throw new HttpError(400, "Opcoes media invalidas.");
        }
    }

    return {
        tracks: {
            subtitles: Array.isArray(input.tracks?.subtitles)
                ? input.tracks.subtitles.map(mediaTrack)
                : [],
            audio: Array.isArray(input.tracks?.audio)
                ? input.tracks.audio.map(mediaTrack)
                : [],
        },
        qualityOptions: Array.isArray(input.qualityOptions)
            ? input.qualityOptions.map(qualityOption)
            : [],
    };
}

/**
 * Valida apenas os campos editoriais de um conteúdo.
 *
 * @param {Record<string, unknown>} input - Dados brutos de catálogo.
 * @returns {Record<string, unknown>} Metadados, assets e taxonomias seguros.
 */
function assertCatalogEditorialPayload(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Payload de catalogo invalido.");
    }

    const title = requiredText(input.title, "title");
    const type = typeof input.type === "string" ? input.type.trim() : "";

    if (!CONTENT_TYPES.includes(type)) {
        throw new HttpError(400, "Tipo de conteudo invalido.");
    }

    if (input.slug !== undefined && typeof input.slug !== "string") {
        throw new HttpError(400, "Slug invalido.");
    }

    const slug = input.slug ? slugify(input.slug) : slugify(title);

    const assets = input.assets === undefined ? {} : input.assets;

    if (!assets || typeof assets !== "object" || Array.isArray(assets)) {
        throw new HttpError(400, "Assets editoriais invalidos.");
    }

    if (!slug) {
        throw new HttpError(400, "Slug invalido.");
    }

    const payload = {
        title,
        slug,
        synopsis: requiredText(input.synopsis, "synopsis", 20, 1000),
        type,
        durationSeconds: positiveInteger(
            input.durationSeconds,
            "durationSeconds",
        ),
        ageRating: assertAgeRating(
            input.ageRating === undefined ? 0 : input.ageRating,
        ),
        releaseYear: assertReleaseYear(input.releaseYear),
        taxonomyIds: taxonomyObjectIds(input.taxonomyIds),
        assets: {
            posterUrl: optionalText(assets.posterUrl, 500, "posterUrl"),
            backdropUrl: optionalText(
                assets.backdropUrl,
                500,
                "backdropUrl",
            ),
            previewUrl: optionalPublicAssetUrl(assets.previewUrl),
        },
        credits: editorialCredits(input.credits),
    };

    if (type !== "episode") {
        return payload;
    }

    if (!ObjectId.isValid(input.seriesId)) {
        throw new HttpError(
            400,
            "seriesId do episodio invalido.",
            undefined,
            "EPISODE_SERIES_INVALID",
        );
    }

    return {
        ...payload,
        seriesId: new ObjectId(input.seriesId),
        seasonNumber: positiveInteger(input.seasonNumber, "seasonNumber"),
        episodeNumber: positiveInteger(input.episodeNumber, "episodeNumber"),
    };
}

/**
 * Cria o contrato inicial de media sem aceitar fontes do formulário editorial.
 *
 * O catálogo administrativo cria metadados; o carregamento/ingestão de media
 * pertence a um fluxo separado que ainda não existe nesta baseline.
 *
 * @param {Record<string, unknown>} input Dados brutos de criação.
 * @returns {Record<string, unknown>} Conteúdo editorial com media vazia/pending.
 */
export function assertCatalogPayload(input = {}) {
    return {
        ...assertCatalogEditorialPayload(input),
        media: { playbackUrl: "" },
        mediaStatus: "pending",
        tracks: { subtitles: [], audio: [] },
        qualityOptions: [],
    };
}

/**
 * Recusa alterações de media na rota editorial de atualização.
 *
 * A presença do campo é suficiente para falhar, mesmo com `null` ou vazio, para
 * que clientes não interpretem um payload ignorado como uma alteração aplicada.
 *
 * @param {Record<string, unknown>} input Dados brutos de atualização.
 * @returns {Record<string, unknown>} Metadados editoriais seguros.
 * @throws {HttpError} Quando o payload tenta alterar media.
 */
export function assertCatalogUpdatePayload(input = {}, currentContent = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Payload de catalogo invalido.");
    }

    if (
        !currentContent ||
        typeof currentContent !== "object" ||
        Array.isArray(currentContent)
    ) {
        throw new TypeError("O estado atual do catalogo e obrigatorio.");
    }

    const forbiddenField = CATALOG_MEDIA_MUTATION_FIELDS.find((field) =>
        Object.prototype.hasOwnProperty.call(input, field),
    );

    if (forbiddenField) {
        throw new HttpError(
            400,
            "A media nao pode ser alterada pela mutacao editorial do catalogo.",
            { field: forbiddenField },
            "CATALOG_MEDIA_MUTATION_FORBIDDEN",
        );
    }

    const unknownField = Object.keys(input).find(
        (field) => !CATALOG_UPDATE_FIELDS.has(field),
    );
    if (unknownField) {
        throw new HttpError(
            400,
            "Campo editorial de catalogo invalido.",
            { field: unknownField },
            "CATALOG_UPDATE_FIELD_INVALID",
        );
    }

    if (
        Object.prototype.hasOwnProperty.call(input, "type") &&
        input.type !== currentContent.type
    ) {
        throw new HttpError(
            400,
            "O tipo do conteudo nao pode ser alterado.",
            { field: "type" },
            "CATALOG_TYPE_IMMUTABLE",
        );
    }

    const changedFields = CATALOG_EDITORIAL_UPDATE_FIELDS.filter((field) =>
        Object.prototype.hasOwnProperty.call(input, field),
    );
    if (changedFields.length === 0) {
        throw new HttpError(
            400,
            "Indica pelo menos um campo editorial para atualizar.",
            undefined,
            "CATALOG_UPDATE_EMPTY",
        );
    }

    const inputAssets = input.assets;
    const mergedAssets =
        inputAssets && typeof inputAssets === "object" && !Array.isArray(inputAssets)
            ? { ...(currentContent.assets ?? {}), ...inputAssets }
            : inputAssets;
    const inputCredits = input.credits;
    const mergedCredits =
        inputCredits && typeof inputCredits === "object" && !Array.isArray(inputCredits)
            ? { ...(currentContent.credits ?? {}), ...inputCredits }
            : inputCredits;
    const merged = {
        title: currentContent.title,
        slug: currentContent.slug,
        synopsis: currentContent.synopsis,
        type: currentContent.type,
        durationSeconds: currentContent.durationSeconds,
        ageRating: currentContent.ageRating,
        releaseYear: currentContent.releaseYear,
        taxonomyIds: (currentContent.taxonomyIds ?? []).map(String),
        assets: currentContent.assets ?? {},
        credits: currentContent.credits ?? {},
        seriesId: currentContent.seriesId
            ? String(currentContent.seriesId)
            : undefined,
        seasonNumber: currentContent.seasonNumber,
        episodeNumber: currentContent.episodeNumber,
    };

    for (const field of changedFields) {
        merged[field] = input[field];
    }
    if (changedFields.includes("assets")) merged.assets = mergedAssets;
    if (changedFields.includes("credits")) merged.credits = mergedCredits;

    return assertCatalogEditorialPayload(merged);
}

/**
 * Valida estado de publicação de conteúdo.
 *
 * @param {unknown} estado - Estado bruto.
 * @returns {string} Estado seguro.
 */
export function assertStatus(status) {
    const normalized = typeof status === "string" ? status.trim() : "";

    if (!CONTENT_STATUS.includes(normalized)) {
        throw new HttpError(400, "Estado de conteudo invalido.");
    }

    return normalized;
}

/**
 * Valida parametros publicos de paginacao do catalogo.
 *
 * @param {Record<string, unknown>} input - Query params brutos recebidos pela rota publica.
 * @returns {{ page: number, limit: number }} Pagina e limite normalizados.
 */
export function parseCatalogPagination(input = {}) {
    return parsePagination(input, { defaultLimit: 12, maxLimit: 24 });
}

/**
 * Valida paginação das listagens administrativas de catálogo e revisões.
 *
 * @param {Record<string, unknown>} input Query params administrativos.
 * @returns {{ page: number, limit: number }} Página e limite seguros.
 */
export function parseAdminCatalogPagination(input = {}) {
    return parsePagination(input, { defaultLimit: 20, maxLimit: 50 });
}

/**
 * Valida filtros opcionais da listagem administrativa do catálogo.
 *
 * A pesquisa fica limitada e continua a ser escapada no service antes de ser
 * usada numa expressão regular MongoDB.
 *
 * @param {Record<string, unknown>} input Query params administrativos.
 * @returns {{ search: string, status: string, type: string, mediaStatus: string }} Filtros normalizados.
 */
export function parseAdminCatalogFilters(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Filtros de catálogo inválidos.");
    }

    for (const field of ["search", "status", "type", "mediaStatus"]) {
        if (input[field] !== undefined && typeof input[field] !== "string") {
            throw new HttpError(400, `Filtro ${field} inválido.`);
        }
    }

    const search = input.search?.trim() ?? "";
    const status = input.status?.trim() ?? "";
    const type = input.type?.trim() ?? "";
    const mediaStatus = input.mediaStatus?.trim() ?? "";

    if (search.length > 80) {
        throw new HttpError(400, "A pesquisa não pode exceder 80 caracteres.");
    }
    if (status && !CONTENT_STATUS.includes(status)) {
        throw new HttpError(400, "Estado de conteúdo inválido.");
    }
    if (type && !CONTENT_TYPES.includes(type)) {
        throw new HttpError(400, "Tipo de conteúdo inválido.");
    }
    if (mediaStatus && !CONTENT_MEDIA_STATUS.includes(mediaStatus)) {
        throw new HttpError(400, "Estado de media inválido.");
    }

    return { search, status, type, mediaStatus };
}

/**
 * Valida a ordenação da listagem administrativa do catálogo.
 *
 * @param {Record<string, unknown>} input Query params administrativos.
 * @returns {{ sort: string, direction: "asc" | "desc" }} Ordenação segura.
 */
export function parseAdminCatalogSort(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Ordenação de catálogo inválida.");
    }

    for (const field of ["sort", "direction"]) {
        if (input[field] !== undefined && typeof input[field] !== "string") {
            throw new HttpError(400, `Ordenação ${field} inválida.`);
        }
    }

    const sort = input.sort?.trim() || "updatedAt";
    const direction = input.direction?.trim() || "desc";

    if (!ADMIN_CATALOG_SORT_FIELDS.includes(sort)) {
        throw new HttpError(400, "Campo de ordenação do catálogo inválido.");
    }
    if (!["asc", "desc"].includes(direction)) {
        throw new HttpError(400, "Direção de ordenação do catálogo inválida.");
    }

    return { sort, direction };
}

/**
 * Valida filtros públicos opcionais do catálogo.
 *
 * @param {Record<string, unknown>} input - Query params brutos recebidos pela rota pública.
 * @returns {{ type: string | null }} Filtros normalizados.
 */
export function parseCatalogFilters(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Filtros de catalogo invalidos.");
    }

    if (input.type !== undefined && typeof input.type !== "string") {
        throw new HttpError(400, "Tipo de conteudo invalido.");
    }

    const type = input.type?.trim() ?? "";

    if (type && !["movie", "series", "documentary"].includes(type)) {
        throw new HttpError(400, "Tipo de conteudo invalido.");
    }

    return { type: type || null };
}

/**
 * Valida dados de taxonomia.
 *
 * @param {{ name?: unknown, slug?: unknown, description?: unknown, expectedVersion?: unknown }} input - Dados brutos de taxonomia.
 * @param {{ allowExpectedVersion?: boolean }} options Opções do comando.
 * @returns {{ name: string, slug: string, description: string }} Dados seguros de taxonomia.
 */
export function assertTaxonomyPayload(input = {}, options = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Payload de taxonomia invalido.");
    }

    const allowedFields = new Set([
        "name",
        "slug",
        "description",
        ...(options.allowExpectedVersion ? ["expectedVersion"] : []),
    ]);
    const unknownField = Object.keys(input).find(
        (field) => !allowedFields.has(field),
    );
    if (unknownField) {
        throw new HttpError(
            400,
            "Campo de taxonomia invalido.",
            { field: unknownField },
            "TAXONOMY_FIELD_INVALID",
        );
    }

    const name = requiredText(input.name, "name", 2, 80);

    if (input.slug !== undefined && typeof input.slug !== "string") {
        throw new HttpError(400, "Slug invalido.");
    }

    const slug = input.slug ? slugify(input.slug) : slugify(name);

    if (!slug) {
        throw new HttpError(400, "Slug invalido.");
    }

    return {
        name,
        slug,
        description: optionalText(input.description, 500, "description"),
    };
}

/**
 * Valida paginação e filtros da gestão administrativa de taxonomias.
 *
 * @param {Record<string, unknown>} input Query params recebidos por HTTP.
 * @returns {{ page: number, limit: number, search: string, status: string }} Filtros seguros.
 */
export function parseAdminTaxonomyQuery(input = {}) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Filtros de taxonomias inválidos.");
    }
    for (const field of ["search", "status"]) {
        if (input[field] !== undefined && typeof input[field] !== "string") {
            throw new HttpError(400, `Filtro ${field} inválido.`);
        }
    }

    const { page, limit } = parsePagination(input, {
        defaultLimit: 20,
        maxLimit: 50,
    });
    const search = input.search?.trim() ?? "";
    const status = input.status?.trim() ?? "";

    if (search.length > 80) {
        throw new HttpError(400, "A pesquisa não pode exceder 80 caracteres.");
    }
    if (status && !TAXONOMY_STATUS.includes(status)) {
        throw new HttpError(400, "Estado de taxonomia inválido.");
    }

    return { page, limit, search, status };
}

/**
 * Valida a mudança de estado não destrutiva de uma taxonomia.
 *
 * @param {unknown} value Estado bruto.
 * @returns {"active" | "archived"} Estado seguro.
 */
export function assertTaxonomyStatus(value) {
    const status = typeof value === "string" ? value.trim() : "";
    if (!TAXONOMY_STATUS.includes(status)) {
        throw new HttpError(400, "Estado de taxonomia inválido.");
    }
    return status;
}

/**
 * Valida o shape fechado da alteração de estado de taxonomia.
 *
 * @param {unknown} input Payload bruto.
 * @returns {{status: "active" | "archived", expectedVersion: number}} Comando seguro.
 */
export function assertTaxonomyStatusPayload(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Payload de taxonomia invalido.");
    }
    const unknownField = Object.keys(input).find(
        (field) => !["status", "expectedVersion"].includes(field),
    );
    if (unknownField) {
        throw new HttpError(
            400,
            "Campo de taxonomia invalido.",
            { field: unknownField },
            "TAXONOMY_FIELD_INVALID",
        );
    }
    return {
        status: assertTaxonomyStatus(input.status),
        expectedVersion: assertExpectedVersion(input.expectedVersion),
    };
}
