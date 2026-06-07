import { expect, test } from "@playwright/test";

test("MF2 fluxo principal: login, detalhe, listas, player e biblioteca", async ({
    page,
}) => {
    await page.goto("/login");
    await expect(page.getByTestId("auth-form")).toBeVisible();
    await page.getByTestId("email-input").fill("e2e@faithflix.test");
    await page.getByTestId("password-input").fill("password-segura-123");
    await page.getByTestId("login-submit").click();
    await expect(page.getByText("Sessao iniciada.")).toBeVisible();

    const catalogStart = performance.now();
    await page.goto("/catalogo");
    await expect(
        page.getByRole("heading", { name: /catalogo/i }),
    ).toBeVisible();
    await expect(page.getByText("Piloto FaithFlix")).toBeVisible();
    const catalogLoadMs = performance.now() - catalogStart;
    console.log(`RNF07 catalogLoadMs=${Math.round(catalogLoadMs)}`);
    expect(catalogLoadMs).toBeLessThan(3000);

    await page.goto("/catalogo/piloto-faithflix");
    await expect(page.getByTestId("content-detail")).toBeVisible();

    await page.getByRole("button", { name: /adicionar aos favoritos/i }).click();
    await page.getByRole("button", { name: /adicionar a watchlist/i }).click();
    await page.getByRole("link", { name: /reproduzir/i }).click();

    const player = page.getByTestId("faithflix-player");
    await expect(player).toBeVisible();

    const playStartMs = await player.evaluate(async (video) => {
        video.muted = true;
        const start = performance.now();

        await video.play();

        if (!video.paused && !video.ended) {
            return performance.now() - start;
        }

        await new Promise((resolve, reject) => {
            const timeout = window.setTimeout(
                () => reject(new Error("Video nao iniciou dentro do limite.")),
                3000,
            );
            video.addEventListener(
                "playing",
                () => {
                    window.clearTimeout(timeout);
                    resolve();
                },
                { once: true },
            );
        });

        return performance.now() - start;
    });

    console.log(`RNF08 playStartMs=${Math.round(playStartMs)}`);
    expect(playStartMs).toBeLessThan(3000);

    await page.waitForTimeout(16_000);
    await player.evaluate((video) => video.pause());

    await page.goto("/biblioteca");
    await expect(page.getByTestId("my-library")).toBeVisible();
    await expect(page.getByText("Piloto FaithFlix")).toBeVisible();
});
