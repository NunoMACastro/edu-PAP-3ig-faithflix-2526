/**
 * @file Metadados públicos das rotas usados pelo shell da aplicação.
 */

import { matchPath } from "react-router-dom";

const PRODUCT_NAME = "FaithFlix";

const ROUTE_TITLES = Object.freeze([
    { path: "/", title: "Início" },
    { path: "/catalogo", title: "Catálogo" },
    { path: "/catalogo/:idOrSlug", title: "Detalhe do conteúdo" },
    {
        path: "/catalogo/:seriesSlug/episodios/:episodeSlug",
        title: "Detalhe do episódio",
    },
    { path: "/ver/:contentId", title: "Reprodução" },
    { path: "/login", title: "Entrar" },
    { path: "/para-si", title: "Para si" },
    { path: "/associacoes", title: "Associações" },
    {
        path: "/associacoes/candidatura",
        title: "Candidatura de associação",
    },
    {
        path: "/associacoes/:charityId/historico",
        title: "Histórico da associação",
    },
    { path: "/planos", title: "Planos" },
    { path: "/conta", title: "Conta" },
    { path: "/biblioteca", title: "Biblioteca" },
    { path: "/notificacoes", title: "Notificações" },
    { path: "/pesquisa", title: "Pesquisa" },
    { path: "/admin", title: "Dashboard administrativo" },
    { path: "/admin/catalogo", title: "Administração do catálogo" },
    { path: "/admin/catalogo/novo", title: "Novo conteúdo" },
    { path: "/admin/catalogo/:contentId/editar", title: "Editar conteúdo" },
    { path: "/admin/catalogo/taxonomias", title: "Taxonomias do catálogo" },
    {
        path: "/admin/passagens-biblicas",
        title: "Administração de passagens bíblicas",
    },
    { path: "/admin/passagens-biblicas/novo", title: "Nova passagem bíblica" },
    { path: "/admin/passagens-biblicas/:passageId/editar", title: "Editar passagem bíblica" },
    { path: "/admin/passagens-biblicas/associacoes", title: "Associações de passagens bíblicas" },
    { path: "/admin/utilizadores", title: "Administração de utilizadores" },
    { path: "/admin/metricas", title: "Métricas administrativas" },
    { path: "/admin/integracoes", title: "Integrações administrativas" },
    {
        path: "/admin/charity-applications",
        title: "Candidaturas de associações",
    },
    { path: "/admin/pool/distribution", title: "Distribuição da pool" },
    { path: "/admin/pool/dashboard", title: "Histórico da pool" },
    { path: "/admin/charity-members", title: "Membros de associações" },
]);

/**
 * Resolve o título seguro de uma rota sem incluir parâmetros ou query strings.
 *
 * @param {string} pathname Path atual do React Router.
 * @returns {string} Título completo do documento.
 */
export function resolveRouteTitle(pathname) {
    const route = ROUTE_TITLES.find(({ path }) =>
        matchPath({ path, end: true }, pathname),
    );
    const pageTitle = route?.title ?? "Página não encontrada";

    return `${pageTitle} | ${PRODUCT_NAME}`;
}
