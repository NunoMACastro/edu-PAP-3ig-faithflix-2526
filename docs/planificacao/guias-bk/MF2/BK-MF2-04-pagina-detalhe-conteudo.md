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

Criar a pagina de detalhe de um conteudo publicado (`RF08`), usando o contrato real do catalogo. O aluno deve perceber que uma pagina de detalhe nao e apenas uma ficha visual: ela prepara o player, favoritos, watchlist, historico, pesquisa e recomendacao.

### Tempo estimado

- Rever contrato de `BK-MF2-03`: 15 min.
- Endpoint de detalhe: 40 min.
- Cliente API e pagina React: 60 min.
- Estados de UI e negativos: 35 min.

### Conceitos essenciais

- O detalhe publico mostra apenas conteudo `published`.
- A rota pode receber `slug` ou `id`, mas a resposta publica tem sempre `id` e `slug`.
- A pagina deve lidar com `loading`, `success`, `not found` e erro.
- O botao de reproducao prepara o handoff para `BK-MF2-05`.

### Erros comuns

- Criar dados fixos no componente.
- Mostrar conteudo `draft`.
- Chamar um endpoint diferente do que o backend entrega.
- Construir o player neste BK.
- Ignorar estados de erro e carregamento.

### Check de compreensao

- [ ] Sei dizer que endpoint alimenta a pagina.
- [ ] Sei porque `draft` devolve `404` no detalhe publico.
- [ ] Sei que o player entra no BK seguinte.
- [ ] Sei que o botao "Reproduzir" deve passar `content.id` ou `content.slug`.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-03` concluido.
- Existe pelo menos um conteudo `published`.
- `frontend/src/services/api/apiClient.js` existe e usa `credentials: "include"`.
- O router frontend permite criar uma rota de detalhe.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Endpoint | `GET /api/catalog/:idOrSlug` |
| Visibilidade | apenas `status: "published"` |
| Sucesso | `200 { content }` |
| Inexistente/rascunho | `404` |
| Frontend | `ContentDetailPage` |
| Handoff | link para `/watch/:id` no `BK-MF2-05` |

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

### Guia de execucao (passo-a-passo)

### Passo 1 - Adicionar detalhe ao servico de catalogo

`EDITAR backend/src/modules/catalog/catalog.service.js`

Adicionar a funcao:

```js
import { ObjectId } from "mongodb";

function buildDetailQuery(idOrSlug) {
  if (ObjectId.isValid(idOrSlug)) {
    return { _id: new ObjectId(idOrSlug), status: "published" };
  }

  return { slug: String(idOrSlug ?? "").trim(), status: "published" };
}

export async function getPublishedContentDetail(idOrSlug) {
  const db = await getDb();
  const content = await db.collection("contents").findOne(buildDetailQuery(idOrSlug));

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return publicContent(content);
}
```

### Passo 2 - Adicionar controller de detalhe

`EDITAR backend/src/modules/catalog/catalog.controller.js`

```js
import { getPublishedContentDetail } from "./catalog.service.js";

export async function getCatalogDetail(req, res) {
  res.status(200).json({ content: await getPublishedContentDetail(req.params.idOrSlug) });
}
```

### Passo 3 - Adicionar rota de detalhe

`EDITAR backend/src/modules/catalog/catalog.routes.js`

Colocar a rota depois de `/admin` e `/taxonomies`, para evitar conflito de nomes.

```js
catalogRouter.get("/taxonomies", asyncHandler(getTaxonomies));
catalogRouter.post("/taxonomies", canManageCatalog, asyncHandler(postTaxonomy));
catalogRouter.get("/:idOrSlug", asyncHandler(getCatalogDetail));
```

### Passo 4 - Atualizar cliente frontend

`EDITAR frontend/src/services/api/catalogApi.js`

```js
export const catalogApi = {
  listPublished() {
    return apiClient.get("/api/catalog");
  },
  getDetail(idOrSlug) {
    return apiClient.get(`/api/catalog/${encodeURIComponent(idOrSlug)}`);
  },
};
```

Se o ficheiro ja tiver os metodos admin do BK anterior, manter esses metodos e acrescentar apenas `getDetail`.

### Passo 5 - Criar pagina de detalhe

`CRIAR frontend/src/pages/ContentDetailPage.jsx`

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
    let ignore = false;

    setLoading(true);
    setError("");

    catalogApi.getDetail(idOrSlug)
      .then((response) => {
        if (!ignore) setContent(response.content);
      })
      .catch((requestError) => {
        if (!ignore) setError(requestError.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [idOrSlug]);

  if (loading) {
    return <main className="page-shell"><p>A carregar conteudo...</p></main>;
  }

  if (error) {
    return <main className="page-shell"><h1>Conteudo indisponivel</h1><p>{error}</p></main>;
  }

  return (
    <main className="content-detail">
      <section className="content-hero">
        {content.assets?.backdropUrl ? <img src={content.assets.backdropUrl} alt="" /> : null}
        <div>
          <p>{content.type}</p>
          <h1>{content.title}</h1>
          <p>{content.synopsis}</p>
          <dl>
            <div><dt>Duracao</dt><dd>{formatDuration(content.durationSeconds)}</dd></div>
            <div><dt>Idade</dt><dd>{content.ageRating}+</dd></div>
          </dl>
          <Link className="primary-action" to={`/watch/${content.id}`}>Reproduzir</Link>
        </div>
      </section>
    </main>
  );
}
```

### Passo 6 - Adicionar rota frontend

`EDITAR frontend/src/App.jsx` ou o ficheiro de rotas existente:

```jsx
import { ContentDetailPage } from "./pages/ContentDetailPage.jsx";

<Route path="/catalog/:idOrSlug" element={<ContentDetailPage />} />
```

### Passo 7 - Ligar cards de catalogo ao detalhe

No componente de card/listagem criado antes, cada item publicado deve apontar para:

```jsx
<Link to={`/catalog/${content.slug || content.id}`}>{content.title}</Link>
```

### Passo 8 - Validar manualmente

Executar:

```bash
curl -i http://localhost:3000/api/catalog
curl -i http://localhost:3000/api/catalog/piloto-faithflix
curl -i http://localhost:3000/api/catalog/id-inexistente
```

Validar no browser:

- abrir `/catalog/piloto-faithflix`;
- confirmar titulo, sinopse, duracao e idade;
- confirmar que o botao aponta para `/watch/:id`;
- confirmar que slug inexistente mostra estado de erro.

### Passo 9 - Validar negativos minimos

- Conteudo inexistente devolve `404`.
- Conteudo `draft` devolve `404` no endpoint publico.
- Slug vazio ou estranho nao quebra o servidor.
- Sem `backdropUrl`, a pagina continua legivel.
- O botao de reproducao nao tenta iniciar player neste BK.

## Snippet tecnico aplicavel

O ponto central e filtrar detalhe por conteudo publicado:

```js
const content = await db.collection("contents").findOne({
  slug: idOrSlug,
  status: "published",
});
```

## Criterios de aceite (mensuraveis)

- `GET /api/catalog/:idOrSlug` devolve `200` para conteudo publicado.
- O mesmo endpoint devolve `404` para rascunho, arquivado ou inexistente.
- `ContentDetailPage` mostra titulo, sinopse, tipo, duracao e idade.
- A pagina tem estados de carregamento e erro.
- O botao de reproducao aponta para `/watch/:id`.
- O frontend nao usa dados fixos para o detalhe.

## Validacao final

- Confirmar que `GET /api/catalog` e `GET /api/catalog/:idOrSlug` usam o mesmo modelo.
- Confirmar que o detalhe nao duplica regras de publicacao.
- Confirmar que o link para player usa `content.id`.
- Confirmar que `BK-MF2-05` consegue ler `media.playbackUrl`.

## Evidence para PR/defesa

- Resposta `200` do detalhe publicado.
- Resposta `404` para conteudo inexistente.
- Captura da pagina de detalhe.
- Captura do estado de erro.
- Print do link `/watch/:id`.

## Handoff

Para `BK-MF2-05`, entregar:

- Endpoint de detalhe publico.
- `media.playbackUrl` disponivel.
- `content.id` usado como chave tecnica do player.
- UI com CTA de reproducao sem logica de progresso.

## Proximo BK recomendado

`BK-MF2-05 - Reproducao e continuar a ver`

## Changelog

- `2026-05-31`: Guia reescrito com endpoint de detalhe, pagina React, estados de UI, negativos e handoff para player.
