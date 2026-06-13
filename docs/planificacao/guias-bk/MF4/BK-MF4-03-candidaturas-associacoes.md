# BK-MF4-03 - Candidaturas de associacoes

## Header

- `doc_id`: `GUIA-BK-MF4-03`
- `bk_id`: `BK-MF4-03`
- `macro`: `MF4`
- `owner`: `Kaue`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF1-04`
- `rf_rnf`: `RF41`
- `fase_documental`: `Fase 1`
- `sprint`: `S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-04`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-03-candidaturas-associacoes.md`
- `last_updated`: `2026-06-13`

## Bloco pedagogico (obrigatorio)

Neste BK vais criar o fluxo de candidatura de uma associacao a pool solidaria. A associacao submete dados essenciais, o sistema guarda a candidatura com estado `pending` e o administrador so decide no BK seguinte.

### Objetivo pedagogico

- Perceber a diferenca entre candidatura e associacao aprovada.
- Validar dados de contacto e descricao antes de persistir.
- Criar um fluxo publico de submissao e uma listagem admin protegida.
- Preparar o `BK-MF4-04`, onde entra aprovacao/rejeicao.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se a equipa misturar candidatura com aprovacao, separar os campos numa tabela antes de codificar.

### Conceitos essenciais

- Candidatura e um pedido, nao uma entidade aprovada.
- Estado `pending` significa que ainda nao entra na pool.
- Admin pode listar candidaturas; visitante pode submeter uma.
- `CANONICO`: RF41 exige submissao de candidaturas por associacao.
- `DERIVADO`: candidatura publica nao exige login para reduzir atrito, mas os endpoints admin exigem `admin`.

### Erros comuns

- Aprovar automaticamente no momento da submissao.
- Pedir dados excessivos que nao sao necessarios para a decisao.
- Permitir que qualquer utilizador liste candidaturas.
- Nao validar email e texto minimo.

### Check de compreensao

- [ ] Sei explicar porque uma candidatura com `pending` ainda nao recebe distribuicao.
- [ ] Sei indicar que endpoint e publico e que endpoint e admin.
- [ ] Sei provar que submissao invalida nao cria registo.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF1-04` executado com sessao base.
- `BK-MF2-02` executado com `requireRole(["admin"])`.
- `backend/src/config/database.js` disponivel.
- Confirmar que RF41 pertence a este BK na matriz canonica.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de candidatura

1. Objetivo do passo.

Garantir que candidaturas entram com dados suficientes e sem campos inesperados.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-applications.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o modulo `charities`, que sera usado tambem nos BKs seguintes.

4. Codigo completo.

```js
/**
 * Expressao regular simples para rejeitar emails obviamente invalidos.
 * A validacao final de existencia do dominio fica fora do ambito do MVP.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Cria um erro HTTP controlado para validacoes da candidatura.
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
 * Valida texto obrigatorio com limites de tamanho.
 *
 * @param {string} value Valor recebido no corpo do pedido.
 * @param {string} field Nome do campo para mensagem de erro.
 * @param {number} min Tamanho minimo.
 * @param {number} max Tamanho maximo.
 * @returns {string} Texto normalizado.
 */
function requiredText(value, field, min, max) {
  const text = String(value ?? "").trim();
  if (text.length < min || text.length > max) {
    throw httpError(`${field} invalido.`);
  }
  return text;
}

/**
 * Normaliza website publico opcional.
 *
 * @param {string} value URL recebida no formulario.
 * @returns {string} URL normalizada ou string vazia.
 * @throws {Error} Quando o protocolo nao e `http` ou `https`.
 */
function optionalPublicUrl(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  let url;
  try {
    url = new URL(text);
  } catch {
    throw httpError("Website invalido.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw httpError("Website deve comecar por http:// ou https://.");
  }

  return url.toString();
}

/**
 * Valida e filtra os campos aceites numa candidatura publica.
 *
 * @param {object} input Corpo recebido em `POST /api/charities/applications`.
 * @returns {object} Payload seguro para persistir.
 * @throws {Error} Quando algum campo obrigatorio e invalido.
 */
export function assertCharityApplicationPayload(input) {
  const name = requiredText(input.name, "Nome", 3, 120);
  const contactName = requiredText(input.contactName, "Contacto", 3, 120);
  const email = String(input.email ?? "").trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    throw httpError("Email invalido.");
  }

  // O retorno inclui apenas campos permitidos; estado e dados de revisao sao definidos pelo backend.
  return {
    name,
    contactName,
    email,
    phone: String(input.phone ?? "").trim(),
    mission: requiredText(input.mission, "Missao", 30, 1200),
    websiteUrl: optionalPublicUrl(input.websiteUrl),
  };
}
```

5. Explicacao do codigo ou da decisao.

O validador devolve apenas campos aceites. Isto impede que o visitante envie `status: "approved"` ou outro campo sensivel. O website e opcional, mas quando existe fica normalizado como URL publica `http` ou `https`, porque sera exposto na pagina publica de associacoes.

6. Validacao do passo.

```bash
node -e "import('./src/modules/charities/charity-applications.validation.js').then(({ assertCharityApplicationPayload }) => console.log(assertCharityApplicationPayload({ name:'Associacao Vida', contactName:'Ana Silva', email:'ana@example.com', mission:'Apoio comunitario cristao com acompanhamento social local.' }).name))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem filtragem de campos, uma candidatura podia nascer aprovada por input malicioso. Sem validar o website, a pagina publica podia expor links com protocolos inseguros.

### Passo 2 - Criar service de candidaturas

1. Objetivo do passo.

Guardar candidatura, impedir duplicacao por email enquanto esta pendente e listar para admin.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-applications.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo.

4. Codigo completo.

```js
import { getDb } from "../../config/database.js";
import { assertCharityApplicationPayload } from "./charity-applications.validation.js";

/**
 * Remove campos internos antes de devolver uma candidatura.
 *
 * @param {object} application Documento da colecao `charity_applications`.
 * @returns {object} Candidatura publica para API/admin.
 */
function publicApplication(application) {
  return {
    id: String(application._id),
    name: application.name,
    contactName: application.contactName,
    email: application.email,
    phone: application.phone,
    mission: application.mission,
    websiteUrl: application.websiteUrl,
    status: application.status,
    submittedAt: application.submittedAt,
    reviewedAt: application.reviewedAt ?? null,
    reviewReason: application.reviewReason ?? null,
  };
}

/**
 * Cria indices necessarios para listagem e controlo de duplicados pendentes.
 *
 * @returns {Promise<void>}
 */
export async function ensureCharityApplicationIndexes() {
  const db = await getDb();
  await db.collection("charity_applications").createIndex({ email: 1, status: 1 });
  await db.collection("charity_applications").createIndex({ status: 1, submittedAt: -1 });
}

/**
 * Submete uma candidatura publica com estado inicial controlado.
 *
 * @param {object} input Dados enviados pela associacao.
 * @returns {Promise<{ application: object }>} Candidatura criada.
 * @throws {Error} Quando ja existe candidatura pendente para o mesmo email.
 */
export async function submitCharityApplication(input) {
  const db = await getDb();
  const payload = assertCharityApplicationPayload(input);

  // A duplicacao e limitada ao estado pending para permitir nova candidatura depois de uma decisao.
  const duplicate = await db.collection("charity_applications").findOne({
    email: payload.email,
    status: "pending",
  });

  if (duplicate) {
    const error = new Error("Ja existe uma candidatura pendente para este email.");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date();
  const application = {
    ...payload,
    // O cliente nunca escolhe o estado inicial.
    status: "pending",
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("charity_applications").insertOne(application);
  return { application: publicApplication({ ...application, _id: result.insertedId }) };
}

/**
 * Lista candidaturas para administradores, com filtro por estado.
 *
 * @param {string} [status="pending"] Estado a listar ou `all`.
 * @returns {Promise<{ applications: object[] }>} Candidaturas ordenadas por submissao.
 */
export async function listCharityApplications(status = "pending") {
  const db = await getDb();
  const filter = status === "all" ? {} : { status };
  const applications = await db.collection("charity_applications").find(filter).sort({ submittedAt: -1 }).toArray();
  return { applications: applications.map(publicApplication) };
}
```

5. Explicacao do codigo ou da decisao.

O estado inicial e sempre `pending`. A duplicacao por email reduz spam operacional, sem impedir nova candidatura depois de decisao.

6. Validacao do passo.

```bash
node -e "import('./src/modules/charities/charity-applications.service.js').then((m) => console.log(typeof m.submitCharityApplication, typeof m.listCharityApplications))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem estado inicial controlado, a pool podia receber entidades que nunca foram revistas.

### Passo 3 - Criar controller e rotas

1. Objetivo do passo.

Expor submissao publica e listagem protegida para admin.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-applications.controller.js`
    - CRIAR: `backend/src/modules/charities/charities.routes.js`
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Monta `charitiesRouter` em `/api/charities`.

4. Codigo completo.

`backend/src/modules/charities/charity-applications.controller.js`

```js
import {
  listCharityApplications,
  submitCharityApplication,
} from "./charity-applications.service.js";

/**
 * Recebe uma candidatura publica de associacao.
 *
 * @param {import("express").Request} req Pedido com corpo da candidatura.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function postCharityApplication(req, res) {
  res.status(201).json(await submitCharityApplication(req.body));
}

/**
 * Lista candidaturas para administradores.
 *
 * @param {import("express").Request} req Pedido com filtro opcional `status`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getCharityApplications(req, res) {
  res.status(200).json(await listCharityApplications(req.query.status ?? "pending"));
}
```

`backend/src/modules/charities/charities.routes.js`

```js
import { Router } from "express";
import { requireRole } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getCharityApplications,
  postCharityApplication,
} from "./charity-applications.controller.js";

/**
 * Router de candidaturas de associacoes.
 * A submissao e publica, mas a listagem exposta ao admin contem contactos privados.
 */
export const charitiesRouter = Router();

charitiesRouter.post("/applications", asyncHandler(postCharityApplication));
charitiesRouter.get("/applications", requireRole(["admin"]), asyncHandler(getCharityApplications));
```

Trecho esperado em `backend/src/app.js`:

```js
import { charitiesRouter } from "./modules/charities/charities.routes.js";

app.use("/api/charities", charitiesRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureCharityApplicationIndexes } from "./modules/charities/charity-applications.service.js";

await ensureCharityApplicationIndexes();
```

5. Explicacao do codigo ou da decisao.

Submissao fica publica. Listagem fica protegida por role para nao expor contactos das associacoes.

6. Validacao do passo.

```bash
curl -i -X POST http://localhost:3000/api/charities/applications \
  -H "Content-Type: application/json" \
  -d '{"name":"Associacao Vida","contactName":"Ana Silva","email":"ana@example.com","mission":"Apoio comunitario cristao com acompanhamento social local."}'
```

7. Caso negativo, erro comum ou risco que este passo evita.

Listagem publica exporia emails e contactos sem necessidade.

### Passo 4 - Criar formulario frontend

1. Objetivo do passo.

Permitir submissao de candidatura com loading, erro e sucesso.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/charitiesApi.js`
    - CRIAR: `frontend/src/pages/CharityApplicationPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`

3. Instrucoes concretas.

Cria rota `/charities/apply`.

4. Codigo completo.

`frontend/src/services/api/charitiesApi.js`

```js
import { apiClient } from "./apiClient.js";

export const charitiesApi = {
  /**
   * Submete uma candidatura publica.
   *
   * @param {object} input Campos do formulario.
   * @returns {Promise<{ application: object }>} Candidatura criada.
   */
  submitApplication(input) {
    return apiClient.post("/api/charities/applications", input);
  },
  /**
   * Lista candidaturas para ecras de administracao.
   *
   * @param {string} [status="pending"] Estado a consultar.
   * @returns {Promise<{ applications: object[] }>} Lista devolvida pela API.
   */
  listApplications(status = "pending") {
    return apiClient.get(`/api/charities/applications?status=${encodeURIComponent(status)}`);
  },
};
```

`frontend/src/pages/CharityApplicationPage.jsx`

```jsx
import { useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Estado inicial do formulario publico.
 * Fica fora do componente para permitir reposicao limpa apos submissao com sucesso.
 */
const INITIAL_FORM = { name: "", contactName: "", email: "", phone: "", mission: "", websiteUrl: "" };

/**
 * Pagina publica para candidatura de associacoes.
 *
 * @returns {JSX.Element} Formulario de submissao com feedback de erro e sucesso.
 */
export function CharityApplicationPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  /**
   * Atualiza um campo isolado mantendo os restantes valores do formulario.
   *
   * @param {string} field Nome do campo.
   * @param {string} value Novo valor.
   * @returns {void}
   */
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  /**
   * Envia candidatura para o backend e evita duplo envio enquanto o pedido decorre.
   *
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulario.
   * @returns {Promise<void>}
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setStatus("");
    try {
      await charitiesApi.submitApplication(form);
      setForm(INITIAL_FORM);
      setStatus("Candidatura submetida para revisao.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Candidatura de associacao</h1>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      <form onSubmit={handleSubmit}>
        <label>Nome da associacao<input value={form.name} onChange={(e) => updateField("name", e.target.value)} required /></label>
        <label>Contacto principal<input value={form.contactName} onChange={(e) => updateField("contactName", e.target.value)} required /></label>
        <label>Email<input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required /></label>
        <label>Telefone<input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} /></label>
        <label>Missao<textarea value={form.mission} onChange={(e) => updateField("mission", e.target.value)} required /></label>
        <label>Website<input value={form.websiteUrl} onChange={(e) => updateField("websiteUrl", e.target.value)} /></label>
        <button type="submit" disabled={submitting}>{submitting ? "A submeter..." : "Submeter candidatura"}</button>
      </form>
    </main>
  );
}
```

5. Explicacao do codigo ou da decisao.

O formulario envia apenas os campos permitidos e mostra feedback claro em portugues de Portugal.

6. Validacao do passo.

Submeter candidatura valida e depois repetir o mesmo email.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem estado de loading, o utilizador pode carregar duas vezes e criar tentativas duplicadas.

## Criterios de aceite (mensuraveis)

- `POST /api/charities/applications` devolve `201` com estado `pending`.
- Email invalido devolve `400`.
- Candidatura pendente duplicada devolve `409`.
- `GET /api/charities/applications` exige role `admin`.

## Validacao final

```bash
cd backend
npm test
```

Executar submissao valida, submissao invalida e listagem sem permissao.

## Evidence para PR/defesa

- `pr`: commit/PR com modulo `charities` e pagina de candidatura.
- `proof`: candidatura criada com `status: "pending"`.
- `neg`: email invalido, duplicado e listagem sem admin.

## Handoff

O `BK-MF4-04` deve usar `charity_applications` e alterar estado para `approved` ou `rejected`. Nao deve criar uma candidatura nova para aprovar.

## Snippet tecnico aplicavel

```js
// O estado nasce sempre pending; aprovacao e rejeicao pertencem ao BK seguinte.
status: "pending",
```

## Changelog

- `2026-06-13`: guia reescrito com submissao publica, listagem admin, validacao, frontend e negativos.
