/**
 * @file Ficheiro `real_dev/frontend/src/services/api/catalogApi.js` da implementação real_dev.
 */

import { apiClient } from "./apiClient.js";

const MEDIA_UPLOAD_TIMEOUT_MS = 10 * 60 * 1000;

export const catalogApi = {
    /**
     * Lista conteúdos publicados disponíveis para o público.
     *
     * Esta chamada alimenta páginas de catálogo sem expor rascunhos ou metadados
     * administrativos.
     *
     * @param {{ type?: string, page?: number, limit?: number }} [params={}] Filtros públicos e paginação opcional.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento do pedido.
     * @returns {Promise<unknown>} Catálogo público devolvido pela API.
     */
    listPublished(params = {}, options = {}) {
        const query = new URLSearchParams();

        if (params.type) {
            query.set("type", params.type);
        }

        if (params.page !== undefined) {
            query.set("page", String(params.page));
        }

        if (params.limit !== undefined) {
            query.set("limit", String(params.limit));
        }

        const suffix = query.toString() ? `?${query}` : "";

        return apiClient.get(`/api/catalog${suffix}`, options);
    },
    /**
     * Obtém o detalhe público de um conteúdo.
     *
     * Aceita tanto identificador como slug para permitir navegação por URLs
     * legíveis sem duplicar lógica no frontend.
     *
     * @param {string} idOrSlug Identificador técnico ou slug público do conteúdo.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento do pedido.
     * @returns {Promise<unknown>} Detalhe público devolvido pela API.
     */
    getDetail(idOrSlug, options = {}) {
        return apiClient.get(
            `/api/catalog/${encodeURIComponent(idOrSlug)}`,
            options,
        );
    },
    /**
     * Lista conteúdos para gestão administrativa.
     *
     * A rota administrativa pode incluir rascunhos, itens arquivados e metadados
     * que não pertencem ao catálogo público.
     *
     * @returns {Promise<unknown>} Catálogo administrativo devolvido pela API.
     */
    listAdmin(params = {}, options = {}) {
        const query = new URLSearchParams();
        if (params.search) query.set("search", params.search);
        if (params.status) query.set("status", params.status);
        if (params.type) query.set("type", params.type);
        if (params.mediaStatus) query.set("mediaStatus", params.mediaStatus);
        if (params.sort) query.set("sort", params.sort);
        if (params.direction) query.set("direction", params.direction);
        if (params.page !== undefined) query.set("page", String(params.page));
        if (params.limit !== undefined) query.set("limit", String(params.limit));
        const suffix = query.toString() ? `?${query}` : "";
        return apiClient.get(`/api/catalog/admin${suffix}`, options);
    },
    /**
     * Obtém diretamente um conteúdo administrativo por identificador.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento.
     * @returns {Promise<unknown>} Detalhe editorial protegido.
     */
    getAdminContent(contentId, options = {}) {
        return apiClient.get(
            `/api/catalog/admin/${encodeURIComponent(contentId)}`,
            options,
        );
    },
    /** @returns {Promise<unknown>} Opções mínimas usadas pelo editor. */
    getAdminEditorOptions(options = {}) {
        return apiClient.get("/api/catalog/admin/options", options);
    },
    /**
     * Cria um novo conteúdo no catálogo.
     *
     * O payload vem dos formulários administrativos e é validado no backend antes
     * de ser persistido.
     *
     * @param {Record<string, unknown>} input Dados editoriais do novo conteúdo.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento.
     * @returns {Promise<unknown>} Conteúdo criado devolvido pela API.
     */
    createContent(input, options = {}) {
        return apiClient.post("/api/catalog", input, options);
    },
    /**
     * Atualiza campos editoriais de um conteúdo existente.
     *
     * O identificador vai no URL e o corpo transporta apenas os campos que a
     * interface administrativa pretende alterar.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {Record<string, unknown>} input Campos editoriais atualizados.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento.
     * @returns {Promise<unknown>} Conteúdo atualizado devolvido pela API.
     */
    updateContent(contentId, input, options = {}) {
        return apiClient.patch(
            `/api/catalog/${encodeURIComponent(contentId)}`,
            input,
            options,
        );
    },
    /**
     * Altera o estado editorial de um conteúdo.
     *
     * A função envia apenas o novo estado, deixando a API validar transições como
     * publicação, arquivo ou regresso a rascunho.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {string} status Novo estado editorial.
     * @param {number} expectedVersion Versão CAS observada na linha.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento.
     * @returns {Promise<unknown>} Conteúdo com estado atualizado.
     */
    updateStatus(contentId, status, expectedVersion, options = {}) {
        return apiClient.patch(
            `/api/catalog/${encodeURIComponent(contentId)}/status`,
            { status, expectedVersion },
            options,
        );
    },
    /**
     * Lista revisões guardadas de um conteúdo.
     *
     * A chamada permite à administração comparar versões anteriores antes de
     * decidir reverter uma alteração.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {{ page?: number, limit?: number }} [params] Paginação.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento.
     * @returns {Promise<unknown>} Histórico de revisões devolvido pela API.
     */
    listRevisions(contentId, params = {}, options = {}) {
        const query = new URLSearchParams();
        if (params.page !== undefined) query.set("page", String(params.page));
        if (params.limit !== undefined) query.set("limit", String(params.limit));
        const suffix = query.toString() ? `?${query}` : "";
        return apiClient.get(
            `/api/catalog/${encodeURIComponent(contentId)}/revisions${suffix}`,
            options,
        );
    },
    /**
     * Reverte um conteúdo para uma revisão anterior.
     *
     * O URL identifica simultaneamente o conteúdo atual e a revisão escolhida,
     * evitando que o frontend envie estado editorial reconstruído manualmente.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {string} revisionId Identificador da revisão a restaurar.
     * @param {number} expectedVersion Versão CAS observada na linha.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento.
     * @returns {Promise<unknown>} Conteúdo restaurado devolvido pela API.
     */
    revertRevision(
        contentId,
        revisionId,
        expectedVersion,
        options = {},
    ) {
        return apiClient.post(
            `/api/catalog/${encodeURIComponent(contentId)}/revisions/${encodeURIComponent(revisionId)}/revert`,
            { expectedVersion },
            options,
        );
    },
    /**
     * Lista assets MP4 administrativos sem expor storage keys.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento.
     * @returns {Promise<unknown>} Lista autoritativa de assets.
     */
    listMediaAssets(contentId, options = {}) {
        return apiClient.get(
            `/api/catalog/${encodeURIComponent(contentId)}/media-assets`,
            options,
        );
    },
    /**
     * Cria uma sessão de upload local para um MP4 progressive.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {{ quality: string, mimeType: "video/mp4", expectedSizeBytes: number }} input Metadata fechada do ficheiro.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento.
     * @returns {Promise<unknown>} Asset pendente criado pelo backend.
     */
    createMediaUpload(contentId, input, options = {}) {
        return apiClient.post(
            `/api/catalog/${encodeURIComponent(contentId)}/media-uploads`,
            input,
            options,
        );
    },
    /**
     * Envia o File diretamente como `video/mp4`, sem multipart ou base64.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {string} uploadId Identificador da sessão.
     * @param {File | Blob} file Ficheiro selecionado.
     * @param {{ signal?: AbortSignal, timeoutMs?: number, headers?: HeadersInit }} [options] Cancelamento e timeout opcional.
     * @returns {Promise<unknown>} Asset validado em estado uploaded.
     */
    uploadMediaFile(contentId, uploadId, file, options = {}) {
        const headers = new Headers(options.headers);
        headers.set("Content-Type", "video/mp4");

        return apiClient.putRaw(
            `/api/catalog/${encodeURIComponent(contentId)}/media-uploads/${encodeURIComponent(uploadId)}`,
            file,
            {
                ...options,
                headers,
                timeoutMs: options.timeoutMs ?? MEDIA_UPLOAD_TIMEOUT_MS,
            },
        );
    },
    /**
     * Ativa um asset ingerido usando a versão editorial observada na linha.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {string} uploadId Asset ingerido.
     * @param {number} expectedVersion Versão CAS corrente.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento.
     * @returns {Promise<unknown>} Asset ativo e nova versão editorial.
     */
    activateMediaUpload(
        contentId,
        uploadId,
        expectedVersion,
        options = {},
    ) {
        return apiClient.post(
            `/api/catalog/${encodeURIComponent(contentId)}/media-uploads/${encodeURIComponent(uploadId)}/activate`,
            { expectedVersion },
            options,
        );
    },
    /**
     * Aborta um asset ainda não ativo e pede a remoção do ficheiro local.
     *
     * @param {string} contentId Identificador do conteúdo.
     * @param {string} uploadId Asset a remover.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento.
     * @returns {Promise<unknown>} Resposta vazia 204.
     */
    abortMediaUpload(contentId, uploadId, options = {}) {
        return apiClient.del(
            `/api/catalog/${encodeURIComponent(contentId)}/media-uploads/${encodeURIComponent(uploadId)}`,
            options,
        );
    },
    /**
     * Lista taxonomias disponíveis para classificar conteúdos.
     *
     * A UI usa esta lista para preencher filtros e formulários editoriais sem
     * duplicar categorias em código frontend.
     *
     * @returns {Promise<unknown>} Lista de taxonomias devolvida pela API.
     */
    listTaxonomies(options = {}) {
        return apiClient.get("/api/catalog/taxonomies", options);
    },
    /**
     * Cria uma nova taxonomia editorial.
     *
     * O payload contém nome, slug e descrição opcional, sendo normalizado e
     * validado pela API antes de ficar disponível no catálogo.
     *
     * @param {Record<string, unknown>} input Dados da nova taxonomia.
     * @param {{ signal?: AbortSignal }} [options] Opções de cancelamento.
     * @returns {Promise<unknown>} Taxonomia criada devolvida pela API.
     */
    createTaxonomy(input, options = {}) {
        return apiClient.post("/api/catalog/taxonomies", input, options);
    },
    /** Lista taxonomias com metadados administrativos e utilização. */
    listAdminTaxonomies(params = {}, options = {}) {
        const query = new URLSearchParams();
        if (params.search) query.set("search", params.search);
        if (params.status) query.set("status", params.status);
        if (params.page !== undefined) query.set("page", String(params.page));
        if (params.limit !== undefined) query.set("limit", String(params.limit));
        const suffix = query.toString() ? `?${query}` : "";
        return apiClient.get(`/api/catalog/taxonomies/admin${suffix}`, options);
    },
    /** Atualiza os metadados de uma taxonomia. */
    updateTaxonomy(taxonomyId, input, options = {}) {
        return apiClient.patch(
            `/api/catalog/taxonomies/${encodeURIComponent(taxonomyId)}`,
            input,
            options,
        );
    },
    /** Arquiva ou reativa uma taxonomia. */
    updateTaxonomyStatus(taxonomyId, status, expectedVersion, options = {}) {
        return apiClient.patch(
            `/api/catalog/taxonomies/${encodeURIComponent(taxonomyId)}/status`,
            { status, expectedVersion },
            options,
        );
    },
};
