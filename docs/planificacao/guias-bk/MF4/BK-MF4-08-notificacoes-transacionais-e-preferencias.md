# BK-MF4-08 - Notificacoes transacionais e preferencias

## Header

- `doc_id`: `GUIA-BK-MF4-08`
- `bk_id`: `BK-MF4-08`
- `macro`: `MF4`
- `owner`: `Mateus`
- `apoio`: `Davi`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF4-01`
- `rf_rnf`: `RF52, RF53, RF54`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-03`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-08-notificacoes-transacionais-e-preferencias.md`
- `last_updated`: `2026-06-13`

## Bloco pedagogico (obrigatorio)

Neste BK vais criar notificacoes internas para eventos de subscricao, trial e continuidade, com preferencias por utilizador. O MVP guarda notificacoes na base de dados e mostra-as no frontend; envio real de email fica fora deste BK.

### Objetivo pedagogico

- Criar notificacoes transacionais auditaveis.
- Permitir que o utilizador configure preferencias.
- Evitar envio de notificacoes sensiveis para canais desligados.
- Preparar operacao futura sem depender de fornecedor externo.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se a equipa quiser email real, registar como evolucao posterior e manter este BK interno.

### Conceitos essenciais

- Notificacao transacional nasce de um evento do sistema: pagamento aprovado, pagamento falhado, trial iniciado ou alerta de continuidade.
- Preferencia controla canais; no MVP o canal real e `in_app`.
- `CANONICO`: RF52 exige notificacoes transacionais; RF53 preferencias; RF54 alertas de continuidade.
- `DERIVADO`: `email` pode ficar como preferencia futura, mas nao ha envio externo neste BK.

### Erros comuns

- Prometer email real sem fornecedor configurado.
- Guardar tokens ou dados de pagamento dentro da notificacao.
- Ignorar preferencias do utilizador.
- Criar notificacoes sem ownership.

### Check de compreensao

- [ ] Sei explicar o que torna uma notificacao transacional.
- [ ] Sei provar que cada notificacao pertence a um utilizador.
- [ ] Sei alterar preferencias e ver o efeito em novas notificacoes.

## Bloco operacional (obrigatorio)

### Pre-condicoes

- `BK-MF4-01` executado com subscricoes.
- `BK-MF4-02` executado com checkout simulado, trial e `grantTrialSubscription`.
- `BK-MF2-05` executado com `savePlaybackProgress`.
- `BK-MF2-01` executado com `req.user`.
- `apiClient` disponivel.

### Guia de execucao (passo-a-passo)

### Passo 1 - Criar validacao de preferencias e tipos

1. Objetivo do passo.

Definir tipos de notificacao e canais aceites.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/notifications/notifications.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o modulo `notifications`.

4. Codigo completo.

```js
/**
 * Tipos de notificacao gerados pelo backend.
 * A lista fechada evita grafias diferentes para o mesmo evento de negocio.
 */
export const NOTIFICATION_TYPES = [
  "subscription_activated",
  "payment_failed",
  "trial_started",
  "continue_watching",
];

/**
 * Cria um erro HTTP previsivel para validacao de notificacoes.
 *
 * @param {string} message Mensagem segura para o cliente.
 * @param {number} [statusCode=400] Codigo HTTP de validacao.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Garante que o tipo recebido pertence ao contrato publico do modulo.
 *
 * @param {string} type Tipo recebido no evento.
 * @returns {string} Tipo normalizado.
 * @throws {Error} Quando o tipo nao existe na lista fechada.
 */
export function assertNotificationType(type) {
  const value = String(type ?? "").trim();
  if (!NOTIFICATION_TYPES.includes(value)) {
    throw httpError("Tipo de notificacao invalido.");
  }
  return value;
}

/**
 * Valida texto obrigatorio usado em titulo e mensagem.
 *
 * @param {string} value Valor recebido.
 * @param {string} field Nome do campo para mensagem de erro.
 * @param {number} min Tamanho minimo.
 * @param {number} max Tamanho maximo.
 * @returns {string} Texto normalizado.
 */
function requiredNotificationText(value, field, min, max) {
  const text = String(value ?? "").trim();
  if (text.length < min || text.length > max) {
    throw httpError(`${field} deve ter entre ${min} e ${max} caracteres.`);
  }
  return text;
}

/**
 * Valida o conteudo visivel de uma notificacao.
 *
 * @param {object} input Dados recebidos pelo service.
 * @returns {{ title: string, message: string }} Conteudo seguro para persistir.
 */
export function assertNotificationContent(input) {
  return {
    title: requiredNotificationText(input.title, "Titulo", 3, 120),
    message: requiredNotificationText(input.message, "Mensagem", 3, 240),
  };
}

/**
 * Normaliza preferencias de notificacao guardadas por utilizador.
 *
 * @param {object} input Preferencias recebidas da UI.
 * @returns {{ inApp: boolean, email: boolean, continueWatching: boolean }} Preferencias persistiveis.
 */
export function assertPreferencePayload(input) {
  return {
    inApp: Boolean(input.inApp ?? true),
    email: Boolean(input.email ?? false),
    continueWatching: Boolean(input.continueWatching ?? true),
  };
}
```

5. Explicacao do codigo ou da decisao.

Tipos fechados evitam nomes diferentes para o mesmo evento. A validacao de titulo e mensagem impede notificacoes vazias, demasiado longas ou pouco claras. `email` fica como preferencia guardada, mas sem envio real.

6. Validacao do passo.

```bash
node -e "import('./src/modules/notifications/notifications.validation.js').then(({ assertNotificationType }) => console.log(assertNotificationType('trial_started')))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem tipos fechados, um evento podia ficar como `trial`, outro como `trialStart` e outro como `trial_started`.

### Passo 2 - Criar service de notificacoes

1. Objetivo do passo.

Guardar preferencias, criar notificacoes e listar notificacoes do utilizador autenticado.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/notifications/notifications.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo.

4. Codigo completo.

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import {
  assertNotificationContent,
  assertNotificationType,
  assertPreferencePayload,
} from "./notifications.validation.js";

/**
 * Converte o utilizador autenticado para `ObjectId`.
 *
 * @param {string} userId Identificador vindo da sessao.
 * @returns {ObjectId} Identificador MongoDB.
 * @throws {Error} Quando o identificador e invalido.
 */
function asUserObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    const error = new Error("Utilizador invalido.");
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(userId);
}

/**
 * Converte o identificador da notificacao para `ObjectId`.
 *
 * @param {string} notificationId Identificador recebido na rota.
 * @returns {ObjectId} Identificador MongoDB.
 * @throws {Error} Quando o identificador e invalido.
 */
function asNotificationObjectId(notificationId) {
  if (!ObjectId.isValid(notificationId)) {
    const error = new Error("Notificacao invalida.");
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(notificationId);
}

/**
 * Remove campos internos antes de devolver uma notificacao ao frontend.
 *
 * @param {object} notification Documento MongoDB.
 * @returns {object} Notificacao publica.
 */
function publicNotification(notification) {
  return {
    id: String(notification._id),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    readAt: notification.readAt ?? null,
    createdAt: notification.createdAt,
  };
}

/**
 * Cria indices para preferencias, listagem e deduplicacao de eventos.
 *
 * @returns {Promise<void>}
 */
export async function ensureNotificationIndexes() {
  const db = await getDb();
  await db.collection("notification_preferences").createIndex({ userId: 1 }, { unique: true });
  await db.collection("notifications").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("notifications").createIndex(
    { userId: 1, type: 1, dedupeKey: 1 },
    { unique: true, partialFilterExpression: { dedupeKey: { $exists: true } } },
  );
}

/**
 * Obtem preferencias do utilizador autenticado com valores por defeito.
 *
 * @param {string} userId Identificador do utilizador.
 * @returns {Promise<{ preferences: object }>} Preferencias atuais.
 */
export async function getPreferences(userId) {
  const db = await getDb();
  const userObjectId = asUserObjectId(userId);
  const preferences = await db.collection("notification_preferences").findOne({ userId: userObjectId });
  return {
    preferences: preferences?.settings ?? { inApp: true, email: false, continueWatching: true },
  };
}

/**
 * Atualiza preferencias de notificacao do utilizador autenticado.
 *
 * @param {string} userId Identificador do utilizador.
 * @param {object} input Preferencias recebidas da UI.
 * @returns {Promise<{ preferences: object }>} Preferencias guardadas.
 */
export async function updatePreferences(userId, input) {
  const db = await getDb();
  const userObjectId = asUserObjectId(userId);
  const settings = assertPreferencePayload(input);
  // `upsert` cria preferencias na primeira visita sem exigir passo de inicializacao.
  await db.collection("notification_preferences").updateOne(
    { userId: userObjectId },
    { $set: { settings, updatedAt: new Date() }, $setOnInsert: { userId: userObjectId, createdAt: new Date() } },
    { upsert: true },
  );
  return { preferences: settings };
}

/**
 * Cria uma notificacao interna respeitando preferencias e deduplicacao.
 *
 * @param {string} userId Identificador do utilizador destinatario.
 * @param {object} input Evento e conteudo da notificacao.
 * @returns {Promise<{ notification: object | null, skipped: boolean }>} Notificacao criada ou motivo de omissao.
 */
export async function createNotification(userId, input) {
  const db = await getDb();
  const userObjectId = asUserObjectId(userId);
  const { preferences } = await getPreferences(userId);

  // Se o utilizador desligou notificacoes internas, o evento fica sem entrega in-app.
  if (!preferences.inApp) {
    return { notification: null, skipped: true };
  }

  const type = assertNotificationType(input.type);
  // A preferencia granular so bloqueia alertas de continuidade, nao eventos transacionais.
  if (type === "continue_watching" && !preferences.continueWatching) {
    return { notification: null, skipped: true };
  }

  const content = assertNotificationContent(input);
  const dedupeKey = input.dedupeKey ? String(input.dedupeKey).trim() : null;

  if (dedupeKey) {
    // A deduplicacao evita repetir alertas para o mesmo conteudo ou evento.
    const existing = await db.collection("notifications").findOne({
      userId: userObjectId,
      type,
      dedupeKey,
    });

    if (existing) {
      return { notification: publicNotification(existing), skipped: true };
    }
  }

  const notification = {
    userId: userObjectId,
    type,
    title: content.title,
    message: content.message,
    ...(dedupeKey ? { dedupeKey } : {}),
    readAt: null,
    createdAt: new Date(),
  };

  const result = await db.collection("notifications").insertOne(notification);
  return { notification: publicNotification({ ...notification, _id: result.insertedId }), skipped: false };
}

/**
 * Cria alerta para conteudo iniciado e ainda nao terminado.
 *
 * @param {string} userId Identificador do utilizador.
 * @param {object} input Dados minimos do conteudo.
 * @returns {Promise<{ notification: object | null, skipped: boolean }>} Resultado da criacao.
 */
export async function createContinueWatchingNotification(userId, input) {
  const contentId = String(input.contentId ?? "").trim();
  const contentTitle = String(input.contentTitle ?? "um conteudo").trim();

  if (!contentId) {
    const error = new Error("Conteudo invalido para alerta de continuidade.");
    error.statusCode = 400;
    throw error;
  }

  return createNotification(userId, {
    type: "continue_watching",
    title: "Continua a ver",
    message: `Tens "${contentTitle}" por terminar.`,
    dedupeKey: `continue:${contentId}`,
  });
}

/**
 * Lista as notificacoes recentes do utilizador autenticado.
 *
 * @param {string} userId Identificador do utilizador.
 * @returns {Promise<{ notifications: object[] }>} Lista ordenada da mais recente para a mais antiga.
 */
export async function listMyNotifications(userId) {
  const db = await getDb();
  const notifications = await db.collection("notifications").find({ userId: asUserObjectId(userId) }).sort({ createdAt: -1 }).limit(50).toArray();
  return { notifications: notifications.map(publicNotification) };
}

/**
 * Marca uma notificacao como lida, aplicando ownership no filtro.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {string} notificationId Identificador da notificacao.
 * @returns {Promise<{ notification: object }>} Notificacao atualizada.
 */
export async function markNotificationAsRead(userId, notificationId) {
  const db = await getDb();
  // O filtro por `userId` impede marcar notificacoes pertencentes a outro utilizador.
  const notification = await db.collection("notifications").findOneAndUpdate(
    { _id: asNotificationObjectId(notificationId), userId: asUserObjectId(userId) },
    { $set: { readAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!notification) {
    const error = new Error("Notificacao nao encontrada.");
    error.statusCode = 404;
    throw error;
  }
  return { notification: publicNotification(notification) };
}
```

5. Explicacao do codigo ou da decisao.

O service aplica ownership em todos os acessos. Notificacoes nao incluem dados sensiveis: apenas titulo, mensagem e tipo. `dedupeKey` evita repetir alertas de continuidade para o mesmo conteudo.

`findOneAndUpdate` devolve o documento atualizado ou `null` na versao atual do driver MongoDB usada pelo projeto. Por isso, `markNotificationAsRead` valida diretamente `notification` e nao acede a `.value`.

6. Validacao do passo.

```bash
node -e "import('./src/modules/notifications/notifications.service.js').then((m) => console.log(typeof m.createNotification, typeof m.createContinueWatchingNotification, typeof m.updatePreferences))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem filtro por `userId`, um utilizador podia marcar notificacoes de outro como lidas. Sem validacao de `notificationId`, um ID invalido podia rebentar como erro tecnico em vez de devolver `400`.

### Passo 3 - Criar endpoints

1. Objetivo do passo.

Expor preferencias e notificacoes do utilizador autenticado.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/notifications/notifications.controller.js`
    - CRIAR: `backend/src/modules/notifications/notifications.routes.js`
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Monta router em `/api/notifications`.

4. Codigo completo.

`backend/src/modules/notifications/notifications.controller.js`

```js
import {
  getPreferences,
  listMyNotifications,
  markNotificationAsRead,
  updatePreferences,
} from "./notifications.service.js";

/**
 * Lista notificacoes do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMyNotifications(req, res) {
  res.status(200).json(await listMyNotifications(req.user.id));
}

/**
 * Marca uma notificacao do proprio utilizador como lida.
 *
 * @param {import("express").Request} req Pedido com `params.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function patchReadNotification(req, res) {
  res.status(200).json(await markNotificationAsRead(req.user.id, req.params.id));
}

/**
 * Devolve preferencias atuais do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMyPreferences(req, res) {
  res.status(200).json(await getPreferences(req.user.id));
}

/**
 * Atualiza preferencias atuais do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido com corpo de preferencias.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function putMyPreferences(req, res) {
  res.status(200).json(await updatePreferences(req.user.id, req.body));
}
```

`backend/src/modules/notifications/notifications.routes.js`

```js
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getMyNotifications,
  getMyPreferences,
  patchReadNotification,
  putMyPreferences,
} from "./notifications.controller.js";

/**
 * Router de notificacoes internas.
 * Todas as rotas usam `requireAuth` porque preferencias e mensagens pertencem a um utilizador.
 */
export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, asyncHandler(getMyNotifications));
notificationsRouter.patch("/:id/read", requireAuth, asyncHandler(patchReadNotification));
notificationsRouter.get("/preferences/me", requireAuth, asyncHandler(getMyPreferences));
notificationsRouter.put("/preferences/me", requireAuth, asyncHandler(putMyPreferences));
```

Trecho esperado em `backend/src/app.js`:

```js
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";

app.use("/api/notifications", notificationsRouter);
```

Trecho esperado em `backend/src/server.js`:

```js
import { ensureNotificationIndexes } from "./modules/notifications/notifications.service.js";

await ensureNotificationIndexes();
```

5. Explicacao do codigo ou da decisao.

Todas as rotas exigem login porque notificacoes e preferencias pertencem ao utilizador.

6. Validacao do passo.

```bash
curl -i http://localhost:3000/api/notifications
```

Sem cookie deve devolver `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Rota publica de notificacoes exporia mensagens privadas.

### Passo 4 - Criar frontend de notificacoes e preferencias

1. Objetivo do passo.

Mostrar notificacoes e permitir editar preferencias.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/notificationsApi.js`
    - CRIAR: `frontend/src/pages/NotificationsPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`

3. Instrucoes concretas.

Cria rota `/notifications`.

4. Codigo completo.

`frontend/src/services/api/notificationsApi.js`

```js
import { apiClient } from "./apiClient.js";

export const notificationsApi = {
  /**
   * Lista notificacoes do utilizador autenticado.
   *
   * @returns {Promise<{ notifications: object[] }>} Notificacoes recentes.
   */
  list() {
    return apiClient.get("/api/notifications");
  },
  /**
   * Marca uma notificacao como lida.
   *
   * @param {string} id Identificador da notificacao.
   * @returns {Promise<object>} Notificacao atualizada.
   */
  markAsRead(id) {
    return apiClient.patch(`/api/notifications/${encodeURIComponent(id)}/read`);
  },
  /**
   * Obtem preferencias de notificacao.
   *
   * @returns {Promise<{ preferences: object }>} Preferencias atuais.
   */
  getPreferences() {
    return apiClient.get("/api/notifications/preferences/me");
  },
  /**
   * Atualiza preferencias de notificacao no backend.
   *
   * @param {object} input Preferencias escolhidas pelo utilizador.
   * @returns {Promise<{ preferences: object }>} Preferencias guardadas.
   */
  updatePreferences(input) {
    return apiClient.put("/api/notifications/preferences/me", input);
  },
};
```

`frontend/src/pages/NotificationsPage.jsx`

```jsx
import { useEffect, useState } from "react";
import { notificationsApi } from "../services/api/notificationsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Pagina de notificacoes e preferencias do utilizador autenticado.
 *
 * @returns {JSX.Element} Interface de leitura e configuracao de notificacoes.
 */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({ inApp: true, email: false, continueWatching: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Carrega notificacoes e preferencias em paralelo.
   *
   * @returns {Promise<void>}
   */
  async function load() {
    setLoading(true);
    setError("");
    try {
      const [notificationsResponse, preferencesResponse] = await Promise.all([
        notificationsApi.list(),
        notificationsApi.getPreferences(),
      ]);
      setNotifications(notificationsResponse.notifications);
      setPreferences(preferencesResponse.preferences);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /**
   * Atualiza uma preferencia e guarda a alteracao no backend.
   *
   * @param {"inApp" | "continueWatching"} field Preferencia alterada.
   * @param {boolean} value Novo valor.
   * @returns {Promise<void>}
   */
  async function updatePreference(field, value) {
    const next = { ...preferences, [field]: value };
    setPreferences(next);
    try {
      await notificationsApi.updatePreferences(next);
    } catch (apiError) {
      setError(toUserMessage(apiError));
    }
  }

  /**
   * Marca uma notificacao como lida e recarrega a lista.
   *
   * @param {string} id Identificador da notificacao.
   * @returns {Promise<void>}
   */
  async function markAsRead(id) {
    setError("");
    try {
      await notificationsApi.markAsRead(id);
      await load();
    } catch (apiError) {
      setError(toUserMessage(apiError));
    }
  }

  return (
    <main>
      <h1>Notificacoes</h1>
      {error && <p role="alert">{error}</p>}
      <section>
        <h2>Preferencias</h2>
        <label><input type="checkbox" checked={preferences.inApp} onChange={(e) => updatePreference("inApp", e.target.checked)} /> Notificacoes internas</label>
        <label><input type="checkbox" checked={preferences.continueWatching} onChange={(e) => updatePreference("continueWatching", e.target.checked)} /> Alertas de continuidade</label>
      </section>
      <section>
        <h2>Recentes</h2>
        {loading && <p>A carregar notificacoes...</p>}
        {!loading && notifications.length === 0 && !error && <p>Sem notificacoes.</p>}
        {notifications.map((notification) => (
          <article key={notification.id}>
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            {!notification.readAt && <button type="button" onClick={() => markAsRead(notification.id)}>Marcar como lida</button>}
          </article>
        ))}
      </section>
    </main>
  );
}
```

5. Explicacao do codigo ou da decisao.

A pagina mostra estado vazio, erro e preferencias. Nao usa `localStorage`; tudo fica no backend por utilizador.

6. Validacao do passo.

Entrar, abrir `/notifications`, alterar preferencias e marcar uma notificacao como lida.

7. Caso negativo, erro comum ou risco que este passo evita.

Guardar preferencias no browser perderia sincronizacao entre dispositivos e nao serviria para o backend decidir se cria notificacao.

### Passo 5 - Integrar eventos de subscricao e trial

1. Objetivo do passo.

Mostrar onde os BKs anteriores devem chamar o service de notificacoes.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/payments/payments.service.js`
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - EDITAR: `backend/src/modules/playback/playback.service.js`

3. Instrucoes concretas.

Edita as funcoes completas indicadas abaixo. O checkout aprovado nao cria uma segunda notificacao dentro de `payments.service.js`, porque chama `activateSubscription` e essa funcao passa a ser o ponto unico que notifica subscricao ativa. O checkout falhado cria `payment_failed` no proprio modulo de pagamentos. O trial cria `trial_started` depois de gravar o trial.

4. Codigo completo.

No topo de `backend/src/modules/payments/payments.service.js`, acrescenta o import de notificacoes mantendo os imports anteriores:

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { createNotification } from "../notifications/notifications.service.js";
import {
  activateSubscription,
  grantTrialSubscription,
} from "../subscriptions/subscriptions.service.js";
import { assertCheckoutPayload } from "./payments.validation.js";
```

Ainda em `backend/src/modules/payments/payments.service.js`, substitui a funcao `createSimulatedCheckout` completa por esta versao:

```js
/**
 * Regista checkout simulado e cria notificacao quando o pagamento e recusado.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {object} input Dados do checkout simulado.
 * @returns {Promise<object>} Resultado da tentativa.
 */
export async function createSimulatedCheckout(userId, input) {
  const db = await getDb();
  const payload = assertCheckoutPayload(input);
  const now = new Date();
  // O plano e validado antes de gravar a tentativa para evitar registos incoerentes.
  const plan = await db.collection("subscription_plans").findOne({
    code: payload.planCode,
    active: true,
  });

  if (!plan) {
    const error = new Error("Plano nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const attempt = {
    userId: userObjectId(userId),
    planCode: payload.planCode,
    paymentMethod: payload.paymentMethod,
    provider: "faithflix-simulated",
    status: payload.simulateOutcome === "approved" ? "approved" : "failed",
    failureReason: payload.simulateOutcome === "failed" ? "Pagamento simulado recusado." : null,
    createdAt: now,
  };

  const result = await db.collection("payment_attempts").insertOne(attempt);
  if (attempt.status === "failed") {
    // Pagamento recusado pertence ao modulo de pagamentos, por isso a notificacao nasce aqui.
    await createNotification(userId, {
      type: "payment_failed",
      title: "Pagamento recusado",
      message: "O pagamento simulado foi recusado. Podes tentar novamente com outro metodo de teste.",
    });

    return { paymentAttemptId: String(result.insertedId), status: "failed", message: attempt.failureReason };
  }

  const subscription = await activateSubscription(userId, payload.planCode);
  return { paymentAttemptId: String(result.insertedId), status: "approved", ...subscription };
}
```

No mesmo ficheiro, substitui a funcao `startTrial` completa por esta versao:

```js
/**
 * Inicia trial unico e notifica o utilizador quando o acesso gratuito fica ativo.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {Promise<object>} Trial e subscricao temporaria.
 */
export async function startTrial(userId) {
  const db = await getDb();
  const now = new Date();
  const userIdObject = userObjectId(userId);

  const activePaidSubscription = await db.collection("subscriptions").findOne({
    userId: userIdObject,
    status: "active",
    currentPeriodEnd: { $gt: now },
  });

  if (activePaidSubscription) {
    const error = new Error("Utilizador ja tem uma subscricao ativa.");
    error.statusCode = 409;
    throw error;
  }

  const trial = {
    userId: userIdObject,
    status: "active",
    startedAt: now,
    endsAt: addDays(now, 14),
    createdAt: now,
  };

  try {
    // O indice unico continua a garantir que o trial so e criado uma vez por utilizador.
    await db.collection("trials").insertOne(trial);
  } catch (error) {
    if (error.code === 11000) {
      const alreadyUsed = new Error("Trial ja utilizado por este utilizador.");
      alreadyUsed.statusCode = 409;
      throw alreadyUsed;
    }
    throw error;
  }

  const subscription = await grantTrialSubscription(userId, trial.endsAt);

  await createNotification(userId, {
    type: "trial_started",
    title: "Trial iniciado",
    message: "O teu trial FaithFlix ficou ativo durante 14 dias.",
  });

  return {
    trial: { status: trial.status, startedAt: trial.startedAt, endsAt: trial.endsAt },
    ...subscription,
  };
}
```

No topo de `backend/src/modules/subscriptions/subscriptions.service.js`, acrescenta o import de notificacoes mantendo os imports existentes:

```js
import { ObjectId } from "mongodb";
import { getDb } from "../../config/database.js";
import { createNotification } from "../notifications/notifications.service.js";
import {
  addBillingCycle,
  assertPlanInterval,
  isBlockingStatus,
} from "./subscriptions.validation.js";
```

Ainda em `backend/src/modules/subscriptions/subscriptions.service.js`, substitui apenas a funcao `activateSubscription` completa por esta versao, preservando a funcao `grantTrialSubscription` adicionada no `BK-MF4-02`:

```js
/**
 * Ativa uma subscricao paga e cria a notificacao transacional correspondente.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {string} planCode Codigo do plano ativo.
 * @returns {Promise<{ subscription: object }>} Subscricao publica atualizada.
 */
export async function activateSubscription(userId, planCode) {
  const db = await getDb();
  const plan = await db.collection("subscription_plans").findOne({ code: String(planCode), active: true });
  if (!plan) {
    const error = new Error("Plano nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  const interval = assertPlanInterval(plan.interval);
  const subscription = {
    userId: userObjectId(userId),
    planCode: plan.code,
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: addBillingCycle(now, interval),
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("subscriptions").updateOne(
    { userId: subscription.userId },
    { $set: subscription },
    { upsert: true },
  );

  // A notificacao de subscricao ativa fica centralizada para evitar duplicacao no checkout aprovado.
  await createNotification(userId, {
    type: "subscription_activated",
    title: "Subscricao ativa",
    message: "A tua subscricao FaithFlix ficou ativa.",
  });

  return { subscription: publicSubscription(subscription, plan) };
}
```

No topo de `backend/src/modules/playback/playback.service.js`, acrescenta o import de notificacoes mantendo os imports existentes:

```js
import { createContinueWatchingNotification } from "../notifications/notifications.service.js";
```

Ainda em `backend/src/modules/playback/playback.service.js`, substitui a funcao `savePlaybackProgress` completa por esta versao:

```js
/**
 * Guarda progresso de visualizacao e cria alerta de continuidade quando faz sentido.
 *
 * @param {string} contentId Identificador do conteudo.
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {object} input Progresso recebido da UI.
 * @returns {Promise<object>} Progresso publico atualizado.
 */
export async function savePlaybackProgress(contentId, userId, input) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteudo");
  const userObjectId = asObjectId(userId, "Utilizador");
  const content = await db.collection("contents").findOne({ _id: contentObjectId, status: "published" });

  if (!content) {
    const error = new Error("Conteudo nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const progress = assertProgressPayload(input, content.durationSeconds);
  const now = new Date();

  await db.collection("playback_progress").updateOne(
    { userId: userObjectId, contentId: contentObjectId },
    {
      $set: { ...progress, lastWatchedAt: now, updatedAt: now },
      $setOnInsert: { userId: userObjectId, contentId: contentObjectId, createdAt: now },
    },
    { upsert: true },
  );

  if (!progress.completed && progress.currentTimeSeconds >= 60) {
    // O alerta so nasce depois de haver progresso real e fica deduplicado por conteudo.
    await createContinueWatchingNotification(userId, {
      contentId,
      contentTitle: content.title,
    });
  }

  return publicProgress({ ...progress, lastWatchedAt: now }, content.durationSeconds);
}
```

5. Explicacao do codigo ou da decisao.

A notificacao nasce no backend, perto da regra de negocio. Assim, se no futuro existir app mobile, a regra continua central. `activateSubscription` fica como ponto unico para a notificacao `subscription_activated`, por isso um checkout aprovado nao duplica notificacoes. O checkout falhado e o trial usam eventos proprios porque pertencem ao modulo de pagamentos. O alerta `continue_watching` nasce em `savePlaybackProgress`, que e o ponto onde a app sabe que o utilizador deixou conteudo por terminar; `dedupeKey` evita criar o mesmo alerta repetidamente.

A validacao do plano no checkout preserva a regra do `BK-MF4-02`: um `planCode` invalido falha antes de gravar a tentativa, evitando uma tentativa aprovada sem subscricao associada.

6. Validacao do passo.

Executar checkout simulado aprovado e confirmar uma notificacao `subscription_activated` em `/api/notifications`. Depois executar checkout simulado falhado e confirmar `payment_failed`. Por fim, iniciar trial e confirmar `trial_started` e `subscription.status: "trialing"`. Guardar progresso com `currentTimeSeconds >= 60` e `completed: false` deve criar uma notificacao `continue_watching`.

7. Caso negativo, erro comum ou risco que este passo evita.

Criar notificacao apenas no frontend faria desaparecer o evento se o utilizador fechasse a pagina. Criar notificacao em `payments.service.js` e tambem em `activateSubscription` para o mesmo checkout aprovado duplicaria a mensagem.

## Criterios de aceite (mensuraveis)

- `GET /api/notifications` exige login e devolve apenas notificacoes do utilizador.
- `PUT /api/notifications/preferences/me` guarda preferencias por utilizador.
- Checkout/trial cria notificacao interna quando `inApp` esta ativo.
- Trial devolve tambem `subscription.status: "trialing"` e reutiliza o acesso premium do `BK-MF4-01`.
- `PUT /api/playback/:contentId/progress` com progresso incompleto acima de 60 segundos cria uma notificacao `continue_watching`.
- Preferencia `continueWatching: false` bloqueia notificacoes desse tipo.
- Repetir progresso no mesmo conteudo nao duplica alerta `continue_watching`.
- Marcar notificacao de outro utilizador devolve `404` ou `403`; ID invalido devolve `400`.

## Validacao final

```bash
cd backend
npm test
```

Testar listagem, preferencias, criacao por evento, trial com subscricao `trialing`, progresso a gerar `continue_watching`, deduplicacao e ownership.

## Evidence para PR/defesa

- `pr`: commit/PR com modulo `notifications`.
- `proof`: captura da pagina de notificacoes, JSON de preferencias e eventos `subscription_activated`, `trial_started` e `continue_watching`.
- `neg`: sem login, notificacao de outro utilizador, ID invalido, preferencias a bloquear alerta e tentativa repetida sem duplicar `continue_watching`.

## Handoff

O `BK-MF4-03` continua a pool de associacoes. Se a equipa quiser notificar admins sobre nova candidatura, deve chamar `createNotification` apenas para utilizadores admin existentes, sem criar canal externo. Manter `grantTrialSubscription` do `BK-MF4-02` quando este BK for implementado para nao perder o acesso premium do trial.

## Snippet tecnico aplicavel

```js
// O alerta de continuidade nasce no progresso e e deduplicado por conteudo.
await createContinueWatchingNotification(userId, {
  contentId,
  contentTitle: content.title,
});
```

## Changelog

- `2026-06-13`: guia reescrito com notificacoes internas, preferencias, ownership, frontend e integracao com eventos.
