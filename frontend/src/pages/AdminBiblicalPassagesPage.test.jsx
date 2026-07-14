/**
 * @file Testes comportamentais da gestão administrativa de passagens bíblicas.
 */

import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminBiblicalPassagesPage } from "./AdminBiblicalPassagesPage.jsx";

const biblicalMocks = vi.hoisted(() => ({
  listAdmin: vi.fn(),
  listAdminForContent: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  linkToContent: vi.fn(),
  unlinkFromContent: vi.fn(),
}));
const catalogMocks = vi.hoisted(() => ({ listAdmin: vi.fn() }));

vi.mock("../services/api/biblicalPassagesApi.js", () => ({
  biblicalPassagesApi: biblicalMocks,
}));
vi.mock("../services/api/catalogApi.js", () => ({ catalogApi: catalogMocks }));

const passage = {
  id: "passage-1",
  reference: "João 3:16",
  book: "João",
  chapterStart: 3,
  verseStart: 16,
  chapterEnd: 3,
  verseEnd: 16,
  translation: "Parafraseado",
  text: "Texto da passagem",
  theme: "Esperança",
  reflection: "Reflexão",
  status: "draft",
};
const content = {
  id: "content-1",
  title: "Filme Esperança",
  status: "published",
};
const secondContent = {
  id: "content-2",
  title: "Filme Comunidade",
  status: "draft",
};
const association = {
  ...passage,
  contentId: "content-1",
  passageId: "passage-1",
  note: "Nota editorial",
};

function deferred() {
  let resolve;
  const promise = new Promise((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe("AdminBiblicalPassagesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn(() => true));
    biblicalMocks.listAdmin.mockResolvedValue({
      items: [passage],
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
    });
    catalogMocks.listAdmin.mockResolvedValue({ items: [content] });
    biblicalMocks.listAdminForContent.mockResolvedValue({ items: [association] });
    biblicalMocks.updateStatus.mockResolvedValue({ passage });
    biblicalMocks.unlinkFromContent.mockResolvedValue({});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("confirma e serializa a alteração editorial por passagem", async () => {
    const request = deferred();
    biblicalMocks.updateStatus.mockReturnValueOnce(request.promise);
    const user = userEvent.setup();
    render(<AdminBiblicalPassagesPage />);
    await screen.findByText("João 3:16");

    const publish = screen.getByRole("button", {
      name: "Publicar João 3:16",
    });
    await user.click(publish);
    const publishDialog = screen.getByRole("dialog");
    expect(publishDialog).toHaveTextContent("A passagem ficará visível");
    await user.click(within(publishDialog).getByRole("button", { name: "Publicar" }));
    expect(biblicalMocks.updateStatus).toHaveBeenCalledWith(
      "passage-1",
      "published",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(
      screen.getByRole("button", { name: "Arquivar João 3:16" }),
    ).toBeDisabled();
    expect(biblicalMocks.updateStatus).toHaveBeenCalledOnce();

    await act(async () =>
      request.resolve({ passage: { ...passage, status: "published" } }),
    );
    expect(await screen.findByText("Publicada")).toBeInTheDocument();
    expect(screen.getByRole("button", {
      name: "Passar João 3:16 a rascunho",
    })).toHaveAttribute("aria-pressed", "true");
  });

  it("representa o arquivo como toggle e restaura a passagem para rascunho", async () => {
    biblicalMocks.listAdmin.mockResolvedValueOnce({
      items: [{ ...passage, status: "archived" }],
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
    });
    biblicalMocks.updateStatus.mockResolvedValueOnce({ passage });
    const user = userEvent.setup();
    render(<AdminBiblicalPassagesPage />);
    await screen.findByText("João 3:16");

    const restore = screen.getByRole("button", {
      name: "Restaurar João 3:16 como rascunho",
    });
    expect(restore).toHaveAttribute("aria-pressed", "true");
    expect(restore.querySelector(".icon-check")).not.toBeNull();
    expect(screen.getByRole("button", {
      name: "Publicação indisponível enquanto João 3:16 está arquivada",
    })).toBeDisabled();

    await user.click(restore);
    const restoreDialog = screen.getByRole("dialog");
    expect(restoreDialog).toHaveTextContent("Restaurar");
    await user.click(within(restoreDialog).getByRole("button", { name: "Restaurar" }));

    expect(biblicalMocks.updateStatus).toHaveBeenCalledWith(
      "passage-1",
      "draft",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    const archive = await screen.findByRole("button", {
      name: "Arquivar João 3:16",
    });
    expect(archive).toHaveAttribute("aria-pressed", "false");
    expect(archive.querySelector(".icon-check")).toBeNull();
  });

  it("confirma a remoção e bloqueia a associação durante a mutação", async () => {
    const request = deferred();
    biblicalMocks.unlinkFromContent.mockReturnValueOnce(request.promise);
    const user = userEvent.setup();
    render(<AdminBiblicalPassagesPage />);
    await screen.findByText("João 3:16");

    await user.selectOptions(screen.getByLabelText("Conteúdo"), "content-1");
    const remove = await screen.findByRole("button", {
      name: "Remover associação",
    });
    expect(biblicalMocks.listAdminForContent).toHaveBeenCalledWith(
      "content-1",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );

    await user.click(remove);
    const removeDialog = screen.getByRole("dialog");
    expect(removeDialog).toHaveTextContent("Remover a associação");
    await user.click(within(removeDialog).getByRole("button", { name: "Remover associação" }));
    expect(biblicalMocks.unlinkFromContent).toHaveBeenCalledWith(
      "content-1",
      "passage-1",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(remove).toBeDisabled();

    await act(async () => request.resolve({}));
    expect(await screen.findByText("Associação removida.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remover associação" }),
    ).not.toBeInTheDocument();
  });

  it("aborta ambas as leituras administrativas quando desmonta", async () => {
    const view = render(<AdminBiblicalPassagesPage />);
    await screen.findByText("João 3:16");

    const passageSignal = biblicalMocks.listAdmin.mock.calls[0][1].signal;
    const catalogSignal = catalogMocks.listAdmin.mock.calls[0][1].signal;
    view.unmount();

    expect(passageSignal.aborted).toBe(true);
    expect(catalogSignal.aborted).toBe(true);
  });

  it("não aplica a remoção tardia às associações de outro conteúdo", async () => {
    const removal = deferred();
    biblicalMocks.unlinkFromContent.mockReturnValueOnce(removal.promise);
    catalogMocks.listAdmin.mockResolvedValue({
      items: [content, secondContent],
    });
    biblicalMocks.listAdminForContent.mockImplementation((contentId) =>
      Promise.resolve({
        items:
          contentId === "content-1"
            ? [association]
            : [
                {
                  ...association,
                  contentId: "content-2",
                  note: "Associação do segundo conteúdo",
                },
              ],
      }),
    );
    const user = userEvent.setup();
    render(<AdminBiblicalPassagesPage />);
    await screen.findByText("João 3:16");

    const contentSelect = screen.getByLabelText("Conteúdo");
    await user.selectOptions(contentSelect, "content-1");
    await user.click(
      await screen.findByRole("button", { name: "Remover associação" }),
    );
    await user.selectOptions(contentSelect, "content-2");
    expect(
      await screen.findByText("Associação do segundo conteúdo"),
    ).toBeInTheDocument();

    await act(async () => removal.resolve({}));

    expect(
      screen.getByText("Associação do segundo conteúdo"),
    ).toBeInTheDocument();
  });
});
