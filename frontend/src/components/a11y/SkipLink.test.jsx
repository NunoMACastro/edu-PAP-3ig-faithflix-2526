/**
 * @file Teste comportamental do salto para o conteúdo principal.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SkipLink } from "./SkipLink.jsx";

describe("SkipLink", () => {
    it("move foco e deslocamento para o landmark principal", async () => {
        const user = userEvent.setup();
        const scrollIntoView = vi.fn();

        render(
            <>
                <SkipLink />
                <main id="conteudo-principal" tabIndex={-1}>
                    Conteúdo
                </main>
            </>,
        );

        const main = screen.getByRole("main");
        main.scrollIntoView = scrollIntoView;

        await user.click(screen.getByRole("link", { name: "Saltar para o conteúdo principal" }));

        expect(main).toHaveFocus();
        expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
    });
});
