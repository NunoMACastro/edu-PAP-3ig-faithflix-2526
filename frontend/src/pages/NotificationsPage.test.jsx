/**
 * @file Testes comportamentais das notificações e preferências autoritativas.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { NotificationsPage } from "./NotificationsPage.jsx";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  getPreferences: vi.fn(),
  updatePreferences: vi.fn(),
  markAsRead: vi.fn(),
}));

vi.mock("../services/api/notificationsApi.js", () => ({
  notificationsApi: mocks,
}));

const notification = {
  id: "notification-1",
  title: "Bem-vindo",
  message: "Mensagem segura.",
  readAt: null,
};

describe("NotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.list.mockResolvedValue({ notifications: [notification] });
    mocks.getPreferences.mockResolvedValue({
      preferences: { inApp: true, email: false, continueWatching: true },
    });
  });

  it("carrega dados canceláveis e apresenta as três preferências", async () => {
    render(<NotificationsPage />);

    expect(await screen.findByText("Bem-vindo")).toBeInTheDocument();
    expect(screen.getByLabelText("Notificações por email")).not.toBeChecked();
    expect(mocks.list).toHaveBeenCalledWith({
      signal: expect.any(AbortSignal),
    });
    expect(mocks.getPreferences).toHaveBeenCalledWith({
      signal: expect.any(AbortSignal),
    });
  });

  it("cancela as leituras pendentes ao desmontar", () => {
    mocks.list.mockReturnValue(new Promise(() => {}));
    mocks.getPreferences.mockReturnValue(new Promise(() => {}));
    const view = render(<NotificationsPage />);
    const signal = mocks.list.mock.calls[0][0].signal;

    view.unmount();

    expect(signal.aborted).toBe(true);
  });

  it("reverte a preferência otimista quando a escrita falha", async () => {
    mocks.updatePreferences.mockRejectedValue(
      new ApiError({ status: 503, message: "Serviço indisponível." }),
    );
    const user = userEvent.setup();
    render(<NotificationsPage />);
    const email = await screen.findByLabelText("Notificações por email");

    await user.click(email);

    await waitFor(() => expect(email).not.toBeChecked());
    expect(screen.getByRole("alert")).toHaveTextContent("Serviço indisponível.");
  });

  it("usa a resposta autoritativa e marca apenas a linha ocupada", async () => {
    mocks.updatePreferences.mockResolvedValue({
      preferences: { inApp: true, email: true, continueWatching: true },
    });
    mocks.markAsRead.mockResolvedValue({
      notification: { ...notification, readAt: "2026-07-10T00:00:00.000Z" },
    });
    const user = userEvent.setup();
    render(<NotificationsPage />);

    await user.click(await screen.findByLabelText("Notificações por email"));
    expect(screen.getByLabelText("Notificações por email")).toBeChecked();

    const markButton = screen.getByRole("button", { name: "Marcar como lida" });
    await user.click(markButton);
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Marcar como lida" }))
        .not.toBeInTheDocument();
    });
    expect(mocks.markAsRead).toHaveBeenCalledWith(
      "notification-1",
      { signal: expect.any(AbortSignal) },
    );
  });
});
