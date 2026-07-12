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
- `proximo_bk`: `BK-MF5-05`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-03-gestao-consentimentos.md`
- `last_updated`: `2026-07-10`

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
- Aplicar as escolhas atuais antes de usar sinais pessoais ou criar alertas operacionais opcionais.

#### Scope-out

- Painel admin para forçar consentimentos.
- Textos legais definitivos.
- Integração com fornecedores externos.
- Eliminação de conta, já tratada em `BK-MF5-02`.

#### Estado antes e depois

Antes deste BK, a aplicação tem autenticação e conta, mas não tem consentimentos persistidos. Preferências de notificações existem na MF4, mas são preferências funcionais, não prova de consentimento versionado.

Depois deste BK, cada utilizador tem um documento de consentimentos atuais e um histórico de eventos. A UI mostra opções claras, guarda alterações pelo endpoint autenticado e os serviços consumidores aplicam as escolhas atuais.

#### Pré-requisitos

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

##### Contrato atual da referência docente (Fase 2 - 2026-07-09)

- `personalizedRecommendations` começa em `false`. Só o valor explícito `true`
  permite carregar histórico, favoritos, watchlist, ratings ou feedback pessoal
  para ordenar recomendações.
- Sem esse consentimento, recomendações devolvem cold start geral, ainda sujeito ao
  limite parental, com `personalizationEnabled: false`.
- `operationalNotifications: false` bloqueia alertas opcionais de continuidade.
  Não bloqueia mensagens transacionais essenciais da conta/subscrição.
- `anonymousMetrics` continua persistido como escolha, mas esta Fase 2 não declara
  uma pipeline nova de métricas dependente desse consentimento.
- O estado atual é lido no momento da operação. O histórico de eventos prova a
  alteração, mas não substitui o documento atual como fonte de autorização.

#### Arquitetura do BK

| Camada | Contrato |
| --- | --- |
| Validator | `assertConsentPayload(input)` |
| Backend routes | `GET /api/privacy/consents`, `PUT /api/privacy/consents` |
| Coleções | `user_consents`, `user_consent_events` |
| Índices | `user_consents.userId` único; eventos por `userId/createdAt/_id` e `version/createdAt` |
| Service | `ensureConsentIndexes()`, `getMyConsents(userId)`, `updateMyConsents(userId, input)` |
| Frontend API | `privacyApi.getMyConsents()`, `privacyApi.updateMyConsents(input)` |
| UI | `PrivacyConsentsPanel` |
| Consumidores | recomendações personalizadas e alertas `continue_watching` |
| Handoff | `BK-MF5-04` separa self-service de administração |

##### Contrato vinculativo de rollback e cancelamento (Fase 5 - 2026-07-10)

- A leitura cria um `AbortController`, cancela no unmount/retry e só aplica a
  resposta se a instância do pedido continuar ativa. `REQUEST_ABORTED` não é
  apresentado como erro.
- O painel mantém em `ref` o último conjunto confirmado pelo backend. Os
  switches podem alterar o rascunho local, mas esse rascunho não se torna fonte
  de verdade sem `PUT /api/privacy/consents` bem-sucedido.
- Durante a escrita, todos os switches e o botão ficam desativados, o formulário
  expõe `aria-busy` e um `ref` impede dupla submissão antes do render.
- Em sucesso, usa-se `response.consentState.consents` e `updatedAt`; em falha,
  repõe-se integralmente o snapshot confirmado e mostra-se `toUserMessage`.
- O backend exige exatamente os três booleanos reais
  `personalizedRecommendations`, `operationalNotifications` e
  `anonymousMetrics`; strings `"true"`/`"false"` e campos em falta não são
  consentimento válido. Chaves livres não entram no objeto persistível.
- Loading/error/retry/sucesso e `Última atualização` usam PT-PT. Os exemplos do
  Passo 4 devem incorporar este contrato de abort, anti-stale e rollback.

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/privacy/privacy.validation.js`
- EDITAR: `backend/src/modules/privacy/privacy.service.js`
- EDITAR: `backend/src/modules/privacy/privacy.controller.js`
- EDITAR: `backend/src/modules/privacy/privacy.routes.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `frontend/src/services/api/privacyApi.js`
- CRIAR: `frontend/src/components/privacy/PrivacyConsentsPanel.jsx`
- EDITAR: `frontend/src/pages/AccountPage.jsx`
- CRIAR: `backend/tests/unit/mf5-privacy-consents.validation.test.js`
- CRIAR: `backend/tests/integration/mf5-privacy-consents.atomicity.test.js`
- CRIAR: `backend/tests/integration/mf5-privacy-consents-consumers.test.js`
- REVER: `RF57`, `RNF15`, `RNF17`, `RNF37`, `BK-MF3-05`, `BK-MF4-08`
- REVER: `backend/src/modules/recommendations/recommendations.service.js`
- REVER: `backend/src/modules/notifications/notifications.service.js`

#### Tutorial técnico linear

### Passo 1 - Validar categorias de consentimento

1. Objetivo funcional do passo no contexto da app.

Definir o contrato de consentimentos aceites pelo backend.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/privacy/privacy.validation.js`
    - LOCALIZAÇÃO: acrescentar constantes e função no fim do ficheiro

3. Instruções do que fazer.

Mantém a validação de eliminação criada no BK anterior e acrescenta o contrato abaixo.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/privacy/privacy.validation.js
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
cd backend
node -e "import('./src/modules/privacy/privacy.validation.js').then(({ assertConsentPayload }) => console.log(assertConsentPayload({ personalizedRecommendations: true, operationalNotifications: true, anonymousMetrics: false }).anonymousMetrics))"
```

O resultado esperado é `false`.

7. Cenário negativo/erro esperado.

Se `anonymousMetrics` vier como `"sim"`, o backend devolve `400`. Isto evita guardar texto ambíguo como consentimento.

### Passo 2 - Criar service de leitura e atualização

1. Objetivo funcional do passo no contexto da app.

Persistir consentimentos atuais e histórico de alterações por utilizador.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/privacy/privacy.service.js`
    - EDITAR: `backend/src/server.js` (apenas chamada de índices no arranque)
    - LOCALIZAÇÃO: imports e funções novas no fim do ficheiro

3. Instruções do que fazer.

Mantém `ObjectId`, `HttpError`, `getDb`, `runInTransaction`,
`asUserObjectId` e todo o contrato cumulativo dos BKs MF5-01/MF5-02. Importa
`assertConsentPayload`, `CONSENT_VERSION` e `DEFAULT_CONSENTS`. Acrescenta as
funções abaixo e chama `ensureConsentIndexes()` uma vez antes de `listen()`.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/privacy/privacy.service.js
// `getDb` e `runInTransaction` já coexistem no import cumulativo de database.js.
import { getDb, runInTransaction } from "../../config/database.js";
import {
    assertConsentPayload,
    CONSENT_VERSION,
    DEFAULT_CONSENTS,
} from "./privacy.validation.js";

/** Cria as garantias de unicidade e consulta do módulo de consentimentos. */
export async function ensureConsentIndexes() {
    const db = await getDb();

    await db.collection("user_consents").createIndex(
        { userId: 1 },
        { unique: true, name: "user_consents_user_id_unique" },
    );
    await db.collection("user_consent_events").createIndex(
        { userId: 1, createdAt: -1, _id: -1 },
        { name: "user_consent_events_user_created" },
    );
    await db.collection("user_consent_events").createIndex(
        { version: 1, createdAt: -1 },
        { name: "user_consent_events_version_created" },
    );
}

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
    const userObjectId = asUserObjectId(userId);
    const now = new Date();

    // O retry adicional cobre exclusivamente a corrida inicial de dois upserts
    // sobre o índice único. Cada tentativa abre uma transação nova.
    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            return await runInTransaction(async ({ db, session }) => {
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
                    { upsert: true, session },
                );

                await db.collection("user_consent_events").insertOne(
                    {
                        userId: userObjectId,
                        consents,
                        version: CONSENT_VERSION,
                        createdAt: now,
                        source: "account_page",
                    },
                    { session },
                );

                // A resposta vem da leitura canónica feita dentro da mesma
                // transação, não do payload recebido nem de uma leitura posterior.
                const current = await db.collection("user_consents").findOne(
                    { userId: userObjectId },
                    { session },
                );

                if (!current) {
                    throw new Error("Consentimento atual ausente apos escrita.");
                }

                return toPublicConsents(current);
            });
        } catch (error) {
            const isInitialUpsertRace = error?.code === 11000 && attempt === 0;
            if (!isInitialUpsertRace) {
                throw error;
            }
        }
    }

    throw new Error("Nao foi possivel atualizar os consentimentos.");
}
```

No arranque cumulativo de `backend/src/server.js`, antes de `listen()`:

```js
import { ensureConsentIndexes } from "./modules/privacy/privacy.service.js";

await ensureConsentIndexes();
```

5. Explicação do código.

`getMyConsents` devolve defaults quando ainda não existe documento.
`updateMyConsents` faz upsert do estado atual, insere o evento e relê a fonte
canónica com a mesma `session`; uma falha em qualquer passo reverte tudo. O
índice único impede dois documentos atuais para o mesmo utilizador e o retry
limitado resolve apenas a corrida do primeiro upsert. A origem `account_page`
indica que a alteração veio da área de conta.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/modules/privacy/privacy.service.js').then(({ ensureConsentIndexes, getMyConsents, updateMyConsents }) => console.log(typeof ensureConsentIndexes, typeof getMyConsents, typeof updateMyConsents))"
```

O resultado esperado é `function function function`.

7. Cenário negativo/erro esperado.

Se a inserção do evento falhar, o upsert tem de fazer rollback. Se aparecerem
dois documentos atuais para o mesmo `userId`, os índices não foram aplicados e
o módulo não pode ser considerado concluído.

### Passo 3 - Expor endpoints de consentimento

1. Objetivo funcional do passo no contexto da app.

Disponibilizar leitura e atualização de consentimentos via API autenticada.

2. Ficheiros envolvidos:
    - EDITAR: `backend/src/modules/privacy/privacy.controller.js`
    - EDITAR: `backend/src/modules/privacy/privacy.routes.js`
    - LOCALIZAÇÃO: imports, funções e rotas novas

3. Instruções do que fazer.

Adiciona os controllers e as rotas `GET /consents` e `PUT /consents`.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/privacy/privacy.controller.js
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
// backend/src/modules/privacy/privacy.routes.js
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
    - EDITAR: `frontend/src/services/api/privacyApi.js`
    - CRIAR: `frontend/src/components/privacy/PrivacyConsentsPanel.jsx`
    - EDITAR: `frontend/src/pages/AccountPage.jsx`
    - LOCALIZAÇÃO: API atualizada, componente completo e inclusão na página

3. Instruções do que fazer.

Substitui o conteúdo de `privacyApi.js` pela versão completa abaixo, preservando os métodos criados por `BK-MF5-01` e `BK-MF5-02`. Depois cria o componente e coloca-o antes da zona de perigo.

4. Código completo, correto e integrado com a app final.

```js
// frontend/src/services/api/privacyApi.js
import { apiClient } from "./apiClient.js";

export const privacyApi = {
    /**
     * Pede ao backend a exportação dos dados do utilizador autenticado.
     *
     * @returns {Promise<{ export: Record<string, unknown> }>} Exportação em JSON.
     */
    exportMyData(options = {}) {
        // O apiClient centraliza cookies de sessão e tratamento de erro para evitar fetch solto.
        return apiClient.get("/api/privacy/export", options);
    },

    /**
     * Pede a eliminação da própria conta.
     *
     * @param {{ confirmation: string, password: string }} input Frase e password atual.
     * @returns {Promise<{ deleted: boolean }>} Resultado da eliminação.
     */
    deleteMyAccount(input, options = {}) {
        // A edição de consentimentos não pode enfraquecer o contrato RGPD do BK-MF5-02.
        return apiClient.del("/api/privacy/account", {
            ...options,
            body: {
                confirmation: input?.confirmation,
                password: input?.password,
            },
        });
    },

    /**
     * Lê os consentimentos atuais do utilizador autenticado.
     *
     * @returns {Promise<{ consentState: Record<string, unknown> }>} Estado atual de consentimento.
     */
    getMyConsents(options = {}) {
        return apiClient.get("/api/privacy/consents", options);
    },

    /**
     * Atualiza consentimentos opcionais do utilizador autenticado.
     *
     * @param {{ personalizedRecommendations: boolean, operationalNotifications: boolean, anonymousMetrics: boolean }} input Consentimentos escolhidos.
     * @returns {Promise<{ consentState: Record<string, unknown> }>} Estado persistido.
     */
    updateMyConsents(input, options = {}) {
        // O frontend envia apenas booleanos de consentimento; o userId continua a vir da sessão.
        return apiClient.put("/api/privacy/consents", input, options);
    },
};
```

```jsx
// frontend/src/components/privacy/PrivacyConsentsPanel.jsx
import { useEffect, useRef, useState } from "react";
import { privacyApi } from "../../services/api/privacyApi.js";
import { toUserMessage } from "../../services/api/apiErrors.js";

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
    const [updatedAt, setUpdatedAt] = useState("");
    const [loading, setLoading] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const confirmedRef = useRef(EMPTY_CONSENTS);
    const contextVersionRef = useRef(0);
    const savingRef = useRef(false);
    const saveControllerRef = useRef(null);

    useEffect(() => {
        const contextVersion = ++contextVersionRef.current;
        const controller = new AbortController();
        setLoading(true);
        setError("");

        privacyApi
            .getMyConsents({ signal: controller.signal })
            .then((response) => {
                if (controller.signal.aborted || contextVersion !== contextVersionRef.current) return;
                const confirmed = response.consentState.consents;
                confirmedRef.current = confirmed;
                setConsents(confirmed);
                setVersion(response.consentState.version);
                setUpdatedAt(response.consentState.updatedAt ?? "");
                setLoaded(true);
            })
            .catch((requestError) => {
                if (controller.signal.aborted || requestError?.code === "REQUEST_ABORTED") return;
                if (contextVersion !== contextVersionRef.current) return;
                setError(toUserMessage(requestError));
            })
            .finally(() => {
                if (!controller.signal.aborted && contextVersion === contextVersionRef.current) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [reloadVersion]);

    useEffect(() => () => {
        contextVersionRef.current += 1;
        saveControllerRef.current?.abort();
        saveControllerRef.current = null;
        savingRef.current = false;
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
        if (savingRef.current) return;
        const contextVersion = contextVersionRef.current;
        const controller = new AbortController();
        const confirmed = confirmedRef.current;
        savingRef.current = true;
        saveControllerRef.current = controller;
        setSaving(true);
        setStatus("");
        setError("");

        try {
            const response = await privacyApi.updateMyConsents(consents, {
                signal: controller.signal,
            });
            if (controller.signal.aborted || contextVersion !== contextVersionRef.current) return;
            const saved = response.consentState.consents;
            confirmedRef.current = saved;
            setConsents(saved);
            setVersion(response.consentState.version);
            setUpdatedAt(response.consentState.updatedAt ?? "");
            setStatus("Consentimentos atualizados.");
        } catch (requestError) {
            if (controller.signal.aborted || requestError?.code === "REQUEST_ABORTED") return;
            if (contextVersion !== contextVersionRef.current) return;
            setConsents(confirmed);
            setError(toUserMessage(requestError));
        } finally {
            if (saveControllerRef.current === controller) {
                saveControllerRef.current = null;
                savingRef.current = false;
            }
            if (contextVersion === contextVersionRef.current) setSaving(false);
        }
    }

    if (loading && !loaded) {
        return <p>A carregar consentimentos...</p>;
    }

    if (!loaded) {
        return (
            <section role="alert">
                <p>{error || "Não foi possível carregar os consentimentos."}</p>
                <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
                    Tentar novamente
                </button>
            </section>
        );
    }

    return (
        <section className="form-panel" aria-labelledby="privacy-consents-title">
            <h2 id="privacy-consents-title">Consentimentos</h2>
            <p>Versão: {version}</p>
            {updatedAt ? <p>Última atualização: {new Date(updatedAt).toLocaleString("pt-PT")}</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {status ? <p role="status">{status}</p> : null}
            <form onSubmit={handleSubmit} aria-busy={saving}>
                <label>
                    <input
                        type="checkbox"
                        checked={consents.personalizedRecommendations}
                        disabled={saving}
                        onChange={() => toggleConsent("personalizedRecommendations")}
                    />
                    Recomendações personalizadas
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={consents.operationalNotifications}
                        disabled={saving}
                        onChange={() => toggleConsent("operationalNotifications")}
                    />
                    Notificações operacionais
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={consents.anonymousMetrics}
                        disabled={saving}
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
// frontend/src/pages/AccountPage.jsx
import { PrivacyConsentsPanel } from "../components/privacy/PrivacyConsentsPanel.jsx";

// Dentro do return principal, antes de <PrivacyDangerZone />:
<PrivacyConsentsPanel />
```

5. Explicação do código.

O componente propaga `AbortSignal`, ignora respostas antigas e conserva em
`confirmedRef` o último snapshot aceite pelo backend. Os switches editam apenas
um rascunho; falha do `PUT` repõe os três valores confirmados. `savingRef`
bloqueia dupla submissão antes do render, `aria-busy`/`disabled` tornam o estado
observável e `toUserMessage` evita detalhes técnicos.

6. Validação do passo.

Abre `/conta`, altera uma opção e guarda. A mensagem `Consentimentos atualizados.` deve aparecer e um reload deve manter a escolha.

7. Cenário negativo/erro esperado.

Se o backend estiver desligado, o painel deve mostrar erro em vez de assumir sucesso.

### Passo 5 - Testar validação, atomicidade e consumo sem estado stale

1. Objetivo funcional do passo no contexto da app.

Garantir que o backend não aceita estados ambíguos, nunca persiste metade de
uma alteração e não continua a personalizar depois de um opt-out confirmado.

2. Ficheiros envolvidos:
    - CRIAR: `backend/tests/unit/mf5-privacy-consents.validation.test.js`
    - CRIAR: `backend/tests/integration/mf5-privacy-consents.atomicity.test.js`
    - CRIAR: `backend/tests/integration/mf5-privacy-consents-consumers.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria primeiro o teste unitário abaixo. Os dois testes de integração usam apenas
uma base MongoDB de teste explícita, loopback, com `replicaSet` e nome terminado
em `_e2e`; não reutilizam `MONGODB_URI`, não fazem fallback e não correm se o
ambiente seguro estiver ausente.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf5-privacy-consents.validation.test.js
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

Os testes de integração são obrigatórios e implementam exatamente esta matriz;
não os substituas por mocks que não exercitam uma transação MongoDB real:

| ID | Preparação/ação | Asserção obrigatória |
| --- | --- | --- |
| `MF5-CONSENT-FAULT-01` | Estado confirmado A; provocar falha no `insertOne` de `user_consent_events` dentro da transação ao tentar B | `user_consents` continua A e não existe evento B |
| `MF5-CONSENT-FAULT-02` | Provocar falha na leitura canónica posterior ao evento | upsert e evento fazem rollback; resposta não é sucesso |
| `MF5-CONSENT-CONCURRENCY-01` | Dois `updateMyConsents` simultâneos no primeiro consentimento do mesmo `userId` | existe exatamente um `user_consents`; cada transação confirmada tem um evento; nenhuma resposta é falso-verde |
| `MF5-CONSENT-OPTOUT-01` | Confirmar personalização `true`, iniciar um pedido concorrente, confirmar opt-out `false` e só depois deixar o consumidor ordenar | o pedido posterior ao commit relê `user_consents`, devolve cold start e não lê histórico/favoritos/ratings/watchlist |
| `MF5-CONSENT-OPTOUT-02` | Confirmar `operationalNotifications: false` após um estado `true` | um pedido posterior ao commit omite `continue_watching`, mantendo apenas eventos transacionais essenciais |

Cada caso cria um `userId` exclusivo e elimina apenas os documentos desse caso
na DB `_e2e`. A suite regista `TEST_MONGODB_DB_NAME`, nunca a URI. Se não existir
replica set isolado, os testes ficam `BLOQUEADO_AMBIENTE`; não podem ser marcados
`PASS` com Mongo standalone ou mocks.

5. Explicação do código.

O teste unitário valida a fronteira do módulo. Os testes de integração provam a
atomicidade real, a unicidade sob concorrência e que consumidores fazem uma
leitura canónica depois do opt-out, em vez de reutilizarem consentimento em
cache ou capturado antes da alteração.

6. Validação do passo.

Executa:

```bash
cd backend
node --test tests/unit/mf5-privacy-consents.validation.test.js
node --test tests/integration/mf5-privacy-consents.atomicity.test.js
node --test tests/integration/mf5-privacy-consents-consumers.test.js
```

O resultado esperado é `pass` apenas com a DB `_e2e` transacional isolada. Sem
essa infraestrutura, regista o bloqueio em vez de saltar os testes críticos.

7. Cenário negativo/erro esperado.

Se o frontend enviar `"false"` como string, o teste mostra porque o backend deve
rejeitar. Se fault injection deixar o estado novo sem o evento, ou se um pedido
pós-opt-out usar sinais pessoais, a causa raiz continua aberta.

#### Critérios de aceite

- `GET /api/privacy/consents` devolve defaults para utilizador sem documento.
- `PUT /api/privacy/consents` exige sessão.
- O backend valida todos os campos como booleanos.
- O backend guarda estado atual em `user_consents`.
- O backend guarda evento histórico em `user_consent_events`.
- Estado atual, evento e leitura canónica usam a mesma transação/session; falha
  de qualquer operação deixa zero estado parcial.
- Existe um único `user_consents` por utilizador e a primeira escrita concorrente
  não cria duplicados nem eventos sem estado confirmado.
- Recomendações sem consentimento não carregam sinais pessoais e devolvem `personalizationEnabled: false`.
- O limite parental aplica-se também ao cold start sem consentimento.
- `operationalNotifications: false` impede novo alerta `continue_watching`, sem silenciar eventos transacionais essenciais.
- Não é alegada aplicação de `anonymousMetrics` fora dos consumidores realmente implementados.
- O frontend mostra loading, erro, sucesso e estado persistido.
- O frontend não envia `userId`.
- Falha ao guardar repõe os três consentimentos confirmados; duplo clique não
  duplica eventos e abort/unmount não aplica resposta tardia.
- Existem negativos para falta de sessão, campo textual e campo em falta.
- Fault injection, primeira escrita concorrente e opt-out pós-commit são
  testados num replica set `_e2e`; mocks/standalone não contam como prova.

#### Validação final

Executa:

```bash
cd backend
node --test tests/unit/mf5-privacy-consents.validation.test.js
node --test tests/integration/mf5-privacy-consents.atomicity.test.js
node --test tests/integration/mf5-privacy-consents-consumers.test.js
node -e "import('./src/modules/privacy/privacy.routes.js').then(({ privacyRouter }) => console.log(typeof privacyRouter))"
```

Depois valida no browser:

- abrir `/conta`;
- alterar consentimentos;
- recarregar;
- confirmar que as escolhas persistem.
- desligar personalização e confirmar cold start sem sinais pessoais;
- desligar notificações operacionais e confirmar que `continue_watching` é omitida, mantendo uma notificação transacional de teste.

#### Evidence para PR/defesa

- `pr`: referência do commit ou PR.
- `proof`: output do teste de validação.
- `proof`: captura do painel de consentimentos.
- `neg`: pedido sem sessão devolve `401`.
- `neg`: string em vez de booleano devolve `400`.
- `neg`: consentimento de personalização desligado não usa sinais pessoais.
- `neg`: consentimento operacional desligado omite alerta opcional, não o evento transacional.
- `neg`: fault injection no evento/leitura canónica deixa o estado anterior e
  zero evento parcial.
- `neg`: duas primeiras escritas concorrentes deixam um documento atual.
- `neg`: pedidos posteriores ao opt-out não usam snapshot stale de consentimento.
- `neg`: reload mantém o estado guardado.

#### Handoff

O próximo BK, `BK-MF5-04`, passa para administração. A regra de separação fica clara: utilizadores gerem os próprios consentimentos; administradores gerem contas, roles e estados, sem alterar consentimentos pessoais.

#### Changelog

- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com consentimentos versionados, histórico, UI e testes.
- `2026-07-10`: painel sincronizado com abort/anti-stale, busy state,
  anti-duplo-clique e rollback integral para o último estado confirmado.
- `2026-07-10`: estado atual, evento e leitura canónica tornados atómicos, com
  índices explícitos e testes de fault injection, concorrência e opt-out stale.
