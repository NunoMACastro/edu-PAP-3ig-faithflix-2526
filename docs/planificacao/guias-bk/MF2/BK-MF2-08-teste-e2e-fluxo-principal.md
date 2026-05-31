# BK-MF2-08 - Teste E2E do fluxo principal

## Header

- `doc_id`: `GUIA-BK-MF2-08`
- `bk_id`: `BK-MF2-08`
- `macro`: `MF2`
- `owner`: `Kaue`
- `apoio`: `Mateus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-01,BK-MF2-07`
- `rf_rnf`: `RNF07, RNF08`
- `fase_documental`: `Fase 1`
- `sprint`: `S04`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF3-01`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-08-teste-e2e-fluxo-principal.md`
- `last_updated`: `2026-05-31`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Criar um teste end-to-end do fluxo principal da MF2: login, catalogo, detalhe, favoritos, watchlist, player, progresso e biblioteca pessoal. Este BK valida `RNF07` e `RNF08` com medicoes objetivas.

O aluno deve perceber que um E2E nao substitui testes unitarios, mas prova que as pecas principais funcionam juntas no browser.

### Tempo estimado

- Preparar seed e media de teste: 35 min.
- Configurar Playwright: 35 min.
- Escrever fluxo E2E: 70 min.
- Medir RNF07/RNF08 e recolher evidence: 45 min.

### Conceitos essenciais

- E2E testa o sistema como utilizador final.
- Seed data evita depender de dados manuais.
- `RNF07` mede carregamento inicial de pagina.
- `RNF08` mede arranque do video depois da acao de reproducao.
- O teste deve falhar se o fluxo real estiver partido.

### Erros comuns

- Testar apenas endpoints e chamar isso de E2E.
- Medir performance sem guardar o valor observado.
- Correr o teste com base de dados suja.
- Depender de cliques em textos instaveis.
- Ignorar o ficheiro de media necessario para o player.

### Check de compreensao

- [ ] Sei explicar o que o E2E cobre e o que nao cobre.
- [ ] Sei executar seed antes do teste.
- [ ] Sei interpretar uma falha de RNF07 ou RNF08.
- [ ] Sei anexar evidence ao PR/defesa.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-01` a `BK-MF2-07` concluidos.
- Backend e frontend arrancam localmente.
- MongoDB acessivel.
- Existe `frontend/public/media/piloto.mp4`, com video curto e leve para teste.
- Existe conteudo publicado com slug `piloto-faithflix`.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Ferramenta | Playwright |
| Scope | teste browser real Chromium |
| Seed | `backend/scripts/seed-mf2-e2e.js` |
| Teste | `tests/e2e/mf2-flow.spec.js` |
| RNF07 | pagina de detalhe carrega em menos de 3000 ms no ambiente local |
| RNF08 | video dispara evento `playing` ate 3000 ms depois de `play()` |
| Evidence | relatorio Playwright + logs de medicoes |

### Decisao sobre dependencia

`@playwright/test` e uma devDependency justificada neste BK porque:

- `node:test` nao controla browser real;
- RNF07 e RNF08 precisam de medir interface e video;
- Playwright e standard para E2E em apps React/Vite;
- a dependencia fica isolada em testes e nao entra no bundle de producao.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar package raiz para E2E

`CRIAR package.json` na raiz, se ainda nao existir.

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "e2e:install": "playwright install chromium",
    "e2e:mf2": "npm --prefix backend run seed:e2e && playwright test tests/e2e/mf2-flow.spec.js"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.0"
  }
}
```

Executar:

```bash
npm install
npm run e2e:install
```

### Passo 2 - Criar configuracao Playwright

`CRIAR playwright.config.js`

```js
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { outputFolder: "test-results/mf2-html-report", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "npm --prefix backend run dev",
      url: "http://127.0.0.1:3000/health",
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: "npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
```

### Passo 3 - Criar seed MF2

`EDITAR backend/package.json`

```json
{
  "scripts": {
    "seed:e2e": "node scripts/seed-mf2-e2e.js"
  }
}
```

`CRIAR backend/scripts/seed-mf2-e2e.js`

```js
import { ObjectId } from "mongodb";
import { getDb } from "../src/config/database.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";

const db = await getDb();
const now = new Date();
const userId = new ObjectId();
const contentId = new ObjectId();

await db.collection("users").deleteMany({ email: { $in: ["e2e@faithflix.test", "admin@faithflix.test"] } });
await db.collection("contents").deleteMany({ slug: "piloto-faithflix" });
await db.collection("playback_progress").deleteMany({ userId });
await db.collection("user_content_lists").deleteMany({ userId });

await db.collection("users").insertMany([
  {
    _id: userId,
    name: "Utilizador E2E",
    email: "e2e@faithflix.test",
    passwordHash: await hashPassword("password-segura-123"),
    role: "user",
    parentalMaxAgeRating: 18,
    createdAt: now,
    updatedAt: now,
  },
  {
    name: "Admin E2E",
    email: "admin@faithflix.test",
    passwordHash: await hashPassword("password-segura-123"),
    role: "admin",
    parentalMaxAgeRating: 18,
    createdAt: now,
    updatedAt: now,
  },
]);

await db.collection("contents").insertOne({
  _id: contentId,
  title: "Piloto FaithFlix",
  slug: "piloto-faithflix",
  synopsis: "Conteudo curto usado para validar o fluxo principal da MF2.",
  type: "movie",
  durationSeconds: 120,
  ageRating: 6,
  status: "published",
  taxonomyIds: [],
  assets: {
    posterUrl: "",
    backdropUrl: "",
  },
  media: {
    playbackUrl: "/media/piloto.mp4",
  },
  tracks: {
    subtitles: [],
    audio: [{ language: "pt", label: "Portugues" }],
  },
  qualityOptions: [
    { label: "720p", value: "720p", playbackUrl: "/media/piloto.mp4" },
  ],
  createdBy: userId,
  updatedBy: userId,
  publishedAt: now,
  createdAt: now,
  updatedAt: now,
});

console.log("Seed MF2 E2E concluida.");
process.exit(0);
```

### Passo 4 - Confirmar media de teste

`CRIAR frontend/public/media/piloto.mp4` com um video curto, leve e sem direitos externos. O ficheiro deve:

- ter menos de 5 MB;
- iniciar rapidamente em browser local;
- ter pelo menos 20 segundos;
- ficar versionado ou documentado como asset do projeto.

Se este ficheiro nao existir, o E2E deve falhar, porque `RNF08` nao pode ser medido sem media real.

### Passo 5 - Acrescentar seletores estaveis

Adicionar `data-testid` nos componentes principais:

```jsx
<form data-testid="auth-form">...</form>
<main data-testid="content-detail">...</main>
<video data-testid="faithflix-player" ... />
<main data-testid="my-library">...</main>
```

Estes atributos existem apenas para teste e nao alteram a experiencia do utilizador.

### Passo 6 - Criar teste E2E

`CRIAR tests/e2e/mf2-flow.spec.js`

```js
import { expect, test } from "@playwright/test";

const USER = {
  email: "e2e@faithflix.test",
  password: "password-segura-123",
};

async function login(page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "login" }).click();
  await page.getByLabel("Email").fill(USER.email);
  await page.getByLabel("Password").fill(USER.password);
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Sessao iniciada.")).toBeVisible();
}

test("MF2 fluxo principal com performance e player", async ({ page }) => {
  await login(page);

  await page.goto("/catalog/piloto-faithflix");
  await expect(page.getByTestId("content-detail")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Piloto FaithFlix" })).toBeVisible();

  const detailLoadMs = await page.evaluate(() => {
    const entry = performance.getEntriesByType("navigation").at(-1);
    return entry.loadEventEnd - entry.startTime;
  });

  console.log(`RNF07 detailLoadMs=${detailLoadMs}`);
  expect(detailLoadMs).toBeLessThan(3000);

  await page.getByRole("button", { name: "Favorito" }).click();
  await page.getByRole("button", { name: "Watchlist" }).click();
  await page.getByRole("link", { name: "Reproduzir" }).click();

  const player = page.getByTestId("faithflix-player");
  await expect(player).toBeVisible();

  const videoStartMs = await player.evaluate(async (video) => {
    const start = performance.now();
    const playing = new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Video nao iniciou dentro do limite.")), 3000);
      video.addEventListener("playing", () => {
        window.clearTimeout(timeout);
        resolve(performance.now() - start);
      }, { once: true });
    });

    await video.play();
    return playing;
  });

  console.log(`RNF08 videoStartMs=${videoStartMs}`);
  expect(videoStartMs).toBeLessThan(3000);

  await player.evaluate((video) => {
    video.currentTime = Math.min(20, Number.isFinite(video.duration) ? video.duration : 20);
    video.dispatchEvent(new Event("timeupdate"));
  });

  await page.waitForTimeout(750);
  await page.goto("/library");
  await expect(page.getByTestId("my-library")).toBeVisible();
  await expect(page.getByText("Piloto FaithFlix")).toBeVisible();
});
```

### Passo 7 - Executar o E2E

Executar na raiz:

```bash
npm run e2e:mf2
```

Resultado esperado:

- Playwright arranca backend e frontend.
- Seed MF2 e carregada.
- Teste passa em Chromium.
- O output mostra `RNF07 detailLoadMs=...`.
- O output mostra `RNF08 videoStartMs=...`.
- Relatorio HTML fica em `test-results/mf2-html-report`.

### Passo 8 - Validar negativos minimos

Criar testes adicionais ou registar manualmente:

- Login com password errada falha.
- Detalhe de slug inexistente mostra estado de erro.
- Conteudo acima do limite parental bloqueia player.
- Sem ficheiro `piloto.mp4`, o teste de RNF08 falha.
- Sem cookie, `/library` nao mostra dados pessoais.

## Snippet tecnico aplicavel

O trecho central mede o arranque do video:

```js
const videoStartMs = await player.evaluate(async (video) => {
  const start = performance.now();
  const playing = new Promise((resolve) => {
    video.addEventListener("playing", () => resolve(performance.now() - start), { once: true });
  });
  await video.play();
  return playing;
});
```

## Criterios de aceite (mensuraveis)

- `npm run e2e:mf2` executa seed e teste.
- O fluxo login -> detalhe -> favorito -> watchlist -> player -> biblioteca passa.
- `RNF07` fica abaixo de 3000 ms no ambiente local.
- `RNF08` fica abaixo de 3000 ms no ambiente local.
- O relatorio Playwright e gerado.
- Pelo menos cinco negativos ficam registados.

## Validacao final

- Confirmar que `test-results/mf2-html-report` existe.
- Confirmar que o output contem `RNF07 detailLoadMs`.
- Confirmar que o output contem `RNF08 videoStartMs`.
- Confirmar que a base de dados foi semeada antes do teste.
- Confirmar que falhas geram trace, screenshot ou video.

## Evidence para PR/defesa

- Output completo de `npm run e2e:mf2`.
- Relatorio HTML Playwright.
- Valores medidos de `RNF07` e `RNF08`.
- Screenshot do player.
- Trace de falha, se existir.

## Handoff

Para `BK-MF3-01`, entregar:

- Fluxo MF2 validado em browser.
- Favoritos, watchlist e historico prontos para ratings e recomendacao.
- Seed E2E reutilizavel.
- Medicoes base de performance para comparacao futura.

## Proximo BK recomendado

`BK-MF3-01 - Ratings e agregacao`

## Changelog

- `2026-05-31`: Guia reescrito com Playwright, seed, media de teste, fluxo E2E, medicoes RNF07/RNF08, negativos e evidence.
