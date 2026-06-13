# BK-MF4-04 - Aprovacao e entrada na pool

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
- `last_updated`: `2026-06-13`

## Bloco pedagogico (obrigatorio)

Neste BK vais criar a revisao administrativa das candidaturas e transformar candidaturas aprovadas em associacoes elegiveis para a pool solidaria.

### Objetivo pedagogico

- Implementar aprovacao e rejeicao com role `admin`.
- Criar a entidade `charities` apenas quando a candidatura e aprovada.
- Guardar motivo e auditoria minima da decisao.
- Preparar o `BK-MF4-05`, que distribui valor apenas por associacoes elegiveis.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se a equipa nao conseguir explicar quem aprovou e quando aprovou, a auditoria ainda nao esta pronta.

### Conceitos essenciais

- Aprovacao e uma decisao administrativa sobre uma candidatura.
- Entrada na pool significa criar associacao ativa e elegivel.
- Rejeicao deve guardar motivo para transparencia interna.
- `CANONICO`: RF42 exige aprovacao/rejeicao; RF43 exige integracao em pool.
- `DERIVADO`: `charities.status` usa `active` ou `inactive`; `poolStatus` usa `eligible` ou `paused`.

### Erros comuns

- Deixar utilizador comum aprovar candidatura.
- Aprovar a mesma candidatura duas vezes.
- Criar associacao sem ligacao a candidatura original.
- Apagar candidatura rejeitada, perdendo historico.

### Check de compreensao

- [ ] Sei explicar porque aprovacao cria `charities`.
- [ ] Sei provar que so admin decide.
- [ ] Sei indicar que dados ficam para auditoria.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF4-03` executado com candidaturas `pending`.
- `requireRole(["admin"])` disponivel.
- `charitiesRouter` montado em `/api/charities`.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de decisao

1. Objetivo do passo.

Validar decisao administrativa e motivo.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-review.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Adiciona este ficheiro ao modulo `charities`.

4. Codigo completo.

```js
/**
 * Decisoes aceites no processo de revisao de candidaturas.
 * Qualquer outro estado e controlado por outros fluxos do modulo.
 */
export const REVIEW_DECISIONS = ["approved", "rejected"];

/**
 * Cria um erro HTTP previsivel para validacao de revisao.
 *
 * @param {string} message Mensagem segura para devolver ao cliente.
 * @param {number} [statusCode=400] Codigo HTTP associado.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Valida a decisao administrativa sobre uma candidatura.
 *
 * @param {object} input Corpo recebido na rota de revisao.
 * @param {string} input.decision Decisao pretendida.
 * @param {string} [input.reason] Motivo, obrigatorio em rejeicoes.
 * @returns {{ decision: string, reason: string }} Decisao normalizada.
 * @throws {Error} Quando a decisao e invalida ou a rejeicao nao tem motivo suficiente.
 */
export function assertReviewPayload(input) {
  const decision = String(input.decision ?? "").trim();
  const reason = String(input.reason ?? "").trim();

  if (!REVIEW_DECISIONS.includes(decision)) {
    throw httpError("Decisao invalida.");
  }

  if (decision === "rejected" && reason.length < 10) {
    throw httpError("Motivo de rejeicao obrigatorio.");
  }

  return { decision, reason };
}
```

5. Explicacao do codigo ou da decisao.

A rejeicao exige motivo porque uma associacao precisa de feedback minimo e a equipa precisa de evidencia para defesa.

6. Validacao do passo.

```bash
node -e "import('./src/modules/charities/charity-review.validation.js').then(({ assertReviewPayload }) => console.log(assertReviewPayload({ decision: 'approved' }).decision))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem motivo de rejeicao, a decisao fica opaca e dificil de defender.

### Passo 2 - Criar service de aprovacao e entrada na pool

1. Objetivo do passo.

Atualizar candidatura e criar associacao elegivel quando aprovada.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-review.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { assertReviewPayload } from "./charity-review.validation.js";

/**
 * Converte uma string para `ObjectId` com mensagem contextual.
 *
 * @param {string} id Identificador recebido da rota ou sessao.
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
 * Remove campos internos antes de devolver uma associacao aprovada.
 *
 * @param {object} charity Documento da colecao `charities`.
 * @returns {object} Associacao publica para API/admin.
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
 * Cria indices para impedir duplicacao de entrada na pool.
 *
 * @returns {Promise<void>}
 */
export async function ensureCharityIndexes() {
  const db = await getDb();
  await db.collection("charities").createIndex({ applicationId: 1 }, { unique: true });
  await db.collection("charities").createIndex({ status: 1, poolStatus: 1 });
}

/**
 * Reve uma candidatura pendente e cria associacao elegivel quando aprovada.
 *
 * @param {string} applicationId Identificador da candidatura.
 * @param {string} reviewerUserId Identificador do admin que decide.
 * @param {object} input Decisao recebida da UI.
 * @returns {Promise<object>} Resultado da rejeicao ou associacao criada.
 * @throws {Error} Quando a candidatura nao existe, ja foi decidida ou o payload e invalido.
 */
export async function reviewCharityApplication(applicationId, reviewerUserId, input) {
  const db = await getDb();
  const payload = assertReviewPayload(input);
  const now = new Date();
  const _id = asObjectId(applicationId, "Candidatura");

  // Apenas candidaturas pendentes podem mudar de estado; isto evita decisoes duplicadas.
  const application = await db.collection("charity_applications").findOne({ _id, status: "pending" });
  if (!application) {
    const error = new Error("Candidatura pendente nao encontrada.");
    error.statusCode = 404;
    throw error;
  }

  await db.collection("charity_applications").updateOne(
    { _id },
    {
      $set: {
        status: payload.decision,
        reviewedAt: now,
        reviewedBy: asObjectId(reviewerUserId, "Revisor"),
        reviewReason: payload.reason,
        updatedAt: now,
      },
    },
  );

  if (payload.decision === "rejected") {
    // Rejeicao fecha a candidatura e nao cria entrada na pool.
    return { application: { id: applicationId, status: "rejected", reviewReason: payload.reason } };
  }

  // A associacao nasce a partir da candidatura existente para manter rastreabilidade.
  const charity = {
    applicationId: _id,
    name: application.name,
    mission: application.mission,
    websiteUrl: application.websiteUrl,
    contactEmail: application.email,
    status: "active",
    poolStatus: "eligible",
    approvedAt: now,
    approvedBy: asObjectId(reviewerUserId, "Revisor"),
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("charities").insertOne(charity);
  return { charity: publicCharity({ ...charity, _id: result.insertedId }) };
}

/**
 * Lista associacoes ativas e elegiveis para distribuicao solidaria.
 *
 * @returns {Promise<{ charities: object[] }>} Associacoes ordenadas por data de aprovacao.
 */
export async function listEligibleCharities() {
  const db = await getDb();
  const charities = await db.collection("charities").find({ status: "active", poolStatus: "eligible" }).sort({ approvedAt: 1 }).toArray();
  return { charities: charities.map(publicCharity) };
}
```

5. Explicacao do codigo ou da decisao.

O service so procura candidaturas `pending`. Isto torna a aprovacao idempotente na pratica: a segunda tentativa ja nao encontra candidatura pendente.

6. Validacao do passo.

```bash
node -e "import('./src/modules/charities/charity-review.service.js').then((m) => console.log(typeof m.reviewCharityApplication, typeof m.listEligibleCharities))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem `applicationId` unico em `charities`, a mesma candidatura podia entrar duas vezes na pool.

### Passo 3 - Adicionar rotas de revisao

1. Objetivo do passo.

Adicionar endpoints admin sem remover rotas do BK anterior.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/charities/charities.routes.js`
    - EDITAR: `backend/src/modules/charities/charity-applications.controller.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Acrescenta a funcao `patchCharityApplicationReview` e a rota `PATCH /applications/:id/review`.

4. Codigo completo.

Adicionar ao controller:

```js
import { reviewCharityApplication } from "./charity-review.service.js";

/**
 * Aplica decisao administrativa sobre uma candidatura pendente.
 *
 * @param {import("express").Request} req Pedido com `params.id`, `user.id` e corpo de decisao.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function patchCharityApplicationReview(req, res) {
  res.status(200).json(await reviewCharityApplication(req.params.id, req.user.id, req.body));
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

5. Explicacao do codigo ou da decisao.

A rota de decisao fica em `applications/:id/review` porque a acao acontece sobre uma candidatura existente.

6. Validacao do passo.

```bash
curl -i -X PATCH http://localhost:3000/api/charities/applications/ID/review \
  -H "Content-Type: application/json" \
  -d '{"decision":"approved"}'
```

Sem cookie admin deve devolver `401` ou `403`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se a rota aceitar qualquer role, uma associacao podia aprovar a propria candidatura.

### Passo 4 - Criar painel admin simples

1. Objetivo do passo.

Permitir ao admin ver candidaturas pendentes e decidir.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/charitiesApi.js`
    - CRIAR: `frontend/src/pages/AdminCharityApplicationsPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`

3. Instrucoes concretas.

Acrescenta `reviewApplication` ao cliente API e cria rota admin.

4. Codigo completo.

Adicionar a `charitiesApi`:

```js
/**
 * Envia decisao administrativa para uma candidatura.
 *
 * @param {string} id Identificador da candidatura.
 * @param {object} input Decisao e motivo opcional.
 * @returns {Promise<object>} Resultado da revisao.
 */
reviewApplication(id, input) {
  return apiClient.patch(`/api/charities/applications/${encodeURIComponent(id)}/review`, input);
}
```

`frontend/src/pages/AdminCharityApplicationsPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Painel administrativo para decidir candidaturas pendentes.
 *
 * @returns {JSX.Element} Lista de candidaturas com acoes de aprovar e rejeitar.
 */
export function AdminCharityApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Carrega candidaturas pendentes para revisao.
   *
   * @returns {Promise<void>}
   */
  async function loadApplications() {
    setLoading(true);
    setError("");
    try {
      const response = await charitiesApi.listApplications("pending");
      setApplications(response.applications);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  /**
   * Envia a decisao do admin e recarrega a lista para evitar segunda decisao.
   *
   * @param {string} id Identificador da candidatura.
   * @param {"approved" | "rejected"} decision Decisao escolhida.
   * @returns {Promise<void>}
   */
  async function decide(id, decision) {
    setError("");
    try {
      await charitiesApi.reviewApplication(id, {
        decision,
        reason: decision === "rejected" ? "Nao cumpre os criterios minimos da pool." : "",
      });
      await loadApplications();
    } catch (apiError) {
      setError(toUserMessage(apiError));
    }
  }

  if (loading) return <main><p>A carregar candidaturas...</p></main>;

  return (
    <main>
      <h1>Candidaturas</h1>
      {error && <p role="alert">{error}</p>}
      {applications.length === 0 && <p>Nao existem candidaturas pendentes.</p>}
      {applications.map((application) => (
        <article key={application.id}>
          <h2>{application.name}</h2>
          <p>{application.mission}</p>
          <button type="button" onClick={() => decide(application.id, "approved")}>Aprovar</button>
          <button type="button" onClick={() => decide(application.id, "rejected")}>Rejeitar</button>
        </article>
      ))}
    </main>
  );
}
```

5. Explicacao do codigo ou da decisao.

Esta pagina e simples, mas suficiente para o admin fechar RF42 e RF43 sem mexer diretamente na base de dados.

6. Validacao do passo.

Entrar como admin, aprovar candidatura e confirmar que desaparece da lista pendente.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem reload apos decisao, o admin pode tentar decidir duas vezes.

## Criterios de aceite (mensuraveis)

- Admin aprova candidatura pendente e a API cria uma associacao `active` e `eligible`.
- Admin rejeita candidatura pendente com motivo e nao cria associacao.
- Utilizador sem admin nao consegue decidir candidaturas.
- A mesma candidatura nao pode ser aprovada duas vezes.

## Validacao final

```bash
cd backend
npm test
```

Executar fluxo: submeter candidatura, aprovar como admin, listar elegiveis.

## Evidence para PR/defesa

- `pr`: commit/PR com service de decisao e pagina admin.
- `proof`: candidatura aprovada e associacao criada.
- `neg`: decisao sem admin, rejeicao sem motivo e segunda aprovacao.

## Handoff

O `BK-MF4-05` deve distribuir apenas por `charities` com `status: "active"` e `poolStatus: "eligible"`.

## Snippet tecnico aplicavel

```js
// So candidaturas pending podem mudar de estado; isto evita decisao duplicada.
const application = await db.collection("charity_applications").findOne({ _id, status: "pending" });
```

## Changelog

- `2026-06-13`: guia reescrito com aprovacao, rejeicao, entrada na pool, admin UI e negativos.
