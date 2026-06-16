# BK-MF5-03 - Gestão de consentimentos

## Header

- `doc_id`: `GUIA-BK-MF5-03`
- `bk_id`: `BK-MF5-03`
- `macro`: `MF5`
- `owner`: `Mateus`
- `apoio`: `Matheus`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-01`
- `rf_rnf`: `RF57`
- `fase_documental`: `Fase 1`
- `sprint`: `S09`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-04`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-03-gestao-consentimentos.md`
- `last_updated`: `2026-06-16`

#### Objetivo

Neste BK vais implementar gestão de consentimentos para o utilizador autenticado. O utilizador deve conseguir ver escolhas atuais, alterar consentimentos opcionais e deixar um histórico técnico auditável da alteração.

`CANONICO`: este BK cobre `RF57 - Consentimentos` e depende de `BK-MF2-01`.

`DERIVADO`: como a documentação não define categorias de consentimento, este guia usa três categorias opcionais alinhadas com a app: recomendações personalizadas, notificações operacionais e métricas anónimas.

#### Importância

Consentimentos tornam explícito o que o utilizador aceita. Isto é importante para privacidade, confiança e defesa da PAP, porque mostra que a aplicação separa funcionamento essencial de escolhas opcionais.

Este BK também prepara `MF6`: hardening e regressão precisam de provar que as escolhas ficam persistidas, que o frontend não inventa estado local definitivo e que alterações são feitas pelo próprio utilizador autenticado.

#### Scope-in

- Criar categorias de consentimento opcionais.
- Criar endpoints autenticados `GET /api/privacy/consents` e `PUT /api/privacy/consents`.
- Guardar estado atual em `user_consents`.
- Guardar histórico em `user_consent_events`.
- Criar UI de consentimentos em `/conta`.
- Validar que apenas booleanos são aceites.

#### Scope-out

- Painel admin para forçar consentimentos.
- Textos legais definitivos.
- Integração com fornecedores externos.
- Bloqueio automático de recomendações, que pode ser usado por BKs futuros de hardening.
- Eliminação de conta, já tratada em `BK-MF5-02`.

#### Estado antes e depois

Antes deste BK, a aplicação tem autenticação e conta, mas não tem consentimentos persistidos. Preferências de notificações existem na MF4, mas são preferências funcionais, não prova de consentimento versionado.

Depois deste BK, cada utilizador tem um documento de consentimentos atuais e um histórico de eventos. A UI mostra opções claras e guarda alterações pelo endpoint autenticado.

#### Pre-requisitos

- `BK-MF2-01` criou autenticação.
- `BK-MF5-01` criou o módulo `privacy`.
- `BK-MF5-02` definiu que contas eliminadas ficam com `accountStatus: "deleted"`.
- `BK-MF3-05` e `BK-MF3-06` criaram recomendação e explicabilidade.
- `BK-MF4-08` criou notificações e preferências funcionais.

#### Glossário

- Consentimento: escolha explícita do utilizador sobre uso opcional de dados.
- Categoria: área concreta da aplicação que precisa de escolha.
- Versionamento: identificação da versão do contrato de consentimento.
- Histórico de consentimento: registo das mudanças para evidence.
- Estado atual: última escolha válida guardada em `user_consents`.

#### Conceitos teóricos essenciais

No domínio FaithFlix, consentimentos opcionais ajudam a governar recomendação personalizada, notificações operacionais e métricas anónimas. A aplicação continua a precisar de dados essenciais para autenticação e segurança, mas esses dados não são tratados como opção livre neste BK.

No backend, o validator aceita apenas booleanos. O service cria o documento se ainda não existir e grava um evento sempre que o utilizador altera escolhas.

No frontend, a página da conta mostra switches simples, estados de loading, erro e sucesso. A UI envia apenas as escolhas, nunca `userId`.

Na segurança e privacidade, cada consulta usa `req.user.id`. O histórico não guarda IP, cookie ou dados sensíveis; guarda apenas o tipo de alteração e a versão.

#### Arquitetura do BK

| Camada | Contrato |
| --- | --- |
| Validator | `assertConsentPayload(input)` |
| Backend routes | `GET /api/privacy/consents`, `PUT /api/privacy/consents` |
| Coleções | `user_consents`, `user_consent_events` |
| Service | `getMyConsents(userId)`, `updateMyConsents(userId, input)` |
| Frontend API | `privacyApi.getMyConsents()`, `privacyApi.updateMyConsents(input)` |
| UI | `PrivacyConsentsPanel` |
| Handoff | `BK-MF5-04` separa self-service de administração |

#### Ficheiros a criar/editar/rever

- EDITAR: `real_dev/backend/src/modules/privacy/privacy.validation.js`
- EDITAR: `real_dev/backend/src/modules/privacy/privacy.service.js`
- EDITAR: `real_dev/backend/src/modules/privacy/privacy.controller.js`
- EDITAR: `real_dev/backend/src/modules/privacy/privacy.routes.js`
- EDITAR: `real_dev/frontend/src/services/api/privacyApi.js`
- CRIAR: `real_dev/frontend/src/components/privacy/PrivacyConsentsPanel.jsx`
- EDITAR: `real_dev/frontend/src/pages/AccountPage.jsx`
- CRIAR: `real_dev/backend/tests/unit/mf5-privacy-consents.validation.test.js`
- REVER: `RF57`, `RNF15`, `RNF17`, `RNF37`, `BK-MF3-05`, `BK-MF4-08`

#### Tutorial técnico linear

### Passo 1 - Validar categorias de consentimento

1. Objetivo funcional do passo no contexto da app.

Definir o contrato de consentimentos aceites pelo backend.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/backend/src/modules/privacy/privacy.validation.js`
    - LOCALIZAÇÃO: acrescentar constantes e função no fim do ficheiro

3. Instruções do que fazer.

Mantém a validação de eliminação criada no BK anterior e acrescenta o contrato abaixo.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/src/modules/privacy/privacy.validation.js
export const CONSENT_VERSION = "faithflix-privacy-v1";

export const DEFAULT_CONSENTS = {
    personalizedRecommendations: false,
    operationalNotifications: true,
    anonymousMetrics: false,
};

/**
 * Valida uma opção booleana de consentimento.
 *
 * @param {Record<string, unknown>} input Dados recebidos.
 * @param {string} key Nome da categoria.
 * @returns {boolean} Valor booleano validado.
 * @throws {HttpError} Quando o valor não é booleano.
 */
function assertConsentBoolean(input, key) {
    if (typeof input?.[key] !== "boolean") {
        throw new HttpError(400, `${key} deve ser verdadeiro ou falso.`);
    }

    return input[key];
}

/**
 * Valida as escolhas opcionais de consentimento.
 *
 * @param {Record<string, unknown>} input Dados recebidos do frontend.
 * @returns {{ personalizedRecommendations: boolean, operationalNotifications: boolean, anonymousMetrics: boolean }} Consentimentos persistíveis.
 */
export function assertConsentPayload(input) {
    return {
        personalizedRecommendations: assertConsentBoolean(
            input,
            "personalizedRecommendations",
        ),
        operationalNotifications: assertConsentBoolean(
            input,
            "operationalNotifications",
        ),
        anonymousMetrics: assertConsentBoolean(input, "anonymousMetrics"),
    };
}
```

5. Explicação do código.

`DEFAULT_CONSENTS` define valores iniciais. As recomendações personalizadas e métricas anónimas começam desligadas por prudência. Notificações operacionais começam ligadas porque a MF4 já as usa para eventos importantes da conta, mas o utilizador pode desligá-las aqui.

6. Validação do passo.

Executa:

```bash
cd real_dev/backend
node -e "import('./src/modules/privacy/privacy.validation.js').then(({ assertConsentPayload }) => console.log(assertConsentPayload({ personalizedRecommendations: true, operationalNotifications: true, anonymousMetrics: false }).anonymousMetrics))"
```

O resultado esperado é `false`.

7. Cenário negativo/erro esperado.

Se `anonymousMetrics` vier como `"sim"`, o backend devolve `400`. Isto evita guardar texto ambíguo como consentimento.

### Passo 2 - Criar service de leitura e atualização

1. Objetivo funcional do passo no contexto da app.

Persistir consentimentos atuais e histórico de alterações por utilizador.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/backend/src/modules/privacy/privacy.service.js`
    - LOCALIZAÇÃO: imports e funções novas no fim do ficheiro

3. Instruções do que fazer.

Importa `assertConsentPayload`, `CONSENT_VERSION` e `DEFAULT_CONSENTS`. Acrescenta as funções abaixo.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/src/modules/privacy/privacy.service.js
import {
    assertConsentPayload,
    CONSENT_VERSION,
    DEFAULT_CONSENTS,
} from "./privacy.validation.js";

/**
 * Constrói o documento público de consentimentos.
 *
 * @param {Record<string, unknown> | null} document Documento persistido.
 * @returns {{ version: string, consents: typeof DEFAULT_CONSENTS, updatedAt: string | null }} Estado visível.
 */
function toPublicConsents(document) {
    return {
        version: document?.version ?? CONSENT_VERSION,
        consents: {
            ...DEFAULT_CONSENTS,
            ...(document?.consents ?? {}),
        },
        updatedAt: document?.updatedAt?.toISOString?.() ?? null,
    };
}

/**
 * Lê consentimentos atuais do utilizador autenticado.
 *
 * @param {string} userId Id do utilizador obtido pela sessão.
 * @returns {Promise<ReturnType<typeof toPublicConsents>>} Estado atual.
 */
export async function getMyConsents(userId) {
    const db = await getDb();
    const userObjectId = asUserObjectId(userId);
    const document = await db
        .collection("user_consents")
        .findOne({ userId: userObjectId });

    return toPublicConsents(document);
}

/**
 * Atualiza consentimentos atuais e cria evento histórico.
 *
 * @param {string} userId Id do utilizador obtido pela sessão.
 * @param {Record<string, unknown>} input Dados recebidos do frontend.
 * @returns {Promise<ReturnType<typeof toPublicConsents>>} Estado atualizado.
 */
export async function updateMyConsents(userId, input) {
    const consents = assertConsentPayload(input);
    const db = await getDb();
    const userObjectId = asUserObjectId(userId);
    const now = new Date();

    await db.collection("user_consents").updateOne(
        { userId: userObjectId },
        {
            $set: {
                consents,
                version: CONSENT_VERSION,
                updatedAt: now,
            },
            $setOnInsert: {
                userId: userObjectId,
                createdAt: now,
            },
        },
        { upsert: true },
    );

    await db.collection("user_consent_events").insertOne({
        userId: userObjectId,
        consents,
        version: CONSENT_VERSION,
        createdAt: now,
        source: "account_page",
    });

    return getMyConsents(userId);
}
```

5. Explicação do código.

`getMyConsents` devolve defaults quando ainda não existe documento. `updateMyConsents` faz upsert do estado atual e insere um evento histórico. A origem `account_page` indica que a alteração veio da área de conta.

6. Validação do passo.

Executa:

```bash
cd real_dev/backend
node -e "import('./src/modules/privacy/privacy.service.js').then(({ getMyConsents, updateMyConsents }) => console.log(typeof getMyConsents, typeof updateMyConsents))"
```

O resultado esperado é `function function`.

7. Cenário negativo/erro esperado.

Se a função atualizasse só o estado atual e não criasse evento, a equipa não teria prova de alteração ao longo do tempo. O histórico evita esse buraco de evidence.

### Passo 3 - Expor endpoints de consentimento

1. Objetivo funcional do passo no contexto da app.

Disponibilizar leitura e atualização de consentimentos via API autenticada.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/backend/src/modules/privacy/privacy.controller.js`
    - EDITAR: `real_dev/backend/src/modules/privacy/privacy.routes.js`
    - LOCALIZAÇÃO: imports, funções e rotas novas

3. Instruções do que fazer.

Adiciona os controllers e as rotas `GET /consents` e `PUT /consents`.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/src/modules/privacy/privacy.controller.js
import { getMyConsents, updateMyConsents } from "./privacy.service.js";

/**
 * Devolve os consentimentos atuais do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Consentimentos atuais.
 */
export async function getMyConsentsController(req, res) {
    return res.status(200).json({
        consentState: await getMyConsents(req.user.id),
    });
}

/**
 * Atualiza os consentimentos do utilizador autenticado.
 *
 * @param {import("express").Request & { user: { id: string } }} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Consentimentos atualizados.
 */
export async function putMyConsentsController(req, res) {
    return res.status(200).json({
        consentState: await updateMyConsents(req.user.id, req.body),
    });
}
```

```js
// real_dev/backend/src/modules/privacy/privacy.routes.js
import {
    getMyConsentsController,
    putMyConsentsController,
} from "./privacy.controller.js";

privacyRouter.get(
    "/consents",
    requireAuth,
    asyncHandler(getMyConsentsController),
);
privacyRouter.put(
    "/consents",
    requireAuth,
    asyncHandler(putMyConsentsController),
);
```

5. Explicação do código.

As duas rotas usam `requireAuth`, logo o backend sabe que conta está a alterar. `PUT` é adequado porque substitui o conjunto de escolhas opcionais pelo estado enviado.

6. Validação do passo.

Com sessão ativa, chama `GET /api/privacy/consents`. Deves receber `consentState` com `version`, `consents` e `updatedAt`.

7. Cenário negativo/erro esperado.

Com um campo em falta no `PUT`, o backend devolve `400`. Isto impede estados incompletos.

### Passo 4 - Criar painel de consentimentos no frontend

1. Objetivo funcional do passo no contexto da app.

Permitir que o utilizador veja e altere os consentimentos na área de conta.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/frontend/src/services/api/privacyApi.js`
    - CRIAR: `real_dev/frontend/src/components/privacy/PrivacyConsentsPanel.jsx`
    - EDITAR: `real_dev/frontend/src/pages/AccountPage.jsx`
    - LOCALIZAÇÃO: API atualizada, componente completo e inclusão na página

3. Instruções do que fazer.

Substitui o conteúdo de `privacyApi.js` pela versão completa abaixo, preservando os métodos criados por `BK-MF5-01` e `BK-MF5-02`. Depois cria o componente e coloca-o antes da zona de perigo.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/frontend/src/services/api/privacyApi.js
import { apiClient } from "./apiClient.js";

export const privacyApi = {
    /**
     * Pede ao backend a exportação dos dados do utilizador autenticado.
     *
     * @returns {Promise<{ export: Record<string, unknown> }>} Exportação em JSON.
     */
    exportMyData() {
        // O apiClient centraliza cookies de sessão e tratamento de erro para evitar fetch solto.
        return apiClient.get("/api/privacy/export");
    },

    /**
     * Pede a eliminação da própria conta.
     *
     * @param {{ confirmation: string }} input Confirmação textual.
     * @returns {Promise<{ deleted: boolean }>} Resultado da eliminação.
     */
    deleteMyAccount(input) {
        return apiClient.del("/api/privacy/account", { body: input });
    },

    /**
     * Lê os consentimentos atuais do utilizador autenticado.
     *
     * @returns {Promise<{ consentState: Record<string, unknown> }>} Estado atual de consentimento.
     */
    getMyConsents() {
        return apiClient.get("/api/privacy/consents");
    },

    /**
     * Atualiza consentimentos opcionais do utilizador autenticado.
     *
     * @param {{ personalizedRecommendations: boolean, operationalNotifications: boolean, anonymousMetrics: boolean }} input Consentimentos escolhidos.
     * @returns {Promise<{ consentState: Record<string, unknown> }>} Estado persistido.
     */
    updateMyConsents(input) {
        // O frontend envia apenas booleanos de consentimento; o userId continua a vir da sessão.
        return apiClient.put("/api/privacy/consents", input);
    },
};
```

```jsx
// real_dev/frontend/src/components/privacy/PrivacyConsentsPanel.jsx
import { useEffect, useState } from "react";
import { privacyApi } from "../../services/api/privacyApi.js";

const EMPTY_CONSENTS = {
    personalizedRecommendations: false,
    operationalNotifications: true,
    anonymousMetrics: false,
};

/**
 * Painel de gestão de consentimentos do utilizador autenticado.
 *
 * @returns {JSX.Element} Formulário de consentimentos.
 */
export function PrivacyConsentsPanel() {
    const [consents, setConsents] = useState(EMPTY_CONSENTS);
    const [version, setVersion] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        privacyApi
            .getMyConsents()
            .then((response) => {
                setConsents(response.consentState.consents);
                setVersion(response.consentState.version);
            })
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    /**
     * Alterna uma categoria booleana.
     *
     * @param {keyof typeof EMPTY_CONSENTS} key Categoria alterada.
     * @returns {void}
     */
    function toggleConsent(key) {
        setConsents((current) => ({ ...current, [key]: !current[key] }));
    }

    /**
     * Guarda os consentimentos no backend.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
     * @returns {Promise<void>} Termina quando o pedido é processado.
     */
    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setStatus("");
        setError("");

        try {
            const response = await privacyApi.updateMyConsents(consents);
            setConsents(response.consentState.consents);
            setVersion(response.consentState.version);
            setStatus("Consentimentos atualizados.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p>A carregar consentimentos...</p>;
    }

    return (
        <section className="form-panel" aria-labelledby="privacy-consents-title">
            <h2 id="privacy-consents-title">Consentimentos</h2>
            <p>Versão: {version}</p>
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form onSubmit={handleSubmit}>
                <label>
                    <input
                        type="checkbox"
                        checked={consents.personalizedRecommendations}
                        onChange={() => toggleConsent("personalizedRecommendations")}
                    />
                    Recomendações personalizadas
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={consents.operationalNotifications}
                        onChange={() => toggleConsent("operationalNotifications")}
                    />
                    Notificações operacionais
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={consents.anonymousMetrics}
                        onChange={() => toggleConsent("anonymousMetrics")}
                    />
                    Métricas anónimas
                </label>
                <button type="submit" disabled={saving}>
                    {saving ? "A guardar..." : "Guardar consentimentos"}
                </button>
            </form>
        </section>
    );
}
```

```jsx
// real_dev/frontend/src/pages/AccountPage.jsx
import { PrivacyConsentsPanel } from "../components/privacy/PrivacyConsentsPanel.jsx";

// Dentro do return principal, antes de <PrivacyDangerZone />:
<PrivacyConsentsPanel />
```

5. Explicação do código.

O componente carrega o estado real do backend, mostra a versão e envia todos os booleanos no submit. Isto evita que a UI pareça atualizada sem persistência.

6. Validação do passo.

Abre `/conta`, altera uma opção e guarda. A mensagem `Consentimentos atualizados.` deve aparecer e um reload deve manter a escolha.

7. Cenário negativo/erro esperado.

Se o backend estiver desligado, o painel deve mostrar erro em vez de assumir sucesso.

### Passo 5 - Testar validação de consentimentos

1. Objetivo funcional do passo no contexto da app.

Garantir que o backend não aceita estados ambíguos.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/backend/tests/unit/mf5-privacy-consents.validation.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o teste abaixo.

4. Código completo, correto e integrado com a app final.

```js
// real_dev/backend/tests/unit/mf5-privacy-consents.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertConsentPayload } from "../../src/modules/privacy/privacy.validation.js";

test("MF5 valida consentimentos booleanos", () => {
    // O caso positivo prova que só booleanos reais entram no contrato persistido.
    assert.deepEqual(
        assertConsentPayload({
            personalizedRecommendations: true,
            operationalNotifications: false,
            anonymousMetrics: true,
        }),
        {
            personalizedRecommendations: true,
            operationalNotifications: false,
            anonymousMetrics: true,
        },
    );

    // O cenário negativo impede que texto de formulário seja aceite como consentimento.
    assert.throws(
        () =>
            assertConsentPayload({
                personalizedRecommendations: "sim",
                operationalNotifications: true,
                anonymousMetrics: false,
            }),
        /verdadeiro ou falso/,
    );
});
```

5. Explicação do código.

O teste valida a fronteira do módulo. O backend aceita booleanos reais e rejeita texto.

6. Validação do passo.

Executa:

```bash
cd real_dev/backend
node --test tests/unit/mf5-privacy-consents.validation.test.js
```

O resultado esperado é `pass`.

7. Cenário negativo/erro esperado.

Se o frontend enviar `"false"` como string, o teste mostra porque o backend deve rejeitar. Texto não é consentimento booleano.

#### Critérios de aceite

- `GET /api/privacy/consents` devolve defaults para utilizador sem documento.
- `PUT /api/privacy/consents` exige sessão.
- O backend valida todos os campos como booleanos.
- O backend guarda estado atual em `user_consents`.
- O backend guarda evento histórico em `user_consent_events`.
- O frontend mostra loading, erro, sucesso e estado persistido.
- O frontend não envia `userId`.
- Existem negativos para falta de sessão, campo textual e campo em falta.

#### Validação final

Executa:

```bash
cd real_dev/backend
node --test tests/unit/mf5-privacy-consents.validation.test.js
node -e "import('./src/modules/privacy/privacy.routes.js').then(({ privacyRouter }) => console.log(typeof privacyRouter))"
```

Depois valida no browser:

- abrir `/conta`;
- alterar consentimentos;
- recarregar;
- confirmar que as escolhas persistem.

#### Evidence para PR/defesa

- `pr`: referência do commit ou PR.
- `proof`: output do teste de validação.
- `proof`: captura do painel de consentimentos.
- `neg`: pedido sem sessão devolve `401`.
- `neg`: string em vez de booleano devolve `400`.
- `neg`: reload mantém o estado guardado.

#### Handoff

O próximo BK, `BK-MF5-04`, passa para administração. A regra de separação fica clara: utilizadores gerem os próprios consentimentos; administradores gerem contas, roles e estados, sem alterar consentimentos pessoais.

#### Changelog

- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com consentimentos versionados, histórico, UI e testes.
