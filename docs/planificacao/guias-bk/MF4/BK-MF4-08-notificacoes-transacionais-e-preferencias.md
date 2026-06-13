# BK-MF4-08 - Notificações transacionais e preferências

## Header

- `doc_id`: `GUIA-BK-MF4-08`
- `bk_id`: `BK-MF4-08`
- `macro`: `MF4`
- `owner`: `Mateus`
- `apoio`: `Davi`
- `prioridade`: `P1`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `BK-MF4-02,BK-MF2-05`
- `rf_rnf`: `RF52, RF53, RF54`
- `fase_documental`: `Fase 2`
- `sprint`: `S07`
- `core_or_reforco`: `Core`
- `proximo_bk`: `BK-MF4-03`
- `guia_path`: `docs/planificacao/guias-bk/MF4/BK-MF4-08-notificacoes-transacionais-e-preferencias.md`
- `last_updated`: `2026-06-13`

## Bloco pedagógico (obrigatório)

Neste BK vais criar notificações internas para eventos de subscrição, trial e continuidade, com preferências por utilizador. O MVP guarda notificações na base de dados e mostra-as no frontend; envio real de email fica fora deste BK.

### Objetivo pedagógico

- Criar notificações transacionais auditáveis.
- Permitir que o utilizador configure preferências.
- Evitar criação de notificações sensíveis para canais desligados.
- Preparar operação futura sem depender de fornecedor externo.

### Importância funcional

- Notificações ajudam o utilizador a perceber eventos importantes sem consultar manualmente todas as páginas.
- Preferências reduzem ruído e respeitam escolhas individuais.
- Este BK integra eventos de subscrição, trial e continuidade sem criar fornecedor externo de email.

### Scope-in

- Criar notificações internas `in_app`.
- Criar preferências por utilizador.
- Marcar notificações como lidas com ownership.
- Criar alerta de continuidade a partir do progresso de reprodução.
- Integrar eventos de subscrição e trial com o módulo de notificações.

### Scope-out

- Não enviar email real, SMS, push notifications ou mensagens externas.
- Não guardar tokens, dados de pagamento ou cookies em notificações.
- Não notificar administradores sobre candidaturas, salvo evolução futura com contrato próprio.
- Não alterar a lógica de recomendação.

### Tempo estimado

- 2 blocos de 90 minutos.
- Se a equipa quiser email real, registar como evolução posterior e manter este BK interno.

### Glossário rápido

- Notificação transacional: mensagem causada por evento concreto do sistema.
- Preferência: escolha do utilizador sobre que tipos de alerta quer receber.
- Deduplicação: regra que evita criar alertas repetidos para o mesmo evento.
- Ownership: garantia de que uma notificação só é lida pelo respetivo utilizador.

### Conceitos teóricos essenciais

- Domínio FaithFlix: notificações explicam eventos de subscrição, trial e continuidade sem expor dados sensíveis.
- Backend: o service verifica preferências, aplica deduplicação e grava a notificação.
- Frontend: a página lista notificações, mostra estados e permite alterar preferências.
- Segurança: todas as operações usam `req.user.id`; marcar notificação de outro utilizador devolve erro.
- Dados: `notifications` guarda mensagens; `notification_preferences` guarda escolhas por utilizador.
- `CANONICO`: RF52 exige notificações transacionais; RF53 preferências; RF54 alertas de continuidade.
- `DERIVADO`: `email` pode ficar como preferência futura, mas não há envio externo neste BK.

### Erros comuns

- Prometer email real sem fornecedor configurado.
- Guardar tokens ou dados de pagamento dentro da notificação.
- Ignorar preferências do utilizador.
- Criar notificações sem ownership.

### Check de compreensão

- [ ] Sei explicar o que torna uma notificação transacional.
- [ ] Sei provar que cada notificação pertence a um utilizador.
- [ ] Sei alterar preferências e ver o efeito em novas notificações.

## Bloco operacional (obrigatório)

### Pré-condições

- `BK-MF4-01` executado com subscrições.
- `BK-MF4-02` executado com checkout simulado, trial e `grantTrialSubscription`.
- `BK-MF2-05` executado com `savePlaybackProgress`.
- `BK-MF2-01` executado com `req.user`.
- `apiClient` disponível.

### Arquitetura do BK

- Backend: módulo `notifications` com validação, service, controller e router.
- Persistência: `notifications` e `notification_preferences` guardam mensagens e escolhas.
- Frontend: `notificationsApi` e `NotificationsPage` mostram lista, leitura e preferências.
- Segurança: endpoints exigem login e aplicam ownership no filtro de base de dados.
- Integração: services de pagamentos, subscrições e playback chamam `createNotification` ou `createContinueWatchingNotification`.

### Ficheiros a criar, editar e rever

- CRIAR: `backend/src/modules/notifications/notifications.validation.js`
- CRIAR: `backend/src/modules/notifications/notifications.service.js`
- CRIAR: `backend/src/modules/notifications/notifications.controller.js`
- CRIAR: `backend/src/modules/notifications/notifications.routes.js`
- CRIAR: `frontend/src/services/api/notificationsApi.js`
- CRIAR: `frontend/src/pages/NotificationsPage.jsx`
- EDITAR: `backend/src/app.js`
- EDITAR: `backend/src/server.js`
- EDITAR: `backend/src/modules/payments/payments.service.js`
- EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
- EDITAR: `backend/src/modules/playback/playback.service.js`
- EDITAR: `frontend/src/routes/AppRoutes.jsx`
- REVER: `BK-MF4-01`, `BK-MF4-02`, `BK-MF2-05`, `RF52`, `RF53`, `RF54`, `RNF19`

### Guia de execução (passo-a-passo)

### Passo 1 - Criar validação de preferências e tipos

1. Objetivo do passo.

Definir tipos de notificação e canais aceites.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/notifications/notifications.validation.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o módulo `notifications`.

4. Código completo.

```js
/**
 * Tipos de notificação gerados pelo backend.
 * A lista fechada evita grafias diferentes para o mesmo evento de negócio.
 */
export const NOTIFICATION_TYPES = [
  "subscription_activated",
  "payment_failed",
  "trial_started",
  "continue_watching",
];

/**
 * Cria um erro HTTP previsivel para validação de notificações.
 *
 * @param {string} message Mensagem segura para o cliente.
 * @param {number} [statusCode=400] Código HTTP de validação.
 * @returns {Error} Erro com `statusCode`.
 */
function httpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Garante que o tipo recebido pertence ao contrato público do módulo.
 *
 * @param {string} type Tipo recebido no evento.
 * @returns {string} Tipo normalizado.
 * @throws {Error} Quando o tipo não existe na lista fechada.
 */
export function assertNotificationType(type) {
  const value = String(type ?? "").trim();
  if (!NOTIFICATION_TYPES.includes(value)) {
    throw httpError("Tipo de notificação inválido.");
  }
  return value;
}

/**
 * Valida texto obrigatório usado em titulo e mensagem.
 *
 * @param {string} value Valor recebido.
 * @param {string} field Nome do campo para mensagem de erro.
 * @param {number} min Tamanho mínimo.
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
 * Valida o conteúdo visível de uma notificação.
 *
 * @param {object} input Dados recebidos pelo service.
 * @returns {{ title: string, message: string }} Conteúdo seguro para persistir.
 */
export function assertNotificationContent(input) {
  return {
    title: requiredNotificationText(input.title, "Titulo", 3, 120),
    message: requiredNotificationText(input.message, "Mensagem", 3, 240),
  };
}

/**
 * Normaliza preferências de notificação guardadas por utilizador.
 *
 * @param {object} input Preferências recebidas da UI.
 * @returns {{ inApp: boolean, email: boolean, continueWatching: boolean }} Preferências persistiveis.
 */
export function assertPreferencePayload(input) {
  return {
    inApp: Boolean(input.inApp ?? true),
    email: Boolean(input.email ?? false),
    continueWatching: Boolean(input.continueWatching ?? true),
  };
}
```

5. Explicação do código ou da decisão.

Tipos fechados evitam nomes diferentes para o mesmo evento. A validação de titulo e mensagem impede notificações vazias, demasiado longas ou pouco claras. `email` fica como preferência guardada, mas sem envio real.

6. Validação do passo.

```bash
node -e "import('./src/modules/notifications/notifications.validation.js').then(({ assertNotificationType }) => console.log(assertNotificationType('trial_started')))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem tipos fechados, um evento podia ficar como `trial`, outro como `trialStart` e outro como `trial_started`.

### Passo 2 - Criar service de notificações

1. Objetivo do passo.

Guardar preferências, criar notificações e listar notificações do utilizador autenticado.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/notifications/notifications.service.js`
    - LOCALIZACAO: ficheiro completo

3. Instrucoes concretas.

Cria o service abaixo.

4. Código completo.

```js
/**
 * Módulo de serviço para notificações internas e preferências do utilizador.
 *
 * Centraliza ownership, deduplicação e validação de tipos para garantir que cada
 * utilizador só lê e altera notificações pertencentes à sua própria sessão.
 */
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
 * @param {string} userId Identificador vindo da sessão.
 * @returns {ObjectId} Identificador MongoDB.
 * @throws {Error} Quando o identificador e inválido.
 */
function asUserObjectId(userId) {
  if (!ObjectId.isValid(userId)) {
    const error = new Error("Utilizador inválido.");
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(userId);
}

/**
 * Converte o identificador da notificação para `ObjectId`.
 *
 * @param {string} notificationId Identificador recebido na rota.
 * @returns {ObjectId} Identificador MongoDB.
 * @throws {Error} Quando o identificador e inválido.
 */
function asNotificationObjectId(notificationId) {
  if (!ObjectId.isValid(notificationId)) {
    const error = new Error("Notificação inválida.");
    error.statusCode = 400;
    throw error;
  }
  return new ObjectId(notificationId);
}

/**
 * Remove campos internos antes de devolver uma notificação ao frontend.
 *
 * @param {object} notification Documento MongoDB.
 * @returns {object} Notificação pública.
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
 * Cria indices para preferências, listagem e deduplicacao de eventos.
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
 * Obtem preferências do utilizador autenticado com valores por defeito.
 *
 * @param {string} userId Identificador do utilizador.
 * @returns {Promise<{ preferences: object }>} Preferências atuais.
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
 * Atualiza preferências de notificação do utilizador autenticado.
 *
 * @param {string} userId Identificador do utilizador.
 * @param {object} input Preferências recebidas da UI.
 * @returns {Promise<{ preferences: object }>} Preferências guardadas.
 */
export async function updatePreferences(userId, input) {
  const db = await getDb();
  const userObjectId = asUserObjectId(userId);
  const settings = assertPreferencePayload(input);
  // `upsert` cria preferências na primeira visita sem exigir passo de inicializacao.
  await db.collection("notification_preferences").updateOne(
    { userId: userObjectId },
    { $set: { settings, updatedAt: new Date() }, $setOnInsert: { userId: userObjectId, createdAt: new Date() } },
    { upsert: true },
  );
  return { preferences: settings };
}

/**
 * Cria uma notificação interna respeitando preferências e deduplicacao.
 *
 * @param {string} userId Identificador do utilizador destinatario.
 * @param {object} input Evento e conteúdo da notificação.
 * @returns {Promise<{ notification: object | null, skipped: boolean }>} Notificação criada ou motivo de omissao.
 */
export async function createNotification(userId, input) {
  const db = await getDb();
  const userObjectId = asUserObjectId(userId);
  const { preferences } = await getPreferences(userId);

  // Se o utilizador desligou notificações internas, o evento fica sem entrega in-app.
  if (!preferences.inApp) {
    return { notification: null, skipped: true };
  }

  const type = assertNotificationType(input.type);
  // A preferência granular só bloqueia alertas de continuidade, não eventos transacionais.
  if (type === "continue_watching" && !preferences.continueWatching) {
    return { notification: null, skipped: true };
  }

  const content = assertNotificationContent(input);
  const dedupeKey = input.dedupeKey ? String(input.dedupeKey).trim() : null;

  if (dedupeKey) {
    // A deduplicacao evita repetir alertas para o mesmo conteúdo ou evento.
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
 * Cria alerta para conteúdo iniciado e ainda não terminado.
 *
 * @param {string} userId Identificador do utilizador.
 * @param {object} input Dados minimos do conteúdo.
 * @returns {Promise<{ notification: object | null, skipped: boolean }>} Resultado da criacao.
 */
export async function createContinueWatchingNotification(userId, input) {
  const contentId = String(input.contentId ?? "").trim();
  const contentTitle = String(input.contentTitle ?? "um conteúdo").trim();

  if (!contentId) {
    const error = new Error("Conteúdo inválido para alerta de continuidade.");
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
 * Lista as notificações recentes do utilizador autenticado.
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
 * Marca uma notificação como lida, aplicando ownership no filtro.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {string} notificationId Identificador da notificação.
 * @returns {Promise<{ notification: object }>} Notificação atualizada.
 */
export async function markNotificationAsRead(userId, notificationId) {
  const db = await getDb();
  // O filtro por `userId` impede marcar notificações pertencentes a outro utilizador.
  const notification = await db.collection("notifications").findOneAndUpdate(
    { _id: asNotificationObjectId(notificationId), userId: asUserObjectId(userId) },
    { $set: { readAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!notification) {
    const error = new Error("Notificação não encontrada.");
    error.statusCode = 404;
    throw error;
  }
  return { notification: publicNotification(notification) };
}
```

5. Explicação do código ou da decisão.

O service aplica ownership em todos os acessos. Notificações não incluem dados sensíveis: apenas titulo, mensagem e tipo. `dedupeKey` evita repetir alertas de continuidade para o mesmo conteúdo.

`findOneAndUpdate` devolve o documento atualizado ou `null` na versão atual do driver MongoDB usada pelo projeto. Por isso, `markNotificationAsRead` valida diretamente `notification` e não acede a `.value`.

6. Validação do passo.

```bash
node -e "import('./src/modules/notifications/notifications.service.js').then((m) => console.log(typeof m.createNotification, typeof m.createContinueWatchingNotification, typeof m.updatePreferences))"
```

7. Caso negativo, erro comum ou risco que este passo evita.

Sem filtro por `userId`, um utilizador podia marcar notificações de outro como lidas. Sem validação de `notificationId`, um ID inválido podia rebentar como erro técnico em vez de devolver `400`.

### Passo 3 - Criar endpoints

1. Objetivo do passo.

Expor preferências e notificações do utilizador autenticado.

2. Ficheiros envolvidos.
    - CRIAR: `backend/src/modules/notifications/notifications.controller.js`
    - CRIAR: `backend/src/modules/notifications/notifications.routes.js`
    - EDITAR: `backend/src/app.js`
    - EDITAR: `backend/src/server.js`

3. Instrucoes concretas.

Monta router em `/api/notifications`.

4. Código completo.

`backend/src/modules/notifications/notifications.controller.js`

```js
/**
 * Módulo de controllers HTTP para notificações internas.
 *
 * Recebe pedidos autenticados e delega no service a validação de ownership,
 * leitura, marcação como lida e atualização de preferências.
 */
import {
  getPreferences,
  listMyNotifications,
  markNotificationAsRead,
  updatePreferences,
} from "./notifications.service.js";

/**
 * Lista notificações do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMyNotifications(req, res) {
  res.status(200).json(await listMyNotifications(req.user.id));
}

/**
 * Marca uma notificação do proprio utilizador como lida.
 *
 * @param {import("express").Request} req Pedido com `params.id`.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function patchReadNotification(req, res) {
  res.status(200).json(await markNotificationAsRead(req.user.id, req.params.id));
}

/**
 * Devolve preferências atuais do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido autenticado.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function getMyPreferences(req, res) {
  res.status(200).json(await getPreferences(req.user.id));
}

/**
 * Atualiza preferências atuais do utilizador autenticado.
 *
 * @param {import("express").Request} req Pedido com corpo de preferências.
 * @param {import("express").Response} res Resposta HTTP.
 * @returns {Promise<void>}
 */
export async function putMyPreferences(req, res) {
  res.status(200).json(await updatePreferences(req.user.id, req.body));
}
```

`backend/src/modules/notifications/notifications.routes.js`

```js
/**
 * Módulo de rotas de notificações.
 *
 * Protege todos os endpoints com autenticação porque notificações e preferências
 * são dados privados associados ao utilizador da sessão.
 */
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
 * Router de notificações internas.
 * Todas as rotas usam `requireAuth` porque preferências e mensagens pertencem a um utilizador.
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

5. Explicação do código ou da decisão.

Todas as rotas exigem login porque notificações e preferências pertencem ao utilizador.

6. Validação do passo.

```bash
curl -i http://localhost:3000/api/notifications
```

Sem cookie deve devolver `401`.

7. Caso negativo, erro comum ou risco que este passo evita.

Rota pública de notificações exporia mensagens privadas.

### Passo 4 - Criar frontend de notificações e preferências

1. Objetivo do passo.

Mostrar notificações e permitir editar preferências.

2. Ficheiros envolvidos.
    - CRIAR: `frontend/src/services/api/notificationsApi.js`
    - CRIAR: `frontend/src/pages/NotificationsPage.jsx`
    - EDITAR: `frontend/src/routes/AppRoutes.jsx`

3. Instrucoes concretas.

Cria rota `/notifications`.

4. Código completo.

`frontend/src/services/api/notificationsApi.js`

```js
/**
 * Módulo cliente para a API de notificações.
 *
 * Agrupa chamadas HTTP de leitura, marcação como lida e preferências, usando o
 * `apiClient` para preservar cookies HttpOnly sem expor tokens no frontend.
 */
import { apiClient } from "./apiClient.js";

export const notificationsApi = {
  /**
   * Lista notificações do utilizador autenticado.
   *
   * @returns {Promise<{ notifications: object[] }>} Notificações recentes.
   */
  list() {
    return apiClient.get("/api/notifications");
  },
  /**
   * Marca uma notificação como lida.
   *
   * @param {string} id Identificador da notificação.
   * @returns {Promise<object>} Notificação atualizada.
   */
  markAsRead(id) {
    return apiClient.patch(`/api/notifications/${encodeURIComponent(id)}/read`);
  },
  /**
   * Obtem preferências de notificação.
   *
   * @returns {Promise<{ preferences: object }>} Preferências atuais.
   */
  getPreferences() {
    return apiClient.get("/api/notifications/preferences/me");
  },
  /**
   * Atualiza preferências de notificação no backend.
   *
   * @param {object} input Preferências escolhidas pelo utilizador.
   * @returns {Promise<{ preferences: object }>} Preferências guardadas.
   */
  updatePreferences(input) {
    return apiClient.put("/api/notifications/preferences/me", input);
  },
};
```

`frontend/src/pages/NotificationsPage.jsx`

```jsx
/**
 * Módulo da página de notificações e preferências.
 *
 * Carrega mensagens e preferências do utilizador autenticado, permitindo alterar
 * opções sem expor dados de outros utilizadores ou depender de estado local como fonte de verdade.
 */
import { useEffect, useState } from "react";
import { notificationsApi } from "../services/api/notificationsApi.js";
import { toUserMessage } from "../services/api/apiErrors.js";

/**
 * Página de notificações e preferências do utilizador autenticado.
 *
 * @returns {JSX.Element} Interface de leitura e configuracao de notificações.
 */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({ inApp: true, email: false, continueWatching: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Carrega notificações e preferências em paralelo.
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
   * Atualiza uma preferência e guarda a alteracao no backend.
   *
   * @param {"inApp" | "continueWatching"} field Preferência alterada.
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
   * Marca uma notificação como lida e recarrega a lista.
   *
   * @param {string} id Identificador da notificação.
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
      <h1>Notificações</h1>
      {error && <p role="alert">{error}</p>}
      <section>
        <h2>Preferências</h2>
        <label><input type="checkbox" checked={preferences.inApp} onChange={(e) => updatePreference("inApp", e.target.checked)} /> Notificações internas</label>
        <label><input type="checkbox" checked={preferences.continueWatching} onChange={(e) => updatePreference("continueWatching", e.target.checked)} /> Alertas de continuidade</label>
      </section>
      <section>
        <h2>Recentes</h2>
        {loading && <p>A carregar notificações...</p>}
        {!loading && notifications.length === 0 && !error && <p>Sem notificações.</p>}
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

5. Explicação do código ou da decisão.

A página mostra estado vazio, erro e preferências. Não usa `localStorage`; tudo fica no backend por utilizador.

6. Validação do passo.

Entrar, abrir `/notifications`, alterar preferências e marcar uma notificação como lida.

7. Caso negativo, erro comum ou risco que este passo evita.

Guardar preferências no browser perderia sincronizacao entre dispositivos e não serviria para o backend decidir se cria notificação.

### Passo 5 - Integrar eventos de subscrição e trial

1. Objetivo do passo.

Mostrar onde os BKs anteriores devem chamar o service de notificações.

2. Ficheiros envolvidos.
    - EDITAR: `backend/src/modules/payments/payments.service.js`
    - EDITAR: `backend/src/modules/subscriptions/subscriptions.service.js`
    - EDITAR: `backend/src/modules/playback/playback.service.js`

3. Instrucoes concretas.

Edita as funções completas indicadas abaixo. O checkout aprovado não cria uma segunda notificação dentro de `payments.service.js`, porque chama `activateSubscription` e essa função passa a ser o ponto único que notifica subscrição ativa. O checkout falhado cria `payment_failed` no proprio módulo de pagamentos. O trial cria `trial_started` depois de gravar o trial.

4. Código completo.

No topo de `backend/src/modules/payments/payments.service.js`, acrescenta o import de notificações mantendo os imports anteriores:

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

Ainda em `backend/src/modules/payments/payments.service.js`, substitui a função `createSimulatedCheckout` completa por esta versão:

```js
/**
 * Regista checkout simulado e cria notificação quando o pagamento e recusado.
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
    const error = new Error("Plano não encontrado.");
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
    // Pagamento recusado pertence ao módulo de pagamentos, por isso a notificação nasce aqui.
    await createNotification(userId, {
      type: "payment_failed",
      title: "Pagamento recusado",
      message: "O pagamento simulado foi recusado. Podes tentar novamente com outro método de teste.",
    });

    return { paymentAttemptId: String(result.insertedId), status: "failed", message: attempt.failureReason };
  }

  const subscription = await activateSubscription(userId, payload.planCode);
  return { paymentAttemptId: String(result.insertedId), status: "approved", ...subscription };
}
```

No mesmo ficheiro, substitui a função `startTrial` completa por esta versão:

```js
/**
 * Inicia trial único e notifica o utilizador quando o acesso gratuito fica ativo.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @returns {Promise<object>} Trial e subscrição temporária.
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
    const error = new Error("Utilizador já tem uma subscrição ativa.");
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
    // O indice único continua a garantir que o trial só e criado uma vez por utilizador.
    await db.collection("trials").insertOne(trial);
  } catch (error) {
    if (error.code === 11000) {
      const alreadyUsed = new Error("Trial já utilizado por este utilizador.");
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

No topo de `backend/src/modules/subscriptions/subscriptions.service.js`, acrescenta o import de notificações mantendo os imports existentes:

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

Ainda em `backend/src/modules/subscriptions/subscriptions.service.js`, substitui apenas a função `activateSubscription` completa por esta versão, preservando a função `grantTrialSubscription` adicionada no `BK-MF4-02`:

```js
/**
 * Ativa uma subscrição paga e cria a notificação transacional correspondente.
 *
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {string} planCode Código do plano ativo.
 * @returns {Promise<{ subscription: object }>} Subscrição pública atualizada.
 */
export async function activateSubscription(userId, planCode) {
  const db = await getDb();
  const plan = await db.collection("subscription_plans").findOne({ code: String(planCode), active: true });
  if (!plan) {
    const error = new Error("Plano não encontrado.");
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

  // A notificação de subscrição ativa fica centralizada para evitar duplicação no checkout aprovado.
  await createNotification(userId, {
    type: "subscription_activated",
    title: "Subscrição ativa",
    message: "A tua subscrição FaithFlix ficou ativa.",
  });

  return { subscription: publicSubscription(subscription, plan) };
}
```

No topo de `backend/src/modules/playback/playback.service.js`, acrescenta o import de notificações mantendo os imports existentes:

```js
import { createContinueWatchingNotification } from "../notifications/notifications.service.js";
```

Ainda em `backend/src/modules/playback/playback.service.js`, substitui a função `savePlaybackProgress` completa por esta versão:

```js
/**
 * Guarda progresso de visualizacao e cria alerta de continuidade quando faz sentido.
 *
 * @param {string} contentId Identificador do conteúdo.
 * @param {string} userId Identificador do utilizador autenticado.
 * @param {object} input Progresso recebido da UI.
 * @returns {Promise<object>} Progresso público atualizado.
 */
export async function savePlaybackProgress(contentId, userId, input) {
  const db = await getDb();
  const contentObjectId = asObjectId(contentId, "Conteúdo");
  const userObjectId = asObjectId(userId, "Utilizador");
  const content = await db.collection("contents").findOne({ _id: contentObjectId, status: "published" });

  if (!content) {
    const error = new Error("Conteúdo não encontrado.");
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
    // O alerta só nasce depois de haver progresso real e fica deduplicado por conteúdo.
    await createContinueWatchingNotification(userId, {
      contentId,
      contentTitle: content.title,
    });
  }

  return publicProgress({ ...progress, lastWatchedAt: now }, content.durationSeconds);
}
```

5. Explicação do código ou da decisão.

A notificação nasce no backend, perto da regra de negócio. Assim, se no futuro existir app mobile, a regra continua central. `activateSubscription` fica como ponto único para a notificação `subscription_activated`, por isso um checkout aprovado não duplica notificações. O checkout falhado e o trial usam eventos proprios porque pertencem ao módulo de pagamentos. O alerta `continue_watching` nasce em `savePlaybackProgress`, que e o ponto onde a app sabe que o utilizador deixou conteúdo por terminar; `dedupeKey` evita criar o mesmo alerta repetidamente.

A validação do plano no checkout preserva a regra do `BK-MF4-02`: um `planCode` inválido falha antes de gravar a tentativa, evitando uma tentativa aprovada sem subscrição associada.

6. Validação do passo.

Executar checkout simulado aprovado e confirmar uma notificação `subscription_activated` em `/api/notifications`. Depois executar checkout simulado falhado e confirmar `payment_failed`. Por fim, iniciar trial e confirmar `trial_started` e `subscription.status: "trialing"`. Guardar progresso com `currentTimeSeconds >= 60` e `completed: false` deve criar uma notificação `continue_watching`.

7. Caso negativo, erro comum ou risco que este passo evita.

Criar notificação apenas no frontend faria desaparecer o evento se o utilizador fechasse a página. Criar notificação em `payments.service.js` e também em `activateSubscription` para o mesmo checkout aprovado duplicaria a mensagem.

## Critérios de aceite (mensuráveis)

- `GET /api/notifications` exige login e devolve apenas notificações do utilizador.
- `PUT /api/notifications/preferences/me` guarda preferências por utilizador.
- Checkout/trial cria notificação interna quando `inApp` esta ativo.
- Trial devolve também `subscription.status: "trialing"` e reutiliza o acesso premium do `BK-MF4-01`.
- `PUT /api/playback/:contentId/progress` com progresso incompleto acima de 60 segundos cria uma notificação `continue_watching`.
- Preferência `continueWatching: false` bloqueia notificações desse tipo.
- Repetir progresso no mesmo conteúdo não duplica alerta `continue_watching`.
- Marcar notificação de outro utilizador devolve `404` ou `403`; ID inválido devolve `400`.

## Validação final

```bash
cd backend
npm test
```

Testar listagem, preferências, criacao por evento, trial com subscrição `trialing`, progresso a gerar `continue_watching`, deduplicacao e ownership.

## Evidence para PR/defesa

- `pr`: commit/PR com módulo `notifications`.
- `proof`: captura da página de notificações, JSON de preferências e eventos `subscription_activated`, `trial_started` e `continue_watching`.
- `neg`: sem login, notificação de outro utilizador, ID inválido, preferências a bloquear alerta e tentativa repetida sem duplicar `continue_watching`.

## Handoff

O `BK-MF4-03` continua a pool de associações. Se a equipa quiser notificar admins sobre nova candidatura, deve chamar `createNotification` apenas para utilizadores admin existentes, sem criar canal externo. Manter `grantTrialSubscription` do `BK-MF4-02` quando este BK for implementado para não perder o acesso premium do trial.

## Snippet técnico aplicável

```js
// O alerta de continuidade nasce no progresso e e deduplicado por conteúdo.
await createContinueWatchingNotification(userId, {
  contentId,
  contentTitle: content.title,
});
```

## Changelog

- `2026-06-13`: guia reescrito com notificações internas, preferências, ownership, frontend e integração com eventos.
