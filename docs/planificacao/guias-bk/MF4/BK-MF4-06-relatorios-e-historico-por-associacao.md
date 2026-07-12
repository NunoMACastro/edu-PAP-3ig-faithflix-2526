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
- `proximo_bk`: `BK-MF5-04`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-06-relatorios-e-historico-por-associacao.md`
- `last_updated`: `2026-07-12`

#### Objetivo

Neste BK vais criar transparência sobre a pool solidária: painel admin, histórico privado por associação e página pública agregada sem dados sensíveis.


- Ler distribuições mensais sem recalcular valores.
- Proteger histórico privado de cada associação.
- Criar uma página pública com associações aprovadas.
- Exportar CSV simples para evidencia PAP.

#### Importância

- A pool solidária só é confiável se a equipa conseguir mostrar histórico, transparência e limites de acesso.
- Este BK fecha a parte visível da monetização solidária: admin vê agregados, associação vê apenas o seu histórico e visitantes veem informação pública.
- O CSV ajuda a defender a solução com evidência objetiva.

#### Scope-in

- Criar dashboard admin da pool.
- Criar ligação entre utilizador autenticado e associação.
- Criar histórico privado por associação com ownership.
- Criar exportação CSV simples.
- Criar página pública de associações aprovadas.

#### Scope-out

- Não recalcular distribuição mensal; o BK lê `pool_distributions`.
- Não expor emails, contactos internos ou dados privados na página pública.
- Não criar role nova para associação sem contrato documental.
- Não exportar PDF avançado; CSV simples é suficiente para o MVP.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se o ownership por associação não estiver claro, não avançar para frontend.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF4-05` executado com `pool_distributions`.
- `BK-MF2-02` executado com utilizadores autenticados e role `admin`.
- `charities` contem associações aprovadas.
- `requireAuth` e `requireRole` disponíveis.

#### Glossário

- Dashboard admin: visão agregada da pool para administração.
- Histórico privado: distribuição filtrada por associação.
- Página pública: apresentação segura das associações aprovadas.
- Membership: ligação entre utilizador autenticado e associação.

#### Conceitos teóricos essenciais

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

#### Arquitetura do BK

- Backend: service de relatórios, controller de acesso e rotas públicas/privadas.
- Transversal: membership e audit usam os helpers transacionais já introduzidos
  na revisão administrativa.
- Persistência: `charity_memberships` liga utilizador e associação; `pool_distributions` fornece histórico.
- Frontend: páginas para público, admin, histórico privado e ligação admin de membros.
- Segurança: `assertCanReadCharity` aplica ownership antes de devolver histórico ou CSV.
- Segurança de conta: a ligação escreve apenas sobre uma conta não bloqueada nem eliminada; indisponibilidade devolve `404 USER_NOT_OPERATIONAL` sem efeitos parciais.
- Integração RGPD: `BK-MF5-01` exporta `charity_memberships` da própria conta e `BK-MF5-02` remove-a transacionalmente, sem tocar em ligações de outros utilizadores.

### Contrato vinculativo das interfaces administrativas (Fase 5 - 2026-07-10)

- Ligar um utilizador a uma associação exige confirmação explícita com ambos os
  identificadores e avisa que a ação concede acesso ao histórico privado.
- O formulário de membership impede submissões sobrepostas antes do render,
  expõe `aria-busy`, desativa campos/botão durante a escrita e cancela o pedido
  no unmount. Uma resposta abortada ou antiga não substitui o resultado atual.
- O dashboard da pool usa `AbortController`, distingue loading/error/empty,
  oferece `Tentar novamente` e não apresenta `REQUEST_ABORTED` ao utilizador.
- Estados financeiros técnicos são traduzidos: `completed` torna-se
  `Distribuída` e `deferred_no_eligible_charities` torna-se
  `Adiada: sem associações elegíveis`. Um valor desconhecido usa
  `Indisponível`, sem mostrar enums brutos.
- O dashboard continua a ler, no máximo, os 12 fechos persistidos mais recentes;
  não recalcula valores no browser. A ausência de paginação neste resumo fixo
  não autoriza remover paginação das listagens administrativas que a expõem.
- Os exemplos lineares do Passo 3 devem ser completados com estas guardas de
  confirmação, cancelamento e PT-PT.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/charities/charity-reports.service.js`
- CRIAR: `backend/src/modules/charities/charity-reports.controller.js`
- REVER: `backend/src/modules/audit/audit.service.js`
- REVER: `backend/src/config/database.js`
- CRIAR/EDITAR: `backend/tests/unit/f3-admin-transactions.test.js`
- CRIAR: `frontend/src/pages/PublicCharitiesPage.jsx`
- CRIAR: `frontend/src/pages/AdminPoolDashboardPage.jsx`
- CRIAR: `frontend/src/pages/CharityHistoryPage.jsx`
- CRIAR: `frontend/src/pages/AdminCharityMembersPage.jsx`
- EDITAR: `backend/src/modules/charities/charities.routes.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `frontend/src/services/api/charitiesApi.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF4-05`, `RF46`, `RF47`, `RF48`, `RNF18`, `RNF19`, `RNF26`

#### Tutorial técnico linear

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
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";

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
 * Cria o conflito estável usado quando já existe outra ligação.
 *
 * @returns {HttpError} Conflito que exige transferência explícita.
 */
function membershipConflict() {
  return new HttpError(
    409,
    "O utilizador já está ligado a uma associação. A transferência exige uma operação explícita.",
    undefined,
    "CHARITY_MEMBERSHIP_EXISTS",
  );
}

/**
 * Liga um utilizador existente a uma associação elegível.
 *
 * @param {string} charityId Identificador da associação.
 * @param {string} userId Identificador do utilizador que passara a consultar histórico.
 * @param {string} createdByUserId Identificador do admin que cria a ligacao.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido HTTP.
 * @returns {Promise<{ membership: object }>} Ligacao criada ou repetida.
 * @throws {Error} Quando a associação não existe, a conta não está operacional
 * ou já existe uma ligação a outra associação.
 */
export async function linkUserToCharity(
  charityId,
  userId,
  createdByUserId,
  context = {},
) {
  const charityObjectId = asObjectId(charityId, "Associação");
  const userObjectId = asObjectId(userId, "Utilizador");
  const createdByObjectId = asObjectId(createdByUserId, "Admin");

  try {
    return await runInTransaction(async ({ db, session }) => {
      const charity = await db.collection("charities").findOne(
        { _id: charityObjectId, status: "active", poolStatus: "eligible" },
        { session },
      );

      if (!charity) {
        throw new HttpError(404, "Associação ativa e elegível não encontrada.");
      }

      const user = await db.collection("users").findOne(
        { _id: userObjectId },
        { session },
      );
      const accountStatusAllowsAccess = user && (
        user.accountStatus === undefined || user.accountStatus === "active"
      );
      const legacyStatusAllowsAccess = user && (
        user.status === undefined || user.status === "active"
      );
      if (!accountStatusAllowsAccess || !legacyStatusAllowsAccess) {
        throw new HttpError(
          404,
          "Utilizador ativo não encontrado.",
          undefined,
          "USER_NOT_OPERATIONAL",
        );
      }

      const existing = await db.collection("charity_memberships").findOne(
        { userId: userObjectId },
        { session },
      );

      if (existing) {
        if (String(existing.charityId) !== String(charityObjectId)) {
          throw membershipConflict();
        }

        // Repetir a mesma ligação é idempotente e não duplica o audit log.
        return { membership: publicMembership(existing) };
      }

      // Só uma criação nova incrementa a versão. O filtro reproduz exatamente
      // os dois estados observados e fecha a corrida com billing/RGPD/admin.
      const userLock = await db.collection("users").updateOne(
        {
          _id: userObjectId,
          accountStatus: user.accountStatus === undefined
            ? { $exists: false }
            : "active",
          status: user.status === undefined
            ? { $exists: false }
            : "active",
          operationalVersion: user.operationalVersion === undefined
            ? { $exists: false }
            : user.operationalVersion,
        },
        { $inc: { operationalVersion: 1 } },
        { session },
      );

      if (userLock.matchedCount !== 1) {
        throw new HttpError(
          409,
          "A conta mudou durante a operação. Tenta novamente.",
          undefined,
          "USER_STATE_CHANGED",
        );
      }

      const now = new Date();
      const membership = {
        userId: userObjectId,
        charityId: charityObjectId,
        createdBy: createdByObjectId,
        createdAt: now,
        updatedAt: now,
      };
      const result = await db.collection("charity_memberships").insertOne(
        membership,
        { session },
      );
      const persistedMembership = { ...membership, _id: result.insertedId };

      await writeAdminAudit({
        db,
        session,
        actorUserId: createdByObjectId,
        action: "charity.membership_create",
        targetType: "charity_membership",
        targetId: result.insertedId,
        before: null,
        after: persistedMembership,
        requestId: context.requestId,
      });

      return { membership: publicMembership(persistedMembership) };
    });
  } catch (error) {
    // O índice único fecha a race entre leituras concorrentes.
    if (Number(error?.code) === 11000) {
      const db = await getDb();
      const winner = await db.collection("charity_memberships").findOne({
        userId: userObjectId,
      });
      if (winner && String(winner.charityId) === String(charityObjectId)) {
        return { membership: publicMembership(winner) };
      }
      throw membershipConflict();
    }

    throw error;
  }
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
 * Pesquisa associações operacionais sem devolver contactos ou snapshots.
 */
export async function listAdminCharityLookup({ search = "", page = "1", limit = "10" } = {}) {
  const normalizedSearch = search.trim();
  const safePage = Number(page);
  const safeLimit = Number(limit);
  if (normalizedSearch.length < 2 || normalizedSearch.length > 80) throw httpError(400, "INVALID_SEARCH");
  if (!Number.isInteger(safePage) || safePage < 1 || !Number.isInteger(safeLimit) || safeLimit < 1 || safeLimit > 20) {
    throw httpError(400, "INVALID_PAGINATION");
  }
  const literal = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const db = await getDb();
  const rows = await db.collection("charities").find({
    status: "active",
    poolStatus: "eligible",
    name: { $regex: literal, $options: "i" },
  }).project({ name: 1 }).sort({ name: 1, _id: 1 })
    .skip((safePage - 1) * safeLimit).limit(safeLimit).toArray();
  return { charities: rows.map((row) => ({ id: String(row._id), name: row.name })) };
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

O service le `pool_distributions`; não recalcula a pool. Uma membership nova e
o evento `charity.membership_create` são confirmados na mesma transação. Repetir
a mesma ligação é idempotente; ligar o utilizador a outra associação devolve
`409 CHARITY_MEMBERSHIP_EXISTS` e nunca transfere ownership silenciosamente.

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
  listAdminCharityLookup,
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

function assertObjectBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    const error = new Error("O corpo do pedido deve ser um objeto JSON.");
    error.statusCode = 400;
    error.code = "INVALID_REQUEST_BODY";
    throw error;
  }
  return body;
}

/**
 * Liga um utilizador a uma associação por acao administrativa.
 *
 * @param {import("express").Request} req Pedido com `params.id`, `body.userId` e `user.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postCharityMember(req, res) {
  const body = assertObjectBody(req.body);
  res.status(201).json(
    await linkUserToCharity(req.params.id, body.userId, req.user.id, {
      requestId: req.id,
    }),
  );
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

/**
 * Pesquisa apenas associações operacionais para o autocomplete admin.
 */
export async function getAdminCharityLookup(req, res) {
  res.status(200).json(await listAdminCharityLookup(req.query));
}
```

Rotas a adicionar:

```js
// A rota pública vem antes de `/:id/...` para evitar ambiguidades de routing.
charitiesRouter.get("/public", asyncHandler(getPublicCharities));
charitiesRouter.get("/admin/lookup", requireRole(["admin"]), asyncHandler(getAdminCharityLookup));
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
curl -i "http://localhost:3000/api/charities/admin/lookup?search=esperanca&page=1&limit=10"
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

Acrescenta chamadas API e as rotas públicas PT-PT `/associacoes` e
`/associacoes/:charityId/historico`, mais as rotas administrativas explícitas
abaixo. Substitui apenas o elemento placeholder de `/associacoes`; não
reconstruas o router.

4. Código completo das páginas e patch contextual do cliente.

O recorte seguinte é para inserir no objeto `charitiesApi` já exportado pelo
ficheiro; não é um módulo JavaScript autónomo e não substitui os métodos atuais:

```text
/**
 * Lista associações elegíveis para página pública.
 *
 * @returns {Promise<{ charities: object[] }>} Associações públicas.
 */
listPublicCharities(options = {}) {
  return apiClient.get("/api/charities/public", options);
},
/**
 * Obtem totais mensais agregados da pool.
 *
 * @returns {Promise<{ months: object[] }>} Meses recentes.
 */
getPoolDashboard(options = {}) {
  return apiClient.get("/api/charities/pool/dashboard", options);
},
/**
 * Pesquisa associações ativas/elegíveis sem expor contactos.
 */
lookupAdminCharities(search, options = {}) {
  const query = new URLSearchParams({ search, page: "1", limit: "10" });
  return apiClient.get(`/api/charities/admin/lookup?${query}`, options);
},
/**
 * Obtem histórico privado de uma associação.
 *
 * @param {string} charityId Identificador da associação.
 * @returns {Promise<object>} Histórico com linhas mensais.
 */
getCharityHistory(charityId, options = {}) {
  return apiClient.get(
    `/api/charities/${encodeURIComponent(charityId)}/history`,
    options,
  );
},
/**
 * Liga um utilizador a uma associação.
 *
 * @param {string} charityId Identificador da associação.
 * @param {string} userId Identificador do utilizador.
 * @returns {Promise<{ membership: object }>} Ligacao criada.
 */
linkUserToCharity(charityId, userId, options = {}) {
  return apiClient.post(
    `/api/charities/${encodeURIComponent(charityId)}/members`,
    { userId },
    options,
  );
},
```

`frontend/src/pages/PublicCharitiesPage.jsx`

```jsx
/**
 * Módulo da página pública de associações apoiadas.
 *
 * Apresenta apenas dados públicos devolvidos pela API, evitando expor contactos
 * internos ou regras administrativas ao visitante.
 */
import { useEffect, useRef, useState } from "react";
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
  const [reloadVersion, setReloadVersion] = useState(0);
  const requestEpochRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const requestEpoch = requestEpochRef.current + 1;
    requestEpochRef.current = requestEpoch;

    /**
     * Carrega associações públicas e separa loading de estado vazio.
     *
     * @returns {Promise<void>}
     */
    async function loadCharities() {
      setLoading(true);
      setError("");
      try {
        const response = await charitiesApi.listPublicCharities({
          signal: controller.signal,
        });
        if (controller.signal.aborted || requestEpochRef.current !== requestEpoch) return;
        setCharities(response.charities);
      } catch (apiError) {
        if (controller.signal.aborted || requestEpochRef.current !== requestEpoch) return;
        setError(toUserMessage(apiError));
      } finally {
        if (controller.signal.aborted || requestEpochRef.current !== requestEpoch) return;
        setLoading(false);
      }
    }

    void loadCharities();
    return () => controller.abort();
  }, [reloadVersion]);

  return (
    <main>
      <h1>Associações apoiadas</h1>
      {error && <p role="alert">{error}</p>}
      {error && (
        <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
          Tentar novamente
        </button>
      )}
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
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");

    charitiesApi.getPoolDashboard({ signal: controller.signal })
      .then((response) => {
        if (!active || controller.signal.aborted) return;
        setMonths(response.months);
      })
      .catch((apiError) => {
        if (!active || apiError?.code === "REQUEST_ABORTED") return;
        setError(toUserMessage(apiError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadVersion]);

  function distributionStatusLabel(status) {
    if (status === "completed") return "Distribuída";
    if (status === "deferred_no_eligible_charities") {
      return "Adiada: sem associações elegíveis";
    }
    return "Indisponível";
  }

  return (
    <main>
      <h1>Painel da pool</h1>
      {error && <p role="alert">{error}</p>}
      {error && (
        <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
          Tentar novamente
        </button>
      )}
      {loading && <p role="status">A carregar painel...</p>}
      {!loading && months.length === 0 && !error && <p>Sem distribuições registadas.</p>}
      {months.map((month) => (
        <article key={month.month}>
          <h2>{month.month}</h2>
          <p>Total: {(month.totalPoolCents / 100).toFixed(2)} EUR</p>
          <p>Associações: {month.charitiesCount}</p>
          <p>Estado: {distributionStatusLabel(month.status)}</p>
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
import { useEffect, useRef, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [reloadVersion, setReloadVersion] = useState(0);
  const requestEpochRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const requestEpoch = requestEpochRef.current + 1;
    requestEpochRef.current = requestEpoch;

    /**
     * Carrega histórico já protegido pelo backend.
     *
     * @returns {Promise<void>}
     */
    async function loadHistory() {
      setLoading(true);
      setError("");
      setHistory(null);
      try {
        const response = await charitiesApi.getCharityHistory(charityId, {
          signal: controller.signal,
        });
        if (controller.signal.aborted || requestEpochRef.current !== requestEpoch) return;
        setHistory(response);
      } catch (apiError) {
        if (controller.signal.aborted || requestEpochRef.current !== requestEpoch) return;
        setError(toUserMessage(apiError));
      } finally {
        if (controller.signal.aborted || requestEpochRef.current !== requestEpoch) return;
        setLoading(false);
      }
    }

    void loadHistory();
    return () => controller.abort();
  }, [charityId, reloadVersion]);

  return (
    <main>
      <h1>Histórico da associação</h1>
      {error && <p role="alert">{error}</p>}
      {error && (
        <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
          Tentar novamente
        </button>
      )}
      {loading && <p role="status">A carregar histórico...</p>}
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
 * Pesquisa entidades humanas e só envia os IDs depois de confirmação nominal.
 */
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";
import { userApi } from "../services/api/userApi.js";

/**
 * Painel admin para criar ownership entre utilizador e associação.
 *
 * @returns {JSX.Element} Formulário administrativo de ligacao.
 */
export function AdminCharityMembersPage() {
  const [charitySearch, setCharitySearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [charityResults, setCharityResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [charity, setCharity] = useState(null);
  const [user, setUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submissionRef = useRef(null);

  useEffect(() => {
    if (charity || charitySearch.trim().length < 2) return undefined;
    const controller = new AbortController();
    charitiesApi.lookupAdminCharities(charitySearch.trim(), { signal: controller.signal })
      .then((response) => setCharityResults(response.charities ?? []))
      .catch((requestError) => requestError?.code !== "REQUEST_ABORTED" && setError(toUserMessage(requestError)));
    return () => controller.abort();
  }, [charity, charitySearch]);

  useEffect(() => {
    if (user || userSearch.trim().length < 2) return undefined;
    const controller = new AbortController();
    userApi.listUsers(
      { search: userSearch.trim(), status: "active", page: 1, limit: 10 },
      { signal: controller.signal },
    ).then((response) => setUserResults(response.users ?? []))
      .catch((requestError) => requestError?.code !== "REQUEST_ABORTED" && setError(toUserMessage(requestError)));
    return () => controller.abort();
  }, [user, userSearch]);

  useEffect(() => () => submissionRef.current?.abort(), []);

  /**
   * Envia a ligacao para o backend e mostra o resultado.
   *
   * @returns {Promise<void>}
   */
  async function handleSubmit() {
    if (!charity || !user || submissionRef.current) return;

    const controller = new AbortController();
    submissionRef.current = controller;
    setSubmitting(true);
    setStatus("");
    setError("");

    try {
      const response = await charitiesApi.linkUserToCharity(
        charity.id,
        user.id,
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      setStatus(`${user.name} foi ligado a ${charity.name}.`);
      setConfirmOpen(false);
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.code === "REQUEST_ABORTED") return;
      setError(toUserMessage(apiError));
    } finally {
      if (submissionRef.current === controller) submissionRef.current = null;
      setSubmitting(false);
    }
  }

  return (
    <main aria-busy={submitting}>
      <h1>Ligar utilizador a associação</h1>
      <label>Associação
        <input role="combobox" aria-autocomplete="list" value={charitySearch} onChange={(event) => { setCharity(null); setCharitySearch(event.target.value); }} />
      </label>
      <ul role="listbox">{charityResults.map((item) => (
        <li key={item.id}><button type="button" onClick={() => { setCharity(item); setCharitySearch(item.name); setCharityResults([]); }}>{item.name}</button></li>
      ))}</ul>
      <label>Utilizador
        <input role="combobox" aria-autocomplete="list" value={userSearch} onChange={(event) => { setUser(null); setUserSearch(event.target.value); }} />
      </label>
      <ul role="listbox">{userResults.map((item) => (
        <li key={item.id}><button type="button" onClick={() => { setUser(item); setUserSearch(`${item.name} · ${item.email}`); setUserResults([]); }}>{item.name} · {item.email}</button></li>
      ))}</ul>
      <button type="button" disabled={!charity || !user || submitting} onClick={() => setConfirmOpen(true)}>
        Rever ligação
      </button>
      {status && <p role="status">{status}</p>}
      {error && <p role="alert">{error}</p>}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar membership"
        confirmLabel="Ligar utilizador"
        busy={submitting}
        onCancel={() => !submitting && setConfirmOpen(false)}
        onConfirm={handleSubmit}
      >
        <p><strong>{user?.name}</strong> será ligado a <strong>{charity?.name}</strong>.</p>
      </ConfirmDialog>
    </main>
  );
}
```

Em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// ADICIONAR cada binding uma única vez junto das restantes páginas lazy.
const PublicCharitiesPage = lazyNamedPage(
  () => import("../pages/PublicCharitiesPage.jsx"),
  "PublicCharitiesPage",
);
const CharityHistoryPage = lazyNamedPage(
  () => import("../pages/CharityHistoryPage.jsx"),
  "CharityHistoryPage",
);
const AdminPoolDashboardPage = lazyNamedPage(
  () => import("../pages/AdminPoolDashboardPage.jsx"),
  "AdminPoolDashboardPage",
);
const AdminCharityMembersPage = lazyNamedPage(
  () => import("../pages/AdminCharityMembersPage.jsx"),
  "AdminCharityMembersPage",
);

// SUBSTITUIR /associacoes; ADICIONAR as outras três rotas sem remover nenhuma anterior.
<>
  <Route path="/associacoes" element={<PublicCharitiesPage />} />
  <Route path="/associacoes/:charityId/historico" element={<CharityHistoryPage />} />
  <Route path="/admin/pool/dashboard" element={<AdminPoolDashboardPage />} />
  <Route path="/admin/charity-members" element={<AdminCharityMembersPage />} />
</>
```

5. Explicação do código ou da decisão.

A página pública mostra apenas dados institucionais. O dashboard usa
`AbortController`, retry e rótulos PT-PT para os estados financeiros, sem
recalcular montantes no browser. A ligação de membership pede confirmação com
os dois IDs, reserva a submissão num `ref`, desativa campos, expõe `aria-busy` e
cancela a mutation no unmount. O link público usa o website validado no
`BK-MF4-03` e abre como link externo com `rel="noreferrer"`.

6. Validação do passo.

Abrir `/associacoes` sem login, `/admin/pool/dashboard` com admin, `/admin/charity-members` com admin e `/associacoes/:charityId/historico` com o utilizador ligado a essa associação.

7. Caso negativo, erro comum ou risco que este passo evita.

Expor email da associação na página pública pode criar risco de privacidade e spam.

#### Critérios de aceite

- `GET /api/charities/public` devolve associações elegíveis sem contactos internos.
- `GET /api/charities/pool/dashboard` exige admin.
- `GET /api/charities/admin/lookup` exige admin, aceita pesquisa paginada e
  devolve apenas `{ id, name }` de associações ativas/elegíveis.
- `POST /api/charities/:id/members` exige admin e liga um utilizador existente a uma associação elegível.
- Repetir a mesma ligação é idempotente e não duplica auditoria; tentar outra
  associação devolve `409` com `code: "CHARITY_MEMBERSHIP_EXISTS"`.
- Conta bloqueada, eliminada ou inexistente devolve `404 USER_NOT_OPERATIONAL`;
  não cria membership nem audit log. O write-lock da conta serializa a ligação
  com bloqueio/eliminação concorrente.
- Membership e `charity.membership_create` fazem commit ou rollback em conjunto
  e o audit recebe o `requestId` do pedido.
- A conta alvo exige simultaneamente `accountStatus` ausente/`active` e
  `status` ausente/`active`; estados inativos, desconhecidos ou `null` falham
  fechados. `body` nulo/array devolve `400 INVALID_REQUEST_BODY` pelo envelope.
- Replay da mesma membership retorna o documento existente antes do CAS, não
  incrementa `operationalVersion` nem cria novo audit; a corrida por duplicate
  key devolve o mesmo resultado vencedor e a revisão perdedora faz rollback.
- A exportação RGPD inclui `sections.charity_memberships` da própria conta; a
  eliminação remove essa ligação na mesma transação e preserva as de terceiros.
- Histórico privado bloqueia acesso cruzado entre associações.
- CSV devolve `text/csv` com linhas coerentes com o histórico.
- Membership exige confirmação, busy state e cancelamento; duplo clique ou
  unmount não produz duas ligações nem feedback tardio.
- A UI pesquisa por nome/email com pedidos canceláveis, apresenta resultados
  humanos alcançáveis por teclado e nunca pede IDs técnicos ao operador.
- Páginas pública, dashboard e histórico usam abort/epoch, permitem retry e
  ignoram respostas abortadas/antigas; `completed` é apresentado como
  `Distribuída` e enums desconhecidos como `Indisponível`.

#### Validação final

```bash
cd backend
npm test
```

Testar página pública, dashboard admin, ligação admin, repetição idempotente,
tentativa de transferência implícita, fault injection no audit e acesso cruzado
bloqueado. Confirmar também conta indisponível, exportação da ligação própria e
eliminação sem afetar a membership de outra conta.

#### Evidence para PR/defesa

- `pr`: commit/PR com reports service, memberships e paginas.
- `proof`: captura da página pública, dashboard admin e histórico privado do utilizador ligado.
- `neg`: transferência implícita bloqueada, conta não operacional, rollback
  quando o audit falha, associação A bloqueada ao consultar B, período sem dados
  e dashboard sem admin.

#### Handoff

`BK-MF5-01` pode usar estes relatórios como contexto de dados pessoais a exportar, mas deve manter privacidade, ownership por `charity_memberships` e limites de dados públicos.

## Snippet técnico aplicável

Este recorte resume o guard dentro do controller completo do Passo 2. Não é
JavaScript autónomo: `req` e `charityId` pertencem à função que trata o pedido.

```text
// Admin ve tudo; utilizador ligado a associação ve apenas o seu proprio histórico.
if (req.user.role === "admin") return;
const membership = await getMyCharityMembership(req.user.id);
if (String(membership.charityId) === String(charityId)) return;
```

#### Changelog

- `2026-07-12`: formulário por IDs substituído por lookups canceláveis,
  seleção nominal e confirmação acessível antes de enviar apenas os IDs.

- `2026-06-13`: guia reescrito com dashboard, histórico privado, CSV, página pública e ownership.
- `2026-07-10`: membership administrativa tornada transacional e auditada,
  idempotente na repetição e fail-closed perante transferência implícita.
- `2026-07-10`: membership limitada a conta operacional e integrada na
  exportação/eliminação RGPD com ownership estrito.
- `2026-07-10`: membership e dashboard sincronizados com confirmação,
  anti-duplo-clique, abort/anti-stale, retry e estados financeiros em PT-PT.
