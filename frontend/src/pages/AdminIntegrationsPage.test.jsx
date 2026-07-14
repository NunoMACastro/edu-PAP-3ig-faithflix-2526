/**
 * @file Testes comportamentais da configuração administrativa de integrações.
 */

import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminIntegrationsPage } from "./AdminIntegrationsPage.jsx";

const mocks = vi.hoisted(() => ({
  listIntegrations: vi.fn(),
  updateIntegration: vi.fn(),
}));

vi.mock("../services/api/integrationsApi.js", () => ({ integrationsApi: mocks }));

const integration = {
  key: "internal_notifications",
  label: "Notificacoes internas",
  enabled: true,
  mode: "internal",
  publicConfig: { channel: "in_app" },
  allowedModes: ["internal", "disabled"],
  configurationValid: true,
  envVars: [],
};

function deferred() {
  let resolve;
  const promise = new Promise((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

describe("AdminIntegrationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listIntegrations.mockResolvedValue({ integrations: [integration] });
    mocks.updateIntegration.mockResolvedValue({ integration });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("apresenta rótulos PT-PT e aborta a leitura no unmount", async () => {
    const view = render(<AdminIntegrationsPage />);

    await screen.findByText("Notificações na aplicação");
    expect(screen.getByRole("option", { name: "Automático" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Desativado" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Simulação" })).not.toBeInTheDocument();
    const signal = mocks.listIntegrations.mock.calls[0][0].signal;
    view.unmount();
    expect(signal.aborted).toBe(true);
  });

  it("confirma, serializa e aplica a resposta autoritativa por linha", async () => {
    const request = deferred();
    mocks.updateIntegration.mockReturnValueOnce(request.promise);
    const user = userEvent.setup();
    render(<AdminIntegrationsPage />);
    await screen.findByText("Notificações na aplicação");

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(screen.getByText("Alterações por guardar")).toBeInTheDocument();
    expect(mocks.updateIntegration).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Guardar alterações" }));
    expect(mocks.updateIntegration).toHaveBeenCalledWith(
      "internal_notifications",
      {
        enabled: false,
        mode: "internal",
        publicConfig: { channel: "in_app" },
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(checkbox).toBeDisabled();
    await user.click(checkbox);
    expect(mocks.updateIntegration).toHaveBeenCalledOnce();

    await act(async () =>
      request.resolve({
        integration: { ...integration, enabled: false },
      }),
    );
    expect(await screen.findByText("Estado: Desativada")).toBeInTheDocument();
  });

  it("não aplica uma mudança de modo cancelada", async () => {
    const user = userEvent.setup();
    render(<AdminIntegrationsPage />);
    await screen.findByText("Notificações na aplicação");

    const select = screen.getByRole("combobox", { name: "Funcionamento" });
    await user.selectOptions(select, "disabled");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(mocks.updateIntegration).not.toHaveBeenCalled();
    expect(select).toHaveValue("internal");
  });
});
