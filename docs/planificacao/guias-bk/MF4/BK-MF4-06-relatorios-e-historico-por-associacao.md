# BK-MF4-06 - Relatorios e historico por associacao

## Header

- `doc_id`: `GUIA-BK-MF4-06`
- `bk_id`: `BK-MF4-06`
- `macro`: `MF4`
- `owner`: `Kaue`
- `apoio`: `Mateus`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF4-05`
- `rf_rnf`: `RF46, RF47, RF48`
- `fase_documental`: `Fase 2`
- `sprint`: `S08`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF5-01`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-06-relatorios-e-historico-por-associacao.md`
- `last_updated`: `2026-06-13`

## Bloco pedagogico (obrigatorio)

Neste BK vais criar transparencia sobre a pool solidaria: painel admin, historico privado por associacao e pagina publica agregada sem dados sensiveis.

### Objetivo pedagogico

- Ler distribuicoes mensais sem recalcular valores.
- Proteger historico privado de cada associacao.
- Criar uma pagina publica com associacoes aprovadas.
- Exportar CSV simples para evidencia PAP.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se o ownership por associacao nao estiver claro, nao avancar para frontend.

### Conceitos essenciais

- Relatorio e leitura organizada de dados ja persistidos.
- Historico por associacao filtra itens de `pool_distributions`.
- Pagina publica nao mostra emails, contactos internos nem valores privados por entidade se nao forem necessarios.
- `CANONICO`: RF46 exige painel da distribuicao; RF47 historico por associacao; RF48 pagina publica.
- `DERIVADO`: uma associacao autenticada e representada por um utilizador normal ligado a uma associacao na colecao `charity_memberships`; assim nao e preciso criar uma role nova fora do contrato de `BK-MF2-02`.

### Erros comuns

- Recalcular a distribuicao no relatorio.
- Permitir que associacao A veja dados privados da associacao B.
- Expor emails de contacto na pagina publica.
- Gerar CSV com dados sensiveis.

### Check de compreensao

- [ ] Sei explicar a diferenca entre relatorio admin, historico privado e pagina publica.
- [ ] Sei indicar que dados sao publicos.
- [ ] Sei provar que acesso cruzado e bloqueado.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF4-05` executado com `pool_distributions`.
- `BK-MF2-02` executado com utilizadores autenticados e role `admin`.
- `charities` contem associacoes aprovadas.
- `requireAuth` e `requireRole` disponiveis.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar service de relatorios

1. Objetivo do passo.

Ler dados persistidos para admin, associacao e publico.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-reports.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

/**
 * Converte identificadores recebidos em `ObjectId` com erro de dominio.
 *
 * @param {string} id Identificador recebido da rota, sessao ou corpo.
 * @param {string} label Nome usado na mensagem de erro.
 * @returns {ObjectId} Identificador MongoDB.
 * @throws {Error} Quando o identificador e invalido.
 */
function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(id);
}

/**
 * Remove contactos internos antes de expor uma associacao publicamente.
 *
 * @param {object} charity Documento da colecao `charities`.
 * @returns {object} Associacao publica.
 */
function publicCharity(charity) {
  return {
    id: String(charity._id),
    name: charity.name,
    mission: charity.mission,
    websiteUrl: charity.websiteUrl,
    approvedAt: charity.approvedAt,
  };
}

/**
 * Normaliza uma ligacao utilizador-associacao para resposta da API.
 *
 * @param {object} membership Documento da colecao `charity_memberships`.
 * @returns {object} Ligacao publica.
 */
function publicMembership(membership) {
  return {
    userId: String(membership.userId),
    charityId: String(membership.charityId),
    createdAt: membership.createdAt,
    updatedAt: membership.updatedAt,
  };
}

/**
 * Cria indices de ownership entre utilizadores e associacoes.
 *
 * @returns {Promise<void>}
 */
export async function ensureCharityReportIndexes() {
  const db = await getDb();
  await db.collection("charity_memberships").createIndex({ userId: 1 }, { unique: true });
  await db.collection("charity_memberships").createIndex({ charityId: 1 });
}

/**
 * Liga um utilizador existente a uma associacao elegivel.
 *
 * @param {string} charityId Identificador da associacao.
 * @param {string} userId Identificador do utilizador que passara a consultar historico.
 * @param {string} createdByUserId Identificador do admin que cria a ligacao.
 * @returns {Promise<{ membership: object }>} Ligacao criada ou atualizada.
 * @throws {Error} Quando a associacao ou o utilizador nao existem.
 */
export async function linkUserToCharity(charityId, userId, createdByUserId) {
  const db = await getDb();
  const charityObjectId = asObjectId(charityId, "Associacao");
  const userObjectId = asObjectId(userId, "Utilizador");
  const createdByObjectId = asObjectId(createdByUserId, "Admin");

  // Apenas associacoes ativas e elegiveis podem receber utilizadores associados.
  const charity = await db.collection("charities").findOne({
    _id: charityObjectId,
    status: "active",
    poolStatus: "eligible",
  });

  if (!charity) {
    const error = new Error("Associacao ativa e elegivel nao encontrada.");
    error.statusCode = 404;
    throw error;
  }

  // A ligacao exige um utilizador real para nao criar ownership quebrado.
  const user = await db.collection("users").findOne({ _id: userObjectId });

  if (!user) {
    const error = new Error("Utilizador nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  // Um utilizador fica ligado a uma associacao de cada vez; `upsert` permite corrigir a ligacao.
  await db.collection("charity_memberships").updateOne(
    { userId: userObjectId },
    {
      $set: {
        charityId: charityObjectId,
        updatedAt: now,
      },
      $setOnInsert: {
        userId: userObjectId,
        createdBy: createdByObjectId,
        createdAt: now,
      },
    },
    { upsert: true },
  );

  const membership = await db.collection("charity_memberships").findOne({ userId: userObjectId });
  return { membership: publicMembership(membership) };
}

/**
 * Obtem a associacao ligada ao utilizador autenticado.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {Promise<object>} Documento de ligacao.
 * @throws {Error} Quando o utilizador nao esta ligado a uma associacao.
 */
export async function getMyCharityMembership(userId) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const membership = await db.collection("charity_memberships").findOne({ userId: userObjectId });

  if (!membership) {
    const error = new Error("Este utilizador nao esta ligado a uma associacao.");
    error.statusCode = 403;
    throw error;
  }

  return membership;
}

/**
 * Devolve os ultimos meses de distribuicao para painel admin.
 *
 * @returns {Promise<{ months: object[] }>} Totais mensais agregados.
 */
export async function getPoolDashboard() {
  const db = await getDb();
  const runs = await db.collection("pool_distributions").find({}).sort({ month: -1 }).limit(12).toArray();
  return {
    months: runs.map((run) => ({
      month: run.month,
      totalPoolCents: run.totalPoolCents,
      charitiesCount: run.items.length,
      status: run.status,
    })),
  };
}

/**
 * Devolve historico de distribuicoes para uma associacao.
 *
 * @param {string} charityId Identificador da associacao.
 * @returns {Promise<{ charityId: string, totalCents: number, rows: object[] }>} Historico agregado.
 */
export async function getCharityHistory(charityId) {
  const db = await getDb();
  const charityObjectId = asObjectId(charityId, "Associacao");
  const runs = await db.collection("pool_distributions").find({ "items.charityId": charityObjectId }).sort({ month: -1 }).toArray();
  const rows = runs.map((run) => {
    // O valor vem do registo mensal persistido; o relatorio nao recalcula distribuicoes antigas.
    const item = run.items.find((entry) => String(entry.charityId) === String(charityObjectId));
    return {
      month: run.month,
      amountCents: item.amountCents,
      rotationPosition: item.rotationPosition,
    };
  });

  return {
    charityId,
    totalCents: rows.reduce((total, row) => total + row.amountCents, 0),
    rows,
  };
}

/**
 * Lista associacoes elegiveis para a pagina publica.
 *
 * @returns {Promise<{ charities: object[] }>} Associacoes sem contactos internos.
 */
export async function listPublicCharities() {
  const db = await getDb();
  const charities = await db.collection("charities").find({
    status: "active",
    poolStatus: "eligible",
  }).sort({ approvedAt: 1 }).toArray();

  return { charities: charities.map(publicCharity) };
}

/**
 * Converte historico de uma associacao para CSV simples.
 *
 * @param {{ rows: object[] }} history Historico devolvido por `getCharityHistory`.
 * @returns {string} CSV com cabecalho e linhas de distribuicao.
 */
export function historyToCsv(history) {
  const header = "month,amount_cents,rotation_position";
  const lines = history.rows.map((row) => `${row.month},${row.amountCents},${row.rotationPosition}`);
  return [header, ...lines].join("\n");
}
```

5. Explicacao do codigo ou da decisao.

O service le `pool_distributions`; nao recalcula a pool. A colecao `charity_memberships` cria o ownership entre um utilizador autenticado e uma associacao sem alterar o contrato de roles da app.

6. Validacao do passo.

```bash
node -e "import('./src/modules/charities/charity-reports.service.js').then((m) => console.log(typeof m.getPoolDashboard, typeof m.linkUserToCharity, typeof m.historyToCsv))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Recalcular valores no relatorio pode alterar resultados antigos se os planos mudarem.

### Passo 2 - Criar controller e rotas de relatorio

1. Objetivo do passo.

Expor dashboard admin, historico privado, CSV e pagina publica.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-reports.controller.js`
    - EDITAR: `backend/src/modules/charities/charities.routes.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Acrescenta rotas ao router existente.

4. Codigo completo.

`backend/src/modules/charities/charity-reports.controller.js`

```js
import {
  getCharityHistory,
  getMyCharityMembership,
  getPoolDashboard,
  historyToCsv,
  linkUserToCharity,
  listPublicCharities,
} from "./charity-reports.service.js";

/**
 * Confirma se o utilizador pode ler o historico de uma associacao.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {string} charityId Identificador da associacao consultada.
 * @returns {Promise<void>}
 * @throws {Error} Quando o utilizador nao tem permissao.
 */
async function assertCanReadCharity(req, charityId) {
  if (req.user.role === "admin") return;
  const membership = await getMyCharityMembership(req.user.id);
  if (String(membership.charityId) === String(charityId)) return;

  const error = new Error("Nao tens permissao para consultar esta associacao.");
  error.statusCode = 403;
  throw error;
}

/**
 * Devolve painel agregado da pool para administradores.
 *
 * @param {import("express").Request} _req Pedido autenticado como admin.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getPoolDashboardController(_req, res) {
  res.status(200).json(await getPoolDashboard());
}

/**
 * Liga um utilizador a uma associacao por acao administrativa.
 *
 * @param {import("express").Request} req Pedido com `params.id`, `body.userId` e `user.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postCharityMember(req, res) {
  res.status(201).json(await linkUserToCharity(req.params.id, req.body.userId, req.user.id));
}

/**
 * Devolve historico privado de uma associacao depois de validar permissao.
 *
 * @param {import("express").Request} req Pedido com `params.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getCharityHistoryController(req, res) {
  await assertCanReadCharity(req, req.params.id);
  res.status(200).json(await getCharityHistory(req.params.id));
}

/**
 * Exporta historico privado em CSV depois de validar permissao.
 *
 * @param {import("express").Request} req Pedido com `params.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getCharityHistoryCsv(req, res) {
  await assertCanReadCharity(req, req.params.id);
  const history = await getCharityHistory(req.params.id);
  // O content type explicito ajuda browsers e ferramentas de defesa a reconhecer o ficheiro.
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.status(200).send(historyToCsv(history));
}

/**
 * Devolve associacoes publicas sem dados de contacto internos.
 *
 * @param {import("express").Request} _req Pedido publico.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getPublicCharities(_req, res) {
  res.status(200).json(await listPublicCharities());
}
```

Rotas a adicionar:

```js
// A rota publica vem antes de `/:id/...` para evitar ambiguidades de routing.
charitiesRouter.get("/public", asyncHandler(getPublicCharities));
charitiesRouter.get("/pool/dashboard", requireRole(["admin"]), asyncHandler(getPoolDashboardController));
charitiesRouter.post("/:id/members", requireRole(["admin"]), asyncHandler(postCharityMember));
charitiesRouter.get("/:id/history", requireAuth, asyncHandler(getCharityHistoryController));
charitiesRouter.get("/:id/history.csv", requireAuth, asyncHandler(getCharityHistoryCsv));
```

No arranque do backend, importar e executar a criacao dos indices:

```js
import { ensureCharityReportIndexes } from "./modules/charities/charity-reports.service.js";

await ensureCharityReportIndexes();
```

5. Explicacao do codigo ou da decisao.

`assertCanReadCharity` aplica ownership. Admin ve tudo; qualquer outro utilizador autenticado precisa de estar ligado a essa associacao em `charity_memberships`.

6. Validacao do passo.

```bash
curl -i http://localhost:3000/api/charities/public
curl -i http://localhost:3000/api/charities/ID/history
curl -i -X POST http://localhost:3000/api/charities/ID/members -H "Content-Type: application/json" -d '{"userId":"USER_ID"}'
```

Sem sessao, historico privado devolve `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem ownership, uma associacao podia consultar valores de outra.

### Passo 3 - Criar paginas frontend

1. Objetivo do passo.

Mostrar pagina publica e painel admin simples.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/charitiesApi.js`
    - CRIAR: `frontend/src/pages/PublicCharitiesPage.jsx`
    - CRIAR: `frontend/src/pages/AdminPoolDashboardPage.jsx`
    - CRIAR: `frontend/src/pages/CharityHistoryPage.jsx`
    - CRIAR: `frontend/src/pages/AdminCharityMembersPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`

3. Instrucoes concretas.

Acrescenta chamadas API e rotas `/charities` e `/admin/pool`.

4. Codigo completo.

Adicionar a `charitiesApi`:

```js
/**
 * Lista associacoes elegiveis para pagina publica.
 *
 * @returns {Promise<{ charities: object[] }>} Associacoes publicas.
 */
listPublicCharities() {
  return apiClient.get("/api/charities/public");
},
/**
 * Obtem totais mensais agregados da pool.
 *
 * @returns {Promise<{ months: object[] }>} Meses recentes.
 */
getPoolDashboard() {
  return apiClient.get("/api/charities/pool/dashboard");
},
/**
 * Obtem historico privado de uma associacao.
 *
 * @param {string} charityId Identificador da associacao.
 * @returns {Promise<object>} Historico com linhas mensais.
 */
getCharityHistory(charityId) {
  return apiClient.get(`/api/charities/${encodeURIComponent(charityId)}/history`);
},
/**
 * Liga um utilizador a uma associacao.
 *
 * @param {string} charityId Identificador da associacao.
 * @param {string} userId Identificador do utilizador.
 * @returns {Promise<{ membership: object }>} Ligacao criada.
 */
linkUserToCharity(charityId, userId) {
  return apiClient.post(`/api/charities/${encodeURIComponent(charityId)}/members`, { userId });
}
```

`frontend/src/pages/PublicCharitiesPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Pagina publica com associacoes apoiadas pelo FaithFlix.
 *
 * @returns {JSX.Element} Lista publica sem contactos internos.
 */
export function PublicCharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Carrega associacoes publicas e separa loading de estado vazio.
     *
     * @returns {Promise<void>}
     */
    async function loadCharities() {
      setLoading(true);
      setError("");
      try {
        const response = await charitiesApi.listPublicCharities();
        setCharities(response.charities);
      } catch (apiError) {
        setError(toUserMessage(apiError));
      } finally {
        setLoading(false);
      }
    }

    loadCharities();
  }, []);

  return (
    <main>
      <h1>Associacoes apoiadas</h1>
      {error && <p role="alert">{error}</p>}
      {loading && <p>A carregar associacoes...</p>}
      {!loading && charities.length === 0 && !error && <p>Ainda nao existem associacoes publicas.</p>}
      {charities.map((charity) => (
        <article key={charity.id}>
          <h2>{charity.name}</h2>
          <p>{charity.mission}</p>
          {charity.websiteUrl && <a href={charity.websiteUrl} target="_blank" rel="noreferrer">Website</a>}
        </article>
      ))}
    </main>
  );
}
```

`frontend/src/pages/AdminPoolDashboardPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Painel administrativo com resumo dos ultimos meses da pool.
 *
 * @returns {JSX.Element} Lista de meses e totais agregados.
 */
export function AdminPoolDashboardPage() {
  const [months, setMonths] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Carrega dashboard admin sem recalcular valores no browser.
     *
     * @returns {Promise<void>}
     */
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const response = await charitiesApi.getPoolDashboard();
        setMonths(response.months);
      } catch (apiError) {
        setError(toUserMessage(apiError));
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <main>
      <h1>Painel da pool</h1>
      {error && <p role="alert">{error}</p>}
      {loading && <p>A carregar painel...</p>}
      {!loading && months.length === 0 && !error && <p>Sem distribuicoes registadas.</p>}
      {months.map((month) => (
        <article key={month.month}>
          <h2>{month.month}</h2>
          <p>Total: {(month.totalPoolCents / 100).toFixed(2)} EUR</p>
          <p>Associacoes: {month.charitiesCount}</p>
        </article>
      ))}
    </main>
  );
}
```

`frontend/src/pages/CharityHistoryPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Pagina privada de historico de uma associacao.
 *
 * @returns {JSX.Element} Totais e linhas mensais da associacao permitida.
 */
export function CharityHistoryPage() {
  const { charityId } = useParams();
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    /**
     * Carrega historico ja protegido pelo backend.
     *
     * @returns {Promise<void>}
     */
    async function loadHistory() {
      setError("");
      try {
        const response = await charitiesApi.getCharityHistory(charityId);
        setHistory(response);
      } catch (apiError) {
        setError(toUserMessage(apiError));
      }
    }

    loadHistory();
  }, [charityId]);

  return (
    <main>
      <h1>Historico da associacao</h1>
      {error && <p role="alert">{error}</p>}
      {!history && !error && <p>A carregar historico...</p>}
      {history && (
        <>
          <p>Total recebido: {(history.totalCents / 100).toFixed(2)} EUR</p>
          {history.rows.length === 0 && <p>Sem distribuicoes registadas.</p>}
          {history.rows.map((row) => (
            <article key={row.month}>
              <h2>{row.month}</h2>
              <p>Valor: {(row.amountCents / 100).toFixed(2)} EUR</p>
              <p>Posicao na rotacao: {row.rotationPosition}</p>
            </article>
          ))}
        </>
      )}
    </main>
  );
}
```

`frontend/src/pages/AdminCharityMembersPage.jsx`

```jsx
import { useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Painel admin para criar ownership entre utilizador e associacao.
 *
 * @returns {JSX.Element} Formulario administrativo de ligacao.
 */
export function AdminCharityMembersPage() {
  const [charityId, setCharityId] = useState("");
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /**
   * Envia a ligacao para o backend e mostra o resultado.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulario.
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    setError("");

    try {
      const response = await charitiesApi.linkUserToCharity(charityId, userId);
      setStatus(`Utilizador ligado a associacao ${response.membership.charityId}.`);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Ligar utilizador a associacao</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="charityId">ID da associacao</label>
        <input id="charityId" value={charityId} onChange={(event) => setCharityId(event.target.value)} required />
        <label htmlFor="userId">ID do utilizador</label>
        <input id="userId" value={userId} onChange={(event) => setUserId(event.target.value)} required />
        <button type="submit" disabled={submitting}>
          {submitting ? "A guardar..." : "Guardar ligacao"}
        </button>
      </form>
      {status && <p>{status}</p>}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
```

5. Explicacao do codigo ou da decisao.

A pagina publica mostra apenas dados institucionais. O painel admin mostra totais mensais agregados e a pagina de ligacao permite ao admin criar o ownership necessario para o historico privado.

A pagina publica e o painel admin distinguem loading de estado vazio, evitando mostrar mensagens de ausencia antes de a resposta chegar. O link publico usa o website validado no `BK-MF4-03` e abre como link externo com `rel="noreferrer"`.

6. Validacao do passo.

Abrir `/charities` sem login, `/admin/pool` com admin, `/admin/charity-members` com admin e `/charities/:charityId/history` com o utilizador ligado a essa associacao.

7. Caso negativo, erro comum ou risco que este passo evita.

Expor email da associacao na pagina publica pode criar risco de privacidade e spam.

## Criterios de aceite (mensuraveis)

- `GET /api/charities/public` devolve associacoes elegiveis sem contactos internos.
- `GET /api/charities/pool/dashboard` exige admin.
- `POST /api/charities/:id/members` exige admin e liga um utilizador existente a uma associacao elegivel.
- Historico privado bloqueia acesso cruzado entre associacoes.
- CSV devolve `text/csv` com linhas coerentes com o historico.

## Validacao final

```bash
cd backend
npm test
```

Testar pagina publica, dashboard admin, ligacao admin de utilizador a associacao e acesso cruzado bloqueado.

## Evidence para PR/defesa

- `pr`: commit/PR com reports service, memberships e paginas.
- `proof`: captura da pagina publica, dashboard admin e historico privado do utilizador ligado.
- `neg`: associacao A bloqueada ao consultar associacao B, periodo sem dados e dashboard sem admin.

## Handoff

`BK-MF5-01` pode usar estes relatorios como contexto de dados pessoais a exportar, mas deve manter privacidade, ownership por `charity_memberships` e limites de dados publicos.

## Snippet tecnico aplicavel

```js
// Admin ve tudo; utilizador ligado a associacao ve apenas o seu proprio historico.
if (req.user.role === "admin") return;
const membership = await getMyCharityMembership(req.user.id);
if (String(membership.charityId) === String(charityId)) return;
```

## Changelog

- `2026-06-13`: guia reescrito com dashboard, historico privado, CSV, pagina publica e ownership.
