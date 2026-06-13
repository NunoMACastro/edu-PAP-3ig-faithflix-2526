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
- `last_updated`: `2026-06-13`

## Bloco pedagógico (obrigatório)

Neste BK vais criar a revisão administrativa das candidaturas e transformar candidaturas aprovadas em associações elegíveis para a pool solidária.

### Objetivo pedagógico

- Implementar aprovação e rejeição com role `admin`.
- Criar a entidade `charities` apenas quando a candidatura é aprovada.
- Guardar motivo e auditoria mínima da decisão.
- Preparar o `BK-MF4-05`, que distribui valor apenas por associações elegíveis.

### Importância funcional

- A pool solidária precisa de uma decisão controlada antes de qualquer associação receber valor.
- Este BK separa pedido recebido, decisão administrativa e entrada efetiva na pool.
- A auditoria mínima protege a equipa: é possível explicar quem decidiu, quando decidiu e porquê.

### Scope-in

- Validar decisão `approved` ou `rejected`.
- Permitir aprovação/rejeição apenas a administradores.
- Guardar motivo de rejeição e dados de auditoria.
- Criar `charities` apenas quando a candidatura é aprovada.
- Criar painel admin simples para decidir candidaturas pendentes.

### Scope-out

- Não executar distribuição mensal; isso entra no `BK-MF4-05`.
- Não editar dados públicos da associação depois de aprovada.
- Não criar workflow avançado de documentos, anexos ou múltiplos revisores.
- Não permitir decisão por utilizador comum.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se a equipa não conseguir explicar quem aprovou e quando aprovou, a auditoria ainda não está pronta.

### Glossário rápido

- Revisão administrativa: decisão feita por alguém com role `admin`.
- Rejeição: decisão negativa com motivo mínimo.
- Associação elegível: associação aprovada e apta a participar na pool.
- Rastreabilidade: capacidade de provar a origem e a decisão de cada registo.

### Conceitos teóricos essenciais

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

## Bloco operacional (obrigatório)

### Pré-condições

- `BK-MF4-03` executado com candidaturas `pending`.
- `requireRole(["admin"])` disponível.
- `charitiesRouter` montado em `/api/charities`.

### Arquitetura do BK

- Backend: validação de decisão, service de revisão, controller e rota protegida.
- Persistência: a candidatura mantém histórico; a associação aprovada nasce em `charities`.
- Frontend: `AdminCharityApplicationsPage` permite aprovar/rejeitar sem mexer diretamente na base de dados.
- Segurança: rota de decisão exige `requireRole(["admin"])`.
- Integração: `BK-MF4-05` consome apenas associações `active` e `eligible`.

### Ficheiros a criar, editar e rever

- CRIAR: `backend/src/modules/charities/charity-review.validation.js`
- CRIAR: `backend/src/modules/charities/charity-review.service.js`
- CRIAR: `frontend/src/pages/AdminCharityApplicationsPage.jsx`
- EDITAR: `backend/src/modules/charities/charities.routes.js`
- EDITAR: `backend/src/modules/charities/charity-applications.controller.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `frontend/src/services/api/charitiesApi.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF4-03`, `RF42`, `RF43`, `RNF19`

### Guia de execução (passo-a-passo)

### Passo 1 - Criar validação de decisão

1. Objetivo do passo.

Validar decisão administrativa e motivo.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-review.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Adiciona este ficheiro ao módulo `charities`.

4. Código completo.

```js
/**
 * Decisões aceites no processo de revisão de candidaturas.
 * Qualquer outro estado e controlado por outros fluxos do módulo.
 */
export const REVIEW_DECISIONS = ["approved", "rejected"];

/**
 * Cria um erro HTTP previsivel para validação de revisão.
 *
 * @param {string} message Mensagem segura para devolver ao cliente.
 * @param {number} [statusCode=400] Código HTTP associado.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

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
  const decision = String(input.decision ?? "").trim();
  const reason = String(input.reason ?? "").trim();

  if (!REVIEW_DECISIONS.includes(decision)) {
    throw httpError("Decisão inválida.");
  }

  if (decision === "rejected" && reason.length < 10) {
    throw httpError("Motivo de rejeição obrigatório.");
  }

  return { decision, reason };
}
```

5. Explicação do código ou da decisão.

A rejeição exige motivo porque uma associação precisa de feedback mínimo e a equipa precisa de evidencia para defesa.

6. Validação do passo.

```bash
node -e "import('./src/modules/charities/charity-review.validation.js').then(({ assertReviewPayload }) => console.log(assertReviewPayload({ decision: 'approved' }).decision))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem motivo de rejeição, a decisão fica opaca e dificil de defender.

### Passo 2 - Criar service de aprovação e entrada na pool

1. Objetivo do passo.

Atualizar candidatura e criar associação elegível quando aprovada.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-review.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo.

4. Código completo.

```js
/**
 * Módulo de serviço para revisão administrativa de candidaturas.
 *
 * Garante decisão única, valida a role administrativa antes da rota chamar este
 * fluxo e cria a associação elegível apenas quando a candidatura é aprovada.
 */
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
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
 * @returns {Promise<object>} Resultado da rejeição ou associação criada.
 * @throws {Error} Quando a candidatura não existe, já foi decidida ou o payload e inválido.
 */
export async function reviewCharityApplication(applicationId, reviewerUserId, input) {
  const db = await getDb();
  const payload = assertReviewPayload(input);
  const now = new Date();
  const _id = asObjectId(applicationId, "Candidatura");

  // Apenas candidaturas pendentes podem mudar de estado; isto evita decisões duplicadas.
  const application = await db.collection("charity_applications").findOne({ _id, status: "pending" });
  if (!application) {
    const error = new Error("Candidatura pendente não encontrada.");
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
    // Rejeição fecha a candidatura e não cria entrada na pool.
    return { application: { id: applicationId, status: "rejected", reviewReason: payload.reason } };
  }

  // A associação nasce a partir da candidatura existente para manter rastreabilidade.
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

O service só procura candidaturas `pending`. Isto torna a aprovação idempotente na pratica: a segunda tentativa já não encontra candidatura pendente.

6. Validação do passo.

```bash
node -e "import('./src/modules/charities/charity-review.service.js').then((m) => console.log(typeof m.reviewCharityApplication, typeof m.listEligibleCharities))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem `applicationId` único em `charities`, a mesma candidatura podia entrar duas vezes na pool.

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

4. Código completo.

Adicionar a `charitiesApi`:

```js
/**
 * Envia decisão administrativa para uma candidatura.
 *
 * @param {string} id Identificador da candidatura.
 * @param {object} input Decisão e motivo opcional.
 * @returns {Promise<object>} Resultado da revisão.
 */
reviewApplication(id, input) {
  return apiClient.patch(`/api/charities/applications/${encodeURIComponent(id)}/review`, input);
}
```

`frontend/src/pages/AdminCharityApplicationsPage.jsx`

```jsx
/**
 * Módulo da página administrativa de revisão de candidaturas.
 *
 * Lista candidaturas pendentes e envia decisões para o backend, onde a role
 * `admin` e a regra de decisão única são aplicadas.
 */
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
   * Carrega candidaturas pendentes para revisão.
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
   * Envia a decisão do admin e recarrega a lista para evitar segunda decisão.
   *
   * @param {string} id Identificador da candidatura.
   * @param {"approved" | "rejected"} decision Decisão escolhida.
   * @returns {Promise<void>}
   */
  async function decide(id, decision) {
    setError("");
    try {
      await charitiesApi.reviewApplication(id, {
        decision,
        reason: decision === "rejected" ? "Não cumpre os criterios minimos da pool." : "",
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
      {applications.length === 0 && <p>Não existem candidaturas pendentes.</p>}
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

5. Explicação do código ou da decisão.

Esta página e simples, mas suficiente para o admin fechar RF42 e RF43 sem mexer diretamente na base de dados.

6. Validação do passo.

Entrar como admin, aprovar candidatura e confirmar que desaparece da lista pendente.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem reload apos decisão, o admin pode tentar decidir duas vezes.

## Critérios de aceite (mensuráveis)

- Admin aprova candidatura pendente e a API cria uma associação `active` e `eligible`.
- Admin rejeita candidatura pendente com motivo e não cria associação.
- Utilizador sem admin não consegue decidir candidaturas.
- A mesma candidatura não pode ser aprovada duas vezes.

## Validação final

```bash
cd backend
npm test
```

Executar fluxo: submeter candidatura, aprovar como admin, listar elegíveis.

## Evidence para PR/defesa

- `pr`: commit/PR com service de decisão e página admin.
- `proof`: candidatura aprovada e associação criada.
- `neg`: decisão sem admin, rejeição sem motivo e segunda aprovação.

## Handoff

O `BK-MF4-05` deve distribuir apenas por `charities` com `status: "active"` e `poolStatus: "eligible"`.

## Snippet técnico aplicável

```js
// Só candidaturas pending podem mudar de estado; isto evita decisão duplicada.
const application = await db.collection("charity_applications").findOne({ _id, status: "pending" });
```

## Changelog

- `2026-06-13`: guia reescrito com aprovação, rejeição, entrada na pool, admin UI e negativos.
