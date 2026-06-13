# BK-MF4-03 - Candidaturas de associações

## Header

- `doc_id`: `GUIA-BK-MF4-03`
- `bk_id`: `BK-MF4-03`
- `macro`: `MF4`
- `owner`: `Kaue`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-02`
- `rf_rnf`: `RF41`
- `fase_documental`: `Fase 1`
- `sprint`: `S08`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF4-04`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-03-candidaturas-associacoes.md`
- `last_updated`: `2026-06-13`

## Bloco pedagógico (obrigatório)

Neste BK vais criar o fluxo de candidatura de uma associação à pool solidária. A associação submete dados essenciais, o sistema guarda a candidatura com estado `pending` e o administrador só decide no BK seguinte.

### Objetivo pedagógico

- Perceber a diferença entre candidatura e associação aprovada.
- Validar dados de contacto e descrição antes de persistir.
- Criar um fluxo público de submissão e uma listagem admin protegida.
- Preparar o `BK-MF4-04`, onde entra aprovação/rejeição.

### Importância funcional

- A pool solidária só é credível se as associações entrarem por um processo rastreável.
- Este BK recolhe os dados mínimos para avaliação sem transformar automaticamente o pedido numa associação aprovada.
- A separação entre submissão pública e listagem admin evita exposição indevida de contactos.

### Scope-in

- Criar validação de candidatura.
- Criar endpoint público de submissão.
- Criar endpoint admin para listar candidaturas.
- Guardar candidaturas com estado inicial `pending`.
- Criar formulário frontend para submissão.

### Scope-out

- Não aprovar nem rejeitar candidaturas; isso entra no `BK-MF4-04`.
- Não colocar associações na pool neste BK.
- Não recolher dados financeiros, documentos oficiais complexos ou informação sensível que não seja necessária ao MVP.
- Não criar login específico para associações.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se a equipa misturar candidatura com aprovação, separar os campos numa tabela antes de codificar.

### Glossário rápido

- Candidatura: pedido submetido por uma associação para ser avaliado.
- Associação aprovada: entidade que passou pela decisão admin e pode entrar na pool.
- Estado `pending`: candidatura recebida, mas ainda sem decisão.
- Listagem admin: consulta protegida para quem tem permissão de gestão.

### Conceitos teóricos essenciais

- Domínio FaithFlix: uma candidatura inicia o percurso solidário, mas não recebe distribuição enquanto não for aprovada.
- Backend: validação protege o service de dados incompletos, email inválido e textos demasiado curtos.
- Frontend: o formulário envia apenas os campos necessários e mostra sucesso/erro ao utilizador.
- Segurança: submissão pública aceita pedidos, mas listagem com contactos privados exige role `admin`.
- Dados: `charity_applications` guarda o estado e impede duplicados pendentes pelo mesmo email.
- `CANONICO`: RF41 exige submissão de candidaturas por associação.
- `DERIVADO`: candidatura pública não exige login para reduzir atrito, mas os endpoints admin exigem `admin`.

### Erros comuns

- Aprovar automaticamente no momento da submissão.
- Pedir dados excessivos que não sao necessários para a decisão.
- Permitir que qualquer utilizador liste candidaturas.
- Não validar email e texto mínimo.

### Check de compreensão

- [ ] Sei explicar porque uma candidatura com `pending` ainda não recebe distribuição.
- [ ] Sei indicar que endpoint e público e que endpoint e admin.
- [ ] Sei provar que submissão inválida não cria registo.

## Bloco operacional (obrigatório)

### Pré-condições

- `BK-MF2-02` executado com perfil, papéis base e `requireRole(["admin"])`.
- `backend/src/config/database.js` disponível.
- Confirmar que RF41 pertence a este BK na matriz canonica.

### Arquitetura do BK

- Backend: módulo `charities` começa com candidatura, validação, service, controller e router.
- Persistência: `charity_applications` guarda pedidos com estado `pending`.
- Frontend: `charitiesApi` envia candidatura e `CharityApplicationPage` mostra o formulário.
- Segurança: submissão é pública; listagem de candidaturas é protegida por `requireRole(["admin"])`.
- Integração: o `BK-MF4-04` reutiliza a candidatura para aprovar/rejeitar.

### Ficheiros a criar, editar e rever

- CRIAR: `backend/src/modules/charities/charity-applications.validation.js`
- CRIAR: `backend/src/modules/charities/charity-applications.service.js`
- CRIAR: `backend/src/modules/charities/charity-applications.controller.js`
- CRIAR: `backend/src/modules/charities/charities.routes.js`
- CRIAR: `frontend/src/services/api/charitiesApi.js`
- CRIAR: `frontend/src/pages/CharityApplicationPage.jsx`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF1-04`, `BK-MF2-02`, `RF41`, `RNF16`, `RNF19`

### Guia de execução (passo-a-passo)

### Passo 1 - Criar validação de candidatura

1. Objetivo do passo.

Garantir que candidaturas entram com dados suficientes e sem campos inesperados.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-applications.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o módulo `charities`, que será usado também nos BKs seguintes.

4. Código completo.

```js
/**
 * Expressao regular simples para rejeitar emails obviamente inválidos.
 * A validação final de existencia do domínio fica fora do âmbito do MVP.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Cria um erro HTTP controlado para validacoes da candidatura.
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
 * Valida texto obrigatório com limites de tamanho.
 *
 * @param {string} value Valor recebido no corpo do pedido.
 * @param {string} field Nome do campo para mensagem de erro.
 * @param {number} min Tamanho mínimo.
 * @param {number} max Tamanho maximo.
 * @returns {string} Texto normalizado.
 */
function requiredText(value, field, min, max) {
  const text = String(value ?? "").trim();
  if (text.length < min || text.length > max) {
    throw httpError(`${field} inválido.`);
  }
  return text;
}

/**
 * Normaliza website público opcional.
 *
 * @param {string} value URL recebida no formulário.
 * @returns {string} URL normalizada ou string vazia.
 * @throws {Error} Quando o protocolo não e `http` ou `https`.
 */
function optionalPublicUrl(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  let url;
  try {
    url = new URL(text);
  } catch {
    throw httpError("Website inválido.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw httpError("Website deve comecar por http:// ou https://.");
  }

  return url.toString();
}

/**
 * Valida e filtra os campos aceites numa candidatura pública.
 *
 * @param {object} input Corpo recebido em `POST /api/charities/applications`.
 * @returns {object} Payload seguro para persistir.
 * @throws {Error} Quando algum campo obrigatório e inválido.
 */
export function assertCharityApplicationPayload(input) {
  const name = requiredText(input.name, "Nome", 3, 120);
  const contactName = requiredText(input.contactName, "Contacto", 3, 120);
  const email = String(input.email ?? "").trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    throw httpError("Email inválido.");
  }

  // O retorno inclui apenas campos permitidos; estado e dados de revisão sao definidos pelo backend.
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

5. Explicação do código ou da decisão.

O validador devolve apenas campos aceites. Isto impede que o visitante envie `status: "approved"` ou outro campo sensível. O website e opcional, mas quando existe fica normalizado como URL pública `http` ou `https`, porque será exposto na página pública de associações.

6. Validação do passo.

```bash
node -e "import('./src/modules/charities/charity-applications.validation.js').then(({ assertCharityApplicationPayload }) => console.log(assertCharityApplicationPayload({ name:'Associação Vida', contactName:'Ana Silva', email:'ana@example.com', mission:'Apoio comunitario cristao com acompanhamento social local.' }).name))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem filtragem de campos, uma candidatura podia nascer aprovada por input malicioso. Sem validar o website, a página pública podia expor links com protocolos inseguros.

### Passo 2 - Criar service de candidaturas

1. Objetivo do passo.

Guardar candidatura, impedir duplicação por email enquanto esta pendente e listar para admin.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-applications.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo.

4. Código completo.

```js
/**
 * Módulo de serviço para candidaturas públicas de associações.
 *
 * Valida dados recebidos do formulário, controla duplicados pendentes e remove
 * campos internos antes de devolver respostas seguras para a API.
 */
import { getDb } from "../../config/database.js";
import { assertCharityApplicationPayload } from "./charity-applications.validation.js";

/**
 * Remove campos internos antes de devolver uma candidatura.
 *
 * @param {object} application Documento da colecao `charity_applications`.
 * @returns {object} Candidatura pública para API/admin.
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
 * Cria indices necessários para listagem e controlo de duplicados pendentes.
 *
 * @returns {Promise<void>}
 */
export async function ensureCharityApplicationIndexes() {
  const db = await getDb();
  await db.collection("charity_applications").createIndex({ email: 1, status: 1 });
  await db.collection("charity_applications").createIndex({ status: 1, submittedAt: -1 });
}

/**
 * Submete uma candidatura pública com estado inicial controlado.
 *
 * @param {object} input Dados enviados pela associação.
 * @returns {Promise<{ application: object }>} Candidatura criada.
 * @throws {Error} Quando já existe candidatura pendente para o mesmo email.
 */
export async function submitCharityApplication(input) {
  const db = await getDb();
  const payload = assertCharityApplicationPayload(input);

  // A duplicação e limitada ao estado pending para permitir nova candidatura depois de uma decisão.
  const duplicate = await db.collection("charity_applications").findOne({
    email: payload.email,
    status: "pending",
  });

  if (duplicate) {
    const error = new Error("Já existe uma candidatura pendente para este email.");
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
 * @returns {Promise<{ applications: object[] }>} Candidaturas ordenadas por submissão.
 */
export async function listCharityApplications(status = "pending") {
  const db = await getDb();
  const filter = status === "all" ? {} : { status };
  const applications = await db.collection("charity_applications").find(filter).sort({ submittedAt: -1 }).toArray();
  return { applications: applications.map(publicApplication) };
}
```

5. Explicação do código ou da decisão.

O estado inicial e sempre `pending`. A duplicação por email reduz spam operacional, sem impedir nova candidatura depois de decisão.

6. Validação do passo.

```bash
node -e "import('./src/modules/charities/charity-applications.service.js').then((m) => console.log(typeof m.submitCharityApplication, typeof m.listCharityApplications))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem estado inicial controlado, a pool podia receber entidades que nunca foram revistas.

### Passo 3 - Criar controller e rotas

1. Objetivo do passo.

Expor submissão pública e listagem protegida para admin.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/charities/charity-applications.controller.js`
    - CRIAR: `backend/src/modules/charities/charities.routes.js`
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Monta `charitiesRouter` em `/api/charities`.

4. Código completo.

`backend/src/modules/charities/charity-applications.controller.js`

```js
/**
 * Módulo de controllers HTTP para candidaturas de associações.
 *
 * Recebe submissões públicas e listagens administrativas, delegando validação e
 * persistência ao service para manter a camada HTTP simples e auditável.
 */
import {
  listCharityApplications,
  submitCharityApplication,
} from "./charity-applications.service.js";

/**
 * Recebe uma candidatura pública de associação.
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
/**
 * Módulo de rotas de associações iniciado pelo fluxo de candidaturas.
 *
 * Expõe submissão pública e protege a listagem administrativa com role `admin`,
 * evitando que contactos privados fiquem acessíveis a utilizadores anónimos.
 */
import { Router } from "express";
import { requireRole } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getCharityApplications,
  postCharityApplication,
} from "./charity-applications.controller.js";

/**
 * Router de candidaturas de associações.
 * A submissão e pública, mas a listagem exposta ao admin contem contactos privados.
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

5. Explicação do código ou da decisão.

Submissão fica pública. Listagem fica protegida por role para não expor contactos das associações.

6. Validação do passo.

```bash
curl -i -X POST http://localhost:3000/api/charities/applications \
  -H "Content-Type: application/json" \
  -d '{"name":"Associação Vida","contactName":"Ana Silva","email":"ana@example.com","mission":"Apoio comunitario cristao com acompanhamento social local."}'
```

7. Caso negativo, erro comum ou risco que este passo evita.

Listagem pública exporia emails e contactos sem necessidade.

### Passo 4 - Criar formulário frontend

1. Objetivo do passo.

Permitir submissão de candidatura com loading, erro e sucesso.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/charitiesApi.js`
    - CRIAR: `frontend/src/pages/CharityApplicationPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`

3. Instrucoes concretas.

Cria rota `/charities/apply`.

4. Código completo.

`frontend/src/services/api/charitiesApi.js`

```js
/**
 * Módulo cliente para a API de associações.
 *
 * Agrupa chamadas HTTP usadas pelos ecrãs públicos e administrativos, mantendo
 * a responsabilidade de sessão e permissões no backend.
 */
import { apiClient } from "./apiClient.js";

export const charitiesApi = {
  /**
   * Submete uma candidatura pública.
   *
   * @param {object} input Campos do formulário.
   * @returns {Promise<{ application: object }>} Candidatura criada.
   */
  submitApplication(input) {
    return apiClient.post("/api/charities/applications", input);
  },
  /**
   * Lista candidaturas para ecras de administração.
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
/**
 * Módulo da página pública de candidatura de associações.
 *
 * Gere formulário, validação mínima de UI e feedback ao utilizador, enviando
 * apenas dados da candidatura para validação definitiva no backend.
 */
import { useState } from "react";
import { charitiesApi } from "../services/api/charitiesApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Estado inicial do formulário público.
 * Fica fora do componente para permitir reposição limpa apos submissão com sucesso.
 */
const INITIAL_FORM = { name: "", contactName: "", email: "", phone: "", mission: "", websiteUrl: "" };

/**
 * Página pública para candidatura de associações.
 *
 * @returns {JSX.Element} Formulário de submissão com feedback de erro e sucesso.
 */
export function CharityApplicationPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  /**
   * Atualiza um campo isolado mantendo os restantes valores do formulário.
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
   * @param {React.FormEvent<HTMLFormElement>} event Evento do formulário.
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
      setStatus("Candidatura submetida para revisão.");
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Candidatura de associação</h1>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}
      <form onSubmit={handleSubmit}>
        <label>Nome da associação<input value={form.name} onChange={(e) => updateField("name", e.target.value)} required /></label>
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

5. Explicação do código ou da decisão.

O formulário envia apenas os campos permitidos e mostra feedback claro em portugues de Portugal.

6. Validação do passo.

Submeter candidatura valida e depois repetir o mesmo email.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem estado de loading, o utilizador pode carregar duas vezes e criar tentativas duplicadas.

## Critérios de aceite (mensuráveis)

- `POST /api/charities/applications` devolve `201` com estado `pending`.
- Email inválido devolve `400`.
- Candidatura pendente duplicada devolve `409`.
- `GET /api/charities/applications` exige role `admin`.

## Validação final

```bash
cd backend
npm test
```

Executar submissão valida, submissão inválida e listagem sem permissão.

## Evidence para PR/defesa

- `pr`: commit/PR com módulo `charities` e página de candidatura.
- `proof`: candidatura criada com `status: "pending"`.
- `neg`: email inválido, duplicado e listagem sem admin.

## Handoff

O `BK-MF4-04` deve usar `charity_applications` e alterar estado para `approved` ou `rejected`. Não deve criar uma candidatura nova para aprovar.

## Snippet técnico aplicável

```js
// O estado nasce sempre pending; aprovação e rejeição pertencem ao BK seguinte.
status: "pending",
```

## Changelog

- `2026-06-13`: guia reescrito com submissão pública, listagem admin, validação, frontend e negativos.
