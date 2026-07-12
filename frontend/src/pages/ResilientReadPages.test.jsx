/**
 * @file Testes de cancelamento e retry em páginas de leitura secundárias.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { CharityHistoryPage } from "./CharityHistoryPage.jsx";
import { ForYouPage } from "./ForYouPage.jsx";
import { PublicCharitiesPage } from "./PublicCharitiesPage.jsx";

const mocks = vi.hoisted(() => ({
    mine: vi.fn(),
    listPublicCharities: vi.fn(),
    getMine: vi.fn(),
    getCharityHistory: vi.fn(),
    historyCsvUrl: vi.fn(() => "/history.csv"),
    session: { status: "authenticated", isAdmin: false },
}));

vi.mock("../context/SessionContext.jsx", () => ({
    useSession: () => mocks.session,
}));
vi.mock("../services/api/recommendationsApi.js", () => ({
    recommendationsApi: { mine: mocks.mine },
}));
vi.mock("../services/api/charitiesApi.js", () => ({
    charitiesApi: {
        listPublicCharities: mocks.listPublicCharities,
        getMine: mocks.getMine,
        getCharityHistory: mocks.getCharityHistory,
        historyCsvUrl: mocks.historyCsvUrl,
    },
}));

describe("páginas de leitura resilientes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.mine.mockResolvedValue({ groups: [], coldStart: true });
        mocks.listPublicCharities.mockResolvedValue({ charities: [] });
        mocks.getMine.mockResolvedValue({ charity: null });
        mocks.session.status = "authenticated";
        mocks.session.isAdmin = false;
        mocks.getCharityHistory.mockResolvedValue({
            totalCents: 0,
            rows: [],
        });
    });

    it("repete recomendações com erro seguro e sinal cancelável", async () => {
        mocks.mine
            .mockRejectedValueOnce(
                new ApiError({ status: 503, message: "Serviço indisponível." }),
            )
            .mockResolvedValueOnce({ groups: [], coldStart: true });
        const user = userEvent.setup();
        render(<ForYouPage />);

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Serviço indisponível.",
        );
        expect(mocks.mine.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal);
        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(await screen.findByText(/Para começar, reunimos histórias/u))
            .toBeInTheDocument();
    });

    it("apresenta títulos editoriais em vez de categorias operacionais", async () => {
        mocks.mine.mockResolvedValueOnce({
            coldStart: false,
            groups: [{
                id: "because-your-activity",
                title: "Com base na tua atividade",
                items: [],
                explanation: {
                    signals: ["tipo de conteudo", "atividade"],
                    confidence: "baseline",
                },
            }],
        });

        render(<ForYouPage />);

        expect(await screen.findByRole("heading", { name: "Mais do que costumas ver" }))
            .toBeInTheDocument();
        expect(screen.queryByText("Com base na tua atividade"))
            .not.toBeInTheDocument();
    });

    it("cancela a leitura pública de associações ao desmontar", () => {
        mocks.listPublicCharities.mockReturnValue(new Promise(() => {}));
        const view = render(
            <MemoryRouter>
                <PublicCharitiesPage />
            </MemoryRouter>,
        );
        const signal = mocks.listPublicCharities.mock.calls[0][0].signal;

        view.unmount();

        expect(signal.aborted).toBe(true);
    });

    it("codifica o identificador no link da área da associação", async () => {
        mocks.getMine.mockResolvedValue({
            charity: {
                id: "charity/com espaço?origem=lista",
                name: "Associação Segura",
            },
        });
        mocks.listPublicCharities.mockResolvedValue({
            charities: [
                {
                    id: "charity/com espaço?origem=lista",
                    name: "Associação Segura",
                    mission: "Missão pública.",
                },
            ],
        });
        render(
            <MemoryRouter>
                <PublicCharitiesPage />
            </MemoryRouter>,
        );

        expect(
            await screen.findByRole("link", {
                name: "Área da associação",
            }),
        ).toHaveAttribute(
            "href",
            "/associacoes/charity%2Fcom%20espa%C3%A7o%3Forigem%3Dlista/historico",
        );
    });

    it("repete o histórico privado e mantém o ID codificado no serviço", async () => {
        mocks.getCharityHistory
            .mockRejectedValueOnce(
                new ApiError({ status: 503, message: "Histórico indisponível." }),
            )
            .mockResolvedValueOnce({ totalCents: 100, rows: [] });
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={["/associacoes/charity-1/historico"]}>
                <Routes>
                    <Route
                        path="/associacoes/:charityId/historico"
                        element={<CharityHistoryPage />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Histórico indisponível.",
        );
        await user.click(
            screen.getByRole("button", { name: "Tentar novamente" }),
        );

        expect(await screen.findByText(/Total recebido/u)).toBeInTheDocument();
        expect(mocks.getCharityHistory).toHaveBeenLastCalledWith(
            "charity-1",
            { signal: expect.any(AbortSignal) },
        );
    });
});
