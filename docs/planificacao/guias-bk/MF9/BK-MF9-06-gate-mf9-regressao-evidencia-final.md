# BK-MF9-06 - Gate MF9, regressão e evidência final

## Header

- `doc_id`: `GUIA-BK-MF9-06`
- `bk_id`: `BK-MF9-06`
- `macro`: `MF9`
- `owner`: `Kaue`
- `apoio`: `Matheus, Mateus, Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF9-01,BK-MF9-02,BK-MF9-03,BK-MF9-04,BK-MF9-05`
- `rf_rnf`: `RF61, RF62, RF63, RNF21, RNF22, RNF29, RNF38, RNF40`
- `fase_documental`: `Fase 3`
- `sprint`: `S13`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `-`
- `guia_path`: `docs/planificacao/guias-bk/MF9/BK-MF9-06-gate-mf9-regressao-evidencia-final.md`
- `last_updated`: `2026-07-01`

#### Objetivo

Neste BK vais fechar a MF9 com regressão técnica, evidência e decisão de gate. O objetivo não é criar uma nova funcionalidade: é provar que os planos Pro/Família, a partilha real, a qualidade por plano, a privacidade, as métricas e a UI funcionam como uma entrega coerente.

O resultado observável é uma pasta `docs/evidence/MF9/` com registos de testes backend, build frontend, validação da planificação, fluxo end-to-end, negativos obrigatórios, responsividade/localização e decisão final `GO`, `GO_COM_RESSALVAS` ou `NO_GO`.

#### Importância

A MF9 altera acesso premium, playback, subscrições, UI e privacidade. Um bug nesta fase pode abrir acesso indevido, bloquear utilizadores pagantes, expor dados familiares ou criar um gate que parece verde sem testar a funcionalidade real.

Este BK fecha `RF61`, `RF62` e `RF63`, e revalida `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40`. Por isso, a evidência tem de provar tanto os fluxos funcionais como os requisitos de compatibilidade, responsividade, testes, português de Portugal e formatos europeus.

#### Scope-in

- Criar a matriz de evidência final da MF9.
- Configurar o Playwright para arrancar `backend/` e `frontend/` públicos.
- Criar seed E2E MF9 com contas isoladas e conteúdo 1080p/4K.
- Executar regressão backend MF9 sem falsos verdes.
- Executar build frontend e validação da planificação.
- Criar e executar o fluxo end-to-end MF9.
- Registar negativos obrigatórios e decisão final do gate S13.

#### Scope-out

- Criar novas funcionalidades depois da MF9.
- Corrigir bugs fora do scope sem decisão do orientador.
- Alterar RF/RNF, owners, sprints ou ordem dos BKs.
- Substituir testes por capturas sem prova técnica.
- Inventar serviços externos de pagamento, distribuição de vídeo ou IA.

#### Estado antes e depois

- Antes: `BK-MF9-01..05` implementam planos, qualidade, família, UI, privacidade e métricas.
- Depois: a MF9 fica validada, documentada e pronta para defesa ou para uma remediação objetiva com base em falhas concretas.

#### Pre-requisitos

- `BK-MF9-01`, `BK-MF9-02`, `BK-MF9-03`, `BK-MF9-04` e `BK-MF9-05` completos.
- Backend e frontend com dependências instaladas.
- MongoDB local ou Atlas de desenvolvimento acessível pelo backend.
- `@playwright/test` instalado no root do projeto, conforme `package.json`.
- Ler `PLANO-SPRINTS.md`, `MATRIZ-CANONICA-BK.md`, `MF-VIEWS.md` e `SCORECARD-SPRINTS.md`.
- Ter autorização do orientador para classificar o gate final.

#### Glossário

- `Gate`: ponto formal de validação com decisão.
- `Regressão`: verificação de que fluxos antigos continuam a funcionar depois das alterações.
- `Evidência`: prova objetiva, como log, resposta HTTP, teste, captura ou checklist assinável.
- `GO`: entrega aprovada sem bloqueios conhecidos.
- `GO_COM_RESSALVAS`: entrega aprovada com riscos documentados e aceites.
- `NO_GO`: entrega bloqueada por falha crítica.
- `Falso verde`: validação que passa sem testar aquilo que diz estar a testar.
- `Seed E2E`: dados controlados criados para executar um teste end-to-end reproduzível.

#### Conceitos teóricos essenciais

- `CANONICO`: o Gate S13 fecha `94/94` requisitos ativos e `66/66` BK.
- `RF61` prova que os planos Pro/Família expõem entitlements sem quebrar os planos antigos.
- `RF62` prova que a partilha familiar usa contas reais, owner com plano Família ativo e bloqueio de membros duplicados.
- `RF63` prova que o backend limita a qualidade de streaming e não entrega URL 4K a quem não tem plano Família.
- `RNF21` e `RNF22` exigem compatibilidade e responsividade. Um E2E em Chromium não substitui revisão noutros browsers, mas garante um fluxo automatizado mínimo.
- `RNF29` exige testes automatizados para fluxos críticos. O comando backend deve apontar diretamente para a suite MF9 para evitar falsos verdes.
- `RNF38` e `RNF40` exigem interface em português de Portugal e formatos europeus quando existirem datas, horas ou números visíveis.
- `DERIVADO`: separar `GATE-S13-MF9.md` de `REGRESSAO-MF9.md` mantém a decisão final limpa e deixa os logs técnicos num artefacto próprio.

#### Arquitetura do BK

| Camada | Artefacto | Responsabilidade |
| --- | --- | --- |
| Backend | `backend/scripts/seed-mf9-e2e.js` | Cria contas owner, membro, Pro e conteúdo com 1080p/4K para o E2E. |
| Backend | `backend/tests/unit/mf9-subscriptions.test.js` | Prova planos, família, qualidade e privacidade sem servidor HTTP. |
| E2E | `tests/e2e/mf9-family-subscription.spec.js` | Prova owner convida, membro aceita, 4K é permitido para Família e bloqueado para Pro. |
| Frontend | `frontend/` | Build e revisão visual da página de subscrição e player. |
| Configuração | `playwright.config.js` | Arranca backend e frontend públicos durante o E2E. |
| Planificação | `scripts/validate-planificacao.sh` | Confirma metadata canónica dos `66` BK. |
| Evidência | `docs/evidence/MF9/GATE-S13-MF9.md` | Guarda matriz RF/RNF, negativos e decisão final. |
| Regressão | `docs/evidence/MF9/REGRESSAO-MF9.md` | Guarda comandos executados, outputs e falhas. |

#### Ficheiros a criar/editar/rever

- CRIAR/EDITAR: `docs/evidence/MF9/GATE-S13-MF9.md`
- CRIAR/EDITAR: `docs/evidence/MF9/REGRESSAO-MF9.md`
- CRIAR: `backend/scripts/seed-mf9-e2e.js`
- CRIAR/EDITAR: `tests/e2e/mf9-family-subscription.spec.js`
- EDITAR: `playwright.config.js`
- REVER: `backend/tests/unit/mf9-subscriptions.test.js`
- REVER: `frontend/src/pages/SubscriptionPage.jsx`
- REVER: `frontend/src/pages/PlaybackPage.jsx`
- REVER: `scripts/validate-planificacao.sh`
- REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`

#### Tutorial técnico linear

### Passo 1 - Preparar a matriz de evidência MF9

1. Objetivo funcional do passo no contexto da app.

Criar os ficheiros onde vais guardar provas de cada RF/RNF da MF9 antes de executares comandos.

2. Ficheiros envolvidos:
    - CRIAR: `docs/evidence/MF9/GATE-S13-MF9.md`
    - CRIAR: `docs/evidence/MF9/REGRESSAO-MF9.md`
    - REVER: `docs/planificacao/backlogs/MATRIZ-CANONICA-BK.md`
    - REVER: `docs/planificacao/sprints/PLANO-SPRINTS.md`
    - LOCALIZAÇÃO: ficheiros completos de evidência.

3. Instruções do que fazer.

Cria a pasta `docs/evidence/MF9/`. Depois cria os dois ficheiros com as tabelas seguintes. Não marques `OK` antes de executar os comandos ou recolher prova manual.

4. Código completo, correto e integrado com a app final.

```md
<!-- docs/evidence/MF9/GATE-S13-MF9.md -->
# Gate S13 - MF9

<!-- Esta tabela liga cada requisito do header do BK a uma prova positiva e a uma prova negativa. -->
| Requisito | BK fonte | Prova positiva obrigatória | Prova negativa obrigatória | Resultado | Responsável |
| --- | --- | --- | --- | --- | --- |
| RF61 | BK-MF9-01 | `GET /api/subscriptions/plans` lista Pro/Família com entitlements | Plano inexistente rejeitado no checkout simulado | PENDENTE | Matheus |
| RF62 | BK-MF9-03/04 | Owner Família convida membro real e membro aceita | Owner Pro bloqueado e membro duplicado rejeitado | PENDENTE | Matheus/Mateus |
| RF63 | BK-MF9-02 | Membro Família consegue selecionar 4K | Utilizador Pro vê 4K bloqueado sem URL reproduzível | PENDENTE | Mateus |
| RNF21 | BK-MF9-06 | E2E Chromium passa e revisão manual regista browser usado | Falha de browser fica registada com ambiente e impacto | PENDENTE | Kaue |
| RNF22 | BK-MF9-06 | Fluxo revisto em viewport mobile e desktop | Overlap ou quebra visual fica registado com captura | PENDENTE | Kaue |
| RNF29 | BK-MF9-06 | Testes backend MF9, build frontend e E2E MF9 executados | Suite backend sem teste MF9 é recusada como falso verde | PENDENTE | Kaue |
| RNF38 | BK-MF9-06 | UI e evidence final em português de Portugal | Texto sem acentuação em UI/evidence fica registado | PENDENTE | Kaue |
| RNF40 | BK-MF9-06 | Datas e números visíveis seguem formato europeu | Formato fora do padrão europeu fica registado | PENDENTE | Kaue |

## Decisão final

- Decisão: PENDENTE
- Data:
- Responsável:
- Evidência backend:
- Evidência frontend:
- Evidência E2E:
- Evidência de planificação:
- Riscos aceites:
- Próxima ação:
```

```md
<!-- docs/evidence/MF9/REGRESSAO-MF9.md -->
# Regressão MF9

<!-- Cada linha deve receber data, comando e resultado real. Não apagues falhas: documenta-as. -->
| Área | Comando/prova | Resultado | Observações |
| --- | --- | --- | --- |
| Backend MF9 | `cd backend && node --test tests/unit/mf9-subscriptions.test.js` | PENDENTE | Deve executar testes MF9 reais. |
| Frontend | `cd frontend && npm run build` | PENDENTE | Deve compilar sem erros. |
| Planificação | `bash scripts/validate-planificacao.sh` | PENDENTE | Esperado: `checked_bks=66`, `checked_guides=66`. |
| E2E MF9 | `npx playwright test tests/e2e/mf9-family-subscription.spec.js` | PENDENTE | Deve provar owner, membro, Pro e 4K. |
| Revisão manual | Mobile + desktop + PT-PT | PENDENTE | Registar resolução, browser e ressalvas. |
```

5. Explicação do código.

Estes ficheiros não criam funcionalidade, mas criam o contrato de prova. A primeira tabela impede que o gate feche apenas com `RF61..RF63`; também obriga a provar os RNFs do próprio BK. A segunda tabela separa logs técnicos da decisão final, o que evita misturar outputs longos com a conclusão de defesa.

6. Validação do passo.

Confirma que os ficheiros existem e que todas as linhas começam com `PENDENTE`. O gate só muda de estado depois dos passos seguintes.

7. Cenário negativo/erro esperado.

Se a tabela tiver `GO` sem comandos executados, a evidência não é válida e o gate deve voltar a `PENDENTE`.

### Passo 2 - Configurar Playwright com raízes públicas

1. Objetivo funcional do passo no contexto da app.

Garantir que o E2E arranca o backend e o frontend que o aluno usa, sem depender de pastas privadas ou comandos internos.

2. Ficheiros envolvidos:
    - EDITAR: `playwright.config.js`
    - REVER: `backend/package.json`
    - REVER: `frontend/package.json`
    - LOCALIZAÇÃO: ficheiro completo `playwright.config.js`.

3. Instruções do que fazer.

Substitui o conteúdo de `playwright.config.js` pelo ficheiro seguinte. Ele usa `backend/` e `frontend/`, arranca os dois servidores e aponta o browser para `http://127.0.0.1:5173`.

4. Código completo, correto e integrado com a app final.

```js
// playwright.config.js
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "tests/e2e",
    timeout: 60_000,
    expect: { timeout: 10_000 },
    reporter: [
        ["list"],
        [
            "html",
            { outputFolder: "playwright-report/e2e-html-report", open: "never" },
        ],
    ],
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
            // O E2E valida a app pública do aluno; por isso o servidor arranca em backend/.
            command: "npm --prefix backend run dev",
            url: "http://127.0.0.1:3000/health",
            reuseExistingServer: true,
            timeout: 30_000,
        },
        {
            // O frontend recebe a base da API por variável de ambiente e mantém cookies de sessão.
            command:
                "VITE_API_BASE_URL=http://127.0.0.1:3000 npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173",
            url: "http://127.0.0.1:5173",
            reuseExistingServer: true,
            timeout: 30_000,
        },
    ],
});
```

5. Explicação do código.

O ficheiro define onde estão os testes, que browser é usado e como arrancar a app. Os `webServer` são importantes porque o Playwright deve testar a aplicação real, não componentes isolados. A variável `VITE_API_BASE_URL` faz o frontend chamar o backend local; como o cliente API já usa cookies de sessão, o teste consegue validar login e autorização de forma realista.

6. Validação do passo.

Executa:

```bash
npx playwright test --list
```

O comando deve listar `tests/e2e/mf9-family-subscription.spec.js` depois de o criares no Passo 4.

7. Cenário negativo/erro esperado.

Se o Playwright tentar arrancar uma pasta que não existe ou se `http://127.0.0.1:3000/health` não responder, o E2E deve falhar antes de fingir que o gate foi executado.

### Passo 3 - Criar o seed E2E da MF9

1. Objetivo funcional do passo no contexto da app.

Criar dados controlados para testar partilha familiar e qualidade por plano sem depender de contas manuais.

2. Ficheiros envolvidos:
    - CRIAR: `backend/scripts/seed-mf9-e2e.js`
    - REVER: `backend/src/modules/auth/auth.indexes.js`
    - REVER: `backend/src/modules/subscriptions/subscriptions.service.js`
    - REVER: `backend/src/modules/catalog/catalog.service.js`
    - LOCALIZAÇÃO: ficheiro completo `backend/scripts/seed-mf9-e2e.js`.

3. Instruções do que fazer.

Cria o ficheiro seguinte. Ele remove apenas fixtures MF9 e documentos com ids fixos do próprio teste, cria três contas, cria subscrições Família/Pro e cria conteúdo publicado com opções 1080p e 4K.

4. Código completo, correto e integrado com a app final.

```js
// backend/scripts/seed-mf9-e2e.js
/**
 * @file Seed local para o fluxo E2E da MF9.
 *
 * Cria contas isoladas, uma subscrição Família, uma subscrição Pro e conteúdo
 * com qualidades 1080p/4K para validar partilha real e limites de streaming.
 */

import { ObjectId } from "mongodb";
import { getDb } from "../src/config/database.js";
import { ensureAuthIndexes } from "../src/modules/auth/auth.indexes.js";
import { hashPassword } from "../src/modules/auth/auth.password.js";
import { ensureCatalogIndexes } from "../src/modules/catalog/catalog.service.js";
import { ensureLibraryIndexes } from "../src/modules/library/library.service.js";
import { ensureNotificationIndexes } from "../src/modules/notifications/notifications.service.js";
import { ensurePlaybackIndexes } from "../src/modules/playback/playback.service.js";
import { ensureSubscriptionIndexes } from "../src/modules/subscriptions/subscriptions.service.js";

const E2E_TAG = "mf9-e2e";
const PASSWORD = "password-segura-123";
const OWNER_EMAIL = "owner-mf9@faithflix.test";
const MEMBER_EMAIL = "member-mf9@faithflix.test";
const PRO_EMAIL = "pro-mf9@faithflix.test";
const CONTENT_SLUG = "mf9-qualidade-familiar";

const ownerId = new ObjectId("64f909000000000000000001");
const memberId = new ObjectId("64f909000000000000000002");
const proId = new ObjectId("64f909000000000000000003");
const contentId = new ObjectId("64f909100000000000000001");

/**
 * Remove documentos que pertencem ao fixture E2E ou colidem com ids fixos.
 *
 * @param {import("mongodb").Db} db Base de dados MongoDB.
 * @param {string} collectionName Nome da coleção.
 * @param {object[]} clauses Condições alternativas de remoção.
 * @returns {Promise<void>} Termina depois de remover dados de fixture.
 */
async function deleteByAny(db, collectionName, clauses) {
    if (clauses.length === 0) {
        return;
    }

    // A remoção fica limitada aos ids/emails do fixture para não apagar dados reais de desenvolvimento.
    await db.collection(collectionName).deleteMany({ $or: clauses });
}

/**
 * Constrói uma conta de fixture com password conhecida para o teste E2E.
 *
 * @param {ObjectId} _id Identificador fixo.
 * @param {string} email Email da conta.
 * @param {string} name Nome público.
 * @param {Date} now Instante de criação.
 * @returns {Promise<object>} Documento pronto para inserir.
 */
async function fixtureUser(_id, email, name, now) {
    return {
        _id,
        name,
        email,
        passwordHash: await hashPassword(PASSWORD),
        role: "user",
        parentalMaxAgeRating: 18,
        e2eFixture: E2E_TAG,
        createdAt: now,
        updatedAt: now,
    };
}

const db = await getDb();
const now = new Date();
const periodEnd = new Date("2999-01-01T00:00:00.000Z");

await ensureAuthIndexes();
await ensureCatalogIndexes();
await ensurePlaybackIndexes();
await ensureLibraryIndexes();
await ensureNotificationIndexes();
await ensureSubscriptionIndexes();

await deleteByAny(db, "sessions", [
    { userId: ownerId },
    { userId: memberId },
    { userId: proId },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "users", [
    { _id: { $in: [ownerId, memberId, proId] } },
    { email: { $in: [OWNER_EMAIL, MEMBER_EMAIL, PRO_EMAIL] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "subscriptions", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "trials", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "subscription_family_memberships", [
    { ownerUserId: ownerId },
    { memberUserId: { $in: [ownerId, memberId, proId] } },
    { invitedEmail: { $in: [OWNER_EMAIL, MEMBER_EMAIL, PRO_EMAIL] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "payment_attempts", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "notifications", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "playback_progress", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { contentId },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "user_content_lists", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { contentId },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "media_preferences", [
    { userId: { $in: [ownerId, memberId, proId] } },
    { e2eFixture: E2E_TAG },
]);
await deleteByAny(db, "contents", [
    { _id: contentId },
    { slug: CONTENT_SLUG },
    { e2eFixture: E2E_TAG },
]);

await db.collection("users").insertMany([
    await fixtureUser(ownerId, OWNER_EMAIL, "Owner Família MF9", now),
    await fixtureUser(memberId, MEMBER_EMAIL, "Membro Família MF9", now),
    await fixtureUser(proId, PRO_EMAIL, "Utilizador Pro MF9", now),
]);

await db.collection("subscriptions").insertMany([
    {
        userId: ownerId,
        planCode: "faithflix-family-monthly",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        e2eFixture: E2E_TAG,
        createdAt: now,
        updatedAt: now,
    },
    {
        userId: proId,
        planCode: "faithflix-monthly",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        e2eFixture: E2E_TAG,
        createdAt: now,
        updatedAt: now,
    },
]);

await db.collection("contents").insertOne({
    _id: contentId,
    title: "Qualidade Familiar MF9",
    slug: CONTENT_SLUG,
    synopsis: "Conteúdo de fixture usado para validar 4K por plano Família.",
    type: "movie",
    durationSeconds: 180,
    ageRating: 6,
    status: "published",
    taxonomyIds: [],
    assets: {
        posterUrl: "",
        backdropUrl: "",
    },
    media: {
        playbackUrl: "/media/mf9-1080.mp4",
    },
    tracks: {
        subtitles: [],
        audio: [],
    },
    qualityOptions: [
        {
            label: "Full HD",
            value: "1080p",
            playbackUrl: "/media/mf9-1080.mp4",
        },
        {
            label: "4K",
            value: "2160p",
            playbackUrl: "/media/mf9-2160.mp4",
        },
    ],
    createdBy: ownerId,
    updatedBy: ownerId,
    e2eFixture: E2E_TAG,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
});

// O output resume as credenciais de teste sem expor dados reais de utilizadores.
console.log(
    [
        "Seed MF9 E2E concluída:",
        `owner=${OWNER_EMAIL}`,
        `member=${MEMBER_EMAIL}`,
        `pro=${PRO_EMAIL}`,
        `content=${CONTENT_SLUG}`,
    ].join(" "),
);

process.exit(0);
```

5. Explicação do código.

O seed prepara exatamente os dados que o E2E precisa. As contas têm emails fixos e password conhecida para o teste, mas ficam marcadas com `e2eFixture: "mf9-e2e"` para separar fixture de dados reais. A função `deleteByAny` evita uma limpeza larga: remove apenas ids, emails ou documentos marcados como fixture. Isto protege dados de desenvolvimento e mantém o teste reproduzível.

O owner recebe plano Família ativo, o utilizador Pro recebe plano Pro e o membro começa sem subscrição própria. O conteúdo publicado tem duas qualidades: 1080p e 4K. Assim, o E2E consegue provar que a Família recebe 4K e que o Pro não recebe URL acima do plano.

6. Validação do passo.

Executa:

```bash
cd backend
node scripts/seed-mf9-e2e.js
```

O output esperado inclui `Seed MF9 E2E concluída:` e os três emails de fixture.

7. Cenário negativo/erro esperado.

Se o seed falhar por ligação à base de dados, não executes o E2E. Regista o erro em `REGRESSAO-MF9.md` e mantém a decisão final como `NO_GO` ou `PENDENTE`.

### Passo 4 - Executar regressão backend MF9

1. Objetivo funcional do passo no contexto da app.

Validar contratos de planos, família, qualidade e privacidade no backend, sem aceitar suites genéricas como prova suficiente.

2. Ficheiros envolvidos:
    - REVER: `backend/tests/unit/mf9-subscriptions.test.js`
    - EDITAR: `docs/evidence/MF9/REGRESSAO-MF9.md`
    - LOCALIZAÇÃO: comando específico da suite MF9.

3. Instruções do que fazer.

Executa diretamente o ficheiro de testes MF9. Se o ficheiro não existir, volta aos BKs anteriores da MF9 antes de fechar o gate.

4. Código completo, correto e integrado com a app final.

```bash
cd backend
node --test tests/unit/mf9-subscriptions.test.js
```

5. Explicação do código.

Este comando é mais seguro do que `npm test` para o gate, porque falha se o ficheiro MF9 não existir. Assim evitas um falso verde em que testes antigos passam, mas planos Família, convites, filtro 4K e RGPD familiar não foram executados.

6. Validação do passo.

Regista em `REGRESSAO-MF9.md` o número de testes, passes e falhas. O esperado é a suite MF9 a passar com testes de planos, partilha familiar, qualidade bloqueada, fallback e exportação/eliminação familiar.

7. Cenário negativo/erro esperado.

Se o comando disser que `tests/unit/mf9-subscriptions.test.js` não existe, o gate fica `NO_GO`: a MF9 ainda não tem prova backend publicável.

### Passo 5 - Executar build frontend e validação canónica

1. Objetivo funcional do passo no contexto da app.

Garantir que a UI familiar, o player e a documentação canónica continuam consistentes.

2. Ficheiros envolvidos:
    - REVER: `frontend/src/pages/SubscriptionPage.jsx`
    - REVER: `frontend/src/pages/PlaybackPage.jsx`
    - REVER: `scripts/validate-planificacao.sh`
    - EDITAR: `docs/evidence/MF9/REGRESSAO-MF9.md`
    - LOCALIZAÇÃO: secções "Frontend" e "Planificação".

3. Instruções do que fazer.

Executa o build no frontend e depois o validador da planificação no root do projeto.

4. Código completo, correto e integrado com a app final.

```bash
cd frontend
npm run build
cd ..
bash scripts/validate-planificacao.sh
```

5. Explicação do código.

O build frontend prova imports, JSX, bundling e variáveis de ambiente de produção. O validador de planificação confirma metadata, owners, dependências e contagem `66/66`. Estes comandos não substituem o E2E, mas impedem que o gate avance com UI partida ou documentação canónica desalinhada.

6. Validação do passo.

O resultado esperado é build concluído sem erro e validador com `status: PASS`, `checked_bks: 66` e `checked_guides: 66`.

7. Cenário negativo/erro esperado.

Se o build falhar por método inexistente em `subscriptionsApi` ou erro em `PlaybackPage.jsx`, a decisão final fica `NO_GO` até corrigir a causa.

### Passo 6 - Criar e executar o E2E MF9

1. Objetivo funcional do passo no contexto da app.

Provar o percurso principal da MF9 como utilizador real no browser.

2. Ficheiros envolvidos:
    - CRIAR/EDITAR: `tests/e2e/mf9-family-subscription.spec.js`
    - REVER: `backend/scripts/seed-mf9-e2e.js`
    - REVER: `frontend/src/pages/SubscriptionPage.jsx`
    - REVER: `frontend/src/pages/PlaybackPage.jsx`
    - EDITAR: `docs/evidence/MF9/GATE-S13-MF9.md`
    - LOCALIZAÇÃO: ficheiro completo `tests/e2e/mf9-family-subscription.spec.js`.

3. Instruções do que fazer.

Cria ou substitui o ficheiro E2E seguinte. Antes de o executar, corre o seed do Passo 3. Depois executa o teste Playwright indicado.

4. Código completo, correto e integrado com a app final.

```js
// tests/e2e/mf9-family-subscription.spec.js
import { expect, test } from "@playwright/test";

const PASSWORD = "password-segura-123";
const OWNER_EMAIL = "owner-mf9@faithflix.test";
const MEMBER_EMAIL = "member-mf9@faithflix.test";
const PRO_EMAIL = "pro-mf9@faithflix.test";
const CONTENT_SLUG = "mf9-qualidade-familiar";
const CONTENT_ID = "64f909100000000000000001";

/**
 * Inicia sessão por UI com uma conta de fixture MF9.
 *
 * @param {import("@playwright/test").Page} page Página Playwright.
 * @param {string} email Email da conta fixture.
 * @returns {Promise<void>} Termina quando a sessão fica ativa.
 */
async function login(page, email) {
    await page.goto("/login");
    await expect(page.getByTestId("auth-form")).toBeVisible();
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill(PASSWORD);
    await page.getByTestId("login-submit").click();
    await expect(page.getByRole("status")).toHaveText("Sessão iniciada.");
}

/**
 * Lê as opções reais de um `<select>` para validar labels, valores e bloqueios.
 *
 * @param {import("@playwright/test").Locator} selectLocator Locator do select.
 * @returns {Promise<Array<{ label: string, value: string, disabled: boolean }>>} Opções do DOM.
 */
async function readSelectOptions(selectLocator) {
    return selectLocator.evaluate((select) =>
        Array.from(select.options).map((option) => ({
            label: option.textContent.trim(),
            value: option.value,
            disabled: option.disabled,
        })),
    );
}

/**
 * Localiza o seletor de qualidade dentro dos controlos do player.
 *
 * @param {import("@playwright/test").Page} page Página Playwright.
 * @returns {import("@playwright/test").Locator} Locator do select de qualidade.
 */
function qualitySelect(page) {
    return page
        .locator(".player-controls label")
        .filter({ hasText: "Qualidade" })
        .locator("select");
}

test("MF9 cobre partilha familiar real e qualidade 4K limitada por plano", async ({
    browser,
}) => {
    const ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();

    await login(ownerPage, OWNER_EMAIL);
    await ownerPage.goto("/planos");
    await expect(
        ownerPage.getByRole("heading", { name: "Subscrição" }),
    ).toBeVisible();
    await expect(ownerPage.getByText("Plano: Família")).toBeVisible();
    await expect(ownerPage.getByText("1/5 lugares usados.")).toBeVisible();
    await ownerPage.getByLabel("Email da conta").fill(MEMBER_EMAIL);
    await ownerPage.getByRole("button", { name: "Convidar" }).click();
    await expect(ownerPage.getByRole("status")).toContainText(
        "Convite familiar criado.",
    );
    await expect(ownerPage.getByText(MEMBER_EMAIL)).toBeVisible();

    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();

    await login(memberPage, MEMBER_EMAIL);
    await memberPage.goto("/planos");
    await expect(memberPage.getByText("Convite pendente")).toBeVisible();
    await memberPage.getByRole("button", { name: "Aceitar" }).click();
    await expect(memberPage.getByRole("status")).toContainText(
        "Convite familiar aceite.",
    );
    await expect(memberPage.getByText("Partilha familiar")).toBeVisible();
    await expect(memberPage.getByText("Plano: Família")).toBeVisible();

    await memberPage.goto(`/catalogo/${CONTENT_SLUG}`);
    await expect(
        memberPage.getByRole("heading", { name: "Qualidade Familiar MF9" }),
    ).toBeVisible();
    await memberPage.getByRole("link", { name: "Reproduzir" }).click();
    await expect(memberPage.getByTestId("faithflix-player")).toBeVisible();
    const memberQualitySelect = qualitySelect(memberPage);
    const memberQualityOptions = await readSelectOptions(memberQualitySelect);
    const member4kOption = memberQualityOptions.find(
        (option) => option.label === "4K",
    );

    // O membro aceitou a Família, por isso a opção 4K deve estar ativa.
    expect(member4kOption).toEqual(
        expect.objectContaining({ label: "4K", disabled: false }),
    );
    await memberQualitySelect.selectOption(member4kOption.value);
    await expect(memberPage.getByTestId("faithflix-player")).toHaveAttribute(
        "src",
        /mf9-2160/,
    );

    const proContext = await browser.newContext();
    const proPage = await proContext.newPage();

    await login(proPage, PRO_EMAIL);
    await proPage.goto(`/ver/${CONTENT_ID}`);
    await expect(proPage.getByTestId("faithflix-player")).toBeVisible();
    const proQualitySelect = qualitySelect(proPage);
    const proQualityOptions = await readSelectOptions(proQualitySelect);

    // O Pro vê 4K como bloqueado; a URL reproduzível deve ficar em 1080p.
    expect(proQualityOptions).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ label: "Full HD", disabled: false }),
            expect.objectContaining({
                label: "4K - Plano Família",
                disabled: true,
            }),
        ]),
    );
    await expect(proPage.getByTestId("faithflix-player")).toHaveAttribute(
        "src",
        /mf9-1080/,
    );

    await ownerPage.goto("/planos");
    const memberCard = ownerPage.locator("article").filter({
        hasText: MEMBER_EMAIL,
    });

    await expect(memberCard).toBeVisible();
    await memberCard.getByRole("button", { name: "Remover" }).click();
    await expect(ownerPage.getByRole("status")).toContainText(
        "Membro familiar removido.",
    );

    await memberPage.goto(`/ver/${CONTENT_ID}`);
    await expect(memberPage.getByRole("alert")).toContainText(
        "Subscrição ativa obrigatória",
    );

    await ownerContext.close();
    await memberContext.close();
    await proContext.close();
});
```

5. Explicação do código.

O teste usa três sessões de browser separadas para não misturar cookies. O owner entra, cria convite e valida que o membro aparece. O membro entra noutra sessão, aceita o convite e confirma acesso Família. Depois o teste abre o player, lê o seletor real de qualidade e prova que 4K está ativo para o membro. Por fim, um utilizador Pro abre o mesmo conteúdo e confirma que 4K aparece bloqueado e que a URL continua em 1080p.

A remoção do membro fecha o ciclo de vida de `RF62`: depois de removido, o membro já não deve conseguir reproduzir conteúdo premium. Isto evita um erro grave de autorização em que a UI remove o membro, mas o backend continua a dar acesso.

6. Validação do passo.

Executa:

```bash
cd backend
node scripts/seed-mf9-e2e.js
cd ..
npx playwright test tests/e2e/mf9-family-subscription.spec.js
```

O resultado esperado é `1 passed` para o teste MF9. Guarda o output em `REGRESSAO-MF9.md`.

7. Cenário negativo/erro esperado.

Se o utilizador Pro conseguir selecionar 4K sem bloqueio, `RF63` falha e o gate fica `NO_GO`.

### Passo 7 - Fechar negativos e decisão final

1. Objetivo funcional do passo no contexto da app.

Classificar a MF9 com base em evidência, não em intuição.

2. Ficheiros envolvidos:
    - EDITAR: `docs/evidence/MF9/GATE-S13-MF9.md`
    - EDITAR: `docs/evidence/MF9/REGRESSAO-MF9.md`
    - REVER: `docs/planificacao/sprints/SCORECARD-SPRINTS.md`
    - LOCALIZAÇÃO: secções "Negativos obrigatórios" e "Decisão final".

3. Instruções do que fazer.

Preenche os negativos obrigatórios. Usa `GO` apenas com testes backend MF9, build, planificação, E2E e negativos completos. Usa `GO_COM_RESSALVAS` se a app estiver funcional, mas faltar revisão manual completa de browsers ou viewports. Usa `NO_GO` se houver falha crítica de acesso, privacidade, build, E2E ou planificação.

4. Código completo, correto e integrado com a app final.

```md
<!-- docs/evidence/MF9/GATE-S13-MF9.md -->
## Negativos obrigatórios

<!-- Estes negativos fecham os principais riscos de segurança, ownership e qualidade da MF9. -->
| Negativo | Resultado esperado | Resultado obtido | Evidência |
| --- | --- | --- | --- |
| Plano inexistente no checkout simulado | HTTP 404 | PENDENTE | |
| Owner Pro tenta convidar membro | HTTP 403 | PENDENTE | |
| Membro com subscrição paga tenta aceitar Família | HTTP 409 | PENDENTE | |
| Membro duplicado tenta entrar noutra Família | HTTP 409 | PENDENTE | |
| Utilizador Pro tenta reproduzir 4K | 4K bloqueado sem URL 4K | PENDENTE | |
| User comum tenta abrir métricas admin | HTTP 403 | PENDENTE | |
| E2E sem seed MF9 | Teste falha antes do gate | PENDENTE | |

## Revisão manual RNF21/RNF22/RNF38/RNF40

| Área | Prova mínima | Resultado |
| --- | --- | --- |
| Browser moderno | Chromium E2E + browser manual registado | PENDENTE |
| Mobile | `/planos` e `/ver/:id` sem overlap em largura móvel | PENDENTE |
| Desktop | `/planos` e `/ver/:id` sem regressão visual evidente | PENDENTE |
| Português de Portugal | Mensagens visíveis com acentuação correta | PENDENTE |
| Formato europeu | Datas visíveis em `dd/mm/aaaa` quando existirem | PENDENTE |

## Decisão final

- Decisão: PENDENTE
- Data:
- Responsável:
- Evidência backend:
- Evidência frontend:
- Evidência E2E:
- Evidência de planificação:
- Riscos aceites:
- Próxima ação:
```

5. Explicação do código.

Este bloco transforma resultados em decisão. Os negativos garantem que a app não só funciona no caminho feliz, mas também bloqueia ações perigosas. A revisão manual cobre os RNFs que o E2E não prova sozinho, como responsividade ampla, browser fora do Chromium e formatos visíveis.

6. Validação do passo.

O gate fica válido quando a decisão final referencia outputs dos passos 4, 5 e 6, e quando todos os negativos têm resultado obtido. Se algum negativo estiver `PENDENTE`, a decisão não pode ser `GO`.

7. Cenário negativo/erro esperado.

Se faltar qualquer evidência de `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38` ou `RNF40`, não uses `GO`.

#### Critérios de aceite

- `backend/scripts/seed-mf9-e2e.js` existe e cria fixtures MF9 isoladas.
- `backend/tests/unit/mf9-subscriptions.test.js` é executado diretamente e passa.
- `frontend/` compila com sucesso.
- `scripts/validate-planificacao.sh` valida `66/66` BK/guias.
- `tests/e2e/mf9-family-subscription.spec.js` passa.
- O fluxo owner -> membro -> playback -> remoção tem evidência.
- Os negativos obrigatórios foram executados e registados.
- `RNF21`, `RNF22`, `RNF29`, `RNF38` e `RNF40` têm linhas próprias na matriz de gate.
- A decisão final está preenchida com `GO`, `GO_COM_RESSALVAS` ou `NO_GO`.
- Riscos restantes estão separados de findings corrigidos.

#### Validação final

- `cd backend && node --test tests/unit/mf9-subscriptions.test.js`
- `cd frontend && npm run build`
- `bash scripts/validate-planificacao.sh`
- `cd backend && node scripts/seed-mf9-e2e.js`
- `npx playwright test tests/e2e/mf9-family-subscription.spec.js`
- Revisão manual de `/planos` e `/ver/:id` em viewport móvel e desktop.
- Negativos obrigatórios de plano, Família, qualidade, privacidade e admin.

#### Evidence para PR/defesa

- `pr`: referência do PR ou commit do gate.
- `proof`: logs de testes, build, planificação, seed e E2E.
- `neg`: tabela de negativos obrigatórios preenchida.
- `fonte`: `RF61`, `RF62`, `RF63`, `RNF21`, `RNF22`, `RNF29`, `RNF38`, `RNF40`, `PLANO-SPRINTS.md`.
- `manual`: browser, viewport, screenshots ou notas de revisão manual.

#### Handoff

MF9 fica encerrada. Qualquer melhoria posterior deve entrar em backlog aprovado com novo BK ou nova macrofase, sem reabrir silenciosamente o gate S13.

#### Changelog

- `2026-07-01`: guia corrigido em modo `corrigir_apenas`, com comandos publicáveis, seed E2E, spec Playwright, matriz RF/RNF completa, validação anti-falso-verde e texto em português de Portugal.
