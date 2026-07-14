/**
 * @file Medicao local de performance para a MF6.
 *
 * Mede catalogo, pesquisa, recomendacoes autenticadas e uma rajada concorrente
 * curta sem adicionar dependencias ao backend FaithFlix.
 */

import { performance } from "node:perf_hooks";

const baseUrl = process.env.FAITHFLIX_API_BASE_URL ?? "http://127.0.0.1:3101";
const sessionCookie = process.env.FAITHFLIX_SESSION_COOKIE ?? "";

const publicCases = [
    { name: "health", path: "/health", thresholdMs: 500 },
    { name: "catalog", path: "/api/catalog?limit=12", thresholdMs: 2000 },
    { name: "search", path: "/api/search?q=fe&limit=12", thresholdMs: 2000 },
];

const authenticatedCases = [
    {
        name: "recommendations",
        path: "/api/recommendations/me",
        thresholdMs: 3000,
    },
];

/**
 * Mede uma chamada HTTP GET lendo a resposta completa.
 *
 * @param {{ name: string, path: string, thresholdMs: number }} testCase Caso a medir.
 * @param {Record<string, string>} [headers={}] Headers seguros do pedido.
 * @returns {Promise<{ name: string, status: number, durationMs: number, thresholdMs: number }>} Resultado da medicao.
 * @throws {Error} Quando a API local nao responde.
 */
async function measure(testCase, headers = {}) {
    const startedAt = performance.now();
    let response;

    try {
        response = await fetch(`${baseUrl}${testCase.path}`, { headers });
    } catch (error) {
        const reason = error.cause?.code ?? error.message;
        throw new Error(
            `Falha ao medir ${testCase.name} em ${testCase.path}: ${reason}`,
        );
    }

    await response.arrayBuffer();

    return {
        name: testCase.name,
        status: response.status,
        durationMs: Math.round(performance.now() - startedAt),
        thresholdMs: testCase.thresholdMs,
    };
}

/**
 * Calcula um percentil simples para listas curtas de duracoes.
 *
 * @param {number[]} values Valores em milissegundos.
 * @param {number} ratio Percentil em formato decimal, por exemplo `0.95`.
 * @returns {number} Valor do percentil.
 */
function percentile(values, ratio) {
    const sorted = [...values].sort((left, right) => left - right);
    const index = Math.ceil(sorted.length * ratio) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))] ?? 0;
}

/**
 * Falha cedo quando a medicao autenticada nao tem cookie de sessao.
 *
 * @returns {void}
 * @throws {Error} Quando a variavel de ambiente de sessao nao foi definida.
 */
function assertSessionCookie() {
    if (!sessionCookie) {
        throw new Error(
            "Define FAITHFLIX_SESSION_COOKIE=faithflix_session=... para medir recomendacoes autenticadas.",
        );
    }
}

assertSessionCookie();

const results = [];

for (const testCase of publicCases) {
    // A primeira chamada aquece o processo local; a segunda fica registada como medicao.
    await measure(testCase);
    results.push(await measure(testCase));
}

for (const testCase of authenticatedCases) {
    // O cookie so e enviado para o endpoint autenticado e nunca e escrito no output.
    await measure(testCase, { Cookie: sessionCookie });
    results.push(await measure(testCase, { Cookie: sessionCookie }));
}

const concurrentResults = await Promise.all(
    Array.from({ length: 20 }, () =>
        measure({
            name: "health_concorrente",
            path: "/health",
            thresholdMs: 500,
        }),
    ),
);
const concurrentP95 = percentile(
    concurrentResults.map((result) => result.durationMs),
    0.95,
);

results.push({
    name: "health_concorrente_20_p95",
    status: 200,
    durationMs: concurrentP95,
    thresholdMs: 2000,
});

const unauthenticatedRecommendations = await fetch(
    `${baseUrl}/api/recommendations/me`,
);

if (unauthenticatedRecommendations.status !== 401) {
    results.push({
        name: "recommendations_sem_sessao",
        status: unauthenticatedRecommendations.status,
        durationMs: 3001,
        thresholdMs: 3000,
    });
}

console.table(results);

const failures = results.filter(
    (result) => result.status >= 400 || result.durationMs > result.thresholdMs,
);

if (failures.length > 0) {
    console.error("Performance MF6: FAIL");
    for (const failure of failures) {
        console.error(
            `${failure.name}: ${failure.durationMs}ms acima do limite ${failure.thresholdMs}ms`,
        );
    }
    process.exitCode = 1;
} else {
    console.log("Performance MF6: PASS");
}
