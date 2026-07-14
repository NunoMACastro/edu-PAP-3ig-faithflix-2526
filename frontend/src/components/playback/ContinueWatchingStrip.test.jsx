/**
 * @file Testes da faixa paginada e cancelável de continuação.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../services/api/apiErrors.js";
import { ContinueWatchingStrip } from "./ContinueWatchingStrip.jsx";

const mocks = vi.hoisted(() => ({
    sessionStatus: "authenticated",
    listContinueWatching: vi.fn(),
}));

vi.mock("../../context/SessionContext.jsx", () => ({
    useSession: () => ({ status: mocks.sessionStatus }),
}));
vi.mock("../../services/api/playbackApi.js", () => ({
    playbackApi: { listContinueWatching: mocks.listContinueWatching },
}));

function renderStrip() {
    return render(
        <MemoryRouter>
            <ContinueWatchingStrip />
        </MemoryRouter>,
    );
}

describe("ContinueWatchingStrip", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.sessionStatus = "authenticated";
        mocks.listContinueWatching.mockResolvedValue({ items: [] });
    });

    it("carrega uma página limitada com sinal cancelável", async () => {
        mocks.listContinueWatching.mockResolvedValue({
            items: [
                {
                    id: "content/1",
                    title: "Conteúdo",
                    currentTimeSeconds: 75,
                    durationSeconds: 100,
                    posterUrl: "/poster.webp",
                    canResume: true,
                },
            ],
        });
        renderStrip();

        expect(await screen.findByText("Conteúdo")).toBeInTheDocument();
        expect(mocks.listContinueWatching).toHaveBeenCalledWith(
            { page: 1, limit: 12 },
            { signal: expect.any(AbortSignal) },
        );
        expect(screen.getByLabelText("Progresso de Conteúdo")).toHaveValue(75);
        expect(screen.getByAltText("Cartaz de Conteúdo")).toHaveAttribute(
            "loading",
            "lazy",
        );
        expect(
            screen.getByRole("link", { name: "Continuar a ver Conteúdo" }),
        ).toHaveAttribute("href", "/ver/content%2F1");
    });

    it("encaminha para os planos quando o entitlement não permite retomar", async () => {
        mocks.listContinueWatching.mockResolvedValue({
            items: [
                {
                    id: "content-locked",
                    title: "Conteúdo bloqueado",
                    currentTimeSeconds: 20,
                    durationSeconds: 100,
                    canResume: false,
                },
            ],
        });

        renderStrip();

        expect(
            await screen.findByRole("link", {
                name: "Ver planos para retomar Conteúdo bloqueado",
            }),
        ).toHaveAttribute("href", "/planos");
        expect(screen.getByText("Ver planos")).toBeInTheDocument();
    });

    it("cancela a leitura quando desmonta", () => {
        mocks.listContinueWatching.mockReturnValue(new Promise(() => {}));
        const view = renderStrip();
        const signal = mocks.listContinueWatching.mock.calls[0][1].signal;

        view.unmount();

        expect(signal.aborted).toBe(true);
    });

    it("mostra erro seguro e permite repetir o pedido", async () => {
        mocks.listContinueWatching
            .mockRejectedValueOnce(
                new ApiError({ status: 503, message: "Serviço indisponível." }),
            )
            .mockResolvedValueOnce({ items: [] });
        const user = userEvent.setup();
        renderStrip();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Serviço indisponível.",
        );
        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(mocks.listContinueWatching).toHaveBeenCalledTimes(2);
    });
});
