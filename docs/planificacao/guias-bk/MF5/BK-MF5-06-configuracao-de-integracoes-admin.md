# BK-MF5-06 - Configuração de integrações admin

## Header

- `doc_id`: `GUIA-BK-MF5-06`
- `bk_id`: `BK-MF5-06`
- `macro`: `MF5`
- `owner`: `Davi`
- `apoio`: `Matheus`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF5-04`
- `rf_rnf`: `RF60`
- `fase_documental`: `Fase 2`
- `sprint`: `S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-01`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-06-configuracao-de-integracoes-admin.md`
- `last_updated`: `2026-07-12`

#### Objetivo

Neste BK vais implementar configuração administrativa de integrações controladas. O administrador deve conseguir ativar/desativar integrações previstas no MVP, escolher modo de execução e ver que segredos continuam fora da base de dados.

`CANONICO`: este BK cobre `RF60 - Configuração de integrações` e depende de `BK-MF5-04`.

`DERIVADO`: como não há contrato documental para fornecedores reais, este guia define integrações operacionais controladas: notificações internas, pagamento simulado e exportação analítica agregada.

#### Importância

Configurar integrações é uma tarefa de operação. Mesmo num MVP escolar, é útil ter um local onde o admin veja que capacidades estão ligadas, quais estão em modo simulado e que variáveis de ambiente seriam necessárias numa evolução futura.

O ponto mais importante é segurança: segredos não ficam no código nem na base de dados. O painel guarda apenas estado operacional e configuração pública.

#### Scope-in

- Criar módulo backend `integrations`.
- Definir lista fechada de integrações aceites.
- Criar endpoint admin `GET /api/admin/integrations`.
- Criar endpoint admin `PATCH /api/admin/integrations/:key`.
- Guardar estado em `integration_settings`.
- Registar alterações em `admin_audit_logs` na mesma transação e sessão da
  configuração.
- Criar página `/admin/integracoes`.
- Preparar handoff para regressão backend/frontend da MF6.

#### Scope-out

- Ligação a fornecedores reais.
- Armazenamento de chaves secretas na base de dados.
- Envio externo de mensagens.
- Mudança do fluxo de pagamento simulado.
- Automação inteligente avançada.

#### Estado antes e depois

Antes deste BK, a aplicação tem notificações internas, pagamentos simulados, métricas admin e gestão de utilizadores, mas não tem um contrato de configuração operacional para integrações.

Depois deste BK, existe uma API admin e uma página para gerir integrações permitidas, sem segredos persistidos e com auditoria de alterações.

#### Pré-requisitos

- `BK-MF5-04` criou gestão admin segura.
- `BK-MF5-05` criou navegação e padrão admin para operação.
- `BK-MF4-02` criou pagamento simulado.
- `BK-MF4-08` criou notificações internas.
- `apiClient` já envia cookies de sessão.

#### Glossário

- Integração: ponto de ligação entre FaithFlix e uma capacidade operacional.
- Modo simulado: comportamento controlado para MVP sem fornecedor real.
- Configuração pública: valor operacional que pode ser guardado sem segredo.
- Segredo: chave, token ou credencial que deve ficar em variável de ambiente.
- Lista fechada: conjunto limitado de chaves aceites pelo backend.

#### Conceitos teóricos essenciais

No domínio FaithFlix, as integrações deste BK são controladas: notificações internas, pagamento simulado e exportação analítica agregada. Elas representam operação do MVP, não uma promessa de serviços externos reais.

No backend, o validator impede chaves desconhecidas, modos desconhecidos e campos livres. O service grava apenas `enabled`, `mode` e `publicConfig`.

No frontend, o admin vê cada integração, alterna estado e modo e recebe mensagens de erro ou sucesso. A UI nunca pede segredo.

Na segurança, alterações exigem admin e ficam em `admin_audit_logs`. A escrita
da configuração e o audit log são atómicos: uma falha tardia reverte ambos.
Segredos são referenciados apenas por nomes de variáveis de ambiente, sem valor.

A leitura e cada mutação são canceláveis e protegidas por versão de contexto.
Cada alteração exige confirmação, reserva síncrona por linha e aplica apenas a
integração autoritativa devolvida pela API. `publicConfig` usa uma allowlist por
integração, aceita no máximo 20 chaves e valores string até 500 caracteres.
`credential`, `authorization`, `private_key`, control characters, padrões de
segredo e URL com userinfo são recusados antes do service.

#### Arquitetura do BK

| Camada | Contrato |
| --- | --- |
| Backend routes | `GET /api/admin/integrations`, `PATCH /api/admin/integrations/:key` |
| Autorização | `requireRole(["admin"])` |
| Validator | `assertIntegrationKey(key)`, `assertIntegrationUpdate(key, input)` |
| Service | `listIntegrationSettings()`, `updateIntegrationSetting(actorUserId, key, input, { requestId })` |
| Coleção | `integration_settings`, índice único `integration_settings_key_unique` em `{ key: 1 }` |
| Auditoria | `admin_audit_logs` |
| Atomicidade | `runInTransaction`, com a mesma `session` na configuração e no audit |
| Frontend API | `integrationsApi` |
| Página | `AdminIntegrationsPage` |
| Handoff | `BK-MF6-01` e `BK-MF6-02` usam estes endpoints na regressão |

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/integrations/integrations.validation.js`
- CRIAR: `backend/src/modules/integrations/integrations.service.js`
- CRIAR: `backend/src/modules/integrations/integrations.controller.js`
- CRIAR: `backend/src/modules/integrations/integrations.routes.js`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- CRIAR: `frontend/src/services/api/integrationsApi.js`
- CRIAR: `frontend/src/pages/AdminIntegrationsPage.jsx`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- CRIAR: `backend/tests/unit/mf5-integrations.validation.test.js`
- REVER: `RF60`, `RNF17`, `RNF19`, `BK-MF5-04`, `BK-MF6-01`, `BK-MF6-02`

#### Tutorial técnico linear

### Passo 1 - Definir contrato fechado de integrações

1. Objetivo funcional do passo no contexto da app.

Criar uma lista fechada de integrações e validar alterações.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/modules/integrations/integrations.validation.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `integrations` e adiciona o validator.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/integrations/integrations.validation.js
import { HttpError } from "../../utils/http-error.js";

export const INTEGRATION_DEFINITIONS = {
    internal_notifications: {
        label: "Notificações internas",
        envVars: [],
        defaultMode: "internal",
        publicConfigFields: {
            channel: ["in_app"],
        },
    },
    simulated_payments: {
        label: "Pagamentos simulados",
        envVars: ["PAYMENT_SIMULATION_MODE"],
        defaultMode: "simulation",
        publicConfigFields: {},
    },
    aggregate_analytics_export: {
        label: "Exportação analítica agregada",
        envVars: ["ANALYTICS_EXPORT_PATH"],
        defaultMode: "manual",
        publicConfigFields: {},
    },
};

export const INTEGRATION_MODES = ["internal", "simulation", "manual", "disabled"];
const PUBLIC_CONFIG_KEY_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/u;
const SECRET_KEY_PATTERN = /(?:token|password|secret|api[_-]?key|credential|authorization|private[_-]?key)/iu;
const SECRET_VALUE_PATTERN = /(?:bearer\s+|basic\s+|mongodb(?:\+srv)?:\/\/|sk_(?:live|test)_|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:credential|authorization|private[_-]?key)\s*[:=])/iu;

function hasUrlUserInfo(value) {
    try {
        const parsed = new URL(value);
        return ["http:", "https:"].includes(parsed.protocol)
            && Boolean(parsed.username || parsed.password);
    } catch {
        return false;
    }
}

/**
 * Valida a chave de integração recebida por parâmetro.
 *
 * @param {string} key Chave da integração.
 * @returns {keyof typeof INTEGRATION_DEFINITIONS} Chave validada.
 * @throws {HttpError} Quando a chave não existe.
 */
export function assertIntegrationKey(key) {
    if (typeof key !== "string") {
        throw new HttpError(400, "Chave de integração inválida.");
    }
    if (!Object.hasOwn(INTEGRATION_DEFINITIONS, key)) {
        throw new HttpError(404, "Integração não encontrada.");
    }

    return key;
}

/**
 * Valida configuração pública de uma integração.
 *
 * @param {keyof typeof INTEGRATION_DEFINITIONS} integrationKey Integração validada.
 * @param {unknown} value Valor recebido.
 * @returns {Record<string, string>} Configuração pública validada.
 */
export function assertPublicConfig(integrationKey, value) {
    const validatedKey = assertIntegrationKey(integrationKey);
    if (value === undefined) return {};

    if (
        !value
        || typeof value !== "object"
        || Array.isArray(value)
        || ![Object.prototype, null].includes(Object.getPrototypeOf(value))
    ) {
        throw new HttpError(400, "Configuração pública inválida.");
    }

    const allowedFields = INTEGRATION_DEFINITIONS[validatedKey].publicConfigFields;
    const entries = Object.entries(value);
    if (entries.length > 20) {
        throw new HttpError(400, "Configuração pública excede 20 chaves.");
    }
    const result = {};
    for (const [key, raw] of entries) {
        if (
            !PUBLIC_CONFIG_KEY_PATTERN.test(key)
            || CONTROL_CHARACTER_PATTERN.test(key)
            || SECRET_KEY_PATTERN.test(key)
        ) {
            throw new HttpError(400, "Chave de configuração pública inválida.");
        }
        if (!Object.hasOwn(allowedFields, key)) {
            throw new HttpError(400, "Campo público não permitido nesta integração.");
        }
        if (
            typeof raw !== "string"
            || raw.length > 500
            || CONTROL_CHARACTER_PATTERN.test(raw)
            || SECRET_VALUE_PATTERN.test(raw)
            || hasUrlUserInfo(raw)
        ) {
            throw new HttpError(400, "Valor de configuração pública inválido.");
        }
        const normalizedValue = raw.trim();
        if (!allowedFields[key].includes(normalizedValue)) {
            throw new HttpError(400, "Valor público não permitido nesta integração.");
        }
        result[key] = normalizedValue;
    }
    return result;
}

/**
 * Valida atualização administrativa de uma integração.
 *
 * @param {keyof typeof INTEGRATION_DEFINITIONS} integrationKey Integração validada.
 * @param {{ enabled?: unknown, mode?: unknown, publicConfig?: unknown }} input Dados recebidos.
 * @returns {{ enabled: boolean, mode: string, publicConfig: Record<string, string> }} Atualização segura.
 */
export function assertIntegrationUpdate(integrationKey, input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
        throw new HttpError(400, "Atualização de integração inválida.");
    }
    const allowedFields = ["enabled", "mode", "publicConfig"];
    if (Object.keys(input).some((key) => !allowedFields.includes(key))) {
        throw new HttpError(400, "Atualização contém campos não permitidos.");
    }
    if (typeof input.enabled !== "boolean") {
        throw new HttpError(400, "enabled deve ser verdadeiro ou falso.");
    }

    if (typeof input.mode !== "string" || !INTEGRATION_MODES.includes(input.mode)) {
        throw new HttpError(400, "Modo de integração inválido.");
    }

    return {
        enabled: input.enabled,
        mode: input.mode,
        publicConfig: assertPublicConfig(integrationKey, input.publicConfig),
    };
}
```

5. Explicação do código.

A lista fechada impede que o frontend invente integrações. Cada definição inclui
uma allowlist própria de `publicConfig`: nesta baseline apenas
`internal_notifications.channel=in_app` é configurável; pagamentos e exportação
analítica recebem `{}` porque os seus detalhes operacionais vêm de env. Antes da
allowlist, o validator recusa control characters, nomes como `credential`,
`authorization` e `private_key`, padrões de segredo e URLs HTTP(S) com userinfo.
O service recebe apenas o objeto projetado pelo validator, nunca o input livre.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/modules/integrations/integrations.validation.js').then(({ assertIntegrationKey }) => console.log(assertIntegrationKey('simulated_payments')))"
```

O resultado esperado é `simulated_payments`.

7. Cenário negativo/erro esperado.

`assertIntegrationKey("provider_real")` deve devolver `404`. Este BK não permite integrações fora do contrato.

### Passo 2 - Criar service de configurações

1. Objetivo funcional do passo no contexto da app.

Listar e alterar configurações de integração com auditoria.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/modules/integrations/integrations.service.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o service abaixo.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/integrations/integrations.service.js
import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import {
    assertIntegrationKey,
    assertIntegrationUpdate,
    assertPublicConfig,
    INTEGRATION_DEFINITIONS,
    INTEGRATION_MODES,
} from "./integrations.validation.js";

/**
 * Converte id de admin em ObjectId para auditoria.
 *
 * @param {string} userId Id vindo da sessão.
 * @returns {ObjectId} Id MongoDB.
 */
function asUserObjectId(userId) {
    if (typeof userId !== "string" || !/^[a-f\d]{24}$/i.test(userId)) {
        throw new HttpError(400, "Administrador inválido.");
    }

    return ObjectId.createFromHexString(userId);
}

/**
 * Garante uma única configuração persistida por integração.
 *
 * @returns {Promise<void>} Termina depois de criar o índice autoritativo.
 */
export async function ensureIntegrationIndexes() {
    const db = await getDb();
    await db.collection("integration_settings").createIndex(
        { key: 1 },
        { unique: true, name: "integration_settings_key_unique" },
    );
}

/**
 * Junta definição canónica com configuração persistida.
 *
 * @param {string} key Chave da integração.
 * @param {Record<string, unknown> | null} stored Configuração guardada.
 * @returns {Record<string, unknown>} Integração pública.
 */
function toPublicIntegration(key, stored) {
    const definition = INTEGRATION_DEFINITIONS[key];
    let publicConfig = {};
    try {
        publicConfig = assertPublicConfig(key, stored?.publicConfig);
    } catch {
        // Configuração legacy inválida falha fechada e nunca é exposta ao admin.
    }

    return {
        key,
        label: definition.label,
        requiredEnvVars: definition.envVars,
        enabled: typeof stored?.enabled === "boolean" ? stored.enabled : false,
        mode: INTEGRATION_MODES.includes(stored?.mode)
            ? stored.mode
            : definition.defaultMode,
        publicConfig,
        updatedAt: stored?.updatedAt instanceof Date
            ? stored.updatedAt.toISOString()
            : null,
    };
}

function auditSnapshot(integration) {
    if (!integration) return null;
    return {
        enabled: integration.enabled,
        mode: integration.mode,
        publicConfigKeys: Object.keys(integration.publicConfig).sort(),
    };
}

/**
 * Lista todas as integrações conhecidas com configuração atual.
 *
 * @returns {Promise<Record<string, unknown>[]>} Lista pública para admin.
 */
export async function listIntegrationSettings() {
    const db = await getDb();
    const knownKeys = Object.keys(INTEGRATION_DEFINITIONS);
    const storedRows = await db.collection("integration_settings")
        .find({ key: { $in: knownKeys } })
        .toArray();
    const storedByKey = new Map(storedRows.map((row) => [row.key, row]));

    return Object.keys(INTEGRATION_DEFINITIONS).map((key) =>
        toPublicIntegration(key, storedByKey.get(key) ?? null),
    );
}

async function persistIntegrationSetting({
    actorObjectId,
    integrationKey,
    update,
    requestId,
    upsert,
}) {
    return runInTransaction(async ({ db, session }) => {
        const now = new Date();
        const settings = db.collection("integration_settings");
        const storedBefore = await settings.findOne(
            { key: integrationKey },
            { session },
        );
        const before = storedBefore
            ? toPublicIntegration(integrationKey, storedBefore)
            : null;

        const writeResult = await settings.updateOne(
            { key: integrationKey },
            {
                $set: {
                    key: integrationKey,
                    ...update,
                    updatedAt: now,
                    updatedBy: actorObjectId,
                },
                $setOnInsert: { createdAt: now },
            },
            { upsert, session },
        );
        const affected = (writeResult.matchedCount ?? 0)
            + (writeResult.upsertedCount ?? 0);
        if (affected !== 1) {
            throw new HttpError(
                409,
                "A integração mudou durante a atualização. Tenta novamente.",
                undefined,
                "INTEGRATION_UPDATE_CONFLICT",
            );
        }

        const storedAfter = await settings.findOne(
            { key: integrationKey },
            { session },
        );
        if (!storedAfter) {
            throw new HttpError(409, "A integração não ficou persistida.");
        }
        const after = toPublicIntegration(integrationKey, storedAfter);

        await writeAdminAudit({
            db,
            session,
            actorUserId: actorObjectId,
            action: "integration.update",
            targetType: "integration",
            targetId: integrationKey,
            before: auditSnapshot(before),
            after: auditSnapshot(after),
            requestId,
        });

        return after;
    });
}

/**
 * Atualiza uma integração e regista auditoria sem permitir duplicados concorrentes.
 *
 * @param {string} actorUserId Id do administrador autenticado.
 * @param {string} key Chave da integração.
 * @param {{ enabled?: unknown, mode?: unknown, publicConfig?: unknown }} input Dados recebidos.
 * @param {{ requestId?: string }} context Contexto seguro do pedido.
 * @returns {Promise<Record<string, unknown>>} Integração atualizada.
 */
export async function updateIntegrationSetting(actorUserId, key, input, context = {}) {
    const integrationKey = assertIntegrationKey(key);
    const update = assertIntegrationUpdate(integrationKey, input);
    const actorObjectId = asUserObjectId(actorUserId);
    const command = {
        actorObjectId,
        integrationKey,
        update,
        requestId: context.requestId,
    };

    try {
        return await persistIntegrationSetting({ ...command, upsert: true });
    } catch (error) {
        if (error?.code !== 11000) throw error;
        // Outra transação criou a key; a segunda tentativa só pode atualizar.
        return persistIntegrationSetting({ ...command, upsert: false });
    }
}
```

5. Explicação do código.

`ensureIntegrationIndexes` cria a constraint única autoritativa antes de existir
tráfego. `listIntegrationSettings` consulta apenas keys conhecidas e saneia
configuração legacy. `updateIntegrationSetting` valida primeiro a allowlist e só
depois passa o DTO projetado para a transação. Configuração e audit usam a mesma
`session`; falha tardia reverte ambos. Numa corrida de primeiro upsert, o índice
escolhe um vencedor e o perdedor repete uma vez sem `upsert`, produzindo no
máximo um documento por key e um audit para cada alteração concluída. Nenhum
valor bruto fora do validator chega ao `$set` ou ao snapshot de auditoria.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/modules/integrations/integrations.service.js').then(({ ensureIntegrationIndexes, listIntegrationSettings }) => console.log(typeof ensureIntegrationIndexes, typeof listIntegrationSettings))"
```

O resultado esperado é `function function`.

7. Cenário negativo/erro esperado.

Se o frontend enviar uma chave desconhecida, o service devolve `404`. Isto evita drift de integrações.

### Passo 3 - Criar controller, rotas e montagem

1. Objetivo funcional do passo no contexto da app.

Expor configuração de integrações apenas para administradores.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/modules/integrations/integrations.controller.js`
    - CRIAR: `backend/src/modules/integrations/integrations.routes.js`
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`
    - LOCALIZAÇÃO: ficheiros completos, montagem de rota e bootstrap de índices

3. Instruções do que fazer.

Cria controller/route, monta em `/api/admin/integrations` e chama
`ensureIntegrationIndexes()` no bootstrap antes de aceitar tráfego.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/integrations/integrations.controller.js
import {
    listIntegrationSettings,
    updateIntegrationSetting,
} from "./integrations.service.js";

/**
 * Lista configurações de integração para administração.
 *
 * @param {import("express").Request} _req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Lista de integrações.
 */
export async function getIntegrations(_req, res) {
    return res.status(200).json({
        integrations: await listIntegrationSettings(),
    });
}

/**
 * Atualiza configuração de uma integração.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Integração atualizada.
 */
export async function patchIntegration(req, res) {
    return res.status(200).json({
        integration: await updateIntegrationSetting(
            req.user.id,
            req.params.key,
            req.body,
            { requestId: req.id },
        ),
    });
}
```

```js
// backend/src/modules/integrations/integrations.routes.js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireRole } from "../../middlewares/auth.middleware.js";
import { getIntegrations, patchIntegration } from "./integrations.controller.js";

export const integrationsRouter = Router();

integrationsRouter.use(requireRole(["admin"]));
integrationsRouter.get("/", asyncHandler(getIntegrations));
integrationsRouter.patch("/:key", asyncHandler(patchIntegration));
```

```js
// backend/src/app.js
import { integrationsRouter } from "./modules/integrations/integrations.routes.js";

// Dentro de createApp(), junto das restantes rotas admin:
app.use("/api/admin/integrations", integrationsRouter);
```

```js
// backend/src/server.js
import { ensureIntegrationIndexes } from "./modules/integrations/integrations.service.js";

// ADICIONAR ao bootstrap de índices existente, antes de `server.listen(...)`.
await ensureIntegrationIndexes();
```

5. Explicação do código.

`integrationsRouter.use(requireRole(["admin"]))` aplica a mesma autorização a
todas as rotas do módulo. O bootstrap cria o índice único antes do listener;
se existirem duplicados legacy, o arranque falha de forma visível em vez de
escolher uma linha arbitrária.

6. Validação do passo.

Com sessão admin, `GET /api/admin/integrations` deve devolver uma lista de três integrações.

7. Cenário negativo/erro esperado.

Com utilizador normal, a resposta deve ser `403`.

### Passo 4 - Criar página admin de integrações

1. Objetivo funcional do passo no contexto da app.

Permitir ao administrador ver e alterar configurações públicas de integração.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/src/services/api/integrationsApi.js`
    - CRIAR: `frontend/src/pages/AdminIntegrationsPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZAÇÃO: ficheiros completos e rota nova

3. Instruções do que fazer.

Cria cliente API, página e rota `/admin/integracoes`.

4. Código completo, correto e integrado com a app final.

```js
// frontend/src/services/api/integrationsApi.js
import { apiClient } from "./apiClient.js";

export const integrationsApi = {
    /**
     * Lista integrações configuráveis pelo admin.
     *
     * @returns {Promise<{ integrations: Record<string, unknown>[] }>} Lista de integrações.
     */
    listIntegrations(options = {}) {
        return apiClient.get("/api/admin/integrations", options);
    },

    /**
     * Atualiza uma integração.
     *
     * @param {string} key Chave da integração.
     * @param {{ enabled: boolean, mode: string, publicConfig: Record<string, string> }} input Dados públicos.
     * @returns {Promise<{ integration: Record<string, unknown> }>} Integração atualizada.
     */
    updateIntegration(key, input, options = {}) {
        return apiClient.patch(
            `/api/admin/integrations/${encodeURIComponent(key)}`,
            input,
            options,
        );
    },
};
```

```jsx
// frontend/src/pages/AdminIntegrationsPage.jsx
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { integrationsApi } from "../services/api/integrationsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const MODE_LABELS = {
    internal: "Interno",
    simulation: "Simulação",
    manual: "Manual",
    disabled: "Desativado",
};

/**
 * Página admin para configuração de integrações controladas.
 *
 * @returns {JSX.Element} Painel de integrações.
 */
export function AdminIntegrationsPage() {
    const [integrations, setIntegrations] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [confirming, setConfirming] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busyKeys, setBusyKeys] = useState(() => new Set());
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");
    const [retryVersion, setRetryVersion] = useState(0);
    const requestVersionRef = useRef(0);
    const mutationControllersRef = useRef(new Map());

    useEffect(() => {
        const version = ++requestVersionRef.current;
        const controller = new AbortController();
        setLoading(true);
        setBusyKeys(new Set());
        setError("");
        integrationsApi
            .listIntegrations({ signal: controller.signal })
            .then((response) => {
                if (controller.signal.aborted || version !== requestVersionRef.current) return;
                setIntegrations(response.integrations);
                setDrafts(Object.fromEntries(response.integrations.map((item) => [
                    item.key,
                    { enabled: item.enabled, mode: item.mode, publicConfig: item.publicConfig ?? {} },
                ])));
                setLoading(false);
            })
            .catch((requestError) => {
                if (
                    controller.signal.aborted
                    || requestError?.code === "REQUEST_ABORTED"
                    || requestError?.name === "AbortError"
                ) return;
                if (version !== requestVersionRef.current) return;
                setError(toUserMessage(requestError));
                setLoading(false);
            });

        return () => {
            requestVersionRef.current += 1;
            controller.abort();
            for (const current of mutationControllersRef.current.values()) current.abort();
            mutationControllersRef.current.clear();
        };
    }, [retryVersion]);

    /**
     * Atualiza uma integração no backend.
     *
     * @param {Record<string, unknown>} integration Integração atual.
     * @returns {Promise<void>} Termina quando a integração é atualizada.
     */
    async function updateIntegration(integration) {
        if (mutationControllersRef.current.has(integration.key)) return;
        const draft = drafts[integration.key];
        if (!draft) return;

        const version = requestVersionRef.current;
        const controller = new AbortController();
        mutationControllersRef.current.set(integration.key, controller);
        setBusyKeys((current) => new Set(current).add(integration.key));
        setError("");
        setStatus("");

        try {
            const response = await integrationsApi.updateIntegration(
                integration.key,
                draft,
                { signal: controller.signal },
            );
            if (controller.signal.aborted || version !== requestVersionRef.current) return;
            setIntegrations((current) =>
                current.map((item) =>
                    item.key === integration.key ? response.integration : item,
                ),
            );
            setStatus("Integração atualizada.");
            setDrafts((current) => ({ ...current, [integration.key]: {
                enabled: response.integration.enabled,
                mode: response.integration.mode,
                publicConfig: response.integration.publicConfig ?? {},
            } }));
            setConfirming(null);
        } catch (requestError) {
            if (
                controller.signal.aborted
                || requestError?.code === "REQUEST_ABORTED"
                || requestError?.name === "AbortError"
            ) return;
            if (version !== requestVersionRef.current) return;
            setError(toUserMessage(requestError));
        } finally {
            if (mutationControllersRef.current.get(integration.key) === controller) {
                mutationControllersRef.current.delete(integration.key);
            }
            if (version === requestVersionRef.current) {
                setBusyKeys((current) => {
                    const next = new Set(current);
                    next.delete(integration.key);
                    return next;
                });
            }
        }
    }

    function updateDraft(key, changes) {
        setDrafts((current) => ({ ...current, [key]: { ...current[key], ...changes } }));
    }

    function cancelDraft(integration) {
        setDrafts((current) => ({ ...current, [integration.key]: {
            enabled: integration.enabled,
            mode: integration.mode,
            publicConfig: integration.publicConfig ?? {},
        } }));
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Integrações</h1>
            {loading ? <p>A carregar integrações...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {!loading && error ? <button type="button" onClick={() => setRetryVersion((current) => current + 1)}>Tentar novamente</button> : null}
            {status ? <p role="status">{status}</p> : null}
            <div className="metric-grid">
                {integrations.map((integration) => {
                    const draft = drafts[integration.key] ?? integration;
                    const dirty = draft.enabled !== integration.enabled || draft.mode !== integration.mode;
                    return (
                    <article key={integration.key} aria-busy={busyKeys.has(integration.key)}>
                        <h2>{integration.label}</h2>
                        {dirty ? <span>Alterações por guardar</span> : null}
                        <p>
                            Variáveis:{" "}
                            {integration.requiredEnvVars.length > 0
                                ? integration.requiredEnvVars.join(", ")
                                : "sem variáveis obrigatórias"}
                        </p>
                        <label>
                            <input
                                type="checkbox"
                                checked={draft.enabled}
                                disabled={busyKeys.has(integration.key)}
                                onChange={(event) =>
                                    updateDraft(integration.key, {
                                        enabled: event.target.checked,
                                    })
                                }
                            />
                            Ativa
                        </label>
                        <label>
                            Modo
                            <select
                                value={draft.mode}
                                disabled={busyKeys.has(integration.key)}
                                onChange={(event) =>
                                    updateDraft(integration.key, {
                                        mode: event.target.value,
                                    })
                                }
                            >
                                {Object.entries(MODE_LABELS).map(([mode, label]) => (
                                    <option key={mode} value={mode}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button type="button" disabled={!dirty || busyKeys.has(integration.key)} onClick={() => setConfirming(integration)}>Guardar</button>
                        <button type="button" disabled={!dirty || busyKeys.has(integration.key)} onClick={() => cancelDraft(integration)}>Cancelar</button>
                    </article>
                );})}
            </div>
            <ConfirmDialog
                open={Boolean(confirming)}
                title="Confirmar configuração"
                confirmLabel="Guardar alterações"
                busy={confirming ? busyKeys.has(confirming.key) : false}
                onCancel={() => setConfirming(null)}
                onConfirm={() => updateIntegration(confirming)}
            >
                {confirming ? <p>
                    Estado: {confirming.enabled ? "Ativa" : "Desativada"} → {drafts[confirming.key]?.enabled ? "Ativa" : "Desativada"}; modo: {MODE_LABELS[confirming.mode]} → {MODE_LABELS[drafts[confirming.key]?.mode]}.
                </p> : null}
            </ConfirmDialog>
        </section>
    );
}
```

```jsx
// frontend/src/routes/AppRoutes.jsx
// ADICIONAR uma única vez, junto das restantes declarações lazy.
const AdminIntegrationsPage = lazyNamedPage(
    () => import("../pages/AdminIntegrationsPage.jsx"),
    "AdminIntegrationsPage",
);

// Dentro de <Routes>:
<Route path="/admin/integracoes" element={<AdminIntegrationsPage />} />
```

5. Explicação do código.

A página mantém estado/modo em draft local, sinaliza alterações por guardar e só
envia um PATCH depois de Guardar e confirmar o diff. Cancelar repõe o snapshot
autoritativo. Não há campo para segredo.

6. Validação do passo.

Abre `/admin/integracoes`, altera estado e modo, cancela e confirma zero PATCH.
Repete, guarda, confirma o diff e observa `Integração atualizada.`.

7. Cenário negativo/erro esperado.

Se o backend devolver `403`, a página deve mostrar erro e não deve fingir que guardou.

### Passo 5 - Testar validação de integrações

1. Objetivo funcional do passo no contexto da app.

Provar que chaves e modos fora do contrato são rejeitados.

2. Ficheiros envolvidos:
    - CRIAR: `backend/tests/unit/mf5-integrations.validation.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o teste abaixo.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf5-integrations.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
    assertIntegrationKey,
    assertIntegrationUpdate,
} from "../../src/modules/integrations/integrations.validation.js";

test("MF5 valida integração admin controlada", () => {
    // A chave válida confirma que só integrações da lista fechada podem avançar.
    assert.equal(assertIntegrationKey("internal_notifications"), "internal_notifications");

    // A atualização válida mostra que apenas configuração pública entra no contrato.
    assert.deepEqual(
        assertIntegrationUpdate(
            "internal_notifications",
            {
                enabled: true,
                mode: "internal",
                publicConfig: { channel: "in_app" },
            },
        ),
        {
            enabled: true,
            mode: "internal",
            publicConfig: { channel: "in_app" },
        },
    );

    // Os negativos impedem fornecedores reais ou modos fora do MVP.
    assert.throws(() => assertIntegrationKey("provider_real"), /Integração/);
    assert.throws(
        () => assertIntegrationUpdate(
            "internal_notifications",
            { enabled: true, mode: "real" },
        ),
        /Modo/,
    );
    assert.throws(
        () => assertIntegrationUpdate(
            "internal_notifications",
            { enabled: "true", mode: "internal" },
        ),
        /verdadeiro ou falso/,
    );

    // A allowlist é diferente por integração; pagamentos não aceitam `channel`.
    assert.throws(
        () => assertIntegrationUpdate(
            "simulated_payments",
            {
                enabled: true,
                mode: "simulation",
                publicConfig: { channel: "in_app" },
            },
        ),
        /não permitido/i,
    );

    // Segredos, control characters e URLs com userinfo falham antes do service.
    for (const publicConfig of [
        { credential: "x" },
        { authorization: "Basic abc" },
        { private_key: "x" },
        { "channel\n": "in_app" },
        { channel: "in_app\u0000" },
        { channel: "Bearer segredo" },
        { channel: "https://user:password@example.test" },
    ]) {
        assert.throws(
            () => assertIntegrationUpdate(
                "internal_notifications",
                { enabled: true, mode: "internal", publicConfig },
            ),
            /configuração pública|valor público/i,
        );
    }
    assert.throws(
        () => assertIntegrationUpdate(
            "internal_notifications",
            {
                enabled: true,
                mode: "internal",
                publicConfig: { region: "eu" },
            },
        ),
        /não permitido/i,
    );
    assert.throws(
        () => assertIntegrationUpdate(
            "internal_notifications",
            {
                enabled: true,
                mode: "internal",
                publicConfig: { channel: 123 },
            },
        ),
        /configuração pública/i,
    );
    assert.throws(
        () => assertIntegrationUpdate(
            "internal_notifications",
            {
                enabled: true,
                mode: "internal",
                publicConfig: Object.fromEntries(
                    Array.from({ length: 21 }, (_, index) => [`field_${index}`, "x"]),
                ),
            },
        ),
        /20 chaves/i,
    );
    assert.throws(
        () => assertIntegrationUpdate(
            "internal_notifications",
            {
                enabled: true,
                mode: "internal",
                publicConfig: { channel: "x".repeat(501) },
            },
        ),
        /configuração pública/i,
    );
});
```

5. Explicação do código.

O teste confirma chave/modo fechados, allowlist específica por integração,
tipos, cardinalidade e tamanho. Os negativos cobrem também os nomes
`credential`, `authorization`, `private_key`, control characters, material
Bearer e URL com userinfo antes de qualquer persistência.

6. Validação do passo.

Executa:

```bash
cd backend
node --test tests/unit/mf5-integrations.validation.test.js
```

O resultado esperado é `pass`.

7. Cenário negativo/erro esperado.

Uma integração desconhecida deve falhar com `404`. Um modo desconhecido deve falhar com `400`.

#### Critérios de aceite

- `GET /api/admin/integrations` existe e exige admin.
- `PATCH /api/admin/integrations/:key` existe e exige admin.
- Só chaves de `INTEGRATION_DEFINITIONS` são aceites.
- Só modos de `INTEGRATION_MODES` são aceites.
- `publicConfig` é projetado pela allowlist da integração; nesta baseline só
  `internal_notifications.channel=in_app` aceita valor.
- `integration_settings_key_unique` garante um documento por key e é criado no
  bootstrap antes do listener.
- Upserts concorrentes nunca deixam duplicados; o perdedor da corrida repete
  uma vez como update sem `upsert` ou devolve conflito seguro.
- O `$set` recebe apenas o DTO validado e nunca persiste input bruto ou segredo.
- Alteração e evento `integration.update` partilham a mesma transação/sessão;
  fault injection no audit deixa zero configuração parcial.
- A página `/admin/integracoes` mostra loading, erro, sucesso e lista de integrações.
- Alterações ficam em draft com `Alterações por guardar`; Cancelar repõe o
  snapshot sem PATCH e Guardar confirma o diff. Duplo clique produz um pedido por linha;
  unmount aborta leituras/mutações sem aplicar resposta tardia.
- `enabled` textual, campo fora da allowlist, mais de 20 campos, valor acima de
  500 caracteres, `credential|authorization|private_key`, controlo, Bearer ou URL
  com userinfo em `publicConfig` devolve `400`.
- A UI não pede nem guarda segredos.
- `BK-MF6-01` e `BK-MF6-02` ficam com endpoints claros para regressão.

#### Validação final

Executa:

```bash
cd backend
node --test tests/unit/mf5-integrations.validation.test.js
node -e "Promise.all([import('./src/modules/integrations/integrations.routes.js'), import('./src/modules/integrations/integrations.service.js')]).then(([routes, service]) => console.log(typeof routes.integrationsRouter, typeof service.ensureIntegrationIndexes))"
```

Depois valida no browser:

- admin abre `/admin/integracoes`;
- alterna uma integração;
- cancela uma alteração e confirma zero PATCH; guarda outra e confirma um PATCH;
- utilizador sem admin recebe erro;
- chave inexistente em `PATCH` devolve `404`.

#### Evidence para PR/defesa

- `pr`: referência do commit ou PR.
- `proof`: output do teste de validação.
- `proof`: captura de `/admin/integracoes`.
- `neg`: utilizador sem admin recebe `403`.
- `neg`: chave desconhecida devolve `404`.
- `neg`: modo desconhecido devolve `400`.
- `neg`: segredo/control/userinfo e campo válido noutra integração devolvem `400`.
- `neg`: fault injection do audit reverte a configuração; corrida de primeiro
  upsert deixa uma única row por key.

#### Handoff

`BK-MF6-01` deve incluir regressão backend para o índice único, a corrida de
upsert e `/api/admin/integrations`. `BK-MF6-02` cobre cancelamento/busy em
`/admin/integracoes`. `BK-MF6-03` injeta `credential`, `authorization`,
`private_key`, control characters e URL com userinfo e confirma zero persistência.

#### Changelog

- `2026-07-12`: edição imediata substituída por draft local, Guardar/Cancelar e
  confirmação do diff antes do único PATCH.

- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com integrações controladas, auditoria, frontend e handoff para MF6.
- `2026-07-10`: paths públicos normalizados e painel sincronizado com
  confirmação, abort/anti-stale, busy por linha, PT-PT e limites de config pública.
- `2026-07-10`: validação copiável consolidada com tipos/enums fechados e
  deteção de segredos; update e audit preservam a mesma transação/sessão e
  snapshots mínimos.
- `2026-07-10`: allowlist passou a ser específica por integração; índice único,
  retry concorrente e negativos de credential/control/userinfo ficaram
  explícitos no tutorial ativo.
