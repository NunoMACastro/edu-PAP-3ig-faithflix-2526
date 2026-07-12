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
- `last_updated`: `2026-07-10`

#### Objetivo

Neste BK vais implementar comentarios curtos em conteudos publicados (`RF20`), com validacao de tamanho, ownership e moderacao minima.

No fim, deves conseguir explicar porque comentarios precisam de validacao no backend, porque apenas comentarios visiveis aparecem ao publico e porque um utilizador so pode apagar os seus proprios comentarios, salvo permissao de moderacao.

#### Importância

Comentarios curtos criam uma camada simples de comunidade sem transformar a PAP num produto social complexo. A funcionalidade complementa ratings e prepara a descoberta, porque utilizadores passam a ter mais sinais de relevancia no detalhe de conteudo.

#### Scope-in

- Criar colecao `content_comments`.
- Criar validacao de corpo curto.
- Criar listagem publica de comentarios visiveis.
- Criar criacao autenticada de comentario.
- Criar remocao pelo autor.
- Criar endpoint de moderacao para `admin` e `moderator`.
- Criar cliente frontend `commentsApi`.
- Criar componente `CommentsPanel`.

#### Scope-out

- Respostas encadeadas.
- Likes em comentarios.
- Denuncias com workflow completo.
- Notificacoes.
- Analise automatica avancada de linguagem.

#### Estado antes e depois

- Estado antes: aplicam-se os BKs declarados em `dependencias`, os RF/RNF do Header e os artefactos já entregues pelas fases anteriores.
- Estado depois: ficam implementáveis e verificáveis apenas os resultados listados em `Scope-in`, sem antecipar o `Scope-out`.

#### Pré-requisitos

- `BK-MF3-01` concluido.
- Conteudos publicados existem na colecao `contents`.
- `req.user.id`, `requireAuth` e `requireRole` estao disponiveis.
- `runInTransaction` está disponível numa topologia MongoDB com transações e
  `writeAdminAudit` recusa chamadas fora da callback transacional ativa.
- `apiClient` ja envia cookies de sessao.

#### Glossário

- `Comentario curto`: texto breve associado a um conteudo.
- `Moderacao minima`: regras simples para impedir conteudo claramente invalido ou spam basico.
- `visible`: comentario publico.
- `pending_review`: comentario guardado, mas ainda nao apresentado ao publico.
- `rejected`: comentario rejeitado por moderacao.

#### Conceitos teóricos essenciais

- `CANONICO`: `RF20` define comentarios curtos como parte de classificacoes e feedback.
- `CANONICO`: comentarios pertencem a utilizadores autenticados.
- `DERIVADO`: comentarios com links ficam em `pending_review` para reduzir spam basico.
- `DERIVADO`: comentarios rejeitados nao sao apagados automaticamente, para manter rastro minimo de moderacao.
- `DERIVADO`: a listagem pública devolve no máximo os 50 comentários `visible`
  mais recentes e nunca inclui `userId`; esta baseline não promete paginação.
- `DERIVADO`: `status` é a enum fechada
  `visible|pending_review|rejected`, e o motivo opcional não pode exceder 500
  caracteres.
- `DERIVADO`: mudar de conteúdo ou sessão aborta pedidos pendentes; uma versão
  de contexto recusa respostas tardias e as escritas são serializadas, com busy
  state localizado e reload autoritativo.
- `DERIVADO`: moderação e remoção de terceiros juntam domínio e audit na mesma
  transação/sessão. A remoção pelo próprio autor não cria audit administrativo.

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

#### Arquitetura do BK

| Area | Contrato |
| --- | --- |
| Colecao | `content_comments` |
| Estados | `visible`, `pending_review`, `rejected` |
| Tamanho | `3..280` caracteres |
| Listagem publica | `GET /api/comments/:contentId` |
| Criacao autenticada | `POST /api/comments/:contentId` |
| Remoção autorizada | `DELETE /api/comments/:commentId` pelo autor, `admin` ou `moderator` |
| Moderacao | `PATCH /api/comments/:commentId/moderation` |
| Limite público atual | até 50 comentários `visible`; sem paginação nesta baseline |
| DTO público | sem `userId`; inclui `canDelete` calculado pelo backend |
| Motivo de moderação | texto opcional até 500 caracteres |
| Operações privilegiadas | domínio + audit na mesma transação/sessão; ator e `requestId` obrigatórios |
| Snapshot de audit | apenas estado anterior/seguinte; sem corpo, motivo livre ou PII |
| Robustez frontend | abort/anti-stale, fila serial, busy state por formulário/linha e reload |
| Frontend | `commentsApi`, `CommentsPanel` |
| Handoff | `BK-MF3-03` foca pesquisa sem depender de comentarios |

### Modelo `content_comments`

```js
// O estado e o motivo registam a decisão de moderação sem apagar o comentário original.
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

#### Ficheiros a criar/editar/rever

- CRIAR: `backend/src/modules/comments/comments.validation.js`
- CRIAR: `backend/src/modules/comments/comments.service.js`
- CRIAR: `backend/src/modules/comments/comments.controller.js`
- CRIAR: `backend/src/modules/comments/comments.routes.js`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- CRIAR: `frontend/src/services/api/commentsApi.js`
- CRIAR: `frontend/src/components/comments/CommentsPanel.jsx`
- EDITAR: `frontend/src/pages/ContentDetailPage.jsx`

#### Tutorial técnico linear

### Passo 1 - Criar validacao de comentarios

1. Objetivo do passo.

Normalizar texto, limitar tamanho e decidir o estado inicial de moderacao.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/comments/comments.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria a pasta `backend/src/modules/comments/` e adiciona a validacao.

4. Codigo completo da validacao deste passo.

```js
import { ObjectId } from "mongodb";
import { HttpError } from "../../utils/http-error.js";

export const COMMENT_STATUS = ["visible", "pending_review", "rejected"];

export function asObjectId(id, label) {
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
    throw new HttpError(400, `${label} invalido.`);
  }

  return ObjectId.createFromHexString(id);
}

export function assertCommentBody(value) {
  if (typeof value !== "string") {
    throw new HttpError(400, "O comentario deve ser texto.");
  }

  // Normaliza espaços antes de aplicar o limite para evitar contagens inconsistentes.
  const body = value.replace(/\s+/g, " ").trim();

  if (body.length < 3 || body.length > 280) {
    throw new HttpError(400, "O comentario deve ter entre 3 e 280 caracteres.");
  }

  return body;
}

export function initialModerationFor(body) {
  const lower = body.toLowerCase();
  const hasLink = lower.includes("http://") || lower.includes("https://") || lower.includes("www.");

  // Links seguem para revisão humana; esta regra simples não tenta decidir se são seguros.
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
  if (typeof value !== "string" || !COMMENT_STATUS.includes(value)) {
    throw new HttpError(400, "Estado de moderacao invalido.");
  }

  return value;
}

export function assertModerationReason(value) {
  if (value !== undefined && value !== null && typeof value !== "string") {
    throw new HttpError(400, "Motivo de moderacao invalido.");
  }

  const reason = typeof value === "string" ? value.trim() : "";

  if (reason.length > 500) {
    throw new HttpError(
      400,
      "O motivo de moderacao nao pode exceder 500 caracteres.",
    );
  }

  return reason || null;
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

4. Codigo canonico aplicavel ao estado final deste BK.

```js
import { getDb, runInTransaction } from "../../config/database.js";
import { HttpError } from "../../utils/http-error.js";
import { writeAdminAudit } from "../audit/audit.service.js";
import {
  asObjectId,
  assertCommentBody,
  assertModerationReason,
  assertModerationStatus,
  initialModerationFor,
} from "./comments.validation.js";

async function assertPublishedContent(db, contentId) {
  const content = await db.collection("contents").findOne({
    _id: contentId,
    status: "published",
  });

  if (!content) {
    throw new HttpError(404, "Conteudo nao encontrado.");
  }

  return content;
}

function canDeleteComment(comment, viewer) {
  if (!viewer) return false;

  const viewerId = asObjectId(viewer.id, "Utilizador");
  return comment.userId.equals(viewerId)
    || ["admin", "moderator"].includes(viewer.role);
}

function publicComment(comment, viewer = null) {
  // A allowlist pública nunca copia motivos de moderação nem campos internos.
  return {
    id: comment._id.toHexString(),
    contentId: comment.contentId.toHexString(),
    body: comment.body,
    status: comment.status,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    canDelete: canDeleteComment(comment, viewer),
  };
}

export async function ensureCommentIndexes() {
  const db = await getDb();
  await db.collection("content_comments").createIndex({ contentId: 1, status: 1, createdAt: -1 });
  await db.collection("content_comments").createIndex({ userId: 1, createdAt: -1 });
}

export async function listVisibleComments(contentId, viewer = null) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");

  await assertPublishedContent(db, contentObjectId);

  const comments = await db.collection("content_comments")
    .find({ contentId: contentObjectId, status: "visible" })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return comments.map((comment) => publicComment(comment, viewer));
}

export async function createComment(user, contentId, bodyValue) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const userObjectId = asObjectId(user.id, "Utilizador");
  const body = assertCommentBody(bodyValue);
  const moderation = initialModerationFor(body);
  const now = new Date();

  await assertPublishedContent(db, contentObjectId);

  const document = {
    userId: userObjectId,
    contentId: contentObjectId,
    body,
    status: moderation.status,
    moderationReason: moderation.moderationReason,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection("content_comments").insertOne(document);

  return publicComment({ ...document, _id: result.insertedId }, user);
}

/**
 * Separa a remoção normal pelo autor da remoção administrativa auditada.
 */
export async function deleteComment(userId, role, commentId, context = {}) {
  const actorObjectId = asObjectId(userId, "Utilizador");
  const commentObjectId = asObjectId(commentId, "Comentario");
  const canModerate = ["admin", "moderator"].includes(role);
  const db = await getDb();
  const ownedDeletion = await db.collection("content_comments").deleteOne({
    _id: commentObjectId,
    userId: actorObjectId,
  });

  if (ownedDeletion.deletedCount === 1) {
    return { id: commentId, deleted: true };
  }

  if (canModerate) {
    return runInTransaction(async ({ db, session }) => {
      const comments = db.collection("content_comments");
      const comment = await comments.findOne(
        { _id: commentObjectId },
        { session },
      );

      if (!comment) {
        throw new HttpError(404, "Comentario nao encontrado.");
      }

      const deletion = await comments.deleteOne(
        { _id: commentObjectId },
        { session },
      );

      if (deletion.deletedCount !== 1) {
        throw new HttpError(409, "O comentario foi alterado em concorrencia.");
      }

      await writeAdminAudit({
        db,
        session,
        actorUserId: userId,
        action: "comment.privileged_delete",
        targetType: "comment",
        targetId: commentObjectId,
        before: { status: comment.status },
        after: null,
        requestId: context.requestId,
      });

      return { id: commentId, deleted: true };
    });
  }

  const exists = await db.collection("content_comments").findOne(
    { _id: commentObjectId },
    { projection: { _id: 1 } },
  );
  if (!exists) throw new HttpError(404, "Comentario nao encontrado.");
  throw new HttpError(403, "Permissao insuficiente.");
}

/**
 * Modera e audita na mesma transação, sem guardar corpo, motivo ou PII no audit.
 */
export async function moderateComment(
  actorUserId,
  commentId,
  statusValue,
  reasonValue,
  context = {},
) {
  const actorObjectId = asObjectId(actorUserId, "Moderador");
  const commentObjectId = asObjectId(commentId, "Comentario");
  const status = assertModerationStatus(statusValue);
  const moderationReason = assertModerationReason(reasonValue);

  return runInTransaction(async ({ db, session }) => {
    const updatedAt = new Date();
    const before = await db.collection("content_comments").findOneAndUpdate(
      { _id: commentObjectId },
      { $set: { status, moderationReason, updatedAt } },
      { returnDocument: "before", session },
    );

    if (!before) {
      throw new HttpError(404, "Comentario nao encontrado.");
    }

    const updated = { ...before, status, moderationReason, updatedAt };
    await writeAdminAudit({
      db,
      session,
      actorUserId: actorObjectId,
      action: "comment.moderated",
      targetType: "comment",
      targetId: commentObjectId,
      before: { status: before.status },
      after: { status },
      requestId: context.requestId,
    });

    return publicComment(updated);
  });
}
```

5. Explicacao do codigo ou da decisao.

`listVisibleComments` só apresenta `visible`. `publicComment` constrói uma
allowlist e nunca revela `moderationReason`, `userId`, identidade do moderador,
audit metadata ou qualquer outro campo interno, inclusive nas respostas de
criação e moderação.
`deleteComment` mantém o fluxo normal do autor separado do fluxo privilegiado:
apenas o segundo abre transação e escreve `comment.privileged_delete`. A
moderação escreve `comment.moderated`; em ambos, uma falha de audit reverte a
mutação e o snapshot contém apenas o estado anterior/seguinte.

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

4. Codigo canonico dos controllers e das rotas.

`backend/src/modules/comments/comments.controller.js`

```js
import {
  createComment,
  deleteComment,
  listVisibleComments,
  moderateComment,
} from "./comments.service.js";

export async function getCommentsByContent(req, res) {
  res.status(200).json({
    items: await listVisibleComments(req.params.contentId, req.user),
  });
}

export async function postCommentByContent(req, res) {
  // O serviço recebe o utilizador autenticado para associar autoria e permissões.
  res.status(201).json({
    comment: await createComment(
      req.user,
      req.params.contentId,
      req.body?.body,
    ),
  });
}

export async function deleteCommentController(req, res) {
  res.status(200).json({
    comment: await deleteComment(
      req.user.id,
      req.user.role,
      req.params.commentId,
      { requestId: req.id },
    ),
  });
}

export async function patchCommentModeration(req, res) {
  // O requestId permite correlacionar a decisão privilegiada com o respetivo audit log.
  res.status(200).json({
    comment: await moderateComment(
      req.user.id,
      req.params.commentId,
      req.body?.status,
      req.body?.moderationReason,
      { requestId: req.id },
    ),
  });
}
```

`backend/src/modules/comments/comments.routes.js`

```js
import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  deleteCommentController,
  getCommentsByContent,
  patchCommentModeration,
  postCommentByContent,
} from "./comments.controller.js";

export const commentsRouter = Router();

// Criar/remover exige sessão; moderar exige ainda um papel privilegiado.
commentsRouter.get("/:contentId", asyncHandler(getCommentsByContent));
commentsRouter.post("/:contentId", requireAuth, asyncHandler(postCommentByContent));
commentsRouter.delete("/:commentId", requireAuth, asyncHandler(deleteCommentController));
commentsRouter.patch(
  "/:commentId/moderation",
  requireRole(["admin", "moderator"]),
  asyncHandler(patchCommentModeration),
);
```

5. Explicacao do codigo ou da decisao.

Leitura pública e escrita autenticada ficam separadas. O controller entrega
ator, role e `req.id` ao service; nunca inventa identidade administrativa. A
rota de moderação usa `requireRole`, que já inclui a exigência de autenticação
do middleware deste projeto. Se a implementação local separar essas duas
responsabilidades, mantém também `requireAuth` antes de `requireRole`.

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
  list(contentId, options = {}) {
    // Todos os IDs são codificados para não poderem introduzir novos segmentos no URL.
    return apiClient.get(`/api/comments/${encodeURIComponent(contentId)}`, options);
  },
  create(contentId, body, options = {}) {
    return apiClient.post(`/api/comments/${encodeURIComponent(contentId)}`, { body }, options);
  },
  remove(commentId, options = {}) {
    return apiClient.del(`/api/comments/${encodeURIComponent(commentId)}`, options);
  },
  moderate(commentId, input, options = {}) {
    // A mutação reutiliza o cliente autenticado, incluindo CSRF e envelope de erro seguro.
    return apiClient.patch(
      `/api/comments/${encodeURIComponent(commentId)}/moderation`,
      input,
      options,
    );
  },
};
```

`frontend/src/components/comments/CommentsPanel.jsx`

```jsx
import { useEffect, useRef, useState } from "react";
import { useSession } from "../../context/SessionContext.jsx";
import { commentsApi } from "../../services/api/commentsApi.js";

export function CommentsPanel({ contentId }) {
  const { status: sessionStatus, user } = useSession();
  const [items, setItems] = useState([]);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(null);
  const contextVersionRef = useRef(0);
  const mutationControllerRef = useRef(null);
  const queueRef = useRef(Promise.resolve());
  // A versão invalida respostas do conteúdo ou da sessão anteriores.
  const sessionKey = `${sessionStatus}:${user?.id ?? ""}`;

  async function loadItems(version, signal) {
    const response = await commentsApi.list(contentId, { signal });
    if (signal.aborted || version !== contextVersionRef.current) return false;
    setItems(response.items);
    return true;
  }

  function enqueue(task) {
    // A fila serializa criações e remoções para preservar a ordem observada pelo utilizador.
    const next = queueRef.current.then(task, task);
    queueRef.current = next.catch(() => undefined);
    return next;
  }

  useEffect(() => {
    const version = ++contextVersionRef.current;
    const controller = new AbortController();
    mutationControllerRef.current?.abort();
    mutationControllerRef.current = null;
    queueRef.current = Promise.resolve();
    setBusy(null);
    setMessage("");
    setStatus("loading");

    loadItems(version, controller.signal)
      .then((applied) => {
        if (!applied) return;
        setStatus("success");
      })
      .catch((requestError) => {
        if (controller.signal.aborted || requestError?.name === "AbortError") return;
        if (version !== contextVersionRef.current) return;
        setMessage("Nao foi possivel carregar comentarios.");
        setStatus("error");
      });

    return () => controller.abort();
  }, [contentId, sessionKey]);

  function submit(event) {
    event.preventDefault();
    const submittedBody = body;
    const version = contextVersionRef.current;

    void enqueue(async () => {
      if (version !== contextVersionRef.current) return;
      const controller = new AbortController();
      mutationControllerRef.current = controller;
      setBusy({ kind: "create", id: "form" });
      setMessage("");

      try {
        const response = await commentsApi.create(contentId, submittedBody, {
          signal: controller.signal,
        });
        const applied = await loadItems(version, controller.signal);
        if (!applied) return;
        setBody("");
        setStatus("success");
        setMessage(
          response.comment.status === "visible"
            ? "Comentario publicado."
            : "Comentario recebido e em revisao.",
        );
      } catch (requestError) {
        if (controller.signal.aborted || requestError?.name === "AbortError") return;
        if (version !== contextVersionRef.current) return;
        setStatus("error");
        setMessage("Confirma o texto e tenta novamente com sessao iniciada.");
      } finally {
        if (version === contextVersionRef.current) setBusy(null);
        if (mutationControllerRef.current === controller) mutationControllerRef.current = null;
      }
    });
  }

  function remove(commentId) {
    const version = contextVersionRef.current;

    void enqueue(async () => {
      if (version !== contextVersionRef.current) return;
      const controller = new AbortController();
      mutationControllerRef.current = controller;
      setBusy({ kind: "remove", id: commentId });
      setMessage("");

      try {
        await commentsApi.remove(commentId, { signal: controller.signal });
        const applied = await loadItems(version, controller.signal);
        if (!applied) return;
        setStatus("success");
        setMessage("Comentario removido.");
      } catch (requestError) {
        if (controller.signal.aborted || requestError?.name === "AbortError") return;
        if (version !== contextVersionRef.current) return;
        setStatus("error");
        setMessage("Nao foi possivel remover o comentario.");
      } finally {
        if (version === contextVersionRef.current) setBusy(null);
        if (mutationControllerRef.current === controller) mutationControllerRef.current = null;
      }
    });
  }

  return (
    <section className="comments-panel" aria-label="Comentarios">
      <h2>Comentarios</h2>

      <form onSubmit={submit} aria-busy={busy?.id === "form"}>
        <label htmlFor="comment-body">Comentario curto</label>
        <textarea
          id="comment-body"
          minLength={3}
          maxLength={280}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <button
          type="submit"
          disabled={busy !== null || sessionStatus !== "authenticated" || body.trim().length < 3}
        >
          {busy?.id === "form" ? "A publicar..." : "Publicar"}
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
            {comment.canDelete && (
              <button
                type="button"
                aria-busy={busy?.id === comment.id}
                disabled={busy !== null}
                onClick={() => remove(comment.id)}
              >
                {busy?.id === comment.id ? "A remover..." : "Remover"}
              </button>
            )}
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

#### Critérios de aceite

- `GET /api/comments/:contentId` devolve apenas comentarios `visible`.
- `POST /api/comments/:contentId` sem sessao devolve `401`.
- Comentario com menos de 3 ou mais de 280 caracteres devolve `400`.
- Comentario com link fica em `pending_review`.
- `DELETE /api/comments/:commentId` só remove quando `canDelete` seria verdadeiro: autor, `admin` ou `moderator`.
- `PATCH /api/comments/:commentId/moderation` exige role `admin` ou `moderator`.
- Moderação e remoção privilegiada fazem rollback integral quando a escrita do
  audit falha; o evento usa o mesmo `session`, ator autenticado e `requestId`.
- Remoção pelo autor não cria audit administrativo; um utilizador comum nunca
  consegue remover um comentário de outra pessoa.
- O snapshot administrativo nunca inclui corpo, motivo de moderação ou PII.
- Qualquer resposta construída por `publicComment` nunca expõe
  `moderationReason`, `userId`, campos de auditoria ou outros internos; a
  listagem limita-se a 50 itens visíveis.
- Motivo de moderação acima de 500 caracteres devolve `400`.
- Trocar de conteúdo/sessão aborta pedidos anteriores; duas remoções são serializadas e mantêm busy state por linha.

#### Validação final

```bash
npm --prefix backend test
npm --prefix frontend run build
curl -i http://localhost:3000/api/comments/CONTENT_ID
```

Resultado esperado: testes e build passam; listagem publica devolve `items`.

#### Evidence para PR/defesa

- `pr`: referencia do PR/commit com modulo `comments`.
- `proof`: captura do detalhe com comentario visivel.
- `proof`: resposta `201` ao criar comentario autenticado.
- `proof`: DTO público sem `userId` e teste de cancelamento/anti-stale, fila serial e busy state localizado.
- `neg`: `401` sem sessao, `400` por texto invalido, `403` ao moderar sem role.
- `neg`: motivo com mais de 500 caracteres e resposta tardia do conteúdo anterior ignorada.
- `neg`: fault injection no audit deixa comentário/estado inalterado; chamada
  privilegiada sem role devolve `403` e não cria domínio nem audit.

#### Handoff

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

#### Changelog

- `2026-04-13`: retrofit para contrato pedagogico v3.
- `2026-06-07`: guia reescrito com contratos, moderacao minima, backend, frontend, validacao e evidence.
- `2026-07-10`: contrato canónico atualizado com inputs estritos, DTO sem `userId`, motivo até 500, cancelamento/anti-stale, fila serial, busy state localizado e limite público de 50 sem alegar paginação.
- `2026-07-10`: remoção do autor separada da remoção privilegiada; moderação e ação administrativa usam transação, sessão, ator, `requestId`, rollback e snapshot mínimo de audit.
