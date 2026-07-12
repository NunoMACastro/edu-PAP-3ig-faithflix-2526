/**
 * @file Testes dos autocompletes e confirmação nominal de memberships.
 */

import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminCharityMembersPage } from "./AdminCharityMembersPage.jsx";

const mocks = vi.hoisted(() => ({
  lookupAdminCharities: vi.fn(),
  linkUserToCharity: vi.fn(),
  listUsers: vi.fn(),
}));

vi.mock("../services/api/charitiesApi.js", () => ({ charitiesApi: mocks }));
vi.mock("../services/api/userApi.js", () => ({ userApi: mocks }));

function deferred() {
  let resolve;
  const promise = new Promise((promiseResolve) => { resolve = promiseResolve; });
  return { promise, resolve };
}

async function selectEntities(user) {
  await user.type(screen.getByRole("combobox", { name: "Associação" }), "Esperança");
  await user.click(await screen.findByRole("option", { name: "Associação Esperança" }, { timeout: 1500 }));
  await user.type(screen.getByRole("combobox", { name: "Utilizador" }), "Ana");
  await user.click(await screen.findByRole("option", { name: "Ana Teste · ana@faithflix.test" }, { timeout: 1500 }));
}

describe("AdminCharityMembersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.lookupAdminCharities.mockResolvedValue({ charities: [{ id: "charity-1", name: "Associação Esperança" }] });
    mocks.listUsers.mockResolvedValue({ users: [{ id: "user-1", name: "Ana Teste", email: "ana@faithflix.test" }] });
  });

  it("confirma nomes, envia apenas IDs e mostra a resposta enriquecida", async () => {
    const request = deferred();
    mocks.linkUserToCharity.mockReturnValueOnce(request.promise);
    const user = userEvent.setup();
    render(<AdminCharityMembersPage />);
    await selectEntities(user);

    await user.click(screen.getByRole("button", { name: "Ligar utilizador" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Ana Teste");
    expect(dialog).toHaveTextContent("Associação Esperança");
    await user.click(within(dialog).getByRole("button", { name: "Criar ligação" }));

    expect(mocks.linkUserToCharity).toHaveBeenCalledWith("charity-1", "user-1", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(within(dialog).getByRole("button", { name: "A processar…" })).toBeDisabled();
    await act(async () => request.resolve({ membership: { charityId: "charity-1", userId: "user-1" }, user: { id: "user-1", name: "Ana Teste", email: "ana@faithflix.test" }, charity: { id: "charity-1", name: "Associação Esperança" } }));
    expect(await screen.findByRole("status")).toHaveTextContent("Ana Teste (ana@faithflix.test) foi ligado a Associação Esperança");
  });

  it("cancela sem criar e aborta um commit pendente no unmount", async () => {
    const user = userEvent.setup();
    const first = render(<AdminCharityMembersPage />);
    await selectEntities(user);
    await user.click(screen.getByRole("button", { name: "Ligar utilizador" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancelar" }));
    expect(mocks.linkUserToCharity).not.toHaveBeenCalled();
    first.unmount();

    const request = deferred();
    mocks.linkUserToCharity.mockReturnValueOnce(request.promise);
    const second = render(<AdminCharityMembersPage />);
    await selectEntities(user);
    await user.click(screen.getByRole("button", { name: "Ligar utilizador" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Criar ligação" }));
    const signal = mocks.linkUserToCharity.mock.calls[0][2].signal;
    second.unmount();
    expect(signal.aborted).toBe(true);
  });

  it("permite escolher o primeiro resultado por teclado e apresenta o resumo antes da confirmação", async () => {
    const user = userEvent.setup();
    render(<AdminCharityMembersPage />);

    const charityInput = screen.getByRole("combobox", { name: "Associação" });
    await user.type(charityInput, "Esperança");
    await screen.findByRole("option", { name: "Associação Esperança" });
    await user.keyboard("{ArrowDown}{Enter}");

    const userInput = screen.getByRole("combobox", { name: "Utilizador" });
    await user.type(userInput, "Ana");
    await screen.findByRole("option", { name: "Ana Teste · ana@faithflix.test" });
    await user.keyboard("{ArrowDown}{Enter}");

    expect(screen.getByRole("heading", { name: "Confirmar ligação" })).toBeInTheDocument();
    expect(screen.getAllByText("ana@faithflix.test")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Ligar utilizador" })).toBeEnabled();
  });
});
