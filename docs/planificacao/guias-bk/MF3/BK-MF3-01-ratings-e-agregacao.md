# BK-MF3-01 - Ratings e agregacao

## Header

- `doc_id`: `GUIA-BK-MF3-01`
- `bk_id`: `BK-MF3-01`
- `macro`: `MF3`
- `owner`: `Davi`
- `apoio`: `Matheus`
- `prioridade`: `P1`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF2-07`
- `rf_rnf`: `RF19, RF21`
- `fase_documental`: `Fase 2`
- `sprint`: `S05`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-02`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-01-ratings-e-agregacao.md`
- `last_updated`: `2026-06-12`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Neste BK vais implementar ratings de 1 a 5 estrelas para conteudos publicados (`RF19`) e a agregacao publica desses ratings (`RF21`).

No fim, deves conseguir explicar porque cada utilizador so pode ter um rating por conteudo, porque o backend usa `req.user.id` em vez de aceitar `userId` no pedido, e como a media agregada e calculada sem expor dados pessoais.

### Importancia funcional

Ratings ajudam outros utilizadores a perceber a rececao de um conteudo e geram um sinal simples para recomendacao baseline nos BKs seguintes. Esta entrega prepara `BK-MF3-02` para comentarios e `BK-MF3-05` para recomendacoes baseadas em ratings.

### Scope-in

- Criar colecao `content_ratings`.
- Criar validacao de `contentId` e `value`.
- Criar endpoints para gravar, ler e agregar ratings.
- Garantir ownership por `req.user.id`.
- Devolver apenas conteudos publicados.
- Criar cliente frontend `ratingsApi`.
- Criar componente `RatingBox` para a pagina de detalhe.

### Scope-out

- Reviews longas.
- Denuncias e workflow avancado de moderacao.
- Recomendacao personalizada.
- Alteracao do modelo de catalogo criado na `MF2`.
- Rating anonimo.

### Glossario rapido

- `Rating`: classificacao numerica de um conteudo.
- `Agregacao`: calculo de valores como media, total e distribuicao.
- `Ownership`: garantia de que o dado pertence ao utilizador autenticado.
- `Distribuicao`: contagem de quantos ratings existem por estrela.

### Conceitos essenciais

- `CANONICO`: `RF19` permite ao utilizador atribuir rating.
- `CANONICO`: `RF21` exige agregacao de ratings pelo sistema.
- `CANONICO`: a sessao segura dos BKs anteriores disponibiliza `req.user.id`.
- `DERIVADO`: a chave unica `userId + contentId` evita ratings duplicados.
- `DERIVADO`: ratings so sao aceites para conteudos `published`, tal como o catalogo publico.

### Tempo estimado

- Rever dependencias da `MF2`: 20 min.
- Backend de ratings: 70 min.
- Frontend de detalhe: 45 min.
- Validacao e evidence: 35 min.

### Erros comuns

- Aceitar `userId` vindo do frontend.
- Permitir valores fora de 1 a 5.
- Calcular media incluindo conteudos arquivados ou inexistentes.
- Criar mais do que um rating do mesmo utilizador para o mesmo conteudo.

### Check de compreensao

- [ ] Sei explicar a diferenca entre rating individual e agregacao.
- [ ] Sei porque o backend usa `req.user.id`.
- [ ] Sei testar valor invalido, conteudo inexistente e pedido sem sessao.
- [ ] Sei que `BK-MF3-05` vai usar estes ratings como sinal de recomendacao.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF2-07` concluido.
- `BK-MF2-03` criou a colecao `contents` com `status: "published"`.
- `BK-MF2-01` e `BK-MF2-02` disponibilizam `req.user`, `requireAuth` e roles base.
- `apiClient` da `MF1` envia cookies com `credentials: "include"`.
- Existe pelo menos um conteudo publicado para testar.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Colecao | `content_ratings` |
| Chave unica | `userId + contentId` |
| Escala | inteiros de `1` a `5` |
| Criar/atualizar rating | `PUT /api/ratings/:contentId` |
| Ler resumo | `GET /api/ratings/:contentId/summary` |
| Ler o meu rating | `GET /api/ratings/:contentId/me` |
| Remover o meu rating | `DELETE /api/ratings/:contentId` |
| Frontend | `ratingsApi`, `RatingBox` |
| Handoff | `BK-MF3-02` reutiliza conteudo autenticado e detalhe publico |

### Modelo `content_ratings`

```js
{
  _id,
  userId,
  contentId,
  value,
  createdAt,
  updatedAt
}
```

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de ratings

1. Objetivo do passo.

Validar IDs e valores antes de gravar qualquer rating.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/ratings/ratings.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria a pasta `backend/src/modules/ratings/` e adiciona a validacao abaixo.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";

export function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

export function assertRatingValue(value) {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    const error = new Error("O rating deve ser um inteiro entre 1 e 5.");
    error.statusCode = 400;
    throw error;
  }

  return rating;
}
```

5. Explicacao do codigo ou da decisao.

`asObjectId` impede consultas com IDs invalidos. `assertRatingValue` garante que a escala do produto e sempre a mesma.

6. Validacao do passo.

```bash
node -e "import('./src/modules/ratings/ratings.validation.js').then(({ assertRatingValue }) => console.log(assertRatingValue(5)))"
```

Resultado esperado: `5`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem esta validacao, o frontend poderia enviar `10`, `"bom"` ou um ID mal formado e deixar dados inconsistentes.

### Passo 2 - Criar service de ratings

1. Objetivo do passo.

Gravar o rating do utilizador autenticado, calcular agregados e proteger conteudos nao publicados.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/ratings/ratings.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo. Ele usa a colecao `contents` criada em `BK-MF2-03`.

4. Codigo completo.

```js
import { getDb } from "../../config/database.js";
import { asObjectId, assertRatingValue } from "./ratings.validation.js";

async function assertPublishedContent(db, contentId) {
  const content = await db.collection("contents").findOne({
    _id: contentId,
    status: "published",
  });

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return content;
}

function emptySummary(contentId) {
  return {
    contentId,
    average: 0,
    count: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

export async function ensureRatingIndexes() {
  const db = await getDb();
  await db.collection("content_ratings").createIndex(
    { userId: 1, contentId: 1 },
    { unique: true },
  );
  await db.collection("content_ratings").createIndex({ contentId: 1, value: 1 });
}

export async function saveMyRating(userId, contentId, value) {
  const db = await getDb();
  const userObjectId = asObjectId(userId, "Utilizador");
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const rating = assertRatingValue(value);
  const now = new Date();

  await assertPublishedContent(db, contentObjectId);

  await db.collection("content_ratings").updateOne(
    { userId: userObjectId, contentId: contentObjectId },
    {
      $set: { value: rating, updatedAt: now },
      $setOnInsert: { userId: userObjectId, contentId: contentObjectId, createdAt: now },
    },
    { upsert: true },
  );

  return {
    myRating: rating,
    summary: await getRatingSummary(contentId),
  };
}

export async function getMyRating(userId, contentId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");

  await assertPublishedContent(db, contentObjectId);

  const rating = await db.collection("content_ratings").findOne({
    userId: asObjectId(userId, "Utilizador"),
    contentId: contentObjectId,
  });

  return { myRating: rating?.value ?? null };
}

export async function removeMyRating(userId, contentId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");

  await db.collection("content_ratings").deleteOne({
    userId: asObjectId(userId, "Utilizador"),
    contentId: contentObjectId,
  });

  return {
    myRating: null,
    summary: await getRatingSummary(contentId),
  };
}

export async function getRatingSummary(contentId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");

  await assertPublishedContent(db, contentObjectId);

  const rows = await db.collection("content_ratings").aggregate([
    { $match: { contentId: contentObjectId } },
    {
      $group: {
        _id: "$value",
        count: { $sum: 1 },
      },
    },
  ]).toArray();

  if (rows.length === 0) return emptySummary(contentId);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let count = 0;

  for (const row of rows) {
    distribution[row._id] = row.count;
    total += row._id * row.count;
    count += row.count;
  }

  return {
    contentId,
    average: Number((total / count).toFixed(2)),
    count,
    distribution,
  };
}
```

5. Explicacao do codigo ou da decisao.

O service valida conteudo publicado antes de aceitar ou apresentar ratings. A chave unica impede duplicacao e o `upsert` permite alterar o rating sem criar novo documento.

6. Validacao do passo.

```bash
node -e "import('./src/modules/ratings/ratings.service.js').then((m) => console.log(typeof m.saveMyRating, typeof m.getRatingSummary))"
```

Resultado esperado: `function function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se o rating aceitasse conteudos `draft`, utilizadores poderiam avaliar conteudos que ainda nao estao publicados.

### Passo 3 - Criar controller e rotas

1. Objetivo do passo.

Expor endpoints claros para frontend e detalhe de conteudo.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/ratings/ratings.controller.js`
    - CRIAR: `backend/src/modules/ratings/ratings.routes.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Cria controller e router. Rotas de escrita usam `requireAuth`; resumo publico nao exige login.

4. Codigo completo.

`backend/src/modules/ratings/ratings.controller.js`

```js
import {
  getMyRating,
  getRatingSummary,
  removeMyRating,
  saveMyRating,
} from "./ratings.service.js";

export async function getContentRatingSummary(req, res) {
  res.status(200).json({ summary: await getRatingSummary(req.params.contentId) });
}

export async function getMyContentRating(req, res) {
  res.status(200).json(await getMyRating(req.user.id, req.params.contentId));
}

export async function putMyContentRating(req, res) {
  res.status(200).json(await saveMyRating(req.user.id, req.params.contentId, req.body.value));
}

export async function deleteMyContentRating(req, res) {
  res.status(200).json(await removeMyRating(req.user.id, req.params.contentId));
}
```

`backend/src/modules/ratings/ratings.routes.js`

```js
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  deleteMyContentRating,
  getContentRatingSummary,
  getMyContentRating,
  putMyContentRating,
} from "./ratings.controller.js";

export const ratingsRouter = Router();

ratingsRouter.get("/:contentId/summary", asyncHandler(getContentRatingSummary));
ratingsRouter.get("/:contentId/me", requireAuth, asyncHandler(getMyContentRating));
ratingsRouter.put("/:contentId", requireAuth, asyncHandler(putMyContentRating));
ratingsRouter.delete("/:contentId", requireAuth, asyncHandler(deleteMyContentRating));
```

5. Explicacao do codigo ou da decisao.

O resumo e publico porque faz parte do detalhe do conteudo. As operacoes do rating individual precisam de login porque pertencem a um utilizador.

6. Validacao do passo.

Sem cookie:

```bash
curl -i -X PUT http://localhost:3000/api/ratings/CONTENT_ID -H "Content-Type: application/json" -d '{"value":5}'
```

Resultado esperado: `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Se `PUT` fosse publico, qualquer visitante poderia manipular ratings.

### Passo 4 - Montar router e indices

1. Objetivo do passo.

Ligar o modulo de ratings a aplicacao Express.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`
    - LOCALIZACAO: imports e montagem de rotas

3. Instrucoes concretas.

Monta `ratingsRouter` em `/api/ratings` e cria indices no arranque.

4. Codigo completo.

Trecho esperado em `backend/src/app.js`:

```js
import { ratingsRouter } from "./modules/ratings/ratings.routes.js";

app.use("/api/ratings", ratingsRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureRatingIndexes } from "./modules/ratings/ratings.service.js";

await ensureRatingIndexes();
```

5. Explicacao do codigo ou da decisao.

O router fica separado do catalogo para manter responsabilidades claras: catalogo descreve conteudos; ratings guardam feedback do utilizador.

6. Validacao do passo.

```bash
npm --prefix backend run dev
```

Resultado esperado: servidor inicia sem erro de import.

7. Caso negativo, erro comum ou risco que este passo evita.

Se os indices nao forem criados, dois pedidos simultaneos podem gerar ratings duplicados.

### Passo 5 - Criar cliente frontend e componente

1. Objetivo do passo.

Permitir que a pagina de detalhe leia o resumo e grave o rating do utilizador.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/ratingsApi.js`
    - CRIAR: `frontend/src/components/ratings/RatingBox.jsx`
    - EDITAR: `frontend/src/pages/ContentDetailPage.jsx`
    - LOCALIZACAO: ficheiros completos para os novos ficheiros; inserir o componente na pagina de detalhe

3. Instrucoes concretas.

Cria o cliente e o componente. Depois adiciona `<RatingBox contentId={content.id} />` na pagina de detalhe, perto dos metadados principais.

4. Codigo completo.

`frontend/src/services/api/ratingsApi.js`

```js
import { apiClient } from "./apiClient.js";

export const ratingsApi = {
  getSummary(contentId) {
    return apiClient.get(`/api/ratings/${encodeURIComponent(contentId)}/summary`);
  },
  getMine(contentId) {
    return apiClient.get(`/api/ratings/${encodeURIComponent(contentId)}/me`);
  },
  save(contentId, value) {
    return apiClient.put(`/api/ratings/${encodeURIComponent(contentId)}`, { value });
  },
  remove(contentId) {
    return apiClient.del(`/api/ratings/${encodeURIComponent(contentId)}`);
  },
};
```

`frontend/src/components/ratings/RatingBox.jsx`

```jsx
import { useEffect, useState } from "react";
import { ratingsApi } from "../../services/api/ratingsApi.js";

const emptySummary = {
  average: 0,
  count: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

export function RatingBox({ contentId }) {
  const [summary, setSummary] = useState(emptySummary);
  const [myRating, setMyRating] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");

    Promise.all([
      ratingsApi.getSummary(contentId),
      ratingsApi.getMine(contentId).catch(() => ({ myRating: null })),
    ])
      .then(([summaryResponse, mineResponse]) => {
        if (!active) return;
        setSummary(summaryResponse.summary);
        setMyRating(mineResponse.myRating);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setError("Nao foi possivel carregar os ratings.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [contentId]);

  async function chooseRating(value) {
    setError("");
    setStatus("saving");

    try {
      const response = await ratingsApi.save(contentId, value);
      setMyRating(response.myRating);
      setSummary(response.summary);
      setStatus("success");
    } catch {
      setError("Entra na tua conta para avaliar este conteudo.");
      setStatus("error");
    }
  }

  async function clearRating() {
    setError("");
    setStatus("saving");

    try {
      const response = await ratingsApi.remove(contentId);
      setMyRating(response.myRating);
      setSummary(response.summary);
      setStatus("success");
    } catch {
      setError("Nao foi possivel remover o rating.");
      setStatus("error");
    }
  }

  return (
    <section className="rating-box" aria-label="Rating do conteudo">
      <h2>Rating</h2>
      <p>{summary.count === 0 ? "Ainda sem ratings." : `${summary.average}/5 em ${summary.count} rating(s).`}</p>

      <div className="rating-actions">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={myRating === value}
            disabled={status === "saving"}
            onClick={() => chooseRating(value)}
          >
            {value}
          </button>
        ))}
        {myRating !== null && (
          <button type="button" disabled={status === "saving"} onClick={clearRating}>
            Remover
          </button>
        )}
      </div>

      {myRating !== null && <p>O teu rating: {myRating}/5.</p>}
      {status === "loading" && <p>A carregar ratings...</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
```

5. Explicacao do codigo ou da decisao.

O cliente usa `apiClient`, que ja envia cookies. O componente mostra loading, erro, estado vazio e sucesso. O frontend nunca envia `userId`; envia apenas o valor do rating.

6. Validacao do passo.

```bash
npm --prefix frontend run build
```

Resultado esperado: build sem erros de import.

7. Caso negativo, erro comum ou risco que este passo evita.

Usar `fetch` diretamente nesta pagina duplicaria logica de cookies e mensagens de erro.

## Criterios de aceite (mensuraveis)

- `PUT /api/ratings/:contentId` grava ou atualiza o rating do utilizador autenticado e devolve `200`.
- `GET /api/ratings/:contentId/summary` devolve `average`, `count` e `distribution`.
- Pedido sem sessao para `PUT` ou `DELETE` devolve `401`.
- Rating fora de `1..5` devolve `400`.
- Conteudo inexistente ou nao publicado devolve `404`.
- Dois pedidos do mesmo utilizador para o mesmo conteudo mantem um unico documento.

## Validacao final

```bash
npm --prefix backend test
npm --prefix frontend run build
curl -i http://localhost:3000/api/ratings/CONTENT_ID/summary
```

Resultado esperado: testes e build passam; o `curl` devolve `200` para conteudo publicado.

## Evidence para PR/defesa

- `pr`: referencia do PR/commit com modulo `ratings`.
- `proof`: resposta de `GET /api/ratings/:contentId/summary` antes e depois de avaliar.
- `proof`: captura do `RatingBox` na pagina de detalhe.
- `neg`: `401` sem cookie, `400` para rating invalido, `404` para conteudo inexistente.

## Handoff

O `BK-MF3-02` pode assumir que existe feedback autenticado por conteudo, que o detalhe ja consegue apresentar interacao de comunidade e que a colecao `content_ratings` fica disponivel como sinal para recomendacao baseline.

## Snippet tecnico aplicavel

O codigo aplicavel esta nos passos 1 a 5. O ponto central deste BK e:

```js
await db.collection("content_ratings").updateOne(
  { userId: userObjectId, contentId: contentObjectId },
  { $set: { value: rating, updatedAt: now }, $setOnInsert: { userId: userObjectId, contentId: contentObjectId, createdAt: now } },
  { upsert: true },
);
```

Este trecho garante um rating por utilizador e por conteudo.

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3.
- `2026-06-07`: guia reescrito com contrato tecnico, backend, frontend, ownership, validacao e evidence mensuravel.
