/**
 * @file Testes do texto editorial apresentado no rodapé público.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppFooter } from "./AppFooter.jsx";

describe("AppFooter", () => {
    it("apresenta apenas a marca e a proposta pública", () => {
        render(<AppFooter />);

        expect(screen.getByText("FaithFlix")).toBeVisible();
        expect(screen.getByText("Conteúdo, comunidade e impacto solidário."))
            .toBeVisible();
        expect(screen.queryByText(/PAP|simulad|demonstração/iu))
            .not.toBeInTheDocument();
    });
});
