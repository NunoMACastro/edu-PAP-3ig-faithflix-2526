/** @file Testes das páginas independentes do workspace editorial. */

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminCatalogCreatePage } from "./AdminCatalogCreatePage.jsx";
import { AdminCatalogEditPage } from "./AdminCatalogEditPage.jsx";
import { AdminCatalogListPage } from "./AdminCatalogListPage.jsx";
import { AdminTaxonomiesPage } from "./AdminTaxonomiesPage.jsx";

const mocks = vi.hoisted(() => ({
    listAdmin: vi.fn(),
    getAdminContent: vi.fn(),
    getAdminEditorOptions: vi.fn(),
    listTaxonomies: vi.fn(),
    createContent: vi.fn(),
    updateContent: vi.fn(),
    updateStatus: vi.fn(),
    listRevisions: vi.fn(),
    revertRevision: vi.fn(),
    listMediaAssets: vi.fn(),
    createMediaUpload: vi.fn(),
    uploadMediaFile: vi.fn(),
    activateMediaUpload: vi.fn(),
    abortMediaUpload: vi.fn(),
    listAdminTaxonomies: vi.fn(),
    createTaxonomy: vi.fn(),
    updateTaxonomy: vi.fn(),
    updateTaxonomyStatus: vi.fn(),
}));

vi.mock("../services/api/catalogApi.js", () => ({ catalogApi: mocks }));

const content = {
    id: "content-1",
    version: 3,
    title: "Filme editorial",
    slug: "filme-editorial",
    synopsis: "Uma sinopse editorial suficientemente longa para o formulário.",
    type: "movie",
    durationSeconds: 120,
    ageRating: 6,
    releaseYear: 2025,
    taxonomyIds: ["taxonomy-1"],
    assets: { posterUrl: "", backdropUrl: "", previewUrl: "" },
    credits: { directors: [], creators: [], cast: [] },
    status: "draft",
    mediaStatus: "pending",
    updatedAt: "2026-07-12T08:00:00.000Z",
};

function renderEdit() {
    return render(<MemoryRouter initialEntries={["/admin/catalogo/content-1/editar"]}><Routes><Route path="/admin/catalogo/:contentId/editar" element={<AdminCatalogEditPage />} /><Route path="/admin/catalogo" element={<p>Catálogo destino</p>} /></Routes></MemoryRouter>);
}

describe("workspace de catálogo", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mocks.getAdminEditorOptions.mockResolvedValue({ seriesOptions: [] });
        mocks.listTaxonomies.mockResolvedValue({ items: [{ id: "taxonomy-1", name: "Esperança" }] });
        mocks.getAdminContent.mockResolvedValue({ content });
        mocks.createContent.mockResolvedValue({ content });
        mocks.updateContent.mockImplementation(async (_id, payload) => ({ content: { ...content, ...payload, version: 4 } }));
        mocks.updateStatus.mockResolvedValue({ content: { ...content, status: "published", version: 4 } });
        mocks.listMediaAssets.mockResolvedValue({ items: [] });
        mocks.listRevisions.mockResolvedValue({ items: [] });
        mocks.listAdmin.mockResolvedValue({ items: [content], total: 1, page: 1, totalPages: 1 });
        mocks.listAdminTaxonomies.mockResolvedValue({ items: [{ id: "taxonomy-1", name: "Esperança", slug: "esperanca", description: "", usageCount: 2, status: "active", version: 1 }], total: 1, page: 1, totalPages: 1 });
        mocks.createTaxonomy.mockResolvedValue({ taxonomy: { id: "taxonomy-2" } });
    });

    it("cria apenas metadados e redireciona para a edição dedicada", async () => {
        const user = userEvent.setup();
        render(<MemoryRouter initialEntries={["/admin/catalogo/novo"]}><Routes><Route path="/admin/catalogo/novo" element={<AdminCatalogCreatePage />} /><Route path="/admin/catalogo/:contentId/editar" element={<p>Edição destino</p>} /></Routes></MemoryRouter>);
        await user.type(await screen.findByLabelText("Título"), "Novo conteúdo");
        await user.type(screen.getByLabelText("Sinopse"), "Uma sinopse suficientemente longa para o novo conteúdo.");
        await user.click(screen.getByRole("button", { name: "Criar como rascunho" }));

        await screen.findByText("Edição destino");
        expect(mocks.createContent).toHaveBeenCalledOnce();
        expect(mocks.createContent.mock.calls[0][0]).not.toHaveProperty("media");
    });

    it("obtém a edição diretamente por ID, guarda com CAS e não lista o catálogo", async () => {
        const user = userEvent.setup();
        renderEdit();
        const title = await screen.findByLabelText("Título");
        await user.clear(title);
        await user.type(title, "Título revisto");
        await user.click(screen.getByRole("button", { name: "Guardar alterações" }));

        await waitFor(() => expect(mocks.updateContent).toHaveBeenCalledWith("content-1", expect.objectContaining({ title: "Título revisto", expectedVersion: 3 })));
        expect(mocks.getAdminContent).toHaveBeenCalledWith("content-1", expect.any(Object));
        expect(mocks.listAdmin).not.toHaveBeenCalled();
    });

    it("carrega media apenas quando a respetiva secção é aberta", async () => {
        const user = userEvent.setup();
        renderEdit();
        await screen.findByRole("heading", { name: "Filme editorial" });
        expect(mocks.listMediaAssets).not.toHaveBeenCalled();
        await user.click(screen.getByRole("button", { name: "Media" }));
        await waitFor(() => expect(mocks.listMediaAssets).toHaveBeenCalledWith("content-1", expect.any(Object)));
    });

    it("apresenta filtros e envia ordenação estável na listagem", async () => {
        render(<MemoryRouter><AdminCatalogListPage /></MemoryRouter>);
        await screen.findAllByText("Filme editorial");
        expect(mocks.listAdmin).toHaveBeenCalledWith(expect.objectContaining({ sort: "updatedAt", direction: "desc", page: 1, limit: 20 }), expect.any(Object));
    });

    it("gere taxonomias numa página list-first sem editor de conteúdo", async () => {
        const user = userEvent.setup();
        render(<MemoryRouter><AdminTaxonomiesPage /></MemoryRouter>);
        await screen.findAllByText("Esperança");
        expect(screen.queryByRole("heading", { name: "Criar conteúdo" })).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Nova taxonomia" }));
        const dialog = screen.getByRole("dialog");
        await user.type(within(dialog).getByLabelText("Nome"), "Família");
        await user.click(within(dialog).getByRole("button", { name: "Criar taxonomia" }));
        await waitFor(() => expect(mocks.createTaxonomy).toHaveBeenCalledWith(expect.objectContaining({ name: "Família" })));
    });
});
