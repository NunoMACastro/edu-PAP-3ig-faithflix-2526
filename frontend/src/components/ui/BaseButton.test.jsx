/**
 * @file Testes comportamentais do botão reutilizável.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BaseButton } from "./BaseButton.jsx";

describe("BaseButton", () => {
    it("executa a ação quando está disponível", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(<BaseButton onClick={onClick}>Continuar</BaseButton>);
        await user.click(screen.getByRole("button", { name: "Continuar" }));

        expect(onClick).toHaveBeenCalledOnce();
    });

    it("não executa a ação quando está desativado", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(
            <BaseButton disabled onClick={onClick}>
                Continuar
            </BaseButton>,
        );
        await user.click(screen.getByRole("button", { name: "Continuar" }));

        expect(onClick).not.toHaveBeenCalled();
    });
});
