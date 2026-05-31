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
- `last_updated`: `2026-05-31`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Neste BK vais criar a pagina de detalhe de um conteudo publicado (`RF08`) usando o contrato real do catalogo.

No fim, deves conseguir explicar como uma rota com `id` ou `slug` encontra um conteudo, porque conteudos `draft` devolvem `404` e como o botao de reproducao prepara a passagem para o player.

### Importancia funcional

A pagina de detalhe e a ponte entre catalogo e reproducao. Ela apresenta sinopse, poster, dados de classificacao e o caminho para `/ver/:contentId`, que sera implementado no `BK-MF2-05`.

### Scope-in

- Criar endpoint `GET /api/catalog/:idOrSlug`.
- Permitir detalhe por `id` ou `slug`.
- Devolver apenas conteudos `published`.
- Criar `ContentDetailPage`.
- Ligar rota frontend `/catalogo/:idOrSlug`.
- Adicionar `data-testid="content-detail"` para o E2E de `BK-MF2-08`.

### Scope-out

- Construir player.
- Guardar progresso.
- Favoritos e watchlist.
- Conteudos recomendados.
- Comentarios ou ratings.

### Glossario rapido

- `idOrSlug`: parametro que pode ser ObjectId MongoDB ou slug.
- `404`: resposta usada quando o conteudo nao existe ou nao esta publicado.
- `Handoff`: passagem de dados minima para o BK seguinte.

### Conceitos essenciais

- O detalhe publico nunca deve mostrar `draft` ou `archived`.
- Rotas fixas como `/admin` e `/taxonomies` precisam ficar antes de `/:idOrSlug`.
- O frontend nao deve ter dados fixos do conteudo.
- O link para reproducao usa `content.id`, porque o progresso e o player trabalham por identificador persistente.

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

### Check de compreensao

- [ ] Sei que endpoint alimenta a pagina de detalhe.
- [ ] Sei porque `draft` deve devolver `404`.
- [ ] Sei porque o player nao e implementado neste BK.
- [ ] Sei porque o link para reproducao usa `content.id`.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-03` concluido.
- Existe pelo menos um conteudo `published`.
- `frontend/src/services/api/apiClient.js` existe.
- O router frontend permite adicionar rotas.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Endpoint | `GET /api/catalog/:idOrSlug` |
| Visibilidade | apenas `status: "published"` |
| Sucesso | `200 { content }` |
| Inexistente, rascunho ou arquivado | `404` |
| Frontend | `ContentDetailPage` |
| Rota frontend | `/catalogo/:idOrSlug` |
| Handoff | link para `/ver/:contentId` no `BK-MF2-05` |

### Shape minimo de resposta

```js
{
  content: {
    id,
    title,
    slug,
    synopsis,
    type,
    durationSeconds,
    ageRating,
    taxonomyIds,
    assets: { posterUrl, backdropUrl },
    media: { playbackUrl },
    publishedAt
  }
}
```

### Decisoes tecnicas

- `CANONICO`: detalhe publico le a colecao `contents` criada no BK anterior.
- `DERIVADO`: `idOrSlug` aceita os dois formatos para suportar links humanos e chamadas tecnicas.
- `DERIVADO`: a pagina usa `data-testid="content-detail"` para teste E2E estavel.

### Guia de execucao (passo-a-passo)

### Passo 1 - Adicionar detalhe ao servico de catalogo

1. Objetivo do passo.

Criar uma funcao que encontra um conteudo publicado por `id` ou `slug`.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/catalog/catalog.service.js`
    - LOCALIZACAO: acrescentar exports no ficheiro existente

3. Instrucoes concretas.

No ficheiro do `BK-MF2-03`, garante que `publicContent` continua acessivel dentro do modulo e acrescenta as funcoes abaixo.

4. Codigo completo.

```js
function buildPublishedDetailQuery(idOrSlug) {
  const value = String(idOrSlug ?? "").trim();

  if (ObjectId.isValid(value)) {
    return { _id: new ObjectId(value), status: "published" };
  }

  return { slug: value, status: "published" };
}

export async function getPublishedContentDetail(idOrSlug) {
  const db = await getDb();
  const content = await db.collection("contents").findOne(buildPublishedDetailQuery(idOrSlug));

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return publicContent(content);
}
```

5. Explicacao do codigo ou da decisao.

O filtro inclui `status: "published"` dentro da query. Assim, um `draft` com slug valido tem a mesma resposta publica que um conteudo inexistente.

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

Adiciona o controller e importa-o no router. A rota dinamica deve ser a ultima rota `GET` publica.

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
import { getCatalogDetail } from "./catalog.controller.js";

catalogRouter.get("/", asyncHandler(getCatalog));
catalogRouter.get("/admin", canManageCatalog, asyncHandler(getAdminCatalog));
catalogRouter.get("/taxonomies", asyncHandler(getTaxonomies));
catalogRouter.post("/taxonomies", canManageCatalog, asyncHandler(postTaxonomy));
catalogRouter.post("/", canManageCatalog, asyncHandler(postContent));
catalogRouter.patch("/:id", canManageCatalog, asyncHandler(patchContent));
catalogRouter.patch("/:id/status", canManageCatalog, asyncHandler(patchContentStatus));
catalogRouter.get("/:idOrSlug", asyncHandler(getCatalogDetail));
```

5. Explicacao do codigo ou da decisao.

`/:idOrSlug` vem no fim para nao capturar `admin` ou `taxonomies`.

6. Validacao do passo.

```bash
curl -i http://localhost:3000/api/catalog/piloto-faithflix
```

Resultado esperado: `200` para conteudo publicado ou `404` se ainda nao existir.

7. Caso negativo, erro comum ou risco que este passo evita.

Se `/:idOrSlug` vier antes de `/taxonomies`, o endpoint de taxonomias deixa de ser chamado.

### Passo 3 - Atualizar cliente frontend de catalogo

1. Objetivo do passo.

Adicionar uma funcao para carregar detalhe sem remover os metodos admin criados no BK anterior.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/services/api/catalogApi.js`
    - LOCALIZACAO: objeto `catalogApi`

3. Instrucoes concretas.

Mantem os metodos existentes e acrescenta `getDetail`.

4. Codigo completo.

```js
import { apiClient } from "./apiClient.js";

export const catalogApi = {
  listPublished() {
    return apiClient.get("/api/catalog");
  },
  getDetail(idOrSlug) {
    return apiClient.get(`/api/catalog/${encodeURIComponent(idOrSlug)}`);
  },
  listAdmin() {
    return apiClient.get("/api/catalog/admin");
  },
  createContent(input) {
    return apiClient.post("/api/catalog", input);
  },
  updateContent(contentId, input) {
    return apiClient.patch(`/api/catalog/${encodeURIComponent(contentId)}`, input);
  },
  updateStatus(contentId, status) {
    return apiClient.patch(`/api/catalog/${encodeURIComponent(contentId)}/status`, { status });
  },
  listTaxonomies() {
    return apiClient.get("/api/catalog/taxonomies");
  },
  createTaxonomy(input) {
    return apiClient.post("/api/catalog/taxonomies", input);
  },
};
```

5. Explicacao do codigo ou da decisao.

O ficheiro fica completo para evitar perder metodos admin ao adicionar detalhe.

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
import { catalogApi } from "../services/api/catalogApi.js";

function formatDuration(seconds) {
  const minutes = Math.round(Number(seconds) / 60);
  return `${minutes} min`;
}

export function ContentDetailPage() {
  const { idOrSlug } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    catalogApi.getDetail(idOrSlug)
      .then((response) => {
        if (active) setContent(response.content);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [idOrSlug]);

  if (loading) {
    return <main className="page-shell"><p>A carregar conteudo...</p></main>;
  }

  if (error || !content) {
    return (
      <main className="page-shell">
        <h1>Conteudo indisponivel</h1>
        <p>{error || "Conteudo nao encontrado."}</p>
      </main>
    );
  }

  return (
    <main className="page-shell" data-testid="content-detail">
      <img src={content.assets.backdropUrl || content.assets.posterUrl} alt="" />
      <p>{content.type}</p>
      <h1>{content.title}</h1>
      <p>{content.synopsis}</p>
      <dl>
        <dt>Duracao</dt>
        <dd>{formatDuration(content.durationSeconds)}</dd>
        <dt>Classificacao</dt>
        <dd>{content.ageRating}+</dd>
      </dl>
      <Link to={`/ver/${content.id}`}>Reproduzir</Link>
    </main>
  );
}
```

5. Explicacao do codigo ou da decisao.

O componente trata loading, erro e sucesso. O `data-testid` torna o E2E estavel sem depender de texto visual.

6. Validacao do passo.

Abre `/catalogo/piloto-faithflix`. Deve aparecer o detalhe e um link para `/ver/<id>`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o link usar slug para o player, o BK seguinte precisa converter slug para ObjectId antes de guardar progresso.

### Passo 5 - Ligar rota frontend

1. Objetivo do passo.

Permitir navegar de `/catalogo` para `/catalogo/:idOrSlug`.

2. Ficheiros envolvidos.
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`
    - LOCALIZACAO: imports e rotas

3. Instrucoes concretas.

Importa a pagina e adiciona a rota de detalhe depois da rota `/catalogo`.

4. Codigo completo.

```jsx
import { ContentDetailPage } from "../pages/ContentDetailPage.jsx";

<Route path="/catalogo" element={<CatalogPage />} />
<Route path="/catalogo/:idOrSlug" element={<ContentDetailPage />} />
```

5. Explicacao do codigo ou da decisao.

As duas rotas podem coexistir porque React Router distingue caminho exato e parametro.

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

Testa um conteudo publicado, um slug inexistente e um conteudo ainda em `draft`.

4. Codigo completo.

```bash
curl -i http://localhost:3000/api/catalog/piloto-faithflix
curl -i http://localhost:3000/api/catalog/slug-inexistente
curl -i http://localhost:3000/api/catalog/slug-de-um-draft
```

5. Explicacao do codigo ou da decisao.

Os dois ultimos casos devem devolver `404`, mesmo que o `draft` exista na base de dados.

6. Validacao do passo.

Resultados esperados:

- Publicado: `200 { content }`.
- Inexistente: `404`.
- Draft: `404`.
- `/catalogo/:idOrSlug` mostra loading, erro ou detalhe sem quebrar a app.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o draft devolver `200`, ha exposicao indevida de conteudo nao publicado.

## Snippet tecnico aplicavel

```js
catalogRouter.get("/:idOrSlug", asyncHandler(getCatalogDetail));
```

## Criterios de aceitacao

- [ ] `GET /api/catalog/:idOrSlug` aceita ObjectId ou slug.
- [ ] Conteudo `draft` e `archived` devolve `404`.
- [ ] `ContentDetailPage` usa `catalogApi.getDetail`.
- [ ] A rota `/catalogo/:idOrSlug` esta ligada.
- [ ] O detalhe tem `data-testid="content-detail"`.
- [ ] O botao/link de reproducao aponta para `/ver/:contentId`.

## Validacao final

```bash
npm --prefix backend test
npm --prefix frontend run build
```

Regista evidence com respostas `curl` e screenshot de `/catalogo/piloto-faithflix`.

## Handoff para o proximo BK

O `BK-MF2-05` recebe `content.id`, `durationSeconds` e `media.playbackUrl` para criar o player, guardar progresso por utilizador e apresentar "continuar a ver".
