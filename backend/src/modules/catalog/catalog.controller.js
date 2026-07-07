/**
 * @file Ficheiro `real_dev/backend/src/modules/catalog/catalog.controller.js` da implementação real_dev.
 */

import {
    changeContentStatus,
    createContent,
    getPublishedContentDetail,
    listAdminCatalog,
    listContentRevisions,
    listPublishedCatalog,
    revertContentRevision,
    updateContent,
} from "./catalog.service.js";
import { createTaxonomy, listTaxonomies } from "./taxonomy.service.js";

/**
 * Devolve conteudo publicado com paginacao publica segura.
 *
 * @param {import("express").Request} req Pedido HTTP com query params de paginacao.
 * @param {import("express").Response} res Resposta HTTP enviada ao frontend.
 * @returns {Promise<unknown>} Resposta com `items`, `page`, `limit` e `total`.
 */
export async function getCatalog(req, res) {
    return res.status(200).json(await listPublishedCatalog(req.query));
}

/**
 * Lista o catálogo completo para administração.
 *
 * Ao contrário da rota pública, devolve itens independentemente do estado
 * editorial para permitir revisão e manutenção interna.
 *
 * @param {import("express").Request} _req Pedido Express não usado por esta rota.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com itens administrativos.
 */
export async function getAdminCatalog(_req, res) {
    return res.status(200).json({ items: await listAdminCatalog() });
}

/**
 * Cria um novo conteúdo editorial.
 *
 * O body traz os campos do formulário e o `user.id` identifica quem criou a
 * entrada para efeitos de auditoria e revisões.
 *
 * @param {import("express").Request} req Pedido Express com body editorial e `user.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o conteúdo criado.
 */
export async function postContent(req, res) {
    return res
        .status(201)
        .json({ content: await createContent(req.body, req.user.id) });
}

/**
 * Atualiza campos de um conteúdo existente.
 *
 * A função combina o identificador da rota, os campos recebidos no body e o autor
 * autenticado antes de delegar a alteração no serviço.
 *
 * @param {import("express").Request} req Pedido Express com `params.id`, body e `user.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o conteúdo atualizado.
 */
export async function patchContent(req, res) {
    return res.status(200).json({
        content: await updateContent(req.params.id, req.body, req.user.id),
    });
}

/**
 * Altera o estado editorial de um conteúdo.
 *
 * O controller extrai o novo estado do body e mantém a validação da transição no
 * serviço de catálogo.
 *
 * @param {import("express").Request} req Pedido Express com `params.id`, `body.status` e `user.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o conteúdo atualizado.
 */
export async function patchContentStatus(req, res) {
    return res.status(200).json({
        content: await changeContentStatus(
            req.params.id,
            req.body?.status,
            req.user.id,
        ),
    });
}

/**
 * Lista revisões históricas de um conteúdo.
 *
 * A rota permite à administração consultar versões anteriores antes de escolher
 * uma reversão.
 *
 * @param {import("express").Request} req Pedido Express com `params.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com revisões do conteúdo.
 */
export async function getContentRevisions(req, res) {
    return res
        .status(200)
        .json({ items: await listContentRevisions(req.params.id) });
}

/**
 * Reverte um conteúdo para uma revisão anterior.
 *
 * O controller passa conteúdo, revisão e utilizador ao serviço para que a
 * reversão fique validada e auditável.
 *
 * @param {import("express").Request} req Pedido Express com `params.id`, `params.revisionId` e `user.id`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o conteúdo restaurado.
 */
export async function postContentRevisionRevert(req, res) {
    return res.status(200).json({
        content: await revertContentRevision(
            req.params.id,
            req.params.revisionId,
            req.user.id,
        ),
    });
}

/**
 * Lista taxonomias disponíveis no catálogo.
 *
 * A rota serve tanto filtros como formulários editoriais, devolvendo a coleção
 * normalizada pelo serviço de taxonomia.
 *
 * @param {import("express").Request} _req Pedido Express não usado por esta rota.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com taxonomias.
 */
export async function getTaxonomies(_req, res) {
    return res.status(200).json({ items: await listTaxonomies() });
}

/**
 * Cria uma nova taxonomia editorial.
 *
 * O body contém os campos submetidos pela administração e o serviço valida
 * unicidade e formato antes da persistência.
 *
 * @param {import("express").Request} req Pedido Express com dados da taxonomia no body.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com a taxonomia criada.
 */
export async function postTaxonomy(req, res) {
    return res.status(201).json({ taxonomy: await createTaxonomy(req.body) });
}

/**
 * Devolve o detalhe público de um conteúdo publicado.
 *
 * O identificador pode ser id ou slug e o serviço garante que apenas conteúdos
 * publicados são expostos nesta rota pública.
 *
 * @param {import("express").Request} req Pedido Express com `params.idOrSlug`.
 * @param {import("express").Response} res Resposta Express enviada ao cliente.
 * @returns {Promise<unknown>} Resposta HTTP com o detalhe público.
 */
export async function getCatalogDetail(req, res) {
    return res.status(200).json({
        content: await getPublishedContentDetail(req.params.idOrSlug),
    });
}
