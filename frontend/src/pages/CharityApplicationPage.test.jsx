/**
 * @file Testes do fluxo público de candidatura de associações.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../services/api/apiErrors.js";
import { CharityApplicationPage } from "./CharityApplicationPage.jsx";

const mocks = vi.hoisted(() => ({
    submitApplication: vi.fn(),
}));

vi.mock("../services/api/charitiesApi.js", () => ({
    charitiesApi: { submitApplication: mocks.submitApplication },
}));

/** @returns {ReturnType<typeof render>} Página renderizada com router. */
function renderPage() {
    return render(
        <MemoryRouter>
            <CharityApplicationPage />
        </MemoryRouter>,
    );
}

/**
 * Preenche todos os campos obrigatórios com valores válidos.
 *
 * @param {ReturnType<typeof userEvent.setup>} user Controlador do utilizador.
 * @returns {Promise<void>} Termina depois de preencher o formulário.
 */
async function fillRequiredFields(user) {
    await user.type(screen.getByLabelText("Nome da associação"), "Associação Exemplo");
    await user.type(screen.getByLabelText("Contacto principal"), "Maria Exemplo");
    await user.type(screen.getByLabelText("Email"), "maria@example.test");
    await user.type(
        screen.getByLabelText(/^Missão/u),
        "Apoio continuado a famílias e comunidades locais.",
    );
}

describe("CharityApplicationPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.submitApplication.mockResolvedValue({ application: { id: "app-1" } });
    });

    it("expõe nomes e identificadores estáveis em todos os controlos", () => {
        renderPage();

        for (const [label, name] of [
            ["Nome da associação", "name"],
            ["Contacto principal", "contactName"],
            ["Email", "email"],
            [/^Telefone/u, "phone"],
            [/^Missão/u, "mission"],
            [/^Website/u, "websiteUrl"],
        ]) {
            const field = screen.getByLabelText(label);
            expect(field).toHaveAttribute("id");
            expect(field).toHaveAttribute("name", name);
        }
    });

    it("submete com AbortSignal e apresenta confirmação orientadora", async () => {
        const user = userEvent.setup();
        renderPage();
        await fillRequiredFields(user);
        await user.click(screen.getByRole("button", { name: "Submeter candidatura" }));

        expect(await screen.findByRole("status")).toHaveTextContent(
            "Candidatura submetida para revisão.",
        );
        expect(mocks.submitApplication).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Associação Exemplo",
                email: "maria@example.test",
            }),
            { signal: expect.any(AbortSignal) },
        );
        for (const link of screen.getAllByRole("link", {
            name: "Voltar às associações",
        })) {
            expect(link).toHaveAttribute("href", "/associacoes");
        }

        await user.click(screen.getByRole("button", { name: "Submeter outra candidatura" }));
        expect(screen.getByLabelText("Nome da associação")).toHaveValue("");
    });

    it("preserva os dados quando o backend rejeita a candidatura", async () => {
        mocks.submitApplication.mockRejectedValue(
            new ApiError({ status: 409, message: "Já existe uma candidatura pendente." }),
        );
        const user = userEvent.setup();
        renderPage();
        await fillRequiredFields(user);
        await user.click(screen.getByRole("button", { name: "Submeter candidatura" }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Já existe uma candidatura pendente.",
        );
        expect(screen.getByLabelText("Nome da associação"))
            .toHaveValue("Associação Exemplo");
    });

    it("bloqueia submissões sobrepostas", async () => {
        mocks.submitApplication.mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        renderPage();
        await fillRequiredFields(user);
        const submit = screen.getByRole("button", { name: "Submeter candidatura" });
        await user.click(submit);

        expect(screen.getByRole("button", { name: "A submeter..." })).toBeDisabled();
        expect(mocks.submitApplication).toHaveBeenCalledTimes(1);
    });

    it("cancela a submissão ao desmontar", async () => {
        mocks.submitApplication.mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        const rendered = renderPage();
        await fillRequiredFields(user);
        await user.click(screen.getByRole("button", { name: "Submeter candidatura" }));
        const signal = mocks.submitApplication.mock.calls[0][1].signal;

        rendered.unmount();

        expect(signal.aborted).toBe(true);
    });
});
