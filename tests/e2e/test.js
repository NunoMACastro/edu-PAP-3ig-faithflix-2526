/**
 * @file Fixtures Playwright comuns com política de rede fail-closed.
 */

import { expect, test as base } from "@playwright/test";
import { installDeterministicNetworkPolicy } from "./network-policy.js";

/**
 * Cria um contexto adicional com a mesma política fail-closed da fixture base.
 *
 * @param {import("@playwright/test").Browser} browser Browser do teste.
 * @param {import("@playwright/test").BrowserContextOptions} [options] Opções do contexto.
 * @param {{ readOnly?: boolean }} [policyOptions] Opções da política de rede.
 * @returns {Promise<import("@playwright/test").BrowserContext>} Contexto protegido.
 */
export async function createNetworkSafeContext(
    browser,
    options,
    policyOptions,
) {
    const context = await browser.newContext(options);
    try {
        await installDeterministicNetworkPolicy(context, policyOptions);
        return context;
    } catch (error) {
        await context.close();
        throw error;
    }
}

export const test = base.extend({
    networkPolicy: [
        async ({ context }, use) => {
            await installDeterministicNetworkPolicy(context);
            await use();
        },
        { auto: true },
    ],
});

export { expect };
