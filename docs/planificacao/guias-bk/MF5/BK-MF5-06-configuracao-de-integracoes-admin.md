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
- `sprint`: `S10`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF6-01`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-06-configuracao-de-integracoes-admin.md`
- `last_updated`: `2026-06-16`

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
- Registar alterações em `admin_audit_logs`.
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

#### Pre-requisitos

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

Na segurança, alterações exigem admin e ficam em `admin_audit_logs`. Segredos são referenciados apenas por nomes de variáveis de ambiente, sem valor.

#### Arquitetura do BK

| Camada | Contrato |
| --- | --- |
| Backend routes | `GET /api/admin/integrations`, `PATCH /api/admin/integrations/:key` |
| Autorização | `requireRole(["admin"])` |
| Validator | `assertIntegrationKey(key)`, `assertIntegrationUpdate(input)` |
| Service | `listIntegrationSettings()`, `updateIntegrationSetting(actorUserId, key, input)` |
| Coleção | `integration_settings` |
| Auditoria | `admin_audit_logs` |
| Frontend API | `integrationsApi` |
| Página | `AdminIntegrationsPage` |
| Handoff | `BK-MF6-01` e `BK-MF6-02` usam estes endpoints na regressão |

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/backend/src/modules/integrations/integrations.validation.js`
- CRIAR: `real_dev/backend/src/modules/integrations/integrations.service.js`
- CRIAR: `real_dev/backend/src/modules/integrations/integrations.controller.js`
- CRIAR: `real_dev/backend/src/modules/integrations/integrations.routes.js`
- EDITAR: `real_dev/backend/src/app.js`
- CRIAR: `real_dev/frontend/src/services/api/integrationsApi.js`
- CRIAR: `real_dev/frontend/src/pages/AdminIntegrationsPage.jsx`
- EDITAR: `real_dev/frontend/src/routes/AppRoutes.jsx`
- CRIAR: `real_dev/backend/tests/unit/mf5-integrations.validation.test.js`
- REVER: `RF60`, `RNF17`, `RNF19`, `BK-MF5-04`, `BK-MF6-01`, `BK-MF6-02`

#### Tutorial técnico linear

### Passo 1 - Definir contrato fechado de integrações

1. Objetivo funcional do passo no contexto da app.

Criar uma lista fechada de integrações e validar alterações.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/backend/src/modules/integrations/integrations.validation.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `integrations` e adiciona o validator.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/src/modules/integrations/integrations.validation.js
import { HttpError } from "../../utils/http-error.js";

export const INTEGRATION_DEFINITIONS = {
    internal_notifications: {
        label: "Notificações internas",
        envVars: [],
        defaultMode: "internal",
    },
    simulated_payments: {
        label: "Pagamentos simulados",
        envVars: ["PAYMENT_SIMULATION_MODE"],
        defaultMode: "simulation",
    },
    aggregate_analytics_export: {
        label: "Exportação analítica agregada",
        envVars: ["ANALYTICS_EXPORT_PATH"],
        defaultMode: "manual",
    },
};

export const INTEGRATION_MODES = ["internal", "simulation", "manual", "disabled"];

/**
 * Valida a chave de integração recebida por parâmetro.
 *
 * @param {string} key Chave da integração.
 * @returns {keyof typeof INTEGRATION_DEFINITIONS} Chave validada.
 * @throws {HttpError} Quando a chave não existe.
 */
export function assertIntegrationKey(key) {
    const value = String(key ?? "").trim();

    if (!Object.hasOwn(INTEGRATION_DEFINITIONS, value)) {
        throw new HttpError(404, "Integração não encontrada.");
    }

    return value;
}

/**
 * Valida configuração pública de uma integração.
 *
 * @param {unknown} value Valor recebido.
 * @returns {Record<string, string>} Configuração pública validada.
 */
function assertPublicConfig(value) {
    if (value === undefined) return {};

    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new HttpError(400, "Configuração pública inválida.");
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, raw]) => [
            String(key).trim(),
            String(raw ?? "").trim(),
        ]),
    );
}

/**
 * Valida atualização administrativa de uma integração.
 *
 * @param {{ enabled?: unknown, mode?: unknown, publicConfig?: unknown }} input Dados recebidos.
 * @returns {{ enabled: boolean, mode: string, publicConfig: Record<string, string> }} Atualização segura.
 */
export function assertIntegrationUpdate(input) {
    if (typeof input?.enabled !== "boolean") {
        throw new HttpError(400, "enabled deve ser verdadeiro ou falso.");
    }

    const mode = String(input?.mode ?? "").trim();

    if (!INTEGRATION_MODES.includes(mode)) {
        throw new HttpError(400, "Modo de integração inválido.");
    }

    return {
        enabled: input.enabled,
        mode,
        publicConfig: assertPublicConfig(input.publicConfig),
    };
}
```

5. Explicação do código.

A lista fechada impede que o frontend invente integrações. `envVars` mostra nomes de variáveis necessárias sem guardar valores. `publicConfig` aceita apenas strings, adequadas para configurações não secretas.

6. Validação do passo.

Executa:

```bash
cd real_dev/backend
node -e "import('./src/modules/integrations/integrations.validation.js').then(({ assertIntegrationKey }) => console.log(assertIntegrationKey('simulated_payments')))"
```

O resultado esperado é `simulated_payments`.

7. Cenário negativo/erro esperado.

`assertIntegrationKey("provider_real")` deve devolver `404`. Este BK não permite integrações fora do contrato.

### Passo 2 - Criar service de configurações

1. Objetivo funcional do passo no contexto da app.

Listar e alterar configurações de integração com auditoria.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/backend/src/modules/integrations/integrations.service.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o service abaixo.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/src/modules/integrations/integrations.service.js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import {
    assertIntegrationKey,
    assertIntegrationUpdate,
    INTEGRATION_DEFINITIONS,
} from "./integrations.validation.js";

/**
 * Converte id de admin em ObjectId para auditoria.
 *
 * @param {string} userId Id vindo da sessão.
 * @returns {ObjectId} Id MongoDB.
 */
function asUserObjectId(userId) {
    if (!ObjectId.isValid(userId)) {
        throw new HttpError(400, "Administrador inválido.");
    }

    return new ObjectId(userId);
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

    return {
        key,
        label: definition.label,
        requiredEnvVars: definition.envVars,
        enabled: stored?.enabled ?? false,
        mode: stored?.mode ?? definition.defaultMode,
        publicConfig: stored?.publicConfig ?? {},
        updatedAt: stored?.updatedAt?.toISOString?.() ?? null,
    };
}

/**
 * Lista todas as integrações conhecidas com configuração atual.
 *
 * @returns {Promise<Record<string, unknown>[]>} Lista pública para admin.
 */
export async function listIntegrationSettings() {
    const db = await getDb();
    const storedRows = await db.collection("integration_settings").find({}).toArray();
    const storedByKey = new Map(storedRows.map((row) => [row.key, row]));

    return Object.keys(INTEGRATION_DEFINITIONS).map((key) =>
        toPublicIntegration(key, storedByKey.get(key) ?? null),
    );
}

/**
 * Atualiza uma integração e regista auditoria.
 *
 * @param {string} actorUserId Id do administrador autenticado.
 * @param {string} key Chave da integração.
 * @param {{ enabled?: unknown, mode?: unknown, publicConfig?: unknown }} input Dados recebidos.
 * @returns {Promise<Record<string, unknown>>} Integração atualizada.
 */
export async function updateIntegrationSetting(actorUserId, key, input) {
    const integrationKey = assertIntegrationKey(key);
    const update = assertIntegrationUpdate(input);
    const db = await getDb();
    const actorObjectId = asUserObjectId(actorUserId);
    const now = new Date();

    const stored = await db.collection("integration_settings").findOneAndUpdate(
        { key: integrationKey },
        {
            $set: {
                ...update,
                updatedAt: now,
                updatedBy: actorObjectId,
            },
            $setOnInsert: {
                key: integrationKey,
                createdAt: now,
            },
        },
        { upsert: true, returnDocument: "after" },
    );

    await db.collection("admin_audit_logs").insertOne({
        actorUserId: actorObjectId,
        target: integrationKey,
        action: "integration_update",
        changes: update,
        createdAt: now,
    });

    return toPublicIntegration(integrationKey, stored);
}
```

5. Explicação do código.

`listIntegrationSettings` devolve todas as integrações conhecidas, mesmo que ainda não estejam guardadas. `updateIntegrationSetting` valida chave, valida dados, grava configuração pública e regista auditoria. Nenhum valor secreto é recebido ou persistido.

6. Validação do passo.

Executa:

```bash
cd real_dev/backend
node -e "import('./src/modules/integrations/integrations.service.js').then(({ listIntegrationSettings }) => console.log(typeof listIntegrationSettings))"
```

O resultado esperado é `function`.

7. Cenário negativo/erro esperado.

Se o frontend enviar uma chave desconhecida, o service devolve `404`. Isto evita drift de integrações.

### Passo 3 - Criar controller, rotas e montagem

1. Objetivo funcional do passo no contexto da app.

Expor configuração de integrações apenas para administradores.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/backend/src/modules/integrations/integrations.controller.js`
    - CRIAR: `real_dev/backend/src/modules/integrations/integrations.routes.js`
    - EDITAR: `real_dev/backend/src/app.js`
    - LOCALIZAÇÃO: ficheiros completos e montagem de rota

3. Instruções do que fazer.

Cria controller/route e monta em `/api/admin/integrations`.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/src/modules/integrations/integrations.controller.js
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
        ),
    });
}
```

```js
// real_dev/backend/src/modules/integrations/integrations.routes.js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireRole } from "../auth/auth.middleware.js";
import { getIntegrations, patchIntegration } from "./integrations.controller.js";

export const integrationsRouter = Router();

integrationsRouter.use(requireRole(["admin"]));
integrationsRouter.get("/", asyncHandler(getIntegrations));
integrationsRouter.patch("/:key", asyncHandler(patchIntegration));
```

```js
// real_dev/backend/src/app.js
import { integrationsRouter } from "./modules/integrations/integrations.routes.js";

// Dentro de createApp(), junto das restantes rotas admin:
app.use("/api/admin/integrations", integrationsRouter);
```

5. Explicação do código.

`integrationsRouter.use(requireRole(["admin"]))` aplica a mesma autorização a todas as rotas do módulo. Isto reduz repetição e evita esquecer proteção numa rota futura.

6. Validação do passo.

Com sessão admin, `GET /api/admin/integrations` deve devolver uma lista de três integrações.

7. Cenário negativo/erro esperado.

Com utilizador normal, a resposta deve ser `403`.

### Passo 4 - Criar página admin de integrações

1. Objetivo funcional do passo no contexto da app.

Permitir ao administrador ver e alterar configurações públicas de integração.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/frontend/src/services/api/integrationsApi.js`
    - CRIAR: `real_dev/frontend/src/pages/AdminIntegrationsPage.jsx`
    - EDITAR: `real_dev/frontend/src/routes/AppRoutes.jsx`
    - LOCALIZAÇÃO: ficheiros completos e rota nova

3. Instruções do que fazer.

Cria cliente API, página e rota `/admin/integracoes`.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/frontend/src/services/api/integrationsApi.js
import { apiClient } from "./apiClient.js";

export const integrationsApi = {
    /**
     * Lista integrações configuráveis pelo admin.
     *
     * @returns {Promise<{ integrations: Record<string, unknown>[] }>} Lista de integrações.
     */
    listIntegrations() {
        return apiClient.get("/api/admin/integrations");
    },

    /**
     * Atualiza uma integração.
     *
     * @param {string} key Chave da integração.
     * @param {{ enabled: boolean, mode: string, publicConfig: Record<string, string> }} input Dados públicos.
     * @returns {Promise<{ integration: Record<string, unknown> }>} Integração atualizada.
     */
    updateIntegration(key, input) {
        return apiClient.patch(
            `/api/admin/integrations/${encodeURIComponent(key)}`,
            input,
        );
    },
};
```

```jsx
// real_dev/frontend/src/pages/AdminIntegrationsPage.jsx
import { useEffect, useState } from "react";
import { integrationsApi } from "../services/api/integrationsApi.js";

const MODES = ["internal", "simulation", "manual", "disabled"];

/**
 * Página admin para configuração de integrações controladas.
 *
 * @returns {JSX.Element} Painel de integrações.
 */
export function AdminIntegrationsPage() {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        integrationsApi
            .listIntegrations()
            .then((response) => setIntegrations(response.integrations))
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Atualiza uma integração no backend.
     *
     * @param {Record<string, unknown>} integration Integração atual.
     * @param {Record<string, unknown>} changes Alterações locais.
     * @returns {Promise<void>} Termina quando a integração é atualizada.
     */
    async function updateIntegration(integration, changes) {
        setSavingKey(integration.key);
        setError("");
        setStatus("");

        try {
            const response = await integrationsApi.updateIntegration(
                integration.key,
                {
                    enabled: integration.enabled,
                    mode: integration.mode,
                    publicConfig: integration.publicConfig ?? {},
                    ...changes,
                },
            );
            setIntegrations((current) =>
                current.map((item) =>
                    item.key === integration.key ? response.integration : item,
                ),
            );
            setStatus("Integração atualizada.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSavingKey("");
        }
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Integrações</h1>
            {loading ? <p>A carregar integrações...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <div className="metric-grid">
                {integrations.map((integration) => (
                    <article key={integration.key}>
                        <h2>{integration.label}</h2>
                        <p>Chave: {integration.key}</p>
                        <p>
                            Variáveis:{" "}
                            {integration.requiredEnvVars.length > 0
                                ? integration.requiredEnvVars.join(", ")
                                : "sem variáveis obrigatórias"}
                        </p>
                        <label>
                            <input
                                type="checkbox"
                                checked={integration.enabled}
                                disabled={savingKey === integration.key}
                                onChange={(event) =>
                                    updateIntegration(integration, {
                                        enabled: event.target.checked,
                                    })
                                }
                            />
                            Ativa
                        </label>
                        <label>
                            Modo
                            <select
                                value={integration.mode}
                                disabled={savingKey === integration.key}
                                onChange={(event) =>
                                    updateIntegration(integration, {
                                        mode: event.target.value,
                                    })
                                }
                            >
                                {MODES.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {mode}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </article>
                ))}
            </div>
        </section>
    );
}
```

```jsx
// real_dev/frontend/src/routes/AppRoutes.jsx
import { AdminIntegrationsPage } from "../pages/AdminIntegrationsPage.jsx";

// Dentro de <Routes>:
<Route path="/admin/integracoes" element={<AdminIntegrationsPage />} />
```

5. Explicação do código.

A página mostra label, chave, variáveis necessárias e controles de estado/modo. Não há campo para segredo. O admin vê nomes de variáveis, mas os valores ficam fora da aplicação.

6. Validação do passo.

Abre `/admin/integracoes` como admin e alterna uma integração. A página deve mostrar `Integração atualizada.`.

7. Cenário negativo/erro esperado.

Se o backend devolver `403`, a página deve mostrar erro e não deve fingir que guardou.

### Passo 5 - Testar validação de integrações

1. Objetivo funcional do passo no contexto da app.

Provar que chaves e modos fora do contrato são rejeitados.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/backend/tests/unit/mf5-integrations.validation.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o teste abaixo.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/tests/unit/mf5-integrations.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
    assertIntegrationKey,
    assertIntegrationUpdate,
} from "../../src/modules/integrations/integrations.validation.js";

test("MF5 valida integração admin controlada", () => {
    assert.equal(assertIntegrationKey("internal_notifications"), "internal_notifications");
    assert.deepEqual(
        assertIntegrationUpdate({
            enabled: true,
            mode: "internal",
            publicConfig: { channel: "in_app" },
        }),
        {
            enabled: true,
            mode: "internal",
            publicConfig: { channel: "in_app" },
        },
    );

    assert.throws(() => assertIntegrationKey("provider_real"), /Integração/);
    assert.throws(
        () => assertIntegrationUpdate({ enabled: true, mode: "real" }),
        /Modo/,
    );
});
```

5. Explicação do código.

O teste confirma que apenas chaves conhecidas e modos fechados entram no sistema. Isto impede promessas técnicas fora do MVP.

6. Validação do passo.

Executa:

```bash
cd real_dev/backend
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
- A base de dados guarda apenas configuração pública.
- Alterações ficam em `admin_audit_logs`.
- A página `/admin/integracoes` mostra loading, erro, sucesso e lista de integrações.
- A UI não pede nem guarda segredos.
- `BK-MF6-01` e `BK-MF6-02` ficam com endpoints claros para regressão.

#### Validação final

Executa:

```bash
cd real_dev/backend
node --test tests/unit/mf5-integrations.validation.test.js
node -e "import('./src/modules/integrations/integrations.routes.js').then(({ integrationsRouter }) => console.log(typeof integrationsRouter))"
```

Depois valida no browser:

- admin abre `/admin/integracoes`;
- alterna uma integração;
- utilizador sem admin recebe erro;
- chave inexistente em `PATCH` devolve `404`.

#### Evidence para PR/defesa

- `pr`: referência do commit ou PR.
- `proof`: output do teste de validação.
- `proof`: captura de `/admin/integracoes`.
- `neg`: utilizador sem admin recebe `403`.
- `neg`: chave desconhecida devolve `404`.
- `neg`: modo desconhecido devolve `400`.

#### Handoff

`BK-MF6-01` deve incluir regressão backend para `/api/admin/integrations` e `/api/admin/metrics`. `BK-MF6-02` deve incluir regressão frontend para `/admin/integracoes` e `/admin/metricas`. `BK-MF6-03` deve rever se nenhuma configuração guarda segredos.

#### Changelog

- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com integrações controladas, auditoria, frontend e handoff para MF6.
