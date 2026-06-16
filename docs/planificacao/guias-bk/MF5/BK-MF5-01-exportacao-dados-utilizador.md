# BK-MF5-01 - Exportação de dados do utilizador

## Header

- `doc_id`: `GUIA-BK-MF5-01`
- `bk_id`: `BK-MF5-01`
- `macro`: `MF5`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-01`
- `rf_rnf`: `RF55`
- `fase_documental`: `Fase 1`
- `sprint`: `S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-02`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-01-exportacao-dados-utilizador.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais implementar a exportação dos dados do utilizador autenticado. O utilizador deve conseguir pedir, na área da conta, um ficheiro JSON com os seus dados principais, preferências, histórico e registos associados à utilização da plataforma.

`CANONICO`: este BK cobre `RF55 - Exportar dados`, depende de `BK-MF2-01` e pertence à macrofase `MF5 - Operação e privacidade`.

`DERIVADO`: como os documentos canónicos não definem o formato técnico da exportação, este guia usa uma resposta JSON gerada pelo backend, com dados próprios do utilizador e sem dados de outros utilizadores.

#### Importância

Exportar dados é uma funcionalidade de privacidade. Ela permite ao utilizador perceber que informação a aplicação guarda sobre a sua conta e cria uma prova técnica para a defesa da PAP.

Este BK também ensina uma regra essencial de segurança: o frontend não escolhe o utilizador exportado. O backend usa sempre `req.user.id`, criado pela sessão segura dos BKs anteriores, para impedir que alguém peça dados de outra conta.

#### Scope-in

- Criar o módulo backend `privacy`.
- Criar o endpoint autenticado `GET /api/privacy/export`.
- Exportar dados próprios das coleções já usadas nas fases anteriores.
- Remover campos internos, como hashes, tokens de sessão e campos técnicos sensíveis.
- Criar cliente frontend `privacyApi`.
- Criar painel de exportação na página da conta.
- Criar teste unitário mínimo para confirmar que campos sensíveis não entram no ficheiro.

#### Scope-out

- Exportação em PDF ou CSV.
- Envio automático por email.
- Exportação de dados de outro utilizador por administrador.
- Alteração de regras de eliminação de conta, que fica para `BK-MF5-02`.
- Alteração de consentimentos, que fica para `BK-MF5-03`.

#### Estado antes e depois

Antes deste BK, a aplicação tem autenticação, sessão, conta, catálogo, histórico, biblioteca, ratings, comentários, subscrições, notificações e pool solidária. Ainda não existe um ponto único para o utilizador descarregar os seus dados.

Depois deste BK, o utilizador autenticado consegue abrir a conta e descarregar um JSON com dados próprios. O backend filtra todas as consultas por `req.user.id` e nunca devolve `passwordHash`, tokens de sessão ou dados de outros utilizadores.

#### Pre-requisitos

- `BK-MF1-01` criou a base Express modular.
- `BK-MF1-03` criou `apiClient` no frontend.
- `BK-MF1-04` criou sessão segura por cookie.
- `BK-MF2-01` criou autenticação e `req.user`.
- `BK-MF2-06` criou preferências de áudio, legendas e qualidade.
- `BK-MF2-07` criou dados de biblioteca/histórico do utilizador.
- `BK-MF3-01` e `BK-MF3-02` criaram ratings e comentários.
- `BK-MF4-01`, `BK-MF4-02` e `BK-MF4-08` criaram subscrições, tentativas de pagamento simuladas e notificações.

#### Glossário

- Exportação de dados: ficheiro gerado para o próprio utilizador consultar os dados pessoais e operacionais guardados pela aplicação.
- Minimização: devolver apenas campos necessários para transparência, removendo segredos e detalhes internos.
- Ownership: regra que garante que cada consulta usa o utilizador autenticado como dono dos dados.
- Campo sensível: valor que não deve sair numa exportação, como hash de palavra-passe, token, cookie ou segredo operacional.
- Evidence: prova objetiva usada no PR e na defesa para mostrar que a funcionalidade foi executada.

#### Conceitos teóricos essenciais

No domínio FaithFlix, a exportação junta dados da conta, biblioteca, histórico de reprodução, preferências de media, ratings, comentários, subscrições, notificações e preferências. Estes dados vêm dos BKs anteriores e servem para transparência, não para criar uma nova funcionalidade comercial.

No backend, a rota recebe o pedido, o controller lê `req.user.id`, o service consulta MongoDB com filtros por `userId` e devolve um objeto estruturado. A rota é autenticada com `requireAuth`.

No frontend, o componente chama `privacyApi.exportMyData()`, cria um ficheiro JSON no browser e mostra estados de carregamento, sucesso e erro. O componente não envia `userId`, porque isso abriria uma falha de privacidade.

Na segurança, a regra principal é simples: identidade vem da sessão, não do corpo do pedido. O service também remove campos internos para evitar expor hashes, tokens de sessão ou detalhes de pagamento simulado.

Nos testes, validas pelo menos dois pontos: utilizador sem sessão recebe `401`, e a exportação de um utilizador não inclui campos sensíveis nem dados de outro utilizador.

#### Arquitetura do BK

| Camada | Contrato |
| --- | --- |
| Backend route | `GET /api/privacy/export` |
| Autenticação | `requireAuth` obrigatório |
| Service | `buildUserDataExport(userId)` |
| Fonte da identidade | `req.user.id` |
| Resposta | `{ export: { generatedAt, user, sections } }` |
| Frontend API | `privacyApi.exportMyData()` |
| UI | `PrivacyExportPanel` dentro de `AccountPage` |
| Teste | `apps/backend/tests/unit/mf5-privacy-export.test.js` |

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/backend/src/modules/privacy/privacy.service.js`
- CRIAR: `apps/backend/src/modules/privacy/privacy.controller.js`
- CRIAR: `apps/backend/src/modules/privacy/privacy.routes.js`
- EDITAR: `apps/backend/src/app.js`
- CRIAR: `apps/frontend/src/services/api/privacyApi.js`
- CRIAR: `apps/frontend/src/components/privacy/PrivacyExportPanel.jsx`
- EDITAR: `apps/frontend/src/pages/AccountPage.jsx`
- CRIAR: `apps/backend/tests/unit/mf5-privacy-export.test.js`
- REVER: `BK-MF2-01`, `BK-MF2-07`, `BK-MF3-01`, `BK-MF3-02`, `BK-MF4-01`, `BK-MF4-08`, `RF55`, `RNF15`, `RNF17`, `RNF19`, `RNF37`

#### Tutorial técnico linear

### Passo 1 - Criar o service de exportação

1. Objetivo funcional do passo no contexto da app.

Criar a função que reúne dados do utilizador autenticado e remove campos que não devem sair da aplicação.

2. Ficheiros envolvidos:
    - CRIAR: `apps/backend/src/modules/privacy/privacy.service.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `apps/backend/src/modules/privacy/`. Dentro dela, cria `privacy.service.js` com o código abaixo.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/src/modules/privacy/privacy.service.js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";

const USER_EXPORT_COLLECTIONS = [
    "playback_progress",
    "media_preferences",
    "user_content_lists",
    "content_ratings",
    "content_comments",
    "subscriptions",
    "payment_attempts",
    "trials",
    "notification_preferences",
    "notifications",
];

/**
 * Converte o id vindo da sessão para `ObjectId`.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {ObjectId} Id convertido para consultas MongoDB.
 * @throws {HttpError} Quando o id da sessão não é válido.
 */
function asUserObjectId(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new HttpError(400, "Utilizador inválido.");
    }

    return new ObjectId(userId);
}

/**
 * Converte valores MongoDB para JSON legível e estável.
 *
 * @param {unknown} value Valor vindo da base de dados.
 * @returns {unknown} Valor seguro para serialização.
 */
function toExportValue(value) {
    if (value instanceof ObjectId) {
        return String(value);
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (Array.isArray(value)) {
        return value.map(toExportValue);
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, nested]) => [
                key,
                toExportValue(nested),
            ]),
        );
    }

    return value;
}

/**
 * Remove campos internos do documento de utilizador.
 *
 * @param {Record<string, unknown>} user Documento `users`.
 * @returns {Record<string, unknown>} Dados públicos da conta para exportação.
 */
function toExportableUser(user) {
    return toExportValue({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        parentalMaxAgeRating: user.parentalMaxAgeRating ?? 18,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
}

/**
 * Remove campos técnicos que não acrescentam transparência ao utilizador.
 *
 * @param {Record<string, unknown>} row Documento de uma coleção associada ao utilizador.
 * @returns {Record<string, unknown>} Documento serializável sem campos internos perigosos.
 */
function toExportableRow(row) {
    const { passwordHash, tokenHash, sessionToken, cookie, ...safeRow } = row;
    return toExportValue(safeRow);
}

/**
 * Carrega documentos de uma coleção filtrando sempre pelo dono autenticado.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {string} collectionName Nome da coleção a exportar.
 * @param {ObjectId} userObjectId Id do utilizador autenticado.
 * @returns {Promise<Record<string, unknown>[]>} Documentos exportáveis.
 */
async function exportOwnedCollection(db, collectionName, userObjectId) {
    const rows = await db
        .collection(collectionName)
        .find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .toArray();

    return rows.map(toExportableRow);
}

/**
 * Gera a exportação RGPD do utilizador autenticado.
 *
 * @param {string} userId Id do utilizador obtido em `req.user.id`.
 * @returns {Promise<{ generatedAt: string, user: Record<string, unknown>, sections: Record<string, Record<string, unknown>[]> }>} Exportação completa.
 * @throws {HttpError} Quando a conta não existe.
 */
export async function buildUserDataExport(userId) {
    const db = await getDb();
    const userObjectId = asUserObjectId(userId);
    const user = await db.collection("users").findOne({ _id: userObjectId });

    if (!user) {
        throw new HttpError(404, "Utilizador não encontrado.");
    }

    const sectionEntries = await Promise.all(
        USER_EXPORT_COLLECTIONS.map(async (collectionName) => [
            collectionName,
            await exportOwnedCollection(db, collectionName, userObjectId),
        ]),
    );

    return {
        generatedAt: new Date().toISOString(),
        user: toExportableUser(user),
        sections: Object.fromEntries(sectionEntries),
    };
}
```

5. Explicação do código.

`USER_EXPORT_COLLECTIONS` enumera as coleções que pertencem ao utilizador e que já foram introduzidas por BKs anteriores. A lista usa `content_comments`, que é a coleção real criada pelo módulo de comentários, e inclui `media_preferences`, criada pelo fluxo de legendas, áudio e qualidade. A função `buildUserDataExport` começa por converter `req.user.id` para `ObjectId`, procura a conta e depois consulta cada coleção com `{ userId: userObjectId }`.

O código remove `passwordHash`, `tokenHash`, `sessionToken` e `cookie`. Isto evita que a exportação revele segredos ou material de autenticação. O frontend nunca envia o id do utilizador, logo não consegue alterar o dono da exportação.

6. Validação do passo.

Executa:

```bash
cd apps/backend
node -e "import('./src/modules/privacy/privacy.service.js').then(() => console.log('privacy service ok'))"
```

O resultado esperado é `privacy service ok`.

7. Cenário negativo/erro esperado.

Se chamares `buildUserDataExport("id-invalido")`, o service deve lançar `Utilizador inválido.` com estado `400`. Isto evita consultas MongoDB com ids mal formados.

### Passo 2 - Criar controller e rota autenticada

1. Objetivo funcional do passo no contexto da app.

Expor a exportação através de uma rota HTTP protegida por sessão.

2. Ficheiros envolvidos:
    - CRIAR: `apps/backend/src/modules/privacy/privacy.controller.js`
    - CRIAR: `apps/backend/src/modules/privacy/privacy.routes.js`
    - LOCALIZAÇÃO: ficheiros completos

3. Instruções do que fazer.

Cria o controller e a rota. A rota deve usar `requireAuth` antes do controller.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/src/modules/privacy/privacy.controller.js
import { buildUserDataExport } from "./privacy.service.js";

/**
 * Devolve a exportação de dados do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Resposta JSON com a exportação.
 */
export async function getMyDataExport(req, res) {
    const dataExport = await buildUserDataExport(req.user.id);

    return res.status(200).json({ export: dataExport });
}
```

```js
// apps/backend/src/modules/privacy/privacy.routes.js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { getMyDataExport } from "./privacy.controller.js";

export const privacyRouter = Router();

privacyRouter.get("/export", requireAuth, asyncHandler(getMyDataExport));
```

5. Explicação do código.

O controller não recebe `userId` de `req.params`, `req.query` ou `req.body`. A única fonte de identidade é `req.user.id`, preenchido pela sessão. A rota usa `requireAuth`, por isso pedidos sem sessão recebem `401`.

6. Validação do passo.

Executa:

```bash
cd apps/backend
node -e "import('./src/modules/privacy/privacy.routes.js').then(({ privacyRouter }) => console.log(typeof privacyRouter))"
```

O resultado esperado é `function`.

7. Cenário negativo/erro esperado.

Um pedido sem cookie de sessão para `GET /api/privacy/export` deve devolver `401` com mensagem de autenticação obrigatória.

### Passo 3 - Montar o módulo na app Express

1. Objetivo funcional do passo no contexto da app.

Registar a rota de privacidade na aplicação real.

2. Ficheiros envolvidos:
    - EDITAR: `apps/backend/src/app.js`
    - LOCALIZAÇÃO: imports do topo e zona de montagem das rotas dentro de `createApp`

3. Instruções do que fazer.

Adiciona o import de `privacyRouter` e monta-o com prefixo `/api/privacy`.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/src/app.js
import { privacyRouter } from "./modules/privacy/privacy.routes.js";

// Dentro de createApp(), junto das restantes rotas /api:
app.use("/api/privacy", privacyRouter);
```

5. Explicação do código.

O prefixo `/api/privacy` separa operações de privacidade da rota genérica de utilizadores. Isto mantém responsabilidades claras: `users` gere perfil e administração de utilizadores; `privacy` trata exportação, eliminação e consentimentos da conta autenticada.

6. Validação do passo.

Executa:

```bash
cd apps/backend
node -e "import('./src/app.js').then(({ createApp }) => console.log(typeof createApp))"
```

O resultado esperado é `function`.

7. Cenário negativo/erro esperado.

Se esqueceres esta montagem, o service e a rota existem, mas `GET /api/privacy/export` devolve `404`. Este erro mostra que criar ficheiros não chega; é preciso ligá-los à aplicação.

### Passo 4 - Criar cliente API e painel de exportação no frontend

1. Objetivo funcional do passo no contexto da app.

Permitir ao utilizador descarregar a exportação a partir da área da conta.

2. Ficheiros envolvidos:
    - CRIAR: `apps/frontend/src/services/api/privacyApi.js`
    - CRIAR: `apps/frontend/src/components/privacy/PrivacyExportPanel.jsx`
    - EDITAR: `apps/frontend/src/pages/AccountPage.jsx`
    - LOCALIZAÇÃO: ficheiros completos para os novos ficheiros; import e JSX final em `AccountPage`

3. Instruções do que fazer.

Cria o cliente `privacyApi`, cria o componente `PrivacyExportPanel` e adiciona `<PrivacyExportPanel />` no fim da página `AccountPage`.

4. Código completo, correto e integrado com a app final.

```js
// apps/frontend/src/services/api/privacyApi.js
import { apiClient } from "./apiClient.js";

export const privacyApi = {
    /**
     * Pede ao backend a exportação dos dados do utilizador autenticado.
     *
     * @returns {Promise<{ export: Record<string, unknown> }>} Exportação em JSON.
     */
    exportMyData() {
        return apiClient.get("/api/privacy/export");
    },
};
```

```jsx
// apps/frontend/src/components/privacy/PrivacyExportPanel.jsx
import { useState } from "react";
import { privacyApi } from "../../services/api/privacyApi.js";

/**
 * Painel de exportação de dados pessoais da conta autenticada.
 *
 * @returns {JSX.Element} Interface de pedido de exportação.
 */
export function PrivacyExportPanel() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    /**
     * Pede a exportação e cria um ficheiro JSON no browser.
     *
     * @returns {Promise<void>} Termina quando o ficheiro é preparado.
     */
    async function handleExport() {
        setLoading(true);
        setStatus("");
        setError("");

        try {
            const response = await privacyApi.exportMyData();
            const json = JSON.stringify(response.export, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `faithflix-export-${response.export.generatedAt}.json`;
            link.click();
            URL.revokeObjectURL(url);

            setStatus("Exportação preparada com sucesso.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="form-panel" aria-labelledby="privacy-export-title">
            <h2 id="privacy-export-title">Exportar dados</h2>
            <p>
                Descarrega um ficheiro JSON com os dados associados à tua conta
                FaithFlix.
            </p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <button type="button" onClick={handleExport} disabled={loading}>
                {loading ? "A preparar exportação..." : "Exportar dados"}
            </button>
        </section>
    );
}
```

```jsx
// apps/frontend/src/pages/AccountPage.jsx
import { PrivacyExportPanel } from "../components/privacy/PrivacyExportPanel.jsx";

// Dentro do return principal, depois do bloco de dados da conta:
<PrivacyExportPanel />
```

5. Explicação do código.

`privacyApi` reutiliza `apiClient`, que já envia cookies de sessão com os pedidos. O componente mostra loading, erro e sucesso. O ficheiro é criado a partir da resposta JSON, sem guardar dados pessoais em armazenamento persistente do browser.

6. Validação do passo.

Arranca backend e frontend, entra com um utilizador e abre `/conta`. Ao clicar em `Exportar dados`, deve ser preparado um ficheiro `faithflix-export-...json`.

7. Cenário negativo/erro esperado.

Se a sessão expirar, o botão deve mostrar a mensagem devolvida pelo backend, normalmente `Autenticação obrigatória.`. O componente não deve tentar corrigir isto com ids manuais.

### Passo 5 - Criar teste unitário de minimização

1. Objetivo funcional do passo no contexto da app.

Provar que a exportação não devolve campos sensíveis nem dados de outro utilizador.

2. Ficheiros envolvidos:
    - CRIAR: `apps/backend/tests/unit/mf5-privacy-export.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria um teste com base de dados em memória, seguindo o padrão dos testes de `MF4`.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/tests/unit/mf5-privacy-export.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { ObjectId } from "mongodb";
import { setDbForTests } from "../../src/config/database.js";
import { buildUserDataExport } from "../../src/modules/privacy/privacy.service.js";

/**
 * Cria uma coleção mínima compatível com as consultas deste BK.
 *
 * @param {Record<string, unknown>[]} rows Documentos iniciais.
 * @returns {Record<string, unknown>} Coleção de teste.
 */
function collection(rows) {
    return {
        async findOne(query) {
            return rows.find((row) => String(row._id) === String(query._id)) ?? null;
        },
        find(query) {
            const result = rows.filter((row) => String(row.userId) === String(query.userId));

            return {
                sort() {
                    return this;
                },
                async toArray() {
                    return result;
                },
            };
        },
    };
}

test("MF5 exporta apenas dados do utilizador autenticado sem campos sensíveis", async () => {
    const userId = new ObjectId();
    const otherUserId = new ObjectId();

    setDbForTests({
        collection(name) {
            if (name === "users") {
                return collection([
                    {
                        _id: userId,
                        name: "Ana Faith",
                        email: "ana@example.test",
                        role: "user",
                        passwordHash: "nao-deve-sair",
                    },
                ]);
            }

            if (name === "notifications") {
                return collection([
                    { _id: new ObjectId(), userId, title: "Bem-vinda" },
                    { _id: new ObjectId(), userId: otherUserId, title: "Outra conta" },
                ]);
            }

            if (name === "content_comments") {
                return collection([
                    { _id: new ObjectId(), userId, body: "Comentário visível" },
                ]);
            }

            if (name === "media_preferences") {
                return collection([
                    {
                        _id: new ObjectId(),
                        userId,
                        values: { subtitleLanguage: "pt", quality: "720p" },
                    },
                ]);
            }

            return collection([]);
        },
    });

    const result = await buildUserDataExport(String(userId));

    assert.equal(result.user.email, "ana@example.test");
    assert.equal("passwordHash" in result.user, false);
    assert.equal(result.sections.notifications.length, 1);
    assert.equal(result.sections.notifications[0].title, "Bem-vinda");
    assert.equal(result.sections.content_comments[0].body, "Comentário visível");
    assert.equal(result.sections.media_preferences[0].values.quality, "720p");

    setDbForTests(null);
});
```

5. Explicação do código.

O teste cria dois utilizadores em termos de dados: um é o dono da exportação e outro aparece numa notificação que não deve sair. A exportação deve incluir apenas a notificação do dono, deve trazer comentários reais de `content_comments`, deve trazer preferências de media e nunca deve incluir `passwordHash`.

6. Validação do passo.

Executa:

```bash
cd apps/backend
node --test tests/unit/mf5-privacy-export.test.js
```

O resultado esperado é `pass`.

7. Cenário negativo/erro esperado.

Se removeres o filtro `{ userId: userObjectId }`, o teste passa a devolver notificações de outra conta. Esse é o erro de privacidade que este BK evita.

#### Critérios de aceite

- `GET /api/privacy/export` existe e exige autenticação.
- A exportação usa `req.user.id`, sem aceitar `userId` enviado pelo frontend.
- O JSON inclui conta, histórico, biblioteca, preferências de media, ratings, comentários de `content_comments`, subscrições, tentativas de pagamento simuladas, notificações e preferências existentes.
- O JSON não inclui `passwordHash`, tokens, cookies ou dados de sessão.
- A página `/conta` mostra botão de exportação com loading, erro e sucesso.
- O teste unitário confirma minimização e ownership.
- Existem pelo menos 3 negativos documentados: sem sessão, id inválido em teste de service e tentativa de fuga de dados de outro utilizador.

#### Validação final

Executa:

```bash
cd apps/backend
node --test tests/unit/mf5-privacy-export.test.js
node -e "import('./src/app.js').then(({ createApp }) => console.log(typeof createApp))"
```

Depois executa no frontend:

```bash
cd apps/frontend
npm run build
```

Resultado esperado:

- teste backend passa;
- `createApp` importa sem erro;
- build frontend termina sem erros;
- em `/conta`, o botão `Exportar dados` gera um ficheiro JSON do utilizador autenticado.

#### Evidence para PR/defesa

- `pr`: referência do commit ou PR com o módulo `privacy`.
- `proof`: output de `node --test tests/unit/mf5-privacy-export.test.js`.
- `proof`: captura da página `/conta` com o botão `Exportar dados`.
- `neg`: pedido sem sessão devolve `401`.
- `neg`: teste confirma que dados de outro utilizador não entram na exportação.
- `neg`: exportação não inclui campos sensíveis.

#### Handoff

O próximo BK, `BK-MF5-02`, deve reutilizar o módulo `privacy`, a rota autenticada e a regra de ownership. A eliminação de conta deve continuar a obter identidade pela sessão e deve considerar as mesmas coleções exportadas aqui para decidir o que eliminar, anonimizar ou preservar por rastreabilidade operacional.

#### Changelog

- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com módulo `privacy`, exportação autenticada, frontend, teste e critérios de privacidade.
