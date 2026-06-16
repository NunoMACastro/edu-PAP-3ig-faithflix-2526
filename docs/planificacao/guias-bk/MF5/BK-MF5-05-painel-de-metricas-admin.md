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
- `last_updated`: `2026-06-16`

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
- Validar intervalo temporal opcional.
- Agregar contagens por coleção.
- Criar cliente frontend `metricsApi`.
- Criar página `/admin/metricas`.
- Adicionar rota frontend.
- Criar teste unitário da validação de datas.

#### Scope-out

- Gráficos avançados.
- Exportação PDF/CSV.
- Dados pessoais individuais.
- Monitorização técnica de infraestrutura.
- Alertas automáticos.

#### Estado antes e depois

Antes deste BK, a administração consegue gerir utilizadores, associações e pool, mas não tem visão agregada de operação.

Depois deste BK, existe um endpoint admin com métricas agregadas e uma página frontend para leitura rápida.

#### Pre-requisitos

- `BK-MF5-04` protege rotas admin com `requireRole(["admin"])`.
- `BK-MF2` criou catálogo, histórico e biblioteca.
- `BK-MF4` criou subscrições, notificações e pool solidária.
- `apps/frontend/src/routes/AppRoutes.jsx` já tem rotas admin.

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
| Autorização | `requireRole(["admin"])` |
| Validator | `assertMetricsRange(query)` |
| Service | `getAdminMetrics(query)` |
| Frontend API | `metricsApi.getAdminMetrics(filters)` |
| Página | `AdminMetricsPage` em `/admin/metricas` |
| Teste | `mf5-admin-metrics.validation.test.js` |

#### Ficheiros a criar/editar/rever

- CRIAR: `apps/backend/src/modules/admin-metrics/admin-metrics.validation.js`
- CRIAR: `apps/backend/src/modules/admin-metrics/admin-metrics.service.js`
- CRIAR: `apps/backend/src/modules/admin-metrics/admin-metrics.controller.js`
- CRIAR: `apps/backend/src/modules/admin-metrics/admin-metrics.routes.js`
- EDITAR: `apps/backend/src/app.js`
- CRIAR: `apps/frontend/src/services/api/metricsApi.js`
- CRIAR: `apps/frontend/src/pages/AdminMetricsPage.jsx`
- EDITAR: `apps/frontend/src/routes/AppRoutes.jsx`
- CRIAR: `apps/backend/tests/unit/mf5-admin-metrics.validation.test.js`
- REVER: `RF59`, `RNF19`, `RNF30`, `BK-MF5-04`

#### Tutorial técnico linear

### Passo 1 - Validar intervalo temporal de métricas

1. Objetivo funcional do passo no contexto da app.

Garantir que filtros `from` e `to` são datas válidas e numa ordem correta.

2. Ficheiros envolvidos:
    - CRIAR: `apps/backend/src/modules/admin-metrics/admin-metrics.validation.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria a pasta `admin-metrics` e adiciona o validator.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/src/modules/admin-metrics/admin-metrics.validation.js
import { HttpError } from "../../utils/http-error.js";

const MAX_RANGE_DAYS = 366;

/**
 * Converte uma data opcional de query string.
 *
 * @param {unknown} value Valor recebido.
 * @param {string} field Nome do campo.
 * @returns {Date | null} Data validada ou null.
 * @throws {HttpError} Quando a data é inválida.
 */
function optionalDate(value, field) {
    if (!value) return null;

    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
        throw new HttpError(400, `${field} deve ser uma data válida.`);
    }

    return date;
}

/**
 * Valida filtros temporais do painel admin.
 *
 * @param {{ from?: unknown, to?: unknown }} query Query string recebida.
 * @returns {{ from: Date, to: Date }} Intervalo validado.
 */
export function assertMetricsRange(query = {}) {
    const now = new Date();
    const to = optionalDate(query.to, "to") ?? now;
    const from =
        optionalDate(query.from, "from") ??
        new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (from > to) {
        throw new HttpError(400, "from deve ser anterior ou igual a to.");
    }

    const rangeDays = (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000);

    if (rangeDays > MAX_RANGE_DAYS) {
        throw new HttpError(400, "O intervalo máximo é de 366 dias.");
    }

    return { from, to };
}
```

5. Explicação do código.

O validator aceita filtros opcionais. Sem filtros, usa os últimos 30 dias. Um limite anual evita consultas demasiado largas em ambiente escolar.

6. Validação do passo.

Executa:

```bash
cd apps/backend
node -e "import('./src/modules/admin-metrics/admin-metrics.validation.js').then(({ assertMetricsRange }) => console.log(assertMetricsRange({}).from instanceof Date))"
```

O resultado esperado é `true`.

7. Cenário negativo/erro esperado.

`from=2026-12-01&to=2026-01-01` deve devolver `400`, porque o intervalo está invertido.

### Passo 2 - Criar service de métricas agregadas

1. Objetivo funcional do passo no contexto da app.

Calcular números agregados sem expor linhas individuais.

2. Ficheiros envolvidos:
    - CRIAR: `apps/backend/src/modules/admin-metrics/admin-metrics.service.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o service abaixo.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/src/modules/admin-metrics/admin-metrics.service.js
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
        // Contas eliminadas deixam de representar utilização activa da plataforma.
        count(db, "users", { accountStatus: { $nin: ["blocked", "deleted"] } }),
        count(db, "users", { accountStatus: "blocked" }),
        count(db, "contents", { status: "published" }),
        count(db, "subscriptions", { status: "active" }),
        count(db, "subscriptions", { status: "trialing" }),
        count(db, "notifications", createdInRange),
        count(db, "privacy_deletion_requests", createdInRange),
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

O service devolve apenas números. `createdInRange` limita eventos recentes para notificações, eliminações e consentimentos. `users.active` exclui contas `blocked` e `deleted`, porque uma conta eliminada já não representa utilização activa da plataforma. A soma solidária usa `totalPoolCents`, que é o campo gravado por `BK-MF4-05` em `pool_distributions`, e devolve apenas total em cêntimos.

6. Validação do passo.

Executa:

```bash
cd apps/backend
node -e "import('./src/modules/admin-metrics/admin-metrics.service.js').then(({ getAdminMetrics }) => console.log(typeof getAdminMetrics))"
```

O resultado esperado é `function`.

7. Cenário negativo/erro esperado.

Se o service devolvesse listas de utilizadores ou emails, o painel violaria minimização. Aqui só há contagens.

### Passo 3 - Criar controller, rota e montagem

1. Objetivo funcional do passo no contexto da app.

Expor métricas agregadas apenas para administradores.

2. Ficheiros envolvidos:
    - CRIAR: `apps/backend/src/modules/admin-metrics/admin-metrics.controller.js`
    - CRIAR: `apps/backend/src/modules/admin-metrics/admin-metrics.routes.js`
    - EDITAR: `apps/backend/src/app.js`
    - LOCALIZAÇÃO: ficheiros completos e montagem de rota

3. Instruções do que fazer.

Cria controller/route e monta no prefixo `/api/admin/metrics`.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/src/modules/admin-metrics/admin-metrics.controller.js
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
```

```js
// apps/backend/src/modules/admin-metrics/admin-metrics.routes.js
import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireRole } from "../auth/auth.middleware.js";
import { getAdminMetricsController } from "./admin-metrics.controller.js";

export const adminMetricsRouter = Router();

adminMetricsRouter.get(
    "/",
    requireRole(["admin"]),
    asyncHandler(getAdminMetricsController),
);
```

```js
// apps/backend/src/app.js
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
    - CRIAR: `apps/frontend/src/services/api/metricsApi.js`
    - CRIAR: `apps/frontend/src/pages/AdminMetricsPage.jsx`
    - EDITAR: `apps/frontend/src/routes/AppRoutes.jsx`
    - LOCALIZAÇÃO: ficheiros completos e rota nova

3. Instruções do que fazer.

Cria o cliente API, a página e adiciona a rota `/admin/metricas`.

4. Código completo, correto e integrado com a app final.

```js
// apps/frontend/src/services/api/metricsApi.js
import { apiClient } from "./apiClient.js";

export const metricsApi = {
    /**
     * Carrega métricas administrativas agregadas.
     *
     * @param {{ from?: string, to?: string }} filters Filtros temporais.
     * @returns {Promise<{ metrics: Record<string, unknown> }>} Métricas agregadas.
     */
    getAdminMetrics(filters = {}) {
        const params = new URLSearchParams();

        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);

        const query = params.toString();
        return apiClient.get(`/api/admin/metrics${query ? `?${query}` : ""}`);
    },
};
```

```jsx
// apps/frontend/src/pages/AdminMetricsPage.jsx
import { useEffect, useState } from "react";
import { metricsApi } from "../services/api/metricsApi.js";

/**
 * Página admin com métricas agregadas de operação.
 *
 * @returns {JSX.Element} Painel de métricas.
 */
export function AdminMetricsPage() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        metricsApi
            .getAdminMetrics()
            .then((response) => setMetrics(response.metrics))
            .catch((requestError) => setError(requestError.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="page-section">
                <p>A carregar métricas...</p>
            </section>
        );
    }

    return (
        <section className="page-section">
            <p className="section-kicker">Admin</p>
            <h1>Métricas</h1>
            {error ? <p role="alert">{error}</p> : null}
            {!error && metrics ? (
                <div className="metric-grid">
                    <article>
                        <h2>Utilizadores</h2>
                        <p>Total: {metrics.users.total}</p>
                        <p>Ativos: {metrics.users.active}</p>
                        <p>Bloqueados: {metrics.users.blocked}</p>
                    </article>
                    <article>
                        <h2>Conteúdos</h2>
                        <p>Publicados: {metrics.content.published}</p>
                    </article>
                    <article>
                        <h2>Subscrições</h2>
                        <p>Ativas: {metrics.subscriptions.active}</p>
                        <p>Trial: {metrics.subscriptions.trialing}</p>
                    </article>
                    <article>
                        <h2>Privacidade</h2>
                        <p>Eliminações: {metrics.privacy.deletionRequests}</p>
                        <p>Eventos de consentimento: {metrics.privacy.consentEvents}</p>
                    </article>
                    <article>
                        <h2>Associações</h2>
                        <p>Elegíveis: {metrics.charities.approvedInPool}</p>
                        <p>Total solidário: {(metrics.charities.solidarityCents / 100).toFixed(2)} EUR</p>
                    </article>
                </div>
            ) : null}
        </section>
    );
}
```

```jsx
// apps/frontend/src/routes/AppRoutes.jsx
import { AdminMetricsPage } from "../pages/AdminMetricsPage.jsx";

// Dentro de <Routes>:
<Route path="/admin/metricas" element={<AdminMetricsPage />} />
```

5. Explicação do código.

A página usa `metricsApi` e mostra apenas agregados. Não há tabela com pessoas individuais. Se a API falhar, o erro aparece em `role="alert"`.

6. Validação do passo.

Abre `/admin/metricas` como admin. A página deve mostrar cards de métricas.

7. Cenário negativo/erro esperado.

Sem permissão admin, o backend devolve `403` e a página mostra erro.

### Passo 5 - Testar validação de datas

1. Objetivo funcional do passo no contexto da app.

Garantir que intervalos inválidos são rejeitados.

2. Ficheiros envolvidos:
    - CRIAR: `apps/backend/tests/unit/mf5-admin-metrics.validation.test.js`
    - LOCALIZAÇÃO: ficheiro completo

3. Instruções do que fazer.

Cria o teste abaixo.

4. Código completo, correto e integrado com a app final.

```js
// apps/backend/tests/unit/mf5-admin-metrics.validation.test.js
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertMetricsRange } from "../../src/modules/admin-metrics/admin-metrics.validation.js";

test("MF5 valida intervalo temporal das métricas admin", () => {
    const range = assertMetricsRange({
        from: "2026-06-01",
        to: "2026-06-16",
    });

    assert.equal(range.from instanceof Date, true);
    assert.equal(range.to instanceof Date, true);
    assert.throws(
        () => assertMetricsRange({ from: "2026-12-01", to: "2026-01-01" }),
        /from/,
    );
    assert.throws(() => assertMetricsRange({ from: "data" }), /data válida/);
});
```

5. Explicação do código.

O teste cobre intervalo válido, datas invertidas e data inválida. Isto impede queries sem sentido.

6. Validação do passo.

Executa:

```bash
cd apps/backend
node --test tests/unit/mf5-admin-metrics.validation.test.js
```

O resultado esperado é `pass`.

7. Cenário negativo/erro esperado.

Se `from` for posterior a `to`, o teste falha de propósito porque o backend deve rejeitar.

#### Critérios de aceite

- `GET /api/admin/metrics` existe.
- A rota exige admin.
- Filtros temporais são validados.
- A resposta contém apenas métricas agregadas.
- Utilizadores activos excluem contas `blocked` e `deleted`.
- A métrica solidária soma `pool_distributions.totalPoolCents`, alinhada com `BK-MF4-05`.
- A página `/admin/metricas` mostra loading, erro e cards de métricas.
- Não são expostos nomes, emails, comentários ou histórico individual.
- Existe teste unitário para datas.

#### Validação final

Executa:

```bash
cd apps/backend
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
- `neg`: utilizador sem admin recebe `403`.
- `neg`: data inválida devolve `400`.
- `neg`: resposta não contém lista de emails ou nomes.

#### Handoff

`BK-MF5-06` deve reutilizar a autorização admin e a navegação administrativa. `BK-MF6-01` pode usar `/api/admin/metrics` como uma das rotas de regressão backend.

#### Changelog

- `2026-04-13`: criado guia base com contrato pedagógico v3.
- `2026-06-16`: guia reescrito com métricas agregadas, rota admin, frontend e teste.
