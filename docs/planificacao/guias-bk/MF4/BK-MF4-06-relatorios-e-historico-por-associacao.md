# BK-MF4-06 - Relatórios e histórico por associação

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

## Bloco pedagógico (obrigatório)

Neste BK vais criar transparência sobre a pool solidária: painel admin, histórico privado por associação e página pública agregada sem dados sensíveis.

### Objetivo pedagógico

- Ler distribuições mensais sem recalcular valores.
- Proteger histórico privado de cada associação.
- Criar uma página pública com associações aprovadas.
- Exportar CSV simples para evidencia PAP.

### Importância funcional

- A pool solidária só é confiável se a equipa conseguir mostrar histórico, transparência e limites de acesso.
- Este BK fecha a parte visível da monetização solidária: admin vê agregados, associação vê apenas o seu histórico e visitantes veem informação pública.
- O CSV ajuda a defender a solução com evidência objetiva.

### Scope-in

- Criar dashboard admin da pool.
- Criar ligação entre utilizador autenticado e associação.
- Criar histórico privado por associação com ownership.
- Criar exportação CSV simples.
- Criar página pública de associações aprovadas.

### Scope-out

- Não recalcular distribuição mensal; o BK lê `pool_distributions`.
- Não expor emails, contactos internos ou dados privados na página pública.
- Não criar role nova para associação sem contrato documental.
- Não exportar PDF avançado; CSV simples é suficiente para o MVP.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se o ownership por associação não estiver claro, não avançar para frontend.

### Glossário rápido

- Dashboard admin: visão agregada da pool para administração.
- Histórico privado: distribuição filtrada por associação.
- Página pública: apresentação segura das associações aprovadas.
- Membership: ligação entre utilizador autenticado e associação.

### Conceitos teóricos essenciais

- Domínio FaithFlix: relatórios dão transparência ao impacto social sem expor dados privados.
- Backend: o controller verifica se o utilizador pode ler aquela associação antes de devolver histórico.
- Frontend: páginas diferentes mostram público, admin e associação, cada uma com dados próprios.
- Segurança: admin vê tudo; associação só vê dados ligados por `charity_memberships`.
- Dados: o service lê `pool_distributions` e cria `charity_memberships` para ownership.
- `CANONICO`: RF46 exige painel da distribuição; RF47 histórico por associação; RF48 página pública.
- `DERIVADO`: uma associação autenticada é representada por um utilizador normal ligado a uma associação na coleção `charity_memberships`; assim não é preciso criar uma role nova fora do contrato de `BK-MF2-02`.

### Erros comuns

- Recalcular a distribuição no relatório.
- Permitir que associação A veja dados privados da associação B.
- Expor emails de contacto na página pública.
- Gerar CSV com dados sensíveis.

### Check de compreensão

- [ ] Sei explicar a diferença entre relatório admin, histórico privado e página pública.
- [ ] Sei indicar que dados sao públicos.
- [ ] Sei provar que acesso cruzado e bloqueado.

## Bloco operacional (obrigatório)

### Pré-condições

- `BK-MF4-05` executado com `pool_distributions`.
- `BK-MF2-02` executado com utilizadores autenticados e role `admin`.
- `charities` contem associações aprovadas.
- `requireAuth` e `requireRole` disponíveis.

### Arquitetura do BK

- Backend: service de relatórios, controller de acesso e rotas públicas/privadas.
- Persistência: `charity_memberships` liga utilizador e associação; `pool_distributions` fornece histórico.
- Frontend: páginas para público, admin, histórico privado e ligação admin de membros.
- Segurança: `assertCanReadCharity` aplica ownership antes de devolver histórico ou CSV.
- Integração: `BK-MF5-01` pode usar estes dados em exportação RGPD com o mesmo cuidado de privacidade.

### Ficheiros a criar, editar e rever

- CRIAR: `backend/src/modules/charities/charity-reports.service.js`
- CRIAR: `backend/src/modules/charities/charity-reports.controller.js`
- CRIAR: `frontend/src/pages/PublicCharitiesPage.jsx`
- CRIAR: `frontend/src/pages/AdminPoolDashboardPage.jsx`
- CRIAR: `frontend/src/pages/CharityHistoryPage.jsx`
- CRIAR: `frontend/src/pages/AdminCharityMembersPage.jsx`
- EDITAR: `backend/src/modules/charities/charities.routes.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `frontend/src/services/api/charitiesApi.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF4-05`, `RF46`, `RF47`, `RF48`, `RNF18`, `RNF19`, `RNF26`

### Guia de execução (passo-a-passo)

### Passo 1 - Criar service de relatórios

1. Objetivo do passo.

Ler dados persistidos para admin, associação e público.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-reports.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo.

4. Código completo.

```js
/**
 * Módulo de serviço para relatórios, histórico e memberships de associações.
 *
 * Reúne leituras públicas, dashboard administrativo e acesso privado por
 * membership, preservando contactos internos e regras de ownership no backend.
 */
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";

/**
 * Converte identificadores recebidos em `ObjectId` com erro de domínio.
 *
 * @param {string} id Identificador recebido da rota, sessão ou corpo.
 * @param {string} label Nome usado na mensagem de erro.
 * @returns {ObjectId} Identificador MongoDB.
 * @throws {Error} Quando o identificador e inválido.
 */
function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} inválido.`);
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(id);
}

/**
 * Remove contactos internos antes de expor uma associação publicamente.
 *
 * @param {object} charity Documento da colecao `charities`.
 * @returns {object} Associação pública.
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
 * Normaliza uma ligacao utilizador-associação para resposta da API.
 *
 * @param {object} membership Documento da colecao `charity_memberships`.
 * @returns {object} Ligacao pública.
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
 * Cria indices de ownership entre utilizadores e associações.
 *
 * @returns {Promise<void>}
 */
export async function ensureCharityReportIndexes() {
  const db = await getDb();
  await db.collection("charity_memberships").createIndex({ userId: 1 }, { unique: true });
  await db.collection("charity_memberships").createIndex({ charityId: 1 });
}

/**
 * Liga um utilizador existente a uma associação elegível.
 *
 * @param {string} charityId Identificador da associação.
 * @param {string} userId Identificador do utilizador que passara a consultar histórico.
 * @param {string} createdByUserId Identificador do admin que cria a ligacao.
 * @returns {Promise<{ membership: object }>} Ligacao criada ou atualizada.
 * @throws {Error} Quando a associação ou o utilizador não existem.
 */
export async function linkUserToCharity(charityId, userId, createdByUserId) {
  const db = await getDb();
  const charityObjectId = asObjectId(charityId, "Associação");
  const userObjectId = asObjectId(userId, "Utilizador");
  const createdByObjectId = asObjectId(createdByUserId, "Admin");

  // Apenas associações ativas e elegíveis podem receber utilizadores associados.
  const charity = await db.collection("charities").findOne({
    _id: charityObjectId,
    status: "active",
    poolStatus: "eligible",
  });

  if (!charity) {
    const error = new Error("Associação ativa e elegível não encontrada.");
    error.statusCode = 404;
    throw error;
  }

  // A ligacao exige um utilizador real para não criar ownership quebrado.
  const user = await db.collection("users").findOne({ _id: userObjectId });

  if (!user) {
    const error = new Error("Utilizador não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  // Um utilizador fica ligado a uma associação de cada vez; `upsert` permite corrigir a ligacao.
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
 * Obtem a associação ligada ao utilizador autenticado.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {Promise<object>} Documento de ligacao.
 * @throws {Error} Quando o utilizador não esta ligado a uma associação.
 */
export async function getMyCharityMembership(userId) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const membership = await db.collection("charity_memberships").findOne({ userId: userObjectId });

  if (!membership) {
    const error = new Error("Este utilizador não esta ligado a uma associação.");
    error.statusCode = 403;
    throw error;
  }

  return membership;
}

/**
 * Devolve os ultimos meses de distribuição para painel admin.
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
 * Devolve histórico de distribuicoes para uma associação.
 *
 * @param {string} charityId Identificador da associação.
 * @returns {Promise<{ charityId: string, totalCents: number, rows: object[] }>} Histórico agregado.
 */
export async function getCharityHistory(charityId) {
  const db = await getDb();
  const charityObjectId = asObjectId(charityId, "Associação");
  const runs = await db.collection("pool_distributions").find({ "items.charityId": charityObjectId }).sort({ month: -1 }).toArray();
  const rows = runs.map((run) => {
    // O valor vem do registo mensal persistido; o relatório não recalcula distribuicoes antigas.
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
 * Lista associações elegíveis para a página pública.
 *
 * @returns {Promise<{ charities: object[] }>} Associações sem contactos internos.
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
 * Converte histórico de uma associação para CSV simples.
 *
 * @param {{ rows: object[] }} history Histórico devolvido por `getCharityHistory`.
 * @returns {string} CSV com cabecalho e linhas de distribuição.
 */
export function historyToCsv(history) {
  const header = "month,amount_cents,rotation_position";
  const lines = history.rows.map((row) => `${row.month},${row.amountCents},${row.rotationPosition}`);
  return [header, ...lines].join("\n");
}
```

5. Explicação do código ou da decisão.

O service le `pool_distributions`; não recalcula a pool. A colecao `charity_memberships` cria o ownership entre um utilizador autenticado e uma associação sem alterar o contrato de roles da app.

6. Validação do passo.

```bash
node -e "import('./src/modules/charities/charity-reports.service.js').then((m) => console.log(typeof m.getPoolDashboard, typeof m.linkUserToCharity, typeof m.historyToCsv))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Recalcular valores no relatório pode alterar resultados antigos se os planos mudarem.

### Passo 2 - Criar controller e rotas de relatório

1. Objetivo do passo.

Expor dashboard admin, histórico privado, CSV e página pública.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-reports.controller.js`
    - EDITAR: `backend/src/modules/charities/charities.routes.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Acrescenta rotas ao router existente.

4. Código completo.

`backend/src/modules/charities/charity-reports.controller.js`

```js
/**
 * Módulo de controllers HTTP para relatórios da pool solidária.
 *
 * Aplica autorização de admin ou membership antes de expor histórico privado e
 * delega agregações, CSV e listagens públicas ao service.
 */
import {
  getCharityHistory,
  getMyCharityMembership,
  getPoolDashboard,
  historyToCsv,
  linkUserToCharity,
  listPublicCharities,
} from "./charity-reports.service.js";

/**
 * Confirma se o utilizador pode ler o histórico de uma associação.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {string} charityId Identificador da associação consultada.
 * @returns {Promise<void>}
 * @throws {Error} Quando o utilizador não tem permissão.
 */
async function assertCanReadCharity(req, charityId) {
  if (req.user.role === "admin") return;
  const membership = await getMyCharityMembership(req.user.id);
  if (String(membership.charityId) === String(charityId)) return;

  const error = new Error("Não tens permissão para consultar esta associação.");
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
 * Liga um utilizador a uma associação por acao administrativa.
 *
 * @param {import("express").Request} req Pedido com `params.id`, `body.userId` e `user.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postCharityMember(req, res) {
  res.status(201).json(await linkUserToCharity(req.params.id, req.body.userId, req.user.id));
}

/**
 * Devolve histórico privado de uma associação depois de validar permissão.
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
 * Exporta histórico privado em CSV depois de validar permissão.
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
 * Devolve associações públicas sem dados de contacto internos.
 *
 * @param {import("express").Request} _req Pedido público.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getPublicCharities(_req, res) {
  res.status(200).json(await listPublicCharities());
}
```

Rotas a adicionar:

```js
// A rota pública vem antes de `/:id/...` para evitar ambiguidades de routing.
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

5. Explicação do código ou da decisão.

`assertCanReadCharity` aplica ownership. Admin ve tudo; qualquer outro utilizador autenticado precisa de estar ligado a essa associação em `charity_memberships`.

6. Validação do passo.

```bash
curl -i http://localhost:3000/api/charities/public
curl -i http://localhost:3000/api/charities/ID/history
curl -i -X POST http://localhost:3000/api/charities/ID/members -H "Content-Type: application/json" -d '{"userId":"USER_ID"}'
```

Sem sessão, histórico privado devolve `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem ownership, uma associação podia consultar valores de outra.

### Passo 3 - Criar paginas frontend

1. Objetivo do passo.

Mostrar página pública e painel admin simples.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/charitiesApi.js`
    - CRIAR: `frontend/src/pages/PublicCharitiesPage.jsx`
    - CRIAR: `frontend/src/pages/AdminPoolDashboardPage.jsx`
    - CRIAR: `frontend/src/pages/CharityHistoryPage.jsx`
    - CRIAR: `frontend/src/pages/AdminCharityMembersPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`

3. Instrucoes concretas.

Acrescenta chamadas API e rotas `/charities` e `/admin/pool`.

4. Código completo.

Adicionar a `charitiesApi`:

```js
/**
 * Lista associações elegíveis para página pública.
 *
 * @returns {Promise<{ charities: object[] }>} Associações públicas.
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
 * Obtem histórico privado de uma associação.
 *
 * @param {string} charityId Identificador da associação.
 * @returns {Promise<object>} Histórico com linhas mensais.
 */
getCharityHistory(charityId) {
  return apiClient.get(`/api/charities/${encodeURIComponent(charityId)}/history`);
},
/**
 * Liga um utilizador a uma associação.
 *
 * @param {string} charityId Identificador da associação.
 * @param {string} userId Identificador do utilizador.
 * @returns {Promise<{ membership: object }>} Ligacao criada.
 */
linkUserToCharity(charityId, userId) {
  return apiClient.post(`/api/charities/${encodeURIComponent(charityId)}/members`, { userId });
}
```

`frontend/src/pages/PublicCharitiesPage.jsx`

```jsx
/**
 * Módulo da página pública de associações apoiadas.
 *
 * Apresenta apenas dados públicos devolvidos pela API, evitando expor contactos
 * internos ou regras administrativas ao visitante.
 */
import { useEffect, useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página pública com associações apoiadas pelo FaithFlix.
 *
 * @returns {JSX.Element} Lista pública sem contactos internos.
 */
export function PublicCharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Carrega associações públicas e separa loading de estado vazio.
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
      <h1>Associações apoiadas</h1>
      {error && <p role="alert">{error}</p>}
      {loading && <p>A carregar associações...</p>}
      {!loading && charities.length === 0 && !error && <p>Ainda não existem associações públicas.</p>}
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
/**
 * Módulo da página administrativa de dashboard da pool.
 *
 * Mostra meses já distribuídos a partir do backend para que totais e rotação
 * sejam auditados sem cálculos paralelos no frontend.
 */
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
          <p>Associações: {month.charitiesCount}</p>
        </article>
      ))}
    </main>
  );
}
```

`frontend/src/pages/CharityHistoryPage.jsx`

```jsx
/**
 * Módulo da página privada de histórico por associação.
 *
 * Usa o `charityId` da rota para consultar o histórico autorizado pelo backend,
 * onde admin e membership determinam quem pode ver os valores.
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página privada de histórico de uma associação.
 *
 * @returns {JSX.Element} Totais e linhas mensais da associação permitida.
 */
export function CharityHistoryPage() {
  const { charityId } = useParams();
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    /**
     * Carrega histórico já protegido pelo backend.
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
      <h1>Histórico da associação</h1>
      {error && <p role="alert">{error}</p>}
      {!history && !error && <p>A carregar histórico...</p>}
      {history && (
        <>
          <p>Total recebido: {(history.totalCents / 100).toFixed(2)} EUR</p>
          {history.rows.length === 0 && <p>Sem distribuicoes registadas.</p>}
          {history.rows.map((row) => (
            <article key={row.month}>
              <h2>{row.month}</h2>
              <p>Valor: {(row.amountCents / 100).toFixed(2)} EUR</p>
              <p>Posicao na rotação: {row.rotationPosition}</p>
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
/**
 * Módulo da página administrativa de ligação entre utilizador e associação.
 *
 * Envia IDs explícitos para um endpoint protegido por `admin`, permitindo criar
 * ownership operacional sem transformar associações em utilizadores comuns.
 */
import { useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Painel admin para criar ownership entre utilizador e associação.
 *
 * @returns {JSX.Element} Formulário administrativo de ligacao.
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
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("");
    setError("");

    try {
      const response = await charitiesApi.linkUserToCharity(charityId, userId);
      setStatus(`Utilizador ligado a associação ${response.membership.charityId}.`);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Ligar utilizador a associação</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="charityId">ID da associação</label>
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

5. Explicação do código ou da decisão.

A página pública mostra apenas dados institucionais. O painel admin mostra totais mensais agregados e a página de ligacao permite ao admin criar o ownership necessário para o histórico privado.

A página pública e o painel admin distinguem loading de estado vazio, evitando mostrar mensagens de ausencia antes de a resposta chegar. O link público usa o website validado no `BK-MF4-03` e abre como link externo com `rel="noreferrer"`.

6. Validação do passo.

Abrir `/charities` sem login, `/admin/pool` com admin, `/admin/charity-members` com admin e `/charities/:charityId/history` com o utilizador ligado a essa associação.

7. Caso negativo, erro comum ou risco que este passo evita.

Expor email da associação na página pública pode criar risco de privacidade e spam.

## Critérios de aceite (mensuráveis)

- `GET /api/charities/public` devolve associações elegíveis sem contactos internos.
- `GET /api/charities/pool/dashboard` exige admin.
- `POST /api/charities/:id/members` exige admin e liga um utilizador existente a uma associação elegível.
- Histórico privado bloqueia acesso cruzado entre associações.
- CSV devolve `text/csv` com linhas coerentes com o histórico.

## Validação final

```bash
cd backend
npm test
```

Testar página pública, dashboard admin, ligacao admin de utilizador a associação e acesso cruzado bloqueado.

## Evidence para PR/defesa

- `pr`: commit/PR com reports service, memberships e paginas.
- `proof`: captura da página pública, dashboard admin e histórico privado do utilizador ligado.
- `neg`: associação A bloqueada ao consultar associação B, período sem dados e dashboard sem admin.

## Handoff

`BK-MF5-01` pode usar estes relatórios como contexto de dados pessoais a exportar, mas deve manter privacidade, ownership por `charity_memberships` e limites de dados públicos.

## Snippet técnico aplicável

```js
// Admin ve tudo; utilizador ligado a associação ve apenas o seu proprio histórico.
if (req.user.role === "admin") return;
const membership = await getMyCharityMembership(req.user.id);
if (String(membership.charityId) === String(charityId)) return;
```

## Changelog

- `2026-06-13`: guia reescrito com dashboard, histórico privado, CSV, página pública e ownership.
