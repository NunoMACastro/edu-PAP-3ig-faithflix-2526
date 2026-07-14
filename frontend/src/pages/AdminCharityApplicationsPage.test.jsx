/**
 * @file Testes comportamentais da revisão administrativa de candidaturas.
 */

import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminCharityApplicationsPage } from "./AdminCharityApplicationsPage.jsx";

const mocks = vi.hoisted(() => ({
  listApplications: vi.fn(),
  reviewApplication: vi.fn(),
}));

vi.mock("../services/api/charitiesApi.js", () => ({ charitiesApi: mocks }));

const application = {
  id: "application-1",
  name: "Associação Esperança",
  contactName: "Maria Esperança",
  email: "maria@esperanca.test",
  phone: "+351 910 000 000",
  websiteUrl: "https://esperanca.test",
  mission: "Apoiar famílias da comunidade local.",
  status: "pending",
  submittedAt: "2026-07-01T10:00:00.000Z",
};

function pageResponse({ applications = [application], page = 1, total = 1, totalPages = 1 } = {}) {
  return { applications, page, limit: 20, total, totalPages };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}

describe("AdminCharityApplicationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listApplications.mockResolvedValue(pageResponse());
    mocks.reviewApplication.mockResolvedValue({});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pagina no backend e cancela a leitura anterior", async () => {
    mocks.listApplications
      .mockResolvedValueOnce(pageResponse({ total: 21, totalPages: 2 }))
      .mockResolvedValueOnce(
        pageResponse({ applications: [], page: 2, total: 21, totalPages: 2 }),
      );
    const user = userEvent.setup();
    render(<AdminCharityApplicationsPage />);

    await screen.findByText("Associação Esperança");
    const firstSignal = mocks.listApplications.mock.calls[0][1].signal;
    await user.click(screen.getByRole("button", { name: "Seguinte" }));

    await waitFor(() =>
      expect(mocks.listApplications).toHaveBeenLastCalledWith(
        { status: "pending", page: 2, limit: 20 },
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    );
    expect(firstSignal.aborted).toBe(true);
  });

  it("confirma e serializa a decisão por candidatura", async () => {
    const review = deferred();
    mocks.reviewApplication.mockReturnValueOnce(review.promise);
    mocks.listApplications
      .mockResolvedValueOnce(pageResponse())
      .mockResolvedValueOnce(pageResponse({ applications: [], total: 0 }));
    const user = userEvent.setup();
    render(<AdminCharityApplicationsPage />);
    await screen.findByText("Associação Esperança");

    await user.click(screen.getByRole("button", { name: "Rever candidatura" }));
    const approvalRadio = screen.getByRole("radio", { name: "Aprovar" });
    await user.click(approvalRadio);
    expect(approvalRadio.closest(".decision-option")).toHaveClass("is-selected");
    expect(screen.queryByRole("textbox", { name: "Motivo da rejeição" }))
      .not.toBeInTheDocument();
    const approve = screen.getByRole("button", { name: "Aprovar e criar associação" });
    await user.click(approve);
    expect(mocks.reviewApplication).toHaveBeenCalledWith(
      "application-1",
      { decision: "approved", reason: "" },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(approve).toBeDisabled();
    await user.click(approve);
    expect(mocks.reviewApplication).toHaveBeenCalledOnce();

    await act(async () => review.resolve({}));
    expect(await screen.findByText("Candidatura aprovada e associação criada.")).toBeInTheDocument();
  });

  it("normaliza erros inesperados sem expor a mensagem técnica", async () => {
    mocks.reviewApplication.mockRejectedValueOnce(
      new Error("detalhe interno sensível"),
    );
    const user = userEvent.setup();
    render(<AdminCharityApplicationsPage />);
    await screen.findByText("Associação Esperança");

    await user.click(screen.getByRole("button", { name: "Rever candidatura" }));
    const rejectionRadio = screen.getByRole("radio", { name: "Rejeitar" });
    await user.click(rejectionRadio);
    expect(rejectionRadio.closest(".decision-option")).toHaveClass("is-selected");
    await user.type(within(screen.getByRole("dialog")).getByRole("textbox", { name: "Motivo da rejeição" }), "Critérios mínimos não cumpridos.");
    await user.click(screen.getByRole("button", { name: "Rejeitar candidatura" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ocorreu um erro inesperado",
    );
    expect(screen.queryByText(/detalhe interno sensível/u)).not.toBeInTheDocument();
  });
});
