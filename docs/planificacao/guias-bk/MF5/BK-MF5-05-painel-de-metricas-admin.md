# BK-MF5-05 - Painel de métricas admin

## Header

- `doc_id`: `GUIA-BK-MF5-05`
- `bk_id`: `BK-MF5-05`
- `macro`: `MF5`
- `owner`: `Davi`
- `apoio`: `Mateus`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF5-04`
- `rf_rnf`: `RF59`
- `fase_documental`: `Fase 2`
- `sprint`: `S09`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-06`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-05-painel-de-metricas-admin.md`
- `last_updated`: `2026-07-12`

#### Objetivo

Neste BK vais implementar um painel de métricas administrativas agregadas. O administrador deve conseguir ver indicadores básicos de operação sem aceder a dados pessoais desnecessários.

`CANONICO`: este BK cobre `RF59 - Painel de métricas` e depende de `BK-MF5-04`.

`DERIVADO`: como os documentos não definem métricas exatas, este guia cria métricas agregadas de utilizadores, catálogo, subscrições, pool solidária, notificações e privacidade, usando apenas contagens e somatórios.

#### Importância

Um painel de métricas ajuda a perceber se a aplicação está operacional: quantos utilizadores existem, quantas subscrições estão ativas, quantos conteúdos publicados existem e se há eventos de privacidade recentes.

Como se trata de administração, a regra é minimizar exposição. O painel não lista emails, nomes, comentários ou histórico individual. Mostra apenas números agregados.

#### Scope-in

- Criar módulo backend `admin-metrics`.
- Criar endpoint admin `GET /api/admin/metrics`.
- Criar export privado `GET /api/admin/metrics/export.csv` com o mesmo RBAC e intervalo.
- Validar intervalo temporal opcional.
- Agregar contagens por coleção.
- Criar cliente frontend `metricsApi`.
- Criar página `/admin/metricas`.
- Adicionar rota frontend.
- Criar teste unitário da validação de datas.

#### Scope-out

- Gráficos avançados.
- Exportação PDF ou ficheiros com linhas pessoais.
- Dados pessoais individuais.
- Monitorização técnica de infraestrutura.
- Alertas automáticos.

#### Estado antes e depois

Antes deste BK, a administração consegue gerir utilizadores, associações e pool, mas não tem visão agregada de operação.

Depois deste BK, existe um endpoint admin com métricas agregadas, dashboard
operacional e exportação CSV igualmente agregada.

#### Pré-requisitos

- `BK-MF5-04` protege rotas admin com `requireRole(["admin"])`.
- `BK-MF2` criou catálogo, histórico e biblioteca.
- `BK-MF4` criou subscrições, notificações e pool solidária.
- `frontend/src/routes/AppRoutes.jsx` já tem rotas admin.

#### Glossário

- Métrica: número usado para observar estado da aplicação.
- Agregação: cálculo sobre vários registos sem mostrar detalhes individuais.
- Intervalo temporal: janela `from`/`to` usada para contar eventos recentes.
- Minimização: mostrar apenas o necessário para operação.
- Indicador operacional: valor que ajuda o admin a tomar decisões sem invadir privacidade.

#### Conceitos teóricos essenciais

No domínio FaithFlix, métricas admin respondem a perguntas como: há utilizadores ativos, conteúdos publicados, subscrições ativas e notificações recentes? Elas não respondem "que utilizador viu o quê".

No backend, o service consulta coleções e devolve contagens. A autorização admin fica na rota. A validação de datas impede intervalos inválidos ou demasiado longos.

No frontend, a página mostra cards simples com loading, erro e estado vazio. Cards são adequados aqui porque cada item é uma métrica independente.

Na privacidade, todas as respostas são agregadas. Isto reduz risco de exposição de dados pessoais e prepara a revisão de hardening na MF6.

#### Arquitetura do BK

| Camada | Contrato |
| --- | --- |
| Backend route | `GET /api/admin/metrics?from=&to=` |
| Export | `GET /api/admin/metrics/export.csv?from=&to=`; `text/csv`, privado, sem PII |
| Autorização | `requireRole(["admin"])` |
| Validator | `assertMetricsRange(query)` |
| Service | `getAdminMetrics(query)` |
| Frontend API | `metricsApi.getAdminMetrics(filters, options)` |
| Página | `AdminMetricsPage` em `/admin/metricas` |
| Teste | `mf5-admin-metrics.validation.test.js` |

##### Contrato vinculativo da leitura administrativa (Fase 5 - 2026-07-10)

- Cada leitura cria um `AbortController`. Aplicar filtros, repetir ou sair da rota
  cancela o pedido anterior; `REQUEST_ABORTED` não é mostrado e uma resposta
  antiga nunca substitui o intervalo atualmente aplicado.
- A UI mantém os campos `from`/`to` separados dos filtros aplicados. Só o submit
  válido inicia nova leitura; `from > to` mostra
  `A data inicial não pode ser posterior à data final` sem chamar a API.
- O backend continua a ser autoridade e recusa datas inválidas, ordem invertida
  e intervalos superiores a 366 dias.
- Loading, erro, vazio e retry são estados distintos. O botão `Atualizar` fica
  indisponível durante a leitura e `Tentar novamente` repete apenas o último
  intervalo aplicado.
- Rótulos técnicos são apresentados em PT-PT, incluindo `Períodos experimentais`,
  `Pedidos de eliminação`, `Eventos de consentimento` e valores monetários EUR
  com `Intl.NumberFormat("pt-PT")`.
- O painel mantém apenas agregados; cancelamento/retry não autoriza introduzir
  nomes, emails ou linhas pessoais. O Passo 4 é a implementação autoritativa de
  abort, anti-stale e erro seguro.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/admin-metrics/admin-metrics.validation.js`
- CRIAR: `backend/src/modules/admin-metrics/admin-metrics.service.js`
- CRIAR: `backend/src/modules/admin-metrics/admin-metrics.controller.js`
- CRIAR: `backend/src/modules/admin-metrics/admin-metrics.routes.js`
- EDITAR: `backend/src/app.js`
- CRIAR: `frontend/src/services/api/metricsApi.js`
- CRIAR: `frontend/src/pages/AdminMetricsPage.jsx`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- CRIAR: `backend/tests/unit/mf5-admin-metrics.validation.test.js`
- REVER: `RF59`, `RNF19`, `RNF30`, `BK-MF5-04`

#### Tutorial técnico linear

### Passo 1 - Validar intervalo temporal de métricas

1. Objetivo funcional do passo no contexto da app.

Garantir que filtros `from` e `to` são datas válidas e numa ordem correta.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/modules/admin-metrics/admin-metrics.validation.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `admin-metrics` e adiciona o validator.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/admin-metrics/admin-metrics.validation.js
import { HttpError } from "../../utils/http-error.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 366;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

/**
 * Converte uma data opcional de query string.
 *
 * @param {unknown} value Valor recebido.
 * @param {string} field Nome do campo.
 * @returns {Date | null} Data validada ou null.
 * @throws {HttpError} Quando a data é inválida.
 */
function optionalDate(value, field, { endOfDay = false } = {}) {
    if (value === undefined) return null;

    // Query arrays, objetos, números e datas ambíguas nunca são convertidos por String().
    if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) {
        throw new HttpError(400, `${field} deve usar o formato YYYY-MM-DD.`);
    }

    const start = new Date(`${value}T00:00:00.000Z`);
    if (
        Number.isNaN(start.getTime())
        || start.toISOString().slice(0, 10) !== value
    ) {
        throw new HttpError(400, `${field} deve ser uma data válida.`);
    }

    return endOfDay ? new Date(start.getTime() + DAY_MS - 1) : start;
}

/**
 * Valida filtros temporais do painel admin.
 *
 * @param {{ from?: unknown, to?: unknown }} query Query string recebida.
 * @returns {{ from: Date, to: Date }} Intervalo validado.
 */
export function assertMetricsRange(query = {}) {
    if (!query || typeof query !== "object" || Array.isArray(query)) {
        throw new HttpError(400, "Filtros de métricas inválidos.");
    }
    if (Object.keys(query).some((key) => !["from", "to"].includes(key))) {
        throw new HttpError(400, "Filtros de métricas contêm campos não permitidos.");
    }

    const now = new Date();
    const to = optionalDate(query.to, "to", { endOfDay: true }) ?? now;
    const from =
        optionalDate(query.from, "from") ??
        new Date(to.getTime() - 30 * DAY_MS);

    if (from > to) {
        throw new HttpError(400, "from deve ser anterior ou igual a to.");
    }

    const rangeDays = (to.getTime() - from.getTime()) / DAY_MS;

    if (rangeDays > MAX_RANGE_DAYS) {
        throw new HttpError(400, "O intervalo máximo é de 366 dias.");
    }

    return { from, to };
}
```

5. Explicação do código.

O validator aceita apenas query scalars canónicos `YYYY-MM-DD`. Não usa
`String(value)`, logo arrays, objetos e números não conseguem transformar-se
silenciosamente numa data. `from` começa às `00:00:00.000Z` e `to` termina às
`23:59:59.999Z`, para o último dia não ficar parcialmente excluído. Sem filtros,
usa os últimos 30 dias; o limite anual evita consultas demasiado largas.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/modules/admin-metrics/admin-metrics.validation.js').then(({ assertMetricsRange }) => console.log(assertMetricsRange({}).from instanceof Date))"
```

O resultado esperado é `true`.

7. Cenário negativo/erro esperado.

`from=2026-12-01&to=2026-01-01` deve devolver `400`, porque o intervalo está invertido.

### Passo 2 - Criar service de métricas agregadas

1. Objetivo funcional do passo no contexto da app.

Calcular números agregados sem expor linhas individuais.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/modules/admin-metrics/admin-metrics.service.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o service abaixo.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/admin-metrics/admin-metrics.service.js
import { getDb } from "../../config/database.js";
import { assertMetricsRange } from "./admin-metrics.validation.js";

/**
 * Conta documentos com fallback seguro para coleções vazias.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {string} collectionName Nome da coleção.
 * @param {Record<string, unknown>} query Filtro MongoDB.
 * @returns {Promise<number>} Total de documentos.
 */
async function count(db, collectionName, query = {}) {
    return db.collection(collectionName).countDocuments(query);
}

/**
 * Soma valores monetários em cêntimos sem devolver documentos individuais.
 *
 * @param {import("mongodb").Db} db Ligação MongoDB.
 * @param {string} collectionName Nome da coleção.
 * @param {Record<string, unknown>} match Filtro MongoDB.
 * @param {string} field Campo numérico a somar.
 * @returns {Promise<number>} Soma em cêntimos.
 */
async function sumCents(db, collectionName, match, field) {
    const [result] = await db
        .collection(collectionName)
        .aggregate([
            { $match: match },
            { $group: { _id: null, total: { $sum: `$${field}` } } },
        ])
        .toArray();

    return result?.total ?? 0;
}

/**
 * Calcula métricas agregadas para administração.
 *
 * @param {{ from?: unknown, to?: unknown }} query Query string validável.
 * @returns {Promise<Record<string, unknown>>} Métricas agregadas.
 */
export async function getAdminMetrics(query = {}) {
    const { from, to } = assertMetricsRange(query);
    const db = await getDb();
    const createdInRange = { createdAt: { $gte: from, $lte: to } };
    const deletionRequestedInRange = {
        requestedAt: { $gte: from, $lte: to },
    };
    const activeUserFilter = {
        // `accountStatus` é canónico e obrigatório para contar atividade.
        accountStatus: "active",
        // Um estado legacy explícito também tem de permitir operação.
        $or: [{ status: "active" }, { status: { $exists: false } }],
    };
    const blockedUserFilter = {
        $or: [{ accountStatus: "blocked" }, { status: "blocked" }],
    };

    const [
        usersTotal,
        usersActive,
        usersBlocked,
        contentsPublished,
        activeSubscriptions,
        trialSubscriptions,
        notificationsCreated,
        deletionRequests,
        consentEvents,
        approvedCharities,
        solidarityCents,
    ] = await Promise.all([
        count(db, "users"),
        // Falha fechada: estados ausentes/desconhecidos nunca contam como atividade.
        count(db, "users", activeUserFilter),
        count(db, "users", blockedUserFilter),
        count(db, "contents", { status: "published" }),
        count(db, "subscriptions", { status: "active" }),
        count(db, "subscriptions", { status: "trialing" }),
        count(db, "notifications", createdInRange),
        count(db, "privacy_deletion_requests", deletionRequestedInRange),
        count(db, "user_consent_events", createdInRange),
        count(db, "charities", { status: "active", poolStatus: "eligible" }),
        sumCents(db, "pool_distributions", createdInRange, "totalPoolCents"),
    ]);

    return {
        range: {
            from: from.toISOString(),
            to: to.toISOString(),
        },
        users: {
            total: usersTotal,
            active: usersActive,
            blocked: usersBlocked,
        },
        content: {
            published: contentsPublished,
        },
        subscriptions: {
            active: activeSubscriptions,
            trialing: trialSubscriptions,
        },
        notifications: {
            created: notificationsCreated,
        },
        privacy: {
            deletionRequests,
            consentEvents,
        },
        charities: {
            approvedInPool: approvedCharities,
            solidarityCents,
        },
    };
}
```

5. Explicação do código.

O service devolve apenas números. Notificações e restantes eventos com
`createdAt` usam `createdInRange`; pedidos RGPD usam o campo efetivamente
persistido, `requestedAt`. `users.active` falha fechado: exige
`accountStatus: "active"` e recusa também um `status` legacy que não seja
`active`. Estados ausentes ou desconhecidos no campo canónico não são
classificados como atividade. A soma solidária usa `totalPoolCents`, gravado por
`BK-MF4-05`, e devolve apenas o total em cêntimos.

6. Validação do passo.

Executa:

```bash
cd backend
node -e "import('./src/modules/admin-metrics/admin-metrics.service.js').then(({ getAdminMetrics }) => console.log(typeof getAdminMetrics))"
```

O resultado esperado é `function`.

7. Cenário negativo/erro esperado.

Se o service devolvesse listas de utilizadores ou emails, o painel violaria minimização. Aqui só há contagens.

### Passo 3 - Criar controller, rota e montagem

1. Objetivo funcional do passo no contexto da app.

Expor métricas agregadas apenas para administradores.

2. Ficheiros envolvidos:
    - CRIAR: `backend/src/modules/admin-metrics/admin-metrics.controller.js`
    - CRIAR: `backend/src/modules/admin-metrics/admin-metrics.routes.js`
    - EDITAR: `backend/src/app.js`
    - LOCALIZAÇÃO: ficheiros completos e montagem de rota

3. Instruções do que fazer.

Cria controller/route e monta no prefixo `/api/admin/metrics`.

4. Código completo, correto e integrado com a app final.

```js
// backend/src/modules/admin-metrics/admin-metrics.controller.js
import { getAdminMetrics } from "./admin-metrics.service.js";

/**
 * Devolve métricas agregadas para administradores.
 *
 * @param {import("express").Request} req Pedido atual.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<import("express").Response>} Métricas agregadas.
 */
export async function getAdminMetricsController(req, res) {
    return res.status(200).json({
        metrics: await getAdminMetrics(req.query),
    });
}

function metricsToCsv(metrics) {
    const rows = [
        ["metric", "value"],
        ["users.total", metrics.users.total],
        ["catalog.published", metrics.catalog.published],
        ["subscriptions.active", metrics.subscriptions.active],
        ["subscriptions.familyMembers", metrics.subscriptions.familyMembers],
        ["solidarity.approvedCharities", metrics.solidarity.approvedCharities],
        ["solidarity.distributedCents", metrics.solidarity.distributedCents],
        ["integrations.enabled", metrics.integrations.enabled],
    ];
    return rows.map((row) => row.join(",")).join("\n");
}

export async function exportMetricsCsv(req, res) {
    const metrics = await getAdminMetrics(req.query);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="faithflix-metricas.csv"');
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).send(metricsToCsv(metrics));
}
```

```js
// backend/src/modules/admin-metrics/admin-metrics.routes.js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireRole } from "../../middlewares/auth.middleware.js";
import { exportMetricsCsv, getAdminMetricsController } from "./admin-metrics.controller.js";

export const adminMetricsRouter = Router();

adminMetricsRouter.get(
    "/",
    requireRole(["admin"]),
    asyncHandler(getAdminMetricsController),
);
adminMetricsRouter.get(
    "/export.csv",
    requireRole(["admin"]),
    asyncHandler(exportMetricsCsv),
);
```

```js
// backend/src/app.js
import { adminMetricsRouter } from "./modules/admin-metrics/admin-metrics.routes.js";

// Dentro de createApp(), junto das restantes rotas /api:
app.use("/api/admin/metrics", adminMetricsRouter);
```

5. Explicação do código.

A rota fica sob `/api/admin` para deixar claro que é administrativa. `requireRole(["admin"])` aplica autorização no backend.

6. Validação do passo.

Com sessão admin, `GET /api/admin/metrics` deve devolver `{ metrics: ... }`.

7. Cenário negativo/erro esperado.

Com utilizador sem admin, a rota deve devolver `403`.

### Passo 4 - Criar frontend do painel de métricas

1. Objetivo funcional do passo no contexto da app.

Mostrar métricas agregadas numa página admin.

2. Ficheiros envolvidos:
    - CRIAR: `frontend/src/services/api/metricsApi.js`
    - CRIAR: `frontend/src/pages/AdminMetricsPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZAÇÃO: ficheiros completos e rota nova

3. Instruções do que fazer.

Cria o cliente API, a página e adiciona a rota `/admin/metricas`.

4. Código completo, correto e integrado com a app final.

```js
// frontend/src/services/api/metricsApi.js
import { apiClient } from "./apiClient.js";

export const metricsApi = {
    /**
     * Carrega métricas administrativas agregadas.
     *
     * @param {{ from?: string, to?: string }} filters Filtros temporais.
     * @param {{ signal?: AbortSignal }} options Opções canceláveis do cliente.
     * @returns {Promise<{ metrics: Record<string, unknown> }>} Métricas agregadas.
     */
    getAdminMetrics(filters = {}, options = {}) {
        const params = new URLSearchParams();

        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);

        const query = params.toString();
        return apiClient.get(
            `/api/admin/metrics${query ? `?${query}` : ""}`,
            options,
        );
    },
    exportCsv(filters = {}, options = {}) {
        const params = new URLSearchParams();
        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);
        const query = params.toString();
        return apiClient.download(
            `/api/admin/metrics/export.csv${query ? `?${query}` : ""}`,
            options,
        );
    },
};
```

```jsx
// frontend/src/pages/AdminMetricsPage.jsx
import { useEffect, useRef, useState } from "react";
import { metricsApi } from "../services/api/metricsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

const moneyFormatter = new Intl.NumberFormat("pt-PT", {
    currency: "EUR",
    style: "currency",
});

const EMPTY_FILTERS = Object.freeze({ from: "", to: "" });

function invalidUiRange({ from, to }) {
    return Boolean(from && to && from > to);
}

/**
 * Página admin com métricas agregadas de operação.
 *
 * @returns {JSX.Element} Painel de métricas.
 */
export function AdminMetricsPage() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [retryVersion, setRetryVersion] = useState(0);
    const [exporting, setExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState("");
    const exportControllerRef = useRef(null);
    const requestVersionRef = useRef(0);

    useEffect(() => {
        const version = ++requestVersionRef.current;
        const controller = new AbortController();
        setLoading(true);
        setError("");
        setMetrics(null);

        metricsApi.getAdminMetrics(appliedFilters, {
            signal: controller.signal,
        }).then((response) => {
            if (
                controller.signal.aborted
                || version !== requestVersionRef.current
            ) return;
            setMetrics(response.metrics ?? null);
        }).catch((requestError) => {
            if (
                controller.signal.aborted
                || requestError?.code === "REQUEST_ABORTED"
            ) return;
            if (version !== requestVersionRef.current) return;
            setError(toUserMessage(requestError));
        }).finally(() => {
            if (
                !controller.signal.aborted
                && version === requestVersionRef.current
            ) setLoading(false);
        });

        return () => {
            requestVersionRef.current += 1;
            controller.abort();
        };
    }, [appliedFilters, retryVersion]);

    useEffect(() => () => exportControllerRef.current?.abort(), []);

    /**
     * Valida e aplica os campos visíveis sem reutilizar uma leitura antiga.
     *
     * @param {React.FormEvent<HTMLFormElement>} event Submissão do formulário.
     * @returns {void}
     */
    function handleFiltersSubmit(event) {
        event.preventDefault();
        if (invalidUiRange(draftFilters)) {
            setError("A data inicial não pode ser posterior à data final.");
            return;
        }

        // Um novo objeto agenda também a repetição intencional do mesmo intervalo.
        setAppliedFilters({ ...draftFilters });
    }

    async function handleExport() {
        if (exporting) return;
        const controller = new AbortController();
        exportControllerRef.current = controller;
        setExporting(true);
        setExportStatus("");
        try {
            const file = await metricsApi.exportCsv(appliedFilters, { signal: controller.signal });
            const url = URL.createObjectURL(file.blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = file.filename || "faithflix-metricas.csv";
            link.click();
            URL.revokeObjectURL(url);
            setExportStatus("Exportação CSV preparada.");
        } catch (requestError) {
            if (requestError?.code !== "REQUEST_ABORTED") setError(toUserMessage(requestError));
        } finally {
            if (exportControllerRef.current === controller) {
                exportControllerRef.current = null;
                setExporting(false);
            }
        }
    }

    return (
        <section className="page-section" aria-busy={loading}>
            <p className="section-kicker">Admin</p>
            <h1>Métricas</h1>

            <form className="form-panel" onSubmit={handleFiltersSubmit}>
                <label>
                    Data inicial
                    <input
                        type="date"
                        value={draftFilters.from}
                        onChange={(event) => setDraftFilters((current) => ({
                            ...current,
                            from: event.target.value,
                        }))}
                    />
                </label>
                <label>
                    Data final
                    <input
                        type="date"
                        value={draftFilters.to}
                        onChange={(event) => setDraftFilters((current) => ({
                            ...current,
                            to: event.target.value,
                        }))}
                    />
                </label>
                <button type="submit" disabled={loading}>Atualizar</button>
                <button type="button" disabled={loading || exporting} onClick={handleExport}>
                    {exporting ? "A exportar..." : "Exportar CSV"}
                </button>
            </form>

            {exportStatus ? <p role="status">{exportStatus}</p> : null}

            {loading ? <p role="status">A carregar métricas...</p> : null}
            {!loading && error ? (
                <div role="alert">
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={() => setRetryVersion((current) => current + 1)}
                    >
                        Tentar novamente
                    </button>
                </div>
            ) : null}
            {!loading && !error && !metrics ? (
                <p>Sem métricas para apresentar neste intervalo.</p>
            ) : null}
            {!loading && !error && metrics ? (
                <div className="metric-grid">
                    <article>
                        <h2>Utilizadores</h2>
                        <p>Total: {metrics.users.total}</p>
                        <p>Ativos: {metrics.users.active}</p>
                        <p>Bloqueados: {metrics.users.blocked}</p>
                    </article>
                    <article>
                        <h2>Conteúdos</h2>
                        <p>Publicados: {metrics.catalog.published}</p>
                        <p>Media pendente: {metrics.catalog.mediaPending}</p>
                    </article>
                    <article>
                        <h2>Subscrições</h2>
                        <p>Ativas: {metrics.subscriptions.active}</p>
                        <p>Períodos experimentais: {metrics.subscriptions.trialing}</p>
                        <p>Membros familiares: {metrics.subscriptions.familyMembers}</p>
                    </article>
                    <article>
                        <h2>Notificações</h2>
                        <p>Criadas: {metrics.notifications.created}</p>
                    </article>
                    <article>
                        <h2>Privacidade</h2>
                        <p>Pedidos de eliminação: {metrics.privacy.deletionRequests}</p>
                        <p>Eventos de consentimento: {metrics.privacy.consentEvents}</p>
                    </article>
                    <article>
                        <h2>Associações</h2>
                        <p>Elegíveis: {metrics.solidarity.approvedCharities}</p>
                        <p>
                            Total solidário:{" "}
                            {moneyFormatter.format(metrics.solidarity.distributedCents / 100)}
                        </p>
                    </article>
                    <article>
                        <h2>Integrações</h2>
                        <p>Ativas: {metrics.integrations.enabled}/{metrics.integrations.total}</p>
                        <p>Inválidas: {metrics.integrations.invalid}</p>
                    </article>
                </div>
            ) : null}
        </section>
    );
}
```

```jsx
// frontend/src/routes/AppRoutes.jsx
// ADICIONAR uma única vez, junto das restantes declarações lazy.
const AdminMetricsPage = lazyNamedPage(
    () => import("../pages/AdminMetricsPage.jsx"),
    "AdminMetricsPage",
);

// Dentro de <Routes>:
<Route path="/admin/metricas" element={<AdminMetricsPage />} />
```

5. Explicação do código.

`metricsApi.getAdminMetrics(filters, options)` propaga o `AbortSignal`. A página
separa filtros em edição do último intervalo aplicado, valida a ordem antes de
pedir dados e atribui uma versão a cada leitura. Cleanup, novo submit e retry
invalidam a resposta anterior, pelo que apenas o pedido atual pode alterar
loading, erro ou métricas. O retry repete `appliedFilters`, nunca valores ainda
não submetidos. Erros passam por `toUserMessage` e a UI apresenta loading, erro,
vazio e dados como estados distintos, sempre sem linhas pessoais. A declaração
lazy é adicionada sem substituir o router cumulativo nem os seus boundaries.

6. Validação do passo.

Abre `/admin/metricas` como admin, aplica dois intervalos seguidos e confirma que
só o último aparece. O painel mostra valores EUR com locale `pt-PT`.

7. Cenário negativo/erro esperado.

Sem permissão admin, o backend devolve `403` e a página mostra erro seguro com
retry. Submeter `from > to` mostra a mensagem de validação e não chama a API.

### Passo 5 - Testar validação de datas

1. Objetivo funcional do passo no contexto da app.

Garantir que intervalos inválidos são rejeitados.

2. Ficheiros envolvidos:
    - CRIAR: `backend/tests/unit/mf5-admin-metrics.validation.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o teste abaixo.

4. Código completo, correto e integrado com a app final.

```js
// backend/tests/unit/mf5-admin-metrics.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertMetricsRange } from "../../src/modules/admin-metrics/admin-metrics.validation.js";

test("MF5 valida intervalo temporal das métricas admin", () => {
    const range = assertMetricsRange({
        from: "2026-06-01",
        to: "2026-06-16",
    });

    // Os limites provam que o dia final inteiro entra no intervalo UTC.
    assert.equal(range.from.toISOString(), "2026-06-01T00:00:00.000Z");
    assert.equal(range.to.toISOString(), "2026-06-16T23:59:59.999Z");
    // Os negativos separam formato, calendário, cardinalidade e amplitude da query.
    assert.throws(
        () => assertMetricsRange({ from: "2026-12-01", to: "2026-01-01" }),
        /from/,
    );
    assert.throws(() => assertMetricsRange({ from: "data" }), /YYYY-MM-DD/);
    assert.throws(() => assertMetricsRange({ from: "2026-02-30" }), /data válida/);
    assert.throws(() => assertMetricsRange({ from: ["2026-06-01"] }), /YYYY-MM-DD/);
    assert.throws(() => assertMetricsRange({ to: "" }), /YYYY-MM-DD/);
    assert.throws(() => assertMetricsRange({ from: "2025-01-01", to: "2026-12-31" }), /366 dias/);
    assert.throws(() => assertMetricsRange({ from: "2026-01-01", extra: "x" }), /não permitidos/);
});
```

5. Explicação do código.

O teste cobre limites UTC inclusivos, intervalo invertido, data impossível,
array de query, vazio explícito, campo desconhecido e período superior a 366
dias. Isto impede coerção silenciosa ou queries sem sentido.

6. Validação do passo.

Executa:

```bash
cd backend
node --test tests/unit/mf5-admin-metrics.validation.test.js
```

O resultado esperado é `pass`.

7. Cenário negativo/erro esperado.

Se `from` for posterior a `to`, o teste falha de propósito porque o backend deve rejeitar.

#### Critérios de aceite

- `GET /api/admin/metrics` existe.
- `GET /api/admin/metrics/export.csv` exige admin, reutiliza o intervalo e
  devolve `text/csv` agregado com `private, no-store`, sem nomes/emails.
- A rota exige admin.
- Filtros temporais aceitam apenas valores escalares `YYYY-MM-DD`, com calendário real,
  ordem válida e intervalo máximo de 366 dias.
- A resposta contém apenas métricas agregadas.
- A resposta inclui os domínios `catalog`, `subscriptions`/família,
  `solidarity` e `integrations`, usados também pelo dashboard `/admin`.
- Utilizadores ativos exigem `accountStatus: "active"` e não aceitam um
  `status` legacy bloqueado/inativo; estado canónico ausente ou desconhecido
  falha fechado.
- Pedidos de eliminação são filtrados por `requestedAt`, não por `createdAt`.
- A métrica solidária soma `pool_distributions.totalPoolCents`, alinhada com `BK-MF4-05`.
- A página `/admin/metricas` mostra filtros, loading, erro, vazio, retry e cards
  de métricas em PT-PT.
- A página valida o intervalo antes do pedido, cancela leituras antigas e permite
  retry sem aplicar resultados tardios.
- Não são expostos nomes, emails, comentários ou histórico individual.
- Existe teste unitário para datas.

#### Validação final

Executa:

```bash
cd backend
node --test tests/unit/mf5-admin-metrics.validation.test.js
node -e "import('./src/modules/admin-metrics/admin-metrics.routes.js').then(({ adminMetricsRouter }) => console.log(typeof adminMetricsRouter))"
```

Depois valida no browser:

- admin abre `/admin/metricas`;
- utilizador sem admin recebe erro;
- filtros temporais inválidos devolvem `400`.

#### Evidence para PR/defesa

- `pr`: referência do commit ou PR.
- `proof`: output do teste de validação.
- `proof`: captura de `/admin/metricas`.
- `proof`: CSV agregado do mesmo intervalo, revisto sem PII.
- `neg`: utilizador sem admin recebe `403`.
- `neg`: array, vazio explícito, data impossível, campo desconhecido, inversão
  ou mais de 366 dias devolvem `400`.
- `neg`: dois pedidos fora de ordem deixam visível apenas o último intervalo;
  unmount não atualiza estado.
- `neg`: resposta não contém lista de emails ou nomes.

#### Handoff

`BK-MF5-06` reutiliza a autorização admin e a navegação administrativa.
`BK-MF6-01` deve provar `requestedAt` e os estados fail-closed; `BK-MF6-02`
deve cobrir submit, retry, cancelamento e resposta fora de ordem.

#### Changelog

- `2026-07-12`: métricas expandidas para dashboard operacional e exportação CSV
  privada/cancelável, sem linhas pessoais.

- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com métricas agregadas, rota admin, frontend e teste.
- `2026-07-10`: paths públicos normalizados e painel sincronizado com
  abort/anti-stale, intervalo defensivo, retry e rótulos PT-PT.
- `2026-07-10`: datas passaram a scalar ISO estrito, pedidos RGPD usam
  `requestedAt`, users ativos falham fechado e o snippet frontend ficou
  cancelável com filtros aplicados separados dos drafts.
