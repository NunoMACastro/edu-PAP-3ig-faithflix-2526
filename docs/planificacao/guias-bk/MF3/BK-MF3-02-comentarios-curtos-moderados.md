# BK-MF3-02 - Comentarios curtos moderados

## Header

- `doc_id`: `GUIA-BK-MF3-02`
- `bk_id`: `BK-MF3-02`
- `macro`: `MF3`
- `owner`: `Matheus`
- `apoio`: `Kaue`
- `prioridade`: `P2`
- `estado`: `DONE`
- `esforco`: `M`
- `dependencias`: `BK-MF3-01`
- `rf_rnf`: `RF20`
- `fase_documental`: `Fase 2`
- `sprint`: `S05`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF3-03`
- `guia_path`: `docs/planificacao/guias-bk/MF3/BK-MF3-02-comentarios-curtos-moderados.md`
- `last_updated`: `2026-06-12`

## Bloco pedagogico (obrigatorio)

### Objetivo pedagogico

Neste BK vais implementar comentarios curtos em conteudos publicados (`RF20`), com validacao de tamanho, ownership e moderacao minima.

No fim, deves conseguir explicar porque comentarios precisam de validacao no backend, porque apenas comentarios visiveis aparecem ao publico e porque um utilizador so pode apagar os seus proprios comentarios, salvo permissao de moderacao.

### Importancia funcional

Comentarios curtos criam uma camada simples de comunidade sem transformar a PAP num produto social complexo. A funcionalidade complementa ratings e prepara a descoberta, porque utilizadores passam a ter mais sinais de relevancia no detalhe de conteudo.

### Scope-in

- Criar colecao `content_comments`.
- Criar validacao de corpo curto.
- Criar listagem publica de comentarios visiveis.
- Criar criacao autenticada de comentario.
- Criar remocao pelo autor.
- Criar endpoint de moderacao para `admin` e `moderator`.
- Criar cliente frontend `commentsApi`.
- Criar componente `CommentsPanel`.

### Scope-out

- Respostas encadeadas.
- Likes em comentarios.
- Denuncias com workflow completo.
- Notificacoes.
- Analise automatica avancada de linguagem.

### Glossario rapido

- `Comentario curto`: texto breve associado a um conteudo.
- `Moderacao minima`: regras simples para impedir conteudo claramente invalido ou spam basico.
- `visible`: comentario publico.
- `pending_review`: comentario guardado, mas ainda nao apresentado ao publico.
- `rejected`: comentario rejeitado por moderacao.

### Conceitos essenciais

- `CANONICO`: `RF20` define comentarios curtos como parte de classificacoes e feedback.
- `CANONICO`: comentarios pertencem a utilizadores autenticados.
- `DERIVADO`: comentarios com links ficam em `pending_review` para reduzir spam basico.
- `DERIVADO`: comentarios rejeitados nao sao apagados automaticamente, para manter rastro minimo de moderacao.

### Tempo estimado

- Rever ratings e detalhe: 15 min.
- Backend de comentarios: 70 min.
- Frontend de comentarios: 50 min.
- Validacao e evidence: 30 min.

### Erros comuns

- Mostrar comentarios `pending_review` na pagina publica.
- Aceitar comentarios vazios.
- Permitir que um utilizador apague comentarios de outro.
- Guardar HTML vindo do utilizador.

### Check de compreensao

- [ ] Sei explicar a diferenca entre `visible`, `pending_review` e `rejected`.
- [ ] Sei porque o corpo e tratado como texto simples.
- [ ] Sei testar criacao sem login, texto demasiado longo e remocao sem ownership.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF3-01` concluido.
- Conteudos publicados existem na colecao `contents`.
- `req.user.id`, `requireAuth` e `requireRole` estao disponiveis.
- `apiClient` ja envia cookies de sessao.

### Contrato tecnico deste BK

| Area | Contrato |
| --- | --- |
| Colecao | `content_comments` |
| Estados | `visible`, `pending_review`, `rejected` |
| Tamanho | `3..280` caracteres |
| Listagem publica | `GET /api/comments/:contentId` |
| Criacao autenticada | `POST /api/comments/:contentId` |
| Remocao pelo autor | `DELETE /api/comments/:commentId` |
| Moderacao | `PATCH /api/comments/:commentId/moderation` |
| Frontend | `commentsApi`, `CommentsPanel` |
| Handoff | `BK-MF3-03` foca pesquisa sem depender de comentarios |

### Modelo `content_comments`

```js
{
  _id,
  userId,
  contentId,
  body,
  status,
  moderationReason,
  createdAt,
  updatedAt
}
```

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de comentarios

1. Objetivo do passo.

Normalizar texto, limitar tamanho e decidir o estado inicial de moderacao.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/comments/comments.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria a pasta `backend/src/modules/comments/` e adiciona a validacao.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";

export const COMMENT_STATUS = ["visible", "pending_review", "rejected"];

export function asObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    const error = new Error(`${label} invalido.`);
    error.statusCode = 400;
    throw error;
  }

  return new ObjectId(id);
}

export function assertCommentBody(value) {
  const body = String(value ?? "").replace(/\s+/g, " ").trim();

  if (body.length < 3 || body.length > 280) {
    const error = new Error("O comentario deve ter entre 3 e 280 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  return body;
}

export function initialModerationFor(body) {
  const lower = body.toLowerCase();
  const hasLink = lower.includes("http://") || lower.includes("https://") || lower.includes("www.");

  if (hasLink) {
    return {
      status: "pending_review",
      moderationReason: "Comentario com link aguarda revisao.",
    };
  }

  return {
    status: "visible",
    moderationReason: null,
  };
}

export function assertModerationStatus(value) {
  const status = String(value ?? "").trim();

  if (!COMMENT_STATUS.includes(status)) {
    const error = new Error("Estado de moderacao invalido.");
    error.statusCode = 400;
    throw error;
  }

  return status;
}
```

5. Explicacao do codigo ou da decisao.

O texto e guardado como texto simples. Links nao sao publicados de imediato porque sao um risco simples de spam e phishing.

6. Validacao do passo.

```bash
node -e "import('./src/modules/comments/comments.validation.js').then(({ assertCommentBody }) => console.log(assertCommentBody('Muito bom')))"
```

Resultado esperado: `Muito bom`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem normalizacao, um comentario so com espacos poderia ser aceite.

### Passo 2 - Criar service de comentarios

1. Objetivo do passo.

Gerir comentarios com conteudo publicado, ownership e moderacao minima.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/comments/comments.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo. Ele nunca devolve comentarios rejeitados na listagem publica.

4. Codigo completo.

```js
import { getDb } from "../../config/database.js";
import {
  asObjectId,
  assertCommentBody,
  assertModerationStatus,
  initialModerationFor,
} from "./comments.validation.js";

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

function publicComment(comment) {
  return {
    id: String(comment._id),
    contentId: String(comment.contentId),
    userId: String(comment.userId),
    body: comment.body,
    createdAt: comment.createdAt,
  };
}

export async function ensureCommentIndexes() {
  const db = await getDb();
  await db.collection("content_comments").createIndex({ contentId: 1, status: 1, createdAt: -1 });
  await db.collection("content_comments").createIndex({ userId: 1, createdAt: -1 });
}

export async function listVisibleComments(contentId) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");

  await assertPublishedContent(db, contentObjectId);

  const comments = await db.collection("content_comments")
    .find({ contentId: contentObjectId, status: "visible" })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return comments.map(publicComment);
}

export async function createComment(userId, contentId, input) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const userObjectId = asObjectId(userId, "Utilizador");
  const body = assertCommentBody(input.body);
  const moderation = initialModerationFor(body);
  const now = new Date();

  await assertPublishedContent(db, contentObjectId);

  const result = await db.collection("content_comments").insertOne({
    userId: userObjectId,
    contentId: contentObjectId,
    body,
    status: moderation.status,
    moderationReason: moderation.moderationReason,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: String(result.insertedId),
    status: moderation.status,
    moderationReason: moderation.moderationReason,
  };
}

export async function deleteOwnComment(userId, commentId) {
  const db = await getDb();
  const result = await db.collection("content_comments").deleteOne({
    _id: asObjectId(commentId, "Comentario"),
    userId: asObjectId(userId, "Utilizador"),
  });

  if (result.deletedCount === 0) {
    const error = new Error("Comentario nao encontrado para este utilizador.");
    error.statusCode = 404;
    throw error;
  }

  return { deleted: true };
}

export async function moderateComment(commentId, input) {
  const db = await getDb();
  const status = assertModerationStatus(input.status);
  const moderationReason = String(input.reason ?? "").trim() || null;

  const result = await db.collection("content_comments").findOneAndUpdate(
    { _id: asObjectId(commentId, "Comentario") },
    { $set: { status, moderationReason, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!result) {
    const error = new Error("Comentario nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: String(result._id),
    status: result.status,
    moderationReason: result.moderationReason,
  };
}
```

5. Explicacao do codigo ou da decisao.

`listVisibleComments` so apresenta `visible`. `deleteOwnComment` exige `userId`, impedindo que um utilizador remova comentarios de outro.

6. Validacao do passo.

```bash
node -e "import('./src/modules/comments/comments.service.js').then((m) => console.log(typeof m.createComment, typeof m.moderateComment))"
```

Resultado esperado: `function function`.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem filtro por `status`, comentarios em revisao poderiam aparecer no detalhe publico.

### Passo 3 - Criar controller e rotas

1. Objetivo do passo.

Expor os endpoints de comentarios com regras de autenticacao e roles.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/comments/comments.controller.js`
    - CRIAR: `backend/src/modules/comments/comments.routes.js`
    - LOCALIZACAO: ficheiros completos

3. Instrucoes concretas.

Cria controller e router. A rota de moderacao deve ficar protegida por role.

4. Codigo completo.

`backend/src/modules/comments/comments.controller.js`

```js
import {
  createComment,
  deleteOwnComment,
  listVisibleComments,
  moderateComment,
} from "./comments.service.js";

export async function getCommentsByContent(req, res) {
  res.status(200).json({ items: await listVisibleComments(req.params.contentId) });
}

export async function postCommentByContent(req, res) {
  res.status(201).json(await createComment(req.user.id, req.params.contentId, req.body));
}

export async function deleteComment(req, res) {
  res.status(200).json(await deleteOwnComment(req.user.id, req.params.commentId));
}

export async function patchCommentModeration(req, res) {
  res.status(200).json(await moderateComment(req.params.commentId, req.body));
}
```

`backend/src/modules/comments/comments.routes.js`

```js
import { Router } from "express";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  deleteComment,
  getCommentsByContent,
  patchCommentModeration,
  postCommentByContent,
} from "./comments.controller.js";

export const commentsRouter = Router();

commentsRouter.get("/:contentId", asyncHandler(getCommentsByContent));
commentsRouter.post("/:contentId", requireAuth, asyncHandler(postCommentByContent));
commentsRouter.delete("/:commentId", requireAuth, asyncHandler(deleteComment));
commentsRouter.patch(
  "/:commentId/moderation",
  requireAuth,
  requireRole(["admin", "moderator"]),
  asyncHandler(patchCommentModeration),
);
```

5. Explicacao do codigo ou da decisao.

Leitura publica e escrita autenticada ficam separadas. Moderacao usa role porque altera visibilidade de comentarios de outras pessoas.

6. Validacao do passo.

```bash
curl -i http://localhost:3000/api/comments/CONTENT_ID
```

Resultado esperado: `200` com `items` para conteudo publicado.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem `requireRole`, qualquer utilizador autenticado poderia rejeitar comentarios.

### Passo 4 - Montar router e indices

1. Objetivo do passo.

Ligar comentarios ao backend.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`
    - LOCALIZACAO: imports e montagem de rotas

3. Instrucoes concretas.

Monta o router e cria os indices.

4. Codigo completo.

Trecho esperado em `backend/src/app.js`:

```js
import { commentsRouter } from "./modules/comments/comments.routes.js";

app.use("/api/comments", commentsRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureCommentIndexes } from "./modules/comments/comments.service.js";

await ensureCommentIndexes();
```

5. Explicacao do codigo ou da decisao.

Comentarios ficam num modulo proprio, porque feedback textual nao deve ficar misturado com catalogo ou ratings.

6. Validacao do passo.

```bash
npm --prefix backend run dev
```

Resultado esperado: servidor arranca sem erro de import.

7. Caso negativo, erro comum ou risco que este passo evita.

Sem indices, a listagem de comentarios por conteudo pode ficar lenta com crescimento de dados.

### Passo 5 - Criar frontend de comentarios

1. Objetivo do passo.

Mostrar comentarios no detalhe e permitir criar comentario autenticado.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/commentsApi.js`
    - CRIAR: `frontend/src/components/comments/CommentsPanel.jsx`
    - EDITAR: `frontend/src/pages/ContentDetailPage.jsx`
    - LOCALIZACAO: novos ficheiros completos; inserir componente no detalhe

3. Instrucoes concretas.

Cria o cliente e componente. Depois adiciona `<CommentsPanel contentId={content.id} />` no detalhe, abaixo de `RatingBox`.

4. Codigo completo.

`frontend/src/services/api/commentsApi.js`

```js
import { apiClient } from "./apiClient.js";

export const commentsApi = {
  list(contentId) {
    return apiClient.get(`/api/comments/${encodeURIComponent(contentId)}`);
  },
  create(contentId, body) {
    return apiClient.post(`/api/comments/${encodeURIComponent(contentId)}`, { body });
  },
  remove(commentId) {
    return apiClient.del(`/api/comments/${encodeURIComponent(commentId)}`);
  },
};
```

`frontend/src/components/comments/CommentsPanel.jsx`

```jsx
import { useEffect, useState } from "react";
import { commentsApi } from "../../services/api/commentsApi.js";

export function CommentsPanel({ contentId }) {
  const [items, setItems] = useState([]);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");

    commentsApi.list(contentId)
      .then((response) => {
        if (!active) return;
        setItems(response.items);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setMessage("Nao foi possivel carregar comentarios.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [contentId]);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setStatus("saving");

    try {
      const response = await commentsApi.create(contentId, body);
      setBody("");
      setStatus("success");

      if (response.status === "visible") {
        const refreshed = await commentsApi.list(contentId);
        setItems(refreshed.items);
        setMessage("Comentario publicado.");
      } else {
        setMessage("Comentario recebido e em revisao.");
      }
    } catch {
      setStatus("error");
      setMessage("Confirma o texto e tenta novamente com sessao iniciada.");
    }
  }

  return (
    <section className="comments-panel" aria-label="Comentarios">
      <h2>Comentarios</h2>

      <form onSubmit={submit}>
        <label htmlFor="comment-body">Comentario curto</label>
        <textarea
          id="comment-body"
          minLength={3}
          maxLength={280}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <button type="submit" disabled={status === "saving" || body.trim().length < 3}>
          Publicar
        </button>
      </form>

      {message && <p role={status === "error" ? "alert" : "status"}>{message}</p>}
      {status === "loading" && <p>A carregar comentarios...</p>}
      {items.length === 0 && status === "success" && <p>Ainda nao existem comentarios visiveis.</p>}

      <ul>
        {items.map((comment) => (
          <li key={comment.id}>
            <p>{comment.body}</p>
            <small>{new Date(comment.createdAt).toLocaleDateString("pt-PT")}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

5. Explicacao do codigo ou da decisao.

O frontend limita tamanho para boa experiencia, mas a protecao real fica no backend. Comentarios em revisao mostram mensagem de sucesso sem aparecerem na lista publica.

6. Validacao do passo.

```bash
npm --prefix frontend run build
```

Resultado esperado: build sem erros.

7. Caso negativo, erro comum ou risco que este passo evita.

Confiar apenas em `maxLength` do browser nao chega, porque qualquer pessoa pode chamar a API fora da UI.

## Criterios de aceite (mensuraveis)

- `GET /api/comments/:contentId` devolve apenas comentarios `visible`.
- `POST /api/comments/:contentId` sem sessao devolve `401`.
- Comentario com menos de 3 ou mais de 280 caracteres devolve `400`.
- Comentario com link fica em `pending_review`.
- `DELETE /api/comments/:commentId` so remove comentario do proprio utilizador.
- `PATCH /api/comments/:commentId/moderation` exige role `admin` ou `moderator`.

## Validacao final

```bash
npm --prefix backend test
npm --prefix frontend run build
curl -i http://localhost:3000/api/comments/CONTENT_ID
```

Resultado esperado: testes e build passam; listagem publica devolve `items`.

## Evidence para PR/defesa

- `pr`: referencia do PR/commit com modulo `comments`.
- `proof`: captura do detalhe com comentario visivel.
- `proof`: resposta `201` ao criar comentario autenticado.
- `neg`: `401` sem sessao, `400` por texto invalido, `403` ao moderar sem role.

## Handoff

O `BK-MF3-03` pode avancar para pesquisa unificada sem depender dos comentarios. O detalhe fica enriquecido com ratings e comentarios, mas a pesquisa deve continuar baseada no catalogo publicado e nas taxonomias.

## Snippet tecnico aplicavel

O codigo aplicavel esta nos passos 1 a 5. O ponto central deste BK e:

```js
commentsRouter.patch(
  "/:commentId/moderation",
  requireAuth,
  requireRole(["admin", "moderator"]),
  asyncHandler(patchCommentModeration),
);
```

Este trecho separa utilizadores comuns de moderadores.

## Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3.
- `2026-06-07`: guia reescrito com contratos, moderacao minima, backend, frontend, validacao e evidence.
