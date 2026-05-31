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

Neste BK vais criar um teste end-to-end do fluxo principal da MF2: login, detalhe, favoritos, watchlist, player, progresso e biblioteca pessoal. A entrega valida `RNF07` e `RNF08` com medicoes objetivas.

No fim, deves conseguir explicar porque um E2E testa integracao real no browser, como preparar dados previsiveis e como medir tempos relevantes sem depender de observacao manual.

### Importancia funcional

Depois dos BKs 01 a 07, a MF2 ja tem varias pecas ligadas. Este teste confirma que a experiencia principal funciona de ponta a ponta e que uma regressao numa rota, selector, sessao ou player e detetada cedo.

### Scope-in

- Instalar e configurar Playwright.
- Criar seed de dados para utilizador e conteudo publicado.
- Garantir seletores estaveis nos componentes principais.
- Testar login, detalhe, favoritos, watchlist, player, progresso e biblioteca.
- Medir `RNF07` no detalhe e `RNF08` no arranque do video.

### Scope-out

- Cobertura E2E de todos os fluxos admin.
- Testes cross-browser completos.
- Testes de carga.
- Testes de acessibilidade automatizados completos.
- Pipeline CI remoto.

### Glossario rapido

- `E2E`: teste que executa o fluxo como um utilizador no browser.
- `Seed`: dados controlados criados antes do teste.
- `Selector estavel`: atributo pensado para teste, como `data-testid`.
- `RNF07`: requisito de carregamento inicial.
- `RNF08`: requisito de arranque de video.

### Conceitos essenciais

- O teste deve usar rotas reais: `/login`, `/catalogo/:idOrSlug`, `/ver/:contentId` e `/biblioteca`.
- Dados de teste devem ser criados por script e nao manualmente.
- `data-testid` evita testes frageis baseados em layout.
- O teste deve falhar se o video nao existir ou nao conseguir tocar.
- O E2E complementa testes unitarios e manuais; nao os substitui.

### Tempo estimado

- Preparar seed e asset de media: 35 min.
- Configurar Playwright: 35 min.
- Adicionar seletores estaveis: 30 min.
- Escrever fluxo E2E: 75 min.
- Medir RNF07/RNF08 e recolher evidence: 45 min.

### Erros comuns

- Testar apenas endpoints e chamar isso de E2E.
- Depender de dados criados manualmente.
- Medir performance sem guardar o valor observado.
- Usar rota `/library` quando a app usa `/biblioteca`.
- Ignorar o ficheiro de video necessario para `RNF08`.

### Check de compreensao

- [ ] Sei explicar o que o E2E cobre e o que nao cobre.
- [ ] Sei executar seed antes do teste.
- [ ] Sei interpretar uma falha de `RNF07` ou `RNF08`.
- [ ] Sei anexar evidence ao PR/defesa.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-01` a `BK-MF2-07` concluidos.
- Backend e frontend arrancam localmente.
- MongoDB acessivel.
- Existe `frontend/public/media/piloto.mp4`, com video curto e leve para teste.
- Existe rota `/login`.
- Existem seletores `auth-form`, `content-detail`, `faithflix-player` e `my-library`.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Ferramenta | Playwright |
| Browser | Chromium |
| Seed | `backend/scripts/seed-mf2-e2e.js` |
| Teste | `tests/e2e/mf2-flow.spec.js` |
| RNF07 | detalhe carrega em menos de 3000 ms no ambiente local |
| RNF08 | video dispara evento `playing` ate 3000 ms depois de `play()` |
| Evidence | relatorio Playwright e logs de medicoes |

### Decisao sobre dependencia

`@playwright/test` e uma `devDependency` justificada neste BK porque:

- `node:test` nao controla browser real;
- `RNF07` e `RNF08` precisam de medir interface e video;
- Playwright e standard para E2E em apps React/Vite;
- a dependencia fica isolada em testes e nao entra no bundle de producao.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar package raiz para E2E

1. Objetivo do passo.

Adicionar scripts E2E na raiz do projeto sem misturar dependencias no frontend ou backend.

2. Ficheiros envolvidos.
    - CRIAR ou EDITAR: `package.json`
    - LOCALIZACAO: ficheiro raiz

3. Instrucoes concretas.

Se ja existir `package.json` na raiz, acrescenta apenas os scripts e a devDependency.

4. Codigo completo.

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

5. Explicacao do codigo ou da decisao.

O script `e2e:mf2` cria dados previsiveis antes de abrir o browser.

6. Validacao do passo.

```bash
npm install
npm run e2e:install
```

Resultado esperado: Playwright instala Chromium.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem browser instalado, o teste falha antes de validar a app.

### Passo 2 - Criar configuracao Playwright

1. Objetivo do passo.

Arrancar backend e frontend automaticamente durante o teste.

2. Ficheiros envolvidos.
    - CRIAR: `playwright.config.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria a configuracao abaixo na raiz.

4. Codigo completo.

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

5. Explicacao do codigo ou da decisao.

`webServer` garante que o teste usa a app real. `reuseExistingServer` evita conflito se ja estiveres a desenvolver localmente.

6. Validacao do passo.

```bash
npx playwright test --list
```

Resultado esperado: o comando lista testes quando o ficheiro do passo 6 existir.

7. Caso negativo, erro comum ou risco que este passo evita.

Executar E2E contra servidores arrancados manualmente sem controlo torna resultados pouco repetiveis.

### Passo 3 - Criar seed MF2

1. Objetivo do passo.

Criar utilizador e conteudo publicado previsiveis para o fluxo E2E.

2. Ficheiros envolvidos.
    - EDITAR: `backend/package.json`
    - CRIAR: `backend/scripts/seed-mf2-e2e.js`
    - LOCALIZACAO: script completo

3. Instrucoes concretas.

Adiciona o script `seed:e2e` ao `backend/package.json` e cria o ficheiro abaixo.

4. Codigo completo.

Trecho esperado em `backend/package.json`:

```json
{
  "scripts": {
    "seed:e2e": "node scripts/seed-mf2-e2e.js"
  }
}
```

`backend/scripts/seed-mf2-e2e.js`

```js
import { ObjectId } from "mongodb";
import { getDb } from "../src/config/database.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";

const db = await getDb();
const now = new Date();
const userId = new ObjectId();
const contentId = new ObjectId();
const email = "e2e@faithflix.test";

await db.collection("sessions").deleteMany({});
await db.collection("users").deleteMany({ email });
await db.collection("contents").deleteMany({ slug: "piloto-faithflix" });
await db.collection("playback_progress").deleteMany({});
await db.collection("user_content_lists").deleteMany({});
await db.collection("media_preferences").deleteMany({});

await db.collection("users").insertOne({
  _id: userId,
  name: "Utilizador E2E",
  email,
  passwordHash: await hashPassword("password-segura-123"),
  role: "user",
  parentalMaxAgeRating: 18,
  createdAt: now,
  updatedAt: now,
});

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

console.log(`Seed MF2 E2E concluida: ${email} / ${contentId.toString()}`);
process.exit(0);
```

5. Explicacao do codigo ou da decisao.

O seed limpa apenas dados usados pelo E2E e cria um conteudo publicado com slug conhecido.

6. Validacao do passo.

```bash
npm --prefix backend run seed:e2e
```

Resultado esperado: mensagem `Seed MF2 E2E concluida`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem seed, o teste pode passar numa maquina e falhar noutra por falta de dados.

### Passo 4 - Confirmar media de teste

1. Objetivo do passo.

Garantir que o player tem um ficheiro real para medir `RNF08`.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/public/media/piloto.mp4`
    - LOCALIZACAO: asset local

3. Instrucoes concretas.

Adiciona um video curto, leve e sem direitos externos.

4. Codigo completo.

Nao ha codigo JS neste passo. O ficheiro deve cumprir:

- menos de 5 MB;
- pelo menos 20 segundos;
- arranque rapido em browser local;
- caminho final `/media/piloto.mp4`.

5. Explicacao do codigo ou da decisao.

`RNF08` mede o evento `playing`; sem media real, nao ha reproducao a medir.

6. Validacao do passo.

Com o frontend a correr:

```bash
curl -i http://127.0.0.1:5173/media/piloto.mp4
```

Resultado esperado: `200`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o ficheiro nao existir, o E2E deve falhar porque o player nao consegue arrancar.

### Passo 5 - Acrescentar seletores estaveis

1. Objetivo do passo.

Dar ao E2E pontos de referencia estaveis nos componentes principais.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/components/auth/AuthForms.jsx`
    - CONFIRMAR: `frontend/src/pages/ContentDetailPage.jsx`
    - CONFIRMAR: `frontend/src/pages/PlaybackPage.jsx`
    - CONFIRMAR: `frontend/src/pages/MyLibraryPage.jsx`
    - LOCALIZACAO: atributos JSX

3. Instrucoes concretas.

Adiciona os atributos abaixo. Os BKs 04, 05 e 07 ja indicaram os restantes seletores.

4. Codigo completo.

Em `AuthForms.jsx`:

```jsx
<form data-testid="auth-form" onSubmit={handleSubmit}>
  <input data-testid="email-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
  <input data-testid="password-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
  <button data-testid="login-submit" type="submit">Entrar</button>
</form>
```

Confirmar que existem:

```jsx
<main data-testid="content-detail">
<video data-testid="faithflix-player">
<main data-testid="my-library">
```

5. Explicacao do codigo ou da decisao.

`data-testid` reduz fragilidade quando o texto ou layout mudam.

6. Validacao do passo.

Abre `/login` e verifica no DevTools que o formulario tem `data-testid="auth-form"`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem seletores estaveis, o teste pode falhar por mudancas visuais sem regressao funcional.

### Passo 6 - Criar teste E2E

1. Objetivo do passo.

Automatizar o fluxo principal da MF2 no browser real.

2. Ficheiros envolvidos.
    - CRIAR: `tests/e2e/mf2-flow.spec.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o teste abaixo. Ele usa as rotas e seletores entregues nos BKs anteriores.

4. Codigo completo.

```js
import { expect, test } from "@playwright/test";

test("MF2 fluxo principal: login, detalhe, listas, player e biblioteca", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByTestId("auth-form")).toBeVisible();
  await page.getByTestId("email-input").fill("e2e@faithflix.test");
  await page.getByTestId("password-input").fill("password-segura-123");
  await page.getByTestId("login-submit").click();

  const detailStart = performance.now();
  await page.goto("/catalogo/piloto-faithflix");
  await expect(page.getByTestId("content-detail")).toBeVisible();
  const detailLoadMs = performance.now() - detailStart;
  console.log(`RNF07 detailLoadMs=${Math.round(detailLoadMs)}`);
  expect(detailLoadMs).toBeLessThan(3000);

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
      const timeout = window.setTimeout(() => reject(new Error("Video nao iniciou dentro do limite.")), 3000);
      video.addEventListener("playing", () => {
        window.clearTimeout(timeout);
        resolve();
      }, { once: true });
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
```

5. Explicacao do codigo ou da decisao.

O teste mede detalhe e arranque do video com `performance.now()`, guarda logs e valida que a biblioteca mostra o conteudo depois das acoes.

6. Validacao do passo.

```bash
npm run e2e:mf2
```

Resultado esperado: teste passa e imprime `RNF07 detailLoadMs` e `RNF08 playStartMs`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o teste falhar em `/biblioteca`, confirma primeiro se a rota foi montada no `BK-MF2-07`.

### Passo 7 - Recolher evidence e interpretar falhas

1. Objetivo do passo.

Guardar prova objetiva da execucao e transformar falhas em diagnostico acionavel.

2. Ficheiros envolvidos.
    - LER: `test-results/mf2-html-report`
    - LER: logs do terminal
    - VALIDAR: screenshots e traces em falha

3. Instrucoes concretas.

Depois de correr o teste, guarda no registo da tarefa os tempos impressos e o estado do relatorio.

4. Codigo completo.

```bash
npm run e2e:mf2
npx playwright show-report test-results/mf2-html-report
```

5. Explicacao do codigo ou da decisao.

O relatorio HTML permite rever screenshots, traces e videos retidos em falha.

6. Validacao do passo.

Evidence minima:

- estado final do teste;
- valor observado de `RNF07 detailLoadMs`;
- valor observado de `RNF08 playStartMs`;
- screenshot ou trace se falhar.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem evidence, uma falha de performance fica dificil de distinguir de falha de seed, media ou rota.

## Snippet tecnico aplicavel

```js
await page.goto("/catalogo/piloto-faithflix");
await expect(page.getByTestId("content-detail")).toBeVisible();
await page.getByRole("link", { name: /reproduzir/i }).click();
```

## Criterios de aceitacao

- [ ] `npm run e2e:mf2` executa seed antes do teste.
- [ ] O teste faz login por `/login`.
- [ ] O teste valida `/catalogo/piloto-faithflix`.
- [ ] O teste usa `/ver/:contentId` atraves do link de reproducao.
- [ ] O teste valida favoritos e watchlist.
- [ ] O teste valida `/biblioteca`.
- [ ] `RNF07` e `RNF08` sao medidos e registados.
- [ ] Falhas guardam trace, screenshot ou video.

## Validacao final

```bash
npm run e2e:mf2
```

Regista no PR/defesa os valores de `RNF07` e `RNF08`, juntamente com o estado do relatorio Playwright.

## Handoff para a proxima macrofase

A `MF3` pode assumir que existe um fluxo principal autenticado e validado: login, catalogo, detalhe, reproducao, progresso, listas pessoais e biblioteca.
