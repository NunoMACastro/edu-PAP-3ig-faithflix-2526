# BK-MF4-04 - Aprovação e entrada na pool

## Header

- `doc_id`: `GUIA-BK-MF4-04`
- `bk_id`: `BK-MF4-04`
- `macro`: `MF4`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF4-03`
- `rf_rnf`: `RF42, RF43`
- `fase_documental`: `Fase 1`
- `sprint`: `S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-05`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-04-aprovacao-entrada-pool.md`
- `last_updated`: `2026-07-12`

#### Objetivo

Neste BK vais criar a revisão administrativa das candidaturas e transformar candidaturas aprovadas em associações elegíveis para a pool solidária.


- Implementar aprovação e rejeição com role `admin`.
- Criar a entidade `charities` apenas quando a candidatura é aprovada.
- Guardar motivo e auditoria mínima da decisão.
- Preparar o `BK-MF4-05`, que distribui valor apenas por associações elegíveis.

#### Importância

- A pool solidária precisa de uma decisão controlada antes de qualquer associação receber valor.
- Este BK separa pedido recebido, decisão administrativa e entrada efetiva na pool.
- A auditoria mínima protege a equipa: é possível explicar quem decidiu, quando decidiu e porquê.

#### Scope-in

- Validar decisão `approved` ou `rejected`.
- Permitir aprovação/rejeição apenas a administradores.
- Guardar motivo de rejeição e dados de auditoria.
- Criar `charities` apenas quando a candidatura é aprovada.
- Criar painel admin simples para decidir candidaturas pendentes.

#### Scope-out

- Não executar distribuição mensal; isso entra no `BK-MF4-05`.
- Não editar dados públicos da associação depois de aprovada.
- Não criar workflow avançado de documentos, anexos ou múltiplos revisores.
- Não permitir decisão por utilizador comum.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se a equipa não conseguir explicar quem aprovou e quando aprovou, a auditoria ainda não está pronta.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF4-03` executado com candidaturas `pending`.
- `requireRole(["admin"])` disponível.
- `charitiesRouter` montado em `/api/charities`.

#### Glossário

- Revisão administrativa: decisão feita por alguém com role `admin`.
- Rejeição: decisão negativa com motivo mínimo.
- Associação elegível: associação aprovada e apta a participar na pool.
- Rastreabilidade: capacidade de provar a origem e a decisão de cada registo.

#### Conceitos teóricos essenciais

- Domínio FaithFlix: aprovação transforma um pedido em entidade operacional da pool solidária.
- Backend: o service garante que uma candidatura só é decidida uma vez.
- Frontend: o painel admin lista pendentes, envia decisão e recarrega a lista para evitar dupla decisão.
- Segurança: só `admin` pode decidir; a decisão usa `req.user.id` para auditoria.
- Dados: `charity_applications` guarda a decisão e `charities` guarda a entidade elegível.
- `CANONICO`: RF42 exige aprovação/rejeição; RF43 exige integração em pool.
- `DERIVADO`: `charities.status` usa `active` ou `inactive`; `poolStatus` usa `eligible` ou `paused`.

### Erros comuns

- Deixar utilizador comum aprovar candidatura.
- Aprovar a mesma candidatura duas vezes.
- Criar associação sem ligacao a candidatura original.
- Apagar candidatura rejeitada, perdendo histórico.

### Check de compreensão

- [ ] Sei explicar porque aprovação cria `charities`.
- [ ] Sei provar que só admin decide.
- [ ] Sei indicar que dados ficam para auditoria.

#### Arquitetura do BK

- Backend: validação de decisão, service de revisão, controller e rota protegida.
- Transversal: `runInTransaction` controla a unidade de commit e
  `writeAdminAudit` sanitiza/correlaciona o evento na mesma sessão.
- Persistência: a candidatura mantém histórico; a associação aprovada nasce em `charities`.
- Frontend: `AdminCharityApplicationsPage` permite aprovar/rejeitar sem mexer diretamente na base de dados.
- Segurança: rota de decisão exige `requireRole(["admin"])`.
- Integração: `BK-MF4-05` consome apenas associações `active` e `eligible`.

### Contrato vinculativo da interface administrativa (Fase 5 - 2026-07-10)

- A página pede confirmação explícita antes de aprovar ou rejeitar, incluindo o
  nome da associação e o efeito irreversível da decisão.
- Cada candidatura tem busy state próprio (`aria-busy`); enquanto a decisão
  está em curso, os dois botões da linha ficam desativados. Um `ref` de reservas
  impede duplo clique antes do render seguinte.
- Leitura e mutações usam `AbortController`. No unmount, todos os pedidos ativos
  são cancelados; `REQUEST_ABORTED` não é apresentado como erro e uma resposta
  antiga nunca altera a candidatura atualmente visível.
- A página consome `{ applications, page, limit, total, totalPages }`, usa
  `limit: 20` e apresenta Anterior/Seguinte e o total real. O backend continua a
  impor o máximo de 50.
- Depois de sucesso, a linha é removida e a página autoritativa é recarregada.
  Em falha, a linha permanece e a mensagem passa por `toUserMessage`.
- Todos os estados visíveis usam PT-PT: `A processar...`, `Candidatura aprovada`,
  `Candidatura rejeitada`, `Tentar novamente`. O exemplo simples do Passo 4 deve
  ser completado com este contrato e não é autorização para omitir estas guardas.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/charities/charity-review.validation.js`
- CRIAR: `backend/src/modules/charities/charity-review.service.js`
- CRIAR/REVER: `backend/src/modules/audit/audit.service.js`
- EDITAR/REVER: `backend/src/config/database.js`
- CRIAR/EDITAR: `backend/tests/unit/f3-admin-transactions.test.js`
- CRIAR: `frontend/src/pages/AdminCharityApplicationsPage.jsx`
- EDITAR: `backend/src/modules/charities/charities.routes.js`
- EDITAR: `backend/src/modules/charities/charity-applications.controller.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `frontend/src/services/api/charitiesApi.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF4-03`, `RF42`, `RF43`, `RNF19`

#### Tutorial técnico linear

### Passo 1 - Criar validação de decisão

1. Objetivo do passo.

Validar decisão administrativa e motivo.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-review.validation.js`
    - CRIAR: `backend/tests/unit/mf4-charity-review.validation.test.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Adiciona este ficheiro ao módulo `charities`.

4. Código completo.

```js
import { HttpError } from "../../utils/http-error.js";

/**
 * Decisões aceites no processo de revisão de candidaturas.
 * Qualquer outro estado e controlado por outros fluxos do módulo.
 */
export const REVIEW_DECISIONS = ["approved", "rejected"];

/**
 * Valida a decisão administrativa sobre uma candidatura.
 *
 * @param {object} input Corpo recebido na rota de revisão.
 * @param {string} input.decision Decisão pretendida.
 * @param {string} [input.reason] Motivo, obrigatório em rejeicoes.
 * @returns {{ decision: string, reason: string }} Decisão normalizada.
 * @throws {Error} Quando a decisão e inválida ou a rejeição não tem motivo suficiente.
 */
export function assertReviewPayload(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpError(
      400,
      "O body da revisão tem de ser um objeto JSON.",
      undefined,
      "INVALID_REVIEW_PAYLOAD",
    );
  }

  if (typeof input.decision !== "string") {
    throw new HttpError(
      400,
      "A decisão tem de ser texto.",
      undefined,
      "INVALID_REVIEW_DECISION",
    );
  }

  if (input.reason !== undefined && typeof input.reason !== "string") {
    throw new HttpError(
      400,
      "O motivo tem de ser texto.",
      undefined,
      "INVALID_REVIEW_REASON",
    );
  }

  const decision = input.decision.trim();
  const reason = input.reason?.trim() ?? "";

  if (!REVIEW_DECISIONS.includes(decision)) {
    throw new HttpError(
      400,
      "Decisão inválida.",
      undefined,
      "INVALID_REVIEW_DECISION",
    );
  }

  if (reason.length > 500) {
    throw new HttpError(
      400,
      "O motivo não pode exceder 500 caracteres.",
      undefined,
      "INVALID_REVIEW_REASON",
    );
  }

  if (decision === "rejected" && reason.length < 10) {
    throw new HttpError(
      400,
      "Motivo de rejeição obrigatório.",
      undefined,
      "INVALID_REVIEW_REASON",
    );
  }

  return { decision, reason };
}
```

5. Explicação do código ou da decisão.

A rejeição exige motivo porque uma associação precisa de feedback mínimo e a
equipa precisa de evidencia para defesa. O validator não usa `String(...)`:
`null`, arrays, objetos e números são recusados em vez de serem convertidos.
Qualquer motivo, incluindo aprovação, fica limitado a 500 caracteres.

6. Validação do passo.

```bash
node -e "import('./src/modules/charities/charity-review.validation.js').then(({ assertReviewPayload }) => console.log(assertReviewPayload({ decision: 'approved' }).decision))"
```

`backend/tests/unit/mf4-charity-review.validation.test.js`

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertReviewPayload } from "../../src/modules/charities/charity-review.validation.js";

test("MF4 recusa body e campos não escalares", () => {
  // Nenhum valor hostil pode ser convertido implicitamente para texto.
  for (const input of [null, [], { decision: {} }, { decision: "approved", reason: {} }]) {
    assert.throws(() => assertReviewPayload(input), (error) => error.statusCode === 400);
  }
});

test("MF4 limita o motivo a 500 caracteres", () => {
  assert.throws(
    () => assertReviewPayload({ decision: "rejected", reason: "x".repeat(501) }),
    /500/,
  );
});
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem motivo de rejeição, a decisão fica opaca e dificil de defender.
Body `null`/array, `decision` não textual, `reason` objeto ou motivo com 501
caracteres devolvem `400` com código estável no envelope do error handler.

### Passo 2 - Criar service de aprovação e entrada na pool

1. Objetivo do passo.

Atualizar candidatura e criar associação elegível quando aprovada.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-review.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo. O helper `runInTransaction` deve rejeitar transações
aninhadas e só repetir erros transientes; `writeAdminAudit` recebe `db` e
`session`, remove campos sensíveis recursivamente e nunca abre uma segunda
transação.

4. Código completo.

```js
/**
 * Módulo de serviço para revisão administrativa de candidaturas.
 *
 * Garante decisão única, valida a role administrativa antes da rota chamar este
 * fluxo e cria a associação elegível apenas quando a candidatura é aprovada.
 */
import { ObjectId } from "mongodb";
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import { assertReviewPayload } from "./charity-review.validation.js";

/**
 * Converte uma string para `ObjectId` com mensagem contextual.
 *
 * @param {string} id Identificador recebido da rota ou sessão.
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
 * Remove campos internos antes de devolver uma associação aprovada.
 *
 * @param {object} charity Documento da colecao `charities`.
 * @returns {object} Associação pública para API/admin.
 */
function publicCharity(charity) {
  return {
    id: String(charity._id),
    name: charity.name,
    mission: charity.mission,
    websiteUrl: charity.websiteUrl,
    status: charity.status,
    poolStatus: charity.poolStatus,
    approvedAt: charity.approvedAt,
  };
}

/**
 * Cria indices para impedir duplicação de entrada na pool.
 *
 * @returns {Promise<void>}
 */
export async function ensureCharityIndexes() {
  const db = await getDb();
  await db.collection("charities").createIndex({ applicationId: 1 }, { unique: true });
  await db.collection("charities").createIndex({ status: 1, poolStatus: 1 });
}

/**
 * Reve uma candidatura pendente e cria associação elegível quando aprovada.
 *
 * @param {string} applicationId Identificador da candidatura.
 * @param {string} reviewerUserId Identificador do admin que decide.
 * @param {object} input Decisão recebida da UI.
 * @param {{ requestId?: string }} [context] Metadados seguros do pedido HTTP.
 * @returns {Promise<object>} Resultado da rejeição ou associação criada.
 * @throws {Error} Quando a candidatura não existe, já foi decidida ou o payload e inválido.
 */
export async function reviewCharityApplication(
  applicationId,
  reviewerUserId,
  input,
  context = {},
) {
  const payload = assertReviewPayload(input);
  const _id = asObjectId(applicationId, "Candidatura");
  const reviewerObjectId = asObjectId(reviewerUserId, "Revisor");

  return runInTransaction(async ({ db, session }) => {
    const now = new Date();

    // O filtro reclama a decisão uma única vez, mesmo com dois admins concorrentes.
    const application = await db.collection("charity_applications").findOneAndUpdate(
      { _id, status: "pending" },
      {
        $set: {
          status: payload.decision,
          reviewedAt: now,
          reviewedBy: reviewerObjectId,
          reviewReason: payload.reason,
          updatedAt: now,
        },
      },
      { returnDocument: "before", session },
    );

    if (!application) {
      throw new HttpError(
        409,
        "A candidatura já foi decidida ou deixou de estar pendente.",
        undefined,
        "APPLICATION_ALREADY_REVIEWED",
      );
    }

    const reviewedApplication = {
      ...application,
      status: payload.decision,
      reviewedAt: now,
      reviewedBy: reviewerObjectId,
      reviewReason: payload.reason,
      updatedAt: now,
    };

    if (payload.decision === "rejected") {
      await writeAdminAudit({
        db,
        session,
        actorUserId: reviewerObjectId,
        action: "charity.application_review",
        targetType: "charity_application",
        targetId: _id,
        before: application,
        after: reviewedApplication,
        requestId: context.requestId,
        metadata: { decision: payload.decision },
      });

      return {
        application: {
          id: applicationId,
          status: "rejected",
          reviewReason: payload.reason,
        },
      };
    }

    const charity = {
      applicationId: _id,
      name: application.name,
      mission: application.mission,
      websiteUrl: application.websiteUrl,
      contactEmail: application.email,
      status: "active",
      poolStatus: "eligible",
      approvedAt: now,
      approvedBy: reviewerObjectId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("charities").insertOne(charity, { session });
    const persistedCharity = { ...charity, _id: result.insertedId };

    await writeAdminAudit({
      db,
      session,
      actorUserId: reviewerObjectId,
      action: "charity.application_review",
      targetType: "charity_application",
      targetId: _id,
      before: application,
      after: { ...reviewedApplication, charityId: result.insertedId },
      requestId: context.requestId,
      metadata: { decision: payload.decision },
    });

    return { charity: publicCharity(persistedCharity) };
  });
}

/**
 * Lista associações ativas e elegíveis para distribuição solidária.
 *
 * @returns {Promise<{ charities: object[] }>} Associações ordenadas por data de aprovação.
 */
export async function listEligibleCharities() {
  const db = await getDb();
  const charities = await db.collection("charities").find({ status: "active", poolStatus: "eligible" }).sort({ approvedAt: 1 }).toArray();
  return { charities: charities.map(publicCharity) };
}
```

5. Explicação do código ou da decisão.

O `findOneAndUpdate` condicionado por `status: "pending"` reclama a decisão uma
única vez. A candidatura, a eventual associação e o evento
`charity.application_review` partilham a mesma transação e a mesma sessão: uma
falha tardia reverte tudo. Uma segunda decisão não é tratada como sucesso
idempotente; devolve conflito explícito porque os payloads podem divergir.

6. Validação do passo.

```bash
node -e "import('./src/modules/charities/charity-review.service.js').then((m) => console.log(typeof m.reviewCharityApplication, typeof m.listEligibleCharities))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem transação e sem `applicationId` único em `charities`, uma falha podia deixar
a candidatura aprovada sem associação, ou criar duas entradas na pool.

### Passo 3 - Adicionar rotas de revisão

1. Objetivo do passo.

Adicionar endpoints admin sem remover rotas do BK anterior.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/charities/charities.routes.js`
    - EDITAR: `backend/src/modules/charities/charity-applications.controller.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Acrescenta a função `patchCharityApplicationReview` e a rota `PATCH /applications/:id/review`.

4. Código completo.

Adicionar ao controller:

```js
import { reviewCharityApplication } from "./charity-review.service.js";

/**
 * Aplica decisão administrativa sobre uma candidatura pendente.
 *
 * @param {import("express").Request} req Pedido com `params.id`, `user.id` e corpo de decisão.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function patchCharityApplicationReview(req, res) {
  res.status(200).json(
    await reviewCharityApplication(req.params.id, req.user.id, req.body, {
      requestId: req.id,
    }),
  );
}
```

Trecho final esperado no router:

```js
// A rota fica protegida por role admin porque altera estado operacional e entrada na pool.
charitiesRouter.patch(
  "/applications/:id/review",
  requireRole(["admin"]),
  asyncHandler(patchCharityApplicationReview),
);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureCharityIndexes } from "./modules/charities/charity-review.service.js";

await ensureCharityIndexes();
```

5. Explicação do código ou da decisão.

A rota de decisão fica em `applications/:id/review` porque a acao acontece sobre uma candidatura existente.

6. Validação do passo.

```bash
curl -i -X PATCH http://localhost:3000/api/charities/applications/ID/review \
  -H "Content-Type: application/json" \
  -d '{"decision":"approved"}'
```

Sem cookie admin deve devolver `401` ou `403`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se a rota aceitar qualquer role, uma associação podia aprovar a propria candidatura.

### Passo 4 - Criar painel admin simples

1. Objetivo do passo.

Permitir ao admin ver candidaturas pendentes e decidir.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/charitiesApi.js`
    - CRIAR: `frontend/src/pages/AdminCharityApplicationsPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`

3. Instrucoes concretas.

Acrescenta `reviewApplication` ao cliente API e cria rota admin.

4. Código completo da página e patch contextual do cliente.

O recorte seguinte é para inserir no objeto `charitiesApi` já exportado pelo
ficheiro; não é um módulo JavaScript autónomo e não substitui os métodos atuais:

```text
/**
 * Envia decisão administrativa para uma candidatura.
 *
 * @param {string} id Identificador da candidatura.
 * @param {object} input Decisão e motivo opcional.
 * @param {object} [options] Opções do cliente, incluindo `signal`.
 * @returns {Promise<object>} Resultado da revisão.
 */
reviewApplication(id, input, options = {}) {
  return apiClient.patch(
    `/api/charities/applications/${encodeURIComponent(id)}/review`,
    input,
    options,
  );
},
```

`frontend/src/pages/AdminCharityApplicationsPage.jsx`

```jsx
/**
 * Módulo da página administrativa de revisão de candidaturas.
 *
 * Lista candidaturas pendentes e envia decisões para o backend, onde a role
 * `admin` e a regra de decisão única são aplicadas.
 */
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "../components/admin/ConfirmDialog.jsx";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Painel administrativo para decidir candidaturas pendentes.
 *
 * @returns {JSX.Element} Lista de candidaturas com acoes de aprovar e rejeitar.
 */
export function AdminCharityApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState("");
  const [reason, setReason] = useState("");
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [reloadVersion, setReloadVersion] = useState(0);
  const contextVersionRef = useRef(0);
  const reservationsRef = useRef(new Set());
  const mutationControllersRef = useRef(new Map());
  const mountedRef = useRef(true);

  useEffect(() => {
    const contextVersion = ++contextVersionRef.current;
    const controller = new AbortController();
    setLoading(true);
    setError("");

    charitiesApi.listApplications(
      { status: "pending", page, limit: 20 },
      { signal: controller.signal },
    ).then((response) => {
      if (controller.signal.aborted || contextVersion !== contextVersionRef.current) return;
      setApplications(response.applications);
      setPagination({
        page: response.page,
        total: response.total,
        totalPages: response.totalPages,
      });
    }).catch((apiError) => {
      if (controller.signal.aborted || apiError?.code === "REQUEST_ABORTED") return;
      if (contextVersion !== contextVersionRef.current) return;
      setError(toUserMessage(apiError));
    }).finally(() => {
      if (!controller.signal.aborted && contextVersion === contextVersionRef.current) {
        setLoading(false);
      }
    });

    return () => controller.abort();
  }, [page, reloadVersion]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      contextVersionRef.current += 1;
      for (const controller of mutationControllersRef.current.values()) controller.abort();
      mutationControllersRef.current.clear();
      reservationsRef.current.clear();
    };
  }, []);

  /**
   * Envia a decisão do admin e recarrega a lista para evitar segunda decisão.
   *
   * @returns {Promise<void>}
   */
  async function decide() {
    if (!selected || !["approved", "rejected"].includes(decision)) return;
    const normalizedReason = reason.trim();
    if (decision === "rejected" && (normalizedReason.length < 10 || normalizedReason.length > 500)) {
      setError("O motivo da rejeição deve ter entre 10 e 500 caracteres.");
      return;
    }
    const id = selected.id;
    if (reservationsRef.current.has(id)) return;

    const contextVersion = contextVersionRef.current;
    const controller = new AbortController();
    reservationsRef.current.add(id);
    mutationControllersRef.current.set(id, controller);
    setBusyIds((current) => new Set(current).add(id));
    setError("");
    setStatus("");
    try {
      await charitiesApi.reviewApplication(id, {
        decision,
        reason: decision === "rejected" ? normalizedReason : "",
      }, { signal: controller.signal });
      if (controller.signal.aborted || contextVersion !== contextVersionRef.current) return;
      setApplications((current) => current.filter((item) => item.id !== id));
      setStatus(decision === "approved" ? "Candidatura aprovada." : "Candidatura rejeitada.");
      setSelected(null);
      setDecision("");
      setReason("");
      setReloadVersion((value) => value + 1);
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.code === "REQUEST_ABORTED") return;
      if (contextVersion !== contextVersionRef.current) return;
      setError(toUserMessage(apiError));
    } finally {
      if (mutationControllersRef.current.get(id) === controller) {
        mutationControllersRef.current.delete(id);
        reservationsRef.current.delete(id);
      }
      if (mountedRef.current) {
        setBusyIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    }
  }

  return (
    <main>
      <h1>Candidaturas</h1>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      {loading && <p role="status">A carregar candidaturas...</p>}
      {error && (
        <button type="button" onClick={() => setReloadVersion((value) => value + 1)}>
          Tentar novamente
        </button>
      )}
      {!loading && !error && applications.length === 0 && <p>Não existem candidaturas pendentes.</p>}
      {applications.map((application) => (
        <article key={application.id} aria-busy={busyIds.has(application.id)}>
          <h2>{application.name}</h2>
          <p>{application.mission}</p>
          <button
            type="button"
            disabled={busyIds.has(application.id)}
            onClick={() => { setSelected(application); setDecision("approved"); setReason(""); }}
          >
            {busyIds.has(application.id) ? "A processar..." : "Aprovar"}
          </button>
          <button
            type="button"
            disabled={busyIds.has(application.id)}
            onClick={() => { setSelected(application); setDecision("rejected"); setReason(application.reviewReason ?? ""); }}
          >
            {busyIds.has(application.id) ? "A processar..." : "Rejeitar"}
          </button>
        </article>
      ))}
      <ConfirmDialog
        open={Boolean(selected)}
        title={decision === "approved" ? "Aprovar candidatura" : "Rejeitar candidatura"}
        confirmLabel={decision === "approved" ? "Aprovar e criar associação" : "Rejeitar candidatura"}
        busy={selected ? busyIds.has(selected.id) : false}
        onCancel={() => { setSelected(null); setDecision(""); setReason(""); }}
        onConfirm={decide}
      >
        {selected ? (
          <div>
            <p><strong>{selected.name}</strong></p>
            <p>{selected.mission}</p>
            <p>{selected.contactName} · {selected.contactEmail} · {selected.phone}</p>
            {decision === "rejected" ? (
              <label>
                Motivo da rejeição
                <textarea value={reason} minLength={10} maxLength={500} required onChange={(event) => setReason(event.target.value)} />
              </label>
            ) : null}
          </div>
        ) : null}
      </ConfirmDialog>
      {!loading && !error && pagination.totalPages > 1 ? (
        <nav aria-label="Paginação de candidaturas">
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            Anterior
          </button>
          <span>Página {pagination.page} de {pagination.totalPages} ({pagination.total})</span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Seguinte
          </button>
        </nav>
      ) : null}
    </main>
  );
}
```

Em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// ADICIONAR uma única vez; a guarda visual é composta depois em BK-MF7-02.
const AdminCharityApplicationsPage = lazyNamedPage(
  () => import("../pages/AdminCharityApplicationsPage.jsx"),
  "AdminCharityApplicationsPage",
);

<Route path="/admin/charity-applications" element={<AdminCharityApplicationsPage />} />
```

5. Explicação do código ou da decisão.

O formulário consome o envelope paginado real, pede confirmação com o nome da
associação e reserva cada ID num `ref` antes do render. Leitura e mutations têm
`AbortController`; uma resposta de outro contexto não altera a página atual.
Depois de sucesso, a linha sai e a listagem autoritativa é recarregada. A
declaração lazy existe antes de a rota ser usada e não reintroduz imports eager.

6. Validação do passo.

Entrar como admin, aprovar candidatura e confirmar que desaparece da lista pendente.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem reload apos decisão, o admin pode tentar decidir duas vezes.

#### Critérios de aceite

- Admin aprova candidatura pendente e a API cria uma associação `active` e `eligible`.
- Admin revê contacto/missão e rejeita candidatura pendente com motivo humano
  explícito de 10..500 caracteres; não cria associação.
- O validator exige body objeto não-null/não-array, `decision` string no enum e
  `reason` string até 500 caracteres; não existe coerção por `String(...)`.
- Utilizador sem admin não consegue decidir candidaturas.
- A mesma candidatura não pode receber duas decisões: a perdedora devolve `409`
  com `code: "APPLICATION_ALREADY_REVIEWED"`.
- A decisão, a eventual associação e o audit log fazem commit ou rollback em
  conjunto; o audit inclui o `requestId` quando existe.
- A UI usa diálogo acessível, bloqueia apenas a linha ativa, cancela pedidos no
  unmount e não aplica respostas antigas.
- A paginação mostra o total da API e permite chegar a candidaturas para além da
  primeira página sem exceder `limit: 50`.

#### Validação final

```bash
cd backend
npm test
```

Executar fluxo: submeter candidatura, aprovar como admin, listar elegíveis;
depois injetar falha no audit e confirmar que candidatura e associação não
ficaram parcialmente persistidas.

#### Evidence para PR/defesa

- `pr`: commit/PR com service de decisão e página admin.
- `proof`: candidatura aprovada e associação criada.
- `neg`: decisão sem admin, rejeição sem motivo, decisões concorrentes e falha
  tardia do audit com rollback total.

#### Handoff

O `BK-MF4-05` deve distribuir apenas por `charities` com `status: "active"` e `poolStatus: "eligible"`.

## Snippet técnico aplicável

Este recorte destaca a unidade transacional dentro da função completa criada no
Passo 2. Não é JavaScript autónomo: `_id` e `update` pertencem aos argumentos e
estado local dessa função.

```text
// Claim, entidade operacional e auditoria pertencem à mesma unidade de commit.
return runInTransaction(async ({ db, session }) => {
  const application = await db.collection("charity_applications").findOneAndUpdate(
    { _id, status: "pending" },
    update,
    { returnDocument: "before", session },
  );
});
```

#### Changelog

- `2026-07-12`: detalhe de candidatura e motivo de rejeição editável 10..500
  substituem a razão fixa e a confirmação nativa.

- `2026-06-13`: guia reescrito com aprovação, rejeição, entrada na pool, admin UI e negativos.
- `2026-07-10`: revisão tornada concorrente e transacional, com audit sanitizado,
  `requestId`, conflito estável e rollback por falha tardia.
- `2026-07-10`: painel admin sincronizado com confirmação, busy state por linha,
  cancelamento/anti-stale, paginação com metadata e mensagens PT-PT.
