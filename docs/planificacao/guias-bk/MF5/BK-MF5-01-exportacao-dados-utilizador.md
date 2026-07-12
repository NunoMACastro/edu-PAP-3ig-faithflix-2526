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
- `last_updated`: `2026-07-10`

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

#### Pré-requisitos

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
| Minimização | allowlist recursiva por secção; campos desconhecidos são omitidos |
| Frontend API | `privacyApi.exportMyData(options)` |
| UI | `PrivacyExportPanel` dentro de `AccountPage` |
| Teste | `backend/tests/unit/mf5-privacy-export.test.js` |

##### Contrato vinculativo da interface de exportação (Fase 5 - 2026-07-10)

- `PrivacyExportPanel` cria um `AbortController` por exportação e cancela-o no
  unmount. Uma resposta tardia não deve iniciar download nem alterar o estado de
  uma página que já deixou de estar montada.
- Um `ref` de operação ativa impede duplo clique antes do render seguinte. O
  botão fica desativado e o painel expõe `aria-busy` enquanto prepara o JSON.
- `REQUEST_ABORTED` não é apresentado como falha. Outros erros passam por
  `toUserMessage`, sem reproduzir corpo bruto, stack ou detalhes internos.
- O download só ocorre após resposta autoritativa e usa um `Blob` local
  `application/json`; o cliente nunca envia `userId` nem persiste a exportação
  em storage do browser.
- Loading, erro, retry implícito por novo clique e sucesso usam PT-PT:
  `A preparar...`, `Descarregar JSON` e `Exportação preparada`.
- O Passo 4 é a implementação autoritativa deste contrato.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/privacy/privacy.service.js`
- CRIAR: `backend/src/modules/privacy/privacy.controller.js`
- CRIAR: `backend/src/modules/privacy/privacy.routes.js`
- EDITAR: `backend/src/app.js`
- CRIAR: `frontend/src/services/api/privacyApi.js`
- CRIAR: `frontend/src/components/privacy/PrivacyExportPanel.jsx`
- EDITAR: `frontend/src/pages/AccountPage.jsx`
- CRIAR: `backend/tests/unit/mf5-privacy-export.test.js`
- REVER: `BK-MF2-01`, `BK-MF2-07`, `BK-MF3-01`, `BK-MF3-02`, `BK-MF4-01`, `BK-MF4-08`, `RF55`, `RNF15`, `RNF17`, `RNF19`, `RNF37`

#### Tutorial técnico linear

### Passo 1 - Criar o service de exportação

1. Objetivo funcional do passo no contexto da app.

Criar a função que reúne dados do utilizador autenticado e remove campos que não devem sair da aplicação.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/modules/privacy/privacy.service.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `backend/src/modules/privacy/`. Dentro dela, cria `privacy.service.js` com o código abaixo.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/privacy/privacy.service.js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";

const EXPORT_SCALAR = Symbol("export-scalar");
const OMIT_EXPORT_VALUE = Symbol("omit-export-value");
const OWNED_DOCUMENT_FIELDS = {
    _id: EXPORT_SCALAR,
    userId: EXPORT_SCALAR,
    createdAt: EXPORT_SCALAR,
    updatedAt: EXPORT_SCALAR,
};

// Cada secção declara os únicos campos exportáveis, incluindo objetos nested.
const USER_EXPORT_SECTIONS = Object.freeze({
    playback_progress: {
        ...OWNED_DOCUMENT_FIELDS,
        contentId: EXPORT_SCALAR,
        currentTimeSeconds: EXPORT_SCALAR,
        durationSeconds: EXPORT_SCALAR,
        completed: EXPORT_SCALAR,
        lastWatchedAt: EXPORT_SCALAR,
    },
    media_preferences: {
        ...OWNED_DOCUMENT_FIELDS,
        values: {
            subtitleLanguage: EXPORT_SCALAR,
            audioLanguage: EXPORT_SCALAR,
            quality: EXPORT_SCALAR,
        },
    },
    user_content_lists: {
        ...OWNED_DOCUMENT_FIELDS,
        contentId: EXPORT_SCALAR,
        type: EXPORT_SCALAR,
    },
    content_ratings: {
        ...OWNED_DOCUMENT_FIELDS,
        contentId: EXPORT_SCALAR,
        value: EXPORT_SCALAR,
    },
    content_comments: {
        ...OWNED_DOCUMENT_FIELDS,
        contentId: EXPORT_SCALAR,
        body: EXPORT_SCALAR,
        status: EXPORT_SCALAR,
        moderationReason: EXPORT_SCALAR,
        deletedByUser: EXPORT_SCALAR,
    },
    charity_memberships: {
        ...OWNED_DOCUMENT_FIELDS,
        charityId: EXPORT_SCALAR,
    },
    subscriptions: {
        ...OWNED_DOCUMENT_FIELDS,
        planCode: EXPORT_SCALAR,
        status: EXPORT_SCALAR,
        currentPeriodStart: EXPORT_SCALAR,
        currentPeriodEnd: EXPORT_SCALAR,
        billingAnchorDay: EXPORT_SCALAR,
        billingAnchorEndOfMonth: EXPORT_SCALAR,
        cancelAtPeriodEnd: EXPORT_SCALAR,
    },
    payment_attempts: {
        ...OWNED_DOCUMENT_FIELDS,
        schemaVersion: EXPORT_SCALAR,
        operation: EXPORT_SCALAR,
        planCode: EXPORT_SCALAR,
        paymentMethod: EXPORT_SCALAR,
        provider: EXPORT_SCALAR,
        status: EXPORT_SCALAR,
        failureReason: EXPORT_SCALAR,
        amountCents: EXPORT_SCALAR,
        currency: EXPORT_SCALAR,
        solidaritySharePercent: EXPORT_SCALAR,
        interval: EXPORT_SCALAR,
        approvedAt: EXPORT_SCALAR,
        cycle: {
            startsAt: EXPORT_SCALAR,
            endsAt: EXPORT_SCALAR,
        },
        accountingEstimate: EXPORT_SCALAR,
    },
    trials: {
        ...OWNED_DOCUMENT_FIELDS,
        operation: EXPORT_SCALAR,
        status: EXPORT_SCALAR,
        startedAt: EXPORT_SCALAR,
        endsAt: EXPORT_SCALAR,
    },
    notification_preferences: {
        ...OWNED_DOCUMENT_FIELDS,
        settings: {
            inApp: EXPORT_SCALAR,
            email: EXPORT_SCALAR,
            continueWatching: EXPORT_SCALAR,
        },
    },
    notifications: {
        ...OWNED_DOCUMENT_FIELDS,
        type: EXPORT_SCALAR,
        title: EXPORT_SCALAR,
        message: EXPORT_SCALAR,
        readAt: EXPORT_SCALAR,
    },
});

const USER_EXPORT_SCHEMA = {
    id: EXPORT_SCALAR,
    name: EXPORT_SCALAR,
    email: EXPORT_SCALAR,
    role: EXPORT_SCALAR,
    accountStatus: EXPORT_SCALAR,
    parentalMaxAgeRating: EXPORT_SCALAR,
    createdAt: EXPORT_SCALAR,
    updatedAt: EXPORT_SCALAR,
};

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
 * Projeta recursivamente um valor segundo um schema fechado.
 *
 * @param {unknown} value Valor vindo da base de dados.
 * @param {unknown} schema Schema allowlist da posição atual.
 * @returns {unknown} Valor seguro para serialização.
 */
function sanitizeExportValue(value, schema) {
    if (schema === EXPORT_SCALAR) {
        if (value instanceof ObjectId) return String(value);
        if (value instanceof Date) return value.toISOString();
        if (
            value === null
            || ["string", "number", "boolean"].includes(typeof value)
        ) return value;

        // Um objeto inesperado nunca é percorrido por uma posição scalar.
        return OMIT_EXPORT_VALUE;
    }

    if (
        !schema
        || typeof schema !== "object"
        || Array.isArray(schema)
        || !value
        || typeof value !== "object"
        || Array.isArray(value)
    ) return OMIT_EXPORT_VALUE;

    const entries = [];
    for (const [key, nestedSchema] of Object.entries(schema)) {
        if (!Object.hasOwn(value, key)) continue;
        const sanitized = sanitizeExportValue(value[key], nestedSchema);
        if (sanitized !== OMIT_EXPORT_VALUE) entries.push([key, sanitized]);
    }

    return Object.fromEntries(entries);
}

/**
 * Remove campos internos do documento de utilizador.
 *
 * @param {Record<string, unknown>} user Documento `users`.
 * @returns {Record<string, unknown>} Dados públicos da conta para exportação.
 */
function toExportableUser(user) {
    return sanitizeExportValue({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus ?? "active",
        parentalMaxAgeRating: user.parentalMaxAgeRating ?? 18,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }, USER_EXPORT_SCHEMA);
}

/**
 * Remove campos técnicos que não acrescentam transparência ao utilizador.
 *
 * @param {Record<string, unknown>} row Documento de uma coleção associada ao utilizador.
 * @param {Record<string, unknown>} schema Allowlist da secção.
 * @returns {Record<string, unknown>} Documento serializável sem campos internos perigosos.
 */
function toExportableRow(row, schema) {
    return sanitizeExportValue(row, schema);
}

/**
 * Carrega documentos de uma coleção filtrando sempre pelo dono autenticado.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {string} collectionName Nome da coleção a exportar.
 * @param {ObjectId} userObjectId Id do utilizador autenticado.
 * @param {Record<string, unknown>} schema Allowlist da secção.
 * @returns {Promise<Record<string, unknown>[]>} Documentos exportáveis.
 */
async function exportOwnedCollection(db, collectionName, userObjectId, schema) {
    const rows = await db
        .collection(collectionName)
        .find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .toArray();

    return rows.map((row) => toExportableRow(row, schema));
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
        Object.entries(USER_EXPORT_SECTIONS).map(async ([collectionName, schema]) => [
            collectionName,
            await exportOwnedCollection(
                db,
                collectionName,
                userObjectId,
                schema,
            ),
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

`USER_EXPORT_SECTIONS` é simultaneamente a lista de coleções próprias e a
allowlist recursiva de cada DTO. `content_comments`, `media_preferences` e
`charity_memberships` usam apenas os campos declarados; payment attempts não
exportam `idempotencyKey`, `requestHash`, `response` ou metadata técnica. A
função começa por converter `req.user.id`, procura a conta e consulta cada
coleção sempre com `{ userId: userObjectId }`.

`sanitizeExportValue` só percorre chaves presentes no schema da posição atual.
Um objeto nested colocado sob um campo scalar também é omitido. Assim, um campo
novo como `metadata.credentials.private_key` não precisa de constar numa
denylist para ficar fora: não pertence à allowlist. O frontend nunca envia o id
do utilizador, logo não consegue alterar o dono da exportação.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/modules/privacy/privacy.service.js').then(() => console.log('privacy service ok'))"
```

O resultado esperado é `privacy service ok`.

7. Cenário negativo/erro esperado.

Se chamares `buildUserDataExport("id-invalido")`, o service deve lançar `Utilizador inválido.` com estado `400`. Isto evita consultas MongoDB com ids mal formados.

### Passo 2 - Criar controller e rota autenticada

1. Objetivo funcional do passo no contexto da app.

Expor a exportação através de uma rota HTTP protegida por sessão.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/modules/privacy/privacy.controller.js`
    - CRIAR: `backend/src/modules/privacy/privacy.routes.js`
    - LOCALIZAÇÃO: ficheiros completos

3. Instruções do que fazer.

Cria o controller e a rota. A rota deve usar `requireAuth` antes do controller.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/privacy/privacy.controller.js
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
// backend/src/modules/privacy/privacy.routes.js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { getMyDataExport } from "./privacy.controller.js";

export const privacyRouter = Router();

privacyRouter.get("/export", requireAuth, asyncHandler(getMyDataExport));
```

5. Explicação do código.

O controller não recebe `userId` de `req.params`, `req.query` ou `req.body`. A única fonte de identidade é `req.user.id`, preenchido pela sessão. A rota usa `requireAuth`, por isso pedidos sem sessão recebem `401`.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/modules/privacy/privacy.routes.js').then(({ privacyRouter }) => console.log(typeof privacyRouter))"
```

O resultado esperado é `function`.

7. Cenário negativo/erro esperado.

Um pedido sem cookie de sessão para `GET /api/privacy/export` deve devolver `401` com mensagem de autenticação obrigatória.

### Passo 3 - Montar o módulo na app Express

1. Objetivo funcional do passo no contexto da app.

Registar a rota de privacidade na aplicação real.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/app.js`
    - LOCALIZAÇÃO: imports do topo e zona de montagem das rotas dentro de `createApp`

3. Instruções do que fazer.

Adiciona o import de `privacyRouter` e monta-o com prefixo `/api/privacy`.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/app.js
import { privacyRouter } from "./modules/privacy/privacy.routes.js";

// Dentro de createApp(), junto das restantes rotas /api:
app.use("/api/privacy", privacyRouter);
```

5. Explicação do código.

O prefixo `/api/privacy` separa operações de privacidade da rota genérica de utilizadores. Isto mantém responsabilidades claras: `users` gere perfil e administração de utilizadores; `privacy` trata exportação, eliminação e consentimentos da conta autenticada.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/app.js').then(({ createApp }) => console.log(typeof createApp))"
```

O resultado esperado é `function`.

7. Cenário negativo/erro esperado.

Se esqueceres esta montagem, o service e a rota existem, mas `GET /api/privacy/export` devolve `404`. Este erro mostra que criar ficheiros não chega; é preciso ligá-los à aplicação.

### Passo 4 - Criar cliente API e painel de exportação no frontend

1. Objetivo funcional do passo no contexto da app.

Permitir ao utilizador descarregar a exportação a partir da área da conta.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/src/services/api/privacyApi.js`
    - CRIAR: `frontend/src/components/privacy/PrivacyExportPanel.jsx`
    - EDITAR: `frontend/src/pages/AccountPage.jsx`
    - LOCALIZAÇÃO: ficheiros completos para os novos ficheiros; import e JSX final em `AccountPage`

3. Instruções do que fazer.

Cria o cliente `privacyApi`, cria o componente `PrivacyExportPanel` e adiciona `<PrivacyExportPanel />` no fim da página `AccountPage`.

4. Código completo, correto e integrado com a app final.

```js
// frontend/src/services/api/privacyApi.js
import { apiClient } from "./apiClient.js";

export const privacyApi = {
    /**
     * Pede ao backend a exportação dos dados do utilizador autenticado.
     *
     * @param {{ signal?: AbortSignal }} options Opções canceláveis do pedido.
     * @returns {Promise<{ export: Record<string, unknown> }>} Exportação em JSON.
     */
    exportMyData(options = {}) {
        return apiClient.get("/api/privacy/export", options);
    },
};
```

```jsx
// frontend/src/components/privacy/PrivacyExportPanel.jsx
import { useEffect, useRef, useState } from "react";
import { toUserMessage } from "../../services/api/apiErrors.js";
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
    const operationRef = useRef(null);
    const lifecycleEpochRef = useRef(0);

    useEffect(() => () => {
        // Sair da conta/rota invalida a resposta e cancela o transporte HTTP.
        lifecycleEpochRef.current += 1;
        operationRef.current?.controller.abort();
        operationRef.current = null;
    }, []);

    /**
     * Pede a exportação e cria um ficheiro JSON no browser.
     *
     * @returns {Promise<void>} Termina quando o ficheiro é preparado.
     */
    async function handleExport() {
        // A ref reserva a operação no mesmo tick, antes de `loading` provocar render.
        if (operationRef.current) return;
        const controller = new AbortController();
        const epoch = lifecycleEpochRef.current;
        const operation = { controller, epoch };
        operationRef.current = operation;
        setLoading(true);
        setStatus("");
        setError("");

        try {
            const response = await privacyApi.exportMyData({
                signal: controller.signal,
            });
            if (
                controller.signal.aborted
                || epoch !== lifecycleEpochRef.current
            ) return;

            const json = JSON.stringify(response.export, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            try {
                link.href = url;
                const timestamp = response.export.generatedAt.replace(/[:.]/gu, "-");
                link.download = `faithflix-export-${timestamp}.json`;
                document.body.append(link);
                // O download só nasce neste ponto, depois da resposta autoritativa atual.
                link.click();
            } finally {
                link.remove();
                URL.revokeObjectURL(url);
            }

            setStatus("Exportação preparada.");
        } catch (requestError) {
            if (
                controller.signal.aborted
                || requestError?.code === "REQUEST_ABORTED"
            ) return;
            if (epoch !== lifecycleEpochRef.current) return;
            setError(toUserMessage(requestError));
        } finally {
            if (operationRef.current === operation) {
                operationRef.current = null;
                if (epoch === lifecycleEpochRef.current) setLoading(false);
            }
        }
    }

    return (
        <section
            className="form-panel"
            aria-labelledby="privacy-export-title"
            aria-busy={loading}
        >
            <h2 id="privacy-export-title">Exportar dados</h2>
            <p>
                Descarrega um ficheiro JSON com os dados associados à tua conta
                FaithFlix.
            </p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <button type="button" onClick={handleExport} disabled={loading}>
                {loading ? "A preparar..." : "Descarregar JSON"}
            </button>
        </section>
    );
}
```

```jsx
// frontend/src/pages/AccountPage.jsx
import { PrivacyExportPanel } from "../components/privacy/PrivacyExportPanel.jsx";

// Dentro do return principal, depois do bloco de dados da conta:
<PrivacyExportPanel />
```

5. Explicação do código.

`privacyApi.exportMyData(options)` propaga o `AbortSignal` pelo cliente central.
O painel reserva a operação numa ref síncrona, cancela-a no cleanup e compara o
epoch do lifecycle antes de criar o Blob, iniciar exatamente um download ou
alterar a UI. `REQUEST_ABORTED` fica silencioso; outros erros passam por
`toUserMessage`. O ficheiro só existe em memória durante o download e nunca é
guardado em storage persistente do browser.

6. Validação do passo.

Arranca backend e frontend, entra com um utilizador e abre `/conta`. Ao clicar em
`Descarregar JSON`, deve ser preparado um único ficheiro
`faithflix-export-...json`.

7. Cenário negativo/erro esperado.

Se a sessão expirar, o botão mostra uma mensagem segura. Duplo clique reserva um
único pedido; sair da rota durante a leitura cancela-a e não inicia download.

### Passo 5 - Criar teste unitário de minimização

1. Objetivo funcional do passo no contexto da app.

Provar que a exportação não devolve campos sensíveis nem dados de outro utilizador.

2. Ficheiros envolvidos:
    - CRIAR: `backend/tests/unit/mf5-privacy-export.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria um teste com base de dados em memória, seguindo o padrão dos testes de `MF4`.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf5-privacy-export.test.js
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
                        profile: {
                            credentials: { private_key: "nested-nao-deve-sair" },
                        },
                    },
                ]);
            }

            if (name === "notifications") {
                return collection([
                    {
                        _id: new ObjectId(),
                        userId,
                        type: "trial_started",
                        title: "Bem-vinda",
                        message: "O período experimental começou.",
                        metadata: {
                            authorization: "Bearer nao-deve-sair",
                        },
                    },
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
                        values: {
                            subtitleLanguage: "pt",
                            quality: "720p",
                            api_key: "nested-nao-deve-sair",
                            credentials: { token: "nested-nao-deve-sair" },
                        },
                    },
                ]);
            }

            if (name === "payment_attempts") {
                return collection([
                    {
                        _id: new ObjectId(),
                        userId,
                        status: "approved",
                        amountCents: 1000,
                        currency: "EUR",
                        idempotencyKey: "nao-deve-sair",
                        requestHash: "nao-deve-sair",
                        response: { accessToken: "nested-nao-deve-sair" },
                    },
                ]);
            }

            if (name === "charity_memberships") {
                return collection([
                    { _id: new ObjectId(), userId, charityId: new ObjectId() },
                    {
                        _id: new ObjectId(),
                        userId: otherUserId,
                        charityId: new ObjectId(),
                    },
                ]);
            }

            return collection([]);
        },
    });

    try {
        const result = await buildUserDataExport(String(userId));

        // Ownership conserva apenas documentos cujo userId veio da sessão.
        assert.equal(result.user.email, "ana@example.test");
        assert.equal(result.sections.notifications.length, 1);
        assert.equal(result.sections.charity_memberships.length, 1);
        assert.equal(result.sections.charity_memberships[0].userId, String(userId));

        // A allowlist mantém campos úteis, mas omite top-level e objetos nested livres.
        assert.equal(result.sections.notifications[0].title, "Bem-vinda");
        assert.equal("metadata" in result.sections.notifications[0], false);
        assert.equal(result.sections.content_comments[0].body, "Comentário visível");
        assert.deepEqual(result.sections.media_preferences[0].values, {
            subtitleLanguage: "pt",
            quality: "720p",
        });
        assert.equal(result.sections.payment_attempts[0].amountCents, 1000);
        assert.equal("idempotencyKey" in result.sections.payment_attempts[0], false);

        const serialized = JSON.stringify(result);
        for (const forbidden of [
            "passwordHash",
            "private_key",
            "authorization",
            "api_key",
            "credentials",
            "idempotencyKey",
            "requestHash",
            "accessToken",
            "nested-nao-deve-sair",
            "Bearer nao-deve-sair",
        ]) {
            assert.equal(serialized.includes(forbidden), false);
        }
    } finally {
        setDbForTests(null);
    }
});
```

5. Explicação do código.

O teste cria dados do dono e de outra conta. Além do filtro de ownership, injeta
segredos em campos top-level, metadata livre, preferências nested e resposta
financeira. A exportação preserva apenas os campos declarados por secção; não
depende de conhecer previamente cada alias de segredo para o remover.

6. Validação do passo.

Executa:

```bash
cd backend
node --test tests/unit/mf5-privacy-export.test.js
```

O resultado esperado é `pass`.

7. Cenário negativo/erro esperado.

Se removeres o filtro `{ userId: userObjectId }`, o teste passa a devolver notificações de outra conta. Esse é o erro de privacidade que este BK evita.

#### Critérios de aceite

- `GET /api/privacy/export` existe e exige autenticação.
- A exportação usa `req.user.id`, sem aceitar `userId` enviado pelo frontend.
- O JSON inclui conta, histórico, biblioteca, preferências de media, ratings, comentários de `content_comments`, `sections.charity_memberships`, subscrições, tentativas de pagamento simuladas, notificações e preferências existentes.
- Conta e secções usam allowlists recursivas. Campos top-level ou nested fora do
  schema, incluindo metadata, credentials, private keys, hashes e resposta
  idempotente interna, são omitidos mesmo quando o nome do segredo é novo.
- A página `/conta` mostra `Descarregar JSON`, `A preparar...`, erro seguro e
  `Exportação preparada.`, com `aria-busy` durante a leitura.
- `privacyApi.exportMyData(options)` propaga `signal`.
- Duplo clique produz um único pedido; unmount cancela a leitura e nenhuma
  resposta antiga inicia download ou mostra erro tardio.
- O teste unitário confirma minimização por allowlist, segredos nested e ownership.
- O teste confirma que apenas a `charity_membership` cujo `userId` é o da sessão entra na exportação.
- Existem pelo menos 3 negativos documentados: sem sessão, id inválido em teste de service e tentativa de fuga de dados de outro utilizador.

#### Validação final

Executa:

```bash
cd backend
node --test tests/unit/mf5-privacy-export.test.js
node -e "import('./src/app.js').then(({ createApp }) => console.log(typeof createApp))"
```

Depois executa no frontend:

```bash
cd frontend
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
- `neg`: metadata/credentials nested e campos financeiros internos não entram.

#### Handoff

O próximo BK, `BK-MF5-02`, deve reutilizar o módulo `privacy`, a rota autenticada e a regra de ownership. A eliminação de conta deve continuar a obter identidade pela sessão e deve considerar as mesmas coleções exportadas aqui para decidir o que eliminar, anonimizar ou preservar por rastreabilidade operacional.

#### Changelog

- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com módulo `privacy`, exportação autenticada, frontend, teste e critérios de privacidade.
- `2026-07-10`: exportação RGPD alargada à `charity_membership` da própria conta.
- `2026-07-10`: painel de exportação sincronizado com abort/anti-stale,
  anti-duplo-clique, `aria-busy` e erros seguros em PT-PT.
- `2026-07-10`: sanitização top-level substituída por allowlists recursivas por
  secção; campos desconhecidos e segredos nested deixam de ser copiáveis.
