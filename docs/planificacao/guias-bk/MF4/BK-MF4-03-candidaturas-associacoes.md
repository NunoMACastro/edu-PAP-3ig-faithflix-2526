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
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais criar o fluxo de candidatura de uma associação à pool solidária. A associação submete dados essenciais, o sistema guarda a candidatura com estado `pending` e o administrador só decide no BK seguinte.


- Perceber a diferença entre candidatura e associação aprovada.
- Validar dados de contacto e descrição antes de persistir.
- Criar um fluxo público de submissão e uma listagem admin protegida.
- Preparar o `BK-MF4-04`, onde entra aprovação/rejeição.

#### Importância

- A pool solidária só é credível se as associações entrarem por um processo rastreável.
- Este BK recolhe os dados mínimos para avaliação sem transformar automaticamente o pedido numa associação aprovada.
- A separação entre submissão pública e listagem admin evita exposição indevida de contactos.

#### Scope-in

- Criar validação de candidatura.
- Criar endpoint público de submissão.
- Criar endpoint admin para listar candidaturas.
- Guardar candidaturas com estado inicial `pending`.
- Criar formulário frontend para submissão.

#### Scope-out

- Não aprovar nem rejeitar candidaturas; isso entra no `BK-MF4-04`.
- Não colocar associações na pool neste BK.
- Não recolher dados financeiros, documentos oficiais complexos ou informação sensível que não seja necessária ao MVP.
- Não criar login específico para associações.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se a equipa misturar candidatura com aprovação, separar os campos numa tabela antes de codificar.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF2-02` executado com perfil, papéis base e `requireRole(["admin"])`.
- `backend/src/config/database.js` disponível.
- Confirmar que RF41 pertence a este BK na matriz canonica.

#### Glossário

- Candidatura: pedido submetido por uma associação para ser avaliado.
- Associação aprovada: entidade que passou pela decisão admin e pode entrar na pool.
- Estado `pending`: candidatura recebida, mas ainda sem decisão.
- Listagem admin: consulta protegida para quem tem permissão de gestão.

#### Conceitos teóricos essenciais

- Domínio FaithFlix: uma candidatura inicia o percurso solidário, mas não recebe distribuição enquanto não for aprovada.
- Backend: validação protege o service de dados incompletos, email inválido e textos demasiado curtos.
- Frontend: o formulário envia apenas os campos necessários e mostra sucesso/erro ao utilizador.
- Segurança: submissão pública aceita pedidos, mas listagem com contactos privados exige role `admin`.
- Dados: `charity_applications` guarda o estado e impede duplicados pendentes pelo mesmo email.
- `CANONICO`: RF41 exige submissão de candidaturas por associação.
- `DERIVADO`: candidatura pública não exige login para reduzir atrito, mas os endpoints admin exigem `admin`.
- `DERIVADO`: a submissão permite 5 pedidos por IP/hora; o pedido 6 devolve
  `429 RATE_LIMITED` com `Retry-After`, usando a chave HMAC do rate limiter.
- `DERIVADO`: um índice único parcial por email e estado `pending` fecha
  duplicações concorrentes sem impedir nova candidatura após uma decisão.
- `DERIVADO`: a listagem admin usa enum fechada, `page >= 1`, `1 <= limit <= 50`,
  total real e ordenação estável por `submittedAt: -1, _id: 1`.

### Erros comuns

- Aprovar automaticamente no momento da submissão.
- Pedir dados excessivos que não sao necessários para a decisão.
- Permitir que qualquer utilizador liste candidaturas.
- Não validar email e texto mínimo.

### Check de compreensão

- [ ] Sei explicar porque uma candidatura com `pending` ainda não recebe distribuição.
- [ ] Sei indicar que endpoint e público e que endpoint e admin.
- [ ] Sei provar que submissão inválida não cria registo.

#### Arquitetura do BK

- Backend: módulo `charities` começa com candidatura, validação, service, controller e router.
- Persistência: `charity_applications` guarda pedidos com estado `pending`.
- Frontend: `charitiesApi` envia candidatura e `CharityApplicationPage` mostra o formulário.
- Segurança: submissão é pública; listagem de candidaturas é protegida por `requireRole(["admin"])`.
- Integração: o `BK-MF4-04` reutiliza a candidatura para aprovar/rejeitar.
- Resposta admin: `{ applications, page, limit, total, totalPages }`.
- Robustez do consumidor admin: propaga `AbortSignal`, ignora pedidos abortados
  e respostas antigas e volta à página 1 quando o filtro muda.

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/charities/charity-applications.validation.js`
- CRIAR: `backend/src/modules/charities/charity-applications.service.js`
- CRIAR: `backend/src/modules/charities/charity-applications.controller.js`
- CRIAR: `backend/src/modules/charities/charities.routes.js`
- CRIAR: `frontend/src/services/api/charitiesApi.js`
- CRIAR: `frontend/src/pages/CharityApplicationPage.jsx`
- CRIAR/EDITAR: `backend/tests/unit/f3-admin-transactions.test.js`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF1-04`, `BK-MF2-02`, `RF41`, `RNF16`, `RNF19`

#### Tutorial técnico linear

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
import { isIP } from "node:net";
import { HttpError } from "../../utils/http-error.js";

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
 * @returns {HttpError} Erro canónico com código estável.
 */
function httpError(message, statusCode = 400) {
  return new HttpError(
    statusCode,
    message,
    undefined,
    "INVALID_CHARITY_APPLICATION",
  );
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
  if (typeof value !== "string") {
    throw httpError(`${field} deve ser texto.`);
  }
  const text = value.trim();
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
 * @throws {Error} Quando não é uma URL pública HTTPS da allowlist.
 */
function optionalPublicUrl(value) {
  if (value === undefined || value === "") return "";
  if (typeof value !== "string") throw httpError("Website inválido.");
  const text = value.trim();
  if (!text) return "";
  if (text.length > 500) throw httpError("Website inválido.");
  if (/[\u0000-\u001f\u007f]/.test(text)) {
    throw httpError("Website inválido.");
  }

  let url;
  try {
    url = new URL(text);
  } catch {
    throw httpError("Website inválido.");
  }

  const hostnameAllowed =
    url.hostname.includes(".") &&
    isIP(url.hostname) === 0 &&
    /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(url.hostname);
  const hasEncodedControl = /%(?:0[0-9a-f]|1[0-9a-f]|7f)/i.test(url.pathname);

  // A allowlist pública aceita só HTTPS, host DNS público e path; não aceita
  // credenciais, porta custom, query, fragmento ou controlos codificados.
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    url.search ||
    url.hash ||
    !hostnameAllowed ||
    hasEncodedControl
  ) {
    throw httpError("Website deve ser uma URL pública HTTPS sem credenciais, query ou fragmento.");
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
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError("A candidatura deve ser um objeto JSON.");
  }

  const allowedFields = new Set([
    "name", "contactName", "email", "phone", "mission", "websiteUrl",
  ]);
  if (Object.keys(input).some((key) => !allowedFields.has(key))) {
    throw httpError("A candidatura contém campos não permitidos.");
  }

  const name = requiredText(input.name, "Nome", 3, 120);
  const contactName = requiredText(input.contactName, "Contacto", 3, 120);
  if (typeof input.email !== "string") throw httpError("Email inválido.");
  const email = input.email.trim().toLowerCase();

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw httpError("Email inválido.");
  }

  if (input.phone !== undefined && typeof input.phone !== "string") {
    throw httpError("Telefone inválido.");
  }
  const phone = input.phone?.trim() ?? "";
  if (phone.length > 40) throw httpError("Telefone inválido.");

  // O retorno inclui apenas campos permitidos; estado e dados de revisão sao definidos pelo backend.
  return {
    name,
    contactName,
    email,
    phone,
    mission: requiredText(input.mission, "Missao", 30, 1200),
    websiteUrl: optionalPublicUrl(input.websiteUrl),
  };
}

const APPLICATION_STATUSES = ["pending", "approved", "rejected", "all"];

function positiveIntegerQuery(value, field, defaultValue, maximum) {
  if (value === undefined) return defaultValue;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw httpError(`${field} inválido.`);
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw httpError(`${field} inválido.`);
  }
  return parsed;
}

export function assertApplicationListQuery(query) {
  if (!query || typeof query !== "object" || Array.isArray(query)) {
    throw httpError("Query de listagem inválida.");
  }
  const allowedFields = new Set(["status", "page", "limit"]);
  if (Object.keys(query).some((key) => !allowedFields.has(key))) {
    throw httpError("Query de listagem contém campos não permitidos.");
  }
  const status = query.status === undefined ? "pending" : query.status;
  if (typeof status !== "string" || !APPLICATION_STATUSES.includes(status)) {
    throw httpError("Estado inválido.");
  }
  return {
    status,
    page: positiveIntegerQuery(query.page, "Página", 1, 1_000_000),
    limit: positiveIntegerQuery(query.limit, "Limite", 20, 50),
  };
}
```

5. Explicação do código ou da decisão.

O validador devolve apenas campos aceites. Isto impede que o visitante envie
`status: "approved"` ou outro campo sensível. O website e opcional, mas quando
existe fica limitado a HTTPS num host DNS público, sem userinfo, porta custom,
query, fragmento ou controlos, porque será exposto na página pública.

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
import { HttpError } from "../../utils/http-error.js";
import { assertCharityApplicationPayload } from "./charity-applications.validation.js";

/**
 * Identifica uma violacao de indice unico MongoDB.
 *
 * @param {unknown} error Erro devolvido pelo driver.
 * @returns {boolean} Verdadeiro quando existe uma chave duplicada.
 */
function isDuplicateKeyError(error) {
  return error?.code === 11000;
}

/**
 * Remove campos internos antes de devolver uma candidatura.
 *
 * @param {object} application Documento da colecao `charity_applications`.
 * @returns {object} Candidatura pública para API/admin.
 */
function publicApplication(application) {
  return {
    id: application._id.toHexString(),
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
  await db.collection("charity_applications").createIndex(
    { email: 1 },
    {
      name: "uniq_pending_charity_application_email",
      unique: true,
      partialFilterExpression: { status: "pending" },
    },
  );
  await db.collection("charity_applications").createIndex({
    status: 1,
    submittedAt: -1,
    _id: 1,
  });
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

  const now = new Date();
  const application = {
    ...payload,
    // O cliente nunca escolhe o estado inicial.
    status: "pending",
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  let result;

  try {
    // O indice parcial unico fecha tambem duas submissões concorrentes.
    result = await db.collection("charity_applications").insertOne(application);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new HttpError(
        409,
        "Já existe uma candidatura pendente para este email.",
        undefined,
        "PENDING_APPLICATION_EXISTS",
      );
    }

    throw error;
  }

  return { application: publicApplication({ ...application, _id: result.insertedId }) };
}

/**
 * Lista candidaturas para administradores, com filtro por estado.
 *
 * @param {{ status: string, page: number, limit: number }} query Query validada.
 * @returns {Promise<{ applications: object[], page: number, limit: number, total: number, totalPages: number }>} Página administrativa estável.
 */
export async function listCharityApplications({ status, page, limit }) {
  const db = await getDb();
  const filter = status === "all" ? {} : { status };
  const collection = db.collection("charity_applications");
  const total = await collection.countDocuments(filter);
  const applications = await collection
    .find(filter)
    .sort({ submittedAt: -1, _id: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  return {
    applications: applications.map(publicApplication),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
```

5. Explicação do código ou da decisão.

O estado inicial e sempre `pending`. A unicidade vive num índice parcial da base
de dados, porque uma leitura `findOne` seguida de `insertOne` deixaria passar
duas submissões concorrentes. Depois de uma decisão, o índice deixa de abranger
a candidatura antiga e permite uma nova submissão para o mesmo email.

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
import { assertApplicationListQuery } from "./charity-applications.validation.js";

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
  const query = assertApplicationListQuery(req.query);
  res.status(200).json(await listCharityApplications(query));
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
import { requireRole } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  rateLimit,
  rateLimitKeys,
} from "../../middlewares/rate-limit.middleware.js";
import {
  getCharityApplications,
  postCharityApplication,
} from "./charity-applications.controller.js";

/**
 * Router de candidaturas de associações.
 * A submissão e pública, mas a listagem exposta ao admin contem contactos privados.
 */
export const charitiesRouter = Router();

const applicationSubmissionLimit = rateLimit({
  scope: "charity-application:ip",
  limit: 5,
  windowMs: 60 * 60_000,
  key: rateLimitKeys.ip,
});

charitiesRouter.post(
  "/applications",
  applicationSubmissionLimit,
  asyncHandler(postCharityApplication),
);
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

Cria a rota pública `/associacoes/candidatura`, coerente com a navegação
PT-PT. Acrescenta apenas a declaração lazy e o `Route`; não substituas o router
base, `Suspense`, `ErrorBoundary` ou `RouteLifecycle`.

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
  submitApplication(input, options = {}) {
    return apiClient.post("/api/charities/applications", input, options);
  },
  /**
   * Lista candidaturas para ecras de administração.
   *
   * @param {string} [status="pending"] Estado a consultar.
   * @returns {Promise<{ applications: object[] }>} Lista devolvida pela API.
   */
  listApplications({ status = "pending", page = 1, limit = 20 } = {}, options = {}) {
    const params = new URLSearchParams({
      status,
      page: String(page),
      limit: String(limit),
    });
    return apiClient.get(`/api/charities/applications?${params.toString()}`, options);
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
import { useEffect, useRef, useState } from "react";
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
  const submitControllerRef = useRef(null);

  useEffect(() => () => submitControllerRef.current?.abort(), []);

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
    if (submitControllerRef.current) return;
    const controller = new AbortController();
    submitControllerRef.current = controller;
    setSubmitting(true);
    setError("");
    setStatus("");
    try {
      await charitiesApi.submitApplication(form, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setForm(INITIAL_FORM);
      setStatus("Candidatura submetida para revisão.");
    } catch (apiError) {
      if (controller.signal.aborted || apiError?.name === "AbortError") return;
      setError(toUserMessage(apiError));
    } finally {
      if (submitControllerRef.current === controller) {
        submitControllerRef.current = null;
        setSubmitting(false);
      }
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

Em `frontend/src/routes/AppRoutes.jsx`:

```jsx
// ADICIONAR uma única vez, junto das restantes declarações lazy.
const CharityApplicationPage = lazyNamedPage(
  () => import("../pages/CharityApplicationPage.jsx"),
  "CharityApplicationPage",
);

<Route path="/associacoes/candidatura" element={<CharityApplicationPage />} />
```

5. Explicação do código ou da decisão.

O formulário envia apenas os campos permitidos e mostra feedback claro em português de Portugal. A rota usa o helper lazy da fundação e mantém a composição cumulativa do router.

6. Validação do passo.

Submeter candidatura valida e depois repetir o mesmo email.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem estado de loading, o utilizador pode carregar duas vezes e criar tentativas duplicadas.

#### Critérios de aceite

- `POST /api/charities/applications` devolve `201` com estado `pending`.
- Email inválido devolve `400`.
- Website só aceita a allowlist HTTPS pública; username/password, localhost/IP,
  control chars (também percent-encoded), porta custom, query, fragmento ou
  outro protocolo devolvem `400`.
- Candidatura pendente duplicada devolve `409`.
- Duas submissões concorrentes para o mesmo email deixam apenas uma candidatura
  `pending`; a outra devolve `409` com `code: "PENDING_APPLICATION_EXISTS"`.
- `GET /api/charities/applications` exige role `admin`.
- A listagem recusa `limit > 50` e devolve
  `{ applications, page, limit, total, totalPages }` com ordenação estável.
- O teste transacional confirma o índice parcial e o conflito estável sem usar
  uma base normal ou partilhada.

#### Validação final

```bash
cd backend
npm test
```

Executar submissão valida, submissão inválida e listagem sem permissão.

#### Evidence para PR/defesa

- `pr`: commit/PR com módulo `charities` e página de candidatura.
- `proof`: candidatura criada com `status: "pending"`.
- `neg`: email inválido, duplicado sequencial/concorrente, pedido 6 do mesmo IP
  na mesma hora com `429`, URLs `https://user:pass@example.org`, `javascript:`,
  IP/localhost/query/fragment/controlos e listagem sem admin.

#### Handoff

O `BK-MF4-04` deve usar `charity_applications` e alterar estado para `approved` ou `rejected`. Não deve criar uma candidatura nova para aprovar.

## Snippet técnico aplicável

```js
// O estado nasce sempre pending; aprovação e rejeição pertencem ao BK seguinte.
const application = { status: "pending" };
```

#### Changelog

- `2026-06-13`: guia reescrito com submissão pública, listagem admin, validação, frontend e negativos.
- `2026-07-10`: unicidade de candidatura pendente movida para índice parcial,
  com conflito estável também sob concorrência.
- `2026-07-10`: listagem administrativa fechada por enum e paginação estável,
  com `limit <= 50`, metadata total e contrato de cancelamento no consumidor.
- `2026-07-10`: validação copiável consolidada com tipos/limites estritos e
  submissão protegida por 5 pedidos por IP/hora antes da persistência.
