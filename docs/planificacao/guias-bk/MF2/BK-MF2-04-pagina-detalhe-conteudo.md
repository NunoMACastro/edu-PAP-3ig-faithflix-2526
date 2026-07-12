# BK-MF2-04 - Pagina de detalhe de conteudo

## Header

- `doc_id`: `GUIA-BK-MF2-04`
- `bk_id`: `BK-MF2-04`
- `macro`: `MF2`
- `owner`: `Mateus`
- `apoio`: `Davi`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF2-03`
- `rf_rnf`: `RF08`
- `fase_documental`: `Fase 1`
- `sprint`: `S03`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF2-05`
- `guia_path`: `docs/planificacao/guias-bk/MF2/BK-MF2-04-pagina-detalhe-conteudo.md`
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais criar a pagina de detalhe de um conteudo publicado (`RF08`) usando o contrato real do catalogo.

No fim, deves conseguir explicar como uma rota com `id` ou `slug` encontra um conteudo, porque conteudos `draft` devolvem `404` e como o botao de reproducao prepara a passagem para o player.

#### Importância

A pagina de detalhe e a ponte entre catalogo e reproducao. Ela apresenta sinopse, poster, dados de classificacao e o caminho para `/ver/:contentId`, que sera implementado no `BK-MF2-05`.

#### Scope-in

- Criar endpoint `GET /api/catalog/:idOrSlug`.
- Permitir detalhe por `id` ou `slug`.
- Devolver apenas conteudos `published`.
- Criar `ContentDetailPage`.
- Ligar rota frontend `/catalogo/:idOrSlug`.
- Adicionar `data-testid="content-detail"` para o E2E de `BK-MF2-08`.

#### Scope-out

- Construir player.
- Guardar progresso.
- Favoritos e watchlist.
- Conteudos recomendados.
- Comentarios ou ratings.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF2-03` concluido.
- Existe pelo menos um conteudo `published`.
- `frontend/src/services/api/apiClient.js` existe.
- O router frontend permite adicionar rotas.

#### Glossário

- `idOrSlug`: parametro que pode ser ObjectId MongoDB ou slug.
- `404`: resposta usada quando o conteudo nao existe ou nao esta publicado.
- `Handoff`: passagem de dados minima para o BK seguinte.

#### Conceitos teóricos essenciais

- O detalhe publico nunca deve mostrar `draft` ou `archived`.
- Rotas fixas como `/admin` e `/taxonomies` precisam ficar antes de `/:idOrSlug`.
- O frontend nao deve ter dados fixos do conteudo.
- O link para reproducao usa `content.id`, porque o progresso e o player trabalham por identificador persistente.
- O detalhe público apresenta disponibilidade, não fontes de reprodução.
- O serializer público é uma allowlist: nunca devolve `media`, `source`, `url`, `tracks`, `qualityOptions`, `src` ou `playbackUrl` em qualquer nível.
- `mediaStatus` e `isPlayable` são apenas indicadores. O CTA só existe quando `isPlayable === true`; media pendente mantém o conteúdo visível e o CTA desativado.
- Detalhe e passagens bíblicas usam pedidos canceláveis, anti-stale e retry independentes.
- A sessão `unavailable` bloqueia temporariamente a reprodução e permite repetir a confirmação; nunca é tratada como logout.
- Duração ou classificação desconhecida usa fallback PT-PT, sem converter vazio em `0+`.

### Tempo estimado

- Rever contrato do catalogo: 15 min.
- Backend de detalhe: 45 min.
- Cliente API: 15 min.
- Pagina React e rota: 60 min.
- Validacao e evidence: 30 min.

### Erros comuns

- Criar detalhe com dados fixos.
- Mostrar conteudo `draft`.
- Colocar `/:idOrSlug` antes de `/admin`.
- Usar `/watch` numa aplicacao que ja adotou `/ver`.
- Ignorar estados de loading e erro.
- Reconstruir uma fonte de reprodução a partir de campos públicos ou de dados administrativos.

### Check de compreensao

- [ ] Sei que endpoint alimenta a pagina de detalhe.
- [ ] Sei porque `draft` deve devolver `404`.
- [ ] Sei porque o player nao e implementado neste BK.
- [ ] Sei porque o link para reproducao usa `content.id`.

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Endpoint | `GET /api/catalog/:idOrSlug` |
| Visibilidade | apenas `status: "published"` |
| Sucesso | `200 { content }` |
| Media pública | `mediaStatus`, `isPlayable`; zero fontes de reprodução |
| Cliente admin preservado | metadata/assets/taxonomias only; `mediaStatus` read-only; campos media devolvem `400 CATALOG_MEDIA_MUTATION_FORBIDDEN` |
| Listagens admin preservadas | envelope `{ items, page, limit, total, totalPages }`, `limit <= 50` |
| Inexistente, rascunho ou arquivado | `404` |
| Frontend | `ContentDetailPage` |
| Rota frontend | `/catalogo/:idOrSlug` |
| Handoff | link para `/ver/:contentId` no `BK-MF2-05` |
| Robustez | detalhe/passagens canceláveis e repetíveis; respostas antigas ignoradas |
| Sessão indisponível | CTA bloqueado e retry de sessão; nunca redirecionar para login |
| Segmentos | `idOrSlug` e `content.id` codificados com `encodeURIComponent` |

### Shape minimo de resposta

```js
// O detalhe público contém apenas metadata e flags; não inclui qualquer URL ou fonte de reprodução.
const publicDetailResponse = {
  content: {
    id: "CONTENT_ID",
    title: "Titulo",
    slug: "titulo",
    synopsis: "Sinopse publica",
    type: "movie",
    durationSeconds: 1_800,
    ageRating: 12,
    taxonomyIds: [],
    assets: { posterUrl: "/posters/titulo.webp", backdropUrl: "" },
    mediaStatus: "pending",
    isPlayable: false,
    publishedAt: null,
  },
};
```

### Decisoes tecnicas

- `CANONICO`: detalhe publico le a colecao `contents` criada no BK anterior.
- `CANONICO`: o detalhe reutiliza `publicContent` e nunca cria outro serializer com campos media.
- `CANONICO`: create/update administrativos continuam metadata-only, paginados e protegidos por `expectedVersion`.
- `DERIVADO`: `idOrSlug` aceita os dois formatos para suportar links humanos e chamadas tecnicas.
- `DERIVADO`: a pagina usa `data-testid="content-detail"` para teste E2E estavel.

#### Ficheiros a criar/editar/rever

- EDITAR: `backend/src/modules/catalog/catalog.service.js`
- EDITAR: `backend/src/modules/catalog/catalog.controller.js`
- EDITAR: `backend/src/modules/catalog/catalog.routes.js`
- EDITAR: `frontend/src/services/api/catalogApi.js`
- CRIAR: `frontend/src/services/api/biblicalPassagesApi.js`
- CRIAR: `frontend/src/pages/ContentDetailPage.jsx`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`

#### Tutorial técnico linear

### Passo 1 - Adicionar detalhe ao servico de catalogo

1. Objetivo do passo.

Criar uma funcao que encontra um conteudo publicado por `id` ou `slug`.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/catalog/catalog.service.js`
    - LOCALIZACAO: acrescentar exports no ficheiro existente

3. Instrucoes concretas.

No ficheiro do `BK-MF2-03`, reutiliza `publicContent`, a allowlist pública já
criada. `ObjectId` já existe; acrescenta explicitamente o import de `HttpError`
e depois as funções abaixo.

4. Codigo completo.

```js
import { HttpError } from "../../utils/http-error.js";

// O estado `published` faz parte da própria query para drafts e arquivos nunca atravessarem a fronteira.
function buildPublishedDetailQuery(idOrSlug) {
  if (typeof idOrSlug !== "string") {
    throw new HttpError(404, "Conteudo nao encontrado.");
  }

  const value = idOrSlug.trim();

  if (value.length === 0 || value.length > 160) {
    throw new HttpError(404, "Conteudo nao encontrado.");
  }

  if (ObjectId.isValid(value)) {
    return { _id: new ObjectId(value), status: "published" };
  }

  return { slug: value, status: "published" };
}

export async function getPublishedContentDetail(idOrSlug) {
  const db = await getDb();
  const content = await db.collection("contents").findOne(buildPublishedDetailQuery(idOrSlug));

  if (!content) {
    throw new HttpError(404, "Conteudo nao encontrado.");
  }

  // Reutilizar a allowlist pública evita criar um serializer de detalhe com campos media acidentais.
  return publicContent(content);
}
```

5. Explicacao do codigo ou da decisao.

O parâmetro tem de ser texto real; não há coerção de arrays, objetos ou `null`. O filtro inclui `status: "published"` dentro da query e a resposta passa pela mesma allowlist pública do catálogo. Assim, um `draft` com slug válido tem a mesma resposta pública que um conteúdo inexistente e nenhuma fonte interna atravessa esta fronteira.

6. Validacao do passo.

```bash
node -e "import('./src/modules/catalog/catalog.service.js').then(({ getPublishedContentDetail }) => console.log(typeof getPublishedContentDetail))"
```

Resultado esperado: `function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se filtrares `status` depois de carregar o documento, podes expor dados de um conteudo privado durante logs ou transformacoes.

### Passo 2 - Adicionar controller e rota de detalhe

1. Objetivo do passo.

Expor `GET /api/catalog/:idOrSlug` sem partir rotas fixas existentes.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/catalog/catalog.controller.js`
    - EDITAR: `backend/src/modules/catalog/catalog.routes.js`
    - LOCALIZACAO: imports e rota final

3. Instrucoes concretas.

Adiciona o controller e acrescenta `getCatalogDetail` ao import existente do router, sem remover `getContentRevisions` nem `postContentRevisionRevert`. A rota dinamica deve ser a ultima rota `GET` publica.

4. Codigo completo.

Adicionar em `backend/src/modules/catalog/catalog.controller.js`:

```js
import { getPublishedContentDetail } from "./catalog.service.js";

export async function getCatalogDetail(req, res) {
  res.status(200).json({ content: await getPublishedContentDetail(req.params.idOrSlug) });
}
```

Trecho final esperado em `backend/src/modules/catalog/catalog.routes.js`:

```js
// acrescenta getCatalogDetail ao import ja existente de catalog.controller.js
catalogRouter.get("/", asyncHandler(getCatalog));
catalogRouter.get("/admin", canManageCatalog, asyncHandler(getAdminCatalog));
catalogRouter.get("/taxonomies", asyncHandler(getTaxonomies));
catalogRouter.post("/taxonomies", canManageCatalog, asyncHandler(postTaxonomy));
catalogRouter.post("/", canManageCatalog, asyncHandler(postContent));
catalogRouter.get("/:id/revisions", canManageCatalog, asyncHandler(getContentRevisions));
catalogRouter.post("/:id/revisions/:revisionId/revert", canManageCatalog, asyncHandler(postContentRevisionRevert));
catalogRouter.patch("/:id", canManageCatalog, asyncHandler(patchContent));
catalogRouter.patch("/:id/status", canManageCatalog, asyncHandler(patchContentStatus));
catalogRouter.get("/:idOrSlug", asyncHandler(getCatalogDetail));
```

5. Explicacao do codigo ou da decisao.

`/:idOrSlug` vem no fim para nao capturar `admin`, `taxonomies` ou as rotas de revisoes criadas no `BK-MF2-03`.

6. Validacao do passo.

```bash
curl -i http://localhost:3000/api/catalog/piloto-faithflix
```

Resultado esperado: `200` para conteudo publicado ou `404` se ainda nao existir.

7. Caso negativo, erro comum ou risco que este passo evita.

Se `/:idOrSlug` vier antes de `/taxonomies` ou `/:id/revisions`, esses endpoints deixam de ser chamados.

### Passo 3 - Atualizar cliente frontend de catalogo

1. Objetivo do passo.

Adicionar uma funcao para carregar detalhe sem remover os metodos admin criados no BK anterior.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/catalogApi.js`
    - CRIAR: `frontend/src/services/api/biblicalPassagesApi.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Mantém os métodos existentes, acrescenta `getDetail` e cria a leitura pública de passagens. Os dois clientes recebem `options.signal`. O cliente administrativo preserva paginação, CAS e a fronteira metadata-only.

4. Codigo completo.

```js
import { apiClient } from "./apiClient.js";

const CREATE_FIELDS = [
  "title",
  "slug",
  "synopsis",
  "type",
  "durationSeconds",
  "ageRating",
  "taxonomyIds",
  "assets",
];
const UPDATE_FIELDS = [...CREATE_FIELDS, "expectedVersion"];
// A validação no cliente falha cedo, mas a mesma proibição continua a ser autoritativa no backend.
const FORBIDDEN_MEDIA_FIELDS = new Set([
  "media",
  "mediaStatus",
  "source",
  "url",
  "tracks",
  "qualityOptions",
  "src",
  "playbackUrl",
]);

// Cada identificador é validado e codificado para ocupar exatamente um segmento da rota.
function encodedSegment(value, label) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    /[\u0000-\u001F\u007F]/u.test(value)
  ) {
    throw new TypeError(`${label} invalido.`);
  }

  return encodeURIComponent(value);
}

function paginationQuery(params = {}) {
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    throw new TypeError("Paginacao invalida.");
  }

  const query = new URLSearchParams();
  for (const field of ["page", "limit"]) {
    const value = params[field];
    if (value === undefined) continue;
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new TypeError(`${field} invalido.`);
    }
    if (field === "limit" && value > 50) {
      throw new TypeError("limit nao pode exceder 50.");
    }
    query.set(field, `${value}`);
  }

  return query.toString() ? `?${query}` : "";
}

function editorialPayload(input, allowedFields) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Payload editorial invalido.");
  }

  if (Object.keys(input).some((field) => FORBIDDEN_MEDIA_FIELDS.has(field))) {
    throw new TypeError("A administracao editorial nao aceita campos media.");
  }

  const allowed = new Set(allowedFields);
  const unexpectedField = Object.keys(input).find((field) => !allowed.has(field));
  if (unexpectedField) {
    throw new TypeError(`Campo editorial desconhecido: ${unexpectedField}.`);
  }

  return Object.fromEntries(
    allowedFields
      .filter((field) => Object.hasOwn(input, field))
      .map((field) => [field, input[field]]),
  );
}

export const catalogApi = {
  listPublished(
    { type = "", page = 1, limit = 24 } = {},
    options = {},
  ) {
    // Preserva filtros, paginação e AbortSignal do BK-MF2-03 ao acrescentar detalhe.
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (type) query.set("type", type);

    return apiClient.get(`/api/catalog?${query.toString()}`, options);
  },
  getDetail(idOrSlug, options = {}) {
    return apiClient.get(
      `/api/catalog/${encodedSegment(idOrSlug, "Conteudo")}`,
      options,
    );
  },
  listAdmin(params = {}, options = {}) {
    return apiClient.get(`/api/catalog/admin${paginationQuery(params)}`, options);
  },
  createContent(input, options = {}) {
    return apiClient.post(
      "/api/catalog",
      editorialPayload(input, CREATE_FIELDS),
      options,
    );
  },
  updateContent(contentId, input, options = {}) {
    return apiClient.patch(
      `/api/catalog/${encodedSegment(contentId, "Conteudo")}`,
      editorialPayload(input, UPDATE_FIELDS),
      options,
    );
  },
  updateStatus(contentId, status, expectedVersion, options = {}) {
    return apiClient.patch(
      `/api/catalog/${encodedSegment(contentId, "Conteudo")}/status`,
      { status, expectedVersion },
      options,
    );
  },
  listRevisions(contentId, params = {}, options = {}) {
    return apiClient.get(
      `/api/catalog/${encodedSegment(contentId, "Conteudo")}/revisions${paginationQuery(params)}`,
      options,
    );
  },
  revertRevision(contentId, revisionId, expectedVersion, options = {}) {
    return apiClient.post(
      `/api/catalog/${encodedSegment(contentId, "Conteudo")}/revisions/${encodedSegment(revisionId, "Revisao")}/revert`,
      { expectedVersion },
      options,
    );
  },
  listTaxonomies(options = {}) {
    return apiClient.get("/api/catalog/taxonomies", options);
  },
  createTaxonomy(input, options = {}) {
    return apiClient.post("/api/catalog/taxonomies", input, options);
  },
};
```

`frontend/src/services/api/biblicalPassagesApi.js`

```js
import { apiClient } from "./apiClient.js";

// A codificação impede que um slug com `/` ou `?` altere o endpoint solicitado.
export const biblicalPassagesApi = {
  listForContent(idOrSlug, options = {}) {
    if (typeof idOrSlug !== "string" || idOrSlug.length === 0) {
      throw new TypeError("Conteudo invalido.");
    }

    return apiClient.get(
      `/api/catalog/${encodeURIComponent(idOrSlug)}/biblical-passages`,
      options,
    );
  },
};
```

5. Explicacao do codigo ou da decisao.

Os ficheiros ficam completos para não perder métodos públicos, admin ou de
revisões ao adicionar detalhe. `listPublished(filters, options)` conserva
`type`, `page`, `limit` e o `AbortSignal` recebido no segundo argumento. As
listagens só aceitam inteiros já validados e com `limit <= 50`; create/update
rejeitam campos media antes do pedido. A resposta administrativa fornece
`version`; o cliente envia-a como `expectedVersion` e trata
`409 CONTENT_VERSION_CONFLICT` recarregando o conteúdo antes de nova tentativa.
Detalhe e passagens codificam o segmento e propagam cancelamento.

6. Validacao do passo.

```bash
node -e "import('./src/services/api/catalogApi.js').then(({ catalogApi }) => console.log(typeof catalogApi.getDetail))"
```

Resultado esperado: `function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Recriar o objeto com apenas `getDetail` quebraria a pagina admin do catalogo.

### Passo 4 - Criar pagina de detalhe

1. Objetivo do passo.

Mostrar os dados do conteudo e preparar a entrada no player.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/pages/ContentDetailPage.jsx`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria a pagina abaixo. Usa `useParams` para ler `idOrSlug`.

4. Codigo completo.

```jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";
import { toUserMessage } from "../services/api/apiErrors.js";
import { biblicalPassagesApi } from "../services/api/biblicalPassagesApi.js";
import { catalogApi } from "../services/api/catalogApi.js";
import { buildLoginRedirectPath } from "../utils/authRedirect.js";

function formatDuration(seconds) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) {
    return "Nao indicada";
  }

  return `${Math.round(seconds / 60)} min`;
}

function formatAgeRating(value) {
  return Number.isInteger(value) && value >= 0 && value <= 18
    ? `${value}+`
    : "Nao indicada";
}

export function ContentDetailPage() {
  const { idOrSlug } = useParams();
  const { status: sessionStatus, refreshSession } = useSession();
  const [content, setContent] = useState(null);
  const [contentLoadedFor, setContentLoadedFor] = useState("");
  const [passages, setPassages] = useState([]);
  const [passagesLoadedFor, setPassagesLoadedFor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passagesLoading, setPassagesLoading] = useState(true);
  const [passagesError, setPassagesError] = useState("");
  const [detailReloadVersion, setDetailReloadVersion] = useState(0);
  const [passagesReloadVersion, setPassagesReloadVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    // A leitura do detalhe tem cancelamento e retry próprios para não misturar IDs sucessivos.
    setLoading(true);
    setError("");
    setContent(null);

    catalogApi.getDetail(idOrSlug, { signal: controller.signal })
      .then((response) => {
        if (active) {
          setContent(response.content);
          setContentLoadedFor(idOrSlug);
        }
      })
      .catch((requestError) => {
        if (active && requestError?.code !== "REQUEST_ABORTED") {
          setContentLoadedFor(idOrSlug);
          setError(toUserMessage(requestError));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [detailReloadVersion, idOrSlug]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    // Passagens falham de forma independente: um erro secundário não apaga o detalhe já carregado.
    setPassages([]);
    setPassagesLoading(true);
    setPassagesError("");

    biblicalPassagesApi.listForContent(idOrSlug, { signal: controller.signal })
      .then((response) => {
        if (active) {
          setPassages(Array.isArray(response.items) ? response.items : []);
          setPassagesLoadedFor(idOrSlug);
        }
      })
      .catch((requestError) => {
        if (active && requestError?.code !== "REQUEST_ABORTED") {
          setPassagesLoadedFor(idOrSlug);
          setPassagesError(toUserMessage(requestError));
        }
      })
      .finally(() => {
        if (active) setPassagesLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [idOrSlug, passagesReloadVersion]);

  if (loading || contentLoadedFor !== idOrSlug) {
    return <main className="page-shell"><p>A carregar conteudo...</p></main>;
  }

  if (error || !content) {
    return (
      <main className="page-shell">
        <h1>Conteudo indisponivel</h1>
        <p>{error || "Conteudo nao encontrado."}</p>
        <button type="button" onClick={() => setDetailReloadVersion((value) => value + 1)}>
          Tentar novamente
        </button>
      </main>
    );
  }

  const hasPlaybackId = typeof content.id === "string" && content.id.length > 0;
  const playbackPath = hasPlaybackId
    ? `/ver/${encodeURIComponent(content.id)}`
    : "";
  const passagesPending = passagesLoading || passagesLoadedFor !== idOrSlug;

  return (
    <main className="page-shell" data-testid="content-detail">
      {content.assets?.backdropUrl || content.assets?.posterUrl ? (
        <img src={content.assets.backdropUrl || content.assets.posterUrl} alt="" />
      ) : null}
      <p>{typeof content.type === "string" ? content.type : "Tipo nao indicado"}</p>
      <h1>{content.title}</h1>
      <p>{content.synopsis}</p>
      <dl>
        <dt>Duracao</dt>
        <dd>{formatDuration(content.durationSeconds)}</dd>
        <dt>Classificacao</dt>
        <dd>{formatAgeRating(content.ageRating)}</dd>
      </dl>
      {content.isPlayable !== true || !playbackPath ? (
        <button type="button" disabled>Video ainda nao disponivel</button>
      ) : sessionStatus === "loading" ? (
        <button type="button" disabled>A confirmar sessao...</button>
      ) : sessionStatus === "unavailable" ? (
        <div>
          <button type="button" disabled>Sessao temporariamente indisponivel</button>
          <button type="button" onClick={() => refreshSession().catch(() => {})}>
            Tentar confirmar sessao
          </button>
        </div>
      ) : sessionStatus === "authenticated" ? (
        <Link to={playbackPath}>Reproduzir</Link>
      ) : (
        <Link to={buildLoginRedirectPath(playbackPath)}>Entrar para reproduzir</Link>
      )}
      <section aria-labelledby="passages-title">
        <h2 id="passages-title">Passagens biblicas</h2>
        {passagesPending ? <p role="status">A carregar passagens...</p> : null}
        {passagesError ? (
          <div role="alert">
            <p>{passagesError}</p>
            <button type="button" onClick={() => setPassagesReloadVersion((value) => value + 1)}>
              Tentar novamente
            </button>
          </div>
        ) : null}
        {!passagesPending && !passagesError && passages.length === 0 ? (
          <p>Sem passagens biblicas associadas.</p>
        ) : null}
        {!passagesPending && !passagesError ? passages.map((passage) => (
          <article key={passage.id}>
            <h3>{passage.reference}</h3>
            <p>{passage.text}</p>
          </article>
        )) : null}
      </section>
    </main>
  );
}
```

5. Explicacao do codigo ou da decisao.

O componente trata loading, erro repetível, sucesso reproduzível e media pendente. Cada leitura tem `AbortController`, flag anti-stale e retry próprios. O CTA depende exclusivamente de `isPlayable === true`, do id devolvido e do estado de sessão; `unavailable` nunca é apresentado como logout. A UI não descobre nem constrói fontes a partir do detalhe público.

6. Validacao do passo.

Abre `/catalogo/piloto-faithflix`. Deve aparecer o detalhe e um link para `/ver/<id>`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o link usar slug para o player, o BK seguinte precisa converter slug para ObjectId antes de guardar progresso.

### Passo 5 - Ligar rota frontend

1. Objetivo do passo.

Permitir navegar de `/catalogo` para `/catalogo/:idOrSlug`.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: declarações lazy e tabela de rotas

3. Instrucoes concretas.

Acrescenta a declaração lazy da página uma única vez e adiciona a rota de
detalhe depois da rota `/catalogo`. Não cries um import eager e não substituas
o `Suspense`, o `ErrorBoundary` nem o `RouteLifecycle` existentes.

4. Codigo completo.

```jsx
// ADICIONAR junto das restantes declarações lazy de páginas.
const ContentDetailPage = lazyNamedPage(
  () => import("../pages/ContentDetailPage.jsx"),
  "ContentDetailPage",
);

<>
  <Route path="/catalogo" element={<CatalogPage />} />
  <Route path="/catalogo/:idOrSlug" element={<ContentDetailPage />} />
</>
```

5. Explicacao do codigo ou da decisao.

As duas rotas podem coexistir porque React Router distingue caminho exato e
parâmetro. `lazyNamedPage` mantém a página fora do chunk inicial e reutiliza o
helper criado em `BK-MF1-02` sem redeclarar bindings anteriores.

6. Validacao do passo.

Clica num card do catalogo. O browser deve navegar para `/catalogo/<slug>` sem recarregar a pagina inteira.

7. Caso negativo, erro comum ou risco que este passo evita.

Se a rota de detalhe nao existir, o E2E do fluxo principal falha antes de chegar ao player.

### Passo 6 - Validar detalhe publico e casos negativos

1. Objetivo do passo.

Confirmar que apenas conteudos publicados aparecem.

2. Ficheiros envolvidos.
    - EXECUTAR: backend e frontend
    - VALIDAR: API e UI

3. Instrucoes concretas.

Testa um conteúdo publicado, um slug inexistente, um conteúdo em `draft` e um publicado com media pendente. Guarda a resposta publicada num ficheiro temporário e verifica recursivamente que nenhuma chave de fonte atravessou a API pública.

4. Codigo completo.

```bash
curl -sS -o /tmp/faithflix-detail.json -w '%{http_code}\n' \
  http://localhost:3000/api/catalog/piloto-faithflix
curl -i http://localhost:3000/api/catalog/slug-inexistente
curl -i http://localhost:3000/api/catalog/slug-de-um-draft
curl -i http://localhost:3000/api/catalog/slug-media-pending

node -e "const value=JSON.parse(require('fs').readFileSync('/tmp/faithflix-detail.json','utf8')); const forbidden=new Set(['media','source','url','tracks','qualityOptions','src','playbackUrl']); const visit=(item)=>{ if(!item||typeof item!=='object') return; for(const [key,child] of Object.entries(item)){ if(forbidden.has(key)) throw new Error('Campo publico proibido: '+key); visit(child); } }; visit(value); console.log('DTO publico sem fontes');"
```

5. Explicacao do codigo ou da decisao.

Os dois ultimos casos devem devolver `404`, mesmo que o `draft` exista na base de dados.

6. Validacao do passo.

Resultados esperados:

- Publicado: `200 { content }`.
- Inexistente: `404`.
- Draft: `404`.
- Publicado com media pendente: `200`, `mediaStatus: "pending"`, `isPlayable: false` e CTA desativado.
- O scan recursivo termina com `DTO publico sem fontes`.
- `/catalogo/:idOrSlug` mostra loading, erro ou detalhe sem quebrar a app.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o draft devolver `200` ou o scan encontrar qualquer chave de fonte, existe exposição indevida e o BK não pode fechar. Se a troca rápida entre dois slugs apresentar o primeiro conteúdo na segunda rota, falta cancelamento/anti-stale.

## Snippet tecnico aplicavel

```js
catalogRouter.get("/:idOrSlug", asyncHandler(getCatalogDetail));
```

#### Critérios de aceite

- [ ] `GET /api/catalog/:idOrSlug` aceita ObjectId ou slug.
- [ ] Conteudo `draft` e `archived` devolve `404`.
- [ ] `ContentDetailPage` usa `catalogApi.getDetail`.
- [ ] A rota `/catalogo/:idOrSlug` esta ligada.
- [ ] O detalhe tem `data-testid="content-detail"`.
- [ ] A resposta não contém `media`, `playbackUrl` ou `src` em qualquer nível.
- [ ] O detalhe apresenta `mediaStatus` e `isPlayable`.
- [ ] O botão/link de reprodução aponta para `/ver/:contentId` apenas quando `isPlayable` é verdadeiro.
- [ ] `idOrSlug` e `content.id` são codificados antes de entrarem em rotas/API.
- [ ] Trocar de conteúdo ou desmontar a página aborta detalhe e passagens.
- [ ] Detalhe e passagens têm retry independente e ignoram respostas stale.
- [ ] Sessão `unavailable` bloqueia o CTA e permite nova confirmação sem mostrar login.
- [ ] Classificação vazia apresenta fallback PT-PT, nunca `0+`.
- [ ] Conteúdo `published` com media pendente continua visível e tem CTA desativado/ausente.
- [ ] Os métodos admin preservados usam os envelopes paginados com `limit <= 50`.
- [ ] Create admin envia apenas metadata/assets/taxonomias e nasce com media vazia/`pending`.
- [ ] Update admin não envia media e trata `400 CATALOG_MEDIA_MUTATION_FORBIDDEN`; `mediaStatus` é read-only.
- [ ] Paginação e fronteira media não removem `expectedVersion`, CAS nem tratamento de `CONTENT_VERSION_CONFLICT`.

#### Validação final

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Regista evidence com respostas `curl` e screenshot de `/catalogo/piloto-faithflix`.

#### Evidence para PR/defesa

- Output de `npm --prefix backend test`.
- Output de `npm --prefix frontend run build`.
- Resposta `curl` de `GET /api/catalog/piloto-faithflix` com `200`.
- Resposta `curl` de slug inexistente com `404`.
- Resposta `curl` de conteudo `draft` com `404`.
- Screenshot de `/catalogo/piloto-faithflix` com `data-testid="content-detail"`.
- Confirmação visual do CTA ativo para media pronta e indisponível para media pendente.
- Teste comportamental de abort no unmount/troca de slug, retry independente
  de detalhe/passagens, sessão `unavailable` e segmentos codificados.

#### Handoff

O `BK-MF2-05` recebe `content.id` e obtém a única fonte autorizada através de `GET /api/playback/:contentId`. O detalhe público nunca entrega `media.playbackUrl`.

## Proximo BK recomendado

`BK-MF2-05` - Reproducao e continuar a ver.

#### Changelog

- 2026-05-31: Alinhados criterios, evidence, handoff e changelog com o contrato do guia.
- 2026-07-09: Alinhado detalhe público com redaction de fontes e disponibilidade `mediaStatus`/`isPlayable`.
- 2026-07-10: Preservado no cliente o contrato admin `version`/`expectedVersion` e `409 CONTENT_VERSION_CONFLICT`.
- 2026-07-10: Métodos admin preservados com mutações metadata/assets/taxonomias only, media read-only e envelopes paginados até 50 itens.
- 2026-07-10: Tutorial canónico consolidado com allowlist pública, fronteira admin metadata-only, detalhe/passagens canceláveis e anti-stale, retry independente, sessão indisponível distinta de logout, fallbacks PT-PT e segmentos codificados.
